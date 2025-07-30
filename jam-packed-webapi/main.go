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
	"jam-packed-webapi/internal/models"
	"jam-packed-webapi/internal/routes"
	"jam-packed-webapi/internal/workers"
	"jam-packed-webapi/internal/ws"
)

var (
	validate = validator.New()
	jobQueue = make(chan models.CheckAuraRequestDto, 100)

	// A global cache for previous-processed results to lessen CPU load (perf gain)
	resultCache = cache.New(5*time.Minute, 10*time.Minute)

	// Routes that bypass the auth middleware
	bypassAuthPaths = []string{
		"/",   // Health check is anonymous
		"/ws", // Websocket has its own JWT check as the browser cannot send custom headers for join requests
	}
)

func main() {
	_ = godotenv.Load()

	wsHub := ws.NewHub()
	go workers.StartWorker(jobQueue, resultCache, wsHub)

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
	router.POST("/api/check-aura", routes.AuraCheckHandler(validate, resultCache, jobQueue))

	router.Run(":8080")
}
