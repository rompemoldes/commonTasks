import { config } from 'dotenv';
import { Resend } from 'resend';

// Load environment variables from .env file
config();

// Check if MAIL_API_KEY, SENDER, and RECEIVER are set
if (!process.env.MAIL_API_KEY) {
  throw new Error('MAIL_API_KEY is not defined in .env file');
}
if (!process.env.SENDER) {
  throw new Error('SENDER is not defined in .env file');
}
if (!process.env.RECEIVER) {
  throw new Error('RECEIVER is not defined in .env file');
}

// debugger
console.log('MAIL_API_KEY: ', process.env.MAIL_API_KEY);

// Initialize Resend instance
const resend = new Resend(process.env.MAIL_API_KEY);

// Define email details
const emailDetails = {
  from: `Me <${process.env.SENDER}>`,
  to: [process.env.RECEIVER],
  subject: 'You have something new waiting for you',
  html: '<p>You should try it!</p>',
};

// debugger
console.log('emailDetails: ', emailDetails);

async function sendEmail() {
  // Send email
  try {
    const response = await resend.emails.send(emailDetails);

    const { data, error } = response;

    // debugger
    console.log('response: ', response);
    if (error) {
      return console.error('Email could not be sent. Reason: ', { error });
    }
    console.log('Email sent successfully:', data);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

sendEmail();
