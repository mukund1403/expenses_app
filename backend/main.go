package main

import (
	"expenses/handlers"

	"github.com/cloudwego/hertz/pkg/app/server"
)

func main() {
	// server.Default() creates a Hertz with recovery middleware.
	// If you need a pure hertz, you can use server.New()
	h := server.Default(
		server.WithHostPorts("127.0.0.1:8080"),
	)

	// h.GET("/hello", func(ctx context.Context, c *app.RequestContext) {
	// 	c.String(consts.StatusOK, "Hello hertz!")
	// })

	RegisterGroupRoute(h)

	h.Spin()
}

func RegisterGroupRoute(h *server.Hertz) {
	gmail := h.Group("/gmail")
	{
		auth := gmail.Group("/auth")
		{
			auth.POST("/post", handlers.AuthHandler)
		}
	}

}
