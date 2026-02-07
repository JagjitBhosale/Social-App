'use client';

import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import axios from 'axios';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Feed from './pages/Feed';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Search from './pages/Search';
import Notifications from './pages/Notifications';
import Chat from './pages/Chat';
import Layout from './components/Layout';

// Create custom dark theme with neon accents
const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#1a1a1a',
      paper: '#242424',
    },
    primary: {
      main: '#00ff00', // Lime Green
      light: '#66ff66',
      dark: '#00cc00',
    },
    secondary: {
      main: '#ff1493', // Deep Pink
      light: '#ff69b4',
      dark: '#ff0099',
    },
    success: {
      main: '#00ffff', // Cyan
    },
    warning: {
      main: '#ffa500', // Orange
    },
    info: {
      main: '#7c3aed', // Purple
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
    },
  },
  shape: {
    borderRadius: 20,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 12,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#242424',
          backgroundImage: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  bio?: string;
}

function getStoredUser(): User | null {
  try {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (!token || !storedUser) return null;
    return JSON.parse(storedUser) as User;
  } catch {
    return null;
  }
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!getStoredUser());
  const [currentUser, setCurrentUser] = useState<User | null>(() => getStoredUser());

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('isAuthenticated', 'true');
  };

  const handleSignup = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('isAuthenticated', 'true');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('token');
  };

  const handleProfileUpdate = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  React.useEffect(() => {
    const verifySession = async () => {
      const t = localStorage.getItem('token');
      if (!t) return;
      try {
        const res = await axios.get('/auth/me', { _skipAuthRedirect: true } as any);
        if (res.data?.success && res.data?.user) {
          setCurrentUser(res.data.user);
          setIsAuthenticated(true);
          localStorage.setItem('user', JSON.stringify(res.data.user));
          localStorage.setItem('isAuthenticated', 'true');
          if (res.data.token) localStorage.setItem('token', res.data.token);
        }
      } catch (err) {
        const status = (err as any)?.response?.status;
        if (status === 401) {
          setCurrentUser(null);
          setIsAuthenticated(false);
          localStorage.removeItem('user');
          localStorage.removeItem('isAuthenticated');
          localStorage.removeItem('token');
        }
      }
    };
    verifySession();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/signup" element={<Signup onSignup={handleSignup} />} />
          
          {isAuthenticated ? (
            <>
              <Route
                path="/feed"
                element={
                  <Layout currentUser={currentUser} onLogout={handleLogout}>
                    <Feed currentUser={currentUser} />
                  </Layout>
                }
              />
              <Route
                path="/search"
                element={
                  <Layout currentUser={currentUser} onLogout={handleLogout}>
                    <Search currentUser={currentUser} />
                  </Layout>
                }
              />
              <Route
                path="/create"
                element={
                  <Layout currentUser={currentUser} onLogout={handleLogout}>
                    <Feed currentUser={currentUser} initialCreateOpen />
                  </Layout>
                }
              />
              <Route
                path="/profile/:userId"
                element={
                  <Layout currentUser={currentUser} onLogout={handleLogout}>
                    <Profile currentUser={currentUser} />
                  </Layout>
                }
              />
              <Route
                path="/settings"
                element={
                  <Layout currentUser={currentUser} onLogout={handleLogout}>
                    <Settings currentUser={currentUser} onLogout={handleLogout} onProfileUpdate={handleProfileUpdate} />
                  </Layout>
                }
              />
              <Route
                path="/notifications"
                element={
                  <Layout currentUser={currentUser} onLogout={handleLogout}>
                    <Notifications currentUser={currentUser} />
                  </Layout>
                }
              />
              <Route
                path="/chat"
                element={
                  <Layout currentUser={currentUser} onLogout={handleLogout}>
                    <Chat currentUser={currentUser} />
                  </Layout>
                }
              />
              <Route
                path="/chat/:userId"
                element={
                  <Layout currentUser={currentUser} onLogout={handleLogout}>
                    <Chat currentUser={currentUser} />
                  </Layout>
                }
              />
              <Route path="/" element={<Navigate to="/feed" replace />} />
            </>
          ) : (
            <>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </>
          )}
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
