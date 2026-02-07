# 🌳 Social Tree - Frontend

A modern, responsive social media application built with **React.js** and **Material UI (MUI)**, featuring a sleek dark theme with neon accents.

## ✨ Features

### ✅ Complete Frontend Implemented

#### Authentication
- **Login Page** - Email and password authentication with form validation
- **Signup Page** - New user registration with password confirmation
- Mock authentication flow with localStorage persistence

#### Feed & Posts
- **Social Feed** - Display all posts with user information
- **Create Post** - Create new posts with text and image support
- **Post Interactions** - Like, comment, and share functionality
- **Real-time Updates** - Posts update instantly in the feed
- **Comment Section** - View and add comments on posts

#### User Profile
- **Profile Dashboard** - View user information and statistics
- **User Stats** - Display posts, followers, following counts
- **Image Gallery** - Grid view of user's uploaded images
- **Tabs** - Switch between Images, Reels, and Events
- **Follow/Unfollow** - User relationship management

#### Settings
- **Profile Editing** - Update username, email, bio, phone, location
- **Notification Preferences** - Control like, comment, follow, message notifications
- **Privacy Settings** - Private account, message permissions, tag permissions
- **Account Management** - Logout and account deletion options

#### UI/UX
- **Responsive Design** - Mobile-first approach with desktop optimization
- **Dark Theme** - Modern dark interface with neon accents (Lime Green, Pink, Cyan, Orange, Purple)
- **Bottom Navigation** - Mobile navigation bar for easy access
- **Desktop Header** - Top navigation for larger screens
- **Smooth Animations** - Transitions and hover effects

## 🎨 Design System

### Color Palette
- **Primary**: Lime Green (`#00ff00`)
- **Secondary**: Deep Pink (`#ff1493`)
- **Accent**: Cyan (`#00ffff`)
- **Warning**: Orange (`#ffa500`)
- **Info**: Purple (`#7c3aed`)
- **Background**: Dark Gray (`#1a1a1a`, `#242424`)
- **Text**: White (`#ffffff`), Light Gray (`#b0b0b0`)

### Typography
- **Headings**: Roboto Bold
- **Body**: Roboto Regular
- **Font Weight**: 600 for emphasis, 400 for body text

### Components
- Custom gradient buttons with neon colors
- Rounded cards with subtle borders
- Avatar components with fallback images
- Form fields with neon borders on focus
- Dialog modals for confirmations
- Chips for tags and categories

## 📁 Project Structure

```
src/
├── components/
│   ├── Layout.tsx          # Main layout with navigation
│   └── CreatePost.tsx      # Post creation dialog
├── pages/
│   ├── Login.tsx           # Login page
│   ├── Signup.tsx          # Signup page
│   ├── Feed.tsx            # Social feed page
│   ├── Profile.tsx         # User profile page
│   └── Settings.tsx        # Settings page
├── App.tsx                 # Main app with routing
└── index.tsx               # React entry point
public/
└── index.html              # HTML template
package.json                # Dependencies and scripts
tsconfig.json               # TypeScript configuration
```

## 🚀 Getting Started

### Prerequisites
- Node.js 14.0 or higher
- npm or yarn package manager

### Installation

1. **Clone the repository** (or download the code)
```bash
cd social-tree-app
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the development server**
```bash
npm start
```

The app will open at `http://localhost:3000`

### Build for Production
```bash
npm run build
```

## 🔌 API Integration Guide

The frontend is ready for backend integration. Replace mock API calls with your actual endpoints:

### Login Endpoint
```javascript
// src/pages/Login.tsx
const response = await axios.post('http://your-backend/api/auth/login', {
  email,
  password,
});
```

### Signup Endpoint
```javascript
// src/pages/Signup.tsx
const response = await axios.post('http://your-backend/api/auth/signup', {
  username,
  email,
  password,
});
```

### Get Posts Endpoint
```javascript
// src/pages/Feed.tsx
const response = await axios.get('http://your-backend/api/posts');
```

### Create Post Endpoint
```javascript
// src/components/CreatePost.tsx
const formData = new FormData();
formData.append('content', content);
formData.append('image', image);
const response = await axios.post('http://your-backend/api/posts', formData);
```

### Like Post Endpoint
```javascript
const response = await axios.post(`http://your-backend/api/posts/${postId}/like`);
```

### Get User Profile Endpoint
```javascript
const response = await axios.get(`http://your-backend/api/users/${userId}`);
```

### Update Profile Endpoint
```javascript
const response = await axios.put('http://your-backend/api/users/profile', formData);
```

## 📱 Responsive Breakpoints

- **Mobile**: xs (0-599px)
- **Tablet**: sm (600-959px), md (960-1279px)
- **Desktop**: lg (1280-1919px), xl (1920px+)

## 🎯 Mock Data

The app uses mock data for demonstration. Replace with actual API calls:

- **Users**: Generated with random avatars from `i.pravatar.cc`
- **Posts**: Sample posts with images from Unsplash
- **Comments**: Mock comment data
- **Notifications**: Mock notification settings

## 🔐 Authentication

Currently uses localStorage for persistence. For production:
1. Implement secure session management
2. Use HTTP-only cookies
3. Add JWT token handling
4. Implement refresh token logic

## 🌐 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=build
```

### GitHub Pages
Update `package.json`:
```json
"homepage": "https://yourusername.github.io/social-tree",
```

Then deploy:
```bash
npm run build
npm install -g gh-pages
gh-pages -d build
```

## 📚 Technologies Used

- **React 18.2** - UI framework
- **Material UI 5.14** - Component library
- **React Router 6** - Navigation
- **Emotion** - CSS-in-JS styling
- **Axios** - HTTP client (ready for API calls)
- **TypeScript** - Type safety

## 🎓 Next Steps for Backend Integration

1. Set up Node.js + Express backend
2. Create MongoDB database with collections:
   - `users` - Store user accounts
   - `posts` - Store posts with likes/comments
   - `comments` - Store comment data
3. Implement authentication with JWT/sessions
4. Create REST API endpoints matching frontend calls
5. Deploy backend to Render/Railway/Heroku
6. Update API URLs in frontend code

## 📝 Development Notes

### Available Scripts

- `npm start` - Run development server
- `npm build` - Create production build
- `npm test` - Run tests
- `npm eject` - Eject from react-scripts (not reversible)

### Component Structure

All major features are modularized into separate components and pages for easy maintenance and testing.

### State Management

Currently uses React hooks (useState, useEffect). For larger apps, consider:
- Redux
- Context API
- Zustand
- Recoil

## 🐛 Troubleshooting

**Port 3000 already in use?**
```bash
PORT=3001 npm start
```

**Build fails with memory error?**
```bash
GENERATE_SOURCEMAP=false npm run build
```

**CORS errors when calling backend?**
Enable CORS in your backend:
```javascript
// Express backend example
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

## 📧 Support

For issues or questions about this frontend, reach out to: hr@triplewsols.com

## 📄 License

This project is part of the TaskPlanet Challenge. All rights reserved.

---

**Happy Coding! 🚀** Build something amazing with Social Tree!
