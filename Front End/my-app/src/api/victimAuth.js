
const BASE_URL = "http://127.0.0.1:5000/api/v1";

async function readJsonSafe(res) {
  const text = await res.text();

  try {
    return {
      ok: res.ok,
      status: res.status,
      data: JSON.parse(text),
    };
  } catch {
    return {
      ok: res.ok,
      status: res.status,
      data: { error: text || "Unknown server response" },
    };
  }
}

export async function registerVictimProfile(payload) {
  const res = await fetch(`${BASE_URL}/victim/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const out = await readJsonSafe(res);
  if (!out.ok) throw new Error(out.data?.error || "Register failed");
  return out.data;
}

export async function loginVictimProfile(payload) {
  const res = await fetch(`${BASE_URL}/victim/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const out = await readJsonSafe(res);
  if (!out.ok) throw new Error(out.data?.error || "Login failed");
  return out.data;
}

export async function getVictimProfile(victimId) {
  const res = await fetch(`${BASE_URL}/victim/profile/${victimId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  const out = await readJsonSafe(res);
  if (!out.ok) throw new Error(out.data?.error || "Failed to load profile");
  return out.data;
}

export async function updateVictimProfile(victimId, payload) {
  const res = await fetch(`${BASE_URL}/victim/profile/${victimId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const out = await readJsonSafe(res);
  if (!out.ok) throw new Error(out.data?.error || "Failed to update profile");
  return out.data;
}

export async function getVictimReports(victimId) {
  const res = await fetch(`${BASE_URL}/victim/${victimId}/reports`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  const out = await readJsonSafe(res);
  if (!out.ok) throw new Error(out.data?.error || "Failed to load reports");
  return out.data;
}

export async function submitVictimReport(payload) {
  const res = await fetch(`${BASE_URL}/victims/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const out = await readJsonSafe(res);
  if (!out.ok) throw new Error(out.data?.error || "Report submission failed");
  return out.data;
}