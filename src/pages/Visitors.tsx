import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Link } from 'react-router-dom';

const Visitors: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isEmailInvalid, setIsEmailInvalid] = useState(false);
  const [isPasswordInvalid, setIsPasswordInvalid] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEmailInvalid(false);
    setIsPasswordInvalid(false);
    setError('');
    
    try {
      const response = await axios.post('http://localhost:5000/api/visitor/login', {
        email,
        password,
      });
      localStorage.setItem('token', response.data.token);
      navigate('/visitors/Dashboard');
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Login failed';
      setError(errorMessage);
      if (errorMessage === 'Invalid credentials') {
        setIsEmailInvalid(true);
        setIsPasswordInvalid(true);
      }
    }
  };

  return (
    <>
    <NavBar />
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="text-center mb-6">
          <div onClick={() => navigate('/')} className="cursor-pointer mx-auto flex items-center justify-center space-x-2 mb-5">
            <div className="w-10 h-10 rounded-full bg-conservation-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <span className="text-xl font-bold text-conservation-700">PARK PRO</span>
          </div>
          <h2 className="text-3xl font-extrabold text-conservation-700">Welcome back Visitor</h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account to access your dashboard
          </p>
        </div>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-700">Email*</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full p-2 border rounded-sm bg-gray-50 ${isEmailInvalid ? 'border-red-500' : ''}`}
              required
            />
            {isEmailInvalid && (
              <p className="text-red-500 text-sm mt-1">Invalid email</p>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Password*</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full p-2 border rounded-sm bg-gray-50 ${isPasswordInvalid ? 'border-red-500' : ''}`}
              required
            />
            {isPasswordInvalid && (
              <p className="text-red-500 text-sm mt-1">Invalid password</p>
            )}
          </div>
          <button type="submit" className="w-full bg-conservation-600 text-white p-2 rounded hover:bg-conservation-600">
            Login
          </button>
        </form>
        <p className="mt-4 text-center">
          Don't have an account?{' '}
          <Link to="/visitors/Register" className="text-conservation-600 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
    <Footer />
    </>
  );
};

export default Visitors;