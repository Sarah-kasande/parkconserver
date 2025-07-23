import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider } from '@/components/ui/sidebar';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import StatCard from '@/components/StatCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, PiggyBank, DollarSign, TrendingUp } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

interface FinanceData {
  tours: { created_at: string; amount: number }[];
  donations: { created_at: string; amount: number }[];
  fund_requests: { created_at: string; amount: number }[];
  extra_funds_requests: { created_at: string; amount: number }[];
  emergency_requests: { created_at: string; amount: number }[];
  budgets: { created_at: string; total_amount: number }[];
}


const AuditorDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<FinanceData>({
    tours: [],
    donations: [],
    fund_requests: [],
    extra_funds_requests: [],
    emergency_requests: [],
    budgets: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_URL}/finance/all-approved-data`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        if (error.response?.data?.error === 'Token has expired') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        }
      }
    };

    fetchData();
  }, [isAuthenticated, user, navigate]);

  if (!user || loading) return <div>Loading...</div>;

  const getMonthName = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', { month: 'short' });
  };

  // Calculate stats for cards
  const totalIncome = [
    ...data.tours,
    ...data.donations,
  ].reduce((sum, item) => sum + item.amount, 0);

  const totalExpenses = [
    ...data.fund_requests,
    ...data.extra_funds_requests,
    ...data.emergency_requests,
  ].reduce((sum, item) => sum + item.amount, 0);

  const totalBudgets = data.budgets.reduce((sum, budget) => sum + budget.total_amount, 0);

  const stats = [
    {
      title: 'Total Income',
      value: `$${totalIncome.toLocaleString()}`,
      icon: DollarSign,
      trend: 'up',
    },
    {
      title: 'Total Expenses',
      value: `$${totalExpenses.toLocaleString()}`,
      icon: PiggyBank,
      trend: 'up',
    },
    {
      title: 'Net Balance',
      value: `$${(totalIncome - totalExpenses).toLocaleString()}`,
      icon: TrendingUp,
      trend: totalIncome >= totalExpenses ? 'up' : 'down',
    },
    {
      title: 'Approved Budgets',
      value: `$${totalBudgets.toLocaleString()}`,
      icon: Calendar,
      trend: 'up',
    },
  ];

  // Prepare chart data
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const month = new Date(0, i).toLocaleString('en-US', { month: 'short' });
    const income = [
      ...data.tours,
      ...data.donations,
    ]
      .filter((item) => getMonthName(item.created_at) === month)
      .reduce((sum, item) => sum + item.amount, 0);
    const expenses = [
      ...data.fund_requests,
      ...data.extra_funds_requests,
      ...data.emergency_requests,
    ]
      .filter((item) => getMonthName(item.created_at) === month)
      .reduce((sum, item) => sum + item.amount, 0);
    return { month, income, expenses };
  }).filter((data) => data.income > 0 || data.expenses > 0);

  const role = user.role;
  const roleName = role.replace('-', ' ');

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50 w-full">
        <DashboardSidebar />
        <div className="flex-1">
          <DashboardHeader
            title={`${roleName.charAt(0).toUpperCase() + roleName.slice(1)} Dashboard`}
            subtitle="Overview of financial activities"
          />
          <main className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <StatCard
                  key={index}
                  title={stat.title}
                  value={stat.value}
                  icon={stat.icon}
                  trend={stat.trend === 'up' || stat.trend === 'down' || stat.trend === 'neutral' ? stat.trend : 'neutral'}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                />
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Income</CardTitle>
                  <CardDescription>Total income from tours and donations</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                      <Line type="monotone" dataKey="income" stroke="#0ea5e9" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Monthly Expenses</CardTitle>
                  <CardDescription>Total expenses from fund requests</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                      <Bar dataKey="expenses" fill="#22c55e" />
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

export default AuditorDashboard;