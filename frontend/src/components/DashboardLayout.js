import { Outlet, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { LayoutDashboard, Users, FileText, LogOut, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const DashboardLayout = ({ user, setIsAuthenticated }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post(`${API}/auth/logout`);
      toast.success("Logged out successfully");
      setIsAuthenticated(false);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    }
  };

  const menuItems = [
    { icon: LayoutDashboard, label: "Overview", path: "/dashboard" },
    { icon: Users, label: "Cohort 1 (VET)", path: "/dashboard/cohort/1" },
    { icon: Users, label: "Cohort 2 (First Nations)", path: "/dashboard/cohort/2" },
    { icon: Users, label: "Cohort 3 (Other)", path: "/dashboard/cohort/3" },
    { icon: FileText, label: "Weekly Huddle", path: "/dashboard/weekly-huddle" },
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-800 text-white flex flex-col relative">
        {/* Logo - Top Left Corner of Sidebar */}
        <div className="absolute top-2 left-2 z-20">
          <img 
            src="/darevolution-logo.png" 
            alt="Darevolution" 
            className="h-12 w-auto opacity-80 hover:opacity-100 transition-opacity"
          />
        </div>

        {/* Logo/Branding */}
        <div className="p-6 border-b border-slate-700 pt-16">
          <h1 className="text-xl font-bold mb-1">FSO Digital Capability Trial</h1>
          <p className="text-xs text-slate-400">Powered by DD Consulting</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item, index) => (
            <button
              key={index}
              data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => navigate(item.path)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all hover:bg-slate-700 hover:translate-x-1"
            >
              <item.icon size={20} />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-3 mb-3">
            <Avatar>
              <AvatarImage src={user?.picture} alt={user?.name} />
              <AvatarFallback className="bg-blue-600">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <Button
            data-testid="logout-button"
            onClick={handleLogout}
            variant="outline"
            className="w-full justify-start gap-2 text-slate-300 border-slate-600 hover:bg-slate-700 hover:text-white"
          >
            <LogOut size={16} />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
