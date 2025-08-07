package ws

type WsMessageType string

const (
	UserJoined           WsMessageType = "user_joined"
	UserLeft             WsMessageType = "user_left"
	Error                WsMessageType = "error"
	BadPin               WsMessageType = "bad_pin"
	IncorrectPin         WsMessageType = "incorrect_pin"
	CurrentUsers         WsMessageType = "current_users"
	JobReturnedFromCache WsMessageType = "job_returned_from_cache"
	JobQueued            WsMessageType = "job_queued"
	JobStarted           WsMessageType = "job_started"
	JobRetry             WsMessageType = "job_retry"
	JobFailed            WsMessageType = "job_failed"
	JobSucceeded         WsMessageType = "job_succeeded"
	// ...Job status enum
)
