import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { CheckCircle2, AlertTriangle, XCircle, Clock, TrendingUp } from "lucide-react";
import Joyride from "react-joyride";
import { usePMODemoTour } from "@/hooks/useDemoTour";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Overview = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { runTour, steps, handleJoyrideCallback } = usePMODemoTour();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get(`${API}/dashboard/overview`);
      setData(response.data);
    } catch (error) {
      console.error("Error fetching overview data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const StatusBadge = ({ status }) => {
    const config = {
      "On Track": { icon: CheckCircle2, color: "bg-green-100 text-green-800", dotColor: "bg-green-500" },
      "At Risk": { icon: AlertTriangle, color: "bg-amber-100 text-amber-800", dotColor: "bg-amber-500" },
      "Critical": { icon: XCircle, color: "bg-red-100 text-red-800", dotColor: "bg-red-500" },
      "In Progress": { icon: Clock, color: "bg-blue-100 text-blue-800", dotColor: "bg-blue-500" },
    };

    const { icon: Icon, color, dotColor } = config[status] || config["On Track"];

    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${color} font-medium text-sm`}>
        <span className={`w-2 h-2 rounded-full ${dotColor} animate-pulse`}></span>
        <Icon size={16} />
        {status}
      </div>
    );
  };

  const SentimentGauge = ({ value }) => {
    const rotation = (value / 100) * 180 - 90;
    const color = value >= 70 ? "#10b981" : value >= 50 ? "#f59e0b" : "#ef4444";

    return (
      <div className="relative w-64 h-32 mx-auto">
        <svg viewBox="0 0 200 100" className="w-full h-full">
          {/* Background arc */}
          <path
            d="M 20 90 A 80 80 0 0 1 180 90"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Colored sections */}
          <path
            d="M 20 90 A 80 80 0 0 1 100 10"
            fill="none"
            stroke="#ef4444"
            strokeWidth="12"
            strokeLinecap="round"
            opacity="0.3"
          />
          <path
            d="M 100 10 A 80 80 0 0 1 140 30"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="12"
            strokeLinecap="round"
            opacity="0.3"
          />
          <path
            d="M 140 30 A 80 80 0 0 1 180 90"
            fill="none"
            stroke="#10b981"
            strokeWidth="12"
            strokeLinecap="round"
            opacity="0.3"
          />
          {/* Active arc */}
          <path
            d={`M 20 90 A 80 80 0 ${value > 50 ? 1 : 0} 1 ${100 + 80 * Math.cos((rotation * Math.PI) / 180)} ${90 + 80 * Math.sin((rotation * Math.PI) / 180)}`}
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Needle */}
          <line
            x1="100"
            y1="90"
            x2={100 + 70 * Math.cos((rotation * Math.PI) / 180)}
            y2={90 + 70 * Math.sin((rotation * Math.PI) / 180)}
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="100" cy="90" r="6" fill={color} />
        </svg>
        <div className="absolute bottom-0 left-0 right-0 text-center">
          <div className="text-3xl font-bold" style={{ color }}>
            {value}%
          </div>
          <div className="text-sm text-slate-600">Positive Sentiment</div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Joyride
        steps={steps}
        run={runTour}
        continuous
        showProgress
        showSkipButton
        callback={handleJoyrideCallback}
        styles={{
          options: {
            primaryColor: "#3b82f6",
            zIndex: 10000,
          },
        }}
      />
      
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-slate-800 mb-2" data-testid="page-title">
          Project Governance Dashboard
        </h1>
        <p className="text-slate-600">Real-time insights and analytics for the FSO Digital Capability Trial</p>
      </div>

      {/* Project Vitals */}
      <Card className="hover-lift" data-tour="project-vitals">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="text-blue-600" size={20} />
            Project Vitals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-slate-600 mb-2">Overall Status</p>
              <StatusBadge status={data?.project_vitals?.status} />
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-2">Budget</p>
              <StatusBadge status={data?.project_vitals?.health?.budget} />
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-2">Schedule</p>
              <StatusBadge status={data?.project_vitals?.health?.schedule} />
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-2">Risk Level</p>
              <Badge className="bg-green-100 text-green-800 px-3 py-1.5">
                {data?.project_vitals?.health?.risk}
              </Badge>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-slate-600">Current Phase</p>
            <p className="text-lg font-semibold text-slate-800 mt-1">
              {data?.project_vitals?.current_phase}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recruitment Funnel */}
        <Card className="hover-lift" data-tour="recruitment-funnel">
          <CardHeader>
            <CardTitle>Learner Recruitment Tracker</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data?.recruitment_funnel?.map((cohort, index) => (
              <div key={index} data-testid={`recruitment-cohort-${index}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">{cohort.cohort}</span>
                  <span className="text-sm font-bold" style={{ color: cohort.color }}>
                    {cohort.recruited} / {cohort.target} ({cohort.percentage}%)
                  </span>
                </div>
                <Progress value={cohort.percentage} className="h-3" style={{ backgroundColor: '#e5e7eb' }} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* AI Sentiment Gauge */}
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle>Live Learner Sentiment (All Cohorts)</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-6">
            <SentimentGauge value={data?.ai_sentiment?.overall} />
          </CardContent>
        </Card>
      </div>

      {/* Project Milestones */}
      <Card className="hover-lift">
        <CardHeader>
          <CardTitle>Project Schedule (16 Weeks)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data?.project_milestones?.map((milestone, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-3 rounded-lg transition-all hover:bg-slate-50"
                data-testid={`milestone-${index}`}
              >
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: milestone.color }}
                />
                <div className="flex-1">
                  <p className="font-medium text-slate-800">{milestone.phase}</p>
                  <p className="text-sm text-slate-600">{milestone.status}</p>
                </div>
                {milestone.current && (
                  <Badge className="bg-blue-100 text-blue-800">You Are Here</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Heatmap */}
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle>Active Risk Heatmap</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data?.risk_heatmap?.map((risk, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg border transition-all hover:shadow-md"
                  style={{ borderColor: risk.color, borderWidth: '2px' }}
                  data-testid={`risk-${risk.id}`}
                >
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: risk.color }}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm text-slate-800">Risk #{risk.id}: {risk.risk}</p>
                    <p className="text-xs text-slate-600">
                      Likelihood: {risk.likelihood}/5 | Impact: {risk.impact}/5
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* My Tasks */}
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle>My Action Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data?.my_tasks?.map((task, index) => {
                const priorityColors = {
                  critical: "bg-red-100 text-red-800",
                  high: "bg-amber-100 text-amber-800",
                  medium: "bg-blue-100 text-blue-800",
                };
                return (
                  <div
                    key={index}
                    className="p-3 rounded-lg border border-slate-200 transition-all hover:shadow-md hover:border-blue-300"
                    data-testid={`task-${task.id}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="font-medium text-sm text-slate-800 flex-1">{task.task}</p>
                      <Badge className={priorityColors[task.priority]}>
                        {task.priority}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-600">
                      <span>Due: {task.due}</span>
                      <span>•</span>
                      <span>Owner: {task.owner}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Overview;
