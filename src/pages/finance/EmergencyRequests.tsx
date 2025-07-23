import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider } from '@/components/ui/sidebar';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Plus, Search, Filter, Eye, Edit2, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { toast } from 'sonner';
import { PrintDownloadTable } from '@/components/ui/PrintDownloadTable';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';


const EmergencyRequests = () => {
  const navigate = useNavigate();
  
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [parkFilter, setParkFilter] = useState('all');
  const [dateRange, setDateRange] = useState({
    from: undefined,
    to: undefined,
  });
  const [loading, setLoading] = useState(true);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateFormData, setUpdateFormData] = useState({
    title: '',
    description: '',
    amount: '',
    parkName: '',
    emergencyType: '',
    justification: '',
    timeframe: ''
  });
  const [updateFormErrors, setUpdateFormErrors] = useState({});

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/finance/emergency-requests', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch emergency requests');
        }
        
        const data = await response.json();
        setRequests(data);
        applyFilters(activeTab, parkFilter, searchTerm, dateRange, data);
      } catch (error: any) {
        toast.error(error.message || 'Failed to load emergency requests');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRequests();
  }, []);

  // Handle filter changes
  const handleFilterChange = (status: string) => {
    setActiveTab(status);
    applyFilters(status, parkFilter, searchTerm, dateRange, requests);
  };
  
  // Handle park filter change
  const handleParkFilterChange = (park: string) => {
    setParkFilter(park);
    applyFilters(activeTab, park, searchTerm, dateRange, requests);
  };
  
  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    applyFilters(activeTab, parkFilter, term, dateRange, requests);
  };
  
  // Handle date range change
  const handleDateRangeChange = (range: { from?: Date; to?: Date }) => {
    setDateRange({ from: range.from ?? undefined, to: range.to ?? undefined });
    applyFilters(activeTab, parkFilter, searchTerm, range, requests);
  };
  
  // Apply all filters
  const applyFilters = (
    status: string, 
    park: string, 
    term: string, 
    dates: { from?: Date; to?: Date },
    data: any[]
  ) => {
    let filtered = data;
    
    // Apply status filter
    if (status !== 'all') {
      filtered = filtered.filter(request => request.status === status);
    }
    
    // Apply park filter
    if (park !== 'all') {
      filtered = filtered.filter(request => request.parkName === park);
    }
    
    // Apply search filter
    if (term) {
      filtered = filtered.filter(request => 
        request.title.toLowerCase().includes(term.toLowerCase()) ||
        request.emergencyType.toLowerCase().includes(term.toLowerCase()) ||
        (request.description && request.description.toLowerCase().includes(term.toLowerCase()))
      );
    }
    
    // Apply date filter
    if (dates.from && dates.to) {
      filtered = filtered.filter(request => {
        if (!request.submittedDate) return false;
        const requestDate = new Date(request.submittedDate);
        return requestDate >= dates.from! && requestDate <= dates.to!;
      });
    }
    
    setFilteredRequests(filtered);
  };
  
  // Open view dialog
  const openViewDialog = (request: any) => {
    setSelectedRequest(request);
    setIsViewDialogOpen(true);
  };
  
  // Open update dialog
  const openUpdateDialog = (request: any) => {
    setSelectedRequest(request);
    setUpdateFormData({
      title: request.title,
      description: request.description,
      amount: request.amount.toString(),
      parkName: request.parkName,
      emergencyType: request.emergencyType,
      justification: request.justification,
      timeframe: request.timeframe
    });
    setIsUpdateDialogOpen(true);
  };
  
  // Handle update form input changes
  const handleUpdateFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string,
    field?: string
  ) => {
    if (typeof e === 'string' && field) {
      // Handle Select component changes
      setUpdateFormData(prev => ({
        ...prev,
        [field]: e
      }));
    } else if (typeof e === 'object' && e !== null && 'target' in e) {
      // Handle regular input changes
      const { name, value } = e.target;
      setUpdateFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Handle update form submission
  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const response = await fetch(
        `http://localhost:5000/api/finance/emergency-requests/${selectedRequest.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(updateFormData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update emergency request');
      }

      const data = await response.json();
      
      // Update the requests list with the updated request
      setRequests(prevRequests =>
        prevRequests.map(req =>
          req.id === selectedRequest.id ? data.request : req
        )
      );

      // Update filtered requests
      setFilteredRequests(prevFiltered =>
        prevFiltered.map(req =>
          req.id === selectedRequest.id ? data.request : req
        )
      );

      setIsUpdateDialogOpen(false);
      toast.success('Emergency request updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update emergency request');
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-amber-500 hover:bg-amber-600">Pending Approval</Badge>;
      case 'approved':
        return <Badge className="bg-green-500 hover:bg-green-600">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500 hover:bg-red-600">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  // Get timeframe badge
  const getTimeframeBadge = (timeframe: string) => {
    switch (timeframe) {
      case 'immediate':
        return <Badge className="bg-red-500 hover:bg-red-600">Immediate</Badge>;
      case 'urgent':
        return <Badge className="bg-amber-500 hover:bg-amber-600">Urgent</Badge>;
      case 'high':
        return <Badge className="bg-orange-500 hover:bg-orange-600">High Priority</Badge>;
      case 'standard':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Standard</Badge>;
      default:
        return <Badge>{timeframe}</Badge>;
    }
  };
  
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50 w-full">
        <DashboardSidebar />
        
        <div className="flex-1">
          <DashboardHeader 
            title="Emergency Fund Requests"
            subtitle="Create and manage emergency funding requests"
          />
          
          <main className="p-6">
            <Card className="mb-6">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div>
                    <CardTitle>Emergency Requests</CardTitle>
                    <CardDescription>
                      Manage and track emergency funding requests for parks
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                  <Button onClick={() => navigate('/finance/emergency-requests/new')} className="bg-amber-600 hover:bg-amber-700">
                    <Plus className="h-4 w-4 mr-2" />
                    New Emergency Request
                  </Button>
                    <PrintDownloadTable
                      tableId="emergency-requests-table"
                      title="Emergency Requests Report"
                      filename="emergency_requests_report"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                  <div className="flex items-center gap-2 w-full md:w-1/3">
                    <Search className="h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Search requests..."
                      value={searchTerm}
                      onChange={handleSearch}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4">
                    <DateRangePicker
                      onSelect={handleDateRangeChange}
                    />
                    
                    <Select
                      onValueChange={handleParkFilterChange}
                      defaultValue="all"
                    >
                      <SelectTrigger className="w-[160px]">
                        <div className="flex items-center gap-2">
                          <Filter className="h-4 w-4" />
                          <SelectValue placeholder="Filter by Park" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Volcanoes National Park">Volcanoes National Park</SelectItem>
                        <SelectItem value="Nyungwe National Park">Nyungwe National Park</SelectItem>
                        <SelectItem value="Akagera National Park">Akagera National Park</SelectItem>
                        <SelectItem value="Gishwati-Mukura National Park">Gishwati-Mukura National Park</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Tabs defaultValue="all" className="w-full" onValueChange={handleFilterChange}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="all">All Requests</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="approved">Approved</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="all" className="mt-6">
                    <div className="rounded-md border">
                      <div id="emergency-requests-table">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Request ID</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Park</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Emergency Type</TableHead>
                            <TableHead>Timeframe</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                              <TableHead className="no-print">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {loading ? (
                            <TableRow>
                              <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                                Loading...
                              </TableCell>
                            </TableRow>
                          ) : filteredRequests.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                                No emergency requests found
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredRequests.map((request) => (
                              <TableRow key={request.id}>
                                <TableCell>{request.id}</TableCell>
                                <TableCell className="font-medium max-w-xs truncate">{request.title}</TableCell>
                                <TableCell>{request.parkName}</TableCell>
                                <TableCell>${request.amount.toLocaleString()}</TableCell>
                                <TableCell>{request.emergencyType}</TableCell>
                                <TableCell>{getTimeframeBadge(request.timeframe)}</TableCell>
                                <TableCell>{getStatusBadge(request.status)}</TableCell>
                                <TableCell>{request.submittedDate || '-'}</TableCell>
                                  <TableCell className="no-print">
                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => openViewDialog(request)}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => openUpdateDialog(request)}
                                    >
                                      <Edit2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="pending" className="mt-6">
                    <div className="rounded-md border">
                      <div id="emergency-requests-table">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Request ID</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Park</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Emergency Type</TableHead>
                            <TableHead>Timeframe</TableHead>
                            <TableHead>Submitted Date</TableHead>
                              <TableHead className="no-print">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {loading ? (
                            <TableRow>
                              <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                                Loading...
                              </TableCell>
                            </TableRow>
                          ) : filteredRequests.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                                No pending requests found
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredRequests.map((request) => (
                              <TableRow key={request.id}>
                                <TableCell>{request.id}</TableCell>
                                <TableCell className="font-medium max-w-xs truncate">{request.title}</TableCell>
                                <TableCell>{request.parkName}</TableCell>
                                <TableCell>${request.amount.toLocaleString()}</TableCell>
                                <TableCell>{request.emergencyType}</TableCell>
                                <TableCell>{getTimeframeBadge(request.timeframe)}</TableCell>
                                <TableCell>{request.submittedDate}</TableCell>
                                  <TableCell className="no-print">
                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => openViewDialog(request)}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => openUpdateDialog(request)}
                                    >
                                      <Edit2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="approved" className="mt-6">
                    <div className="rounded-md border">
                      <div id="emergency-requests-table">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Request ID</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Park</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Emergency Type</TableHead>
                            <TableHead>Timeframe</TableHead>
                            <TableHead>Submitted Date</TableHead>
                              <TableHead className="no-print">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {loading ? (
                            <TableRow>
                              <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                                Loading...
                              </TableCell>
                            </TableRow>
                          ) : filteredRequests.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                                No approved requests found
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredRequests.map((request) => (
                              <TableRow key={request.id}>
                                <TableCell>{request.id}</TableCell>
                                <TableCell className="font-medium max-w-xs truncate">{request.title}</TableCell>
                                <TableCell>{request.parkName}</TableCell>
                                <TableCell>${request.amount.toLocaleString()}</TableCell>
                                <TableCell>{request.emergencyType}</TableCell>
                                <TableCell>{getTimeframeBadge(request.timeframe)}</TableCell>
                                <TableCell>{request.submittedDate}</TableCell>
                                  <TableCell className="no-print">
                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => openViewDialog(request)}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => openUpdateDialog(request)}
                                    >
                                      <Edit2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
      
      {/* View Request Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader className="">
            <div className="flex items-center gap-3 text-amber-500 mb-1">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-sm font-medium ">Emergency Request</span>
            </div>
            <DialogTitle>{selectedRequest?.title}</DialogTitle>
            <DialogDescription>
              Request ID: {selectedRequest?.id}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4 ">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Park</h4>
                <p>{selectedRequest?.parkName}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Amount</h4>
                <p>${selectedRequest?.amount?.toLocaleString()}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Emergency Type</h4>
                <p>{selectedRequest?.emergencyType}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Timeframe</h4>
                <p>{selectedRequest?.timeframe && getTimeframeBadge(selectedRequest.timeframe)}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Status</h4>
                <p>{selectedRequest?.status && getStatusBadge(selectedRequest.status)}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Submitted Date</h4>
                <p>{selectedRequest?.submittedDate || 'Not submitted yet'}</p>
              </div>
            
            
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Description</h4>
              <p className="text-sm w-[100px] word-wrap">{selectedRequest?.description}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Justification</h4>
              <p className="text-sm w-[100px]">{selectedRequest?.justification}</p>
            </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <div className="flex items-center gap-3 text-amber-500 mb-1">
              <Edit2 className="h-5 w-5" />
              <span className="text-sm font-medium">Update Emergency Request</span>
            </div>
            <DialogTitle>Update Request Details</DialogTitle>
            <DialogDescription>
              Make changes to your emergency request here
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdateSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={updateFormData.title}
                  onChange={handleUpdateFormChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount ($)</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={updateFormData.amount}
                  onChange={handleUpdateFormChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergencyType">Emergency Type</Label>
                <Select
                  value={updateFormData.emergencyType}
                  onValueChange={(value) => handleUpdateFormChange(value, 'emergencyType')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="natural-disaster">Natural Disaster</SelectItem>
                    <SelectItem value="equipment-failure">Equipment Failure</SelectItem>
                    <SelectItem value="infrastructure">Infrastructure</SelectItem>
                    <SelectItem value="wildlife-emergency">Wildlife Emergency</SelectItem>
                    <SelectItem value="security-threat">Security Threat</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeframe">Timeframe</Label>
                <Select
                  value={updateFormData.timeframe}
                  onValueChange={(value) => handleUpdateFormChange(value, 'timeframe')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High Priority</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={updateFormData.description}
                  onChange={handleUpdateFormChange}
                  required
                  className="min-h-[100px]"
                />
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="justification">Justification</Label>
                <Textarea
                  id="justification"
                  name="justification"
                  value={updateFormData.justification}
                  onChange={handleUpdateFormChange}
                  required
                  className="min-h-[100px]"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsUpdateDialogOpen(false)}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-amber-600 hover:bg-amber-700"
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Request'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default EmergencyRequests;