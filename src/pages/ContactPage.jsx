import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRightIcon, ClockIcon, MailIcon, PhoneIcon, WhatsAppIcon } from '../components/Icons.jsx'
import { useDocumentMeta } from '../hooks/useDocumentMeta.js'
import { trackContactClick } from '../lib/analytics.js'
import { BUSINESS, CONTACT, whatsappUrl } from '../lib/constants.js'

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
      'Get in touch with Vaishnavi Technologies for questions about pricing, process, or general B.Tech, M.Tech and PhD project mentorship enquiries.',
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

    const mailtoUrl = `mailto:${CONTACT.email}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(bodyLines.join('\n'))}`

    trackContactClick('email_form')
    window.location.href = mailtoUrl
    setSent(true)
  }

  return (
    <>
      <section className="split-layout">
        <div className="split-intro">
          <div className="intro-heading">
            <p className="eyebrow">Contact us</p>
            <h1 className="page-title">We&apos;d love to hear from you</h1>
            <p className="page-lead">
              Have a general question about our mentorship studio, pricing, or
              process? Reach out and we&apos;ll get back to you shortly. For
              project-specific requests, use the{' '}
              <Link className="text-link" to="/inquire">
                inquiry form
              </Link>{' '}
              instead.
            </p>
          </div>
          <div className="contact-tiles">
            <a
              className="contact-tile"
              href={`mailto:${CONTACT.email}`}
              onClick={() => trackContactClick('email')}
            >
              <span className="contact-tile-label">
                <MailIcon size={16} />
                Email
              </span>
              <strong>{CONTACT.email}</strong>
            </a>
            <a
              className="contact-tile"
              href={CONTACT.phoneHref}
              onClick={() => trackContactClick('phone')}
            >
              <span className="contact-tile-label">
                <PhoneIcon size={16} />
                Phone
              </span>
              <strong>{CONTACT.phoneDisplay}</strong>
            </a>
            <a
              className="contact-tile"
              href={whatsappUrl()}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackContactClick('whatsapp')}
            >
              <span className="contact-tile-label contact-tile-whatsapp">
                <WhatsAppIcon size={16} />
                WhatsApp
              </span>
              <strong>Chat with us</strong>
            </a>
            <div className="contact-tile">
              <span className="contact-tile-label">
                <ClockIcon size={16} />
                Hours
              </span>
              <strong>{BUSINESS.hoursShort}</strong>
            </div>
          </div>
        </div>

        <div className="form-card">
          <div className="form-card-heading">
            <h2>Send us a message</h2>
          </div>
          {sent ? (
            <div className="success-box" role="status">
              Your email app should have opened with your message pre-filled.
              If it didn&apos;t, email us directly at {CONTACT.email}.
            </div>
          ) : null}

          <form className="form-grid" onSubmit={onSubmit}>
            <div className="form-row-two">
              <label className="compact-field">
                Name
                <input
                  required
                  autoComplete="name"
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
                  autoComplete="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, email: event.target.value }))
                  }
                />
              </label>
            </div>
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
                rows={6}
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
            <button className="button-primary button-block" type="submit">
              Send message
            </button>
          </form>
        </div>
      </section>

      <section className="map-section">
        <div className="map-heading">
          <div>
            <h2 className="section-heading-sm">Find us</h2>
            <p className="muted">
              {BUSINESS.addressLine1} {BUSINESS.addressLine2}
            </p>
          </div>
          <a
            className="button-secondary"
            href={BUSINESS.directionsUrl}
            target="_blank"
            rel="noreferrer"
          >
            Get directions <ArrowRightIcon size={16} />
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
