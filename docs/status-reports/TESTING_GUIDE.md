# FEMCARE Testing Guide

## 🎯 Quick Start

Both services are now running:
- ✅ **Backend:** http://localhost:5000
- ✅ **Frontend:** http://localhost:3000

---

## 🔴 CRITICAL: Apply Database Schema First

**Before testing anything, you MUST apply the database schema:**

### Step 1: Open Supabase SQL Editor
https://supabase.com/dashboard/project/your-supabase-project-ref/sql/new

### Step 2: Copy SQL Migration
The file `002_period_tracking_schema.sql` is already open in your VS Code.
- Press **Ctrl+A** to select all
- Press **Ctrl+C** to copy

### Step 3: Run Migration
- Paste into Supabase SQL Editor
- Click the green **"RUN"** button
- Wait for "Success. No rows returned"

### Step 4: Verify Tables Created
Go to: https://supabase.com/dashboard/project/your-supabase-project-ref/editor

You should see these NEW tables:
- ✅ periods
- ✅ symptoms  
- ✅ cycle_history

---

## 🧪 Complete Testing Workflow

### Test 1: Login with Existing User ✅

1. Go to: http://localhost:3000/login

2. Login with the test user you created earlier:
   - Email: `femcare.demo@example.com` (or your test email)
   - Password: `Demo123456!` (or your test password)

3. **Expected:** Redirected to Dashboard

4. **Verify:**
   - User name displayed in top-right
   - Dashboard shows cycle information
   - No console errors

---

### Test 2: Dashboard Integration ✅

After logging in, you should be on the Dashboard.

**Verify the following:**

#### Cycle Information
- [ ] Current cycle day displayed
- [ ] Cycle phase shown (Menstrual/Follicular/Ovulation/Luteal)
- [ ] Cycle visualization animates
- [ ] Phase colors display correctly

#### Real Data from Supabase
- [ ] If you have periods logged, last period date shows
- [ ] If you have symptoms logged, they appear in health summary
- [ ] Cycle statistics calculated from database

**Check Browser Console:**
- Open DevTools (F12)
- Look for any red errors
- Should see successful API calls to Supabase

---

### Test 3: Period History Page 🆕

1. Navigate to: http://localhost:3000/period-history

2. **Expected:** 
   - Period History page loads
   - "Add Period" button visible
   - Statistics cards show (if you have data)

3. **Add a Period:**
   - Click **"Add Period"** button
   - Fill in form:
     - Start Date: `2025-01-15`
     - End Date: `2025-01-20`
     - Flow: `Medium`
     - Notes: `Test period`
   - Click **"Add"**

4. **Verify:**
   - [ ] Modal closes
   - [ ] Period appears in table
   - [ ] Duration calculated correctly (6 days)
   - [ ] Flow badge colored appropriately

5. **Check Supabase:**
   - Go to: https://supabase.com/dashboard/project/your-supabase-project-ref/editor/public/periods
   - [ ] Your period record exists
   - [ ] user_id matches your authenticated user
   - [ ] Dates are correct

6. **Test Edit:**
   - Click edit icon (pencil) on the period
   - Change end date to `2025-01-21`
   - Click **"Update"**
   - [ ] Duration updates to 7 days
   - [ ] Supabase record updated

7. **Test Statistics:**
   - Add 2-3 more periods with different dates
   - [ ] Avg Cycle Length calculates
   - [ ] Avg Period Length calculates
   - [ ] Shortest/Longest cycle shows

---

### Test 4: Symptoms Page 🆕

1. Navigate to: http://localhost:3000/symptoms

2. **Expected:**
   - Symptoms page loads
   - "Add Symptom" button visible
   - Empty state if no symptoms yet

3. **Add a Symptom:**
   - Click **"Add Symptom"** button
   - Fill in form:
     - Date: Today's date
     - Symptom: `Cramps`
     - Severity: `Moderate`
     - Notes: `Morning cramps`
   - Click **"Add"**

4. **Verify:**
   - [ ] Modal closes
   - [ ] Symptom appears in table
   - [ ] Severity badge colored (yellow for Moderate)
   - [ ] Date formatted correctly

5. **Check Supabase:**
   - Go to: https://supabase.com/dashboard/project/your-supabase-project-ref/editor/public/symptoms
   - [ ] Symptom record exists
   - [ ] user_id correct
   - [ ] symptom_name is 'Cramps'

6. **Test Multiple Symptoms:**
   - Add more symptoms:
     - `Headache` - Severe - Yesterday
     - `Bloating` - Mild - 2 days ago
     - `Fatigue` - Moderate - Today
   - [ ] All appear in table
   - [ ] Sorted by date (newest first)

7. **Test Edit/Delete:**
   - Click edit on any symptom
   - Change severity to `Severe`
   - [ ] Update works
   - Click delete on another symptom
   - [ ] Confirm prompt appears
   - Confirm deletion
   - [ ] Symptom removed from table and database

---

### Test 5: Log Cycle Integration ✅

This tests the enhanced cycle logging with automatic period creation.

1. Navigate to: http://localhost:3000/log-cycle

2. **Log Flow Data:**
   - Select today's date
   - Click on **"Medium"** flow
   - [ ] Flow button highlights
   - [ ] Data saves automatically

3. **Log Additional Data:**
   - Add symptoms (e.g., click "Cramps", "Bloating")
   - Add moods (e.g., "Happy", "Energetic")
   - Add pain level
   - [ ] All selections save

4. **Verify Period Auto-Creation:**
   - Go back to: http://localhost:3000/period-history
   - [ ] A new period was automatically created with today's date
   - [ ] Flow matches what you logged

5. **Log Consecutive Days:**
   - Go back to Log Cycle
   - Select tomorrow's date (or next day)
   - Log flow again
   - [ ] Existing period's end_date extends
   - [ ] No duplicate period created

6. **Check Database:**
   - Supabase → periods table
   - [ ] Period has start_date and end_date
   - [ ] Flow value saved
   - Supabase → cycle_logs table
   - [ ] Daily logs saved separately
   - [ ] Contains symptoms and moods

---

### Test 6: Dashboard Real Data Update ✅

After adding periods and symptoms, verify Dashboard shows real data.

1. Go to: http://localhost:3000/dashboard

2. **Verify Period Data:**
   - [ ] Last period date matches your most recent period
   - [ ] Cycle day calculates correctly
   - [ ] Next period prediction shows
   - [ ] Cycle phase is accurate

3. **Verify Symptoms Display:**
   - Scroll to health summary section
   - [ ] Recent symptoms appear
   - [ ] Symptom names listed

4. **Verify Statistics:**
   - [ ] Average cycle length displays
   - [ ] Based on actual data from database

5. **Test Real-Time Updates:**
   - Open Period History in another tab
   - Add a new period
   - Return to Dashboard tab
   - Refresh page (F5)
   - [ ] Dashboard reflects new data

---

### Test 7: Cycle History Calculation ✅

1. **Add Multiple Periods:**
   - Go to Period History
   - Add periods for several months:
     - Period 1: Jan 1-5, 2025
     - Period 2: Jan 29-Feb 3, 2025
     - Period 3: Feb 27-Mar 3, 2025

2. **Verify Cycle Calculations:**
   - Go to: https://supabase.com/dashboard/project/your-supabase-project-ref/editor/public/cycle_history
   - [ ] cycle_history table has records
   - [ ] cycle_length calculated (should be ~28 days)
   - [ ] period_length calculated (should be ~5 days)

3. **Check Statistics:**
   - Return to Period History page
   - [ ] Avg Cycle Length shows ~28 days
   - [ ] Avg Period Length shows ~5 days
   - [ ] Shortest cycle shows minimum
   - [ ] Longest cycle shows maximum

---

### Test 8: Security & Data Isolation 🔒

1. **Test RLS Policies:**
   - You should only see YOUR data
   - Another user cannot access your periods/symptoms

2. **Test Authentication Requirement:**
   - Logout
   - Try to access: http://localhost:3000/period-history
   - [ ] Redirected to login
   - Try to access: http://localhost:3000/symptoms
   - [ ] Redirected to login

3. **Test Cross-User Protection:**
   - Login as User A
   - Note a period ID from Supabase
   - Logout and login as User B (create if needed)
   - Try to edit User A's period via API
   - [ ] Should fail with 401/403 error

---

### Test 9: Error Handling ✅

1. **Test Invalid Dates:**
   - Try to add period with end_date before start_date
   - [ ] Should show validation error

2. **Test Missing Required Fields:**
   - Try to add period without start_date
   - [ ] Form validation prevents submission

3. **Test Network Errors:**
   - Stop backend (in terminal: Ctrl+C)
   - Try to add a period
   - [ ] User-friendly error message appears
   - Restart backend

4. **Test Empty States:**
   - Create a new user with no data
   - Visit Period History
   - [ ] Empty state message displays
   - Visit Symptoms
   - [ ] Empty state message displays

---

### Test 10: Profile Integration ✅

1. Go to: http://localhost:3000/profile

2. **Update Profile:**
   - Change cycle length to `30`
   - Update last period date
   - Click **"Save"**

3. **Verify:**
   - [ ] Profile updates save to Supabase users table
   - [ ] Dashboard reflects new cycle length
   - [ ] Cycle calculations use new values

---

## 🎨 UI Verification Checklist

**Confirm NO visual changes were made:**

### Existing Pages (Should Look Identical)
- [ ] Dashboard - Same layout, colors, animations
- [ ] Log Cycle - Same UI, only enhanced functionality
- [ ] Login - Unchanged
- [ ] Signup - Unchanged
- [ ] Profile - Unchanged
- [ ] Health Assessment - Unchanged

### New Pages (Should Match Existing Design)
- [ ] Period History - Uses same color scheme (#F472B6 pink)
- [ ] Symptoms - Uses same color scheme (#A78BFA purple)
- [ ] Both follow existing card/button/table patterns

### Navigation
- [ ] Navigation bar unchanged
- [ ] All existing menu items present
- [ ] Colors and spacing preserved

---

## 🤖 ML Pipeline Verification

**Confirm ML functionality unchanged:**

1. Go to: http://localhost:3000/assessment

2. **Complete Assessment:**
   - Fill out health assessment form
   - Submit

3. **Verify:**
   - [ ] PCOS prediction works
   - [ ] Confidence score displays
   - [ ] Risk level calculated
   - [ ] Same format as before
   - [ ] Assessment saves to database

4. **Check Backend Logs:**
   - [ ] Model loads successfully
   - [ ] Prediction runs
   - [ ] No errors in ML pipeline

---

## 📊 Database Verification

### Check All Tables in Supabase

1. **users** - https://supabase.com/dashboard/project/your-supabase-project-ref/editor/public/users
   - [ ] Your user record exists
   - [ ] email, name, cycle_length populated

2. **periods** - .../editor/public/periods
   - [ ] Period records exist
   - [ ] user_id matches your ID
   - [ ] Dates are correct

3. **symptoms** - .../editor/public/symptoms
   - [ ] Symptom records exist
   - [ ] symptom_name, severity correct

4. **cycle_history** - .../editor/public/cycle_history
   - [ ] Cycle calculations exist
   - [ ] cycle_length, period_length calculated

5. **cycle_logs** - .../editor/public/cycle_logs
   - [ ] Daily logs exist
   - [ ] flow, symptoms, moods arrays populated

6. **health_assessments** - .../editor/public/health_assessments
   - [ ] Assessment inputs saved

7. **assessment_results** - .../editor/public/assessment_results
   - [ ] ML predictions saved

---

## 🐛 Common Issues & Solutions

### Issue: "Table does not exist"
**Solution:** You forgot to apply the SQL migration. Go back to Step 1 (Apply Database Schema).

### Issue: "No rows returned" on Dashboard
**Solution:** Add some test data first (periods and symptoms).

### Issue: "Unauthorized" error
**Solution:** 
- Check you're logged in
- Verify Supabase credentials in `.env` files
- Check RLS policies are enabled

### Issue: Frontend won't start
**Solution:**
```bash
cd frontend
npm install
npm run dev
```

### Issue: Backend won't start
**Solution:**
```bash
cd backend
pip install -r requirements.txt
python main.py
```

### Issue: "Missing environment variables"
**Solution:**
- Check `.env` files exist in frontend/ and backend/
- Verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY set

---

## ✅ Final Checklist

Before considering testing complete:

- [ ] Applied SQL migration to Supabase
- [ ] Can login successfully
- [ ] Dashboard loads with real data
- [ ] Can add periods
- [ ] Can view period history
- [ ] Can add symptoms
- [ ] Can view symptom history
- [ ] Log Cycle creates periods automatically
- [ ] Cycle calculations work
- [ ] Statistics display correctly
- [ ] Can edit/delete records
- [ ] RLS prevents cross-user access
- [ ] ML predictions still work
- [ ] UI looks identical to before
- [ ] No console errors
- [ ] All Supabase tables populated

---

## 🎉 Success Criteria

You'll know everything is working when:

1. ✅ You can add a period and see it in Period History
2. ✅ You can add a symptom and see it in Symptoms page
3. ✅ Dashboard shows your actual period data
4. ✅ Cycle statistics calculate correctly
5. ✅ Log Cycle auto-creates periods when you log flow
6. ✅ All data persists after page refresh
7. ✅ Supabase tables contain your data
8. ✅ Other users can't see your data
9. ✅ ML predictions still work
10. ✅ UI looks exactly the same as before

---

## 📞 Support

If you encounter issues:

1. Check browser console (F12) for errors
2. Check backend terminal for Python errors
3. Verify Supabase tables exist
4. Verify `.env` files have correct credentials
5. Check RLS policies are enabled
6. Verify you're using the correct test user credentials

---

**Testing Started:** Now
**Expected Duration:** 15-20 minutes
**Status:** Ready to Begin

**Start with:** Apply SQL Migration → Login → Add Period → Add Symptom → Verify Dashboard
