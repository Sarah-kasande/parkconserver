import React, { useState, useEffect } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { User, Phone, Building, FileText, Calendar, File } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PrintDownloadTable } from '@/components/ui/PrintDownloadTable';

interface ServiceApplication {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company_type: string;
  provided_service: string;
  company_name: string;
  tax_id: string;
  created_at: string;
  status: 'approved' | 'denied' | 'pending' | null;
  company_registration: string; // Base64 encoded binary data
  application_letter: string | null; // Base64 encoded binary data or null
}

const ServiceProviders = () => {
  const { toast } = useToast();
  const [services, setServices] = useState<ServiceApplication[]>([]);
  const [selectedService, setSelectedService] = useState<ServiceApplication | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/finance/services', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        // Process data to ensure status is correctly typed and BLOBs are Base64
        const processedData = data.map(service => ({
          ...service,
          status: service.status || null,
          company_registration: service.company_registration
            ? Buffer.from(service.company_registration, 'binary').toString('base64')
            : '',
          application_letter: service.application_letter
            ? Buffer.from(service.application_letter, 'binary').toString('base64')
            : null,
        }));
        setServices(processedData);
      } else {
        toast({ title: "Error", description: "Failed to fetch services" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Network error occurred" });
    }
  };

  const updateServiceStatus = async (id: string, status: 'approved' | 'denied') => {
    try {
      const response = await fetch(`http://localhost:5000/api/finance/services/${id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setServices(services.map(service =>
          service.id === id ? { ...service, status } : service
        ));
        if (selectedService && selectedService.id === id) {
          setSelectedService({ ...selectedService, status });
        }
        toast({ title: "Success", description: `Service ${status}` });
      } else {
        toast({ title: "Error", description: "Failed to update status" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Network error occurred" });
    }
  };

  const viewServiceDetails = (service: ServiceApplication) => {
    setSelectedService(service);
    setIsDialogOpen(true);
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50 w-full">
        <DashboardSidebar />
        <div className="flex-1">
          <DashboardHeader
            title="Service Partners"
            subtitle="Manage service applications"
          />
          <main className="p-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Service Applications</CardTitle>
                  <PrintDownloadTable
                    tableId="service-providers-table"
                    title="Service Paterners Report"
                    filename="service_providers_report"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div id="service-providers-table">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="no-print">Actions</TableHead>
                        <TableHead className="no-print">Transactions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {services.map((service) => (
                        <TableRow key={service.id}>
                          <TableCell>{service.id}</TableCell>
                          <TableCell>{service.company_name}</TableCell>
                          <TableCell>{`${service.first_name} ${service.last_name} (${service.email})`}</TableCell>
                          <TableCell>{service.provided_service}</TableCell>
                          <TableCell>
                            {service.status ? service.status.charAt(0).toUpperCase() + service.status.slice(1) : 'Pending'}
                          </TableCell>
                          <TableCell className="no-print">
                            {service.status === 'pending' && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => updateServiceStatus(service.id, 'approved')}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => updateServiceStatus(service.id, 'denied')}
                                  variant="destructive"
                                >
                                  Deny
                                </Button>
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="no-print">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => viewServiceDetails(service)}
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

            {/* Service Application Details Dialog */}
            {selectedService && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[700px]">
                  <DialogHeader>
                    <DialogTitle>Service Application Details - ID: {selectedService.id}</DialogTitle>
                    <DialogDescription>
                      Full details of the selected service application, including documents
                    </DialogDescription>
                  </DialogHeader>
                  <Card className="mt-4">
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <User className="h-5 w-5 text-primary" />
                            <div>
                              <h4 className="text-sm font-medium">Contact Information</h4>
                              <p className="text-sm">{`${selectedService.first_name} ${selectedService.last_name}`}</p>
                              <p className="text-sm">{selectedService.email}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Phone className="h-5 w-5 text-primary" />
                            <div>
                              <h4 className="text-sm font-medium">Phone</h4>
                              <p className="text-sm">{selectedService.phone || 'N/A'}</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <Building className="h-5 w-5 text-primary" />
                            <div>
                              <h4 className="text-sm font-medium">Company Details</h4>
                              <p className="text-sm">Name: {selectedService.company_name}</p>
                              <p className="text-sm">Type: {selectedService.company_type}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            <div>
                              <h4 className="text-sm font-medium">Tax ID</h4>
                              <p className="text-sm">{selectedService.tax_id}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6">
                        <h4 className="text-sm font-medium mb-2">Provided Service</h4>
                        <p className="text-sm text-gray-600 bg-gray-100 p-3 rounded-md">
                          {selectedService.provided_service || 'N/A'}
                        </p>
                      </div>

                      <div className="mt-6">
                        <h4 className="text-sm font-medium mb-2">Submission Date</h4>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-5 w-5 text-primary" />
                          <p className="text-sm text-gray-600">{selectedService.created_at}</p>
                        </div>
                      </div>

                      <div className="mt-6">
                        <h4 className="text-sm font-medium mb-2">Status</h4>
                        <p className="text-sm text-gray-600">
                          {selectedService.status ? selectedService.status.charAt(0).toUpperCase() + selectedService.status.slice(1) : 'Pending'}
                        </p>
                      </div>

                      <div className="mt-6">
                        <h4 className="text-sm font-medium mb-2">Company Registration</h4>
                        {selectedService.company_registration ? (
                          <div className="flex items-center gap-2">
                            <File className="h-5 w-5 text-primary" />
                            <a
                              href={`data:application/pdf;base64,${selectedService.company_registration}`}
                              download={`company_registration_${selectedService.id}.pdf`}
                              className="text-sm text-blue-600 hover:underline"
                            >
                              Download Company Registration (PDF)
                            </a>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-600">Not provided</p>
                        )}
                      </div>

                      <div className="mt-6">
                        <h4 className="text-sm font-medium mb-2">Application Letter</h4>
                        {selectedService.application_letter ? (
                          <div className="flex items-center gap-2">
                            <File className="h-5 w-5 text-primary" />
                            <a
                              href={`data:application/pdf;base64,${selectedService.application_letter}`}
                              download={`application_letter_${selectedService.id}.pdf`}
                              className="text-sm text-blue-600 hover:underline"
                            >
                              Download Application Letter (PDF)
                            </a>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-600">Not provided</p>
                        )}
                      </div>
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

export default ServiceProviders;