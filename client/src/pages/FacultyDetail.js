import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import QRCode from 'react-qr-code';
import { useSocket } from '../utils/SocketContext';
import StatusBadge from '../components/StatusBadge';

const FacultyDetail = () => {
  const { id } = useParams();
  const [faculty, setFaculty] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { socket, joinFaculty } = useSocket();

  useEffect(() => {
    fetchFacultyDetails();
    fetchQRCode();
    if (socket) {
      joinFaculty(id);
    }
  }, [id, socket]);

  useEffect(() => {
    if (socket) {
      socket.on('status_update', handleStatusUpdate);
      
      return () => {
        socket.off('status_update', handleStatusUpdate);
      };
    }
  }, [socket]);

  const fetchFacultyDetails = async () => {
    try {
      const response = await axios.get(`/api/faculty/${id}`);
      setFaculty(response.data);
      setLoading(false);
    } catch (err) {
      setError('Faculty member not found');
      setLoading(false);
    }
  };

  const fetchQRCode = async () => {
    try {
      const response = await axios.get(`/api/qr/${id}`);
      setQrData(response.data);
    } catch (err) {
      console.error('Failed to fetch QR code');
    }
  };

  const handleStatusUpdate = (update) => {
    if (update.faculty_id === parseInt(id)) {
      setFaculty(prev => ({
        ...prev,
        status_code: update.status_code,
        status_message: update.status_message,
        custom_message: update.custom_message,
        estimated_duration: update.estimated_duration,
        last_updated: update.updated_at
      }));
    }
  };

  const timeAgo = (dateString) => {
    const now = new Date();
    const updated = new Date(dateString);
    const diffInMinutes = Math.floor((now - updated) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  const getStatusColor = (code) => {
    switch (code) {
      case 1: return 'bg-green-500';
      case 2: return 'bg-red-500';
      case 3: return 'bg-yellow-500';
      case 4: return 'bg-blue-500';
      case 5: return 'bg-gray-500';
      case 6: return 'bg-purple-500';
      default: return 'bg-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !faculty) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-lg">{error}</div>
        <Link to="/" className="mt-4 btn-primary inline-block">
          Back to Faculty List
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link to="/" className="text-blue-600 hover:text-blue-800">
          ← Back to Faculty List
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Faculty Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info Card */}
          <div className="card">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {faculty.name}
                </h1>
                <p className="text-lg text-gray-600 mb-1">{faculty.department}</p>
                {faculty.office_location && (
                  <p className="text-gray-500 flex items-center">
                    📍 {faculty.office_location}
                  </p>
                )}
                <p className="text-sm text-gray-500 mt-2">
                  📧 {faculty.email}
                </p>
              </div>
              <div className="text-right">
                <StatusBadge 
                  statusCode={faculty.status_code} 
                  statusMessage={faculty.status_message}
                  className="text-lg px-4 py-2"
                />
                <div className="mt-2 text-sm text-gray-500">
                  Binary: {faculty.status_code.toString(2).padStart(3, '0')}
                </div>
              </div>
            </div>

            {/* Status Indicator */}
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-3">
                <div className={`w-4 h-4 rounded-full ${getStatusColor(faculty.status_code)} animate-pulse-slow`}></div>
                <span className="text-lg font-medium">Current Status</span>
              </div>
              
              {faculty.custom_message && (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                  <p className="text-blue-800">{faculty.custom_message}</p>
                </div>
              )}

              {faculty.estimated_duration > 0 && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                  <p className="text-yellow-800">
                    ⏱️ Estimated duration: {faculty.estimated_duration} minutes
                  </p>
                </div>
              )}
            </div>

            {/* Last Updated */}
            <div className="border-t pt-4">
              <p className="text-sm text-gray-500">
                Last updated: {timeAgo(faculty.last_updated)}
              </p>
            </div>
          </div>

          {/* Status Legend */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Status Legend</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center space-x-3">
                <StatusBadge statusCode={1} statusMessage="Available for meetings" />
                <span className="text-xs text-gray-500">001</span>
              </div>
              <div className="flex items-center space-x-3">
                <StatusBadge statusCode={2} statusMessage="Busy - Do not disturb" />
                <span className="text-xs text-gray-500">010</span>
              </div>
              <div className="flex items-center space-x-3">
                <StatusBadge statusCode={3} statusMessage="Currently in a meeting" />
                <span className="text-xs text-gray-500">011</span>
              </div>
              <div className="flex items-center space-x-3">
                <StatusBadge statusCode={4} statusMessage="Office hours - Students welcome" />
                <span className="text-xs text-gray-500">100</span>
              </div>
              <div className="flex items-center space-x-3">
                <StatusBadge statusCode={5} statusMessage="Away from office" />
                <span className="text-xs text-gray-500">101</span>
              </div>
              <div className="flex items-center space-x-3">
                <StatusBadge statusCode={6} statusMessage="Available online only" />
                <span className="text-xs text-gray-500">110</span>
              </div>
            </div>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="space-y-6">
          <div className="card text-center">
            <h3 className="text-lg font-semibold mb-4">Quick Access QR Code</h3>
            {qrData ? (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
                  <QRCode 
                    value={qrData.url} 
                    size={200}
                    level="M"
                  />
                </div>
                <p className="text-sm text-gray-600">
                  Scan to view this faculty member's status
                </p>
                <div className="text-xs text-gray-500 break-all">
                  {qrData.url}
                </div>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>

          {/* Real-time Updates Info */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-3">Real-time Updates</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live status monitoring</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Binary encoded efficiency</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Instant notifications</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyDetail;