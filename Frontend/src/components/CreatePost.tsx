'use client';

import React, { useState, useRef } from 'react';
import axios from 'axios';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Avatar,
  IconButton,
  Chip,
  Typography,
  Card,
  CardMedia,
  Popover,
} from '@mui/material';
import {
  Close,
  Image as ImageIcon,
  Videocam,
  EmojiEmotions,
  LocationOn,
  Tag,
} from '@mui/icons-material';

const COMMON_EMOJIS = ['😀', '😂', '❤️', '👍', '🔥', '🎉', '✨', '🙏', '💯', '🌟', '😊', '🥰'];

interface CreatePostProps {
  open: boolean;
  onClose: () => void;
  onPost: (post: any) => void;
  currentUser: any;
}

const CreatePost: React.FC<CreatePostProps> = ({
  open,
  onClose,
  onPost,
  currentUser,
}) => {
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>('');
  const [emojiAnchor, setEmojiAnchor] = useState<HTMLElement | null>(null);
  const [locationInput, setLocationInput] = useState('');
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setSelectedVideo(null);
      setVideoPreview('');
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleVideoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedVideo(file);
      setSelectedImage(null);
      setImagePreview('');
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const handlePost = async () => {
    if (!content.trim() && !selectedImage && !selectedVideo) return;
    setError(null);
    setPosting(true);
    try {
      const formData = new FormData();
      formData.append('content', content);
      if (selectedImage) formData.append('image', selectedImage);
      if (selectedVideo) formData.append('video', selectedVideo);
      const res = await axios.post('/posts', formData);
      if (res.data.success && res.data.post) {
        onPost(res.data.post);
        handleClose();
      } else {
        setError(res.data?.message || 'Failed to create post');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to create post';
      setError(msg);
      console.error('Error creating post:', err);
    } finally {
      setPosting(false);
    }
  };

  const handleClose = () => {
    setContent('');
    setSelectedImage(null);
    setImagePreview('');
    setSelectedVideo(null);
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideoPreview('');
    setEmojiAnchor(null);
    setLocationInput('');
    setShowLocationInput(false);
    setError(null);
    onClose();
  };

  const handleEmojiClick = (emoji: string) => {
    setContent((prev) => prev + emoji);
    setEmojiAnchor(null);
  };

  const handleLocationAdd = () => {
    if (locationInput.trim()) {
      setContent((prev) => prev + (prev ? ' ' : '') + `📍 ${locationInput.trim()}`);
      setLocationInput('');
      setShowLocationInput(false);
    }
  };

  const handleHashtagClick = () => {
    setContent((prev) => prev + (prev && !prev.endsWith(' ') ? ' ' : '') + '#');
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          background: 'linear-gradient(135deg, #242424 0%, #1a1a2e 100%)',
          border: '1px solid rgba(0, 255, 0, 0.2)',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(0, 255, 0, 0.1)',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Create Post
        </Typography>
        <IconButton size="small" onClick={handleClose}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {/* User Info */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Avatar src={currentUser?.avatar} sx={{ width: 50, height: 50 }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {currentUser?.username}
            </Typography>
            <Typography variant="caption" sx={{ color: '#b0b0b0' }}>
              {currentUser?.email}
            </Typography>
          </Box>
        </Box>

        {/* Text Content */}
        <TextField
          fullWidth
          multiline
          rows={4}
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          variant="outlined"
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              color: '#fff',
              '& fieldset': {
                borderColor: 'rgba(0, 255, 0, 0.3)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(0, 255, 0, 0.6)',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#00ff00',
              },
            },
          }}
        />

        {/* Image Preview */}
        {imagePreview && !videoPreview && (
          <Card
            sx={{
              mb: 2,
              position: 'relative',
              overflow: 'hidden',
              border: '1px solid rgba(0, 255, 0, 0.2)',
            }}
          >
            <CardMedia
              component="img"
              image={imagePreview}
              alt="Preview"
              sx={{
                maxHeight: '300px',
                objectFit: 'cover',
              }}
            />
            <IconButton
              size="small"
              onClick={() => {
                setSelectedImage(null);
                setImagePreview('');
              }}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                },
              }}
            >
              <Close fontSize="small" />
            </IconButton>
          </Card>
        )}

        {/* Video Preview */}
        {videoPreview && (
          <Card
            sx={{
              mb: 2,
              position: 'relative',
              overflow: 'hidden',
              border: '1px solid rgba(0, 255, 0, 0.2)',
            }}
          >
            <CardMedia
              component="video"
              src={videoPreview}
              controls
              sx={{ maxHeight: '300px' }}
            />
            <IconButton
              size="small"
              onClick={() => {
                setSelectedVideo(null);
                URL.revokeObjectURL(videoPreview);
                setVideoPreview('');
              }}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.8)' },
              }}
            >
              <Close fontSize="small" />
            </IconButton>
          </Card>
        )}

        {/* Action Buttons */}
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            flexWrap: 'wrap',
            pb: 2,
            borderBottom: '1px solid rgba(0, 255, 0, 0.1)',
          }}
        >
          <input
            hidden
            accept="image/*"
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
          />
          <input
            hidden
            accept="video/*,.mp4,.webm,.mov,.avi"
            type="file"
            ref={videoInputRef}
            onChange={handleVideoSelect}
          />
          <Chip
            icon={<ImageIcon />}
            label="Image"
            onClick={() => fileInputRef.current?.click()}
            sx={{
              backgroundColor: 'rgba(0, 255, 0, 0.1)',
              color: '#00ff00',
              border: '1px solid rgba(0, 255, 0, 0.3)',
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: 'rgba(0, 255, 0, 0.15)',
              },
            }}
            variant="outlined"
          />
          <Chip
            icon={<Videocam />}
            label="Video"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              videoInputRef.current?.click();
            }}
            sx={{
              backgroundColor: 'rgba(0, 255, 255, 0.1)',
              color: '#00ffff',
              border: '1px solid rgba(0, 255, 255, 0.3)',
              cursor: 'pointer',
              '&:hover': { backgroundColor: 'rgba(0, 255, 255, 0.15)' },
            }}
            variant="outlined"
          />
          <Chip
            icon={<EmojiEmotions />}
            label="Emoji"
            onClick={(e) => setEmojiAnchor(e.currentTarget)}
            sx={{
              backgroundColor: 'rgba(255, 165, 0, 0.1)',
              color: '#ffa500',
              border: '1px solid rgba(255, 165, 0, 0.3)',
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: 'rgba(255, 165, 0, 0.15)',
              },
            }}
            variant="outlined"
          />
          <Popover
            open={Boolean(emojiAnchor)}
            anchorEl={emojiAnchor}
            onClose={() => setEmojiAnchor(null)}
            anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
            transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          >
            <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 1, maxWidth: 280 }}>
              {COMMON_EMOJIS.map((emoji, i) => (
                <IconButton key={i} onClick={() => handleEmojiClick(emoji)} sx={{ fontSize: '1.5rem' }}>
                  {emoji}
                </IconButton>
              ))}
            </Box>
          </Popover>
          <Chip
            icon={<LocationOn />}
            label="Location"
            onClick={() => setShowLocationInput(!showLocationInput)}
            sx={{
              backgroundColor: 'rgba(255, 20, 147, 0.1)',
              color: '#ff1493',
              border: '1px solid rgba(255, 20, 147, 0.3)',
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: 'rgba(255, 20, 147, 0.15)',
              },
            }}
            variant="outlined"
          />
          {showLocationInput && (
            <Box sx={{ display: 'flex', gap: 1, width: '100%', alignItems: 'center' }}>
              <TextField
                size="small"
                placeholder="Add location"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleLocationAdd(); } }}
                sx={{
                  flex: 1,
                  '& .MuiOutlinedInput-root': {
                    color: '#fff',
                    '& fieldset': { borderColor: 'rgba(255, 20, 147, 0.3)' },
                  },
                }}
              />
              <Button size="small" onClick={handleLocationAdd} sx={{ color: '#ff1493' }}>
                Add
              </Button>
            </Box>
          )}
          <Chip
            icon={<Tag />}
            label="Hashtag"
            onClick={handleHashtagClick}
            sx={{
              backgroundColor: 'rgba(0, 255, 255, 0.1)',
              color: '#00ffff',
              border: '1px solid rgba(0, 255, 255, 0.3)',
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: 'rgba(0, 255, 255, 0.15)',
              },
            }}
            variant="outlined"
          />
        </Box>

        {/* Error message */}
        {error && (
          <Typography sx={{ color: '#ff5252', fontSize: '0.875rem', mt: 1 }}>
            {error}
          </Typography>
        )}

        {/* Tags/Mentions (mock) */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" sx={{ color: '#b0b0b0' }}>
            Add a caption to your post
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          onClick={handleClose}
          sx={{
            color: '#b0b0b0',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handlePost}
          variant="contained"
          disabled={(!content.trim() && !selectedImage && !selectedVideo) || posting}
          sx={{
            background:
              content.trim() || selectedImage || selectedVideo
                ? 'linear-gradient(135deg, #00ff00 0%, #00ffff 100%)'
                : 'linear-gradient(135deg, #666 0%, #555 100%)',
            color: '#000',
            fontWeight: 700,
          }}
        >
          Post
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreatePost;
