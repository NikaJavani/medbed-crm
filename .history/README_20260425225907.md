# MedBed CRM — Service & Maintenance Platform

A backend system I built to manage service operations for robotic hospital beds. Hospitals can report equipment issues, and the vendor company can track, assign, and resolve them through a structured ticket workflow.

This started as a simple feedback form that wrote raw text to a SQL database. I rebuilt it from scratch with a proper architecture after realising the old version couldn't scale past a single table.

---

## Why I Built This

I was working on a project for a medical equipment company that makes robotic hospital beds. Their process for handling maintenance requests was basically WhatsApp messages and spreadsheets. I wanted to build something that could actually replace that — proper ticket tracking, technician dispatch, SLA deadlines, service reports.

The domain made the design decisions interesting. Medical equipment records can't be deleted. Every status change needs an audit trail. Hospitals have different response time contracts. These constraints pushed me toward design patterns I wouldn't have reached on a simple CRUD project.

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Runtime | Node.js v22 | Familiar, fast enough for this scale |
| Framework | Express | Straightforward, well-documented |
| Language | TypeScript | Catches schema mismatches at compile time |
| ORM | Prisma | Schema-as-code, great migration system |
| Database | PostgreSQL | Relational integrity matters here |
| Validation | Zod | Request validation with TypeScript inference |
| Auth | JWT (access + refresh) | Stateless, standard |
| Passwords | bcrypt | Industry standard hashing |
| Docs | Swagger / OpenAPI | Auto-generated from route annotations |

---

## Architecture

I went with a modular monolith — clean internal boundaries but deployed as one unit. The logic is that microservices would be premature for this scale, but the module structure makes it easy to split later if needed.

```
src/
├── modules/
│   ├── auth/           # Register, login, JWT
│   ├── organizations/  # Hospital management
│   ├── users/          # User profiles and roles
│   ├── assets/         # Bed models and physical beds
│   └── tickets/        # Core workflow
├── middleware/
│   ├── authenticate.ts # JWT verification
│   ├── authorize.ts    # Role checking
│   └── errorHandler.ts
└── lib/
    ├── prisma.ts       # DB client singleton
    ├── jwt.ts          # Token helpers
    └── swagger.ts      # API docs config
```

Each module follows the same pattern: `routes → controller → service → schema`. Routes handle HTTP mapping, controllers handle request/response, services handle business logic, schemas handle validation. Keeping these separate means the business logic is testable without spinning up an HTTP server.

---

## Database Design

12 tables. A few design decisions worth noting:

**Soft deletes everywhere** — tickets and assets are never hard deleted. Medical service records need to exist permanently for compliance reasons.

**SLA deadline stamped at creation** — calculated from the hospital's contract tier when the ticket is created, not dynamically. If a hospital upgrades their contract mid-ticket, the original SLA still applies. Prevents disputes.

**Immutable status history** — every status change on a ticket writes a new row to `TicketStatusHistory`. You can reconstruct the full timeline of any ticket.

**Internal comments** — technicians can write notes that hospital staff can't see. The `isInternal` flag on comments is filtered at the query level based on the requester's role.

**Asset health tracking** — every ticket is linked to a physical asset. You can query how many times a specific bed has been reported, which feeds into replacement decisions.

---

## User Roles

| Role | What they can do |
|---|---|
| `hospital_staff` | Report tickets, view their hospital's tickets and assets |
| `hospital_admin` | Everything above + manage their hospital's users |
| `technician` | View assigned tickets, update status, submit service reports |
| `manager` | Assign technicians, view all tickets, view analytics |
| `vendor_admin` | Full access to everything |

---

## SLA System

Response deadlines are calculated from the hospital's contract tier:

| Tier | Response Time |
|---|---|
| Basic | 24 hours |
| Premium | 8 hours |
| Enterprise | 4 hours |

The deadline is stored on the ticket at creation time. Future versions will add a background job that fires warnings at 75% and 100% elapsed time.

---

## Getting Started

**Requirements:** Node.js v18+, PostgreSQL

**1. Clone and install**
```bash
git clone https://github.com/yourusername/medbed-crm
cd medbed-crm
npm install
```

**2. Set up environment**
```bash
cp .env.example .env
# Edit .env with your PostgreSQL credentials
```

**3. Run migrations**
```bash
npx prisma migrate dev
```

**4. Seed the database**
```bash
npm run seed
```

**5. Start the server**
```bash
npm run dev
```

API runs at `http://localhost:3000`
Interactive docs at `http://localhost:3000/api-docs`

---

## Seed Data

Running `npm run seed` creates:

- 1 vendor company + 3 hospitals across Malaysia
- 8 users covering all roles (all passwords: `password123`)
- 3 bed models, 5 physical beds across different wards
- 5 tickets in different states — open, in progress, pending parts, resolved, and a scheduled maintenance

| Email | Role |
|---|---|
| admin@medbed.com | Vendor Admin |
| manager@medbed.com | Manager |
| tech1@medbed.com | Technician |
| tech2@medbed.com | Technician |
| admin@hkl.com | Hospital Admin |
| sarah@hkl.com | Hospital Staff |

---

## API Overview

Full interactive documentation at `/api-docs`. Quick reference:

```
POST   /api/auth/register
POST   /api/auth/login

GET    /api/organizations
POST   /api/organizations
GET    /api/organizations/:id
PATCH  /api/organizations/:id

GET    /api/users/me
GET    /api/users
GET    /api/users/technicians

GET    /api/assets/models
POST   /api/assets/models
GET    /api/assets
POST   /api/assets
GET    /api/assets/:id

GET    /api/tickets
POST   /api/tickets
GET    /api/tickets/:id
PATCH  /api/tickets/:id/status
POST   /api/tickets/:id/assign
POST   /api/tickets/:id/comments
POST   /api/tickets/:id/service-report
```

---

## What I'd Add Next

- Background job for SLA breach notifications (BullMQ + Redis)
- PDF generation for service reports
- Analytics dashboard endpoints
- React frontend
- Preventive maintenance auto-scheduling

---

## Lessons Learned

Designing for audit trails from the start is much easier than retrofitting them. I initially thought storing status history was overkill — halfway through I realised it's the most important table in the system. Every useful question about a ticket ("when was it acknowledged?", "who resolved it?") is answered by that table.

The other thing I'd do differently is set up the `.env` validation earlier. Debugging a missing environment variable that only shows up at runtime is annoying when a startup check would catch it immediately.