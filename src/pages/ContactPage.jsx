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
              <a href="tel:+910000000000">+91 00000 00000</a>
            </span>
          </div>
          <div className="info-list-item">
            <strong>Address</strong>
            <span>
              Your Street, Area,
              <br />
              City, Andhra Pradesh, 000000
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
  )
}