import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, ArrowRight, ArrowLeft } from "lucide-react";

export const DemoTour = ({ steps, isActive, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetPosition, setTargetPosition] = useState(null);

  useEffect(() => {
    if (isActive && steps[currentStep]) {
      const target = document.querySelector(steps[currentStep].target);
      if (target) {
        const rect = target.getBoundingClientRect();
        target.scrollIntoView({ behavior: "smooth", block: "center" });
        
        // Add highlight
        target.style.position = "relative";
        target.style.zIndex = "9999";
        target.style.boxShadow = "0 0 0 4px rgba(59, 130, 246, 0.5)";
        target.style.borderRadius = "8px";
        
        setTargetPosition({
          top: rect.bottom + window.scrollY + 10,
          left: rect.left + window.scrollX,
        });

        return () => {
          target.style.position = "";
          target.style.zIndex = "";
          target.style.boxShadow = "";
        };
      }
    }
  }, [currentStep, steps, isActive]);

  if (!isActive || !steps[currentStep]) return null;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-[9998] pointer-events-none">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50"></div>
      
      {/* Tour Card */}
      {targetPosition && (
        <Card 
          className="absolute pointer-events-auto max-w-md p-4 shadow-2xl z-[9999]"
          style={{
            top: `${targetPosition.top}px`,
            left: `${targetPosition.left}px`,
          }}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="text-sm text-slate-600 mb-1">
                Step {currentStep + 1} of {steps.length}
              </div>
              {steps[currentStep].content}
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleSkip}
              className="ml-2"
            >
              <X size={16} />
            </Button>
          </div>

          <div className="flex items-center justify-between mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSkip}
            >
              Skip Tour
            </Button>
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrev}
                >
                  <ArrowLeft size={16} className="mr-1" />
                  Back
                </Button>
              )}
              <Button
                size="sm"
                onClick={handleNext}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {currentStep < steps.length - 1 ? (
                  <>
                    Next
                    <ArrowRight size={16} className="ml-1" />
                  </>
                ) : (
                  "Finish"
                )}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export const usePMODemoTour = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("demo") === "pmo") {
      setTimeout(() => setIsActive(true), 500);
    }
  }, [location]);

  const steps = [
    {
      target: '[data-testid="page-title"]',
      content: (
        <div>
          <h4 className="font-bold mb-2 text-lg">Welcome to PMO Portal Demo!</h4>
          <p className="text-slate-700">Your central hub for project governance and real-time analytics.</p>
        </div>
      ),
    },
    {
      target: '[data-tour="project-vitals"]',
      content: (
        <div>
          <h4 className="font-bold mb-1">Project Vitals</h4>
          <p className="text-sm text-slate-700">Monitor overall status, budget, schedule, and risk at a glance.</p>
        </div>
      ),
    },
    {
      target: '[data-tour="recruitment-funnel"]',
      content: (
        <div>
          <h4 className="font-bold mb-1">Recruitment Tracker</h4>
          <p className="text-sm text-slate-700">All 3 cohorts (VET, First Nations, Other) at 100% recruitment!</p>
        </div>
      ),
    },
    {
      target: '[data-tour="ai-sentiment"]',
      content: (
        <div>
          <h4 className="font-bold mb-1">AI Sentiment Gauge</h4>
          <p className="text-sm text-slate-700">Real-time sentiment: 78% positive across all learners.</p>
        </div>
      ),
    },
    {
      target: '[data-testid="nav-cohort-1-(vet)"]',
      content: (
        <div>
          <h4 className="font-bold mb-1">Cohort Analytics</h4>
          <p className="text-sm text-slate-700">Click any cohort for detailed analytics and at-risk learners.</p>
        </div>
      ),
    },
  ];

  const handleComplete = () => {
    setIsActive(false);
    navigate(location.pathname, { replace: true });
  };

  return { isActive, steps, onComplete: handleComplete };
};

export const useLearnerDemoTour = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("demo") === "learner") {
      setTimeout(() => setIsActive(true), 500);
    }
  }, [location]);

  const steps = [
    {
      target: '[data-testid="learner-name-input"]',
      content: (
        <div>
          <h4 className="font-bold mb-2 text-lg">Welcome to Learner Portal Demo!</h4>
          <p className="text-slate-700">Quick and easy registration to start your digital skills journey.</p>
        </div>
      ),
    },
    {
      target: '[data-testid="cohort-select"]',
      content: (
        <div>
          <h4 className="font-bold mb-1">Choose Your Cohort</h4>
          <p className="text-sm text-slate-700">VET, First Nations, or Other - each with tailored support.</p>
        </div>
      ),
    },
    {
      target: '[data-testid="learner-register-button"]',
      content: (
        <div>
          <h4 className="font-bold mb-1">Instant Enrollment</h4>
          <p className="text-sm text-slate-700">Register once, get access to all 3 training modules immediately!</p>
        </div>
      ),
    },
  ];

  const handleComplete = () => {
    setIsActive(false);
    navigate(location.pathname, { replace: true });
  };

  return { isActive, steps, onComplete: handleComplete };
};
