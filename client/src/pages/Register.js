import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { toast } from 'react-toastify';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    office_location: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const departments = [
    'Computer Science',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'Engineering',
    'Business Administration',
    'Psychology',
    'English',
    'History',
    'Art',
    'Music',
    'Other'
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    const { confirmPassword, ...registrationData } = formData;
    const result = await register(registrationData);
    
    if (result.success) {
      toast.success('Registration successful! Welcome to the faculty availability system.');
      navigate('/dashboard');
    } else {
      toast.error(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="card">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Faculty Registration</h1>
          <p className="text-gray-600 mt-2">
            Join the faculty availability system
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="form-input"
              placeholder="Dr. John Smith"
              required
            />
          </div>

          <div>
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              placeholder="john.smith@university.edu"
              required
            />
          </div>

          <div>
            <label className="form-label">Department</label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="form-input"
              required
            >
              <option value="">Select Department</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">Office Location (Optional)</label>
            <input
              type="text"
              name="office_location"
              value={formData.office_location}
              onChange={handleChange}
              className="form-input"
              placeholder="Building A, Room 205"
            />
          </div>

          <div>
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="form-input"
              placeholder="Create a secure password"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Must be at least 6 characters long
            </p>
          </div>

          <div>
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="form-input"
              placeholder="Confirm your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-800">
              Sign in here
            </Link>
          </p>
        </div>

        <div className="mt-6 border-t pt-6">
          <div className="text-center">
            <Link 
              to="/" 
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              ← Back to Faculty List
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;