import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Area, AreaChart } from "recharts";
import { CheckCircle2, AlertTriangle, XCircle, Clock, TrendingUp, TrendingDown, Users, Target, MessageSquare, FileCheck } from "lucide-react";
import { DemoTour, usePMODemoTour } from "@/hooks/useDemoTour";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Overview = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isActive, steps, onComplete } = usePMODemoTour();

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

  const SentimentGauge = ({ value = 0 }) => {
    const safeValue = value || 0;
    const rotation = (safeValue / 100) * 180 - 90;
    const color = safeValue >= 70 ? "#10b981" : safeValue >= 50 ? "#f59e0b" : "#ef4444";

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
            d={`M 20 90 A 80 80 0 ${safeValue > 50 ? 1 : 0} 1 ${100 + 80 * Math.cos((rotation * Math.PI) / 180)} ${90 + 80 * Math.sin((rotation * Math.PI) / 180)}`}
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
            {safeValue}%
          </div>
          <div className="text-sm text-slate-600">Positive Sentiment</div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <DemoTour steps={steps} isActive={isActive} onComplete={onComplete} />
      
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
        <Card className="hover-lift" data-tour="ai-sentiment">
          <CardHeader>
            <CardTitle>Live Learner Sentiment (All Cohorts)</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-6">
            <SentimentGauge value={data?.ai_sentiment?.overall} />
          </CardContent>
        </Card>
      </div>

      {/* Project Milestones */}
      <Card className="hover-lift" data-tour="project-milestones">
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
        <Card className="hover-lift" data-tour="risk-heatmap">
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
        <Card className="hover-lift" data-tour="my-tasks">
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

      {/* Interactive Analytics Tabs */}
      <Card className="hover-lift" data-tour="interactive-analytics">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp size={20} className="text-purple-600" />
            Interactive Project Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="trends" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="trends" data-testid="tab-weekly-trends">Weekly Trends</TabsTrigger>
              <TabsTrigger value="completion" data-testid="tab-completion">Module Completion</TabsTrigger>
              <TabsTrigger value="support" data-testid="tab-support">Support Metrics</TabsTrigger>
              <TabsTrigger value="content" data-testid="tab-content">Content Effectiveness</TabsTrigger>
            </TabsList>

            {/* Weekly Trends Tab */}
            <TabsContent value="trends" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4 text-center">
                    <Users className="mx-auto mb-2 text-blue-600" size={24} />
                    <p className="text-sm text-slate-600">Active This Week</p>
                    <p className="text-2xl font-bold text-slate-800">{data?.weekly_trends?.[6]?.active_learners || 765}</p>
                    <div className="text-xs text-slate-500 mt-1 flex items-center justify-center gap-1">
                      <TrendingDown size={12} />
                      <span>-8 from last week</span>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4 text-center">
                    <Target className="mx-auto mb-2 text-green-600" size={24} />
                    <p className="text-sm text-slate-600">Engagement Rate</p>
                    <p className="text-2xl font-bold text-slate-800">{data?.weekly_trends?.[6]?.engagement || 80}%</p>
                    <div className="text-xs text-slate-500 mt-1 flex items-center justify-center gap-1">
                      <TrendingUp size={12} />
                      <span>+2% from last week</span>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-purple-50 border-purple-200">
                  <CardContent className="p-4 text-center">
                    <CheckCircle2 className="mx-auto mb-2 text-purple-600" size={24} />
                    <p className="text-sm text-slate-600">Completion Rate</p>
                    <p className="text-2xl font-bold text-slate-800">{data?.weekly_trends?.[6]?.completion_rate || 85}%</p>
                    <p className="text-xs text-slate-500 mt-1">
                      <TrendingUp className="inline mr-1" size={12} />
                      +1% from last week
                    </p>
                  </CardContent>
                </Card>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data?.weekly_trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Line yAxisId="left" type="monotone" dataKey="active_learners" stroke="#3b82f6" strokeWidth={2} name="Active Learners" />
                  <Line yAxisId="right" type="monotone" dataKey="engagement" stroke="#10b981" strokeWidth={2} name="Engagement %" />
                  <Line yAxisId="right" type="monotone" dataKey="completion_rate" stroke="#8b5cf6" strokeWidth={2} name="Completion %" />
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>

            {/* Module Completion Tab */}
            <TabsContent value="completion">
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={[
                  {week: "Week 1", Module1: 20, Module2: 0, Module3: 0},
                  {week: "Week 2", Module1: 45, Module2: 0, Module3: 0},
                  {week: "Week 3", Module1: 68, Module2: 15, Module3: 0},
                  {week: "Week 4", Module1: 82, Module2: 32, Module3: 0},
                  {week: "Week 5", Module1: 90, Module2: 48, Module3: 8},
                  {week: "Week 6", Module1: 94, Module2: 62, Module3: 22},
                  {week: "Week 7", Module1: 96, Module2: 70, Module3: 35}
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Area type="monotone" dataKey="Module1" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Module 1" />
                  <Area type="monotone" dataKey="Module2" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Module 2" />
                  <Area type="monotone" dataKey="Module3" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} name="Module 3" />
                </AreaChart>
              </ResponsiveContainer>
              <div className="mt-4 flex justify-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-600 rounded"></div>
                  <span className="text-sm text-slate-700">Module 1: 96% Complete</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-600 rounded"></div>
                  <span className="text-sm text-slate-700">Module 2: 70% Complete</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-purple-600 rounded"></div>
                  <span className="text-sm text-slate-700">Module 3: 35% Complete</span>
                </div>
              </div>
            </TabsContent>

            {/* Support Metrics Tab */}
            <TabsContent value="support" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <Card className="bg-slate-50">
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-slate-600 mb-1">Total Tickets</p>
                    <p className="text-2xl font-bold text-slate-800">{data?.support_metrics?.total_tickets || 156}</p>
                  </CardContent>
                </Card>
                <Card className="bg-green-50">
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-slate-600 mb-1">Resolved</p>
                    <p className="text-2xl font-bold text-green-600">{data?.support_metrics?.resolved || 142}</p>
                  </CardContent>
                </Card>
                <Card className="bg-amber-50">
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-slate-600 mb-1">Pending</p>
                    <p className="text-2xl font-bold text-amber-600">{data?.support_metrics?.pending || 14}</p>
                  </CardContent>
                </Card>
                <Card className="bg-blue-50">
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-slate-600 mb-1">Avg Time</p>
                    <p className="text-lg font-bold text-blue-600">{data?.support_metrics?.avg_resolution_time || "4.2h"}</p>
                  </CardContent>
                </Card>
                <Card className="bg-purple-50">
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-slate-600 mb-1">Satisfaction</p>
                    <p className="text-2xl font-bold text-purple-600">{data?.support_metrics?.satisfaction_rate || 92}%</p>
                  </CardContent>
                </Card>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={24} />
                  <div>
                    <p className="font-semibold text-slate-800 mb-1">Excellent Support Performance</p>
                    <p className="text-sm text-slate-700">91% resolution rate with 92% learner satisfaction. Support team is exceeding targets.</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Content Effectiveness Tab */}
            <TabsContent value="content">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data?.content_effectiveness} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="content_type" type="category" width={150} />
                  <Tooltip />
                  <Bar dataKey="effectiveness" fill="#3b82f6" name="Effectiveness %" radius={[0, 8, 8, 0]} />
                  <Bar dataKey="engagement" fill="#10b981" name="Engagement %" radius={[0, 8, 8, 0]} opacity={0.6} />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600 mb-2">Top Performing Content</p>
                  <p className="text-lg font-bold text-slate-800">Video Lessons</p>
                  <p className="text-sm text-blue-600">88% effectiveness, 92% engagement</p>
                </div>
                <div className="bg-amber-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600 mb-2">Needs Improvement</p>
                  <p className="text-lg font-bold text-slate-800">Reading Materials</p>
                  <p className="text-sm text-amber-600">72% effectiveness, 65% engagement</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Overview;
