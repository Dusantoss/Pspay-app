import React from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, Wallet, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

const WalletConnector = () => {
  const {
    account,
    balances,
    isConnecting,
    connectionError,
    networkError,
    isLoadingBalances,
    isInitialized,
    connectWallet,
    disconnectWallet,
    updateBalances,
    tokens
  } = useWeb3();

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance) => {
    if (!balance) return '0.0000';
    return parseFloat(balance.formatted).toFixed(4);
  };

  if (!isInitialized) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Inicializando WalletConnect...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status de Conexão */}
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wallet className="h-5 w-5" />
            <span>Carteira Crypto</span>
          </CardTitle>
          <CardDescription>
            Conecte via WalletConnect para acessar PSPAY e USDT
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!account ? (
            <div className="space-y-4">
              <Button 
                onClick={connectWallet}
                disabled={isConnecting}
                className="w-full"
                data-testid="connect-wallet-btn"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Conectando...
                  </>
                ) : (
                  <>
                    <Wallet className="mr-2 h-4 w-4" />
                    Conectar via WalletConnect
                  </>
                )}
              </Button>
              
              <div className="text-sm text-muted-foreground text-center">
                Use Trust Wallet, MetaMask, Rainbow ou qualquer carteira compatível
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Status de Conexão Ativa */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Conectado</span>
                </div>
                <Badge variant="outline" data-testid="wallet-address">
                  {formatAddress(account)}
                </Badge>
              </div>

              {/* Saldos dos Tokens */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Saldos</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={updateBalances}
                    disabled={isLoadingBalances}
                    data-testid="refresh-balances-btn"
                  >
                    <RefreshCw className={`h-3 w-3 ${isLoadingBalances ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
                
                {Object.entries(tokens).map(([tokenKey, tokenConfig]) => {
                  const balance = balances[tokenKey];
                  return (
                    <div key={tokenKey} className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <img 
                          src={tokenConfig.logo} 
                          alt={tokenConfig.symbol}
                          className="w-4 h-4 rounded-full"
                        />
                        <span className="text-sm">{tokenConfig.symbol}</span>
                      </div>
                      <span 
                        className="text-sm font-mono"
                        data-testid={`${tokenKey.toLowerCase()}-balance`}
                      >
                        {isLoadingBalances ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          formatBalance(balance)
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Botão Desconectar */}
              <Button
                variant="outline"
                onClick={disconnectWallet}
                className="w-full"
                data-testid="disconnect-wallet-btn"
              >
                Desconectar Carteira
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alertas de Erro */}
      {connectionError && (
        <Alert variant="destructive" data-testid="connection-error">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Erro de Conexão:</strong> {connectionError}
          </AlertDescription>
        </Alert>
      )}

      {networkError && (
        <Alert variant="destructive" data-testid="network-error">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Erro de Rede:</strong> {networkError}
          </AlertDescription>
        </Alert>
      )}

      {/* Instruções */}
      {!account && !connectionError && (
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground space-y-2">
              <p className="font-medium">Como conectar:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Clique em "Conectar via WalletConnect"</li>
                <li>Escaneie o QR code com sua carteira</li>
                <li>Aprove a conexão na sua carteira</li>
                <li>Certifique-se de estar na Binance Smart Chain (BSC)</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WalletConnector;