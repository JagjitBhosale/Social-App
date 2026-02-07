'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  CardMedia,
  Avatar,
  Typography,
  Button,
  TextField,
  IconButton,
  Menu,
  MenuItem,
  Paper,
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  ChatBubbleOutline,
  Share,
  MoreVert,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import CreatePost from '../components/CreatePost';
import PostPreviewDialog from '../components/PostPreviewDialog';
import axios from 'axios';

interface Post {
  id: string;
  author: {
    id: string;
    username: string;
    avatar: string;
  };
  content: string;
  image?: string;
  video?: string;
  timestamp: string;
  likes: number;
  comments: number;
  commentsCount?: number;
  liked: boolean;
  likedBy?: string[];
  commentsList?: { id: string; author: any; text: string; createdAt: string }[];
}

interface FeedProps {
  currentUser: any;
  initialCreateOpen?: boolean;
}

const Feed: React.FC<FeedProps> = ({ currentUser, initialCreateOpen = false }) => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [feedMode, setFeedMode] = useState<'global' | 'following'>('global');
  const [showComments, setShowComments] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [showCreatePost, setShowCreatePost] = useState(initialCreateOpen);
  const [postMenuAnchor, setPostMenuAnchor] = useState<{ el: HTMLElement; postId: string } | null>(null);
  const [previewPost, setPreviewPost] = useState<Post | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get(`/posts?mode=${feedMode}`);
        if (response.data.success && response.data.posts) {
          setPosts(response.data.posts.map((p: any) => ({
            ...p,
            comments: p.commentsCount ?? p.comments?.length ?? 0,
            commentsList: p.comments || [],
            timestamp: formatTimestamp(p.timestamp),
          })));
        }
      } catch (err) {
        console.error('Error fetching posts:', err);
      }
    };
    fetchPosts();
  }, [feedMode]);

  const formatTimestamp = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
    return d.toLocaleDateString();
  };

  const handleLike = async (postId: string) => {
    try {
      const res = await axios.post(`/posts/${postId}/like`);
      if (res.data.success) {
        setPosts(posts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              liked: res.data.liked,
              likes: res.data.likes,
            };
          }
          return post;
        }));
      }
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  const handleAddPost = async (post: Post) => {
    setPosts([{ ...post, timestamp: 'just now' }, ...posts]);
    setShowCreatePost(false);
  };

  const handleCommentSubmit = async (postId: string) => {
    if (!newComment.trim()) return;
    try {
      const res = await axios.post(`/posts/${postId}/comments`, { text: newComment });
      if (res.data.success) {
        const updatedComments = res.data.comments || [];
        setPosts(posts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              comments: updatedComments.length,
              commentsList: updatedComments.map((c: any) => ({
                id: c._id,
                author: c.author,
                text: c.text,
                createdAt: c.createdAt,
              })),
            };
          }
          return post;
        }));
        setNewComment('');
      }
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  const handleDeletePost = async (postId: string) => {
    setPostMenuAnchor(null);
    try {
      await axios.delete(`/posts/${postId}`);
      setPosts(posts.filter((p) => p.id !== postId));
      setPreviewPost((prev) => (prev?.id === postId ? null : prev));
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };

  const handleLikeInPreview = (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    handleLike(postId);
    setPreviewPost((prev) => (prev?.id === postId ? { ...prev, liked: !prev.liked, likes: prev.likes + (prev.liked ? -1 : 1) } : prev));
  };

  const handleCommentInPreview = async (postId: string, text: string) => {
    try {
      const res = await axios.post(`/posts/${postId}/comments`, { text });
      if (res.data.success && res.data.comments) {
        const updated = res.data.comments.map((c: any) => ({ id: c._id, author: c.author, text: c.text, createdAt: c.createdAt }));
        setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, comments: updated.length, commentsList: updated } : p)));
        setPreviewPost((prev) => (prev?.id === postId ? { ...prev, commentsList: updated, commentsCount: updated.length } : prev));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    try {
      const res = await axios.delete(`/posts/${postId}/comments/${commentId}`);
      if (res.data.success && res.data.comments) {
        setPosts(posts.map(post => {
          if (post.id === postId) {
            const updated = res.data.comments.map((c: any) => ({
              id: c._id,
              author: c.author,
              text: c.text,
              createdAt: c.createdAt,
            }));
            return { ...post, comments: updated.length, commentsList: updated };
          }
          return post;
        }));
      }
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Create Post Button/Card */}
      <Card
        sx={{
          mb: 3,
          background: 'linear-gradient(135deg, #242424 0%, #1a1a2e 100%)',
          border: '1px solid rgba(0, 255, 0, 0.1)',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          '&:hover': {
            border: '1px solid rgba(0, 255, 0, 0.3)',
          },
        }}
        onClick={() => setShowCreatePost(true)}
      >
        <CardContent sx={{ display: 'flex', gap: 2 }}>
          <Avatar src={currentUser?.avatar} sx={{ width: 50, height: 50 }} />
          <TextField
            fullWidth
            placeholder="What's on your mind?"
            variant="outlined"
            disabled
            sx={{
              pointerEvents: 'none',
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '20px',
                '& fieldset': {
                  borderColor: 'rgba(0, 255, 0, 0.2)',
                },
              },
            }}
          />
        </CardContent>
      </Card>

      <CreatePost
        open={showCreatePost}
        onClose={() => setShowCreatePost(false)}
        onPost={handleAddPost}
        currentUser={currentUser}
      />

      <PostPreviewDialog
        open={Boolean(previewPost)}
        onClose={() => setPreviewPost(null)}
        post={previewPost}
        currentUser={currentUser}
        formatTimestamp={formatTimestamp}
        onLike={handleLikeInPreview}
        onCommentSubmit={handleCommentInPreview}
        onDeletePost={handleDeletePost}
        onDeleted={() => setPreviewPost(null)}
      />

      {/* Feed Mode Tabs */}
      <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
        <Button
          variant={feedMode === 'global' ? 'contained' : 'outlined'}
          onClick={() => setFeedMode('global')}
          sx={{
            flex: 1,
            ...(feedMode === 'global'
              ? { background: 'linear-gradient(135deg, #00ff00 0%, #00ffff 100%)', color: '#000' }
              : { borderColor: 'rgba(0, 255, 0, 0.5)', color: '#00ff00' }),
          }}
        >
          Global
        </Button>
        <Button
          variant={feedMode === 'following' ? 'contained' : 'outlined'}
          onClick={() => setFeedMode('following')}
          sx={{
            flex: 1,
            ...(feedMode === 'following'
              ? { background: 'linear-gradient(135deg, #00ff00 0%, #00ffff 100%)', color: '#000' }
              : { borderColor: 'rgba(0, 255, 0, 0.5)', color: '#00ff00' }),
          }}
        >
          Following
        </Button>
      </Box>

      {/* Posts Feed */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {posts.map((post) => (
          <Card
            key={post.id}
            data-post-id={post.id}
            sx={{
              background: 'linear-gradient(135deg, #242424 0%, #1a1a2e 100%)',
              border: '1px solid rgba(0, 255, 0, 0.1)',
              overflow: 'hidden',
              cursor: 'pointer',
            }}
            onClick={() => setPreviewPost(post)}
          >
            {/* Post Header */}
            <CardContent sx={{ pb: 1 }} onClick={(e) => e.stopPropagation()}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box
                  sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}
                  onClick={(e) => { e.stopPropagation(); post.author?.id && navigate(`/profile/${post.author.id}`); }}
                >
                  <Avatar src={post.author?.avatar} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {post.author?.username}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#b0b0b0' }}>
                      {post.timestamp}
                    </Typography>
                  </Box>
                </Box>
                {post.author?.id === currentUser?.id && (
                  <>
                    <IconButton
                      size="small"
                      onClick={(e) => { e.stopPropagation(); setPostMenuAnchor({ el: e.currentTarget, postId: post.id }); }}
                    >
                      <MoreVert sx={{ color: '#b0b0b0' }} />
                    </IconButton>
                    <Menu
                      anchorEl={postMenuAnchor?.el}
                      open={Boolean(postMenuAnchor)}
                      onClose={() => setPostMenuAnchor(null)}
                    >
                      <MenuItem
                        sx={{ color: '#ff0000' }}
                        onClick={() => { postMenuAnchor && handleDeletePost(postMenuAnchor.postId); }}
                      >
                        Delete Post
                      </MenuItem>
                    </Menu>
                  </>
                )}
              </Box>
            </CardContent>

            {/* Post Content - click opens full preview */}
            <CardContent sx={{ pt: 0, pb: 2 }}>
              <Typography variant="body1" sx={{ mb: 2, color: '#e0e0e0' }}>
                {post.content}
              </Typography>

              {post.image && (
                <CardMedia
                  component="img"
                  image={post.image}
                  alt="Post image"
                  data-post-id={post.id}
                  sx={{
                    borderRadius: '12px',
                    mb: 2,
                    maxHeight: '400px',
                    objectFit: 'cover',
                  }}
                />
              )}
              {post.video && (
                <CardMedia
                  component="video"
                  src={post.video}
                  controls
                  onClick={(e) => e.stopPropagation()}
                  data-post-id={post.id}
                  sx={{
                    borderRadius: '12px',
                    mb: 2,
                    maxHeight: '400px',
                    width: '100%',
                  }}
                />
              )}
            </CardContent>

            {/* Post Stats */}
            <CardContent sx={{ py: 1, px: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  pb: 2,
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <Typography variant="caption" sx={{ color: '#b0b0b0' }}>
                  {post.likes} Likes
                </Typography>
                <Typography variant="caption" sx={{ color: '#b0b0b0' }}>
                  {post.comments} Comments
                </Typography>
              </Box>
            </CardContent>

            {/* Post Actions */}
            <CardContent sx={{ py: 1, px: 2 }} onClick={(e) => e.stopPropagation()}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  startIcon={post.liked ? <Favorite /> : <FavoriteBorder />}
                  sx={{
                    flex: 1,
                    color: post.liked ? '#ff1493' : '#b0b0b0',
                    '&:hover': { color: '#ff1493' },
                  }}
                  onClick={() => handleLike(post.id)}
                >
                  Like
                </Button>
                <Button
                  startIcon={<ChatBubbleOutline />}
                  sx={{
                    flex: 1,
                    color: '#b0b0b0',
                    '&:hover': { color: '#00ff00' },
                  }}
                  onClick={() => setShowComments(showComments === post.id ? null : post.id)}
                >
                  Comment
                </Button>
                <Button
                  startIcon={<Share />}
                  sx={{
                    flex: 1,
                    color: '#b0b0b0',
                    '&:hover': { color: '#ffa500' },
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    const url = `${window.location.origin}/feed?post=${post.id}`;
                    if (navigator.share) {
                      navigator.share({ title: `${post.author?.username}'s post`, text: post.content?.slice(0, 100) || '', url }).catch(() => navigator.clipboard.writeText(url));
                    } else {
                      navigator.clipboard.writeText(url);
                    }
                  }}
                >
                  Share
                </Button>
              </Box>
            </CardContent>

            {/* Comments Section */}
            {showComments === post.id && (
              <CardContent sx={{ backgroundColor: 'rgba(0, 0, 0, 0.2)', pt: 0 }} onClick={(e) => e.stopPropagation()}>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleCommentSubmit(post.id);
                      }
                    }}
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: '#fff',
                        '& fieldset': {
                          borderColor: 'rgba(0, 255, 0, 0.3)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(0, 255, 0, 0.6)',
                        },
                      },
                    }}
                  />
                  <Button
                    variant="contained"
                    sx={{
                      background: 'linear-gradient(135deg, #00ff00 0%, #00ffff 100%)',
                      color: '#000',
                      fontWeight: 600,
                    }}
                    onClick={() => handleCommentSubmit(post.id)}
                  >
                    Post
                  </Button>
                </Box>

                {/* Comments List */}
                <Box>
                  {(post.commentsList || []).map((comment: any) => (
                    <Box key={comment.id || comment._id} sx={{ display: 'flex', gap: 1, mb: 1.5, alignItems: 'flex-start' }}>
                      <Avatar
                        sx={{ width: 32, height: 32, cursor: comment.author?.id ? 'pointer' : 'default' }}
                        src={comment.author?.avatar}
                        onClick={() => comment.author?.id && navigate(`/profile/${comment.author.id}`)}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Paper
                          sx={{
                            p: 1.5,
                            backgroundColor: 'rgba(0, 255, 0, 0.05)',
                            border: '1px solid rgba(0, 255, 0, 0.1)',
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: 600, cursor: comment.author?.id ? 'pointer' : 'default' }}
                              onClick={() => comment.author?.id && navigate(`/profile/${comment.author.id}`)}
                            >
                              {comment.author?.username || 'User'}
                            </Typography>
                            {comment.author?.id === currentUser?.id && (
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteComment(post.id, comment.id || comment._id)}
                                sx={{ color: '#ff4444', p: 0.5 }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            )}
                          </Box>
                          <Typography variant="body2" sx={{ color: '#e0e0e0' }}>
                            {comment.text}
                          </Typography>
                        </Paper>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            )}
          </Card>
        ))}
      </Box>
    </Container>
  );
};

export default Feed;
