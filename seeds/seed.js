const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

/**
 * @param {import('knex')} knex
 */
exports.seed = async function seed(knex) {
  // Delete existing data (optional - comment out if you want to keep existing data)
  await knex('commissions').del();
  await knex('application_tags').del();
  await knex('application_notes').del();
  await knex('board_applications').del();
  await knex('applications').del();
  await knex('images').del();
  await knex('profiles').del();
  await knex('users').del();

  const passwordHash = await bcrypt.hash('password123', 10);

  // Create agency account
  const agencyId = uuidv4();
  await knex('users').insert({
    id: agencyId,
    email: 'agency@example.com',
    password_hash: passwordHash,
    role: 'AGENCY'
  });

  // Create talent account
  const talentId = uuidv4();
  await knex('users').insert({
    id: talentId,
    email: 'talent@example.com',
    password_hash: passwordHash,
    role: 'TALENT'
  });

  // Create Elara Keats placeholder account (for demo)
  const elaraUserId = uuidv4();
  await knex('users').insert({
    id: elaraUserId,
    email: 'elara@example.com',
    password_hash: passwordHash,
    role: 'TALENT'
  });

  // Create Elara Keats profile (placeholder/demo account)
  const elaraProfileId = uuidv4();
  await knex('profiles').insert({
    id: elaraProfileId,
    user_id: elaraUserId,
    slug: 'elara-k',
    first_name: 'Elara',
    last_name: 'Keats',
    city: 'Los Angeles, CA',
    height_cm: 180,
    measurements: '32-25-35',
    bio_raw: 'Elara is a collaborative creative professional with a background in editorial campaigns and on-set leadership. Based in Los Angeles, she balances editorial edge with commercial versatility.',
    bio_curated: 'Elara Keats brings a polished presence to every production. Based in Los Angeles, she balances editorial edge with commercial versatility. Standing at 5\'11" with measurements of 32-25-35, she brings a commanding presence to both high-fashion editorials and commercial campaigns.',
    hero_image_path: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=2000&q=80',
    is_pro: false,
    pdf_theme: null,
    pdf_customizations: null,
    partner_agency_id: null,
    // New comprehensive fields
    gender: 'Female',
    date_of_birth: '1995-06-15',
    age: 29,
    weight_kg: 58,
    weight_lbs: 128,
    dress_size: '4',
    hair_length: 'Long',
    skin_tone: 'Fair',
    languages: JSON.stringify(['English', 'Spanish']),
    availability_travel: true,
    availability_schedule: 'Full-time',
    experience_level: 'Experienced',
    training: 'Formal training in editorial modeling and commercial acting.',
    portfolio_url: 'https://elarakeats.portfolio.com',
    instagram_handle: 'elarakeats',
    instagram_url: null, // Free users don't get URLs
    twitter_handle: 'elarakeats',
    twitter_url: null, // Free users don't get URLs
    tiktok_handle: 'elarakeats',
    tiktok_url: null, // Free users don't get URLs
    reference_name: null,
    reference_email: null,
    reference_phone: null,
    reference_relationship: null,
    emergency_contact_name: 'Jane Doe',
    emergency_contact_phone: '+1 (555) 123-4567',
    emergency_contact_relationship: 'Parent',
    nationality: 'American',
    union_membership: null,
    ethnicity: null,
    tattoos: false,
    piercings: false,
    phone: null,
    bust: 32,
    waist: 25,
    hips: 35,
    shoe_size: '9 US',
    eye_color: 'Brown',
    hair_color: 'Blonde',
    specialties: JSON.stringify(['Editorial', 'Commercial'])
  });

  // Create Elara Keats images (using Unsplash URLs for demo)
  const elaraImages = [
    {
      id: uuidv4(),
      profile_id: elaraProfileId,
      path: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1000&q=80',
      label: 'Headshot',
      sort: 1
    },
    {
      id: uuidv4(),
      profile_id: elaraProfileId,
      path: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80',
      label: 'Editorial',
      sort: 2
    },
    {
      id: uuidv4(),
      profile_id: elaraProfileId,
      path: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1000&q=80',
      label: 'Runway',
      sort: 3
    },
    {
      id: uuidv4(),
      profile_id: elaraProfileId,
      path: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=1000&q=80',
      label: 'Portfolio',
      sort: 4
    }
  ];

  for (const img of elaraImages) {
    await knex('images').insert(img);
  }

  // Create another talent profile (original example)
  const profileId = uuidv4();
  await knex('profiles').insert({
    id: profileId,
    user_id: talentId,
    slug: 'talent-example',
    first_name: 'Sample',
    last_name: 'Talent',
    city: 'New York, NY',
    height_cm: 177,
    measurements: '34-26-36',
    bio_raw: 'Sample talent profile for testing.',
    bio_curated: 'Sample talent profile for testing purposes.',
    hero_image_path: '/uploads/seed/elara-headshot.webp',
    partner_agency_id: agencyId
  });

  const imageBase = [
    { label: 'Headshot', file: 'elara-headshot.webp', sort: 1 },
    { label: 'Editorial', file: 'elara-editorial.webp', sort: 2 },
    { label: 'Runway', file: 'elara-runway.webp', sort: 3 }
  ];

  for (const img of imageBase) {
    await knex('images').insert({
      id: uuidv4(),
      profile_id: profileId,
      path: `/uploads/seed/${img.file}`,
      label: img.label,
      sort: img.sort
    });
  }

  // ============================================
  // 4 PLACEHOLDER APPLICANTS FOR AGENCY DASHBOARD
  // ============================================

  // Profile 1: New Application (pending, no viewed_at, recent)
  const applicant1UserId = uuidv4();
  await knex('users').insert({
    id: applicant1UserId,
    email: 'sophia.martinez@example.com',
    password_hash: passwordHash,
    role: 'TALENT'
  });

  const applicant1ProfileId = uuidv4();
  await knex('profiles').insert({
    id: applicant1ProfileId,
    user_id: applicant1UserId,
    slug: 'sophia-martinez',
    first_name: 'Sophia',
    last_name: 'Martinez',
    city: 'Miami, FL',
    height_cm: 175,
    measurements: '34-24-36',
    bio_raw: 'Sophia Martinez is an emerging talent with a fresh, editorial look. Based in Miami, she brings a vibrant energy to every shoot. Her versatility spans from high-fashion editorials to commercial campaigns.',
    bio_curated: 'Sophia Martinez is an emerging talent with a fresh, editorial look. Based in Miami, she brings a vibrant energy to every shoot. Standing at 5\'9" with measurements of 34-24-36, her versatility spans from high-fashion editorials to commercial campaigns. She has a natural ability to adapt to different creative directions and brings professionalism to every production.',
    hero_image_path: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=2000&q=80',
    is_pro: false,
    pdf_theme: null,
    pdf_customizations: null,
    partner_agency_id: null,
    gender: 'Female',
    date_of_birth: '2000-03-22',
    age: 24,
    weight_kg: 55,
    weight_lbs: 121,
    dress_size: '2',
    hair_length: 'Medium',
    skin_tone: 'Medium',
    languages: JSON.stringify(['English', 'Spanish']),
    availability_travel: true,
    availability_schedule: 'Full-time',
    experience_level: 'Emerging',
    training: 'Fashion modeling courses, runway training, commercial acting workshops.',
    portfolio_url: 'https://sophiamartinez.portfolio.com',
    instagram_handle: 'sophiamartinez',
    instagram_url: null,
    twitter_handle: null,
    twitter_url: null,
    tiktok_handle: 'sophiamartinez',
    tiktok_url: null,
    reference_name: 'Maria Rodriguez',
    reference_email: 'maria@example.com',
    reference_phone: '+1 (305) 555-0123',
    reference_relationship: 'Photographer',
    emergency_contact_name: 'Carlos Martinez',
    emergency_contact_phone: '+1 (305) 555-0124',
    emergency_contact_relationship: 'Father',
    nationality: 'American',
    union_membership: null,
    ethnicity: 'Hispanic',
    tattoos: false,
    piercings: true,
    phone: '+1 (305) 555-0101',
    bust: 34,
    waist: 24,
    hips: 36,
    shoe_size: '8.5 US',
    eye_color: 'Brown',
    hair_color: 'Dark Brown',
    specialties: JSON.stringify(['Editorial', 'Commercial', 'Runway'])
  });

  const applicant1Images = [
    {
      id: uuidv4(),
      profile_id: applicant1ProfileId,
      path: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1000&q=80',
      label: 'Headshot',
      sort: 1
    },
    {
      id: uuidv4(),
      profile_id: applicant1ProfileId,
      path: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80',
      label: 'Editorial',
      sort: 2
    },
    {
      id: uuidv4(),
      profile_id: applicant1ProfileId,
      path: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1000&q=80',
      label: 'Commercial',
      sort: 3
    }
  ];

  for (const img of applicant1Images) {
    await knex('images').insert(img);
  }

  // Application 1: New (pending, no viewed_at, recent)
  const application1Id = uuidv4();
  await knex('applications').insert({
    id: application1Id,
    profile_id: applicant1ProfileId,
    agency_id: agencyId,
    status: 'pending',
    created_at: knex.raw("NOW() - INTERVAL '2 days'"),
    updated_at: knex.raw("NOW() - INTERVAL '2 days'"),
    viewed_at: null,
    accepted_at: null,
    declined_at: null
  });

  // Profile 2: Under Review (pending, with viewed_at)
  const applicant2UserId = uuidv4();
  await knex('users').insert({
    id: applicant2UserId,
    email: 'alexander.chen@example.com',
    password_hash: passwordHash,
    role: 'TALENT'
  });

  const applicant2ProfileId = uuidv4();
  await knex('profiles').insert({
    id: applicant2ProfileId,
    user_id: applicant2UserId,
    slug: 'alexander-chen',
    first_name: 'Alexander',
    last_name: 'Chen',
    city: 'New York, NY',
    height_cm: 188,
    measurements: '40-32-38',
    bio_raw: 'Alexander Chen is an experienced model with a strong portfolio in editorial and commercial work. Based in New York, he has worked with top agencies and photographers. His chiseled features and professional demeanor make him ideal for high-end campaigns.',
    bio_curated: 'Alexander Chen is an experienced model with a strong portfolio in editorial and commercial work. Based in New York, he has worked with top agencies and photographers. Standing at 6\'2" with measurements of 40-32-38, his chiseled features and professional demeanor make him ideal for high-end campaigns. He brings reliability and creativity to every project.',
    hero_image_path: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=2000&q=80',
    is_pro: true,
    pdf_theme: null,
    pdf_customizations: null,
    partner_agency_id: null,
    gender: 'Male',
    date_of_birth: '1992-08-15',
    age: 32,
    weight_kg: 82,
    weight_lbs: 181,
    dress_size: null,
    hair_length: 'Short',
    skin_tone: 'Medium',
    languages: JSON.stringify(['English', 'Mandarin']),
    availability_travel: true,
    availability_schedule: 'Full-time',
    experience_level: 'Experienced',
    training: 'Professional modeling training, acting classes, fitness certification.',
    portfolio_url: 'https://alexanderchen.portfolio.com',
    instagram_handle: 'alexanderchen',
    instagram_url: 'https://instagram.com/alexanderchen',
    twitter_handle: 'alexanderchen',
    twitter_url: 'https://twitter.com/alexanderchen',
    tiktok_handle: null,
    tiktok_url: null,
    reference_name: 'David Kim',
    reference_email: 'david@example.com',
    reference_phone: '+1 (212) 555-0234',
    reference_relationship: 'Agent',
    emergency_contact_name: 'Lisa Chen',
    emergency_contact_phone: '+1 (212) 555-0235',
    emergency_contact_relationship: 'Spouse',
    nationality: 'American',
    union_membership: 'SAG-AFTRA',
    ethnicity: 'Asian',
    tattoos: true,
    piercings: false,
    phone: '+1 (212) 555-0202',
    bust: 40,
    waist: 32,
    hips: 38,
    shoe_size: '11 US',
    eye_color: 'Brown',
    hair_color: 'Black',
    specialties: JSON.stringify(['Editorial', 'Commercial', 'Fitness'])
  });

  const applicant2Images = [
    {
      id: uuidv4(),
      profile_id: applicant2ProfileId,
      path: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1000&q=80',
      label: 'Headshot',
      sort: 1
    },
    {
      id: uuidv4(),
      profile_id: applicant2ProfileId,
      path: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1000&q=80',
      label: 'Editorial',
      sort: 2
    },
    {
      id: uuidv4(),
      profile_id: applicant2ProfileId,
      path: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1000&q=80',
      label: 'Commercial',
      sort: 3
    },
    {
      id: uuidv4(),
      profile_id: applicant2ProfileId,
      path: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=1000&q=80',
      label: 'Fitness',
      sort: 4
    }
  ];

  for (const img of applicant2Images) {
    await knex('images').insert(img);
  }

  // Application 2: Under Review (pending, with viewed_at)
  const application2Id = uuidv4();
  await knex('applications').insert({
    id: application2Id,
    profile_id: applicant2ProfileId,
    agency_id: agencyId,
    status: 'pending',
    created_at: knex.raw("NOW() - INTERVAL '7 days'"),
    updated_at: knex.raw("NOW() - INTERVAL '2 days'"),
    viewed_at: knex.raw("NOW() - INTERVAL '2 days'"),
    accepted_at: null,
    declined_at: null
  });

  // Profile 3: Accepted
  const applicant3UserId = uuidv4();
  await knex('users').insert({
    id: applicant3UserId,
    email: 'isabella.thompson@example.com',
    password_hash: passwordHash,
    role: 'TALENT'
  });

  const applicant3ProfileId = uuidv4();
  await knex('profiles').insert({
    id: applicant3ProfileId,
    user_id: applicant3UserId,
    slug: 'isabella-thompson',
    first_name: 'Isabella',
    last_name: 'Thompson',
    city: 'Los Angeles, CA',
    height_cm: 178,
    measurements: '33-25-35',
    bio_raw: 'Isabella Thompson is an established model with extensive experience in runway, editorial, and commercial work. Based in Los Angeles, she has walked for major fashion weeks and appeared in numerous high-profile campaigns. Her professionalism and versatility make her a valuable addition to any project.',
    bio_curated: 'Isabella Thompson is an established model with extensive experience in runway, editorial, and commercial work. Based in Los Angeles, she has walked for major fashion weeks and appeared in numerous high-profile campaigns. Standing at 5\'10" with measurements of 33-25-35, her professionalism and versatility make her a valuable addition to any project. She brings years of industry experience and a collaborative spirit to every production.',
    hero_image_path: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=2000&q=80',
    is_pro: true,
    pdf_theme: null,
    pdf_customizations: null,
    partner_agency_id: null,
    gender: 'Female',
    date_of_birth: '1990-11-08',
    age: 34,
    weight_kg: 57,
    weight_lbs: 126,
    dress_size: '4',
    hair_length: 'Long',
    skin_tone: 'Fair',
    languages: JSON.stringify(['English', 'French']),
    availability_travel: true,
    availability_schedule: 'Full-time',
    experience_level: 'Experienced',
    training: 'Professional runway training, editorial modeling, commercial acting, dance background.',
    portfolio_url: 'https://isabellathompson.portfolio.com',
    instagram_handle: 'isabellathompson',
    instagram_url: 'https://instagram.com/isabellathompson',
    twitter_handle: 'isabellathompson',
    twitter_url: 'https://twitter.com/isabellathompson',
    tiktok_handle: 'isabellathompson',
    tiktok_url: 'https://tiktok.com/@isabellathompson',
    reference_name: 'Michael Johnson',
    reference_email: 'michael@example.com',
    reference_phone: '+1 (310) 555-0345',
    reference_relationship: 'Creative Director',
    emergency_contact_name: 'Robert Thompson',
    emergency_contact_phone: '+1 (310) 555-0346',
    emergency_contact_relationship: 'Husband',
    nationality: 'American',
    union_membership: 'SAG-AFTRA',
    ethnicity: 'Caucasian',
    tattoos: false,
    piercings: false,
    phone: '+1 (310) 555-0303',
    bust: 33,
    waist: 25,
    hips: 35,
    shoe_size: '9 US',
    eye_color: 'Blue',
    hair_color: 'Blonde',
    specialties: JSON.stringify(['Runway', 'Editorial', 'Commercial', 'High Fashion'])
  });

  const applicant3Images = [
    {
      id: uuidv4(),
      profile_id: applicant3ProfileId,
      path: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=1000&q=80',
      label: 'Headshot',
      sort: 1
    },
    {
      id: uuidv4(),
      profile_id: applicant3ProfileId,
      path: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80',
      label: 'Runway',
      sort: 2
    },
    {
      id: uuidv4(),
      profile_id: applicant3ProfileId,
      path: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=1000&q=80',
      label: 'Editorial',
      sort: 3
    },
    {
      id: uuidv4(),
      profile_id: applicant3ProfileId,
      path: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1000&q=80',
      label: 'Commercial',
      sort: 4
    }
  ];

  for (const img of applicant3Images) {
    await knex('images').insert(img);
  }

  // Application 3: Accepted
  const application3Id = uuidv4();
  await knex('applications').insert({
    id: application3Id,
    profile_id: applicant3ProfileId,
    agency_id: agencyId,
    status: 'accepted',
    created_at: knex.raw("NOW() - INTERVAL '30 days'"),
    updated_at: knex.raw("NOW() - INTERVAL '10 days'"),
    viewed_at: knex.raw("NOW() - INTERVAL '25 days'"),
    accepted_at: knex.raw("NOW() - INTERVAL '10 days'"),
    declined_at: null
  });

  // Profile 4: Declined
  const applicant4UserId = uuidv4();
  await knex('users').insert({
    id: applicant4UserId,
    email: 'james.wilson@example.com',
    password_hash: passwordHash,
    role: 'TALENT'
  });

  const applicant4ProfileId = uuidv4();
  await knex('profiles').insert({
    id: applicant4ProfileId,
    user_id: applicant4UserId,
    slug: 'james-wilson',
    first_name: 'James',
    last_name: 'Wilson',
    city: 'Chicago, IL',
    height_cm: 183,
    measurements: '42-34-40',
    bio_raw: 'James Wilson is a commercial model with experience in print and digital campaigns. Based in Chicago, he specializes in lifestyle and product photography. His approachable look and professional attitude make him ideal for commercial work.',
    bio_curated: 'James Wilson is a commercial model with experience in print and digital campaigns. Based in Chicago, he specializes in lifestyle and product photography. Standing at 6\'0" with measurements of 42-34-40, his approachable look and professional attitude make him ideal for commercial work. He brings reliability and a positive energy to every shoot.',
    hero_image_path: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=2000&q=80',
    is_pro: false,
    pdf_theme: null,
    pdf_customizations: null,
    partner_agency_id: null,
    gender: 'Male',
    date_of_birth: '1994-05-20',
    age: 30,
    weight_kg: 85,
    weight_lbs: 187,
    dress_size: null,
    hair_length: 'Short',
    skin_tone: 'Fair',
    languages: JSON.stringify(['English']),
    availability_travel: false,
    availability_schedule: 'Part-time',
    experience_level: 'Intermediate',
    training: 'Commercial modeling workshops, acting classes.',
    portfolio_url: 'https://jameswilson.portfolio.com',
    instagram_handle: 'jameswilson',
    instagram_url: null,
    twitter_handle: null,
    twitter_url: null,
    tiktok_handle: null,
    tiktok_url: null,
    reference_name: 'Sarah Davis',
    reference_email: 'sarah@example.com',
    reference_phone: '+1 (312) 555-0456',
    reference_relationship: 'Photographer',
    emergency_contact_name: 'Patricia Wilson',
    emergency_contact_phone: '+1 (312) 555-0457',
    emergency_contact_relationship: 'Mother',
    nationality: 'American',
    union_membership: null,
    ethnicity: 'Caucasian',
    tattoos: false,
    piercings: false,
    phone: '+1 (312) 555-0404',
    bust: 42,
    waist: 34,
    hips: 40,
    shoe_size: '10.5 US',
    eye_color: 'Green',
    hair_color: 'Brown',
    specialties: JSON.stringify(['Commercial', 'Lifestyle'])
  });

  const applicant4Images = [
    {
      id: uuidv4(),
      profile_id: applicant4ProfileId,
      path: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=1000&q=80',
      label: 'Headshot',
      sort: 1
    },
    {
      id: uuidv4(),
      profile_id: applicant4ProfileId,
      path: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1000&q=80',
      label: 'Commercial',
      sort: 2
    },
    {
      id: uuidv4(),
      profile_id: applicant4ProfileId,
      path: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1000&q=80',
      label: 'Lifestyle',
      sort: 3
    }
  ];

  for (const img of applicant4Images) {
    await knex('images').insert(img);
  }

  // Application 4: Declined
  const application4Id = uuidv4();
  await knex('applications').insert({
    id: application4Id,
    profile_id: applicant4ProfileId,
    agency_id: agencyId,
    status: 'declined',
    created_at: knex.raw("NOW() - INTERVAL '15 days'"),
    updated_at: knex.raw("NOW() - INTERVAL '12 days'"),
    viewed_at: knex.raw("NOW() - INTERVAL '14 days'"),
    accepted_at: null,
    declined_at: knex.raw("NOW() - INTERVAL '12 days'")
  });
};
