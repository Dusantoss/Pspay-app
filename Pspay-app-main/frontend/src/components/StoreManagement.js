import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Store, Edit, MapPin, Phone, Clock, Eye, EyeOff, X } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const StoreManagement = () => {
  const { user } = useAuth();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStore, setEditingStore] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    phone: '',
    address: {
      street: '',
      number: '',
      city: '',
      state: '',
      zip_code: '',
      country: 'Brasil'
    },
    business_hours: {
      'Segunda': '',
      'Terça': '',
      'Quarta': '',
      'Quinta': '',
      'Sexta': '',
      'Sábado': '',
      'Domingo': ''
    },
    is_active: true
  });

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const response = await axios.get('/my-stores');
      setStores(response.data);
    } catch (error) {
      console.error('Error fetching stores:', error);
      // Mock data for demonstration
      setStores([
        {
          id: '1',
          name: user?.profile?.business_name || 'Minha Loja',
          description: user?.profile?.business_description || 'Descrição da loja',
          category: user?.profile?.business_category || 'retail',
          phone: user?.profile?.phone || '',
          address: user?.profile?.address || {
            street: '',
            number: '',
            city: '',
            state: '',
            zip_code: '',
            country: 'Brasil'
          },
          business_hours: {
            'Segunda': '09:00-18:00',
            'Terça': '09:00-18:00',
            'Quarta': '09:00-18:00',
            'Quinta': '09:00-18:00',
            'Sexta': '09:00-18:00',
            'Sábado': '09:00-15:00',
            'Domingo': 'Fechado'
          },
          is_active: true,
          created_at: '2024-01-15T10:00:00Z'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingStore) {
        // Update store
        await axios.put(`/stores/${editingStore.id}`, formData);
        toast.success('Loja atualizada com sucesso!');
      } else {
        // Create store
        await axios.post('/stores', formData);
        toast.success('Loja criada com sucesso!');
      }
      
      fetchStores();
      resetForm();
    } catch (error) {
      console.error('Error saving store:', error);
      toast.error('Erro ao salvar loja');
    }
  };

  const toggleStoreStatus = async (storeId, currentStatus) => {
    try {
      await axios.patch(`/stores/${storeId}`, {
        is_active: !currentStatus
      });
      
      setStores(stores.map(store => 
        store.id === storeId 
          ? { ...store, is_active: !currentStatus }
          : store
      ));
      
      toast.success('Status da loja atualizado!');
    } catch (error) {
      console.error('Error updating store status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      phone: '',
      address: {
        street: '',
        number: '',
        city: '',
        state: '',
        zip_code: '',
        country: 'Brasil'
      },
      business_hours: {
        'Segunda': '',
        'Terça': '',
        'Quarta': '',
        'Quinta': '',
        'Sexta': '',
        'Sábado': '',
        'Domingo': ''
      },
      is_active: true
    });
    setEditingStore(null);
    setShowAddModal(false);
  };

  const startEdit = (store) => {
    setFormData({
      name: store.name,
      description: store.description,
      category: store.category,
      phone: store.phone,
      address: store.address,
      business_hours: store.business_hours || {
        'Segunda': '',
        'Terça': '',
        'Quarta': '',
        'Quinta': '',
        'Sexta': '',
        'Sábado': '',
        'Domingo': ''
      },
      is_active: store.is_active
    });
    setEditingStore(store);
    setShowAddModal(true);
  };

  const getCategoryName = (category) => {
    const categories = {
      restaurant: 'Restaurante',
      retail: 'Varejo',
      services: 'Serviços',
      technology: 'Tecnologia',
      health: 'Saúde',
      education: 'Educação',
      other: 'Outros'
    };
    return categories[category] || 'Outros';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-slate-100 rounded-lg p-6 animate-pulse">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="w-48 h-6 bg-slate-200 rounded mb-3"></div>
                <div className="w-full h-4 bg-slate-200 rounded mb-2"></div>
                <div className="w-3/4 h-4 bg-slate-200 rounded"></div>
              </div>
              <div className="w-20 h-8 bg-slate-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Gerenciar Lojas</h3>
          <p className="text-sm text-slate-600">
            Configure as informações das suas lojas físicas para aparecer no mapa
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-500 transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Loja
        </button>
      </div>

      {/* Stores List */}
      {stores.length === 0 ? (
        <div className="text-center py-12">
          <Store className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Nenhuma loja cadastrada</h3>
          <p className="text-slate-600 mb-6">
            Cadastre suas lojas físicas para que os clientes possam encontrá-las no mapa
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-500 transition-colors"
          >
            Cadastrar Primeira Loja
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {stores.map((store) => (
            <div key={store.id} className="bg-white border border-slate-200 rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-xl font-semibold text-slate-900">{store.name}</h4>
                    <span className={`inline-block w-3 h-3 rounded-full ${
                      store.is_active ? 'bg-green-500' : 'bg-red-500'
                    }`} title={store.is_active ? 'Ativo' : 'Inativo'}></span>
                  </div>
                  
                  {store.description && (
                    <p className="text-slate-600 mb-3">{store.description}</p>
                  )}
                  
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex items-center text-slate-600">
                        <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>
                          {store.address.street && store.address.number ? (
                            `${store.address.street}, ${store.address.number} - ${store.address.city}, ${store.address.state}`
                          ) : (
                            'Endereço não informado'
                          )}
                        </span>
                      </div>
                      
                      {store.phone && (
                        <div className="flex items-center text-slate-600">
                          <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span>{store.phone}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center text-slate-600">
                        <Store className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>{getCategoryName(store.category)}</span>
                      </div>
                    </div>
                    
                    {store.business_hours && (
                      <div>
                        <div className="flex items-center text-slate-900 font-medium mb-2">
                          <Clock className="w-4 h-4 mr-2" />
                          <span>Horário de Funcionamento</span>
                        </div>
                        <div className="space-y-1 text-xs">
                          {Object.entries(store.business_hours).slice(0, 3).map(([day, hours]) => (
                            <div key={day} className="flex justify-between">
                              <span className="text-slate-600">{day}:</span>
                              <span className="text-slate-900">{hours || 'Não informado'}</span>
                            </div>
                          ))}
                          {Object.keys(store.business_hours).length > 3 && (
                            <div className="text-slate-500">...</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => toggleStoreStatus(store.id, store.is_active)}
                    className={`p-2 rounded-lg transition-colors ${
                      store.is_active
                        ? 'text-green-600 hover:bg-green-50'
                        : 'text-red-600 hover:bg-red-50'
                    }`}
                    title={store.is_active ? 'Desativar loja' : 'Ativar loja'}
                  >
                    {store.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  
                  <button
                    onClick={() => startEdit(store)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar loja"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Store Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900">
                {editingStore ? 'Editar Loja' : 'Adicionar Loja'}
              </h2>
              <button
                onClick={resetForm}
                className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-medium text-slate-900 mb-4">Informações Básicas</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Nome da Loja
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Ex: Café da Esquina"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Categoria
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
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
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Descreva sua loja..."
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <h3 className="text-lg font-medium text-slate-900 mb-4">Endereço</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Rua
                    </label>
                    <input
                      type="text"
                      value={formData.address.street}
                      onChange={(e) => setFormData({
                        ...formData,
                        address: { ...formData.address, street: e.target.value }
                      })}
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Nome da rua"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Número
                    </label>
                    <input
                      type="text"
                      value={formData.address.number}
                      onChange={(e) => setFormData({
                        ...formData,
                        address: { ...formData.address, number: e.target.value }
                      })}
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="123"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Cidade
                    </label>
                    <input
                      type="text"
                      value={formData.address.city}
                      onChange={(e) => setFormData({
                        ...formData,
                        address: { ...formData.address, city: e.target.value }
                      })}
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="São Paulo"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Estado
                    </label>
                    <input
                      type="text"
                      value={formData.address.state}
                      onChange={(e) => setFormData({
                        ...formData,
                        address: { ...formData.address, state: e.target.value }
                      })}
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="SP"
                    />
                  </div>
                </div>
              </div>

              {/* Business Hours */}
              <div>
                <h3 className="text-lg font-medium text-slate-900 mb-4">Horário de Funcionamento</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {Object.entries(formData.business_hours).map(([day, hours]) => (
                    <div key={day}>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        {day}
                      </label>
                      <input
                        type="text"
                        value={hours}
                        onChange={(e) => setFormData({
                          ...formData,
                          business_hours: {
                            ...formData.business_hours,
                            [day]: e.target.value
                          }
                        })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="09:00-18:00 ou Fechado"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-slate-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-slate-900">
                  Loja ativa (aparece no mapa)
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-500 transition-colors"
                >
                  {editingStore ? 'Atualizar' : 'Criar'} Loja
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreManagement;