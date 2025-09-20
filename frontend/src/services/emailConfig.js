// Email Configuration
// This file contains email service configuration for the contact form

export const EMAIL_CONFIG = {
    // Primary email address where contact form messages are sent
    CONTACT_EMAIL: 'aeztrix5@gmail.com',
    
    // Email service configuration (for future integration)
    SERVICE: {
        // For development - currently using simulation
        type: 'simulation', // 'simulation', 'smtp', 'sendgrid', 'nodemailer'
        
        // SMTP Configuration (uncomment when ready to use real email)
        // smtp: {
        //     host: 'smtp.gmail.com',
        //     port: 587,
        //     secure: false,
        //     auth: {
        //         user: 'aeztrix5@gmail.com',
        //         pass: 'your-app-password' 
        //     }
        // },
        
        // SendGrid Configuration (alternative)
        // sendgrid: {
        //     apiKey: 'your-sendgrid-api-key',
        //     from: 'aeztrix5@gmail.com'
        // }
    },
    
    // Email templates
    TEMPLATES: {
        contactForm: {
            subject: 'New Contact Form Submission - Aeztrix AI',
            html: (data) => `
                <h2>New Contact Form Submission</h2>
                <p><strong>Name:</strong> ${data.name}</p>
                <p><strong>Email:</strong> ${data.email}</p>
                <p><strong>Message:</strong></p>
                <p>${data.message}</p>
                <hr>
                <p><em>Sent from Aeztrix AI Contact Form</em></p>
            `,
            text: (data) => `
                New Contact Form Submission
                
                Name: ${data.name}
                Email: ${data.email}
                Message: ${data.message}
                
                Sent from Aeztrix AI Contact Form
            `
        },
        
        autoReply: {
            subject: 'Thank you for contacting Aeztrix AI',
            html: (data) => `
                <h2>Thank you for contacting Aeztrix AI!</h2>
                <p>Hi ${data.name},</p>
                <p>We've received your message and will get back to you within 24 hours.</p>
                <p>Your message:</p>
                <blockquote>${data.message}</blockquote>
                <p>Best regards,<br>The Aeztrix AI Team</p>
            `,
            text: (data) => `
                Thank you for contacting Aeztrix AI!
                
                Hi ${data.name},
                
                We've received your message and will get back to you within 24 hours.
                
                Your message:
                ${data.message}
                
                Best regards,
                The Aeztrix AI Team
            `
        }
    },
    
    // Email validation
    VALIDATION: {
        emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        maxMessageLength: 2000,
        maxNameLength: 100
    }
};

// Helper function to validate email
export const validateEmail = (email) => {
    return EMAIL_CONFIG.VALIDATION.emailRegex.test(email);
};

// Helper function to validate contact form data
export const validateContactForm = (data) => {
    const errors = [];
    
    if (!data.name || data.name.trim().length === 0) {
        errors.push('Name is required');
    } else if (data.name.length > EMAIL_CONFIG.VALIDATION.maxNameLength) {
        errors.push(`Name must be less than ${EMAIL_CONFIG.VALIDATION.maxNameLength} characters`);
    }
    
    if (!data.email || data.email.trim().length === 0) {
        errors.push('Email is required');
    } else if (!validateEmail(data.email)) {
        errors.push('Please enter a valid email address');
    }
    
    if (!data.message || data.message.trim().length === 0) {
        errors.push('Message is required');
    } else if (data.message.length > EMAIL_CONFIG.VALIDATION.maxMessageLength) {
        errors.push(`Message must be less than ${EMAIL_CONFIG.VALIDATION.maxMessageLength} characters`);
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
};
