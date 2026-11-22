import { useSearchParams } from 'react-router-dom'
import { WhatsAppIcon } from '../components/Icons.jsx'
import { InquiryForm } from '../components/InquiryForm.jsx'
import { useDocumentMeta } from '../hooks/useDocumentMeta.js'
import { trackContactClick } from '../lib/analytics.js'
import { BUSINESS, CONTACT, whatsappUrl } from '../lib/constants.js'

const requestTypes = [
  ['Catalog projects', 'Start from a tested project and customise it with us.'],
  ['Custom projects', 'For unique requirements, domain focus, and batch variation.'],
  ['Guided support', 'For students who want mentoring while building themselves.'],
  [
    'PhD research guidance',
    'Choose PhD as your degree and “My own topic” as the project, then describe your research area.',
  ],
]

export function InquirePage() {
  useDocumentMeta({
    title: 'Request Mentorship',
    description:
      'Submit your B.Tech, M.Tech or PhD project or research requirement and get matched with the right mentorship track: catalog, custom-built, or guided support.',
    path: '/inquire',
  })

  const [searchParams] = useSearchParams()

  return (
    <section className="split-layout">
      <div className="split-intro">
        <div className="intro-heading">
          <p className="eyebrow">Mentorship request</p>
          <h1 className="page-title">Tell us what you need</h1>
          <p className="page-lead">
            Share your project choice or research topic, timeline, and academic
            requirement. We use this form to understand the request before
            mentorship begins.
          </p>
        </div>
        <ul className="rule-list">
          {requestTypes.map(([title, text]) => (
            <li key={title}>
              <strong>{title}</strong>
              <span className="muted">{text}</span>
            </li>
          ))}
        </ul>
        <div className="talk-box">
          <strong>Prefer to talk first?</strong>
          <div className="actions-row">
            <a
              className="button-whatsapp"
              href={whatsappUrl()}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackContactClick('whatsapp')}
            >
              <WhatsAppIcon />
              WhatsApp us
            </a>
            <a
              className="phone-link"
              href={CONTACT.phoneHref}
              onClick={() => trackContactClick('phone')}
            >
              {CONTACT.phoneDisplay}
            </a>
          </div>
          <span className="muted">{BUSINESS.hoursShort}</span>
        </div>
      </div>

      <div className="form-card">
        <InquiryForm
          variant="full"
          initialDegree={searchParams.get('degree')}
          urlProjectId={searchParams.get('projectId') ?? ''}
        />
      </div>
    </section>
  )
}
