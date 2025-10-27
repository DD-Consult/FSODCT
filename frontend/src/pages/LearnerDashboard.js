import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, BookOpen, Clock, Award, LogOut, CheckCircle2, Lock, PlayCircle, Trophy, Target, Monitor, Users } from "lucide-react";
import LearnerChatbot from "@/components/LearnerChatbot";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const LearnerDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const learnerId = localStorage.getItem("learner_id");
      if (!learnerId) {
        navigate("/learner-portal");
        return;
      }

      const response = await axios.get(`${API}/learners/dashboard/${learnerId}`);
      setData(response.data);
    } catch (error) {
      console.error("Dashboard error:", error);
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("learner_session");
    localStorage.removeItem("learner_id");
    toast.success("Logged out successfully");
    navigate("/learner-portal");
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="text-green-600" size={24} />;
      case "in_progress":
        return <PlayCircle className="text-blue-600" size={24} />;
      case "available":
        return <BookOpen className="text-amber-600" size={24} />;
      case "locked":
        return <Lock className="text-slate-400" size={24} />;
      default:
        return <BookOpen className="text-slate-400" size={24} />;
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      completed: { label: "Completed", className: "bg-green-100 text-green-800" },
      in_progress: { label: "In Progress", className: "bg-blue-100 text-blue-800" },
      available: { label: "Available", className: "bg-amber-100 text-amber-800" },
      locked: { label: "Locked", className: "bg-slate-100 text-slate-600" }
    };
    const { label, className } = config[status] || config.locked;
    return <Badge className={className}>{label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Chatbot Assistant */}
      <LearnerChatbot />
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between relative">
          {/* Logo - Left */}
          <div className="absolute left-4 top-2">
            <img 
              src="/darevolution-logo.png" 
              alt="Darevolution" 
              className="h-10 w-auto opacity-80"
            />
          </div>

          <div className="flex items-center gap-3 ml-24">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
              <GraduationCap size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800" data-testid="learner-dashboard-title">
                FSO Digital Training
              </h1>
              <p className="text-sm text-slate-600">Welcome back, {data?.learner?.name}!</p>
            </div>
          </div>
          
          {/* Logo - Right */}
          <div className="flex items-center gap-3">
            <img 
              src="/dd-consulting-logo.png" 
              alt="DD Consulting" 
              className="h-10 w-auto opacity-80"
            />
            <Button
              variant="outline"
              onClick={handleLogout}
              data-testid="learner-logout-button"
              className="gap-2"
            >
              <LogOut size={18} />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">
            Your Learning Journey
          </h2>
          <p className="text-slate-600">
            Track your progress and continue building your digital skills
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8" data-tour="stats-cards">
          <Card className="hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Target size={24} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Overall Progress</p>
                  <p className="text-2xl font-bold text-slate-800">{data?.overall_progress}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle2 size={24} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Completed</p>
                  <p className="text-2xl font-bold text-slate-800">
                    {data?.completed_modules}/{data?.total_modules}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-100 rounded-lg">
                  <Trophy size={24} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Current Streak</p>
                  <p className="text-2xl font-bold text-slate-800">{data?.current_streak} days</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Clock size={24} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Time Spent</p>
                  <p className="text-2xl font-bold text-slate-800">{data?.total_time_spent}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Overall Progress Bar */}
        <Card className="mb-8" data-tour="progress-bar">
          <CardHeader>
            <CardTitle>Your Learning Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Overall Completion</span>
                <span className="font-semibold">{data?.overall_progress}%</span>
              </div>
              <Progress value={data?.overall_progress} className="h-3" />
              <p className="text-xs text-slate-500 mt-2">
                Great progress! Keep going to complete all modules.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Modules Section */}
        <div>
          <h3 className="text-2xl font-bold text-slate-800 mb-4">Your Modules</h3>
          <div className="grid grid-cols-1 gap-6">
            {data?.modules?.map((module, index) => (
              <Card 
                key={index} 
                className={`hover-lift transition-all ${
                  module.status === "locked" ? "opacity-60" : "cursor-pointer"
                }`}
                onClick={() => module.status !== "locked" && navigate(`/learner-module/${module.id}`)}
                data-testid={`module-card-${module.id}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {getStatusIcon(module.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="text-xl font-bold text-slate-800 mb-1">
                            {module.title}
                          </h4>
                          <p className="text-slate-600 text-sm">{module.description}</p>
                        </div>
                        {getStatusBadge(module.status)}
                      </div>

                      <div className="flex items-center gap-6 text-sm text-slate-600 mb-3">
                        <div className="flex items-center gap-1">
                          <Clock size={16} />
                          <span>{module.duration}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <BookOpen size={16} />
                          <span>{module.lessons} lessons</span>
                        </div>
                        <div>
                          <Badge variant="outline">{module.difficulty}</Badge>
                        </div>
                      </div>

                      {module.status !== "locked" && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">
                              Progress: {module.completed_lessons}/{module.lessons} lessons
                            </span>
                            <span className="font-semibold text-slate-800">{module.progress}%</span>
                          </div>
                          <Progress value={module.progress} className="h-2" />
                        </div>
                      )}

                      {module.status === "locked" && (
                        <p className="text-sm text-slate-500 italic">
                          Complete previous modules to unlock
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Cohort Info */}
        <Card className="mt-8 border-2 border-green-200 bg-green-50" data-tour="cohort-badge">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Award size={24} className="text-green-600" />
                <div>
                  <p className="text-sm text-slate-600">You are enrolled in:</p>
                  <p className="text-lg font-bold text-slate-800">
                    {data?.learner?.cohort === "VET" && "Cohort 1 - VET (Vocational Education)"}
                    {data?.learner?.cohort === "First Nations" && "Cohort 2 - First Nations"}
                    {data?.learner?.cohort === "Other" && "Cohort 3 - Other"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {data?.learner?.class_type === "Digital" && <Monitor size={24} className="text-blue-600" />}
                {data?.learner?.class_type === "Face-to-Face" && <Users size={24} className="text-purple-600" />}
                {data?.learner?.class_type === "Both" && <Monitor size={24} className="text-indigo-600" />}
                <div>
                  <p className="text-sm text-slate-600">Class Type:</p>
                  <p className="text-lg font-bold text-slate-800">
                    {data?.learner?.class_type || "Digital"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default LearnerDashboard;
