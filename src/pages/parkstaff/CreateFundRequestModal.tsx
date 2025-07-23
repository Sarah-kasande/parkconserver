import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

// Updated form schema without parkname
const formSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters.' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  amount: z.coerce.number().positive({ message: 'Amount must be a positive number.' }),
  category: z.string().min(1, { message: 'Please select a category.' }),
  urgency: z.enum(['low', 'medium', 'high'], { required_error: 'Please select an urgency level.' }),
});

type FormValues = z.infer<typeof formSchema>;

// Align with FundRequests.tsx and backend expectations
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
  parkname: string;
}

interface CreateFundRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormValues) => void;
  initialData?: FundRequest | null;
}

const CreateFundRequestModal: React.FC<CreateFundRequestModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          title: initialData.title,
          description: initialData.description,
          amount: initialData.amount,
          category: initialData.category,
          urgency: initialData.urgency,
        }
      : {
          title: '',
          description: '',
          amount: undefined,
          category: '',
          urgency: 'medium',
        },
  });

  const handleSubmit = async (values: FormValues) => {
    try {
      await onSubmit(values);
      if (!initialData) {
        form.reset({
          title: '',
          description: '',
          amount: undefined,
          category: '',
          urgency: 'medium',
        });
      }
      toast.success(initialData ? 'Fund request updated successfully!' : 'Fund request submitted successfully!');
    } catch (error) {
      toast.error(`Failed to ${initialData ? 'update' : 'submit'} fund request`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Fund Request' : 'Create New Fund Request'}</DialogTitle>
          <DialogDescription>
            {initialData
              ? 'Modify the details of your existing fund request.'
              : 'Fill in the details to submit a new fund request for your park.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Request Title</FormLabel>
                  <FormControl>
                    <Input placeholder="E.g., Trail Maintenance Equipment" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide detailed information about the funding request..."
                      {...field}
                      className="min-h-[120px]"
                    />
                  </FormControl>
                  <FormDescription>
                    Include details on why these funds are needed and how they will be used.
                  </FormDescription>
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
                        value={field.value ?? ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === '' ? undefined : Number(value));
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                        <SelectItem value="Conservation">Conservation</SelectItem>
                        <SelectItem value="Education">Educating Our Park Staff</SelectItem>
                        <SelectItem value="Safety">Safety</SelectItem>
                        <SelectItem value="Research">Research over Parks</SelectItem>
                        <SelectItem value="Community">Community Engagement</SelectItem>
                        <SelectItem value="Salaries">Salaries</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="urgency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Urgency Level</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select urgency level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    High urgency requests are prioritized for faster review.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">{initialData ? 'Update Request' : 'Submit Request'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateFundRequestModal;