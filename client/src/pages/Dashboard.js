import React, { useState, useEffect } from 'react';
import { useAuth } from '../utils/AuthContext';
import { useSocket } from '../utils/SocketContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import QRCode from 'react-qr-code';
import StatusBadge from '../components/StatusBadge';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [currentStatus, setCurrentStatus] = useState({
    status_code: 0,
    status_message: 'Unavailable',
    custom_message: '',
    estimated_duration: 0
  });
  const [qrData, setQrData] = useState(null);
  const [statusCodes, setStatusCodes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    fetchCurrentStatus();
    fetchStatusCodes();
    fetchQRCode();
  }, [isAuthenticated, user]);

  const fetchCurrentStatus = async () => {
    if (!user?.id) return;
    
    try {
      const response = await axios.get(`/api/faculty/${user.id}`);
      setCurrentStatus({
        status_code: response.data.status_code,
        status_message: response.data.status_message,
        custom_message: response.data.custom_message || '',
        estimated_duration: response.data.estimated_duration || 0
      });
    } catch (error) {
      console.error('Failed to fetch current status');
    }
  };

  const fetchStatusCodes = async () => {
    try {
      const response = await axios.get('/api/status-codes');
      setStatusCodes(response.data);
    } catch (error) {
      console.error('Failed to fetch status codes');
    }
  };

  const fetchQRCode = async () => {
    if (!user?.id) return;
    
    try {
      const response = await axios.get(`/api/qr/${user.id}`);
      setQrData(response.data);
    } catch (error) {
      console.error('Failed to fetch QR code');
    }
  };

  const updateStatus = async (statusCode, customMessage = '', estimatedDuration = 0) => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      await axios.post(`/api/faculty/${user.id}/status`, {
        status_code: statusCode,
        custom_message: customMessage,
        estimated_duration: estimatedDuration
      });

      const statusMessage = statusCodes.find(s => s.code === statusCode)?.message || 'Unknown';
      
      setCurrentStatus({
        status_code: statusCode,
        status_message: statusMessage,
        custom_message: customMessage,
        estimated_duration: estimatedDuration
      });

      toast.success('Status updated successfully!');
    } catch (error) {
      toast.error('Failed to update status');
    }
    setLoading(false);
  };

  const QuickStatusButton = ({ statusCode, label, icon, color }) => (
    <button
      onClick={() => updateStatus(statusCode)}
      disabled={loading}
      className={`flex items-center justify-center space-x-2 p-4 rounded-lg border-2 transition-all duration-200 ${
        currentStatus.status_code === statusCode
          ? `${color} border-current`
          : 'bg-white border-gray-300 hover:border-gray-400'
      }`}
    >
      <span className="text-2xl">{icon}</span>
      <span className="font-medium">{label}</span>
    </button>
  );

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Faculty Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back, {user.name} • Manage your availability status
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Management */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Status */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Current Status</h2>
            <div className="flex items-center justify-between mb-6">
              <StatusBadge 
                statusCode={currentStatus.status_code}
                statusMessage={currentStatus.status_message}
                className="text-lg px-4 py-2"
              />
              <div className="text-sm text-gray-500">
                Binary: {currentStatus.status_code.toString(2).padStart(3, '0')}
              </div>
            </div>

            {currentStatus.custom_message && (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                <p className="text-blue-800">{currentStatus.custom_message}</p>
              </div>
            )}

            {currentStatus.estimated_duration > 0 && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <p className="text-yellow-800">
                  ⏱️ Estimated duration: {currentStatus.estimated_duration} minutes
                </p>
              </div>
            )}
          </div>

          {/* Quick Status Updates */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Quick Status Updates</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <QuickStatusButton
                statusCode={1}
                label="Available"
                icon="✅"
                color="bg-green-100 text-green-800"
              />
              <QuickStatusButton
                statusCode={2}
                label="Busy"
                icon="🔴"
                color="bg-red-100 text-red-800"
              />
              <QuickStatusButton
                statusCode={3}
                label="In Meeting"
                icon="📅"
                color="bg-yellow-100 text-yellow-800"
              />
              <QuickStatusButton
                statusCode={4}
                label="Office Hours"
                icon="🏢"
                color="bg-blue-100 text-blue-800"
              />
              <QuickStatusButton
                statusCode={5}
                label="Away"
                icon="🚶"
                color="bg-gray-100 text-gray-800"
              />
              <QuickStatusButton
                statusCode={6}
                label="Online Only"
                icon="💻"
                color="bg-purple-100 text-purple-800"
              />
            </div>
          </div>

          {/* Custom Status Update */}
          <CustomStatusForm onUpdate={updateStatus} loading={loading} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* QR Code */}
          <div className="card text-center">
            <h3 className="text-lg font-semibold mb-4">Your QR Code</h3>
            {qrData ? (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
                  <QRCode 
                    value={qrData.url} 
                    size={180}
                    level="M"
                  />
                </div>
                <p className="text-sm text-gray-600">
                  Students can scan this to check your status
                </p>
                <button
                  onClick={() => window.open(qrData.url, '_blank')}
                  className="btn-secondary text-sm"
                >
                  View Public Page
                </button>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium text-gray-700">Name:</span>
                <p className="text-gray-600">{user.name}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Department:</span>
                <p className="text-gray-600">{user.department}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Email:</span>
                <p className="text-gray-600">{user.email}</p>
              </div>
              {user.office_location && (
                <div>
                  <span className="font-medium text-gray-700">Office:</span>
                  <p className="text-gray-600">📍 {user.office_location}</p>
                </div>
              )}
            </div>
          </div>

          {/* System Info */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-3">System Features</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Real-time updates</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Binary status encoding</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>QR code accessibility</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>Mobile optimized</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CustomStatusForm = ({ onUpdate, loading }) => {
  const [formData, setFormData] = useState({
    status_code: 1,
    custom_message: '',
    estimated_duration: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(
      parseInt(formData.status_code),
      formData.custom_message,
      parseInt(formData.estimated_duration) || 0
    );
    setFormData({ ...formData, custom_message: '', estimated_duration: '' });
  };

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4">Custom Status Update</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="form-label">Status</label>
          <select
            value={formData.status_code}
            onChange={(e) => setFormData({ ...formData, status_code: e.target.value })}
            className="form-input"
          >
            <option value={1}>✅ Available for meetings</option>
            <option value={2}>🔴 Busy - Do not disturb</option>
            <option value={3}>📅 Currently in a meeting</option>
            <option value={4}>🏢 Office hours - Students welcome</option>
            <option value={5}>🚶 Away from office</option>
            <option value={6}>💻 Available online only</option>
            <option value={0}>⭕ Unavailable</option>
          </select>
        </div>

        <div>
          <label className="form-label">Custom Message (Optional)</label>
          <textarea
            value={formData.custom_message}
            onChange={(e) => setFormData({ ...formData, custom_message: e.target.value })}
            className="form-input"
            rows="3"
            placeholder="Add additional context for students..."
          />
        </div>

        <div>
          <label className="form-label">Estimated Duration (Minutes, Optional)</label>
          <input
            type="number"
            value={formData.estimated_duration}
            onChange={(e) => setFormData({ ...formData, estimated_duration: e.target.value })}
            className="form-input"
            placeholder="How long will this status last?"
            min="0"
            max="480"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary"
        >
          {loading ? 'Updating...' : 'Update Status'}
        </button>
      </form>
    </div>
  );
};

export default Dashboard;