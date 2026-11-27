// Service, pricing and research-track content shared by the home page and
// the B.Tech / M.Tech / PhD landing pages, so prices and wording stay in step.

export const services = [
  {
    label: 'Catalog projects',
    title: 'Start from a tested project',
    description:
      'Pick a project from our catalog and customise it to your requirement, with source code, report, PPT, and viva preparation for mini and major projects.',
  },
  {
    label: 'Custom-built projects',
    title: 'Built around your requirement',
    description:
      'Custom domain selection, unique feature combinations, and an implementation you can explain and defend in your final-year evaluation.',
  },
  {
    label: 'Guidance-only mentorship',
    title: 'Coach the student to build it',
    description:
      'Idea validation, documentation support, review checkpoints, and mentoring while the student writes the code.',
  },
]

export const researchStages = [
  'Problem selection',
  'Literature review',
  'Experiment design',
  'Paper mentoring',
  'Journal selection',
  'Thesis preparation',
]

export const projectTiers = [
  {
    tier: 'Basic',
    price: '₹1,500 – ₹3,000',
    scope: 'Simple CRUD apps, basic ML models, and standard documentation.',
    bestFor: 'B.Tech mini projects',
  },
  {
    tier: 'Standard',
    price: '₹4,000 – ₹8,000',
    scope: 'Real datasets, functional UI, deployment-ready build, PPT and report.',
    bestFor: 'B.Tech major projects',
  },
  {
    tier: 'Premium',
    price: '₹10,000 – ₹30,000+',
    scope: 'Research-oriented systems, paper mentoring, similarity check, and viva prep.',
    bestFor: 'M.Tech thesis projects',
  },
]

export const addOns = [
  ['Similarity check report', '₹300 – ₹600'],
  ['Video demo / code walkthrough for viva', '₹500 – ₹1,000'],
  ['1-on-1 viva prep / mock defense session', '₹500 – ₹1,500'],
  ['Research paper mentoring (per paper)', '₹3,000 – ₹8,000'],
  ['Journal selection & submission guidance', '₹5,000 – ₹15,000'],
  ['Rush delivery (under 5 days)', '+20% of base price'],
]
