# 🔌 API Integration Examples

This guide shows how to replace mock API calls with real backend endpoints.

---

## 📋 API Endpoints Reference

### Authentication

#### Login
```javascript
// File: src/pages/Login.tsx
// Replace the mock setTimeout with this:

const handleLogin = async (email: string, password: string) => {
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/api/auth/login`,
      { email, password }
    );
    
    const { user, token } = response.data;
    
    // Save token
    localStorage.setItem('token', token);
    
    // Login user
    onLogin(user);
    navigate('/feed');
  } catch (error) {
    setError(error.response?.data?.message || 'Login failed');
  }
};
```

#### Signup
```javascript
// File: src/pages/Signup.tsx
// Replace the mock setTimeout with this:

const handleSignup = async (username: string, email: string, password: string) => {
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/api/auth/signup`,
      { username, email, password }
    );
    
    const { user, token } = response.data;
    
    // Save token
    localStorage.setItem('token', token);
    
    // Signup user
    onSignup(user);
    navigate('/feed');
  } catch (error) {
    setError(error.response?.data?.message || 'Signup failed');
  }
};
```

---

### Posts API

#### Get All Posts
```javascript
// File: src/pages/Feed.tsx
// Add this to your component:

useEffect(() => {
  const fetchPosts = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/posts`
      );
      setPosts(response.data.posts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };
  
  fetchPosts();
}, []);
```

#### Create Post
```javascript
// File: src/components/CreatePost.tsx
// Replace the onPost call with this:

const handlePost = async (content: string, image?: File) => {
  try {
    const formData = new FormData();
    formData.append('content', content);
    if (image) {
      formData.append('image', image);
    }
    
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/api/posts`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    
    // Add new post to feed
    const newPost = response.data.post;
    onPost(content, image);
    
  } catch (error) {
    console.error('Error creating post:', error);
  }
};
```

#### Like/Unlike Post
```javascript
// File: src/pages/Feed.tsx
// Replace handleLike function:

const handleLike = async (postId: string) => {
  try {
    await axios.post(
      `${process.env.REACT_APP_API_URL}/api/posts/${postId}/like`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    
    // Update UI
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          liked: !post.liked,
          likes: post.liked ? post.likes - 1 : post.likes + 1,
        };
      }
      return post;
    }));
  } catch (error) {
    console.error('Error liking post:', error);
  }
};
```

#### Add Comment
```javascript
// File: src/pages/Feed.tsx
// Replace handleCommentSubmit function:

const handleCommentSubmit = async (postId: string, comment: string) => {
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/api/posts/${postId}/comments`,
      { text: comment },
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    
    // Update UI
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: post.comments + 1,
        };
      }
      return post;
    }));
  } catch (error) {
    console.error('Error adding comment:', error);
  }
};
```

#### Delete Post
```javascript
// File: src/pages/Feed.tsx
// Add this new function:

const handleDeletePost = async (postId: string) => {
  try {
    await axios.delete(
      `${process.env.REACT_APP_API_URL}/api/posts/${postId}`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    
    // Remove from feed
    setPosts(posts.filter(post => post.id !== postId));
  } catch (error) {
    console.error('Error deleting post:', error);
  }
};
```

---

### Users API

#### Get User Profile
```javascript
// File: src/pages/Profile.tsx
// Add this to your component:

useEffect(() => {
  const fetchProfile = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/users/${userId}`
      );
      setProfileUser(response.data.user);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };
  
  fetchProfile();
}, [userId]);
```

#### Update Profile
```javascript
// File: src/pages/Settings.tsx
// Replace handleSave function:

const handleSave = async () => {
  try {
    const response = await axios.put(
      `${process.env.REACT_APP_API_URL}/api/users/profile`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    
    // Update user in app context
    setCurrentUser(response.data.user);
    setSaved(true);
    
  } catch (error) {
    console.error('Error updating profile:', error);
    setError('Failed to update profile');
  }
};
```

#### Follow User
```javascript
// File: src/pages/Profile.tsx
// Add this new function:

const handleFollowUser = async (userId: string) => {
  try {
    await axios.post(
      `${process.env.REACT_APP_API_URL}/api/users/${userId}/follow`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    
    setIsFollowing(!isFollowing);
  } catch (error) {
    console.error('Error following user:', error);
  }
};
```

#### Get User Posts
```javascript
// File: src/pages/Profile.tsx
// Add this to your component:

useEffect(() => {
  const fetchUserPosts = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/users/${userId}/posts`
      );
      setUserPosts(response.data.posts);
    } catch (error) {
      console.error('Error fetching user posts:', error);
    }
  };
  
  fetchUserPosts();
}, [userId]);
```

#### Delete Account
```javascript
// File: src/pages/Settings.tsx
// Add this new function:

const handleDeleteAccount = async () => {
  try {
    await axios.delete(
      `${process.env.REACT_APP_API_URL}/api/users/account`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    
    // Logout user
    handleLogout();
  } catch (error) {
    console.error('Error deleting account:', error);
  }
};
```

---

## 🔐 Authentication Setup

### Add Axios Interceptor

Create file: `src/utils/axiosConfig.ts`

```typescript
import axios from 'axios';

// Set base URL
axios.defaults.baseURL = process.env.REACT_APP_API_URL;

// Add auth token to all requests
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle auth errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axios;
```

Then import in `src/App.tsx`:
```typescript
import './utils/axiosConfig';
import axios from 'axios';
```

---

## 🧪 Test API Endpoints

### Using cURL

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Create Post
curl -X POST http://localhost:5000/api/posts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"Hello World!"}'

# Get Posts
curl -X GET http://localhost:5000/api/posts

# Like Post
curl -X POST http://localhost:5000/api/posts/POSTID/like \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Using Postman

1. Download Postman: https://www.postman.com/downloads/
2. Import collection:
   - New → Collection
   - Add requests for each endpoint
   - Set Authorization header to "Bearer TOKEN"

---

## 🚀 Environment Variables

Create `.env` in project root:

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_API_TIMEOUT=10000
```

For production:
```env
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_API_TIMEOUT=15000
```

---

## 🛡️ Error Handling

### Global Error Handler

```typescript
// src/utils/errorHandler.ts

export const handleApiError = (error: any) => {
  const message = error.response?.data?.message || 'An error occurred';
  const status = error.response?.status;
  
  switch (status) {
    case 401:
      // Unauthorized
      localStorage.removeItem('token');
      window.location.href = '/login';
      break;
    case 403:
      // Forbidden
      console.error('Access denied');
      break;
    case 404:
      // Not found
      console.error('Resource not found');
      break;
    case 500:
      // Server error
      console.error('Server error');
      break;
    default:
      console.error(message);
  }
  
  return message;
};
```

---

## 📊 Response Format

Your backend should return responses in this format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "user": { ... },
    "post": { ... },
    "posts": [ ... ]
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "ERROR_CODE"
}
```

---

## 🔄 Pagination Example

```typescript
// File: src/pages/Feed.tsx

const [page, setPage] = useState(1);
const [hasMore, setHasMore] = useState(true);

const loadMorePosts = async () => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/api/posts?page=${page}&limit=10`
    );
    
    setPosts([...posts, ...response.data.posts]);
    setPage(page + 1);
    setHasMore(response.data.hasMore);
  } catch (error) {
    console.error('Error loading more posts:', error);
  }
};
```

---

## 📝 Search Functionality

```typescript
// File: Create new src/pages/Search.tsx

const [searchQuery, setSearchQuery] = useState('');
const [results, setResults] = useState([]);

const handleSearch = async (query: string) => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/api/search?q=${query}`
    );
    setResults(response.data.results);
  } catch (error) {
    console.error('Error searching:', error);
  }
};
```

---

## ✅ Checklist

- [ ] API base URL configured in .env
- [ ] Axios interceptor setup for auth token
- [ ] Login endpoint integrated
- [ ] Signup endpoint integrated
- [ ] Get posts endpoint integrated
- [ ] Create post endpoint integrated
- [ ] Like post endpoint integrated
- [ ] Comment endpoint integrated
- [ ] User profile endpoint integrated
- [ ] Update profile endpoint integrated
- [ ] Error handling implemented
- [ ] Loading states added
- [ ] Token refresh implemented (optional)

---

For more details, see `README.md` and `SETUP.md`
