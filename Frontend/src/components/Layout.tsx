'use client';

import React from 'react';
import {
  Box,
  BottomNavigation,
  BottomNavigationAction,
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  IconButton,
  Badge,
} from '@mui/material';
import {
  Home,
  Search,
  Add,
  Favorite,
  Message,
  Settings,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

interface LayoutProps {
  children: React.ReactNode;
  currentUser: any;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentUser, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [value, setValue] = React.useState(getNavValue(location.pathname));
  const [notificationCount, setNotificationCount] = React.useState(0);

  const fetchNotificationCount = React.useCallback(() => {
    if (!localStorage.getItem('token')) return;
    axios.get('/notifications').then((res) => {
      if (res.data?.success && res.data.unreadCount != null) {
        setNotificationCount(res.data.unreadCount);
      }
    }).catch(() => {});
  }, []);

  React.useEffect(() => {
    fetchNotificationCount();
  }, [location.pathname, fetchNotificationCount]);

  React.useEffect(() => {
    const handler = () => fetchNotificationCount();
    window.addEventListener('notifications-read', handler);
    return () => window.removeEventListener('notifications-read', handler);
  }, [fetchNotificationCount]);

  function getNavValue(path: string) {
    switch (path) {
      case '/feed':
        return 0;
      case '/search':
        return 1;
      case '/create':
        return 2;
      case '/notifications':
        return 3;
      case '/chat':
        return 4;
      default:
        return path.startsWith('/chat/') ? 4 : 0;
    }
  }

  const handleNavChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    const paths = ['/feed', '/search', '/create', '/notifications', '/chat'];
    if (newValue === 5) {
      navigate('/settings');
    } else {
      navigate(paths[newValue]);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Desktop Header */}
      <AppBar
        position="sticky"
        sx={{
          background: 'linear-gradient(135deg, #1a1a1a 0%, #242424 100%)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(0, 255, 0, 0.1)',
          display: { xs: 'none', md: 'flex' },
        }}
      >
        <Toolbar>
          <Box
            sx={{
              width: 50,
              height: 50,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #00ff00, #00ffff)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2,
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#000',
            }}
          >
            🌳
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 700, flex: 1 }}>
            Social Tree
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <IconButton color="inherit" onClick={() => navigate('/feed')}>
              <Home sx={{ color: '#00ff00' }} />
            </IconButton>
            <IconButton color="inherit" onClick={() => navigate('/search')}>
              <Search sx={{ color: '#b0b0b0' }} />
            </IconButton>
            <IconButton color="inherit" onClick={() => navigate('/chat')}>
              <Message sx={{ color: '#b0b0b0' }} />
            </IconButton>
            <IconButton color="inherit" onClick={() => navigate('/profile/me')}>
              <Avatar
                src={currentUser?.avatar}
                sx={{ width: 40, height: 40 }}
              />
            </IconButton>
            <IconButton color="inherit" onClick={() => navigate('/settings')}>
              <Settings sx={{ color: '#b0b0b0' }} />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ flex: 1, pb: { xs: 8, md: 0 } }}>
        {children}
      </Box>

      {/* Mobile Bottom Navigation */}
      <BottomNavigation
        value={value}
        onChange={handleNavChange}
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          display: { xs: 'flex', md: 'none' },
          background: 'linear-gradient(180deg, rgba(36, 36, 36, 0.95) 0%, #1a1a1a 100%)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(0, 255, 0, 0.1)',
          zIndex: 1000,
          '& .MuiBottomNavigationAction-root': {
            color: '#b0b0b0',
            '&.Mui-selected': {
              color: '#00ff00',
            },
          },
        }}
      >
        <BottomNavigationAction label="Home" icon={<Home />} />
        <BottomNavigationAction label="Search" icon={<Search />} />
        <BottomNavigationAction label="Create" icon={<Add />} />
        <BottomNavigationAction
          label="Notifications"
          icon={
            <Badge badgeContent={notificationCount > 0 ? notificationCount : 0} color="error">
              <Favorite />
            </Badge>
          }
        />
        <BottomNavigationAction label="Chat" icon={<Message />} />
      </BottomNavigation>
    </Box>
  );
};

export default Layout;
