package queue

import (
	"errors"
	"log/slog"
	"strconv"
	"time"

	"jam-packed-webapi/internal/ws"

	"github.com/avast/retry-go"
	"github.com/patrickmn/go-cache"
)

const UsernameForMockFailure = ":::fail:::"
const UsernameForMockRetries = ":::retry:::"
const RetryAttempts = 3

func StartWorker(jobQueue chan Job, resultsCache *cache.Cache, wsHub *ws.Hub) {
	// Dequeue
	for job := range jobQueue {
		roomID, jobId, username := job.RoomId, job.JobId.String(), job.Username
		time.Sleep(5000 * time.Millisecond) // sim some latency
		fakeAura := 100                     // fake aura value

		wsHub.Notify(ws.Message{RoomId: roomID, JobId: jobId, Type: string(ws.JobStarted), Details: "Started checking aura for " + username})

		var attempt int
		var auraResult int
		err := retry.Do(
			func() error {
				attempt++
				time.Sleep(500 * time.Millisecond)
				if username == UsernameForMockFailure {
					return errors.New("simulated processing error")
				}
				if username == UsernameForMockRetries {
					// Fail to retry, succeed on the final attempt
					if attempt < RetryAttempts {
						return errors.New("simulated retry error")
					}
				}
				auraResult = fakeAura // success, set result
				resultsCache.Set(username, auraResult, cache.DefaultExpiration)
				return nil
			},
			retry.Attempts(RetryAttempts),
			retry.DelayType(retry.BackOffDelay),
		)

		// If the room is empty/does not exist the message is dropped
		if err != nil {
			jobDetails := "Failed to check aura for " + username + ", reason: " + err.Error()
			wsHub.Notify(ws.Message{RoomId: roomID, JobId: job.JobId.String(), Type: string(ws.JobFailed), Details: jobDetails})
			slog.Error("[QUEUE WORKER] Failed to process job", "username", username, "jobId", job.JobId, "error", err)

		} else {
			jobDetails := username + " has " + strconv.Itoa(fakeAura) + " aura points"
			wsHub.Notify(ws.Message{RoomId: roomID, JobId: job.JobId.String(), Type: string(ws.JobSucceeded), Details: jobDetails})
			slog.Info("[QUEUE WORKER] Successfully processed job", "username", username, "jobId", job.JobId)
		}
	}
}
