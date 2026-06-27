# MedConnect

**A full-stack medical consultation platform** — find doctors by city, consult via real-time messaging or WebRTC video call.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite, React Router v6 |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Real-time | Socket.io |
| Video calls | WebRTC via simple-peer |
| Auth | JWT (httpOnly cookies) |
| File uploads | Multer |
| Styling | Custom CSS design system (no framework) |
| Typography | Fraunces (headings) + DM Sans (body) — Google Fonts |

---

## Quick Start

### 1. Prerequisites
- Node.js ≥ 18
- MongoDB running locally on port 27017 (`mongod`)

### 2. Install dependencies

```bash
# Backend
cd medconnect/server
npm install

# Frontend
cd ../client
npm install
```

### 3. Seed the database

```bash
cd medconnect/server
node seed.js
```

This creates 15 doctors across 5 cities, 3 patients, sample conversations, consultations, and reviews.

### 4. Start the servers

**Terminal 1 — Backend:**
```bash
cd medconnect/server
npm run dev
# → http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd medconnect/client
npm run dev
# → http://localhost:5173
```

Open **http://localhost:5173**

---

## Test Accounts

All accounts use the password: **`Password123!`**

### Patients
| Email | Name | City |
|-------|------|------|
| `rayan@patient.com` | Rayan Boucetta | Casablanca |
| `sophie@patient.com` | Sophie Martin | Paris |
| `liam@patient.com` | Liam Johnson | New York |

### Doctors (sample)
| Email | Name | Specialty | City |
|-------|------|-----------|------|
| `amina.bensalah@medconnect.app` | Dr. Amina Bensalah | Cardiology | Casablanca |
| `pierre.moreau@medconnect.app` | Dr. Pierre Moreau | Neurology | Paris |
| `sarah.okafor@medconnect.app` | Dr. Sarah Okafor | Dermatology | London |
| `james.harrington@medconnect.app` | Dr. James Harrington | Psychiatry | New York |
| `fatima.alrashidi@medconnect.app` | Dr. Fatima Al-Rashidi | Pediatrics | Dubai |
| `emily.chen@medconnect.app` | Dr. Emily Chen | Endocrinology | New York |
| `claire.fontaine@medconnect.app` | Dr. Claire Fontaine | Gynecology | Paris |

_(Full list of 15 doctors available after seeding)_

---

## Features

### Landing Page
- Asymmetric hero with city search + typeahead suggestions
- Heartbeat SVG animation divider (signature design element)
- Featured top-rated doctors
- "How it works" section

### Doctor Browsing (no login required)
- Search by city name with live filtering
- Filter sidebar: specialty, language, availability, min rating
- Sort by: rating, experience, price
- Pagination (10 per page)
- Doctor cards with all key info, Message + Video Call CTAs

### Doctor Profile
- Full bio, education, hospital affiliations
- Weekly schedule calendar
- Pricing for message vs video
- Patient reviews with star ratings
- Book consultation modal (date/time picker, type selector)

### Authentication
- Patient & Doctor registration with role-specific fields
- JWT stored in httpOnly cookie
- Demo credentials panel on login page

### Real-time Messaging (Socket.io)
- WhatsApp-style conversation sidebar
- Message status ticks (sent → delivered → read)
- Typing indicator ("Dr. Smith is typing…")
- Date separators (Today / Yesterday / date)
- File & image attachments (multer upload)
- Unread badge counters
- Optimistic UI (instant message render)

### Video Calls (WebRTC / simple-peer)
- Initiator flow from Doctor Profile or Chat header
- Full-screen remote video, PiP local video
- Controls: Mute mic, Toggle camera, Share screen, End call
- Call timer display
- Incoming call banner (bottom-right notification)
- Call decline → "Call declined" toast
- WebRTC unsupported fallback message

### Patient Dashboard
- Upcoming / past consultations with status
- Quick-join for confirmed video calls
- Recent message previews
- Stats: upcoming count, past count, unread messages

### Doctor Dashboard
- Pending consultation requests (Confirm / Decline)
- Today's appointments at a glance
- Earnings overview (completed consultations)
- Edit weekly schedule (modal with day toggles + time pickers)
- Rating and total consultation stats

---

## API Reference

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
PUT    /api/auth/profile

GET    /api/doctors?city=&specialty=&lang=&availability=&minRating=&sort=&page=&limit=
GET    /api/doctors/specialties
GET    /api/doctors/cities
GET    /api/doctors/:id
PUT    /api/doctors/:id
GET    /api/doctors/:id/reviews

POST   /api/consultations
GET    /api/consultations/mine
PUT    /api/consultations/:id

GET    /api/conversations
POST   /api/conversations/find-or-create
GET    /api/conversations/:id/messages
POST   /api/conversations/:id/messages

POST   /api/reviews
GET    /api/reviews/doctor/:id

POST   /api/upload
```

## Socket.io Events

**Client → Server:**
- `join_room` / `leave_room` (conversationId)
- `send_message` { conversationId, content, fileUrl }
- `typing_start` / `typing_stop` { conversationId, userName }
- `mark_read` { conversationId }
- `call_user` { to, from, signal, callerName }
- `accept_call` { to, signal }
- `reject_call` { to }
- `end_call` { to }
- `ice_candidate` { to, candidate }

**Server → Client:**
- `receive_message`
- `user_typing` / `user_stopped_typing`
- `messages_read`
- `incoming_call` { from, signal, callerName, callerSocketId }
- `call_accepted` { signal }
- `call_rejected` { reason }
- `call_ended`
- `notification` { type, message }
- `user_online` / `user_offline`

---

## Design System

| Token | Value |
|-------|-------|
| Primary | `#1C3D2E` deep forest green |
| Background | `#F7F4EF` warm off-white |
| Accent | `#B8964E` muted gold |
| Text | `#4A5568` slate |
| Heading font | Fraunces (serif, Google Fonts) |
| Body font | DM Sans |
| Border radius | 6px max |
| Shadow | 1 layer, subtle (modal only) |

---

## Project Structure

```
medconnect/
├── client/                  ← React (Vite)
│   ├── public/favicon.svg
│   └── src/
│       ├── api/index.js     ← Axios API layer
│       ├── context/         ← Auth + Socket providers
│       ├── components/      ← Reusable UI components
│       ├── pages/           ← Route-level page components
│       └── styles/globals.css
│
└── server/                  ← Node.js + Express
    ├── models/              ← Mongoose schemas
    ├── routes/              ← Express routers
    ├── controllers/         ← Business logic
    ├── middleware/          ← JWT auth, multer upload
    ├── socket/              ← Socket.io handler
    ├── seed.js              ← Database seeder
    └── index.js             ← Entry point
```
