const BASE_URL = "http://127.0.0.1:5000/api/v1";

async function readJsonSafe(res) {
  const text = await res.text();
  try {
    return { ok: res.ok, status: res.status, data: JSON.parse(text) };
  } catch {
    return { ok: res.ok, status: res.status, data: text };
  }
}

export async function registerAuthorityProfile(payload) {
  const res = await fetch(`${BASE_URL}/authority-profiles/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const out = await readJsonSafe(res);
  if (!out.ok) throw new Error(out.data?.error || "Register failed");
  return out.data;
}

export async function loginAuthorityProfile(payload) {
  const res = await fetch(`${BASE_URL}/authority-profiles/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const out = await readJsonSafe(res);
  if (!out.ok) throw new Error(out.data?.error || "Login failed");
  return out.data;
}
