import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Web3 from 'web3';
import EthereumProvider from '@walletconnect/ethereum-provider';

const Web3Context = createContext();

// Token configurations (using the same from the original script.js)
const TOKENS = {
  PSPAY: {
    name: "PSPAY",
    address: "0x275fE1709Dc07112BcAf56A3465ECE683c5Fb04c", // Será convertido com checksum
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
      { "constant": false, "inputs": [{ "internalType": "address", "name": "sender", "type": "address" }, { "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "transferFrom", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }
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
  const [networkError, setNetworkError] = useState(null);
  const [walletConnectProvider, setWalletConnectProvider] = useState(null);

  useEffect(() => {
    initializeWalletConnect();
    checkWalletConnection();
    
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  const initializeWalletConnect = async () => {
    try {
      console.log('🔄 Inicializando WalletConnect 2.0...');
      
      const projectId = process.env.REACT_APP_WALLETCONNECT_PROJECT_ID || '33c5ba1dfbf9e1be8d7d5ea32ffc13d3';
      console.log('📋 Project ID:', projectId);
      
      const wcProvider = await EthereumProvider.init({
        projectId: projectId,
        chains: [56],
        rpcMap: {
          56: 'https://bsc-dataseed.binance.org/'
        },
        metadata: {
          name: 'Pspay',
          description: 'Plataforma de Pagamentos com PSPAY e USDT',
          url: window.location.origin,
          icons: ['https://www.pspay.solutions/img/logoP.png'],
          verifyUrl: window.location.origin
        },
        showQrModal: true,
        optionalChains: [56],
        disableProviderPing: false,
        qrModalOptions: {
          themeMode: 'light'
        }
      });

      console.log('✅ WalletConnect inicializado com sucesso');
      setWalletConnectProvider(wcProvider);

      wcProvider.on('accountsChanged', (accounts) => {
        console.log('👥 Contas alteradas:', accounts);
        handleAccountsChanged(accounts);
      });
      
      wcProvider.on('chainChanged', (chainId) => {
        console.log('🌐 Rede alterada:', chainId);
        handleChainChanged(chainId);
      });
      
      wcProvider.on('disconnect', () => {
        console.log('🔌 WalletConnect desconectado');
        setAccount(null);
        setProvider(null);
        setWeb3(null);
        setBalances({});
      });

      if (wcProvider.connected && wcProvider.accounts?.length > 0) {
        console.log('🔗 Sessão WalletConnect existente encontrada');
        setAccount(wcProvider.accounts[0]);
        
        const ethProvider = new ethers.BrowserProvider(wcProvider);
        const web3Instance = new Web3(wcProvider);
        setProvider(ethProvider);
        setWeb3(web3Instance);
      }

    } catch (error) {
      console.error('❌ Erro ao inicializar WalletConnect:', error);
      setNetworkError('Falha na inicialização do WalletConnect. Recarregue a página.');
    }
  };

  useEffect(() => {
    if (account && web3) {
      updateBalances();
    }
  }, [account, web3, selectedToken]);

  const checkWalletConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          await connectWallet();
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    }
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      setAccount(null);
      setProvider(null);
      setWeb3(null);
      setBalances({});
    } else {
      setAccount(accounts[0]);
    }
  };

  const handleChainChanged = async (chainId) => {
    console.log('🌐 Chain changed to:', chainId);
    
    const numericChainId = typeof chainId === 'string' ? parseInt(chainId, 16) : chainId;
    
    if (numericChainId !== 56) {
      console.log('⚠️ Rede incorreta. Mudando para BSC...');
      setNetworkError('Por favor, conecte-se à Binance Smart Chain (BSC)');
      
      if (window.ethereum) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x38' }],
          });
          setNetworkError(null);
        } catch (switchError) {
          console.error('Erro ao mudar para BSC:', switchError);
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [BSC_NETWORK],
              });
              setNetworkError(null);
            } catch (addError) {
              console.error('Erro ao adicionar BSC:', addError);
            }
          }
        }
      }
    } else {
      console.log('✅ Conectado à BSC (Chain 56)');
      setNetworkError(null);
      
      if (account && provider) {
        updateBalances();
      }
    }
  };

  const connectWallet = async (useWalletConnect = false) => {
    setIsConnecting(true);
    setNetworkError(null);

    try {
      let walletProvider;

      if (useWalletConnect && walletConnectProvider) {
        await walletConnectProvider.enable();
        walletProvider = walletConnectProvider;
        console.log('Conectado via WalletConnect');
      } else {
        if (!window.ethereum) {
          setNetworkError('Por favor, instale MetaMask ou use WalletConnect');
          throw new Error('Nenhuma carteira detectada');
        }
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        walletProvider = window.ethereum;
        console.log('Conectado via MetaMask');
      }

      const ethProvider = new ethers.BrowserProvider(walletProvider);
      const web3Instance = new Web3(walletProvider);
      
      setProvider(ethProvider);
      setWeb3(web3Instance);
      
      const signer = await ethProvider.getSigner();
      const address = await signer.getAddress();
      setAccount(address);

      const network = await ethProvider.getNetwork();
      console.log('Connected to network:', network.chainId);
      
      if (Number(network.chainId) !== 56) {
        console.log('Wrong network, switching to BSC...');
        if (!useWalletConnect) {
          await switchToBSC();
        } else {
          setNetworkError('Por favor, conecte-se à Binance Smart Chain');
        }
      }

      localStorage.setItem('walletConnection', useWalletConnect ? 'walletconnect' : 'injected');
      return address;
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setNetworkError(error.message || 'Erro ao conectar carteira');
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  const connectWithWalletConnect = () => connectWallet(true);

  const switchToBSC = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: BSC_NETWORK.chainId }],
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [BSC_NETWORK],
          });
        } catch (addError) {
          console.error('Error adding BSC network:', addError);
          setNetworkError('Failed to add Binance Smart Chain to wallet');
        }
      } else {
        console.error('Error switching to BSC:', switchError);
        setNetworkError('Failed to switch to Binance Smart Chain');
      }
    }
  };

  const updateBalances = async () => {
    if (!account || !provider) return;

    try {
      const network = await provider.getNetwork();
      if (Number(network.chainId) !== 56) {
        setNetworkError('Por favor, conecte-se à Binance Smart Chain (BSC) para ver os saldos');
        return;
      }
      setNetworkError(null);
    } catch (networkError) {
      console.error('❌ Erro ao verificar rede:', networkError);
      return;
    }

    console.log('💰 Atualizando saldos para conta:', account);
    
    try {
      const newBalances = {};
      for (const [tokenKey, tokenConfig] of Object.entries(TOKENS)) {
        try {
          const checksumAddress = ethers.getAddress(tokenConfig.address.toLowerCase());
          const contract = new ethers.Contract(checksumAddress, tokenConfig.abi, provider);
          const [balance, decimals] = await Promise.all([
            contract.balanceOf(account),
            contract.decimals()
          ]);
          const formattedBalance = ethers.formatUnits(balance, decimals);
          newBalances[tokenKey] = {
            raw: balance.toString(),
            formatted: formattedBalance,
            symbol: tokenConfig.symbol,
            displayFormatted: parseFloat(formattedBalance).toFixed(4)
          };
          console.log(`✅ Saldo ${tokenKey}:`, formattedBalance);
        } catch (tokenError) {
          console.error(`❌ Erro ao buscar saldo de ${tokenKey}:`, tokenError);
          newBalances[tokenKey] = { raw: '0', formatted: '0', symbol: tokenConfig.symbol, displayFormatted: '0.0000', error: tokenError.message };
        }
      }
      setBalances(newBalances);
      console.log('✅ Saldos atualizados:', newBalances);
    } catch (error) {
      console.error('❌ Erro geral ao atualizar saldos:', error);
    }
  };

  const sendTransaction = async (toAddress, amount, tokenSymbol = 'PSPAY') => {
    if (!provider || !account) throw new Error('Wallet not connected');

    try {
      const signer = await provider.getSigner();
      const tokenConfig = TOKENS[tokenSymbol];
      if (!tokenConfig) throw new Error('Unsupported token');

      const checksumTokenAddress = ethers.getAddress(tokenConfig.address.toLowerCase());
      const checksumToAddress = ethers.getAddress(toAddress.toLowerCase());
      
      const contract = new ethers.Contract(checksumTokenAddress, tokenConfig.abi, signer);
      const decimals = await contract.decimals();
      const amountInWei = ethers.parseUnits(amount.toString(), decimals);
      
      const tx = await contract.transfer(checksumToAddress, amountInWei);
      
      return { hash: tx.hash, wait: () => tx.wait() };
    } catch (error) {
      console.error('Transaction failed:', error);
      throw error;
    }
  };

  // =====================================================================
  //  FUNÇÃO DE BUSCA DE PREÇO CORRIGIDA
  // =====================================================================
  const fetchPriceFromGeckoTerminal = async (tokenSymbol) => {
    // Para USDT, o preço é sempre ~1 USD
    if (tokenSymbol === 'USDT') {
      return 1.0;
    }
  
    // Para PSPAY, buscamos na API da pool específica
    if (tokenSymbol === 'PSPAY') {
      try {
        const poolAddress = "0xc5ff521f620d26508c238f064085f06af360ed1f";
        const url = `https://api.geckoterminal.com/api/v2/networks/bsc/pools/${poolAddress}`;
        
        const response = await fetch(url); // Requisição GET (padrão)
        if (!response.ok) {
          throw new Error(`Erro na API GeckoTerminal: ${response.statusText}`);
        }
        const apiData = await response.json();
  
        // Pega o ID do token base na resposta da API
        const baseTokenId = apiData.data.relationships.base_token.data.id;
        
        // Pega o endereço do nosso token PSPAY para verificação
        const pspayAddress = TOKENS.PSPAY.address;
  
        // Confirma que o 'base_token' da API é realmente o nosso PSPAY
        if (baseTokenId.toLowerCase().includes(pspayAddress.toLowerCase())) {
          // Se for, pegamos o preço exato dele em USD
          const priceUSD = parseFloat(apiData.data.attributes.base_token_price_usd);
          
          console.log(`Preço do PSPAY (GeckoTerminal): $${priceUSD}`);
          return priceUSD;
        } else {
          // Esta mensagem de erro aparecerá se a estrutura da pool mudar no futuro
          throw new Error("O token PSPAY não foi encontrado como o 'base_token' na pool.");
        }
  
      } catch (error) {
        console.error("Erro ao buscar preço no GeckoTerminal:", error);
        // Mantemos um preço de fallback em caso de falha total da API
        return 0.10; 
      }
    }
  
    // Retorna 0 para qualquer outro token não configurado
    return 0;
  };

  const generatePaymentQR = async (amountBRL, tokenSymbol = 'PSPAY') => {
    if (!account) return null;
    
    const tokenConfig = TOKENS[tokenSymbol];
    if (!tokenConfig) return null;

    try {
      const usdRate = await fetchExchangeRate();
      // ATUALIZADO: Usa a nova função de busca de preço
      const tokenRate = await fetchPriceFromGeckoTerminal(tokenSymbol);

      if (!usdRate || !tokenRate || tokenRate === 0) {
        throw new Error('Não foi possível obter as taxas de câmbio necessárias.');
      }

      const amountUSD = amountBRL / usdRate;
      const amountToken = amountUSD / tokenRate;
      const amountInWei = ethers.parseUnits(amountToken.toString(), tokenConfig.decimals);

      const uri = `ethereum:${tokenConfig.address}@56/transfer?address=${account}&uint256=${amountInWei}`;
      
      return {
        uri,
        amountToken,
        amountUSD,
        amountBRL
      };
    } catch (error) {
      console.error('Erro ao gerar QR de pagamento:', error);
      return null;
    }
  };

  const fetchExchangeRate = async () => {
    try {
      const response = await fetch('https://openexchangerates.org/api/latest.json?app_id=b72524c6a1204affb3aac6c0c657aca5');
      const data = await response.json();
      return data.rates.BRL; 
    } catch (error) {
      console.error('Erro ao buscar taxa de câmbio:', error);
      return 5.0; // Fallback BRL rate
    }
  };
  
  // A antiga função fetchTokenToUSDRate foi substituída pela fetchPriceFromGeckoTerminal
  // Mantemos getTokenPrice para compatibilidade, caso seja usado em outro lugar
  const getTokenPrice = async (tokenSymbol) => {
    return await fetchPriceFromGeckoTerminal(tokenSymbol);
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
      console.error('Error converting to fiat:', error);
      return { usd: 0, [fiatCurrency.toLowerCase()]: 0 };
    }
  };

  
  const disconnectWallet = async () => {
    try {
      if (walletConnectProvider && walletConnectProvider.disconnect) {
        await walletConnectProvider.disconnect().catch(()=>{});
      }
      if (window && window.ethereum) {
        try {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        } catch(e){}
      }
    } catch(e){
      console.warn('disconnect error', e);
    } finally {
      setAccount(null);
      setProvider(null);
      setWeb3(null);
      setBalances({});
      setNetworkError(null);
      localStorage.removeItem('walletConnection');
    }
  };
const value = {
    account,
    provider,
    web3,
    balances,
    selectedToken,
    setSelectedToken,
    isConnecting,
    networkError,
    tokens: TOKENS,
    connectWallet,
    connectWithWalletConnect,
    updateBalances,
    sendTransaction,
    generatePaymentQR,
    getTokenPrice,
    convertToFiat,
    fetchExchangeRate,
    // ATUALIZADO: exporta a nova função para consistência
    fetchTokenToUSDRate: fetchPriceFromGeckoTerminal,
    disconnectWallet,
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};
