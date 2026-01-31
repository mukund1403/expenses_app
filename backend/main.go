package main

import (
	"expenses/handlers"
	"expenses/logx"
	"os"
	"time"

	"github.com/cloudwego/hertz/pkg/app/server"
	"github.com/dgraph-io/ristretto"
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
	appEnv := os.Getenv("APP_ENV")
	serverURL := "0.0.0.0:8080"
	if appEnv == "dev" {
		serverURL = "127.0.0.1:8080"
	}
	h := server.Default(
		server.WithHostPorts(serverURL),
	)
	corsAllowedDomain := []string{os.Getenv("FRONTEND_URL")}
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

	// cache for oneTimeCode : JWT
	cache, err := ristretto.NewCache(&ristretto.Config{
		NumCounters: 1e4,
		MaxCost:     1 << 20, // 1MB
		BufferItems: 64,
	})
	if err != nil {
		panic(err)
	}

	handlers.InitOTPCache(cache)

	RegisterGroupRoute(h)

	go func() {
		err := handlers.ClearEmailQueue()
		if err != nil {
			logx.Logger.Sugar().Errorf("failed to clear backlog queue: %s", err.Error())
		}
	}()

	h.Spin()
}

func RegisterGroupRoute(h *server.Hertz) {
	auth := h.Group("/auth")
	{
		// auth.POST("/register", handlers.RegisterHandler)
		auth.GET("/oauth", handlers.OauthHandler)
		auth.GET("/callback", handlers.OauthCallbackHandler)
		auth.POST("/logout", handlers.LogoutHandler)
		auth.POST("/exchange", handlers.JWTHandler)
	}

	transactions := h.Group("/transactions")
	transactions.Use(AuthMiddleware())
	{
		transactions.GET("/", handlers.GetTransactionListHandler)
		transactions.PUT("/", handlers.PutTransactionHandler)
		transactions.POST("/", handlers.PostTransactionHandler)
		transactions.DELETE("/", handlers.DeleteTransactionHandler)
	}

	resend := h.Group("/resend")
	{
		resend.POST("/webhook", handlers.PostWebhookHandler)

	}

	settings := h.Group("/settings")
	settings.Use(AuthMiddleware())
	{
		settings.GET("/activation_link", handlers.ResendActivationLinkHandler)
		settings.GET("/user_details", handlers.GetUserDetailsHandler)
		settings.PUT("/user_details", handlers.PutUserDetailsHandler)
	}

}
