// server.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";
import { Server as SocketIo } from "socket.io";
import cors from "cors";
import { config, presets } from "./config.js";
import EmailService from "./emailService.js";

// Load environment variables (Node.js built-in)
import { readFileSync } from 'fs';
import { join } from 'path';

// Simple .env loader
try {
  const envPath = join(process.cwd(), '.env');
  const envContent = readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && !key.startsWith('#')) {
      const value = valueParts.join('=').trim();
      if (value) {
        process.env[key.trim()] = value.replace(/^["']|["']$/g, '');
      }
    }
  });
  console.log('📄 Environment variables loaded from .env file');
} catch (error) {
  console.log('📄 No .env file found, using default configuration');
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// ✅ Enable CORS for frontend React app
app.use(cors({ origin: "*" }));

const io = new SocketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(express.json()); // ✅ Parse JSON bodies

// ---------------- STATE ----------------
let latestSensorData = null;        // temp + humidity + airQuality
let latestAirQualityData = null;    // processed AQI
let DATA_SEND_INTERVAL = config.dataSendInterval;
let dataSendTimer = null;

// Initialize email service
const emailService = new EmailService();

// ---------------- AQI HELPER FUNCTIONS ----------------
function convertToAQI(value, pollutantType = 'pm25', scale = 500) {
  const breakpoints = {
    pm25: [
      { low: 0, high: 12, aqiLow: 0, aqiHigh: 50, category: 'Good' },
      { low: 12.1, high: 35.4, aqiLow: 51, aqiHigh: 100, category: 'Moderate' },
      { low: 35.5, high: 55.4, aqiLow: 101, aqiHigh: 150, category: 'Unhealthy for Sensitive Groups' },
      { low: 55.5, high: 150.4, aqiLow: 151, aqiHigh: 200, category: 'Unhealthy' },
      { low: 150.5, high: 250.4, aqiLow: 201, aqiHigh: 300, category: 'Very Unhealthy' },
      { low: 250.5, high: 500, aqiLow: 301, aqiHigh: 500, category: 'Hazardous' }
    ]
  };
  const bp = breakpoints[pollutantType] || breakpoints.pm25;
  for (const range of bp) {
    if (value >= range.low && value <= range.high) {
      const aqi = Math.round(
        ((range.aqiHigh - range.aqiLow) / (range.high - range.low)) * (value - range.low) + range.aqiLow
      );
      return { aqi, category: range.category, color: getAQIColor(aqi) };
    }
  }
  return { aqi: 500, category: "Hazardous", color: "#7e0023" };
}
function getAQIColor(aqi) {
  if (aqi <= 50) return "#009966";
  if (aqi <= 100) return "#ffde33";
  if (aqi <= 150) return "#ff9933";
  if (aqi <= 200) return "#cc0033";
  if (aqi <= 300) return "#660099";
  return "#7e0023";
}

// ---------------- API ROUTES ----------------

// ✅ ESP8266 will POST here
app.post("/api/sensor", (req, res) => {
  const { temperature, humidity, airQuality } = req.body;

  if (temperature == null || humidity == null || airQuality == null) {
    return res.status(400).json({ success: false, message: "Missing sensor fields" });
  }

  latestSensorData = {
    timestamp: new Date().toISOString(),
    temperature,
    humidity,
    airQuality
  };

  // Use raw air quality value directly (already on 0-500 scale)
  const aqiData = convertToAQI(airQuality, config.aqi.pollutantType, config.aqi.scale);
  latestAirQualityData = {
    ...latestSensorData,
    aqi: airQuality, // Use raw value directly (no conversion needed)
    category: aqiData.category,
    color: aqiData.color
  };

  // Check if AQI exceeds threshold and send email notification
  if (airQuality > config.email.notification.threshold) {
    console.log(`🚨 AQI (${airQuality}) exceeds threshold (${config.email.notification.threshold}) - triggering email alert`);
    emailService.sendAirQualityAlert(latestAirQualityData).then(sent => {
      if (sent) {
        console.log('📧 Email notification sent successfully');
      } else {
        console.log('📧 Email notification not sent (disabled or no recipients)');
      }
    });
  }

  console.log("📥 Received from ESP8266:", latestSensorData);

  res.json({ success: true, message: "Sensor data stored" });
});

// ✅ Fetch latest sensor data
app.get("/api/sensor", (req, res) => {
  if (latestSensorData) res.json({ success: true, data: latestSensorData });
  else res.status(503).json({ success: false, message: "No sensor data yet" });
});

// ✅ Fetch AQI data
app.get("/api/air-quality", (req, res) => {
  console.log("📥 GET /api/air-quality request from:", req.headers.origin);
  if (latestAirQualityData) {
    console.log("📤 Sending AQI data:", latestAirQualityData);
    res.json({ success: true, data: latestAirQualityData });
  } else {
    console.log("❌ No AQI data available");
    res.status(503).json({ success: false, message: "No air quality data yet" });
  }
});

// ✅ Change data sending rate dynamically
app.post("/api/config/update-rate", (req, res) => {
  const { interval } = req.body;
  
  if (!interval || typeof interval !== 'number' || interval < 10) {
    return res.status(400).json({ 
      success: false, 
      message: "Invalid interval. Must be a number >= 10ms" 
    });
  }
  
  // Update the interval
  DATA_SEND_INTERVAL = interval;
  
  // Restart the timer with new interval
  if (dataSendTimer) {
    clearInterval(dataSendTimer);
  }
  startDataSendingTimer();
  
  console.log(`⚡ Data sending rate updated to ${interval}ms (${1000/interval} updates/sec)`);
  
  res.json({ 
    success: true, 
    message: `Data sending rate updated to ${interval}ms`,
    currentInterval: interval,
    updatesPerSecond: Math.round(1000 / interval)
  });
});

// ✅ Get current configuration
app.get("/api/config", (req, res) => {
  res.json({
    success: true,
    data: {
      currentInterval: DATA_SEND_INTERVAL,
      updatesPerSecond: Math.round(1000 / DATA_SEND_INTERVAL),
      availablePresets: presets,
      emailStatus: emailService.getStatus()
    }
  });
});

// ✅ Get email notification status
app.get("/api/email/status", (req, res) => {
  res.json({
    success: true,
    data: emailService.getStatus()
  });
});

// ✅ Test email connection
app.post("/api/email/test", async (req, res) => {
  try {
    const success = await emailService.testConnection();
    res.json({
      success,
      message: success ? 'Email connection test successful' : 'Email connection test failed'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Email test failed',
      error: error.message
    });
  }
});

// ✅ Send test email notification
app.post("/api/email/test-notification", async (req, res) => {
  try {
    if (!latestAirQualityData) {
      return res.status(400).json({
        success: false,
        message: 'No air quality data available for test notification'
      });
    }

    const sent = await emailService.sendAirQualityAlert(latestAirQualityData);
    res.json({
      success: sent,
      message: sent ? 'Test notification sent successfully' : 'Test notification not sent (check AQI state or configuration)'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Test notification failed',
      error: error.message
    });
  }
});

// ✅ Contact form submission endpoint
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, phone, company, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address'
      });
    }

    // Send contact form email
    const sent = await emailService.sendContactFormEmail({
      name,
      email,
      company: company || 'Not provided',
      subject,
      message
    });

    if (sent) {
      res.json({
        success: true,
        message: 'Contact form submitted successfully. We will get back to you within 24 hours.'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send contact form. Please try again later.'
      });
    }
  } catch (error) {
    console.error('❌ Contact form submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.'
    });
  }
});

// ✅ Newsletter subscription endpoint
app.post("/api/newsletter", async (req, res) => {
  try {
    const { email } = req.body;

    // Validate required fields
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address'
      });
    }

    // Send newsletter subscription emails
    const sent = await emailService.sendNewsletterSubscription({ email });

    if (sent) {
      res.json({
        success: true,
        message: 'Successfully subscribed to newsletter! Check your email for confirmation.'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to subscribe to newsletter. Please try again later.'
      });
    }
  } catch (error) {
    console.error('❌ Newsletter subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.'
    });
  }
});



// (Keeping your config/preset/aqi endpoints unchanged...)

// ---------------- SOCKET.IO ----------------
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  if (latestAirQualityData) {
    socket.emit("airQualityData", latestAirQualityData);
  }
  socket.on("disconnect", () => console.log("Client disconnected:", socket.id));
});

// Broadcast data periodically
function startDataSendingTimer() {
  dataSendTimer = setInterval(() => {
    if (latestAirQualityData) {
      io.emit("airQualityData", latestAirQualityData);
      console.log(`📤 Sent air quality data to ${io.engine.clientsCount} clients`);
    }
  }, DATA_SEND_INTERVAL);
}

// ---------------- START SERVER ----------------
const PORT = process.env.PORT || config.server.port || 4000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on ${PORT}`);
  console.log(`📡 Ready to receive ESP8266 POST requests at /api/sensor`);
  startDataSendingTimer();
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down server...");
  if (dataSendTimer) clearInterval(dataSendTimer);
  process.exit(0);
});
