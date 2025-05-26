
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { UserPlus } from 'lucide-react';

const UserManagement: React.FC = () => {
  const { users, fetchUsers, registerUser } = useAuth();
  const { toast } = useToast();
  
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: ''
  });
  
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setNewUser(prev => ({
      ...prev,
      [id]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if (!newUser.email || !newUser.password || !newUser.confirmPassword) {
      toast({
        title: "Erro",
        description: "Todos os campos são obrigatórios.",
        variant: "destructive"
      });
      return;
    }
    
    // Check if passwords match
    if (newUser.password !== newUser.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive"
      });
      return;
    }
    
    // Check password length
    if (newUser.password.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await registerUser(newUser.email, newUser.password, newUser.username);
      
      if (result.success) {
        toast({
          title: "Sucesso",
          description: result.message,
        });
        
        // Reset form
        setNewUser({
          email: '',
          password: '',
          confirmPassword: '',
          username: ''
        });
      } else {
        toast({
          title: "Erro",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error registering user:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao registrar o usuário.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold gold-text">Gerenciamento de Usuários</h2>
      </div>
      
      {/* New User Form */}
      <form 
        onSubmit={handleSubmit} 
        className="bg-dark-700 p-6 rounded-lg shadow border border-gold-500 mb-8"
      >
        <h3 className="text-xl gold-text mb-4">Adicionar Novo Usuário</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="email" className="block gold-text mb-2">Email</label>
            <input 
              type="email"
              id="email"
              value={newUser.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 bg-dark-800 border-gold-500 text-white" 
              required
            />
          </div>
          
          <div>
            <label htmlFor="username" className="block gold-text mb-2">Nome de Usuário (opcional)</label>
            <input 
              type="text"
              id="username"
              value={newUser.username}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 bg-dark-800 border-gold-500 text-white" 
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block gold-text mb-2">Senha</label>
            <input 
              type="password"
              id="password"
              value={newUser.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 bg-dark-800 border-gold-500 text-white" 
              required
            />
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block gold-text mb-2">Confirmar Senha</label>
            <input 
              type="password"
              id="confirmPassword"
              value={newUser.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 bg-dark-800 border-gold-500 text-white" 
              required
            />
          </div>
        </div>
        
        <div className="flex justify-end">
          <button 
            type="submit"
            disabled={loading}
            className="px-4 py-2 gold-bg text-dark-900 rounded-lg hover:bg-gold-600 flex items-center disabled:opacity-50"
          >
            <UserPlus size={18} className="mr-2" />
            {loading ? 'Adicionando...' : 'Adicionar Usuário'}
          </button>
        </div>
      </form>
      
      {/* Users List */}
      <div className="bg-dark-700 p-6 rounded-lg shadow border border-gold-500">
        <h3 className="text-xl gold-text mb-4">Usuários Cadastrados</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="border-b border-gold-500">
                <th className="px-4 py-2 text-left gold-text">ID</th>
                <th className="px-4 py-2 text-left gold-text">Email</th>
                <th className="px-4 py-2 text-left gold-text">Nome de Usuário</th>
                <th className="px-4 py-2 text-left gold-text">Data de Criação</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id} className="border-b border-dark-600 hover:bg-dark-600">
                    <td className="px-4 py-2 text-white">{user.id.substring(0, 8)}...</td>
                    <td className="px-4 py-2 text-white">{user.email || 'N/A'}</td>
                    <td className="px-4 py-2 text-white">{user.username || 'N/A'}</td>
                    <td className="px-4 py-2 text-white">
                      {user.created_at ? new Date(user.created_at).toLocaleString() : 'N/A'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-4 text-center text-gray-400">
                    Nenhum usuário encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
