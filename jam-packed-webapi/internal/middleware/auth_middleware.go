package middleware

import (
	"net/http"
	"slices"
	"strings"

	"github.com/gin-gonic/gin"

	"jam-packed-webapi/internal/auth"
)

func AuthMiddleware(bypassPaths []string) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		if slices.Contains(bypassPaths, ctx.Request.URL.Path) {
			ctx.Next()
			return
		}

		// Validate the header
		authHeader := ctx.GetHeader("Authorization")
		if !strings.HasPrefix(authHeader, "Bearer ") {
			ctx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Missing or invalid Authorization header"})
			return
		}

		// Validate the token
		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		_, claims, err := auth.ValidateJWT(tokenString)

		if err != nil {
			ctx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			return
		}

		// Expose claims
		userId, ok := claims["userId"].(string)
		if !ok || strings.TrimSpace(userId) == "" {
			ctx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Missing userId in token"})
			return
		}

		ctx.Set("userId", userId)
		ctx.Next()
	}
}
