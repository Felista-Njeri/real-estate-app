
import { Button } from "@/components/ui/button";
import {
  BarChartIcon,
  Building2,
  Coins,
  ChevronLeft,
  ChevronRight,
  Settings,
} from "lucide-react";
import { Link } from "react-router";

interface SidebarNavProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  onSelect: (key: string) => void;
  activeSection: string; 
}

interface NavItem {
  title: string;
  key: string;
  icon: React.ElementType;
  to: string;
}

export function SidebarNav({ isOpen, toggleSidebar, onSelect, activeSection }: SidebarNavProps) {

  const mainNavItems: NavItem[] = [
    { title: "Dashboard", key: "dashboard", icon: BarChartIcon, to: "#" },
    { title: "Properties", key: "properties", icon: Building2, to: "/marketplace" },
    { title: "Dividends", key: "dividends", icon: Coins, to: "/investor-dividend-dashboard" },
    { title: "Settings", key: "settings", icon: Settings, to: "#" },
  ];

  return (
    <div
      className={`bg-white border-r border-gray-200 transition-all duration-300 flex flex-col ${
        isOpen ? "w-64" : "w-[70px]"
      }`}
    >
      <div className="p-4 flex items-center justify-between border-b">
        <div className={`flex items-center ${isOpen ? "" : "justify-center w-full"}`}>
          {/* Optional Logo */}
        </div>
        <button className="h-8 w-8" onClick={toggleSidebar}>
          {isOpen ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
      </div>

      <div className="flex-1 py-4 overflow-y-auto">
        <div className="px-3 mb-6">
          <h2
            className={`text-xs uppercase text-gray-500 font-medium mb-2 ${
              isOpen ? "px-2" : "text-center"
            }`}
          >
            {isOpen ? "Main" : ""}
          </h2>
          <nav className="space-y-1">
            {mainNavItems.map((item) => (
              <Link to={item.to} key={item.key}>
              <Button
                onClick={() => onSelect(item.key)}
                variant="ghost"
                className={`${
                    activeSection === item.key
                      ? "bg-gray-200 text-gray-900"
                      : "text-gray-600"
                  }`}
              >
                <item.icon className="h-5 w-5 text-gray-600" />
                {isOpen && <span className="ml-3">{item.title}</span>}
              </Button>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
