import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Card from '../components/Card';
import { QRCodeSVG } from 'qrcode.react';

const GenerateQR = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [identityId, setIdentityId] = useState(location.state?.identityId || '');
  const [identity, setIdentity] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (identityId) {
      fetchIdentity();
    }
  }, [identityId]);

  const fetchIdentity = async () => {
    try {
      const response = await api.get(`/identities/${identityId}`);
      setIdentity(response.data);
    } catch (err) {
      setError('Failed to fetch identity');
    }
  };

  const handleGenerate = async () => {
    if (!identityId) {
      setError('Please select an identity');
      return;
    }

    if (!user) {
      setError('Please login to generate QR codes');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/generate-qr', { identity_id: identityId });
      setQrData(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!qrData?.qr_code) return;

    const link = document.createElement('a');
    link.href = qrData.qr_code;
    link.download = `black-ranger-qr-${identity?.ranger_id || 'qr'}.png`;
    link.click();
  };

  const handleDownloadToken = () => {
    if (!qrData?.token) return;

    const blob = new Blob([JSON.stringify(qrData.payload, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `black-ranger-token-${identity?.ranger_id || 'token'}.json`;
    link.click();
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card>
          <div className="text-center">
            <p className="text-gray-400 mb-4">Please login to generate QR codes</p>
            <button
              onClick={() => navigate('/')}
              className="neon-button"
            >
              Go to Home
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold neon-text mb-8">Generate QR Code</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Identity Selection & Info */}
        <Card>
          <h2 className="text-2xl font-semibold mb-6">Identity Information</h2>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {identity ? (
            <div className="space-y-4 mb-6">
              <div>
                <div className="text-sm text-gray-400">Name</div>
                <div className="text-lg font-semibold">{identity.name}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Ranger ID</div>
                <div className="text-lg font-semibold neon-text">{identity.ranger_id}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Rank</div>
                <div className="text-lg">{identity.rank}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Division</div>
                <div className="text-lg">{identity.division}</div>
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Identity ID
              </label>
              <input
                type="text"
                value={identityId}
                onChange={(e) => setIdentityId(e.target.value)}
                placeholder="Enter identity UUID"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan mb-4"
              />
              <button
                onClick={fetchIdentity}
                className="neon-button w-full"
              >
                Load Identity
              </button>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading || !identity}
            className="w-full neon-button-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Generating...' : 'Generate QR Code'}
          </button>
        </Card>

        {/* QR Code Display */}
        <Card>
          <h2 className="text-2xl font-semibold mb-6">QR Code</h2>

          {qrData ? (
            <div className="space-y-6">
              <div className="flex justify-center bg-white p-4 rounded-lg">
                <QRCodeSVG
                  value={qrData.token}
                  size={256}
                  level="H"
                  includeMargin={true}
                />
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Issued At:</span>
                  <span>{new Date(qrData.payload.issued_at).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Expires At:</span>
                  <span>{new Date(qrData.payload.expires_at).toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleDownload}
                  className="w-full neon-button py-2"
                >
                  Download QR Image
                </button>
                <button
                  onClick={handleDownloadToken}
                  className="w-full neon-button py-2"
                >
                  Download Token JSON
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-12">
              <p>Generate a QR code to display it here</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default GenerateQR;

