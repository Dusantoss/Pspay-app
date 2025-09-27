import React, { useState } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { QrCode, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import QRCode from 'qrcode';

const QuickReceiveForm = () => {
  const { account, generatePaymentQR, tokens } = useWeb3();
  const [amount, setAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState('PSPAY');
  const [qrCode, setQrCode] = useState('');
  const [paymentData, setPaymentData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

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
      const paymentInfo = await generatePaymentQR(parseFloat(amount), selectedToken);
      
      if (paymentInfo) {
        const qrCodeDataURL = await QRCode.toDataURL(paymentInfo.uri, {
          width: 200,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        
        setQrCode(qrCodeDataURL);
        setPaymentData(paymentInfo);
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

  const clearQR = () => {
    setQrCode('');
    setPaymentData(null);
    setAmount('');
  };

  return (
    <div className="space-y-4">
      {!qrCode ? (
        <>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Valor (R$)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              step="0.01"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Token
            </label>
            <select
              value={selectedToken}
              onChange={(e) => setSelectedToken(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              {Object.entries(tokens).map(([key, token]) => (
                <option key={key} value={key}>
                  {token.symbol} - {token.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleGenerateQR}
            disabled={isGenerating || !amount}
            className="w-full flex items-center justify-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Gerando...
              </>
            ) : (
              <>
                <QrCode className="w-4 h-4 mr-2" />
                Gerar QR Code
              </>
            )}
          </button>
        </>
      ) : (
        <div className="text-center space-y-4">
          <div className="bg-white p-4 rounded-lg border-2 border-slate-200 inline-block">
            <img src={qrCode} alt="QR Code" className="mx-auto" />
          </div>
          
          {paymentData && (
            <div className="text-sm text-slate-600 space-y-1">
              <p><strong>Valor:</strong> R$ {amount}</p>
              <p><strong>Token:</strong> {paymentData.amountToken.toFixed(6)} {selectedToken}</p>
              <p><strong>USD:</strong> ${paymentData.amountUSD.toFixed(2)}</p>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <button
              onClick={() => copyToClipboard(paymentData?.uri || '')}
              className="flex-1 flex items-center justify-center px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              {copied ? 'Copiado!' : 'Copiar Link'}
            </button>
            <button
              onClick={clearQR}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-500 transition-colors"
            >
              Novo QR
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickReceiveForm;