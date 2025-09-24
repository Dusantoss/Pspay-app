# 🔄 FLUXOGRAMA FUNCIONAL - PLATAFORMA PAYCOIN

## 📋 MAPA DE FUNCIONALIDADES POR USUÁRIO

```
PLATAFORMA PAYCOIN
├── 🏠 TELA INICIAL
│   ├── Escolha: Cliente ou Comerciante
│   ├── Apresentação das funcionalidades
│   └── Links para Login/Registro
│
├── 👤 ÁREA DO CLIENTE
│   ├── 🔐 Autenticação
│   │   ├── Registro com dados pessoais
│   │   ├── Login com email/senha
│   │   └── JWT token com 30min de validade
│   │
│   ├── 📊 Dashboard
│   │   ├── Saldo total em R$ (agregado)
│   │   ├── Status da carteira Web3
│   │   ├── Ações rápidas (Enviar/Pagar)
│   │   └── Métricas de atividade
│   │
│   ├── 💰 Carteira Digital
│   │   ├── 🔗 Conexão com MetaMask
│   │   ├── 🌐 Validação da rede BSC
│   │   ├── 💎 Visualização de tokens
│   │   │   ├── PSPAY (0x275fE...4c)
│   │   │   └── USDT (0x55d39...55)
│   │   ├── 🔄 Atualização de saldos
│   │   └── ℹ️ Informações dos contratos
│   │
│   ├── 📤 Enviar Pagamentos
│   │   ├── 🎯 Seleção de token
│   │   ├── 📍 Endereço destinatário
│   │   ├── 💵 Valor a enviar
│   │   ├── 📝 Descrição opcional
│   │   ├── ⛽ Estimativa de gas
│   │   └── ✍️ Assinatura na carteira
│   │
│   ├── 📱 Scanner QR Code
│   │   ├── 📷 Acesso à câmera
│   │   ├── 📁 Upload de imagem
│   │   ├── 🔍 Decodificação de URI
│   │   ├── ✅ Validação de dados
│   │   └── 🚀 Execução automática
│   │
│   ├── 📜 Histórico
│   │   ├── 📋 Lista de transações
│   │   ├── 🔍 Busca por hash/descrição
│   │   ├── 🎛️ Filtros por status
│   │   ├── 📄 Paginação
│   │   └── 📊 Detalhes completos
│   │
│   ├── 🗺️ Mapa de Lojas
│   │   ├── 📍 Lista de estabelecimentos
│   │   ├── 🏷️ Filtros por categoria
│   │   ├── 🔍 Busca por nome
│   │   ├── 📞 Informações de contato
│   │   ├── 🕒 Horários de funcionamento
│   │   └── 🧭 Direções no Google Maps
│   │
│   └── 👤 Perfil
│       ├── 📝 Dados pessoais
│       ├── 🖼️ Foto de perfil
│       ├── 📍 Endereço
│       └── 🔧 Configurações
│
└── 🏪 ÁREA DO COMERCIANTE
    ├── 🔐 Autenticação
    │   ├── Registro com dados do negócio
    │   ├── Login com email/senha
    │   └── JWT token com 30min de validade
    │
    ├── 📊 Dashboard Analytics
    │   ├── 💰 Receita total
    │   ├── 🧾 Número de transações
    │   ├── 💳 Ticket médio
    │   ├── 👥 Clientes únicos
    │   ├── 📈 Gráfico de vendas mensais
    │   ├── 🥧 Distribuição por token
    │   └── ⏰ Transações recentes
    │
    ├── ⚡ Recebimento Rápido (Sidebar)
    │   ├── 💵 Input valor em R$
    │   ├── 🪙 Seleção de token
    │   ├── 🔄 Conversão automática
    │   │   ├── R$ → USD (OpenExchangeRates)
    │   │   ├── USD → Token (CoinBrain API)
    │   │   └── Token → Wei (×10^18)
    │   ├── 📱 Geração de QR Code
    │   ├── 👁️ Visualização de valores
    │   ├── 📋 Copiar URI
    │   └── 🔄 Gerar novo QR
    │
    ├── 📦 Gerenciar Produtos
    │   ├── ➕ Criar produto
    │   │   ├── 📛 Nome e descrição
    │   │   ├── 💰 Preço em R$
    │   │   ├── 🏷️ Categoria
    │   │   └── 🖼️ Imagem
    │   ├── 📋 Listar produtos
    │   ├── ✏️ Editar produto
    │   ├── 🗑️ Excluir produto
    │   ├── 👁️ Ativar/desativar
    │   ├── 🔍 Busca e filtros
    │   └── 📊 Status de vendas
    │
    ├── 🏬 Configurar Loja
    │   ├── 📛 Nome da loja
    │   ├── 📝 Descrição do negócio
    │   ├── 🏷️ Categoria
    │   ├── 📞 Telefone
    │   ├── 📍 Endereço completo
    │   ├── 🕒 Horário de funcionamento
    │   ├── 🗺️ Aparecer no mapa
    │   └── ✅ Status ativo/inativo
    │
    ├── 📱 Modal Recebimento Avançado
    │   ├── ⚙️ Configuração detalhada
    │   ├── 📱 QR Code grande
    │   ├── 💾 Download PNG
    │   ├── 📖 Instruções de uso
    │   └── 📤 Compartilhamento
    │
    └── 👤 Perfil Comerciante
        ├── 📝 Dados pessoais
        ├── 🖼️ Foto de perfil
        ├── 🏢 Informações do negócio
        ├── 🎨 Banner da loja
        └── 📍 Endereço da loja
```

---

## 🔄 FLUXOS PRINCIPAIS DETALHADOS

### 1. 💳 FLUXO COMPLETO DE PAGAMENTO (Cliente → Comerciante)

```
INÍCIO: Cliente quer pagar
│
├── 1️⃣ PREPARAÇÃO DO CLIENTE
│   ├── Abrir app PayCoin
│   ├── Fazer login
│   ├── Conectar carteira MetaMask
│   ├── Verificar saldo suficiente
│   └── ✅ Pronto para pagar
│
├── 2️⃣ GERAÇÃO DO QR PELO COMERCIANTE
│   ├── Comerciante abre dashboard
│   ├── Conecta carteira Web3
│   ├── Interface Rápida (sidebar):
│   │   ├── Digite: R$ 50,00
│   │   ├── Seleciona: PSPAY
│   │   └── Clica: "Gerar QR Code"
│   ├── CONVERSÃO AUTOMÁTICA:
│   │   ├── API OpenExchangeRates: R$ 50 ÷ 5.0 = $10 USD
│   │   ├── API CoinBrain: $10 ÷ $0.1 = 100 PSPAY
│   │   └── Wei: 100 × 10^18 = 100000000000000000000
│   ├── GERAÇÃO DE URI:
│   │   └── ethereum:0x275fE...@56/transfer?address=0x...&uint256=100000000000000000000
│   └── ✅ QR Code pronto
│
├── 3️⃣ PAGAMENTO PELO CLIENTE
│   ├── Cliente abre scanner QR
│   ├── Escaneia QR do comerciante
│   ├── App decodifica URI:
│   │   ├── Token: PSPAY
│   │   ├── Destinatário: 0x... (comerciante)
│   │   ├── Valor: 100 PSPAY
│   │   └── Rede: BSC (56)
│   ├── Confirma transação
│   ├── MetaMask abre para assinatura
│   ├── Cliente assina transação
│   └── ✅ Transação enviada
│
├── 4️⃣ PROCESSAMENTO BLOCKCHAIN
│   ├── Transação enviada para BSC
│   ├── Mineração do bloco
│   ├── Confirmação na rede
│   └── ✅ Sucesso
│
└── 5️⃣ CONFIRMAÇÃO E ATUALIZAÇÃO
    ├── Cliente: Histórico atualizado
    ├── Comerciante: Analytics atualizados
    ├── Notificações de sucesso
    └── 🎉 PAGAMENTO CONCLUÍDO
```

---

### 2. 🏪 FLUXO DE CADASTRO DE COMERCIANTE

```
INÍCIO: Novo comerciante
│
├── 1️⃣ REGISTRO INICIAL
│   ├── Acessa /welcome
│   ├── Clica "Sou Comerciante"
│   ├── Preenche formulário:
│   │   ├── Nome: "João Silva"
│   │   ├── Email: "joao@loja.com"
│   │   ├── Telefone: "(11) 99999-9999"
│   │   ├── Senha: "senha123"
│   │   └── Tipo: "merchant"
│   ├── Backend valida dados
│   ├── Gera hash da senha
│   ├── Cria registro no MongoDB
│   ├── Gera JWT token
│   └── ✅ Conta criada
│
├── 2️⃣ COMPLETAR PERFIL
│   ├── Redireciona para /profile
│   ├── Seção "Informações do Negócio":
│   │   ├── Nome da empresa: "Café da Esquina"
│   │   ├── Descrição: "Café artesanal..."
│   │   ├── Categoria: "restaurant"
│   │   └── Upload de banner
│   ├── Seção "Endereço da Loja":
│   │   ├── Rua: "Rua das Flores"
│   │   ├── Número: "123"
│   │   ├── Cidade: "São Paulo"
│   │   ├── Estado: "SP"
│   │   └── CEP: "01234-567"
│   └── ✅ Perfil completo
│
├── 3️⃣ CONFIGURAR LOJA NO MAPA
│   ├── Dashboard → Tab "Loja"
│   ├── Cadastra informações:
│   │   ├── Horário de funcionamento
│   │   ├── Telefone da loja
│   │   ├── Categoria específica
│   │   └── Status: ativo
│   ├── Backend salva no MongoDB
│   └── ✅ Loja aparece no mapa
│
├── 4️⃣ ADICIONAR PRODUTOS
│   ├── Dashboard → Tab "Produtos"
│   ├── Clica "Adicionar Produto"
│   ├── Para cada produto:
│   │   ├── Nome: "Café Expresso"
│   │   ├── Descrição: "Café premium..."
│   │   ├── Preço: R$ 8,50
│   │   ├── Categoria: "bebidas"
│   │   └── Imagem (opcional)
│   └── ✅ Catálogo criado
│
└── 5️⃣ CONECTAR CARTEIRA E COMEÇAR
    ├── Dashboard → Conectar carteira
    ├── MetaMask autoriza conexão
    ├── Verifica rede BSC
    ├── Interface de recebimento ativa
    └── 🎉 COMERCIANTE OPERACIONAL
```

---

### 3. 🔍 FLUXO DE DESCOBERTA DE LOJAS (Cliente)

```
INÍCIO: Cliente procura lojas
│
├── 1️⃣ ACESSO AO MAPA
│   ├── Cliente logado no dashboard
│   ├── Clica tab "Lojas"
│   ├── Sistema carrega lojas ativas
│   └── ✅ Mapa exibido
│
├── 2️⃣ FILTROS E BUSCA
│   ├── Opções disponíveis:
│   │   ├── Busca por nome: "café"
│   │   ├── Filtro categoria: "restaurant"
│   │   ├── Ordenação por distância
│   │   └── Status: apenas ativos
│   ├── Sistema aplica filtros
│   └── ✅ Resultados filtrados
│
├── 3️⃣ VISUALIZAÇÃO DETALHADA
│   ├── Cliente clica em loja
│   ├── Modal/card expandido mostra:
│   │   ├── 📛 Nome: "Café da Esquina"
│   │   ├── 📝 Descrição completa
│   │   ├── 📍 Endereço: "Rua das Flores, 123"
│   │   ├── 📞 Telefone: "(11) 99999-9999"
│   │   ├── 🕒 Horários por dia da semana
│   │   ├── 🏷️ Categoria: "Restaurante"
│   │   ├── ⭐ Avaliação (se houver)
│   │   └── 📏 Distância: "0.8 km"
│   └── ✅ Informações completas
│
├── 4️⃣ AÇÕES DISPONÍVEIS
│   ├── 🧭 "Como chegar":
│   │   ├── Abre Google Maps
│   │   ├── Destino pré-configurado
│   │   └── Navegação ativa
│   ├── 📞 "Ligar":
│   │   ├── Abre app de telefone
│   │   └── Número pré-discado
│   └── ✅ Ações executadas
│
└── 5️⃣ VISITA E PAGAMENTO
    ├── Cliente vai até a loja
    ├── Escolhe produtos/serviços
    ├── Comerciante gera QR
    ├── Cliente paga via app
    └── 🎉 TRANSAÇÃO CONCLUÍDA
```

---

## ⚙️ INTEGRAÇÕES TÉCNICAS DETALHADAS

### 🌐 APIs Externas Utilizadas

#### 1. OpenExchangeRates (Conversão BRL/USD)
```javascript
ENDPOINT: https://openexchangerates.org/api/latest.json
PARÂMETROS: ?app_id=b72524c6a1204affb3aac6c0c657aca5
RESPOSTA: { "rates": { "BRL": 5.123 } }
USO: Converter valores em Reais para Dólares
EXEMPLO: R$ 50,00 ÷ 5.123 = $9.76 USD
```

#### 2. CoinBrain (Preços dos Tokens)
```javascript
ENDPOINT: https://api.coinbrain.com/public/coin-info
MÉTODO: POST
BODY: { "56": ["0x275fE1709Dc07112BcAf56A3465ECE683c5Fb04c"] }
RESPOSTA: [{ "priceUsd": 0.156 }]
USO: Obter preço atual dos tokens em USD
EXEMPLO: $9.76 ÷ $0.156 = 62.56 PSPAY
```

### 🔗 Contratos Inteligentes

#### PSPAY Token
```solidity
Função: balanceOf(address)
Retorna: uint256 (saldo em Wei)
Conversão: balance ÷ 10^18 = saldo legível

Função: transfer(address to, uint256 amount)  
Parâmetros: destinatário, valor em Wei
Retorna: bool (sucesso/falha)
```

#### USDT Token  
```solidity
Função: balanceOf(address)
Retorna: uint256 (saldo em Wei)
Conversão: balance ÷ 10^18 = saldo legível

Função: transfer(address to, uint256 amount)
Parâmetros: destinatário, valor em Wei  
Retorna: bool (sucesso/falha)
```

### 📱 Geração de QR Code (Padrão EIP-681)

```
FORMATO: ethereum:{contract}@{chainId}/{function}?{params}

EXEMPLO REAL:
ethereum:0x275fE1709Dc07112BcAf56A3465ECE683c5Fb04c@56/transfer?address=0x742d35Cc6634C0532925a3b8D9db3ac3&uint256=62560000000000000000

COMPONENTES:
├── Protocol: ethereum:
├── Contract: 0x275fE...4c (PSPAY)  
├── ChainId: @56 (BSC)
├── Function: /transfer
├── Recipient: address=0x742d...
└── Amount: uint256=62560000000000000000 (62.56 PSPAY em Wei)
```

---

## 🎯 MÉTRICAS E ANALYTICS

### 📊 Dashboard do Comerciante

#### Dados Calculados em Tempo Real:
```python
# Receita Total
SELECT SUM(amount) FROM transactions 
WHERE to_user_id = merchant_id AND status = 'completed'

# Número de Transações  
SELECT COUNT(*) FROM transactions
WHERE to_user_id = merchant_id AND status = 'completed'

# Ticket Médio
SELECT AVG(amount) FROM transactions
WHERE to_user_id = merchant_id AND status = 'completed'

# Clientes Únicos
SELECT COUNT(DISTINCT from_user_id) FROM transactions
WHERE to_user_id = merchant_id AND status = 'completed'
```

#### Gráficos Implementados:
1. **Vendas Mensais** (BarChart): Volume por mês
2. **Distribuição por Token** (PieChart): % PSPAY vs USDT  
3. **Timeline** (Lista): Transações recentes
4. **Comparativo** (Percentuais): Crescimento vs período anterior

---

Esta documentação funcional detalha todos os fluxos, integrações e componentes da plataforma PayCoin, servindo como guia completo para desenvolvedores e usuários.