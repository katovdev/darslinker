# Moderator Login Credentials & 10-Second View Tracking

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
- ✅ **10-Second View Tracking System Implemented**

## 10-Second View Tracking Logic:

### How It Works:
1. **Blog Card Click**: User clicks on blog card → immediately navigates to blog detail page
2. **10-Second Timer**: Blog detail page starts a 10-second timer
3. **View Tracking**: Only after 10 seconds (or when user leaves page after 10+ seconds), view is tracked
4. **Unique Views**: Each unique visitor (IP + User Agent) is tracked separately
5. **Total Views**: All valid views (10+ seconds) are counted

### Implementation Details:
- **Frontend**: 
  - `blog-detail.js`: 10-second timer + page leave detection
  - `dynamic-articles.js`: Immediate navigation on card click
  - `blog-list.js`: Immediate navigation on card click
- **Backend**: 
  - Enhanced `trackView` endpoint with unique visitor tracking
  - Detailed logging for debugging
  - MD5 hash for unique visitor identification

### View Tracking Events:
- ✅ User stays 10+ seconds → View tracked
- ✅ User leaves page after 10+ seconds → View tracked  
- ❌ User leaves page before 10 seconds → No view tracked
- ✅ Same user returns → Total views increase, unique views stay same
- ✅ New user visits → Both total and unique views increase

## Expected Behavior:
After successful login, you should be able to:
- Create new blog posts
- Edit existing blog posts
- Delete blog posts
- View analytics with accurate view counts
- All blog posts created will appear in the main frontend home.js
- View counts will only increase for genuine 10+ second visits

## Testing the View System:
1. Create a blog in moderator
2. Go to home.js and click the blog card
3. Stay on blog detail page for 10+ seconds
4. Check console logs for view tracking confirmation
5. Return to home.js and see updated view count

## Troubleshooting:
If you still get 403 errors, check the browser console for detailed error messages and let me know what you see.