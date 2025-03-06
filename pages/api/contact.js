import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { firstName, lastName, email, phone, company, country, message, recaptchaToken } = req.body;

    // Check if all required fields are provided
    if (!firstName || !lastName || !email || !message || !recaptchaToken) {
      return res.status(400).json({ error: 'Please fill in all required fields and complete the reCAPTCHA.' });
    }

    // Verify the reCAPTCHA token with Google's API
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;  // Store the reCAPTCHA secret key in your environment variables
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaToken}`;

    // Verify reCAPTCHA response
    const verifyResponse = await fetch(verifyUrl, { method: 'POST' });
    const verifyData = await verifyResponse.json();

    // If reCAPTCHA verification fails, return an error
    if (!verifyData.success) {
      return res.status(400).json({ error: 'reCAPTCHA verification failed. Please try again.' });
    }

    // Create Nodemailer transporter with Gmail SMTP settings
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
    });

    try {
      // Send the email
      await transporter.sendMail({
        from: `"Contact Form" <${process.env.EMAIL_USER}>`,
        to: 'pake@pakepoint.com',  // Change to the recipient email address
        subject: `New Contact Form Submission from ${firstName} ${lastName}`,
        text: `
          First Name: ${firstName}
          Last Name: ${lastName}
          Email: ${email}
          Phone: ${phone}
          Company: ${company}
          Country: ${country}
          Message: ${message}
        `,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>First Name:</strong> ${firstName}</p>
          <p><strong>Last Name:</strong> ${lastName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Company:</strong> ${company}</p>
          <p><strong>Country:</strong> ${country}</p>
          <p><strong>Message:</strong> ${message}</p>
        `,
      });

      // Return success response
      return res.status(200).json({ message: 'Your message has been sent successfully!' });
    } catch (error) {
      console.error('Error sending email:', error);
      return res.status(500).json({ error: 'Something went wrong. Please try again later.' });
    }
  } else {
    // Handle unsupported HTTP methods
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}