import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { MapPin, Phone, Clock, Star, Navigation, Search } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUiIGhlaWdodD0iNDEiIHZpZXdCb3g9IjAgMCAyNSA0MSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyLjUgMEMxOS40MDM2IDAgMjUgNS41OTY0NCAyNSAxMi41QzI1IDE5LjQwMzYgMTkuNDAzNiAyNSAxMi41IDI1QzUuNTk2NDQgMjUgMCAxOS40MDM2IDAgMTIuNUMwIDUuNTk2NDQgNS41OTY0NCAwIDEyLjUgMFoiIGZpbGw9IiNGOTczMTYiLz4KPGV0ciBjeD0iMTIuNSIgY3k9IjEyLjUiIHI9IjUiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xMi41IDI1TDEyLjUgNDEiIHN0cm9rZT0iI0Y5NzMxNiIgc3Ryb2tlLXdpZHRoPSIyIi8+Cjwvc3ZnPgo=',
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUiIGhlaWdodD0iNDEiIHZpZXdCb3g9IjAgMCAyNSA0MSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyLjUgMEMxOS40MDM2IDAgMjUgNS41OTY0NCAyNSAxMi41QzI1IDE5LjQwMzYgMTkuNDAzNiAyNSAxMi41IDI1QzUuNTk2NDQgMjUgMCAxOS40MDM2IDAgMTIuNUMwIDUuNTk2NDQgNS41OTY0NCAwIDEyLjUgMFoiIGZpbGw9IiNGOTczMTYiLz4KPGV0ciBjeD0iMTIuNSIgY3k9IjEyLjUiIHI9IjUiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xMi41IDI1TDEyLjUgNDEiIHN0cm9rZT0iI0Y5NzMxNiIgc3Ryb2tlLXdpZHRoPSIyIi8+Cjwvc3ZnPgo=',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const StoreMap = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState([-23.5630994, -46.6532825]); // São Paulo default

  useEffect(() => {
    fetchStores();
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          setMapCenter([latitude, longitude]);
        },
        (error) => {
          console.error('Error getting user location:', error);
          toast.info('Não foi possível obter sua localização. Mostrando São Paulo.');
          // Define São Paulo como fallback
          setMapCenter([-23.5630994, -46.6532825]);
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      // Se geolocalização não estiver disponível, usar São Paulo
      setMapCenter([-23.5630994, -46.6532825]);
    }
  };

  const fetchStores = async () => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
      const response = await axios.get(`${backendUrl}/api/stores`);
      setStores(response.data);
    } catch (error) {
      console.error('Error fetching stores:', error);
      // Mock data for demonstration
      setStores([
        {
          id: '1',
          name: 'Café da Esquina',
          description: 'Café artesanal e lanches naturais',
          address: {
            street: 'Rua das Flores',
            number: '123',
            city: 'São Paulo',
            state: 'SP',
            latitude: -23.5630994,
            longitude: -46.6532825
          },
          category: 'restaurant',
          phone: '(11) 99999-1234',
          business_hours: {
            'Segunda': '07:00-18:00',
            'Terça': '07:00-18:00',
            'Quarta': '07:00-18:00',
            'Quinta': '07:00-18:00',
            'Sexta': '07:00-18:00',
            'Sábado': '08:00-16:00',
            'Domingo': 'Fechado'
          },
          rating: 4.5
        },
        {
          id: '2',
          name: 'Farmácia Saúde',
          description: 'Medicamentos e produtos de higiene',
          address: {
            street: 'Avenida Principal',
            number: '456',
            city: 'São Paulo',
            state: 'SP',
            latitude: -23.5640094,
            longitude: -46.6542825
          },
          category: 'health',
          phone: '(11) 99999-5678',
          business_hours: {
            'Segunda': '06:00-22:00',
            'Terça': '06:00-22:00',
            'Quarta': '06:00-22:00',
            'Quinta': '06:00-22:00',
            'Sexta': '06:00-22:00',
            'Sábado': '06:00-22:00',
            'Domingo': '08:00-20:00'
          },
          rating: 4.2
        },
        {
          id: '3',
          name: 'TechStore',
          description: 'Eletrônicos e acessórios',
          address: {
            street: 'Rua da Tecnologia',
            number: '789',
            city: 'São Paulo',
            state: 'SP',
            latitude: -23.5620894,
            longitude: -46.6552825
          },
          category: 'technology',
          phone: '(11) 99999-9012',
          business_hours: {
            'Segunda': '09:00-18:00',
            'Terça': '09:00-18:00',
            'Quarta': '09:00-18:00',
            'Quinta': '09:00-18:00',
            'Sexta': '09:00-18:00',
            'Sábado': '09:00-15:00',
            'Domingo': 'Fechado'
          },
          rating: 4.8
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'restaurant': return '🍽️';
      case 'health': return '🏥';
      case 'technology': return '💻';
      case 'retail': return '🛍️';
      case 'services': return '🔧';
      default: return '🏪';
    }
  };

  const getCategoryName = (category) => {
    switch (category) {
      case 'restaurant': return 'Restaurante';
      case 'health': return 'Saúde';
      case 'technology': return 'Tecnologia';
      case 'retail': return 'Varejo';
      case 'services': return 'Serviços';
      default: return 'Outros';
    }
  };

  const openDirections = (store) => {
    const { latitude, longitude } = store.address;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    window.open(url, '_blank');
  };

  const filteredStores = stores.filter(store => {
    const matchesSearch = store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         store.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || store.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="bg-slate-100 rounded-lg h-96 animate-pulse"></div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-slate-100 rounded-lg p-4 animate-pulse">
              <div className="w-full h-4 bg-slate-200 rounded mb-2"></div>
              <div className="w-3/4 h-3 bg-slate-200 rounded mb-2"></div>
              <div className="w-1/2 h-3 bg-slate-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar lojas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">Todas as categorias</option>
          <option value="restaurant">Restaurantes</option>
          <option value="health">Saúde</option>
          <option value="technology">Tecnologia</option>
          <option value="retail">Varejo</option>
          <option value="services">Serviços</option>
        </select>
      </div>

      {/* Interactive Map */}
      <div className="h-96 rounded-lg overflow-hidden border border-slate-200 shadow-sm">
        {mapCenter && mapCenter.length === 2 && typeof mapCenter[0] === 'number' && typeof mapCenter[1] === 'number' ? (
          <MapContainer
            center={mapCenter}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            className="rounded-lg"
            key={`${mapCenter[0]}-${mapCenter[1]}`} // Force re-render when center changes
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* User Location Marker */}
            {userLocation && userLocation.length === 2 && (
              <Marker position={userLocation}>
                <Popup>
                  <div className="text-center p-2">
                    <MapPin className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                    <p className="font-medium text-sm">Sua localização</p>
                  </div>
                </Popup>
              </Marker>
            )}
            
            {/* Store Markers */}
            {filteredStores.map((store) => (
              store.address && store.address.latitude && store.address.longitude && (
                <Marker
                  key={store.id}
                  position={[store.address.latitude, store.address.longitude]}
                  eventHandlers={{
                    click: () => setSelectedStore(store)
                  }}
                >
                  <Popup>
                    <div className="w-64 p-2">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-slate-900 text-sm">{store.name}</h3>
                        <span className="text-lg">{getCategoryIcon(store.category)}</span>
                      </div>
                      
                      <p className="text-xs text-slate-600 mb-2">{store.description}</p>
                      
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center text-slate-600">
                          <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                          <span>{store.address.street}, {store.address.number}</span>
                        </div>
                        
                        {store.phone && (
                          <div className="flex items-center text-slate-600">
                            <Phone className="w-3 h-3 mr-1 flex-shrink-0" />
                            <span>{store.phone}</span>
                          </div>
                        )}
                        
                        {store.rating && (
                          <div className="flex items-center text-slate-600">
                            <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                            <span>{store.rating}/5</span>
                          </div>
                        )}
                      </div>
                      
                      <button
                        onClick={() => openDirections(store)}
                        className="w-full mt-2 bg-gray-900 text-white py-1 px-2 rounded text-xs hover:bg-gray-800 transition-colors"
                      >
                        Como chegar
                      </button>
                    </div>
                  </Popup>
                </Marker>
              )
            ))}
          </MapContainer>
        ) : (
          <div className="flex items-center justify-center h-full bg-slate-100">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-600">Carregando mapa...</p>
            </div>
          </div>
        )}
      </div>

      {/* Store List */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Lojas Parceiras ({filteredStores.length})
        </h3>
        
        {filteredStores.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Nenhuma loja encontrada</h3>
            <p className="text-slate-600">
              Tente ajustar os filtros de busca ou categoria
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStores.map((store) => (
              <div
                key={store.id}
                className={`bg-white border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                  selectedStore?.id === store.id ? 'border-blue-900 shadow-md' : 'border-slate-200'
                }`}
                onClick={() => setSelectedStore(store)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-slate-900">{store.name}</h4>
                    <p className="text-sm text-slate-600">{getCategoryName(store.category)}</p>
                  </div>
                  <span className="text-2xl">{getCategoryIcon(store.category)}</span>
                </div>
                
                <p className="text-sm text-slate-600 mb-3">{store.description}</p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-slate-600">
                    <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>
                      {store.address.street}, {store.address.number} - {store.address.city}
                    </span>
                  </div>
                  
                  {store.phone && (
                    <div className="flex items-center text-slate-600">
                      <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>{store.phone}</span>
                    </div>
                  )}
                  
                  {store.rating && (
                    <div className="flex items-center text-slate-600">
                      <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
                      <span>{store.rating}/5</span>
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-2 mt-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openDirections(store);
                    }}
                    className="flex-1 bg-blue-900 text-white py-2 px-3 rounded text-sm hover:bg-blue-800 transition-colors"
                  >
                    Como chegar
                  </button>
                  
                  {store.phone && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`tel:${store.phone}`, '_self');
                      }}
                      className="px-3 py-2 border border-slate-300 rounded text-sm hover:bg-slate-50 transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Store Details */}
      {selectedStore && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">{selectedStore.name}</h3>
              <p className="text-slate-600">{selectedStore.description}</p>
            </div>
            <button
              onClick={() => setSelectedStore(null)}
              className="text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          </div>
          
          {selectedStore.business_hours && (
            <div className="mb-4">
              <h4 className="font-medium text-slate-900 mb-2 flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                Horário de Funcionamento
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(selectedStore.business_hours).map(([day, hours]) => (
                  <div key={day} className="flex justify-between">
                    <span className="text-slate-600">{day}:</span>
                    <span className="text-slate-900">{hours}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex space-x-3">
            <button
              onClick={() => openDirections(selectedStore)}
              className="bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors"
            >
              Como chegar
            </button>
            
            {selectedStore.phone && (
              <button
                onClick={() => window.open(`tel:${selectedStore.phone}`, '_self')}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-500 transition-colors"
              >
                Ligar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreMap;