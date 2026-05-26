// Configuration file for IoT server
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export const config = {
  // Data sending configuration
  dataSendInterval: process.env.DATA_SEND_INTERVAL || 500, // milliseconds (0.5 updates per second - 2 second interval)
  
  // Serial port configuration
  serialPort: {
    portName: process.env.SERIAL_PORT || "COM5",
    baudRate: process.env.BAUDRATE || 9600
  },
  
  // Server configuration
  server: {
    port: process.env.PORT || 4000,
    corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173"
  },
  
  // Data filtering
  enableDataFiltering: true,
  
  // AQI Configuration
  aqi: {
    scale: process.env.AQI_SCALE || 500, // 100 or 500
    pollutantType: process.env.AQI_POLLUTANT_TYPE || 'pm25', // pm25 or pm10
    enableConversion: true
  },
  
  // Email notification configuration
  email: {
    enabled: process.env.EMAIL_ENABLED === 'true' || false,
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true' || false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
      }
    },
    notification: {
      threshold: process.env.AQI_THRESHOLD || 80, // AQI value to trigger notification
      recipients: process.env.EMAIL_RECIPIENTS ? process.env.EMAIL_RECIPIENTS.split(',') : [],
      from: process.env.EMAIL_FROM || 'iot-alerts@example.com',
      subject: process.env.EMAIL_SUBJECT || 'Air Quality Alert - AQI Exceeds Threshold',
      cooldownMinutes: process.env.EMAIL_COOLDOWN || 30 // Prevent spam by limiting notifications
    }
  },
  
  // Logging
  enableVerboseLogging: process.env.VERBOSE_LOGGING === 'true'
};

// Preset configurations for different use cases
export const presets = {
  ultraHighFrequency: {
    dataSendInterval: 50, // 20 updates per second
    description: "Ultra high frequency updates for real-time monitoring"
  },
  highFrequency: {
    dataSendInterval: 100, // 10 updates per second
    description: "High frequency updates for real-time monitoring"
  },
  normal: {
    dataSendInterval: 500, // 2 updates per second
    description: "Normal frequency for general monitoring"
  },
  twoSecondInterval: {
    dataSendInterval: 2000, // 0.5 updates per second (2 second interval)
    description: "Two second interval for sensor data updates"
  },
  lowFrequency: {
    dataSendInterval: 2000, // 0.5 updates per second
    description: "Low frequency for battery saving"
  },
  ultraLow: {
    dataSendInterval: 5000, // 0.2 updates per second
    description: "Ultra low frequency for minimal power usage"
  }
};
