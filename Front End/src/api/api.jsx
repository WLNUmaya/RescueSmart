

const BASE_URL = "http://127.0.0.1:5000/api/v1";

async function readJsonSafe(res) {
  const text = await res.text();
  try {
    return { ok: res.ok, status: res.status, data: JSON.parse(text) };
  } catch {
    return { ok: res.ok, status: res.status, data: text };
  }
}


export async function submitVictim(payload) {
  console.log("➡️ POST /victims/submit payload:", payload);

  const res = await fetch(`${BASE_URL}/victims/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const out = await readJsonSafe(res);
  console.log("⬅️ POST /victims/submit response:", out);

  if (!out.ok) throw new Error(`submitVictim failed (${out.status}): ${JSON.stringify(out.data)}`);

  return out.data;
}

