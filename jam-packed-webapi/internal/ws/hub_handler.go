package ws

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"

	"jam-packed-webapi/internal/auth"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

const (
	ActionSubscribe   = "subscribe"
	ActionUnsubscribe = "unsubscribe"
)

// TODO: example passcode on frontend to join the room?
func ServeWS(hub *Hub) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		tokenString := ctx.Query("token")
		fmt.Println("Received token:", tokenString)
		if tokenString == "" {
			ctx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Missing token"})
			return
		}

		_, claims, err := auth.ValidateJWT(tokenString)
		if err != nil {
			fmt.Println("JWT error:", err)
			ctx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			return
		}

		userId, okUserId := claims["userId"].(string)
		username, okUsername := claims["username"].(string)
		avatar, okAvatar := claims["avatar"].(string)

		if !okUserId || strings.TrimSpace(userId) == "" ||
			!okUsername || strings.TrimSpace(username) == "" ||
			!okAvatar || strings.TrimSpace(avatar) == "" {
			ctx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Missing or invalid user fields in token"})
			return
		}

		// Here, the user is authenticated and the websocket connection is established
		// This sends a connected(TODO: confirm?) event, the user is NOT subscribed to any rooms yet for notifications
		conn, err := upgrader.Upgrade(ctx.Writer, ctx.Request, nil)
		if err != nil {
			return
		}
		client := &Client{conn: conn, roomIds: make(map[string]bool), hub: hub, userId: userId, username: username}
		hub.register <- client
		defer func() {
			hub.unregister <- client
			conn.Close()
		}()
		for {
			var msg JoinRequestDto
			if err := conn.ReadJSON(&msg); err != nil {
				break
			}
			switch msg.Action {
			case ActionSubscribe:
				if err := hub.SubscribeWithPin(client, msg.RoomId, msg.Pin); err != nil {
					// Notify the specific user trying to connect (private message)
					client.conn.WriteJSON(Message{
						RoomId:  msg.RoomId,
						Type:    err.Error(),
						Details: "Failed to join room",
					})
					continue
				}
				// Broadcast join message to all users
				currentUsers := hub.GetRoomUserIDs(msg.RoomId)
				hub.Notify(Message{
					RoomId:  msg.RoomId,
					UserId:  client.userId,
					Type:    "user_joined",
					Details: fmt.Sprintf("'%s' has entered the room", client.username),
					Users:   currentUsers,
				})
			case ActionUnsubscribe:
				hub.Unsubscribe(client, msg.RoomId)
				// Broadcast leave message to all users
				hub.Notify(Message{
					RoomId:  msg.RoomId,
					UserId:  client.userId,
					Type:    "user_left",
					Details: fmt.Sprintf("'%s' has left the room", client.username),
				})
			}
		}
	}
}
