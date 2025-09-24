import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

const SettingsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Configurações</CardTitle>
          <CardDescription>Gerencie suas preferências</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600">Configurações em desenvolvimento...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;