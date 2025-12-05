import { useState, useRef, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import api from '../utils/api';
import { generateDeviceFingerprint, getGeolocation } from '../utils/deviceFingerprint';
import Card from '../components/Card';

const VerifyQR = () => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);

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
      
      const html5QrCode = new Html5Qrcode('qr-reader');
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        (decodedText) => {
          handleScan(decodedText);
        },
        (errorMessage) => {
          // Ignore scanning errors
        }
      );

      setScanning(true);
    } catch (err) {
      setError('Failed to start camera. Please ensure camera permissions are granted.');
      console.error('Scan error:', err);
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
    if (loading) return;
    
    setLoading(true);
    stopScanning();

    try {
      const deviceInfo = generateDeviceFingerprint();
      const geo = await getGeolocation();

      const response = await api.post('/verify', {
        token,
        device_info: deviceInfo,
        geo
      });

      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleManualInput = async (e) => {
    e.preventDefault();
    const token = e.target.token.value.trim();
    if (!token) return;

    setLoading(true);
    setError('');

    try {
      const deviceInfo = generateDeviceFingerprint();
      const geo = await getGeolocation();

      const response = await api.post('/verify', {
        token,
        device_info: deviceInfo,
        geo
      });

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
              <button
                onClick={startScanning}
                className="w-full neon-button-primary py-3"
              >
                Start Camera Scanner
              </button>
            ) : (
              <button
                onClick={stopScanning}
                className="w-full bg-red-500/20 border border-red-500/50 text-red-400 py-3 rounded-lg hover:bg-red-500/30 transition-all"
              >
                Stop Scanner
              </button>
            )}

            <div
              id="qr-reader"
              className={`w-full ${scanning ? 'min-h-[300px]' : 'hidden'}`}
            />

            <div className="border-t border-white/10 pt-4">
              <p className="text-sm text-gray-400 mb-3">Or enter token manually:</p>
              <form onSubmit={handleManualInput} className="space-y-3">
                <textarea
                  name="token"
                  rows="4"
                  placeholder="Paste QR token here..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan font-mono text-sm"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full neon-button py-2 disabled:opacity-50"
                >
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
              <div className={`p-6 rounded-lg border-2 ${
                result.valid
                  ? 'bg-green-500/20 border-green-500/50'
                  : 'bg-red-500/20 border-red-500/50'
              }`}>
                <div className="flex items-center space-x-3 mb-2">
                  <div className={`text-3xl ${result.valid ? 'text-green-400' : 'text-red-400'}`}>
                    {result.valid ? '✓' : '✗'}
                  </div>
                  <div>
                    <div className={`text-2xl font-bold ${result.valid ? 'text-green-400' : 'text-red-400'}`}>
                      {result.valid ? 'VALID' : 'INVALID'}
                    </div>
                    <div className="text-sm text-gray-400">{result.reason}</div>
                  </div>
                </div>
              </div>

              {result.identity && (
                <div className="space-y-3 pt-4 border-t border-white/10">
                  <h3 className="font-semibold text-lg">Identity Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Name:</span>
                      <span className="font-semibold">{result.identity.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Ranger ID:</span>
                      <span className="neon-text font-semibold">{result.identity.ranger_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Rank:</span>
                      <span>{result.identity.rank}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Division:</span>
                      <span>{result.identity.division}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-white/10 text-xs text-gray-500">
                Verified at: {new Date(result.timestamp).toLocaleString()}
              </div>
            </div>
          )}

          {!result && !loading && !error && (
            <div className="text-center text-gray-500 py-12">
              <p>Scan a QR code or enter a token to verify</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default VerifyQR;

