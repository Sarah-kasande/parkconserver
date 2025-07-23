import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Lock, LogIn, Loader2 } from 'lucide-react';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { toast } from 'sonner';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailInvalid, setIsEmailInvalid] = useState(false);
  const [isPasswordInvalid, setIsPasswordInvalid] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEmailInvalid(false);
    setIsPasswordInvalid(false);

    if (!email || !password) {
      toast.error('Please enter both email and password');
      setIsEmailInvalid(!email);
      setIsPasswordInvalid(!password);
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });
      const { token, user, dashboard } = response.data;
      
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      await login(email, password); // Update AuthContext
      toast.success(`Login successful. Welcome ${user.role.replace('-', ' ')}!`);
      navigate(dashboard);
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.error || 'Login failed';
      toast.error(errorMessage);
      if (errorMessage === 'Invalid credentials') {
        setIsEmailInvalid(true);
        setIsPasswordInvalid(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <NavBar />
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="text-center">
            <div onClick={() => navigate('/')} className="cursor-pointer mx-auto flex items-center justify-center space-x-2 mb-5">
              <div className="w-10 h-10 rounded-full bg-conservation-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <span className="text-xl font-bold text-conservation-700">PARK PRO</span>
            </div>
            <h2 className="text-3xl font-extrabold text-conservation-700">Welcome back</h2>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to your account to access your dashboard
            </p>
          </div>

          <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <Label htmlFor="email">Email address*</Label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className={`pl-10 ${isEmailInvalid ? 'border-red-500' : ''}`}
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  {isEmailInvalid && (
                    <p className="text-red-500 text-sm mt-1">Invalid email</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="password">Password*</Label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className={`pl-10 ${isPasswordInvalid ? 'border-red-500' : ''}`}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {isPasswordInvalid && (
                    <p className="text-red-500 text-sm mt-1">Invalid password</p>
                  )}
                </div>
              </div>

              <div>
                <Button
                  type="submit"
                  className="w-full bg-conservation-500 flex justify-center py-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  ) : (
                    <LogIn className="h-5 w-5 mr-2" />
                  )}
                  Sign in
                </Button>
              </div>
            </form>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Or use demo accounts
                  </span>
                </div>
                <div className="mt-4 bg-gray-100 rounded-md p-4 text-sm text-gray-700 space-y-2">
                  <p><strong>Admin:</strong> <span className="text-conservation-700">admin@ecopark.com</span> / <span className="font-mono">password</span></p>
                  <p><strong>Auditor:</strong> <span className="text-conservation-700">sarah.williams@auditgov.org</span> / <span className="font-mono">password</span></p>
                  <p><strong>Finance Officer:</strong> <span className="text-conservation-700">emily.johnson@parkfinance.org</span> / <span className="font-mono">password</span></p>
                  <p><strong>Government Officer:</strong> <span className="text-conservation-700">laura.davis@gov.org</span> / <span className="font-mono">password</span></p>
                  <p><strong>Park Staff:</strong> <span className="text-conservation-700">Ganza.dany@yahoo.com</span> / <span className="font-mono">password</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Login;