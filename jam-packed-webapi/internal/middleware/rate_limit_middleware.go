package middleware

import (
	"slices"
	"sync"

	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/juju/ratelimit"
)

type UserRateLimiter struct {
	buckets map[string]*ratelimit.Bucket
	mu      sync.Mutex
	rate    float64
	cap     int64
}

func NewUserRateLimiter(rate float64, cap int64) *UserRateLimiter {
	return &UserRateLimiter{
		buckets: make(map[string]*ratelimit.Bucket),
		rate:    rate,
		cap:     cap,
	}
}

func (u *UserRateLimiter) GetBucket(userId string) *ratelimit.Bucket {
	u.mu.Lock()
	defer u.mu.Unlock()
	bucket, exists := u.buckets[userId]
	if !exists {
		bucket = ratelimit.NewBucketWithRate(u.rate, u.cap)
		u.buckets[userId] = bucket
	}
	return bucket
}

// Bucket's total capacity is 10 tokens (for bursts)
// Bucket refills 5 tokens/sec
var userRateLimiter = NewUserRateLimiter(5, 10)

func UserRateLimitMiddleware(bypassPaths []string) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		if slices.Contains(bypassPaths, ctx.Request.URL.Path) {
			ctx.Next()
			return
		}

		// `userId` must be set in AuthMiddleware
		userId, exists := ctx.Get("userId")
		if !exists {
			ctx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Token missing claims"})
			return
		}

		bucket := userRateLimiter.GetBucket(userId.(string))
		if bucket.TakeAvailable(1) == 0 {
			ctx.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{"error": "Rate limit exceeded"})
			return
		}
		ctx.Next()
	}
}
