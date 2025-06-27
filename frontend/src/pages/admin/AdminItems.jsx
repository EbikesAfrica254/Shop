import { useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { PackagePlus, BarChartBig, Boxes, Trash2 } from "lucide-react";
import { toast } from "react-toastify";

const cards = [
  { to: "/admin/items/register",  Icon: PackagePlus, label: "Item Registration" },
  { to: "/admin/items/analytics", Icon: BarChartBig, label: "Item Analytics"    },
  { to: "/admin/items/stock",     Icon: Boxes,       label: "Item Stock"        },
];

export default function AdminItems() {
  const navigate = useNavigate();
  const [items, setItems] = useState(null); // null = loading
  const [err,   setErr]   = useState("");

  /* fetch once */
  useEffect(() => { fetchItems(); }, []);

  const fetchItems = () =>
    fetch("/api/items", { credentials: "include" })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setItems)
      .catch(() => { setErr("Could not load items"); setItems([]); });

  /* delete handler */
  const remove = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    const r = await fetch(`/api/items/${id}`, {
      method: "DELETE", credentials: "include"
    });
    if (r.ok) {
      toast.success("Item deleted");
      setItems(items.filter(it => it.id !== id));
    } else {
      toast.error("Delete failed");
    }
  };

  return (
    <>
      {/* ── nav cards ─────────────────────────────────── */}
      <h1 className="text-3xl font-bold text-emerald-700 mb-8">
        Item Management
      </h1>

      <div className="grid gap-6 mb-10 w-full max-w-4xl md:grid-cols-3">
        {cards.map(({ to, Icon, label }) => (
          <Link key={to} to={to}
            className="bg-white/90 backdrop-blur shadow-card rounded-xl p-6
                       flex flex-col items-center gap-4 hover:bg-emerald-50 transition">
            <Icon size={36} className="text-emerald-700" />
            <span className="font-semibold">{label}</span>
          </Link>
        ))}
      </div>

      {/* ── data grid ─────────────────────────────────── */}
      {err && <p className="text-red-600">{err}</p>}

      {items === null && !err && <p>Loading…</p>}

      {items?.length === 0 && !err && (
        <p className="text-slate-500 italic">No items yet.</p>
      )}

      {!!items?.length && (
        <div className="overflow-x-auto mb-12">
          <table className="min-w-full border">
            <thead className="bg-emerald-600 text-white">
              <tr>
                <th className="px-3 py-2">Image</th>
                <th className="px-3 py-2">Category</th>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Price</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}
                    onClick={() => navigate(`/admin/items/${it.id}`)}
                    className="even:bg-slate-50 cursor-pointer hover:bg-emerald-50">
                  <td className="px-3 py-2">
                    {it.image
                      ? <img src={it.image} alt={it.name}
                             className="h-12 w-12 object-cover rounded" />
                      : <span className="text-xs text-slate-400">n/a</span>}
                  </td>
                  <td className="px-3 py-2">{it.category}</td>
                  <td className="px-3 py-2">{it.name}</td>
                  <td className="px-3 py-2">
                    KES {Number(it.price).toLocaleString()}
                  </td>
                  <td className="px-3 py-2">
                    {it.suspended ? "Suspended" : "Active"}
                  </td>
                  {/* stop propagation so row click doesn’t fire */}
                  <td className="px-3 py-2"
                      onClick={(e) => { e.stopPropagation(); remove(it.id);} }>
                    <Trash2 size={18} className="text-red-600 hover:opacity-70"/>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* nested routes render here (register / analytics / stock / edit) */}
      <Outlet />
    </>
  );
}
