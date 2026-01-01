# FnB Cost Calculator - Vercel + Supabase Migration

## 🎯 Στόχος
Μετατροπή της εφαρμογής από YouWare/YouBase σε Vercel + Supabase stack για καλύτερη αξιοπιστία, απλούστερη διαχείριση και δωρεάν tier που καλύπτει τις ανάγκες.

## 📦 Νέο Stack

### Frontend (Vercel)
- **Framework**: React + Vite (παραμένει)
- **Styling**: Tailwind CSS (παραμένει)
- **Hosting**: Vercel (free tier)
- **Domain**: app.evochia.gr

### Backend (Supabase)
- **Database**: PostgreSQL
- **Auth**: Supabase Auth (email/password)
- **API**: Supabase REST API + Row Level Security (RLS)
- **Realtime**: Supabase Realtime (optional)

## 📁 Δομή Project

```
fnb-vercel-supabase/
├── src/
│   ├── components/           # React components (από υπάρχον)
│   │   ├── shared/
│   │   └── tabs/
│   ├── hooks/               # Custom hooks
│   │   ├── useIngredients.ts
│   │   ├── useRecipes.ts
│   │   ├── useEvents.ts
│   │   └── useSettings.ts
│   ├── lib/
│   │   ├── supabase.ts      # Supabase client
│   │   ├── api.ts           # API functions
│   │   └── ...              # Utilities
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   └── main.tsx
├── supabase/
│   └── migrations/          # SQL migrations
│       └── 001_initial.sql
├── public/
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── .env.local              # Supabase credentials (local)
```

## 🗃️ Database Schema (PostgreSQL/Supabase)

### Tables

1. **ingredients** - Υλικά
2. **recipes** - Συνταγές
3. **recipe_ingredients** - Σύνδεση συνταγών με υλικά
4. **events** - Events/Catering
5. **event_recipes** - Συνταγές event
6. **settings** - Ρυθμίσεις χρήστη
7. **user_roles** - Ρόλοι admin

### Row Level Security (RLS)
Κάθε χρήστης βλέπει μόνο τα δικά του δεδομένα χάρη στο RLS του Supabase.

## 🔐 Authentication

Supabase Auth με:
- Email/Password
- (Optional) Google OAuth
- (Optional) Magic Link

## 📝 Βήματα Migration

### Phase 1: Setup
- [x] Ανάλυση υπάρχοντος κώδικα
- [ ] Δημιουργία Supabase project
- [ ] Setup database schema με migrations
- [ ] Enable RLS policies

### Phase 2: Frontend Adaptation
- [ ] Αντικατάσταση @edgespark/client με @supabase/supabase-js
- [ ] Νέο auth flow με Supabase Auth UI
- [ ] Update API calls για Supabase REST

### Phase 3: Deploy
- [ ] Deploy σε Vercel
- [ ] Configure environment variables
- [ ] Setup custom domain app.evochia.gr

### Phase 4: Testing & Polish
- [ ] Test όλα τα CRUD operations
- [ ] Test authentication
- [ ] Performance testing

## 🆓 Pricing (Free Tier)

### Supabase Free Tier
- 500MB database
- 1GB file storage
- 50,000 monthly active users
- 2 million Edge Function invocations

### Vercel Free Tier
- 100GB bandwidth
- Automatic SSL
- Custom domains
- Serverless Functions

**Αρκετά για χρήση εστιατορίου!**
