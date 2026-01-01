# FnB Cost Calculator - Οδηγός Setup & Todo List

## 📋 Περίληψη Project

### Τι Είχαμε (YouWare/YouBase Stack)
- **Frontend**: React + Vite + TypeScript + Tailwind CSS
- **Backend**: Hono framework στο YouBase
- **Database**: SQLite μέσω Drizzle ORM
- **Auth**: YouBase authentication (@edgespark/client)
- **Hosting**: YouWare platform (staging--xxx.youbase.cloud)
- **Πρόβλημα**: Cross-origin authentication issues, CORS προβλήματα

### Τι Έχουμε Τώρα (Vercel + Supabase Stack)
- **Frontend**: React + Vite + TypeScript + Tailwind CSS (ίδιο)
- **Backend**: Supabase REST API (αυτόματα generated)
- **Database**: PostgreSQL με Row Level Security
- **Auth**: Supabase Auth (@supabase/auth-ui-react)
- **Hosting**: Vercel (με custom domain support)
- **Πλεονεκτήματα**: 
  - Δωρεάν tier αρκετό για χρήση
  - Καμία CORS ρύθμιση χρειάζεται
  - Automatic API από το schema
  - Built-in auth με email verification

---

## ✅ TODO LIST - Βήμα προς Βήμα

### ΦΑΣΗ 1: Supabase Setup (15-20 λεπτά)

#### 1.1 Δημιουργία Project
- [ ] Πήγαινε στο https://supabase.com
- [ ] Κάνε Sign Up ή Log In (μπορείς με GitHub)
- [ ] Click "New Project"
- [ ] Συμπλήρωσε:
  - **Name**: `fnb-calculator` (ή ό,τι θέλεις)
  - **Database Password**: Βάλε ΔΥΝΑΤΟ password και **ΚΡΑΤΗΣΕ ΤΟ**
  - **Region**: `eu-central-1` (Frankfurt) - πιο κοντά στην Ελλάδα
- [ ] Click "Create new project" (περίμενε 1-2 λεπτά)

#### 1.2 Database Schema Setup
- [ ] Πήγαινε στο **SQL Editor** (αριστερό menu)
- [ ] Click "New Query"
- [ ] Άνοιξε το αρχείο `supabase/migrations/001_initial.sql` από το ZIP
- [ ] Copy-paste ΟΛΟ το περιεχόμενο στον SQL Editor
- [ ] Click "Run" (πράσινο κουμπί)
- [ ] Θα πρέπει να δεις "Success" χωρίς errors

#### 1.3 Πάρε τα API Credentials
- [ ] Πήγαινε **Settings** → **API** (αριστερό menu, κάτω)
- [ ] Αντέγραψε τα εξής (θα τα χρειαστείς αργότερα):

```
Project URL: https://xxxxxxxx.supabase.co
anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx...
```

- [ ] Αποθήκευσέ τα σε ασφαλές μέρος

#### 1.4 Email Settings (Προαιρετικό αλλά συνιστάται)
- [ ] Πήγαινε **Authentication** → **Email Templates**
- [ ] Μπορείς να αλλάξεις τα templates σε Ελληνικά αν θέλεις
- [ ] Πήγαινε **Authentication** → **URL Configuration**
- [ ] Στο "Site URL" βάλε: `https://app.evochia.gr`
- [ ] Στο "Redirect URLs" πρόσθεσε:
  - `https://app.evochia.gr`
  - `http://localhost:3000` (για development)

---

### ΦΑΣΗ 2: Local Development Setup (10 λεπτά)

#### 2.1 Extract και Prepare
- [ ] Κατέβασε το `fnb-vercel-supabase.zip` 
- [ ] Extract σε φάκελο (π.χ. `~/Projects/fnb-calculator`)

```bash
cd ~/Projects
unzip fnb-vercel-supabase.zip
cd fnb-vercel-supabase
```

#### 2.2 Environment Variables
- [ ] Δημιούργησε αρχείο `.env.local` στο root:

```bash
# Δημιούργησε το αρχείο
touch .env.local
```

- [ ] Βάλε μέσα (με τα ΔΙΚΑ σου credentials από 1.3):

```env
VITE_SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YOUR-KEY-HERE
```

#### 2.3 Install Dependencies
```bash
npm install
```

#### 2.4 Run Locally
```bash
npm run dev
```

- [ ] Άνοιξε http://localhost:3000
- [ ] Δοκίμασε να κάνεις Sign Up με email
- [ ] Check αν λειτουργούν τα Ingredients, Recipes κλπ

---

### ΦΑΣΗ 3: GitHub Setup (5 λεπτά)

#### 3.1 Δημιούργησε Repository
- [ ] Πήγαινε https://github.com/new
- [ ] Name: `fnb-calculator` (ή ό,τι θέλεις)
- [ ] Επέλεξε **Private** (για ασφάλεια)
- [ ] ΜΗΝ τσεκάρεις "Add README" (έχουμε ήδη)
- [ ] Click "Create repository"

#### 3.2 Push Code
```bash
cd fnb-vercel-supabase

# Initialize git
git init
git add .
git commit -m "Initial commit - FnB Cost Calculator with Supabase"

# Connect to GitHub (αντικατέστησε με το δικό σου username)
git remote add origin https://github.com/YOUR-USERNAME/fnb-calculator.git
git branch -M main
git push -u origin main
```

---

### ΦΑΣΗ 4: Vercel Deployment (10 λεπτά)

#### 4.1 Import Project
- [ ] Πήγαινε https://vercel.com (Sign up με GitHub αν δεν έχεις)
- [ ] Click "Add New" → "Project"
- [ ] Import το `fnb-calculator` repository
- [ ] Framework Preset: θα εντοπίσει αυτόματα "Vite"

#### 4.2 Environment Variables στο Vercel
- [ ] Πριν το deploy, πρόσθεσε τα Environment Variables:
  - Click "Environment Variables"
  - Πρόσθεσε:
    - `VITE_SUPABASE_URL` = `https://xxx.supabase.co`
    - `VITE_SUPABASE_ANON_KEY` = `eyJhbGc...`

- [ ] Click "Deploy"
- [ ] Περίμενε 1-2 λεπτά για build

#### 4.3 Custom Domain Setup
- [ ] Μετά το deploy, πήγαινε **Settings** → **Domains**
- [ ] Click "Add" και γράψε: `app.evochia.gr`
- [ ] Το Vercel θα σου δώσει DNS records

#### 4.4 DNS στο Papaki
- [ ] Πήγαινε στο Papaki → Domain Management → evochia.gr
- [ ] DNS Settings → Add Record:
  - **Type**: CNAME
  - **Name**: app
  - **Value**: `cname.vercel-dns.com`
  - **TTL**: 3600

- [ ] Περίμενε 5-30 λεπτά για DNS propagation
- [ ] Επιβεβαίωσε στο Vercel ότι το domain είναι verified

---

### ΦΑΣΗ 5: Supabase Auth Configuration (5 λεπτά)

#### 5.1 Update Redirect URLs
- [ ] Πήγαινε Supabase → **Authentication** → **URL Configuration**
- [ ] Βεβαιώσου ότι έχεις:
  - **Site URL**: `https://app.evochia.gr`
  - **Redirect URLs**:
    - `https://app.evochia.gr`
    - `https://fnb-calculator-xxx.vercel.app` (το Vercel URL)
    - `http://localhost:3000`

#### 5.2 Email Provider (Προαιρετικό)
Το Supabase έχει built-in email για testing, αλλά για production:
- [ ] Μπορείς να ρυθμίσεις custom SMTP αργότερα (Settings → Auth → SMTP)

---

### ΦΑΣΗ 6: Testing & Verification (10 λεπτά)

#### 6.1 Full Flow Test
- [ ] Άνοιξε https://app.evochia.gr
- [ ] Sign Up με email
- [ ] Check email για verification link
- [ ] Click verification link
- [ ] Login

#### 6.2 Feature Testing
- [ ] Δημιούργησε ένα Ingredient
- [ ] Δημιούργησε μια Recipe με το ingredient
- [ ] Δημιούργησε ένα Event
- [ ] Check ότι τα settings σώζονται
- [ ] Check ότι logout/login διατηρεί τα data

#### 6.3 Database Verification
- [ ] Πήγαινε Supabase → **Table Editor**
- [ ] Verify ότι βλέπεις τα data που δημιούργησες

---

## 📊 Τι Αλλάξαμε - Technical Summary

### Αρχεία που Δημιουργήθηκαν Νέα

| Αρχείο | Περιγραφή |
|--------|-----------|
| `src/lib/supabase.ts` | Supabase client initialization |
| `src/lib/api.ts` | API functions για CRUD operations |
| `src/types/database.ts` | TypeScript types για Supabase tables |
| `supabase/migrations/001_initial.sql` | Database schema + RLS policies |
| `vercel.json` | Vercel deployment configuration |

### Αρχεία που Τροποποιήθηκαν

| Αρχείο | Αλλαγή |
|--------|--------|
| `src/App.tsx` | Νέο auth flow με Supabase Auth UI |
| `src/hooks/useIngredients.ts` | Χρήση νέου API αντί EdgeSpark |
| `src/hooks/useRecipes.ts` | Χρήση νέου API αντί EdgeSpark |
| `src/hooks/useEvents.ts` | Χρήση νέου API αντί EdgeSpark |
| `src/hooks/useSettings.ts` | Χρήση νέου API αντί EdgeSpark |
| `package.json` | Νέα dependencies, αφαίρεση @edgespark |

### Αρχεία που Αφαιρέθηκαν

| Αρχείο | Λόγος |
|--------|-------|
| `src/lib/tauri.ts` | Αντικαταστάθηκε από api.ts |
| `backend/*` | Δεν χρειάζεται - το Supabase παρέχει API |

### Database Schema Differences

| YouBase (SQLite) | Supabase (PostgreSQL) |
|------------------|----------------------|
| INTEGER | SERIAL / BIGINT |
| TEXT | VARCHAR / TEXT |
| REAL | DECIMAL(10,2) |
| Drizzle ORM | Direct SQL + RLS |
| Manual auth checks | RLS policies automatic |

---

## 🔒 Security με Row Level Security (RLS)

Κάθε table έχει πολιτικές που διασφαλίζουν ότι ο χρήστης βλέπει ΜΟΝΟ τα δικά του data:

```sql
-- Παράδειγμα: ingredients table
CREATE POLICY "Users can view own ingredients" 
  ON ingredients FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ingredients" 
  ON ingredients FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
```

Αυτό σημαίνει:
- ✅ Καμία επιπλέον backend λογική
- ✅ Impossible να δει κάποιος data άλλου user
- ✅ Ασφάλεια στο database level

---

## 💰 Κόστος (Free Tier Limits)

### Supabase Free Tier
- Database: 500 MB
- Auth: 50,000 monthly active users
- Storage: 1 GB
- Bandwidth: 2 GB
- Edge Functions: 500K invocations

### Vercel Free Tier  
- Bandwidth: 100 GB
- Serverless Functions: 100 GB-hours
- Builds: 6000 minutes/month

**Για ένα εστιατόριο/catering**: Τα free tiers είναι υπεραρκετά!

---

## 🚀 Μελλοντικές Βελτιώσεις

### Άμεσα (μετά το basic setup)
- [ ] CSV Import για bulk ingredients
- [ ] PDF Export για προσφορές
- [ ] PWA conversion για offline access

### Μεσοπρόθεσμα
- [ ] Supabase Storage για εικόνες συνταγών
- [ ] Real-time updates με Supabase Realtime
- [ ] Backup automation με Supabase CLI

### Μακροπρόθεσμα
- [ ] Multi-tenant για πολλά εστιατόρια
- [ ] Analytics dashboard
- [ ] Mobile app με React Native

---

## ❓ Troubleshooting

### "Invalid API key"
- Σιγουρέψου ότι το `.env.local` έχει τα σωστά credentials
- Restart τον dev server μετά από αλλαγές στο .env

### "RLS policy violation"
- Ο χρήστης προσπαθεί να δει data άλλου user
- Check ότι το user_id στα inserts είναι σωστό

### "Email not received"
- Check spam folder
- Στο Supabase, Authentication → Users, μπορείς να κάνεις manually confirm

### CORS errors
- Δεν θα πρέπει να υπάρχουν με Supabase!
- Αν δεις, check ότι το URL είναι σωστό

---

## 📞 Support & Links

- **Supabase Docs**: https://supabase.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Supabase Discord**: https://discord.supabase.com
- **Papaki Support**: https://www.papaki.com/support
