package main

import (
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/joho/godotenv"
	"github.com/patrickmn/go-cache"

	"jam-packed-webapi/internal/middleware"
	"jam-packed-webapi/internal/queue"
	"jam-packed-webapi/internal/routes"
	"jam-packed-webapi/internal/server"
	"jam-packed-webapi/internal/ws"
)

const (
	jobQueueSize           = 100
	resultsCacheExpiration = 5 * time.Minute
	resultsCacheGCInterval = 10 * time.Minute
)

var (
	validate = validator.New()
	jobQueue = make(chan queue.Job, jobQueueSize)
	// Cache for repeated queries to reduce load and latency
	resultCache = cache.New(resultsCacheExpiration, resultsCacheGCInterval)
	// `/ws` has its own JWT check (the browser cannot send custom headers for WS connect, will fail in AuthMiddleware)
	bypassAuthMiddlewareRoutes = []string{"/", "/ws", "/test-global-error"}
)

func main() {
	_ = godotenv.Load()

	// TODO: Add better logger

	wsHub := ws.NewHub()
	go queue.StartWorker(jobQueue, resultCache, wsHub)

	router := gin.Default()

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{os.Getenv("FRONTEND_URL")},
		AllowMethods:     []string{"GET", "POST", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))
	router.Use(middleware.ErrorHandlingMiddleware())
	router.Use(middleware.AuthMiddleware(bypassAuthMiddlewareRoutes))
	router.Use(middleware.UserRateLimitMiddleware(bypassAuthMiddlewareRoutes))

	router.GET("/", routes.HealthCheckHandler)
	router.GET("/ws", ws.ServeWS(wsHub))
	router.GET("/test-global-error", routes.TestGlobalErrorHandler)
	router.POST("/api/check-aura", routes.AuraCheckHandler(validate, resultCache, jobQueue, wsHub))

	// router.Run(":8080")
	server.RunServerWithGracefulShutdown(router, 8080, 5*time.Second)
}
