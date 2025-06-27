import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function EmployeeLogin() {
  const nav = useNavigate();
  const [form, set] = useState({ code: "", password: "" });
  const [err,  setErr] = useState("");

  const handle = e => set({ ...form, [e.target.name]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    setErr("");
    try {
      const r  = await fetch("/api/employees/login", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body:JSON.stringify(form)
      });
      const d  = await r.json();

      if (r.status === 403 && d.message === "Suspended")
        return setErr("Your account is suspended. Contact admin.");

      if (!r.ok) return setErr(d.message || "Login failed");

      /* pick dashboard based on role */
      const route = {
        admin:    "/admin-dashboard",
        manager:  "/manager-dashboard",
        cashier:  "/cashier-dashboard",
        employee: "/employee-dashboard"
      }[d.role] || "/";

      nav(route);
    } catch {
      setErr("Server offline, try later");
    }
  };

  return (
    <div className="signup-page">
      <form className="signup-card" onSubmit={submit}>
        <h1 className="signup-title">Employee&nbsp;Login</h1>
        {err && <p className="msg-error">{err}</p>}

        <div className="input-wrap">
          <input name="code"     placeholder="6-digit code"
                 maxLength={6} value={form.code} onChange={handle} required />
        </div>
        <div className="input-wrap">
          <input name="password" type="password" placeholder="Password"
                 maxLength={8} value={form.password} onChange={handle} required />
        </div>

        <button className="signup-btn">Login</button>
      </form>
    </div>
  );
}
