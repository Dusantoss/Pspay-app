import React, { useState, useRef, useEffect } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { X, Camera, Upload, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import jsQR from 'jsqr';

const QRScannerModal = ({ isOpen, onClose }) => {
  const { sendTransaction, account, tokens } = useWeb3();
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (isOpen && isScanning) {
      startCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [isOpen, isScanning]);

  if (!isOpen) return null;

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        scanQRCode();
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Erro ao acessar a câmera');
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const scanQRCode = () => {
    const scan = () => {
      if (videoRef.current && canvasRef.current && isScanning) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          
          if (code) {
            setScannedData(code.data);
            setIsScanning(false);
            stopCamera();
            return;
          }
        }
        
        requestAnimationFrame(scan);
      }
    };
    
    requestAnimationFrame(scan);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        
        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img, 0, 0);
        
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        
        if (code) {
          setScannedData(code.data);
          toast.success('QR Code detectado!');
        } else {
          toast.error('QR Code não encontrado na imagem');
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const parseQRData = (data) => {
    try {
      // Try to parse as EIP-681 URI
      if (data.startsWith('ethereum:')) {
        const url = new URL(data);
        const pathParts = url.pathname.split('/');
        const tokenAddress = pathParts[0];
        const functionName = pathParts[1];
        
        const params = new URLSearchParams(url.search);
        const recipientAddress = params.get('address');
        const amount = params.get('uint256');
        
        return {
          type: 'payment',
          tokenAddress,
          recipientAddress,
          amount,
          rawData: data
        };
      }
      
      // Try to parse as JSON
      const jsonData = JSON.parse(data);
      return {
        type: 'json',
        ...jsonData,
        rawData: data
      };
    } catch (error) {
      // Treat as plain text address
      if (data.match(/^0x[a-fA-F0-9]{40}$/)) {
        return {
          type: 'address',
          address: data,
          rawData: data
        };
      }
      
      return {
        type: 'unknown',
        rawData: data
      };
    }
  };

  const processPayment = async (parsedData) => {
    if (!account) {
      toast.error('Conecte sua carteira primeiro');
      return;
    }

    setIsProcessing(true);

    try {
      let recipientAddress, amount, tokenSymbol;

      if (parsedData.type === 'payment') {
        recipientAddress = parsedData.recipientAddress;
        amount = parsedData.amount;
        // Determine token based on contract address
        tokenSymbol = 'PSPAY';
        if (parsedData.tokenAddress) {
          const found = tokens && Object.values(tokens).find(t => (t.address || t)?.toLowerCase && (t.address || t).toLowerCase() === parsedData.tokenAddress.toLowerCase());
          if (found) tokenSymbol = found.symbol || Object.keys(tokens).find(k => tokens[k].address.toLowerCase() === found.address.toLowerCase()) || tokenSymbol;
        }
      } else if (parsedData.type === 'address') {
        // Manual input needed
        const inputAmount = prompt('Digite o valor a ser enviado:');
        if (!inputAmount) return;
        
        recipientAddress = parsedData.address;
        amount = inputAmount;
        tokenSymbol = 'PSPAY';
      } else {
        toast.error('Formato de QR Code não suportado');
        return;
      }

      // Convert from Wei if needed
      const finalAmount = parsedData.type === 'payment' 
        ? (parseFloat(amount) / Math.pow(10, 18)).toString()
        : amount;

      const tx = await sendTransaction(recipientAddress, finalAmount, tokenSymbol);
      
      toast.success('Transação enviada! Aguarde a confirmação...');
      
      await tx.wait();
      
      toast.success('Pagamento realizado com sucesso!');
      onClose();
    } catch (error) {
      console.error('Payment failed:', error);
      toast.error(error.message || 'Erro ao processar pagamento');
    } finally {
      setIsProcessing(false);
    }
  };

  const parsedData = scannedData ? parseQRData(scannedData) : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900 flex items-center">
            <Camera className="w-5 h-5 mr-2" />
            Escanear QR Code
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
          {!scannedData ? (
            <div className="space-y-4">
              {/* Camera Scanner */}
              {isScanning ? (
                <div className="space-y-4">
                  <div className="relative">
                    <video 
                      ref={videoRef}
                      className="w-full h-64 bg-black rounded-lg object-cover"
                      autoPlay
                      playsInline
                    />
                    <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none">
                      <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-blue-500"></div>
                      <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-blue-500"></div>
                      <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-blue-500"></div>
                      <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-blue-500"></div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-slate-600 mb-4">
                      Posicione o QR code dentro da área marcada
                    </p>
                    <button
                      onClick={() => {
                        setIsScanning(false);
                        stopCamera();
                      }}
                      className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Parar Scanner
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Options */}
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setIsScanning(true)}
                      className="flex flex-col items-center p-6 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
                    >
                      <Camera className="w-8 h-8 text-blue-600 mb-2" />
                      <span className="text-sm font-medium text-slate-900">Usar Câmera</span>
                    </button>
                    
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex flex-col items-center p-6 border-2 border-dashed border-green-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors"
                    >
                      <Upload className="w-8 h-8 text-green-600 mb-2" />
                      <span className="text-sm font-medium text-slate-900">Upload Imagem</span>
                    </button>
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">Dica</p>
                        <p className="text-sm text-blue-700 mt-1">
                          Certifique-se de que o QR code esteja bem iluminado e nítido para melhor detecção.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* QR Code Detected */}
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Camera className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">QR Code Detectado!</h3>
              </div>

              {/* Parsed Data Display */}
              {parsedData && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <h4 className="font-medium text-slate-900 mb-2">Informações do Pagamento:</h4>
                  
                  {parsedData.type === 'payment' && (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Destinatário:</span>
                        <span className="font-mono text-slate-900">
                          {parsedData.recipientAddress?.slice(0, 6)}...{parsedData.recipientAddress?.slice(-4)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Valor:</span>
                        <span className="text-slate-900">
                          {(parseFloat(parsedData.amount) / Math.pow(10, 18)).toFixed(4)} tokens
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {parsedData.type === 'address' && (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Endereço:</span>
                        <span className="font-mono text-slate-900">
                          {parsedData.address.slice(0, 6)}...{parsedData.address.slice(-4)}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {parsedData.type === 'unknown' && (
                    <div className="text-sm">
                      <span className="text-slate-600">Dados:</span>
                      <div className="mt-1 p-2 bg-white border rounded text-xs font-mono break-all">
                        {parsedData.rawData}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setScannedData(null);
                    setIsScanning(false);
                  }}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Escanear Novamente
                </button>
                
                {(parsedData?.type === 'payment' || parsedData?.type === 'address') && (
                  <button
                    onClick={() => processPayment(parsedData)}
                    disabled={isProcessing}
                    className="flex-1 px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <div className="flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Processando...
                      </div>
                    ) : (
                      'Pagar'
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Hidden canvas for image processing */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default QRScannerModal;