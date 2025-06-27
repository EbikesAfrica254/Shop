/* src/pages/dash/AdminDashboard.jsx */
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const buttons = [
    { to: "/admin/hr",        label: "Human-Resource Management" },
    { to: "/admin/items",     label: "Item Resource Management"  },
    { to: "/admin/stock",     label: "Stock Resource Management" },
    { to: "/admin/website",   label: "Website Management"        },
    { to: "/admin/analytics", label: "Analytics"                 },
  ];

  return (
    <main
      style={{
        minHeight: "100vh",
        display:  "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg,#34d399 0%,#059669 50%,#047857 100%)",
        padding: "2rem",
      }}
    >
      <h1 style={{ color: "#fff", marginBottom: "2rem", fontSize: "2rem" }}>
        Admin Dashboard
      </h1>

      <div style={{ display: "grid", gap: "1rem", width: "100%", maxWidth: 480 }}>
        {buttons.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            style={{
              display: "block",
              padding: "1rem",
              borderRadius: "0.75rem",
              textAlign: "center",
              background: "#fff",
              color: "#047857",
              fontWeight: 600,
              textDecoration: "none",
              boxShadow: "0 6px 12px rgba(0,0,0,.15)",
            }}
          >
            {label}
          </Link>
        ))}
      </div>
    </main>
  );
}
