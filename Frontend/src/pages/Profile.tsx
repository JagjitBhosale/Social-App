'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  Avatar,
  Typography,
  Button,
  Grid,
  Chip,
  Tab,
  Tabs,
  CardMedia,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { Settings, Message, ArrowBack } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import PostPreviewDialog, { PostForPreview } from '../components/PostPreviewDialog';

interface ProfileProps {
  currentUser: any;
}

const Profile: React.FC<ProfileProps> = ({ currentUser }) => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [tabValue, setTabValue] = useState(0);
  const [profileUser, setProfileUser] = useState<any>(null);
  const [userPosts, setUserPosts] = useState<PostForPreview[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [previewPost, setPreviewPost] = useState<PostForPreview | null>(null);

  const displayUserId = userId === 'me' ? currentUser?.id : userId;

  useEffect(() => {
    if (!displayUserId) return;
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const url = displayUserId === currentUser?.id ? '/users/me' : `/users/${displayUserId}`;
        const res = await axios.get(url);
        if (res.data.success && res.data.user) {
          setProfileUser(res.data.user);
          setIsFollowing(res.data.user.isFollowing ?? false);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setProfileUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [displayUserId, currentUser?.id]);

  useEffect(() => {
    if (!displayUserId) return;
    const fetchPosts = async () => {
      try {
        const res = await axios.get(`/users/${displayUserId}/posts`);
        if (res.data.success && res.data.posts) {
          const list = res.data.posts.map((p: any) => ({
            id: p.id || p._id?.toString(),
            author: p.author,
            content: p.content || '',
            image: p.image || undefined,
            video: p.video || undefined,
            timestamp: p.timestamp || p.createdAt,
            likes: p.likes ?? 0,
            liked: p.liked ?? false,
            commentsCount: p.commentsCount ?? 0,
            commentsList: p.commentsList || [],
          }));
          setUserPosts(list);
        }
      } catch (err) {
        console.error('Error fetching posts:', err);
      }
    };
    fetchPosts();
  }, [displayUserId]);

  const handleFollowToggle = async () => {
    if (!displayUserId || displayUserId === currentUser?.id) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await axios.post(`/users/${displayUserId}/unfollow`);
        setIsFollowing(false);
      } else {
        await axios.post(`/users/${displayUserId}/follow`);
        setIsFollowing(true);
      }
      if (profileUser) {
        setProfileUser((prev: any) => ({
          ...prev,
          followers: prev.followers + (isFollowing ? -1 : 1),
        }));
      }
    } catch (err) {
      console.error('Error following/unfollowing:', err);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const formatTimestamp = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return d.toLocaleDateString();
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await axios.delete(`/posts/${postId}`);
      setUserPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };

  const handleLikeInPreview = async (postId: string) => {
    try {
      const res = await axios.post(`/posts/${postId}/like`);
      if (res.data.success) {
        setUserPosts((prev) =>
          prev.map((p) =>
            p.id === postId ? { ...p, liked: res.data.liked, likes: res.data.likes } : p
          )
        );
        setPreviewPost((prev) =>
          prev?.id === postId ? { ...prev, liked: res.data.liked, likes: res.data.likes } : prev
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCommentInPreview = async (postId: string, text: string) => {
    try {
      const res = await axios.post(`/posts/${postId}/comments`, { text });
      if (res.data.success && res.data.comments) {
        const updated = (res.data.comments || []).map((c: any) => ({
          id: c._id,
          author: c.author,
          text: c.text,
          createdAt: c.createdAt,
        }));
        setUserPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, commentsList: updated, commentsCount: updated.length } : p))
        );
        setPreviewPost((prev) => (prev?.id === postId ? { ...prev, commentsList: updated, commentsCount: updated.length } : prev));
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress sx={{ color: '#00ff00' }} />
      </Container>
    );
  }

  if (!profileUser) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <Typography>User not found</Typography>
        <Button onClick={() => navigate('/feed')} sx={{ mt: 2 }}>
          Back to Feed
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <IconButton onClick={() => navigate('/feed')}>
          <ArrowBack sx={{ color: '#00ff00' }} />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Profile
        </Typography>
        {displayUserId === currentUser?.id && (
          <IconButton onClick={() => navigate('/settings')}>
            <Settings sx={{ color: '#00ff00' }} />
          </IconButton>
        )}
        {displayUserId !== currentUser?.id && <Box sx={{ width: 40 }} />}
      </Box>

      {/* Profile Card */}
      <Card
        sx={{
          background: 'linear-gradient(135deg, #c4ff00 0%, #c4ff00 100%)',
          borderRadius: '24px',
          overflow: 'hidden',
          mb: 3,
          color: '#000',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Avatar
                  src={profileUser.avatar}
                  sx={{ width: 70, height: 70 }}
                />
                <Box>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 700, color: '#000' }}
                  >
                    {profileUser.username}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#333' }}>
                    {profileUser.handle || `@${profileUser.username}`}
                  </Typography>
                </Box>
              </Box>
            </Box>
            {displayUserId !== currentUser?.id && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  disabled={followLoading}
                  sx={{
                    backgroundColor: isFollowing ? 'rgba(0, 0, 0, 0.1)' : '#000',
                    color: isFollowing ? '#000' : '#fff',
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: isFollowing ? 'rgba(0, 0, 0, 0.15)' : 'rgba(0,0,0,0.8)',
                    },
                  }}
                  onClick={handleFollowToggle}
                >
                  {followLoading ? '...' : isFollowing ? 'Following' : 'Follow'}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Message />}
                  sx={{
                    borderColor: '#000',
                    color: '#000',
                    fontWeight: 600,
                    '&:hover': {
                      borderColor: '#000',
                      backgroundColor: 'rgba(0, 0, 0, 0.05)',
                    },
                  }}
                  onClick={() => navigate(`/chat/${displayUserId}`)}
                >
                  Chat
                </Button>
              </Box>
            )}
          </Box>

          {/* Stats */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={4}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {profileUser.posts ?? 0}
              </Typography>
              <Typography variant="caption">Posts</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {(profileUser.followers ?? 0).toLocaleString()}
              </Typography>
              <Typography variant="caption">Followers</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {profileUser.following ?? 0}
              </Typography>
              <Typography variant="caption">Following</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Bio Section */}
      <Card
        sx={{
          background: 'linear-gradient(135deg, #242424 0%, #1a1a2e 100%)',
          border: '1px solid rgba(0, 255, 0, 0.1)',
          mb: 3,
        }}
      >
        <CardContent>
          <Typography variant="body1" sx={{ mb: 2, color: '#e0e0e0' }}>
            {profileUser.bio || 'No bio yet'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label="Photography"
              sx={{
                backgroundColor: 'rgba(0, 255, 0, 0.1)',
                color: '#00ff00',
                borderColor: 'rgba(0, 255, 0, 0.3)',
                border: '1px solid',
              }}
            />
            <Chip
              label="Design"
              sx={{
                backgroundColor: 'rgba(255, 20, 147, 0.1)',
                color: '#ff1493',
                borderColor: 'rgba(255, 20, 147, 0.3)',
                border: '1px solid',
              }}
            />
            <Chip
              label="Content"
              sx={{
                backgroundColor: 'rgba(255, 165, 0, 0.1)',
                color: '#ffa500',
                borderColor: 'rgba(255, 165, 0, 0.3)',
                border: '1px solid',
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card
        sx={{
          background: 'linear-gradient(135deg, #242424 0%, #1a1a2e 100%)',
          border: '1px solid rgba(0, 255, 0, 0.1)',
        }}
      >
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{
            borderBottom: '1px solid rgba(0, 255, 0, 0.1)',
            '& .MuiTab-root': {
              color: '#b0b0b0',
              fontSize: '0.875rem',
              fontWeight: 600,
              textTransform: 'uppercase',
            },
            '& .Mui-selected': {
              color: '#00ff00',
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#00ff00',
            },
          }}
        >
          <Tab label={`Images ${profileUser.images ?? userPosts.length}`} />
          <Tab label={`Reels ${profileUser.reels ?? 0}`} />
          <Tab label={`Events ${profileUser.events ?? 0}`} />
        </Tabs>

        <CardContent sx={{ pt: 3 }}>
          {tabValue === 0 && (
            <Grid container spacing={2}>
              {userPosts.length > 0 ? (
                userPosts.map((post) => (
                  <Grid item xs={12} sm={6} md={4} key={post.id}>
                    <Card
                      sx={{
                        position: 'relative',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        transition: 'transform 0.3s ease',
                        '&:hover': { transform: 'scale(1.02)' },
                      }}
                      onClick={() => setPreviewPost(post)}
                    >
                      {post.video ? (
                        <CardMedia
                          component="video"
                          src={post.video}
                          sx={{ height: 250, objectFit: 'cover' }}
                        />
                      ) : (
                        <CardMedia
                          component="img"
                          image={post.image || 'https://via.placeholder.com/400'}
                          alt={post.content?.slice(0, 30) || 'Post'}
                          sx={{ height: 250, objectFit: 'cover' }}
                        />
                      )}
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.8) 100%)',
                          p: 2,
                          color: '#fff',
                        }}
                      >
                        <Typography variant="caption">❤️ {post.likes}</Typography>
                        <Typography variant="caption" sx={{ display: 'block' }} noWrap>
                          {post.content?.slice(0, 40) || 'Post'}
                        </Typography>
                      </Box>
                    </Card>
                  </Grid>
                ))
              ) : (
                <Box sx={{ textAlign: 'center', py: 4, width: '100%' }}>
                  <Typography variant="body1" sx={{ color: '#b0b0b0' }}>
                    No posts yet
                  </Typography>
                </Box>
              )}
            </Grid>
          )}

          {tabValue === 1 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" sx={{ color: '#b0b0b0' }}>
                No reels yet
              </Typography>
            </Box>
          )}

          {tabValue === 2 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" sx={{ color: '#b0b0b0' }}>
                No events yet
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      <PostPreviewDialog
        open={Boolean(previewPost)}
        onClose={() => setPreviewPost(null)}
        post={previewPost}
        currentUser={currentUser}
        formatTimestamp={formatTimestamp}
        onLike={handleLikeInPreview}
        onCommentSubmit={handleCommentInPreview}
        onDeletePost={displayUserId === currentUser?.id ? handleDeletePost : undefined}
        onDeleted={() => setPreviewPost(null)}
      />
    </Container>
  );
};

export default Profile;
