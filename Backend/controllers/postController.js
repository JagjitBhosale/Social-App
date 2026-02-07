const Post = require('../models/Post');
const Notification = require('../models/Notification');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryUpload');

// Get all posts (with pagination, mode: global | following)
exports.getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const mode = req.query.mode || 'global';
    const skip = (page - 1) * limit;

    let query = {};
    if (mode === 'following' && req.user) {
      const authorIds = req.user.following ? [...req.user.following] : [];
      authorIds.push(req.user.id); // Include own posts
      query = { author: { $in: authorIds } };
    }

    const posts = await Post.find(query)
      .populate('author', 'username avatar')
      .populate('comments.author', 'username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Post.countDocuments(query);

    // Transform for frontend - match Frontend Post interface
    const userId = req.user?.id;
    const transformedPosts = posts.map((post) => ({
      ...post,
      id: post._id.toString(),
      author: {
        id: post.author?._id?.toString(),
        username: post.author?.username,
        avatar: post.author?.avatar,
      },
      image: post.image?.url || null,
      video: post.video?.url || null,
      timestamp: post.createdAt,
      likes: Array.isArray(post.likes) ? post.likes.length : 0,
      liked: userId ? post.likes?.some((id) => id.toString() === userId) : false,
      likedBy: (post.likes || []).map((id) => id.toString()),
      commentsCount: post.comments?.length || 0,
      comments: (post.comments || []).map((c) => ({
        id: c._id,
        author: c.author ? {
          id: c.author._id?.toString(),
          username: c.author.username,
          avatar: c.author.avatar,
        } : null,
        text: c.text,
        createdAt: c.createdAt,
      })),
    }));

    res.json({
      success: true,
      posts: transformedPosts,
      total,
      pages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create post (with optional image or video upload to Cloudinary)
exports.createPost = async (req, res) => {
  try {
    const { content } = req.body;
    let imageData = null;
    let videoData = null;

    const imageFile = req.files?.image?.[0];
    const videoFile = req.files?.video?.[0];

    if (imageFile && imageFile.path) {
      imageData = await uploadToCloudinary(imageFile.path, 'social-tree/posts', 'image');
    }
    if (videoFile && videoFile.path) {
      videoData = await uploadToCloudinary(videoFile.path, 'social-tree/posts', 'video');
    }

    const post = await Post.create({
      author: req.user.id,
      content: content || '',
      image: imageData,
      video: videoData,
    });

    await post.populate('author', 'username avatar');

    const postObj = post.toObject();
    res.status(201).json({
      success: true,
      post: {
        ...postObj,
        id: post._id.toString(),
        author: {
          id: post.author._id.toString(),
          username: post.author.username,
          avatar: post.author.avatar,
        },
        image: post.image?.url || null,
        video: post.video?.url || null,
        timestamp: post.createdAt,
        likes: 0,
        liked: false,
        likedBy: [],
        comments: 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Like post (toggle - like if not liked, unlike if already liked)
exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    const userId = req.user.id;
    const alreadyLiked = post.likes.some((id) => id.toString() === userId);

    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      post.likes.push(userId);
      const postAuthorId = post.author.toString();
      if (postAuthorId !== userId) {
        await Notification.create({
          user: postAuthorId,
          type: 'like',
          fromUser: userId,
          post: post._id,
        });
      }
    }

    await post.save();

    res.json({
      success: true,
      likes: post.likes.length,
      liked: !alreadyLiked,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete comment
exports.deleteComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }

    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment',
      });
    }

    post.comments.pull(req.params.commentId);
    await post.save();
    await post.populate('comments.author', 'username avatar');

    res.json({
      success: true,
      comments: post.comments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Add comment
exports.commentPost = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide comment text',
      });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    post.comments.push({
      author: req.user.id,
      text: text.trim(),
    });

    const postAuthorId = post.author.toString();
    if (postAuthorId !== req.user.id) {
      await Notification.create({
        user: postAuthorId,
        type: 'comment',
        fromUser: req.user.id,
        post: post._id,
      });
    }

    await post.save();
    await post.populate('comments.author', 'username avatar');

    const newComment = post.comments[post.comments.length - 1];

    res.json({
      success: true,
      comments: post.comments,
      newComment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete post
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post',
      });
    }

    if (post.image?.public_id) {
      await deleteFromCloudinary(post.image.public_id, 'image');
    }
    if (post.video?.public_id) {
      await deleteFromCloudinary(post.video.public_id, 'video');
    }

    await Post.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Post deleted',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
