package main

import (
	"expenses/handlers"
	"expenses/logx"
	"os"
	"time"

	"github.com/cloudwego/hertz/pkg/app/server"
	"github.com/hertz-contrib/cors"
	"github.com/joho/godotenv"
)

func init() {
	err := godotenv.Load()
	if err != nil {
		logx.Logger.Error(".env file not loaded, relying on system env")
	}
}

func main() {
	// server.Default() creates a Hertz with recovery middleware.
	// If you need a pure hertz, you can use server.New()
	h := server.Default(
		server.WithHostPorts("127.0.0.1:8080"),
	)
	corsAllowedDomain := []string{os.Getenv("CORS_ALLOWED_DOMAIN")}
	h.Use(cors.New(cors.Config{
		AllowOrigins:     corsAllowedDomain,                                             // Allowed domains, need to bring schema
		AllowMethods:     []string{"PUT", "POST"},                                       // Allowed request methods
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"}, // Allowed request headers
		ExposeHeaders:    []string{"Content-Length"},                                    // Request headers allowed in the upload_file
		AllowCredentials: true,                                                          // Whether cookies are attached
		AllowOriginFunc: func(origin string) bool { // Custom domain detection with lower priority than AllowOrigins
			return origin == "https://github.com"
		},
		MaxAge: 12 * time.Hour, // Maximum length of upload_file-side cache preflash requests (seconds)
	}))

	// h.GET("/hello", func(ctx context.Context, c *app.RequestContext) {
	// 	c.String(consts.StatusOK, "Hello hertz!")
	// })

	RegisterGroupRoute(h)

	h.Spin()
}

func RegisterGroupRoute(h *server.Hertz) {
	auth := h.Group("/auth")
	{
		auth.POST("/register", handlers.RegisterHandler)
		auth.GET("/oauth", handlers.OauthHandler)
		auth.GET("/callback", handlers.OauthCallbackHandler)
	}

	transactions := h.Group("/transactions")
	transactions.Use(AuthMiddleware())
	{
		transactions.GET("/", handlers.GetTransactionListHandler)
		transactions.PUT("/", handlers.PutTransactionHandler)
		transactions.POST("/", handlers.PostTransactionHandler)
	}

}
