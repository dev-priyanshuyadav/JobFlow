import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BarChart3,
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  FileText,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Moon,
  MoreHorizontal,
  Search,
  Settings,
  Sparkles,
  SunMedium,
  TrendingUp,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  BrowserRouter,
  Link,
  NavLink,
  Navigate,
  Route,
  Routes,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  createApplication,
  createResume,
  deleteAccount,
  deleteApplication,
  deleteResume,
  getSession,
  logIn,
  logOut,
  markNotificationsRead,
  signUp,
  startDemoSession,
  updatePreferences,
  updateProfile,
  updateResume,
  updateApplication,
} from "./api";
import "./App.css";

type Theme = "light" | "dark";
type Status =
  | "Saved"
  | "Applied"
  | "Screening"
  | "Interview"
  | "Offer"
  | "Rejected";
type WorkType = "Remote" | "Hybrid" | "On-site";

type Application = {
  id: string;
  company: string;
  role: string;
  location: string;
  salary: string;
  appliedDate: string;
  status: Status;
  nextAction: string;
  source: string;
  priority: "High" | "Medium" | "Low";
  workType: WorkType;
  resume: string;
  recruiter: string;
  contactEmail: string;
  url: string;
  followsUp: string;
  notes: string;
};

type NotificationItem = {
  id: number;
  title: string;
  detail: string;
  time: string;
  read: boolean;
};

type Profile = {
  name: string;
  email: string;
  role: string;
  location: string;
  portfolio: string;
  github: string;
  linkedin: string;
  workType: string;
  skills: string;
};

type Resume = {
  id: string;
  name: string;
  updated: string;
  role: string;
  version: string;
  content?: string;
};

type Preferences = {
  theme: Theme;
  interviewReminders: boolean;
  followUpReminders: boolean;
  weeklySummary: boolean;
};

const statusOrder: Status[] = [
  "Saved",
  "Applied",
  "Screening",
  "Interview",
  "Offer",
  "Rejected",
];
const initialApplications: Application[] = [
  {
    id: "app-1",
    company: "Google",
    role: "Frontend Developer",
    location: "Remote",
    salary: "$140k - $180k",
    appliedDate: "2026-09-08",
    status: "Interview",
    nextAction: "Interview with team lead",
    source: "LinkedIn",
    priority: "High",
    workType: "Remote",
    resume: "Frontend Developer — ATS",
    recruiter: "Priya Shah",
    contactEmail: "priya@google.com",
    url: "https://google.com/jobs/frontend",
    followsUp: "2026-09-29",
    notes: "Strong product match with design systems and shipping experience.",
  },
  {
    id: "app-2",
    company: "Microsoft",
    role: "Product Designer",
    location: "Seattle, WA",
    salary: "$120k - $150k",
    appliedDate: "2026-09-12",
    status: "Screening",
    nextAction: "Portfolio review follow-up",
    source: "Company site",
    priority: "High",
    workType: "Hybrid",
    resume: "Product Designer — Portfolio",
    recruiter: "Daniel Ward",
    contactEmail: "danielw@microsoft.com",
    url: "https://microsoft.com/jobs/product-designer",
    followsUp: "2026-09-27",
    notes: "Need to share a short portfolio story deck.",
  },
  {
    id: "app-3",
    company: "Spotify",
    role: "UI Developer",
    location: "New York, NY",
    salary: "$110k - $135k",
    appliedDate: "2026-09-15",
    status: "Applied",
    nextAction: "Check recruiter email response",
    source: "Referral",
    priority: "Medium",
    workType: "Hybrid",
    resume: "UI Developer — Creative",
    recruiter: "Emma Cole",
    contactEmail: "emma@spotify.com",
    url: "https://spotify.com/jobs/ui-developer",
    followsUp: "2026-09-26",
    notes: "Great recent work on music discovery UX patterns.",
  },
  {
    id: "app-4",
    company: "Adobe",
    role: "React Developer",
    location: "San Jose, CA",
    salary: "$130k - $160k",
    appliedDate: "2026-09-07",
    status: "Offer",
    nextAction: "Negotiate final package",
    source: "Career fair",
    priority: "High",
    workType: "On-site",
    resume: "Frontend Developer — ATS",
    recruiter: "Nina Ross",
    contactEmail: "nina@adobe.com",
    url: "https://adobe.com/jobs/react",
    followsUp: "2026-09-30",
    notes: "Offer stage; prepare final questions around growth track.",
  },
  {
    id: "app-5",
    company: "Amazon",
    role: "Software Engineer",
    location: "Bengaluru, India",
    salary: "₹24L - ₹32L",
    appliedDate: "2026-09-05",
    status: "Saved",
    nextAction: "Tailor resume for role",
    source: "LinkedIn",
    priority: "Low",
    workType: "On-site",
    resume: "Frontend Developer — ATS",
    recruiter: "Alyssa Smith",
    contactEmail: "alyssa@amazon.com",
    url: "https://amazon.com/jobs/software-engineer",
    followsUp: "2026-09-28",
    notes: "Keep in pipeline as a strong opportunity for scale systems.",
  },
  {
    id: "app-6",
    company: "Razorpay",
    role: "Frontend Engineer",
    location: "Remote",
    salary: "₹18L - ₹28L",
    appliedDate: "2026-09-01",
    status: "Rejected",
    nextAction: "Archive and learn from feedback",
    source: "AngelList",
    priority: "Medium",
    workType: "Remote",
    resume: "Frontend Developer — ATS",
    recruiter: "Rohit Jain",
    contactEmail: "rohit@razorpay.com",
    url: "https://razorpay.com/jobs/frontend-engineer",
    followsUp: "2026-09-25",
    notes:
      "Good experience, but role leaned more on full-stack than design systems.",
  },
];

const notificationSeed: NotificationItem[] = [
  {
    id: 1,
    title: "Interview tomorrow at 10:00 AM",
    detail: "Google • Frontend Developer",
    time: "2 hours ago",
    read: false,
  },
  {
    id: 2,
    title: "Follow up with Microsoft",
    detail: "Portfolio review reminder",
    time: "Today",
    read: false,
  },
  {
    id: 3,
    title: "Application deadline approaching",
    detail: "Adobe portfolio submission due in 2 days",
    time: "3 hours ago",
    read: true,
  },
  {
    id: 4,
    title: "Your weekly job-search summary is ready",
    detail: "3 interviews and 14% improvement",
    time: "Yesterday",
    read: true,
  },
];

const lineData = [
  { month: "Jan", apps: 14 },
  { month: "Feb", apps: 18 },
  { month: "Mar", apps: 20 },
  { month: "Apr", apps: 24 },
  { month: "May", apps: 27 },
  { month: "Jun", apps: 29 },
  { month: "Jul", apps: 32 },
  { month: "Aug", apps: 36 },
  { month: "Sep", apps: 42 },
];

const pieData = [
  { name: "Applied", value: 34 },
  { name: "Interview", value: 24 },
  { name: "Offer", value: 15 },
  { name: "Rejected", value: 27 },
];

const sourceData = [
  { name: "LinkedIn", value: 22 },
  { name: "Company site", value: 18 },
  { name: "Referral", value: 14 },
  { name: "Career fair", value: 8 },
  { name: "Other", value: 10 },
];

const activityData = [
  { day: "Mon", applied: 5, interview: 2 },
  { day: "Tue", applied: 8, interview: 3 },
  { day: "Wed", applied: 6, interview: 2 },
  { day: "Thu", applied: 10, interview: 4 },
  { day: "Fri", applied: 7, interview: 3 },
  { day: "Sat", applied: 4, interview: 1 },
  { day: "Sun", applied: 2, interview: 1 },
];

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/applications", label: "Applications", icon: BriefcaseBusiness },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/resumes", label: "Resumes", icon: FileText },
  { to: "/profile", label: "Profile", icon: UserRound },
  { to: "/settings", label: "Settings", icon: Settings },
];

function downloadApplicationsCsv(applications: Application[]) {
  const headers = [
    "Company",
    "Role",
    "Location",
    "Status",
    "Applied date",
    "Next action",
  ];
  const rows = applications.map((application) => [
    application.company,
    application.role,
    application.location,
    application.status,
    application.appliedDate,
    application.nextAction,
  ]);
  const csv = [headers, ...rows]
    .map((row) =>
      row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","),
    )
    .join("\n");
  const url = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = "jobflow-applications.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function App() {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem("jobflow-theme");
    return (saved === "dark" ? "dark" : "light") as Theme;
  });

  const [applications, setApplications] =
    useState<Application[]>(initialApplications);

  const [notifications, setNotifications] =
    useState<NotificationItem[]>(notificationSeed);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [preferences, setPreferences] = useState<Preferences>({
    theme,
    interviewReminders: true,
    followUpReminders: true,
    weeklySummary: true,
  });

  const [demoAuthed, setDemoAuthedState] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("jobflow-theme", theme);
  }, [theme]);

  useEffect(() => {
    getSession()
      .then((session) => {
        setDemoAuthedState(true);
        setApplications(session.applications as Application[]);
        setNotifications(session.notifications as NotificationItem[]);
        setProfile((session.user.profile as Profile | undefined) || null);
        setResumes(session.resumes as Resume[]);
        setPreferences(session.preferences as Preferences);
      })
      .catch(() => setDemoAuthedState(false));
  }, []);

  const setDemoAuthed = (value: boolean) => {
    if (!value) {
      void logOut();
      setDemoAuthedState(false);
      setApplications([]);
      setNotifications([]);
      setProfile(null);
      setResumes([]);
      return;
    }

    setDemoAuthedState(true);
    const applySession = (session: {
      user: { profile?: Record<string, string> };
      applications: unknown[];
      notifications: unknown[];
      resumes: unknown[];
      preferences: Record<string, boolean | string>;
    }) => {
      setApplications(session.applications as Application[]);
      setNotifications(session.notifications as NotificationItem[]);
      setProfile((session.user.profile as Profile | undefined) || null);
      setResumes(session.resumes as Resume[]);
      setPreferences(session.preferences as Preferences);
    };
    void getSession()
      .then(applySession)
      .catch(() => startDemoSession().then(applySession));
  };

  const persistApplications = (nextApplications: Application[]) => {
    const previousApplications = applications;
    setApplications(nextApplications);
    const addedApplication = nextApplications.find(
      (application) =>
        !previousApplications.some(
          (previous) => previous.id === application.id,
        ),
    );
    if (addedApplication) {
      void createApplication(addedApplication);
      return;
    }
    const changedApplication = nextApplications.find((application) => {
      const previous = previousApplications.find(
        (item) => item.id === application.id,
      );
      return (
        previous && JSON.stringify(previous) !== JSON.stringify(application)
      );
    });
    if (changedApplication) {
      void updateApplication(changedApplication.id, changedApplication);
    }
  };

  const persistNotifications = (nextNotifications: NotificationItem[]) => {
    setNotifications(nextNotifications);
    if (nextNotifications.every((notification) => notification.read)) {
      void markNotificationsRead();
    }
  };

  const persistProfile = (nextProfile: Profile) => {
    setProfile(nextProfile);
    void updateProfile(nextProfile);
  };

  const persistResumes = (nextResumes: Resume[]) => {
    const previousResumes = resumes;
    setResumes(nextResumes);
    const addedResume = nextResumes.find(
      (resume) => !previousResumes.some((item) => item.id === resume.id),
    );
    if (addedResume) {
      void createResume(addedResume);
      return;
    }
    const changedResume = nextResumes.find((resume) => {
      const previous = previousResumes.find((item) => item.id === resume.id);
      return previous && JSON.stringify(previous) !== JSON.stringify(resume);
    });
    if (changedResume) void updateResume(changedResume.id, changedResume);
    const removedResume = previousResumes.find(
      (resume) => !nextResumes.some((item) => item.id === resume.id),
    );
    if (removedResume) void deleteResume(removedResume.id);
  };

  const persistPreferences = (nextPreferences: Preferences) => {
    setPreferences(nextPreferences);
    void updatePreferences(nextPreferences);
  };

  return (
    <BrowserRouter>
      <AppShell
        theme={theme}
        setTheme={setTheme}
        demoAuthed={demoAuthed}
        setDemoAuthed={setDemoAuthed}
        applications={applications}
        notifications={notifications}
        setNotifications={persistNotifications}
        setApplications={persistApplications}
        profile={profile}
        setProfile={persistProfile}
        resumes={resumes}
        setResumes={persistResumes}
        preferences={preferences}
        setPreferences={persistPreferences}
        deleteAccount={() => {
          void deleteAccount().then(() => setDemoAuthed(false));
        }}
      />
    </BrowserRouter>
  );
}

function AppShell({
  theme,
  setTheme,
  demoAuthed,
  setDemoAuthed,
  applications,
  notifications,
  setNotifications,
  setApplications,
  profile,
  setProfile,
  resumes,
  setResumes,
  preferences,
  setPreferences,
  deleteAccount,
}: {
  theme: Theme;
  setTheme: (value: Theme) => void;
  demoAuthed: boolean;
  setDemoAuthed: (value: boolean) => void;
  applications: Application[];
  notifications: NotificationItem[];
  setNotifications: (value: NotificationItem[]) => void;
  setApplications: (value: Application[]) => void;
  profile: Profile | null;
  setProfile: (value: Profile) => void;
  resumes: Resume[];
  setResumes: (value: Resume[]) => void;
  preferences: Preferences;
  setPreferences: (value: Preferences) => void;
  deleteAccount: () => void;
}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
      if (event.key === "Escape") {
        setSearchOpen(false);
        setShowNotifications(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <Routes>
      <Route path="/" element={<LandingPage setDemoAuthed={setDemoAuthed} />} />
      <Route
        path="/login"
        element={<LoginPage setDemoAuthed={setDemoAuthed} />}
      />
      <Route
        path="/signup"
        element={<SignupPage setDemoAuthed={setDemoAuthed} />}
      />
      <Route
        path="/onboarding"
        element={<OnboardingPage setDemoAuthed={setDemoAuthed} />}
      />
      <Route
        path="/*"
        element={
          <ProtectedRoute demoAuthed={demoAuthed}>
            <div className="app-shell">
              <aside
                className={`sidebar ${mobileNavOpen ? "mobile-open" : ""}`}
              >
                <div className="sidebar-header">
                  <div className="brand">
                    <div className="brand-mark">
                      <Sparkles size={16} />
                    </div>
                    JobFlow
                  </div>
                  <button
                    className="icon-button"
                    onClick={() => setMobileNavOpen(false)}
                    aria-label="Close navigation"
                  >
                    <X size={16} />
                  </button>
                </div>

                <nav className="nav-list" aria-label="Main navigation">
                  {navItems.map(({ to, label, icon: Icon }) => (
                    <NavLink
                      key={to}
                      to={to}
                      className={({ isActive }) =>
                        `nav-item ${isActive ? "active" : ""}`
                      }
                      onClick={() => setMobileNavOpen(false)}
                    >
                      <Icon size={18} />
                      {label}
                    </NavLink>
                  ))}
                </nav>

                <div className="sidebar-footer">
                  <button
                    className="button-secondary"
                    onClick={() => setDemoAuthed(false)}
                    style={{ width: "100%" }}
                  >
                    <LogOut
                      size={16}
                      style={{ marginRight: 8, verticalAlign: "middle" }}
                    />
                    Sign out
                  </button>
                </div>
              </aside>

              <main className="app-main">
                <header className="topbar">
                  <div className="topbar-left">
                    <button
                      className="icon-button"
                      onClick={() => setMobileNavOpen(!mobileNavOpen)}
                      aria-label="Toggle navigation"
                    >
                      <Menu size={18} />
                    </button>
                    <button
                      className="search-trigger"
                      onClick={() => setSearchOpen(true)}
                      aria-label="Open search"
                    >
                      <Search size={16} />
                      <span>Search apps, companies, notes...</span>
                      <span
                        className="badge"
                        style={{
                          background: "var(--primary-soft)",
                          color: "var(--primary)",
                        }}
                      >
                        ⌘K
                      </span>
                    </button>
                  </div>

                  <div className="topbar-right">
                    <button
                      className="icon-button"
                      aria-label="Toggle theme"
                      onClick={() =>
                        setTheme(theme === "light" ? "dark" : "light")
                      }
                    >
                      {theme === "light" ? (
                        <Moon size={18} />
                      ) : (
                        <SunMedium size={18} />
                      )}
                    </button>
                    <button
                      className="icon-button"
                      aria-label="Open notifications"
                      onClick={() => setShowNotifications((value) => !value)}
                    >
                      <Bell size={18} />
                    </button>
                    <div className="avatar">AD</div>
                  </div>
                </header>

                {showNotifications && (
                  <div
                    className="notification-panel"
                    role="dialog"
                    aria-label="Notifications center"
                  >
                    <div className="modal-header">
                      <strong>Notifications</strong>
                      <button
                        className="icon-button"
                        onClick={() => setShowNotifications(false)}
                        aria-label="Close notifications"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <div className="notification-list">
                      {notifications.map((note) => (
                        <div key={note.id} className="notification-item">
                          <div>
                            <div style={{ fontWeight: 700 }}>{note.title}</div>
                            <div className="small-muted">{note.detail}</div>
                          </div>
                          <div>
                            <span className="small-muted">{note.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="modal-footer">
                      <button
                        className="button-ghost"
                        onClick={() =>
                          setNotifications(
                            notifications.map((n) => ({ ...n, read: true })),
                          )
                        }
                      >
                        Mark all as read
                      </button>
                    </div>
                  </div>
                )}

                <div className="content">
                  <Routes>
                    <Route
                      path="/dashboard"
                      element={<DashboardPage applications={applications} />}
                    />
                    <Route
                      path="/applications"
                      element={
                        <ApplicationsPage
                          applications={applications}
                          setApplications={setApplications}
                        />
                      }
                    />
                    <Route
                      path="/applications/:id"
                      element={
                        <ApplicationDetailsPage
                          applications={applications}
                          setApplications={setApplications}
                        />
                      }
                    />
                    <Route
                      path="/calendar"
                      element={<CalendarPage applications={applications} />}
                    />
                    <Route path="/analytics" element={<AnalyticsPage />} />
                    <Route
                      path="/resumes"
                      element={
                        <ResumesPage
                          resumes={resumes}
                          setResumes={setResumes}
                        />
                      }
                    />
                    <Route
                      path="/profile"
                      element={
                        <ProfilePage
                          profile={profile}
                          setProfile={setProfile}
                        />
                      }
                    />
                    <Route
                      path="/settings"
                      element={
                        <SettingsPage
                          setTheme={setTheme}
                          applications={applications}
                          preferences={preferences}
                          setPreferences={setPreferences}
                          deleteAccount={deleteAccount}
                        />
                      }
                    />
                    <Route
                      path="*"
                      element={<Navigate to="/dashboard" replace />}
                    />
                  </Routes>
                </div>
              </main>
            </div>
          </ProtectedRoute>
        }
      />
      {searchOpen && (
        <SearchOverlay
          applications={applications}
          onClose={() => setSearchOpen(false)}
        />
      )}
    </Routes>
  );
}

function ProtectedRoute({
  demoAuthed,
  children,
}: {
  demoAuthed: boolean;
  children: React.ReactNode;
}) {
  if (!demoAuthed) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function LandingPage({
  setDemoAuthed,
}: {
  setDemoAuthed: (value: boolean) => void;
}) {
  const navigate = useNavigate();

  const handleDemo = () => {
    setDemoAuthed(true);
    navigate("/dashboard");
  };

  return (
    <div className="hero-page">
      <header className="landing-header">
        <div className="brand">
          <div className="brand-mark">
            <Sparkles size={16} />
          </div>
          JobFlow
        </div>
        <div className="header-actions">
          <button className="button-ghost" onClick={() => navigate("/login")}>
            Log in
          </button>
          <button
            className="button-primary"
            onClick={() => navigate("/signup")}
          >
            Get Started
          </button>
        </div>
      </header>

      <div className="landing-shell">
        <section className="hero-section">
          <div className="hero-copy">
            <span className="eyebrow">
              <TrendingUp size={14} /> Built for focused job search
            </span>
            <h1 className="display-title">Your job search, organized.</h1>
            <p className="section-subtitle">
              JobFlow helps you track every application, interview, follow-up,
              and opportunity in one calm dashboard so you can focus on landing
              your next role.
            </p>
            <div className="cta-row">
              <button
                className="button-primary"
                onClick={() => navigate("/signup")}
              >
                Get Started
              </button>
              <button className="button-secondary" onClick={handleDemo}>
                View Demo
              </button>
            </div>
            <div className="hero-stats">
              <div className="hero-stat">
                <strong>1.8x</strong>
                <span>More organized</span>
              </div>
              <div className="hero-stat">
                <strong>92%</strong>
                <span>Interview readiness</span>
              </div>
              <div className="hero-stat">
                <strong>7-day</strong>
                <span>Average follow-up</span>
              </div>
            </div>
          </div>

          <div
            className="dashboard-preview"
            aria-label="JobFlow product preview"
          >
            <div className="preview-header">
              <div className="dot-row">
                <span className="dot red" />
                <span className="dot yellow" />
                <span className="dot green" />
              </div>
              <span className="small-muted">Dashboard preview</span>
            </div>
            <div className="preview-content">
              <div className="preview-grid">
                <div className="preview-card">
                  <div className="kpi-row">
                    <div className="kpi-box">
                      <span className="small-muted">Apps</span>
                      <strong>184</strong>
                    </div>
                    <div className="kpi-box">
                      <span className="small-muted">Interviews</span>
                      <strong>16</strong>
                    </div>
                    <div className="kpi-box">
                      <span className="small-muted">Offers</span>
                      <strong>3</strong>
                    </div>
                    <div className="kpi-box">
                      <span className="small-muted">Response</span>
                      <strong>28%</strong>
                    </div>
                  </div>
                  <div className="bar-graph">
                    <div className="bar-graph-bars">
                      {[32, 48, 44, 65, 72, 60, 78, 88, 92].map(
                        (height, index) => (
                          <div
                            key={index}
                            className="bar"
                            style={{ height: `${height}%` }}
                          />
                        ),
                      )}
                    </div>
                  </div>
                </div>
                <div className="side-stack">
                  <div className="preview-card">
                    <div className="small-muted">Upcoming</div>
                    <div className="task-list">
                      <div className="task-item">
                        <div>
                          <strong>Google</strong>
                          <div className="small-muted">Frontend Developer</div>
                        </div>
                        <span className="badge interview">Interview</span>
                      </div>
                      <div className="task-item">
                        <div>
                          <strong>Microsoft</strong>
                          <div className="small-muted">Portfolio review</div>
                        </div>
                        <span className="badge screening">Follow-up</span>
                      </div>
                    </div>
                  </div>
                  <div className="preview-card">
                    <div className="small-muted">Funnel</div>
                    <div className="task-list">
                      <div className="task-item">
                        <span>Saved</span>
                        <strong>28</strong>
                      </div>
                      <div className="task-item">
                        <span>Applied</span>
                        <strong>56</strong>
                      </div>
                      <div className="task-item">
                        <span>Interview</span>
                        <strong>13</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="section-header">
            <h2>Everything you need to stay in control</h2>
          </div>
          <div className="feature-grid">
            {[
              [
                "Application tracking",
                "Track every role, status, and hiring signal with a simple, consistent workflow.",
              ],
              [
                "Interview management",
                "Keep all upcoming calls, blockers, and notes in one central calendar.",
              ],
              [
                "Job-search analytics",
                "See response rate, activity, and momentum with clear weekly signals.",
              ],
              [
                "Smart reminders",
                "Get timely prompts to follow up before opportunities slip away.",
              ],
              [
                "Resume management",
                "Organize ATS-friendly and portfolio versions by role and stage.",
              ],
              [
                "Search & filtering",
                "Quickly find companies, contacts, and notes across your full pipeline.",
              ],
            ].map(([title, description]) => (
              <div key={title} className="feature-card">
                <div className="icon-wrap">
                  <BriefcaseBusiness size={18} />
                </div>
                <h3>{title}</h3>
                <p
                  className="section-subtitle"
                  style={{ marginTop: 10, fontSize: "0.96rem" }}
                >
                  {description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="section-header">
            <h2>How it works</h2>
          </div>
          <div className="steps-grid">
            {[
              [
                "1. Add your applications",
                "Capture job details, links, contacts, and notes in seconds.",
              ],
              [
                "2. Track your progress",
                "Move through stages, see what needs action, and keep momentum high.",
              ],
              [
                "3. Land your next opportunity",
                "Stay focused on interviews, follow-ups, and the roles that matter most.",
              ],
            ].map(([title, desc]) => (
              <div key={title} className="step-card">
                <div className="eyebrow" style={{ width: "fit-content" }}>
                  {title.split(".")[0]}
                </div>
                <h3 style={{ marginTop: 18 }}>
                  {title.replace(/^\d+\.\s*/, "")}
                </h3>
                <p
                  className="section-subtitle"
                  style={{ marginTop: 12, fontSize: "0.96rem" }}
                >
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="section-header">
            <h2>Teams and job seekers love the clarity</h2>
          </div>
          <div className="testimonial-grid">
            {[
              [
                "“JobFlow finally made my search feel manageable. I stopped missing follow-ups and tracked every interview in one place.”",
                "Aisha R.",
                "Frontend Developer",
              ],
              [
                "“The dashboard gave me clarity when I was applying to 30+ roles. The analytics feature helped me double down on the right channels.”",
                "Mason C.",
                "Product Designer",
              ],
              [
                "“The calendar and reminders are the reason I kept my momentum. It felt like having a hiring assistant without the noise.”",
                "Lina P.",
                "UX Engineer",
              ],
            ].map(([quote, name, role]) => (
              <div key={name} className="testimonial-card">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 14,
                  }}
                >
                  <div
                    className="avatar"
                    style={{ width: 30, height: 30, fontSize: 12 }}
                  >
                    {name.split(" ")[0][0]}
                  </div>
                  <div>
                    <strong>{name}</strong>
                    <div className="small-muted">{role}</div>
                  </div>
                </div>
                <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
                  {quote}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="section-header">
            <h2>Simple plans for every stage</h2>
          </div>
          <div className="pricing-grid">
            <div className="pricing-card">
              <h3>Free</h3>
              <div className="price">
                <strong>$0</strong>
                <span>/month</span>
              </div>
              <ul
                style={{
                  paddingLeft: 18,
                  color: "var(--muted)",
                  display: "grid",
                  gap: 8,
                }}
              >
                <li>Up to 20 active applications</li>
                <li>Basic analytics</li>
                <li>Single resume library</li>
              </ul>
              <button
                className="button-secondary"
                style={{ marginTop: 18, width: "100%" }}
              >
                Start free
              </button>
            </div>
            <div className="pricing-card featured">
              <span className="eyebrow" style={{ width: "fit-content" }}>
                Most popular
              </span>
              <h3>Pro</h3>
              <div className="price">
                <strong>$12</strong>
                <span>/month</span>
              </div>
              <ul
                style={{
                  paddingLeft: 18,
                  color: "var(--muted)",
                  display: "grid",
                  gap: 8,
                }}
              >
                <li>Unlimited applications</li>
                <li>Advanced tracking and reminders</li>
                <li>Resume versioning and reports</li>
              </ul>
              <button
                className="button-primary"
                style={{ marginTop: 18, width: "100%" }}
              >
                Upgrade to Pro
              </button>
            </div>
          </div>
        </section>

        <div className="final-cta">
          <div>
            <strong
              style={{
                display: "block",
                fontSize: "1.8rem",
                letterSpacing: "-0.05em",
              }}
            >
              Take control of your job search.
            </strong>
            <div
              className="small-muted"
              style={{ color: "rgba(255,255,255,0.72)" }}
            >
              A calmer workflow for applications, interviews, and follow-ups.
            </div>
          </div>
          <button
            className="button-primary"
            onClick={() => navigate("/signup")}
          >
            Build my dashboard
          </button>
        </div>

        <footer className="footer">
          <div className="footer-grid">
            <div className="footer-column">
              <div className="brand">
                <div className="brand-mark">
                  <Sparkles size={16} />
                </div>
                JobFlow
              </div>
              <p className="section-subtitle" style={{ marginTop: 12 }}>
                Purpose-built for ambitious people moving toward their next
                role.
              </p>
            </div>
            <div className="footer-column">
              <h4>Product</h4>
              <div
                className="small-muted"
                style={{ display: "grid", gap: 10, marginTop: 12 }}
              >
                <span>Dashboard</span>
                <span>Applications</span>
                <span>Analytics</span>
              </div>
            </div>
            <div className="footer-column">
              <h4>Company</h4>
              <div
                className="small-muted"
                style={{ display: "grid", gap: 10, marginTop: 12 }}
              >
                <span>About</span>
                <span>Resources</span>
                <span>Contact</span>
              </div>
            </div>
            <div className="footer-column">
              <h4>Legal</h4>
              <div
                className="small-muted"
                style={{ display: "grid", gap: 10, marginTop: 12 }}
              >
                <span>Privacy</span>
                <span>Terms</span>
                <span>Social</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

function LoginPage({
  setDemoAuthed,
}: {
  setDemoAuthed: (value: boolean) => void;
}) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("demo@jobflow.app");
  const [password, setPassword] = useState("demo1234");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      await logIn(email, password);
      setDemoAuthed(true);
      navigate("/dashboard");
    } catch (loginError) {
      setError(
        loginError instanceof Error ? loginError.message : "Unable to log in",
      );
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-header">
          <div className="brand">
            <div className="brand-mark">
              <Sparkles size={16} />
            </div>
            JobFlow
          </div>
          <h2 style={{ marginTop: 18 }}>Welcome back</h2>
          <p className="small-muted" style={{ marginTop: 6 }}>
            Log in to continue your job search.
          </p>
        </div>

        <div className="form-stack">
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          <div className="checkbox-row">
            <label>
              <input type="checkbox" /> Remember me
            </label>
            <button className="link-button" type="button">
              Forgot password?
            </button>
          </div>
          <button className="button-primary" onClick={() => void handleLogin()}>
            Log in
          </button>
          {error ? <div className="form-error">{error}</div> : null}
          <button
            className="button-secondary"
            type="button"
            onClick={() => {
              setDemoAuthed(true);
              navigate("/dashboard");
            }}
          >
            <Mail
              size={16}
              style={{ marginRight: 8, verticalAlign: "middle" }}
            />
            Continue with Google
          </button>
          <button
            className="button-ghost"
            type="button"
            onClick={() => {
              setDemoAuthed(true);
              navigate("/dashboard");
            }}
          >
            Continue with Demo
          </button>
        </div>

        <div className="auth-footer">
          <span>Need an account?</span>
          <button
            className="link-button"
            type="button"
            onClick={() => navigate("/signup")}
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
}

function SignupPage({
  setDemoAuthed,
}: {
  setDemoAuthed: (value: boolean) => void;
}) {
  const navigate = useNavigate();
  const [name, setName] = useState("Aarav Desai");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const meter = Math.min(100, (password.length / 12) * 100);

  const handleSignup = async () => {
    try {
      await signUp(name, email, password);
      setDemoAuthed(true);
      navigate("/onboarding");
    } catch (signupError) {
      setError(
        signupError instanceof Error
          ? signupError.message
          : "Unable to create account",
      );
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-header">
          <div className="brand">
            <div className="brand-mark">
              <Sparkles size={16} />
            </div>
            JobFlow
          </div>
          <h2 style={{ marginTop: 18 }}>Create your account</h2>
          <p className="small-muted" style={{ marginTop: 6 }}>
            Manage your applications with clarity.
          </p>
        </div>

        <div className="form-stack">
          <div className="field">
            <label>Name</label>
            <input
              type="text"
              placeholder="Aarav Desai"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <div className="password-meter">
              <span style={{ width: `${meter}%` }} />
            </div>
          </div>
          <button
            className="button-primary"
            onClick={() => void handleSignup()}
          >
            Create account
          </button>
          {error ? <div className="form-error">{error}</div> : null}
        </div>

        <div className="auth-footer">
          <span>Already have an account?</span>
          <button
            className="link-button"
            type="button"
            onClick={() => navigate("/login")}
          >
            Log in
          </button>
        </div>
      </div>
    </div>
  );
}

function OnboardingPage({
  setDemoAuthed,
}: {
  setDemoAuthed: (value: boolean) => void;
}) {
  const navigate = useNavigate();

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-header">
          <div className="brand">
            <div className="brand-mark">
              <Sparkles size={16} />
            </div>
            JobFlow
          </div>
          <h2 style={{ marginTop: 18 }}>Set up your job search</h2>
          <p className="small-muted" style={{ marginTop: 6 }}>
            Tell us a little about your goals.
          </p>
        </div>

        <div className="form-stack">
          <div className="field">
            <label>Name</label>
            <input type="text" value="Aarav Desai" readOnly />
          </div>
          <div className="field">
            <label>Target role</label>
            <input type="text" value="Frontend Developer" />
          </div>
          <div className="field-row">
            <div className="field">
              <label>Preferred location</label>
              <input type="text" value="Bengaluru" />
            </div>
            <div className="field">
              <label>Experience level</label>
              <select defaultValue="2-4 years">
                <option>1 year</option>
                <option>2-4 years</option>
                <option>5+ years</option>
              </select>
            </div>
          </div>
          <div className="field">
            <label>Job-search goal</label>
            <textarea
              rows={4}
              defaultValue="I want a high-growth product company with strong UI engineering and mentorship."
            />
          </div>
          <button
            className="button-primary"
            onClick={() => {
              setDemoAuthed(true);
              navigate("/dashboard");
            }}
          >
            Build my dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

function DashboardPage({ applications }: { applications: Application[] }) {
  const navigate = useNavigate();
  const total = applications.length;
  const interviews = applications.filter(
    (app) => app.status === "Interview",
  ).length;
  const offers = applications.filter((app) => app.status === "Offer").length;
  const responseRate = Math.round(
    (applications.filter((app) => app.status !== "Saved").length / total) * 100,
  );

  const stats = [
    {
      label: "Total Applications",
      value: total,
      change: "+18%",
      trend: "up",
      icon: BriefcaseBusiness,
    },
    {
      label: "Interviews",
      value: interviews,
      change: "+6%",
      trend: "up",
      icon: CalendarDays,
    },
    {
      label: "Offers",
      value: offers,
      change: "+2%",
      trend: "up",
      icon: CheckCircle2,
    },
    {
      label: "Response Rate",
      value: `${responseRate}%`,
      change: "-3%",
      trend: "down",
      icon: TrendingUp,
    },
  ];

  const upcoming = [
    {
      company: "Google",
      role: "Frontend Developer",
      date: "Tue, Sep 29",
      time: "10:00 AM",
      type: "Panel interview",
      status: "Interview",
    },
    {
      company: "Microsoft",
      role: "Product Designer",
      date: "Wed, Sep 30",
      time: "2:30 PM",
      type: "Portfolio review",
      status: "Screening",
    },
    {
      company: "Adobe",
      role: "React Developer",
      date: "Thu, Oct 02",
      time: "11:00 AM",
      type: "Hiring manager",
      status: "Offer",
    },
  ];

  const recentApplications = applications.slice(0, 4);

  return (
    <div className="page-shell">
      <div className="page-header">
        <div className="page-title">
          <h1>Good morning, Aarav</h1>
          <div className="small-muted">
            Here's how your job search is progressing.
          </div>
        </div>
        <div className="page-actions">
          <button
            className="button-secondary"
            onClick={() => downloadApplicationsCsv(applications)}
          >
            Export
          </button>
          <button
            className="button-primary"
            onClick={() => navigate("/applications?add=1")}
          >
            Add application
          </button>
        </div>
      </div>

      <section className="grid-4">
        {stats.map(({ label, value, change, trend, icon: Icon }) => (
          <div key={label} className="metric-card">
            <div className="metric-top">
              <span className="small-muted">{label}</span>
              <div
                className="icon-wrap"
                style={{ width: 36, height: 36, marginBottom: 0 }}
              >
                <Icon size={16} />
              </div>
            </div>
            <div className="metric-value">{value}</div>
            <div className={`metric-change ${trend === "up" ? "up" : "down"}`}>
              {change} vs last month
            </div>
          </div>
        ))}
      </section>

      <section className="chart-grid">
        <div className="chart-card">
          <div className="section-header" style={{ marginBottom: 14 }}>
            <h3>Application activity</h3>
            <span className="small-muted">This year</span>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={lineData}>
              <defs>
                <linearGradient id="colorApps" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip />
              <Area
                dataKey="apps"
                type="monotone"
                stroke="#2563eb"
                fill="url(#colorApps)"
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="section-header" style={{ marginBottom: 14 }}>
            <h3>Application funnel</h3>
            <span className="small-muted">Current</span>
          </div>
          <div style={{ display: "grid", gap: 12, marginTop: 10 }}>
            {["Saved", "Applied", "Screening", "Interview", "Offer"].map(
              (step, index) => (
                <div key={step}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 6,
                    }}
                  >
                    <span>{step}</span>
                    <strong>{[28, 52, 18, 13, 3][index]}</strong>
                  </div>
                  <div
                    style={{
                      height: 8,
                      borderRadius: 10,
                      background: "var(--elevated)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${[38, 72, 41, 18, 12][index]}%`,
                        height: "100%",
                        background: "linear-gradient(90deg, #60a5fa, #2563eb)",
                        borderRadius: 10,
                      }}
                    />
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      <section className="chart-grid" style={{ marginTop: 18 }}>
        <div className="chart-card">
          <div className="section-header" style={{ marginBottom: 14 }}>
            <h3>Upcoming interviews</h3>
            <button
              className="button-ghost"
              onClick={() => navigate("/calendar")}
            >
              View calendar
            </button>
          </div>
          <div className="task-list">
            {upcoming.map((event) => (
              <div
                key={event.company}
                className="task-item"
                style={{ alignItems: "flex-start" }}
              >
                <div>
                  <strong>{event.company}</strong>
                  <div className="small-muted">{event.role}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="small-muted">{event.date}</div>
                  <div className="small-muted">{event.time}</div>
                  <span
                    className={`badge ${event.status.toLowerCase() === "offer" ? "offer" : event.status.toLowerCase() === "screening" ? "screening" : "interview"}`}
                  >
                    {event.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <div className="section-header" style={{ marginBottom: 14 }}>
            <h3>Follow-up reminders</h3>
            <span className="small-muted">Today</span>
          </div>
          <div className="task-list">
            {applications.slice(0, 3).map((app) => (
              <div key={app.id} className="task-item">
                <div>
                  <strong>Follow up with {app.company}</strong>
                  <div className="small-muted">{app.nextAction}</div>
                </div>
                <button
                  className="button-ghost"
                  onClick={() => navigate(`/applications/${app.id}`)}
                >
                  Review
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="chart-card" style={{ marginTop: 18 }}>
        <div className="section-header">
          <h3>Recent applications</h3>
          <Link to="/applications" className="link-button">
            See all
          </Link>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Position</th>
                <th>Applied</th>
                <th>Status</th>
                <th>Next action</th>
              </tr>
            </thead>
            <tbody>
              {recentApplications.map((row) => (
                <tr key={row.id}>
                  <td>
                    <div className="company-cell">
                      <div className="logo-badge">
                        {row.company.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700 }}>{row.company}</div>
                        <div className="small-muted">{row.location}</div>
                      </div>
                    </div>
                  </td>
                  <td>{row.role}</td>
                  <td>{row.appliedDate}</td>
                  <td>
                    <span className={`badge ${row.status.toLowerCase()}`}>
                      {row.status}
                    </span>
                  </td>
                  <td>{row.nextAction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function ApplicationsPage({
  applications,
  setApplications,
}: {
  applications: Application[];
  setApplications: (apps: Application[]) => void;
}) {
  const [view, setView] = useState<"table" | "kanban">("table");
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("Newest");
  const [searchParams, setSearchParams] = useSearchParams();
  const [showAddModal, setShowAddModal] = useState(
    () => searchParams.get("add") === "1",
  );

  useEffect(() => {
    if (searchParams.get("add") === "1") {
      searchParams.delete("add");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleDeleteApplication = (application: Application) => {
    if (
      !window.confirm(`Delete ${application.role} at ${application.company}?`)
    )
      return;
    setApplications(applications.filter((item) => item.id !== application.id));
    void deleteApplication(application.id);
  };

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    let list = applications.filter((app) => {
      const matchesStatus =
        statusFilter === "All" || app.status === statusFilter;
      const matchesSearch =
        !term ||
        `${app.company} ${app.role} ${app.location}`
          .toLowerCase()
          .includes(term);
      return matchesStatus && matchesSearch;
    });

    if (sortBy === "Newest")
      list = [...list].sort(
        (a, b) =>
          new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime(),
      );
    if (sortBy === "Oldest")
      list = [...list].sort(
        (a, b) =>
          new Date(a.appliedDate).getTime() - new Date(b.appliedDate).getTime(),
      );
    if (sortBy === "Company")
      list = [...list].sort((a, b) => a.company.localeCompare(b.company));
    if (sortBy === "Status")
      list = [...list].sort(
        (a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status),
      );
    return list;
  }, [applications, search, sortBy, statusFilter]);

  const handleAddApplication = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const applicant: Application = {
      id: `app-${Date.now()}`,
      company: String(form.get("company") ?? "New Company"),
      role: String(form.get("role") ?? "New Role"),
      location: String(form.get("location") ?? "Remote"),
      salary: String(form.get("salary") ?? "$100k - $120k"),
      appliedDate: String(
        form.get("appliedDate") ?? new Date().toISOString().slice(0, 10),
      ),
      status: (String(form.get("status")) as Status) || "Saved",
      nextAction: String(form.get("nextAction") ?? "Schedule follow-up"),
      source: String(form.get("source") ?? "LinkedIn"),
      priority:
        (String(form.get("priority")) as Application["priority"]) || "Medium",
      workType: (String(form.get("workType")) as WorkType) || "Remote",
      resume: String(form.get("resume") ?? "Frontend Developer — ATS"),
      recruiter: String(form.get("recruiter") ?? "Recruiter"),
      contactEmail: String(form.get("contactEmail") ?? "recruiter@example.com"),
      url: String(form.get("url") ?? "https://example.com/job"),
      followsUp: String(
        form.get("followUpDate") ?? new Date().toISOString().slice(0, 10),
      ),
      notes: String(form.get("notes") ?? "Ready to proceed."),
    };
    setApplications([applicant, ...applications]);
    setShowAddModal(false);
    event.currentTarget.reset();
  };

  if (view === "kanban") {
    return (
      <div className="page-shell">
        <div className="page-header">
          <div className="page-title">
            <h1>Applications</h1>
          </div>
          <div className="page-actions">
            <button
              className="button-secondary"
              onClick={() => downloadApplicationsCsv(applications)}
            >
              Export
            </button>
            <button
              className="button-primary"
              onClick={() => setShowAddModal(true)}
            >
              Add Application
            </button>
          </div>
        </div>

        <div className="filters-row">
          <input
            className="filter-select"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search jobs, companies, locations..."
          />
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All</option>
            {statusOrder.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
          <select
            className="filter-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option>Newest</option>
            <option>Oldest</option>
            <option>Company</option>
            <option>Status</option>
          </select>
          <button className="button-ghost" onClick={() => setView("table")}>
            Table view
          </button>
        </div>

        <div className="kanban-shell">
          {statusOrder.map((status) => (
            <div key={status} className="kanban-column">
              <div className="kanban-header">
                <strong>{status}</strong>
                <span className="badge saved">
                  {filtered.filter((app) => app.status === status).length}
                </span>
              </div>
              <div className="kanban-cards">
                {filtered
                  .filter((app) => app.status === status)
                  .map((app) => (
                    <div key={app.id} className="kanban-card">
                      <div className="kcard-row">
                        <div className="company-cell">
                          <div className="logo-badge">
                            {app.company.slice(0, 2).toUpperCase()}
                          </div>
                          <span>{app.company}</span>
                        </div>
                        <span className="badge saved">{app.priority}</span>
                      </div>
                      <div className="kcard-title">{app.role}</div>
                      <div className="meta-row">
                        <span>{app.location}</span>
                        <span>•</span>
                        <span>{app.salary}</span>
                      </div>
                      <div className="meta-row">
                        <span>Applied {app.appliedDate}</span>
                        <span>•</span>
                        <span>Follow-up {app.followsUp}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="page-header">
        <div className="page-title">
          <h1>Applications</h1>
        </div>
        <div className="page-actions">
          <button
            className="button-secondary"
            onClick={() => downloadApplicationsCsv(applications)}
          >
            Export
          </button>
          <button
            className="button-primary"
            onClick={() => setShowAddModal(true)}
          >
            Add Application
          </button>
        </div>
      </div>

      <div className="filters-row">
        <input
          className="filter-select"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search jobs, companies, locations..."
        />
        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option>All</option>
          {statusOrder.map((status) => (
            <option key={status}>{status}</option>
          ))}
        </select>
        <select
          className="filter-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option>Newest</option>
          <option>Oldest</option>
          <option>Company</option>
          <option>Status</option>
        </select>
        <button className="button-ghost" onClick={() => setView("kanban")}>
          Kanban view
        </button>
      </div>

      <div className="table-card">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Position</th>
                <th>Location</th>
                <th>Salary</th>
                <th>Applied</th>
                <th>Status</th>
                <th>Next Action</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id}>
                  <td>
                    <div className="company-cell">
                      <div className="logo-badge">
                        {row.company.slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700 }}>{row.company}</div>
                        <div className="small-muted">{row.source}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700 }}>{row.role}</div>
                    <div className="small-muted">{row.resume}</div>
                  </td>
                  <td>{row.location}</td>
                  <td>{row.salary}</td>
                  <td>{row.appliedDate}</td>
                  <td>
                    <span className={`badge ${row.status.toLowerCase()}`}>
                      {row.status}
                    </span>
                  </td>
                  <td>{row.nextAction}</td>
                  <td>
                    <div className="action-row">
                      <Link
                        to={`/applications/${row.id}`}
                        className="small-button"
                      >
                        View
                      </Link>
                      <Link
                        to={`/applications/${row.id}`}
                        className="small-button"
                      >
                        Edit
                      </Link>
                      <button
                        className="small-button"
                        onClick={() => handleDeleteApplication(row)}
                        aria-label={`Delete ${row.company} application`}
                      >
                        <MoreHorizontal size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div
            className="modal-card"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Add application</h3>
              <button
                className="icon-button"
                onClick={() => setShowAddModal(false)}
                aria-label="Close add application"
              >
                <X size={16} />
              </button>
            </div>
            <form className="modal-body" onSubmit={handleAddApplication}>
              <div className="field-row" style={{ marginBottom: 12 }}>
                <div className="field">
                  <label>Job title</label>
                  <input name="role" defaultValue="Senior Product Designer" />
                </div>
                <div className="field">
                  <label>Company</label>
                  <input name="company" defaultValue="Atlassian" />
                </div>
              </div>
              <div className="field-row" style={{ marginBottom: 12 }}>
                <div className="field">
                  <label>Job URL</label>
                  <input
                    name="url"
                    defaultValue="https://atlassian.com/jobs/product-designer"
                  />
                </div>
                <div className="field">
                  <label>Location</label>
                  <input name="location" defaultValue="Remote" />
                </div>
              </div>
              <div className="field-row" style={{ marginBottom: 12 }}>
                <div className="field">
                  <label>Work type</label>
                  <select name="workType" defaultValue="Remote">
                    <option>Remote</option>
                    <option>Hybrid</option>
                    <option>On-site</option>
                  </select>
                </div>
                <div className="field">
                  <label>Employment type</label>
                  <select defaultValue="Full-time">
                    <option>Full-time</option>
                    <option>Contract</option>
                    <option>Internship</option>
                  </select>
                </div>
              </div>
              <div className="field-row" style={{ marginBottom: 12 }}>
                <div className="field">
                  <label>Salary range</label>
                  <input name="salary" defaultValue="$120k - $150k" />
                </div>
                <div className="field">
                  <label>Application date</label>
                  <input
                    type="date"
                    name="appliedDate"
                    defaultValue="2026-09-15"
                  />
                </div>
              </div>
              <div className="field-row" style={{ marginBottom: 12 }}>
                <div className="field">
                  <label>Status</label>
                  <select name="status" defaultValue="Applied">
                    <option>Saved</option>
                    <option>Applied</option>
                    <option>Screening</option>
                    <option>Interview</option>
                    <option>Offer</option>
                    <option>Rejected</option>
                  </select>
                </div>
                <div className="field">
                  <label>Source</label>
                  <input name="source" defaultValue="LinkedIn" />
                </div>
              </div>
              <div className="field-row" style={{ marginBottom: 12 }}>
                <div className="field">
                  <label>Recruiter</label>
                  <input name="recruiter" defaultValue="Nina James" />
                </div>
                <div className="field">
                  <label>Contact email</label>
                  <input
                    name="contactEmail"
                    defaultValue="nina@atlassian.com"
                  />
                </div>
              </div>
              <div className="field-row" style={{ marginBottom: 12 }}>
                <div className="field">
                  <label>Resume used</label>
                  <input
                    name="resume"
                    defaultValue="Product Designer — Portfolio"
                  />
                </div>
                <div className="field">
                  <label>Priority</label>
                  <select name="priority" defaultValue="High">
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>
              </div>
              <div className="field">
                <label>Notes</label>
                <textarea
                  name="notes"
                  rows={3}
                  defaultValue="Solid brand/product mix. Need to share case study deck after follow-up."
                />
              </div>
              <div className="field" style={{ marginTop: 12 }}>
                <label>Follow-up date</label>
                <input
                  type="date"
                  name="followUpDate"
                  defaultValue="2026-09-22"
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="button-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="button-primary">
                  Save Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ApplicationDetailsPage({
  applications,
  setApplications,
}: {
  applications: Application[];
  setApplications: (apps: Application[]) => void;
}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const app = applications.find((item) => item.id === id);

  if (!app) {
    return (
      <div className="empty-state">
        <h3>Application not found</h3>
        <button
          className="button-primary"
          onClick={() => navigate("/applications")}
        >
          Back to applications
        </button>
      </div>
    );
  }

  const handleStatusChange = (status: Status) => {
    setApplications(
      applications.map((item) =>
        item.id === app.id ? { ...item, status } : item,
      ),
    );
  };

  const handleAddNote = () => {
    const note = window.prompt("Add a note", app.notes);
    if (note === null) return;
    setApplications(
      applications.map((item) =>
        item.id === app.id ? { ...item, notes: note } : item,
      ),
    );
  };

  const handleCompleteAction = () => {
    setApplications(
      applications.map((item) =>
        item.id === app.id
          ? { ...item, nextAction: "Completed", followsUp: "" }
          : item,
      ),
    );
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <div className="company-cell">
          <div
            className="logo-badge"
            style={{ width: 46, height: 46, borderRadius: 14 }}
          >
            {app.company.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 style={{ fontSize: "2rem", marginBottom: 4 }}>{app.role}</h1>
            <div className="small-muted">{app.company}</div>
          </div>
        </div>
        <div className="page-actions">
          <button className="button-secondary">Edit</button>
          <select
            value={app.status}
            onChange={(e) => handleStatusChange(e.target.value as Status)}
            className="filter-select"
          >
            {statusOrder.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
          <button className="button-primary" onClick={handleAddNote}>
            Add note
          </button>
        </div>
      </div>

      <div className="chart-grid">
        <div className="chart-card">
          <h3>Job information</h3>
          <div className="task-list" style={{ marginTop: 16 }}>
            <div className="task-item">
              <span>Location</span>
              <strong>{app.location}</strong>
            </div>
            <div className="task-item">
              <span>Salary</span>
              <strong>{app.salary}</strong>
            </div>
            <div className="task-item">
              <span>Work type</span>
              <strong>{app.workType}</strong>
            </div>
            <div className="task-item">
              <span>Source</span>
              <strong>{app.source}</strong>
            </div>
            <div className="task-item">
              <span>Recruiter</span>
              <strong>{app.recruiter}</strong>
            </div>
            <div className="task-item">
              <span>Follow-up</span>
              <strong>{app.followsUp}</strong>
            </div>
          </div>
        </div>

        <div className="chart-card">
          <h3>Next action</h3>
          <div className="task-item" style={{ marginTop: 16 }}>
            <div>
              <strong>{app.nextAction}</strong>
              <div className="small-muted">Due by {app.followsUp}</div>
            </div>
            <button className="button-primary" onClick={handleCompleteAction}>
              Complete
            </button>
          </div>
          <div className="task-list" style={{ marginTop: 18 }}>
            <div className="task-item">
              <span>Resume used</span>
              <strong>{app.resume}</strong>
            </div>
            <div className="task-item">
              <span>Contact email</span>
              <strong>{app.contactEmail}</strong>
            </div>
            <div className="task-item">
              <span>Notes</span>
              <strong>{app.notes}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="chart-card">
        <div className="section-header">
          <h3>Application timeline</h3>
        </div>
        <div style={{ display: "grid", gap: 14, marginTop: 12 }}>
          {[
            "Applied",
            "Application viewed",
            "Recruiter contacted",
            "Interview scheduled",
          ].map((stage, index) => (
            <div
              key={stage}
              style={{ display: "flex", alignItems: "center", gap: 12 }}
            >
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: index === 3 ? "var(--primary)" : "var(--border)",
                  boxShadow:
                    index === 3 ? "0 0 0 8px rgba(37,99,235,0.12)" : "none",
                }}
              />
              <div
                style={{
                  flex: 1,
                  borderBottom: "1px solid var(--border)",
                  paddingBottom: 12,
                }}
              >
                <strong>{stage}</strong>
                <div className="small-muted">
                  {index === 0
                    ? "Sep 8, 2026"
                    : index === 1
                      ? "Sep 11, 2026"
                      : index === 2
                        ? "Sep 15, 2026"
                        : "Sep 18, 2026"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CalendarPage({ applications }: { applications: Application[] }) {
  const [calendarView, setCalendarView] = useState("Month");
  const events = applications.map((app) => ({
    title: `${app.company} • ${app.role}`,
    type:
      app.status === "Interview"
        ? "Interview"
        : app.status === "Rejected"
          ? "Deadline"
          : "Follow-up",
    day: String(app.appliedDate || "").slice(-2),
    month: "Sep",
  }));

  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="page-shell">
      <div className="page-header">
        <div className="page-title">
          <h1>Calendar</h1>
        </div>
        <div className="page-actions">
          {["Month", "Week", "Day"].map((view) => (
            <button
              key={view}
              className={
                calendarView === view ? "button-primary" : "button-ghost"
              }
              onClick={() => setCalendarView(view)}
            >
              {view}
            </button>
          ))}
        </div>
      </div>

      <div className="chart-card">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
            gap: 12,
          }}
        >
          {dayLabels.map((label) => (
            <div
              key={label}
              className="small-muted"
              style={{ textAlign: "center", fontWeight: 700 }}
            >
              {label}
            </div>
          ))}
          {[...Array(35)].map((_, index) => {
            const day = index + 1;
            const event = events.find((item) => Number(item.day) === day);
            return (
              <div
                key={index}
                className="calendar-cell"
                style={{ minHeight: 110, padding: 10 }}
              >
                <div style={{ fontWeight: 700, marginBottom: 8 }}>{day}</div>
                {event ? (
                  <div
                    className={`badge ${event.type === "Interview" ? "interview" : event.type === "Deadline" ? "screening" : "applied"}`}
                  >
                    {event.type}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function AnalyticsPage() {
  const [range, setRange] = useState("This year");
  const metrics = [
    { label: "Applications submitted", value: "128", change: "+18%" },
    { label: "Interviews", value: "16", change: "+6%" },
    { label: "Offers", value: "3", change: "+2%" },
    { label: "Response rate", value: "28%", change: "+12%" },
    { label: "Interview rate", value: "14%", change: "+5%" },
    { label: "Offer rate", value: "4%", change: "+1%" },
    { label: "Avg. response time", value: "4.6 days", change: "-1.2 days" },
  ];

  return (
    <div className="page-shell">
      <div className="page-header">
        <div className="page-title">
          <h1>Analytics</h1>
        </div>
        <div className="page-actions">
          {["7 days", "30 days", "90 days", "This year", "Custom"].map(
            (label) => (
              <button
                key={label}
                className={label === range ? "button-primary" : "button-ghost"}
                onClick={() => setRange(label)}
              >
                {label}
              </button>
            ),
          )}
        </div>
      </div>

      <div className="grid-4">
        {metrics.map((item) => (
          <div key={item.label} className="metric-card">
            <div className="small-muted">{item.label}</div>
            <div className="metric-value" style={{ fontSize: "1.8rem" }}>
              {item.value}
            </div>
            <div className="metric-change up">{item.change}</div>
          </div>
        ))}
      </div>

      <div className="chart-grid" style={{ marginTop: 18 }}>
        <div className="chart-card">
          <h3>Applications over time</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={lineData}>
              <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="apps" fill="#2563eb" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card">
          <h3>Application status distribution</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={4}
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={["#2563eb", "#22c55e", "#f59e0b", "#ef4444"][index]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-grid" style={{ marginTop: 18 }}>
        <div className="chart-card">
          <h3>Applications by source</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={sourceData}>
              <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#8b5cf6"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card">
          <h3>Interview activity</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={activityData}>
              <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" />
              <XAxis dataKey="day" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="applied" fill="#60a5fa" radius={[8, 8, 0, 0]} />
              <Bar dataKey="interview" fill="#34d399" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function ResumesPage({
  resumes,
  setResumes,
}: {
  resumes: Resume[];
  setResumes: (value: Resume[]) => void;
}) {
  const handleCreateResume = () => {
    const name = window.prompt("Resume name", "New resume");
    if (!name?.trim()) return;
    setResumes([
      ...resumes,
      {
        id: `resume-${Date.now()}`,
        name: name.trim(),
        updated: "Just now",
        role: "Target role",
        version: "v1",
        content: "",
      },
    ]);
  };

  const handleDownload = (name: string) => {
    const content = `${name}\n\nJobFlow resume workspace\nUpdated: ${new Date().toLocaleDateString()}`;
    const url = URL.createObjectURL(
      new Blob([content], { type: "text/plain" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `${name.toLowerCase().replaceAll(" ", "-")}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <div className="page-title">
          <h1>Resumes</h1>
        </div>
        <div className="page-actions">
          <button className="button-secondary" onClick={handleCreateResume}>
            Upload Resume
          </button>
          <button className="button-primary" onClick={handleCreateResume}>
            Create Resume
          </button>
        </div>
      </div>

      <div className="resume-grid">
        {resumes.map((resume) => (
          <div key={resume.name} className="resume-card">
            <div className="icon-wrap">
              <FileText size={18} />
            </div>
            <h3>{resume.name}</h3>
            <div className="small-muted" style={{ marginTop: 8 }}>
              Target role: {resume.role}
            </div>
            <div className="small-muted" style={{ marginTop: 4 }}>
              Last updated: {resume.updated}
            </div>
            <div className="badge applied" style={{ marginTop: 12 }}>
              {resume.version}
            </div>
            <div className="action-row" style={{ marginTop: 18 }}>
              <button
                className="button-secondary"
                onClick={() => handleDownload(resume.name)}
              >
                Download
              </button>
              <button
                className="button-ghost"
                onClick={() => {
                  const name = window.prompt("Rename resume", resume.name);
                  if (name?.trim())
                    setResumes(
                      resumes.map((item) =>
                        item === resume
                          ? { ...item, name: name.trim(), updated: "Just now" }
                          : item,
                      ),
                    );
                }}
              >
                Edit
              </button>
              <button
                className="button-danger"
                onClick={() =>
                  setResumes(resumes.filter((item) => item !== resume))
                }
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfilePage({
  profile,
  setProfile,
}: {
  profile: Profile | null;
  setProfile: (value: Profile) => void;
}) {
  const currentProfile: Profile = profile || {
    name: "Aarav Desai",
    email: "aarav@gmail.com",
    role: "Frontend Developer",
    location: "Bengaluru",
    portfolio: "https://aaravdesai.dev",
    github: "https://github.com/aarav",
    linkedin: "https://linkedin.com/in/aarav",
    workType: "Remote",
    skills: "React, TypeScript, UI Design, Accessibility",
  };
  const [saved, setSaved] = useState(false);

  const updateProfileField = (field: keyof Profile, value: string) => {
    setSaved(false);
    setProfile({ ...currentProfile, [field]: value });
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <div className="page-title">
          <h1>Profile</h1>
        </div>
        <button className="button-primary" onClick={() => setSaved(true)}>
          {saved ? "Saved" : "Save changes"}
        </button>
      </div>

      <div className="profile-layout">
        <div className="profile-card">
          <div className="profile-avatar">AD</div>
          <h3 style={{ marginTop: 18 }}>{currentProfile.name}</h3>
          <div className="small-muted">{currentProfile.role}</div>
          <div className="task-list" style={{ marginTop: 18 }}>
            <div className="task-item">
              <span>Email</span>
              <strong>{currentProfile.email}</strong>
            </div>
            <div className="task-item">
              <span>Location</span>
              <strong>{currentProfile.location}</strong>
            </div>
            <div className="task-item">
              <span>Portfolio</span>
              <strong>
                {currentProfile.portfolio.replace("https://", "")}
              </strong>
            </div>
            <div className="task-item">
              <span>GitHub</span>
              <strong>{currentProfile.github.replace("https://", "")}</strong>
            </div>
          </div>
        </div>

        <div className="form-card">
          <div className="field-row" style={{ marginBottom: 12 }}>
            <div className="field">
              <label>Full name</label>
              <input
                value={currentProfile.name}
                onChange={(event) =>
                  updateProfileField("name", event.target.value)
                }
              />
            </div>
            <div className="field">
              <label>Email</label>
              <input
                value={currentProfile.email}
                onChange={(event) =>
                  updateProfileField("email", event.target.value)
                }
              />
            </div>
          </div>
          <div className="field-row" style={{ marginBottom: 12 }}>
            <div className="field">
              <label>Target role</label>
              <input
                value={currentProfile.role}
                onChange={(event) =>
                  updateProfileField("role", event.target.value)
                }
              />
            </div>
            <div className="field">
              <label>Location</label>
              <input
                value={currentProfile.location}
                onChange={(event) =>
                  updateProfileField("location", event.target.value)
                }
              />
            </div>
          </div>
          <div className="field-row" style={{ marginBottom: 12 }}>
            <div className="field">
              <label>Portfolio</label>
              <input
                value={currentProfile.portfolio}
                onChange={(event) =>
                  updateProfileField("portfolio", event.target.value)
                }
              />
            </div>
            <div className="field">
              <label>GitHub</label>
              <input
                value={currentProfile.github}
                onChange={(event) =>
                  updateProfileField("github", event.target.value)
                }
              />
            </div>
          </div>
          <div className="field-row" style={{ marginBottom: 12 }}>
            <div className="field">
              <label>LinkedIn</label>
              <input
                value={currentProfile.linkedin}
                onChange={(event) =>
                  updateProfileField("linkedin", event.target.value)
                }
              />
            </div>
            <div className="field">
              <label>Preferred work type</label>
              <select
                value={currentProfile.workType}
                onChange={(event) =>
                  updateProfileField("workType", event.target.value)
                }
              >
                <option>Remote</option>
                <option>Hybrid</option>
                <option>On-site</option>
              </select>
            </div>
          </div>
          <div className="field">
            <label>Skills</label>
            <input
              value={currentProfile.skills}
              onChange={(event) =>
                updateProfileField("skills", event.target.value)
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsPage({
  setTheme,
  applications,
  preferences,
  setPreferences,
  deleteAccount,
}: {
  setTheme: (value: Theme) => void;
  applications: Application[];
  preferences: Preferences;
  setPreferences: (value: Preferences) => void;
  deleteAccount: () => void;
}) {
  return (
    <div className="page-shell">
      <div className="page-header">
        <div className="page-title">
          <h1>Settings</h1>
        </div>
      </div>

      <div className="settings-grid">
        <div className="settings-card">
          <h3>Account</h3>
          <div className="task-list" style={{ marginTop: 14 }}>
            <div className="task-item">
              <span>Personal information</span>
              <strong>Updated</strong>
            </div>
            <div className="task-item">
              <span>Email</span>
              <strong>aarav@gmail.com</strong>
            </div>
          </div>
        </div>
        <div className="settings-card">
          <h3>Appearance</h3>
          <div className="checkbox-row" style={{ marginTop: 14 }}>
            <label>
              <input
                type="radio"
                name="theme"
                checked={preferences.theme === "light"}
                onChange={() => {
                  setTheme("light");
                  setPreferences({ ...preferences, theme: "light" });
                }}
              />{" "}
              Light
            </label>
            <label>
              <input
                type="radio"
                name="theme"
                checked={preferences.theme === "dark"}
                onChange={() => {
                  setTheme("dark");
                  setPreferences({ ...preferences, theme: "dark" });
                }}
              />{" "}
              Dark
            </label>
            <label>
              <input
                type="radio"
                name="theme"
                checked={false}
                onChange={() =>
                  setTheme(
                    window.matchMedia("(prefers-color-scheme: dark)").matches
                      ? "dark"
                      : "light",
                  )
                }
              />{" "}
              System
            </label>
          </div>
        </div>
        <div className="settings-card">
          <h3>Notifications</h3>
          <div className="task-list" style={{ marginTop: 14 }}>
            <div className="task-item">
              <label>
                <input
                  type="checkbox"
                  checked={preferences.interviewReminders}
                  onChange={(event) =>
                    setPreferences({
                      ...preferences,
                      interviewReminders: event.target.checked,
                    })
                  }
                />{" "}
                Interview reminders
              </label>
            </div>
            <div className="task-item">
              <label>
                <input
                  type="checkbox"
                  checked={preferences.followUpReminders}
                  onChange={(event) =>
                    setPreferences({
                      ...preferences,
                      followUpReminders: event.target.checked,
                    })
                  }
                />{" "}
                Follow-up reminders
              </label>
            </div>
            <div className="task-item">
              <label>
                <input
                  type="checkbox"
                  checked={preferences.weeklySummary}
                  onChange={(event) =>
                    setPreferences({
                      ...preferences,
                      weeklySummary: event.target.checked,
                    })
                  }
                />{" "}
                Weekly summary
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-grid" style={{ marginTop: 18 }}>
        <div className="settings-card">
          <h3>Privacy</h3>
          <div className="task-list" style={{ marginTop: 14 }}>
            <div className="task-item">
              <span>Profile visibility</span>
              <strong>Only me</strong>
            </div>
            <div className="task-item">
              <span>Data sharing</span>
              <strong>Disabled</strong>
            </div>
          </div>
        </div>
        <div className="settings-card">
          <h3>Data</h3>
          <div className="action-row" style={{ marginTop: 14 }}>
            <button
              className="button-secondary"
              onClick={() => downloadApplicationsCsv(applications)}
            >
              Export data
            </button>
            <button
              className="button-danger"
              onClick={() => {
                if (window.confirm("Delete this account and all of its data?"))
                  deleteAccount();
              }}
            >
              Delete account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SearchOverlay({
  applications,
  onClose,
}: {
  applications: Application[];
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return {
      Applications: applications
        .filter((app) =>
          `${app.company} ${app.role} ${app.location}`
            .toLowerCase()
            .includes(q),
        )
        .slice(0, 3),
      Companies: applications
        .filter((app) => app.company.toLowerCase().includes(q))
        .slice(0, 2),
      Contacts: applications
        .filter((app) => app.recruiter.toLowerCase().includes(q))
        .slice(0, 2),
    };
  }, [applications, query]);

  return (
    <div className="search-overlay" onClick={onClose}>
      <div
        className="search-panel"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="search-input">
          <Search size={16} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search applications, companies, contacts..."
            style={{ border: "none", background: "transparent", padding: 0 }}
          />
          <button className="button-ghost" onClick={onClose}>
            Esc
          </button>
        </div>
        <div className="search-results">
          {!query.trim() ? (
            <div className="empty-state" style={{ margin: 18 }}>
              Search for an application or company
            </div>
          ) : (
            Object.entries(results).map(([group, items]) => (
              <div key={group} className="search-result-group">
                <strong>{group}</strong>
                <div className="search-result-items">
                  {items.length ? (
                    items.map((item) => (
                      <div key={item.id} className="search-result-item">
                        <div>
                          <strong>
                            {group === "Companies"
                              ? item.company
                              : group === "Contacts"
                                ? item.recruiter
                                : item.role}
                          </strong>
                          <div className="small-muted">
                            {group === "Applications"
                              ? `${item.company} • ${item.location}`
                              : item.company}
                          </div>
                        </div>
                        <span className={`badge ${item.status.toLowerCase()}`}>
                          {item.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="small-muted">
                      No matches in {group.toLowerCase()}.
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
