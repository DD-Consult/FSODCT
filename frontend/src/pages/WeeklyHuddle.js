import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, AlertCircle, TrendingUp, Users, Target } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const WeeklyHuddle = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get(`${API}/dashboard/weekly-huddle`);
      setData(response.data);
    } catch (error) {
      console.error("Error fetching weekly huddle data:", error);
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

  const MetricCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-white rounded-xl p-5 border-2 border-slate-200 hover:shadow-lg transition-all">
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon size={20} className="text-white" />
        </div>
        <p className="text-sm text-slate-600 font-medium">{label}</p>
      </div>
      <p className="text-3xl font-bold text-slate-800">{value}</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <Badge className="bg-blue-600 text-white text-sm mb-3 px-4 py-1.5">
          {data?.date}
        </Badge>
        <h1 className="text-4xl font-bold text-slate-800 mb-2" data-testid="huddle-title">
          Weekly Iteration Huddle - Data Pack
        </h1>
        <p className="text-slate-600">Data-Driven Insights for Project Steering</p>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          icon={Users}
          label="Total Learners"
          value={data?.metrics?.total_learners}
          color="bg-blue-600"
        />
        <MetricCard
          icon={TrendingUp}
          label="Active Learners"
          value={data?.metrics?.active_learners}
          color="bg-green-600"
        />
        <MetricCard
          icon={AlertCircle}
          label="At Risk"
          value={data?.metrics?.at_risk}
          color="bg-amber-600"
        />
        <MetricCard
          icon={Target}
          label="Completion Rate"
          value={`${data?.metrics?.completion_rate}%`}
          color="bg-purple-600"
        />
      </div>

      {/* Key Insight */}
      <Card className="border-2 border-blue-200 bg-blue-50 hover-lift">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <div className="p-2 bg-blue-600 rounded-lg">
              <TrendingUp className="text-white" size={20} />
            </div>
            {data?.key_insight?.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-700 leading-relaxed text-base">
            {data?.key_insight?.description}
          </p>
        </CardContent>
      </Card>

      {/* Root Cause Analysis */}
      <Card className="border-2 border-amber-200 bg-amber-50 hover-lift">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800">
            <div className="p-2 bg-amber-600 rounded-lg">
              <AlertCircle className="text-white" size={20} />
            </div>
            {data?.root_cause?.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-700 leading-relaxed text-base">
            {data?.root_cause?.description}
          </p>
        </CardContent>
      </Card>

      {/* Recommendations & Actions */}
      <Card className="hover-lift">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-purple-600 rounded-lg">
              <Target className="text-white" size={20} />
            </div>
            Recommended Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data?.recommendations?.map((rec, index) => (
              <div
                key={index}
                className="p-4 rounded-xl border-2 border-slate-200 bg-white hover:shadow-md transition-all"
                data-testid={`recommendation-${rec.id}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-sm">
                    {rec.id}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-purple-100 text-purple-700">{rec.category}</Badge>
                      <span className="text-xs text-slate-500">•</span>
                      <span className="text-sm text-slate-600">Owner: {rec.owner}</span>
                      <span className="text-xs text-slate-500">•</span>
                      <span className="text-sm font-medium text-blue-600">Due: {rec.due}</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed">{rec.action}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Logged Decisions */}
      <Card className="hover-lift">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-green-600 rounded-lg">
              <CheckCircle2 className="text-white" size={20} />
            </div>
            Decisions (Logged in Project Hub)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data?.decisions?.map((decision, index) => {
              const statusConfig = {
                "Approved": { color: "bg-green-100 text-green-800", icon: CheckCircle2 },
                "New Action": { color: "bg-blue-100 text-blue-800", icon: Clock },
                "Under Review": { color: "bg-amber-100 text-amber-800", icon: AlertCircle },
              };
              const config = statusConfig[decision.status] || statusConfig["Approved"];
              const Icon = config.icon;

              return (
                <div
                  key={index}
                  className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-all"
                  data-testid={`decision-${decision.id}`}
                >
                  <Icon className="text-green-600 flex-shrink-0" size={20} />
                  <div className="flex-1">
                    <p className="text-slate-800 font-medium">{decision.decision}</p>
                    {decision.date && (
                      <p className="text-xs text-slate-500 mt-1">Logged: {decision.date}</p>
                    )}
                  </div>
                  <Badge className={config.color}>{decision.status}</Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Highlights */}
      {data?.weekly_highlights && (
        <Card className="hover-lift border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp size={20} className="text-blue-600" />
              Week 7 Highlights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.weekly_highlights.map((highlight, index) => {
                const impactColors = {
                  positive: "border-green-200 bg-green-50",
                  negative: "border-red-200 bg-red-50",
                };
                const categoryColors = {
                  Success: "bg-green-600",
                  Challenge: "bg-red-600",
                  Action: "bg-blue-600",
                  Milestone: "bg-purple-600",
                };
                
                return (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 ${impactColors[highlight.impact]} transition-all hover:shadow-md`}
                  >
                    <Badge className={`${categoryColors[highlight.category]} text-white mb-2`}>
                      {highlight.category}
                    </Badge>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {highlight.highlight}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Footer Note */}
      <div className="text-center py-6 border-t border-slate-200">
        <p className="text-sm text-slate-600">
          This data pack is generated weekly to support collaborative decision-making between FSO, Darevolution, and DD Consulting.
        </p>
      </div>
    </div>
  );
};

export default WeeklyHuddle;
