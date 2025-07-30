package ws

import (
	"fmt"
)

func NewHub() *Hub {
	hub := &Hub{
		clients:           make(map[*Client]bool),
		rooms:             make(map[string]map[*Client]bool),
		roomPins:          make(map[string]string),
		register:          make(chan *Client),
		unregister:        make(chan *Client),
		broadcast:         make(chan Message),
		maxRooms:          100,
		maxClientsPerRoom: 20,
	}
	// Separate thread
	go hub.run()
	return hub
}

// GPT why channel based concurrency >>> mutex here
// Channel-based concurrency is often better than mutexes in Go for this kind of use case because:

// Single Ownership: All state changes (register, unregister, broadcast) happen in one goroutine (the hub's run loop), so there's no risk of race conditions. You don't need to worry about locking/unlocking or deadlocks.
// Simplicity: The code is easier to reason about. You just send a message (client or event) to a channel, and the hub processes it in order.
// No Locking Overhead: There's no performance cost of acquiring/releasing locks, and no risk of forgetting to unlock or causing a deadlock.
// Natural Fit for Event Loops: For systems like chat servers, pub/sub, or websocket hubs, channel-based event loops are idiomatic and scale well.
// In summary: channels let you serialize access to shared state in a safe, clear, and Go-idiomatic way—especially for message-driven systems like your websocket hub.
func (hub *Hub) run() {
	for {
		select {
		case client := <-hub.register:
			hub.clients[client] = true
		case client := <-hub.unregister:
			delete(hub.clients, client)
			for roomId := range client.roomIds {
				if room, ok := hub.rooms[roomId]; ok {
					delete(room, client)
					if len(room) == 0 {
						delete(hub.rooms, roomId)
					}
				}
			}
		case event := <-hub.broadcast:
			if room, ok := hub.rooms[event.RoomId]; ok {
				for client := range room {
					if err := client.conn.WriteJSON(event); err != nil {
						client.hub.unregister <- client
						client.conn.Close()
					}
				}
			}
		}
	}
}

func (hub *Hub) SubscribeWithPin(client *Client, roomId, pin string) error {
	if _, exists := hub.rooms[roomId]; !exists {
		// Limit the number of rooms
		if len(hub.rooms) >= hub.maxRooms {
			return fmt.Errorf("Maximum number of rooms reached")
		}

		// Room does not exist, require valid 4-digit pin to create
		if len(pin) != 4 {
			return fmt.Errorf(EventPromptPin)
		}
		hub.rooms[roomId] = make(map[*Client]bool)
		hub.roomPins[roomId] = pin
	} else {
		// Room exists, check pin
		if hub.roomPins[roomId] != pin {
			return fmt.Errorf(EventIncorrectPin)
		}
	}

	// Limit number of clients per room
	if len(hub.rooms[roomId]) >= hub.maxClientsPerRoom {
		return fmt.Errorf("Room is full")
	}

	hub.rooms[roomId][client] = true
	client.roomIds[roomId] = true
	client.hub = hub
	return nil
}

func (hub *Hub) Unsubscribe(client *Client, roomId string) {
	if room, ok := hub.rooms[roomId]; ok {
		delete(room, client)
		if len(room) == 0 {
			delete(hub.rooms, roomId)
		}
	}
	delete(client.roomIds, roomId)
}

func (hub *Hub) Notify(event Message) {
	// channel-based concurrency ensures that we can safely broadcast events to all clients in the room
	hub.broadcast <- event
}

func (hub *Hub) GetRoomUserIDs(roomId string) []User {
	users := []User{}
	if room, ok := hub.rooms[roomId]; ok {
		for client := range room {
			users = append(users, User{
				UserId:   client.userId,
				Username: "", // Fill in if available
				Avatar:   "", // Fill in if available
			})
		}
	}
	return users
}
