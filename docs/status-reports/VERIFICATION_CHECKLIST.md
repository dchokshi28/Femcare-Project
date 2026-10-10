# AUTHENTICATION VERIFICATION CHECKLIST

## Before Testing

- [ ] Backend running on port 5000
- [ ] Frontend running on port 3000  
- [ ] `supabase_setup.sql` executed in Supabase Dashboard
- [ ] No errors from SQL script

---

## Test Results

### Core Authentication

- [ ] **Signup through UI**: PASS/FAIL
- [ ] **Supabase Auth User Created Automatically**: PASS/FAIL
- [ ] **Email Confirmation Handling**: PASS/FAIL/N/A
- [ ] **Login**: PASS/FAIL
- [ ] **Logout**: PASS/FAIL
- [ ] **Session Persistence**: PASS/FAIL

### Errors Fixed

- [ ] **401 users Error**: FIXED/NOT FIXED
- [ ] **Invalid Login Credentials**: FIXED/NOT FIXED

### Security

- [ ] **Manual User Creation Required**: YES/NO
- [ ] **Password Stored Outside Supabase Auth**: YES/NO
- [ ] **User UUID Source**: auth.users.id / OTHER

### Profile Handling

Profile loading method:
- [ ] From users table
- [ ] From auth.user_metadata fallback
- [ ] Both working

### Application Features After New Signup

Test with BRAND NEW account:

- [ ] **Period Tracking After New Signup**: PASS/FAIL
- [ ] **Symptoms After New Signup**: PASS/FAIL
- [ ] **Cycle History After New Signup**: PASS/FAIL
- [ ] **Booking After New Signup**: PASS/FAIL
- [ ] **AI Chatbot After New Signup**: PASS/FAIL

### Data Security

- [ ] **RLS**: PASS/FAIL
- [ ] **Cross-user Data Isolation**: PASS/FAIL
  - Can user A see user B's periods? (should be NO)
  - Can user A modify user B's data? (should be NO)

### UI Integrity

- [ ] **UI Changed**: YES/NO
- [ ] **Styling Intact**: YES/NO
- [ ] **Navigation Working**: YES/NO

---

## Overall Authentication Status

**READY / NOT READY**

---

## Notes

Use this space to record any issues, observations, or next steps:

```
[Your notes here]
```

---

## Test Account Details

Record the test account you created:

```
Email: ___________________________
Password: _________________________
Name: ____________________________
Age: _____
Cycle Length: _____
```

---

## Supabase Verification

After signup, verify in Supabase Dashboard:

### Authentication → Users
- [ ] User exists
- [ ] Email matches
- [ ] email_confirmed_at populated (if confirmation disabled)
- [ ] UUID copied: ________________________________

### Table Editor → users
- [ ] Profile row exists
- [ ] id matches auth.users.id
- [ ] email matches
- [ ] name correct
- [ ] age correct
- [ ] cycle_length correct

### Table Editor → periods (after adding period)
- [ ] Period row exists
- [ ] user_id matches auth.users.id
- [ ] Data correct

### Table Editor → symptoms (after adding symptom)
- [ ] Symptom row exists
- [ ] user_id matches auth.users.id
- [ ] Data correct

---

## SQL Trigger Verification

Run this query in Supabase SQL Editor:

```sql
SELECT tgname, tgenabled 
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';
```

Result:
- [ ] Trigger exists
- [ ] Trigger enabled

---

## RLS Policy Verification

Run this query in Supabase SQL Editor:

```sql
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('users', 'periods', 'symptoms', 'cycle_history', 'bookings')
ORDER BY tablename;
```

Check that policies exist for:
- [ ] users (SELECT, INSERT, UPDATE)
- [ ] periods (SELECT, INSERT, UPDATE, DELETE)
- [ ] symptoms (SELECT, INSERT, UPDATE, DELETE)
- [ ] cycle_history (SELECT, INSERT, UPDATE, DELETE)
- [ ] bookings (SELECT, INSERT, UPDATE, DELETE)

---

## Common Issues

### Issue: "Invalid login credentials"
- Check: User exists in Authentication → Users?
- Check: Email confirmed (if confirmation required)?
- Check: Correct password?

### Issue: 401 Error
- Check: SQL script ran successfully?
- Check: RLS policies exist?
- Check: User is logged in (has session)?

### Issue: Profile not loading
- Check: Database trigger exists?
- Check: users table has row?
- Check: auth.user_metadata populated?

### Issue: Data not saving
- Check: RLS policies correct?
- Check: user_id in request matches auth.uid()?
- Check: Authorization header sent?

---

## Final Sign-Off

Date: _______________
Tester: ______________

All critical tests passed: YES / NO

Authentication ready for use: YES / NO

Outstanding issues:
```
[List any remaining issues]
```
