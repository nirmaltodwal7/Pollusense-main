import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Linkedin, Twitter, Github, Wind, Leaf, CheckCircle, AlertCircle } from 'lucide-react';

const Footer = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null); // 'success', 'error', or null
  
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const socialIconVariants = {
    hover: {
      scale: 1.2,
      rotate: 5,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  };

  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Map', path: '/map' },
    { name: 'Contact', path: '/contact' }
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setSubscriptionStatus('error');
      return;
    }

    setIsSubmitting(true);
    setSubscriptionStatus(null);

    try {
      const response = await fetch('https://pollusense.onrender.com/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        setSubscriptionStatus('success');
        setEmail('');
      } else {
        setSubscriptionStatus('error');
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      setSubscriptionStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };



  const socialLinks = [
    { Icon: Linkedin, href: '#', name: 'LinkedIn' },
    { Icon: Twitter, href: '#', name: 'Twitter' },
    { Icon: Github, href: '#', name: 'GitHub' }
  ];

  return (
    <motion.footer
      className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 text-gray-800 relative overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(56,189,248,0.2),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(34,197,94,0.2),transparent_50%)]"></div>

      <div className="relative max-w-7xl mx-auto px-6 py-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">

          {/* Brand Section */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="relative">
                <Wind className="w-8 h-8 text-blue-400" />
                <Leaf className="w-4 h-4 text-green-400 absolute -top-1 -right-1" />
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Pollusense
              </h3>
            </div>
            <p className="text-gray-600 text-lg leading-relaxed mb-4 max-w-md">
              AI-powered Air Quality Prediction for a Cleaner Tomorrow
            </p>
            <p className="text-gray-500 text-sm leading-relaxed max-w-lg">
              Empowering communities with real-time air quality insights and predictive analytics
              to make informed decisions for healthier living environments.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants}>
            <h4 className="text-lg font-semibold mb-4 text-blue-700">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={() => handleNavigation(link.path)}
                    className="text-gray-600 hover:text-blue-600 transition-colors duration-300 text-sm hover:translate-x-1 inline-block transform cursor-pointer"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>


        </div>

        {/* Newsletter Section - Prominently Featured */}
        <motion.div
          variants={itemVariants}
          className="border-t border-slate-700/50 pt-8 mb-8"
        >
          <div className="bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-green-600/10 rounded-2xl p-8 border border-blue-500/20 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-green-500/5"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-400/10 to-transparent rounded-full translate-y-12 -translate-x-12"></div>
            
            <div className="relative z-10">
              <div className="text-center mb-8">
                <h3 className="text-2xl md:text-3xl font-bold text-black mb-3">
                  Stay Ahead of Air Quality
                </h3>
                <p className="text-black text-lg max-w-2xl mx-auto">
                  Get exclusive insights, health alerts, and environmental updates delivered directly to your inbox
                </p>
              </div>

              <div className="max-w-md mx-auto">
                <form onSubmit={handleNewsletterSubmit} className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="flex-1 px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-black placeholder-black/60 focus:outline-none focus:border-blue-400/50 focus:bg-white/15 transition-all duration-300 backdrop-blur-sm"
                      disabled={isSubmitting}
                    />
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="px-8 py-4 bg-gradient-to-r from-blue-500 to-green-500 text-white font-bold rounded-xl hover:from-blue-600 hover:to-green-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
                    >
                      {isSubmitting ? 'Subscribing...' : 'Subscribe Now'}
                    </button>
                  </div>
                  
                  {/* Status Messages */}
                  {subscriptionStatus === 'success' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-center space-x-2 text-black text-sm bg-green-500/10 border border-green-500/20 rounded-lg p-3"
                    >
                      <CheckCircle className="w-5 h-5" />
                      <span>Successfully subscribed! Check your email for confirmation.</span>
                    </motion.div>
                  )}
                  
                  {subscriptionStatus === 'error' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-center space-x-2 text-black text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3"
                    >
                      <AlertCircle className="w-5 h-5" />
                      <span>Subscription failed. Please try again.</span>
                    </motion.div>
                  )}
                </form>

                <div className="mt-4 text-center">
                  <p className="text-black text-sm">
                    Join 10,000+ subscribers • No spam, unsubscribe anytime
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Social Media Section */}
        <motion.div
          variants={itemVariants}
          className="border-t border-slate-700/50 pt-8 mb-8"
        >
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div>
              <h4 className="text-lg font-semibold mb-4 text-blue-300">Connect With Us</h4>
              <div className="flex space-x-4">
                {socialLinks.map(({ Icon, href, name }, index) => (
                  <motion.a
                    key={index}
                    href={href}
                    className="group relative p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-blue-400/50 transition-all duration-300"
                    variants={socialIconVariants}
                    whileHover="hover"
                    aria-label={name}
                  >
                    <Icon className="w-5 h-5 text-slate-400 group-hover:text-blue-400 transition-colors duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-green-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </motion.a>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Copyright Section */}
        <motion.div
          variants={itemVariants}
          className="border-t border-slate-700/50 pt-6"
        >
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="text-slate-400 text-sm">
              © 2025 AirVision. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors duration-300">
                Privacy Policy
              </a>
              <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors duration-300">
                Terms of Service
              </a>
              <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors duration-300">
                Cookie Policy
              </a>
            </div>
          </div>
        </motion.div>

        {/* Decorative Elements */}
        <div className="absolute top-4 right-4 opacity-10">
          <Wind className="w-32 h-32 text-blue-400" />
        </div>
        <div className="absolute bottom-4 left-4 opacity-10">
          <Leaf className="w-24 h-24 text-green-400" />
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;