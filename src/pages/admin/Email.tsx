import React, { useState, useEffect } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Send } from 'lucide-react';
import emailjs from '@emailjs/browser';


interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  park: string;
}

const EMAIL_RATE_LIMIT = 5000; // 5 seconds between emails

const Emails = () => {
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState('');
  const [emailForm, setEmailForm] = useState({
    subject: '',
    message: '',
  });
  const [lastEmailSent, setLastEmailSent] = useState<number>(0);

  // Initialize EmailJS
  useEffect(() => {
    emailjs.init('I6uUY9YMMP0eOEOUc');
  }, []);

  // Fetch staff members
  useEffect(() => {
    const fetchStaffMembers = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:5000/api/staff', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch staff members: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Remove duplicates based on email
        const uniqueStaff = data.reduce((acc: StaffMember[], current: StaffMember) => {
          const exists = acc.find(item => item.email === current.email);
          if (!exists) {
            acc.push(current);
          }
          return acc;
        }, []);

        setStaffMembers(uniqueStaff);
      } catch (error) {
        console.error('Fetch Error:', error);
        toast({
          title: 'Error',
          description: 'Failed to load staff members. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStaffMembers();
  }, []);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSendEmail = async () => {
    // Check rate limiting
    const now = Date.now();
    if (now - lastEmailSent < EMAIL_RATE_LIMIT) {
      toast({
        title: 'Please wait',
        description: 'Please wait a few seconds before sending another email',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedEmail || !emailForm.subject.trim() || !emailForm.message.trim()) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    // Validate email
    if (!validateEmail(selectedEmail)) {
      toast({
        title: 'Error',
        description: 'Invalid email address',
        variant: 'destructive',
      });
      return;
    }

    setSending(true);
    let retries = 0;
    const maxRetries = 2;

    while (retries <= maxRetries) {
      try {
        const recipient = staffMembers.find((staff) => staff.email === selectedEmail);
        
        const templateParams = {
          email: selectedEmail,
          name: selectedEmail,
          title: emailForm.subject.trim(),
          message: emailForm.message.trim(),
        };

        const response = await emailjs.send(
          'service_igz6o0i',
          'template_0yx40dq',
          templateParams,
          'I6uUY9YMMP0eOEOUc'
        );

        if (response.status === 200) {
          setLastEmailSent(Date.now());
          toast({
            title: 'Success',
            description: 'Email sent successfully',
          });

          // Reset form
          setEmailForm({
            subject: '',
            message: '',
          });
          setSelectedEmail('');
          break; // Success, exit retry loop
        } else {
          throw new Error('Failed to send email');
        }
      } catch (error: any) {
        console.error(`EmailJS Error (attempt ${retries + 1}/${maxRetries + 1}):`, error);
        
        if (retries === maxRetries) {
          toast({
            title: 'Error',
            description: error.text || 'Failed to send email after multiple attempts',
            variant: 'destructive',
          });
        } else {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
          retries++;
          continue;
        }
      }
    }
    setSending(false);
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50 w-full">
        <DashboardSidebar />
        <div className="flex-1">
          <DashboardHeader
            title="Email Dashboard"
            subtitle="Send emails to staff members"
          />
          <main className="p-6">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>Send Email</CardTitle>
                <CardDescription>Compose and send an email to staff members</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="recipient">Recipient Email</Label>
                  <Select 
                    value={selectedEmail} 
                    onValueChange={(value) => {
                      console.log('Selected email:', value);
                      setSelectedEmail(value);
                    }}
                  >
                    <SelectTrigger id="recipient">
                      <SelectValue placeholder="Select recipient email" />
                    </SelectTrigger>
                    <SelectContent>
                      {loading ? (
                        <SelectItem value="loading" disabled>
                          Loading staff members...
                        </SelectItem>
                      ) : staffMembers.length === 0 ? (
                        <SelectItem value="none" disabled>
                          No staff members found
                        </SelectItem>
                      ) : (
                        staffMembers.map((staff) => (
                          <SelectItem key={staff.email} value={staff.email}>
                            {staff.email} ({staff.firstName} {staff.lastName})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={emailForm.subject}
                    onChange={(e) =>
                      setEmailForm((prev) => ({ ...prev, subject: e.target.value }))
                    }
                    placeholder="Enter email subject"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={emailForm.message}
                    onChange={(e) =>
                      setEmailForm((prev) => ({ ...prev, message: e.target.value }))
                    }
                    placeholder="Write your message here"
                    rows={8}
                  />
                </div>

                <Button
                  className="w-full"
                  onClick={handleSendEmail}
                  disabled={sending || !selectedEmail}
                >
                  <Send className="mr-2 h-4 w-4" />
                  {sending ? 'Sending...' : 'Send Email'}
                </Button>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Emails;