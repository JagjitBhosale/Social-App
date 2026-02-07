const User = require('../models/User');
const Post = require('../models/Post');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryUpload');

// Search users by username
exports.searchUsers = async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q || q.length < 2) {
      return res.json({ success: true, users: [] });
    }

    const users = await User.find({
      username: { $regex: q, $options: 'i' },
    })
      .select('username avatar bio')
      .limit(20)
      .lean();

    const results = users.map((u) => ({
      id: u._id,
      username: u.username,
      avatar: u.avatar,
      bio: u.bio,
      handle: `@${u.username}`,
    }));

    res.json({ success: true, users: results });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get user by ID
exports.getUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select('-password').lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const postCount = await Post.countDocuments({ author: user._id });
    const followersCount = user.followers?.length || 0;
    const followingCount = user.following?.length || 0;
    const isFollowing = req.user
      ? user.followers?.some((id) => id.toString() === req.user.id)
      : false;

    res.json({
      success: true,
      user: {
        ...user,
        id: user._id,
        handle: `@${user.username}`,
        followers: followersCount,
        following: followingCount,
        posts: postCount,
        images: postCount,
        reels: 0,
        events: 0,
        isFollowing,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    let { username, email, bio, phone, location, notifications, privacy } = req.body;
    if (typeof notifications === 'string') {
      try {
        notifications = JSON.parse(notifications);
      } catch {
        notifications = null;
      }
    }
    if (typeof privacy === 'string') {
      try {
        privacy = JSON.parse(privacy);
      } catch {
        privacy = null;
      }
    }

    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (username) user.username = username;
    if (email) user.email = email;
    if (bio !== undefined) user.bio = bio;
    if (phone !== undefined) user.phone = phone;
    if (location !== undefined) user.location = location;
    if (notifications && typeof notifications === 'object') {
      user.notifications = { ...user.notifications, ...notifications };
    }
    if (privacy && typeof privacy === 'object') {
      user.privacy = { ...user.privacy, ...privacy };
    }

    // Handle avatar upload
    if (req.file && req.file.path) {
      const imageData = await uploadToCloudinary(req.file.path, 'social-tree/avatars');
      user.avatar = imageData.url;
    }

    await user.save({ validateBeforeSave: false });

    const updatedUser = await User.findById(user._id).select('-password');

    res.json({
      success: true,
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        bio: updatedUser.bio,
        phone: updatedUser.phone,
        location: updatedUser.location,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Follow user
exports.followUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user.id;

    if (targetUserId === currentUserId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot follow yourself',
      });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const currentUser = await User.findById(currentUserId);

    if (currentUser.following.includes(targetUserId)) {
      return res.status(400).json({
        success: false,
        message: 'Already following this user',
      });
    }

    currentUser.following.push(targetUserId);
    targetUser.followers.push(currentUserId);
    await currentUser.save();
    await targetUser.save();

    res.json({
      success: true,
      message: 'User followed',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Unfollow user
exports.unfollowUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user.id;

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const currentUser = await User.findById(currentUserId);

    currentUser.following = currentUser.following.filter(
      (id) => id.toString() !== targetUserId
    );
    targetUser.followers = targetUser.followers.filter(
      (id) => id.toString() !== currentUserId
    );
    await currentUser.save();
    await targetUser.save();

    res.json({
      success: true,
      message: 'User unfollowed',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get user posts (full data for profile preview)
exports.getUserPosts = async (req, res) => {
  try {
    const userId = req.params.id;

    const posts = await Post.find({ author: userId })
      .populate('author', 'username avatar')
      .populate('comments.author', 'username avatar')
      .sort({ createdAt: -1 })
      .lean();

    const currentUserId = req.user?.id;
    const transformedPosts = posts.map((post) => ({
      ...post,
      id: post._id.toString(),
      author: post.author ? {
        id: post.author._id?.toString(),
        username: post.author.username,
        avatar: post.author.avatar,
      } : null,
      image: post.image?.url || null,
      video: post.video?.url || null,
      timestamp: post.createdAt,
      likes: post.likes?.length || 0,
      liked: currentUserId ? post.likes?.some((id) => id.toString() === currentUserId) : false,
      commentsCount: post.comments?.length || 0,
      commentsList: (post.comments || []).map((c) => ({
        id: c._id,
        author: c.author ? { id: c.author._id?.toString(), username: c.author.username, avatar: c.author.avatar } : null,
        text: c.text,
        createdAt: c.createdAt,
      })),
    }));

    res.json({
      success: true,
      posts: transformedPosts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete account
exports.deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Delete all user posts (and their Cloudinary images)
    const posts = await Post.find({ author: user._id });
    for (const post of posts) {
      if (post.image?.public_id) {
        await deleteFromCloudinary(post.image.public_id);
      }
    }
    await Post.deleteMany({ author: user._id });

    await User.findByIdAndDelete(user._id);

    res.json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
