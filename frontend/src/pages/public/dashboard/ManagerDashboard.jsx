import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const links = [
    { to: "/admin/hr",        label: "Human-Resource Management" },
    { to: "/admin/items",     label: "Item Resource Management"  },
    { to: "/admin/stock",     label: "Stock Resource Management" },
    { to: "/admin/website",   label: "Website Management"        },
    { to: "/admin/analytics", label: "Analytics"                 },
  ];

  return (
    <div className="min-h-screen bg-emerald-50 flex flex-col items-center p-8">
      <h1 className="text-3xl font-extrabold text-emerald-700 mb-8">
        Admin Dashboard
      </h1>

      <div className="grid gap-6 w-full max-w-lg">
        {links.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className="block bg-white rounded-xl shadow-card px-6 py-4
                       text-center text-lg font-semibold text-emerald-700
                       hover:bg-emerald-100 transition"
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
