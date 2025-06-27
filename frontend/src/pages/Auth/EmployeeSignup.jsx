import { useState } from "react";
import { useNavigate } from "react-router-dom";     // ⬅️ new

export default function EmployeeSignup() {
  const [form, setForm] = useState({
    fullName: "",
    idNumber: "",
    phone: "",
    email: "",
    code: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  const navigate = useNavigate();                  // ⬅️ new

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    /* simple client-side validation */
    if (form.code.length !== 6)       return setError("Code must be 6 digits");
    if (form.password.length !== 8)   return setError("Password must be 8 digits");
    if (form.password !== form.confirmPassword)
      return setError("Passwords do not match");

    setError("");

    try {
      const res = await fetch("/api/employees/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (res.ok) {
        /* ✅ registration succeeded → go to login page */
        navigate("/employee-login");              // ⬅️ new
        return;
      }
      setError(data.message || "Something went wrong, please try again");
    } catch {
      setError("Server unreachable, please try later");
    }
  };

  /* ---------- UI (unchanged) ---------- */
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-8 space-y-6">
        <h1 className="text-2xl font-bold text-center text-orange-600">
          Employee Sign-Up
        </h1>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            name="fullName"
            placeholder="Full names"
            value={form.fullName}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <input
            type="text"
            name="idNumber"
            placeholder="ID number"
            value={form.idNumber}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <input
            type="tel"
            name="phone"
            placeholder="Phone number"
            value={form.phone}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <input
            type="email"
            name="email"
            placeholder="Email address"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <input
            type="text"
            name="code"
            placeholder="6-digit employee code"
            value={form.code}
            onChange={handleChange}
            required
            maxLength={6}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <input
            type="password"
            name="password"
            placeholder="8-digit password"
            value={form.password}
            onChange={handleChange}
            required
            maxLength={8}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            maxLength={8}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />

          <button
            type="submit"
            className="w-full bg-orange-600 text-white font-semibold py-2 rounded-lg hover:bg-orange-700 transition"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
}
