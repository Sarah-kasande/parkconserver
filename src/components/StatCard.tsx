import { Card } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: LucideIcon;
  color?: string;
  className?:  string;
  style?: React.CSSProperties;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, trend, icon: Icon, color }) => {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-conservation-600">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-conservation-900">{value}</p>
          {change && (
            <p className={`mt-2 text-sm ${
              trend === 'up' 
                ? 'text-green-600' 
                : trend === 'down' 
                ? 'text-red-600' 
                : 'text-conservation-600'
            }`}>
              {change}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </Card>
  );
};

export default StatCard;
