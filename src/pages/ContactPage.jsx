import { useState } from 'react'
import { useDocumentMeta } from '../hooks/useDocumentMeta.js'

const initialForm = {
  name: '',
  email: '',
  subject: '',
  message: '',
}

export function ContactPage() {
  useDocumentMeta({
    title: 'Contact Us',
    description:
      'Get in touch with Vaishnavi Technologies for questions about pricing, process, or general B.Tech/M.Tech project mentorship enquiries.',
    path: '/contact',
  })
  const [form, setForm] = useState(initialForm)
  const [sent, setSent] = useState(false)

  const onSubmit = (event) => {
    event.preventDefault()

    const subject = form.subject.trim() || 'Website enquiry'
    const bodyLines = [
      `Name: ${form.name.trim()}`,
      `Email: ${form.email.trim()}`,
      '',
      form.message.trim(),
    ]

    const mailtoUrl = `mailto:hello@vaishnavitech.in?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(bodyLines.join('\n'))}`

    window.location.href = mailtoUrl
    setSent(true)
  }

  return (
    <>
      <section className="split-layout">
        <aside className="info-panel">
          <p className="eyebrow">Contact Us</p>
          <h1>We&apos;d love to hear from you</h1>
          <p className="page-lead">
            Have a general question about our mentorship studio, pricing, or
            process? Reach out and we&apos;ll get back to you shortly. For
            project-specific requests, use the Inquire page instead.
          </p>
          <div className="info-list">
            <div className="info-list-item">
              <strong>Email</strong>
              <span>
                <a href="mailto:hello@vaishnavitech.in">
                  hello@vaishnavitech.in
                </a>
              </span>
            </div>
            <div className="info-list-item">
              <strong>Phone</strong>
              <span>
                <a href="tel:+919989572748">+91 99895 72748</a>
              </span>
            </div>
            <div className="info-list-item">
              <strong>Address</strong>
              <span>
                Cheediga,
                <br />
                Kakinada, Andhra Pradesh - 533006
              </span>
            </div>
            <div className="info-list-item">
              <strong>Hours</strong>
              <span>Monday – Saturday, 10:00 AM – 7:00 PM IST</span>
            </div>
          </div>
        </aside>

        <div className="form-wrap spotlight-panel">
          {sent ? (
            <div className="success-box">
              Your email app should have opened with your message pre-filled.
              If it didn&apos;t, email us directly at hello@vaishnavitech.in.
            </div>
          ) : null}

          <form className="form-grid" onSubmit={onSubmit}>
            <label className="compact-field">
              Name
              <input
                required
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
              />
            </label>
            <label className="compact-field">
              Email
              <input
                type="email"
                required
                value={form.email}
                onChange={(event) =>
                  setForm((current) => ({ ...current, email: event.target.value }))
                }
              />
            </label>
            <label className="compact-field">
              Subject
              <input
                value={form.subject}
                placeholder="What is this about?"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    subject: event.target.value,
                  }))
                }
              />
            </label>
            <label className="compact-field">
              Message
              <textarea
                required
                placeholder="Tell us how we can help."
                value={form.message}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    message: event.target.value,
                  }))
                }
              />
            </label>
            <button className="button-primary" type="submit">
              Send Message
            </button>
          </form>
        </div>
      </section>

      <section className="map-section">
        <div className="map-heading">
          <div>
            <p className="eyebrow">Find Us</p>
            <h2>Our location</h2>
            <p className="muted">Cheediga, Kakinada, Andhra Pradesh - 533006</p>
          </div>
          <a
            className="button-secondary"
            href="https://www.google.com/maps/dir/?api=1&destination=16.9635634%2C82.206259"
            target="_blank"
            rel="noreferrer"
          >
            Get Directions
          </a>
        </div>
        <div className="map-frame">
          <iframe
            title="Vaishnavi Technologies location in Chidiga, Kakinada"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3816.2232923684887!2d82.206259!3d16.963563399999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a3787c55fc0eb31%3A0x548730d3373dda95!2sVaishnavi%20Technologies!5e0!3m2!1sen!2sin!4v1795032807185!5m2!1sen!2sin"
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      </section>
    </>
  )
}