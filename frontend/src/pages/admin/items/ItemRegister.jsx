import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UploadCloud, X } from "lucide-react";
import { toast } from "react-toastify";

const MAX_FILES = 4;
const MAX_SIZE  = 1 * 1024 * 1024; // 1 MB

export default function ItemRegister() {
  const nav = useNavigate();

  const [form, set] = useState({
    category:"", name:"", description:"", detail:"",
    price:"", discount:false, discountAmount:"", discountReason:"",
    suspended:false, stockUpdate:true,
  });
  const [files, setFiles] = useState([]);
  const [err,   setErr]   = useState("");

  /* helpers */
  const toUpper = (v)=>v.replace(/\s+/g," ").trim().toUpperCase();
  const handle  = (e)=>{
    const {name,value,type,checked}=e.target;
    set({...form,[name]:type==="checkbox"?checked:value});
  };

  const handleFiles=(e)=>{
    const list=Array.from(e.target.files);
    if(list.length+files.length>MAX_FILES) return setErr("max 4 images");
    if(list.some(f=>f.size>MAX_SIZE))       return setErr("each ≤1 MB");
    setErr(""); setFiles([...files,...list]);
  };
  const removeFile=(i)=>setFiles(files.filter((_,idx)=>idx!==i));

  /* submit */
  const submit=async(e)=>{
    e.preventDefault();
    const payload={...form,
      category:toUpper(form.category),
      name:    toUpper(form.name)
    };
    if(payload.discount && !payload.discountAmount)
      return setErr("enter discount amount");

    const data=new FormData();
    Object.entries(payload).forEach(([k,v])=>data.append(k,v));
    files.forEach(f=>data.append("images",f));

    try{
      const r=await fetch("/api/items",{method:"POST",body:data,credentials:"include"});
      const d=await r.json();
      if(!r.ok) throw new Error(d.message||"Error");

      /* ✅ success */
      toast.success("Item saved!",{autoClose:1500});
      // Optional: you can keep d.share in state if you want to copy it before redirect
      setTimeout(()=>nav("/admin/items"),1600);

    }catch(e){ setErr(e.message); }
  };

  /* thumbs for preview */
  const thumbs=files.map(f=>({name:f.name,url:URL.createObjectURL(f)}));

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-emerald-700">Register New Item</h1>

      {err && <p className="text-red-600">{err}</p>}

      {/* preview grid */}
      {!!thumbs.length && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          {thumbs.map((t,i)=>(
            <div key={i} className="relative">
              <img src={t.url} alt={t.name}
                   className="h-24 w-24 object-cover rounded"/>
              <button type="button" onClick={()=>removeFile(i)}
                      className="absolute -top-2 -right-2 bg-white rounded-full">
                <X size={14}/>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* form */}
      <form onSubmit={submit} className="space-y-4">
        {/* basic fields */}
        <input name="category" value={form.category} onChange={handle}
               placeholder="Item category" required className="input" />
        <input name="name" value={form.name} onChange={handle}
               placeholder="Item name" required className="input" />
        <textarea name="description" value={form.description} onChange={handle}
                  placeholder="Short description" rows={2} required className="input" />
        <textarea name="detail" value={form.detail} onChange={handle}
                  placeholder="Detailed info" rows={4} className="input" />
        <input type="number" name="price" value={form.price} onChange={handle}
               placeholder="Price (KES)" required className="input" />

        {/* discount toggle */}
        <label className="flex items-center gap-2">
          <input type="checkbox" name="discount" checked={form.discount} onChange={handle}/>
          Discount?
        </label>
        {form.discount && (
          <div className="grid sm:grid-cols-2 gap-2">
            <input type="number" name="discountAmount" value={form.discountAmount}
                   onChange={handle} placeholder="Discounted price" className="input" />
            <input name="discountReason" value={form.discountReason}
                   onChange={handle} placeholder="Reason (optional)" className="input" />
          </div>
        )}

        {/* image selector */}
        <label className="flex items-center gap-2 cursor-pointer">
          <UploadCloud className="text-emerald-700"/>
          <span>Upload images (≤4, ≤1 MB)</span>
          <input hidden type="file" accept="image/*" multiple onChange={handleFiles}/>
        </label>

        {/* toggles */}
        <div className="flex flex-col sm:flex-row gap-4">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="suspended" checked={form.suspended} onChange={handle}/>
            Suspend item
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="stockUpdate" checked={form.stockUpdate} onChange={handle}/>
            Update stock after save
          </label>
        </div>

        <button className="bg-emerald-700 text-white py-2 px-4 rounded w-full sm:w-auto">
          Save item
        </button>
      </form>
    </div>
  );
}

/* tailwind utility once: */
const input = "border p-2 w-full";
