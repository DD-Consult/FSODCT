import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, GraduationCap, ArrowRight, BarChart3, BookOpen, PlayCircle } from "lucide-react";

const PortalSelection = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4" data-testid="portal-title">
            FSO Digital Capability Trial
          </h1>
          <p className="text-xl text-blue-200">Powered by DD Consulting</p>
          <p className="text-lg text-slate-300 mt-4">Select your portal to continue</p>
        </div>

        {/* Portal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* PMO Portal */}
          <Card 
            className="glass-card hover-lift cursor-pointer transition-all duration-300 hover:scale-105 border-2 border-blue-300"
            onClick={() => navigate("/login")}
            data-testid="pmo-portal-card"
          >
            <CardContent className="p-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BarChart3 size={40} className="text-white" />
                </div>
                <h2 className="text-3xl font-bold text-slate-800 mb-3">PMO Team Portal</h2>
                <p className="text-slate-600 mb-6 text-base">
                  Project governance, analytics dashboard, and team collaboration for FSO, Darevolution, and DD Consulting.
                </p>
                <div className="space-y-2 text-left mb-6">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Users size={18} className="text-blue-600" />
                    <span className="text-sm">Project governance dashboard</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <BarChart3 size={18} className="text-blue-600" />
                    <span className="text-sm">Cohort analytics & insights</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <BookOpen size={18} className="text-blue-600" />
                    <span className="text-sm">Weekly iteration huddles</span>
                  </div>
                </div>
                <Button 
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium text-base"
                  data-testid="pmo-portal-button"
                >
                  Access PMO Portal
                  <ArrowRight className="ml-2" size={20} />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Learner Portal */}
          <Card 
            className="glass-card hover-lift cursor-pointer transition-all duration-300 hover:scale-105 border-2 border-green-300"
            onClick={() => navigate("/learner-portal")}
            data-testid="learner-portal-card"
          >
            <CardContent className="p-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <GraduationCap size={40} className="text-white" />
                </div>
                <h2 className="text-3xl font-bold text-slate-800 mb-3">Learner Portal</h2>
                <p className="text-slate-600 mb-6 text-base">
                  Register for training, access course modules, track your progress, and develop your digital skills.
                </p>
                <div className="space-y-2 text-left mb-6">
                  <div className="flex items-center gap-2 text-slate-700">
                    <GraduationCap size={18} className="text-green-600" />
                    <span className="text-sm">Enroll in digital training programs</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <BookOpen size={18} className="text-green-600" />
                    <span className="text-sm">Access learning modules & resources</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <BarChart3 size={18} className="text-green-600" />
                    <span className="text-sm">Track your learning progress</span>
                  </div>
                </div>
                <Button 
                  className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-medium text-base"
                  data-testid="learner-portal-button"
                >
                  Access Learner Portal
                  <ArrowRight className="ml-2" size={20} />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-slate-300 text-sm">
          <p>© 2025 FSO Digital Capability Trial | Powered by DD Consulting</p>
        </div>
      </div>
    </div>
  );
};

export default PortalSelection;
