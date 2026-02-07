# 🚀 Social Tree - Setup & Development Guide

## ✅ Project Overview

**Social Tree** is a complete React + Material UI frontend application for a social media platform, similar to Instagram or Twitter. All UI components, pages, and features are fully implemented and ready for backend API integration.

## 📋 What's Included

### ✨ Pages & Features

1. **Login Page** (`src/pages/Login.tsx`)
   - Email/password form with validation
   - Link to signup page
   - Mock authentication with localStorage

2. **Signup Page** (`src/pages/Signup.tsx`)
   - Registration form with username, email, password
   - Password confirmation
   - Form validation
   - Redirect to feed after signup

3. **Feed Page** (`src/pages/Feed.tsx`)
   - Social feed with posts from all users
   - Create new post button
   - Like/unlike posts
   - Comment on posts
   - Share posts
   - Real-time post updates

4. **Profile Page** (`src/pages/Profile.tsx`)
   - User profile information
   - User statistics (posts, followers, following)
   - User avatar and bio
   - Image gallery grid
   - Tabs for Images, Reels, Events
   - Follow/unfollow button
   - Message button

5. **Settings Page** (`src/pages/Settings.tsx`)
   - Edit profile information
   - Change avatar
   - Notification preferences
   - Privacy settings
   - Account management (logout, delete)
   - Save changes with confirmation

### 🎨 Components

- **Layout** (`src/components/Layout.tsx`)
  - Desktop header with navigation
  - Mobile bottom navigation
  - Logo and app title

- **CreatePost** (`src/components/CreatePost.tsx`)
  - Post creation modal dialog
  - Text and image support
  - Action buttons (emoji, location, tags)
  - Image preview

## 🛠️ Installation & Setup

### Step 1: Install Node.js
Download and install from https://nodejs.org (LTS recommended)

### Step 2: Extract/Clone Project
```bash
cd social-tree-app
```

### Step 3: Install Dependencies
```bash
npm install
```

This will install:
- React 18.2
- Material UI 5.14
- React Router 6
- Emotion (styling)
- Axios (API client)
- Date-fns (date utilities)

### Step 4: Start Development Server
```bash
npm start
```

The app will automatically open at `http://localhost:3000`

### Step 5: Test the App

**Login with any email/password:**
- Email: `test@example.com`
- Password: `password123`

The app uses mock authentication - any credentials work!

## 📱 Testing the Features

### 1. Create Post
- Click on "What's on your mind?" in the feed
- Type some text or upload an image
- Click "Post"

### 2. Like/Comment
- Click the heart icon to like a post
- Click the comment icon to view/add comments
- Click the share icon to share (UI ready for API)

### 3. Visit Profile
- Click on the avatar in the top right
- View profile stats and photos
- Click "Following" button to test interactions
- Edit profile by clicking "Edit" button

### 4. Settings
- Go to Settings page
- Update profile information
- Toggle notification preferences
- Test logout button

## 🔌 Backend Integration Guide

### Setup Your Backend

Create a Node.js + Express backend with MongoDB. Example endpoint structure:

```
POST   /api/auth/login        - User login
POST   /api/auth/signup       - User registration
GET    /api/posts             - Get all posts
POST   /api/posts             - Create post
POST   /api/posts/:id/like    - Like post
POST   /api/posts/:id/comment - Comment on post
GET    /api/users/:id         - Get user profile
PUT    /api/users/profile     - Update profile
```

### Update API URLs

Replace mock API calls in the code with your actual backend:

**File: `src/pages/Login.tsx`** (Line ~35)
```javascript
// BEFORE (mock):
setTimeout(() => {
  const mockUser = { ... };
  onLogin(mockUser);
}, 1000);

// AFTER (real API):
const response = await axios.post('http://your-backend-url/api/auth/login', {
  email,
  password,
});
const user = response.data.user;
onLogin(user);
localStorage.setItem('token', response.data.token);
```

**File: `src/pages/Signup.tsx`** (Line ~40)
```javascript
// Replace mock with actual API call
const response = await axios.post('http://your-backend-url/api/auth/signup', {
  username,
  email,
  password,
});
onSignup(response.data.user);
```

**File: `src/pages/Feed.tsx`** (Line ~45)
```javascript
// Fetch posts from backend
useEffect(() => {
  const fetchPosts = async () => {
    const response = await axios.get('http://your-backend-url/api/posts');
    setPosts(response.data);
  };
  fetchPosts();
}, []);
```

**File: `src/pages/Feed.tsx`** (Line ~75)
```javascript
// Like post API call
const handleLike = async (postId: string) => {
  await axios.post(`http://your-backend-url/api/posts/${postId}/like`);
  // Update UI
};
```

### Add Authentication Token

Update `src/App.tsx` to include auth token in all requests:

```javascript
import axios from 'axios';

// Add interceptor to include token in all requests
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## 📊 Database Schema

Your backend should use this MongoDB schema:

### Users Collection
```javascript
{
  _id: ObjectId,
  username: String (unique),
  email: String (unique),
  password: String (hashed with bcrypt),
  avatar: String (URL),
  bio: String,
  location: String,
  phone: String,
  isPrivate: Boolean,
  followers: [ObjectId],      // Array of user IDs
  following: [ObjectId],      // Array of user IDs
  createdAt: Date,
  updatedAt: Date
}
```

### Posts Collection
```javascript
{
  _id: ObjectId,
  author: ObjectId,           // Reference to User
  content: String,
  image: String (URL),
  likes: [ObjectId],          // Array of user IDs who liked
  comments: [{
    _id: ObjectId,
    author: ObjectId,
    text: String,
    createdAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

## 🌐 Environment Variables

Create a `.env` file in the project root:

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_API_TIMEOUT=10000
```

Then use in your code:
```javascript
const API_URL = process.env.REACT_APP_API_URL;
```

## 🎨 Customization

### Change Colors

Edit `src/App.tsx` theme configuration:

```javascript
const theme = createTheme({
  palette: {
    primary: {
      main: '#00ff00',    // Change primary color
    },
    secondary: {
      main: '#ff1493',    // Change secondary color
    },
    // ... more colors
  },
});
```

### Change App Name

Update in multiple files:
- `public/index.html` - `<title>Social Tree</title>`
- `src/App.tsx` - Component names
- `src/components/Layout.tsx` - Header title

### Add New Pages

1. Create file in `src/pages/NewPage.tsx`
2. Add route in `src/App.tsx`
3. Add navigation link in `src/components/Layout.tsx`

Example:
```javascript
// src/App.tsx
<Route path="/new-page" element={<NewPage />} />

// src/components/Layout.tsx
<BottomNavigationAction label="New" icon={<SomeIcon />} />
```

## 📦 Building for Production

### Create Production Build
```bash
npm run build
```

This creates an optimized build in the `/build` folder.

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

### Deploy to Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=build
```

### Deploy to GitHub Pages
1. Add to `package.json`:
   ```json
   "homepage": "https://yourusername.github.io/social-tree"
   ```

2. Deploy:
   ```bash
   npm install -g gh-pages
   npm run build
   gh-pages -d build
   ```

## 🔒 Security Considerations

1. **Never store sensitive data in localStorage**
   - Move auth tokens to secure HTTP-only cookies
   - Implement session management

2. **Validate inputs on backend**
   - Don't trust frontend validation alone
   - Sanitize all user inputs

3. **Use HTTPS in production**
   - Get SSL certificate
   - Redirect HTTP to HTTPS

4. **Implement CORS properly**
   ```javascript
   // Backend example
   const cors = require('cors');
   app.use(cors({
     origin: 'https://yourdomain.com',
     credentials: true
   }));
   ```

5. **Hash passwords**
   - Use bcrypt for password hashing
   - Never store plain passwords

## 🐛 Troubleshooting

### Port 3000 Already in Use
```bash
PORT=3001 npm start
```

### npm install fails
```bash
# Clear npm cache
npm cache clean --force

# Try install again
npm install
```

### CORS Errors
Make sure your backend allows requests from:
- `http://localhost:3000` (development)
- Your production domain (production)

### Build Fails
```bash
# Clear cache and rebuild
rm -rf build node_modules
npm install
npm run build
```

### White Screen After Login
1. Check browser console for errors (F12)
2. Verify token is being stored in localStorage
3. Check that user object has required fields

## 📚 Useful Resources

- **React Documentation**: https://react.dev
- **Material UI Documentation**: https://mui.com
- **React Router Documentation**: https://reactrouter.com
- **Express.js Guide**: https://expressjs.com
- **MongoDB Documentation**: https://docs.mongodb.com
- **Axios Documentation**: https://axios-http.com

## ✅ Checklist for Production

- [ ] API endpoints configured
- [ ] Authentication flow tested
- [ ] Posts can be created, liked, commented
- [ ] User profiles display correctly
- [ ] Settings save properly
- [ ] Logout works
- [ ] Responsive design tested on mobile
- [ ] Build runs without errors
- [ ] Environment variables set
- [ ] CORS configured in backend
- [ ] HTTPS enabled
- [ ] Error handling implemented
- [ ] Loading states added
- [ ] Rate limiting enabled

## 📞 Support

For issues or questions:
1. Check the browser console (F12) for errors
2. Review the README.md for API integration info
3. Contact: hr@triplewsols.com

---

**You're all set! Happy building! 🚀**
