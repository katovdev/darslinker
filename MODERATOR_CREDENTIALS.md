# Moderator Login Credentials

## Current Credentials:
- **Phone Number**: `+998 99 000 99 00`
- **Password**: `moderator_darslinker`

## How to Use:
1. Open the moderator interface at `http://localhost:3001`
2. Enter the phone number exactly as shown above (with spaces)
3. Enter the password exactly as shown above
4. Click login

## What's Fixed:
- ✅ JWT authentication system implemented
- ✅ Admin login endpoint created (`/api/sub-admins/admin-login`)
- ✅ CORS configured for moderator port
- ✅ Token validation and role checking
- ✅ Automatic token refresh on 401 errors

## Expected Behavior:
After successful login, you should be able to:
- Create new blog posts
- Edit existing blog posts
- Delete blog posts
- View analytics
- All blog posts created will appear in the main frontend home.js

## Troubleshooting:
If you still get 403 errors, check the browser console for detailed error messages and let me know what you see.