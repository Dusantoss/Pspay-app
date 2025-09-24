import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  ArrowLeft, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Smartphone, 
  Eye, 
  EyeOff,
  Save,
  Check,
  X,
  Moon,
  Sun,
  Volume2,
  VolumeX
} from 'lucide-react';
import { toast } from 'sonner';

const SettingsPage = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    // Notificações
    emailNotifications: true,
    pushNotifications: true,
    transactionAlerts: true,
    marketingEmails: false,
    
    // Privacidade e Segurança  
    twoFactorAuth: false,
    biometricAuth: false,
    autoLogout: 30, // minutos
    hideBalances: false,
    
    // Aparência
    darkMode: false,
    language: 'pt-BR',
    currency: 'BRL',
    soundEffects: true,
    
    // Avançado
    developerMode: false,
    analyticsSharing: true,
    crashReporting: true,
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    // Carregar configurações do localStorage
    const savedSettings = localStorage.getItem('paycoins_settings');
    if (savedSettings) {
      setSettings({ ...settings, ...JSON.parse(savedSettings) });
    }
  };

  const saveSettings = async () => {
    setIsLoading(true);
    try {
      // Salvar no localStorage
      localStorage.setItem('paycoin_settings', JSON.stringify(settings));
      
      // Em uma aplicação real, enviaria para o backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar configurações');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingChange = (category, setting, value) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const resetToDefaults = () => {
    if (window.confirm('Tem certeza que deseja restaurar as configurações padrão?')) {
      setSettings({
        emailNotifications: true,
        pushNotifications: true,
        transactionAlerts: true,
        marketingEmails: false,
        twoFactorAuth: false,
        biometricAuth: false,
        autoLogout: 30,
        hideBalances: false,
        darkMode: false,
        language: 'pt-BR',
        currency: 'BRL',
        soundEffects: true,
        developerMode: false,
        analyticsSharing: true,
        crashReporting: true,
      });
      toast.success('Configurações restauradas para padrão');
    }
  };

  const SettingToggle = ({ label, description, checked, onChange, icon: Icon }) => (
    <div className="flex items-center justify-between py-4 border-b border-slate-200 last:border-b-0">
      <div className="flex items-start">
        {Icon && <Icon className="w-5 h-5 text-slate-500 mt-0.5 mr-3 flex-shrink-0" />}
        <div>
          <h4 className="font-medium text-slate-900">{label}</h4>
          {description && <p className="text-sm text-slate-600 mt-1">{description}</p>}
        </div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-orange-600' : 'bg-slate-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  const SettingSelect = ({ label, description, value, onChange, options, icon: Icon }) => (
    <div className="flex items-center justify-between py-4 border-b border-slate-200 last:border-b-0">
      <div className="flex items-start">
        {Icon && <Icon className="w-5 h-5 text-slate-500 mt-0.5 mr-3 flex-shrink-0" />}
        <div>
          <h4 className="font-medium text-slate-900">{label}</h4>
          {description && <p className="text-sm text-slate-600 mt-1">{description}</p>}
        </div>
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <Link 
                to="/"
                className="flex items-center text-slate-600 hover:text-slate-900 transition-colors mr-4"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Voltar
              </Link>
              <h1 className="text-2xl font-bold text-slate-900">Configurações</h1>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={resetToDefaults}
                className="px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                Restaurar Padrão
              </button>
              <button
                onClick={saveSettings}
                disabled={isLoading}
                className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-500 transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Notificações */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <Bell className="w-5 h-5 mr-2 text-orange-600" />
              Notificações
            </h2>
            
            <div className="space-y-1">
              <SettingToggle
                label="Notificações por Email"
                description="Receber atualizações importantes por email"
                checked={settings.emailNotifications}
                onChange={(value) => handleSettingChange('notifications', 'emailNotifications', value)}
              />
              
              <SettingToggle
                label="Notificações Push"
                description="Alertas no navegador e dispositivo móvel"
                checked={settings.pushNotifications}
                onChange={(value) => handleSettingChange('notifications', 'pushNotifications', value)}
              />
              
              <SettingToggle
                label="Alertas de Transação"
                description="Notificar sobre pagamentos e recebimentos"
                checked={settings.transactionAlerts}
                onChange={(value) => handleSettingChange('notifications', 'transactionAlerts', value)}
              />
              
              <SettingToggle
                label="Emails de Marketing"
                description="Novidades e promoções da plataforma"
                checked={settings.marketingEmails}
                onChange={(value) => handleSettingChange('notifications', 'marketingEmails', value)}
              />
            </div>
          </div>

          {/* Privacidade e Segurança */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-orange-600" />
              Segurança
            </h2>
            
            <div className="space-y-1">
              <SettingToggle
                label="Autenticação 2FA"
                description="Segurança adicional com código SMS"
                checked={settings.twoFactorAuth}
                onChange={(value) => handleSettingChange('security', 'twoFactorAuth', value)}
              />
              
              <SettingToggle
                label="Biometria"
                description="Login com impressão digital ou Face ID"
                checked={settings.biometricAuth}
                onChange={(value) => handleSettingChange('security', 'biometricAuth', value)}
              />
              
              <SettingSelect
                label="Logout Automático"
                description="Desconectar após inatividade"
                value={settings.autoLogout}
                onChange={(value) => handleSettingChange('security', 'autoLogout', parseInt(value))}
                options={[
                  { value: 15, label: '15 minutos' },
                  { value: 30, label: '30 minutos' },
                  { value: 60, label: '1 hora' },
                  { value: 0, label: 'Nunca' }
                ]}
              />
              
              <SettingToggle
                label="Ocultar Saldos"
                icon={settings.hideBalances ? EyeOff : Eye}
                description="Mostrar ••••• ao invés dos valores"
                checked={settings.hideBalances}
                onChange={(value) => handleSettingChange('security', 'hideBalances', value)}
              />
            </div>
          </div>

          {/* Aparência */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <Palette className="w-5 h-5 mr-2 text-orange-600" />
              Aparência
            </h2>
            
            <div className="space-y-1">
              <SettingToggle
                label="Modo Escuro"
                icon={settings.darkMode ? Moon : Sun}
                description="Interface com tema escuro"
                checked={settings.darkMode}
                onChange={(value) => handleSettingChange('appearance', 'darkMode', value)}
              />
              
              <SettingSelect
                label="Idioma"
                icon={Globe}
                description="Idioma da interface"
                value={settings.language}
                onChange={(value) => handleSettingChange('appearance', 'language', value)}
                options={[
                  { value: 'pt-BR', label: 'Português (BR)' },
                  { value: 'en-US', label: 'English (US)' },
                  { value: 'es-ES', label: 'Español' }
                ]}
              />
              
              <SettingSelect
                label="Moeda"
                description="Moeda para conversões"
                value={settings.currency}
                onChange={(value) => handleSettingChange('appearance', 'currency', value)}
                options={[
                  { value: 'BRL', label: 'Real (BRL)' },
                  { value: 'USD', label: 'Dólar (USD)' },
                  { value: 'EUR', label: 'Euro (EUR)' }
                ]}
              />
              
              <SettingToggle
                label="Efeitos Sonoros"
                icon={settings.soundEffects ? Volume2 : VolumeX}
                description="Sons de notificações e ações"
                checked={settings.soundEffects}
                onChange={(value) => handleSettingChange('appearance', 'soundEffects', value)}
              />
            </div>
          </div>
        </div>

        {/* Configurações Avançadas */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
            <Smartphone className="w-5 h-5 mr-2 text-orange-600" />
            Configurações Avançadas
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <SettingToggle
                label="Modo Desenvolvedor"
                description="Mostrar informações técnicas e logs"
                checked={settings.developerMode}
                onChange={(value) => handleSettingChange('advanced', 'developerMode', value)}
              />
              
              <SettingToggle
                label="Compartilhar Analytics"
                description="Ajudar a melhorar a plataforma"
                checked={settings.analyticsSharing}
                onChange={(value) => handleSettingChange('advanced', 'analyticsSharing', value)}
              />
            </div>
            
            <div className="space-y-1">
              <SettingToggle
                label="Relatórios de Erro"
                description="Enviar relatórios de crash automaticamente"
                checked={settings.crashReporting}
                onChange={(value) => handleSettingChange('advanced', 'crashReporting', value)}
              />
            </div>
          </div>
        </div>

        {/* Informações da Conta */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Informações da Conta
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <p className="text-slate-600">Tipo de Conta:</p>
              <p className="font-medium text-slate-900 capitalize">
                {user?.user_type === 'client' ? 'Cliente' : 'Comerciante'}
              </p>
            </div>
            
            <div>
              <p className="text-slate-600">Membro desde:</p>
              <p className="font-medium text-slate-900">
                {new Date(user?.created_at || Date.now()).toLocaleDateString('pt-BR')}
              </p>
            </div>
            
            <div>
              <p className="text-slate-600">Email:</p>
              <p className="font-medium text-slate-900">{user?.email}</p>
            </div>
            
            <div>
              <p className="text-slate-600">Status:</p>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <Check className="w-3 h-3 mr-1" />
                Ativo
              </span>
            </div>
          </div>
        </div>

        {/* Zona de Perigo */}
        <div className="mt-8 bg-red-50 border border-red-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-red-900 mb-4 flex items-center">
            <X className="w-5 h-5 mr-2" />
            Zona de Perigo
          </h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-red-900">Excluir Conta</h3>
              <p className="text-sm text-red-700 mt-1">
                Esta ação é irreversível. Todos os seus dados serão permanentemente removidos.
              </p>
              <button className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm">
                Excluir Minha Conta
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;