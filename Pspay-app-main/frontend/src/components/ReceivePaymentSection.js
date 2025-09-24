import React, { useState, useRef } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { QrCode, Copy, Download, RefreshCw, Wallet, AlertCircle, Check } from 'lucide-react';
import { toast } from 'sonner';
import QRCode from 'qrcode';

const ReceivePaymentSection = () => {
  const { account, generatePaymentQR, tokens, connectWallet, isConnecting } = useWeb3();
  const [amount, setAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState('PSPAY');
  const [description, setDescription] = useState('');
  const [qrCodeData, setQrCodeData] = useState('');
  const [qrCodeImage, setQrCodeImage] = useState('');
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef(null);

  const handleGenerateQR = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Por favor, insira um valor válido');
      return;
    }

    if (!account) {
      toast.error('Conecte sua carteira primeiro');
      return;
    }

    setIsGenerating(true);
    try {
      const paymentData = await generatePaymentQR(parseFloat(amount), selectedToken);
      
      if (paymentData) {
        // Gerar QR Code visual
        const qrDataURL = await QRCode.toDataURL(paymentData.uri, {
          width: 300,
          margin: 2,
          color: {
            dark: '#111827',
            light: '#FFFFFF'
          }
        });
        
        setQrCodeData(paymentData.uri);
        setQrCodeImage(qrDataURL);
        setPaymentInfo(paymentData);
        toast.success('QR Code gerado com sucesso!');
      } else {
        toast.error('Erro ao gerar QR Code');
      }
    } catch (error) {
      console.error('Erro ao gerar QR:', error);
      toast.error('Erro ao gerar QR Code: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Copiado para a área de transferência!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Erro ao copiar');
    }
  };

  const downloadQR = () => {
    if (!qrCodeImage) return;
    
    const link = document.createElement('a');
    link.download = `qr-payment-${amount}-${selectedToken}.png`;
    link.href = qrCodeImage;
    link.click();
    toast.success('QR Code baixado!');
  };

  const clearQR = () => {
    setQrCodeData('');
    setQrCodeImage('');
    setPaymentInfo(null);
    setAmount('');
    setDescription('');
  };

  const sharePayment = async () => {
    if (!qrCodeData) return;

    const shareData = {
      title: 'Pagamento PayCoin',
      text: `Pague R$ ${amount} em ${selectedToken}${description ? ` - ${description}` : ''}`,
      url: qrCodeData
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast.success('Compartilhado com sucesso!');
      } catch (error) {
        console.log('Compartilhamento cancelado');
      }
    } else {
      // Fallback para desktop
      copyToClipboard(qrCodeData);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <QrCode className="w-16 h-16 text-orange-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900">Receber Pagamento</h2>
        <p className="text-slate-600 mt-2">
          Gere QR codes para receber pagamentos em criptomoedas
        </p>
      </div>

      {!account ? (
        /* Wallet Connection */
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
          <Wallet className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Conecte sua Carteira
          </h3>
          <p className="text-blue-700 mb-4">
            Você precisa conectar uma carteira Web3 para receber pagamentos
          </p>
          <button
            onClick={connectWallet}
            disabled={isConnecting}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50"
          >
            {isConnecting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 inline-block"></div>
                Conectando...
              </>
            ) : (
              'Conectar Carteira'
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Payment Form */}
          {!qrCodeData && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Left Column - Form */}
              <div className="space-y-4">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    Configurar Pagamento
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Valor a receber (R$)
                      </label>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0,00"
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-lg"
                        step="0.01"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Token para recebimento
                      </label>
                      <select
                        value={selectedToken}
                        onChange={(e) => setSelectedToken(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      >
                        {Object.entries(tokens).map(([key, token]) => (
                          <option key={key} value={key}>
                            {token.symbol} - {token.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Descrição (opcional)
                      </label>
                      <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Ex: Pagamento de produto/serviço"
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleGenerateQR}
                  disabled={isGenerating || !amount}
                  className="w-full bg-orange-600 text-white py-4 px-6 rounded-lg hover:bg-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin inline" />
                      Gerando QR Code...
                    </>
                  ) : (
                    <>
                      <QrCode className="w-5 h-5 mr-2 inline" />
                      Gerar QR Code
                    </>
                  )}
                </button>
              </div>

              {/* Right Column - Wallet Info */}
              <div className="space-y-4">
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    Informações da Carteira
                  </h3>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-slate-600">Endereço conectado:</p>
                      <p className="font-mono text-sm text-slate-900 bg-white p-2 rounded border">
                        {account.slice(0, 20)}...{account.slice(-10)}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-slate-600">Rede:</p>
                      <p className="text-sm text-slate-900">Binance Smart Chain (BSC)</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-slate-600">Tokens suportados:</p>
                      <div className="flex space-x-2 mt-1">
                        {Object.entries(tokens).map(([key, token]) => (
                          <span key={key} className="px-2 py-1 bg-white text-xs rounded border">
                            {token.symbol}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-amber-900">Dica Importante</p>
                      <p className="text-sm text-amber-800 mt-1">
                        O valor será convertido automaticamente para o token selecionado usando as taxas de câmbio atuais.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* QR Code Display */}
          {qrCodeData && (
            <div className="text-center space-y-6">
              <div className="bg-white rounded-xl p-8 shadow-lg border border-slate-200 inline-block">
                <img src={qrCodeImage} alt="QR Code de Pagamento" className="mx-auto mb-4" />
                
                {paymentInfo && (
                  <div className="text-left space-y-2 text-sm bg-slate-50 p-4 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Valor:</span>
                      <span className="font-semibold text-slate-900">R$ {amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Token:</span>
                      <span className="font-semibold text-slate-900">
                        {paymentInfo.amountToken.toFixed(6)} {selectedToken}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">USD:</span>
                      <span className="font-semibold text-slate-900">
                        ${paymentInfo.amountUSD.toFixed(2)}
                      </span>
                    </div>
                    {description && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Descrição:</span>
                        <span className="font-semibold text-slate-900">{description}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h4 className="font-semibold text-blue-900 mb-3">Como usar:</h4>
                <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside text-left max-w-md mx-auto">
                  <li>Mostre este QR code para o cliente</li>
                  <li>Cliente escaneia com o app PayCoin</li>
                  <li>Cliente confirma o pagamento na carteira</li>
                  <li>Você recebe o pagamento automaticamente</li>
                </ol>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => copyToClipboard(qrCodeData)}
                  className="flex items-center px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  {copied ? 'Copiado!' : 'Copiar Link'}
                </button>
                
                <button
                  onClick={downloadQR}
                  className="flex items-center px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Baixar PNG
                </button>
                
                <button
                  onClick={sharePayment}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
                >
                  Compartilhar
                </button>
                
                <button
                  onClick={clearQR}
                  className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-500 transition-colors"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Novo Pagamento
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default ReceivePaymentSection;