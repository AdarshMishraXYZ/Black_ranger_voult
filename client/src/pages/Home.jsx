import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../utils/api';
import Card from '../components/Card';

const Home = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/stats/summary');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
        {/* Left Side - CTA */}
        <div className="space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold">
            <span className="neon-text">BLACK RANGER</span>
            <br />
            <span className="text-white">Identity Vault</span>
          </h1>
          <p className="text-xl text-gray-300 leading-relaxed">
            Secure QR-based identity verification system for elite ranger operations.
            Generate, verify, and track identity credentials with military-grade encryption.
          </p>
          <Link
            to="/verify-qr"
            className="inline-block neon-button-primary text-lg px-8 py-4"
          >
            Start Verification Process
          </Link>
        </div>

        {/* Right Side - Stats & Ranger Image Placeholder */}
        <div className="space-y-6">
          {/* Stats Widget */}
          <Card className="border-neon-cyan/30">
            <div className="text-center">
              <div className="text-4xl font-bold neon-text mb-2">
                {loading ? '...' : stats?.active_rangers?.toLocaleString() || '31,510'}
              </div>
              <div className="text-gray-400">Active Rangers</div>
            </div>
          </Card>

          {/* Ranger Image Placeholder */}
          <div className="glass-card border-neon-cyan/30 p-8 text-center">
            <div className="w-full h-64 bg-gradient-to-br from-neon-cyan/10 to-transparent rounded-lg flex items-center justify-center">
              <div className="text-gray-500">
                <svg className="w-24 h-24 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <p className="text-sm">Ranger Image Placeholder</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-4 gap-6 mb-12">
        <Link to="/create-identity" className="glass-card border-neon-cyan/20 p-6 hover:border-neon-cyan/50 transition-all group">
          <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🆔</div>
          <h3 className="font-semibold mb-2 group-hover:text-neon-cyan transition-colors">Create Identity</h3>
          <p className="text-sm text-gray-400">Register new ranger identity</p>
        </Link>

        <Link to="/generate-qr" className="glass-card border-neon-cyan/20 p-6 hover:border-neon-cyan/50 transition-all group">
          <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">📱</div>
          <h3 className="font-semibold mb-2 group-hover:text-neon-cyan transition-colors">Generate QR</h3>
          <p className="text-sm text-gray-400">Create signed QR code</p>
        </Link>

        <Link to="/verify-qr" className="glass-card border-neon-cyan/20 p-6 hover:border-neon-cyan/50 transition-all group">
          <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🔍</div>
          <h3 className="font-semibold mb-2 group-hover:text-neon-cyan transition-colors">Verify QR</h3>
          <p className="text-sm text-gray-400">Scan and validate QR</p>
        </Link>

        <Link to="/logs" className="glass-card border-neon-cyan/20 p-6 hover:border-neon-cyan/50 transition-all group">
          <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">📊</div>
          <h3 className="font-semibold mb-2 group-hover:text-neon-cyan transition-colors">Verification Logs</h3>
          <p className="text-sm text-gray-400">View audit trail</p>
        </Link>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold neon-text mb-1">{stats.total_verifications?.toLocaleString() || 0}</div>
              <div className="text-sm text-gray-400">Total Verifications</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-1">{stats.valid_count?.toLocaleString() || 0}</div>
              <div className="text-sm text-gray-400">Valid</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-400 mb-1">{stats.invalid_count?.toLocaleString() || 0}</div>
              <div className="text-sm text-gray-400">Invalid</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-1">{stats.active_identities?.toLocaleString() || 0}</div>
              <div className="text-sm text-gray-400">Active Identities</div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Home;

