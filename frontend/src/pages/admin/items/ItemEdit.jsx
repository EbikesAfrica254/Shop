import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { UploadCloud, X } from "lucide-react";
import { toast } from "react-toastify";

const MAX_FILES = 4;
const MAX_SIZE = 1 * 1024 * 1024;

const emptyItem = {
  id: null,
  category: "",
  name: "",
  description: "",
  detail: "",
  price: "",
  discount: false,
  discountAmount: "",
  discountReason: "",
  suspended: false,
  stockUpdate: true,
  share_link: "",
  images: [],
};

export default function ItemEdit() {
  const { id } = useParams();
  const nav = useNavigate();

  const [item, setItem] = useState(emptyItem);
  const [files, setFiles] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    fetch(`/api/items/${id}`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setItem({ ...emptyItem, ...d }))
      .catch(() => setErr("Cannot load item"));
  }, [id]);

  const change = ({ target: { name, value, type, checked } }) => {
    setItem({ ...item, [name]: type === "checkbox" ? checked : value });
  };

  const addFiles = (e) => {
    const list = Array.from(e.target.files);
    e.target.value = null;
    if (list.length + files.length > MAX_FILES)
      return toast.error(`Max ${MAX_FILES} images`);
    if (list.some((f) => f.size > MAX_SIZE))
      return toast.error("Each image must be ≤ 1 MB");
    setFiles([...files, ...list]);
  };

  const removeFile = (i) => setFiles(files.filter((_, idx) => idx !== i));

  const clean = (o) => {
    const {
      id,
      images,
      share_link,
      created_at,
      discountAmount,
      discountReason,
      suspended,
      stockUpdate,
      ...c
    } = o;

    const cleaned = {
      ...c,
      suspended: Boolean(suspended),
      stock_update: Boolean(stockUpdate),
      discount_amount: c.discount ? parseFloat(discountAmount) || null : null,
      discount_reason: c.discount ? discountReason || null : null,
      share_link,
    };

    if (cleaned.price === "") cleaned.price = null;

    return cleaned;
  };

  const save = async () => {
    const hasFiles = files.length > 0;
    let body, headers;

    if (hasFiles) {
      body = new FormData();
      Object.entries(clean(item)).forEach(([k, v]) => body.append(k, v));
      files.forEach((f) => body.append("images", f));
    } else {
      body = JSON.stringify(clean(item));
      headers = { "Content-Type": "application/json" };
    }

    try {
      const r = await fetch(`/api/items/${id}`, {
        method: "PUT",
        body,
        headers,
        credentials: "include",
      });
      if (!r.ok) {
        const m = await r.json().catch(() => ({}));
        throw new Error(m.message || "Update failed");
      }
      toast.success("Saved");
      nav("/admin/items");
    } catch (e) {
      toast.error(e.message);
    }
  };

  const del = async () => {
    if (!window.confirm("Delete item?")) return;
    const r = await fetch(`/api/items/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (r.ok) {
      toast.success("Deleted");
      nav("/admin/items");
    } else {
      toast.error("Delete failed");
    }
  };

  if (err) return <p className="text-red-600">{err}</p>;
  if (!item.id) return <p>Loading…</p>;

  const serverImgs = item.images || [];
  const localImgs = files.map((f) => ({
    url: URL.createObjectURL(f),
    name: f.name,
  }));

  return (
    <div className="max-w-xl space-y-4">
      <h2 className="text-2xl font-bold">Edit Item #{id}</h2>

      <input name="category" value={item.category} onChange={change} className="input" />
      <input name="name" value={item.name} onChange={change} className="input" />
      <textarea
        name="description"
        value={item.description}
        onChange={change}
        rows={3}
        className="input"
      />
      <textarea
        name="detail"
        value={item.detail}
        onChange={change}
        rows={4}
        className="input"
      />
      <input
        type="number"
        name="price"
        value={item.price}
        onChange={change}
        className="input"
      />
      <input
        name="share_link"
        value={item.share_link}
        onChange={change}
        className="input"
        placeholder="Share link"
      />

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          name="discount"
          checked={item.discount}
          onChange={change}
        />
        Discount?
      </label>
      {item.discount && (
        <div className="grid sm:grid-cols-2 gap-2">
          <input
            type="number"
            name="discountAmount"
            value={item.discountAmount ?? ""}
            onChange={change}
            placeholder="Discount price"
            className="input"
          />
          <input
            name="discountReason"
            value={item.discountReason ?? ""}
            onChange={change}
            placeholder="Reason"
            className="input"
          />
        </div>
      )}

      <label className="flex gap-2 items-center">
        <input
          type="checkbox"
          name="suspended"
          checked={item.suspended}
          onChange={change}
        />
        Suspended
      </label>
      <label className="flex gap-2 items-center">
        <input
          type="checkbox"
          name="stockUpdate"
          checked={item.stockUpdate}
          onChange={change}
        />
        Update stock
      </label>

      <label className="flex items-center gap-2 cursor-pointer">
        <UploadCloud className="text-emerald-700" />
        <span>Add / replace images</span>
        <input hidden type="file" accept="image/*" multiple onChange={addFiles} />
      </label>

      <div className="grid grid-cols-3 gap-2">
        {serverImgs.map((u, i) => (
          <img key={i} src={u} alt="" className="h-24 w-24 object-cover rounded" />
        ))}
        {localImgs.map((t, i) => (
          <div key={i} className="relative">
            <img src={t.url} alt={t.name} className="h-24 w-24 object-cover rounded" />
            <button
              type="button"
              onClick={() => removeFile(i)}
              className="absolute -top-2 -right-2 bg-white rounded-full"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-4 mt-4">
        <button onClick={save} className="bg-emerald-700 text-white px-4 py-2 rounded">
          Save
        </button>
        <button onClick={del} className="bg-red-600 text-white px-4 py-2 rounded">
          Delete
        </button>
      </div>
    </div>
  );
}
