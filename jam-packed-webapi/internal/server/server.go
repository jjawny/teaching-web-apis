package server

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
)

func RunServerWithGracefulShutdown(router *gin.Engine, port int, shutdownTimeout time.Duration) {
	// 1. Create a struct of the server (to have more control)
	srv := &http.Server{
		Addr:    ":" + strconv.Itoa(port),
		Handler: router,
	}

	// 2. Start the HTTP server in a goroutine (GO's concurrency model)
	//  	Non-blocking version of `router.Run` (which calls ListenAndServe internally)
	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal("server error: ", err)
		}
	}()

	// 3. Wait (block main thread) for a signal to shutdown (Ctrl+C or SIGTERMs from OS/container, e.g. Docker)
	//    ^ This is possible because the HTTP server is running in a separate goroutine
	//    Why? So we can continue past the server shutdown w cleanup logic
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)
	<-stop

	// 4. Graceful shutdown within a window
	//    this allows the server to stop accepting new requests and finish in-flight requests
	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), shutdownTimeout)
	defer shutdownCancel()
	if err := srv.Shutdown(shutdownCtx); err != nil {
		panic("server forced to shutdown: " + err.Error())
	}

	// Here we can cleanup:
	//  - Broadcast a message to all current websocket clients
	// 	- Handle job queue
	// 		- Wait for worker to finish processing
	// 		- Drain out of in-memory queue into an external queue/DB
}
