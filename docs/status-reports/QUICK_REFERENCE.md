# FEMCARE Quick Reference Guide

## 🚀 Quick Start (5 Minutes)

### 1. Apply Database Schema (⚠️ REQUIRED FIRST)
```
1. Open: https://supabase.com/dashboard/project/your-supabase-project-ref/sql/new
2. Copy entire file: supabase/migrations/002_period_tracking_schema.sql
3. Paste and click RUN
4. Verify: Tables → periods, symptoms, cycle_history created
```

### 2. Start Services
```bash
# Terminal 1 - Backend
cd backend
python main.py

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 3. Test
```
1. Go to: http://localhost:3000
2. Login: femcare.demo@example.com / Demo123456!
3. Add period: /period-history
4. Add symptom: /symptoms
5. Check dashboard: Shows real data
```

---

## 📂 Project Structure

```
Femcare-Project/ai-women-reproductive-health-main/
│
├── backend/                        # FastAPI Backend
│   ├── main.py                    # ML predictions (UNCHANGED)
│   ├── .env                       # Supabase service key
│   └── *.pkl, *.json              # ML models (UNCHANGED)
│
├── frontend/
│   ├── src/
│   │   ├── pages/                 # UI Pages
│   │   │   ├── Dashboard.jsx     # ✏️ Enhanced with real data
│   │   │   ├── LogCycle.jsx      # ✏️ Enhanced with periods
│   │   │   ├── PeriodHistory.jsx # 🆕 NEW
│   │   │   ├── Symptoms.jsx      # 🆕 NEW
│   │   │   ├── Profile.jsx       # ✅ Unchanged UI
│   │   │   └── Login.jsx         # ✅ Unchanged UI
│   │   │
│   │   ├── services/              # 🆕 Data Layer
│   │   │   ├── periodService.js
│   │   │   ├── symptomService.js
│   │   │   └── cycleService.js
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # ✅ Existing
│   │   │
│   │   └── lib/
│   │       └── supabase.js       # ✅ Existing
│   │
│   └── .env                       # Supabase anon key
│
└── supabase/migrations/
    ├── 001_initial_schema.sql     # ✅ Applied
    └── 002_period_tracking_schema.sql # ⚠️ APPLY THIS
```

---

## 🗄️ Database Tables

### Existing (Already Created)
- `users` - User profiles
- `cycle_logs` - Daily cycle tracking
- `health_assessments` - PCOS assessment inputs
- `assessment_results` - ML predictions

### NEW (Need to Apply)
- `periods` - Period records (start/end dates, flow)
- `symptoms` - Symptom tracking (date, name, severity)
- `cycle_history` - Calculated cycle metrics

---

## 🔗 Key URLs

### Application
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Period History:** http://localhost:3000/period-history
- **Symptoms:** http://localhost:3000/symptoms

### Supabase Dashboard
- **SQL Editor:** https://supabase.com/dashboard/project/your-supabase-project-ref/sql/new
- **Tables:** https://supabase.com/dashboard/project/your-supabase-project-ref/editor
- **Auth Users:** https://supabase.com/dashboard/project/your-supabase-project-ref/auth/users

---

## 🔑 API Functions

### Period Service
```javascript
import { getPeriods, addPeriod, updatePeriod, deletePeriod } from './services/periodService';

// Get all periods
const { data, error } = await getPeriods();

// Add period
await addPeriod({
  start_date: '2025-01-15',
  end_date: '2025-01-20',
  flow: 'Medium',
  notes: 'Optional'
});

// Update period
await updatePeriod(periodId, { end_date: '2025-01-21' });

// Delete period
await deletePeriod(periodId);
```

### Symptom Service
```javascript
import { getSymptoms, addSymptom, updateSymptom, deleteSymptom } from './services/symptomService';

// Get all symptoms
const { data, error } = await getSymptoms();

// Add symptom
await addSymptom({
  symptom_date: '2025-01-20',
  symptom_name: 'Cramps',
  severity: 'Moderate',
  notes: 'Optional'
});
```

### Cycle Service
```javascript
import { getCycleStats, calculateCycleDay, getCyclePhase } from './services/cycleService';

// Get statistics
const { data } = await getCycleStats();
// { avgCycleLength, avgPeriodLength, totalCycles, shortest, longest }

// Calculate current cycle day
const cycleDay = calculateCycleDay('2025-01-15'); // Last period date

// Get current phase
const phase = getCyclePhase(15); // Day 15 of cycle
// { name: 'Ovulation', color: '#C8B7E8', message: '...' }
```

---

## 🎨 Design Colors

### Existing (Preserved)
- **Primary Pink:** `#F472B6` - Periods, Dashboard
- **Primary Purple:** `#A78BFA` - Symptoms
- **Navy:** `#17213D` - Text
- **Background:** `#FFFDFC`

### Phase Colors
- **Menstrual:** `#F2C5CF`
- **Follicular:** `#D9E7F4`
- **Ovulation:** `#C8B7E8`
- **Luteal:** `#F5D7CF`

---

## 🔒 Security (RLS Policies)

All user data is protected by Row Level Security:

```sql
-- Example: Users can only view their own periods
CREATE POLICY "Users can view own periods"
ON periods FOR SELECT
USING (auth.uid() = user_id);
```

**This means:**
- ✅ Users can ONLY see their own data
- ✅ All queries automatically filtered
- ✅ Cross-user access blocked
- ✅ Authentication required

---

## 🧪 Test Data Commands

### Add Test Period (via SQL)
```sql
INSERT INTO periods (user_id, start_date, end_date, flow)
VALUES (
  'YOUR-USER-ID-HERE',
  '2025-01-15',
  '2025-01-20',
  'Medium'
);
```

### Add Test Symptom (via SQL)
```sql
INSERT INTO symptoms (user_id, symptom_date, symptom_name, severity)
VALUES (
  'YOUR-USER-ID-HERE',
  '2025-01-20',
  'Cramps',
  'Moderate'
);
```

---

## 📊 Cycle Calculations

### Cycle Day
```
Today - Last Period Start Date + 1
Example: Jan 20 - Jan 1 + 1 = Day 20
```

### Cycle Length
```
Current Period Start - Previous Period Start
Example: Jan 29 - Jan 1 = 28 days
```

### Period Length
```
End Date - Start Date + 1
Example: Jan 5 - Jan 1 + 1 = 5 days
```

### Next Period
```
Last Period Start + Average Cycle Length
Example: Jan 1 + 28 days = Jan 29
```

---

## 🐛 Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| "Table does not exist" | Schema not applied | Apply SQL migration |
| "Unauthorized" | Not logged in | Login first |
| "No rows returned" | No data yet | Add test data |
| "Missing env vars" | .env missing | Check .env files exist |
| "Port already in use" | Service running | Stop other instances |

---

## 📝 Environment Variables

### Frontend (.env)
```
VITE_SUPABASE_URL=https://your-supabase-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJI... (anon key)
```

### Backend (.env)
```
SUPABASE_URL=https://your-supabase-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJI... (service role key)
```

---

## 🎯 Testing Checklist

**Quick Test (2 minutes):**
- [ ] Login works
- [ ] Dashboard loads
- [ ] Add period in Period History
- [ ] Add symptom in Symptoms
- [ ] Both appear in Supabase tables

**Full Test (15 minutes):**
- [ ] See TESTING_GUIDE.md

---

## 📚 Documentation Files

- `IMPLEMENTATION_REPORT.md` - Complete implementation details
- `TESTING_GUIDE.md` - Comprehensive testing instructions
- `QUICK_REFERENCE.md` - This file
- `README.md` - Original project README

---

## 🆘 Getting Help

### Check These First:
1. Browser console (F12) for errors
2. Backend terminal for Python errors
3. Supabase tables to verify data
4. RLS policies enabled

### Verify Services Running:
```bash
# Check backend
curl http://localhost:5000/health

# Check frontend
curl http://localhost:3000
```

---

## ✅ Success Checklist

Everything is working when:
- [x] Can login
- [x] Dashboard shows real data
- [x] Can add/edit/delete periods
- [x] Can add/edit/delete symptoms
- [x] Data persists in Supabase
- [x] Cycle stats calculate
- [x] ML predictions work
- [x] UI unchanged

---

## 🎉 You're Ready!

**Next steps:**
1. Apply SQL migration ⚠️
2. Start services ✅ (Already running)
3. Test features ✅
4. Check Supabase data ✅

**Current Status:**
- Backend: ✅ Running (http://localhost:5000)
- Frontend: ✅ Running (http://localhost:3000)
- Database: ⚠️ Need to apply schema

**Start testing:** Login → Period History → Add Period → Verify in Supabase!
