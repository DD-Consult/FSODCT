import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const AUTH_URL = "https://auth.emergentagent.com";

const LoginPage = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ username: "", password: "", name: "" });

  useEffect(() => {
    // Check for session_id in URL fragment
    const hash = window.location.hash;
    if (hash && hash.includes("session_id=")) {
      const sessionId = hash.split("session_id=")[1].split("&")[0];
      processSession(sessionId);
    }
  }, []);

  const processSession = async (sessionId) => {
    setIsProcessing(true);
    try {
      await axios.post(`${API}/auth/session?session_id=${sessionId}`);
      
      // Clean URL
      window.history.replaceState(null, "", window.location.pathname);
      
      toast.success("Login successful!");
      setIsAuthenticated(true);
      navigate("/dashboard");
    } catch (error) {
      console.error("Session processing error:", error);
      toast.error("Authentication failed. Please try again.");
      setIsProcessing(false);
    }
  };

  const handleLogin = () => {
    const redirectUrl = `${window.location.origin}/dashboard`;
    const authUrl = `${AUTH_URL}/?redirect=${encodeURIComponent(redirectUrl)}`;
    window.location.href = authUrl;
  };

  const handleManualLogin = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const response = await axios.post(`${API}/auth/login`, {
        username: loginForm.username,
        password: loginForm.password
      });
      
      toast.success("Login successful!");
      setIsAuthenticated(true);
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.response?.data?.detail || "Login failed. Please check your credentials.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      await axios.post(`${API}/auth/register`, {
        username: registerForm.username,
        password: registerForm.password,
        name: registerForm.name
      });
      
      toast.success("Registration successful! Please login.");
      setRegisterForm({ username: "", password: "", name: "" });
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(error.response?.data?.detail || "Registration failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isProcessing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Authenticating...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 relative">
      {/* Logo - Top Left: Darevolution */}
      <div className="absolute top-6 left-6 z-10">
        <img 
          src="/darevolution-logo.png" 
          alt="Darevolution" 
          className="h-14 w-auto opacity-90 hover:opacity-100 transition-opacity"
        />
      </div>

      {/* Logo - Top Right: DD Consulting */}
      <div className="absolute top-6 right-6 z-10">
        <img 
          src="/dd-consulting-logo.png" 
          alt="DD Consulting" 
          className="h-14 w-auto opacity-90 hover:opacity-100 transition-opacity"
        />
      </div>

      <div className="w-full max-w-md">
        <div className="glass-card rounded-2xl p-8 shadow-2xl">
          {/* Logo/Branding */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              FSO Digital Capability Trial
            </h1>
            <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
              <span>Powered by</span>
              <span className="font-semibold text-blue-600">DD Consulting</span>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8 text-center">
            <p className="text-slate-600 text-base leading-relaxed">
              Welcome to the FSO Project Hub - your central governance and analytics platform.
            </p>
          </div>

          {/* Login Tabs */}
          <Tabs defaultValue="manual" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="manual" data-testid="tab-manual-login">Username/Password</TabsTrigger>
              <TabsTrigger value="oauth" data-testid="tab-oauth-login">Google OAuth</TabsTrigger>
            </TabsList>

            {/* Manual Login Tab */}
            <TabsContent value="manual" className="space-y-4">
              <form onSubmit={handleManualLogin} className="space-y-4">
                <div>
                  <Label htmlFor="login-username" className="text-slate-700">Username</Label>
                  <Input
                    id="login-username"
                    data-testid="login-username-input"
                    type="text"
                    placeholder="Enter your username"
                    value={loginForm.username}
                    onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="login-password" className="text-slate-700">Password</Label>
                  <Input
                    id="login-password"
                    data-testid="login-password-input"
                    type="password"
                    placeholder="Enter your password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    required
                    className="mt-1"
                  />
                </div>
                <Button
                  type="submit"
                  data-testid="manual-login-button"
                  disabled={isProcessing}
                  className="w-full h-12 text-base font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 hover:shadow-lg"
                >
                  {isProcessing ? "Logging in..." : "Login"}
                </Button>
              </form>

              <div className="mt-4 pt-4 border-t border-slate-200">
                <p className="text-sm text-slate-600 text-center mb-3">Don't have an account?</p>
                <form onSubmit={handleRegister} className="space-y-3">
                  <div>
                    <Label htmlFor="register-name" className="text-slate-700">Full Name</Label>
                    <Input
                      id="register-name"
                      data-testid="register-name-input"
                      type="text"
                      placeholder="Enter your full name"
                      value={registerForm.name}
                      onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="register-username" className="text-slate-700">Username</Label>
                    <Input
                      id="register-username"
                      data-testid="register-username-input"
                      type="text"
                      placeholder="Choose a username"
                      value={registerForm.username}
                      onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="register-password" className="text-slate-700">Password</Label>
                    <Input
                      id="register-password"
                      data-testid="register-password-input"
                      type="password"
                      placeholder="Choose a password"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                      required
                      className="mt-1"
                    />
                  </div>
                  <Button
                    type="submit"
                    data-testid="register-button"
                    disabled={isProcessing}
                    variant="outline"
                    className="w-full h-12 text-base font-medium border-2 border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                  >
                    {isProcessing ? "Registering..." : "Register"}
                  </Button>
                </form>
              </div>
            </TabsContent>

            {/* OAuth Tab */}
            <TabsContent value="oauth">
              <Button
                data-testid="google-login-button"
                onClick={handleLogin}
                className="w-full h-12 text-base font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 hover:shadow-lg"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Sign in with Google
              </Button>
              <p className="mt-4 text-xs text-slate-500 text-center">
                Use your Google account for secure authentication
              </p>
            </TabsContent>
          </Tabs>

          {/* Footer */}
          <div className="mt-6 text-center text-xs text-slate-500">
            Secure authentication for FSO Digital Capability Trial
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
