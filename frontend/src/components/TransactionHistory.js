import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { History, ArrowUpRight, ArrowDownLeft, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';

const TransactionHistory = ({ transactions, isLoading }) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // A busca de dados foi movida para o componente pai (ClientDashboard)
  // useEffect(() => { fetchTransactions(); }, []);

  const formatDate = (dateString) => new Date(dateString).toLocaleString('pt-BR');

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Concluída';
      case 'pending': return 'Pendente';
      case 'failed': return 'Falhou';
      default: return 'Desconhecido';
    }
  };

  const filteredTransactions = (transactions || []).filter(transaction => {
    const searchString = `${transaction.description || ''} ${transaction.transaction_hash || ''} ${transaction.from_user_id} ${transaction.to_user_id}`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || transaction.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-slate-100 rounded-lg p-4 animate-pulse h-20"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Filtros e Busca */}
      </div>

      {filteredTransactions.length === 0 ? (
        <div className="text-center py-12">
          <History className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            {searchTerm || filterStatus !== 'all' ? 'Nenhuma transação encontrada' : 'Nenhuma transação ainda'}
          </h3>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTransactions.map((transaction) => {
            const isSent = transaction.from_user_id === user.id;
            const Icon = isSent ? ArrowUpRight : ArrowDownLeft;
            const color = isSent ? 'text-orange-600' : 'text-green-600';
            const prefix = isSent ? '-' : '+';
            
            return (
              <div key={transaction.id} className="bg-white border border-slate-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${isSent ? 'bg-orange-100' : 'bg-green-100'}`}>
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{isSent ? `Enviado para ${transaction.to_user_id.slice(0, 8)}...` : `Recebido de ${transaction.from_user_id.slice(0, 8)}...`}</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>{getStatusText(transaction.status)}</span>
                    </div>
                  </div>
                  <div className={`text-right font-semibold ${color}`}>
                    {prefix} {transaction.amount.toLocaleString('pt-BR')} {transaction.token_type}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
