import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { History, ArrowUpRight, ArrowDownLeft, Search, Filter } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const TransactionHistory = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get('/transactions');
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      // Mock data for demonstration
      setTransactions([
        {
          id: '1',
          from_user_id: user?.id,
          to_user_id: 'merchant-1',
          amount: 89.50,
          token_type: 'USDT',
          status: 'completed',
          created_at: '2024-01-15T14:30:00Z',
          description: 'Pagamento - Café da Esquina',
          transaction_hash: '0x1234...5678'
        },
        {
          id: '2',
          from_user_id: 'client-2',
          to_user_id: user?.id,
          amount: 150.00,
          token_type: 'PSPAY',
          status: 'completed',
          created_at: '2024-01-14T10:15:00Z',
          description: 'Recebimento - Venda de produto',
          transaction_hash: '0xabcd...efgh'
        },
        {
          id: '3',
          from_user_id: user?.id,
          to_user_id: 'merchant-2',
          amount: 45.25,
          token_type: 'PSPAY',
          status: 'pending',
          created_at: '2024-01-13T16:45:00Z',
          description: 'Pagamento - Lanchonete do João',
          transaction_hash: '0x9876...5432'
        },
        {
          id: '4',
          from_user_id: user?.id,
          to_user_id: 'merchant-3',
          amount: 220.00,
          token_type: 'USDT',
          status: 'failed',
          created_at: '2024-01-12T09:20:00Z',
          description: 'Pagamento - Mercado Central',
          transaction_hash: '0xfedc...ba98'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-slate-600 bg-slate-100';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Concluída';
      case 'pending':
        return 'Pendente';
      case 'failed':
        return 'Falhou';
      default:
        return 'Desconhecido';
    }
  };

  const getTransactionType = (transaction) => {
    if (user?.user_type === 'merchant') {
      return transaction.to_user_id === user.id ? 'received' : 'sent';
    } else {
      return transaction.from_user_id === user.id ? 'sent' : 'received';
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.transaction_hash?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || transaction.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-slate-100 rounded-lg p-4 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-slate-200 rounded-full mr-4"></div>
                <div>
                  <div className="w-32 h-4 bg-slate-200 rounded mb-2"></div>
                  <div className="w-24 h-3 bg-slate-200 rounded"></div>
                </div>
              </div>
              <div className="text-right">
                <div className="w-20 h-4 bg-slate-200 rounded mb-2"></div>
                <div className="w-16 h-3 bg-slate-200 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar transações..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div className="relative">
          <Filter className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="pl-10 pr-8 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
          >
            <option value="all">Todas</option>
            <option value="completed">Concluídas</option>
            <option value="pending">Pendentes</option>
            <option value="failed">Falhadas</option>
          </select>
        </div>
      </div>

      {/* Transaction List */}
      {filteredTransactions.length === 0 ? (
        <div className="text-center py-12">
          <History className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            {searchTerm || filterStatus !== 'all' ? 'Nenhuma transação encontrada' : 'Nenhuma transação ainda'}
          </h3>
          <p className="text-slate-600">
            {searchTerm || filterStatus !== 'all' 
              ? 'Tente ajustar os filtros de busca'
              : 'Suas transações aparecerão aqui após você fazer pagamentos ou receber valores'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTransactions.map((transaction) => {
            const transactionType = getTransactionType(transaction);
            const isReceived = transactionType === 'received';
            
            return (
              <div key={transaction.id} className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                      isReceived 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-orange-100 text-orange-600'
                    }`}>
                      {isReceived ? (
                        <ArrowDownLeft className="w-5 h-5" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5" />
                      )}
                    </div>
                    
                    <div>
                      <p className="font-medium text-slate-900">
                        {transaction.description || 'Transação'}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <p className="text-sm text-slate-600">
                          {formatDate(transaction.created_at)}
                        </p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                          {getStatusText(transaction.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className={`font-semibold ${
                      isReceived ? 'text-green-600' : 'text-slate-900'
                    }`}>
                      {isReceived ? '+' : '-'} R$ {transaction.amount.toLocaleString('pt-BR', { 
                        minimumFractionDigits: 2 
                      })}
                    </p>
                    <p className="text-sm text-slate-600">{transaction.token_type}</p>
                  </div>
                </div>
                
                {/* Transaction Hash */}
                {transaction.transaction_hash && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">Hash da transação:</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(transaction.transaction_hash);
                          toast.success('Hash copiado!');
                        }}
                        className="text-xs font-mono text-blue-900 hover:text-blue-700 transition-colors"
                      >
                        {transaction.transaction_hash.slice(0, 10)}...{transaction.transaction_hash.slice(-8)}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Load More Button */}
      {filteredTransactions.length >= 10 && (
        <div className="text-center">
          <button className="px-6 py-2 text-blue-900 border border-blue-900 rounded-lg hover:bg-blue-50 transition-colors">
            Carregar mais transações
          </button>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;