import React, { useEffect, useState, useMemo } from "react";
import io from "socket.io-client";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  const [airQualityData, setAirQualityData] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [historicalData, setHistoricalData] = useState({
    timestamps: [],
    aqi: [],
    temperature: [],
    humidity: []
  });

  // Backend configuration
  const API_BASE = import.meta.env.VITE_API_BASE || "https://pollusense.onrender.com";

  // Floating particles animation
  const Particles = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-blue-300 rounded-full opacity-30 animate-pulse"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${4 + Math.random() * 2}s`
          }}
        />
      ))}
    </div>
  );

  // --- Utilities ---
  const updateHistoricalData = (data) => {
    const timestamp = new Date().toLocaleTimeString();
    const { aqi, temperature, humidity } = data;

    setHistoricalData(prev => {
      const newData = {
        timestamps: [...prev.timestamps, timestamp],
        aqi: [...prev.aqi, aqi != null ? aqi : null],
        temperature: [...prev.temperature, temperature != null ? temperature : null],
        humidity: [...prev.humidity, humidity != null ? humidity : null]
      };

      // Keep only last 20 data points to prevent charts from becoming too crowded
      if (newData.timestamps.length > 20) {
        newData.timestamps = newData.timestamps.slice(-20);
        newData.aqi = newData.aqi.slice(-20);
        newData.temperature = newData.temperature.slice(-20);
        newData.humidity = newData.humidity.slice(-20);
      }

      return newData;
    });
  };

  const getAQIColor = (aqiVal) => {
    if (aqiVal == null) return "#6b7280"; // gray-500
    if (aqiVal <= 50) return "#10b981"; // emerald-500
    if (aqiVal <= 100) return "#f59e0b"; // amber-500
    if (aqiVal <= 150) return "#f97316"; // orange-500
    if (aqiVal <= 200) return "#ef4444"; // red-500
    if (aqiVal <= 300) return "#8b5cf6"; // violet-500
    return "#991b1b"; // red-800
  };

  useEffect(() => {
    // Initialize Socket.IO connection
    const socket = io(API_BASE, {
      transports: ["websocket", "polling"],
      timeout: 5000,
    });

    socket.on("connect", () => {
      setConnectionStatus("connected");
    });

    socket.on("disconnect", () => {
      setConnectionStatus("disconnected");
    });

    socket.on("connect_error", () => {
      setConnectionStatus("error");
    });

    // Listen for real-time air quality data updates
    socket.on("airQualityData", (data) => {
      setAirQualityData(data);
      updateHistoricalData(data);
      const ts = data?.timestamp ? new Date(data.timestamp) : new Date();
      setLastUpdate(ts.toLocaleString());
    });

    // Fetch initial data from REST API
    fetchInitialData();

    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchInitialData = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/air-quality`);
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setAirQualityData(result.data);
          updateHistoricalData(result.data);
          const ts = result.data?.timestamp ? new Date(result.data.timestamp) : new Date();
          setLastUpdate(ts.toLocaleString());
          setConnectionStatus("connected");
        } else {
          setConnectionStatus("no-data");
        }
      } else {
        setConnectionStatus("error");
      }
    } catch {
      setConnectionStatus("error");
    }
  };

  // Memoized connection status display
  const connectionStatusDisplay = useMemo(() => {
    switch (connectionStatus) {
      case "connected":
        return { text: "Connected", color: "#10b981", icon: "🟢" };
      case "connecting":
        return { text: "Connecting...", color: "#f59e0b", icon: "🟡" };
      case "disconnected":
        return { text: "Disconnected", color: "#ef4444", icon: "🔴" };
      case "error":
        return { text: "Connection Error", color: "#ef4444", icon: "⚠" };
      case "no-data":
        return { text: "Waiting for Data", color: "#3b82f6", icon: "🔵" };
      default:
        return { text: "Unknown", color: "#6b7280", icon: "?" };
    }
  }, [connectionStatus]);

  // Air quality data rendering component
  const renderAirQualityData = () => {
    if (!airQualityData) {
      return (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 animate-pulse">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-6 h-6 bg-blue-500 rounded-full animate-spin" />
            <span className="text-gray-700 font-semibold text-lg">
              {connectionStatusDisplay.text === "Connected"
                ? "Waiting for air quality data..."
                : connectionStatusDisplay.text}
            </span>
          </div>
        </div>
      );
    }

    const {
      temperature = null,
      humidity = null,
      airQuality = null,
      aqi = airQuality,
      category = "",
      color: incomingColor,
      timestamp,
    } = airQualityData;

    const derivedColor = incomingColor || getAQIColor(aqi);
    const gaugeWidth = aqi != null && !Number.isNaN(aqi) ? Math.min((aqi / 500) * 100, 100) : 0;

    return (
      <div className="space-y-8">
        {/* Timestamp Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <span className="text-gray-700 font-bold text-lg">Last Updated:</span>
            <span className="text-gray-600 font-semibold">
              {new Date(timestamp ?? Date.now()).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Main Readings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Humidity Card */}
          <div className="group bg-white rounded-2xl shadow-xl border border-gray-200 hover:border-blue-300 hover:shadow-2xl transition-all duration-300 hover:scale-105 p-8">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center group-hover:rotate-6 transition-transform">
                <span className="text-3xl">💧</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">Humidity</p>
                <p className="text-3xl font-bold text-gray-900">
                  {humidity != null ? `${humidity}%` : "N/A"}
                </p>
              </div>
            </div>
            <div className="mt-6 bg-gray-100 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-1000 ease-out rounded-full"
                style={{ width: humidity != null ? `${humidity}%` : "0%" }}
              />
            </div>
          </div>

          {/* Temperature Card */}
          <div className="group bg-white rounded-2xl shadow-xl border border-gray-200 hover:border-orange-300 hover:shadow-2xl transition-all duration-300 hover:scale-105 p-8">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center group-hover:rotate-6 transition-transform">
                <span className="text-3xl">🌡️</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">Temperature</p>
                <p className="text-3xl font-bold text-gray-900">
                  {temperature != null ? `${temperature}°C` : "N/A"}
                </p>
              </div>
            </div>
            <div className="mt-6 bg-gray-100 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-400 to-red-500 transition-all duration-1000 ease-out rounded-full"
                style={{
                  width: temperature != null ? `${Math.min((Number(temperature) / 50) * 100, 100)}%` : "0%",
                }}
              />
            </div>
          </div>

          {/* Air Quality Card */}
          <div className="group bg-white rounded-2xl shadow-xl border-2 hover:shadow-2xl transition-all duration-300 hover:scale-105 p-8"
            style={{ borderColor: derivedColor || "#d1d5db" }}>
            <div className="flex items-center space-x-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center group-hover:rotate-6 transition-transform"
                style={{
                  background: `linear-gradient(135deg, ${derivedColor}dd, ${derivedColor})`
                }}
              >
                <span className="text-3xl">🌬️</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">
                  Air Quality Index
                </p>
                <p
                  className="text-3xl font-bold transition-colors duration-300"
                  style={{ color: derivedColor || "#374151" }}
                >
                  {aqi != null ? aqi : "N/A"}
                </p>
                {category && (
                  <p
                    className="text-sm font-bold mt-2 uppercase tracking-wide"
                    style={{ color: derivedColor }}
                  >
                    {category}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-6 bg-gray-100 rounded-full h-3 overflow-hidden">
              <div
                className="h-full transition-all duration-1000 ease-out rounded-full"
                style={{
                  width: `${gaugeWidth}%`,
                  backgroundColor: derivedColor,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Enhanced Chart configuration
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 200,
      easing: 'easeOutQuart'
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#374151',
          font: {
            weight: 'bold',
            size: 14,
            family: 'Inter, system-ui, sans-serif'
          },
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 25
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#3b82f6',
        borderWidth: 2,
        cornerRadius: 16,
        displayColors: true,
        titleFont: {
          size: 16,
          weight: 'bold',
          family: 'Inter, system-ui, sans-serif'
        },
        bodyFont: {
          size: 14,
          family: 'Inter, system-ui, sans-serif'
        },
        padding: 16,
        boxPadding: 8
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
          lineWidth: 1,
          drawBorder: false
        },
        ticks: {
          color: '#6b7280',
          maxRotation: 45,
          font: {
            size: 12,
            family: 'Inter, system-ui, sans-serif'
          },
          padding: 10
        },
        border: {
          display: false
        }
      },
      y: {
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
          lineWidth: 1,
          drawBorder: false
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12,
            family: 'Inter, system-ui, sans-serif'
          },
          padding: 10
        },
        border: {
          display: false
        }
      }
    },
    elements: {
      point: {
        hoverRadius: 10,
        hoverBorderWidth: 4
      }
    }
  };

  // AQI Chart
  const aqiChartData = {
    labels: historicalData.timestamps,
    datasets: [
      {
        label: 'AQI',
        data: historicalData.aqi,
        borderColor: '#ef4444',
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return null;

          const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, 'rgba(239, 68, 68, 0.1)');
          gradient.addColorStop(1, 'rgba(239, 68, 68, 0.4)');
          return gradient;
        },
        borderWidth: 4,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#ef4444',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 12,
        pointHoverBorderWidth: 4,
        pointHoverBackgroundColor: '#dc2626',
        pointHoverBorderColor: '#ffffff'
      }
    ]
  };

  // Temperature Chart
  const temperatureChartData = {
    labels: historicalData.timestamps,
    datasets: [
      {
        label: 'Temperature (°C)',
        data: historicalData.temperature,
        borderColor: '#f97316',
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return null;

          const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, 'rgba(249, 115, 22, 0.1)');
          gradient.addColorStop(1, 'rgba(249, 115, 22, 0.4)');
          return gradient;
        },
        borderWidth: 4,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#f97316',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 12,
        pointHoverBorderWidth: 4,
        pointHoverBackgroundColor: '#ea580c',
        pointHoverBorderColor: '#ffffff'
      }
    ]
  };

  // Humidity Chart
  const humidityChartData = {
    labels: historicalData.timestamps,
    datasets: [
      {
        label: 'Humidity (%)',
        data: historicalData.humidity,
        borderColor: '#3b82f6',
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return null;

          const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, 'rgba(59, 130, 246, 0.1)');
          gradient.addColorStop(1, 'rgba(59, 130, 246, 0.4)');
          return gradient;
        },
        borderWidth: 4,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 12,
        pointHoverBorderWidth: 4,
        pointHoverBackgroundColor: '#2563eb',
        pointHoverBorderColor: '#ffffff'
      }
    ]
  };

  // Memoized AQI Legend
  const AQILegend = useMemo(() => {
    const aqiData = [
      { range: "0-50", category: "Good", color: "#10b981" },
      { range: "51-100", category: "Moderate", color: "#f59e0b" },
      { range: "101-150", category: "Unhealthy for Sensitive Groups", color: "#f97316" },
      { range: "151-200", category: "Unhealthy", color: "#ef4444" },
      { range: "201-300", category: "Very Unhealthy", color: "#8b5cf6" },
      { range: "301-500", category: "Hazardous", color: "#991b1b" },
    ];

    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 hover:shadow-2xl transition-all duration-300">
        <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          AQI Scale Reference
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {aqiData.map((item, index) => (
            <div
              key={index}
              className="group flex items-center p-6 rounded-xl shadow-lg border border-gray-200 hover:border-gray-300 hover:shadow-xl hover:scale-105 transition-all duration-300 bg-white"
            >
              <div
                className="w-6 h-6 rounded-full mr-4 group-hover:scale-110 transition-transform duration-300"
                style={{ backgroundColor: item.color }}
              />
              <div className="flex-1">
                <p className="font-bold text-lg text-gray-900">{item.range}</p>
                <p className="text-sm text-gray-600 font-semibold">{item.category}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 relative overflow-hidden">
      {/* Background Particles */}
      <Particles />

      {/* Subtle background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-200/20 to-indigo-200/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-gradient-to-r from-indigo-200/20 to-cyan-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 py-12 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full mb-8 shadow-xl">
            <span className="text-4xl">🍃</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Air Quality
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Dashboard
            </span>
          </h1>
          <p className="text-xl text-gray-600 font-medium max-w-3xl mx-auto leading-relaxed">
            Real-time monitoring of environmental conditions with live sensor data updates and predictive analytics
          </p>
        </div>

        {/* Dashboard Content */}
        <div className="space-y-12">
          {renderAirQualityData()}

          {/* Charts Section */}
          {historicalData.timestamps.length > 0 && (
            <div className="space-y-12">
              <div className="text-center">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  Real-Time Trends
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Live sensor data trends for comprehensive environmental monitoring
                </p>
              </div>

              {/* Individual Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Humidity Chart */}
                <div className="group bg-white rounded-3xl shadow-xl border border-gray-200 hover:border-blue-300 hover:shadow-2xl transition-all duration-500 hover:scale-105 p-8">
                  <div className="flex items-center justify-center mb-8">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-4 shadow-lg group-hover:rotate-6 transition-transform">
                      <span className="text-2xl">💧</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      Humidity Trends
                    </h3>
                  </div>
                  <div className="h-72 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-transparent rounded-2xl"></div>
                    <Line data={humidityChartData} options={chartOptions} />
                  </div>
                </div>

                {/* Temperature Chart */}
                <div className="group bg-white rounded-3xl shadow-xl border border-gray-200 hover:border-orange-300 hover:shadow-2xl transition-all duration-500 hover:scale-105 p-8">
                  <div className="flex items-center justify-center mb-8">
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mr-4 shadow-lg group-hover:rotate-6 transition-transform">
                      <span className="text-2xl">🌡️</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      Temperature Trends
                    </h3>
                  </div>
                  <div className="h-72 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-50/30 to-transparent rounded-2xl"></div>
                    <Line data={temperatureChartData} options={chartOptions} />
                  </div>
                </div>

                {/* AQI Chart */}
                <div className="group bg-white rounded-3xl shadow-xl border border-gray-200 hover:border-red-300 hover:shadow-2xl transition-all duration-500 hover:scale-105 p-8">
                  <div className="flex items-center justify-center mb-8">
                    <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mr-4 shadow-lg group-hover:rotate-6 transition-transform">
                      <span className="text-2xl">🌬️</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      AQI Trends
                    </h3>
                  </div>
                  <div className="h-72 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-50/30 to-transparent rounded-2xl"></div>
                    <Line data={aqiChartData} options={chartOptions} />
                  </div>
                </div>
              </div>

              {/* Combined Chart */}
              <div className="group bg-white rounded-3xl shadow-xl border border-gray-200 hover:border-gray-300 hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] p-10">
                <div className="flex items-center justify-center mb-10">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-6 shadow-xl group-hover:rotate-12 transition-transform">
                    <span className="text-3xl">📊</span>
                  </div>
                  <h3 className="text-4xl font-bold text-gray-900">
                    Combined Sensor Data
                  </h3>
                </div>
                <div className="h-96 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 to-indigo-50/20 rounded-2xl"></div>
                  <Line
                    data={{
                      labels: historicalData.timestamps,
                      datasets: [
                        {
                          label: 'AQI',
                          data: historicalData.aqi,
                          borderColor: '#ef4444',
                          backgroundColor: 'rgba(239, 68, 68, 0.05)',
                          borderWidth: 4,
                          fill: false,
                          tension: 0.4,
                          yAxisID: 'y',
                          pointBackgroundColor: '#ef4444',
                          pointBorderColor: '#ffffff',
                          pointBorderWidth: 3,
                          pointRadius: 6,
                          pointHoverRadius: 10,
                          pointHoverBorderWidth: 4
                        },
                        {
                          label: 'Temperature (°C)',
                          data: historicalData.temperature,
                          borderColor: '#f97316',
                          backgroundColor: 'rgba(249, 115, 22, 0.05)',
                          borderWidth: 4,
                          fill: false,
                          tension: 0.4,
                          yAxisID: 'y1',
                          pointBackgroundColor: '#f97316',
                          pointBorderColor: '#ffffff',
                          pointBorderWidth: 3,
                          pointRadius: 6,
                          pointHoverRadius: 10,
                          pointHoverBorderWidth: 4
                        },
                        {
                          label: 'Humidity (%)',
                          data: historicalData.humidity,
                          borderColor: '#3b82f6',
                          backgroundColor: 'rgba(59, 130, 246, 0.05)',
                          borderWidth: 4,
                          fill: false,
                          tension: 0.4,
                          yAxisID: 'y2',
                          pointBackgroundColor: '#3b82f6',
                          pointBorderColor: '#ffffff',
                          pointBorderWidth: 3,
                          pointRadius: 6,
                          pointHoverRadius: 10,
                          pointHoverBorderWidth: 4
                        }
                      ]
                    }}
                    options={{
                      ...chartOptions,
                      scales: {
                        ...chartOptions.scales,
                        y: {
                          type: 'linear',
                          display: true,
                          position: 'left',
                          grid: { color: 'rgba(156, 163, 175, 0.15)' },
                          ticks: {
                            color: '#374151',
                            font: { family: 'Inter, system-ui, sans-serif' }
                          }
                        },
                        y1: {
                          type: 'linear',
                          display: true,
                          position: 'right',
                          grid: { drawOnChartArea: false },
                          ticks: {
                            color: '#374151',
                            font: { family: 'Inter, system-ui, sans-serif' }
                          }
                        },
                        y2: {
                          type: 'linear',
                          display: true,
                          position: 'right',
                          grid: { drawOnChartArea: false },
                          ticks: {
                            color: '#374151',
                            font: { family: 'Inter, system-ui, sans-serif' }
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {AQILegend}
        </div>

        {/* Footer Info */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 hover:shadow-2xl transition-all duration-300">
            <div className="flex flex-col lg:flex-row items-center justify-center space-y-6 lg:space-y-0 lg:space-x-8">
              {/* Connection Status */}
              <div className="inline-flex items-center px-8 py-4 bg-gray-50 rounded-full border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300">
                <div
                  className={`w-3 h-3 rounded-full mr-4 ${connectionStatus === "connected"
                    ? "bg-green-500 animate-pulse"
                    : connectionStatus === "connecting"
                      ? "bg-yellow-500 animate-spin"
                      : "bg-red-500"
                    }`}
                />
                <span className="text-gray-700 font-bold text-lg">
                  {connectionStatusDisplay.text}
                </span>
              </div>

              {/* Refresh Button */}
              <button
                onClick={fetchInitialData}
                disabled={connectionStatus === "connecting"}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-bold text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <span>🔄 Refresh Data</span>
              </button>

              {/* Last Update Info */}
              {lastUpdate && (
                <div className="inline-flex items-center px-8 py-4 bg-gray-50 rounded-full border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300">
                  <span className="text-gray-700 font-bold text-lg">Last: {lastUpdate}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out;
        }

        .chart-container {
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }
      `}</style>
    </div>
  );
}

export default Dashboard