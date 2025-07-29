package workers

type JobStatus string

const (
	JobStarted   JobStatus = "started"
	JobRetry     JobStatus = "retry"
	JobFailed    JobStatus = "failed"
	JobSucceeded JobStatus = "succeeded"
)
