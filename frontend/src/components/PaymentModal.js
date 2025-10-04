import React, { useState } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { X, Send, Wallet, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const PaymentModal = ({ isOpen, onClose }) => {
  const { account, sendTransaction, balances, tokens } = useWeb3();
  const [formData, setFormData] = useState({
    toAddress: '',
    amount: '',
    token: 'PSPAY',
    description: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear errors when user types
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.toAddress.trim()) {
      newErrors.toAddress = 'Endereço é obrigatório';
    } else if (!/^0x[a-fA-F0-9]{40}$/.test(formData.toAddress)) {
      newErrors.toAddress = 'Endereço inválido';
    }

    if (!formData.amount) {
      newErrors.amount = 'Valor é obrigatório';
    } else if (isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Valor deve ser maior que zero';
    }

    // Check balance
    const balance = balances[formData.token];
    if (balance && parseFloat(formData.amount) > parseFloat(balance.formatted)) {
      newErrors.amount = 'Saldo insuficiente';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Por favor, corrija os erros no formulário');
      return;
    }

    if (!account) {
      toast.error('Conecte sua carteira primeiro');
      return;
    }

    setIsLoading(true);

    try {
      const tx = await sendTransaction(
        formData.toAddress,
        formData.amount,
        formData.token
      );

      toast.success('Transação enviada! Aguarde a confirmação...');
      
      // Wait for confirmation
      await tx.wait();
      
      toast.success('Pagamento realizado com sucesso!');
      
      // Reset form
      setFormData({
        toAddress: '',
        amount: '',
        token: 'PSPAY',
        description: ''
      });
      
      onClose();
    } catch (error) {
      console.error('Payment failed:', error);
      toast.error(error.message || 'Erro ao realizar pagamento');
    } finally {
      setIsLoading(false);
    }
  };

  const getTokenBalance = (tokenSymbol) => {
    const balance = balances[tokenSymbol];
    return balance ? parseFloat(balance.formatted).toFixed(4) : '0.0000';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900 flex items-center">
            <Send className="w-5 h-5 mr-2" />
            Enviar Pagamento
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!account ? (
            <div className="text-center py-8">
              <Wallet className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Carteira não conectada
              </h3>
              <p className="text-slate-600 mb-4">
                Conecte sua carteira para enviar pagamentos
              </p>
              <button
                onClick={onClose}
                className="bg-gradient-to-r from-slate-900 to-slate-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors"
              >
                Fechar
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Token Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Token
                </label>
                <select
                  name="token"
                  value={formData.token}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                >
                  {Object.entries(tokens).map(([key, token]) => (
                    <option key={key} value={key}>
                      {token.name} ({token.symbol}) - Saldo: {getTokenBalance(key)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Recipient Address */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Endereço do destinatário
                </label>
                <input
                  type="text"
                  name="toAddress"
                  value={formData.toAddress}
                  onChange={handleChange}
                  placeholder="0x..."
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 ${
                    errors.toAddress ? 'border-red-300' : 'border-slate-300'
                  }`}
                />
                {errors.toAddress && (
                  <p className="mt-1 text-sm text-red-600">{errors.toAddress}</p>
                )}
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Valor
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.0001"
                    min="0"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 ${
                      errors.amount ? 'border-red-300' : 'border-slate-300'
                    }`}
                  />
                  <div className="absolute right-3 top-2 text-sm text-slate-500">
                    {tokens[formData.token]?.symbol}
                  </div>
                </div>
                {errors.amount && (
                  <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
                )}
                <p className="mt-1 text-xs text-slate-500">
                  Saldo disponível: {getTokenBalance(formData.token)} {tokens[formData.token]?.symbol}
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Descrição (opcional)
                </label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Ex: Pagamento de produto"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                />
              </div>

              {/* Warning */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Atenção</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Verifique cuidadosamente o endereço do destinatário. 
                      Transações em blockchain não podem ser revertidas.
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-lg hover:bg-gradient-to-r from-slate-900 to-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Enviando...
                    </div>
                  ) : (
                    'Enviar Pagamento'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;