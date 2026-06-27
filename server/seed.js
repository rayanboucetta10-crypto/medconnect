require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const DoctorProfile = require('./models/DoctorProfile');
const Conversation = require('./models/Conversation');
const Message = require('./models/Message');
const Consultation = require('./models/Consultation');
const Review = require('./models/Review');

const CITIES = ['Casablanca', 'Paris', 'London', 'New York', 'Dubai'];

const DOCTORS_DATA = [
  {
    name: 'Dr. Amina Bensalah', email: 'amina.bensalah@medconnect.app', city: 'Casablanca',
    specialty: 'Cardiology', bio: 'Board-certified cardiologist with 18 years of clinical experience at CHU Ibn Rochd. Specializing in preventive cardiology, heart failure management, and interventional procedures. I believe in treating the whole patient, not just the condition.',
    education: [{ degree: 'MD', institution: 'Université Hassan II, Casablanca', year: 2005 }, { degree: 'Fellowship in Interventional Cardiology', institution: 'Hôpital Lariboisière, Paris', year: 2009 }],
    affiliations: [{ name: 'CHU Ibn Rochd', city: 'Casablanca' }, { name: 'Clinique Internationale', city: 'Casablanca' }],
    languages: ['Arabic', 'French', 'English'], experience: 18, priceMsg: 40, priceVideo: 80,
    rating: 4.9, consultations: 1240, available: true,
    schedule: { monday: { start: '09:00', end: '17:00', available: true }, tuesday: { start: '09:00', end: '17:00', available: true }, wednesday: { start: '14:00', end: '20:00', available: true }, thursday: { start: '09:00', end: '17:00', available: true }, friday: { start: '09:00', end: '13:00', available: true }, saturday: { available: false }, sunday: { available: false } },
  },
  {
    name: 'Dr. Pierre Moreau', email: 'pierre.moreau@medconnect.app', city: 'Paris',
    specialty: 'Neurology', bio: 'Neurologist at Hôpital de la Pitié-Salpêtrière, Paris. Expert in epilepsy, migraines, and movement disorders. Published researcher with over 40 peer-reviewed articles. My consultations are thorough and evidence-based.',
    education: [{ degree: 'MD', institution: 'Université Paris VI', year: 2003 }, { degree: 'PhD in Neuroscience', institution: 'Sorbonne', year: 2007 }],
    affiliations: [{ name: 'Hôpital Pitié-Salpêtrière', city: 'Paris' }],
    languages: ['French', 'English', 'Spanish'], experience: 21, priceMsg: 55, priceVideo: 110,
    rating: 4.8, consultations: 987, available: false,
    schedule: { monday: { start: '08:00', end: '16:00', available: true }, tuesday: { available: false }, wednesday: { start: '08:00', end: '16:00', available: true }, thursday: { available: false }, friday: { start: '08:00', end: '16:00', available: true }, saturday: { available: false }, sunday: { available: false } },
  },
  {
    name: 'Dr. Sarah Okafor', email: 'sarah.okafor@medconnect.app', city: 'London',
    specialty: 'Dermatology', bio: 'Consultant Dermatologist at King\'s College Hospital London. Expertise in medical and cosmetic dermatology, acne, eczema, psoriasis, and skin cancer screening. Committed to accessible, empathetic skin care.',
    education: [{ degree: 'MBBS', institution: 'University College London', year: 2008 }, { degree: 'MD in Dermatology', institution: 'Royal College of Physicians', year: 2013 }],
    affiliations: [{ name: "King's College Hospital", city: 'London' }, { name: 'St Thomas\' Hospital', city: 'London' }],
    languages: ['English', 'Yoruba'], experience: 15, priceMsg: 50, priceVideo: 95,
    rating: 4.7, consultations: 2103, available: true,
    schedule: { monday: { start: '10:00', end: '18:00', available: true }, tuesday: { start: '10:00', end: '18:00', available: true }, wednesday: { available: false }, thursday: { start: '10:00', end: '18:00', available: true }, friday: { start: '10:00', end: '15:00', available: true }, saturday: { start: '09:00', end: '13:00', available: true }, sunday: { available: false } },
  },
  {
    name: 'Dr. James Harrington', email: 'james.harrington@medconnect.app', city: 'New York',
    specialty: 'Psychiatry', bio: 'Board-certified psychiatrist in Manhattan, specializing in anxiety disorders, depression, PTSD, and mood disorders. I offer a compassionate, non-judgmental space for healing. Telepsychiatry and in-person sessions available.',
    education: [{ degree: 'MD', institution: 'Columbia University', year: 2006 }, { degree: 'Residency in Psychiatry', institution: 'NYU Langone', year: 2010 }],
    affiliations: [{ name: 'NYU Langone Medical Center', city: 'New York' }],
    languages: ['English'], experience: 18, priceMsg: 70, priceVideo: 140,
    rating: 4.9, consultations: 3412, available: true,
    schedule: { monday: { start: '09:00', end: '18:00', available: true }, tuesday: { start: '09:00', end: '18:00', available: true }, wednesday: { start: '09:00', end: '18:00', available: true }, thursday: { start: '09:00', end: '18:00', available: true }, friday: { start: '09:00', end: '14:00', available: true }, saturday: { available: false }, sunday: { available: false } },
  },
  {
    name: 'Dr. Fatima Al-Rashidi', email: 'fatima.alrashidi@medconnect.app', city: 'Dubai',
    specialty: 'Pediatrics', bio: 'Pediatrician at Dubai Hospital with 12 years of experience caring for children from birth through adolescence. Fluent in Arabic and English, with a warm approach that puts children and parents at ease.',
    education: [{ degree: 'MBBS', institution: 'UAE University, Al Ain', year: 2011 }, { degree: 'Fellowship in Pediatrics', institution: 'Great Ormond Street, London', year: 2015 }],
    affiliations: [{ name: 'Dubai Hospital', city: 'Dubai' }, { name: 'Mediclinic City Hospital', city: 'Dubai' }],
    languages: ['Arabic', 'English'], experience: 12, priceMsg: 45, priceVideo: 90,
    rating: 4.8, consultations: 1876, available: true,
    schedule: { monday: { start: '09:00', end: '17:00', available: true }, tuesday: { start: '09:00', end: '17:00', available: true }, wednesday: { start: '09:00', end: '17:00', available: true }, thursday: { start: '09:00', end: '17:00', available: true }, friday: { available: false }, saturday: { start: '10:00', end: '14:00', available: true }, sunday: { available: false } },
  },
  {
    name: 'Dr. Youssef El Alami', email: 'youssef.elalami@medconnect.app', city: 'Casablanca',
    specialty: 'Orthopedics', bio: 'Orthopedic surgeon specializing in sports medicine and joint replacement at Clinique Ain Borja, Casablanca. Experience treating professional athletes and active patients of all ages.',
    education: [{ degree: 'MD', institution: 'Université Mohammed V, Rabat', year: 2007 }, { degree: 'Fellowship in Sports Medicine', institution: 'Hospital for Special Surgery, New York', year: 2012 }],
    affiliations: [{ name: 'Clinique Ain Borja', city: 'Casablanca' }],
    languages: ['Arabic', 'French', 'English'], experience: 17, priceMsg: 50, priceVideo: 100,
    rating: 4.6, consultations: 890, available: false,
    schedule: { monday: { start: '08:00', end: '16:00', available: true }, tuesday: { available: false }, wednesday: { start: '08:00', end: '16:00', available: true }, thursday: { start: '08:00', end: '16:00', available: true }, friday: { start: '08:00', end: '12:00', available: true }, saturday: { available: false }, sunday: { available: false } },
  },
  {
    name: 'Dr. Claire Fontaine', email: 'claire.fontaine@medconnect.app', city: 'Paris',
    specialty: 'Gynecology & Obstetrics', bio: 'OB/GYN at Hôpital Necker, Paris. Over 16 years helping women navigate all stages of reproductive health — from contraception and fertility to high-risk pregnancy and menopause care.',
    education: [{ degree: 'MD', institution: 'Université Paris Descartes', year: 2004 }, { degree: 'Specialization in Obstetrics', institution: 'Hôpital Necker', year: 2008 }],
    affiliations: [{ name: 'Hôpital Necker-Enfants Malades', city: 'Paris' }],
    languages: ['French', 'English'], experience: 20, priceMsg: 60, priceVideo: 120,
    rating: 4.9, consultations: 4210, available: true,
    schedule: { monday: { start: '09:00', end: '17:00', available: true }, tuesday: { start: '09:00', end: '17:00', available: true }, wednesday: { start: '09:00', end: '17:00', available: true }, thursday: { available: false }, friday: { start: '09:00', end: '14:00', available: true }, saturday: { available: false }, sunday: { available: false } },
  },
  {
    name: 'Dr. Marcus Webb', email: 'marcus.webb@medconnect.app', city: 'London',
    specialty: 'Oncology', bio: 'Consultant Medical Oncologist at The Christie NHS Foundation Trust. Specializing in lung, colorectal, and breast cancers. Focused on precision oncology and clinical trial-based treatment approaches.',
    education: [{ degree: 'MBBS', institution: 'University of Oxford', year: 2002 }, { degree: 'MRCP Oncology', institution: 'Royal College of Physicians', year: 2007 }],
    affiliations: [{ name: 'The Christie NHS Foundation Trust', city: 'Manchester' }, { name: 'University College London Hospital', city: 'London' }],
    languages: ['English'], experience: 23, priceMsg: 80, priceVideo: 160,
    rating: 4.7, consultations: 628, available: false,
    schedule: { monday: { start: '10:00', end: '16:00', available: true }, tuesday: { available: false }, wednesday: { start: '10:00', end: '16:00', available: true }, thursday: { start: '10:00', end: '16:00', available: true }, friday: { available: false }, saturday: { available: false }, sunday: { available: false } },
  },
  {
    name: 'Dr. Emily Chen', email: 'emily.chen@medconnect.app', city: 'New York',
    specialty: 'Endocrinology', bio: 'Endocrinologist at Mount Sinai Hospital, NYC. Diabetes, thyroid disorders, hormonal imbalances, and metabolic conditions are my focus. I partner with patients to create sustainable health plans.',
    education: [{ degree: 'MD', institution: 'Harvard Medical School', year: 2007 }, { degree: 'Fellowship in Endocrinology', institution: 'Mount Sinai Hospital', year: 2012 }],
    affiliations: [{ name: 'Mount Sinai Hospital', city: 'New York' }],
    languages: ['English', 'Mandarin'], experience: 17, priceMsg: 65, priceVideo: 130,
    rating: 4.8, consultations: 1543, available: true,
    schedule: { monday: { start: '09:00', end: '17:00', available: true }, tuesday: { start: '09:00', end: '17:00', available: true }, wednesday: { available: false }, thursday: { start: '09:00', end: '17:00', available: true }, friday: { start: '09:00', end: '17:00', available: true }, saturday: { available: false }, sunday: { available: false } },
  },
  {
    name: 'Dr. Omar Khalil', email: 'omar.khalil@medconnect.app', city: 'Dubai',
    specialty: 'Gastroenterology', bio: 'Gastroenterologist at Cleveland Clinic Abu Dhabi with expertise in IBD, liver diseases, and therapeutic endoscopy. Bilingual consultations in Arabic and English.',
    education: [{ degree: 'MD', institution: 'Cairo University', year: 2005 }, { degree: 'Fellowship in Gastroenterology', institution: 'Cleveland Clinic, Ohio', year: 2010 }],
    affiliations: [{ name: 'Cleveland Clinic Abu Dhabi', city: 'Abu Dhabi' }, { name: 'American Hospital Dubai', city: 'Dubai' }],
    languages: ['Arabic', 'English', 'French'], experience: 19, priceMsg: 55, priceVideo: 110,
    rating: 4.7, consultations: 1122, available: true,
    schedule: { monday: { start: '09:00', end: '18:00', available: true }, tuesday: { start: '09:00', end: '18:00', available: true }, wednesday: { start: '09:00', end: '18:00', available: true }, thursday: { start: '09:00', end: '18:00', available: true }, friday: { available: false }, saturday: { start: '09:00', end: '13:00', available: true }, sunday: { available: false } },
  },
  {
    name: 'Dr. Rachida Tazi', email: 'rachida.tazi@medconnect.app', city: 'Casablanca',
    specialty: 'Ophthalmology', bio: 'Ophthalmologist at Institut Spécialisé de l\'Ophtalmologie in Casablanca. Expert in refractive surgery, glaucoma, and retinal diseases. Modern surgical techniques, compassionate care.',
    education: [{ degree: 'MD', institution: 'Université Cadi Ayyad, Marrakech', year: 2008 }, { degree: 'Residency in Ophthalmology', institution: 'CHU Avicenne, Rabat', year: 2013 }],
    affiliations: [{ name: 'Institut Spécialisé de l\'Ophtalmologie', city: 'Casablanca' }],
    languages: ['Arabic', 'French', 'Darija'], experience: 15, priceMsg: 35, priceVideo: 70,
    rating: 4.6, consultations: 754, available: false,
    schedule: { monday: { start: '09:00', end: '16:00', available: true }, tuesday: { start: '09:00', end: '16:00', available: true }, wednesday: { available: false }, thursday: { start: '09:00', end: '16:00', available: true }, friday: { available: false }, saturday: { start: '09:00', end: '12:00', available: true }, sunday: { available: false } },
  },
  {
    name: 'Dr. Thomas Blanc', email: 'thomas.blanc@medconnect.app', city: 'Paris',
    specialty: 'General Practice', bio: 'Médecin Généraliste near Marais district, Paris. Your first point of contact for any health concern. Preventive care, chronic disease management, and referrals done thoughtfully.',
    education: [{ degree: 'MD in General Medicine', institution: 'Université Paris XI', year: 2010 }],
    affiliations: [{ name: 'Cabinet Médical du Marais', city: 'Paris' }],
    languages: ['French', 'English'], experience: 13, priceMsg: 25, priceVideo: 50,
    rating: 4.5, consultations: 3890, available: true,
    schedule: { monday: { start: '08:30', end: '19:00', available: true }, tuesday: { start: '08:30', end: '19:00', available: true }, wednesday: { start: '08:30', end: '19:00', available: true }, thursday: { start: '08:30', end: '19:00', available: true }, friday: { start: '08:30', end: '18:00', available: true }, saturday: { start: '09:00', end: '12:00', available: true }, sunday: { available: false } },
  },
  {
    name: 'Dr. Aisha Mohammed', email: 'aisha.mohammed@medconnect.app', city: 'Dubai',
    specialty: 'Internal Medicine', bio: 'Internist at Dubai Rashid Hospital. Comprehensive management of complex multi-system illnesses. Committed to evidence-based medicine and patient education in Arabic and English.',
    education: [{ degree: 'MBBS', institution: 'University of Sharjah', year: 2009 }, { degree: 'Fellowship in Internal Medicine', institution: 'Johns Hopkins', year: 2014 }],
    affiliations: [{ name: 'Dubai Rashid Hospital', city: 'Dubai' }],
    languages: ['Arabic', 'English', 'Urdu'], experience: 15, priceMsg: 50, priceVideo: 100,
    rating: 4.8, consultations: 1671, available: true,
    schedule: { monday: { start: '08:00', end: '17:00', available: true }, tuesday: { start: '08:00', end: '17:00', available: true }, wednesday: { start: '08:00', end: '17:00', available: true }, thursday: { start: '08:00', end: '17:00', available: true }, friday: { available: false }, saturday: { available: false }, sunday: { available: false } },
  },
  {
    name: 'Dr. Richard Thompson', email: 'richard.thompson@medconnect.app', city: 'New York',
    specialty: 'Rheumatology', bio: 'Rheumatologist at Hospital for Special Surgery, NYC. Specializing in rheumatoid arthritis, lupus, ankylosing spondylitis, and fibromyalgia. Precision treatment plans tailored to lifestyle.',
    education: [{ degree: 'MD', institution: 'Yale School of Medicine', year: 2004 }, { degree: 'Fellowship in Rheumatology', institution: 'Hospital for Special Surgery', year: 2009 }],
    affiliations: [{ name: 'Hospital for Special Surgery', city: 'New York' }],
    languages: ['English'], experience: 21, priceMsg: 75, priceVideo: 150,
    rating: 4.7, consultations: 998, available: false,
    schedule: { monday: { start: '09:00', end: '17:00', available: true }, tuesday: { start: '09:00', end: '17:00', available: true }, wednesday: { available: false }, thursday: { start: '09:00', end: '17:00', available: true }, friday: { start: '09:00', end: '15:00', available: true }, saturday: { available: false }, sunday: { available: false } },
  },
  {
    name: 'Dr. Nadia Lefort', email: 'nadia.lefort@medconnect.app', city: 'London',
    specialty: 'Pulmonology', bio: 'Respiratory physician at Royal Brompton Hospital, London. Specializing in asthma, COPD, pulmonary fibrosis, and sleep-disordered breathing. Fluent in French and English.',
    education: [{ degree: 'MD', institution: 'Université de Lyon', year: 2006 }, { degree: 'MRCP Respiratory Medicine', institution: 'Royal Brompton Hospital', year: 2011 }],
    affiliations: [{ name: 'Royal Brompton Hospital', city: 'London' }],
    languages: ['English', 'French'], experience: 18, priceMsg: 55, priceVideo: 110,
    rating: 4.8, consultations: 1234, available: true,
    schedule: { monday: { start: '09:00', end: '17:00', available: true }, tuesday: { start: '09:00', end: '17:00', available: true }, wednesday: { start: '09:00', end: '17:00', available: true }, thursday: { available: false }, friday: { start: '09:00', end: '17:00', available: true }, saturday: { available: false }, sunday: { available: false } },
  },
];

const PATIENTS_DATA = [
  { name: 'Rayan Boucetta', email: 'rayan@patient.com', city: 'Casablanca', dob: '1992-05-15' },
  { name: 'Sophie Martin', email: 'sophie@patient.com', city: 'Paris', dob: '1988-11-23' },
  { name: 'Liam Johnson', email: 'liam@patient.com', city: 'New York', dob: '1995-03-07' },
];

const REVIEW_COMMENTS = [
  'Excellent doctor! Very thorough and took time to explain everything clearly.',
  'Dr. was incredibly kind and professional. Highly recommend.',
  'Outstanding consultation — felt heard and well cared for.',
  'Very knowledgeable and approachable. Will definitely return.',
  'Great experience overall. Clear diagnosis and effective treatment.',
  'Compassionate and methodical. Made a stressful situation much easier.',
  'Professional, punctual, and genuinely caring. Five stars.',
  'The best doctor I have seen in years. Incredibly detailed.',
  'Efficient and empathetic. Answered all my questions patiently.',
  'Impressed by the level of care. Highly competent specialist.',
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Clean slate
  await Promise.all([
    User.deleteMany({}),
    DoctorProfile.deleteMany({}),
    Conversation.deleteMany({}),
    Message.deleteMany({}),
    Consultation.deleteMany({}),
    Review.deleteMany({}),
  ]);
  console.log('🗑️  Cleared existing data');

  const hash = await bcrypt.hash('Password123!', 12);

  // Create patients
  const patients = await User.insertMany(
    PATIENTS_DATA.map((p) => ({
      name: p.name,
      email: p.email,
      passwordHash: hash,
      role: 'patient',
      city: p.city,
      dateOfBirth: new Date(p.dob),
      profilePhoto: `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=1C3D2E&color=F7F4EF&size=200`,
    }))
  );
  console.log(`✅ Created ${patients.length} patients`);

  // Create doctors
  const doctorUsers = await User.insertMany(
    DOCTORS_DATA.map((d) => ({
      name: d.name,
      email: d.email,
      passwordHash: hash,
      role: 'doctor',
      city: d.city,
      profilePhoto: `https://ui-avatars.com/api/?name=${encodeURIComponent(d.name)}&background=B8964E&color=F7F4EF&size=200`,
    }))
  );

  await DoctorProfile.insertMany(
    DOCTORS_DATA.map((d, i) => ({
      userId: doctorUsers[i]._id,
      specialty: d.specialty,
      bio: d.bio,
      education: d.education,
      hospitalAffiliations: d.affiliations,
      languages: d.languages,
      consultationPriceMessage: d.priceMsg,
      consultationPriceVideo: d.priceVideo,
      schedule: d.schedule,
      rating: d.rating,
      totalConsultations: d.consultations,
      isAvailableNow: d.available,
      yearsOfExperience: d.experience,
      city: d.city,
    }))
  );
  console.log(`✅ Created ${doctorUsers.length} doctors`);

  // Create conversations and messages
  const convos = [];
  for (let i = 0; i < 5; i++) {
    const patient = patients[i % patients.length];
    const doctor = doctorUsers[i];
    const conv = await Conversation.create({ participants: [patient._id, doctor._id] });
    convos.push({ conv, patient, doctor });
  }

  let msgCount = 0;
  for (const { conv, patient, doctor } of convos) {
    const pairs = [
      { sender: patient, text: 'Hello Doctor, I have been experiencing chest pain for the past few days. Is this something I should be concerned about?' },
      { sender: doctor, text: 'Hello! Thank you for reaching out. Chest pain can have various causes. Could you describe the pain more — is it sharp or dull, and does it radiate anywhere?' },
      { sender: patient, text: 'It feels more like a pressure. Sometimes it radiates to my left arm.' },
      { sender: doctor, text: 'Given those symptoms, I strongly recommend we schedule a video consultation as soon as possible. Radiating chest pressure is something we should evaluate urgently. Can you do today?' },
    ];

    let lastMsg;
    for (const pair of pairs) {
      const msg = await Message.create({
        conversationId: conv._id,
        senderId: pair.sender._id,
        content: pair.text,
        readBy: [pair.sender._id],
        status: 'read',
        createdAt: new Date(Date.now() - (pairs.length - pairs.indexOf(pair)) * 3600000),
      });
      lastMsg = msg;
      msgCount++;
    }

    conv.lastMessage = lastMsg._id;
    conv.updatedAt = lastMsg.createdAt;
    await conv.save();
  }
  console.log(`✅ Created ${msgCount} messages across ${convos.length} conversations`);

  // Create consultations
  const now = new Date();
  const consultations = [];
  for (let i = 0; i < 8; i++) {
    const patient = patients[i % patients.length];
    const doctor = doctorUsers[(i * 2) % doctorUsers.length];
    const scheduled = new Date(now.getTime() + (i - 4) * 24 * 3600000);
    const status = i < 3 ? 'completed' : i < 5 ? 'confirmed' : 'pending';
    consultations.push({
      patientId: patient._id,
      doctorId: doctor._id,
      type: i % 2 === 0 ? 'video' : 'message',
      status,
      scheduledAt: scheduled,
      notes: status === 'completed' ? 'Patient presented with typical symptoms. Prescribed treatment plan. Follow-up in 2 weeks.' : '',
      price: i % 2 === 0 ? DOCTORS_DATA[(i * 2) % DOCTORS_DATA.length].priceVideo : DOCTORS_DATA[(i * 2) % DOCTORS_DATA.length].priceMsg,
    });
  }
  await Consultation.insertMany(consultations);
  console.log(`✅ Created ${consultations.length} consultations`);

  // Create reviews
  const reviewData = [];
  for (let i = 0; i < 10; i++) {
    const patient = patients[i % patients.length];
    const doctor = doctorUsers[i % doctorUsers.length];
    const rating = Math.round((4 + Math.random()) * 10) / 10;
    reviewData.push({
      doctorId: doctor._id,
      patientId: patient._id,
      rating: Math.min(5, Math.ceil(rating)),
      comment: REVIEW_COMMENTS[i % REVIEW_COMMENTS.length],
      createdAt: new Date(now.getTime() - i * 7 * 24 * 3600000),
    });
  }
  await Review.insertMany(reviewData);
  console.log(`✅ Created ${reviewData.length} reviews`);

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  MedConnect Seed Complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n  TEST CREDENTIALS (all use Password123!)');
  console.log('\n  PATIENTS:');
  PATIENTS_DATA.forEach((p) => console.log(`    ${p.email} / Password123!`));
  console.log('\n  DOCTORS (first 3):');
  DOCTORS_DATA.slice(0, 3).forEach((d) => console.log(`    ${d.email} / Password123!`));
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
