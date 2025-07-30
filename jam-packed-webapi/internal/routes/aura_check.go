package routes

import (
	"context"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
	"github.com/patrickmn/go-cache"

	"jam-packed-webapi/internal/queue"
	"jam-packed-webapi/internal/ws"
)

func AuraCheckHandler(validate *validator.Validate, resultCache *cache.Cache, jobQueue chan queue.Job, wsHub *ws.Hub) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		// Unmarshal the HTTP request (parse JSON body into GO struct)
		var req CheckAuraRequestDto
		if err := ctx.ShouldBindJSON(&req); err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "Bad request, please check your payload"})
			return
		}

		// Validate the request
		if err := validate.Struct(req); err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Check the cache for early return
		if ctx.Query("isSkipCache") != "true" {
			if cachedResult, found := resultCache.Get(req.Username); found {
				// Cache hit!
				jobDetails := req.Username + " has " + strconv.Itoa(cachedResult.(int)) + "x more aura"
				wsHub.Notify(ws.Message{RoomId: req.RoomId, Event: queue.JobReturnedFromCache, Details: jobDetails})

				res := CheckAuraResponseDto{
					JobStatus: queue.JobQueued,
				}
				ctx.JSON(http.StatusOK, res)
				return
			}
		}

		// Cache miss!
		// Create a job
		jobId := uuid.New() // v4
		job := queue.Job{
			RoomId:   req.RoomId,
			JobId:    jobId,
			Username: req.Username,
		}

		// Attempt to queue the job within 2s
		queueJobCtx, queueJobCancel := context.WithTimeout(ctx.Request.Context(), 2*time.Second)
		defer queueJobCancel()

		select {
		case jobQueue <- job:
			// Job enqueued successfully before the timeout
			jobIdStr := job.JobId.String()
			res := CheckAuraResponseDto{
				JobId:     &jobIdStr,
				JobStatus: queue.JobQueued,
			}
			ctx.JSON(http.StatusAccepted, res)
		case <-queueJobCtx.Done():
			// Timeout occurred (queue full or worker can't dequeue fast enough)
			ctx.JSON(http.StatusRequestTimeout, gin.H{"error": "Request timed out"})
		}
	}
}
