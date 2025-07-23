import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider } from '@/components/ui/sidebar';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import StatCard from '@/components/StatCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Clock, CheckCircle, XCircle, FileText, Calendar, PiggyBank } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const ParkStaffDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [tourBookings, setTourBookings] = useState([]);
  const [donations, setDonations] = useState([]);
  const [fundRequestStats, setFundRequestStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const parkname = user.park; // Get parkname from user context
    if (!parkname) {
      console.error('Park name not found in user context');
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const [toursResponse, donationsResponse, fundStatsResponse] = await Promise.all([
          axios.get(`${API_URL}/admin/tour-bookings`, {
            headers: { 'Authorization': `Bearer ${token}` },
            params: { parkname },
          }),
          axios.get(`${API_URL}/admin/donations`, {
            headers: { 'Authorization': `Bearer ${token}` },
            params: { parkname },
          }),
          axios.get(`${API_URL}/park-staff/fund-request-stats`, {
            headers: { 'Authorization': `Bearer ${token}` },
            params: { parkname },
          }),
        ]);
        setTourBookings(toursResponse.data.tour_bookings);
        setDonations(donationsResponse.data.donations);
        setFundRequestStats(fundStatsResponse.data.stats);
      } catch (error) {
        if (error.response?.data?.error === 'Token has expired') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        }
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, user, navigate]);

  if (!user || user.role !== 'park-staff') return null;

  const iconMap = {
    FileText,
    Clock,
    CheckCircle,
    XCircle,
    Calendar,
    PiggyBank,
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50 w-full">
        <DashboardSidebar />
        <div className="flex-1">
          <DashboardHeader
            title={`Park Staff Dashboard - ${user.park}`}
            subtitle="Manage your park's funding and activities"
          />
          <main className="p-6">
            {loading ? (
              <div className="text-center py-12">Loading dashboard data...</div>
            ) : (
              <>
                {/* Fund Request Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {fundRequestStats.map((stat, index) => (
                    <StatCard
                      key={index}
                      title={stat.title}
                      value={stat.value}
                      icon={iconMap[stat.icon]}
                      className="animate-fade-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    />
                  ))}
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default ParkStaffDashboard;