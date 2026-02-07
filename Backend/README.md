# Social Tree - Backend API

Node.js + Express + MongoDB + Cloudinary backend for Social Tree app.

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   - Copy `.env.example` to `.env` (or edit existing `.env`)
   - Set `CLOUDINARY_CLOUD_NAME` - Get from [Cloudinary Dashboard](https://cloudinary.com/console) (Dashboard shows your Cloud name)
   - MongoDB URI and Cloudinary keys are pre-configured for local dev

3. **Run**
   ```bash
   npm run dev
   ```
   Server runs at `http://localhost:5000`

## API Endpoints

### Auth
- `POST /api/auth/signup` - Register (username, email, password)
- `POST /api/auth/login` - Login (email, password)
- `POST /api/auth/logout` - Logout

### Posts
- `GET /api/posts` - Get all posts (paginate: ?page=1&limit=20)
- `POST /api/posts` - Create post (auth, multipart: content, image)
- `POST /api/posts/:id/like` - Like/unlike (auth)
- `POST /api/posts/:id/comments` - Add comment (auth, body: { text })
- `DELETE /api/posts/:id` - Delete post (auth, owner only)

### Users
- `GET /api/users/me` - Get current user (auth)
- `GET /api/users/:id` - Get user by ID
- `GET /api/users/:id/posts` - Get user's posts
- `PUT /api/users/profile` - Update profile (auth, multipart for avatar)
- `POST /api/users/:id/follow` - Follow user (auth)
- `POST /api/users/:id/unfollow` - Unfollow user (auth)
- `DELETE /api/users/account` - Delete account (auth)

## Cloudinary

Images are uploaded to Cloudinary. MongoDB stores `public_id` and `url` for each image.

**Important:** Set `CLOUDINARY_CLOUD_NAME` in `.env` from your Cloudinary dashboard.
