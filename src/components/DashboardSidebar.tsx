
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger
} from '@/components/ui/sidebar';
import { LogOut, User, LayoutDashboard, Users, Settings, FileText, DollarSign, PiggyBank, Calendar, Clock, CreditCard, Landmark, AlertTriangle, FileBarChart, Activity, ClipboardCheck, UserCheck, Mail } from 'lucide-react';

interface SidebarLinkProps {
  to: string;
  icon: React.ElementType;
  children: React.ReactNode;
  active?: boolean;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ to, icon: Icon, children, active }) => {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild className={active ? 'bg-sidebar-accent text-primary' : ''}>
        <Link to={to} className="flex items-center gap-2">
          <Icon size={18} />
          <span>{children}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

const DashboardSidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) {
    return null;
  }

  const role = user.role;

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="flex flex-col items-center p-4 border-b">
        <Link to="/" className="grid items-center space-x-2">
          <div className="rounded-full bg-consevation-600 flex items-center justify-center">
            <span className="text-conservation-600 font-bold text-2xl">Park Pro</span>
          </div>
          <span className="text-md font-bold text-primary mt-4">{user.park ? user.park : `${user.park} National Park`}</span>
        </Link>
        <div className="mt-4 w-full">
          <SidebarTrigger />
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
      {/* {role === 'visitors' && (
          <SidebarGroup>
            <SidebarGroupLabel>Visitors</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
              <SidebarLink to="/visitors/Dashboard" icon={LayoutDashboard} active={isActive('/visitors/Dashboard')}>
                  Dashboard
                </SidebarLink>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )} */}


        {role === 'admin' && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
              <SidebarLink to="/admin/dashboard" icon={LayoutDashboard} active={isActive('/admin/dashboard')}>
                  Dashboard
                </SidebarLink>
                <SidebarLink to="/admin/users" icon={Settings} active={isActive('/admin/users')}>
                  User Management
                </SidebarLink>
                <SidebarLink to="/admin/email" icon={Mail} active={isActive('/admin/email')}>
                  Email 
                </SidebarLink>
                <SidebarLink to="/admin/profile" icon={User} active={isActive('/admin/profile')}>
                  Profile
                </SidebarLink>
                
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {role === 'park-staff' && (
          <SidebarGroup>
            <SidebarGroupLabel>Park Staff</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarLink to="/parkstaff/dashboard" icon={LayoutDashboard} active={isActive('/park-staff/fund-requests')}>
                  Dashboard
                </SidebarLink>
                <SidebarLink to="/parkstaff/fund-requests" icon={FileText} active={isActive('/park-staff/fund-requests')}>
                  Fund Requests
                </SidebarLink>
                <SidebarLink to="/parkstaff/profile" icon={User} active={isActive('/parkstaff/profile')}>
                  Profile
                </SidebarLink>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {role === 'government' && (
          <SidebarGroup>
            <SidebarGroupLabel>Government</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarLink to="/government/dashboard" icon={LayoutDashboard} active={isActive('/government/dashboard')}>
                  Dashboard
                </SidebarLink>
                <SidebarLink to="/government/budget" icon={DollarSign} active={isActive('/government/budget')}>
                  Budget
                </SidebarLink>
                <SidebarLink to="/government/emergency-requests" icon={AlertTriangle} active={isActive('/government/emergency-requests')}>
                  Emergency Requests
                </SidebarLink>
                <SidebarLink to="/government/extra-funds" icon={PiggyBank} active={isActive('/government/extra-funds')}>
                  Extra Funds
                </SidebarLink>
                <SidebarLink to="/government/profile" icon={User} active={isActive('/government/profile')}>
                  Profile
                </SidebarLink>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {role === 'finance' && (
          <SidebarGroup>
            <SidebarGroupLabel>Finance</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
              <SidebarLink to="/finance/dashboard" icon={LayoutDashboard} active={isActive('/finance/dashboard')}>
                  Dashboard
                </SidebarLink>
                {/* <SidebarLink to="/finance/budget-suggestion" icon={Landmark} active={isActive('/finance/budget-suggestion')}>
                  Budget Suggestion
                </SidebarLink> */}
                <SidebarLink to="/finance/donations" icon={PiggyBank} active={isActive('/finance/donations')}>
                  Donations
                </SidebarLink>
                <SidebarLink to="/finance/booked-tours" icon={Calendar} active={isActive('/finance/booked-tours')}>
                  Booked Tours
                </SidebarLink>
                <SidebarLink to="/finance/request-management" icon={ClipboardCheck} active={isActive('/finance/request-management')}>
                  Fund Requests
                </SidebarLink>
                <SidebarLink to="/finance/emergency-requests" icon={AlertTriangle} active={isActive('/finance/emergency-requests')}>
                  Emergency Requests
                </SidebarLink>
                <SidebarLink to="/finance/extra-funds" icon={PiggyBank} active={isActive('/finance/extra-funds')}>
                  Extra Funds
                </SidebarLink>
                <SidebarLink to="/finance/service-providers" icon={UserCheck} active={isActive('/finance/service-providers')}>
                  Service Providers
                </SidebarLink>
                <SidebarLink to="/finance/budget-creation" icon={DollarSign} active={isActive('/finance/budget-creation')}>
                  Budget Creation
                </SidebarLink>
                <SidebarLink to="/finance/profile" icon={User} active={isActive('/finance/profile')}>
                  Profile
                </SidebarLink>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {role === 'auditor' && (
          <SidebarGroup>
            <SidebarGroupLabel>Auditor</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarLink to="/auditor/dashboard" icon={LayoutDashboard} active={isActive('/auditor/dashboard')}>
                  Dashboard
                </SidebarLink>
                <SidebarLink to="/auditor/financial-reports" icon={FileBarChart} active={isActive('/auditor/financial-reports')}>
                  Financial Reports
                </SidebarLink>
                <SidebarLink to="/auditor/invoices" icon={FileText} active={isActive('/auditor/invoices')}>
                  Invoices
                </SidebarLink>
                <SidebarLink to="/auditor/profile" icon={User} active={isActive('/auditor/profile')}>
                  Profile
                </SidebarLink>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t">
        <button
          onClick={logout}
          className="flex items-center gap-2 w-full rounded-md px-3 py-2 hover:bg-gray-100 transition-colors text-danger-500"
        >
          
        </button>
        <div className="mt-4 text-center text-xs text-gray-500">
          {user?.firstName} {user?.lastName}
          <div className="text-primary capitalize mt-1">{user?.role.replace('-', ' ')}</div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default DashboardSidebar;
