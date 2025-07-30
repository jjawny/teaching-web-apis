package ws

import "github.com/gorilla/websocket"

type Client struct {
	conn     *websocket.Conn
	hub      *Hub
	roomIds  map[string]bool
	userId   string
	username string
}

type Hub struct {
	clients           map[*Client]bool
	rooms             map[string]map[*Client]bool // hub[roomId] -> many clients
	roomPins          map[string]string           // hub[roomId] -> 1x pin
	register          chan *Client
	unregister        chan *Client
	broadcast         chan Message
	maxRooms          int
	maxClientsPerRoom int
}

type Message struct {
	RoomId  string `json:"roomId"`
	JobId   string `json:"jobId,omitempty"`
	Details string `json:"details,omitempty"`
	UserId  string `json:"userId,omitempty"`
	Event   string `json:"event"`
	Users   []User `json:"users,omitempty"`
}

type User struct {
	UserId   string `json:"userId"`
	Username string `json:"username,omitempty"`
	Avatar   string `json:"avatar,omitempty"`
}

type JoinRequestDto struct {
	Action   string `json:"action"`
	RoomId   string `json:"roomId"`
	RoomName string `json:"roomName"`
	Pin      string `json:"pin"`
}
