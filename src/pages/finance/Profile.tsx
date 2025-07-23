import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider } from '@/components/ui/sidebar';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Mail, Shield, Key, Phone, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const FinanceProfile = () => {
  const { user, isAuthenticated, setUser, logout } = useAuth();
  const navigate = useNavigate();

  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    jobTitle: 'Finance Officer',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  useEffect(() => {
     if (user) {
      setProfileForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        jobTitle: 'Finance Officer',
      });
    }
  }, [isAuthenticated, navigate, user]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };

  const handleSaveProfile = async () => {
    if (!user?.id) return;

    setIsSaving(true);
    try {
      // Update profile information
      const response = await axios.put(`${API_URL}/finance/profile`, {
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
        email: profileForm.email,
        phone: profileForm.phone,
      }, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      // Update avatar if a new one was selected
      if (avatarFile) {
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        
        const avatarResponse = await axios.post(`${API_URL}/finance/avatar`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
        });
        
        setUser({
          ...user,
          avatarUrl: avatarResponse.data.avatarUrl,
        });
      }

      // Update user context
      setUser({
        ...user,
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
        email: profileForm.email,
        phone: profileForm.phone,
      });

      toast.success('Profile updated successfully!');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordForm;
    const token = localStorage.getItem('token');
  
    if (!token) {
      toast.error('Session expired. Please log in again.');
      logout();
      navigate('/login');
      return;
    }
  
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill all password fields');
      return;
    }
  
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
  
    setIsSaving(true);
    try {
      await axios.put(`${API_URL}/finance/password`, {
        currentPassword,
        newPassword,
        confirmPassword,
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
  
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      toast.success('Password changed successfully!');
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast.error(error.response?.data?.error || 'Failed to change password');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    setIsSaving(true);
    try {
      await axios.delete(`${API_URL}/finance/account`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      logout();
      navigate('/login');
      toast.success('Account deleted successfully');
    } catch (error: any) {
      console.error('Error deleting account:', error);
      toast.error(error.response?.data?.error || 'Failed to delete account');
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;

  const initials = `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50 w-full">
        <DashboardSidebar />
        
        <div className="flex-1">
          <DashboardHeader title="Profile" subtitle="Manage your account settings" />
          
          <main className="p-6">
            <div className="max-w-4xl mx-auto">
              <Card className="shadow-sm">
                <CardHeader className="border-b">
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Update your profile and security settings</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Tabs defaultValue="profile" className="w-full">
                    <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
                      <TabsTrigger 
                        value="profile"
                        className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary"
                      >
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </TabsTrigger>
                      <TabsTrigger 
                        value="security"
                        className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary"
                      >
                        <Shield className="mr-2 h-4 w-4" />
                        Security
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile" className="p-6">
                      <div className="flex flex-col lg:flex-row gap-8">
                        <div className="flex flex-col items-center lg:w-1/3">
                          <Avatar className="h-32 w-32 mb-4">
                            <AvatarImage src={user.avatarUrl} alt={`${user.firstName} ${user.lastName}`} />
                            <AvatarFallback className="text-3xl">
                              <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${initials}`} alt={initials} />
                            </AvatarFallback>
                          </Avatar>
                          <Input
                            type="file"
                            accept="image/*"
                            id="avatar"
                            onChange={handleAvatarChange}
                            className="mb-4"
                          />
                          <div className="text-center">
                            <h3 className="font-medium text-lg">
                              {profileForm.firstName} {profileForm.lastName}
                            </h3>
                            <p className="text-gray-500 mt-1 capitalize">
                              {profileForm.jobTitle}
                            </p>
                            {user.park && (
                              <p className="text-primary text-sm mt-1">
                                {user.park} Park
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="lg:w-2/3 space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="firstName">First Name</Label>
                              <div className="mt-1 relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <Input
                                  id="firstName"
                                  name="firstName"
                                  className="pl-10"
                                  value={profileForm.firstName}
                                  onChange={handleProfileChange}
                                />
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="lastName">Last Name</Label>
                              <div className="mt-1 relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <Input
                                  id="lastName"
                                  name="lastName"
                                  className="pl-10"
                                  value={profileForm.lastName}
                                  onChange={handleProfileChange}
                                />
                              </div>
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="email">Email</Label>
                            <div className="mt-1 relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                              <Input
                                id="email"
                                name="email"
                                type="email"
                                className="pl-10"
                                value={profileForm.email}
                                onChange={handleProfileChange}
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="phone">Phone</Label>
                            <div className="mt-1 relative">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                              <Input
                                id="phone"
                                name="phone"
                                className="pl-10"
                                value={profileForm.phone}
                                onChange={handleProfileChange}
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="jobTitle">Job Title</Label>
                            <div className="mt-1 relative">
                              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                              <Input
                                id="jobTitle"
                                name="jobTitle"
                                className="pl-10"
                                value={profileForm.jobTitle}
                                disabled
                              />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Job title is managed by system administrators
                            </p>
                          </div>

                          <Button 
                            onClick={handleSaveProfile} 
                            disabled={isSaving}
                            className="w-full md:w-auto"
                          >
                            {isSaving ? 'Saving...' : 'Save Changes'}
                          </Button>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="security" className="p-6">
                      <div className="space-y-6 max-w-lg">
                        <div>
                          <h3 className="text-lg font-medium">Change Password</h3>
                          <p className="text-sm text-gray-500">
                            Update your password to keep your account secure
                          </p>
                        </div>

                        <div>
                          <Label htmlFor="currentPassword">Current Password</Label>
                          <div className="mt-1 relative">
                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                              id="currentPassword"
                              name="currentPassword"
                              type="password"
                              className="pl-10"
                              value={passwordForm.currentPassword}
                              onChange={handlePasswordChange}
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="newPassword">New Password</Label>
                          <div className="mt-1 relative">
                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                              id="newPassword"
                              name="newPassword"
                              type="password"
                              className="pl-10"
                              value={passwordForm.newPassword}
                              onChange={handlePasswordChange}
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="confirmPassword">Confirm New Password</Label>
                          <div className="mt-1 relative">
                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                              id="confirmPassword"
                              name="confirmPassword"
                              type="password"
                              className="pl-10"
                              value={passwordForm.confirmPassword}
                              onChange={handlePasswordChange}
                            />
                          </div>
                        </div>

                        <Button 
                          onClick={handleChangePassword} 
                          disabled={isSaving}
                          className="w-full md:w-auto"
                        >
                          {isSaving ? 'Saving...' : 'Change Password'}
                        </Button>

                        <div className="mt-8 pt-8 border-t">
                          <h3 className="text-lg font-medium text-red-600">Danger Zone</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            Permanently delete your account and all associated data
                          </p>
                          <Button 
                            variant="destructive" 
                            className="mt-4"
                            onClick={handleDeleteAccount}
                            disabled={isSaving}
                          >
                            {isSaving ? 'Processing...' : 'Delete Account'}
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default FinanceProfile;