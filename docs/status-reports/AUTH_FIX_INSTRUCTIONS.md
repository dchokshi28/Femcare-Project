# FEMCARE AUTHENTICATION FIX

## What Was Fixed

### 1. Removed DEMO_MODE
- Disabled the demo mode bypass that was preventing real Supabase Auth
- Now using actual Supabase authentication

### 2. Fixed Signup Flow
```
User fills signup form
↓
supabase.auth.signUp() with user_metadata
↓
Supabase Auth creates auth.users record
↓
Database trigger creates users profile (if trigger is set up)
↓
Frontend loads user profile OR uses auth metadata
↓
User can login and use the app
```

### 3. Handles Email Confirmation
- Detects if email confirmation is enabled
- Shows appropriate success message
- Doesn't attempt authenticated database writes without a session

### 4. Fixed Profile Loading
- Tries to load from `users` table first
- Falls back to auth.user_metadata if profile doesn't exist
- Prevents 401 errors

### 5. Password Security
- Passwords are ONLY stored in Supabase Auth (auth.users)
- NOT stored in public.users table
- Uses supabase.auth.signInWithPassword() for login

---

## REQUIRED: Run Supabase Setup Script

You MUST run the SQL setup script to configure:
- RLS policies
- Database trigger for auto-profile creation
- Proper permissions

### Steps:

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click "SQL Editor" in left sidebar
   - Click "New Query"

3. **Run Setup Script**
   - Open: `supabase_setup.sql`
   - Copy entire script
   - Paste into SQL Editor
   - Click "Run"

4. **Verify Success**
   - Check for "Success. No rows returned" or similar
   - Verify no error messages
   - Check that trigger was created

---

## Testing Instructions

### Test 1: Brand New Signup

1. Open http://localhost:3000/signup
2. Fill in form with NEW email:
   ```
   Name: Test User
   Email: test123@example.com
   Age: 28
   Cycle Length: 28
   Password: testpass123
   ```
3. Click "Sign Up"

**Expected Result:**
- If email confirmation is DISABLED:
  - Immediately redirected to Dashboard
  - User is logged in
  - Can see their name in dashboard

- If email confirmation is ENABLED:
  - Green success message appears
  - "Please check your email to confirm your account"
  - User stays on signup page

### Test 2: Email Confirmation (if enabled)

1. Check the email inbox for test123@example.com
2. Click confirmation link
3. Go to http://localhost:3000/login
4. Login with:
   ```
   Email: test123@example.com
   Password: testpass123
   ```

**Expected Result:**
- Successfully logs in
- Redirected to Dashboard
- No 401 errors
- No "Invalid credentials" errors

### Test 3: Verify Profile in Supabase

1. Go to Supabase Dashboard → Authentication → Users
2. Verify new user exists with correct email
3. Go to Table Editor → users table
4. Verify profile row exists with:
   - id = auth.users.id (UUID)
   - email = test123@example.com
   - name = Test User
   - age = 28
   - cycle_length = 28

### Test 4: Add Period

1. While logged in, go to Dashboard
2. Click "Log Cycle" or go to Period History
3. Add a period:
   ```
   Start Date: 2025-02-01
   End Date: 2025-02-05
   Flow: Medium
   ```
4. Save

**Expected Result:**
- Period is saved
- Appears in Period History
- Dashboard shows correct cycle day
- No 401 errors

### Test 5: Add Symptom

1. Go to Symptoms page
2. Add a symptom:
   ```
   Date: Today
   Symptom: Cramps
   Severity: Moderate
   ```
3. Save

**Expected Result:**
- Symptom is saved
- Appears in symptoms list
- No 401 errors

### Test 6: Session Persistence

1. Refresh the page (F5)
2. Check if still logged in

**Expected Result:**
- User remains logged in
- Dashboard loads correctly
- No redirect to login

### Test 7: Logout and Re-login

1. Click Logout
2. Verify redirected to login/home
3. Login again with same credentials

**Expected Result:**
- Login succeeds
- Previous data (periods, symptoms) still exists
- User data persists

---

## Troubleshooting

### Error: "Invalid login credentials"

**Cause**: User doesn't exist in auth.users OR email not confirmed

**Fix**:
1. Check Supabase Dashboard → Authentication → Users
2. If user exists but email_confirmed_at is null → user must confirm email
3. If user doesn't exist → signup again

### Error: 401 on /rest/v1/users

**Cause**: RLS policy not configured OR no authenticated session

**Fix**:
1. Run supabase_setup.sql script
2. Verify RLS policies exist
3. Check that signup returns a session

### Error: Profile not loading

**Cause**: users table row doesn't exist AND auth metadata is empty

**Fix**:
1. Verify database trigger is created (supabase_setup.sql)
2. OR: profile will use auth metadata as fallback
3. Check auth.users.raw_user_meta_data contains user info

### Email Confirmation Not Working

**Cause**: Supabase email confirmation is enabled but emails aren't sending

**Fix**:
1. Go to Supabase Dashboard → Authentication → Email Templates
2. Check email provider settings
3. For testing, you can disable email confirmation:
   - Dashboard → Authentication → Settings
   - Turn OFF "Enable email confirmations"

---

## Current Status

### ✅ Fixed:
- DEMO_MODE removed
- Proper Supabase Auth signup
- Handles email confirmation
- Fallback to auth metadata
- No password storage in public tables
- Proper session handling

### ⚠️ Requires Setup:
- Run supabase_setup.sql in Supabase Dashboard
- Database trigger must be created
- RLS policies must be configured

### 🧪 Requires Testing:
- Actual signup through UI
- Login after signup
- Period/symptom creation
- Session persistence
- Logout/re-login

---

## Next Steps

1. ✅ Code changes applied
2. ⏳ **YOU MUST**: Run `supabase_setup.sql` in Supabase SQL Editor
3. ⏳ Test signup with brand new email
4. ⏳ Verify no 401 errors
5. ⏳ Verify data persistence
6. ⏳ Verify RLS working (users can only see their own data)

---

## Files Changed

1. `frontend/src/context/AuthContext.jsx`
   - Removed DEMO_MODE
   - Fixed signup to use auth.signUp() with metadata
   - Added email confirmation handling
   - Fixed profile loading with fallback
   - Fixed login

2. `frontend/src/pages/Signup.jsx`
   - Added success message state
   - Handles email confirmation message
   - Doesn't navigate if confirmation required

3. `supabase_setup.sql` (NEW)
   - RLS policies for all tables
   - Database trigger for auto-profile creation
   - Uses auth.uid() correctly

---

## Authentication Flow Summary

```
SIGNUP:
User submits form
  ↓
supabase.auth.signUp({ email, password, options: { data: {...} } })
  ↓
Supabase creates auth.users record
  ↓
Database trigger creates users profile (if trigger exists)
  ↓
If email confirmation required: show message
If no confirmation: auto-login and redirect


LOGIN:
User submits credentials
  ↓
supabase.auth.signInWithPassword({ email, password })
  ↓
Supabase verifies credentials from auth.users
  ↓
Returns session + JWT
  ↓
Frontend loads user profile
  ↓
Redirect to dashboard


DATA ACCESS:
User adds period/symptom
  ↓
Frontend sends request with Authorization: Bearer <JWT>
  ↓
Supabase verifies JWT
  ↓
RLS policy checks: auth.uid() = user_id
  ↓
If authorized: insert/select/update/delete
  ↓
Returns data


LOGOUT:
supabase.auth.signOut()
  ↓
Session cleared
  ↓
Redirect to login
```

---

## Security Checklist

✅ Passwords stored ONLY in auth.users (Supabase Auth)  
✅ NOT stored in public.users table  
✅ Login uses supabase.auth.signInWithPassword()  
✅ RLS enabled on all tables  
✅ Users can only access their own data (auth.uid() = user_id)  
✅ JWT verified by Supabase for all requests  
✅ No hardcoded user IDs  
✅ No fake/demo authentication bypasses  

---

## Email Confirmation Status

To check if email confirmation is enabled:
1. Go to Supabase Dashboard
2. Authentication → Settings
3. Look for "Enable email confirmations"

**If ENABLED**: Users must confirm email before logging in  
**If DISABLED**: Users can login immediately after signup  

The code handles both cases correctly.
