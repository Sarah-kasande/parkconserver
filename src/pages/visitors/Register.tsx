import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Link } from 'react-router-dom';

const VisitorRegister: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/visitor/register', {
        firstName,
        lastName,
        email,
        password,
      });
      navigate('../Visitors/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'The inserted Password is small & less than 8 characters');
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
            <h2 className="text-3xl font-extrabold text-conservation-700">Visitor Registration</h2>
            <p className="mt-2 text-sm text-gray-600">
              Sign up and join our community of nature enthusiasts
            </p>
          </div>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <form onSubmit={handleRegister}>
            <div className="mb-4">
              <label className="block text-gray-700">First Name*</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Email*</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Password*</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-conservation-600 text-white p-2 rounded hover:bg-conservation-700"
            >
              Register
            </button>
          </form>
          <p className="mt-4 text-center">
            Already have an account?{' '}
            <Link to="../Visitors" className="text-conservation-600 hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default VisitorRegister;