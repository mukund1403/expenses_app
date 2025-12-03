package logx

import (
	"os"

	"github.com/natefinch/lumberjack"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

var Logger *zap.Logger

func init() {
	Logger = InitLogger()
}

func InitLogger() *zap.Logger {
	var coreArr []zapcore.Core
	// Get the encoder
	encoderConfig := zap.NewProductionEncoderConfig()            // NewJSONEncoder() outputs in JSON format, NewConsoleEncoder() outputs in plain text format
	encoderConfig.EncodeTime = zapcore.ISO8601TimeEncoder        // Specify time format
	encoderConfig.EncodeLevel = zapcore.CapitalColorLevelEncoder // Display different colors according to levels. If not needed, use zapcore.CapitalLevelEncoder.
	//encoderConfig.EncodeCaller = zapcore.FullCallerEncoder        // Display the full file path
	encoder := zapcore.NewConsoleEncoder(encoderConfig)
	// Log levels
	highPriority := zap.LevelEnablerFunc(func(lev zapcore.Level) bool { // Error level
		return lev >= zap.ErrorLevel
	})
	lowPriority := zap.LevelEnablerFunc(func(lev zapcore.Level) bool { // Info and debug levels, debug level is the lowest
		return lev < zap.ErrorLevel && lev >= zap.DebugLevel
	})
	// Info file writeSyncer
	infoFileWriteSyncer := zapcore.AddSync(&lumberjack.Logger{
		Filename:   "./log/info.log", // Log file storage directory. If the folder does not exist, it will be created automatically.
		MaxSize:    2,                // File size limit, unit MB
		MaxBackups: 100,              // Maximum number of retained log files
		MaxAge:     30,               // Number of days to retain log files
		Compress:   false,            // Whether to compress
	})
	infoFileCore := zapcore.NewCore(encoder, zapcore.NewMultiWriteSyncer(infoFileWriteSyncer, zapcore.AddSync(os.Stdout)), lowPriority) // The third and subsequent parameters are the log levels for writing to the file. In ErrorLevel mode, only error - level logs are recorded.
	// Error file writeSyncer
	errorFileWriteSyncer := zapcore.AddSync(&lumberjack.Logger{
		Filename:   "./log/error.log", // Log file storage directory
		MaxSize:    1,                 // File size limit, unit MB
		MaxBackups: 5,                 // Maximum number of retained log files
		MaxAge:     30,                // Number of days to retain log files
		Compress:   false,             // Whether to compress
	})
	errorFileCore := zapcore.NewCore(encoder, zapcore.NewMultiWriteSyncer(errorFileWriteSyncer, zapcore.AddSync(os.Stdout)), highPriority) // The third and subsequent parameters are the log levels for writing to the file. In ErrorLevel mode, only error - level logs are recorded.
	coreArr = append(coreArr, infoFileCore)
	coreArr = append(coreArr, errorFileCore)
	log := zap.New(zapcore.NewTee(coreArr...), zap.AddCaller()) // zap.AddCaller() is used to display the file name and line number and can be omitted.

	log.Info("hello info")
	log.Debug("hello debug")
	log.Error("hello error")
	return log
}
