package routes

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func HealthCheckHandler(ctx *gin.Context) {
	ctx.String(http.StatusOK, "Healthy!")
}
