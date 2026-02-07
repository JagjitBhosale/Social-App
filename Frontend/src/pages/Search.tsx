'use client';

import React, { useState, useRef } from 'react';
import {
  Container,
  Box,
  TextField,
  InputAdornment,
  Avatar,
  Typography,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface SearchProps {
  currentUser: any;
}

const Search: React.FC<SearchProps> = ({ currentUser }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearch = async (q: string) => {
    const trimmed = q.trim();
    if (trimmed.length < 2) {
      setUsers([]);
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get(`/search/users?q=${encodeURIComponent(trimmed)}`);
      if (res.data.success) {
        setUsers(res.data.users || []);
      }
    } catch (err) {
      console.error('Error searching:', err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (value.trim().length >= 2) {
      searchTimerRef.current = setTimeout(() => handleSearch(value), 300);
    } else {
      setUsers([]);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        Search
      </Typography>

      <TextField
        fullWidth
        placeholder="Search users by username..."
        value={query}
        onChange={handleQueryChange}
        autoFocus
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: '#00ff00' }} />
            </InputAdornment>
          ),
        }}
        sx={{
          mb: 3,
          '& .MuiOutlinedInput-root': {
            color: '#fff',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
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

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress sx={{ color: '#00ff00' }} />
        </Box>
      )}

      {!loading && query.trim().length >= 2 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {users.length === 0 ? (
            <Typography sx={{ color: '#b0b0b0', textAlign: 'center', py: 4 }}>
              No users found
            </Typography>
          ) : (
            users.map((user) => (
              <Card
                key={user.id}
                sx={{
                  background: 'linear-gradient(135deg, #242424 0%, #1a1a2e 100%)',
                  border: '1px solid rgba(0, 255, 0, 0.1)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: 'rgba(0, 255, 0, 0.3)',
                  },
                }}
                onClick={() => navigate(`/profile/${user.id}`)}
              >
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar src={user.avatar} sx={{ width: 50, height: 50 }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {user.username}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                      {user.handle}
                    </Typography>
                    {user.bio && (
                      <Typography variant="caption" sx={{ color: '#888', display: 'block', mt: 0.5 }}>
                        {user.bio.slice(0, 60)}
                        {user.bio.length > 60 ? '...' : ''}
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            ))
          )}
        </Box>
      )}

      {query.trim().length < 2 && !loading && (
        <Typography sx={{ color: '#b0b0b0', textAlign: 'center', py: 4 }}>
          Type at least 2 characters to search users
        </Typography>
      )}
    </Container>
  );
};

export default Search;
