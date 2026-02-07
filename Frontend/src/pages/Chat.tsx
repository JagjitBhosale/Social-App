'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  IconButton,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  CircularProgress,
} from '@mui/material';
import { ArrowBack, Send } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';

interface ChatMessage {
  id: string;
  sender: string;
  receiver: string;
  text: string;
  createdAt: string;
  senderUsername?: string;
  senderAvatar?: string;
}

interface Conversation {
  userId: string;
  username: string;
  avatar?: string;
  lastMessage: string;
  lastAt: string;
}

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Chat: React.FC<{ currentUser: any }> = ({ currentUser }) => {
  const navigate = useNavigate();
  const { userId: chatWithId } = useParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [otherUserInfo, setOtherUserInfo] = useState<{ username: string; avatar?: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const s = io(API_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });
    setSocket(s);
    return () => {
      s.disconnect();
    };
  }, []);

  useEffect(() => {
    const loadConversations = async () => {
      try {
        const res = await axios.get('/chat/conversations');
        if (res.data.success && res.data.conversations) {
          setConversations(res.data.conversations);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadConversations();
  }, []);

  useEffect(() => {
    if (!chatWithId) {
      setMessages([]);
      setOtherUserInfo(null);
      return;
    }
    const load = async () => {
      setLoading(true);
      try {
        const [msgRes, userRes] = await Promise.all([
          axios.get(`/chat/messages/${chatWithId}`),
          axios.get(`/users/${chatWithId}`).catch(() => ({ data: {} })),
        ]);
        if (msgRes.data.success && msgRes.data.messages) {
          setMessages(msgRes.data.messages);
        }
        if (userRes.data?.success && userRes.data?.user) {
          setOtherUserInfo({ username: userRes.data.user.username, avatar: userRes.data.user.avatar });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [chatWithId]);

  useEffect(() => {
    if (!socket) return;
    const handler = (msg: ChatMessage) => {
      if (chatWithId && (msg.sender === chatWithId || msg.receiver === chatWithId)) {
        setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
      }
      setConversations((prev) => {
        const other = msg.sender === currentUser?.id ? msg.receiver : msg.sender;
        const existing = prev.find((c) => c.userId === other);
        const entry = {
          userId: other,
          username: (msg as any).senderUsername || 'User',
          avatar: (msg as any).senderAvatar,
          lastMessage: msg.text,
          lastAt: msg.createdAt,
        };
        if (existing) {
          return [entry, ...prev.filter((c) => c.userId !== other)];
        }
        return [entry, ...prev];
      });
    };
    socket.on('chat:message', handler);
    return () => {
      socket.off('chat:message', handler);
    };
  }, [socket, chatWithId, currentUser?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text || !chatWithId || !socket) return;
    socket.emit('chat:message', { to: chatWithId, text });
    setInput('');
  };

  const otherUser = chatWithId
    ? (conversations.find((c) => c.userId === chatWithId) || (otherUserInfo ? { userId: chatWithId, username: otherUserInfo.username, avatar: otherUserInfo.avatar } : null))
    : null;

  if (!chatWithId) {
    return (
      <Container maxWidth="sm" sx={{ py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <IconButton onClick={() => navigate('/feed')}>
            <ArrowBack sx={{ color: '#00ff00' }} />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Chat</Typography>
        </Box>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress sx={{ color: '#00ff00' }} />
          </Box>
        ) : conversations.length === 0 ? (
          <Typography sx={{ color: '#b0b0b0', textAlign: 'center', py: 4 }}>
            No conversations yet. Start a chat from someone's profile.
          </Typography>
        ) : (
          <List>
            {conversations.map((c) => (
              <ListItem
                key={c.userId}
                sx={{
                  border: '1px solid rgba(0,255,0,0.2)',
                  borderRadius: 2,
                  mb: 1,
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'rgba(0,255,0,0.08)' },
                }}
                onClick={() => navigate(`/chat/${c.userId}`)}
              >
                <ListItemAvatar>
                  <Avatar src={c.avatar} />
                </ListItemAvatar>
                <ListItemText
                  primary={c.username}
                  secondary={c.lastMessage?.slice(0, 50) || 'No messages'}
                  primaryTypographyProps={{ fontWeight: 600 }}
                  secondaryTypographyProps={{ noWrap: true }}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 0, height: 'calc(100vh - 56px)', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          py: 1.5,
          borderBottom: '1px solid rgba(0,255,0,0.2)',
        }}
      >
        <IconButton onClick={() => navigate('/chat')}>
          <ArrowBack sx={{ color: '#00ff00' }} />
        </IconButton>
        <Avatar src={otherUser?.avatar} sx={{ width: 40, height: 40 }} />
        <Typography variant="h6" sx={{ flex: 1, fontWeight: 600 }}>
          {otherUser?.username || 'User'}
        </Typography>
      </Box>

      <Box ref={listRef} sx={{ flex: 1, overflow: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress sx={{ color: '#00ff00' }} size={24} />
          </Box>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender === currentUser?.id;
            return (
              <Box
                key={msg.id}
                sx={{
                  display: 'flex',
                  justifyContent: isMe ? 'flex-end' : 'flex-start',
                }}
              >
                <Paper
                  sx={{
                    maxWidth: '80%',
                    p: 1.5,
                    backgroundColor: isMe ? 'rgba(0, 255, 0, 0.2)' : 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(0,255,0,0.3)',
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="body2" sx={{ color: '#e0e0e0' }}>
                    {msg.text}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#888', display: 'block', textAlign: 'right' }}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                </Paper>
              </Box>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </Box>

      <Box sx={{ p: 1.5, borderTop: '1px solid rgba(0,255,0,0.2)', display: 'flex', gap: 1, alignItems: 'center' }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              color: '#fff',
              '& fieldset': { borderColor: 'rgba(0,255,0,0.3)' },
            },
          }}
        />
        <IconButton
          onClick={sendMessage}
          sx={{
            color: '#00ff00',
            '&:hover': { backgroundColor: 'rgba(0,255,0,0.1)' },
          }}
        >
          <Send />
        </IconButton>
      </Box>
    </Container>
  );
};

export default Chat;
