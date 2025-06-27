import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function EmployeeEdit() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const [emp, set] = useState(null);
  const [err,setErr] = useState("");

  useEffect(() => {
    fetch(`/api/employees/${id}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(set)
      .catch(()=>setErr("Employee not found"));
  }, [id]);

  if(err)  return <p className="p-6 text-red-500">{err}</p>;
  if(!emp) return <p className="p-6">Loading…</p>;

  const handle = e => set({ ...emp, [e.target.name]: e.target.value });

  const save   = async e => {
    e.preventDefault();
    const r = await fetch(`/api/employees/${id}`, {
      method:"PUT",
      headers:{ "Content-Type":"application/json" },
      body:JSON.stringify(emp)
    });
    if(r.ok) navigate("/admin/hr");
    else setErr("Save failed");
  };

  return (
    <form onSubmit={save} className="p-6 space-y-4 max-w-lg">
      <h2 className="text-2xl font-bold">Edit Employee</h2>

      <input name="full_name"   value={emp.full_name}   onChange={handle} className="border p-2 w-full"/>
      <input name="id_number"   value={emp.id_number}   onChange={handle} className="border p-2 w-full"/>
      <input name="phone"       value={emp.phone}       onChange={handle} className="border p-2 w-full"/>
      <input name="email"       value={emp.email}       onChange={handle} className="border p-2 w-full"/>

      <select name="role" value={emp.role} onChange={handle} className="border p-2 w-full">
        <option value="pending">pending</option>
        <option value="admin">admin</option>
        <option value="manager">manager</option>
        <option value="cashier">cashier</option>
        <option value="employee">employee</option>
      </select>

      <label className="block">
        Suspended?
        <input type="checkbox"
               name="suspended"
               checked={!!emp.suspended}
               onChange={e => set({ ...emp, suspended: e.target.checked ? 1 : 0 })}
               className="ml-2"/>
      </label>

      {err && <p className="text-red-500">{err}</p>}

      <button className="px-4 py-2 bg-emerald-600 text-white rounded">Save</button>
    </form>
  );
}
