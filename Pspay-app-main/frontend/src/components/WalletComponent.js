import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { Wallet, Coins, TrendingUp, RefreshCw, Copy, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

const WalletComponent = () => {
  const { 
    account, 
    balances, 
    selectedToken,
    setSelectedToken,
    tokens,
    connectWallet,
    updateBalances,
    isConnecting,
    networkError
  } = useWeb3();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshBalances = async () => {
    setIsRefreshing(true);
    try {
      await updateBalances();
      toast.success('Saldos atualizados');
    } catch (error) {
      toast.error('Erro ao atualizar saldos');
    } finally {
      setIsRefreshing(false);
    }
  };

  const copyAddress = (address) => {
    navigator.clipboard.writeText(address);
    toast.success('Endereço copiado!');
  };

  const openInExplorer = (address) => {
    window.open(`https://bscscan.com/address/${address}`, '_blank');
  };

  if (!account) {
    return (
      <div className="text-center py-12">
        <Wallet className="w-16 h-16 text-slate-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-slate-900 mb-2">Conectar Carteira</h3>
        <p className="text-slate-600 mb-6">
          Conecte sua carteira MetaMask para visualizar seus saldos e fazer transações
        </p>
        
        {networkError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-800">
            {networkError}
          </div>
        )}
        
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className="bg-gradient-to-r from-blue-900 to-blue-700 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-800 hover:to-blue-600 transition-all disabled:opacity-50"
        >
          {isConnecting ? (
            <div className="flex items-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Conectando...
            </div>
          ) : (
            'Conectar Carteira'
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Wallet Address */}
      <div className="bg-slate-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-900">Endereço da Carteira</p>
            <p className="text-xs text-slate-600 font-mono mt-1">{account}</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => copyAddress(account)}
              className="p-2 text-slate-600 hover:text-slate-900 transition-colors"
              title="Copiar endereço"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={() => openInExplorer(account)}
              className="p-2 text-slate-600 hover:text-slate-900 transition-colors"
              title="Ver no explorer"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Balance Refresh */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-900">Seus Tokens</h3>
        <button
          onClick={handleRefreshBalances}
          disabled={isRefreshing}
          className="flex items-center px-3 py-2 text-sm text-blue-900 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Atualizando...' : 'Atualizar'}
        </button>
      </div>

      {/* Token List */}
      <div className="grid gap-4">
        {Object.entries(tokens).map(([tokenKey, tokenConfig]) => {
          const balance = balances[tokenKey];
          const isSelected = selectedToken === tokenKey;
          
          return (
            <div
              key={tokenKey}
              onClick={() => setSelectedToken(tokenKey)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                isSelected 
                  ? 'border-blue-900 bg-blue-50' 
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 mr-4">
                    <img 
                      src={tokenConfig.logo} 
                      alt={tokenConfig.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div 
                      className="w-full h-full bg-gradient-to-r from-blue-900 to-blue-700 hidden items-center justify-center"
                      style={{ display: 'none' }}
                    >
                      <span className="text-white font-bold text-sm">
                        {tokenConfig.symbol.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">{tokenConfig.name}</h4>
                    <p className="text-sm text-slate-600">{tokenConfig.symbol}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  {balance ? (
                    <>
                      <p className="font-semibold text-slate-900">
                        {parseFloat(balance.formatted).toLocaleString('pt-BR', {
                          minimumFractionDigits: 4,
                          maximumFractionDigits: 4
                        })}
                      </p>
                      <p className="text-sm text-slate-600">{balance.symbol}</p>
                    </>
                  ) : (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-slate-300 border-t-blue-900 rounded-full animate-spin mr-2"></div>
                      <span className="text-sm text-slate-600">Carregando...</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Token Details */}
              <div className="mt-3 pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-slate-600">
                    <span>Contrato:</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyAddress(tokenConfig.address);
                      }}
                      className="ml-2 font-mono hover:text-blue-900 transition-colors"
                    >
                      {tokenConfig.address.slice(0, 6)}...{tokenConfig.address.slice(-4)}
                    </button>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openInExplorer(tokenConfig.address);
                    }}
                    className="text-blue-900 hover:text-blue-700 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Network Info */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
          <div>
            <p className="text-sm font-medium text-yellow-800">Rede Binance Smart Chain</p>
            <p className="text-sm text-yellow-700 mt-1">
              Certifique-se de estar conectado à BSC para visualizar seus tokens corretamente.
            </p>
          </div>
        </div>
      </div>

      {/* Add Token Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Coins className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-900">Precisa adicionar tokens?</p>
            <p className="text-sm text-blue-700 mt-1">
              Adicione os endereços dos contratos PSPAY e USDT na sua carteira MetaMask para visualizar os saldos.
            </p>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between bg-white rounded p-2">
                <span className="text-xs font-mono text-slate-600">PSPAY</span>
                <button
                  onClick={() => copyAddress(tokens.PSPAY.address)}
                  className="text-xs text-blue-900 hover:text-blue-700"
                >
                  Copiar endereço
                </button>
              </div>
              <div className="flex items-center justify-between bg-white rounded p-2">
                <span className="text-xs font-mono text-slate-600">USDT</span>
                <button
                  onClick={() => copyAddress(tokens.USDT.address)}
                  className="text-xs text-blue-900 hover:text-blue-700"
                >
                  Copiar endereço
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletComponent;