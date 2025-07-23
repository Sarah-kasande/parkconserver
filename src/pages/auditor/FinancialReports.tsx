import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider } from '@/components/ui/sidebar';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CircleX, CircleCheckBig, FileText } from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Download,
  Calendar,
  TrendingUp,
  DollarSign,
  Activity,
  Landmark,
  PiggyBank,
  AlertTriangle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import Papa from 'papaparse';

interface Tour {
  id: string;
  park_name: string;
  tour_name: string;
  date: string;
  time: string;
  guests: number;
  amount: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  special_requests: string;
  created_at: string;
}

interface Donation {
  id: string;
  donation_type: string;
  amount: number;
  park_name: string;
  first_name: string;
  last_name: string;
  email: string;
  message: string;
  is_anonymous: boolean;
  created_at: string;
}

interface FundRequest {
  id: string;
  title: string;
  description: string;
  amount: number;
  category: string;
  parkname: string;
  urgency: string;
  status: string;
  created_at: string;
  created_by: string;
  first_name: string;
  last_name: string;
  staff_email: string;
  staff_park: string;
}

interface ExtraFundsRequest {
  id: string;
  title: string;
  description: string;
  amount: number;
  parkName: string;
  category: string;
  justification: string;
  expected_duration: string;
  status: string;
  created_at: string;
  created_by: string;
  first_name: string;
  last_name: string;
  finance_email: string;
}

interface EmergencyRequest {
  id: string;
  title: string;
  description: string;
  amount: number;
  parkName: string;
  emergency_type: string;
  justification: string;
  timeframe: string;
  status: string;
  created_at: string;
  created_by: string;
  first_name: string;
  last_name: string;
  finance_email: string;
}

interface BudgetItem {
  id: string;
  category: string;
  description: string;
  amount: number;
}

interface Budget {
  id: string;
  title: string;
  fiscal_year: string;
  total_amount: number;
  park_name: string;
  description: string;
  status: string;
  created_at: string;
  created_by: string;
  approved_by: string;
  approved_at: string;
  created_by_name: string;
  approved_by_name: string;
  items: BudgetItem[];
}

interface FinanceData {
  tours: Tour[];
  donations: Donation[];
  fund_requests: FundRequest[];
  extra_funds_requests: ExtraFundsRequest[];
  emergency_requests: EmergencyRequest[];
  budgets: Budget[];
}

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'Income' | 'Expense';
  category: string;
  park: string;
  created_at?: string;
}

// Reusable TableDownloadButton component
interface TableDownloadButtonProps {
  data: any[];
  filename: string;
  fields: string[];
  headers: string[];
}

const TableDownloadButton: React.FC<TableDownloadButtonProps> = ({ data, filename, fields, headers }) => {
  const handleDownload = () => {
    const csvData = data.map((item) =>
      fields.reduce((obj, field, index) => {
        obj[headers[index]] = item[field] ?? '';
        return obj;
      }, {} as Record<string, any>)
    );
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <Button variant="outline" size="icon" onClick={handleDownload}>
      <Download className="h-4 w-4" />
      <span className="sr-only">Download</span>
    </Button>
  );
};

const FinancialReports = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedYear, setSelectedYear] = useState('2025');
  const [selectedQuarter, setSelectedQuarter] = useState('all');
  const [data, setData] = useState<FinanceData>({
    tours: [],
    donations: [],
    fund_requests: [],
    extra_funds_requests: [],
    emergency_requests: [],
    budgets: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [dialogType, setDialogType] = useState<string | null>(null);

  // Fetch data from Flask API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/finance/all-approved-data', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching financial data:', error);
        setError('Failed to load financial data');
        toast({
          title: 'Error',
          description: 'Failed to load financial data',
          variant: 'destructive',
        });
        setLoading(false);
      }
    };
    fetchData();
  }, [toast]);

  // Compute analytics from API data
  const getMonthName = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', { month: 'short' });
  };

  const filterByYearAndQuarter = (item: { created_at: string } | Transaction) => {
    const date = new Date(item.created_at);
    const itemYear = date.getFullYear().toString();
    const month = date.getMonth() + 1;
    if (selectedYear !== itemYear) return false;
    if (selectedQuarter === 'all') return true;
    if (selectedQuarter === 'q1' && month >= 1 && month <= 3) return true;
    if (selectedQuarter === 'q2' && month >= 4 && month <= 6) return true;
    if (selectedQuarter === 'q3' && month >= 7 && month <= 9) return true;
    if (selectedQuarter === 'q4' && month >= 10 && month <= 12) return true;
    return false;
  };

  // Revenue Data
  const revenueData = Array.from({ length: 12 }, (_, i) => {
    const month = new Date(0, i).toLocaleString('en-US', { month: 'short' });
    const tours = data.tours
      .filter(filterByYearAndQuarter)
      .filter((t) => getMonthName(t.created_at) === month)
      .reduce((sum, t) => sum + t.amount, 0);
    const donations = data.donations
      .filter(filterByYearAndQuarter)
      .filter((d) => getMonthName(d.created_at) === month)
      .reduce((sum, d) => sum + d.amount, 0);
    return {
      month,
      donations,
      tourBookings: tours,
      grants: 0, // Placeholder; update if grants data is available
      total: tours + donations,
    };
  });

  // Expense Data
  const expenseData = Array.from({ length: 12 }, (_, i) => {
    const month = new Date(0, i).toLocaleString('en-US', { month: 'short' });
    const fundRequests = data.fund_requests
      .filter(filterByYearAndQuarter)
      .filter((f) => getMonthName(f.created_at) === month)
      .reduce((sum, f) => sum + f.amount, 0);
    const extraFunds = data.extra_funds_requests
      .filter(filterByYearAndQuarter)
      .filter((e) => getMonthName(e.created_at) === month)
      .reduce((sum, e) => sum + e.amount, 0);
    const emergencyRequests = data.emergency_requests
      .filter(filterByYearAndQuarter)
      .filter((e) => getMonthName(e.created_at) === month)
      .reduce((sum, e) => sum + e.amount, 0);
    return {
      month,
      operations: fundRequests,
      staff: 0, // Placeholder; update if staff expenses are available
      maintenance: extraFunds + emergencyRequests,
      total: fundRequests + extraFunds + emergencyRequests,
    };
  });

  // Park Budget Data
  const parkBudgetData = Array.from(
    new Set([
      ...data.tours.map((t) => t.park_name),
      ...data.donations.map((d) => d.park_name),
      ...data.fund_requests.map((f) => f.parkname),
      ...data.extra_funds_requests.map((e) => e.parkName),
      ...data.emergency_requests.map((e) => e.parkName),
      ...data.budgets.map((b) => b.park_name),
    ])
  ).map((park) => {
    const budget = data.budgets
      .filter(filterByYearAndQuarter)
      .filter((b) => b.park_name === park)
      .reduce((sum, b) => sum + b.total_amount, 0);
    const spent = [
      ...data.fund_requests.filter((f) => f.parkname === park),
      ...data.extra_funds_requests.filter((e) => e.parkName === park),
      ...data.emergency_requests.filter((e) => e.parkName === park),
    ]
      .filter(filterByYearAndQuarter)
      .reduce((sum, r) => sum + r.amount, 0);
    return { name: park, budget, spent };
  }).filter((p) => p.budget > 0 || p.spent > 0);

  // Emergency Funds Data
  const emergencyFundsData = Array.from({ length: 12 }, (_, i) => {
    const month = new Date(0, i).toLocaleString('en-US', { month: 'short' });
    const approved = data.emergency_requests
      .filter(filterByYearAndQuarter)
      .filter((e) => getMonthName(e.created_at) === month && e.status.toLowerCase() === 'approved')
      .reduce((sum, e) => sum + e.amount, 0);
    const rejected = data.emergency_requests
      .filter(filterByYearAndQuarter)
      .filter((e) => getMonthName(e.created_at) === month && e.status.toLowerCase() === 'rejected')
      .reduce((sum, e) => sum + e.amount, 0);
    return { month, approved, rejected };
  });

  // Extra Funds Data
  const extraFundsData = Array.from({ length: 12 }, (_, i) => {
    const month = new Date(0, i).toLocaleString('en-US', { month: 'short' });
    const approved = data.extra_funds_requests
      .filter(filterByYearAndQuarter)
      .filter((e) => getMonthName(e.created_at) === month && e.status.toLowerCase() === 'approved')
      .reduce((sum, e) => sum + e.amount, 0);
    const rejected = data.extra_funds_requests
      .filter(filterByYearAndQuarter)
      .filter((e) => getMonthName(e.created_at) === month && e.status.toLowerCase() === 'rejected')
      .reduce((sum, e) => sum + e.amount, 0);
    return { month, approved, rejected };
  });

  // Park Requests Data
  const parkRequestsData = Array.from(new Set([
    ...data.fund_requests.map((f) => f.parkname),
    ...data.extra_funds_requests.map((e) => e.parkName),
    ...data.emergency_requests.map((e) => e.parkName),
  ])).map((park) => {
    const approved = [
      ...data.fund_requests.filter((f) => f.parkname === park && f.status.toLowerCase() === 'approved'),
      ...data.extra_funds_requests.filter((e) => e.parkName === park && e.status.toLowerCase() === 'approved'),
      ...data.emergency_requests.filter((e) => e.parkName === park && e.status.toLowerCase() === 'approved'),
    ]
      .filter(filterByYearAndQuarter)
      .reduce((sum, r) => sum + r.amount, 0);
    const denied = [
      ...data.fund_requests.filter((f) => f.parkname === park && f.status.toLowerCase() === 'rejected'),
      ...data.extra_funds_requests.filter((e) => e.parkName === park && e.status.toLowerCase() === 'rejected'),
      ...data.emergency_requests.filter((e) => e.parkName === park && e.status.toLowerCase() === 'rejected'),
    ]
      .filter(filterByYearAndQuarter)
      .reduce((sum, r) => sum + r.amount, 0);
    return { name: park, approved, denied };
  }).filter((p) => p.approved > 0 || p.denied > 0);

  // Transaction Types Data
  const transactionTypesData = [
    {
      name: 'Tour Bookings',
      value: data.tours.filter(filterByYearAndQuarter).reduce((sum, t) => sum + t.amount, 0),
    },
    {
      name: 'Donations',
      value: data.donations.filter(filterByYearAndQuarter).reduce((sum, d) => sum + d.amount, 0),
    },
    {
      name: 'Fund Requests',
      value: data.fund_requests.filter(filterByYearAndQuarter).reduce((sum, f) => sum + f.amount, 0),
    },
    {
      name: 'Extra Funds',
      value: data.extra_funds_requests.filter(filterByYearAndQuarter).reduce((sum, e) => sum + e.amount, 0),
    },
    {
      name: 'Emergency Funds',
      value: data.emergency_requests.filter(filterByYearAndQuarter).reduce((sum, e) => sum + e.amount, 0),
    },
  ].filter((t) => t.value > 0);

  // Monthly Metrics Data
  const monthlyMetricsData = Array.from({ length: 12 }, (_, i) => {
    const month = new Date(0, i).toLocaleString('en-US', { month: 'short' });
    const revenue = revenueData.find((r) => r.month === month)?.total || 0;
    const expenses = expenseData.find((e) => e.month === month)?.total || 0;
    return {
      month,
      revenue,
      expenses,
      netIncome: revenue - expenses,
    };
  });

  // Recent Transactions
  const recentTransactions: Transaction[] = [
    ...data.tours.map((t) => ({
      id: t.id,
      date: t.created_at.split(' ')[0],
      description: t.tour_name,
      amount: t.amount,
      type: 'Income' as const,
      category: 'Tours',
      park: t.park_name,
      created_at: t.created_at,
    })),
    ...data.donations.map((d) => ({
      id: d.id,
      date: d.created_at.split(' ')[0],
      description: d.donation_type,
      amount: d.amount,
      type: 'Income' as const,
      category: 'Donation',
      park: d.park_name,
      created_at: d.created_at,
    })),
    ...data.fund_requests.map((f) => ({
      id: f.id,
      date: f.created_at.split(' ')[0],
      description: f.title,
      amount: -f.amount,
      type: 'Expense' as const,
      category: f.category,
      park: f.parkname,
      created_at: f.created_at,
    })),
    ...data.extra_funds_requests.map((e) => ({
      id: e.id,
      date: e.created_at.split(' ')[0],
      description: e.title,
      amount: -e.amount,
      type: 'Expense' as const,
      category: e.category,
      park: e.parkName,
      created_at: e.created_at,
    })),
    ...data.emergency_requests.map((e) => ({
      id: e.id,
      date: e.created_at.split(' ')[0],
      description: e.title,
      amount: -e.amount,
      type: 'Expense' as const,
      category: e.emergency_type,
      park: e.parkName,
      created_at: e.created_at,
    })),
  ]
    .filter(filterByYearAndQuarter)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  // Summary Metrics
  const totalRevenue = revenueData.reduce((sum, r) => sum + r.total, 0);
  const totalExpenses = expenseData.reduce((sum, e) => sum + e.total, 0);
  const netIncome = totalRevenue - totalExpenses;
  const totalDonations = transactionTypesData.find((t) => t.name === 'Donations')?.value || 0;
  const totalTours = transactionTypesData.find((t) => t.name === 'Tour Bookings')?.value || 0;
  const totalFundRequests = transactionTypesData.find((t) => t.name === 'Fund Requests')?.value || 0;
  const totalExtraFunds = transactionTypesData.find((t) => t.name === 'Extra Funds')?.value || 0;
  const totalEmergencyFunds = transactionTypesData.find((t) => t.name === 'Emergency Funds')?.value || 0;
  const approvedRequests = [
    ...data.fund_requests.filter((f) => f.status.toLowerCase() === 'approved'),
    ...data.extra_funds_requests.filter((e) => e.status.toLowerCase() === 'approved'),
    ...data.emergency_requests.filter((e) => e.status.toLowerCase() === 'approved'),
  ].length;
  const declinedRequests = [
    ...data.fund_requests.filter((f) => f.status.toLowerCase() === 'rejected'),
    ...data.extra_funds_requests.filter((e) => e.status.toLowerCase() === 'rejected'),
    ...data.emergency_requests.filter((e) => e.status.toLowerCase() === 'rejected'),
  ].length;
  const emergencyRequestsCount = data.emergency_requests.length;

  // Handle view details
  const viewDetails = (record: any, type: string) => {
    setSelectedRecord(record);
    setDialogType(type);
  };

  // Render details dialog
  const renderDetailsDialog = () => {
    if (!selectedRecord || !dialogType) return null;

    const fields: Record<string, { label: string; key: string }[]> = {
      tours: [
        { label: 'ID', key: 'id' },
        { label: 'Park Name', key: 'park_name' },
        { label: 'Tour Name', key: 'tour_name' },
        { label: 'Date', key: 'date' },
        { label: 'Time', key: 'time' },
        { label: 'Guests', key: 'guests' },
        { label: 'Amount', key: 'amount' },
        { label: 'First Name', key: 'first_name' },
        { label: 'Last Name', key: 'last_name' },
        { label: 'Email', key: 'email' },
        { label: 'Phone', key: 'phone' },
        { label: 'Special Requests', key: 'special_requests' },
        { label: 'Created At', key: 'created_at' },
      ],
      donations: [
        { label: 'ID', key: 'id' },
        { label: 'Donation Type', key: 'donation_type' },
        { label: 'Amount', key: 'amount' },
        { label: 'Park Name', key: 'park_name' },
        { label: 'Donor', key: 'is_anonymous' },
        { label: 'Email', key: 'email' },
        { label: 'Message', key: 'message' },
        { label: 'Created At', key: 'created_at' },
      ],
      fund_requests: [
        { label: 'ID', key: 'id' },
        { label: 'Title', key: 'title' },
        { label: 'Description', key: 'description' },
        { label: 'Amount', key: 'amount' },
        { label: 'Category', key: 'category' },
        { label: 'Park Name', key: 'parkname' },
        { label: 'Urgency', key: 'urgency' },
        { label: 'Status', key: 'status' },
        { label: 'Created At', key: 'created_at' },
        { label: 'Created By', key: 'created_by' },
        { label: 'Staff Name', key: 'first_name' },
        { label: 'Staff Email', key: 'staff_email' },
        { label: 'Staff Park', key: 'staff_park' },
      ],
      extra_funds_requests: [
        { label: 'ID', key: 'id' },
        { label: 'Title', key: 'title' },
        { label: 'Description', key: 'description' },
        { label: 'Amount', key: 'amount' },
        { label: 'Park Name', key: 'parkName' },
        { label: 'Category', key: 'category' },
        { label: 'Justification', key: 'justification' },
        { label: 'Expected Duration', key: 'expected_duration' },
        { label: 'Status', key: 'status' },
        { label: 'Created At', key: 'created_at' },
        { label: 'Created By', key: 'created_by' },
        { label: 'Finance Officer Name', key: 'first_name' },
        { label: 'Finance Email', key: 'finance_email' },
      ],
      emergency_requests: [
        { label: 'ID', key: 'id' },
        { label: 'Title', key: 'title' },
        { label: 'Description', key: 'description' },
        { label: 'Amount', key: 'amount' },
        { label: 'Park Name', key: 'parkName' },
        { label: 'Emergency Type', key: 'emergency_type' },
        { label: 'Justification', key: 'justification' },
        { label: 'Timeframe', key: 'timeframe' },
        { label: 'Status', key: 'status' },
        { label: 'Created At', key: 'created_at' },
        { label: 'Created By', key: 'created_by' },
        { label: 'Finance Officer Name', key: 'first_name' },
        { label: 'Finance Email', key: 'finance_email' },
      ],
      budgets: [
        { label: 'ID', key: 'id' },
        { label: 'Title', key: 'title' },
        { label: 'Fiscal Year', key: 'fiscal_year' },
        { label: 'Total Amount', key: 'total_amount' },
        { label: 'Park Name', key: 'park_name' },
        { label: 'Description', key: 'description' },
        { label: 'Status', key: 'status' },
        { label: 'Created At', key: 'created_at' },
        { label: 'Created By', key: 'created_by' },
        { label: 'Created By Name', key: 'created_by_name' },
        { label: 'Approved By', key: 'approved_by' },
        { label: 'Approved By Name', key: 'approved_by_name' },
        { label: 'Approved At', key: 'approved_at' },
      ],
    };

    const dialogFields = fields[dialogType];

    return (
      <Dialog open={!!selectedRecord} onOpenChange={() => setSelectedRecord(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {dialogType.charAt(0).toUpperCase() + dialogType.slice(1).replace('_', ' ')} Details
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <Table>
              <TableBody>
                {dialogFields.map(({ label, key }) => (
                  <TableRow key={key}>
                    <TableCell className="font-medium">{label}</TableCell>
                    <TableCell>
                      {key === 'amount' || key === 'total_amount'
                        ? `$${Number(selectedRecord[key]).toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}`
                        : key === 'is_anonymous'
                        ? selectedRecord[key]
                          ? 'Anonymous'
                          : `${selectedRecord.first_name} ${selectedRecord.last_name}`
                        : key === 'first_name' && dialogType !== 'budgets'
                        ? `${selectedRecord.first_name} ${selectedRecord.last_name}`
                        : selectedRecord[key] ?? 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-gray-100 w-full">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
            <div className="container mx-auto px-6">
              <div className="flex-1 space-y-4">
          <DashboardHeader
            title="Financial Reports"
                    subtitle="An Overview of all financial reports"
          />
              </div>
            {loading && <div>Loading...</div>}
            {error && <div className="text-red-500">{error}</div>}
            {!loading && !error && (
                <Tabs defaultValue="overview" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="transactions">Transactions</TabsTrigger>
                  </TabsList>
                  <TabsContent value="overview">
                    <div className="grid lg:grid-cols-3 gap-6 mt-8">
                      <Card>
                        <CardHeader>
                          <CardTitle>Total Revenue</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle>Total Expenses</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">${totalExpenses.toFixed(2)}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle>Net Income</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">${netIncome.toFixed(2)}</div>
                        </CardContent>
                      </Card>
                      {/* <Card>
                        <CardHeader>
                          <CardTitle>Budget Utilization</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{((totalExpenses / data.budgets.reduce((sum, b) => sum + b.total_amount, 0))).toFixed(1)}%</div>
                        </CardContent>
                      </Card> */}
                    </div>
                    <Card className="mt-4">
                        <CardHeader>
                        <CardTitle>Revenue vs Expenses</CardTitle>
                        </CardHeader>
                        <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyMetricsData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                              <Tooltip />
                                <Legend />
                              <Bar dataKey="revenue" fill="#8884d8" />
                              <Bar dataKey="expenses" fill="#82ca9d" />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>Revenue Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={transactionTypesData.filter(t => t.value > 0 && ['Tour Bookings', 'Donations'].includes(t.name))}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  outerRadius={80}
                                  fill="#8884d8"
                                  dataKey="value"
                                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                  {transactionTypesData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']} />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Expense Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={transactionTypesData.filter(t => t.value > 0 && ['Fund Requests', 'Extra Funds', 'Emergency Funds'].includes(t.name))}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  outerRadius={80}
                                  fill="#8884d8"
                                  dataKey="value"
                                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                  {transactionTypesData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']} />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card className="mt-4">
                      <CardHeader>
                        <CardTitle>Budget Utilization by Park</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={parkBudgetData.map(park => ({
                                name: park.name,
                                allocated: park.budget,
                                spent: park.spent,
                                remaining: park.budget - park.spent
                              }))}
                              layout="vertical"
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis type="number" />
                              <YAxis dataKey="name" type="category" width={150} />
                              <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']} />
                              <Legend />
                              <Bar dataKey="allocated" fill="#8884d8" name="Allocated Budget" />
                              <Bar dataKey="spent" fill="#82ca9d" name="Spent Amount" />
                            </BarChart>
                          </ResponsiveContainer>
                            </div>
                          </CardContent>
                        </Card>

                    <Card className="mt-4">
                          <CardHeader>
                        <CardTitle>Monthly Revenue Trend</CardTitle>
                          </CardHeader>
                          <CardContent>
                        <div className="h-[300px]">
                              <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={revenueData}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="month" />
                                  <YAxis />
                              <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']} />
                                  <Legend />
                              <Line type="monotone" dataKey="donations" stroke="#8884d8" name="Donations" />
                              <Line type="monotone" dataKey="tourBookings" stroke="#82ca9d" name="Tour Bookings" />
                              <Line type="monotone" dataKey="total" stroke="#ff7300" name="Total Revenue" />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  <TabsContent value="transactions">
                        <Card>
                          <CardHeader>
                        <CardTitle>Recent Transactions</CardTitle>
                          </CardHeader>
                          <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Amount</TableHead>
                              <TableHead>Description</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {recentTransactions.map((transaction) => (
                              <TableRow key={transaction.id}>
                                <TableCell>{transaction.date}</TableCell>
                                <TableCell>{transaction.type}</TableCell>
                                <TableCell>${transaction.amount.toFixed(2)}</TableCell>
                                <TableCell>{transaction.description}</TableCell>
                                <TableCell>
                                  <Badge variant={transaction.type === 'Income' ? 'default' : 'secondary'}>
                                    {transaction.type}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                          </CardContent>
                        </Card>
                  </TabsContent>
                  <TabsContent value="budgets">
                      <Card>
                        <CardHeader>
                        <CardTitle>Budget Allocation</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Table>
                            <TableHeader>
                              <TableRow>
                              <TableHead>Category</TableHead>
                              <TableHead>Allocated</TableHead>
                              <TableHead>Spent</TableHead>
                              <TableHead>Remaining</TableHead>
                              <TableHead>Utilization</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                            {data.budgets.map((budget) => (
                                  <TableRow key={budget.id}>
                                    <TableCell>{budget.title}</TableCell>
                                <TableCell>${budget.total_amount.toFixed(2)}</TableCell>
                                <TableCell>${parkBudgetData.find((p) => p.name === budget.park_name)?.spent.toFixed(2) || 'N/A'}</TableCell>
                                <TableCell>${(budget.total_amount - (parkBudgetData.find((p) => p.name === budget.park_name)?.spent || 0)).toFixed(2)}</TableCell>
                                    <TableCell>
                                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    {(() => {
                                      const spent = parkBudgetData.find((p) => p.name === budget.park_name)?.spent || 0;
                                      const percentage = ((spent / budget.total_amount) * 100).toFixed(0);
                                      return (
                                        <>
                                          <div
                                            className="bg-blue-600 h-2.5 rounded-full"
                                            style={{ width: `${percentage}%` }}
                                          />
                                          <span className="text-sm text-gray-600">{percentage}%</span>
                                        </>
                                      );
                                    })()}
                                  </div>
                                    </TableCell>
                                  </TableRow>
                            ))}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
            )}
            {renderDetailsDialog()}
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default FinancialReports;