import React, { useState, useEffect } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Search, User, MapPin, DollarSign, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PrintDownloadTable } from '@/components/ui/PrintDownloadTable'; 

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

const Donations = () => {
  const { toast } = useToast();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredDonations, setFilteredDonations] = useState<Donation[]>([]);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/finance/donations', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setDonations(data);
        setFilteredDonations(data);
      } else {
        toast({ title: "Error", description: "Failed to fetch donations" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Network error occurred" });
    }
  };

  useEffect(() => {
    const filtered = donations.filter(donation =>
      donation.id.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${donation.first_name} ${donation.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      donation.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      donation.park_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredDonations(filtered);
  }, [searchQuery, donations]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const viewDonationDetails = (donation: Donation) => {
    setSelectedDonation(donation);
    setIsDialogOpen(true);
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50 w-full">
        <DashboardSidebar />
        <div className="flex-1">
          <DashboardHeader
            title="Donations"
            subtitle="Overview of all donations"
          />
          <main className="p-6">
            <Card>
              <CardHeader>
                <CardTitle>All Donations</CardTitle>
                <div className="flex justify-between items-center">
                  <div className="relative w-full md:w-1/3 mt-2">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search donations..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={handleSearchChange}
                    />
                  </div>
                  <PrintDownloadTable
                    tableId="donations-table"
                    title="Donations Report"
                    filename="donations_report"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div id="donations-table">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Donor</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Park Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="no-print">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDonations.length > 0 ? (
                        filteredDonations.map((donation) => (
                          <TableRow key={donation.id}>
                            <TableCell>{donation.id}</TableCell>
                            <TableCell>
                              {donation.is_anonymous
                                ? 'Anonymous'
                                : `${donation.first_name} ${donation.last_name}`}
                            </TableCell>
                            <TableCell>${donation.amount.toLocaleString()}</TableCell>
                            <TableCell>{donation.email}</TableCell>
                            <TableCell>{donation.park_name}</TableCell>
                            <TableCell>{donation.donation_type}</TableCell>
                            <TableCell>{donation.created_at}</TableCell>
                            <TableCell className="no-print">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => viewDonationDetails(donation)}
                              >
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center">
                            No donations found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                <div className="mt-4 text-sm text-gray-500">
                  Showing {filteredDonations.length} of {donations.length} donations
                </div>
              </CardContent>
            </Card>

            {/* Donation Details Dialog */}
            {selectedDonation && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Donation Details - ID: {selectedDonation.id}</DialogTitle>
                    <DialogDescription>
                      Full details of the selected donation transaction
                    </DialogDescription>
                  </DialogHeader>
                  <Card className="mt-4">
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <User className="h-5 w-5 text-primary" />
                            <div>
                              <h4 className="text-sm font-medium">Donor Information</h4>
                              <p className="text-sm">
                                {selectedDonation.is_anonymous
                                  ? 'Anonymous'
                                  : `${selectedDonation.first_name} ${selectedDonation.last_name}`}
                              </p>
                              <p className="text-sm">{selectedDonation.email}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-primary" />
                            <div>
                              <h4 className="text-sm font-medium">Park</h4>
                              <p className="text-sm">{selectedDonation.park_name}</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-primary" />
                            <div>
                              <h4 className="text-sm font-medium">Donation Details</h4>
                              <p className="text-sm">Amount: ${selectedDonation.amount.toLocaleString()}</p>
                              <p className="text-sm">Type: {selectedDonation.donation_type}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-primary" />
                            <div>
                              <h4 className="text-sm font-medium">Date</h4>
                              <p className="text-sm">{selectedDonation.created_at}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {selectedDonation.message && (
                        <div className="mt-6">
                          <h4 className="text-sm font-medium mb-2">Message</h4>
                          <p className="text-sm text-gray-600 bg-gray-100 p-3 rounded-md">
                            {selectedDonation.message}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  <DialogFooter>
                    <Button onClick={() => setIsDialogOpen(false)}>Close</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Donations;