import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
  }
  
const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => (
    <Card className="glass-card">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold">{value}</h3>
          </div>
          {icon}
        </div>
      </CardContent>
    </Card>
);

export default StatCard;