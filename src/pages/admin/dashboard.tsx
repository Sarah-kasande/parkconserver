import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider } from '@/components/ui/sidebar';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import StatCard from '@/components/StatCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

interface StaffMember {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  park_name: string | null;
  role: 'finance' | 'government' | 'auditor' | 'park-staff';
  last_login: string | null;
  created_at: string;
}

const AdminDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [tourBookings, setTourBookings] = useState([]);
  const [donations, setDonations] = useState([]);
  const [recentLogins, setRecentLogins] = useState([]);
  const [loginMetrics, setLoginMetrics] = useState([]);
  const [officerCounts, setOfficerCounts] = useState([]); // New state for officer counts
  const [staff, setStaff] = useState<StaffMember[]>([]);

  useEffect(() => {

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [
          toursResponse,
          donationsResponse,
          loginsResponse,
          metricsResponse,
          officerCountsResponse,
          staffResponse
        ] = await Promise.all([
          axios.get(`${API_URL}/admin/tour-bookings`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/admin/donations`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/admin/recent-logins`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/admin/login-metrics`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/admin/officer-counts`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/staff`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setTourBookings(toursResponse.data.tour_bookings);
        setDonations(donationsResponse.data.donations);
        setRecentLogins(loginsResponse.data.recent_logins.slice(0, 5));
        setLoginMetrics(metricsResponse.data.login_metrics);
        setOfficerCounts(officerCountsResponse.data.officer_counts);
        setStaff(staffResponse.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        if (error.response) {
          console.error('Response data:', error.response.data);
          console.error('Response status:', error.response.status);
          console.error('Response headers:', error.response.headers);
        }
        if (error.response?.status === 403) {
          console.error('Unauthorized: Admin access required');
          navigate('/login');
        } else if (error.response?.data?.error === 'Token has expired') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        }
      }
    };

    fetchData();
  }, [isAuthenticated, user, navigate]);

  if (!user) return null;

  const role = user.role;
  const roleName = role.replace('-', ' ');

  // Sort staff by role: finance, government, auditor, park-staff
  const sortedStaff = [...staff].sort((a, b) => {
    const roleOrder = ['finance', 'government', 'auditor', 'park-staff'];
    return roleOrder.indexOf(a.role) - roleOrder.indexOf(b.role);
  });

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50 w-full">
        <DashboardSidebar />
        <div className="flex-1">
          <DashboardHeader
            title={`${roleName.charAt(0).toUpperCase() + roleName.slice(1)} Dashboard`}
            subtitle="Park management and admin activity overview"
          />
          <main className="p-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {officerCounts.map((stat, index) => (
                <StatCard
                  key={index}
                  title={stat.title}
                  value={stat.value}
                  icon={Users} // Use Users icon for all officer counts
                  trend={stat.trend}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                />
              ))}
            </div>

            {/* Charts and Staff Table */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              {/* Staff Members */}
              <Card className="col-span-1 lg:col-span-2 animate-fade-in" style={{ animationDelay: '0.6s' }}>
                <CardHeader>
                  <CardTitle>System Users</CardTitle>
                  <CardDescription>All registered finance officers, government officers, auditors, and park staff</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Park</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {sortedStaff.length > 0 ? (
                          sortedStaff.map((member) => (
                            <tr key={member.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {member.first_name} {member.last_name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.email}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {member.role === 'finance' ? 'Finance Officer' :
                                 member.role === 'government' ? 'Government Officer' :
                                 member.role === 'auditor' ? 'Auditor' : 'Park Staff'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {member.park_name || 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {member.last_login ? new Date(member.last_login).toLocaleString() : 'Never'}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                              No staff members found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;