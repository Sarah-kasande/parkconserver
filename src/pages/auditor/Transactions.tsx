
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider } from '@/components/ui/sidebar';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { Search, Download, Filter, FileText, Flag, MoreVertical, Calendar, CheckCircle, XCircle, AlertTriangle, CreditCard, Landmark, DollarSign, ChevronDown, ArrowUpRight, BarChart3, Activity } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

interface Transaction {
  id: string;
  reference: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  status: 'verified' | 'pending' | 'flagged';
  park?: string;
  paymentMethod?: string;
}

// Sample data for charts
const monthlyTransactionData = [
  { name: 'Jan', income: 250000, expense: 185000 },
  { name: 'Feb', income: 260000, expense: 190000 },
  { name: 'Mar', income: 270000, expense: 200000 },
  { name: 'Apr', income: 255000, expense: 195000 },
  { name: 'May', income: 265000, expense: 205000 },
  { name: 'Jun', income: 280000, expense: 210000 },
  { name: 'Jul', income: 295000, expense: 220000 },
  { name: 'Aug', income: 300000, expense: 225000 },
  { name: 'Sep', income: 310000, expense: 230000 },
  { name: 'Oct', income: 320000, expense: 235000 },
  { name: 'Nov', income: 0, expense: 0 },
  { name: 'Dec', income: 0, expense: 0 },
];

const categoryTrendsData = [
  { name: 'Jan', maintenance: 45000, staffing: 90000, conservation: 50000 },
  { name: 'Feb', maintenance: 47000, staffing: 90000, conservation: 53000 },
  { name: 'Mar', maintenance: 49000, staffing: 95000, conservation: 56000 },
  { name: 'Apr', maintenance: 46000, staffing: 93000, conservation: 56000 },
  { name: 'May', maintenance: 48000, staffing: 95000, conservation: 62000 },
  { name: 'Jun', maintenance: 52000, staffing: 95000, conservation: 63000 },
  { name: 'Jul', maintenance: 55000, staffing: 100000, conservation: 65000 },
  { name: 'Aug', maintenance: 57000, staffing: 100000, conservation: 68000 },
  { name: 'Sep', maintenance: 59000, staffing: 102000, conservation: 69000 },
  { name: 'Oct', maintenance: 60000, staffing: 105000, conservation: 70000 },
];

const mockTransactions: Transaction[] = [
  { 
    id: '1', 
    reference: 'TRX-001-23', 
    description: 'Staff Salary Payment - October', 
    amount: 125000, 
    type: 'expense', 
    category: 'Staffing', 
    date: '2023-10-28', 
    status: 'verified',
    park: 'Yellowstone',
    paymentMethod: 'Bank Transfer' 
  },
  { 
    id: '2', 
    reference: 'TRX-002-23', 
    description: 'Visitor Entrance Fees', 
    amount: 87500, 
    type: 'income', 
    category: 'Admission', 
    date: '2023-10-27', 
    status: 'verified',
    park: 'Yellowstone',
    paymentMethod: 'Various' 
  },
  { 
    id: '3', 
    reference: 'TRX-003-23', 
    description: 'Equipment Purchase - Trail Maintenance', 
    amount: 32500, 
    type: 'expense', 
    category: 'Maintenance', 
    date: '2023-10-26', 
    status: 'pending',
    park: 'Yellowstone',
    paymentMethod: 'Credit Card' 
  },
  { 
    id: '4', 
    reference: 'TRX-004-23', 
    description: 'Corporate Donation - EcoTech', 
    amount: 50000, 
    type: 'income', 
    category: 'Donation', 
    date: '2023-10-25', 
    status: 'verified',
    park: 'Yosemite',
    paymentMethod: 'Bank Transfer' 
  },
  { 
    id: '5', 
    reference: 'TRX-005-23', 
    description: 'Wildlife Conservation Project Funding', 
    amount: 75000, 
    type: 'expense', 
    category: 'Conservation', 
    date: '2023-10-24', 
    status: 'flagged',
    park: 'Grand Canyon',
    paymentMethod: 'Bank Transfer' 
  },
  { 
    id: '6', 
    reference: 'TRX-006-23', 
    description: 'Government Budget Allocation', 
    amount: 250000, 
    type: 'income', 
    category: 'Budget', 
    date: '2023-10-20', 
    status: 'verified',
    park: 'All Parks',
    paymentMethod: 'Bank Transfer' 
  },
  { 
    id: '7', 
    reference: 'TRX-007-23', 
    description: 'Visitor Center Renovation', 
    amount: 95000, 
    type: 'expense', 
    category: 'Infrastructure', 
    date: '2023-10-18', 
    status: 'pending',
    park: 'Zion',
    paymentMethod: 'Bank Transfer' 
  },
  { 
    id: '8', 
    reference: 'TRX-008-23', 
    description: 'Gift Shop Revenue', 
    amount: 42500, 
    type: 'income', 
    category: 'Retail', 
    date: '2023-10-15', 
    status: 'verified',
    park: 'Acadia',
    paymentMethod: 'Various' 
  },
];

const Transactions = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  
  const filteredTransactions = mockTransactions.filter(transaction => {
    const matchesSearch = transaction.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          transaction.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (transaction.park && transaction.park.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });
  
  const totalIncome = mockTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpense = mockTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const netBalance = totalIncome - totalExpense;
  
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-amber-100 text-amber-800';
      case 'flagged': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'verified': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Calendar className="h-4 w-4" />;
      case 'flagged': return <Flag className="h-4 w-4" />;
      default: return null;
    }
  };
  
  const getTypeColor = (type: string) => {
    switch(type) {
      case 'income': return 'bg-green-100 text-green-800';
      case 'expense': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const handleFlagTransaction = (id: string) => {
    toast.warning("Transaction has been flagged for review.");
  };
  
  const handleVerifyTransaction = (id: string) => {
    toast.success("Transaction has been verified successfully.");
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50">
        <DashboardSidebar />
        
        <div className="flex-1">
          <DashboardHeader 
            title="Financial Transactions"
            subtitle="Audit and verify financial transactions"
          />
          
          <main className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card className="animate-fade-in">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-full bg-green-100">
                        <ArrowUpRight className="h-5 w-5 text-green-600" />
                      </div>
                      <span className="font-medium text-sm">Total Income</span>
                    </div>
                  </div>
                  <div className="text-3xl font-bold mb-1 text-green-600">${totalIncome.toLocaleString()}</div>
                  <p className="text-sm text-gray-500">Current period</p>
                </CardContent>
              </Card>
              
              <Card className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-full bg-blue-100">
                        <ChevronDown className="h-5 w-5 text-blue-600" />
                      </div>
                      <span className="font-medium text-sm">Total Expenses</span>
                    </div>
                  </div>
                  <div className="text-3xl font-bold mb-1 text-blue-600">${totalExpense.toLocaleString()}</div>
                  <p className="text-sm text-gray-500">Current period</p>
                </CardContent>
              </Card>
              
              <Card className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-full bg-primary/10">
                        <DollarSign className="h-5 w-5 text-primary" />
                      </div>
                      <span className="font-medium text-sm">Net Balance</span>
                    </div>
                  </div>
                  <div className={`text-3xl font-bold mb-1 ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${netBalance.toLocaleString()}
                  </div>
                  <p className="text-sm text-gray-500">Current period</p>
                </CardContent>
              </Card>
            </div>
            
            <Tabs defaultValue="all" className="w-full mb-6" onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-2 w-full mb-6">
                <TabsTrigger value="all">Transactions</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="mt-0">
                <Card className="shadow-sm animate-fade-in" style={{ animationDelay: '0.3s' }}>
                  <CardHeader className="pb-2">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                      <div>
                        <CardTitle>Financial Transactions</CardTitle>
                        <CardDescription>Audit and manage all financial transactions</CardDescription>
                      </div>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Download className="h-4 w-4" />
                        Export
                      </Button>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <Input
                          placeholder="Search transactions..."
                          className="pl-10"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="income">Income</SelectItem>
                            <SelectItem value="expense">Expense</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="verified">Verified</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="flagged">Flagged</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Reference</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Description</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Park</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Category</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Amount</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                            <th className="text-right py-3 px-4 font-medium text-gray-600">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredTransactions.map((transaction, index) => (
                            <tr 
                              key={transaction.id} 
                              className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                            >
                              <td className="py-3 px-4 font-medium">{transaction.reference}</td>
                              <td className="py-3 px-4">
                                <div className="max-w-xs truncate">{transaction.description}</div>
                              </td>
                              <td className="py-3 px-4 text-sm">
                                {transaction.park || '-'}
                              </td>
                              <td className="py-3 px-4">
                                <Badge variant="outline" className={getTypeColor(transaction.type)}>
                                  <span className="capitalize">{transaction.category}</span>
                                </Badge>
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-500">{transaction.date}</td>
                              <td className={`py-3 px-4 font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-blue-600'}`}>
                                {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                              </td>
                              <td className="py-3 px-4">
                                <Badge variant="outline" className={getStatusColor(transaction.status)}>
                                  <span className="flex items-center gap-1">
                                    {getStatusIcon(transaction.status)}
                                    <span className="capitalize">{transaction.status}</span>
                                  </span>
                                </Badge>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreVertical className="h-4 w-4" />
                                      <span className="sr-only">Open menu</span>
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleVerifyTransaction(transaction.id)}>
                                      <CheckCircle className="mr-2 h-4 w-4" />
                                      Verify Transaction
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleFlagTransaction(transaction.id)}>
                                      <Flag className="mr-2 h-4 w-4" />
                                      Flag for Review
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <FileText className="mr-2 h-4 w-4" />
                                      View Details
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      
                      {filteredTransactions.length === 0 && (
                        <div className="text-center py-12">
                          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                          <h3 className="text-lg font-medium text-gray-900 mb-1">No transactions found</h3>
                          <p className="text-gray-500">
                            {searchTerm || typeFilter !== 'all' || statusFilter !== 'all'
                              ? "No transactions match your search criteria" 
                              : "No transactions have been recorded yet"}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t pt-4">
                    <div className="text-sm text-gray-500">
                      Showing {filteredTransactions.length} of {mockTransactions.length} transactions
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Previous</Button>
                      <Button variant="outline" size="sm">Next</Button>
                    </div>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="analytics" className="mt-0">
                <div className="grid grid-cols-1 gap-6">
                  <Card className="shadow-sm animate-fade-in" style={{ animationDelay: '0.4s' }}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Income vs Expenses</CardTitle>
                          <CardDescription>Monthly financial overview</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-green-100 text-green-800">Income</Badge>
                          <Badge variant="outline" className="bg-blue-100 text-blue-800">Expense</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                            data={monthlyTransactionData}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                            <Legend />
                            <Area 
                              type="monotone" 
                              dataKey="income" 
                              name="Income" 
                              stroke="#22c55e" 
                              fill="#22c55e" 
                              fillOpacity={0.2} 
                            />
                            <Area 
                              type="monotone" 
                              dataKey="expense" 
                              name="Expense" 
                              stroke="#3b82f6" 
                              fill="#3b82f6" 
                              fillOpacity={0.2} 
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="shadow-sm animate-fade-in" style={{ animationDelay: '0.5s' }}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Expense Categories</CardTitle>
                          <CardDescription>Expense breakdown by category over time</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" className="gap-2">
                          <BarChart3 className="h-4 w-4" />
                          Change View
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={categoryTrendsData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                            <Legend />
                            <Line 
                              type="monotone" 
                              dataKey="maintenance" 
                              name="Maintenance" 
                              stroke="#8884d8" 
                              strokeWidth={2}
                              activeDot={{ r: 8 }} 
                            />
                            <Line 
                              type="monotone" 
                              dataKey="staffing" 
                              name="Staffing" 
                              stroke="#f59e0b" 
                              strokeWidth={2}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="conservation" 
                              name="Conservation" 
                              stroke="#10b981" 
                              strokeWidth={2}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="shadow-sm animate-fade-in" style={{ animationDelay: '0.6s' }}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Audit Statistics</CardTitle>
                          <CardDescription>Summary of audit activity</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gray-50 rounded-lg p-6">
                          <div className="flex items-center gap-4 mb-3">
                            <div className="p-3 rounded-full bg-green-100">
                              <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                              <h3 className="text-lg font-medium">Verified</h3>
                              <p className="text-sm text-gray-500">Transactions</p>
                            </div>
                          </div>
                          <div className="text-3xl font-bold">{mockTransactions.filter(t => t.status === 'verified').length}</div>
                          <p className="text-sm text-gray-500 mt-2">
                            {((mockTransactions.filter(t => t.status === 'verified').length / mockTransactions.length) * 100).toFixed(0)}% of all transactions
                          </p>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-6">
                          <div className="flex items-center gap-4 mb-3">
                            <div className="p-3 rounded-full bg-amber-100">
                              <Calendar className="h-6 w-6 text-amber-600" />
                            </div>
                            <div>
                              <h3 className="text-lg font-medium">Pending</h3>
                              <p className="text-sm text-gray-500">Transactions</p>
                            </div>
                          </div>
                          <div className="text-3xl font-bold">{mockTransactions.filter(t => t.status === 'pending').length}</div>
                          <p className="text-sm text-gray-500 mt-2">
                            {((mockTransactions.filter(t => t.status === 'pending').length / mockTransactions.length) * 100).toFixed(0)}% of all transactions
                          </p>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-6">
                          <div className="flex items-center gap-4 mb-3">
                            <div className="p-3 rounded-full bg-red-100">
                              <Flag className="h-6 w-6 text-red-600" />
                            </div>
                            <div>
                              <h3 className="text-lg font-medium">Flagged</h3>
                              <p className="text-sm text-gray-500">Transactions</p>
                            </div>
                          </div>
                          <div className="text-3xl font-bold">{mockTransactions.filter(t => t.status === 'flagged').length}</div>
                          <p className="text-sm text-gray-500 mt-2">
                            {((mockTransactions.filter(t => t.status === 'flagged').length / mockTransactions.length) * 100).toFixed(0)}% of all transactions
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Transactions;
