'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Button,
  CircularProgress,
} from '@mui/material';
import { Favorite, ChatBubble } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface Notification {
  _id: string;
  type: 'like' | 'comment';
  fromUser: { _id: string; username: string; avatar?: string };
  post: { _id: string };
  read: boolean;
  createdAt: string;
}

interface NotificationsProps {
  currentUser: any;
  onMarkRead?: () => void;
}

const Notifications: React.FC<NotificationsProps> = ({ currentUser, onMarkRead }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get('/notifications');
        if (res.data.success) {
          setNotifications(res.data.notifications || []);
          setUnreadCount(res.data.unreadCount || 0);
        }
      } catch (err) {
        console.error('Error fetching notifications:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await axios.post('/notifications/read');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      onMarkRead?.();
      window.dispatchEvent(new CustomEvent('notifications-read'));
    } catch (err) {
      console.error('Error marking read:', err);
    }
  };

  const formatTime = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return d.toLocaleDateString();
  };

  const handleNotificationClick = (n: Notification) => {
    navigate(`/feed`);
    setTimeout(() => {
      const el = document.querySelector(`[data-post-id="${n.post._id}"]`);
      el?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Notifications
        </Typography>
        {unreadCount > 0 && (
          <Button
            size="small"
            onClick={handleMarkAllRead}
            sx={{ color: '#00ff00', textTransform: 'none' }}
          >
            Mark all read
          </Button>
        )}
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress sx={{ color: '#00ff00' }} />
        </Box>
      ) : notifications.length === 0 ? (
        <Typography sx={{ color: '#b0b0b0', textAlign: 'center', py: 6 }}>
          No notifications yet
        </Typography>
      ) : (
        <List sx={{ bgcolor: 'transparent' }}>
          {notifications.map((n) => (
            <ListItem
              key={n._id}
              sx={{
                mb: 1,
                borderRadius: 2,
                bgcolor: n.read ? 'transparent' : 'rgba(0, 255, 0, 0.06)',
                border: '1px solid rgba(0, 255, 0, 0.15)',
                cursor: 'pointer',
                '&:hover': { bgcolor: 'rgba(0, 255, 0, 0.08)' },
              }}
              onClick={() => handleNotificationClick(n)}
            >
              <ListItemAvatar>
                <Avatar src={n.fromUser?.avatar} sx={{ width: 44, height: 44 }}>
                  {n.type === 'like' ? (
                    <Favorite sx={{ color: '#ff1493', fontSize: 22 }} />
                  ) : (
                    <ChatBubble sx={{ color: '#00ffff', fontSize: 22 }} />
                  )}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography sx={{ color: '#fff', fontWeight: n.read ? 400 : 600 }}>
                    <Typography component="span" sx={{ color: '#00ff00', fontWeight: 600 }}>
                      {n.fromUser?.username}
                    </Typography>
                    {n.type === 'like' ? ' liked your post' : ' commented on your post'}
                  </Typography>
                }
                secondary={
                  <Typography variant="caption" sx={{ color: '#b0b0b0' }}>
                    {formatTime(n.createdAt)}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      )}
    </Container>
  );
};

export default Notifications;
