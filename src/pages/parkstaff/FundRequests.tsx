import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider } from '@/components/ui/sidebar';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { Search, Plus, DollarSign, Clock, CheckCircle, XCircle, FileText, MoreVertical, Edit, Trash, Eye } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import CreateFundRequestModal from './CreateFundRequestModal';
import { format } from 'date-fns';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

interface FundRequest {
  id: string;
  title: string;
  description: string;
  amount: number;
  category: string;
  urgency: 'low' | 'medium' | 'high';
  status: 'pending' | 'approved' | 'rejected';
  createdBy: string;
  createdAt: string;
  parkname: string;  // Adjusted to match database schema
}

const FundRequests: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editRequest, setEditRequest] = useState<FundRequest | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [requests, setRequests] = useState<FundRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Authentication token missing');
      return;
    }

    const fetchRequests = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_URL}/fund-requests`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRequests(response.data);
      } catch (error) {
        console.error('Error fetching fund requests:', error);
        toast.error('Failed to load fund requests');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [isAuthenticated, user]);

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDate =
      !dateRange?.from ||
      !dateRange?.to ||
      (new Date(request.createdAt) >= dateRange.from && new Date(request.createdAt) <= dateRange.to);

    return activeTab === 'all' ? matchesSearch && matchesDate : matchesSearch && matchesDate && request.status === activeTab;
  });

  const getUrgencyColor = (urgency: string): string => {
    switch (urgency) {
      case 'low':
        return 'bg-blue-100 text-blue-800';
      case 'medium':
        return 'bg-amber-100 text-amber-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string): JSX.Element | null => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const handleCreateRequest = () => {
    setIsEditing(false);
    setEditRequest(null);
    setIsModalOpen(true);
  };

  const handleSubmitRequest = async (formData: any) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Authentication required');
      return;
    }

    try {
      if (isEditing && editRequest) {
        // Update existing request
        const response = await axios.put(`${API_URL}/fund-requests/${editRequest.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRequests(requests.map((req) => (req.id === editRequest.id ? { ...req, ...formData } : req)));
        toast.success('Fund request updated successfully!');
      } else {
        // Create new request
        const response = await axios.post(`${API_URL}/fund-requests`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const newRequest: FundRequest = {
          id: response.data.id.toString(),
          ...formData,
          status: 'pending',
          createdBy: `${user?.firstName} ${user?.lastName}`,
          createdAt: format(new Date(), 'yyyy-MM-dd'),
          parkname: user?.park || 'Unknown',
        };
        setRequests([newRequest, ...requests]);
        toast.success('Fund request submitted successfully!');
      }
      setIsModalOpen(false);
      setEditRequest(null);
    } catch (error) {
      console.error('Error submitting fund request:', error);
      toast.error(`Failed to ${isEditing ? 'update' : 'submit'} fund request`);
    }
  };

  const handleViewDetails = (requestId: string) => {
    const request = requests.find((r) => r.id === requestId);
    if (request) {
      toast.info(`Details for ${request.title}: ${request.description}`);
    }
  };

  const handleEditRequest = (requestId: string) => {
    const requestToEdit = requests.find((r) => r.id === requestId);
    if (!requestToEdit) return;

    setIsEditing(true);
    setEditRequest(requestToEdit);
    setIsModalOpen(true);
  };

  const handleDeleteRequest = async (requestId: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Authentication required');
      return;
    }

    try {
      await axios.delete(`${API_URL}/fund-requests/${requestId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(requests.filter((request) => request.id !== requestId));
      toast.success('Request deleted successfully!');
    } catch (error) {
      console.error('Error deleting fund request:', error);
      toast.error('Failed to delete fund request');
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50 w-full">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col">
          <DashboardHeader title="Fund Requests" subtitle="Request and manage park funding" />
          <main className="flex-1 p-6">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search requests..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button onClick={handleCreateRequest} className="whitespace-nowrap">
                <Plus className="mr-2 h-4 w-4" />
                Create New Request
              </Button>
            </div>

            <div className="mb-6">
              <DateRangePicker date={dateRange} onSelect={setDateRange} className="w-full sm:w-auto" />
            </div>

            <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="all">All Requests</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
              </TabsList>
              <TabsContent value={activeTab} className="mt-0 flex-1">
                <Card className="shadow-sm animate-fade-in h-full flex flex-col">
                  <CardHeader className="pb-2">
                    <CardTitle>Fund Requests</CardTitle>
                    <CardDescription>
                      {activeTab === 'all' ? 'View all funding requests for your park' : `Viewing ${activeTab} funding requests`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-auto">
                    {loading ? (
                      <div className="text-center py-12">Loading...</div>
                    ) : (
                      <div className="space-y-4">
                        {filteredRequests.map((request) => (
                          <div
                            key={request.id}
                            className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                <div className="bg-primary/10 p-2 rounded-md">
                                  <DollarSign className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                  <h3 className="font-medium">{request.title}</h3>
                                  <p className="text-sm text-gray-500">Created on {request.createdAt}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={getUrgencyColor(request.urgency)}>
                                  {request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1)} Priority
                                </Badge>
                                <Badge className={getStatusColor(request.status)} variant="outline">
                                  <span className="flex items-center gap-1">
                                    {getStatusIcon(request.status)}
                                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                  </span>
                                </Badge>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreVertical className="h-4 w-4" />
                                      <span className="sr-only">Open menu</span>
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleViewDetails(request.id)}>
                                      <Eye className="mr-2 h-4 w-4" />
                                      View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleEditRequest(request.id)}>
                                      <Edit className="mr-2 h-4 w-4" />
                                      Edit Request
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleDeleteRequest(request.id)}
                                      className="text-red-600"
                                    >
                                      <Trash className="mr-2 h-4 w-4" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{request.description}</p>
                            <div className="flex flex-wrap justify-between gap-2">
                              <div className="flex items-center gap-4">
                                <div>
                                  <span className="text-xs text-gray-500">Category</span>
                                  <p className="text-sm font-medium">{request.category}</p>
                                </div>
                                <div>
                                  <span className="text-xs text-gray-500">Park</span>
                                  <p className="text-sm font-medium">{request.parkname}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="text-right">
                                  <span className="text-xs text-gray-500">Requested Amount</span>
                                  <p className="text-lg font-semibold text-primary">
                                    ${request.amount.toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        {filteredRequests.length === 0 && (
                          <div className="text-center py-12">
                            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                            <h3 className="text-lg font-medium text-gray-900 mb-1">No requests found</h3>
                            <p className="text-gray-500">
                              {searchTerm
                                ? 'No requests match your search criteria'
                                : 'Create a new funding request to get started'}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between border-t pt-4">
                    <div className="text-sm text-gray-500">
                      Showing {filteredRequests.length} of {requests.length} requests
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" disabled>
                        Previous
                      </Button>
                      <Button variant="outline" size="sm" disabled>
                        Next
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>

      <CreateFundRequestModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditRequest(null);
          setIsEditing(false);
        }}
        onSubmit={handleSubmitRequest}
        initialData={editRequest} // Pass initial data for editing
      />
    </SidebarProvider>
  );
};

export default FundRequests;