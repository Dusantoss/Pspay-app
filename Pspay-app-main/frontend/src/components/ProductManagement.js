import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Package, Edit, Trash2, Eye, EyeOff, Search, Filter, X } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const ProductManagement = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    currency: 'BRL',
    category: '',
    image: '',
    is_active: true
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/my-products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      // Mock data for demonstration
      setProducts([
        {
          id: '1',
          name: 'Café Expresso',
          description: 'Café expresso premium com grãos selecionados',
          price: 8.50,
          currency: 'BRL',
          category: 'bebidas',
          image: null,
          is_active: true,
          created_at: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          name: 'Sanduíche Natural',
          description: 'Sanduíche com ingredientes frescos e naturais',
          price: 15.00,
          currency: 'BRL',
          category: 'comidas',
          image: null,
          is_active: true,
          created_at: '2024-01-14T14:30:00Z'
        },
        {
          id: '3',
          name: 'Açaí Bowl',
          description: 'Açaí com frutas frescas e granola',
          price: 12.90,
          currency: 'BRL',
          category: 'sobremesas',
          image: null,
          is_active: false,
          created_at: '2024-01-13T09:15:00Z'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingProduct) {
        // Update product
        await axios.put(`/products/${editingProduct.id}`, formData);
        toast.success('Produto atualizado com sucesso!');
      } else {
        // Create product
        await axios.post('/products', formData);
        toast.success('Produto criado com sucesso!');
      }
      
      fetchProducts();
      resetForm();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Erro ao salvar produto');
    }
  };

  const toggleProductStatus = async (productId, currentStatus) => {
    try {
      await axios.patch(`/products/${productId}`, {
        is_active: !currentStatus
      });
      
      setProducts(products.map(product => 
        product.id === productId 
          ? { ...product, is_active: !currentStatus }
          : product
      ));
      
      toast.success('Status do produto atualizado!');
    } catch (error) {
      console.error('Error updating product status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const deleteProduct = async (productId) => {
    if (!window.confirm('Tem certeza que deseja excluir este produto?')) {
      return;
    }
    
    try {
      await axios.delete(`/products/${productId}`);
      setProducts(products.filter(product => product.id !== productId));
      toast.success('Produto excluído com sucesso!');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Erro ao excluir produto');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      currency: 'BRL',
      category: '',
      image: '',
      is_active: true
    });
    setEditingProduct(null);
    setShowAddModal(false);
  };

  const startEdit = (product) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      currency: product.currency,
      category: product.category,
      image: product.image || '',
      is_active: product.is_active
    });
    setEditingProduct(product);
    setShowAddModal(true);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-slate-100 rounded-lg p-4 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-16 h-16 bg-slate-200 rounded-lg mr-4"></div>
                <div>
                  <div className="w-32 h-4 bg-slate-200 rounded mb-2"></div>
                  <div className="w-48 h-3 bg-slate-200 rounded"></div>
                </div>
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
          <h3 className="text-lg font-semibold text-slate-900">Gerenciar Produtos</h3>
          <p className="text-sm text-slate-600">
            Adicione e gerencie os produtos do seu negócio
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-500 transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Produto
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
        
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        >
          <option value="all">Todas as categorias</option>
          <option value="bebidas">Bebidas</option>
          <option value="comidas">Comidas</option>
          <option value="sobremesas">Sobremesas</option>
          <option value="outros">Outros</option>
        </select>
      </div>

      {/* Products List */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            {searchTerm || filterCategory !== 'all' ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
          </h3>
          <p className="text-slate-600 mb-6">
            {searchTerm || filterCategory !== 'all' 
              ? 'Tente ajustar os filtros de busca'
              : 'Comece criando seu primeiro produto'
            }
          </p>
          {!searchTerm && filterCategory === 'all' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-500 transition-colors"
            >
              Adicionar Primeiro Produto
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center mr-4">
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <Package className="w-8 h-8 text-slate-400" />
                    )}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-slate-900">{product.name}</h4>
                      <span className={`inline-block w-2 h-2 rounded-full ${
                        product.is_active ? 'bg-green-500' : 'bg-red-500'
                      }`}></span>
                    </div>
                    <p className="text-sm text-slate-600 mb-1">{product.description}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="font-semibold text-slate-900">
                        R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      {product.category && (
                        <span className="text-slate-500 capitalize">{product.category}</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleProductStatus(product.id, product.is_active)}
                    className={`p-2 rounded-lg transition-colors ${
                      product.is_active
                        ? 'text-green-600 hover:bg-green-50'
                        : 'text-red-600 hover:bg-red-50'
                    }`}
                    title={product.is_active ? 'Desativar produto' : 'Ativar produto'}
                  >
                    {product.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  
                  <button
                    onClick={() => startEdit(product)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar produto"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => deleteProduct(product.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Excluir produto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900">
                {editingProduct ? 'Editar Produto' : 'Adicionar Produto'}
              </h2>
              <button
                onClick={resetForm}
                className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nome do Produto
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Ex: Café Expresso"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Descreva seu produto..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Preço
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Categoria
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="">Selecione</option>
                    <option value="bebidas">Bebidas</option>
                    <option value="comidas">Comidas</option>
                    <option value="sobremesas">Sobremesas</option>
                    <option value="outros">Outros</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  URL da Imagem (opcional)
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="https://exemplo.com/imagem.jpg"
                />
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
                  Produto ativo
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
                  {editingProduct ? 'Atualizar' : 'Criar'} Produto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;