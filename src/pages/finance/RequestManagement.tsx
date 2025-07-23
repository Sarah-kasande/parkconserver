import React, { useState, useEffect } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { User, MapPin, DollarSign, Calendar, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PrintDownloadTable } from '@/components/ui/PrintDownloadTable';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface FundRequest {
  id: string;
  title: string;
  description: string;
  amount: number;
  category: string;
  parkname: string;
  urgency: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  created_by: string;
  first_name: string;
  last_name: string;
  staff_email: string;
  staff_park: string;
}

interface IncomeData {
  donations: number;
  tourBookings: number;
  governmentSupport: number;
  total: number;
}

const RequestManagement = () => {
  const { toast } = useToast();
  const [requests, setRequests] = useState<FundRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<FundRequest | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [parkIncome, setParkIncome] = useState<IncomeData>({
    donations: 0,
    tourBookings: 0,
    governmentSupport: 0,
    total: 0
  });
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [requestToReject, setRequestToReject] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
    fetchParkIncome();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/finance/fund-requests', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setRequests(data);
      } else {
        toast({ title: "Error", description: "Failed to fetch requests" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Network error occurred" });
    }
  };

  const fetchParkIncome = async () => {
    try {
      const [donationsRes, toursRes] = await Promise.all([
        fetch('http://localhost:5000/api/finance/donations', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }),
        fetch('http://localhost:5000/api/finance/tours', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }),
      ]);

      const donationsData = await donationsRes.json();
      const toursData = await toursRes.json();

      const donationTotal = donationsData.reduce((sum: number, donation: any) => 
        sum + Number(donation.amount), 0);
      const tourTotal = toursData.reduce((sum: number, tour: any) => 
        sum + Number(tour.amount), 0);

      // Calculate Government Support as 15% of total income
      const baseIncome = donationTotal + tourTotal;
      const govSupport = baseIncome * 0.15 / (1 - 0.15);
      const totalIncome = baseIncome + govSupport;

      setParkIncome({
        donations: donationTotal,
        tourBookings: tourTotal,
        governmentSupport: govSupport,
        total: totalIncome
      });
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Failed to fetch income data", 
        variant: "destructive" 
      });
    }
  };

  const isRequestExceedingThreshold = (amount: number) => {
    const threshold = parkIncome.total * 0.4;
    return amount > threshold;
  };

  const updateRequestStatus = async (id: string, status: 'approved' | 'rejected', reason?: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/finance/fund-requests/${id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, reason }),
      });
  
      if (response.ok) {
        setRequests(requests.map(req =>
          req.id === id ? { ...req, status } : req
        ));
        toast({ title: "Success", description: `Request ${status}` });
        setIsRejectDialogOpen(false);
        setRejectReason('');
        setRequestToReject(null);
      } else {
        const errorData = await response.json();
        toast({ 
          title: "Error", 
          description: errorData.error || "Failed to update status", 
          variant: "destructive" 
        });
      }
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Network error occurred", 
        variant: "destructive" 
      });
    }
  };

  const viewRequestDetails = (request: FundRequest) => {
    setSelectedRequest(request);
    setIsDialogOpen(true);
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50 w-full">
        <DashboardSidebar />
        <div className="flex-1">
          <DashboardHeader
            title="Fund Request Management"
            subtitle="Manage park staff funding requests"
          />
          <main className="p-6">
            {parkIncome.total > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Park Income Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm font-medium">Total Income</p>
                      <p className="text-2xl font-bold">${parkIncome.total.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Maximum Request Threshold (40%)</p>
                      <p className="text-2xl font-bold">${(parkIncome.total * 0.4).toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle>Fund Requests</CardTitle>
              <PrintDownloadTable
                tableId="fund-requests-table"
                title="Fund Requests Report"
                filename="fund_requests_report"
              />
            </CardHeader>
              <CardContent>
                <div id="fund-requests-table">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Park</TableHead>
                        <TableHead>Staff</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Staff Park</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="no-print">Actions</TableHead>
                        <TableHead className="no-print">Transactions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requests.map((request) => (
                        <TableRow 
                          key={request.id}
                          className={isRequestExceedingThreshold(request.amount) ? 'bg-red-50' : ''}
                        >
                          <TableCell>{request.id}</TableCell>
                          <TableCell>{request.title}</TableCell>
                          <TableCell>${request.amount.toLocaleString()}</TableCell>
                          <TableCell>{request.parkname}</TableCell>
                          <TableCell>{`${request.first_name} ${request.last_name}`}</TableCell>
                          <TableCell>{request.staff_email}</TableCell>
                          <TableCell>{request.staff_park}</TableCell>
                          <TableCell>{request.status}</TableCell>
                          <TableCell>
                            {request.status === 'pending' && (
                              <div className='flex items-center gap-2'>
                                {!isRequestExceedingThreshold(request.amount) && (
                                  <Button
                                    onClick={() => updateRequestStatus(request.id, 'approved')}
                                    className="mr-2"
                                    size="sm"
                                  >
                                    Approve
                                  </Button>
                                )}
                                <Button
                                  onClick={() => {
                                    setRequestToReject(request.id);
                                    setIsRejectDialogOpen(true);
                                    if (isRequestExceedingThreshold(request.amount)) {
                                      setRejectReason(`Request amount exceeds 40% of total park income (${(parkIncome.total * 0.4).toLocaleString()} USD)`);
                                    }
                                  }}
                                  variant="destructive"
                                  size="sm"
                                >
                                  Reject
                                </Button>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => viewRequestDetails(request)}
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Fund Request Details Dialog */}
            {selectedRequest && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Fund Request Details - ID: {selectedRequest.id}</DialogTitle>
                    <DialogDescription>
                      Full details of the selected fund request
                    </DialogDescription>
                  </DialogHeader>
                  <Card className="mt-4">
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <User className="h-5 w-5 text-primary" />
                            <div>
                              <h4 className="text-sm font-medium">Staff Information</h4>
                              <p className="text-sm">{`${selectedRequest.first_name} ${selectedRequest.last_name}`}</p>
                              <p className="text-sm">{selectedRequest.staff_email}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-primary" />
                            <div>
                              <h4 className="text-sm font-medium">Staff Park</h4>
                              <p className="text-sm">{selectedRequest.staff_park}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-primary" />
                            <div>
                              <h4 className="text-sm font-medium">Requested Park</h4>
                              <p className="text-sm">{selectedRequest.parkname}</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-primary" />
                            <div>
                              <h4 className="text-sm font-medium">Request Details</h4>
                              <p className="text-sm">Amount: ${selectedRequest.amount.toLocaleString()}</p>
                              <p className="text-sm">Category: {selectedRequest.category}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-primary" />
                            <div>
                              <h4 className="text-sm font-medium">Urgency</h4>
                              <p className="text-sm">{selectedRequest.urgency}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-primary" />
                            <div>
                              <h4 className="text-sm font-medium">Date</h4>
                              <p className="text-sm">{selectedRequest.created_at}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6">
                        <h4 className="text-sm font-medium mb-2">Title</h4>
                        <p className="text-sm text-gray-600 bg-gray-100 p-3 rounded-md">
                          {selectedRequest.title}
                        </p>
                      </div>

                      <div className="mt-6">
                        <h4 className="text-sm font-medium mb-2">Description</h4>
                        <p className="text-sm text-gray-600 bg-gray-100 p-3 rounded-md">
                          {selectedRequest.description}
                        </p>
                      </div>

                      <div className="mt-6">
                        <h4 className="text-sm font-medium mb-2">Status</h4>
                        <p className="text-sm text-gray-600">{selectedRequest.status}</p>
                      </div>
                    </CardContent>
                  </Card>
                  <DialogFooter>
                    <Button onClick={() => setIsDialogOpen(false)}>Close</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            {/* Reject Dialog */}
            <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reject Fund Request</DialogTitle>
                  <DialogDescription>
                    Please provide a reason for rejecting this request.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason for Rejection</Label>
                    <Textarea
                      id="reason"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Enter the reason for rejection..."
                      className="min-h-[100px]"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsRejectDialogOpen(false);
                      setRejectReason('');
                      setRequestToReject(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      if (requestToReject) {
                        updateRequestStatus(requestToReject, 'rejected', rejectReason);
                      }
                    }}
                    disabled={!rejectReason.trim()}
                  >
                    Reject Request
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default RequestManagement;