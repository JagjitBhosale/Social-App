'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  IconButton,
  Box,
  Avatar,
  Typography,
  Button,
  TextField,
  CardMedia,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Close,
  MoreVert,
  Favorite,
  FavoriteBorder,
  ChatBubbleOutline,
  Share,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export interface PostForPreview {
  id: string;
  author: { id: string; username: string; avatar: string };
  content: string;
  image?: string;
  video?: string;
  timestamp: string;
  likes: number;
  liked: boolean;
  commentsCount?: number;
  commentsList?: { id: string; author: any; text: string; createdAt: string }[];
}

interface PostPreviewDialogProps {
  open: boolean;
  onClose: () => void;
  post: PostForPreview | null;
  currentUser: any;
  onLike?: (postId: string) => void;
  onCommentSubmit?: (postId: string, text: string) => void;
  onDeletePost?: (postId: string) => void;
  onDeleted?: (postId: string) => void;
  formatTimestamp?: (date: string) => string;
}

const PostPreviewDialog: React.FC<PostPreviewDialogProps> = ({
  open,
  onClose,
  post,
  currentUser,
  onLike,
  onCommentSubmit,
  onDeletePost,
  onDeleted,
  formatTimestamp = (d) => new Date(d).toLocaleString(),
}) => {
  const navigate = useNavigate();
  const [newComment, setNewComment] = useState('');
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [deleting, setDeleting] = useState(false);

  const isOwnPost = post && currentUser && post.author?.id === currentUser?.id;

  const handleShare = async () => {
    const url = `${window.location.origin}/feed?post=${post?.id}`;
    const text = post?.content?.slice(0, 100) || 'Check out this post';
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${post?.author?.username}'s post`,
          text,
          url,
        });
      } catch (err) {
        copyToClipboard(url);
      }
    } else {
      copyToClipboard(url);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // Could use a small toast
    });
  };

  const handleDelete = async () => {
    if (!post || !onDeletePost) return;
    setMenuAnchor(null);
    setDeleting(true);
    try {
      await axios.delete(`/posts/${post.id}`);
      onDeletePost(post.id);
      onDeleted?.(post.id);
      onClose();
    } catch (err) {
      console.error('Error deleting post:', err);
    } finally {
      setDeleting(false);
    }
  };

  if (!post) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          background: 'linear-gradient(135deg, #242424 0%, #1a1a2e 100%)',
          border: '1px solid rgba(0, 255, 0, 0.2)',
          maxHeight: '90vh',
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderBottom: '1px solid rgba(0,255,0,0.1)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }} onClick={() => post.author?.id && navigate(`/profile/${post.author.id}`)}>
            <Avatar src={post.author?.avatar} />
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{post.author?.username}</Typography>
              <Typography variant="caption" sx={{ color: '#b0b0b0' }}>{formatTimestamp(post.timestamp)}</Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {isOwnPost && (
              <>
                <IconButton size="small" onClick={(e) => setMenuAnchor(e.currentTarget)} disabled={deleting}>
                  <MoreVert sx={{ color: '#b0b0b0' }} />
                </IconButton>
                <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
                  <MenuItem sx={{ color: '#ff0000' }} onClick={handleDelete}>Delete Post</MenuItem>
                </Menu>
              </>
            )}
            <IconButton size="small" onClick={onClose}>
              <Close sx={{ color: '#b0b0b0' }} />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ px: 2, py: 1, maxHeight: '60vh', overflow: 'auto' }}>
          <Typography variant="body1" sx={{ color: '#e0e0e0', mb: 2 }}>{post.content}</Typography>
          {post.image && (
            <CardMedia component="img" image={post.image} alt="Post" sx={{ borderRadius: 2, maxHeight: 400, objectFit: 'contain', width: '100%', mb: 2 }} />
          )}
          {post.video && (
            <CardMedia component="video" src={post.video} controls sx={{ borderRadius: 2, maxHeight: 400, width: '100%', mb: 2 }} />
          )}
        </Box>

        <Box sx={{ px: 2, py: 1, borderTop: '1px solid rgba(0,255,0,0.1)' }}>
          <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
            <Button
              size="small"
              startIcon={post.liked ? <Favorite /> : <FavoriteBorder />}
              sx={{ color: post.liked ? '#ff1493' : '#b0b0b0' }}
              onClick={() => onLike?.(post.id)}
            >
              Like {post.likes > 0 ? post.likes : ''}
            </Button>
            <Button size="small" startIcon={<ChatBubbleOutline />} sx={{ color: '#b0b0b0' }} disabled>
              Comment {(post.commentsList?.length ?? post.commentsCount ?? 0) > 0 ? post.commentsList?.length ?? post.commentsCount : ''}
            </Button>
            <Button size="small" startIcon={<Share />} sx={{ color: '#b0b0b0' }} onClick={handleShare}>
              Share
            </Button>
          </Box>

          {onCommentSubmit && (
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (newComment.trim()) {
                      onCommentSubmit(post.id, newComment.trim());
                      setNewComment('');
                    }
                  }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': { color: '#fff', '& fieldset': { borderColor: 'rgba(0,255,0,0.3)' } },
                }}
              />
              <Button
                variant="contained"
                size="small"
                sx={{ background: 'linear-gradient(135deg, #00ff00 0%, #00ffff 100%)', color: '#000' }}
                onClick={() => {
                  if (newComment.trim()) {
                    onCommentSubmit(post.id, newComment.trim());
                    setNewComment('');
                  }
                }}
              >
                Post
              </Button>
            </Box>
          )}

          {(post.commentsList?.length ?? 0) > 0 && (
            <Box sx={{ mt: 2 }}>
              {(post.commentsList || []).map((c: any) => (
                <Box key={c.id ?? c._id} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'flex-start' }}>
                  <Avatar sx={{ width: 28, height: 28 }} src={c.author?.avatar} />
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 600, cursor: 'pointer' }} onClick={() => c.author?.id && navigate(`/profile/${c.author.id}`)}>
                      {c.author?.username}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#e0e0e0' }}>{c.text}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default PostPreviewDialog;
