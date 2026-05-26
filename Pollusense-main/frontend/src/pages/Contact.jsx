import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, User, MessageSquare, Building, Globe, AlertCircle } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [focusedField, setFocusedField] = useState(null);
  const [animateElements, setAnimateElements] = useState(false);

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

  // Form animation on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimateElements(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear any previous errors when user starts typing
    if (submitError) setSubmitError(null);
  };

  const sendEmail = async (formData) => {
    try {
      const response = await fetch('https://pollusense.onrender.com/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        return { success: true, message: result.message };
      } else {
        return { success: false, error: result.message || 'Failed to send message' };
      }
    } catch (error) {
      console.error('Error sending contact form:', error);
      return { success: false, error: 'Network error. Please check your connection and try again.' };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Validate form
      if (!formData.name || !formData.email || !formData.phone || !formData.subject || !formData.message) {
        throw new Error('Please fill in all required fields');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Please enter a valid email address');
      }

      // Send email
      const result = await sendEmail(formData);

      if (result.success) {
        setIsSubmitted(true);
        // Reset form after 5 seconds
        setTimeout(() => {
          setIsSubmitted(false);
          setFormData({
            name: '',
            email: '',
            phone: '',
            company: '',
            subject: '',
            message: ''
          });
        }, 5000);
      } else {
        throw new Error(result.error || 'Failed to send message');
      }
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Phone,
      title: "Phone",
      details: ["+91 7307973865", "+91 8209949921"],
      gradientFrom: "from-green-500",
      gradientTo: "to-green-600",
      hoverBorder: "hover:border-green-300"
    },
    {
      icon: Mail,
      title: "Email",
      details: ["GreenGuardians45@gmail.com", "support@airquality.ai"],
      gradientFrom: "from-blue-500",
      gradientTo: "to-blue-600",
      hoverBorder: "hover:border-blue-300"
    },
    {
      icon: MapPin,
      title: "Address",
      details: ["Poornima College Of Engineering", "Sitapura , Jaipur , 302004"],
      gradientFrom: "from-purple-500",
      gradientTo: "to-purple-600",
      hoverBorder: "hover:border-purple-300"
    },
    {
      icon: Clock,
      title: "Business Hours",
      details: ["Mon - Fri: 9:00 AM - 6:00 PM", "Weekend: Emergency Only"],
      gradientFrom: "from-orange-500",
      gradientTo: "to-orange-600",
      hoverBorder: "hover:border-orange-300"
    }
  ];


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
        <div className="text-center mb-16">
          <div className={`inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-8 shadow-xl transition-all duration-700 ${animateElements ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <MessageSquare className="w-12 h-12 text-white" />
          </div>
          <h1 className={`text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight transition-all duration-700 ${animateElements ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            Get In
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Touch
            </span>
          </h1>
          <p className={`text-xl text-gray-600 font-medium max-w-3xl mx-auto leading-relaxed transition-all duration-700 ${animateElements ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            Ready to transform your air quality monitoring? Contact our team of experts and discover how our AI-powered solutions can benefit your organization.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16">
          {/* Contact Form */}
          <div className={`transition-all duration-700 ${animateElements ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-10 hover:shadow-3xl transition-all duration-500">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Send us a Message</h2>
                <p className="text-gray-600 text-lg">Fill out the form below and we'll get back to you within 24 hours.</p>
              </div>

              {/* Error Message */}
              {submitError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3 animate-fade-in">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-red-700 font-medium">{submitError}</p>
                </div>
              )}

              <div className="space-y-6">
                {/* Name Field */}
                <div className="relative group">
                  <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                    <User className="w-4 h-4 inline mr-2" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    required
                    className={`w-full px-6 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 transition-all duration-300 focus:outline-none focus:bg-white focus:border-blue-500 focus:shadow-lg ${focusedField === 'name' ? 'transform scale-105' : ''
                      }`}
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Email Field */}
                <div className="relative group">
                  <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    required
                    className={`w-full px-6 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 transition-all duration-300 focus:outline-none focus:bg-white focus:border-blue-500 focus:shadow-lg ${focusedField === 'email' ? 'transform scale-105' : ''
                      }`}
                    placeholder="Enter your email address"
                  />
                </div>

                {/* Phone Field */}
                <div className="relative group">
                  <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField('phone')}
                    onBlur={() => setFocusedField(null)}
                    required
                    className={`w-full px-6 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 transition-all duration-300 focus:outline-none focus:bg-white focus:border-blue-500 focus:shadow-lg ${focusedField === 'phone' ? 'transform scale-105' : ''
                      }`}
                    placeholder="Enter your phone number"
                  />
                </div>

                {/* Company Field */}
                <div className="relative group">
                  <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                    <Building className="w-4 h-4 inline mr-2" />
                    Company/Organization
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField('company')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full px-6 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 transition-all duration-300 focus:outline-none focus:bg-white focus:border-blue-500 focus:shadow-lg ${focusedField === 'company' ? 'transform scale-105' : ''
                      }`}
                    placeholder="Enter your company name"
                  />
                </div>

                {/* Subject Field */}
                <div className="relative group">
                  <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                    <Globe className="w-4 h-4 inline mr-2" />
                    Subject *
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField('subject')}
                    onBlur={() => setFocusedField(null)}
                    required
                    className={`w-full px-6 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 transition-all duration-300 focus:outline-none focus:bg-white focus:border-blue-500 focus:shadow-lg ${focusedField === 'subject' ? 'transform scale-105' : ''
                      }`}
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="schedule-call">📞 Schedule a Call</option>
                    <option value="demo">Request Demo</option>
                    <option value="pricing">Pricing Information</option>
                    <option value="support">Technical Support</option>
                    <option value="partnership">Partnership</option>
                    <option value="media">Media Inquiry</option>
                  </select>
                </div>

                {/* Message Field */}
                <div className="relative group">
                  <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                    <MessageSquare className="w-4 h-4 inline mr-2" />
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField('message')}
                    onBlur={() => setFocusedField(null)}
                    required
                    rows="6"
                    className={`w-full px-6 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 transition-all duration-300 focus:outline-none focus:bg-white focus:border-blue-500 focus:shadow-lg resize-none ${focusedField === 'message' ? 'transform scale-105' : ''
                      }`}
                    placeholder="Tell us about your project or inquiry..."
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting || isSubmitted}
                    className={`w-full group relative overflow-hidden px-8 py-5 rounded-xl font-bold text-lg transition-all duration-500 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 ${isSubmitted
                        ? 'bg-green-500 text-white cursor-default'
                        : isSubmitting
                          ? 'bg-gray-400 text-white cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl'
                      }`}
                  >
                    <div className="flex items-center justify-center space-x-3">
                      {isSubmitted ? (
                        <>
                          <CheckCircle className="w-6 h-6" />
                          <span>Message Sent Successfully!</span>
                        </>
                      ) : isSubmitting ? (
                        <>
                          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Sending Message...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                          <span>Send Message</span>
                        </>
                      )}
                    </div>
                  </button>
                </div>
              </div>

              {/* Success Message */}
              {isSubmitted && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center space-x-3 animate-fade-in">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <p className="text-green-700 font-medium">
                    Thank you! Your message has been sent successfully. We will get back to you within 24 hours.
                  </p>
                </div>
              )}
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* Contact Cards */}
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Contact Information</h2>

              {contactInfo.map((info, index) => (
                <div
                  key={index}
                  className={`group bg-white rounded-2xl shadow-xl border border-gray-200 ${info.hoverBorder} hover:shadow-2xl transition-all duration-500 hover:scale-105 p-8 ${animateElements ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                  style={{ transitionDelay: `${index * 200}ms` }}
                >
                  <div className="flex items-start space-x-6">
                    <div className={`w-14 h-14 bg-gradient-to-br ${info.gradientFrom} ${info.gradientTo} rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform`}>
                      <info.icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">{info.title}</h3>
                      {info.details.map((detail, idx) => (
                        <p key={idx} className="text-gray-600 text-lg font-medium mb-1">
                          {detail}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Office Locations */}

          </div>
        </div>

        {/* Call to Action */}
        <div className={`mt-20 text-center transition-all duration-700 ${animateElements ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-12 hover:shadow-3xl transition-all duration-500">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Ready to Get Started?</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Join hundreds of organizations already using our AI-powered air quality monitoring solutions to create healthier environments.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button 
                onClick={() => {
                  // Pre-fill the subject for scheduling a call
                  setFormData(prev => ({
                    ...prev,
                    subject: 'schedule-call'
                  }));
                  
                  // Scroll to the contact form
                  document.querySelector('form').scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'center'
                  });
                  
                  // Focus on the name field after scrolling
                  setTimeout(() => {
                    document.querySelector('input[name="name"]').focus();
                  }, 500);
                }}
                className="group px-10 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3"
              >
                <Phone className="w-6 h-6" />
                Schedule a Call
              </button>
              <button
                onClick={() => window.location.href = 'mailto:shivamsharma.it27@gmail.com?subject=Request%20Quote&body=Hi,%0A%0AI%20would%20like%20to%20request%20a%20quote%20for%20your%20AI-powered%20air%20quality%20monitoring%20solutions.%0A%0AThank%20you!'}
                className="group px-10 py-5 border-2 border-gray-300 text-gray-700 font-bold text-lg rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 flex items-center justify-center gap-3"
              >
                <Mail className="w-6 h-6" />
                Request Quote
              </button>
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
        
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out;
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        .shadow-3xl {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
      `}</style>
    </div>
  );
};

export default Contact;