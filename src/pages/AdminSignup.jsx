// src/pages/AdminSignup.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminSignup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    // TODO: call your real API
    console.log('Admin Signup:', formData);

    // after successful signup, go to admin login
    navigate('/admin-login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="h-20 w-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-2xl">
            <span className="text-3xl font-bold text-white">ADMIN</span>
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-3">
            Admin Signup
          </h2>
          <p className="text-purple-300 text-lg">Create administrator account</p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-10 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-purple-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-5 py-4 bg-gray-800 border border-purple-500 rounded-xl text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200"
                placeholder="Admin Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-purple-300 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-5 py-4 bg-gray-800 border border-purple-500 rounded-xl text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200"
                placeholder="admin@taskportal.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-purple-300 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-5 py-4 bg-gray-800 border border-purple-500 rounded-xl text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-purple-300 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-5 py-4 bg-gray-800 border border-purple-500 rounded-xl text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-xl transform hover:scale-[1.02] transition-all duration-200"
            >
              Create Admin Account
            </button>
          </form>
        </div>

        <p className="text-center text-purple-300 text-sm">
          Already have account?{' '}
          <a
            href="/admin-login"
            className="font-medium text-purple-400 hover:text-purple-300"
          >
            Sign in →
          </a>
        </p>
      </div>
    </div>
  );
};

export default AdminSignup;
