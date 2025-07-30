package routes

type CheckAuraRequestDto struct {
	RoomId   string `json:"roomId" binding:"required"`
	Username string `json:"username" binding:"required" validate:"min=1"`
}

type CheckAuraResponseDto struct {
	JobId     *string `json:"jobId"`
	JobStatus string  `json:"jobStatus"`
}
