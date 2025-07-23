import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, User, LayoutDashboard, DollarSign, Calendar, ClipboardCheck, Edit } from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

interface Donation {
  id: number;
  donationType: string;
  amount: number;
  parkName: string;
  firstName: string;
  lastName: string;
  email: string;
  message: string;
  isAnonymous: boolean;
  createdAt: string;
}

interface Tour {
  id: number;
  parkName: string;
  tourName: string;
  date: string;
  time: string;
  guests: number;
  amount: number;
  firstName: string;
  lastName: string;
  email: string;
  specialRequests: string;
  createdAt: string;
}

interface Service {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyType: string;
  providedService: string;
  companyName: string;
  taxId: string;
  status: string | null;
  createdAt: string;
}

// Add password validation helper
const validatePassword = (password: string) => {
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return {
    isValid: hasMinLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar,
    errors: {
      minLength: !hasMinLength,
      upperCase: !hasUpperCase,
      lowerCase: !hasLowerCase,
      number: !hasNumber,
      specialChar: !hasSpecialChar,
    }
  };
};

const VisitorsDashboard: React.FC = () => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [visitorName, setVisitorName] = useState<string>('');
  const [error, setError] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [formError, setFormError] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<{
    currentPassword: boolean;
    newPassword: boolean;
    confirmPassword: boolean;
  }>({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [passwordValidation, setPasswordValidation] = useState<{
    isValid: boolean;
    errors: {
      minLength: boolean;
      upperCase: boolean;
      lowerCase: boolean;
      number: boolean;
      specialChar: boolean;
    }
  }>({
    isValid: false,
    errors: {
      minLength: false,
      upperCase: false,
      lowerCase: false,
      number: false,
      specialChar: false,
    }
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/Visitors');
          return;
        }
        const response = await axios.get('http://localhost:5000/api/visitor/data', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDonations(response.data.donations);
        setTours(response.data.tours);
        setServices(response.data.services);

        // Fetch visitor profile for name and form data
        const profileResponse = await axios.get('http://localhost:5000/api/visitor/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const { firstName, lastName, email } = profileResponse.data.user;
        setVisitorName(`${firstName} ${lastName}`);
        setFormData({
          firstName,
          lastName,
          email,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load data');
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/Visitors');
        }
      }
    };
    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/Visitors');
  };

  const openDialog = () => {
    setIsDialogOpen(true);
    setFormError('');
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setFormError('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Reset error state when user starts typing
    setPasswordErrors(prev => ({ ...prev, [name]: false }));

    // Validate new password
    if (name === 'newPassword') {
      const validation = validatePassword(value);
      setPasswordValidation(validation);
    }

    // Check confirm password match
    if (name === 'confirmPassword') {
      const match = value === formData.newPassword;
      setPasswordErrors(prev => ({ ...prev, confirmPassword: !match }));
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/Visitors');
        return;
      }

      // Validate passwords if updating password
      if (showPasswordFields) {
        let hasError = false;
        const newErrors = { ...passwordErrors };

        if (!formData.currentPassword) {
          newErrors.currentPassword = true;
          hasError = true;
        }

        if (!passwordValidation.isValid) {
          newErrors.newPassword = true;
          hasError = true;
        }

        if (formData.newPassword !== formData.confirmPassword) {
          newErrors.confirmPassword = true;
          hasError = true;
        }

        setPasswordErrors(newErrors);

        if (hasError) {
          setFormError('Please fix the password errors before submitting');
          return;
        }
      }

      // Prepare update data
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        ...(showPasswordFields && formData.newPassword ? {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        } : {})
      };

      await axios.put('http://localhost:5000/api/visitor/profile', updateData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setVisitorName(`${formData.firstName} ${formData.lastName}`);
      setShowPasswordFields(false);
      closeDialog();
      
      // Show success message
      alert('Profile updated successfully');
    } catch (err: any) {
      setFormError(err.response?.data?.error || 'Failed to update profile');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      {/* Navbar */}
      <nav className="bg-white shadow-md p-4 flex justify-between items-center">
        <div className="text-xl font-bold text-conservation-600">Park Pro</div>
        <div className="text-lg text-black">{visitorName || 'Loading...'}</div>
        <div className="flex items-center space-x-4">
          <button
            onClick={openDialog}
            className="flex items-center text-conservation-600 hover:text-conservation-800 transition-colors"
          >
            <Edit className="w-5 h-5 mr-2 text-conservation-600" />
            <p className='text-conservation-600'>Edit Profile</p>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center text-red-600 hover:text-red-800 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-2 text-red-600" />
            Logout
          </button>
        </div>
      </nav>

      {/* Profile Update Dialog */}
      <Transition appear show={isDialogOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeDialog}>
          <Transition.Child
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Update Profile
                  </Dialog.Title>
                  <form onSubmit={handleUpdateProfile} className="mt-4 space-y-4">
                    <div>
                      <label htmlFor="firstName" className="block text-lg font-medium text-gray-700">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        id="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 shadow-sm focus:border-conservation-500 focus:ring-conservation-500 sm:text-lg border-2 border-conservation-600 rounded-md p-2"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-lg font-medium text-gray-700">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        id="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 shadow-sm focus:border-conservation-500 focus:ring-conservation-500 sm:text-lg border-2 border-conservation-600 rounded-md p-2"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-lg font-medium text-gray-700">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 shadow-sm focus:border-conservation-500 focus:ring-conservation-500 sm:text-lg border-2 border-conservation-600 rounded-md p-2"
                        required
                      />
                    </div>

                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={() => setShowPasswordFields(!showPasswordFields)}
                        className="text-conservation-600 hover:text-conservation-800 text-sm font-medium"
                      >
                        {showPasswordFields ? '- Hide Password Fields' : '+ Update Password'}
                      </button>
                    </div>

                    {showPasswordFields && (
                      <>
                        <div>
                          <label htmlFor="currentPassword" className="block text-lg font-medium text-gray-700">
                            Current Password
                          </label>
                          <input
                            type="password"
                            name="currentPassword"
                            id="currentPassword"
                            value={formData.currentPassword}
                            onChange={handleInputChange}
                            className={`mt-1 block w-full shadow-sm sm:text-lg border-2 border-conservation-600 rounded-md p-2
                              ${passwordErrors.currentPassword 
                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                                : 'border-gray-300 focus:border-conservation-500 focus:ring-conservation-500'
                              }`}
                          />
                          {passwordErrors.currentPassword && (
                            <p className="mt-1 text-sm text-red-600">Current password is required</p>
                          )}
                        </div>
                        <div>
                          <label htmlFor="newPassword" className="block text-lg font-medium text-gray-700">
                            New Password
                          </label>
                          <input
                            type="password"
                            name="newPassword"
                            id="newPassword"
                            value={formData.newPassword}
                            onChange={handleInputChange}
                            className={`mt-1 block w-full shadow-sm sm:text-lg border-2 border-conservation-600 rounded-md p-2
                              ${passwordErrors.newPassword || !passwordValidation.isValid
                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                                : 'border-gray-300 focus:border-conservation-500 focus:ring-conservation-500'
                              }`}
                          />
                          {(!passwordValidation.isValid && formData.newPassword) && (
                            <div className="mt-1 text-sm">
                              <p className="font-medium text-gray-700">Password must contain:</p>
                              <ul className="list-disc pl-5 space-y-1">
                                <li className={passwordValidation.errors.minLength ? 'text-red-600' : 'text-green-600'}>
                                  At least 8 characters
                                </li>
                                <li className={passwordValidation.errors.upperCase ? 'text-red-600' : 'text-green-600'}>
                                  At least one uppercase letter
                                </li>
                                <li className={passwordValidation.errors.lowerCase ? 'text-red-600' : 'text-green-600'}>
                                  At least one lowercase letter
                                </li>
                                <li className={passwordValidation.errors.number ? 'text-red-600' : 'text-green-600'}>
                                  At least one number
                                </li>
                                <li className={passwordValidation.errors.specialChar ? 'text-red-600' : 'text-green-600'}>
                                  At least one special character (!@#$%^&*(),.?":{}|~)
                                </li>
                              </ul>
                            </div>
                          )}
                        </div>
                        <div>
                          <label htmlFor="confirmPassword" className="block text-lg font-medium text-gray-700">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            name="confirmPassword"
                            id="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className={`mt-1 block w-full shadow-sm sm:text-lg border-2 border-conservation-600 rounded-md p-2
                              ${passwordErrors.confirmPassword
                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                                : 'border-gray-300 focus:border-conservation-500 focus:ring-conservation-500'
                              }`}
                          />
                          {passwordErrors.confirmPassword && (
                            <p className="mt-1 text-sm text-red-600">Passwords do not match</p>
                          )}
                        </div>
                      </>
                    )}

                    {formError && (
                      <p className="text-red-500 text-sm">{formError}</p>
                    )}
                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={closeDialog}
                        className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-conservation-500 focus:ring-offset-2"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="inline-flex justify-center rounded-md border border-transparent bg-conservation-600 px-4 py-2 text-sm font-medium text-white hover:bg-conservation-700 focus:outline-none focus:ring-2 focus:ring-conservation-500 focus:ring-offset-2"
                      >
                        Save
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {error && <p className="text-red-500 mb-4">{error}</p>}

          {/* Donations Table */}
          <div className="mb-8 bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-content:space-between flex-1">
            <h2 className="text-2xl font-semibold mb-4 text-conservation-600">Your Donations</h2>
              <h2 className="text-2xl font-semibold mb-4 text-conservation-600 ml-auto">
                <Link to="/donate" className="text-conservation-600 hover:text-conservation-800">Donate</Link>
              </h2>
            </div>
            {donations.length === 0 ? (
              <p className="text-gray-600">No donations found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Park</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {donations.map((donation) => (
                      <tr key={donation.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{donation.parkName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{donation.donationType}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${donation.amount.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{donation.createdAt}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{donation.message || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Tours Table */}
          <div className="mb-8 bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-content:space-between flex-1">
            <h2 className="text-2xl font-semibold mb-4 text-conservation-600">Your Booked Tours</h2>
              <h2 className="text-2xl font-semibold mb-4 text-conservation-600 ml-auto">
                <Link to="/book-tour" className="text-conservation-600 hover:text-conservation-800">Book A Tour</Link>
              </h2>
            </div>
            {tours.length === 0 ? (
              <p className="text-gray-600">No tours booked.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Park</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tour</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guests</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tours.map((tour) => (
                      <tr key={tour.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tour.parkName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tour.tourName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tour.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tour.time}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tour.guests}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${tour.amount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Services Table */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-content:space-between flex-1">
            <h2 className="text-2xl font-semibold mb-4 text-conservation-600">Your Service Applications</h2>
              <h2 className="text-2xl font-semibold mb-4 text-conservation-600 ml-auto">
                <Link to="/services" className="text-conservation-600 hover:text-conservation-800">Partner With Us</Link>
              </h2>
            </div>
            {services.length === 0 ? (
              <p className="text-gray-600">No service applications found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tax ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied On</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {services.map((service) => (
                      <tr key={service.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{service.companyName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{service.companyType}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{service.providedService || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{service.taxId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{service.status || 'Pending'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{service.createdAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisitorsDashboard;