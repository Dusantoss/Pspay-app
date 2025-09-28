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
    { id: 'receive', label: 'Receber Pagamento', icon: QrCode },
    { id: 'products', label: 'Produtos', icon: Package },
    { id: 'store', label: 'Loja', icon: Store },
  ];

  // Efeito para buscar dados da visão geral
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) return;

      setIsLoading(true);
      try {
        const headers = { 'Authorization': `Bearer ${token}` };

        // Busca as análises
        const analyticsRes = await fetch('/api/analytics/dashboard', { headers });
        const analyticsData = await analyticsRes.json();
        if (analyticsRes.ok) setAnalytics(analyticsData);
        else throw new Error(analyticsData.detail);

        // Busca as transações
        const transactionsRes = await fetch('/api/transactions', { headers });
        const transactionsData = await transactionsRes.json();
        if (transactionsRes.ok) setRecentTransactions(transactionsData.slice(0, 5));
        else throw new Error(transactionsData.detail);

      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
        toast.error("Não foi possível carregar os dados.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

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
      return <div className="text-center p-8">Carregando dados...</div>;
    }
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <p className="text-sm text-slate-600">Receita Total</p>
            <p className="text-2xl font-bold">R$ {(analytics?.total_revenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <p className="text-sm text-slate-600">Transações</p>
            <p className="text-2xl font-bold">{analytics?.transaction_count || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <p className="text-sm text-slate-600">Ticket Médio</p>
            <p className="text-2xl font-bold">R$ {(analytics?.avg_transaction || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b"><h3 className="text-lg font-semibold">Transações Recentes</h3></div>
          <div className="p-6">
            {recentTransactions.length > 0 ? (
              <div className="space-y-4">
                {recentTransactions.map((tx) => (
                  <div key={tx.id} className="flex justify-between p-4 bg-slate-50 rounded-lg">
                    <p>De: {tx.from_user_id.slice(0,10)}...</p>
                    <p>+ {tx.amount} {tx.token_type}</p>
                  </div>
                ))}
              </div>
            ) : <p>Nenhuma transação.</p>}
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

  return (
    <div className="min-h-screen bg-slate-50">
      {/* O JSX do seu header, main, etc. permanece o mesmo */}
    </div>
  );
};

export default MerchantDashboard;
