# Tagihin - AGENTS.md

## Project Overview

**Tagihin** is a SaaS invoice management platform built specifically for Indonesian freelancers and small businesses (UMKM). The goal is to help them create professional invoices quickly, send them to clients, and track payment status — all in one clean dashboard.

> Tagline: "Invoice profesional, 2 menit jadi."

### Target Users
- Freelancer Indonesia (desainer, developer, copywriter, fotografer, dll)
- UMKM kecil yang belum pakai software akuntansi
- Orang yang masih bikin invoice manual di Word/Canva/Excel

### Core Problem Being Solved
- Invoice manual tidak profesional dan susah di-track
- Tidak ada tools invoice yang benar-benar dibuat untuk konteks Indonesia (Rupiah, NPWP, PPh)
- Freelancer sering lupa nagih atau tidak tau status pembayaran klien

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| Database | PostgreSQL via Supabase |
| Auth | Supabase Auth |
| PDF Generation | React-PDF atau Puppeteer |
| Email | Resend |
| Deployment | Vercel |
| State Management | Zustand atau React Context |
| Form Handling | React Hook Form + Zod |

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
│   ├── api/
│   │   ├── invoices/
│   │   ├── clients/
│   │   └── pdf/
│   └── (public)/
│       ├── page.tsx           # Landing page
│       └── invoice/[token]/   # Public invoice view for clients
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── invoice/               # Invoice-specific components
│   ├── client/                # Client-specific components
│   └── shared/                # Shared/reusable components
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── validations/           # Zod schemas
│   └── utils.ts
├── types/
│   └── index.ts               # Global TypeScript types
└── hooks/                     # Custom React hooks
```

---

## Database Schema

### users
```sql
id          uuid PRIMARY KEY
email       text UNIQUE NOT NULL
full_name   text
business_name text
npwp        text
address     text
phone       text
bank_name   text
bank_account text
bank_holder  text
logo_url    text
created_at  timestamp
```

### clients
```sql
id          uuid PRIMARY KEY
user_id     uuid REFERENCES users(id)
name        text NOT NULL
email       text
phone       text
address     text
npwp        text
created_at  timestamp
```

### invoices
```sql
id            uuid PRIMARY KEY
user_id       uuid REFERENCES users(id)
client_id     uuid REFERENCES clients(id)
invoice_number text NOT NULL
status        enum('draft', 'sent', 'paid', 'overdue')
issue_date    date
due_date      date
notes         text
tax_type      enum('none', 'pph21', 'pph23', 'ppn')
tax_rate      decimal
subtotal      decimal
tax_amount    decimal
total         decimal
public_token  text UNIQUE   -- for shareable link
created_at    timestamp
```

### invoice_items
```sql
id          uuid PRIMARY KEY
invoice_id  uuid REFERENCES invoices(id)
description text NOT NULL
quantity    decimal
unit        text
unit_price  decimal
amount      decimal
```

---

## Features & Priority

### Week 1 — Foundation
- [ ] Setup Next.js project dengan Supabase
- [ ] Auth: register, login, logout
- [ ] Dashboard layout dengan sidebar
- [ ] Manajemen klien: tambah, edit, hapus, list

### Week 2 — Core Invoice
- [ ] Form buat invoice baru
- [ ] Auto-generate nomor invoice (INV-2024-001)
- [ ] Preview invoice sebelum disimpan
- [ ] Generate & download PDF
- [ ] Share invoice via public link (token-based)

### Week 3 — Tracking & Notifikasi
- [ ] Update status invoice (draft → sent → paid)
- [ ] Filter & search invoice
- [ ] Dashboard summary (total tagihan, belum dibayar, sudah lunas)
- [ ] Kirim invoice via email ke klien (Resend)
- [ ] Reminder otomatis untuk invoice overdue

### Week 4 — Polish & Deploy
- [ ] Settings halaman (profil, info bisnis, rekening bank)
- [ ] Upload logo bisnis
- [ ] Landing page
- [ ] Responsive mobile
- [ ] Deploy ke Vercel
- [ ] Testing & bug fixing

---

## Indonesian Context (Penting!)

Ini hal-hal spesifik Indonesia yang harus selalu diperhatikan:

- **Currency:** Selalu format angka sebagai Rupiah — `Rp 1.500.000` (titik sebagai pemisah ribuan, koma untuk desimal)
- **Pajak:** Support PPh 21, PPh 23, dan PPN 11%
- **NPWP:** Field NPWP untuk user dan klien (format: 00.000.000.0-000.000)
- **Nomor Invoice:** Format default `INV/2024/001` atau bisa dikustomisasi user
- **Tanggal:** Format Indonesia `DD MMMM YYYY` (contoh: 15 Juni 2024)
- **Bahasa:** UI dalam Bahasa Indonesia
- **Bank Lokal:** BCA, Mandiri, BNI, BRI, BSI, dst

---

## Coding Conventions

### General
- Gunakan TypeScript strict mode
- Semua komponen harus punya type yang jelas, hindari `any`
- Gunakan `async/await`, hindari `.then().catch()` chaining
- Error handling wajib di setiap server action dan API route

### Naming
- Komponen React: `PascalCase` (contoh: `InvoiceCard.tsx`)
- Fungsi & variabel: `camelCase` (contoh: `getInvoiceById`)
- File non-komponen: `kebab-case` (contoh: `invoice-utils.ts`)
- Database functions: `snake_case` mengikuti konvensi Supabase
- Constants: `SCREAMING_SNAKE_CASE` (contoh: `TAX_RATES`)

### Next.js App Router
- Gunakan Server Components secara default
- Gunakan `'use client'` hanya jika benar-benar butuh interaktivitas
- Data fetching dilakukan di Server Components, bukan di Client Components
- Gunakan Next.js Server Actions untuk form submissions dan mutations

### Supabase
- Selalu gunakan `supabase/server.ts` di Server Components dan Route Handlers
- Selalu gunakan `supabase/client.ts` di Client Components
- RLS (Row Level Security) harus diaktifkan untuk semua tabel
- Setiap user hanya boleh akses data miliknya sendiri

### Styling
- Gunakan Tailwind CSS utility classes
- Komponen UI dari shadcn/ui
- Hindari inline styles kecuali untuk nilai dinamis
- Gunakan CSS variables untuk warna brand

---

## Things to Avoid

- ❌ Jangan hardcode currency selain Rupiah (IDR)
- ❌ Jangan buat user bisa akses data user lain (selalu filter by `user_id`)
- ❌ Jangan skip validasi input — gunakan Zod untuk semua form
- ❌ Jangan expose secret keys di client-side code
- ❌ Jangan gunakan `any` di TypeScript
- ❌ Jangan fetch data di Client Components jika bisa dilakukan di Server Components
- ❌ Jangan lupa handle loading state dan error state di setiap halaman

---

## Key Business Logic

### Invoice Number Generation
Format: `INV/{YEAR}/{SEQUENCE}` — contoh: `INV/2024/001`
- Sequence auto-increment per user per tahun
- User bisa kustomisasi prefix di settings

### Invoice Status Flow
```
draft → sent → paid
              ↓
           overdue (jika melewati due_date dan belum paid)
```

### Tax Calculation
```
subtotal = sum(item.quantity * item.unit_price)
tax_amount = subtotal * tax_rate
total = subtotal + tax_amount
```

### Public Invoice Link
Setiap invoice punya `public_token` (UUID) yang bisa diakses tanpa login di `/invoice/[token]` — untuk dilihat klien.

---

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
NEXT_PUBLIC_APP_URL=
```

---

## Design System

### Filosofi Desain
- **Clean & Minimal** — banyak whitespace, tidak crowded
- **Flat UI** — tidak ada gradient, tidak ada shadow berat
- Tampilan harus terasa **profesional tapi friendly** untuk freelancer

### Warna
```
Primary (Ungu):
  --primary:        #7F77DD   ← tombol utama, accent, link
  --primary-light:  #EEEDFE   ← badge background, active nav bg
  --primary-dark:   #534AB7   ← text on light purple bg, hover state

Neutral:
  --bg-page:        #F7F7F8   ← background halaman
  --bg-card:        #FFFFFF   ← card, tabel, modal
  --bg-sidebar:     #FAFAFA   ← sidebar background
  --border:         rgba(0,0,0,0.08) ← semua border (0.5px)

Text:
  --text-primary:   #1A1A1A   ← heading, data penting
  --text-secondary: #6B6B6B   ← label, subtext
  --text-muted:     #A0A0A0   ← placeholder, hint

Status (untuk badge invoice):
  --success-bg:     #EAF3DE   --success-text: #3B6D11   ← Lunas
  --warning-bg:     #FEF3E2   --warning-text: #BA7517   ← Pending
  --danger-bg:      #FAECE7   --danger-text:  #993C1D   ← Overdue
  --neutral-bg:     #F1F1F1   --neutral-text: #6B6B6B   ← Draft
```

### Typography
```
Font: Inter (Google Fonts) atau system-ui sebagai fallback

Heading h1:   22px / weight 500
Heading h2:   18px / weight 500
Heading h3:   16px / weight 500
Body:         14px / weight 400 / line-height 1.6
Label/caption:12px / weight 400
Small:        11px / weight 400

Aturan: gunakan hanya weight 400 dan 500. Jangan pakai 600/700.
Gunakan sentence case selalu. Jangan Title Case atau ALL CAPS.
```

### Spacing & Layout
```
Sidebar width:     220px (fixed)
Main content:      margin-left 220px, padding 28px 32px
Border radius:     8px (komponen kecil), 12px (card)
Border width:      0.5px solid var(--border)
Gap antar card:    12px
Gap antar section: 24-28px
```

### Komponen Utama

**Tombol Primary**
```css
background: #7F77DD;
color: #ffffff;
padding: 8px 16px;
border-radius: 8px;
font-size: 14px;
border: none;
/* hover: background #534AB7 */
```

**Card / Panel**
```css
background: #ffffff;
border: 0.5px solid rgba(0,0,0,0.08);
border-radius: 12px;
padding: 16px 18px;
```

**Sidebar Nav Item (active)**
```css
background: #EEEDFE;
color: #534AB7;
font-weight: 500;
border-right: 2px solid #7F77DD;
```

**Badge Status Invoice**
```css
/* Lunas */   background: #EAF3DE; color: #3B6D11;
/* Terkirim */background: #EEEDFE; color: #534AB7;
/* Overdue */ background: #FAECE7; color: #993C1D;
/* Draft */   background: #F1F1F1; color: #6B6B6B;

border-radius: 20px; padding: 3px 10px; font-size: 11px; font-weight: 500;
```

**Avatar Inisial Klien**
```css
width: 28px; height: 28px;
border-radius: 50%;
background: #EEEDFE;
color: #534AB7;
font-size: 11px; font-weight: 500;
display: flex; align-items: center; justify-content: center;
```

**Tabel**
```css
/* Header row */
background: #FAFAFA;
font-size: 12px; color: #A0A0A0; font-weight: 400;
padding: 11px 16px;
border-bottom: 0.5px solid rgba(0,0,0,0.08);

/* Body row */
font-size: 13px; color: #1A1A1A;
padding: 12px 16px;
border-bottom: 0.5px solid rgba(0,0,0,0.08);
```

### Format Angka (Rupiah)
```javascript
// Selalu gunakan format ini
const formatRupiah = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};
// Output: Rp 3.500.000
```

### Struktur Layout Dashboard
```
┌─────────────────────────────────────────┐
│  Sidebar (220px)  │  Main Content        │
│                   │  ┌─ Topbar ────────┐ │
│  Logo             │  │ Judul + CTA btn │ │
│                   │  └────────────────┘ │
│  Nav items        │  ┌─ Stat Cards ───┐ │
│  (icon + label)   │  │ 4 kolom grid   │ │
│                   │  └────────────────┘ │
│                   │  ┌─ Tabel ────────┐ │
│  [bottom]         │  │ Invoice list   │ │
│  Profile          │  └────────────────┘ │
└─────────────────────────────────────────┘
```

### Hal yang JANGAN dilakukan
- ❌ Jangan pakai gradient atau shadow berat
- ❌ Jangan pakai font weight 600 atau 700
- ❌ Jangan hardcode warna di luar design system di atas
- ❌ Jangan pakai border-radius lebih dari 12px kecuali untuk avatar/badge pill
- ❌ Jangan pakai warna teks hitam murni (#000) — pakai #1A1A1A
- ❌ Jangan pakai inline style berlebihan — selalu pakai CSS class atau CSS variables
- ❌ Jangan lupa responsive — semua halaman harus bisa dibuka di mobile

---

## Getting Started (untuk Agent)

Saat memulai sesi baru, lakukan hal berikut:
1. Baca file ini secara keseluruhan
2. Cek struktur folder yang sudah ada dengan `ls -la` dan `find . -type f -name "*.tsx" | head -20`
3. Cek `package.json` untuk dependencies yang sudah terinstall
4. Jangan berasumsi — tanya jika ada yang tidak jelas soal business logic

Prioritas utama: **fungsionalitas dulu, estetika kemudian.** Pastikan setiap fitur bekerja dengan benar sebelum polish UI.
