import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRightIcon,
  CheckIcon,
  ChevronDownIcon,
  PhoneIcon,
  WhatsAppIcon,
} from '../components/Icons.jsx'
import { InquiryForm } from '../components/InquiryForm.jsx'
import { useDocumentMeta } from '../hooks/useDocumentMeta.js'
import { trackContactClick } from '../lib/analytics.js'
import { BUSINESS, CONTACT, PROJECT_PACKAGES, whatsappUrl } from '../lib/constants.js'
import { useInitialData } from '../lib/initialData.js'
import { LANDING_PAGE_KEYS, PAGE_META } from '../lib/pageMeta.js'
import { supabase } from '../lib/supabase.js'
import { addOns, projectTiers, researchStages, services } from '../lib/siteContent.js'

const pickAddOns = (...names) => addOns.filter(([name]) => names.includes(name))
const pickTiers = (...names) => projectTiers.filter((tier) => names.includes(tier.tier))

const locationAnswer = `We're in ${BUSINESS.addressLine1} ${BUSINESS.addressLine2}, open ${BUSINESS.hoursLong}. You can also start on WhatsApp or with the form on this page.`

// One entry per landing page. Titles and descriptions live in pageMeta.js;
// everything here is page content. Keep prices in step with siteContent.js.
const LANDING_PAGES = {
  btech: {
    degree: 'btech',
    eyebrow: 'B.Tech CSE / IT projects · Kakinada',
    heading: 'B.Tech final year projects you can explain in your viva.',
    lead: 'Mini and major projects for 3rd and 4th year CSE and IT students. Start from a tested project in our catalog, get one built around your requirement, or build it yourself with our guidance.',
    highlights: PROJECT_PACKAGES.btech.included,
    formHeading: 'Ask about your B.Tech project',
    showServices: true,
    catalogHeading: 'B.Tech projects in our catalog',
    tiers: pickTiers('Basic', 'Standard'),
    pricingNote: PROJECT_PACKAGES.btech.priceNote,
    addOns: pickAddOns(
      'Similarity check report',
      'Video demo / code walkthrough for viva',
      '1-on-1 viva prep / mock defense session',
      'Rush delivery (under 5 days)',
    ),
    faqs: [
      [
        'Do you do both mini and major projects?',
        'Yes. Mini projects start from ₹1,500, and major projects are ₹4,000 – ₹8,000. Your quote depends on scope.',
      ],
      [
        'What do I get with a project?',
        'Catalog and custom-built projects come with working source code, a project report, a PPT for your reviews, and viva preparation.',
      ],
      [
        'How quickly can I get my project?',
        'Customising a catalog project can take as little as 48 hours. Rush delivery in under 5 days is +20% of the base price.',
      ],
      [
        'Will my batchmates get the same project?',
        'We recommend 3–4 unique project variations for every batch.',
      ],
      [
        'Can I bring my own topic?',
        'Yes. Describe your topic in the form on this page, or choose "My own topic" on the full inquiry form.',
      ],
      [
        'Can I build it myself with guidance?',
        'Yes. Guidance-only mentorship covers idea validation, documentation support, and review checkpoints while you write the code.',
      ],
      ['Where are you located?', locationAnswer],
    ],
  },
  mtech: {
    degree: 'mtech',
    eyebrow: 'M.Tech CSE projects · Kakinada',
    heading: 'M.Tech CSE projects and thesis guidance.',
    lead: 'Research-oriented implementations for your M.Tech thesis, with research paper mentoring, journal selection support, thesis documentation, and viva preparation.',
    highlights: PROJECT_PACKAGES.mtech.included,
    formHeading: 'Ask about your M.Tech project',
    showServices: true,
    showResearchStages: true,
    catalogHeading: 'M.Tech projects in our catalog',
    tiers: pickTiers('Premium'),
    pricingNote: PROJECT_PACKAGES.mtech.priceNote,
    addOns: pickAddOns(
      'Research paper mentoring (per paper)',
      'Journal selection & submission guidance',
      '1-on-1 viva prep / mock defense session',
      'Rush delivery (under 5 days)',
    ),
    faqs: [
      [
        'What does an M.Tech project include?',
        'A research-oriented implementation you can explain, thesis documentation and PPT, research paper mentoring, a similarity check, and viva preparation.',
      ],
      [
        'Do you help with research papers and journals?',
        'Yes. Research paper mentoring is ₹3,000 – ₹8,000 per paper, and journal selection and submission guidance is ₹5,000 – ₹15,000.',
      ],
      [
        'Can I work on my own research topic?',
        'Yes. Describe your topic and timeline in the form on this page and we will suggest how to take it forward.',
      ],
      [
        'How much does an M.Tech project cost?',
        'Thesis-level projects are ₹10,000 – ₹30,000+, depending on scope.',
      ],
      ['Where are you located?', locationAnswer],
    ],
  },
  phd: {
    degree: 'phd',
    eyebrow: 'PhD research guidance · Computer science',
    heading: 'Research guidance for CSE PhD scholars.',
    lead: 'Support at the stage you need it — from choosing a research problem to publishing papers and preparing your thesis.',
    highlights: [
      'Research problem selection',
      'Literature review and experiment design',
      'Paper mentoring and journal selection',
      'Thesis preparation and formatting',
    ],
    formHeading: 'Request research guidance',
    formNote: 'Share your research area, current stage, and timeline.',
    stageDetails: [
      ['Problem selection', 'Narrow your area down to a focused research problem you can pursue in your timeline.'],
      ['Literature review', 'Find and organise the key work in your area and identify the gap your research addresses.'],
      ['Experiment design', 'Plan datasets, baselines, and evaluation so your results hold up to review.'],
      ['Paper mentoring', 'Feedback on the structure and writing of each paper and how you present your results.'],
      ['Journal selection', 'Choose suitable journals for your work and get guidance through submission.'],
      ['Thesis preparation', 'Structure and formatting of your thesis.'],
    ],
    pricingNote: 'PhD guidance is quoted based on scope. Send us your research area and stage for a quote.',
    addOns: pickAddOns(
      'Research paper mentoring (per paper)',
      'Journal selection & submission guidance',
      'Similarity check report',
    ),
    faqs: [
      [
        'Which stage of my PhD can you help with?',
        'Any of them: problem selection, literature review, experiment design, paper mentoring, journal selection, and thesis preparation. Many scholars come to us for one stage.',
      ],
      [
        'How is pricing decided?',
        'PhD guidance is quoted based on scope. Research paper mentoring is ₹3,000 – ₹8,000 per paper, and journal selection and submission guidance is ₹5,000 – ₹15,000.',
      ],
      [
        'How do I get started?',
        'Send the form on this page with your research area, current stage, and timeline, or message us on WhatsApp.',
      ],
      ['Where are you located?', locationAnswer],
    ],
  },
}

function WhatsAppButton({ className = 'button-whatsapp' }) {
  return (
    <a
      className={className}
      href={whatsappUrl()}
      target="_blank"
      rel="noreferrer"
      onClick={() => trackContactClick('whatsapp')}
    >
      <WhatsAppIcon />
      WhatsApp us
    </a>
  )
}

// Catalog projects for one degree. Starts from the copy baked into the page
// at build time (so crawlers see the list), then loads the live catalog.
function useDegreeProjects(degree) {
  const initialCatalog = useInitialData('catalog')
  const [projects, setProjects] = useState(() =>
    (initialCatalog ?? []).filter((project) => project.degree_level === degree),
  )

  useEffect(() => {
    if (!supabase) {
      return undefined
    }
    let alive = true
    supabase
      .from('projects')
      .select('id,title,degree_level,domain,abstract')
      .eq('is_active', true)
      .eq('degree_level', degree)
      .order('created_at', { ascending: false })
      .order('title')
      .then(({ data, error }) => {
        if (alive && !error && data) {
          setProjects(data)
        }
      })
    return () => {
      alive = false
    }
  }, [degree])

  return projects
}

function CatalogProjects({ degree, heading }) {
  const projects = useDegreeProjects(degree)
  if (!projects.length) {
    return null
  }

  return (
    <section className="home-section">
      <div className="section-intro">
        <h2 className="section-heading">{heading}</h2>
        <p className="muted">
          Every catalog project can be tailored to your requirement, with
          documentation and viva support.
        </p>
      </div>
      <div className="card-grid card-grid-3">
        {projects.map((project) => (
          <article className="card catalog-card" key={project.id}>
            {project.domain ? (
              <span className="card-label card-label-muted">{project.domain}</span>
            ) : null}
            <h3 className="card-title">
              <Link className="text-link" to={`/project/${project.id}`}>
                {project.title}
              </Link>
            </h3>
            {project.abstract ? <p className="muted">{project.abstract}</p> : null}
          </article>
        ))}
      </div>
      <Link className="text-link" to="/catalog">
        See the full catalog <ArrowRightIcon size={16} />
      </Link>
    </section>
  )
}

export function LandingPage({ pageKey }) {
  const page = LANDING_PAGES[pageKey]
  const meta = PAGE_META[pageKey]
  useDocumentMeta(meta)

  const otherPages = LANDING_PAGE_KEYS.filter((key) => key !== pageKey)

  return (
    <div className="home">
      <section className="bleed home-hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow eyebrow-mark">{page.eyebrow}</p>
            <h1>{page.heading}</h1>
            <p className="hero-lead">{page.lead}</p>
            <ul className="check-list">
              {page.highlights.map((item) => (
                <li key={item}>
                  <CheckIcon />
                  {item}
                </li>
              ))}
            </ul>
            <div className="actions-row">
              <WhatsAppButton />
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
              <h2>{page.formHeading}</h2>
              <p className="muted">
                {page.formNote ?? 'Share your topic or catalog choice, and your timeline.'}
              </p>
            </div>
            <InquiryForm variant="compact" initialDegree={page.degree} />
          </div>
        </div>
      </section>

      {page.showServices ? (
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
      ) : null}

      {page.stageDetails ? (
        <section className="home-section">
          <div className="section-intro">
            <h2 className="section-heading">Guidance at every stage of your PhD</h2>
            <p className="muted">Come to us for one stage or for the whole journey.</p>
          </div>
          <div className="card-grid card-grid-3">
            {page.stageDetails.map(([title, text], index) => (
              <article className="card" key={title}>
                <span className="card-label card-label-muted">Stage {index + 1}</span>
                <h3>{title}</h3>
                <p className="muted">{text}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {page.showResearchStages ? (
        <section className="bleed dark-band">
          <div className="container">
            <div className="band-heading">
              <div>
                <p className="eyebrow">Research track</p>
                <h2 className="section-heading">Mentoring at every stage of your research</h2>
              </div>
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
      ) : null}

      {page.catalogHeading ? (
        <CatalogProjects degree={page.degree} heading={page.catalogHeading} />
      ) : null}

      <section className="home-section">
        <div className="section-intro">
          <h2 className="section-heading">Pricing</h2>
          <p className="muted">{page.pricingNote}</p>
        </div>
        {page.tiers?.length ? (
          <div className="card-grid card-grid-3">
            {page.tiers.map((tier) => (
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
        ) : null}
        <div className="addon-section">
          <h3>Add-on services</h3>
          <ul className="addon-list">
            {page.addOns.map(([service, price]) => (
              <li key={service}>
                <span>{service}</span>
                <strong>{price}</strong>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="home-section faq-layout">
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
          {page.faqs.map(([question, answer], index) => (
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

      <nav className="home-section also-see" aria-label="Other services">
        <span className="muted">Also see</span>
        <ul>
          {otherPages.map((key) => (
            <li key={key}>
              <Link className="text-link" to={PAGE_META[key].path}>
                {PAGE_META[key].title} <ArrowRightIcon size={16} />
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <section className="bleed accent-band">
        <div className="container band-heading">
          <div>
            <h2 className="section-heading">Visit us in Kakinada, or start on WhatsApp.</h2>
            <p>
              {BUSINESS.addressLine1} {BUSINESS.addressLine2} · {BUSINESS.hoursShort}
            </p>
          </div>
          <div className="actions-row">
            <a
              className="button-light"
              href={BUSINESS.directionsUrl}
              target="_blank"
              rel="noreferrer"
            >
              Get directions
            </a>
            <WhatsAppButton className="button-outline-light" />
          </div>
        </div>
      </section>
    </div>
  )
}
