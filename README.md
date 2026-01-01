# FnB Cost Calculator

Εφαρμογή υπολογισμού κόστους για εστιατόρια, catering και ιδιωτικούς σεφ.

## 🚀 Stack

- **Frontend**: React + Vite + TypeScript + Tailwind CSS
- **Backend/Database**: Supabase (PostgreSQL)
- **Hosting**: Vercel
- **Auth**: Supabase Auth

## 📦 Setup

### 1. Supabase Setup

1. Πήγαινε στο [supabase.com](https://supabase.com) και δημιούργησε νέο project
2. Πήγαινε στο SQL Editor και τρέξε το migration:
   ```
   supabase/migrations/001_initial.sql
   ```
3. Αντέγραψε τα credentials από Settings > API:
   - Project URL
   - anon public key

### 2. Environment Variables

Δημιούργησε `.env.local`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Install & Run

```bash
npm install
npm run dev
```

## 🌐 Deploy στο Vercel

### Αυτόματο

1. Push σε GitHub
2. Import στο Vercel
3. Πρόσθεσε τα environment variables
4. Deploy!

### Custom Domain (app.evochia.gr)

1. Στο Vercel dashboard → Settings → Domains
2. Add `app.evochia.gr`
3. Πρόσθεσε τα DNS records στο Papaki

## 📊 Database Schema

- `ingredients` - Υλικά με τιμές
- `recipes` - Συνταγές  
- `recipe_ingredients` - Υλικά συνταγών
- `events` - Catering events
- `event_recipes` - Συνταγές events
- `settings` - Ρυθμίσεις χρήστη
- `user_roles` - Admin roles

Όλα τα tables έχουν Row Level Security (RLS).

## 📱 Features

- ✅ Διαχείριση υλικών με τιμές και waste %
- ✅ Δημιουργία συνταγών με υπολογισμό κόστους
- ✅ Catering events με προσφορές
- ✅ 3 modes: Restaurant, Catering, Private Chef
- ✅ Αναφορές και στατιστικά
- ✅ Export PDF για προσφορές
- ✅ Admin panel για διαχείριση χρηστών
