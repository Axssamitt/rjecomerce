
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);
    setLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        toast({
          title: "Login bem-sucedido",
          description: "Bem-vindo de volta!",
        });
        navigate('/admin');
      } else {
        setError(true);
        toast({
          title: "Erro no login",
          description: "Email ou senha incorretos!",
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(true);
      toast({
        title: "Erro no login",
        description: "Ocorreu um erro durante o login. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto mt-16 p-8 rounded-xl shadow-xl login-container animate-fade-in">
        <h2 className="text-2xl font-bold mb-6 text-center gold-text">Área do Administrador</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block gold-text mb-2">Email</label>
            <input 
              type="email" 
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 bg-dark-700 border-gold-500 text-white" 
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block gold-text mb-2">Senha</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 bg-dark-700 border-gold-500 text-white pr-12" 
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gold-500 hover:text-gold-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="w-full gold-bg hover:bg-gold-600 text-dark-900 py-2 px-4 rounded-lg font-medium transition duration-300 disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        {error && (
          <div className="mt-4 text-red-500 text-center">
            Email ou senha incorretos!
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
