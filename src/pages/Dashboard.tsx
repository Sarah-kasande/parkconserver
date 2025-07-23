
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider } from '@/components/ui/sidebar';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import StatCard from '@/components/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, Users, Calendar, Activity, TrendingUp, ArrowUpRight, PiggyBank } from 'lucide-react';

// Sample data for charts
const tourBookingsData = [
  { name: 'Jan', value: 65 },
  { name: 'Feb', value: 59 },
  { name: 'Mar', value: 80 },
  { name: 'Apr', value: 81 },
  { name: 'May', value: 56 },
  { name: 'Jun', value: 55 },
  { name: 'Jul', value: 40 },
  { name: 'Aug', value: 70 },
  { name: 'Sep', value: 90 },
  { name: 'Oct', value: 110 },
  { name: 'Nov', value: 130 },
  { name: 'Dec', value: 150 },
];

const donationsData = [
  { name: 'Jan', value: 4000 },
  { name: 'Feb', value: 3000 },
  { name: 'Mar', value: 5000 },
  { name: 'Apr', value: 2780 },
  { name: 'May', value: 1890 },
  { name: 'Jun', value: 2390 },
  { name: 'Jul', value: 3490 },
  { name: 'Aug', value: 4000 },
  { name: 'Sep', value: 5200 },
  { name: 'Oct', value: 6100 },
  { name: 'Nov', value: 7500 },
  { name: 'Dec', value: 9200 },
];

const budgetAllocationData = [
  { name: 'Wildlife Conservation', value: 35 },
  { name: 'Maintenance', value: 25 },
  { name: 'Staff Salaries', value: 20 },
  { name: 'Education Programs', value: 15 },
  { name: 'Research', value: 5 },
];

const COLORS = ['#0ea5e9', '#22c55e', '#f59e0b', '#8b5cf6', '#ef4444'];

const stats = [
  {
    title: "Total Tours Booked",
    value: "1,284",
    icon: Calendar,
    trend: "up",
    color: "blue", // ✅ Add color
    animationDelay: "0s",
  },
  {
    title: "Total Donations",
    value: "$48,294",
    icon: PiggyBank,
    trend: "up",
    color: "green", // ✅ Add color
    animationDelay: "0.1s",
  },
  {
    title: "Annual Budget",
    value: "$1.2M",
    icon: DollarSign,
    trend: 3.1 > 0 ? "up" : "down",
    color: "yellow",
    animationDelay: "0.2s",
  },
  {
    title: "Active Visitors",
    value: "342",
    icon: Users,
    trend: 5.8 > 0 ? "up" : "down",
    color: "purple", 
    animationDelay: "0.3s",
  },
];

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!user) {
    return null;
  }

  const role = user.role;
  const roleName = role.replace('-', ' ');

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50">
        <DashboardSidebar />
        
        <div className="flex-1">
          <DashboardHeader 
            title={`${roleName.charAt(0).toUpperCase() + roleName.slice(1)} Dashboard`}
            subtitle="Overview of all conservation activities"
          />
          
          <main className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat,index) => (
                <StatCard 
                  key={index}
                  title= {stat.title}
                  value=  {stat.value}
                  icon= {stat.icon}
                  trend={stat.trend as 'up' | 'down' | 'neutral'}
                  className="animate-fade-in"
                  style= {{animationDelay: stat.animationDelay}}
                />
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              <Card className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Tour Bookings</CardTitle>
                      <CardDescription>Monthly tour booking trends</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-green-600 font-medium">
                      <ArrowUpRight className="h-4 w-4" />
                      <span>12.5% increase</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={tourBookingsData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="value"
                        name="Tour Bookings"
                        stroke="#0ea5e9"
                        strokeWidth={2}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="animate-fade-in" style={{ animationDelay: '0.5s' }}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Donations</CardTitle>
                      <CardDescription>Monthly donation amounts</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-green-600 font-medium">
                      <TrendingUp className="h-4 w-4" />
                      <span>8.2% increase</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={donationsData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" name="Donation Amount ($)" fill="#22c55e" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2 animate-fade-in" style={{ animationDelay: '0.6s' }}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Budget Allocation</CardTitle>
                      <CardDescription>Distribution of conservation budget</CardDescription>
                    </div>
                    <Activity className="h-5 w-5 text-gray-500" />
                  </div>
                </CardHeader>
                <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={budgetAllocationData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {budgetAllocationData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="space-y-4">
                      {budgetAllocationData.map((item, index) => (
                        <div key={item.name} className="flex items-center">
                          <div className="w-4 h-4 mr-3" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <span className="font-medium">{item.name}</span>
                              <span>${(item.value / 100 * 1200000).toLocaleString()}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="h-2 rounded-full"
                                style={{
                                  width: `${item.value}%`,
                                  backgroundColor: COLORS[index % COLORS.length],
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
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

export default Dashboard;
