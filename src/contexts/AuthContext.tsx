
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { sha256 } from 'js-sha256';
import { supabase } from '@/integrations/supabase/client';

// Define User type
export type User = {
  id: number;
  username: string;
  password_hash: string;
  created_at?: string;
};

interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  registerUser: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
  users: User[];
  fetchUsers: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  // Check if there's a saved session
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('user');
      }
    }
    
    // Fetch users on initial load
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*');
      
      if (error) {
        console.error('Error fetching users:', error);
        return;
      }
      
      setUsers(data as User[]);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Hash the password with SHA-256
      const hashedPassword = sha256(password);
      
      // Find user with matching username and password in Supabase
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('password_hash', hashedPassword)
        .single();
      
      if (error || !data) {
        console.error('Login error:', error);
        return false;
      }
      
      const user = data as User;
      setIsAuthenticated(true);
      setCurrentUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('user');
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    try {
      if (!currentUser) {
        return { success: false, message: 'Usuário não autenticado.' };
      }

      // Check if current password is correct
      const hashedCurrentPassword = sha256(currentPassword);
      if (hashedCurrentPassword !== currentUser.password_hash) {
        return { success: false, message: 'A senha atual está incorreta.' };
      }

      // Hash the new password
      const hashedNewPassword = sha256(newPassword);

      // Update password in Supabase
      const { error } = await supabase
        .from('users')
        .update({ password_hash: hashedNewPassword })
        .eq('id', currentUser.id);
      
      if (error) {
        console.error('Password update error:', error);
        return { success: false, message: 'Erro ao atualizar senha no banco de dados.' };
      }

      // Update password in local state and storage
      const updatedUser = { ...currentUser, password_hash: hashedNewPassword };
      setCurrentUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return { success: true, message: 'Senha alterada com sucesso!' };
    } catch (error) {
      console.error('Password change error:', error);
      return { success: false, message: 'Erro ao alterar a senha.' };
    }
  };

  const registerUser = async (username: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      // Check if username already exists
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('*')
        .eq('username', username);
      
      if (checkError) {
        console.error('Error checking existing user:', checkError);
        return { success: false, message: 'Erro ao verificar se o usuário já existe.' };
      }
      
      if (existingUser && existingUser.length > 0) {
        return { success: false, message: 'Este nome de usuário já está em uso.' };
      }
      
      // Hash the password with SHA-256
      const hashedPassword = sha256(password);
      
      // Insert new user into Supabase
      const { data, error } = await supabase
        .from('users')
        .insert([
          { username, password_hash: hashedPassword }
        ])
        .select();
      
      if (error) {
        console.error('User registration error:', error);
        return { success: false, message: 'Erro ao registrar usuário.' };
      }
      
      // Refresh users list
      await fetchUsers();
      
      return { success: true, message: 'Usuário registrado com sucesso!' };
    } catch (error) {
      console.error('User registration error:', error);
      return { success: false, message: 'Erro ao registrar usuário.' };
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      currentUser, 
      login, 
      logout, 
      changePassword,
      registerUser,
      users,
      fetchUsers
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
