import { Link } from 'react-router-dom'
import {
  ArrowRightIcon,
  ChatIcon,
  CheckIcon,
  ChevronDownIcon,
  CodeIcon,
  PhoneIcon,
  ReportIcon,
  SlidesIcon,
  WhatsAppIcon,
} from '../components/Icons.jsx'
import { InquiryForm } from '../components/InquiryForm.jsx'
import { useDocumentMeta } from '../hooks/useDocumentMeta.js'
import { PAGE_META } from '../lib/pageMeta.js'
import { trackContactClick } from '../lib/analytics.js'
import { BUSINESS, CONTACT, whatsappUrl } from '../lib/constants.js'
import { addOns, projectTiers, researchStages, services } from '../lib/siteContent.js'

const heroHighlights = [
  'Source code, report & PPT',
  'Viva preparation',
  '48 hr catalog customisation',
  '3–4 project variations per batch',
]

const tracks = [
  {
    label: 'B.Tech CSE / IT',
    title: 'Mini and major projects',
    text: 'Working code, documentation, and viva preparation for 3rd and 4th year students.',
    price: (
      <>
        From <strong>₹1,500</strong>
      </>
    ),
    linkText: 'B.Tech projects',
    to: PAGE_META.btech.path,
  },
  {
    label: 'M.Tech CSE',
    title: 'Thesis-level projects',
    text: 'Project guidance, research paper mentoring, and journal selection support.',
    price: (
      <>
        From <strong>₹10,000</strong>
      </>
    ),
    linkText: 'M.Tech projects',
    to: PAGE_META.mtech.path,
  },
  {
    label: 'PhD scholars',
    title: 'Research guidance',
    text: 'Problem selection, literature review, experiment design, publication mentoring, and thesis formatting.',
    price: <>Quote based on scope</>,
    linkText: 'Research guidance',
    to: PAGE_META.phd.path,
  },
]

const kit = [
  [CodeIcon, 'Source code', 'A working implementation you can run and explain.'],
  [ReportIcon, 'Project report', 'Documentation for your submission.'],
  [SlidesIcon, 'PPT', 'Slides for your project reviews.'],
  [ChatIcon, 'Viva preparation', 'Practice explaining and defending your work.'],
]

const steps = [
  ['Share your requirement', 'Degree, topic or catalog pick, and timeline — by form or WhatsApp.'],
  ['Pick your level of help', 'Catalog, custom-built, or guidance-only.'],
  ['Build with checkpoints', 'Working code, reviewed with you along the way.'],
  ['Report & PPT', 'Documentation prepared alongside the build.'],
  ['Viva preparation', 'Practice explaining and defending your work.'],
]

const faqs = [
  [
    'What do I get with a project?',
    'Catalog projects come with source code, a project report, a PPT, and viva preparation. The pricing tiers and add-ons show what each level covers.',
  ],
  [
    'How quickly can you deliver?',
    'Customising a catalog project can take as little as 48 hours. Rush delivery in under 5 days is +20% of the base price.',
  ],
  [
    'Will my batchmates get the same project?',
    'We recommend 3–4 unique project variations for every batch.',
  ],
  [
    'Can I build it myself with guidance?',
    'Yes. Guidance-only mentorship covers idea validation, documentation support, and review checkpoints while you write the code.',
  ],
  [
    'Do you support PhD scholars?',
    'Yes — research problem selection, literature review, experiment design, publication mentoring, and thesis formatting. Pricing depends on scope, so send us an inquiry for a quote.',
  ],
  [
    'How do I get started?',
    `Send the inquiry form or message us on WhatsApp, ${BUSINESS.hoursLong}.`,
  ],
]

export function HomePage() {
  useDocumentMeta(PAGE_META.home)

  return (
    <div className="home">
      <section className="bleed home-hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow eyebrow-mark">B.Tech · M.Tech · PhD — CSE mentorship, Kakinada</p>
            <h1>CSE projects and research you can explain and defend.</h1>
            <p className="hero-lead">
              Catalog, custom-built, and guided projects with documentation,
              PPT, and viva preparation — plus research and publication
              mentoring for M.Tech and PhD scholars.
            </p>
            <ul className="check-list">
              {heroHighlights.map((item) => (
                <li key={item}>
                  <CheckIcon />
                  {item}
                </li>
              ))}
            </ul>
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
                <PhoneIcon />
                {CONTACT.phoneDisplay}
              </a>
            </div>
          </div>

          <div className="form-card">
            <div className="form-card-heading">
              <h2>Request mentorship</h2>
              <p className="muted">Share your degree, topic or catalog choice, and timeline.</p>
            </div>
            <InquiryForm variant="compact" />
          </div>
        </div>
      </section>

      <section className="home-section">
        <h2 className="section-heading">Choose your track</h2>
        <div className="card-grid card-grid-3">
          {tracks.map((track) => (
            <Link className="track-card" to={track.to} key={track.label}>
              <span className="card-label">{track.label}</span>
              <span className="track-title">{track.title}</span>
              <span className="muted">{track.text}</span>
              <span className="track-footer">
                <span>{track.price}</span>
                <span className="track-link">
                  {track.linkText} <ArrowRightIcon size={16} />
                </span>
              </span>
            </Link>
          ))}
        </div>
        <p className="muted">
          Colleges and coordinators: batch-level coordination and B2B tie-up
          opportunities — <Link className="text-link" to="/contact">talk to us</Link>.
        </p>
      </section>

      <section className="home-section" id="kit">
        <div className="section-intro">
          <h2 className="section-heading">What&apos;s in your project kit</h2>
          <p className="muted">Catalog projects come with:</p>
        </div>
        <div className="card-grid card-grid-4">
          {kit.map(([KitIcon, title, text]) => (
            <div className="card kit-card" key={title}>
              <span className="icon-tile">
                <KitIcon size={22} />
              </span>
              <h3>{title}</h3>
              <p className="muted">{text}</p>
            </div>
          ))}
        </div>
        <p>
          Prefer to write the code yourself? Choose <strong>guidance-only</strong>{' '}
          mentorship — idea validation, documentation support, and review
          checkpoints.
        </p>
      </section>

      <section className="home-section" id="how">
        <div className="section-intro">
          <h2 className="section-heading">How it works</h2>
          <p className="muted">Five steps from your first message to viva day.</p>
        </div>
        <ol className="steps">
          {steps.map(([title, text], index) => (
            <li key={title}>
              <span className="step-number">{String(index + 1).padStart(2, '0')}</span>
              <strong>{title}</strong>
              <span className="muted">{text}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="home-section">
        <h2 className="section-heading">Pick how much help you want</h2>
        <div className="card-grid card-grid-3">
          {services.map((service) => (
            <article className="card" key={service.label}>
              <span className="card-label card-label-muted">{service.label}</span>
              <h3>{service.title}</h3>
              <p className="muted">{service.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bleed dark-band">
        <div className="container">
          <div className="band-heading">
            <div>
              <p className="eyebrow">M.Tech &amp; PhD research track</p>
              <h2 className="section-heading">Mentoring at every stage of your research</h2>
            </div>
            <Link className="button-outline-light" to="/inquire?degree=phd">
              Request PhD guidance
            </Link>
          </div>
          <ol className="stage-grid">
            {researchStages.map((stage, index) => (
              <li key={stage}>
                <span>Stage {index + 1}</span>
                <strong>{stage}</strong>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="home-section" id="pricing">
        <div className="section-intro">
          <h2 className="section-heading">Clear, published pricing</h2>
          <p className="muted">Starting ranges for each tier. Your quote depends on scope.</p>
        </div>
        <div className="card-grid card-grid-3">
          {projectTiers.map((tier) => (
            <article className="card price-card" key={tier.tier}>
              <h3 className="card-label card-label-muted">{tier.tier}</h3>
              <p className="price">{tier.price}</p>
              <p>{tier.scope}</p>
              <p className="price-best">
                Best for <strong>{tier.bestFor}</strong>
              </p>
            </article>
          ))}
        </div>
        <div className="addon-section">
          <h3>Add-on services</h3>
          <ul className="addon-list">
            {addOns.map(([service, price]) => (
              <li key={service}>
                <span>{service}</span>
                <strong>{price}</strong>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="home-section faq-layout" id="faq">
        <div className="section-intro">
          <h2 className="section-heading">Questions students ask</h2>
          <p className="muted">
            Something else?{' '}
            <a
              className="text-link"
              href={whatsappUrl()}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackContactClick('whatsapp')}
            >
              Message us on WhatsApp
            </a>
            .
          </p>
        </div>
        <div className="faq-list">
          {faqs.map(([question, answer], index) => (
            <details key={question} open={index === 0}>
              <summary>
                {question}
                <ChevronDownIcon />
              </summary>
              <p className="muted">{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="bleed accent-band">
        <div className="container band-heading">
          <div>
            <h2 className="section-heading">Tell us what you need.</h2>
            <p>Share your project choice or research topic, timeline, and requirement.</p>
          </div>
          <div className="actions-row">
            <Link className="button-light" to="/inquire">
              Request mentorship
            </Link>
            <a
              className="button-outline-light"
              href={whatsappUrl()}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackContactClick('whatsapp')}
            >
              <WhatsAppIcon />
              WhatsApp us
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
