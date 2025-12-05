import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Card from '../components/Card';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const Logs = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    valid: '',
    from: '',
    to: '',
    device: '',
    limit: 100,
    offset: 0
  });
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    if (user) {
      fetchLogs();
      fetchStats();
    }
  }, [user, filters]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await api.get(`/logs?${params.toString()}`);
      setLogs(response.data.logs);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/stats/summary');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get('/logs/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `verification_logs_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, offset: 0 }));
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card>
          <div className="text-center">
            <p className="text-gray-400 mb-4">Please login to view logs</p>
          </div>
        </Card>
      </div>
    );
  }

  // Prepare chart data
  const chartData = logs.reduce((acc, log) => {
    const date = format(new Date(log.created_at), 'MMM dd');
    const existing = acc.find(item => item.date === date);
    if (existing) {
      existing[log.result] = (existing[log.result] || 0) + 1;
    } else {
      acc.push({ date, valid: 0, invalid: 0, expired: 0, [log.result]: 1 });
    }
    return acc;
  }, []).slice(-7); // Last 7 days

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold neon-text">Verification Logs</h1>
        <button
          onClick={handleExport}
          className="neon-button"
        >
          Export CSV
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold neon-text mb-1">{stats.total_verifications?.toLocaleString() || 0}</div>
              <div className="text-sm text-gray-400">Total</div>
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
              <div className="text-sm text-gray-400">Active IDs</div>
            </div>
          </Card>
        </div>
      )}

      {/* Charts */}
      {chartData.length > 0 && (
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <h2 className="text-xl font-semibold mb-4">Verifications by Day</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="date" stroke="#999" />
                <YAxis stroke="#999" />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #00F2A9' }} />
                <Bar dataKey="valid" fill="#00F2A9" />
                <Bar dataKey="invalid" fill="#ef4444" />
                <Bar dataKey="expired" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold mb-4">Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="date" stroke="#999" />
                <YAxis stroke="#999" />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #00F2A9' }} />
                <Line type="monotone" dataKey="valid" stroke="#00F2A9" strokeWidth={2} />
                <Line type="monotone" dataKey="invalid" stroke="#ef4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Filters</h2>
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Result</label>
            <select
              value={filters.valid}
              onChange={(e) => handleFilterChange('valid', e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-neon-cyan"
            >
              <option value="">All</option>
              <option value="true">Valid</option>
              <option value="false">Invalid</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">From Date</label>
            <input
              type="date"
              value={filters.from}
              onChange={(e) => handleFilterChange('from', e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-neon-cyan"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">To Date</label>
            <input
              type="date"
              value={filters.to}
              onChange={(e) => handleFilterChange('to', e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-neon-cyan"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Device Search</label>
            <input
              type="text"
              value={filters.device}
              onChange={(e) => handleFilterChange('device', e.target.value)}
              placeholder="Search device..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-neon-cyan"
            />
          </div>
        </div>
      </Card>

      {/* Logs Table */}
      <Card>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-cyan"></div>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-gray-400">No logs found</div>
          ) : (
            <>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Timestamp</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Result</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Ranger ID</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">IP Address</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Device</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-3 px-4 text-sm">
                        {format(new Date(log.created_at), 'MMM dd, yyyy HH:mm:ss')}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          log.result === 'valid' ? 'bg-green-500/20 text-green-400' :
                          log.result === 'invalid' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {log.result.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {log.identity_id ? log.identity_id.substring(0, 8) + '...' : 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-400">{log.ip_address || 'N/A'}</td>
                      <td className="py-3 px-4 text-sm text-gray-400">
                        {log.device_info?.userAgent?.substring(0, 30) || 'N/A'}...
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {pagination && (
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/10">
                  <div className="text-sm text-gray-400">
                    Showing {filters.offset + 1} - {Math.min(filters.offset + filters.limit, pagination.total)} of {pagination.total}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleFilterChange('offset', Math.max(0, filters.offset - filters.limit))}
                      disabled={filters.offset === 0}
                      className="neon-button px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handleFilterChange('offset', filters.offset + filters.limit)}
                      disabled={!pagination.hasMore}
                      className="neon-button px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Logs;

