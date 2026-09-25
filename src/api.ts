export type ApiSession = {
  user: {
    id: string;
    name: string;
    email: string;
    profile?: Record<string, string>;
  };
  applications: unknown[];
  notifications: unknown[];
  resumes: unknown[];
  preferences: Record<string, boolean | string>;
};

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as {
      error?: string;
    };
    throw new Error(body.error || "Something went wrong");
  }
  return response.status === 204 ? (undefined as T) : response.json();
}

export function getSession() {
  return request<ApiSession>("/api/session");
}

export function startDemoSession() {
  return request<ApiSession>("/api/auth/demo", { method: "POST" });
}

export function signUp(name: string, email: string, password: string) {
  return request<ApiSession>("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

export function logIn(email: string, password: string) {
  return request<ApiSession>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function logOut() {
  return request<void>("/api/auth/logout", { method: "POST" });
}

export function createApplication(application: unknown) {
  return request<unknown>("/api/applications", {
    method: "POST",
    body: JSON.stringify(application),
  });
}

export function updateApplication(id: string, application: unknown) {
  return request<unknown>(`/api/applications/${id}`, {
    method: "PATCH",
    body: JSON.stringify(application),
  });
}

export function deleteApplication(id: string) {
  return request<void>(`/api/applications/${id}`, { method: "DELETE" });
}

export function markNotificationsRead() {
  return request<unknown[]>("/api/notifications/read-all", { method: "PATCH" });
}

export function updateProfile(profile: unknown) {
  return request<Record<string, string>>("/api/profile", {
    method: "PATCH",
    body: JSON.stringify(profile),
  });
}

export function createResume(resume: unknown) {
  return request<unknown>("/api/resumes", {
    method: "POST",
    body: JSON.stringify(resume),
  });
}

export function updateResume(id: string, resume: unknown) {
  return request<unknown>(`/api/resumes/${id}`, {
    method: "PATCH",
    body: JSON.stringify(resume),
  });
}

export function deleteResume(id: string) {
  return request<void>(`/api/resumes/${id}`, { method: "DELETE" });
}

export function updatePreferences(preferences: unknown) {
  return request<Record<string, boolean | string>>("/api/preferences", {
    method: "PATCH",
    body: JSON.stringify(preferences),
  });
}

export function deleteAccount() {
  return request<void>("/api/account", { method: "DELETE" });
}
