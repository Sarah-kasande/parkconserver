import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider } from '@/components/ui/sidebar';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Download, FileText, Filter, Search } from 'lucide-react';
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
  // phone: string;
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

const InvoiceView = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState<FinanceData>({
    tours: [],
    donations: [],
    fund_requests: [],
    extra_funds_requests: [],
    emergency_requests: [],
    budgets: [],
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBudgetItems, setSelectedBudgetItems] = useState<BudgetItem[] | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [dialogType, setDialogType] = useState<string | null>(null);

  // Fetch data from the Flask API
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

  // Filter functions
  const filterData = <T extends object>(items: T[], searchFields: string[], statusField?: string) => {
    return items.filter((item) => {
      const searchMatch = searchFields.some((field) =>
        String((item as any)[field]).toLowerCase().includes(searchTerm.toLowerCase())
      );
      const statusMatch =
        statusFilter === 'all' || (statusField && (item as any)[statusField].toLowerCase() === statusFilter.toLowerCase());
      const categoryMatch =
        categoryFilter === 'all' ||
        (item as any).category?.toLowerCase() === categoryFilter.toLowerCase() ||
        (item as any).emergency_type?.toLowerCase() === categoryFilter.toLowerCase();
      return searchMatch && statusMatch && categoryMatch;
    });
  };

  // Get unique categories for filter dropdown
  const getCategories = (items: any[], categoryField: string) => {
    return ['all', ...new Set(items.map((item) => item[categoryField]?.toLowerCase()).filter(Boolean))];
  };

  // Status badge color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Handle view details
  const viewDetails = (record: any, type: string) => {
    setSelectedRecord(record);
    setDialogType(type);
  };

  // Handle budget items view
  const viewBudgetItems = (items: BudgetItem[]) => {
    setSelectedBudgetItems(items);
  };

  // Render details dialog content
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
        // { label: 'Phone', key: 'phone' },
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
            <DialogTitle>{dialogType.charAt(0).toUpperCase() + dialogType.slice(1).replace('_', ' ')} Details</DialogTitle>
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

  // Render table for each tab
  const renderTable = (
    items: any[],
    headers: string[],
    fields: string[],
    keyField: string,
    searchFields: string[],
    statusField?: string,
    categories?: string[],
    type?: string,
    downloadFields?: string[],
    downloadHeaders?: string[],
    renderCell?: (item: any, field: string) => React.ReactNode
  ) => {
    const filteredItems = filterData(items, searchFields, statusField);
    return (
      <>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-4">
            {statusField && (
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            )}
            {categories && (
              <div className="flex items-center gap-2">
                <select
                  className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {categories
                    .filter((cat) => cat !== 'all')
                    .map((category) => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                </select>
              </div>
            )}
            <TableDownloadButton
              data={filteredItems}
              filename={type}
              fields={downloadFields}
              headers={downloadHeaders}
            />
          </div>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {headers.map((header) => (
                  <TableHead key={header}>{header}</TableHead>
                ))}
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <TableRow key={item[keyField]}>
                    {fields.map((field) => (
                      <TableCell key={field}>
                        {renderCell ? renderCell(item, field) : (item[field] ?? 'N/A')}
                      </TableCell>
                    ))}
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => viewDetails(item, type)}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      {type === 'budgets' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => viewBudgetItems(item.items)}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          View Items
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={headers.length + 1} className="text-center py-6 text-gray-500">
                    No data found matching your search criteria
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
          <div>
            Showing {filteredItems.length} of {items.length} records
          </div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          </div>
        </div>
      </>
    );
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50 w-full">
        <DashboardSidebar />
        <div className="flex-1">
          <DashboardHeader title="Auditor Invoices" subtitle="View and manage financial data" />
          <main className="p-6">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Invoice Overview</CardTitle>
              </CardHeader>
              <CardContent>
                {loading && <div>Loading...</div>}
                {error && <div className="text-red-500">{error}</div>}
                {!loading && !error && (
                  <Tabs defaultValue="tours" className="w-full">
                    <TabsList className="grid w-full grid-cols-6">
                      <TabsTrigger value="tours">Tours</TabsTrigger>
                      <TabsTrigger value="donations">Donations</TabsTrigger>
                      <TabsTrigger value="fund_requests">Fund Requests</TabsTrigger>
                      <TabsTrigger value="extra_funds">Extra Funds</TabsTrigger>
                      <TabsTrigger value="emergency_requests">Emergency Requests</TabsTrigger>
                      <TabsTrigger value="budgets">Budgets</TabsTrigger>
                    </TabsList>

                    {/* Tours Tab */}
                    <TabsContent value="tours">
                      {renderTable(
                        data.tours,
                        ['ID', 'Park', 'Tour Name', 'Date', 'Guests', 'Amount', 'Customer', 'Email'],
                        ['id', 'park_name', 'tour_name', 'date', 'guests', 'amount', 'first_name', 'email'],
                        'id',
                        ['id', 'park_name', 'tour_name', 'first_name', 'last_name', 'email'],
                        undefined,
                        undefined,
                        'tours',
                        ['id', 'park_name', 'tour_name', 'date', 'time', 'guests', 'amount', 'first_name', 'last_name', 'email', 'phone', 'special_requests', 'created_at'],
                        ['ID', 'Park Name', 'Tour Name', 'Date', 'Time', 'Guests', 'Amount', 'First Name', 'Last Name', 'Email', 'Phone', 'Special Requests', 'Created At'],
                        (item, field) => {
                          if (field === 'amount') {
                            return `$${item[field].toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}`;
                          }
                          if (field === 'first_name') {
                            return `${item.first_name} ${item.last_name}`;
                          }
                          return item[field];
                        }
                      )}
                    </TabsContent>

                    {/* Donations Tab */}
                    <TabsContent value="donations">
                      {renderTable(
                        data.donations,
                        ['ID', 'Type', 'Amount', 'Park', 'Donor', 'Email', 'Message'],
                        ['id', 'donation_type', 'amount', 'park_name', 'first_name', 'email', 'message'],
                        'id',
                        ['id', 'donation_type', 'park_name', 'first_name', 'last_name', 'email', 'message'],
                        undefined,
                        undefined,
                        'donations',
                        ['id', 'donation_type', 'amount', 'park_name', 'first_name', 'last_name', 'email', 'message', 'is_anonymous', 'created_at'],
                        ['ID', 'Donation Type', 'Amount', 'Park Name', 'First Name', 'Last Name', 'Email', 'Message', 'Is Anonymous', 'Created At'],
                        (item, field) => {
                          if (field === 'amount') {
                            return `$${item[field].toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}`;
                          }
                          if (field === 'first_name') {
                            return item.is_anonymous ? 'Anonymous' : `${item.first_name} ${item.last_name}`;
                          }
                          return item[field] ?? '';
                        }
                      )}
                    </TabsContent>

                    {/* Fund Requests Tab */}
                    <TabsContent value="fund_requests">
                      {renderTable(
                        data.fund_requests,
                        ['ID', 'Title', 'Park', 'Category', 'Amount', 'Urgency', 'Status', 'Requested By'],
                        ['id', 'title', 'parkname', 'category', 'amount', 'urgency', 'status', 'first_name'],
                        'id',
                        ['id', 'title', 'parkname', 'category', 'first_name', 'last_name', 'staff_email'],
                        'status',
                        getCategories(data.fund_requests, 'category'),
                        'fund_requests',
                        ['id', 'title', 'description', 'amount', 'category', 'parkname', 'urgency', 'status', 'created_at', 'created_by', 'first_name', 'last_name', 'staff_email', 'staff_park'],
                        ['ID', 'Title', 'Description', 'Amount', 'Category', 'Park Name', 'Urgency', 'Status', 'Created At', 'Created By', 'First Name', 'Last Name', 'Staff Email', 'Staff Park'],
                        (item, field) => {
                          if (field === 'amount') {
                            return `$${item[field].toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}`;
                          }
                          if (field === 'status') {
                            return (
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                  item[field]
                                )}`}
                              >
                                {item[field]}
                              </span>
                            );
                          }
                          if (field === 'first_name') {
                            return `${item.first_name} ${item.last_name}`;
                          }
                          return item[field];
                        }
                      )}
                    </TabsContent>

                    {/* Extra Funds Requests Tab */}
                    <TabsContent value="extra_funds">
                      {renderTable(
                        data.extra_funds_requests,
                        ['ID', 'Title', 'Park', 'Category', 'Amount', 'Status', 'Requested By'],
                        ['id', 'title', 'parkName', 'category', 'amount', 'status', 'first_name'],
                        'id',
                        ['id', 'title', 'parkName', 'category', 'first_name', 'last_name', 'finance_email'],
                        'status',
                        getCategories(data.extra_funds_requests, 'category'),
                        'extra_funds_requests',
                        ['id', 'title', 'description', 'amount', 'parkName', 'category', 'justification', 'expected_duration', 'status', 'created_at', 'created_by', 'first_name', 'last_name', 'finance_email'],
                        ['ID', 'Title', 'Description', 'Amount', 'Park Name', 'Category', 'Justification', 'Expected Duration', 'Status', 'Created At', 'Created By', 'First Name', 'Last Name', 'Finance Email'],
                        (item, field) => {
                          if (field === 'amount') {
                            return `$${item[field].toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}`;
                          }
                          if (field === 'status') {
                            return (
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                  item[field]
                                )}`}
                              >
                                {item[field]}
                              </span>
                            );
                          }
                          if (field === 'first_name') {
                            return `${item.first_name} ${item.last_name}`;
                          }
                          return item[field];
                        }
                      )}
                    </TabsContent>

                    {/* Emergency Requests Tab */}
                    <TabsContent value="emergency_requests">
                      {renderTable(
                        data.emergency_requests,
                        ['ID', 'Title', 'Park', 'Type', 'Amount', 'Status', 'Requested By'],
                        ['id', 'title', 'parkName', 'emergency_type', 'amount', 'status', 'first_name'],
                        'id',
                        ['id', 'title', 'parkName', 'emergency_type', 'first_name', 'last_name', 'finance_email'],
                        'status',
                        getCategories(data.emergency_requests, 'emergency_type'),
                        'emergency_requests',
                        ['id', 'title', 'description', 'amount', 'parkName', 'emergency_type', 'justification', 'timeframe', 'status', 'created_at', 'created_by', 'first_name', 'last_name', 'finance_email'],
                        ['ID', 'Title', 'Description', 'Amount', 'Park Name', 'Emergency Type', 'Justification', 'Timeframe', 'Status', 'Created At', 'Created By', 'First Name', 'Last Name', 'Finance Email'],
                        (item, field) => {
                          if (field === 'amount') {
                            return `$${item[field].toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}`;
                          }
                          if (field === 'status') {
                            return (
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                  item[field]
                                )}`}
                              >
                                {item[field]}
                              </span>
                            );
                          }
                          if (field === 'first_name') {
                            return `${item.first_name} ${item.last_name}`;
                          }
                          return item[field];
                        }
                      )}
                    </TabsContent>

                    {/* Budgets Tab */}
                    <TabsContent value="budgets">
                      {renderTable(
                        data.budgets,
                        ['ID', 'Title', 'Fiscal Year', 'Park', 'Total Amount', 'Status'],
                        ['id', 'title', 'fiscal_year', 'park_name', 'total_amount', 'status'],
                        'id',
                        ['id', 'title', 'park_name', 'created_by_name'],
                        'status',
                        undefined,
                        'budgets',
                        ['id', 'title', 'fiscal_year', 'total_amount', 'park_name', 'description', 'status', 'created_at', 'created_by', 'created_by_name', 'approved_by', 'approved_by_name', 'approved_at'],
                        ['ID', 'Title', 'Fiscal Year', 'Total Amount', 'Park Name', 'Description', 'Status', 'Created At', 'Created By', 'Created By Name', 'Approved By', 'Approved By Name', 'Approved At'],
                        (item, field) => {
                          if (field === 'total_amount') {
                            return `$${item[field].toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}`;
                          }
                          if (field === 'status') {
                            return (
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                  item[field]
                                )}`}
                              >
                                {item[field]}
                              </span>
                            );
                          }
                          return item[field];
                        }
                      )}
                    </TabsContent>
                  </Tabs>
                )}
              </CardContent>
            </Card>

            {/* Budget Items Modal */}
            {selectedBudgetItems && (
              <Dialog open={!!selectedBudgetItems} onOpenChange={() => setSelectedBudgetItems(null)}>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Budget Items</DialogTitle>
                  </DialogHeader>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedBudgetItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.category}</TableCell>
                          <TableCell>{item.description}</TableCell>
                          <TableCell>
                            ${item.amount.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </DialogContent>
              </Dialog>
            )}

            {/* Details Dialog */}
            {renderDetailsDialog()}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default InvoiceView;