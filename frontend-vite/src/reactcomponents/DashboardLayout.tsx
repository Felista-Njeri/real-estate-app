import { ReactNode, useState } from "react";
import { SidebarNav } from "./SidebarNav";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState("dashboard");

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen flex overflow-hidden">
      <SidebarNav 
        onSelect={setActiveSection}
        isOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar}
        activeSection={activeSection} 
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
         {children}
        </main>
      </div>
    </div>
  );
}
