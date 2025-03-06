import { useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import HeroSection from "../components/HeroSection";
import { AiOutlineLinkedin, AiOutlineSend } from "react-icons/ai";

export default function Contact() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    country: '',
    message: '',
    recaptchaToken: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responseMessage, setResponseMessage] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


  const handleRecaptchaChange = (value) => {
    setFormData({ ...formData, recaptchaToken: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.recaptchaToken) {
      setResponseMessage({ type: 'error', text: 'Please verify you are not a robot.' });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (response.ok) {
        setResponseMessage({ type: 'success', text: result.message });
        setFormData({ firstName: '', lastName: '', email: '', phone: '', company: '', country: '', message: '' });
      } else {
        setResponseMessage({ type: 'error', text: result.error });
      }
    } catch (error) {
      setResponseMessage({ type: 'error', text: 'Something went wrong, please try again later.' });
    }

    setIsSubmitting(false);
  };

  return (
    <div>
      <HeroSection
        title="Contact Us"
        subtitle="Build your Organization of Tomorrow."
        description="Book a free consultation today!"
        backgroundImage="/contact-hero.jpg"
      />

      <div className="max-w-7xl mx-auto px-4 py-4 md:py-20 grid md:grid-cols-2 gap-6 md:gap-12">
        <div className="card hover:scale-100 transition-transform transform">
          <h2 className="cardheading-styling">Book A Free Consultation</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col">
        <label htmlFor="firstName" className="body-styling">First name*</label>
        <input
          type="text"
          name="firstName"
          id="firstName"
          placeholder="First name*"
          className="form-input text-text-title"
          value={formData.firstName}
          onChange={handleChange}
          required
        />
        </div>

        <div className="flex flex-col">
        <label htmlFor="lastName" className="body-styling">Last name*</label>
        <input
          type="text"
          name="lastName"
          id="lastName"
          placeholder="Last name*"
          className="form-input text-text-title"
          value={formData.lastName}
          onChange={handleChange}
          required
        />
        </div>

        <div className="flex flex-col">
        <label htmlFor="email" className="body-styling">Business email*</label>
        <input
          type="email"
          name="email"
          id="email"
          placeholder="Business email*"
          className="form-input text-text-title"
          value={formData.email}
          onChange={handleChange}
          required
        />
        </div>

        <div className="flex flex-col">
        <label htmlFor="phone" className="body-styling">Phone Number*</label>
        <input
          type="tel"
          name="phone"
          id="phone"
          placeholder="Phone Number*"
          className="form-input text-text-title"
          value={formData.phone}
          onChange={handleChange}
          required
        />
        </div>

        <div className="flex flex-col">
        <label htmlFor="company" className="body-styling">Company*</label>
        <input
          type="text"
          name="company"
          id="company"
          placeholder="Company*"
          className="form-input text-text-title"
          value={formData.company}
          onChange={handleChange}
          required
        />
        </div>

        <div className="flex flex-col">
        <label htmlFor="country" className="body-styling">Select Country*</label>
        <select
          name="country"
          id="country"
          className="form-input text-text-title"
          value={formData.country}
          onChange={handleChange}
          required
        >
          <option value="">Select Country</option>
          <option value="Canada">Canada</option>
          <option value="USA">USA</option>
          <option value="Other">Other</option>
        </select>
        </div>

        <div className="flex flex-col">
        <label htmlFor="message" className="body-styling">Your message*</label>
        <textarea
          name="message"
          id="message"
          placeholder="Your message*"
          rows="4"
          className="form-input text-text-title"
          value={formData.message}
          onChange={handleChange}
          required
        ></textarea>
        </div>

        <ReCAPTCHA
          sitekey="6LdH59EqAAAAAFdRMqz4hB3R0LFTsgPYIan2azNA"
          onChange={handleRecaptchaChange}
        />

        <button type="submit" className="btn-primary flex items-center w-fit" disabled={isSubmitting}>
        {isSubmitting ? 'Sending...' : (
          <span className="flex items-center gap-x-2">
            <AiOutlineSend size={36} />
            SEND
          </span>
        )}
        </button>
      </form>


          {responseMessage && (
            <p className={`mt-4 ${responseMessage.type === 'success' ? 'text-[#93da83]' : 'text-[#d64e4e]'}`}>
              {responseMessage.text}
            </p>
          )}
        </div>

        <div className="card hover:scale-100 transition-transform transform">
          <h2 className="cardheading-styling">Get In Touch</h2>
          <p className="body-styling mb-2">
            <strong>Home Office</strong>
            <br />
            Toronto, Canada
          </p>
          <p className="body-styling mb-2">
            <strong>Email:</strong>
            <br />
            pake@pakepoint.com
          </p>
          <div className="mt-4">
            <a
              href="https://www.linkedin.com/in/pake-newell/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex text-button hover:text-button-hover transform transition duration-300"
            >
              <AiOutlineLinkedin size={48} />
            </a>
          </div>

          <div className="mt-6">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2881.6001479048855!2d-79.41267282381756!3d43.76039947109722!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x882b2d63f398fa7f%3A0xdeff4e9bd297c3f3!2sNorth%20York%2C%20ON%20M2N%200G5!5e0!3m2!1sen!2sca!4v1737487464569!5m2!1sen!2sca"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
}