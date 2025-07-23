import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider } from '@/components/ui/sidebar';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import StatCard from '@/components/StatCard';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Calendar, PiggyBank, CheckCircle, DollarSign, LucideIcon, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import { toast } from '@/components/ui/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

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

interface FundRequest {
  id: string;
  title: string;
  amount: number;
  parkname: string;
  status: string;
  created_at: string;
  first_name: string;
  last_name: string;
}

const FinanceDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [donations, setDonations] = useState<ChartData[]>([]);
  const [tours, setTours] = useState<ChartData[]>([]);
  const [services, setServices] = useState<ChartData[]>([]);
  const [budgets, setBudgets] = useState<ChartData[]>([]);
  const [approvedFundRequests, setApprovedFundRequests] = useState<FundRequest[]>([]);
  const [stats, setStats] = useState<Stat[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [highValueRequests, setHighValueRequests] = useState<FundRequest[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [
          donationsResponse,
          toursResponse,
          servicesResponse,
          budgetsResponse,
          approvedBudgetsResponse,
          fundRequestsResponse,
          approvedFundRequestsResponse,
        ] = await Promise.all([
          axios.get(`${API_URL}/finance/donations`, { headers }),
          axios.get(`${API_URL}/finance/tours`, { headers }),
          axios.get(`${API_URL}/finance/services`, { headers }),
          axios.get(`${API_URL}/finance/budgets`, { headers }),
          axios.get(`${API_URL}/finance/budgets/approved`, { headers }),
          axios.get(`${API_URL}/finance/fund-requests`, { headers }),
          axios.get(`${API_URL}/finance/fund-requests?status=approved`, { headers }),
        ]);

        // Process Donations
        const donationsData = donationsResponse.data.reduce(
          (acc: ChartData[], curr: any) => {
            const date = new Date(curr.created_at);
            const month = date.toLocaleString('default', { month: 'short' });
            const existing = acc.find((d) => d.month === month);
            if (existing) {
              existing.amount = (existing.amount || 0) + Number(curr.amount);
            } else {
              acc.push({ month, amount: Number(curr.amount) });
            }
            return acc;
          },
          []
        );
        setDonations(donationsData);

        // Process Tours
        const toursData = toursResponse.data.reduce((acc: ChartData[], curr: any) => {
          const date = new Date(curr.created_at);
          const month = date.toLocaleString('default', { month: 'short' });
          const existing = acc.find((d) => d.month === month);
          if (existing) {
            existing.bookings = (existing.bookings || 0) + 1;
            existing.amount = (existing.amount || 0) + Number(curr.amount);
          } else {
            acc.push({ month, bookings: 1, amount: Number(curr.amount) });
          }
          return acc;
        }, []);
        setTours(toursData);

        // Process Services
        const servicesData = [
          {
            status: 'Pending',
            count: servicesResponse.data.filter((s: any) => s.pending).length,
          },
          {
            status: 'Approved',
            count: servicesResponse.data.filter((s: any) => s.status === 'approved')
              .length,
          },
          {
            status: 'Denied',
            count: servicesResponse.data.filter((s: any) => s.status === 'denied')
              .length,
          },
        ];
        setServices(servicesData);

        // Process Budgets
        const budgetsData = [
          {
            status: 'Draft',
            amount: budgetsResponse.data
              .filter((b: any) => b.status === 'draft')
              .reduce((sum: number, b: any) => sum + Number(b.total_amount), 0),
          },
          {
            status: 'Submitted',
            amount: budgetsResponse.data
              .filter((b: any) => b.status === 'submitted')
              .reduce((sum: number, b: any) => sum + Number(b.total_amount), 0),
          },
          {
            status: 'Approved',
            amount: budgetsResponse.data
              .filter((b: any) => b.status === 'approved')
              .reduce((sum: number, b: any) => sum + Number(b.total_amount), 0),
          },
          {
            status: 'Rejected',
            amount: budgetsResponse.data
              .filter((b: any) => b.status === 'rejected')
              .reduce((sum: number, b: any) => sum + Number(b.total_amount), 0),
          },
        ];
        setBudgets(budgetsData);

        // Process Approved Fund Requests
        setApprovedFundRequests(
          approvedFundRequestsResponse.data.map((fr: any) => ({
            id: fr.id,
            title: fr.title,
            amount: fr.amount,
            parkname: fr.parkname,
            status: fr.status,
            created_at: fr.created_at,
            first_name: fr.first_name,
            last_name: fr.last_name,
          }))
        );

        // Calculate Stats
        const totalDonations = donationsResponse.data.reduce(
          (sum: number, d: any) => sum + Number(d.amount),
          0
        );
        const totalToursRevenue = toursResponse.data.reduce(
          (sum: number, t: any) => sum + Number(t.amount),
          0
        );
        const acceptedFundRequests = fundRequestsResponse.data
          .filter((fr: any) => fr.status === 'approved')
          .reduce((sum: number, fr: any) => sum + Number(fr.amount), 0);
        const totalApprovedBudgets = Number(
          approvedBudgetsResponse.data.total_approved_amount || 0
        );

        setStats([
          {
            title: 'Total Donations',
            value: `$${totalDonations.toLocaleString()}`,
            icon: PiggyBank,
            trend: 'up',
          },
          {
            title: 'Tours Revenue',
            value: `$${totalToursRevenue.toLocaleString()}`,
            icon: Calendar,
            trend: 'up',
          },
          {
            title: 'Accepted Fund Requests',
            value: `$${acceptedFundRequests.toLocaleString()}`,
            icon: CheckCircle,
            trend: 'up',
          },
          {
            title: 'Total Approved Budgets',
            value: `$${totalApprovedBudgets.toLocaleString()}`,
            icon: DollarSign,
            trend: 'up',
          },
        ]);

        // Calculate total income and check for high value requests
        const donationTotal = donationsResponse.data.reduce(
          (sum: number, d: any) => sum + Number(d.amount),
          0
        );
        const tourTotal = toursResponse.data.reduce(
          (sum: number, t: any) => sum + Number(t.amount),
          0
        );
        const baseIncome = donationTotal + tourTotal;
        const govSupport = baseIncome * 0.15 / (1 - 0.15);
        const totalIncome = baseIncome + govSupport;
        
        // Filter requests exceeding 40% threshold
        const threshold = totalIncome * 0.4;
        const highValue = fundRequestsResponse.data.filter(
          (request: any) => request.status === 'pending' && request.amount > threshold
        );
        setHighValueRequests(highValue);
      } catch (error: any) {
        if (error.response?.data?.error === 'Token has expired') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
          toast({
            title: 'Session Expired',
            description: 'Please log in again.',
            variant: 'destructive',
          });
        } else {
          setError('Failed to load dashboard data. Please try again later.');
          console.error('Error fetching dashboard data:', error);
          toast({
            title: 'Error',
            description: 'Failed to load dashboard data.',
            variant: 'destructive',
          });
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
            title="Finance Officer Dashboard"
            subtitle="Overview of financial activities and budgets"
          />
          <main className="p-6">
            {/* High Value Requests Alert */}
            {highValueRequests.length > 0 && (
              <Alert variant="destructive" className="mb-6">
                <AlertTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  High Value Fund Requests Requiring Attention
                </AlertTitle>
                <AlertDescription>
                  <p className="mb-2">
                    {highValueRequests.length} fund request{highValueRequests.length > 1 ? 's' : ''} exceeding 40% of total park income require{highValueRequests.length === 1 ? 's' : ''} immediate review.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/finance/request-management')}
                  >
                    Review Requests
                  </Button>
                </AlertDescription>
              </Alert>
            )}

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

            {/* Approved Fund Requests Table */}
            <Card className="mt-8 animate-fade-in" style={{ animationDelay: '0.8s' }}>
              <CardHeader>
                <CardTitle>Approved Park Staff Fund Requests</CardTitle>
                <CardDescription>
                  List of all approved fund requests submitted by park staff
                </CardDescription>
              </CardHeader>
              <CardContent>
                {approvedFundRequests.length === 0 ? (
                  <p className="text-gray-500">
                    No approved fund requests found.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Park</TableHead>
                        <TableHead>Submitted By</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {approvedFundRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell>{request.title}</TableCell>
                          <TableCell>
                            ${request.amount.toLocaleString()}
                          </TableCell>
                          <TableCell>{request.parkname}</TableCell>
                          <TableCell>
                            {request.first_name} {request.last_name}
                          </TableCell>
                          <TableCell>
                            {new Date(request.created_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

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
                      <Tooltip
                        formatter={(value) => `$${Number(value).toLocaleString()}`}
                      />
                      <Legend />
                      <Bar
                        dataKey="amount"
                        name="Donation Amount ($)"
                        fill="#22c55e"
                      />
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
                      <Tooltip
                        formatter={(value) => Number(value).toLocaleString()}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="bookings"
                        name="Bookings"
                        stroke="#0ea5e9"
                        strokeWidth={2}
                        activeDot={{ r: 8 }}
                      />
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
                      <Bar
                        dataKey="count"
                        name="Applications"
                        fill="#8b5cf6"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Budgets Chart */}
              <Card className="animate-fade-in" style={{ animationDelay: '0.7s' }}>
                <CardHeader>
                  <CardTitle>Budgets Overview</CardTitle>
                  <CardDescription>
                    Total budget amounts by status
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={budgets}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="status" />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => `$${Number(value).toLocaleString()}`}
                      />
                      <Legend />
                      <Bar
                        dataKey="amount"
                        name="Budget Amount ($)"
                        fill="#f59e0b"
                      />
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

export default FinanceDashboard;