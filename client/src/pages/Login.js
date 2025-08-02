import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      toast.success('Login successful!');
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
          <h1 className="text-2xl font-bold text-gray-900">Faculty Login</h1>
          <p className="text-gray-600 mt-2">
            Sign in to manage your availability status
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              placeholder="your.email@university.edu"
              required
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
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-800">
              Register here
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

export default Login;