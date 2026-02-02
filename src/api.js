const base = import.meta.env.VITE_API_BASE_URL;

async function checkRes(res) {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }
  return res.json();
}

export async function getStudents() {
  const res = await fetch(base);
  return checkRes(res);
}

export async function createStudent(student) {
  const res = await fetch(base, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(student),
  });
  return checkRes(res);
}

export async function updateStudent(id, student) {
  const res = await fetch(`${base}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(student),
  });
  return checkRes(res);
}

export async function deleteStudent(id) {
  const res = await fetch(`${base}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Delete failed');
  return true;
}
