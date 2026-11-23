import { Link } from 'react-router-dom'
import { HoneypotField, PhoneField } from '../components/FormFields.jsx'
import { ArrowRightIcon, ClockIcon, MailIcon, PhoneIcon, WhatsAppIcon } from '../components/Icons.jsx'
import { useContactForm } from '../hooks/useContactForm.js'
import { useDocumentMeta } from '../hooks/useDocumentMeta.js'
import { PAGE_META } from '../lib/pageMeta.js'
import { trackContactClick } from '../lib/analytics.js'
import { BUSINESS, CONTACT, whatsappUrl } from '../lib/constants.js'

export function ContactPage() {
  useDocumentMeta(PAGE_META.contact)
  const { form, updateField, submitting, error, success, onSubmit } = useContactForm()

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
          {error ? (
            <div className="error-box" role="alert">
              {error}
            </div>
          ) : null}
          {success ? (
            <div className="success-box" role="status">
              Thanks, your message was sent. We&apos;ll reply to you by email
              soon. For a faster reply,{' '}
              <a
                href={whatsappUrl()}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackContactClick('whatsapp')}
              >
                message us on WhatsApp
              </a>
              .
            </div>
          ) : null}

          <form className="form-grid" onSubmit={onSubmit}>
            <div className="form-row-two">
              <label className="compact-field">
                Name
                <input
                  required
                  minLength={2}
                  maxLength={120}
                  autoComplete="name"
                  value={form.name}
                  onChange={updateField('name')}
                />
              </label>
              <label className="compact-field">
                Email
                <input
                  type="email"
                  required
                  maxLength={254}
                  autoComplete="email"
                  value={form.email}
                  onChange={updateField('email')}
                />
              </label>
            </div>
            <div className="form-row-two">
              <PhoneField value={form.phone} onChange={updateField('phone')} />
              <label className="compact-field">
                <span>
                  Subject <span className="optional">(optional)</span>
                </span>
                <input
                  maxLength={150}
                  value={form.subject}
                  placeholder="What is this about?"
                  onChange={updateField('subject')}
                />
              </label>
            </div>
            <HoneypotField value={form.website} onChange={updateField('website')} />
            <label className="compact-field">
              Message
              <textarea
                required
                maxLength={5000}
                rows={6}
                placeholder="Tell us how we can help."
                value={form.message}
                onChange={updateField('message')}
              />
            </label>
            <button className="button-primary button-block" type="submit" disabled={submitting}>
              {submitting ? 'Sending...' : 'Send message'}
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
            title="Vaishnavi Technologies location in Cheediga, Kakinada"
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
