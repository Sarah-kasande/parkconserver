import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider } from '@/components/ui/sidebar';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, Plus, Edit2, Loader2 } from 'lucide-react';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { toast } from 'sonner';
import { PrintDownloadTable } from '@/components/ui/PrintDownloadTable';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ExtraFundRequest {
  id: string;
  title: string;
  description: string;
  amount: number;
  parkName: string;
  category: string;
  justification: string;
  expectedDuration: string;
  status: string;
  dateSubmitted: string;
  submittedBy: string;
  parkId?: string;
}

const ExtraFunds = () => {
  const parkTours = [
    {
      id: 1,
      name: 'Volcanoes National Park',
      features: ['Mountain Gorillas', 'Volcanoes', 'Golden Monkeys']
    },
    {
      id: 2,
      name: 'Nyungwe National Park',
      features: ['Canopy Walkway', 'Chimpanzees', 'Rainforest']
    },
    {
      id: 3,
      name: 'Akagera National Park',
      features: ['Big Five', 'Savannah', 'Lakes']
    },
    {
      id: 4,
      name: 'Gishwati-Mukura National Park',
      features: ['Primates', 'Bird Watching', 'Restored Forest']
    }
  ];

  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [parkFilter, setParkFilter] = useState('all');
  const [dateRange, setDateRange] = useState<any>(undefined);
  const [requests, setRequests] = useState<ExtraFundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ExtraFundRequest | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateFormData, setUpdateFormData] = useState({
    title: '',
    description: '',
    amount: '',
    parkName: '',
    category: '',
    justification: '',
    expectedDuration: '',
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof typeof updateFormData, string>>>({});
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/finance/extra-funds', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch extra funds requests');
        }
        
        const data = await response.json();
        setRequests(data);
      } catch (error: any) {
        toast.error(error.message || 'Failed to load extra funds requests');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRequests();
  }, []);

  const validateForm = () => {
    const errors: Partial<Record<keyof typeof updateFormData, string>> = {};
    if (!updateFormData.title.trim()) errors.title = 'Title is required';
    if (!updateFormData.description.trim()) errors.description = 'Description is required';
    if (!updateFormData.amount || isNaN(Number(updateFormData.amount)) || Number(updateFormData.amount) <= 0) {
      errors.amount = 'Valid amount is required';
    }
    if (!updateFormData.parkName) errors.parkName = 'Park selection is required';
    if (!updateFormData.category) errors.category = 'Category is required';
    if (!updateFormData.justification.trim()) errors.justification = 'Justification is required';
    if (!updateFormData.expectedDuration) errors.expectedDuration = 'Expected duration is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleDateRangeSelect = useCallback((range: any | undefined) => {
    setDateRange(range);
  }, []);

  const filteredRequests = requests.filter((request: ExtraFundRequest) => {
    const matchesSearch = 
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.parkName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    const matchesPark = parkFilter === 'all' || request.parkName === parkFilter;
    
    let matchesDate = true;
    if (dateRange && dateRange.from && dateRange.to) {
      const requestDate = new Date(request.dateSubmitted);
      matchesDate = requestDate >= dateRange.from && requestDate <= dateRange.to;
    }
    
    return matchesSearch && matchesStatus && matchesPark && matchesDate;
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const handleCreateNew = () => {
    navigate('/finance/extra-funds/new');
  };

  const handleViewDetails = (request: ExtraFundRequest) => {
    setSelectedRequest(request);
    setIsViewDialogOpen(true);
  };

  const handleUpdateClick = (request: ExtraFundRequest) => {
    setSelectedRequest(request);
    setUpdateFormData({
      title: request.title,
      description: request.description,
      amount: request.amount.toString(),
      parkName: request.parkName,
      category: request.category,
      justification: request.justification,
      expectedDuration: request.expectedDuration,
    });
    setFormErrors({});
    setIsUpdateDialogOpen(true);
  };

  const handleUpdateFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { name: string; value: string }
  ) => {
    let name: string;
    let value: string;

    if ('target' in e) {
      name = e.target.name;
      value = e.target.value;
    } else {
      name = e.name;
      value = e.value;
    }

    setUpdateFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field
    setFormErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the form errors before submitting');
      return;
    }

    if (!selectedRequest) {
      toast.error('No request selected for update');
      return;
    }

    setIsUpdating(true);

    try {
      const requestId = parseInt(selectedRequest.id.replace(/\D/g, ''), 10);

      const response = await fetch(
        `http://localhost:5000/api/finance/extra-funds/${requestId}`,
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
        throw new Error(errorData.error || 'Failed to update request');
      }

      const data = await response.json();

      // Update the requests list
      setRequests((prevRequests) =>
        prevRequests.map((req) =>
          req.id === selectedRequest.id ? { ...data.request, submittedBy: req.submittedBy } : req
        )
      );

      setIsUpdateDialogOpen(false);
      setSelectedRequest(null);
      setUpdateFormData({
        title: '',
        description: '',
        amount: '',
        parkName: '',
        category: '',
        justification: '',
        expectedDuration: '',
      });
      toast.success('Extra funds request updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update request');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50 w-full">
        <DashboardSidebar />
        
        <div className="flex-1">
          <DashboardHeader 
            title="Extra Funds Requests"
            subtitle="Manage additional funding requests"
          />
          
          <main className="p-6">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <Button variant="default" onClick={handleCreateNew} className="gap-2">
                  <Plus className="h-5 w-5" />
                  Create New Request
                </Button>
              </div>
              
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search requests..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <CardTitle>Filters</CardTitle>
                <CardDescription>Filter extra funds requests by status, park, and date</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Status</label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Park</label>
                    <Select value={parkFilter} onValueChange={setParkFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select park" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Parks</SelectItem>
                        {parkTours.map((park) => (
                          <SelectItem key={park.id} value={park.name}>
                            {park.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Date Range</label>
                      <DateRangePicker 
                        date={dateRange} 
                        onSelect={handleDateRangeSelect} 
                        className="w-full sm:w-auto"
                      />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                <CardTitle>Extra Funds Requests</CardTitle>
                    <CardDescription>Showing {filteredRequests.length} requests</CardDescription>
                  </div>
                  <PrintDownloadTable
                    tableId="extra-funds-table"
                    title="Extra Funds Requests Report"
                    filename="extra_funds_requests_report"
                  />
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-12">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-gray-500" />
                    <p className="text-gray-500 mt-2">Loading...</p>
                  </div>
                ) : filteredRequests.length > 0 ? (
                  <div id="extra-funds-table">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>Park</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Submitted Date</TableHead>
                          <TableHead>Submitted By</TableHead>
                          <TableHead className="no-print">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRequests.map((request) => (
                          <TableRow key={request.id}>
                            <TableCell>{request.id}</TableCell>
                            <TableCell>{request.title}</TableCell>
                            <TableCell>{request.parkName}</TableCell>
                            <TableCell>${request.amount.toLocaleString()}</TableCell>
                            <TableCell>
                            <Badge className={getStatusBadgeColor(request.status)}>
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </Badge>
                            </TableCell>
                            <TableCell>{new Date(request.dateSubmitted).toLocaleDateString()}</TableCell>
                            <TableCell>{request.submittedBy}</TableCell>
                            <TableCell className="no-print">
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-2"
                                  onClick={() => handleViewDetails(request)}
                                >
                            <FileText className="h-4 w-4" />
                                  View
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-2"
                                  onClick={() => handleUpdateClick(request)}
                                  disabled={request.status !== 'pending'}
                                >
                                  <Edit2 className="h-4 w-4" />
                                  Update
                          </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                    ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No requests found</h3>
                    <p className="text-gray-500">Try adjusting your filters or create a new request</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-4">
                <div className="text-sm text-gray-500">Showing {filteredRequests.length} requests</div>
              </CardFooter>
            </Card>
          </main>
        </div>
      </div>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Extra Funds Request Details</DialogTitle>
            <DialogDescription>
              View the details of the extra funds request
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">ID</Label>
                <div className="col-span-3">{selectedRequest.id}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Title</Label>
                <div className="col-span-3">{selectedRequest.title}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Description</Label>
                <div className="col-span-3">{selectedRequest.description}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Amount</Label>
                <div className="col-span-3">${selectedRequest.amount.toLocaleString()}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Park</Label>
                <div className="col-span-3">{selectedRequest.parkName}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Category</Label>
                <div className="col-span-3">{selectedRequest.category}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Justification</Label>
                <div className="col-span-3">{selectedRequest.justification}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Expected Duration</Label>
                <div className="col-span-3">{selectedRequest.expectedDuration}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Status</Label>
                <div className="col-span-3">
                  <Badge className={getStatusBadgeColor(selectedRequest.status)}>
                    {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Submitted Date</Label>
                <div className="col-span-3">
                  {new Date(selectedRequest.dateSubmitted).toLocaleDateString()}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Submitted By</Label>
                <div className="col-span-3">{selectedRequest.submittedBy}</div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={(open) => {
        setIsUpdateDialogOpen(open);
        if (!open) {
          setSelectedRequest(null);
          setUpdateFormData({
            title: '',
            description: '',
            amount: '',
            parkName: '',
            category: '',
            justification: '',
            expectedDuration: '',
          });
          setFormErrors({});
        }
      }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Update Extra Funds Request</DialogTitle>
            <DialogDescription>
              Make changes to your extra funds request. All fields are required.
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
                  aria-invalid={!!formErrors.title}
                  aria-describedby={formErrors.title ? 'title-error' : undefined}
                />
                {formErrors.title && (
                  <p id="title-error" className="text-sm text-red-600">
                    {formErrors.title}
                  </p>
                )}
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
                  aria-invalid={!!formErrors.amount}
                  aria-describedby={formErrors.amount ? 'amount-error' : undefined}
                />
                {formErrors.amount && (
                  <p id="amount-error" className="text-sm text-red-600">
                    {formErrors.amount}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="parkName">Park</Label>
                <Select
                  value={updateFormData.parkName}
                  onValueChange={(value) => handleUpdateFormChange({ name: 'parkName', value })}
                >
                  <SelectTrigger aria-invalid={!!formErrors.parkName}>
                    <SelectValue placeholder="Select park" />
                  </SelectTrigger>
                  <SelectContent>
                    {parkTours.map((park) => (
                      <SelectItem key={park.id} value={park.name}>
                        {park.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.parkName && (
                  <p id="parkName-error" className="text-sm text-red-600">
                    {formErrors.parkName}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={updateFormData.category}
                  onValueChange={(value) => handleUpdateFormChange({ name: 'category', value })}
                >
                  <SelectTrigger aria-invalid={!!formErrors.category}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="infrastructure">Infrastructure</SelectItem>
                    <SelectItem value="equipment">Equipment</SelectItem>
                    <SelectItem value="staffing">Staffing</SelectItem>
                    <SelectItem value="research">Research</SelectItem>
                    <SelectItem value="conservation">Conservation</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.category && (
                  <p id="category-error" className="text-sm text-red-600">
                    {formErrors.category}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="expectedDuration">Expected Duration</Label>
                <Select
                  value={updateFormData.expectedDuration}
                  onValueChange={(value) => handleUpdateFormChange({ name: 'expectedDuration', value })}
                >
                  <SelectTrigger aria-invalid={!!formErrors.expectedDuration}>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-3 months">1-3 months</SelectItem>
                    <SelectItem value="3-6 months">3-6 months</SelectItem>
                    <SelectItem value="6-12 months">6-12 months</SelectItem>
                    <SelectItem value="1-2 years">1-2 years</SelectItem>
                    <SelectItem value="2+ years">2+ years</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.expectedDuration && (
                  <p id="expectedDuration-error" className="text-sm text-red-600">
                    {formErrors.expectedDuration}
                  </p>
                )}
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
                  aria-invalid={!!formErrors.description}
                  aria-describedby={formErrors.description ? 'description-error' : undefined}
                />
                {formErrors.description && (
                  <p id="description-error" className="text-sm text-red-600">
                    {formErrors.description}
                  </p>
                )}
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
                  aria-invalid={!!formErrors.justification}
                  aria-describedby={formErrors.justification ? 'justification-error' : undefined}
                />
                {formErrors.justification && (
                  <p id="justification-error" className="text-sm text-red-600">
                    {formErrors.justification}
                  </p>
                )}
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

export default ExtraFunds;