import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import axios from 'axios';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  park_name?: string;
}

interface AddParkStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  userToEdit: User | null;
  onSuccess?: () => void;
}

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const formSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters.').nonempty('First name is required.'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters.').nonempty('Last name is required.'),
  email: z.string().email('Please enter a valid email address.').nonempty('Email is required.'),
  role: z.enum(['park-staff', 'auditor', 'government', 'finance'], { 
    required_error: 'Please select a role.' 
  }),
  park_name: z.string().optional(),
  password: z.string().refine(
    (value) => !value || passwordRegex.test(value),
    'Password must be 8+ characters with uppercase, lowercase, number, and special character.'
  ).refine((value) => value !== '', { message: 'Password is required for new staff.' }).or(z.literal('')),
});

type FormValues = z.infer<typeof formSchema>;

const AddParkStaffModal: React.FC<AddParkStaffModalProps> = ({ isOpen, onClose, userToEdit, onSuccess }) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      role: 'park-staff',
      park_name: '',
      password: '',
    },
  });

  useEffect(() => {
    if (userToEdit) {
      form.reset({
        firstName: userToEdit.firstName,
        lastName: userToEdit.lastName,
        email: userToEdit.email,
        role: userToEdit.role as FormValues['role'],
        park_name: userToEdit.park_name || '',
        password: '',
      });
    } else {
      form.reset({
        firstName: '',
        lastName: '',
        email: '',
        role: 'park-staff',
        park_name: '',
        password: '',
      });
    }
  }, [userToEdit, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      const API_URL = 'http://localhost:5000/api';
      // Ensure park_name is required for park-staff, auditor, and government roles
      if (['park-staff', 'auditor', 'government'].includes(values.role) && !values.park_name) {
        form.setError('park_name', { 
          type: 'manual', 
          message: `Park is required for ${values.role} role.` 
        });
        return;
      }
      // Ensure password is provided for new staff
      if (!values.password && !userToEdit) {
        form.setError('password', { 
          type: 'manual', 
          message: 'Password is required for new staff.' 
        });
        return;
      }

      const payload = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        role: values.role,
        park_name: values.park_name || null,
        password: values.password || undefined,
      };

      if (userToEdit) {
        await axios.put(`${API_URL}/staff/${userToEdit.id}?role=${values.role}`, payload);
        toast.success('Staff member updated successfully!');
      } else {
        await axios.post(`${API_URL}/staff`, payload);
        toast.success('Staff member added successfully!');
      }

      onSuccess?.();
      onClose();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'An error occurred while saving the staff member.';
      toast.error(errorMessage);
      console.error('Error saving staff member:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{userToEdit ? 'Edit Staff Member' : 'Add New Staff Member'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="park-staff">Park Staff</SelectItem>
                      <SelectItem value="auditor">Auditor</SelectItem>
                      <SelectItem value="government">Government Officer</SelectItem>
                      <SelectItem value="finance">Finance Officer</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="First name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Last name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Email address" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="park_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assigned Park</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a park" />
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
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password {userToEdit ? '(Leave blank to keep unchanged)' : ''}</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter password" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">{userToEdit ? 'Update Staff' : 'Add Staff'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddParkStaffModal;