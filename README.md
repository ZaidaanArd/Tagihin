# Tagihin

A SaaS invoice management platform built for Indonesian freelancers and small businesses. Create professional invoices in minutes, send them directly to clients, and track payment status — all in one dashboard.

Live demo: [tagihin.vercel.app](https://tagihin.vercel.app)

---

## The Problem

Most Indonesian freelancers still create invoices manually using Word, Canva, or Excel. This leads to unprofessional documents, no payment tracking, and forgotten follow-ups. Existing tools like FreshBooks or Wave are built for Western markets — wrong currency, wrong tax system, and too complex for solo freelancers.

Tagihin solves this with a simple, focused tool built specifically for the Indonesian context.

---

## Features

- Authentication — secure register and login with rate limiting and session management
- Client management — save client data once, reuse across multiple invoices
- Invoice creation — dynamic line items, auto-generated invoice numbers, real-time total calculation
- Indonesian tax support — PPh 21, PPh 23, and PPN 11%
- PDF export — download professional invoice as PDF
- Email delivery — send invoices directly to clients via email
- Payment tracking — track invoice status: Draft, Sent, Paid, Overdue
- Public invoice link — share a view-only link with clients without requiring login
- Dashboard summary — see total billed, unpaid, and paid amounts at a glance
- Business settings — configure business profile, bank account, and logo

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| Database | PostgreSQL via Supabase |
| Authentication | Supabase Auth |
| PDF Generation | React PDF |
| Email | Resend |
| Deployment | Vercel |
| Form Handling | React Hook Form + Zod |

---

## Getting Started

### Prerequisites

- Node.js 20 or later
- A Supabase account and project
- A Resend account and API key

### Installation

Clone the repository:

```bash
git clone https://github.com/yourusername/tagihin.git
cd tagihin
```

Install dependencies:

```bash
npm install
```

Copy the environment variables file:

```bash
cp .env.example .env.local
```

Fill in your environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
RESEND_API_KEY=your_resend_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Database Setup

Run the migration SQL in your Supabase SQL Editor:

```bash
# Copy contents of supabase/migration.sql and run it in Supabase SQL Editor
```

Create a storage bucket for user logos:

```sql
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true);
```

### Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
tagihin/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   ├── invoices/
│   │   │   ├── [id]/
│   │   │   └── new/
│   │   ├── clients/
│   │   └── settings/
│   └── (public)/
│       ├── page.tsx
│       └── invoice/[token]/
├── components/
│   ├── ui/
│   ├── invoice/
│   ├── client/
│   └── shared/
├── lib/
│   ├── supabase/
│   ├── validations/
│   └── utils.ts
├── supabase/
│   └── migration.sql
└── types/
```

---

## Deployment

This project is deployed on Vercel. To deploy your own instance:

1. Push the repository to GitHub
2. Import the project on [vercel.com](https://vercel.com)
3. Add all environment variables in the Vercel dashboard
4. Deploy

After deployment, update the Site URL in your Supabase dashboard under Authentication > Settings to match your Vercel URL.

For production email sending, replace `onboarding@resend.dev` with your own verified domain in Resend.

---

## Environment Variables

| Variable | Description |
|---|---|
| NEXT_PUBLIC_SUPABASE_URL | Your Supabase project URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Your Supabase anon public key |
| SUPABASE_SERVICE_ROLE_KEY | Your Supabase service role key (keep secret) |
| RESEND_API_KEY | Your Resend API key for sending emails |
| NEXT_PUBLIC_APP_URL | Your app URL (e.g. https://tagihin.vercel.app) |

---

## License

MIT
