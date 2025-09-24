import React, { useState, useRef } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { X, QrCode, Download, Copy, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import QRCode from 'qrcode';

const ReceivePaymentModal = ({ isOpen, onClose }) => {
  const { account, generatePaymentQR, tokens } = useWeb3();
  const [formData, setFormData] = useState({
    amount: '',
    token: 'PSPAY',
    description: ''
  });
  const [qrCodeData, setQrCodeData] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const canvasRef = useRef(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const generateQR = async () => {
    if (!account) {
      toast.error('Conecte sua carteira primeiro');
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Digite um valor válido');
      return;
    }

    try {
      const paymentInfo = await generatePaymentQR(parseFloat(formData.amount), formData.token);
      
      if (!paymentInfo) {
        toast.error('Erro ao gerar informações de pagamento');
        return;
      }

      setQrCodeData(paymentInfo.uri);
      
      // Generate QR code image
      const canvas = canvasRef.current;
      await QRCode.toCanvas(canvas, paymentInfo.uri, {
        width: 300,
        margin: 2,
        color: {
          dark: '#1e3a8a',
          light: '#ffffff'
        }
      });
      
      // Get data URL for download
      const dataUrl = canvas.toDataURL();
      setQrCodeUrl(dataUrl);
      
      toast.success('QR Code gerado com sucesso!');
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Erro ao gerar QR Code: ' + error.message);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado para a área de transferência!');
  };

  const downloadQR = () => {
    if (!qrCodeUrl) return;
    
    const link = document.createElement('a');
    link.download = `qr-payment-${formData.amount}-${formData.token}.png`;
    link.href = qrCodeUrl;
    link.click();
    toast.success('QR Code baixado!');
  };

  const resetForm = () => {
    setFormData({
      amount: '',
      token: 'PSPAY',
      description: ''
    });
    setQrCodeData('');
    setQrCodeUrl('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900 flex items-center">
            <QrCode className="w-5 h-5 mr-2" />
            Receber Pagamento
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!account ? (
            <div className="text-center py-8">
              <Wallet className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Carteira não conectada
              </h3>
              <p className="text-slate-600 mb-4">
                Conecte sua carteira para gerar QR codes de pagamento
              </p>
              <button
                onClick={onClose}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-500 transition-colors"
              >
                Fechar
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Payment Form */}
              {!qrCodeData && (
                <div className="space-y-4">
                  {/* Token Selection */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Token
                    </label>
                    <select
                      name="token"
                      value={formData.token}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      {Object.entries(tokens).map(([key, token]) => (
                        <option key={key} value={key}>
                          {token.name} ({token.symbol})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Amount Input */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Valor a receber
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        placeholder="0.00"
                        step="0.0001"
                        min="0"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                      <div className="absolute right-3 top-2 text-sm text-slate-500">
                        {tokens[formData.token]?.symbol}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Descrição (opcional)
                    </label>
                    <input
                      type="text"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Ex: Pagamento de produto"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>

                  {/* Account Info */}
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-orange-900 mb-1">
                      Sua carteira:
                    </p>
                    <p className="text-sm font-mono text-orange-700">
                      {account.slice(0, 6)}...{account.slice(-4)}
                    </p>
                  </div>

                  {/* Generate Button */}
                  <button
                    onClick={generateQR}
                    className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-500 transition-colors font-medium"
                  >
                    Gerar QR Code
                  </button>
                </div>
              )}

              {/* QR Code Display */}
              {qrCodeData && (
                <div className="space-y-4">
                  {/* QR Code */}
                  <div className="text-center">
                    <div className="bg-white p-6 rounded-lg border-2 border-slate-200 inline-block">
                      <canvas ref={canvasRef} className="max-w-full h-auto" />
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <h4 className="font-medium text-slate-900 mb-3">Detalhes do Pagamento:</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Valor:</span>
                        <span className="font-semibold text-slate-900">
                          {formData.amount} {tokens[formData.token]?.symbol}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Token:</span>
                        <span className="text-slate-900">{tokens[formData.token]?.name}</span>
                      </div>
                      {formData.description && (
                        <div className="flex justify-between">
                          <span className="text-slate-600">Descrição:</span>
                          <span className="text-slate-900">{formData.description}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-slate-600">Destinatário:</span>
                        <span className="font-mono text-slate-900">
                          {account.slice(0, 6)}...{account.slice(-4)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* URI Display */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      URI de Pagamento:
                    </label>
                    <div className="flex">
                      <input
                        type="text"
                        value={qrCodeData}
                        readOnly
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-l-lg bg-slate-50 text-sm font-mono"
                      />
                      <button
                        onClick={() => copyToClipboard(qrCodeData)}
                        className="px-3 py-2 bg-slate-200 border border-l-0 border-slate-300 rounded-r-lg hover:bg-slate-300 transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Como usar:</h4>
                    <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                      <li>Mostre o QR code para o cliente</li>
                      <li>Cliente escaneia com app PayCoin</li>
                      <li>Pagamento é processado automaticamente</li>
                      <li>Você recebe confirmação na carteira</li>
                    </ol>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3">
                    <button
                      onClick={downloadQR}
                      className="flex-1 flex items-center justify-center px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Baixar QR
                    </button>
                    <button
                      onClick={resetForm}
                      className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-500 transition-colors"
                    >
                      Novo QR Code
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Hidden canvas for QR generation */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default ReceivePaymentModal;