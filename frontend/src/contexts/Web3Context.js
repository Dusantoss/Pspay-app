import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Web3 from 'web3';
import EthereumProvider from '@walletconnect/ethereum-provider';

const Web3Context = createContext();

// Token configurations
const TOKENS = {
  PSPAY: {
    name: "PSPAY",
    address: "0x275fE1709Dc07112BcAf56A3465ECE683c5Fb04c",
    symbol: "PSPAY",
    decimals: 18,
    logo: "https://www.pspay.solutions/img/logoP.png",
    abi: [
      { "inputs": [{ "internalType": "address", "name": "_marketingWallet", "type": "address" }, { "internalType": "address", "name": "_lpWallet", "type": "address" }], "stateMutability": "nonpayable", "type": "constructor" },
      { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "spender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Approval", "type": "event" },
      { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Transfer", "type": "event" },
      { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" }], "name": "allowance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
      { "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "approve", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" },
      { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
      { "inputs": [], "name": "decimals", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "stateMutability": "pure", "type": "function" },
      { "inputs": [], "name": "name", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "pure", "type": "function" },
      { "inputs": [], "name": "symbol", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "pure", "type": "function" },
      { "inputs": [], "name": "totalSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
      { "inputs": [{ "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "transfer", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" },
      { "inputs": [{ "internalType": "address", "name": "sender", "type": "address" }, { "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "transferFrom", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }
    ]
  },
  USDT: {
    name: "USDT",
    address: "0x55d398326f99059fF775485246999027B3197955",
    symbol: "USDT",
    decimals: 18,
    logo: "https://cryptologos.cc/logos/tether-usdt-logo.png",
    abi: [
      { "inputs": [], "payable": false, "stateMutability": "nonpayable", "type": "constructor" },
      { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "spender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Approval", "type": "event" },
      { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Transfer", "type": "event" },
      { "constant": true, "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" }], "name": "allowance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" },
      { "constant": false, "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "approve", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" },
      { "constant": true, "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" },
      { "constant": true, "inputs": [], "name": "decimals", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "payable": false, "stateMutability": "view", "type": "function" },
      { "constant": true, "inputs": [], "name": "name", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" },
      { "constant": true, "inputs": [], "name": "symbol", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" },
      { "constant": true, "inputs": [], "name": "totalSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" },
      { "constant": false, "inputs": [{ "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "transfer", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" },
      { "constant": false, "inputs": [{ "internalType": "address", "name": "sender", "type": "address" }, { "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "transferFrom", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }
    ]
  }
};

const BSC_NETWORK = {
  chainId: '0x38', // 56 in decimal
  chainName: 'Binance Smart Chain',
  nativeCurrency: {
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18,
  },
  rpcUrls: ['https://bsc-dataseed.binance.org/'],
  blockExplorerUrls: ['https://bscscan.com/'],
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [balances, setBalances] = useState({});
  const [selectedToken, setSelectedToken] = useState('PSPAY');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [networkError, setNetworkError] = useState(null);
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);
  const [walletConnectProvider, setWalletConnectProvider] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initializeWalletConnect();
  }, []);

  // Separate effect for balance updates with debouncing
  useEffect(() => {
    let timeoutId;
    if (account && provider && isInitialized) {
      // Debounce balance updates
      timeoutId = setTimeout(() => {
        updateBalances();
      }, 500);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [account, provider, selectedToken, isInitialized]);

  const initializeWalletConnect = async () => {
    try {
      console.log('🔄 Inicializando WalletConnect...');
      setConnectionError(null);

      // Configurar WalletConnect 2.0 com PROJECT ID REAL
      const wcProvider = await EthereumProvider.init({
        projectId: '33c5ba1dfbf9e1be8d7d5ea32ffc13d3', // SEU PROJECT ID REAL
        chains: [56], // Binance Smart Chain OBRIGATÓRIA
        rpcMap: {
          56: 'https://bsc-dataseed.binance.org/'
        },
        metadata: {
          name: 'Pspay - Plataforma de Pagamentos Crypto',
          description: 'Plataforma de Pagamentos com PSPAY e USDT na Binance Smart Chain',
          url: window.location.origin,
          icons: ['https://www.pspay.solutions/img/logoP.png']
        },
        showQrModal: true
      });

      setWalletConnectProvider(wcProvider);

      // Event listeners para WalletConnect
      wcProvider.on('accountsChanged', handleAccountsChanged);
      wcProvider.on('chainChanged', handleChainChanged);
      wcProvider.on('disconnect', handleDisconnect);
      wcProvider.on('connect', handleConnect);

      // Verificar se já existe sessão ativa
      if (wcProvider.accounts?.length > 0) {
        console.log('✅ Sessão WalletConnect existente encontrada');
        await connectExistingSession(wcProvider);
      }

      setIsInitialized(true);
      console.log('✅ WalletConnect inicializado com sucesso');

    } catch (error) {
      console.error('❌ Erro ao inicializar WalletConnect:', error);
      setConnectionError('Falha na inicialização do WalletConnect: ' + error.message);
      setIsInitialized(true); // Ainda marca como inicializado para evitar loops
    }
  };

  const handleConnect = (accounts) => {
    console.log('🔗 WalletConnect conectado:', accounts);
  };

  const handleAccountsChanged = (accounts) => {
    console.log('👥 Contas alteradas:', accounts);
    if (accounts.length === 0) {
      handleDisconnect();
    } else {
      setAccount(accounts[0]);
      setConnectionError(null);
    }
  };

  const handleChainChanged = async (chainId) => {
    console.log('🌐 Rede alterada para:', chainId);
    const numericChainId = typeof chainId === 'string' ? parseInt(chainId, 16) : chainId;
    
    if (numericChainId !== 56) {
      setNetworkError('Por favor, conecte-se à Binance Smart Chain (BSC)');
      // Tentar forçar mudança para BSC
      await switchToBSC();
    } else {
      setNetworkError(null);
      // Recarregar saldos quando retornar à BSC
      if (account) {
        updateBalances();
      }
    }
  };

  const handleDisconnect = () => {
    console.log('🔌 WalletConnect desconectado');
    setAccount(null);
    setProvider(null);
    setWeb3(null);
    setBalances({});
    setConnectionError(null);
    setNetworkError(null);
    localStorage.removeItem('walletconnect');
  };

  const connectExistingSession = async (wcProvider) => {
    try {
      const ethProvider = new ethers.BrowserProvider(wcProvider);
      const web3Instance = new Web3(wcProvider);

      setProvider(ethProvider);
      setWeb3(web3Instance);
      setAccount(wcProvider.accounts[0]);

      // Verificar rede
      const network = await ethProvider.getNetwork();
      if (Number(network.chainId) !== 56) {
        await switchToBSC();
      }

    } catch (error) {
      console.error('❌ Erro ao conectar sessão existente:', error);
      handleDisconnect();
    }
  };

  const connectWallet = async () => {
    if (!walletConnectProvider) {
      setConnectionError('WalletConnect não inicializado. Recarregue a página.');
      return;
    }

    setIsConnecting(true);
    setConnectionError(null);
    setNetworkError(null);

    try {
      console.log('🔄 Conectando via WalletConnect...');

      // Ativar WalletConnect - isto abrirá o modal QR
      await walletConnectProvider.enable();

      // Verificar se conectou corretamente
      if (!walletConnectProvider.accounts || walletConnectProvider.accounts.length === 0) {
        throw new Error('Nenhuma conta conectada');
      }

      // Criar providers
      const ethProvider = new ethers.BrowserProvider(walletConnectProvider);
      const web3Instance = new Web3(walletConnectProvider);

      setProvider(ethProvider);
      setWeb3(web3Instance);

      // Obter conta atual
      const address = walletConnectProvider.accounts[0];
      setAccount(address);

      // Verificar e forçar BSC se necessário
      const network = await ethProvider.getNetwork();
      console.log('🌐 Conectado à rede:', network.chainId);

      if (Number(network.chainId) !== 56) {
        console.log('⚠️ Rede incorreta, forçando mudança para BSC...');
        await switchToBSC();
      }

      console.log('✅ Carteira conectada com sucesso:', address);
      return address;

    } catch (error) {
      console.error('❌ Erro ao conectar carteira:', error);
      
      // Mensagens de erro mais específicas
      if (error.message.includes('User rejected')) {
        setConnectionError('Conexão cancelada pelo usuário');
      } else if (error.message.includes('No modal available')) {
        setConnectionError('Modal WalletConnect não disponível. Tente recarregar a página.');
      } else if (error.message.includes('Already processing')) {
        setConnectionError('Já processando uma conexão. Aguarde.');
      } else {
        setConnectionError('Erro ao conectar: ' + error.message);
      }
      
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      if (walletConnectProvider?.connected) {
        await walletConnectProvider.disconnect();
      }
      handleDisconnect();
    } catch (error) {
      console.error('❌ Erro ao desconectar:', error);
      // Força desconexão local mesmo se der erro
      handleDisconnect();
    }
  };

  const switchToBSC = async () => {
    if (!walletConnectProvider) {
      setNetworkError('WalletConnect não disponível para mudança de rede');
      return;
    }

    try {
      console.log('🔄 Tentando mudar para BSC...');
      
      // Tentar mudar para BSC
      await walletConnectProvider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: BSC_NETWORK.chainId }],
      });

      setNetworkError(null);
      console.log('✅ Mudança para BSC bem-sucedida');

    } catch (switchError) {
      console.log('⚠️ Erro na mudança, tentando adicionar rede BSC...');
      
      // Se a rede não existe, tentar adicionar
      if (switchError.code === 4902) {
        try {
          await walletConnectProvider.request({
            method: 'wallet_addEthereumChain',
            params: [BSC_NETWORK],
          });
          setNetworkError(null);
          console.log('✅ Rede BSC adicionada e selecionada');
        } catch (addError) {
          console.error('❌ Erro ao adicionar rede BSC:', addError);
          setNetworkError('Não foi possível adicionar a Binance Smart Chain. Por favor, adicione manualmente.');
        }
      } else {
        console.error('❌ Erro ao mudar para BSC:', switchError);
        setNetworkError('Não foi possível mudar para a Binance Smart Chain. Por favor, mude manualmente na sua carteira.');
      }
    }
  };

  const updateBalances = async () => {
    if (!account || !provider || isLoadingBalances) {
      return;
    }

    console.log('💰 Atualizando saldos para:', account);
    setIsLoadingBalances(true);

    try {
      const newBalances = {};

      // Buscar saldos em paralelo para melhor performance
      const balancePromises = Object.entries(TOKENS).map(async ([tokenKey, tokenConfig]) => {
        try {
          const contract = new ethers.Contract(
            tokenConfig.address,
            tokenConfig.abi,
            provider
          );

          const [balance, decimals] = await Promise.all([
            contract.balanceOf(account),
            contract.decimals()
          ]);

          const formattedBalance = ethers.formatUnits(balance, decimals);

          return {
            tokenKey,
            balance: {
              raw: balance.toString(),
              formatted: formattedBalance,
              symbol: tokenConfig.symbol,
              displayFormatted: parseFloat(formattedBalance).toFixed(4)
            }
          };
        } catch (error) {
          console.error(`❌ Erro ao buscar saldo de ${tokenKey}:`, error);
          return {
            tokenKey,
            balance: {
              raw: '0',
              formatted: '0',
              symbol: tokenConfig.symbol,
              displayFormatted: '0.0000',
              error: error.message
            }
          };
        }
      });

      const results = await Promise.all(balancePromises);
      
      // Organizar resultados
      results.forEach(({ tokenKey, balance }) => {
        newBalances[tokenKey] = balance;
      });

      setBalances(newBalances);
      console.log('✅ Saldos atualizados:', newBalances);

    } catch (error) {
      console.error('❌ Erro geral ao atualizar saldos:', error);
      setConnectionError('Erro ao carregar saldos: ' + error.message);
    } finally {
      setIsLoadingBalances(false);
    }
  };

  const sendTransaction = async (toAddress, amount, tokenSymbol = 'PSPAY') => {
    if (!provider || !account) {
      throw new Error('Carteira não conectada');
    }

    if (!walletConnectProvider) {
      throw new Error('WalletConnect não disponível');
    }

    try {
      const signer = await provider.getSigner();
      const tokenConfig = TOKENS[tokenSymbol];

      if (!tokenConfig) {
        throw new Error('Token não suportado');
      }

      const contract = new ethers.Contract(
        tokenConfig.address,
        tokenConfig.abi,
        signer
      );

      const decimals = await contract.decimals();
      const amountInWei = ethers.parseUnits(amount.toString(), decimals);

      console.log(`💸 Enviando ${amount} ${tokenSymbol} para ${toAddress}`);

      const tx = await contract.transfer(toAddress, amountInWei);

      return {
        hash: tx.hash,
        wait: () => tx.wait()
      };
    } catch (error) {
      console.error('❌ Transação falhou:', error);
      throw error;
    }
  };

  const generatePaymentQR = async (amountBRL, tokenSymbol = 'PSPAY') => {
    if (!account) return null;

    const tokenConfig = TOKENS[tokenSymbol];
    if (!tokenConfig) return null;

    try {
      // Convert BRL to token amount
      const usdRate = await fetchExchangeRate();
      const tokenRate = await fetchTokenToUSDRate(tokenSymbol);

      if (!usdRate || !tokenRate) {
        throw new Error('Não foi possível obter as taxas de câmbio necessárias.');
      }

      const amountUSD = amountBRL / usdRate;
      const amountToken = amountUSD / tokenRate;
      const amountInWei = ethers.parseUnits(amountToken.toString(), tokenConfig.decimals);

      // Create EIP-681 payment request URI
      const uri = `ethereum:${tokenConfig.address}@56/transfer?address=${account}&uint256=${amountInWei}`;

      return {
        uri,
        amountToken,
        amountUSD,
        amountBRL
      };
    } catch (error) {
      console.error('❌ Erro ao gerar QR de pagamento:', error);
      return null;
    }
  };

  // Fetch exchange rate (BRL to USD)
  const fetchExchangeRate = async () => {
    try {
      const response = await fetch('https://openexchangerates.org/api/latest.json?app_id=b72524c6a1204affb3aac6c0c657aca5');
      const data = await response.json();
      return data.rates.BRL;
    } catch (error) {
      console.error('❌ Erro ao buscar taxa de câmbio:', error);
      return 5.0; // Fallback BRL rate
    }
  };

  // Fetch token to USD rate
  const fetchTokenToUSDRate = async (tokenSymbol) => {
    try {
      const tokenConfig = TOKENS[tokenSymbol];
      if (!tokenConfig) return 0;

      const response = await fetch('https://api.coinbrain.com/public/coin-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "56": [tokenConfig.address]
        })
      });
      const data = await response.json();
      return data[0]?.priceUsd || (tokenSymbol === 'USDT' ? 1 : 0.1);
    } catch (error) {
      console.error(`❌ Erro ao buscar preço do ${tokenSymbol}:`, error);
      return tokenSymbol === 'USDT' ? 1 : 0.1; // Fallback prices
    }
  };

  const getTokenPrice = async (tokenSymbol) => {
    return await fetchTokenToUSDRate(tokenSymbol);
  };

  const convertToFiat = async (amount, tokenSymbol, fiatCurrency = 'BRL') => {
    try {
      const tokenPrice = await getTokenPrice(tokenSymbol);
      const usdValue = amount * tokenPrice;

      const exchangeRate = await fetchExchangeRate();
      const fiatValue = usdValue * exchangeRate;

      return {
        usd: usdValue,
        [fiatCurrency.toLowerCase()]: fiatValue
      };
    } catch (error) {
      console.error('❌ Erro na conversão para fiat:', error);
      return { usd: 0, [fiatCurrency.toLowerCase()]: 0 };
    }
  };

  const value = {
    // Estados
    account,
    provider,
    web3,
    balances,
    selectedToken,
    setSelectedToken,
    isConnecting,
    connectionError,
    networkError,
    isLoadingBalances,
    isInitialized,
    
    // Configurações
    tokens: TOKENS,
    
    // Métodos principais - APENAS WALLETCONNECT
    connectWallet, // Remove MetaMask, usa apenas WalletConnect
    disconnectWallet,
    updateBalances,
    
    // Métodos de transação
    sendTransaction,
    generatePaymentQR,
    
    // Utilitários
    getTokenPrice,
    convertToFiat,
    fetchExchangeRate,
    fetchTokenToUSDRate,
    switchToBSC
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};