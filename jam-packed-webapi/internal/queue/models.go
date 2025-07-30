package queue

import "github.com/google/uuid"

type Job struct {
	RoomId   string
	JobId    uuid.UUID
	Username string
}
