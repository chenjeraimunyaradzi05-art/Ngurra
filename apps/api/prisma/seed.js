'use strict';
/* eslint-disable no-console, no-unused-vars */
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const client_1 = require('@prisma/client');
const bcryptjs_1 = __importDefault(require('bcryptjs'));
const crypto_1 = require('crypto');
const prisma = new client_1.PrismaClient();

// ==========================================
// NGURRA PATHWAYS - LAUNCH DATA SEED
// ==========================================
// This seed file populates the database with realistic, production-ready data
// for the platform launch. It includes diverse stakeholders, real-world job
// scenarios, and rich community content.

/**
 * Generate a secure admin password.
 * In production, ADMIN_PASSWORD environment variable MUST be set.
 * For development, generates a random secure password and logs it.
 */
function getAdminPassword() {
  const envPassword = process.env.ADMIN_PASSWORD;
  if (envPassword) {
    if (envPassword.length < 12) {
      throw new Error('ADMIN_PASSWORD must be at least 12 characters long');
    }
    console.log('✅ Using ADMIN_PASSWORD from environment variable');
    return envPassword;
  }

  // Production safety check
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      '🚨 SECURITY ERROR: ADMIN_PASSWORD environment variable is required in production!\n' +
        'Set it with: export ADMIN_PASSWORD="your-secure-password-here"'
    );
  }

  // Development only: generate a random password
  const generatedPassword =
    crypto_1
      .randomBytes(16)
      .toString('base64')
      .replace(/[^a-zA-Z0-9]/g, '') + 'Aa1!';
  console.log('⚠️  DEVELOPMENT MODE: Generated random admin password');
  console.log(`   Password: ${generatedPassword}`);
  console.log('   ⚠️  This password will be different on each seed run!');
  console.log('   💡 Set ADMIN_PASSWORD env var to use a consistent password.\n');
  return generatedPassword;
}

const MOBS = [
  'Wiradjuri',
  'Noongar',
  'Yolngu',
  'Kamilaroi',
  'Bundjalung',
  'Gumbaynggirr',
  'Arrernte',
  'Yindjibarndi',
  'Murri',
  'Koori',
  'Palawa',
  'Nunga',
  'Warlpiri',
  'Pitjantjatjara',
];

const LOCATIONS = [
  'Redfern, NSW',
  'Dubbo, NSW',
  'Broome, WA',
  'Darwin, NT',
  'Alice Springs, NT',
  'Fitzroy Crossing, WA',
  'Cairns, QLD',
  'Brisbane, QLD',
  'Perth, WA',
  'Port Augusta, SA',
  'Shepparton, VIC',
];

const INDUSTRIES = [
  'Mining & Resources',
  'Construction',
  'Community Services',
  'Healthcare',
  'Education',
  'Arts & Culture',
  'Government',
  'Technology',
  'Land Management',
  'Tourism',
];

async function main() {
  console.log('🌏 Seeding Ngurra Pathways Launch Data...');
  console.log('========================================\n');

  // SECURITY: Use environment variable or generate secure password
  const adminPassword = getAdminPassword();
  const password = await bcryptjs_1.default.hash(adminPassword, 12); // Increased cost factor

  // Standard password for non-admin users in development
  const standardUserPassword = 'Password123!';
  const userPassword = await bcryptjs_1.default.hash(standardUserPassword, 12);

  // ------------------------------------------------------------------
  // 1. ADMIN & SYSTEM USERS
  // ------------------------------------------------------------------
  console.log('Creating System Users...');

  const admin = await prisma.user.upsert({
    where: { email: 'admin@ngurra.org.au' },
    update: { password },
    create: { email: 'admin@ngurra.org.au', password, userType: 'ADMIN' },
  });

  // ------------------------------------------------------------------
  // 2. COMPANIES (Diverse Industries)
  // ------------------------------------------------------------------
  console.log('Creating Partner Companies...');

  // Real-world company names with non-deliverable seed emails.
  // Job descriptions below are original/synthetic (not copied from job boards).
  const companies = [
    {
      email: 'careers+bhp@seed.local',
      name: 'BHP',
      industry: 'Mining & Resources',
      description:
        'Global resources company with operations across Australia. We support training pathways and long-term careers on Country and in regional communities.',
      location: 'Perth, WA',
      abn: null,
      website: 'https://www.bhp.com',
      logo: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=400&fit=crop',
    },
    {
      email: 'careers+rio@seed.local',
      name: 'Rio Tinto',
      industry: 'Mining & Resources',
      description:
        'Resources company operating across WA and beyond. Focused on safe operations, strong teams, and pathways into trades and operations.',
      location: 'Perth, WA',
      abn: null,
      website: 'https://www.riotinto.com',
      logo: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=400&fit=crop',
    },
    {
      email: 'careers+fortescue@seed.local',
      name: 'Fortescue',
      industry: 'Mining & Resources',
      description:
        'Resources and energy company with large-scale operations in the Pilbara. We hire across operations, maintenance, and corporate services.',
      location: 'Perth, WA',
      abn: null,
      website: 'https://www.fmgl.com.au',
      logo: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=400&h=400&fit=crop',
    },
    {
      email: 'careers+telstra@seed.local',
      name: 'Telstra',
      industry: 'Technology & Telecommunications',
      description:
        'National telecommunications provider. Roles span network operations, customer support, cyber security, and engineering.',
      location: 'Sydney, NSW',
      abn: null,
      website: 'https://www.telstra.com.au',
      logo: 'https://images.unsplash.com/photo-1556910103-1c02745a30bf?w=400&h=400&fit=crop',
    },
    {
      email: 'careers+woolworths@seed.local',
      name: 'Woolworths Group',
      industry: 'Retail & Logistics',
      description:
        'Retail and logistics group with roles across stores, distribution centres, and support offices. We value teamwork, reliability, and customer focus.',
      location: 'Sydney, NSW',
      abn: null,
      website: 'https://www.woolworthsgroup.com.au',
      logo: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=400&fit=crop',
    },
    {
      email: 'careers+qantas@seed.local',
      name: 'Qantas',
      industry: 'Aviation',
      description:
        'Aviation group with roles in ground operations, engineering, customer service, and corporate teams. Safety and customer experience are core.',
      location: 'Sydney, NSW',
      abn: null,
      website: 'https://www.qantas.com',
      logo: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=400&h=400&fit=crop',
    },
    {
      email: 'careers+cba@seed.local',
      name: 'Commonwealth Bank',
      industry: 'Banking & Financial Services',
      description:
        'Major Australian financial institution. Opportunities include customer service, operations, risk, data, and technology.',
      location: 'Sydney, NSW',
      abn: null,
      website: 'https://www.commbank.com.au',
      logo: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&h=400&fit=crop',
    },
    {
      email: 'careers+canva@seed.local',
      name: 'Canva',
      industry: 'Technology',
      description:
        'Product-led technology company. We hire across engineering, data, design, customer support, and operations.',
      location: 'Sydney, NSW',
      abn: null,
      website: 'https://www.canva.com',
      logo: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=400&fit=crop',
    },
    {
      email: 'careers+atlassian@seed.local',
      name: 'Atlassian',
      industry: 'Technology',
      description:
        'Software company building collaboration tools. Roles include engineering, support, customer success, and security.',
      location: 'Sydney, NSW',
      abn: null,
      website: 'https://www.atlassian.com',
      logo: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400&h=400&fit=crop',
    },
    {
      email: 'careers+auspost@seed.local',
      name: 'Australia Post',
      industry: 'Logistics',
      description:
        'National logistics and parcel delivery organisation. Roles across sorting facilities, drivers, customer service, and corporate operations.',
      location: 'Melbourne, VIC',
      abn: null,
      website: 'https://auspost.com.au',
      logo: 'https://images.unsplash.com/photo-1565895405138-6c3a1555da6a?w=400&h=400&fit=crop',
    },
  ];

  const companyUsers = [];

  for (const c of companies) {
    const user = await prisma.user.upsert({
      where: { email: c.email },
      update: { password: userPassword },
      create: { email: c.email, password: userPassword, userType: 'COMPANY' },
    });

    await prisma.companyProfile.upsert({
      where: { userId: user.id },
      update: {
        companyName: c.name,
        industry: c.industry,
        description: c.description,
        city: c.location.split(',')[0].trim(),
        state: c.location.split(',')[1].trim(),
        website: c.website,
        logo: c.logo,
        abn: c.abn,
        isVerified: true,
        verifiedAt: new Date(),
      },
      create: {
        userId: user.id,
        companyName: c.name,
        industry: c.industry,
        description: c.description,
        city: c.location.split(',')[0].trim(),
        state: c.location.split(',')[1].trim(),
        website: c.website,
        logo: c.logo,
        abn: c.abn,
        isVerified: true,
        verifiedAt: new Date(),
      },
    });
    companyUsers.push({ ...c, id: user.id });
  }

  // ------------------------------------------------------------------
  // 2B. PARTNERS (Community + Sponsored Pathways)
  // ------------------------------------------------------------------
  console.log('Seeding Partners...');

  const partners = [
    {
      name: 'Google Career Certificates',
      slug: 'google-career-certificates',
      description:
        'Industry-recognized certificates to build job-ready skills in data, UX, IT support, and cybersecurity.',
      logoUrl: '/partners/google.svg',
      website: 'https://grow.google/certificates/',
      tier: 'platinum',
      featuredJobs: 24,
      isActive: true,
    },
    {
      name: 'Westpac Indigenous Scholarships',
      slug: 'westpac-indigenous-scholarships',
      description: 'Scholarships and leadership programs supporting study and career pathways.',
      logoUrl: '/partners/westpac.svg',
      website:
        'https://www.westpac.com.au/about-westpac/sustainability/working-in-the-community/indigenous-engagement/',
      tier: 'gold',
      featuredJobs: 12,
      isActive: true,
    },
    {
      name: 'Medibank Wellbeing Partnerships',
      slug: 'medibank-wellbeing-partnerships',
      description: 'Wellbeing and health initiatives that support community-led outcomes.',
      logoUrl: '/partners/medibank.svg',
      website: 'https://www.medibank.com.au/',
      tier: 'gold',
      featuredJobs: 9,
      isActive: true,
    },
    {
      name: 'Youi Insurance',
      slug: 'youi-insurance',
      description:
        'Flexible insurance options for households, community centres, and small business owners.',
      logoUrl: '/partners/youi.svg',
      website: 'https://www.youi.com.au/',
      tier: 'silver',
      featuredJobs: 6,
      isActive: true,
    },
    {
      name: 'Indigenous Business Australia',
      slug: 'indigenous-business-australia',
      description:
        'Enterprise support, loans, and housing pathways for Aboriginal and Torres Strait Islander people.',
      logoUrl: null,
      website: 'https://www.iba.gov.au/',
      tier: 'standard',
      featuredJobs: 3,
      isActive: true,
    },
    {
      name: 'NACCHO',
      slug: 'naccho',
      description:
        'Community-controlled health organisation supporting wellbeing and workforce development.',
      logoUrl: null,
      website: 'https://www.naccho.org.au/',
      tier: 'standard',
      featuredJobs: 5,
      isActive: true,
    },
    {
      name: 'AIATSIS',
      slug: 'aiatsis',
      description:
        'Research and education partner focused on Aboriginal and Torres Strait Islander studies.',
      logoUrl: null,
      website: 'https://aiatsis.gov.au/',
      tier: 'standard',
      featuredJobs: 2,
      isActive: true,
    },
    {
      name: 'TAFE NSW',
      slug: 'tafe-nsw',
      description: 'Training pathways, apprenticeships, and accredited qualifications across NSW.',
      logoUrl: null,
      website: 'https://www.tafensw.edu.au/',
      tier: 'standard',
      featuredJobs: 4,
      isActive: true,
    },
    {
      name: 'CareerTrackers',
      slug: 'careertrackers',
      description:
        'Internship and career readiness programs for First Nations university students.',
      logoUrl: null,
      website: 'https://careertrackers.org.au/',
      tier: 'standard',
      featuredJobs: 7,
      isActive: true,
    },
    {
      name: 'Supply Nation',
      slug: 'supply-nation',
      description:
        'Connecting Indigenous businesses to procurement opportunities and corporate buyers.',
      logoUrl: null,
      website: 'https://supplynation.org.au/',
      tier: 'standard',
      featuredJobs: 3,
      isActive: true,
    },
  ];

  for (const partner of partners) {
    await prisma.partner.upsert({
      where: { slug: partner.slug },
      update: {
        name: partner.name,
        description: partner.description,
        logoUrl: partner.logoUrl,
        website: partner.website,
        tier: partner.tier,
        featuredJobs: partner.featuredJobs,
        isActive: partner.isActive,
      },
      create: partner,
    });
  }

  // ------------------------------------------------------------------
  // 3. JOBS
  // ------------------------------------------------------------------
  console.log('Creating Job Listings...');

  const jobs = [
    // BHP (0)
    {
      title: 'Mobile Plant Operator (Entry Pathway)',
      companyIndex: 0,
      description:
        'Entry pathway into open-cut operations. You will learn safe operating practices, pre-start checks, and basic load/haul procedures with structured on-the-job support.',
      location: 'Pilbara, WA (FIFO)',
      salaryLow: 90000,
      salaryHigh: 125000,
      employment: 'FULL_TIME',
    },
    {
      title: 'Maintenance Administrator',
      companyIndex: 0,
      description:
        'Support site maintenance teams with work orders, scheduling, and basic reporting. Great role for candidates with strong organisation skills and experience in admin systems.',
      location: 'Perth, WA',
      salaryLow: 70000,
      salaryHigh: 90000,
      employment: 'FULL_TIME',
    },

    // Rio Tinto (1)
    {
      title: 'Trades Assistant',
      companyIndex: 1,
      description:
        'Assist trades teams with tooling, parts, housekeeping, and safe work setup. You will work closely with supervisors to learn site standards and workflows.',
      location: 'Pilbara, WA (FIFO)',
      salaryLow: 85000,
      salaryHigh: 105000,
      employment: 'FULL_TIME',
    },
    {
      title: 'Warehouse Storeperson',
      companyIndex: 1,
      description:
        'Receive and dispatch parts and consumables, maintain inventory accuracy, and support critical maintenance readiness. Forklift ticket desirable (or willing to obtain).',
      location: 'Perth, WA',
      salaryLow: 65000,
      salaryHigh: 85000,
      employment: 'FULL_TIME',
    },

    // Fortescue (2)
    {
      title: 'Trainee Process Operator',
      companyIndex: 2,
      description:
        'Structured traineeship into processing operations. Learn plant fundamentals, isolation procedures, and safe monitoring practices under supervision.',
      location: 'Pilbara, WA (FIFO)',
      salaryLow: 80000,
      salaryHigh: 110000,
      employment: 'TRAINEESHIP',
    },
    {
      title: 'Health & Safety Advisor (Junior)',
      companyIndex: 2,
      description:
        'Support implementation of safety systems, pre-starts, and hazard reporting. Ideal for someone building a WHS career with strong communication skills.',
      location: 'Perth, WA',
      salaryLow: 90000,
      salaryHigh: 120000,
      employment: 'FULL_TIME',
    },

    // Telstra (3)
    {
      title: 'Customer Service Consultant',
      companyIndex: 3,
      description:
        'Help customers with billing, service changes, and troubleshooting. Training provided; success looks like calm communication, problem-solving, and reliable follow-through.',
      location: 'Sydney, NSW (Hybrid)',
      salaryLow: 60000,
      salaryHigh: 75000,
      employment: 'FULL_TIME',
    },
    {
      title: 'Junior Network Technician',
      companyIndex: 3,
      description:
        'Assist with basic network maintenance activities, field checks, and incident logging. Great for candidates building experience in telecommunications and networking.',
      location: 'Sydney, NSW',
      salaryLow: 70000,
      salaryHigh: 90000,
      employment: 'FULL_TIME',
    },

    // Woolworths Group (4)
    {
      title: 'Distribution Centre Team Member',
      companyIndex: 4,
      description:
        'Pick and pack orders safely and efficiently, follow SOPs, and support a positive team culture. Shifts available across mornings/evenings.',
      location: 'Western Sydney, NSW',
      salaryLow: 58000,
      salaryHigh: 72000,
      employment: 'FULL_TIME',
    },
    {
      title: 'Store Team Member (Part Time)',
      companyIndex: 4,
      description:
        'Serve customers, restock shelves, and keep store standards high. Flexible part-time roster suited to study or family commitments.',
      location: 'Sydney, NSW',
      salaryLow: 45000,
      salaryHigh: 55000,
      employment: 'PART_TIME',
    },

    // Qantas (5)
    {
      title: 'Ground Operations Agent',
      companyIndex: 5,
      description:
        'Support aircraft turnarounds with baggage handling, ramp safety, and turnaround coordination. Safety-first mindset is essential; shift work required.',
      location: 'Sydney Airport, NSW',
      salaryLow: 65000,
      salaryHigh: 82000,
      employment: 'FULL_TIME',
    },
    {
      title: 'Customer Service Agent',
      companyIndex: 5,
      description:
        'Assist passengers with check-in, boarding, and service queries. You will work in a fast-moving environment with clear procedures and strong teamwork.',
      location: 'Sydney Airport, NSW',
      salaryLow: 62000,
      salaryHigh: 78000,
      employment: 'FULL_TIME',
    },

    // Commonwealth Bank (6)
    {
      title: 'Contact Centre Consultant',
      companyIndex: 6,
      description:
        'Support customers via phone and chat with everyday banking, cards, and account servicing. Training provided; focus on empathy, accuracy, and compliance.',
      location: 'Sydney, NSW (Hybrid)',
      salaryLow: 65000,
      salaryHigh: 82000,
      employment: 'FULL_TIME',
    },
    {
      title: 'Junior Data Analyst',
      companyIndex: 6,
      description:
        'Assist with dashboards and operational reporting. You will learn data quality checks, stakeholder communication, and basic analysis techniques.',
      location: 'Sydney, NSW',
      salaryLow: 80000,
      salaryHigh: 105000,
      employment: 'FULL_TIME',
    },

    // Canva (7)
    {
      title: 'Support Specialist (Customer Experience)',
      companyIndex: 7,
      description:
        'Help users succeed with product guidance, troubleshooting, and education. Ideal for clear communicators who enjoy solving problems and learning fast.',
      location: 'Sydney, NSW',
      salaryLow: 70000,
      salaryHigh: 90000,
      employment: 'FULL_TIME',
    },
    {
      title: 'Junior Software Engineer',
      companyIndex: 7,
      description:
        'Join a product team delivering features end-to-end. You will pair with senior engineers, write tests, and contribute to code reviews in a supportive environment.',
      location: 'Sydney, NSW (Hybrid)',
      salaryLow: 110000,
      salaryHigh: 150000,
      employment: 'FULL_TIME',
    },

    // Atlassian (8)
    {
      title: 'IT Service Desk Analyst',
      companyIndex: 8,
      description:
        'Support internal teams with device setup, access requests, and incident triage. Strong communication and a customer-first approach are key.',
      location: 'Sydney, NSW',
      salaryLow: 75000,
      salaryHigh: 95000,
      employment: 'FULL_TIME',
    },
    {
      title: 'Security Operations Analyst (Entry Level)',
      companyIndex: 8,
      description:
        'Assist with monitoring alerts, escalating incidents, and maintaining runbooks. Great opportunity for candidates building a cyber security career.',
      location: 'Sydney, NSW (Hybrid)',
      salaryLow: 95000,
      salaryHigh: 125000,
      employment: 'FULL_TIME',
    },

    // Australia Post (9)
    {
      title: 'Parcel Facility Team Member',
      companyIndex: 9,
      description:
        'Sort and scan parcels, support dispatch readiness, and maintain safe work practices. Opportunities for overtime during peak periods.',
      location: 'Melbourne, VIC',
      salaryLow: 58000,
      salaryHigh: 74000,
      employment: 'FULL_TIME',
    },
    {
      title: 'Delivery Driver (Contract)',
      companyIndex: 9,
      description:
        'Local parcel delivery with route optimisation and safe driving focus. Requires a current licence and strong reliability.',
      location: 'Melbourne, VIC',
      salaryLow: 65000,
      salaryHigh: 90000,
      employment: 'CONTRACT',
    },
  ];

  function slugify(s) {
    return s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^[-]+|[-]+$/g, '');
  }

  for (const j of jobs) {
    const companyId = companyUsers[j.companyIndex].id;
    const slug = slugify(`${j.title} ${companyUsers[j.companyIndex].name}`);

    await prisma.job.upsert({
      where: { slug },
      update: {
        title: j.title,
        description: j.description,
        location: j.location,
        salaryLow: j.salaryLow,
        salaryHigh: j.salaryHigh,
        employment: j.employment,
        isActive: true,
        isFeatured: Math.random() > 0.7, // Randomly feature some jobs
        viewCount: Math.floor(Math.random() * 500),
      },
      create: {
        userId: companyId,
        title: j.title,
        slug,
        description: j.description,
        location: j.location,
        salaryLow: j.salaryLow,
        salaryHigh: j.salaryHigh,
        employment: j.employment,
        isActive: true,
        isFeatured: Math.random() > 0.7,
        viewCount: Math.floor(Math.random() * 500),
      },
    });
  }

  // ------------------------------------------------------------------
  // 4. MEMBERS (Job Seekers)
  // ------------------------------------------------------------------
  console.log('Creating Members...');

  const members = [
    {
      name: 'Jarrah Williams',
      email: 'jarrah@example.com',
      mob: 'Wiradjuri',
      location: 'Dubbo, NSW',
      interest: 'Construction',
      bio: 'Hardworking young fella looking to start a trade. Have my White Card and driver license.',
    },
    {
      name: 'Kira Davis',
      email: 'kira@example.com',
      mob: 'Noongar',
      location: 'Perth, WA',
      interest: 'Mining',
      bio: 'Looking for FIFO opportunities. Previous experience in hospitality but want to switch to mining.',
    },
    {
      name: 'Thomas Yarran',
      email: 'thomas@example.com',
      mob: 'Yolngu',
      location: 'Darwin, NT',
      interest: 'Land Management',
      bio: 'Passionate about caring for country. Experience as a ranger assistant.',
    },
    {
      name: 'Ruby Walker',
      email: 'ruby@example.com',
      mob: 'Bundjalung',
      location: 'Lismore, NSW',
      interest: 'Arts & Culture',
      bio: 'Digital artist and storyteller. Want to use my skills in a creative agency.',
    },
    {
      name: 'Marcus Johnson',
      email: 'marcus@example.com',
      mob: 'Kamilaroi',
      location: 'Tamworth, NSW',
      interest: 'Healthcare',
      bio: 'Studying nursing and looking for part-time work in health support.',
    },
  ];

  const memberIds = [];

  for (const m of members) {
    const user = await prisma.user.upsert({
      where: { email: m.email },
      update: { password: userPassword },
      create: { email: m.email, password: userPassword, userType: 'MEMBER' },
    });

    await prisma.memberProfile.upsert({
      where: { userId: user.id },
      update: {
        mobNation: m.mob,
        careerInterest: m.interest,
        bio: m.bio,
        profileCompletionPercent: 85,
        skillLevel: 'Intermediate',
      },
      create: {
        userId: user.id,
        mobNation: m.mob,
        careerInterest: m.interest,
        bio: m.bio,
        profileCompletionPercent: 85,
        skillLevel: 'Intermediate',
      },
    });
    memberIds.push(user.id);
  }

  // ------------------------------------------------------------------
  // 5. MENTORS
  // ------------------------------------------------------------------
  console.log('Creating Mentors...');

  const mentors = [
    {
      name: 'Uncle David',
      email: 'david.mentor@example.com',
      title: 'Senior Elder & Cultural Advisor',
      expertise: 'Cultural Leadership, Community Governance',
      bio: 'Over 40 years experience in community leadership. Here to guide the next generation of leaders.',
    },
    {
      name: "Sarah O'Shane",
      email: 'sarah.mentor@example.com',
      title: 'Mining Superintendent',
      expertise: 'Mining Careers, Women in Leadership',
      bio: 'Started as a truckie, now running the pit. Passionate about getting more mob into mining leadership.',
    },
    {
      name: 'James Cubillo',
      email: 'james.mentor@example.com',
      title: 'Tech Entrepreneur',
      expertise: 'Technology, Business Startups',
      bio: 'Founder of two tech startups. Can help with coding, business planning, and digital skills.',
    },
  ];

  const mentorIds = [];

  for (const m of mentors) {
    const user = await prisma.user.upsert({
      where: { email: m.email },
      update: { password: userPassword },
      create: { email: m.email, password: userPassword, userType: 'MENTOR' },
    });

    await prisma.mentorProfile.upsert({
      where: { userId: user.id },
      update: {
        name: m.name,
        title: m.title,
        expertise: m.expertise,
        bio: m.bio,
        active: true,
        maxCapacity: 5,
      },
      create: {
        userId: user.id,
        name: m.name,
        title: m.title,
        expertise: m.expertise,
        bio: m.bio,
        active: true,
        maxCapacity: 5,
      },
    });
    mentorIds.push(user.id);
  }

  // ------------------------------------------------------------------
  // 6. TAFE & COURSES
  // ------------------------------------------------------------------
  console.log('Creating TAFE & Courses...');

  const tafe = await prisma.user.upsert({
    where: { email: 'admissions@tafensw.edu.au' },
    update: { password: userPassword },
    create: { email: 'admissions@tafensw.edu.au', password: userPassword, userType: 'TAFE' },
  });

  await prisma.institutionProfile.upsert({
    where: { userId: tafe.id },
    update: { institutionName: 'TAFE NSW', institutionType: 'TAFE' },
    create: { userId: tafe.id, institutionName: 'TAFE NSW', institutionType: 'TAFE' },
  });

  const courses = [
    // Safety & Compliance
    {
      id: 'course-white-card',
      title: 'White Card (Construction Induction)',
      providerName: 'TAFE NSW',
      description:
        'General Construction Induction training required for all construction workers. Covers workplace health and safety, hazard identification, and safe work practices on construction sites.',
      category: 'Safety',
      duration: '1 day',
      priceInCents: 12000,
      isOnline: false,
      skills: 'OH&S,Construction Safety,White Card',
      url: 'https://tafe.nsw.edu.au',
      qualification: 'CPCCWHS1001',
    },
    {
      id: 'course-first-aid',
      title: 'First Aid Certificate',
      providerName: 'St John Ambulance',
      description:
        'HLTAID011 Provide First Aid certification. Learn life-saving skills including CPR, wound management, and emergency response techniques.',
      category: 'Health & Safety',
      duration: '1-2 days',
      priceInCents: 15000,
      isOnline: false,
      skills: 'First Aid,CPR,Emergency Response',
      url: 'https://stjohn.org.au',
      qualification: 'HLTAID011',
    },
    {
      id: 'course-working-heights',
      title: 'Working at Heights',
      providerName: 'TAFE NSW',
      description:
        'High Risk Work License for working at heights. Essential training for construction, mining, and maintenance workers.',
      category: 'Safety',
      duration: '1 day',
      priceInCents: 35000,
      isOnline: false,
      skills: 'Height Safety,Harness,Fall Prevention',
      url: 'https://tafe.nsw.edu.au',
      qualification: 'RIIWHS204E',
    },
    {
      id: 'course-confined-space',
      title: 'Confined Space Entry',
      providerName: 'TAFE NSW',
      description:
        'Learn safe procedures for entering and working in confined spaces. Covers hazard assessment, atmospheric monitoring, and emergency procedures.',
      category: 'Safety',
      duration: '1 day',
      priceInCents: 38000,
      isOnline: false,
      skills: 'Confined Space,Gas Detection,Safety Procedures',
      url: 'https://tafe.nsw.edu.au',
      qualification: 'MSMWHS217',
    },

    // Trade Qualifications
    {
      id: 'course-cert3-construction',
      title: 'Certificate III in Construction',
      providerName: 'TAFE NSW',
      description:
        'CPC30220 - Foundation qualification for construction industry careers. Gain practical skills in carpentry, building, and construction techniques.',
      category: 'Trade',
      duration: '12 months',
      priceInCents: 250000,
      isOnline: false,
      skills: 'Carpentry,Construction,Trade Skills',
      url: 'https://tafe.nsw.edu.au',
      qualification: 'CPC30220',
    },
    {
      id: 'course-cert3-carpentry',
      title: 'Certificate III in Carpentry',
      providerName: 'TAFE NSW',
      description:
        'CPC30220 - Become a qualified carpenter. Learn framing, formwork, finishing, and residential construction techniques.',
      category: 'Trade',
      duration: '3 years',
      priceInCents: 0,
      isOnline: false,
      skills: 'Carpentry,Framing,Building Construction',
      url: 'https://tafe.nsw.edu.au',
      qualification: 'CPC30220',
    },
    {
      id: 'course-cert3-electro',
      title: 'Certificate III in Electrotechnology',
      providerName: 'TAFE NSW',
      description:
        'UEE30820 - Train to become a licensed electrician. Covers electrical installation, maintenance, and safety.',
      category: 'Trade',
      duration: '4 years',
      priceInCents: 0,
      isOnline: false,
      skills: 'Electrical,Wiring,Installation',
      url: 'https://tafe.nsw.edu.au',
      qualification: 'UEE30820',
    },
    {
      id: 'course-cert3-plumbing',
      title: 'Certificate III in Plumbing',
      providerName: 'TAFE QLD',
      description:
        'CPC32420 - Comprehensive plumbing apprenticeship covering water supply, drainage, gas fitting, and roofing.',
      category: 'Trade',
      duration: '4 years',
      priceInCents: 0,
      isOnline: false,
      skills: 'Plumbing,Gas Fitting,Drainage',
      url: 'https://tafeqld.edu.au',
      qualification: 'CPC32420',
    },
    {
      id: 'course-forklift',
      title: 'Forklift License',
      providerName: 'Skill Set Training',
      description:
        'High Risk Work License for forklift operation. Essential for warehouse, logistics, and construction roles.',
      category: 'Trade',
      duration: '2 days',
      priceInCents: 45000,
      isOnline: false,
      skills: 'Forklift,Warehouse,Logistics',
      url: 'https://skillset.com.au',
      qualification: 'TLILIC0003',
    },

    // Community & Health Services
    {
      id: 'course-cert3-community',
      title: 'Certificate III in Community Services',
      providerName: 'TAFE QLD',
      description:
        'CHC32015 - Entry-level qualification for community services sector. Learn to support individuals and communities.',
      category: 'Community Services',
      duration: '6 months',
      priceInCents: 180000,
      isOnline: true,
      skills: 'Community Support,Case Management,Communication',
      url: 'https://tafeqld.edu.au',
      qualification: 'CHC32015',
    },
    {
      id: 'course-cert3-aged-care',
      title: 'Certificate III in Individual Support (Ageing)',
      providerName: 'TAFE NSW',
      description:
        'CHC33015 - Prepare for a rewarding career in aged care. Learn person-centred support, daily living assistance, and dementia care.',
      category: 'Health Care',
      duration: '6 months',
      priceInCents: 150000,
      isOnline: true,
      skills: 'Aged Care,Personal Care,Dementia Support',
      url: 'https://tafe.nsw.edu.au',
      qualification: 'CHC33015',
    },
    {
      id: 'course-cert3-disability',
      title: 'Certificate III in Individual Support (Disability)',
      providerName: 'TAFE NSW',
      description:
        'CHC33015 - Work with people with disabilities. Covers NDIS, person-centred planning, and support strategies.',
      category: 'Health Care',
      duration: '6 months',
      priceInCents: 150000,
      isOnline: true,
      skills: 'Disability Support,NDIS,Personal Care',
      url: 'https://tafe.nsw.edu.au',
      qualification: 'CHC33015',
    },
    {
      id: 'course-cert4-mental-health',
      title: 'Certificate IV in Mental Health',
      providerName: 'TAFE QLD',
      description:
        'CHC43315 - Develop skills to work in mental health services. Covers crisis intervention, recovery approaches, and community support.',
      category: 'Health Care',
      duration: '12 months',
      priceInCents: 280000,
      isOnline: true,
      skills: 'Mental Health,Crisis Support,Counselling',
      url: 'https://tafeqld.edu.au',
      qualification: 'CHC43315',
    },
    {
      id: 'course-cert4-youth-work',
      title: 'Certificate IV in Youth Work',
      providerName: 'TAFE SA',
      description:
        'CHC40413 - Work with young people in community settings. Covers youth development, case management, and program facilitation.',
      category: 'Community Services',
      duration: '12 months',
      priceInCents: 260000,
      isOnline: true,
      skills: 'Youth Work,Case Management,Program Development',
      url: 'https://tafesa.edu.au',
      qualification: 'CHC40413',
    },

    // Business & Administration
    {
      id: 'course-cert3-business',
      title: 'Certificate III in Business',
      providerName: 'TAFE NSW',
      description:
        'BSB30120 - Foundation business skills including communication, customer service, and workplace practices.',
      category: 'Business',
      duration: '6 months',
      priceInCents: 120000,
      isOnline: true,
      skills: 'Business Admin,Customer Service,Office Skills',
      url: 'https://tafe.nsw.edu.au',
      qualification: 'BSB30120',
    },
    {
      id: 'course-cert4-leadership',
      title: 'Certificate IV in Leadership and Management',
      providerName: 'TAFE NSW',
      description:
        'BSB40520 - Develop your leadership potential. Covers team management, workplace communication, and operational planning.',
      category: 'Business',
      duration: '12 months',
      priceInCents: 320000,
      isOnline: true,
      skills: 'Leadership,Management,Team Building',
      url: 'https://tafe.nsw.edu.au',
      qualification: 'BSB40520',
    },
    {
      id: 'course-cert4-project-mgmt',
      title: 'Certificate IV in Project Management Practice',
      providerName: 'TAFE QLD',
      description:
        'BSB40920 - Learn to manage projects effectively. Covers project planning, stakeholder management, and project delivery.',
      category: 'Business',
      duration: '6 months',
      priceInCents: 280000,
      isOnline: true,
      skills: 'Project Management,Planning,Stakeholder Management',
      url: 'https://tafeqld.edu.au',
      qualification: 'BSB40920',
    },

    // Mining & Resources
    {
      id: 'course-cert2-mining',
      title: 'Certificate II in Mining Operations',
      providerName: 'Central Regional TAFE',
      description:
        'RII20120 - Entry-level qualification for mining industry. Covers mine safety, basic operations, and equipment awareness.',
      category: 'Mining',
      duration: '3 months',
      priceInCents: 180000,
      isOnline: false,
      skills: 'Mining Safety,Operations,Equipment',
      url: 'https://centralregionaltafe.wa.edu.au',
      qualification: 'RII20120',
      industry: 'Mining & Resources',
    },
    {
      id: 'course-cert3-mining',
      title: 'Certificate III in Mining Operations',
      providerName: 'Central Regional TAFE',
      description:
        'RII30120 - Advance your mining career with operational skills in surface and underground mining.',
      category: 'Mining',
      duration: '12 months',
      priceInCents: 350000,
      isOnline: false,
      skills: 'Mining Operations,Drilling,Blasting',
      url: 'https://centralregionaltafe.wa.edu.au',
      qualification: 'RII30120',
      industry: 'Mining & Resources',
    },
    {
      id: 'course-haul-truck',
      title: 'Haul Truck Operator Training',
      providerName: 'Mining Training Australia',
      description:
        'Become a certified haul truck operator. Covers Caterpillar and Komatsu trucks, safety procedures, and load management.',
      category: 'Mining',
      duration: '2 weeks',
      priceInCents: 450000,
      isOnline: false,
      skills: 'Haul Truck,Heavy Vehicle,Mining Equipment',
      url: 'https://miningtraining.com.au',
      industry: 'Mining & Resources',
    },

    // Technology & Digital
    {
      id: 'course-cert4-it',
      title: 'Certificate IV in Information Technology',
      providerName: 'TAFE NSW',
      description:
        'ICT40120 - Build IT skills in networking, programming, and cybersecurity. Great pathway to tech careers.',
      category: 'Technology',
      duration: '12 months',
      priceInCents: 280000,
      isOnline: true,
      skills: 'IT Support,Networking,Cybersecurity',
      url: 'https://tafe.nsw.edu.au',
      qualification: 'ICT40120',
    },
    {
      id: 'course-digital-literacy',
      title: 'Digital Literacy Fundamentals',
      providerName: 'TAFE NSW',
      description:
        'Essential computer and internet skills for the modern workplace. Covers Microsoft Office, email, and online safety.',
      category: 'Technology',
      duration: '4 weeks',
      priceInCents: 0,
      isOnline: true,
      skills: 'Computer Skills,Microsoft Office,Digital Skills',
      url: 'https://tafe.nsw.edu.au',
    },
    {
      id: 'course-data-entry',
      title: 'Data Entry and Administration',
      providerName: 'TAFE NSW',
      description:
        'Develop fast and accurate data entry skills. Learn spreadsheets, databases, and office administration.',
      category: 'Business',
      duration: '8 weeks',
      priceInCents: 85000,
      isOnline: true,
      skills: 'Data Entry,Excel,Administration',
      url: 'https://tafe.nsw.edu.au',
    },

    // Land & Environment
    {
      id: 'course-cert3-conservation',
      title: 'Certificate III in Conservation and Ecosystem Management',
      providerName: 'TAFE SA',
      description:
        'AHC31420 - Protect Country and manage natural resources. Covers land rehabilitation, native species, and environmental monitoring.',
      category: 'Environment',
      duration: '12 months',
      priceInCents: 220000,
      isOnline: false,
      skills: 'Conservation,Land Management,Environmental Monitoring',
      url: 'https://tafesa.edu.au',
      qualification: 'AHC31420',
      industry: 'Land Management',
    },
    {
      id: 'course-ranger-training',
      title: 'Indigenous Ranger Training Program',
      providerName: 'Charles Darwin University',
      description:
        'Comprehensive ranger training covering land management, cultural heritage protection, fire management, and wildlife monitoring.',
      category: 'Environment',
      duration: '6 months',
      priceInCents: 0,
      isOnline: false,
      skills: 'Land Management,Cultural Heritage,Fire Management',
      url: 'https://cdu.edu.au',
      industry: 'Land Management',
    },
    {
      id: 'course-chainsaw',
      title: 'Chainsaw Operations',
      providerName: 'TAFE NSW',
      description:
        'AHCMOM213 - Safe chainsaw operation for land management, forestry, and arboriculture work.',
      category: 'Trade',
      duration: '3 days',
      priceInCents: 55000,
      isOnline: false,
      skills: 'Chainsaw,Tree Felling,Safety',
      url: 'https://tafe.nsw.edu.au',
      qualification: 'AHCMOM213',
    },

    // Transport & Logistics
    {
      id: 'course-hr-license',
      title: 'Heavy Rigid (HR) License',
      providerName: 'Driver Training Australia',
      description:
        'Get your HR truck license. Covers pre-trip inspections, load restraint, and defensive driving techniques.',
      category: 'Transport',
      duration: '1 week',
      priceInCents: 180000,
      isOnline: false,
      skills: 'Heavy Vehicle,Truck Driving,Load Restraint',
      url: 'https://drivertraining.com.au',
    },
    {
      id: 'course-mc-license',
      title: 'Multi Combination (MC) License',
      providerName: 'Driver Training Australia',
      description:
        'Advance to MC license for road train and B-double operations. Essential for long-haul transport careers.',
      category: 'Transport',
      duration: '2 weeks',
      priceInCents: 350000,
      isOnline: false,
      skills: 'Road Train,B-Double,Long Haul',
      url: 'https://drivertraining.com.au',
    },
    {
      id: 'course-cert3-warehousing',
      title: 'Certificate III in Warehousing Operations',
      providerName: 'TAFE QLD',
      description:
        'TLI30321 - Skills for warehouse and logistics roles. Covers inventory management, dispatch, and warehouse systems.',
      category: 'Logistics',
      duration: '6 months',
      priceInCents: 140000,
      isOnline: false,
      skills: 'Warehousing,Inventory,Logistics',
      url: 'https://tafeqld.edu.au',
      qualification: 'TLI30321',
    },

    // Hospitality & Tourism
    {
      id: 'course-rsa',
      title: 'Responsible Service of Alcohol (RSA)',
      providerName: 'TAFE NSW',
      description:
        'Required certification for anyone serving alcohol in Australia. Covers licensing laws and responsible service practices.',
      category: 'Hospitality',
      duration: '6 hours',
      priceInCents: 12000,
      isOnline: true,
      skills: 'RSA,Hospitality,Customer Service',
      url: 'https://tafe.nsw.edu.au',
    },
    {
      id: 'course-rsg',
      title: 'Responsible Service of Gambling (RSG)',
      providerName: 'TAFE NSW',
      description:
        'Certification for gaming venue staff. Covers problem gambling awareness and intervention strategies.',
      category: 'Hospitality',
      duration: '4 hours',
      priceInCents: 8000,
      isOnline: true,
      skills: 'RSG,Gaming,Customer Service',
      url: 'https://tafe.nsw.edu.au',
    },
    {
      id: 'course-cert3-hospitality',
      title: 'Certificate III in Hospitality',
      providerName: 'TAFE NSW',
      description:
        'SIT30622 - Start your hospitality career. Covers food and beverage service, customer relations, and workplace hygiene.',
      category: 'Hospitality',
      duration: '12 months',
      priceInCents: 180000,
      isOnline: false,
      skills: 'Hospitality,Food Service,Customer Service',
      url: 'https://tafe.nsw.edu.au',
      qualification: 'SIT30622',
    },
    {
      id: 'course-cert3-tourism',
      title: 'Certificate III in Tourism',
      providerName: 'TAFE QLD',
      description:
        'SIT30122 - Work in Australias tourism industry. Covers tour guiding, destination knowledge, and visitor services.',
      category: 'Tourism',
      duration: '6 months',
      priceInCents: 160000,
      isOnline: true,
      skills: 'Tourism,Tour Guiding,Customer Service',
      url: 'https://tafeqld.edu.au',
      qualification: 'SIT30122',
      industry: 'Tourism',
    },
    {
      id: 'course-cultural-tourism',
      title: 'Indigenous Cultural Tourism',
      providerName: 'Charles Darwin University',
      description:
        'Share your culture with visitors. Covers cultural protocol, tour development, and cultural heritage interpretation.',
      category: 'Tourism',
      duration: '3 months',
      priceInCents: 0,
      isOnline: false,
      skills: 'Cultural Tourism,Tour Guiding,Storytelling',
      url: 'https://cdu.edu.au',
      industry: 'Tourism',
    },
  ];

  for (const c of courses) {
    try {
      await prisma.course.upsert({
        where: { id: c.id },
        update: c,
        create: c,
      });
    } catch (e) {
      console.log(`Skipping course ${c.title} (model might not exist in this schema version)`);
    }
  }

  // ------------------------------------------------------------------
  // 7. COMMUNITY CONTENT (Forum & Social)
  // ------------------------------------------------------------------
  console.log('Creating Community Content...');

  // Forum Categories
  const forumCategories = [
    {
      name: 'General Discussion',
      slug: 'general',
      description: 'Open discussions about work, training, and community',
      icon: '💬',
      color: 'blue',
      sortOrder: 1,
    },
    {
      name: 'Job Seeking Tips',
      slug: 'job-tips',
      description: 'Share and learn job hunting strategies',
      icon: '💼',
      color: 'green',
      sortOrder: 2,
    },
    {
      name: 'Training & Education',
      slug: 'training',
      description: 'Discuss courses, certifications, and learning paths',
      icon: '📚',
      color: 'amber',
      sortOrder: 3,
    },
    {
      name: 'Mentorship',
      slug: 'mentorship',
      description: 'Connect with mentors and share experiences',
      icon: '🤝',
      color: 'purple',
      sortOrder: 4,
    },
    {
      name: 'Success Stories',
      slug: 'success',
      description: 'Celebrate achievements and inspire others',
      icon: '🎉',
      color: 'pink',
      sortOrder: 5,
    },
    {
      name: 'Cultural Connections',
      slug: 'cultural',
      description: 'Share culture, stories, and community news',
      icon: '🌏',
      color: 'teal',
      sortOrder: 6,
    },
  ];

  for (const cat of forumCategories) {
    try {
      await prisma.forumCategory.upsert({
        where: { slug: cat.slug },
        update: cat,
        create: cat,
      });
    } catch (e) {
      // Ignore if model missing
    }
  }

  // Social Posts
  // We'll create some posts from our seeded users
  try {
    const posts = [
      {
        id: 'post-1',
        authorId: memberIds[0], // Jarrah
        authorType: 'user',
        type: 'text',
        visibility: 'public',
        content:
          'Just finished my White Card training! Big thanks to Uncle David for the advice on getting started. Ready to apply for some sites now.',
        likeCount: 24,
        commentCount: 3,
        isActive: true,
      },
      {
        id: 'post-2',
        authorId: mentorIds[1], // Sarah
        authorType: 'user',
        type: 'text',
        visibility: 'public',
        content:
          'Great to see so many young mob coming through the traineeship program this week. Remember, turn up on time, ask questions, and stay safe. You got this!',
        likeCount: 56,
        commentCount: 12,
        isActive: true,
      },
      {
        id: 'post-3',
        authorId: companyUsers[0].id, // BHP
        authorType: 'organization',
        orgId: (await prisma.companyProfile.findUnique({ where: { userId: companyUsers[0].id } }))
          .id,
        type: 'text',
        visibility: 'public',
        content:
          "We are hosting a careers yarn this week to talk traineeships and entry pathways. If you're keen on mining or maintenance roles, come along and meet the team.",
        likeCount: 31,
        commentCount: 8,
        isActive: true,
      },
    ];

    for (const p of posts) {
      await prisma.socialPost.upsert({
        where: { id: p.id },
        update: {
          content: p.content,
          likeCount: p.likeCount,
          commentCount: p.commentCount,
          isActive: true,
        },
        create: p,
      });
    }
  } catch (e) {
    console.log('Skipping social posts (model might not exist)');
  }

  // ------------------------------------------------------------------
  // 8. BADGES
  // ------------------------------------------------------------------
  console.log('Creating Badges...');

  const badges = [
    {
      id: 'badge-profile-complete',
      name: 'Profile Complete',
      description: 'Completed your full profile',
      imageUrl: '/badges/profile.svg',
      category: 'platform',
    },
    {
      id: 'badge-first-application',
      name: 'First Application',
      description: 'Submitted your first job application',
      imageUrl: '/badges/first-app.svg',
      category: 'milestone',
    },
    {
      id: 'badge-interview-ready',
      name: 'Interview Ready',
      description: 'Completed interview preparation module',
      imageUrl: '/badges/interview.svg',
      category: 'achievement',
    },
    {
      id: 'badge-community-helper',
      name: 'Community Helper',
      description: 'Helped 10+ community members in forums',
      imageUrl: '/badges/helper.svg',
      category: 'achievement',
    },
    {
      id: 'badge-white-card',
      name: 'White Card',
      description: 'Completed White Card certification',
      imageUrl: '/badges/whitecard.svg',
      category: 'verification',
    },
  ];

  for (const b of badges) {
    try {
      await prisma.badge.upsert({
        where: { id: b.id },
        update: b,
        create: b,
      });
    } catch (e) {
      // Ignore
    }
  }

  // ------------------------------------------------------------------
  // 9. PHASE 1 ADDITIONAL MODELS
  // ------------------------------------------------------------------
  console.log('Seeding Phase 1 Additional Data...');

  // Fetch a user for relations
  const seedUser = await prisma.user.findFirst({ where: { email: 'jarrah@example.com' } });

  if (seedUser) {
    try {
      // Grant Programs
      // Check if already exists to avoid duplication if run multiple times
      const existingGrant = await prisma.grantProgram.findFirst({
        where: { title: 'Indigenous Business Kickstart' },
      });
      if (!existingGrant) {
        await prisma.grantProgram.create({
          data: {
            title: 'Indigenous Business Kickstart',
            provider: 'Supply Nation',
            description: 'Grant for starting new indigenous businesses',
            amountMin: 5000,
            amountMax: 20000,
            deadline: new Date('2024-12-31'),
          },
        });
      }

      // Scholarships
      const existingScholarship = await prisma.scholarship.findFirst({
        where: { title: 'Women in STEM Scholarship' },
      });
      if (!existingScholarship) {
        await prisma.scholarship.create({
          data: {
            title: 'Women in STEM Scholarship',
            provider: 'Tech Council',
            description: 'Supporting women entering technology fields',
            value: '$10,000 per year',
            deadline: new Date('2024-11-30'),
          },
        });
      }

      // TAFE Programs
      const existingTafe = await prisma.tafeProgram.findUnique({ where: { code: 'ICT50220' } });
      if (!existingTafe) {
        await prisma.tafeProgram.create({
          data: {
            code: 'ICT50220',
            name: 'Diploma of Information Technology',
            description: 'Comprehensive IT training',
            provider: 'TAFE NSW',
            courses: {
              create: [
                { name: 'Cyber Security Essentials', code: 'CS101' },
                { name: 'Web Development Basics', code: 'WD101' },
              ],
            },
          },
        });
      }

      // Mortgage Quote (Mock) - Upsert or create
      await prisma.mortgageQuote.create({
        data: {
          userId: seedUser.id,
          amount: 500000,
          deposit: 50000,
          termYears: 30,
          interestRate: 5.5,
          monthlyPayment: 2800,
          lenderName: 'Community Bank',
          status: 'APPROVED',
        },
      });

      // Business Budget (Mock)
      await prisma.businessBudget.create({
        data: {
          userId: seedUser.id,
          name: 'Startup Budget 2024',
          period: 'YEARLY',
          items: {
            create: [
              { category: 'Equipment', amount: 5000, type: 'EXPENSE' },
              { category: 'Marketing', amount: 2000, type: 'EXPENSE' },
              { category: 'Sales', amount: 15000, type: 'INCOME' },
            ],
          },
        },
      });

      // Legal Document Template
      await prisma.legalDocument.create({
        data: {
          userId: seedUser.id,
          title: 'Service Agreement Template',
          type: 'AGREEMENT',
          content: 'This Service Agreement is made between...',
          status: 'TEMPLATE',
        },
      });
    } catch (e) {
      console.error('Error seeding Phase 1 data:', e.message);
    }
  }

  console.log('\n✅ Seed Complete! Database is ready for launch.');
  console.log('   Admin: admin@ngurra.org.au');
  console.log('   Company: careers+bhp@seed.local');
  console.log('   Member: jarrah@example.com');
  console.log('   Mentor: david.mentor@example.com');
  console.log('   Password for all: Password123!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
