package routes

import (
	"context"
	"net/http"
	"time"

	"jam-packed-webapi/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/patrickmn/go-cache"
)

func AuraCheckHandler(validate *validator.Validate, resultCache *cache.Cache, jobQueue chan models.CheckAuraRequestDto) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		// Unmarshal the HTTP request (parse JSON body into GO struct)
		var req models.CheckAuraRequestDto
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
			if cachedResult, found := resultCache.Get(req.Query); found {
				// Cache hit!
				ctx.JSON(http.StatusOK, models.Response{Result: cachedResult.(string)})
				return
			}
		}

		// Cache miss!
		// Attempt to queue the job within 2s
		queueJobCtx, queueJobCancel := context.WithTimeout(ctx.Request.Context(), 2*time.Second)
		defer queueJobCancel()

		select {
		case jobQueue <- req:
			// Job enqueued successfully before the timeout
			ctx.JSON(http.StatusAccepted, gin.H{
				"status": "Processing started",
				"jobId":  req.JobID,
			})
		case <-queueJobCtx.Done():
			// Timeout occurred (queue full or worker can't dequeue fast enough)
			ctx.JSON(http.StatusRequestTimeout, gin.H{"error": "Request timed out"})
		}
	}
}
