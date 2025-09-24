import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import WalletConnector from '../components/WalletConnector';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Store, QrCode, BarChart, Package, LogOut } from 'lucide-react';

const MerchantDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-600 to-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">P</span>
              </div>
              <h1 className="ml-3 text-xl font-bold text-orange-600">PayCoin</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600">Olá, {user?.name}</span>
              <Button variant="ghost" onClick={logout} data-testid="logout-btn">
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Dashboard do Comerciante</h2>
          <p className="text-slate-600">Aceite pagamentos em PSPAY e USDT e gerencie seu negócio</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Wallet Connector - Coluna Principal */}
          <div className="lg:col-span-2">
            <WalletConnector />
          </div>

          {/* Ações do Comerciante */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Store className="h-5 w-5 mr-2" />
                  Gestão da Loja
                </CardTitle>
                <CardDescription>
                  Ferramentas para comerciantes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline" disabled>
                  <QrCode className="h-4 w-4 mr-2" />
                  Gerar QR Pagamento
                </Button>
                <Button className="w-full justify-start" variant="outline" disabled>
                  <Package className="h-4 w-4 mr-2" />
                  Produtos
                </Button>
                <Button className="w-full justify-start" variant="outline" disabled>
                  <BarChart className="h-4 w-4 mr-2" />
                  Relatórios
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recebimentos</CardTitle>
                <CardDescription>
                  Configure sua carteira para receber
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-slate-600">
                  <p className="mb-2">🔑 Conecte sua carteira</p>
                  <p className="mb-2">📋 Configure produtos</p>
                  <p className="mb-2">💰 Gere QR de pagamento</p>
                  <p className="text-orange-600 font-medium">Pronto para receber!</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MerchantDashboard;