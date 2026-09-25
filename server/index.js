import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDirectory = path.join(__dirname, "data");
const dataFile = path.join(dataDirectory, "jobflow.json");
const port = Number(process.env.PORT || 3001);
const sessions = new Map();

const seedApplications = [
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
    resume: "Frontend Developer - ATS",
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
    resume: "Product Designer - Portfolio",
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
    resume: "UI Developer - Creative",
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
    resume: "Frontend Developer - ATS",
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
    salary: "INR 24L - INR 32L",
    appliedDate: "2026-09-05",
    status: "Saved",
    nextAction: "Tailor resume for role",
    source: "LinkedIn",
    priority: "Low",
    workType: "On-site",
    resume: "Frontend Developer - ATS",
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
    salary: "INR 18L - INR 28L",
    appliedDate: "2026-09-01",
    status: "Rejected",
    nextAction: "Archive and learn from feedback",
    source: "AngelList",
    priority: "Medium",
    workType: "Remote",
    resume: "Frontend Developer - ATS",
    recruiter: "Rohit Jain",
    contactEmail: "rohit@razorpay.com",
    url: "https://razorpay.com/jobs/frontend-engineer",
    followsUp: "2026-09-25",
    notes: "Role leaned more on full-stack than design systems.",
  },
];

const seedNotifications = [
  {
    id: 1,
    title: "Interview tomorrow at 10:00 AM",
    detail: "Google - Frontend Developer",
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

const seedResumes = [
  {
    id: "resume-1",
    name: "Frontend Developer - ATS",
    updated: "Today",
    role: "Frontend Developer",
    version: "v3",
    content: "",
  },
  {
    id: "resume-2",
    name: "Frontend Developer - Creative",
    updated: "2 days ago",
    role: "Frontend Developer",
    version: "v2",
    content: "",
  },
  {
    id: "resume-3",
    name: "Product Designer - Portfolio",
    updated: "1 week ago",
    role: "Product Designer",
    version: "v1",
    content: "",
  },
];

const defaultProfile = {
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

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  const [salt, expected] = stored.split(":");
  const actual = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(actual), Buffer.from(expected));
}

function createUser(name, email, password) {
  return {
    id: crypto.randomUUID(),
    name,
    email: email.toLowerCase(),
    passwordHash: hashPassword(password),
    applications: seedApplications.map((app) => ({ ...app })),
    notifications: seedNotifications.map((note) => ({ ...note })),
    profile: { ...defaultProfile, name, email },
    resumes: seedResumes.map((resume) => ({ ...resume })),
    preferences: {
      theme: "light",
      interviewReminders: true,
      followUpReminders: true,
      weeklySummary: true,
    },
  };
}

function loadDatabase() {
  fs.mkdirSync(dataDirectory, { recursive: true });
  if (!fs.existsSync(dataFile)) {
    const database = {
      users: [createUser("Aarav Desai", "demo@jobflow.app", "demo1234")],
    };
    fs.writeFileSync(dataFile, JSON.stringify(database, null, 2));
    return database;
  }
  return JSON.parse(fs.readFileSync(dataFile, "utf8"));
}

const database = loadDatabase();
database.users.forEach((user) => {
  user.applications = user.applications.map((application) => ({
    location: "Remote",
    salary: "Not specified",
    appliedDate: new Date().toISOString().slice(0, 10),
    status: "Saved",
    nextAction: "Schedule follow-up",
    source: "Other",
    priority: "Medium",
    workType: "Remote",
    resume: "",
    recruiter: "",
    contactEmail: "",
    url: "",
    followsUp: "",
    notes: "",
    ...application,
  }));
  user.profile ||= { ...defaultProfile, name: user.name, email: user.email };
  user.resumes ||= seedResumes.map((resume) => ({ ...resume }));
  user.preferences ||= {
    theme: "light",
    interviewReminders: true,
    followUpReminders: true,
    weeklySummary: true,
  };
});
const app = express();
app.use(express.json({ limit: "1mb" }));

function setSessionCookie(response, userId) {
  const token = crypto.randomBytes(32).toString("hex");
  sessions.set(token, userId);
  response.setHeader(
    "Set-Cookie",
    `jobflow_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=604800`,
  );
}

function getSessionToken(request) {
  const cookie = request.headers.cookie || "";
  return cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("jobflow_session="))
    ?.split("=")[1];
}

function currentUser(request) {
  const userId = sessions.get(getSessionToken(request));
  return database.users.find((user) => user.id === userId);
}

function requireUser(request, response, next) {
  const user = currentUser(request);
  if (!user)
    return response.status(401).json({ error: "Authentication required" });
  request.user = user;
  next();
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    profile: user.profile,
  };
}

function saveDatabase() {
  fs.writeFileSync(dataFile, JSON.stringify(database, null, 2));
}

app.get("/api/health", (_request, response) => response.json({ ok: true }));

app.get("/api/session", (request, response) => {
  const user = currentUser(request);
  if (!user) return response.status(401).json({ error: "No active session" });
  response.json({
    user: publicUser(user),
    applications: user.applications,
    notifications: user.notifications,
    resumes: user.resumes,
    preferences: user.preferences,
  });
});

app.post("/api/auth/demo", (_request, response) => {
  const user =
    database.users.find(
      (candidate) => candidate.email === "demo@jobflow.app",
    ) || database.users[0];
  setSessionCookie(response, user.id);
  response.json({
    user: publicUser(user),
    applications: user.applications,
    notifications: user.notifications,
    resumes: user.resumes,
    preferences: user.preferences,
  });
});

app.post("/api/auth/signup", (request, response) => {
  const { name, email, password } = request.body || {};
  if (!name || !email || !password || password.length < 8)
    return response
      .status(400)
      .json({ error: "Name, email, and an 8-character password are required" });
  if (database.users.some((user) => user.email === String(email).toLowerCase()))
    return response
      .status(409)
      .json({ error: "An account with that email already exists" });
  const user = createUser(String(name), String(email), String(password));
  database.users.push(user);
  saveDatabase();
  setSessionCookie(response, user.id);
  response.status(201).json({
    user: publicUser(user),
    applications: user.applications,
    notifications: user.notifications,
    resumes: user.resumes,
    preferences: user.preferences,
  });
});

app.post("/api/auth/login", (request, response) => {
  const { email, password } = request.body || {};
  const user = database.users.find(
    (candidate) => candidate.email === String(email || "").toLowerCase(),
  );
  if (
    !user ||
    !password ||
    !verifyPassword(String(password), user.passwordHash)
  )
    return response.status(401).json({ error: "Invalid email or password" });
  setSessionCookie(response, user.id);
  response.json({
    user: publicUser(user),
    applications: user.applications,
    notifications: user.notifications,
    resumes: user.resumes,
    preferences: user.preferences,
  });
});

app.post("/api/auth/logout", (request, response) => {
  const token = getSessionToken(request);
  if (token) sessions.delete(token);
  response.setHeader(
    "Set-Cookie",
    "jobflow_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0",
  );
  response.status(204).end();
});

app.get("/api/applications", requireUser, (request, response) =>
  response.json(request.user.applications),
);
app.post("/api/applications", requireUser, (request, response) => {
  const application = {
    location: "Remote",
    salary: "Not specified",
    appliedDate: new Date().toISOString().slice(0, 10),
    status: "Saved",
    nextAction: "Schedule follow-up",
    source: "Other",
    priority: "Medium",
    workType: "Remote",
    resume: "",
    recruiter: "",
    contactEmail: "",
    url: "",
    followsUp: "",
    notes: "",
    ...request.body,
    id: request.body.id || `app-${Date.now()}`,
  };
  request.user.applications.unshift(application);
  saveDatabase();
  response.status(201).json(application);
});
app.patch("/api/applications/:id", requireUser, (request, response) => {
  const index = request.user.applications.findIndex(
    (application) => application.id === request.params.id,
  );
  if (index < 0)
    return response.status(404).json({ error: "Application not found" });
  request.user.applications[index] = {
    ...request.user.applications[index],
    ...request.body,
    id: request.params.id,
  };
  saveDatabase();
  response.json(request.user.applications[index]);
});
app.delete("/api/applications/:id", requireUser, (request, response) => {
  const applicationIndex = request.user.applications.findIndex(
    (application) => application.id === request.params.id,
  );
  if (applicationIndex < 0)
    return response.status(404).json({ error: "Application not found" });
  request.user.applications.splice(applicationIndex, 1);
  saveDatabase();
  response.status(204).end();
});

app.get("/api/notifications", requireUser, (request, response) =>
  response.json(request.user.notifications),
);
app.patch("/api/notifications/read-all", requireUser, (request, response) => {
  request.user.notifications = request.user.notifications.map(
    (notification) => ({ ...notification, read: true }),
  );
  saveDatabase();
  response.json(request.user.notifications);
});

app.patch("/api/profile", requireUser, (request, response) => {
  request.user.profile = { ...request.user.profile, ...request.body };
  request.user.name = request.user.profile.name;
  saveDatabase();
  response.json(request.user.profile);
});

app.get("/api/resumes", requireUser, (request, response) =>
  response.json(request.user.resumes),
);
app.post("/api/resumes", requireUser, (request, response) => {
  const resume = {
    id: `resume-${Date.now()}`,
    name: String(request.body.name || "New resume"),
    role: String(request.body.role || "Target role"),
    version: String(request.body.version || "v1"),
    updated: "Just now",
    content: String(request.body.content || ""),
  };
  request.user.resumes.push(resume);
  saveDatabase();
  response.status(201).json(resume);
});
app.patch("/api/resumes/:id", requireUser, (request, response) => {
  const index = request.user.resumes.findIndex(
    (resume) => resume.id === request.params.id,
  );
  if (index < 0)
    return response.status(404).json({ error: "Resume not found" });
  request.user.resumes[index] = {
    ...request.user.resumes[index],
    ...request.body,
    id: request.params.id,
    updated: "Just now",
  };
  saveDatabase();
  response.json(request.user.resumes[index]);
});
app.delete("/api/resumes/:id", requireUser, (request, response) => {
  const index = request.user.resumes.findIndex(
    (resume) => resume.id === request.params.id,
  );
  if (index < 0)
    return response.status(404).json({ error: "Resume not found" });
  request.user.resumes.splice(index, 1);
  saveDatabase();
  response.status(204).end();
});

app.patch("/api/preferences", requireUser, (request, response) => {
  request.user.preferences = { ...request.user.preferences, ...request.body };
  saveDatabase();
  response.json(request.user.preferences);
});

app.delete("/api/account", requireUser, (request, response) => {
  const index = database.users.findIndex((user) => user.id === request.user.id);
  if (index >= 0) database.users.splice(index, 1);
  const token = getSessionToken(request);
  if (token) sessions.delete(token);
  saveDatabase();
  response.setHeader(
    "Set-Cookie",
    "jobflow_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0",
  );
  response.status(204).end();
});

const clientDist = path.join(__dirname, "..", "dist");
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.use((_request, response) =>
    response.sendFile(path.join(clientDist, "index.html")),
  );
}

export { app };

if (!process.env.NETLIFY && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
  app.listen(port, () =>
    console.log(`JobFlow API running at http://127.0.0.1:${port}`),
  );
}
