import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function AdminHR() {
  const [employees, setEmployees] = useState([]);
  const [err, setErr] = useState("");

  /* ── fetch list once ────────────────────────────────────────── */
  useEffect(() => {
    fetch("/api/employees")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setEmployees)
      .catch(() => setErr("Could not load employees"));
  }, []);

  /* ── delete handler ─────────────────────────────────────────── */
  const del = async (id) => {
    if (!window.confirm("Delete this employee?")) return;

    try {
      const r = await fetch(`/api/employees/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error();

      // remove from UI
      setEmployees((rows) => rows.filter((e) => e.id !== id));
    } catch {
      alert("Delete failed");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">All Employees</h2>
      {err && <p className="text-red-500">{err}</p>}

      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead className="bg-emerald-600 text-white">
            <tr>
              <th className="px-3 py-2 text-left">Name</th>
              <th className="px-3 py-2 text-left">ID No.</th>
              <th className="px-3 py-2 text-left">Role</th>
              <th className="px-3 py-2 text-left">Suspended</th>
              <th className="px-3 py-2 text-center w-24">Action</th>
            </tr>
          </thead>

          <tbody>
            {employees.map((emp) => (
              <tr
                key={emp.id}
                className="even:bg-gray-100 hover:bg-emerald-50 transition"
              >
                <td className="px-3 py-2">
                  <Link
                    to={`/admin/hr/${emp.id}`}
                    className="text-emerald-700 underline"
                  >
                    {emp.full_name}
                  </Link>
                </td>
                <td className="px-3 py-2">{emp.id_number}</td>
                <td className="px-3 py-2">{emp.role}</td>
                <td className="px-3 py-2">
                  {emp.suspended ? "Yes" : "No"}
                </td>
                <td className="px-3 py-2 text-center">
                  <button
                    onClick={() => del(emp.id)}
                    className="text-red-600 underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {employees.length === 0 && !err && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  No employees found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
