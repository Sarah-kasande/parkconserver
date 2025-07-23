import React, { useState, useEffect } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PrintDownloadTable } from '@/components/ui/PrintDownloadTable';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'; // Assuming these exist

interface TourBooking {
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

const BookedTours = () => {
  const { toast } = useToast();
  const [tours, setTours] = useState<TourBooking[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTours, setFilteredTours] = useState<TourBooking[]>([]);
  const [selectedTour, setSelectedTour] = useState<TourBooking | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchTours();
  }, []);

  const fetchTours = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/finance/tours', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setTours(data);
        setFilteredTours(data);
      } else {
        toast({ title: "Error", description: "Failed to fetch booked tours" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Network error occurred" });
    }
  };

  useEffect(() => {
    const filtered = tours.filter(tour =>
      tour.id.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${tour.first_name} ${tour.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tour.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tour.tour_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tour.park_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredTours(filtered);
  }, [searchQuery, tours]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const viewTourDetails = (tour: TourBooking) => {
    setSelectedTour(tour);
    setIsDialogOpen(true);
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50 w-full">
        <DashboardSidebar />
        <div className="flex-1">
          <DashboardHeader
            title="Booked Tours"
            subtitle="Overview of all booked tours"
          />
          <main className="p-6">
            <Card>
              <CardHeader>
                <CardTitle>All Booked Tours</CardTitle>
                <div className="flex justify-between items-center">
                  <div className="relative w-full md:w-1/3 mt-2">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search tours..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={handleSearchChange}
                    />
                  </div>
                  <PrintDownloadTable
                    tableId="tours-table"
                    title="Booked Tours Report"
                    filename="booked_tours_report"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div id="tours-table">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Park Name</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Tour Date</TableHead>
                        <TableHead>Guests</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Booking Date</TableHead>
                        <TableHead className="no-print">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTours.length > 0 ? (
                        filteredTours.map((tour) => (
                          <TableRow key={tour.id}>
                            <TableCell>{tour.id}</TableCell>
                            <TableCell>{tour.park_name}</TableCell>
                            <TableCell>{`${tour.first_name} ${tour.last_name}`}</TableCell>
                            <TableCell>{tour.email}</TableCell>
                            <TableCell>{tour.date}</TableCell>
                            <TableCell>{tour.guests}</TableCell>
                            <TableCell>${tour.amount}.00</TableCell>
                            <TableCell>{tour.created_at}</TableCell>
                            <TableCell className="no-print">
                              <Dialog open={isDialogOpen && selectedTour?.id === tour.id} onOpenChange={setIsDialogOpen}>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => viewTourDetails(tour)}
                                  >
                                    View
                                  </Button>
                                </DialogTrigger>
                                {selectedTour && (
                                  <DialogContent className="sm:max-w-[600px]">
                                    <DialogHeader>
                                      <DialogTitle>Tour Booking Details</DialogTitle>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                      <div className="grid grid-cols-4 items-center gap-4">
                                        <span className="font-medium col-span-1">ID:</span>
                                        <span className="col-span-3">{selectedTour.id}</span>
                                      </div>
                                      <div className="grid grid-cols-4 items-center gap-4">
                                        <span className="font-medium col-span-1">Park:</span>
                                        <span className="col-span-3">{selectedTour.park_name}</span>
                                      </div>
                                      <div className="grid grid-cols-4 items-center gap-4">
                                        <span className="font-medium col-span-1">Customer:</span>
                                        <span className="col-span-3">{`${selectedTour.first_name} ${selectedTour.last_name}`}</span>
                                      </div>
                                      <div className="grid grid-cols-4 items-center gap-4">
                                        <span className="font-medium col-span-1">Email:</span>
                                        <span className="col-span-3">{selectedTour.email}</span>
                                      </div>
                                      <div className="grid grid-cols-4 items-center gap-4">
                                        <span className="font-medium col-span-1">Phone:</span>
                                        <span className="col-span-3">{selectedTour.phone}</span>
                                      </div>
                                      <div className="grid grid-cols-4 items-center gap-4">
                                        <span className="font-medium col-span-1">Date:</span>
                                        <span className="col-span-3">{selectedTour.date}</span>
                                      </div>
                                      <div className="grid grid-cols-4 items-center gap-4">
                                        <span className="font-medium col-span-1">Time:</span>
                                        <span className="col-span-3">{selectedTour.time}</span>
                                      </div>
                                      <div className="grid grid-cols-4 items-center gap-4">
                                        <span className="font-medium col-span-1">Guests:</span>
                                        <span className="col-span-3">{selectedTour.guests}</span>
                                      </div>
                                      <div className="grid grid-cols-4 items-center gap-4">
                                        <span className="font-medium col-span-1">Amount:</span>
                                        <span className="col-span-3">${selectedTour.amount}.00</span>
                                      </div>
                                      <div className="grid grid-cols-4 items-center gap-4">
                                        <span className="font-medium col-span-1">Special Requests:</span>
                                        <span className="col-span-3">{selectedTour.special_requests || 'None'}</span>
                                      </div>
                                      <div className="grid grid-cols-4 items-center gap-4">
                                        <span className="font-medium col-span-1">Booked On:</span>
                                        <span className="col-span-3">{selectedTour.created_at}</span>
                                      </div>
                                    </div>
                                    <div className="flex justify-end">
                                      <DialogClose asChild>
                                        <Button variant="outline">Close</Button>
                                      </DialogClose>
                                    </div>
                                  </DialogContent>
                                )}
                              </Dialog>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={10} className="text-center">
                            No tours found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                <div className="mt-4 text-sm text-gray-500">
                  Showing {filteredTours.length} of {tours.length} tours
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default BookedTours;