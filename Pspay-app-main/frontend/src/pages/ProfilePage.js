import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ImageUpload from '../components/ImageUpload';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  FileText, 
  Camera, 
  Save, 
  ArrowLeft,
  Upload,
  Store,
  CreditCard
} from 'lucide-react';
import { toast } from 'sonner';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.profile?.phone || '',
    business_name: user?.profile?.business_name || '',
    business_description: user?.profile?.business_description || '',
    business_category: user?.profile?.business_category || '',
    address: {
      street: user?.profile?.address?.street || '',
      number: user?.profile?.address?.number || '',
      city: user?.profile?.address?.city || '',
      state: user?.profile?.address?.state || '',
      zip_code: user?.profile?.address?.zip_code || '',
      country: user?.profile?.address?.country || 'Brasil',
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData({
        ...formData,
        address: {
          ...formData.address,
          [addressField]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await updateProfile(formData);
      
      if (result.success) {
        toast.success('Perfil atualizado com sucesso!');
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Erro ao atualizar perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const isMerchant = user?.user_type === 'merchant';

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <Link 
                to="/"
                className="flex items-center text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Voltar ao Dashboard
              </Link>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-900 to-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="ml-2 text-xl font-bold text-blue-900">PayCoin</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            {isMerchant ? 'Perfil do Comerciante' : 'Perfil do Cliente'}
          </h1>
          <p className="text-slate-600 mt-2">
            Gerencie suas informações pessoais e preferências
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Picture Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Foto do Perfil
              </h2>
              
              <ImageUpload
                currentImage={user?.profile_image_url}
                onImageUpload={(imageUrl) => {
                  // Update user context/state if needed
                  toast.success('Foto de perfil atualizada!');
                }}
                type="profile"
                disabled={isLoading}
              />
              
              {isMerchant && (
                <div className="mt-8 pt-6 border-t border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    Banner da Loja
                  </h3>
                  
                  <ImageUpload
                    currentImage={user?.banner_image_url}
                    onImageUpload={(imageUrl) => {
                      toast.success('Banner atualizado!');
                    }}
                    type="banner"
                    disabled={isLoading}
                  />
                </div>
              )}
              
              {/* Account Type Badge */}
              <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center">
                  {isMerchant ? (
                    <Store className="w-5 h-5 text-orange-600 mr-2" />
                  ) : (
                    <CreditCard className="w-5 h-5 text-blue-900 mr-2" />
                  )}
                  <div>
                    <p className="font-medium text-slate-900">
                      {isMerchant ? 'Comerciante' : 'Cliente'}
                    </p>
                    <p className="text-sm text-slate-600">
                      {user?.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">
                  Informações Pessoais
                </h2>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                      Nome Completo
                    </label>
                    <div className="relative">
                      <User className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Seu nome completo"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">
                      Telefone
                    </label>
                    <div className="relative">
                      <Phone className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      id="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500"
                      placeholder="seu@email.com"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    O email não pode ser alterado
                  </p>
                </div>
              </div>

              {/* Business Information (for merchants only) */}
              {isMerchant && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">
                    Informações do Negócio
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="business_name" className="block text-sm font-medium text-slate-700 mb-2">
                        Nome da Empresa/Loja
                      </label>
                      <div className="relative">
                        <Building2 className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          id="business_name"
                          name="business_name"
                          value={formData.business_name}
                          onChange={handleChange}
                          className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Nome do seu negócio"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="business_category" className="block text-sm font-medium text-slate-700 mb-2">
                        Categoria do Negócio
                      </label>
                      <select
                        id="business_category"
                        name="business_category"
                        value={formData.business_category}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Selecione uma categoria</option>
                        <option value="restaurant">Restaurante</option>
                        <option value="retail">Varejo</option>
                        <option value="services">Serviços</option>
                        <option value="technology">Tecnologia</option>
                        <option value="health">Saúde</option>
                        <option value="education">Educação</option>
                        <option value="other">Outros</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="business_description" className="block text-sm font-medium text-slate-700 mb-2">
                        Descrição do Negócio
                      </label>
                      <div className="relative">
                        <FileText className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
                        <textarea
                          id="business_description"
                          name="business_description"
                          rows={3}
                          value={formData.business_description}
                          onChange={handleChange}
                          className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Descreva seu negócio..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Address Information */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">
                  {isMerchant ? 'Endereço da Loja' : 'Endereço'}
                </h2>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="address.street" className="block text-sm font-medium text-slate-700 mb-2">
                      Rua
                    </label>
                    <input
                      type="text"
                      id="address.street"
                      name="address.street"
                      value={formData.address.street}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nome da rua"
                    />
                  </div>

                  <div>
                    <label htmlFor="address.number" className="block text-sm font-medium text-slate-700 mb-2">
                      Número
                    </label>
                    <input
                      type="text"
                      id="address.number"
                      name="address.number"
                      value={formData.address.number}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="123"
                    />
                  </div>

                  <div>
                    <label htmlFor="address.city" className="block text-sm font-medium text-slate-700 mb-2">
                      Cidade
                    </label>
                    <input
                      type="text"
                      id="address.city"
                      name="address.city"
                      value={formData.address.city}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="São Paulo"
                    />
                  </div>

                  <div>
                    <label htmlFor="address.state" className="block text-sm font-medium text-slate-700 mb-2">
                      Estado
                    </label>
                    <input
                      type="text"
                      id="address.state"
                      name="address.state"
                      value={formData.address.state}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="SP"
                    />
                  </div>

                  <div>
                    <label htmlFor="address.zip_code" className="block text-sm font-medium text-slate-700 mb-2">
                      CEP
                    </label>
                    <input
                      type="text"
                      id="address.zip_code"
                      name="address.zip_code"
                      value={formData.address.zip_code}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="00000-000"
                    />
                  </div>

                  <div>
                    <label htmlFor="address.country" className="block text-sm font-medium text-slate-700 mb-2">
                      País
                    </label>
                    <input
                      type="text"
                      id="address.country"
                      name="address.country"
                      value={formData.address.country}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Brasil"
                    />
                  </div>
                </div>

                {isMerchant && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start">
                      <MapPin className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">
                          Endereço da Loja no Mapa
                        </p>
                        <p className="text-sm text-blue-700 mt-1">
                          Este endereço será exibido no mapa de lojas parceiras para que os clientes possam encontrar seu estabelecimento.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-900 to-blue-700 text-white rounded-lg font-medium hover:from-blue-800 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  ) : (
                    <Save className="w-5 h-5 mr-2" />
                  )}
                  {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;