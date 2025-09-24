import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Loader, Check } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const ImageUpload = ({ 
  currentImage, 
  onImageUpload, 
  type = 'profile', // 'profile' or 'banner'
  className = '',
  disabled = false 
}) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImage);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleImageUpload = async (file) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Formato de arquivo não suportado. Use JPEG, PNG ou WebP.');
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('Arquivo muito grande. Tamanho máximo: 5MB.');
      return;
    }

    setUploading(true);

    try {
      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);

      // Create form data for chunked upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
      const token = localStorage.getItem('token');

      // Upload to backend
      const response = await axios.post(
        `${backendUrl}/api/upload/image`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            console.log(`Upload progress: ${percentCompleted}%`);
          }
        }
      );

      if (response.data && response.data.image_url) {
        toast.success(
          type === 'profile' 
            ? 'Foto de perfil atualizada com sucesso!' 
            : 'Banner atualizado com sucesso!'
        );
        
        // Callback to parent component
        if (onImageUpload) {
          onImageUpload(response.data.image_url);
        }
        
        // Update preview with server URL
        setPreview(response.data.image_url);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erro ao fazer upload da imagem. Tente novamente.');
      
      // Reset preview on error
      setPreview(currentImage);
    } finally {
      setUploading(false);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = async () => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
      const token = localStorage.getItem('token');

      await axios.delete(`${backendUrl}/api/upload/image/${type}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setPreview(null);
      toast.success('Imagem removida com sucesso!');
      
      if (onImageUpload) {
        onImageUpload(null);
      }
    } catch (error) {
      console.error('Remove image error:', error);
      toast.error('Erro ao remover imagem.');
    }
  };

  const triggerFileSelect = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const renderProfileUpload = () => (
    <div className={`relative ${className}`}>
      <div className="relative w-32 h-32 mx-auto">
        {preview ? (
          <img
            src={preview}
            alt="Profile"
            className="w-full h-full rounded-full object-cover border-4 border-white shadow-lg"
          />
        ) : (
          <div className="w-full h-full rounded-full bg-slate-200 flex items-center justify-center border-4 border-white shadow-lg">
            <Camera className="w-8 h-8 text-slate-400" />
          </div>
        )}
        
        {/* Upload button overlay */}
        <button
          onClick={triggerFileSelect}
          disabled={disabled || uploading}
          className="absolute inset-0 rounded-full bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white disabled:cursor-not-allowed"
        >
          {uploading ? (
            <Loader className="w-6 h-6 animate-spin" />
          ) : (
            <Camera className="w-6 h-6" />
          )}
        </button>

        {/* Remove button */}
        {preview && !uploading && (
          <button
            onClick={handleRemoveImage}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      
      <p className="text-center text-sm text-slate-600 mt-3">
        Clique para {preview ? 'alterar' : 'adicionar'} foto
      </p>
    </div>
  );

  const renderBannerUpload = () => (
    <div className={`relative ${className}`}>
      <div className="relative w-full h-48 bg-slate-200 rounded-lg overflow-hidden">
        {preview ? (
          <img
            src={preview}
            alt="Banner"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <Upload className="w-12 h-12 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-600">Adicionar banner</p>
            </div>
          </div>
        )}
        
        {/* Upload button overlay */}
        <button
          onClick={triggerFileSelect}
          disabled={disabled || uploading}
          className="absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white disabled:cursor-not-allowed"
        >
          {uploading ? (
            <div className="text-center">
              <Loader className="w-8 h-8 animate-spin mx-auto mb-2" />
              <p>Enviando...</p>
            </div>
          ) : (
            <div className="text-center">
              <Upload className="w-8 h-8 mx-auto mb-2" />
              <p>Clique para {preview ? 'alterar' : 'adicionar'} banner</p>
            </div>
          )}
        </button>

        {/* Remove button */}
        {preview && !uploading && (
          <button
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      
      <p className="text-center text-sm text-slate-600 mt-2">
        Recomendado: 1200x300px, máximo 5MB
      </p>
    </div>
  );

  return (
    <>
      {type === 'profile' ? renderProfileUpload() : renderBannerUpload()}
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />
    </>
  );
};

export default ImageUpload;