import { Link } from 'react-router-dom'

const services = [
  {
    label: 'Ready-made projects',
    title: 'Fast delivery with light customization',
    description:
      'Pre-built academic projects with source code, report, PPT, and quicker turnaround for mini and major submissions.',
  },
  {
    label: 'Custom-built projects',
    title: 'Built to the student requirement',
    description:
      'Custom domain selection, unique feature combinations, and defensible implementations for final-year evaluation.',
  },
  {
    label: 'Guidance-only mentorship',
    title: 'Coach the student to build it',
    description:
      'Idea validation, documentation support, review checkpoints, and mentoring while the student writes the code.',
  },
  {
    label: 'M.Tech publication support',
    title: 'Research, paper writing, and journal help',
    description:
      'Thesis-oriented project execution with paper drafting, plagiarism awareness, and publication assistance.',
  },
]

const highlights = [
  ['48hr', 'Fast turnaround for ready-made project customization'],
  ['3-4', 'Unique project variations recommended for every batch'],
  ['Code + Docs', 'Source code, report, PPT, and viva support bundled'],
]

const projectTiers = [
  {
    tier: 'Basic',
    price: '₹1,500 - ₹3,000',
    scope: 'Simple CRUD apps, basic ML models, and standard documentation',
    bestFor: 'B.Tech mini projects',
  },
  {
    tier: 'Standard',
    price: '₹4,000 - ₹8,000',
    scope: 'Real datasets, functional UI, deployment-ready build, PPT and report',
    bestFor: 'B.Tech major projects',
  },
  {
    tier: 'Premium',
    price: '₹10,000 - ₹30,000+',
    scope: 'Research-oriented systems, paper writing, plagiarism report, and viva prep',
    bestFor: 'M.Tech thesis projects',
  },
]

const addOns = [
  ['Plagiarism report (Turnitin-style)', '₹300 - ₹600'],
  ['Video demo / code walkthrough for viva', '₹500 - ₹1,000'],
  ['1-on-1 viva prep / mock defense session', '₹500 - ₹1,500'],
  ['Research paper writing (per paper)', '₹3,000 - ₹8,000'],
  ['Journal publication assistance', '₹5,000 - ₹15,000'],
  ['Rush delivery (under 5 days)', '+20% of base price'],
]

export function HomePage() {
  return (
    <>
      <section className="hero hero-grid">
        <div>
          <span className="hero-badge">
            B.Tech &amp; M.Tech CSE Project Development Studio
          </span>
          <h1>Vaishnavi Technologies</h1>
          <p>
            Ready-made, custom-built, and guided academic projects with code,
            documentation, PPT, and viva support for engineering students and
            project coordinators.
          </p>
          <div className="actions-row">
            <Link className="button-primary" to="/catalog">
              Browse Project Catalog
            </Link>
            <Link className="button-secondary" to="/inquire">
              Request Mentorship
            </Link>
          </div>
        </div>
        <aside className="hero-side-card">
          <p className="eyebrow">Why students choose us</p>
          <div className="stats-grid">
            {highlights.map(([value, label]) => (
              <div className="stat-card" key={value}>
                <strong>{value}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <h2 className="section-title">Services Offered</h2>
      <section className="grid">
        {services.map((service) => (
          <article className="card elevated-card" key={service.label}>
            <span className="pill">{service.label}</span>
            <h3>{service.title}</h3>
            <p className="muted">{service.description}</p>
          </article>
        ))}
      </section>

      <h2 className="section-title">Who We Serve</h2>
      <section className="grid">
        <article className="card elevated-card">
          <h3>B.Tech CSE / IT students</h3>
          <p className="muted">
            Mini and major project delivery for 3rd and 4th year students who
            need working, documented, defendable submissions.
          </p>
        </article>
        <article className="card elevated-card">
          <h3>M.Tech CSE students</h3>
          <p className="muted">
            Thesis-level project support with research paper drafting and journal
            publication guidance.
          </p>
        </article>
        <article className="card elevated-card">
          <h3>Colleges and coordinators</h3>
          <p className="muted">
            Batch-level coordination and B2B tie-up opportunities for academic
            project support.
          </p>
        </article>
      </section>

      <h2 className="section-title">Project Pricing</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Tier</th>
              <th>Price Range</th>
              <th>Scope</th>
              <th>Best For</th>
            </tr>
          </thead>
          <tbody>
            {projectTiers.map((tier) => (
              <tr key={tier.tier}>
                <td>
                  <strong>{tier.tier}</strong>
                </td>
                <td>{tier.price}</td>
                <td>{tier.scope}</td>
                <td>{tier.bestFor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="section-title">Add-on Services</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Service</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {addOns.map(([service, price]) => (
              <tr key={service}>
                <td>{service}</td>
                <td>{price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
