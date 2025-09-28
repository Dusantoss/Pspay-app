import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWeb3 } from '../contexts/Web3Context';
import { 
  Store, 
  QrCode, 
  BarChart3, 
  Package, 
  Settings, 
  LogOut, 
  User,
  Bell,
  Eye,
  EyeOff,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  Receipt,
  ArrowDownLeft,
  Power
} from 'lucide-react';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import ReceivePaymentModal from '../components/ReceivePaymentModal';
import ReceivePaymentSection from '../components/ReceivePaymentSection';
import ProductManagement from '../components/ProductManagement';
import StoreManagement from '../components/StoreManagement';
import QuickReceiveForm from '../components/QuickReceiveForm';

const MerchantDashboard = () => {
  const { user, logout, token } = useAuth();
  const { 
    account, 
    balances, 
    connectWallet, 
    isConnecting, 
    disconnectWallet,
    getTokenPrice,
    fetchExchangeRate
  } = useWeb3();

  const [activeTab, setActiveTab] = useState('overview');
  const [showBalance, setShowBalance] = useState(true);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  
  // Estados para dados reais da API
  const [analytics, setAnalytics] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [totalBalanceBRL, setTotalBalanceBRL] = useState(0);
  const [isCalculatingBalance, setIsCalculatingBalance] = useState(true);

  const navItems = [
    { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
    { id: 'receive', label: 'Receber', icon: QrCode },
    { id: 'products', label: 'Produtos', icon: Package },
    { id: 'store', label: 'Loja', icon: Store },
  ];

  // Efeito para buscar dados da visão geral
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token || activeTab !== 'overview') return;

      setIsLoading(true);
      try {
        const headers = { 'Authorization': `Bearer ${token}` };

        // Busca as análises
        const analyticsRes = await fetch('/api/analytics/dashboard', { headers });
        if (!analyticsRes.ok) throw new Error('Falha ao buscar análises');
        const analyticsData = await analyticsRes.json();
        setAnalytics(analyticsData);

        // Busca as transações
        const transactionsRes = await fetch('/api/transactions', { headers });
        if (!transactionsRes.ok) throw new Error('Falha ao buscar transações');
        const transactionsData = await transactionsRes.json();
        setRecentTransactions(transactionsData.slice(0, 5));

      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
        toast.error("Não foi possível carregar os dados da visão geral.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [token, activeTab]);

  // Efeito para calcular o saldo
  useEffect(() => {
    const calculateTotalBalance = async () => {
      if (!balances || Object.keys(balances).length === 0) {
        setTotalBalanceBRL(0);
        setIsCalculatingBalance(false);
        return;
      }
      setIsCalculatingBalance(true);
      try {
        const brlRate = await fetchExchangeRate();
        const pricePromises = Object.entries(balances).map(async ([tokenKey, balanceData]) => {
          if (balanceData && balanceData.formatted) {
            const tokenPriceUSD = await getTokenPrice(tokenKey);
            const tokenAmount = parseFloat(balanceData.formatted);
            return (tokenAmount * tokenPriceUSD) * brlRate;
          }
          return 0;
        });
        const results = await Promise.all(pricePromises);
        setTotalBalanceBRL(results.reduce((a, b) => a + b, 0));
      } catch (error) {
        console.error("Erro ao calcular saldo total:", error);
        setTotalBalanceBRL(0);
      } finally {
        setIsCalculatingBalance(false);
      }
    };
    calculateTotalBalance();
  }, [balances, getTokenPrice, fetchExchangeRate]);

  const handleLogout = () => {
    if(account) disconnectWallet();
    logout();
    toast.success("Você saiu da sua conta.");
  };
  
  const renderOverview = () => {
    if (isLoading) {
      return <div className="text-center p-8 text-slate-500">Carregando dados...</div>;
    }
    return (
      <div className="space-y-8 animate-fade-in">
        {/* Cards de Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-full"><DollarSign className="text-blue-600"/></div>
            <div>
              <p className="text-sm text-slate-600">Receita Total</p>
              <p className="text-2xl font-bold">R$ {(analytics?.total_revenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-full"><Receipt className="text-green-600"/></div>
            <div>
              <p className="text-sm text-slate-600">Transações</p>
              <p className="text-2xl font-bold">{analytics?.transaction_count || 0}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border flex items-center space-x-4">
            <div className="p-3 bg-orange-100 rounded-full"><ShoppingBag className="text-orange-600"/></div>
            <div>
              <p className="text-sm text-slate-600">Ticket Médio</p>
              <p className="text-2xl font-bold">R$ {(analytics?.avg_transaction || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>

        {/* Transações Recentes */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b"><h3 className="text-lg font-semibold">Transações Recentes</h3></div>
          <div className="p-2 md:p-6">
            {recentTransactions.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {recentTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                       <div className="p-2 bg-green-100 rounded-full"><ArrowDownLeft size={20} className="text-green-600"/></div>
                       <div>
                         <p className="font-semibold text-slate-700">Recebimento</p>
                         <p className="text-xs text-slate-500">De: {tx.from_user_id.slice(0,6)}...{tx.from_user_id.slice(-4)}</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="font-bold text-green-600">+ {(tx.amount).toLocaleString('pt-BR')} {tx.token_type}</p>
                       <p className="text-xs text-slate-500">{new Date(tx.created_at).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="p-4 text-slate-500">Nenhuma transação recente encontrada.</p>}
          </div>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'receive': return <ReceivePaymentSection />;
      case 'products': return <ProductManagement />;
      case 'store': return <StoreManagement />;
      default: return renderOverview();
    }
  };

  // ▼▼▼ CORREÇÃO PRINCIPAL: O JSX do layout foi adicionado aqui ▼▼▼
  return (
    <div className="min-h-screen flex bg-slate-100 font-sans">
      {/* Sidebar de Navegação */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-800">Painel</h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                activeTab === item.id 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-200">
           <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
           >
             <LogOut size={20} />
             <span className="font-medium">Sair da Conta</span>
           </button>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col">
        {/* Header do Conteúdo */}
        <header className="bg-white border-b border-slate-200 p-4 sm:p-6 flex justify-between items-center">
          <div>
             <h3 className="text-xl font-bold text-slate-800">
                {navItems.find(item => item.id === activeTab)?.label}
             </h3>
             <p className="text-sm text-slate-500">Bem-vindo(a) de volta!</p>
          </div>
          <div className="flex items-center space-x-4">
              {account ? (
                <div className="bg-white border rounded-lg p-3 text-center">
                    <p className="text-xs text-slate-500">Saldo Total Estimado</p>
                    <div className="flex items-center justify-center space-x-2">
                      <p className={`text-lg font-bold ${isCalculatingBalance ? 'animate-pulse' : ''}`}>
                         {showBalance ? `R$ ${totalBalanceBRL.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : 'R$ ••••••'}
                      </p>
                      <button onClick={() => setShowBalance(!showBalance)} className="text-slate-500 hover:text-slate-800">
                          {showBalance ? <EyeOff size={18}/> : <Eye size={18}/>}
                      </button>
                    </div>
                </div>
              ) : (
                <button 
                  onClick={connectWallet} 
                  disabled={isConnecting}
                  className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 transition-colors disabled:bg-slate-400"
                >
                  {isConnecting ? 'Conectando...' : 'Conectar Carteira'}
                </button>
              )}
          </div>
        </header>
        
        {/* Área de Conteúdo da Aba */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
  // ▲▲▲ FIM DA CORREÇÃO ▲▲▲
};

export default MerchantDashboard;

// CORREÇÃO: Chave "}" extra removida do final do arquivo
