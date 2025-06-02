
import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Package, Plus, Key, Users, BarChart3 } from 'lucide-react';

const AdminLayout: React.FC = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="md:w-64 flex-shrink-0">
          <nav className="bg-dark-700 rounded-lg p-4 border border-gold-500 shadow-lg">
            <h2 className="text-xl font-bold mb-6 gold-text text-center">
              Painel de Administração
            </h2>
            <div className="space-y-2">
              <NavLink 
                to="/admin" 
                end
                className={({ isActive }) => 
                  `flex items-center p-3 rounded-lg transition-all ${
                    isActive 
                    ? 'bg-gold-500 text-dark-900' 
                    : 'text-white hover:bg-dark-600'
                  }`
                }
              >
                <BarChart3 size={20} className="mr-2" /> Dashboard
              </NavLink>
              <NavLink 
                to="/admin/products" 
                className={({ isActive }) => 
                  `flex items-center p-3 rounded-lg transition-all ${
                    isActive 
                    ? 'bg-gold-500 text-dark-900' 
                    : 'text-white hover:bg-dark-600'
                  }`
                }
              >
                <Package size={20} className="mr-2" /> Produtos
              </NavLink>
              <NavLink 
                to="/admin/add-product" 
                className={({ isActive }) => 
                  `flex items-center p-3 rounded-lg transition-all ${
                    isActive 
                    ? 'bg-gold-500 text-dark-900' 
                    : 'text-white hover:bg-dark-600'
                  }`
                }
              >
                <Plus size={20} className="mr-2" /> Adicionar Produto
              </NavLink>
              <NavLink
                to="/admin/users"
                className={({ isActive }) => 
                  `flex items-center p-3 rounded-lg transition-all ${
                    isActive 
                    ? 'bg-gold-500 text-dark-900' 
                    : 'text-white hover:bg-dark-600'
                  }`
                }
              >
                <Users size={20} className="mr-2" /> Gerenciar Usuários
              </NavLink>
              <NavLink 
                to="/admin/change-password" 
                className={({ isActive }) => 
                  `flex items-center p-3 rounded-lg transition-all ${
                    isActive 
                    ? 'bg-gold-500 text-dark-900' 
                    : 'text-white hover:bg-dark-600'
                  }`
                }
              >
                <Key size={20} className="mr-2" /> Alterar Senha
              </NavLink>
            </div>
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          <div className="bg-dark-700 rounded-lg p-6 border border-gold-500 shadow-lg">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
