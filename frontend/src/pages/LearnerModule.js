import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, BookOpen, Download, CheckCircle2, PlayCircle, FileText, Video, MessageSquare } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const LearnerModule = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const [module, setModule] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModule();
  }, [moduleId]);

  const fetchModule = async () => {
    try {
      const response = await axios.get(`${API}/learners/module/${moduleId}`);
      setModule(response.data);
    } catch (error) {
      console.error("Module error:", error);
      toast.error("Failed to load module");
    } finally {
      setLoading(false);
    }
  };

  const getLessonIcon = (type) => {
    switch (type) {
      case "video":
        return <Video size={18} className="text-blue-600" />;
      case "interactive":
        return <PlayCircle size={18} className="text-green-600" />;
      case "reading":
        return <BookOpen size={18} className="text-purple-600" />;
      case "quiz":
        return <FileText size={18} className="text-amber-600" />;
      default:
        return <BookOpen size={18} className="text-slate-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const completedLessons = module?.lessons?.filter(l => l.completed).length || 0;
  const totalLessons = module?.lessons?.length || 0;
  const progress = Math.round((completedLessons / totalLessons) * 100);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/learner-dashboard")}
            data-testid="back-to-dashboard"
            className="mb-3"
          >
            <ArrowLeft className="mr-2" size={18} />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-slate-800" data-testid="module-title">
            {module?.title}
          </h1>
          <p className="text-slate-600 mt-1">{module?.description}</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Module Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="mx-auto mb-2 text-blue-600" size={24} />
              <p className="text-sm text-slate-600">Duration</p>
              <p className="text-lg font-bold text-slate-800">{module?.duration}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <BookOpen className="mx-auto mb-2 text-green-600" size={24} />
              <p className="text-sm text-slate-600">Lessons</p>
              <p className="text-lg font-bold text-slate-800">{totalLessons}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle2 className="mx-auto mb-2 text-purple-600" size={24} />
              <p className="text-sm text-slate-600">Completed</p>
              <p className="text-lg font-bold text-slate-800">{completedLessons}/{totalLessons}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Badge className="mb-2">{module?.difficulty}</Badge>
              <p className="text-sm text-slate-600">Difficulty</p>
              <p className="text-lg font-bold text-slate-800">{progress}%</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Module Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 leading-relaxed">{module?.overview}</p>
              </CardContent>
            </Card>

            {/* Lessons */}
            <Card>
              <CardHeader>
                <CardTitle>Course Lessons</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {module?.lessons?.map((lesson, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                        lesson.completed 
                          ? "bg-green-50 border-green-200" 
                          : "bg-white border-slate-200 hover:border-green-300 hover:shadow-md"
                      }`}
                      data-testid={`lesson-${lesson.id}`}
                    >
                      <div className="flex-shrink-0">
                        {lesson.completed ? (
                          <CheckCircle2 className="text-green-600" size={24} />
                        ) : (
                          getLessonIcon(lesson.type)
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-800">
                          Lesson {lesson.id}: {lesson.title}
                        </h4>
                        <div className="flex items-center gap-3 mt-1 text-sm text-slate-600">
                          <span>{lesson.duration}</span>
                          <span>•</span>
                          <span className="capitalize">{lesson.type}</span>
                        </div>
                      </div>
                      {!lesson.completed && (
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          Start
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Resources */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Learning Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {module?.resources?.map((resource, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer"
                      data-testid={`resource-${index}`}
                    >
                      <Download size={18} className="text-blue-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-800">{resource.title}</p>
                        <p className="text-xs text-slate-600">{resource.type} - {resource.size}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Support */}
            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare size={20} className="text-blue-600" />
                  AI Support Chatbot
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-700 mb-4">
                  Need help? Our AI assistant is here to answer your questions and provide guidance.
                </p>
                <Button className="w-full bg-blue-600 hover:bg-blue-700" data-testid="ai-chatbot-button">
                  <MessageSquare size={18} className="mr-2" />
                  Open AI Chat
                </Button>
              </CardContent>
            </Card>

            {/* Progress Card */}
            <Card className="border-2 border-green-200 bg-green-50">
              <CardContent className="p-4 text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">{progress}%</div>
                <p className="text-sm text-slate-700">Module Progress</p>
                <div className="mt-3 w-full bg-white rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LearnerModule;
