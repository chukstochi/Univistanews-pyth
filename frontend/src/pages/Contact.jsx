import { useState } from "react";
import Layout from "../components/Layout";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    // NOTE: This is a front-end placeholder. Wire this up to a real
    // /api/contact backend route + email service when you're ready.
    setSubmitted(true);
  }

  return (
    <Layout showTicker={false}>
      <div className="static-page">
        <h1>Contact Us</h1>
        <p>Have a tip, question, or partnership inquiry? Send us a message.</p>

        {submitted ? (
          <p className="success-msg">Thanks for reaching out — our team will get back to you shortly.</p>
        ) : (
          <form onSubmit={handleSubmit} style={{ maxWidth: 480 }}>
            <div className="form-field">
              <label htmlFor="name">Name</label>
              <input id="name" type="text" required />
            </div>
            <div className="form-field">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" required />
            </div>
            <div className="form-field">
              <label htmlFor="message">Message</label>
              <textarea id="message" required></textarea>
            </div>
            <button type="submit" className="btn">Send Message</button>
          </form>
        )}
      </div>
    </Layout>
  );
}
