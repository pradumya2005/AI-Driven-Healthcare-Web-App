import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useSocket } from '../utils/SocketContext';
import StatusBadge from '../components/StatusBadge';

const FacultyList = () => {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const { socket } = useSocket();

  const departments = [...new Set(faculty.map(f => f.department))];

  useEffect(() => {
    fetchFaculty();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('status_update', handleStatusUpdate);
      
      return () => {
        socket.off('status_update', handleStatusUpdate);
      };
    }
  }, [socket]);

  const fetchFaculty = async () => {
    try {
      const response = await axios.get('/api/faculty');
      setFaculty(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch faculty data');
      setLoading(false);
    }
  };

  const handleStatusUpdate = (update) => {
    setFaculty(prevFaculty => 
      prevFaculty.map(f => 
        f.id === update.faculty_id 
          ? { 
              ...f, 
              status_code: update.status_code,
              status_message: update.status_message,
              custom_message: update.custom_message,
              estimated_duration: update.estimated_duration,
              last_updated: update.updated_at
            }
          : f
      )
    );
  };

  const filteredFaculty = faculty.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         f.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !filterDepartment || f.department === filterDepartment;
    const matchesStatus = !filterStatus || f.status_code.toString() === filterStatus;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-lg">{error}</div>
        <button 
          onClick={fetchFaculty}
          className="mt-4 btn-primary"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Faculty Availability</h1>
        <p className="mt-2 text-gray-600">
          Real-time status updates • Scan QR codes for instant access
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="form-label">Search Faculty</label>
            <input
              type="text"
              placeholder="Search by name or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
            />
          </div>
          <div>
            <label className="form-label">Department</label>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="form-input"
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="form-input"
            >
              <option value="">All Statuses</option>
              <option value="1">Available</option>
              <option value="2">Busy</option>
              <option value="3">In Meeting</option>
              <option value="4">Office Hours</option>
              <option value="5">Away</option>
              <option value="6">Online Only</option>
              <option value="0">Unavailable</option>
            </select>
          </div>
        </div>
      </div>

      {/* Faculty Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFaculty.map(member => (
          <FacultyCard key={member.id} faculty={member} />
        ))}
      </div>

      {filteredFaculty.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No faculty members found</div>
        </div>
      )}
    </div>
  );
};

const FacultyCard = ({ faculty }) => {
  const timeAgo = (dateString) => {
    const now = new Date();
    const updated = new Date(dateString);
    const diffInMinutes = Math.floor((now - updated) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="card hover:shadow-lg transition-shadow duration-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{faculty.name}</h3>
          <p className="text-sm text-gray-600">{faculty.department}</p>
          {faculty.office_location && (
            <p className="text-sm text-gray-500">📍 {faculty.office_location}</p>
          )}
        </div>
        <StatusBadge 
          statusCode={faculty.status_code} 
          statusMessage={faculty.status_message} 
        />
      </div>

      {faculty.custom_message && (
        <div className="mb-4 p-3 bg-blue-50 rounded-md">
          <p className="text-sm text-blue-800">{faculty.custom_message}</p>
        </div>
      )}

      {faculty.estimated_duration > 0 && (
        <div className="mb-4 text-sm text-gray-600">
          ⏱️ Estimated duration: {faculty.estimated_duration} minutes
        </div>
      )}

      <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
        <span>Updated {timeAgo(faculty.last_updated)}</span>
        <span>Binary: {faculty.status_code.toString(2).padStart(3, '0')}</span>
      </div>

      <div className="flex space-x-2">
        <Link 
          to={`/faculty/${faculty.id}`}
          className="flex-1 btn-primary text-center text-sm"
        >
          View Details
        </Link>
        <button 
          onClick={() => window.open(faculty.qr_url, '_blank')}
          className="btn-secondary text-sm"
        >
          📱 QR Code
        </button>
      </div>
    </div>
  );
};

export default FacultyList;