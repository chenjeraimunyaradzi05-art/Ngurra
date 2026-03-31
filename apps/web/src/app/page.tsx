import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Bot,
  Briefcase,
  Building2,
  Compass,
  DollarSign,
  GraduationCap,
  Home,
  Layers3,
  LineChart,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';

const heroPrimaryCtas = [
  { label: 'Get Started', href: '/signup', primary: true },
  { label: 'Explore Pathways', href: '/#pathways', primary: false },
];

const heroSecondaryCtas = [
  { label: "I'm Looking for Work", href: '/jobs' },
  { label: 'I Want to Learn', href: '/courses' },
  { label: "I'm Building a Business", href: '/business-suite' },
  { label: 'For Employers & Partners', href: '/company/setup' },
];

const pathwayStages = [
  'Opportunity discovery',
  'Readiness',
  'Application',
  'Support',
  'Retention',
  'Progression',
  'Independence',
];

const pathwayPillars = [
  {
    icon: Briefcase,
    title: 'Work',
    description: 'Discover jobs, career pathways, employer programs, and matched opportunities.',
  },
  {
    icon: GraduationCap,
    title: 'Learn',
    description: 'Build skills with structured pathways, credentials, and practical next steps.',
  },
  {
    icon: Users,
    title: 'Connect',
    description: 'Book mentors, join communities, and stay supported as you keep moving.',
  },
  {
    icon: DollarSign,
    title: 'Stabilise',
    description: 'Track money, find business tools, and access practical support for real life.',
  },
];

const productSuite = [
  {
    icon: Bot,
    title: 'Nexta AI',
    tagline: 'Personalised next steps, anytime.',
    description:
      'Guidance, planning, interview prep, resume help, readiness flows, and opportunity radar in one calm assistant.',
    bullets: ['AI concierge', 'Opportunity radar', 'Interview prep', 'Resume help'],
  },
  {
    icon: Building2,
    title: 'Nexta Business',
    tagline: 'From idea to income - with the right tools.',
    description:
      'Business setup guidance, templates, invoicing, cashbook support, documents, grants, and compliance-ready workflows.',
    bullets: ['Business setup guidance', 'Templates and documents', 'Invoicing and cashbook', 'Grants and resources'],
  },
  {
    icon: MessageSquare,
    title: 'Nexta Connect',
    tagline: 'Support that actually shows up.',
    description:
      'Mentor matching, booking, messaging, groups, events, and community touchpoints that keep people engaged.',
    bullets: ['Mentor matching', 'Bookings and chats', 'Groups and events', 'Community feed'],
  },
];

const optionalSubBrands = [
  'Nexta Learn',
  'Nexta Work',
  'Nexta Wallet',
  'Nexta Home',
  'Nexta Partners',
];

const partnerActions = [
  { label: 'Hire with Nexta', href: '/company/setup' },
  { label: 'Partner with Nexta', href: '/#partners' },
  { label: 'Run Programs on Nexta', href: '/government' },
];

const deckSlides = [
  { title: 'Slide 1 - Title', body: 'Nexta. The pathway platform for opportunity and economic progress.' },
  {
    title: 'Slide 2 - The Problem',
    body:
      'Opportunity is fragmented, people drop off after discovery, and organisations struggle to measure outcomes beyond views and applications.',
  },
  {
    title: 'Slide 3 - The Insight',
    body: "Progress isn't a moment - it's a pathway. Real outcomes happen when discovery, preparation, support, and growth stay connected.",
  },
  {
    title: 'Slide 4 - The Solution',
    body:
      'Nexta unifies discovery, readiness, application, support, retention, progression, and independence in one guided platform.',
  },
  {
    title: 'Slide 5 - Product Overview',
    body:
      'Jobs and career pathways, learning, mentors, community, AI guidance, business tools, financial wellbeing, housing and stability, plus employer and program dashboards.',
  },
  {
    title: 'Slide 6 - Why Now',
    body:
      'AI disruption, skills transitions, cost-of-living pressure, and partner demand for measurable outcomes make a connected platform timely.',
  },
  {
    title: 'Slide 7 - Who It Is For',
    body:
      'Individuals, mentors, employers, education providers, and government or enterprise partners running programs.',
  },
  {
    title: 'Slide 8 - Differentiation',
    body:
      'Pathway-based, whole-of-life support, ecosystem workflows, user agency, and AI focused on next steps instead of empty chat.',
  },
  {
    title: 'Slide 9 - Business Model',
    body:
      'Freemium consumer tools, employer seats and analytics, program deployments, outcome reporting, and verified marketplace services.',
  },
  {
    title: 'Slide 10 - Go To Market',
    body:
      'Start with jobs, learning, and guidance. Expand through employers, providers, and partners. Deepen retention with pathways, mentors, and community.',
  },
  {
    title: 'Slide 11 - Traction',
    body:
      'A flexible slide for shipped modules, active cohorts, partner pilots, engagement, retention, and case studies as you add real numbers.',
  },
  {
    title: 'Slide 12 - Roadmap',
    body:
      'Personalised pathways, stronger radar, marketplace expansion, procurement workflows, messaging, notifications, trust tooling, and analytics.',
  },
  {
    title: 'Slide 13 - Team',
    body:
      'Founder story, engineering and product capability, and advisors or domain partners as the team grows.',
  },
  {
    title: 'Slide 14 - The Ask',
    body:
      'Funding range, what it unlocks, phased milestones, and the contact path for investors and strategic partners.',
  },
];

const voicePillars = [
  'Clear - simple language and concrete next steps.',
  'Supportive - encouraging, never patronising.',
  'Respectful - user agency first, with privacy and control.',
  'Practical - tools, checklists, and outcomes over fluff.',
  'Optimistic - forward-focused and empowering without exaggeration.',
];

const toneContexts = [
  'Onboarding: welcoming, simple, and non-overwhelming.',
  'Guidance and AI: coach-like, structured, and actionable.',
  'Notifications: short, useful, and low-noise.',
  'Errors: calm, helpful, and never blaming.',
  'Enterprise and government: confident, measurable, and outcomes-driven.',
];

const wordsWeUse = [
  'Pathway',
  'Next step',
  'Progress',
  'Tools',
  'Guidance',
  'Stability',
  'Outcomes',
  'Verified',
  "You're in control",
];

const wordsWeAvoid = [
  'Hack',
  'Crush it',
  'Dominate',
  'Hustle',
  'Life-changing overnight',
  'Shame-based language',
];

const mobileFeatureChips = ['Jobs', 'Learning', 'Mentors', 'Community', 'Money Tools', 'Business'];

const quickActions = [
  'Find Opportunities',
  'Upgrade Skills',
  'Ask Nexta AI',
  'Book a Mentor',
  'Track Money',
  'Post / Connect',
];

const appStoreKeywords = [
  'jobs',
  'career',
  'learning',
  'mentor',
  'coaching',
  'skills',
  'training',
  'pathways',
  'finance',
  'budgeting',
  'business',
  'community',
  'opportunities',
  'AI assistant',
];

export default function HomePage() {
  return (
    <div className="space-y-16 pb-10">
      <section className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,#f8fafc_0%,#ecfeff_35%,#eff6ff_70%,#fff7ed_100%)] px-6 py-8 shadow-xl sm:px-8 lg:px-12 lg:py-12">
        <div className="absolute inset-y-0 right-0 hidden w-1/3 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.24),transparent_50%),radial-gradient(circle_at_bottom_right,rgba(249,115,22,0.18),transparent_45%)] lg:block" />
        <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white/80 px-4 py-2 text-sm font-semibold text-teal-800 shadow-sm">
              <Sparkles className="h-4 w-4" />
              Opportunity, connected. Progress, supported.
            </div>

            <div className="space-y-5">
              <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Nexta helps you take the next step &mdash; and the step after that.
              </h1>
              <p className="max-w-3xl text-lg leading-8 text-slate-700 sm:text-xl">
                Jobs, learning, mentors, community, business tools, financial wellbeing, and
                real-world opportunities &mdash; in one guided platform built for long-term
                progress.
              </p>
              <p className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
                <BadgeCheck className="h-4 w-4 text-emerald-300" />
                Personalised pathways. Practical tools. Real momentum.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {heroPrimaryCtas.map((cta) => (
                <Link
                  key={cta.label}
                  href={cta.href}
                  className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition-transform hover:-translate-y-0.5 ${
                    cta.primary
                      ? 'bg-slate-950 text-white shadow-lg shadow-slate-950/15'
                      : 'border border-slate-300 bg-white text-slate-900'
                  }`}
                >
                  {cta.label}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {heroSecondaryCtas.map((cta) => (
                <Link
                  key={cta.label}
                  href={cta.href}
                  className="rounded-2xl border border-slate-200 bg-white/85 px-4 py-4 text-sm font-semibold text-slate-800 shadow-sm transition-all hover:border-teal-300 hover:shadow-md"
                >
                  {cta.label}
                </Link>
              ))}
            </div>

            <p className="text-sm text-slate-600">
              Free to join. Your data stays yours. You control what you share.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              {partnerActions.map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700"
                >
                  {action.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-5 shadow-lg">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
                    Mobile Hero
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-950">
                    Nexta &mdash; your next step, in your pocket.
                  </h2>
                </div>
                <div className="rounded-2xl bg-slate-950 px-3 py-2 text-xs font-semibold text-white">
                  iOS + Android
                </div>
              </div>
              <p className="text-sm leading-7 text-slate-600">
                Discover opportunities, build skills, get guidance, and track your progress
                wherever you are.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {mobileFeatureChips.map((chip) => (
                  <span
                    key={chip}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
                  >
                    {chip}
                  </span>
                ))}
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white">
                  Download on the App Store
                </div>
                <div className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-900">
                  Get it on Google Play
                </div>
              </div>
            </div>

            <div className="rounded-[1.75rem] bg-slate-950 p-5 text-white shadow-xl">
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
                <LineChart className="h-4 w-4" />
                In-App Home
              </div>
              <h3 className="mt-3 text-2xl font-bold">
                Welcome back &mdash; ready for your next step?
              </h3>
              <div className="mt-5 rounded-2xl bg-white/10 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold">Continue your Pathway</span>
                  <span className="text-emerald-300">62%</span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-white/10">
                  <div className="h-2 w-[62%] rounded-full bg-gradient-to-r from-emerald-300 via-sky-300 to-orange-300" />
                </div>
                <p className="mt-3 text-sm text-slate-300">
                  You&apos;re 62% through this week&apos;s plan.
                </p>
              </div>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {quickActions.map((action) => (
                  <div
                    key={action}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm font-medium text-slate-100"
                  >
                    {action}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="pathways" className="space-y-8">
        <div className="max-w-3xl space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">
            Platform Pathways
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            The full pathway, not just a feature list.
          </h2>
          <p className="text-lg leading-8 text-slate-600">
            Nexta is built around real progress: helping people discover opportunities, prepare,
            apply, stay supported, remain stable, and keep growing.
          </p>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap gap-3">
            {pathwayStages.map((stage, index) => (
              <div
                key={stage}
                className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700"
              >
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-xs text-white">
                  {index + 1}
                </span>
                {stage}
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-4">
          {pathwayPillars.map((pillar) => (
            <div key={pillar.title} className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="inline-flex rounded-2xl bg-teal-50 p-3 text-teal-700">
                <pillar.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-xl font-bold text-slate-950">{pillar.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{pillar.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="suite" className="space-y-8">
        <div className="max-w-3xl space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">
            Product Suite
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Built as one platform, expressed as a clean suite.
          </h2>
          <p className="text-lg leading-8 text-slate-600">
            Start with the core brand, launch the highest-value modules first, and expand the
            system without breaking the story.
          </p>
        </div>

        <div className="grid gap-5 xl:grid-cols-3">
          {productSuite.map((product) => (
            <div
              key={product.title}
              className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="inline-flex rounded-2xl bg-slate-950 p-3 text-white">
                <product.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-2xl font-bold text-slate-950">{product.title}</h3>
              <p className="mt-2 text-sm font-semibold text-teal-700">{product.tagline}</p>
              <p className="mt-4 text-sm leading-7 text-slate-600">{product.description}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {product.bullets.map((bullet) => (
                  <span
                    key={bullet}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
                  >
                    {bullet}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-[2rem] border border-dashed border-slate-300 bg-slate-50 p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-950">Optional expansion sub-brands</h3>
              <p className="mt-2 text-sm text-slate-600">
                You do not need all of these at launch, but they stay consistent if the platform
                expands.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {optionalSubBrands.map((name) => (
                <span
                  key={name}
                  className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="partners" className="rounded-[2rem] border border-slate-200 bg-slate-950 px-6 py-8 text-white shadow-xl sm:px-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
              For Employers & Partners
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Partner workflows, outcome reporting, and trusted pathways for people and programs.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300">
              Nexta is designed for individuals, mentors, employers, training providers,
              governments, and enterprise partners who need fewer tools, clearer workflows, and
              better outcomes.
            </p>
          </div>

          <div className="grid gap-3">
            {partnerActions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
              >
                <span>{action.label}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="deck" className="space-y-8">
        <div className="max-w-3xl space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">
            Pitch Deck
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            A slide-by-slide investor and partner story, ready to refine.
          </h2>
          <p className="text-lg leading-8 text-slate-600">
            The homepage now carries the same narrative arc as the deck: problem, insight,
            solution, product, timing, differentiation, revenue, go-to-market, proof, roadmap,
            team, and ask.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {deckSlides.map((slide) => (
            <div key={slide.title} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-base font-bold text-slate-950">{slide.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{slide.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="voice" className="space-y-8">
        <div className="max-w-3xl space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">
            Brand Voice
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Calm, capable, and practical by default.
          </h2>
          <p className="text-lg leading-8 text-slate-600">
            Nexta should feel clear, respectful, and helpful. Not hype. Not judgement. Just
            tools, guidance, and momentum.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">
              <Compass className="h-4 w-4" />
              Voice Pillars
            </div>
            <div className="mt-5 space-y-3">
              {voicePillars.map((pillar) => (
                <div key={pillar} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                  {pillar}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">
              <ShieldCheck className="h-4 w-4" />
              Tone by Context
            </div>
            <div className="mt-5 space-y-3">
              {toneContexts.map((context) => (
                <div key={context} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                  {context}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">
              <Layers3 className="h-4 w-4" />
              Words We Use
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {wordsWeUse.map((word) => (
                <span
                  key={word}
                  className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800"
                >
                  {word}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">
              <ShieldCheck className="h-4 w-4" />
              Words We Avoid
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {wordsWeAvoid.map((word) => (
                <span
                  key={word}
                  className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700"
                >
                  {word}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-bold text-slate-950">Copy guidance</h3>
            <div className="mt-5 space-y-4 text-sm leading-7 text-slate-600">
              <p>
                <span className="font-semibold text-slate-900">Do:</span> Want to strengthen your
                resume? Here are 3 quick improvements you can do today.
              </p>
              <p>
                <span className="font-semibold text-slate-900">Do:</span> We help you move forward
                with clearer steps, better tools, and real support.
              </p>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-bold text-slate-950">Formatting rules</h3>
            <div className="mt-5 space-y-3 text-sm leading-7 text-slate-600">
              <p>Short sentences.</p>
              <p>Headings and scannable sections.</p>
              <p>Action verbs for CTAs.</p>
              <p>Always offer the next step at the end.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="storefront" className="space-y-8">
        <div className="max-w-3xl space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">
            App Store Copy
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Storefront messaging aligned with the platform story.
          </h2>
          <p className="text-lg leading-8 text-slate-600">
            The mobile landing, iOS listing, Google Play descriptions, and keyword set all now
            reinforce the same promise: progress with guidance, tools, and control.
          </p>
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">
              <Home className="h-4 w-4" />
              iOS Full Description
            </div>
            <div className="mt-5 space-y-4 text-sm leading-7 text-slate-600">
              <p>
                Nexta is your all-in-one pathway platform for progress &mdash; designed to help you
                discover opportunities, build skills, get support, and move forward with
                confidence.
              </p>
              <p>
                Whether you&apos;re looking for work, learning something new, building a business,
                or trying to stabilise your finances, Nexta brings the tools and guidance together
                in one place.
              </p>
              <p>
                Most platforms give you one piece of the puzzle. Nexta helps you build the whole
                pathway &mdash; from discovery to long-term stability. Your data, your control.
              </p>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">
              <BookOpen className="h-4 w-4" />
              Google Play Copy
            </div>
            <div className="mt-5 space-y-4 text-sm leading-7 text-slate-600">
              <p className="rounded-2xl bg-slate-50 px-4 py-3 font-semibold text-slate-800">
                Your next step, connected: jobs, learning, mentors, tools, and progress.
              </p>
              <p>
                Nexta helps you move from opportunity discovery to long-term progress in one guided
                platform.
              </p>
              <p>
                Find opportunities, build skills, get support, and track your next steps with tools
                designed for real life. Built for progress, not pressure.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-950">Starter keyword set</h3>
              <p className="mt-2 text-sm text-slate-600">
                Optimised around work, learning, guidance, tools, and opportunity discovery.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {appStoreKeywords.map((keyword) => (
                <span
                  key={keyword}
                  className="rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,#0f172a_0%,#115e59_50%,#0f172a_100%)] px-6 py-8 text-white shadow-xl sm:px-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
              Built By
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Nexta is now positioned as a long-term progress platform, with Munyaradzi Chenjerai
              present as the developer.
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-8 text-slate-200">
              The homepage, platform suite, pitch narrative, voice system, app-store messaging, and
              key brand shell elements now tell one consistent story.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950"
            >
              Join Nexta
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/#deck"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/20 px-5 py-3 text-sm font-semibold text-white"
            >
              See the Deck
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
