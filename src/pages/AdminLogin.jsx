// src/pages/AdminLogin.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();

    // TODO: call real API and validate
    console.log('Admin Login:', form);

    // store role and go to dashboard
    localStorage.setItem('role', 'admin');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* similar styling as signup */}
      {/* ... your form with email & password using handleChange/handleSubmit ... */}
    </div>
  );
};

export default AdminLogin;
