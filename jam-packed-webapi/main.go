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

var (
	validate = validator.New()
	jobQueue = make(chan queue.Job, 100)

	// A global cache for repeated queries to lessen server load and latency
	resultCache = cache.New(5*time.Minute, 10*time.Minute)

	// Routes that bypass the auth middleware
	bypassAuthPaths = []string{
		"/",   // Health check is anonymous
		"/ws", // Websocket has its own JWT check as the browser cannot send custom headers for join requests
	}
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
	router.Use(middleware.AuthMiddleware(bypassAuthPaths))
	router.Use(middleware.UserRateLimitMiddleware(bypassAuthPaths))

	router.GET("/", routes.HealthCheckHandler)
	router.GET("/ws", ws.ServeWS(wsHub))
	router.POST("/api/check-aura", routes.AuraCheckHandler(validate, resultCache, jobQueue, wsHub))

	// router.Run(":8080")
	server.RunServerWithGracefulShutdown(router, 8080, 5*time.Second)
}
