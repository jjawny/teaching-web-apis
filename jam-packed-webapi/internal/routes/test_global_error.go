package routes

import (
	"github.com/gin-gonic/gin"
)

func TestGlobalErrorHandler(ctx *gin.Context) {
	panic("Simulated panic for testing Global Error Handler Middleware")
}
