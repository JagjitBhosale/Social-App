'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Switch,
  FormControlLabel,
  Avatar,
  IconButton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ArrowBack,
  PhotoCamera,
  Edit,
  Logout,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface SettingsProps {
  currentUser: any;
  onLogout: () => void;
  onProfileUpdate?: (user: any) => void;
}

const Settings: React.FC<SettingsProps> = ({ currentUser, onLogout, onProfileUpdate }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: currentUser?.username || '',
    email: currentUser?.email || '',
    bio: currentUser?.bio || 'Welcome to Social Tree!',
    phone: '+1 234 567 8900',
    location: 'San Francisco, CA',
  });

  const [notifications, setNotifications] = useState({
    likes: true,
    comments: true,
    follows: true,
    messages: true,
    email: false,
  });

  const [privacy, setPrivacy] = useState({
    isPrivate: false,
    allowMessages: true,
    allowTags: true,
  });

  const [editMode, setEditMode] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [saved, setSaved] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handlePrivacyChange = (key: keyof typeof privacy) => {
    setPrivacy(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get('/users/me');
        if (res.data.success && res.data.user) {
          const u = res.data.user;
          setFormData((prev) => ({
            ...prev,
            username: u.username || prev.username,
            email: u.email || prev.email,
            bio: u.bio ?? prev.bio,
            phone: u.phone || prev.phone,
            location: u.location || prev.location,
          }));
          if (u.notifications) setNotifications((prev) => ({ ...prev, ...u.notifications }));
          if (u.privacy) setPrivacy((prev) => ({ ...prev, ...u.privacy }));
        }
      } catch (err) {
        console.error('Error fetching user:', err);
      }
    };
    fetchUser();
  }, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('username', formData.username);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('bio', formData.bio);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('notifications', JSON.stringify(notifications));
      formDataToSend.append('privacy', JSON.stringify(privacy));
      if (avatarFile) formDataToSend.append('avatar', avatarFile);

      const res = await axios.put('/users/profile', formDataToSend);
      if (res.data.success && res.data.user) {
        const updated = res.data.user;
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        setEditMode(false);
        setAvatarFile(null);
        setAvatarPreview('');
        onProfileUpdate?.({
          ...currentUser,
          ...updated,
        });
      }
    } catch (err) {
      console.error('Error saving profile:', err);
    }
  };

  const handleLogoutConfirm = () => {
    localStorage.removeItem('token');
    onLogout();
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    try {
      await axios.delete('/users/account');
      localStorage.removeItem('token');
      onLogout();
      navigate('/login');
    } catch (err) {
      console.error('Error deleting account:', err);
    } finally {
      setShowDeleteDialog(false);
    }
  };

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
        <Typography variant="h5" sx={{ fontWeight: 700, flex: 1, textAlign: 'center' }}>
          Settings
        </Typography>
        <Box sx={{ width: 40 }} />
      </Box>

      {saved && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Changes saved successfully!
        </Alert>
      )}

      {/* Profile Section */}
      <Card
        sx={{
          background: 'linear-gradient(135deg, #242424 0%, #1a1a2e 100%)',
          border: '1px solid rgba(0, 255, 0, 0.1)',
          mb: 3,
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Profile Information
            </Typography>
            <Button
              startIcon={<Edit />}
              sx={{
                color: '#00ff00',
                fontWeight: 600,
              }}
              onClick={() => setEditMode(!editMode)}
            >
              {editMode ? 'Cancel' : 'Edit'}
            </Button>
          </Box>

          {/* Avatar Section */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              mb: 3,
              pb: 3,
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={avatarPreview || currentUser?.avatar}
                sx={{ width: 100, height: 100 }}
              />
              {editMode && (
                <>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="avatar-upload"
                    onChange={handleAvatarChange}
                  />
                  <IconButton
                    component="label"
                    htmlFor="avatar-upload"
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      backgroundColor: '#00ff00',
                      color: '#000',
                      '&:hover': {
                        backgroundColor: '#00ff00',
                        opacity: 0.8,
                      },
                    }}
                    size="small"
                  >
                    <PhotoCamera fontSize="small" />
                  </IconButton>
                </>
              )}
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {formData.username}
              </Typography>
              <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                @{formData.username}
              </Typography>
            </Box>
          </Box>

          {/* Form Fields */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
            <TextField
              fullWidth
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              disabled={!editMode}
              variant={editMode ? 'outlined' : 'filled'}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: '#fff',
                  '& fieldset': {
                    borderColor: editMode ? 'rgba(0, 255, 0, 0.3)' : 'rgba(0, 255, 0, 0.1)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#00ff00',
                  },
                },
                '& .MuiFilledInput-root': {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                },
              }}
            />

            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              disabled={!editMode}
              variant={editMode ? 'outlined' : 'filled'}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: '#fff',
                  '& fieldset': {
                    borderColor: editMode ? 'rgba(0, 255, 0, 0.3)' : 'rgba(0, 255, 0, 0.1)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#00ff00',
                  },
                },
                '& .MuiFilledInput-root': {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                },
              }}
            />

            <TextField
              fullWidth
              label="Bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              disabled={!editMode}
              multiline
              rows={3}
              variant={editMode ? 'outlined' : 'filled'}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: '#fff',
                  '& fieldset': {
                    borderColor: editMode ? 'rgba(0, 255, 0, 0.3)' : 'rgba(0, 255, 0, 0.1)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#00ff00',
                  },
                },
                '& .MuiFilledInput-root': {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                },
              }}
            />

            <TextField
              fullWidth
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              disabled={!editMode}
              variant={editMode ? 'outlined' : 'filled'}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: '#fff',
                  '& fieldset': {
                    borderColor: editMode ? 'rgba(0, 255, 0, 0.3)' : 'rgba(0, 255, 0, 0.1)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#00ff00',
                  },
                },
                '& .MuiFilledInput-root': {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                },
              }}
            />

            <TextField
              fullWidth
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              disabled={!editMode}
              variant={editMode ? 'outlined' : 'filled'}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: '#fff',
                  '& fieldset': {
                    borderColor: editMode ? 'rgba(0, 255, 0, 0.3)' : 'rgba(0, 255, 0, 0.1)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#00ff00',
                  },
                },
                '& .MuiFilledInput-root': {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                },
              }}
            />
          </Box>

          {editMode && (
            <Button
              fullWidth
              variant="contained"
              sx={{
                background: 'linear-gradient(135deg, #00ff00 0%, #00ffff 100%)',
                color: '#000',
                fontWeight: 700,
                py: 1.5,
              }}
              onClick={handleSave}
            >
              Save Changes
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Notifications Section */}
      <Card
        sx={{
          background: 'linear-gradient(135deg, #242424 0%, #1a1a2e 100%)',
          border: '1px solid rgba(0, 255, 0, 0.1)',
          mb: 3,
        }}
      >
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            Notifications
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={notifications.likes}
                  onChange={() => handleNotificationChange('likes')}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#00ff00',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#00ff00',
                    },
                  }}
                />
              }
              label="Like notifications"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={notifications.comments}
                  onChange={() => handleNotificationChange('comments')}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#00ff00',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#00ff00',
                    },
                  }}
                />
              }
              label="Comment notifications"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={notifications.follows}
                  onChange={() => handleNotificationChange('follows')}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#00ff00',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#00ff00',
                    },
                  }}
                />
              }
              label="Follow notifications"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={notifications.messages}
                  onChange={() => handleNotificationChange('messages')}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#00ff00',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#00ff00',
                    },
                  }}
                />
              }
              label="Message notifications"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={notifications.email}
                  onChange={() => handleNotificationChange('email')}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#00ff00',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#00ff00',
                    },
                  }}
                />
              }
              label="Email notifications"
            />
          </Box>
        </CardContent>
      </Card>

      {/* Privacy Section */}
      <Card
        sx={{
          background: 'linear-gradient(135deg, #242424 0%, #1a1a2e 100%)',
          border: '1px solid rgba(0, 255, 0, 0.1)',
          mb: 3,
        }}
      >
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            Privacy & Safety
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={privacy.isPrivate}
                  onChange={() => handlePrivacyChange('isPrivate')}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#00ff00',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#00ff00',
                    },
                  }}
                />
              }
              label="Private account"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={privacy.allowMessages}
                  onChange={() => handlePrivacyChange('allowMessages')}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#00ff00',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#00ff00',
                    },
                  }}
                />
              }
              label="Allow messages from anyone"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={privacy.allowTags}
                  onChange={() => handlePrivacyChange('allowTags')}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#00ff00',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#00ff00',
                    },
                  }}
                />
              }
              label="Allow anyone to tag you"
            />
          </Box>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card
        sx={{
          background: 'linear-gradient(135deg, #242424 0%, #1a1a2e 100%)',
          border: '1px solid rgba(255, 0, 0, 0.2)',
        }}
      >
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#ff1493' }}>
            Danger Zone
          </Typography>

          <Button
            fullWidth
              variant="outlined"
            startIcon={<Logout />}
            sx={{
              borderColor: '#ff1493',
              color: '#ff1493',
              fontWeight: 600,
              mb: 2,
              '&:hover': {
                borderColor: '#ff1493',
                backgroundColor: 'rgba(255, 20, 147, 0.1)',
              },
            }}
            onClick={() => setShowLogoutDialog(true)}
          >
            Logout
          </Button>

          <Button
            fullWidth
            variant="outlined"
            sx={{
              borderColor: '#ff0000',
              color: '#ff0000',
              fontWeight: 600,
              '&:hover': {
                borderColor: '#ff0000',
                backgroundColor: 'rgba(255, 0, 0, 0.1)',
              },
            }}
            onClick={() => setShowDeleteDialog(true)}
          >
            Delete Account
          </Button>
        </CardContent>
      </Card>

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete your account? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteAccount}
            variant="contained"
            sx={{
              backgroundColor: '#ff0000',
              '&:hover': { backgroundColor: '#cc0000' },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutDialog} onClose={() => setShowLogoutDialog(false)}>
        <DialogTitle>Confirm Logout</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to logout?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowLogoutDialog(false)}>Cancel</Button>
          <Button
            onClick={handleLogoutConfirm}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #ff1493 0%, #ff0000 100%)',
              color: '#fff',
            }}
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Settings;
