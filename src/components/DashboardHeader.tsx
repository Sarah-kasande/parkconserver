
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Bell, User, ChevronDown, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
}

const DashboardHeader = ({ title, subtitle, className }: DashboardHeaderProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return null;
  }

  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;

  return (
    <header className={cn('flex justify-between items-center py-4 px-6', className)}>
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {subtitle && <p className="text-gray-500">{subtitle}</p>}
      </div>
      <div className="flex items-center space-x-4">
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={`https://avatars.dicebear.com/api/initials/${initials}.svg`} alt={user.firstName} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start text-sm">
                <span>{user.firstName} {user.lastName}</span>
                <span className="text-xs text-gray-500 capitalize">{user.role.replace('-', ' ')}</span>
              </div>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={handleLogout} className="text-red-500">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default DashboardHeader;
