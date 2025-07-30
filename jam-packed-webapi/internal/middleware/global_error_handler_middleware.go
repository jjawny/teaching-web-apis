package middleware

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

// Middleware for global error handling
// TODO: dummy route to force this middleware to be used
func ErrorHandlingMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if r := recover(); r != nil {
				log.Printf("Recovered from panic: %v", r)
				c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
			}
		}()
		c.Next()
	}
}
