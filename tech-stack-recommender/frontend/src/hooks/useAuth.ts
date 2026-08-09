import { create } from 'zustand';
import { User } from '../types';
import api from '../lib/api';
import { useEffect } from 'react';

interface AuthStore {
  user: User | null;
  token: string | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, knownSkills?: string[]) => Promise<void>;
  logout: () => void;
  fetchProfile: () => Promise<void>;
}

const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  loading: true,
  
  setUser: (user) => set({ user }),
  setToken: (token) => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
    set({ token });
  },
  
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { user, token } = response.data;
    set({ user, token });
    localStorage.setItem('token', token);
  },
  
  register: async (email, password, name, knownSkills) => {
    const response = await api.post('/auth/register', { email, password, name, knownSkills });
    const { user, token } = response.data;
    set({ user, token });
    localStorage.setItem('token', token);
  },
  
  logout: () => {
    set({ user: null, token: null });
    localStorage.removeItem('token');
  },
  
  fetchProfile: async () => {
    try {
      const response = await api.get('/auth/profile');
      set({ user: response.data, loading: false });
    } catch (error) {
      set({ user: null, token: null, loading: false });
      localStorage.removeItem('token');
    }
  },
}));

export const useAuth = () => {
  const store = useAuthStore();
  
  useEffect(() => {
    if (store.token && !store.user) {
      store.fetchProfile();
    } else if (!store.token) {
      useAuthStore.setState({ loading: false });
    }
  }, []);
  
  return store;
};
