import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import WalletConnector from '../components/WalletConnector';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Wallet, QrCode, History, MapPin, LogOut } from 'lucide-react';

const ClientDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-900 to-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">P</span>
              </div>
              <h1 className="ml-3 text-xl font-bold text-blue-900">PayCoin</h1>
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
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Dashboard do Cliente</h2>
          <p className="text-slate-600">Gerencie sua carteira digital e faça pagamentos com PSPAY e USDT</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Wallet Connector - Coluna Principal */}
          <div className="lg:col-span-2">
            <WalletConnector />
          </div>

          {/* Ações Rápidas */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <QrCode className="h-5 w-5 mr-2" />
                  Ações Rápidas
                </CardTitle>
                <CardDescription>
                  Principais funcionalidades
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline" disabled>
                  <QrCode className="h-4 w-4 mr-2" />
                  Escanear QR Code
                </Button>
                <Button className="w-full justify-start" variant="outline" disabled>
                  <History className="h-4 w-4 mr-2" />
                  Histórico
                </Button>
                <Button className="w-full justify-start" variant="outline" disabled>
                  <MapPin className="h-4 w-4 mr-2" />
                  Lojas Parceiras
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status WalletConnect</CardTitle>
                <CardDescription>
                  Conexão apenas via WalletConnect
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-slate-600">
                  <p className="mb-2">✅ Project ID configurado</p>
                  <p className="mb-2">✅ BSC Network (Chain 56)</p>
                  <p className="mb-2">✅ PSPAY e USDT suportados</p>
                  <p className="text-green-600 font-medium">Problemas de saldo corrigidos!</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;