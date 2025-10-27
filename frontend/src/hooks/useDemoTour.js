import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Joyride, { STATUS } from "react-joyride";

export const usePMODemoTour = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [runTour, setRunTour] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("demo") === "pmo") {
      // Start tour after a brief delay to ensure page is loaded
      setTimeout(() => setRunTour(true), 500);
    }
  }, [location]);

  const steps = [
    {
      target: "body",
      content: (
        <div>
          <h3 className="text-lg font-bold mb-2">Welcome to PMO Team Portal Demo!</h3>
          <p>This guided tour will show you all the key features of the FSO Project Governance Dashboard.</p>
        </div>
      ),
      placement: "center",
      disableBeacon: true,
    },
    {
      target: '[data-testid="page-title"]',
      content: (
        <div>
          <h4 className="font-bold mb-1">Project Governance Dashboard</h4>
          <p>Your central hub for real-time project insights and analytics.</p>
        </div>
      ),
    },
    {
      target: '[data-tour="project-vitals"]',
      content: (
        <div>
          <h4 className="font-bold mb-1">Project Vitals</h4>
          <p>See overall project status, budget, schedule, and risk level at a glance. All metrics show the project is on track.</p>
        </div>
      ),
    },
    {
      target: '[data-tour="recruitment-funnel"]',
      content: (
        <div>
          <h4 className="font-bold mb-1">Learner Recruitment Tracker</h4>
          <p>Track recruitment progress across all 3 cohorts: VET, First Nations, and Other. All cohorts have reached 100% recruitment!</p>
        </div>
      ),
    },
    {
      target: '[data-tour="ai-sentiment"]',
      content: (
        <div>
          <h4 className="font-bold mb-1">Live AI Sentiment Gauge</h4>
          <p>Real-time sentiment analysis across all cohorts. Currently showing 78% positive sentiment - a healthy indicator!</p>
        </div>
      ),
    },
    {
      target: '[data-tour="project-milestones"]',
      content: (
        <div>
          <h4 className="font-bold mb-1">Project Schedule</h4>
          <p>Track progress through the 16-week project phases. Currently in Phase 3: Pilot, Measure, Iterate.</p>
        </div>
      ),
    },
    {
      target: '[data-tour="risk-heatmap"]',
      content: (
        <div>
          <h4 className="font-bold mb-1">Active Risk Heatmap</h4>
          <p>Monitor project risks with color-coded severity. Risk #17 (High Learner Churn) is flagged as critical and being actively managed.</p>
        </div>
      ),
    },
    {
      target: '[data-tour="my-tasks"]',
      content: (
        <div>
          <h4 className="font-bold mb-1">My Action Items</h4>
          <p>Your personal task list with due dates and priorities. Stay on top of critical deliverables.</p>
        </div>
      ),
    },
    {
      target: '[data-testid="nav-cohort-1-(vet)"]',
      content: (
        <div>
          <h4 className="font-bold mb-1">Cohort Analytics</h4>
          <p>Click any cohort in the sidebar to see detailed analytics including learner journey, sentiment analysis, and at-risk learners.</p>
        </div>
      ),
    },
    {
      target: '[data-testid="nav-weekly-huddle"]',
      content: (
        <div>
          <h4 className="font-bold mb-1">Weekly Iteration Huddle</h4>
          <p>Access the weekly data pack with AI-driven insights, recommendations, and logged decisions for project steering.</p>
        </div>
      ),
    },
  ];

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRunTour(false);
      // Remove demo param from URL
      navigate(location.pathname, { replace: true });
    }
  };

  return {
    runTour,
    steps,
    handleJoyrideCallback,
  };
};

export const useLearnerDemoTour = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [runTour, setRunTour] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("demo") === "learner") {
      setTimeout(() => setRunTour(true), 500);
    }
  }, [location]);

  const steps = [
    {
      target: "body",
      content: (
        <div>
          <h3 className="text-lg font-bold mb-2">Welcome to Learner Portal Demo!</h3>
          <p>This tour will guide you through the learner registration and training experience.</p>
        </div>
      ),
      placement: "center",
      disableBeacon: true,
    },
    {
      target: '[data-testid="learner-name-input"]',
      content: (
        <div>
          <h4 className="font-bold mb-1">Registration Form</h4>
          <p>Learners register with their basic information. The form is simple and quick to complete.</p>
        </div>
      ),
    },
    {
      target: '[data-testid="cohort-select"]',
      content: (
        <div>
          <h4 className="font-bold mb-1">Cohort Selection</h4>
          <p>Choose from 3 cohorts: VET (Vocational Education), First Nations, or Other. Each cohort receives tailored support.</p>
        </div>
      ),
    },
    {
      target: '[data-testid="learner-register-button"]',
      content: (
        <div>
          <h4 className="font-bold mb-1">Instant Enrollment</h4>
          <p>After registration, learners are automatically enrolled in all 3 training modules and can start learning immediately!</p>
        </div>
      ),
    },
    {
      target: '[data-testid="switch-to-login"]',
      content: (
        <div>
          <h4 className="font-bold mb-1">Returning Learners</h4>
          <p>Already registered learners can easily login using just their email address.</p>
        </div>
      ),
    },
  ];

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRunTour(false);
      navigate(location.pathname, { replace: true });
    }
  };

  return {
    runTour,
    steps,
    handleJoyrideCallback,
  };
};

export const useLearnerDashboardTour = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [runTour, setRunTour] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("demo") === "dashboard") {
      setTimeout(() => setRunTour(true), 500);
    }
  }, [location]);

  const steps = [
    {
      target: "body",
      content: (
        <div>
          <h3 className="text-lg font-bold mb-2">Welcome to Your Learning Dashboard!</h3>
          <p>Let's explore your personalized learning journey.</p>
        </div>
      ),
      placement: "center",
      disableBeacon: true,
    },
    {
      target: '[data-tour="stats-cards"]',
      content: (
        <div>
          <h4 className="font-bold mb-1">Your Progress Stats</h4>
          <p>Track your overall progress, completed modules, learning streak, and total time spent learning.</p>
        </div>
      ),
    },
    {
      target: '[data-tour="progress-bar"]',
      content: (
        <div>
          <h4 className="font-bold mb-1">Overall Progress</h4>
          <p>Visual representation of your learning journey. You're making great progress!</p>
        </div>
      ),
    },
    {
      target: '[data-testid="module-card-module1"]',
      content: (
        <div>
          <h4 className="font-bold mb-1">Your Modules</h4>
          <p>Access your training modules. Module 1 is currently in progress. Click any module to see lessons and resources.</p>
        </div>
      ),
    },
    {
      target: '[data-tour="cohort-badge"]',
      content: (
        <div>
          <h4 className="font-bold mb-1">Your Cohort</h4>
          <p>You're enrolled in a specific cohort that receives tailored support and resources.</p>
        </div>
      ),
    },
  ];

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRunTour(false);
      navigate(location.pathname, { replace: true });
    }
  };

  return {
    runTour,
    steps,
    handleJoyrideCallback,
  };
};
