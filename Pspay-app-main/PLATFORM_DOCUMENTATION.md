# 📋 DOCUMENTAÇÃO COMPLETA - PLATAFORMA PAYCOIN

## 🏗️ ARQUITETURA GERAL

### Stack Tecnológico
- **Frontend**: React 18 + Tailwind CSS + Lucide Icons
- **Backend**: FastAPI (Python) + MongoDB
- **Blockchain**: Binance Smart Chain (BSC) 
- **Web3**: Ethers.js + Web3.js
- **Autenticação**: JWT (JSON Web Tokens)
- **Estado Global**: React Context API
- **Notificações**: Sonner (Toast notifications)

### Estrutura de Diretórios
```
/app/
├── backend/
│   ├── server.py              # API principal FastAPI
│   ├── requirements.txt       # Dependências Python
│   └── .env                   # Variáveis de ambiente
├── frontend/
│   ├── src/
│   │   ├── contexts/          # Contextos React (Auth, Web3)
│   │   ├── pages/             # Páginas principais
│   │   ├── components/        # Componentes reutilizáveis
│   │   ├── App.js             # Componente raiz
│   │   └── App.css            # Estilos globais
│   ├── package.json           # Dependências Node.js
│   └── .env                   # Variáveis de ambiente
└── README.md                  # Documentação do projeto
```

---

## 🔐 SISTEMA DE AUTENTICAÇÃO

### Tipos de Usuário
1. **Cliente**: Usuário que faz pagamentos
2. **Comerciante**: Usuário que recebe pagamentos

### Fluxo de Autenticação
1. **Registro**:
   - Escolha do tipo de conta (Cliente/Comerciante)
   - Preenchimento de dados pessoais
   - Validação de email único
   - Hash da senha com bcrypt
   - Geração de JWT token

2. **Login**:
   - Validação de email/senha
   - Geração de JWT com expiração de 30 minutos
   - Armazenamento do token no localStorage
   - Redirecionamento para dashboard específico

3. **Proteção de Rotas**:
   - Middleware de verificação JWT
   - Componente `ProtectedRoute` no frontend
   - Verificação de tipo de usuário por rota

### Modelos de Dados (MongoDB)

#### Usuário
```python
{
  "id": "uuid4",
  "email": "usuario@exemplo.com",
  "name": "Nome do Usuário",
  "phone": "(11) 99999-9999",
  "user_type": "client" | "merchant",
  "hashed_password": "hash_bcrypt",
  "is_active": true,
  "created_at": "2024-01-01T00:00:00Z",
  "profile": {
    "profile_picture": "base64_image",
    "address": {
      "street": "Rua Exemplo",
      "number": "123",
      "city": "São Paulo",
      "state": "SP",
      "zip_code": "00000-000",
      "country": "Brasil",
      "latitude": -23.5630994,
      "longitude": -46.6532825
    },
    # Apenas para comerciantes:
    "business_name": "Nome da Empresa",
    "business_description": "Descrição do negócio",
    "business_banner": "base64_image",
    "business_category": "restaurant" | "retail" | "services"
  },
  "wallet_address": "0x..."
}
```

---

## 💳 FUNCIONALIDADES DO CLIENTE

### Dashboard Cliente (`/client-dashboard`)

#### 1. **Visão Geral**
- **Saldo Total**: Agregação de todos os tokens em R$
- **Status da Carteira**: Conectada/Desconectada
- **Ações Rápidas**: Botões para enviar/pagar
- **Métricas**: Variação mensal, gráfico de atividade

#### 2. **Carteira Digital** (Tab: Carteira)
**Funcionalidades**:
- **Visualização de Saldos**: PSPAY e USDT com valores em tempo real
- **Conexão de Carteira**: MetaMask e outras carteiras Web3
- **Validação de Rede**: Verificação automática da Binance Smart Chain
- **Atualização Manual**: Botão para refresh dos saldos
- **Informações dos Tokens**: Endereços de contrato, logos, decimais

**Tokens Suportados**:
```javascript
PSPAY: {
  address: "0x275fE1709Dc07112BcAf56A3465ECE683c5Fb04c",
  decimals: 18,
  abi: [/* ABI completa do contrato */]
}
USDT: {
  address: "0x55d398326f99059fF775485246999027B3197955", 
  decimals: 18,
  abi: [/* ABI completa do contrato */]
}
```

#### 3. **Enviar Pagamentos**
**Modal de Pagamento**:
- **Seleção de Token**: PSPAY ou USDT
- **Endereço Destinatário**: Validação de endereço Ethereum
- **Valor**: Input com validação de saldo suficiente
- **Descrição**: Campo opcional para anotações
- **Taxas de Gas**: Estimativa automática
- **Confirmação**: Assinatura via carteira conectada

**Processo de Transação**:
1. Validação de formulário
2. Verificação de saldo
3. Estimativa de gas
4. Envio para blockchain
5. Aguardo de confirmação
6. Atualização do histórico

#### 4. **Scanner de QR Code**
**Funcionalidades**:
- **Câmera**: Acesso à câmera do dispositivo
- **Upload de Imagem**: Leitura de QR de arquivo
- **Decodificação**: Suporte para URIs EIP-681
- **Validação**: Verificação de formato e valores
- **Processamento**: Execução automática do pagamento

**Formatos Suportados**:
- EIP-681: `ethereum:token@56/transfer?address=0x...&uint256=amount`
- Endereço simples: `0x...`
- JSON personalizado

#### 5. **Histórico de Transações** (Tab: Histórico)
**Funcionalidades**:
- **Lista Completa**: Todas as transações enviadas/recebidas
- **Filtros**: Por status (completed/pending/failed)
- **Busca**: Por hash, descrição ou endereço
- **Detalhes**: Hash, valor, token, data/hora, status
- **Paginação**: Carregamento por lotes

#### 6. **Mapa de Lojas** (Tab: Lojas)
**Funcionalidades**:
- **Lista de Estabelecimentos**: Todos os comerciantes cadastrados
- **Filtros**: Por categoria (restaurante, varejo, etc.)
- **Busca**: Por nome ou descrição
- **Informações Detalhadas**: 
  - Endereço completo
  - Telefone para contato
  - Horário de funcionamento
  - Avaliações (se disponível)
- **Integração com Maps**: Botão "Como chegar" para Google Maps
- **Distância**: Cálculo baseado na localização do usuário

---

## 🏪 FUNCIONALIDADES DO COMERCIANTE

### Dashboard Comerciante (`/merchant-dashboard`)

#### 1. **Visão Geral Analytics** (Tab: Visão Geral)
**Métricas Principais**:
- **Receita Total**: Soma de todos os pagamentos recebidos
- **Número de Transações**: Contador de vendas
- **Ticket Médio**: Valor médio por transação
- **Clientes Únicos**: Número de clientes diferentes

**Gráficos e Relatórios**:
- **Gráfico de Barras**: Vendas mensais
- **Gráfico de Pizza**: Distribuição por token (PSPAY/USDT)
- **Timeline**: Transações recentes com detalhes
- **Métricas Comparativas**: Variação vs período anterior

#### 2. **Interface de Recebimento Rápido**
**Localização**: Sidebar direito, sempre visível
**Funcionalidades**:
- **Input Valor**: Entrada em Reais (R$)
- **Seleção de Token**: PSPAY ou USDT
- **Conversão Automática**: 
  ```javascript
  // Fluxo de conversão:
  R$ → USD (via OpenExchangeRates API)
  USD → Token (via CoinBrain API)  
  Token → Wei (multiplicação por 10^18)
  ```
- **Geração de QR Code**: URI padrão EIP-681
- **Visualização**: QR code + valores convertidos
- **Ações**: Copiar URI, gerar novo QR

#### 3. **Gerenciamento de Produtos** (Tab: Produtos)
**CRUD Completo**:
- **Criar**: Nome, descrição, preço, categoria, imagem
- **Listar**: Grid com busca e filtros
- **Editar**: Modificação inline de dados
- **Excluir**: Confirmação antes da remoção
- **Status**: Ativar/desativar produtos

**Campos do Produto**:
```python
{
  "id": "uuid4",
  "merchant_id": "uuid4",
  "name": "Nome do Produto",
  "description": "Descrição detalhada",
  "price": 29.90,
  "currency": "BRL",
  "category": "bebidas" | "comidas" | "sobremesas" | "outros",
  "image": "url_da_imagem",
  "is_active": true,
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### 4. **Configuração de Loja** (Tab: Loja)
**Informações da Loja**:
- **Dados Básicos**: Nome, descrição, categoria
- **Contato**: Telefone, email
- **Endereço Completo**: Para aparecer no mapa
- **Horário de Funcionamento**: Por dia da semana
- **Status**: Ativa/inativa no mapa

**Integração com Mapa**:
- Lojas aparecem automaticamente no mapa para clientes
- Geocodificação de endereços
- Informações de contato e horários

#### 5. **Modal de Recebimento Avançado**
**Funcionalidades Completas**:
- **Configuração Detalhada**: Valor, token, descrição
- **QR Code Grande**: Para impressão ou exibição
- **Download**: Salvar QR como imagem PNG
- **Instruções**: Como usar para o cliente
- **Compartilhamento**: URI para envio via WhatsApp/email

---

## 🌐 INTEGRAÇÃO WEB3 E BLOCKCHAIN

### Configuração da Rede
**Binance Smart Chain (BSC)**:
- **Chain ID**: 56
- **RPC URL**: https://bsc-dataseed.binance.org/
- **Block Explorer**: https://bscscan.com/
- **Moeda Nativa**: BNB

### Conexão de Carteira
**Carteiras Suportadas**:
- MetaMask (principal)
- Trust Wallet
- Binance Chain Wallet
- Qualquer carteira compatível com Web3

**Processo de Conexão**:
1. Detecção de `window.ethereum`
2. Solicitação de acesso às contas
3. Verificação da rede conectada
4. Mudança automática para BSC se necessário
5. Obtenção do endereço da carteira
6. Configuração de listeners para mudanças

### Contratos Inteligentes

#### Token PSPAY
```solidity
Endereço: 0x275fE1709Dc07112BcAf56A3465ECE683c5Fb04c
Padrão: ERC-20
Decimais: 18
Rede: Binance Smart Chain
```

#### Token USDT
```solidity
Endereço: 0x55d398326f99059fF775485246999027B3197955
Padrão: ERC-20  
Decimais: 18
Rede: Binance Smart Chain
```

### Funções Web3 Implementadas

#### 1. **Leitura de Saldos**
```javascript
async function updateBalances() {
  for (const [tokenKey, tokenConfig] of Object.entries(TOKENS)) {
    const contract = new ethers.Contract(
      tokenConfig.address,
      tokenConfig.abi, 
      provider
    );
    
    const balance = await contract.balanceOf(account);
    const decimals = await contract.decimals();
    const formatted = ethers.formatUnits(balance, decimals);
    
    setBalances(prevBalances => ({
      ...prevBalances,
      [tokenKey]: { raw: balance, formatted, symbol: tokenConfig.symbol }
    }));
  }
}
```

#### 2. **Envio de Transações**
```javascript
async function sendTransaction(toAddress, amount, tokenSymbol) {
  const tokenConfig = TOKENS[tokenSymbol];
  const signer = await provider.getSigner();
  
  const contract = new ethers.Contract(
    tokenConfig.address,
    tokenConfig.abi,
    signer
  );
  
  const decimals = await contract.decimals();
  const amountInWei = ethers.parseUnits(amount.toString(), decimals);
  
  const tx = await contract.transfer(toAddress, amountInWei);
  return tx;
}
```

#### 3. **Geração de QR de Pagamento**
```javascript
async function generatePaymentQR(amountBRL, tokenSymbol) {
  // 1. Buscar taxa BRL/USD
  const usdRate = await fetchExchangeRate();
  
  // 2. Buscar preço do token em USD
  const tokenRate = await fetchTokenToUSDRate(tokenSymbol);
  
  // 3. Converter valores
  const amountUSD = amountBRL / usdRate;
  const amountToken = amountUSD / tokenRate;
  
  // 4. Converter para Wei
  const amountInWei = ethers.parseUnits(
    amountToken.toString(), 
    TOKENS[tokenSymbol].decimals
  );
  
  // 5. Gerar URI padrão EIP-681
  const uri = `ethereum:${TOKENS[tokenSymbol].address}@56/transfer?address=${account}&uint256=${amountInWei}`;
  
  return { uri, amountToken, amountUSD, amountBRL };
}
```

### APIs Externas Integradas

#### 1. **OpenExchangeRates** (Conversão BRL/USD)
```javascript
const response = await fetch('https://openexchangerates.org/api/latest.json?app_id=API_KEY');
const data = await response.json();
return data.rates.BRL;
```

#### 2. **CoinBrain** (Preços dos Tokens)
```javascript
const response = await fetch('https://api.coinbrain.com/public/coin-info', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ "56": [tokenAddress] })
});
const data = await response.json();
return data[0]?.priceUsd || fallbackPrice;
```

---

## 🎨 INTERFACE E EXPERIÊNCIA DO USUÁRIO

### Design System

#### Paleta de Cores
```css
:root {
  --color-primary: #1e3a8a;     /* Azul marinho */
  --color-secondary: #f97316;   /* Laranja */
  --color-accent: #fb923c;      /* Laranja claro */
  --color-background: #ffffff;  /* Branco */
  --color-surface: #f8fafc;     /* Cinza claro */
  --color-text: #1e293b;        /* Cinza escuro */
}
```

#### Tipografia
- **Fonte Principal**: Inter (Google Fonts)
- **Tamanhos**: 12px, 14px, 16px, 18px, 24px, 32px
- **Pesos**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

#### Componentes Padrão
- **Botões**: Gradientes, estados hover/disabled
- **Cards**: Sombras suaves, bordas arredondadas
- **Inputs**: Foco com cores primárias
- **Modais**: Backdrop blur, animações suaves

### Responsividade
- **Mobile First**: Design otimizado para dispositivos móveis
- **Breakpoints**: 
  - Mobile: < 768px
  - Tablet: 768px - 1024px  
  - Desktop: > 1024px
- **Layout Flexível**: Grid e Flexbox
- **Componentes Adaptáveis**: Menus colapsáveis, cards responsivos

### Acessibilidade
- **Contraste**: Cores com contraste adequado (WCAG AA)
- **Navegação**: Tab order lógica
- **Screen Readers**: Labels e ARIA attributes
- **Teclado**: Navegação completa via teclado

---

## 🔌 API ENDPOINTS (Backend)

### Autenticação
```python
POST /api/auth/register  # Registrar usuário
POST /api/auth/login     # Fazer login
```

### Usuários
```python
GET  /api/user/profile          # Obter perfil
PUT  /api/user/profile          # Atualizar perfil  
POST /api/user/upload-image     # Upload de imagem
```

### Lojas (Comerciantes)
```python
POST /api/stores         # Criar loja
GET  /api/stores         # Listar todas as lojas
GET  /api/my-stores      # Listar minhas lojas
PUT  /api/stores/{id}    # Atualizar loja
```

### Produtos (Comerciantes)
```python
POST /api/products           # Criar produto
GET  /api/products           # Listar produtos
GET  /api/my-products        # Listar meus produtos
PUT  /api/products/{id}      # Atualizar produto
DELETE /api/products/{id}    # Excluir produto
```

### Transações
```python
POST /api/transactions       # Registrar transação
GET  /api/transactions       # Listar transações do usuário
```

### Analytics (Comerciantes)
```python
GET /api/analytics/dashboard # Métricas do dashboard
```

### Sistema
```python
GET /api/health             # Status da aplicação
```

---

## 🚀 FLUXOS DE TRABALHO PRINCIPAIS

### 1. **Fluxo de Cliente - Fazer Pagamento**
1. **Login** → Dashboard Cliente
2. **Conectar Carteira** → Verificação BSC
3. **Escanear QR Code** → Câmera/Upload
4. **Decodificar URI** → Extrair dados de pagamento
5. **Confirmar Transação** → Assinatura na carteira
6. **Aguardar Confirmação** → Blockchain
7. **Atualizar Histórico** → Sucesso/Erro

### 2. **Fluxo de Comerciante - Receber Pagamento**
1. **Login** → Dashboard Comerciante  
2. **Conectar Carteira** → Verificação BSC
3. **Inserir Valor** → R$ na interface rápida
4. **Selecionar Token** → PSPAY ou USDT
5. **Gerar QR Code** → Conversão automática
6. **Mostrar para Cliente** → QR code gerado
7. **Aguardar Pagamento** → Monitorar transação
8. **Confirmar Recebimento** → Atualizar analytics

### 3. **Fluxo de Registro de Comerciante**
1. **Escolher Tipo** → Tela inicial
2. **Preencher Dados** → Formulário de registro
3. **Confirmar Email** → Validação
4. **Completar Perfil** → Informações do negócio
5. **Cadastrar Loja** → Endereço para mapa
6. **Adicionar Produtos** → Catálogo
7. **Configurar Recebimento** → Conectar carteira

---

## 📊 MONITORAMENTO E LOGS

### Logs do Sistema
- **Frontend**: Console do navegador + Network requests
- **Backend**: Logs estruturados com timestamp
- **Transações**: Hash, status, valores, usuários
- **Erros**: Stack traces, contexto, ações do usuário

### Métricas Importantes
- **Usuários Ativos**: Diário/mensal
- **Volume de Transações**: Por token, por período
- **Taxa de Conversão**: Registro → Uso efetivo
- **Tempos de Resposta**: APIs e blockchain
- **Taxa de Erro**: Por funcionalidade

---

## 🔒 SEGURANÇA

### Frontend
- **Sanitização**: Inputs validados
- **XSS Protection**: Headers de segurança
- **CSRF**: Tokens em formulários
- **Local Storage**: Apenas tokens JWT

### Backend  
- **Hash de Senhas**: bcrypt com salt
- **JWT**: Tokens com expiração
- **CORS**: Origens específicas
- **Rate Limiting**: Prevenção de spam
- **Validação**: Pydantic schemas

### Blockchain
- **Verificação de Rede**: Apenas BSC
- **Validação de Endereços**: Formato Ethereum
- **Estimativa de Gas**: Prevenção de falhas
- **Confirmações**: Aguardo de blocos

---

## 🚀 DEPLOYMENT E INFRAESTRUTURA

### Ambiente de Desenvolvimento
- **Frontend**: React Dev Server (porta 3000)
- **Backend**: FastAPI com reload (porta 8001)
- **Database**: MongoDB local
- **Supervisor**: Gerenciamento de processos

### Variáveis de Ambiente
```bash
# Backend
MONGO_URL=mongodb://localhost:27017/paycoin_db
SECRET_KEY=your-jwt-secret-key
CORS_ORIGINS=http://localhost:3000

# Frontend  
REACT_APP_BACKEND_URL=http://localhost:8001
```

### Dependências Principais
**Backend**:
- fastapi, uvicorn
- motor (MongoDB async)
- pydantic, passlib
- python-jose[cryptography]

**Frontend**:
- react, react-router-dom
- ethers, web3
- tailwindcss, lucide-react
- qrcode, jsqr
- sonner (notifications)

---

Esta documentação cobre todas as funcionalidades implementadas na plataforma PayCoin, desde a arquitetura técnica até os fluxos de usuário e integrações blockchain.