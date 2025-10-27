import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, FunnelChart, Funnel, LabelList } from "recharts";
import { TrendingDown, AlertCircle, BarChart3 } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CohortAnalytics = () => {
  const { cohortId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [cohortId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/dashboard/cohort/${cohortId}`);
      setData(response.data);
    } catch (error) {
      console.error("Error fetching cohort data:", error);
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

  const funnelData = data?.learner_journey?.map((stage, index) => ({
    ...stage,
    fill: `hsl(${220 - index * 10}, 70%, ${50 + index * 5}%)`
  }));

  const dropoffIndex = 4; // Module 2 index
  const dropoffCount = data?.learner_journey[dropoffIndex - 1]?.count - data?.learner_journey[dropoffIndex]?.count;
  const dropoffPercent = ((dropoffCount / data?.learner_journey[dropoffIndex - 1]?.count) * 100).toFixed(1);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-slate-800 mb-2" data-testid="cohort-title">
          Analytics: {data?.cohort_name}
        </h1>
        <p className="text-slate-600">Deep dive into learner journey and engagement metrics</p>
      </div>

      {/* Learner Journey Funnel */}
      <Card className="hover-lift">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Learner Journey & Drop-off Analysis</span>
            <Badge className="bg-blue-100 text-blue-800 text-sm">
              Conversion Rate: {((data?.learner_journey[data?.learner_journey.length - 1]?.count / data?.learner_journey[0]?.count) * 100).toFixed(1)}%
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data?.learner_journey} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" />
                  <YAxis dataKey="stage" type="category" width={180} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                    {data?.learner_journey?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`hsl(${220 - index * 10}, 70%, ${50 + index * 5}%)`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center">
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
                <TrendingDown className="text-red-600 mx-auto mb-3" size={32} />
                <p className="text-sm text-slate-600 mb-2">Drop-off at Module 2</p>
                <p className="text-4xl font-bold text-red-600 mb-1">{dropoffCount}</p>
                <p className="text-lg font-semibold text-red-600">{dropoffPercent}%</p>
                <p className="text-xs text-slate-600 mt-2">learners dropped off</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Sentiment Analysis */}
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle>AI Sentiment: Module 2 Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Word Cloud Representation */}
            <div>
              <p className="text-sm text-slate-600 mb-3 font-medium">Top Keywords from Forums/Chatbot</p>
              <div className="flex flex-wrap gap-2">
                {data?.sentiment_analysis?.word_cloud?.map((word, index) => {
                  const size = 12 + (word.value / 100) * 24;
                  return (
                    <span
                      key={index}
                      className="font-medium transition-all hover:scale-110"
                      style={{
                        fontSize: `${size}px`,
                        color: `hsl(${20 - word.value}, 70%, 50%)`,
                        opacity: 0.7 + (word.value / 200)
                      }}
                      data-testid={`keyword-${index}`}
                    >
                      {word.text}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Sentiment Timeline */}
            <div>
              <p className="text-sm text-slate-600 mb-3 font-medium">Sentiment Over Time</p>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={data?.sentiment_analysis?.sentiment_timeline}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="sentiment"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  {/* Reference line at Week 5 */}
                  <line x1="60%" y1="0" x2="60%" y2="100%" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" />
                </AreaChart>
              </ResponsiveContainer>
              <div className="mt-2 flex items-center gap-2 text-xs text-slate-600">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>Significant dip at Week 5 (Module 2 start)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Engagement */}
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 size={20} className="text-blue-600" />
              Module Engagement vs. Difficulty
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data?.content_engagement}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="module" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="engagement" name="Engagement %" radius={[8, 8, 0, 0]}>
                  {data?.content_engagement?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
                <Bar dataKey="difficulty" name="Difficulty %" fill="#94a3b8" radius={[8, 8, 0, 0]} opacity={0.4} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
              <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={18} />
              <p className="text-sm text-slate-700">
                <span className="font-semibold">Insight:</span> Module 2 shows low engagement (58%) paired with high difficulty (85%), indicating a content barrier.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* At-Risk Learners */}
      <Card className="hover-lift">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Proactive Intervention List (AI Flagged)</span>
            <Badge className="bg-red-100 text-red-800">
              {data?.at_risk_learners?.length} At-Risk Learners
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full" data-testid="at-risk-table">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Learner ID</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Last Login</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Engagement</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">AI Sentiment</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {data?.at_risk_learners?.map((learner, index) => {
                  const engagementColors = {
                    "Very Low": "text-red-600 font-semibold",
                    "Low": "text-amber-600 font-medium",
                    "Medium": "text-blue-600 font-medium",
                  };
                  const sentimentColors = {
                    "Negative": "bg-red-100 text-red-800",
                    "Neutral": "bg-slate-100 text-slate-600",
                    "N/A": "bg-slate-100 text-slate-600",
                  };
                  return (
                    <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors" data-testid={`learner-${learner.id}`}>
                      <td className="py-3 px-4 text-sm font-mono font-medium text-slate-800">{learner.id}</td>
                      <td className="py-3 px-4 text-sm text-slate-600">{learner.last_login}</td>
                      <td className={`py-3 px-4 text-sm ${engagementColors[learner.engagement]}`}>
                        {learner.engagement}
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={sentimentColors[learner.sentiment]}>
                          {learner.sentiment}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-blue-600 font-medium">{learner.action}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CohortAnalytics;
