package main

import (
	"context"
	"net/http"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/joho/godotenv"
	"github.com/juju/ratelimit"
	"github.com/patrickmn/go-cache"

	"jam-packed-webapi/internal/middleware"
	"jam-packed-webapi/internal/models"
	"jam-packed-webapi/internal/workers"
	"jam-packed-webapi/internal/ws"
)

// Global variables
var (
	validate    = validator.New()
	resultCache = cache.New(5*time.Minute, 10*time.Minute)
	rateLimiter = ratelimit.NewBucketWithRate(5, 10) // 5 requests per second
	jobQueue    = make(chan models.CheckAuraRequestDto, 100)
)

func main() {
	// Load .env
	_ = godotenv.Load()
	frontendUrl := os.Getenv("FRONTEND_URL")

	wsHub := ws.NewHub()
	go workers.StartWorker(jobQueue, resultCache, wsHub)

	router := gin.Default()
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{frontendUrl},
		AllowMethods:     []string{"GET", "POST", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))
	router.Use(middleware.ErrorHandlingMiddleware())
	router.Use(middleware.RateLimitMiddleware(rateLimiter))
	router.Use(middleware.BetterAuthJWTMiddleware())

	// Routes
	router.GET("/", func(ctx *gin.Context) { ctx.String(http.StatusOK, "Healthy!") })
	router.GET("/ws", ws.ServeWS(wsHub))
	router.POST("/api/check-aura", func(ctx *gin.Context) {
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
	})

	router.Run(":8080")
}
