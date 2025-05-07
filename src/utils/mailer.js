const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'jn.gokulkrishna@gmail.com', // <-- Replace with your Gmail address
    pass: 'trtj pyki zyqx jwsi'           // <-- Your Gmail app password, no spaces
  }
});

// Verify connection
transporter.verify(function(error, success) {
  if (error) {
    console.error('SMTP connection error:', error);
  } else {
    console.log('SMTP server is ready to take our messages');
  }
});

// Email templates
const templates = {
  requestApproved: (request) => ({
    subject: 'Blood Request Approved',
    text: `Your blood request has been approved.\n\nDetails:\nPatient: ${request.patientName}\nBlood Group: ${request.bloodGroup}\nQuantity: ${request.quantity} units\nHospital: ${request.hospitalName}\n\nPlease visit the hospital to complete the process.`
  }),
  requestRejected: (request) => ({
    subject: 'Blood Request Rejected',
    text: `Your blood request has been rejected.\n\nDetails:\nPatient: ${request.patientName}\nBlood Group: ${request.bloodGroup}\nQuantity: ${request.quantity} units\nHospital: ${request.hospitalName}\n\nPlease contact the blood bank for more information.`
  }),
  donationRecorded: (data) => ({
    subject: 'Blood Donation Recorded',
    text: `Your blood donation has been recorded.\n\nDetails:\nBlood Group: ${data.donation.bloodGroup}\nQuantity: ${data.donation.quantity} units\nDate: ${new Date(data.donation.date).toLocaleDateString()}\n\nThank you for your donation!`
  }),
  passwordReset: (data) => ({
    subject: 'Password Reset Request',
    text: `You requested a password reset.\n\nClick the link below to reset your password:\n${data.resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, please ignore this email.`
  }),
  passwordResetConfirmation: () => ({
    subject: 'Your Password Has Been Reset',
    text: `This is a confirmation that your password has been successfully reset.\n\nIf you did not perform this action, please contact our support team immediately at support@bloodbank.com or call +1-800-555-1234.`
  })
};

// Send email function
const sendMail = async (to, templateName, data) => {
  try {
    console.log('Attempting to send email:', { to, templateName });

    if (!to || !templateName || !data) {
      console.error('Missing required parameters for email:', { to, templateName, data });
      return false;
    }

    const template = templates[templateName];
    if (!template) {
      console.error('Invalid email template:', templateName);
      return false;
    }

    const emailContent = template(data);
    console.log('Email content prepared:', { subject: emailContent.subject });

    const mailOptions = {
      from: {
        name: 'Blood Bank Management System',
        address: 'your-real-gmail@gmail.com' // <-- Replace with your Gmail address
      },
    to,
      subject: emailContent.subject,
      text: emailContent.text
    };

    console.log('Sending email with options:', { 
      to: mailOptions.to, 
      subject: mailOptions.subject
    });

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      command: error.command
    });
    return false;
  }
};

module.exports = { sendMail, templates }; 