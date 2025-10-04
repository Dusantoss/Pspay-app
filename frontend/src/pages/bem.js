import React from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, Store, Users, Shield, Zap, Globe } from 'lucide-react';

const WelcomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-900 to-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">P</span>
              </div>
              <h1 className="ml-3 text-2xl font-bold text-blue-900">Pspay App</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-slate-600 hover:text-blue-900 transition-colors">Recursos</a>
              <a href="#about" className="text-slate-600 hover:text-blue-900 transition-colors">Sobre</a>
              <a href="#contact" className="text-slate-600 hover:text-blue-900 transition-colors">Contato</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
            Sua plataforma de pagamento
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-900 to-orange-600">
              com criptomoedas
            </span>
          </h2>
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
            Revolucione seus pagamentos com PSPAY e USDT. Seja cliente ou comerciante, 
            oferecemos a melhor experiência em transações digitais seguras e rápidas.
          </p>
        </div>

        {/* User Type Selection */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {/* Client Card */}
          <Link 
            to="/register/client"
            className="group relative bg-white rounded-2xl p-8 shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/5 to-blue-700/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-900 to-blue-700 rounded-xl flex items-center justify-center mb-6">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Sou Cliente</h3>
              <p className="text-slate-600 mb-6">
                Faça pagamentos rápidos e seguros com criptomoedas. 
                Gerencie sua carteira digital e encontre lojas parceiras.
              </p>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-900 rounded-full mr-3"></div>
                  Carteira digital segura
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-900 rounded-full mr-3"></div>
                  Pagamentos via QR Code
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-900 rounded-full mr-3"></div>
                  Mapa de lojas parceiras
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-900 rounded-full mr-3"></div>
                  Histórico de transações
                </li>
              </ul>
              <button className="mt-6 w-full bg-gradient-to-r from-blue-900 to-blue-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-800 hover:to-blue-600 transition-all">
                Começar como Cliente
              </button>
            </div>
          </Link>

          {/* Merchant Card */}
          <Link 
            to="/register/merchant"
            className="group relative bg-white rounded-2xl p-8 shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-orange-600/5 to-orange-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-600 to-orange-500 rounded-xl flex items-center justify-center mb-6">
                <Store className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Sou Comerciante</h3>
              <p className="text-slate-600 mb-6">
                Aceite pagamentos em criptomoedas, gerencie seus produtos 
                e acompanhe suas vendas com relatórios detalhados.
              </p>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-orange-600 rounded-full mr-3"></div>
                  Receber pagamentos em crypto
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-orange-600 rounded-full mr-3"></div>
                  Gerenciar produtos/serviços
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-orange-600 rounded-full mr-3"></div>
                  Relatórios de vendas
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-orange-600 rounded-full mr-3"></div>
                  Perfil da loja no mapa
                </li>
              </ul>
              <button className="mt-6 w-full bg-gradient-to-r from-orange-600 to-orange-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-orange-500 hover:to-orange-400 transition-all">
                Começar como Comerciante
              </button>
            </div>
          </Link>
        </div>

        {/* Features Section */}
        <section id="features" className="mb-16">
          <h3 className="text-3xl font-bold text-center text-slate-900 mb-12">
            Por que escolher o PayCoin?
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-slate-900 mb-2">Segurança Total</h4>
              <p className="text-slate-600">
                Transações protegidas por blockchain com criptografia de ponta a ponta.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-slate-900 mb-2">Rapidez</h4>
              <p className="text-slate-600">
                Pagamentos instantâneos com confirmação em segundos na blockchain.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-slate-900 mb-2">Global</h4>
              <p className="text-slate-600">
                Aceite e faça pagamentos em qualquer lugar do mundo, 24/7.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center bg-gradient-to-r from-blue-900 to-blue-700 rounded-2xl p-12 text-white mb-16">
          <h3 className="text-3xl font-bold mb-4">Já tem uma conta?</h3>
          <p className="text-blue-100 mb-8 text-lg">
            Faça login e continue aproveitando os benefícios do PayCoin
          </p>
          <Link 
            to="/login"
            className="inline-block bg-white text-blue-900 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Fazer Login
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">P</span>
                </div>
                <h4 className="ml-2 text-xl font-bold">Pspay App</h4>
              </div>
              <p className="text-slate-400">
                A plataforma de pagamentos em criptomoedas mais confiável do Brasil.
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Produtos</h5>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Carteira Digital</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pagamentos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Para Comerciantes</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Suporte</h5>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Legal</h5>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacidade</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-slate-400">
            <p>&copy; 2021 PayCoin Solutions. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WelcomePage;