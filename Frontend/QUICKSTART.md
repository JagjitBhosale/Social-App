# ⚡ Quick Start Guide - Social Tree

## 🎯 Get Running in 3 Steps

### 1️⃣ Install Dependencies
```bash
npm install
```

### 2️⃣ Start Development Server
```bash
npm start
```

### 3️⃣ Open in Browser
The app opens automatically at `http://localhost:3000`

---

## 🧪 Test It Out

### Login Page
- Navigate to: `http://localhost:3000/login`
- Email: `test@example.com`
- Password: `password123` (any password works!)
- Click "Don't have an account? Sign up"

### Signup Page
- Enter: username, email, password
- Confirm password
- Click "Sign Up"

### Feed Page
- Click "What's on your mind?"
- Type a post and click "Post"
- Like, comment, or share posts
- Click on user avatars to visit profiles

### Profile Page
- Click avatar in top right
- View stats, photos, and user info
- Click "Following" button
- Click "Chat" button
- Switch between Images/Reels/Events tabs

### Settings Page
- Click Settings icon
- Edit profile information
- Toggle notification & privacy settings
- Click "Logout" to test

---

## 🎨 Project Structure

```
src/
├── pages/
│   ├── Login.tsx        ✅ Login page
│   ├── Signup.tsx       ✅ Signup page
│   ├── Feed.tsx         ✅ Social feed
│   ├── Profile.tsx      ✅ User profile
│   ├── Settings.tsx     ✅ Settings/preferences
│   └── NotFound.tsx     ✅ 404 page
├── components/
│   ├── Layout.tsx       ✅ Main layout + navigation
│   └── CreatePost.tsx   ✅ Post creation dialog
├── App.tsx              ✅ Routes & theme
└── index.tsx            ✅ Entry point
```

---

## 🔌 Connect to Backend

### 1. Identify API Calls

Open these files and find `// Mock API call` comments:
- `src/pages/Login.tsx` - Line ~35
- `src/pages/Signup.tsx` - Line ~40
- `src/pages/Feed.tsx` - Line ~45

### 2. Replace with Real API

Example - Replace in `Login.tsx`:

**BEFORE (mock):**
```javascript
// Mock API call - Replace with your backend endpoint
setTimeout(() => {
  const mockUser = { ... };
  onLogin(mockUser);
}, 1000);
```

**AFTER (real API):**
```javascript
const response = await axios.post(
  'http://your-backend:5000/api/auth/login',
  { email, password }
);
onLogin(response.data.user);
```

### 3. Set Backend URL

Create `.env` file:
```env
REACT_APP_API_URL=http://localhost:5000
```

Use it:
```javascript
const API_URL = process.env.REACT_APP_API_URL;
const response = await axios.post(`${API_URL}/api/auth/login`, ...);
```

---

## 🎨 Features Implemented

- ✅ **Authentication** - Login & Signup
- ✅ **Feed** - View & create posts
- ✅ **Interactions** - Like, comment, share
- ✅ **Profile** - User info & photos
- ✅ **Settings** - Preferences & logout
- ✅ **Navigation** - Mobile & desktop views
- ✅ **Dark Theme** - Modern neon colors
- ✅ **Responsive** - Mobile to desktop

---

## 📱 Mobile vs Desktop

### Mobile (< 960px)
- Bottom navigation bar
- Full-width layout
- Touch-optimized buttons

### Desktop (≥ 960px)
- Top header navigation
- Centered content
- Keyboard shortcuts ready

---

## 🎯 Next Steps

1. **Review Code**
   - Read through pages to understand structure
   - Check how components are organized

2. **Understand State**
   - Posts, users, comments all use React useState
   - Ready to replace with API calls

3. **Setup Backend**
   - Create Node.js + Express server
   - Connect to MongoDB
   - Implement API endpoints

4. **Integrate APIs**
   - Replace mock data with API calls
   - Add loading/error states
   - Test each endpoint

5. **Deploy**
   - Build: `npm run build`
   - Deploy to Vercel/Netlify
   - Set up backend server
   - Update API URLs for production

---

## 🚀 Deploy to Vercel

### Free Hosting
```bash
npm install -g vercel
vercel
```

Select:
- Framework: Other
- Output directory: `build`

Your app is live! 🎉

---

## 📝 File Reference

| File | Purpose |
|------|---------|
| `App.tsx` | Routes & theme |
| `Login.tsx` | Login page |
| `Signup.tsx` | Signup page |
| `Feed.tsx` | Posts feed |
| `Profile.tsx` | User profile |
| `Settings.tsx` | Settings |
| `Layout.tsx` | Navigation layout |
| `CreatePost.tsx` | Post dialog |

---

## 💡 Tips

**Stuck?**
- Check browser console (F12)
- Read error messages
- Check network tab for API calls

**Want to change colors?**
- Edit `src/App.tsx` palette section
- Colors are in hex format
- Changes apply everywhere!

**Want to add a page?**
- Create `src/pages/NewPage.tsx`
- Add route in `App.tsx`
- Add link in `Layout.tsx`

---

## ⚙️ Available Commands

```bash
npm start          # Start dev server (port 3000)
npm run build      # Create production build
npm test           # Run tests
npm run eject      # Advanced - NOT reversible!
```

---

## 🎓 Learn More

- **React Docs**: https://react.dev
- **Material UI**: https://mui.com
- **React Router**: https://reactrouter.com
- **Axios**: https://axios-http.com

---

**Ready? Start with `npm install && npm start` 🚀**
