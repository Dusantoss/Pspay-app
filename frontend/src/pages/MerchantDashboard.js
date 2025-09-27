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
  const { user, logout } = useAuth();
  // =====================================================================
  // CORREÇÃO: Puxando as funções necessárias para o cálculo de preço
  // =====================================================================
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
  const [analytics, setAnalytics] = useState({
    total_revenue: 0,
    transaction_count: 0,
    avg_transaction: 0
  });

  // =====================================================================
  // CORREÇÃO: Novo estado para armazenar o saldo total em BRL
  // =====================================================================
  const [totalBalanceBRL, setTotalBalanceBRL] = useState(0);
  const [isCalculatingBalance, setIsCalculatingBalance] = useState(true);

  const navItems = [
    { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
    { id: 'receive', label: 'Receber Pagamento', icon: QrCode },
    { id: 'products', label: 'Produtos', icon: Package },
    { id: 'store', label: 'Loja', icon: Store },
  ];

  const salesData = [ { name: 'Jan', vendas: 4000 }, { name: 'Fev', vendas: 3000 }, { name: 'Mar', vendas: 2000 }, { name: 'Abr', vendas: 2780 }, { name: 'Mai', vendas: 1890 }, { name: 'Jun', vendas: 2390 }, ];
  const tokenDistribution = [ { name: 'PSPAY', value: 65, color: '#1e3a8a' }, { name: 'USDT', value: 35, color: '#f97316' }, ];
  const recentTransactions = [ { id: '1', amount: 150.00, token: 'PSPAY', customer: 'João Silva', time: '2 min atrás', status: 'completed' }, { id: '2', amount: 89.50, token: 'USDT', customer: 'Maria Santos', time: '15 min atrás', status: 'completed' }, { id: '3', amount: 220.00, token: 'PSPAY', customer: 'Pedro Oliveira', time: '1 hora atrás', status: 'pending' }, ];

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // =====================================================================
  // CORREÇÃO: useEffect para calcular o saldo total sempre que os saldos mudarem
  // =====================================================================
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
        let totalValue = 0;

        const pricePromises = Object.entries(balances).map(async ([tokenKey, balanceData]) => {
          if (balanceData && balanceData.formatted) {
            const tokenPriceUSD = await getTokenPrice(tokenKey);
            const tokenAmount = parseFloat(balanceData.formatted);
            const valueInUSD = tokenAmount * tokenPriceUSD;
            return valueInUSD * brlRate;
          }
          return 0;
        });
        
        const results = await Promise.all(pricePromises);
        totalValue = results.reduce((acc, value) => acc + value, 0);
        
        setTotalBalanceBRL(totalValue);
      } catch (error) {
        console.error("Erro ao calcular saldo total:", error);
        setTotalBalanceBRL(0);
      } finally {
        setIsCalculatingBalance(false);
      }
    };
    
    calculateTotalBalance();
  }, [balances, getTokenPrice, fetchExchangeRate]);


  const fetchAnalytics = async () => {
    setAnalytics({ total_revenue: 15350.75, transaction_count: 142, avg_transaction: 108.17 });
  };

  const handleLogout = () => {
    if(account) {
      disconnectWallet();
    }
    logout();
    toast.success("Você saiu da sua conta.");
  };

  // A função antiga getTotalBalance foi removida.

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Receita Total</p>
              <p className="text-2xl font-bold text-slate-900">R$ {analytics.total_revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center"><DollarSign className="w-6 h-6 text-green-600" /></div>
          </div>
          <div className="flex items-center mt-4 text-sm"><TrendingUp className="w-4 h-4 text-green-500 mr-1" /><span className="text-green-500">+12.5%</span><span className="text-slate-500 ml-1">vs mês anterior</span></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Transações</p>
              <p className="text-2xl font-bold text-slate-900">{analytics.transaction_count}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center"><Receipt className="w-6 h-6 text-blue-600" /></div>
          </div>
           <div className="flex items-center mt-4 text-sm"><TrendingUp className="w-4 h-4 text-green-500 mr-1" /><span className="text-green-500">+8.2%</span><span className="text-slate-500 ml-1">vs mês anterior</span></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Ticket Médio</p>
              <p className="text-2xl font-bold text-slate-900">R$ {analytics.avg_transaction.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center"><ShoppingBag className="w-6 h-6 text-orange-600" /></div>
          </div>
           <div className="flex items-center mt-4 text-sm"><TrendingUp className="w-4 h-4 text-green-500 mr-1" /><span className="text-green-500">+3.1%</span><span className="text-slate-500 ml-1">vs mês anterior</span></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Clientes Únicos</p>
              <p className="text-2xl font-bold text-slate-900">89</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center"><Users className="w-6 h-6 text-purple-600" /></div>
          </div>
           <div className="flex items-center mt-4 text-sm"><TrendingUp className="w-4 h-4 text-green-500 mr-1" /><span className="text-green-500">+15.7%</span><span className="text-slate-500 ml-1">vs mês anterior</span></div>
        </div>
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Vendas Mensais</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="vendas" fill="#1e3a8a" /></BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Distribuição por Token</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={tokenDistribution} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}%`}>
                {tokenDistribution.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
              </Pie><Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200"><h3 className="text-lg font-semibold text-slate-900">Transações Recentes</h3></div>
        <div className="p-6">
          <div className="space-y-4">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-900 to-blue-700 rounded-full flex items-center justify-center mr-4"><ArrowDownLeft className="w-5 h-5 text-white" /></div>
                  <div>
                    <p className="font-medium text-slate-900">{transaction.customer}</p>
                    <p className="text-sm text-slate-600">{transaction.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-900">R$ {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  <div className="flex items-center"><span className={`inline-block w-2 h-2 rounded-full mr-2 ${transaction.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'}`}></span><span className="text-sm text-slate-600">{transaction.token}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

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
      <header className="bg-slate-100 shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-gray-900 to-gray-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">P</span>
              </div>
              <h1 className="ml-3 text-xl font-bold text-gray-900">PayCoin Business</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button onClick={() => setShowReceiveModal(true)} className="hidden sm:flex items-center px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-lg hover:from-orange-500 hover:to-orange-400 transition-all">
                <QrCode className="w-4 h-4 mr-2" />
                Receber
              </button>
              
              <button className="p-2 text-slate-600 hover:text-slate-900 transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              
              <div className="relative group">
                <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-slate-100 transition-colors">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200">
                    {user?.profile?.profile_picture ? (
                      <img src={user.profile.profile_picture} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-orange-600 to-orange-500">
                        <span className="text-white text-sm font-bold">{user?.name?.charAt(0)?.toUpperCase()}</span>
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-medium text-slate-900 hidden sm:block">{user?.profile?.business_name || user?.name}</span>
                </button>
                
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <Link to="/profile" className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">
                    <User className="w-4 h-4 mr-3" /> Meu Perfil
                  </Link>
                  <Link to="/settings" className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">
                    <Settings className="w-4 h-4 mr-3" /> Configurações
                  </Link>
                   {account && (
                    <button 
                      onClick={() => {
                        disconnectWallet();
                        toast.info('Carteira desconectada.');
                      }}
                      className="w-full flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                    >
                      <Power className="w-4 h-4 mr-3" />
                      Desconectar Carteira
                    </button>
                  )}
                  <hr className="my-1" />
                  <button onClick={handleLogout} className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                    <LogOut className="w-4 h-4 mr-3" />
                    Sair
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900">
            {user?.profile?.business_name ? 
              `Dashboard - ${user.profile.business_name}` : 
              `Olá, ${user?.name?.split(' ')[0]}!`
            } 📊
          </h2>
          <p className="text-slate-600 mt-1">
            Acompanhe suas vendas e gerencie seu negócio
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-2 bg-gradient-to-r from-orange-600 to-orange-500 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-orange-100 text-sm">Saldo na Carteira</p>
                <div className="flex items-center mt-1">
                  {isCalculatingBalance ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : showBalance ? (
                    <h3 className="text-2xl font-bold">
                      {/* ===================================================================== */}
                      {/* CORREÇÃO: Usando o estado com o valor real em BRL */}
                      {/* ===================================================================== */}
                      R$ {totalBalanceBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h3>
                  ) : (
                    <h3 className="text-2xl font-bold">R$ ••••••</h3>
                  )}
                  <button
                    onClick={() => setShowBalance(!showBalance)}
                    className="ml-2 p-1 rounded-full hover:bg-orange-700 transition-colors"
                  >
                    {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="w-12 h-12 bg-orange-700 rounded-full flex items-center justify-center">
                <Store className="w-6 h-6" />
              </div>
            </div>
            
            <div className="flex items-center text-orange-100 text-sm">
              {account ? (
                <>
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  <span>Carteira conectada</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-red-400 rounded-full mr-2"></div>
                  <span>Carteira desconectada</span>
                </>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-slate-900">Status da Carteira</h4>
              <div className={`w-3 h-3 rounded-full ${account ? 'bg-green-500' : 'bg-red-500'}`}></div>
            </div>
            
            {account ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Conectada</p>
                  <p className="text-xs text-slate-500 font-mono break-all">
                    {account}
                  </p>
                </div>
                
                <div className="border-t border-slate-200 pt-4">
                  <h5 className="text-sm font-medium text-slate-900 mb-3">Receber Pagamento</h5>
                  <QuickReceiveForm />
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm text-slate-600 mb-3">Conecte sua carteira para receber pagamentos</p>
                <button
                  onClick={connectWallet}
                  disabled={isConnecting}
                  className="w-full px-3 py-2 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-500 transition-colors disabled:opacity-50"
                >
                  {isConnecting ? 'Conectando...' : 'Conectar Carteira'}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6">
          <div className="border-b border-slate-200">
            <nav className="flex space-x-8 px-6">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === item.id
                        ? 'border-orange-600 text-orange-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-2" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>
          
          <div className="p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>

      {showReceiveModal && (
        <ReceivePaymentModal 
          isOpen={showReceiveModal}
          onClose={() => setShowReceiveModal(false)}
        />
      )}
    </div>
  );
};

export default MerchantDashboard;
