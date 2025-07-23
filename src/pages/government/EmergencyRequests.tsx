import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider } from '@/components/ui/sidebar';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { DateRange } from 'react-day-picker';
import { AlertTriangle, Check, FileText, Search, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { PrintDownloadTable } from '@/components/ui/PrintDownloadTable';

const reviewSchema = z.object({
  decision: z.enum(['approved', 'rejected']),
  reason: z.string().min(10, 'Reason must be at least 10 characters'),
});

type ReviewForm = z.infer<typeof reviewSchema>;

interface EmergencyRequest {
  id: string;
  parkName: string;
  title: string;
  description: string;
  amount: number;
  submittedDate: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedBy: string;
  emergencyType?: string;
  justification?: string;
  timeframe?: string;
  reviewedBy?: string;
  reviewedDate?: string;
  reason?: string;
}

const EmergencyRequests = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [date, setDate] = useState<DateRange | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewRequest, setViewRequest] = useState<EmergencyRequest | null>(null);
  const [reviewRequest, setReviewRequest] = useState<EmergencyRequest | null>(null);
  const [requests, setRequests] = useState<EmergencyRequest[]>([]);

  const form = useForm<ReviewForm>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      decision: 'approved',
      reason: '',
    },
  });

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/government/emergency-requests', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setRequests(response.data);
      } catch (error) {
        console.error('Error fetching emergency requests:', error);
        toast.error('Failed to load emergency requests');
      }
    };
    if (user?.role === 'government') {
      fetchRequests();
    }
  }, [user]);

  const filteredRequests = requests.filter(request => {
    const matchesSearch =
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.parkName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate =
      !date?.from ||
      (new Date(request.submittedDate) >= date.from &&
       (!date.to || new Date(request.submittedDate) <= date.to));
    
    const matchesStatus =
      statusFilter === 'all' || request.status === statusFilter;
    
    return matchesSearch && matchesDate && matchesStatus;
  });

  const onSubmitReview = async (data: ReviewForm) => {
    if (!reviewRequest) return;
    
    try {
      await axios.put(
        `http://localhost:5000/api/government/emergency-requests/${reviewRequest.id}/status`,
        { status: data.decision, reason: data.reason },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      toast.success(`Request ${data.decision} successfully`);
      setRequests(prev =>
        prev.map(req =>
          req.id === reviewRequest.id
            ? { ...req, status: data.decision, reason: data.reason, reviewedDate: new Date().toISOString().split('T')[0] }
            : req
        )
      );
      setReviewRequest(null);
      form.reset();
    } catch (error) {
      console.error('Error updating request status:', error);
      toast.error('Failed to update request status');
    }
  };

  const handleAction = async (request: EmergencyRequest, decision: 'approved' | 'rejected') => {
    setReviewRequest({ ...request, status: decision });
    form.setValue('decision', decision);
  };

  if (user?.role !== 'government') {
    return <div>Unauthorized access</div>;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50 w-full">
        <DashboardSidebar />
        <div className="flex-1">
          <DashboardHeader
            title="Emergency Fund Requests"
            subtitle="Review and approve emergency funding requests from parks"
          />
          <main className="p-6">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Filter Requests</CardTitle>
                <CardDescription>Search and filter emergency fund requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Search by park or request details..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <DateRangePicker date={date} onSelect={setDate} />
                </div>
                <div className="mt-4">
                  <Tabs defaultValue="all" value={statusFilter} onValueChange={setStatusFilter}>
                    <TabsList className="grid grid-cols-4 w-full max-w-md">
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="pending">Pending</TabsTrigger>
                      <TabsTrigger value="approved">Approved</TabsTrigger>
                      <TabsTrigger value="rejected">Rejected</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Emergency Fund Requests</CardTitle>
                <CardDescription>{filteredRequests.length} requests found</CardDescription>
                <PrintDownloadTable
                  tableId="emergency-requests-table"
                  title="Emergency Requests Report"
                  filename="emergency_requests_report"
                />
              </CardHeader>
              <CardContent>
                <div id="emergency-requests-table">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Park</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Transactions</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRequests.length > 0 ? (
                        filteredRequests.map(request => (
                          <TableRow key={request.id}>
                            <TableCell className="font-medium">#{request.id}</TableCell>
                            <TableCell>{request.parkName}</TableCell>
                            <TableCell>{request.title}</TableCell>
                            <TableCell>${request.amount.toLocaleString()}</TableCell>
                            <TableCell>{request.submittedDate}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                {request.status === 'pending' && (
                                  <span className="flex items-center gap-1 text-amber-600 bg-amber-100 px-2 py-1 rounded-full text-xs">
                                    <AlertTriangle className="h-3 w-3" />
                                    Pending
                                  </span>
                                )}
                                {request.status === 'approved' && (
                                  <span className="flex items-center gap-1 text-green-600 bg-green-100 px-2 py-1 rounded-full text-xs">
                                    <Check className="h-3 w-3" />
                                    Approved
                                  </span>
                                )}
                                {request.status === 'rejected' && (
                                  <span className="flex items-center gap-1 text-red-600 bg-red-100 px-2 py-1 rounded-full text-xs">
                                    <X className="h-3 w-3" />
                                    Rejected
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setViewRequest(request)}
                                >
                                  <FileText className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                                {request.status === 'pending' && (
                                  <>
                                    <Button
                                      size="sm"
                                      className="bg-green-600 hover:bg-green-700"
                                      onClick={() => handleAction(request, 'approved')}
                                    >
                                      Approve
                                    </Button>
                                    <Button
                                      size="sm"
                                      className="bg-red-600 hover:bg-red-700"
                                      onClick={() => handleAction(request, 'rejected')}
                                    >
                                      Reject
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                            No emergency requests found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>

      <Dialog open={!!viewRequest} onOpenChange={(open) => !open && setViewRequest(null)}>
  <DialogContent className="max-w-2xl w-full sm:max-w-lg">
    <DialogHeader>
      <DialogTitle>Emergency Request Details</DialogTitle>
      <DialogDescription className="line-clamp-2">
        Request #{viewRequest?.id} - {viewRequest?.parkName} National Park
      </DialogDescription>
    </DialogHeader>
    {viewRequest && (
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-500">Title</h4>
            <p className="truncate">{viewRequest.title}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500">Requested Amount</h4>
            <p className="font-semibold">${viewRequest.amount.toLocaleString()}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500">Requested By</h4>
            <p className="truncate">{viewRequest.requestedBy}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500">Date Requested</h4>
            <p>{viewRequest.submittedDate}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500">Status</h4>
            <div className="mt-1">
              {viewRequest.status === 'pending' && (
                <span className="flex items-center gap-1 text-amber-600 bg-amber-100 px-2 py-1 rounded-full text-xs">
                  <AlertTriangle className="h-3 w-3" />
                  Pending
                </span>
              )}
              {viewRequest.status === 'approved' && (
                <span className="flex items-center gap-1 text-green-600 bg-green-100 px-2 py-1 rounded-full text-xs">
                  <Check className="h-3 w-3" />
                  Approved
                </span>
              )}
              {viewRequest.status === 'rejected' && (
                <span className="flex items-center gap-1 text-red-600 bg-red-100 px-2 py-1 rounded-full text-xs">
                  <X className="h-3 w-3" />
                  Rejected
                </span>
              )}
            </div>
          </div>
          {viewRequest.emergencyType && (
            <div>
              <h4 className="text-sm font-medium text-gray-500">Emergency Type</h4>
              <p className="truncate">{viewRequest.emergencyType}</p>
            </div>
          )}
          {viewRequest.reviewedBy && (
            <div>
              <h4 className="text-sm font-medium text-gray-500">Reviewed By</h4>
              <p className="truncate">{viewRequest.reviewedBy}</p>
            </div>
          )}
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-500">Description</h4>
          <p className="mt-1 text-gray-700 break-words">{viewRequest.description}</p>
        </div>
        {viewRequest.justification && (
          <div>
            <h4 className="text-sm font-medium text-gray-500">Justification</h4>
            <p className="mt-1 text-gray-700 break-words">{viewRequest.justification}</p>
          </div>
        )}
        {viewRequest.timeframe && (
          <div>
            <h4 className="text-sm font-medium text-gray-500">Timeframe</h4>
            <p className="mt-1 text-gray-700 break-words">{viewRequest.timeframe}</p>
          </div>
        )}
        {viewRequest.reason && (
          <div>
            <h4 className="text-sm font-medium text-gray-500">Review Reason</h4>
            <p className="mt-1 text-gray-700 break-words">{viewRequest.reason}</p>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => setViewRequest(null)}>
            Close
          </Button>
          {viewRequest.status === 'pending' && (
            <Button
              onClick={() => {
                setViewRequest(null);
                setReviewRequest(viewRequest);
              }}
            >
              Review Request
            </Button>
          )}
        </DialogFooter>
      </div>
    )}
  </DialogContent>
</Dialog>

<Dialog open={!!reviewRequest} onOpenChange={(open) => !open && setReviewRequest(null)}>
  <DialogContent className="max-w-lg w-full">
    <DialogHeader>
      <DialogTitle>Review Emergency Request</DialogTitle>
      <DialogDescription className="line-clamp-2">
        {reviewRequest?.parkName} - {reviewRequest?.title}
      </DialogDescription>
    </DialogHeader>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitReview)} className="space-y-4">
        <FormField
          control={form.control}
          name="decision"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Decision</FormLabel>
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant={field.value === 'approved' ? 'default' : 'outline'}
                  className={field.value === 'approved' ? 'bg-green-600' : ''}
                  onClick={() => field.onChange('approved')}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Approve
                </Button>
                <Button
                  type="button"
                  variant={field.value === 'rejected' ? 'default' : 'outline'}
                  className={field.value === 'rejected' ? 'bg-red-600' : ''}
                  onClick={() => field.onChange('rejected')}
                >
                  <X className="mr-2 h-4 w-4" />
                  Reject
                </Button>
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reason for Decision</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Provide detailed reason for your decision..."
                  className="min-h-[100px] resize-y"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => setReviewRequest(null)}>
            Cancel
          </Button>
          <Button type="submit">Submit Review</Button>
        </DialogFooter>
      </form>
    </Form>
  </DialogContent>
</Dialog>

<Dialog open={!!reviewRequest} onOpenChange={(open) => !open && setReviewRequest(null)}>
  <DialogContent className="max-w-lg w-full">
    <DialogHeader>
      <DialogTitle>Review Emergency Request</DialogTitle>
      <DialogDescription className="line-clamp-2">
        {reviewRequest?.parkName} - {reviewRequest?.title}
      </DialogDescription>
    </DialogHeader>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitReview)} className="space-y-4">
        <FormField
          control={form.control}
          name="decision"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Decision</FormLabel>
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant={field.value === 'approved' ? 'default' : 'outline'}
                  className={field.value === 'approved' ? 'bg-green-600' : ''}
                  onClick={() => field.onChange('approved')}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Approve
                </Button>
                <Button
                  type="button"
                  variant={field.value === 'rejected' ? 'default' : 'outline'}
                  className={field.value === 'rejected' ? 'bg-red-600' : ''}
                  onClick={() => field.onChange('rejected')}
                >
                  <X className="mr-2 h-4 w-4" />
                  Reject
                </Button>
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reason for Decision</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Provide detailed reason for your decision..."
                  className="min-h-[100px] resize-y"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => setReviewRequest(null)}>
            Cancel
          </Button>
          <Button type="submit">Submit Review</Button>
        </DialogFooter>
      </form>
    </Form>
  </DialogContent>
</Dialog>

      <Dialog open={!!reviewRequest} onOpenChange={(open) => !open && setReviewRequest(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Emergency Request</DialogTitle>
            <DialogDescription>
              {reviewRequest?.parkName} - {reviewRequest?.title}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitReview)} className="space-y-4">
              <FormField
                control={form.control}
                name="decision"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Decision</FormLabel>
                    <div className="flex gap-4">
                      <Button
                        type="button"
                        variant={field.value === 'approved' ? 'default' : 'outline'}
                        className={field.value === 'approved' ? 'bg-green-600' : ''}
                        onClick={() => field.onChange('approved')}
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        type="button"
                        variant={field.value === 'rejected' ? 'default' : 'outline'}
                        className={field.value === 'rejected' ? 'bg-red-600' : ''}
                        onClick={() => field.onChange('rejected')}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason for Decision</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide detailed reason for your decision..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="gap-2 sm:gap-0">
                <Button type="button" variant="outline" onClick={() => setReviewRequest(null)}>
                  Cancel
                </Button>
                <Button type="submit">Submit Review</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default EmergencyRequests;