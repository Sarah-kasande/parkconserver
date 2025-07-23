import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider } from '@/components/ui/sidebar';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import StatCard from '@/components/StatCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, PiggyBank, CheckCircle, DollarSign, LucideIcon } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

interface Stat {
  title: string;
  value: string | number;
  icon: React.ComponentType<any>;
  trend: 'up' | 'down';
}

interface ChartData {
  month?: string;
  status?: string;
  bookings?: number;
  amount?: number;
  count?: number;
}

const GovernmentDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [donations, setDonations] = useState<ChartData[]>([]);
  const [tours, setTours] = useState<ChartData[]>([]);
  const [services, setServices] = useState<ChartData[]>([]);
  const [budgets, setBudgets] = useState<ChartData[]>([]);
  const [stats, setStats] = useState<Stat[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');

    const fetchData = async () => {
      try {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

        const headers = { Authorization: `Bearer ${token}` };
        const [
          statsResponse,
          donationsResponse,
          toursResponse,
          servicesResponse,
          budgetsResponse,
          approvedBudgetsResponse,
          emergencyRequestsResponse,
        ] = await Promise.all([
          axios.get(`${API_URL}/government/stats`, { headers }),
          axios.get(`${API_URL}/government/donations`, { headers }),
          axios.get(`${API_URL}/government/tour-bookings`, { headers }),
          axios.get(`${API_URL}/government/services`, { headers }),
          axios.get(`${API_URL}/government/allbudgets`, { headers }),
          axios.get(`${API_URL}/government/budgets/allapproved`, { headers }),
          axios.get(`${API_URL}/government/allemergency-requests`, { headers }),
        ]);

        // Set stats directly from the response
        setStats(statsResponse.data.stats);

        // Set donations data
        setDonations(donationsResponse.data);

        // Process tours data
        setTours(toursResponse.data);

        // Process services data - use the chart data directly
        setServices(servicesResponse.data.chartData);

        // Process budgets data - group by status
        const budgetsByStatus = budgetsResponse.data.reduce((acc: any, budget: any) => {
          const status = budget.status || 'pending';
          if (!acc[status]) {
            acc[status] = { status, amount: 0 };
          }
          acc[status].amount += parseFloat(budget.total_amount);
          return acc;
        }, {});
        setBudgets(Object.values(budgetsByStatus));

      } catch (error: any) {
        console.error('Error fetching dashboard data:', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        } else {
          setError('Failed to load some dashboard data. Please try again later.');
        }
      }
    };

    fetchData();
  }, [isAuthenticated, user, navigate]);

  if (!user) return null;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50 w-full">
        <DashboardSidebar />
        <div className="flex-1">
          <DashboardHeader
            title="Government Officer Dashboard"
            subtitle="Overview of financial activities and budgets"
          />
          
          <main className="p-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <StatCard
                  key={index}
                  title={stat.title}
                  value={stat.value}
                  icon={stat.icon as LucideIcon}
                  trend={stat.trend}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                />
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              {/* Donations Chart */}
              <Card className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <CardHeader>
                  <CardTitle>Donations</CardTitle>
                  <CardDescription>Monthly donation amounts</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={donations}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                      <Legend />
                      <Bar dataKey="amount" name="Donation Amount ($)" fill="#22c55e" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Tours Chart */}
              <Card className="animate-fade-in" style={{ animationDelay: '0.5s' }}>
                <CardHeader>
                  <CardTitle>Booked Tours</CardTitle>
                  <CardDescription>Monthly tour bookings</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={tours}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => Number(value).toLocaleString()} />
                      <Legend />
                      <Line type="monotone" dataKey="bookings" name="Bookings" stroke="#0ea5e9" strokeWidth={2} activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Services Chart */}
              <Card className="animate-fade-in" style={{ animationDelay: '0.6s' }}>
                <CardHeader>
                  <CardTitle>Service Applications</CardTitle>
                  <CardDescription>Applications by status</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={services}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="status" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" name="Applications" fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Budgets Chart */}
              <Card className="animate-fade-in" style={{ animationDelay: '0.7s' }}>
                <CardHeader>
                  <CardTitle>Budgets Overview</CardTitle>
                  <CardDescription>Total budget amounts by status</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={budgets}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="status" />
                      <YAxis />
                      <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                      <Legend />
                      <Bar dataKey="amount" name="Budget Amount ($)" fill="#f59e0b" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </main>

        </div>
      </div>
    </SidebarProvider>
  );
};

export default GovernmentDashboard;