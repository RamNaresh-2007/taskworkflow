import { useState } from 'react';

const WorkerLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Worker Login:', formData); // Replace with your API call
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="h-20 w-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-2xl">
            <span className="text-3xl font-bold text-white">WORKER</span>
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-3">
            Worker Login
          </h2>
          <p className="text-purple-300 text-lg">Access your task dashboard</p>
        </div>

        {/* Form */}
        <div className="bg-gray-800/50 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-10 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-purple-300 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-5 py-4 bg-gray-800 border border-purple-500 rounded-xl text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                placeholder="worker@taskportal.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-purple-300 mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-5 py-4 bg-gray-800 border border-purple-500 rounded-xl text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                placeholder="••••••••"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center text-sm text-purple-300">
                <input type="checkbox" className="mr-2 h-4 w-4 text-purple-600 rounded border-purple-500 bg-gray-800 focus:ring-purple-500" />
                Remember me
              </label>
              <a href="#" className="text-sm text-purple-400 hover:text-purple-300 font-medium">Forgot Password?</a>
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-xl transform hover:scale-[1.02] transition-all duration-200"
            >
              Sign In
            </button>
          </form>
        </div>

        <p className="text-center text-purple-300 text-sm">
          Admin access?{' '}
          <a href="/admin-login" className="font-medium text-purple-400 hover:text-purple-300">
            Go to Admin Portal →
          </a>
        </p>
      </div>
    </div>
  );
};

export default WorkerLogin;
