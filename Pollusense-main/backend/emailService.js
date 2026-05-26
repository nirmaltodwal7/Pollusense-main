// emailService.js
import nodemailer from 'nodemailer';
import { config } from './config.js';

class EmailService {
  constructor() {
    this.transporter = null;
    this.lastNotificationTime = null;
    this.isInitialized = false;
    this.init();
  }

  async init() {
    if (!config.email.enabled) {
      console.log('📧 Email notifications are disabled');
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: config.email.smtp.host,
        port: config.email.smtp.port,
        secure: config.email.smtp.secure,
        auth: config.email.smtp.auth
      });

      // Verify connection configuration
      await this.transporter.verify();
      this.isInitialized = true;
      console.log('📧 Email service initialized successfully');
    } catch (error) {
      console.error('❌ Email service initialization failed:', error.message);
      this.isInitialized = false;
    }
  }

  isNotificationAllowed(aqiValue) {
    if (!this.isInitialized || !config.email.enabled) {
      return false;
    }

    // Check if we have recipients configured
    if (!config.email.notification.recipients || config.email.notification.recipients.length === 0) {
      console.log('⚠️ No email recipients configured');
      return false;
    }

    // Send email every time AQI exceeds the threshold
    if (aqiValue > config.email.notification.threshold) {
      return true;
    }

    return false;
  }

  async sendAirQualityAlert(aqiData) {
    const { aqi } = aqiData;
    
    if (!this.isNotificationAllowed(aqi)) {
      return false;
    }

    try {
      const { category, color, temperature, humidity, timestamp } = aqiData;
      
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 2px solid #ff4444; border-radius: 10px; background-color: #fff5f5;">
          <h2 style="color: #ff4444; text-align: center; margin-bottom: 20px;">🚨 Air Quality Alert</h2>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #333; margin-top: 0;">Current Air Quality Index: <span style="color: ${color}; font-weight: bold; font-size: 1.2em;">${aqi}</span></h3>
            <p style="color: #666; font-size: 1.1em; margin: 10px 0;"><strong>Category:</strong> ${category}</p>
            <p style="color: #666; margin: 5px 0;"><strong>Temperature:</strong> ${temperature}°C</p>
            <p style="color: #666; margin: 5px 0;"><strong>Humidity:</strong> ${humidity}%</p>
            <p style="color: #666; margin: 5px 0;"><strong>Time:</strong> ${new Date(timestamp).toLocaleString()}</p>
          </div>
          
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin-bottom: 20px;">
            <h4 style="color: #856404; margin-top: 0;">⚠️ Health Recommendations:</h4>
            <ul style="color: #856404; margin: 0; padding-left: 20px;">
              <li>Limit outdoor activities</li>
              <li>Keep windows and doors closed</li>
              <li>Use air purifiers if available</li>
              <li>Monitor symptoms if you have respiratory conditions</li>
            </ul>
          </div>
          
          <div style="text-align: center; color: #666; font-size: 0.9em;">
            <p>This is an automated alert from your IoT Air Quality Monitoring System.</p>
            <p>Threshold: AQI > ${config.email.notification.threshold}</p>
          </div>
        </div>
      `;

      const mailOptions = {
        from: config.email.notification.from,
        to: config.email.notification.recipients.join(', '),
        subject: config.email.notification.subject,
        html: htmlContent
      };

      const result = await this.transporter.sendMail(mailOptions);
      this.lastNotificationTime = Date.now();
      
      console.log('📧 Air quality alert email sent successfully');
      console.log('📧 Recipients:', config.email.notification.recipients);
      console.log('📧 Message ID:', result.messageId);
      
      return true;
    } catch (error) {
      console.error('❌ Failed to send email notification:', error.message);
      return false;
    }
  }

  async testConnection() {
    if (!this.isInitialized) {
      console.log('❌ Email service not initialized');
      return false;
    }

    try {
      await this.transporter.verify();
      console.log('✅ Email service connection test successful');
      return true;
    } catch (error) {
      console.error('❌ Email service connection test failed:', error.message);
      return false;
    }
  }

  async sendContactFormEmail(contactData) {
    if (!this.isInitialized || !config.email.enabled) {
      console.log('❌ Email service not initialized or disabled');
      return false;
    }

    try {
      const { name, email, phone, company, subject, message } = contactData;
      
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 2px solid #3b82f6; border-radius: 10px; background-color: #f0f9ff;">
          <h2 style="color: #1e40af; text-align: center; margin-bottom: 20px;">📧 New Contact Form Submission</h2>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #333; margin-top: 0;">Contact Details</h3>
            <p style="color: #666; margin: 5px 0;"><strong>Name:</strong> ${name}</p>
            <p style="color: #666; marin: 5px 0;"><strong>Email:</strong> ${email}</p>
            <p style="color: #666; margin: 5px 0;"><strong>Phone:</strong> ${phone}</p>
            <p style="color: #666; margin: 5px 0;"><strong>Company:</strong> ${company}</p>
            <p style="color: #666; margin: 5px 0;"><strong>Subject:</strong> ${subject === 'schedule-call' ? 'Schedule a Call' : subject}</p>
            <p style="color: #666; margin: 5px 0;"><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <div style="background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 5px; padding: 15px; margin-bottom: 20px;">
            <h4 style="color: #0369a1; margin-top: 0;">Message:</h4>
            <p style="color: #333; margin: 0; line-height: 1.6; white-space: pre-wrap;">${message}</p>
          </div>
          
          <div style="text-align: center; color: #666; font-size: 0.9em;">
            <p>This is a contact form submission from your PolluSense website.</p>
            <p>Please respond to the user at: <a href="mailto:${email}" style="color: #3b82f6;">${email}</a></p>
          </div>
        </div>
      `;

      const mailOptions = {
        from: config.email.notification.from,
        to: 'greenguardians45@gmail.com', // Send contact form emails only to this specific email
        subject: `New Contact Form: ${subject}`,
        html: htmlContent,
        replyTo: email // Set reply-to header to the contact form email
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      console.log('📧 Contact form email sent successfully to sahilbagga297@gmail.com');
      console.log('📧 From:', name, `(${email})`);
      console.log('📧 Phone:', phone);
      console.log('📧 Subject:', subject);
      console.log('📧 Message ID:', result.messageId);
      
      return true;
    } catch (error) {
      console.error('❌ Failed to send contact form email:', error.message);
      return false;
    }
  }

  async sendNewsletterSubscription(newsletterData) {
    if (!this.isInitialized || !config.email.enabled) {
      console.log('❌ Email service not initialized or disabled');
      return false;
    }

    try {
      const { email } = newsletterData;
      
      // Send notification to Green Guardians team
      const teamNotificationHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 2px solid #10b981; border-radius: 10px; background-color: #f0fdf4;">
          <h2 style="color: #059669; text-align: center; margin-bottom: 20px;">📧 New Newsletter Subscription</h2>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #333; margin-top: 0;">Subscription Details</h3>
            <p style="color: #666; margin: 5px 0;"><strong>Email:</strong> ${email}</p>
            <p style="color: #666; margin: 5px 0;"><strong>Subscription Date:</strong> ${new Date().toLocaleString()}</p>
            <p style="color: #666; margin: 5px 0;"><strong>Source:</strong> PolluSense Website Footer</p>
          </div>
          
          <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 5px; padding: 15px; margin-bottom: 20px;">
            <h4 style="color: #047857; margin-top: 0;">Next Steps:</h4>
            <ul style="color: #047857; margin: 0; padding-left: 20px;">
              <li>Add this email to your newsletter mailing list</li>
              <li>Send a welcome email to the subscriber</li>
              <li>Include them in your next newsletter update</li>
            </ul>
          </div>
          
          <div style="text-align: center; color: #666; font-size: 0.9em;">
            <p>This is a newsletter subscription from your PolluSense website.</p>
            <p>Subscriber email: <a href="mailto:${email}" style="color: #10b981;">${email}</a></p>
          </div>
        </div>
      `;

      // Send confirmation email to subscriber
      const subscriberConfirmationHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 2px solid #3b82f6; border-radius: 10px; background-color: #f0f9ff;">
          <h2 style="color: #1e40af; text-align: center; margin-bottom: 20px;">🎉 Welcome to PolluSense Newsletter!</h2>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Thank you for subscribing to our newsletter! You'll now receive regular updates about:
            </p>
            <ul style="color: #666; margin: 15px 0; padding-left: 20px;">
              <li>Latest air quality insights and trends</li>
              <li>Environmental protection tips and recommendations</li>
              <li>New features and updates to our platform</li>
              <li>Important health alerts and safety information</li>
              <li>Community stories and environmental initiatives</li>
            </ul>
          </div>
          
          <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 5px; padding: 15px; margin-bottom: 20px;">
            <h4 style="color: #047857; margin-top: 0;">What's Next?</h4>
            <p style="color: #047857; margin: 0; line-height: 1.6;">
              We'll send you our first newsletter within the next few days. In the meantime, 
              feel free to explore our platform and start monitoring air quality in your area!
            </p>
          </div>
          
          <div style="text-align: center; margin-bottom: 20px;">
            <a href="https://pollusense.com" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #3b82f6, #10b981); color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Visit PolluSense Platform
            </a>
          </div>
          
          <div style="text-align: center; color: #666; font-size: 0.9em; border-top: 1px solid #e5e7eb; padding-top: 20px;">
            <p>Best regards,<br><strong>The PolluSense Team</strong></p>
            <p>If you didn't subscribe to this newsletter, please ignore this email.</p>
            <p>To unsubscribe, reply to this email with "UNSUBSCRIBE" in the subject line.</p>
          </div>
        </div>
      `;

      // Send notification to Green Guardians team
      const teamMailOptions = {
        from: config.email.notification.from,
        to: 'greenguardians45@gmail.com',
        subject: 'New Newsletter Subscription - PolluSense',
        html: teamNotificationHtml
      };

      // Send confirmation to subscriber
      const subscriberMailOptions = {
        from: config.email.notification.from,
        to: email,
        subject: 'Welcome to PolluSense Newsletter! 🎉',
        html: subscriberConfirmationHtml
      };

      // Send both emails
      const [teamResult, subscriberResult] = await Promise.all([
        this.transporter.sendMail(teamMailOptions),
        this.transporter.sendMail(subscriberMailOptions)
      ]);
      
      console.log('📧 Newsletter subscription processed successfully');
      console.log('📧 Team notification sent to greenguardians45@gmail.com');
      console.log('📧 Confirmation sent to subscriber:', email);
      console.log('📧 Team Message ID:', teamResult.messageId);
      console.log('📧 Subscriber Message ID:', subscriberResult.messageId);
      
      return true;
    } catch (error) {
      console.error('❌ Failed to process newsletter subscription:', error.message);
      return false;
    }
  }

  getStatus() {
    return {
      enabled: config.email.enabled,
      initialized: this.isInitialized,
      hasRecipients: config.email.notification.recipients && config.email.notification.recipients.length > 0,
      lastNotification: this.lastNotificationTime ? new Date(this.lastNotificationTime).toISOString() : null,
      threshold: config.email.notification.threshold,
      notificationMode: 'every-threshold-exceed' // Indicates new behavior
    };
  }
}

export default EmailService;
