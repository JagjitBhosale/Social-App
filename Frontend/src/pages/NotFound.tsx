'use client';

import React from 'react';
import { Container, Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          py: 4,
        }}
      >
        <Typography variant="h1" sx={{ fontWeight: 700, mb: 2, fontSize: '4rem' }}>
          404
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
          Page Not Found
        </Typography>
        <Typography variant="body1" sx={{ color: '#b0b0b0', mb: 4 }}>
          The page you're looking for doesn't exist. Let's get you back on track!
        </Typography>
        <Button
          variant="contained"
          sx={{
            background: 'linear-gradient(135deg, #00ff00 0%, #00ffff 100%)',
            color: '#000',
            fontWeight: 700,
            px: 4,
            py: 1.5,
          }}
          onClick={() => navigate('/feed')}
        >
          Go to Feed
        </Button>
      </Box>
    </Container>
  );
};

export default NotFound;
