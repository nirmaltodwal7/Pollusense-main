import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Shield, Zap, Bell, Radio, Brain, Target, ArrowRight, MapPin, Clock, TrendingUp } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const [counters, setCounters] = useState({
    cities: 0,
    accuracy: 0,
    sensors: 0
  });

  const handleStartTracking = () => {
    navigate('/dashboard');
  };

  // Animated counter effect
  useEffect(() => {
    const animateCounters = () => {
      const targets = { cities: 50, accuracy: 99, sensors: 1000 };
      const duration = 2000;
      const steps = 60;
      const interval = duration / steps;

      let step = 0;
      const timer = setInterval(() => {
        step++;
        const progress = step / steps;
        const easeOut = 1 - Math.pow(1 - progress, 3);

        setCounters({
          cities: Math.floor(targets.cities * easeOut),
          accuracy: Math.floor(targets.accuracy * easeOut),
          sensors: Math.floor(targets.sensors * easeOut)
        });

        if (step >= steps) {
          clearInterval(timer);
          setCounters(targets);
        }
      }, interval);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          animateCounters();
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    const element = document.getElementById('impact-section');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  // Floating particles animation
  const Particles = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-blue-300 rounded-full opacity-30 animate-pulse"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${3 + Math.random() * 2}s`
          }}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden bg-white">
        <Particles />

        {/* Subtle background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50" />

        <div className="relative z-10 text-center max-w-5xl mx-auto">
          <div className="animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              AI-Powered
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Air Quality
              </span>
              <span className="block">Monitoring</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Real-time air pollution tracking with predictive analytics.
              Monitor, predict, and protect your environment with cutting-edge AI technology.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button 
                onClick={handleStartTracking}
                className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
              >
                Start Monitoring
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button className="px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300">
                View Demo
              </button>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </section>

      {/* Impact Numbers Section */}
      <section id="impact-section" className="py-20 px-6 bg-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Real Impact, Real Results
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our AI system is already making a difference across the globe
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-gray-200 hover:border-blue-300 hover:shadow-2xl transition-all duration-300 group">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                {counters.cities}+
              </div>
              <div className="text-gray-600 font-semibold">Cities Monitored</div>
              <div className="text-sm text-gray-500 mt-2">Real-time data collection</div>
            </div>

            <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-gray-200 hover:border-green-300 hover:shadow-2xl transition-all duration-300 group">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Target className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                {counters.accuracy}%
              </div>
              <div className="text-gray-600 font-semibold">Prediction Accuracy</div>
              <div className="text-sm text-gray-500 mt-2">AI-powered forecasting</div>
            </div>

            <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-gray-200 hover:border-purple-300 hover:shadow-2xl transition-all duration-300 group">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                24/7
              </div>
              <div className="text-gray-600 font-semibold">Continuous Tracking</div>
              <div className="text-sm text-gray-500 mt-2">Never miss a beat</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our advanced AI system processes real-time data to deliver accurate predictions
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="relative group">
              <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:rotate-12 transition-transform">
                  <Radio className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">IoT Sensors</h3>
                <p className="text-gray-600 text-sm">
                  Deploy smart sensors across the city to collect real-time air quality data
                </p>
              </div>

              {/* Connector line */}
              <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-blue-300 to-transparent" />
            </div>

            {/* Step 2 */}
            <div className="relative group">
              <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-gray-200 hover:border-purple-300 hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:rotate-12 transition-transform">
                  <Brain className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">AI Processing</h3>
                <p className="text-gray-600 text-sm">
                  Advanced machine learning algorithms analyze patterns and trends
                </p>
              </div>

              <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-purple-300 to-transparent" />
            </div>

            {/* Step 3 */}
            <div className="relative group">
              <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-gray-200 hover:border-green-300 hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:rotate-12 transition-transform">
                  <TrendingUp className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Predictions</h3>
                <p className="text-gray-600 text-sm">
                  Generate accurate forecasts and pollution trend predictions
                </p>
              </div>

              <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-green-300 to-transparent" />
            </div>

            {/* Step 4 */}
            <div className="relative group">
              <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-gray-200 hover:border-orange-300 hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:rotate-12 transition-transform">
                  <Bell className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Alerts</h3>
                <p className="text-gray-600 text-sm">
                  Receive instant notifications when air quality changes
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Advanced Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powered by cutting-edge technology for maximum accuracy and reliability
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 bg-white rounded-2xl shadow-lg border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 group hover:transform hover:scale-105">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform">
                <Activity className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Real-Time Monitoring</h3>
              <p className="text-gray-600">
                Continuous data collection from our network of IoT sensors provides up-to-the-minute air quality readings.
              </p>
            </div>

            <div className="p-8 bg-white rounded-2xl shadow-lg border border-gray-200 hover:border-purple-300 hover:shadow-xl transition-all duration-300 group hover:transform hover:scale-105">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Predictive Analytics</h3>
              <p className="text-gray-600">
                Machine learning algorithms predict future air quality trends with 99% accuracy for proactive planning.
              </p>
            </div>

            <div className="p-8 bg-white rounded-2xl shadow-lg border border-gray-200 hover:border-green-300 hover:shadow-xl transition-all duration-300 group hover:transform hover:scale-105">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Health Protection</h3>
              <p className="text-gray-600">
                Intelligent alerts and recommendations help protect your health from harmful air pollution levels.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl shadow-xl border border-gray-200 p-12 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-100/30 via-indigo-100/30 to-cyan-100/30" />

            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Ready to Breathe Easier?
              </h2>

              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Join thousands of users who trust our AI-powered system to monitor and predict air quality in their area.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button 
                  onClick={handleStartTracking}
                  className="group px-10 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center gap-3"
                >
                  <Activity className="w-6 h-6" />
                  Start Tracking Now
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <button className="px-10 py-5 border-2 border-gray-300 text-gray-700 font-bold text-lg rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300">
                  Learn More
                </button>
              </div>

              <div className="mt-8 flex justify-center items-center gap-8 text-gray-500">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  <span>Secure & Private</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  <span>Instant Setup</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  <span>24/7 Support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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
      `}</style>
    </div>
  );
};

export default Home;