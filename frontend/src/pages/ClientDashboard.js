import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWeb3 } from '../contexts/Web3Context';
import { 
  Wallet, 
  Send, 
  History, 
  MapPin, 
  Settings, 
  LogOut, 
  User,
  Bell,
  Eye,
  EyeOff,
  TrendingUp,
  Scan,
  Power
} from 'lucide-react';
import { toast } from 'sonner';
import WalletComponent from '../components/WalletComponent';
import TransactionHistory from '../components/TransactionHistory';
import StoreMap from '../components/StoreMap';
import PaymentModal from '../components/PaymentModal';
import QRScannerModal from '../components/QRScannerModal';
import Logo from '../components/Logo'; // Ajuste o caminho se necessário


const ClientDashboard = () => {
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

  const [activeTab, setActiveTab] = useState('wallet');
  const [showBalance, setShowBalance] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [totalBalanceBRL, setTotalBalanceBRL] = useState(0);
  const [isCalculatingBalance, setIsCalculatingBalance] = useState(true);
  
  // Estados para o histórico de transações
  const [userTransactions, setUserTransactions] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  const navItems = [
    { id: 'wallet', label: 'Carteira', icon: Wallet },
    { id: 'history', label: 'Histórico', icon: History },
    { id: 'map', label: 'Lojas', icon: MapPin },
  ];

  // Efeito para buscar o histórico de transações do cliente
  useEffect(() => {
    const fetchHistory = async () => {
      if (!token) return;
      
      setIsLoadingHistory(true);
      try {
        const headers = { 'Authorization': `Bearer ${token}` };
        // Seu backend já retorna as transações do usuário logado neste endpoint
        const response = await fetch('/api/transactions', { headers });
        const data = await response.json();

        if (response.ok) {
          setUserTransactions(data);
        } else {
          throw new Error(data.detail || "Erro ao buscar histórico");
        }
      } catch (error) {
        console.error("Erro ao carregar histórico:", error);
        toast.error("Não foi possível carregar seu histórico.");
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchHistory();
  }, [token]);

  // Efeito para calcular o saldo total em BRL
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
            const valueInUSD = tokenAmount * tokenPriceUSD;
            return valueInUSD * brlRate;
          }
          return 0;
        });
        
        const results = await Promise.all(pricePromises);
        const totalValue = results.reduce((acc, value) => acc + value, 0);
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

  const handleLogout = () => {
    if(account) {
      disconnectWallet();
    }
    logout();
    toast.success("Você saiu da sua conta.");
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'wallet':
        return <WalletComponent />;
      case 'history': 
        // Passa os dados e o estado de carregamento para o componente filho
        return <TransactionHistory transactions={userTransactions} isLoading={isLoadingHistory} />;
      case 'map':
        return <StoreMap />;
      default:
        return <WalletComponent />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-100 shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Logo variant="escuro" />

            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 text-slate-600 hover:text-slate-900 transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              
              <div className="relative group">
                <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-slate-100 transition-colors">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200">
                    {user?.profile?.profile_picture ? (
                      <img src={user.profile.profile_picture} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-slate-900 to-slate-700">
                        <span className="text-white text-sm font-bold">{user?.name?.charAt(0)?.toUpperCase()}</span>
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-medium text-slate-900 hidden sm:block">{user?.name}</span>
                </button>
                
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <Link to="/profile" className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">
                    <User className="w-4 h-4 mr-3" /> Meu Perfil
                  </Link>
                  <Link to="/settings" className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">
                    <Settings className="w-4 h-4 mr-3" /> Configurações
                  </Link>
                  {account && (
                    <button onClick={() => { disconnectWallet(); toast.info('Carteira desconectada.'); }}
                      className="w-full flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">
                      <Power className="w-4 h-4 mr-3" /> Desconectar Carteira
                    </button>
                  )}
                  <hr className="my-1" />
                  <button onClick={handleLogout} className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                    <LogOut className="w-4 h-4 mr-3" /> Sair
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Olá, {user?.name?.split(' ')[0]}! 👋</h2>
          <p className="text-slate-600 mt-1">Gerencie sua carteira digital e faça pagamentos seguros</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="md:col-span-2 bg-gradient-to-r from-gray-900 to-gray-700 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-blue-100 text-sm">Saldo Total</p>
                <div className="flex items-center mt-1">
                  {isCalculatingBalance ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : showBalance ? (
                    <h3 className="text-2xl font-bold">
                      R$ {totalBalanceBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h3>
                  ) : (
                    <h3 className="text-2xl font-bold">R$ ••••••</h3>
                  )}
                  <button onClick={() => setShowBalance(!showBalance)} className="ml-2 p-1 rounded-full hover:bg-blue-800 transition-colors">
                    {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-orange-600 to-orange-500 rounded-full flex items-center justify-center">
                <Wallet className="w-6 h-6" />
              </div>
            </div>
            <div className="flex items-center text-blue-100 text-sm">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>+2.5% este mês</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h4 className="font-semibold text-slate-900">Ações Rápidas</h4>
            <div className="space-y-3 mt-4">
              <button onClick={() => setShowPaymentModal(true)} className="w-full flex items-center justify-center px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-lg hover:bg-gradient-to-r from-orange-600 to-orange-500 transition-colors">
                <Send className="w-4 h-4 mr-2" /> Enviar
              </button>
              <button onClick={() => setShowScannerModal(true)} className="w-full flex items-center justify-center px-4 py-2 bg-gradient-to-r from-stale-900 to-slate-700 text-white rounded-lg hover:bg-gradient-to-r from-slate-900 to-slate-700 transition-colors">
                <Scan className="w-4 h-4 mr-2" /> Pagar
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h4 className="font-semibold text-slate-900">Carteira</h4>
            <div className="mt-4">
              {account ? (
                <div>
                  <p className="text-sm text-slate-600 mb-2">Conectada</p>
                  <p className="text-xs text-slate-500 font-mono break-all">{account}</p>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-slate-600 mb-3">Desconectada</p>
                  <button onClick={connectWallet} disabled={isConnecting} className="w-full px-3 py-2 text-sm bg-gradient-to-r from-slate-900 to-slate-700 text-white rounded-lg hover:bg-gradient-to-r from-orange-600 to-orange-500 transition-colors disabled:opacity-50">
                    {isConnecting ? 'Conectando...' : 'Conectar'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6">
          <div className="border-b border-slate-200">
            <nav className="flex space-x-8 px-6">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === item.id ? 'border-blue-900 text-blue-900' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
                    <Icon className="w-5 h-5 mr-2" /> {item.label}
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

      {showPaymentModal && <PaymentModal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} />}
      {showScannerModal && <QRScannerModal isOpen={showScannerModal} onClose={() => setShowScannerModal(false)} />}
    </div>
  );
};

export default ClientDashboard;
