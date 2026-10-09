import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const doctors = [
  {
    id: 'vadodara-1',
    type: 'Hospital',
    name: 'BuildingRace Hospital',
    specialty: 'Gynecology & Obstetrics',
    address: 'Race Course Road, Near Natubhai Circle, Vadodara, Gujarat',
    phone: '+91 265 278 0000',
    latitude: 22.2987,
    longitude: 73.1989,
    availability: [
      { date: '2026-09-02', slot: '09:30 AM' },
      { date: '2026-09-03', slot: '11:00 AM' },
      { date: '2026-09-05', slot: '02:15 PM' },
    ],
  },
  {
    id: 'vadodara-2',
    type: 'Hospital',
    name: 'Jetalpur Road Multispecialty Hospital',
    specialty: 'Advanced Multispecialty Care',
    address: 'Jetalpur Road, behind Gujarat Kidney Hospital, Vadodara, Gujarat',
    phone: '+91 265 246 1111',
    latitude: 22.2868,
    longitude: 73.1569,
    availability: [
      { date: '2026-09-02', slot: '10:45 AM' },
      { date: '2026-09-04', slot: '12:30 PM' },
      { date: '2026-09-06', slot: '04:00 PM' },
    ],
  },
  {
    id: 'vadodara-3',
    type: 'Hospital',
    name: 'Sun-Pharma Hospital',
    specialty: 'Women’s Care Unit & Gynae Services',
    address: 'Sun-Pharma Atladra Road, opposite ICAI Bhavan, Vadodara, Gujarat',
    phone: '+91 265 256 2222',
    latitude: 22.2876,
    longitude: 73.1521,
    availability: [
      { date: '2026-09-03', slot: '01:15 PM' },
      { date: '2026-09-05', slot: '09:00 AM' },
      { date: '2026-09-07', slot: '03:30 PM' },
    ],
  },
  {
    id: 'vadodara-4',
    type: 'Hospital',
    name: 'Akshar Hospital',
    specialty: 'High-risk Pregnancy & Laparoscopic Gynae Care',
    address: 'Akshar Chowk, Old Padra Road, Vadodara, Gujarat',
    phone: '+91 265 234 3333',
    latitude: 22.3034,
    longitude: 73.1775,
    availability: [
      { date: '2026-09-02', slot: '08:30 AM' },
      { date: '2026-09-04', slot: '01:00 PM' },
      { date: '2026-09-08', slot: '05:15 PM' },
    ],
  },
  {
    id: 'vadodara-5',
    type: 'Clinic',
    name: 'Dr. Reshmi Banerjee Clinic',
    specialty: 'Women’s Health, Maternity & Gynae',
    address: 'GF 1,2 & FF 1,2,3, Syamal Sapphire, Gotri-Vasna Link Road, near Nilamber Circle, Vadodara, Gujarat',
    phone: '+91 265 289 4444',
    latitude: 22.3235,
    longitude: 73.1649,
    availability: [
      { date: '2026-09-03', slot: '10:00 AM' },
      { date: '2026-09-05', slot: '11:30 AM' },
      { date: '2026-09-08', slot: '02:45 PM' },
    ],
  },
  {
    id: 'vadodara-6',
    type: 'Hospital',
    name: 'Waghodia Hospital',
    specialty: 'Obstetrics & Gynecology',
    address: 'P.O. Limda, Taluka Waghodia, Vadodara, Gujarat',
    phone: '+91 265 244 5555',
    latitude: 22.3428,
    longitude: 73.2723,
    availability: [
      { date: '2026-09-04', slot: '09:15 AM' },
      { date: '2026-09-06', slot: '12:00 PM' },
      { date: '2026-09-09', slot: '04:30 PM' },
    ],
  },
  {
    id: 'vadodara-7',
    type: 'Hospital',
    name: 'Shree Krishna Hospital',
    specialty: 'Gynecology & Obstetrics',
    address: 'Near Akota, Vadodara, Gujarat',
    phone: '+91 265 666 7000',
    latitude: 22.2932,
    longitude: 73.1945,
    availability: [
      { date: '2026-09-02', slot: '09:30 AM' },
      { date: '2026-09-03', slot: '11:00 AM' },
      { date: '2026-09-05', slot: '02:15 PM' },
    ],
  },
  {
    id: 'vadodara-8',
    type: 'Clinic',
    name: 'Apex Women’s Clinic',
    specialty: 'Reproductive Health & Fertility',
    address: 'Alkapuri, Vadodara, Gujarat',
    phone: '+91 265 234 1122',
    latitude: 22.3089,
    longitude: 73.181,
    availability: [
      { date: '2026-09-02', slot: '10:45 AM' },
      { date: '2026-09-04', slot: '12:30 PM' },
      { date: '2026-09-06', slot: '04:00 PM' },
    ],
  },
  {
    id: 'vadodara-9',
    type: 'Hospital',
    name: 'Nandaben Hospital',
    specialty: 'Women Health & Gynae',
    address: 'Tarsali, Vadodara, Gujarat',
    phone: '+91 265 256 3344',
    latitude: 22.289,
    longitude: 73.1838,
    availability: [
      { date: '2026-09-03', slot: '01:15 PM' },
      { date: '2026-09-05', slot: '09:00 AM' },
      { date: '2026-09-07', slot: '03:30 PM' },
    ],
  },
  {
    id: 'vadodara-10',
    type: 'Clinic',
    name: 'Dr. Meera Shah Gynae Clinic',
    specialty: 'PCOS, Menstrual Health',
    address: 'Manjalpur, Vadodara, Gujarat',
    phone: '+91 265 654 8899',
    latitude: 22.2696,
    longitude: 73.1997,
    availability: [
      { date: '2026-09-02', slot: '08:30 AM' },
      { date: '2026-09-04', slot: '01:00 PM' },
      { date: '2026-09-08', slot: '05:15 PM' },
    ],
  },
];

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'FemCare support service' });
});

app.get('/api/clinics', (req, res) => {
  res.json({ centers: doctors });
});

app.get('/api/clinics/:id', (req, res) => {
  const clinic = doctors.find((entry) => entry.id === req.params.id);
  if (!clinic) {
    return res.status(404).json({ error: 'Clinic not found' });
  }
  return res.json({ clinic });
});

app.post('/api/chat', (req, res) => {
  const { message = '', context = {} } = req.body || {};
  const input = String(message).trim();

  if (!input) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const cycleDay = Number(context.cycleDay || 1);
  const cycleLength = Number(context.cycleLength || 28);
  const phase = context.phase || 'Menstrual';
  const symptomList = Array.isArray(context.symptoms) && context.symptoms.length ? context.symptoms.join(', ') : 'no major symptoms logged';

  const reply = [
    'What we know',
    `- Your cycle currently appears to be in the ${phase} phase, with a reported cycle length around ${cycleLength} days.`,
    `- The current cycle day is ${cycleDay}, and your recent symptoms are ${symptomList}.`,
    'What your data suggests',
    '- This summary is not a diagnosis, but it helps contextualize symptoms and timing in relation to your cycle.',
    '- If you are having increased pain, bleeding, mood changes, or significant fatigue, it may need a clinician review.',
    'What you can do',
    '- Keep hydration, sleep, and regular meals consistent.',
    '- Track bleeding, pain, and symptom changes for the next few cycles.',
    '- Consider medical review if the pattern is unusually irregular or severe.',
    'When to seek professional care',
    '- Heavy bleeding, fainting, severe pain, fever, or sudden worsening symptoms.',
    '- If cycles are very irregular or symptoms persist for more than a few cycles.'
  ].join('\n\n');

  return res.json({ reply });
});

app.post('/api/book-appointment', (req, res) => {
  const { hospital, doctor, date, slot } = req.body || {};

  if (!hospital || !doctor || !date || !slot) {
    return res.status(400).json({ error: 'Missing booking details' });
  }

  const existing = globalThis.__femcareBookings || [];
  const duplicate = existing.some((entry) => entry.hospital === hospital && entry.doctor === doctor && entry.date === date && entry.slot === slot);

  if (duplicate) {
    return res.status(409).json({ error: 'Duplicate booking already exists' });
  }

  const record = { id: `${Date.now()}`, hospital, doctor, date, slot, createdAt: new Date().toISOString() };
  globalThis.__femcareBookings = [...existing, record];
  return res.status(201).json({ success: true, booking: record });
});

app.get('/api/bookings', (req, res) => {
  res.json({ bookings: globalThis.__femcareBookings || [] });
});

app.listen(PORT, () => {
  console.log(`FemCare service running on http://localhost:${PORT}`);
});
