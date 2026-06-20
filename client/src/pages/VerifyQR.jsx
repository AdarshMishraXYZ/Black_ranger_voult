import { useState, useRef, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import api from '../utils/api';
import { generateDeviceFingerprint, getGeolocation } from '../utils/deviceFingerprint';
import Card from '../components/Card';

const VerifyQR = () => {
  const [scanning, setScanning] = useState(false);
  const [cameraStarting, setCameraStarting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);
  const isProcessingRef = useRef(false);

  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const startScanning = async () => {
    try {
      setError('');
      setResult(null);
      setCameraStarting(true);
      isProcessingRef.current = false;
      setScanning(true);
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const html5QrCode = new Html5Qrcode('qr-reader');
      html5QrCodeRef.current = html5QrCode;

      const container = document.getElementById('qr-reader');
      const containerWidth = container?.offsetWidth || 300;
      const qrboxSize = Math.min(250, containerWidth - 40);

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: qrboxSize, height: qrboxSize },
          aspectRatio: 1.0,
          disableFlip: false,
          videoConstraints: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        },
        (decodedText) => { handleScan(decodedText); },
        () => {}
      );

      setCameraStarting(false);
    } catch (err) {
      setError('Failed to start camera. Please ensure camera permissions are granted.');
      console.error('Scan error:', err);
      setScanning(false);
      setCameraStarting(false);
    }
  };

  const stopScanning = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (err) {
        console.error('Stop scan error:', err);
      }
      html5QrCodeRef.current = null;
    }
    setScanning(false);
  };

  const handleScan = async (token) => {
    if (loading || !token || isProcessingRef.current) return;
    isProcessingRef.current = true;
    setLoading(true);
    setError('');
    setResult(null);
    await stopScanning();

    try {
      const deviceInfo = generateDeviceFingerprint();
      const geo = await getGeolocation();
      const response = await api.post('/verify', { token, device_info: deviceInfo, geo });
      if (response.data) {
        setResult(response.data);
        setError('');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Verification failed';
      setError(errorMessage);
      setResult(null);
    } finally {
      setLoading(false);
      isProcessingRef.current = false;
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const html5QrCode = new Html5Qrcode('qr-reader-file');
      const decodedText = await html5QrCode.scanFile(file, true);
      await html5QrCode.clear();
      await handleScan(decodedText);
    } catch (err) {
      setError('Could not read QR code from image. Try a clearer image.');
      setLoading(false);
    }
  };

  const handleManualInput = async (e) => {
    e.preventDefault();
    const token = e.target.token.value.trim().replace(/s+/g, "");
    if (!token) return;
    setLoading(true);
    setError('');

    try {
      const deviceInfo = generateDeviceFingerprint();
      const geo = await getGeolocation();
      const response = await api.post('/verify', { token, device_info: deviceInfo, geo });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold neon-text mb-8">Verify QR Code</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Scanner */}
        <Card>
          <h2 className="text-2xl font-semibold mb-6">QR Scanner</h2>

          <div className="space-y-4">
            {!scanning ? (
              <button onClick={startScanning} className="w-full neon-button-primary py-3">
                Start Camera Scanner
              </button>
            ) : (
              <button onClick={stopScanning} className="w-full bg-red-500/20 border border-red-500/50 text-red-400 py-3 rounded-lg hover:bg-red-500/30 transition-all">
                Stop Scanner
              </button>
            )}

            {scanning && (
              <div className="relative">
                <div id="qr-reader" className="w-full min-h-[400px] rounded-lg overflow-hidden bg-black/20 relative" />
                {cameraStarting && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                    <div className="text-center">
                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-cyan mb-4"></div>
                      <p className="text-gray-300">Starting camera...</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Upload QR Image */}
            <div className="border-t border-white/10 pt-4">
              <p className="text-sm text-gray-400 mb-3">Or upload QR image:</p>
              <div id="qr-reader-file" style={{display: 'none'}}></div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="w-full text-sm text-gray-400 bg-white/5 border border-white/10 rounded-lg px-4 py-2 cursor-pointer hover:border-neon-cyan transition-all"
              />
            </div>

            {/* Manual Input */}
            <div className="border-t border-white/10 pt-4">
              <p className="text-sm text-gray-400 mb-3">Or enter token manually:</p>
              <form onSubmit={handleManualInput} className="space-y-3">
                <textarea
                  name="token"
                  rows="4"
                  placeholder="Paste QR token here..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan font-mono text-sm"
                />
                <button type="submit" disabled={loading} className="w-full neon-button py-2 disabled:opacity-50">
                  {loading ? 'Verifying...' : 'Verify Token'}
                </button>
              </form>
            </div>
          </div>
        </Card>

        {/* Results */}
        <Card>
          <h2 className="text-2xl font-semibold mb-6">Verification Result</h2>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-cyan"></div>
              <p className="mt-4 text-gray-400">Verifying...</p>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <div className={`p-6 rounded-lg border-2 ${result.valid ? 'bg-green-500/20 border-green-500/50' : 'bg-red-500/20 border-red-500/50'}`}>
                <div className="flex items-center space-x-3 mb-2">
                  <div className={`text-3xl ${result.valid ? 'text-green-400' : 'text-red-400'}`}>
                    {result.valid ? '✓' : '✗'}
                  </div>
                  <div>
                    <div className={`text-2xl font-bold ${result.valid ? 'text-green-400' : 'text-red-400'}`}>
                      {result.valid ? 'VALID' : 'INVALID'}
                    </div>
                    <div className="text-sm text-gray-400">{result.reason || 'No reason provided'}</div>
                  </div>
                </div>
              </div>

              {result.identity ? (
                <div className="space-y-3 pt-4 border-t border-white/10">
                  <h3 className="font-semibold text-lg">Identity Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Name:</span>
                      <span className="font-semibold">{result.identity.name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Ranger ID:</span>
                      <span className="neon-text font-semibold">{result.identity.ranger_id || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Rank:</span>
                      <span>{result.identity.rank || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Division:</span>
                      <span>{result.identity.division || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="pt-4 border-t border-white/10">
                  <p className="text-sm text-yellow-400">⚠️ Identity details not available</p>
                  {!result.valid && (
                    <p className="text-xs text-gray-500 mt-2">
                      This QR code is invalid or expired. Identity details are only shown for valid QR codes.
                    </p>
                  )}
                </div>
              )}

              {result.timestamp && (
                <div className="pt-4 border-t border-white/10 text-xs text-gray-500">
                  Verified at: {new Date(result.timestamp).toLocaleString()}
                </div>
              )}

              {import.meta.env.DEV && (
                <details className="pt-4 border-t border-white/10">
                  <summary className="text-xs text-gray-500 cursor-pointer">Debug Info</summary>
                  <pre className="text-xs mt-2 p-2 bg-black/20 rounded overflow-auto max-h-40">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          )}

          {!result && !loading && !error && (
            <div className="text-center text-gray-500 py-12">
              <p>Scan a QR code, upload an image, or enter a token to verify</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default VerifyQR;

