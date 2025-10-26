import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GraduationCap, ArrowLeft } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const LearnerRegistration = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    cohort: ""
  });
  const [loginEmail, setLoginEmail] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    
    try {
      const response = await axios.post(`${API}/learners/register`, formData);
      
      // Store session info
      localStorage.setItem("learner_session", response.data.session_token);
      localStorage.setItem("learner_id", response.data.learner_id);
      
      toast.success(response.data.message);
      navigate("/learner-dashboard");
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(error.response?.data?.detail || "Registration failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    
    try {
      const response = await axios.post(`${API}/learners/login?email=${encodeURIComponent(loginEmail)}`);
      
      // Store session info
      localStorage.setItem("learner_session", response.data.session_token);
      localStorage.setItem("learner_id", response.data.learner.id);
      
      toast.success("Welcome back!");
      navigate("/learner-dashboard");
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.response?.data?.detail || "Login failed. Please check your email.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-800 to-green-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="text-white hover:text-white hover:bg-white/20 mb-4"
          onClick={() => navigate("/")}
          data-testid="back-to-portal-selection"
        >
          <ArrowLeft className="mr-2" size={20} />
          Back to Portal Selection
        </Button>

        <Card className="glass-card shadow-2xl">
          <CardHeader className="text-center pb-6">
            <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <GraduationCap size={40} className="text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-slate-800">
              {showLogin ? "Learner Login" : "Join FSO Digital Training"}
            </CardTitle>
            <p className="text-slate-600 mt-2">
              {showLogin 
                ? "Welcome back! Enter your email to continue."
                : "Register for free digital capability training"}
            </p>
          </CardHeader>

          <CardContent className="p-8">
            {!showLogin ? (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-slate-700">Full Name *</Label>
                  <Input
                    id="name"
                    data-testid="learner-name-input"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-slate-700">Email Address *</Label>
                  <Input
                    id="email"
                    data-testid="learner-email-input"
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-slate-700">Phone Number (Optional)</Label>
                  <Input
                    id="phone"
                    data-testid="learner-phone-input"
                    type="tel"
                    placeholder="+61 XXX XXX XXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="cohort" className="text-slate-700">Select Your Cohort *</Label>
                  <Select 
                    value={formData.cohort} 
                    onValueChange={(value) => setFormData({ ...formData, cohort: value })}
                    required
                  >
                    <SelectTrigger className="mt-1" data-testid="cohort-select">
                      <SelectValue placeholder="Choose your cohort" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VET" data-testid="cohort-vet">Cohort 1 - VET (Vocational Education)</SelectItem>
                      <SelectItem value="First Nations" data-testid="cohort-first-nations">Cohort 2 - First Nations</SelectItem>
                      <SelectItem value="Other" data-testid="cohort-other">Cohort 3 - Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    data-testid="learner-register-button"
                    disabled={isProcessing}
                    className="w-full h-12 text-base font-medium bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isProcessing ? "Registering..." : "Register for Training"}
                  </Button>
                </div>

                <div className="text-center pt-4 border-t">
                  <p className="text-sm text-slate-600">
                    Already registered?{" "}
                    <button
                      type="button"
                      onClick={() => setShowLogin(true)}
                      className="text-green-600 font-medium hover:underline"
                      data-testid="switch-to-login"
                    >
                      Login here
                    </button>
                  </p>
                </div>
              </form>
            ) : (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="login-email" className="text-slate-700">Email Address</Label>
                  <Input
                    id="login-email"
                    data-testid="learner-login-email-input"
                    type="email"
                    placeholder="your.email@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    data-testid="learner-login-button"
                    disabled={isProcessing}
                    className="w-full h-12 text-base font-medium bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isProcessing ? "Logging in..." : "Login"}
                  </Button>
                </div>

                <div className="text-center pt-4 border-t">
                  <p className="text-sm text-slate-600">
                    New learner?{" "}
                    <button
                      type="button"
                      onClick={() => setShowLogin(false)}
                      className="text-green-600 font-medium hover:underline"
                      data-testid="switch-to-register"
                    >
                      Register here
                    </button>
                  </p>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-white text-sm">
          <p>Secure registration powered by FSO Digital Capability Trial</p>
        </div>
      </div>
    </div>
  );
};

export default LearnerRegistration;
