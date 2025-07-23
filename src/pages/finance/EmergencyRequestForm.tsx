import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider } from '@/components/ui/sidebar';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const formSchema = z.object({
  title: z.string().min(5, {
    message: "Title must be at least 5 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  amount: z.coerce.number().positive({
    message: "Amount must be a positive number.",
  }),
  parkName: z.string().min(1, {
    message: "Please select a park.",
  }),
  emergencyType: z.string().min(1, {
    message: "Please select an emergency type.",
  }),
  justification: z.string().min(20, {
    message: "Justification must be at least 20 characters.",
  }),
  timeframe: z.string().min(1, {
    message: "Please select a timeframe.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

const EmergencyRequestForm = () => {
  const navigate = useNavigate();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      amount: undefined,
      parkName: '',
      emergencyType: '',
      justification: '',
      timeframe: 'immediate',
    },
  });
  
  const handleSubmit = async (values: FormValues) => {
    try {
      const response = await fetch('http://localhost:5000/api/finance/emergency-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`, // Assuming token is stored here
        },
        body: JSON.stringify(values),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit request');
      }
      
      toast.success('Emergency fund request submitted successfully!');
      form.reset();
      
      setTimeout(() => {
        navigate('/finance/emergency-requests');
      }, 1500);
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit emergency request');
    }
  };
  
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50 w-full">
        <DashboardSidebar />
        
        <div className="flex-1">
          <DashboardHeader 
            title="Create Emergency Fund Request"
            subtitle="Submit an emergency funding request to the government"
          />
          
          <main className="p-6">
            <Card className="max-w-4xl mx-auto">
              <CardHeader>
                <div className="flex items-center gap-3 text-amber-500 mb-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="text-sm font-medium">Emergency Request</span>
                </div>
                <CardTitle>New Emergency Fund Request</CardTitle>
                <CardDescription>
                  Use this form to request emergency funds for unexpected park needs. These requests will be reviewed by government officials.
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Request Title</FormLabel>
                          <FormControl>
                            <Input placeholder="E.g., Flood Damage Repair" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Amount ($)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="0.00" 
                                {...field}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  field.onChange(value === '' ? undefined : Number(value));
                                }}
                              />
                            </FormControl>
                            <FormDescription>
                              Enter the total amount needed for this emergency
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="parkName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Park</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select park" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                              <SelectItem value="Volcanoes National Park">Volcanoes National Park</SelectItem>
                              <SelectItem value="Nyungwe National Park">Nyungwe National Park</SelectItem>
                              <SelectItem value="Akagera National Park">Akagera National Park</SelectItem>
                              <SelectItem value="Gishwati-Mukura National Park">Gishwati-Mukura National Park</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="emergencyType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Emergency Type</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Renovation">Renovation</SelectItem>
                                <SelectItem value="Hiring New Stuff">Hiring New Stuff</SelectItem>
                                <SelectItem value="Maintenance">Maintenance</SelectItem>
                                <SelectItem value="Buying New Trees">Buying New Trees</SelectItem>
                              </SelectContent>

                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="timeframe"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Required Timeframe</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select timeframe" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="immediate">Immediate (24-48 hours)</SelectItem>
                                <SelectItem value="urgent">Urgent (3-7 days)</SelectItem>
                                <SelectItem value="high">High Priority (1-2 weeks)</SelectItem>
                                <SelectItem value="standard">Standard (2-4 weeks)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Provide detailed information about the emergency situation..." 
                              {...field} 
                              className="min-h-[100px]"
                            />
                          </FormControl>
                          <FormDescription>
                            Describe the emergency situation in detail
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="justification"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Justification for Emergency Funds</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Explain why this requires emergency funding outside the regular budget..." 
                              {...field} 
                              className="min-h-[120px]"
                            />
                          </FormControl>
                          <FormDescription>
                            Provide a compelling justification for why this situation requires immediate funding
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end gap-4 pt-4">
                      <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-amber-600 hover:bg-amber-700">
                        Submit Emergency Request
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default EmergencyRequestForm;