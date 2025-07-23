import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CalendarRange } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRangePicker } from '@/components/ui/date-range-picker';

interface UserActivity {
  id: string;
  userId: string;
  userName: string;
  park: string;
  action: 'login' | 'logout';
  timestamp: string;
  device: string;
  ip: string;
}

const mockActivityData: UserActivity[] = [
  { id: '1', userId: '2', userName: 'Jane Smith', park: 'Yosemite', action: 'login', timestamp: '2023-10-14 08:32:45', device: 'Desktop - Chrome', ip: '192.168.1.101' },
  { id: '2', userId: '2', userName: 'Jane Smith', park: 'Yosemite', action: 'logout', timestamp: '2023-10-14 17:15:22', device: 'Desktop - Chrome', ip: '192.168.1.101' },
  { id: '3', userId: '6', userName: 'Lisa Davis', park: 'Acadia', action: 'login', timestamp: '2023-10-14 09:01:15', device: 'Mobile - Safari', ip: '192.168.1.102' },
  { id: '4', userId: '6', userName: 'Lisa Davis', park: 'Acadia', action: 'logout', timestamp: '2023-10-14 16:45:33', device: 'Mobile - Safari', ip: '192.168.1.102' },
  { id: '5', userId: '2', userName: 'Jane Smith', park: 'Yosemite', action: 'login', timestamp: '2023-10-15 08:17:45', device: 'Desktop - Chrome', ip: '192.168.1.101' },
  { id: '6', userId: '6', userName: 'Lisa Davis', park: 'Acadia', action: 'login', timestamp: '2023-10-15 08:55:19', device: 'Mobile - Safari', ip: '192.168.1.102' },
  { id: '7', userId: '2', userName: 'Jane Smith', park: 'Yosemite', action: 'logout', timestamp: '2023-10-15 16:48:37', device: 'Desktop - Chrome', ip: '192.168.1.101' },
  { id: '8', userId: '6', userName: 'Lisa Davis', park: 'Acadia', action: 'logout', timestamp: '2023-10-15 17:02:41', device: 'Mobile - Safari', ip: '192.168.1.102' },
];

const UserActivityTable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPark, setFilterPark] = useState<string>('all');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  // Filter the data based on search term and filters
  const filteredData = mockActivityData.filter(activity => {
    const matchesSearch = 
      activity.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.park.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPark = filterPark === 'all' || activity.park === filterPark;
    const matchesAction = filterAction === 'all' || activity.action === filterAction;
    
    return matchesSearch && matchesPark && matchesAction;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
          <div className="w-full sm:w-64">
            <Input
              placeholder="Search user or park..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select value={filterPark} onValueChange={setFilterPark}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Filter by park" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Parks</SelectItem>
              <SelectItem value="Yosemite">Yosemite</SelectItem>
              <SelectItem value="Acadia">Acadia</SelectItem>
              <SelectItem value="Yellowstone">Yellowstone</SelectItem>
              <SelectItem value="Grand Canyon">Grand Canyon</SelectItem>
              <SelectItem value="Zion">Zion</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterAction} onValueChange={setFilterAction}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="login">Login</SelectItem>
              <SelectItem value="logout">Logout</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex justify-end">
          <DateRangePicker date={dateRange} onSelect={setDateRange} />
        </div>
      </div>
      
      <div className="overflow-auto rounded-md border">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-600">User</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Park</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Action</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Timestamp</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Device</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">IP Address</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((activity, index) => (
              <tr 
                key={activity.id} 
                className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
              >
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={`https://avatars.dicebear.com/api/initials/${activity.userName.charAt(0)}${activity.userName.split(' ')[1]?.charAt(0) || ''}.svg`} alt={activity.userName} />
                      <AvatarFallback>{activity.userName.charAt(0)}{activity.userName.split(' ')[1]?.charAt(0) || ''}</AvatarFallback>
                    </Avatar>
                    <div className="font-medium">{activity.userName}</div>
                  </div>
                </td>
                <td className="py-3 px-4">{activity.park}</td>
                <td className="py-3 px-4">
                  <Badge className={activity.action === 'login' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}>
                    {activity.action === 'login' ? 'Login' : 'Logout'}
                  </Badge>
                </td>
                <td className="py-3 px-4">{activity.timestamp}</td>
                <td className="py-3 px-4">{activity.device}</td>
                <td className="py-3 px-4">{activity.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">Showing {filteredData.length} of {mockActivityData.length} activities</div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">Previous</Button>
          <Button variant="outline" size="sm">Next</Button>
        </div>
      </div>
    </div>
  );
};

export default UserActivityTable;