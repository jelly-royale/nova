import React, { useEffect, useState, useRef, useCallback } from "react";
import { Routes, Route, Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth, API } from "@/contexts/AuthContext";
import axios from "axios";
import { toast } from "sonner";
import { LayoutDashboard, Package, ShoppingBag, Users, Percent, Settings as SettingsIcon, MessagesSquare, Image as ImageIcon, LogOut, Upload, Trash2, Plus, X, GripVertical } from "lucide-react";

const useAdmin = () => {
  const { user, token, loading, logout } = useAuth();
  const nav = useNavigate();
  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) nav("/login");
  }, [loading, user, nav]);
  return { user, token, logout, headers: { Authorization: `Bearer ${token}` } };
};

const Sidebar = () => {
  const { logout } = useAuth();
  const nav = useNavigate();
  const items = [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/admin/products", label: "Produits", icon: Package },
    { to: "/admin/orders", label: "Commandes", icon: ShoppingBag },
    { to: "/admin/customers", label: "Clients", icon: Users },
    { to: "/admin/promos", label: "Promotions", icon: Percent },
    { to: "/admin/media", label: "Médias", icon: ImageIcon },
    { to: "/admin/messages", label: "Messages", icon: MessagesSquare },
    { to: "/admin/settings", label: "Réglages", icon: SettingsIcon },
  ];
  return (
    <aside className="w-56 lg:w-64 bg-nova-black text-nova-ivory min-h-screen p-4 lg:p-6 flex flex-col sticky top-0" data-testid="admin-sidebar">
      <Link to="/" className="font-serif-display text-xl lg:text-2xl mb-8 lg:mb-12">NOVA <span className="nova-gold">MILAN</span></Link>
      <nav className="flex flex-col gap-1 flex-1">
        {items.map(i => (
          <NavLink key={i.to} to={i.to} end={i.end} className={({ isActive }) => `flex items-center gap-3 px-3 py-2 text-sm rounded-sm ${isActive ? "bg-white/10 text-nova-gold" : "text-white/70 hover:bg-white/5"}`} data-testid={`admin-nav-${i.label.toLowerCase()}`}>
            <i.icon className="w-4 h-4" /><span>{i.label}</span>
          </NavLink>
        ))}
      </nav>
      <button onClick={() => { logout(); nav("/"); }} className="flex items-center gap-3 px-3 py-2 text-sm text-white/60 hover:text-white" data-testid="admin-logout"><LogOut className="w-4 h-4" />Déconnexion</button>
    </aside>
  );
};

const Dashboard = () => {
  const { headers } = useAdmin();
  const [data, setData] = useState(null);
  useEffect(() => { axios.get(`${API}/admin/analytics`, { headers }).then(r => setData(r.data)); }, []);
  if (!data) return <div>…</div>;
  const cards = [
    { label: "Chiffre d'affaires", v: `${data.revenue.toFixed(0)} €` },
    { label: "Commandes payées", v: data.paid_orders },
    { label: "Commandes totales", v: data.total_orders },
    { label: "Clients", v: data.customers },
    { label: "Produits", v: data.products },
  ];
  return (
    <div>
      <h1 className="font-serif-display text-2xl md:text-3xl mb-8">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-10">
        {cards.map(c => (
          <div key={c.label} className="bg-white border p-6" data-testid={`stat-${c.label}`}>
            <p className="text-xs uppercase tracking-widest text-black/50">{c.label}</p>
            <p className="font-serif-display text-3xl mt-2">{c.v}</p>
          </div>
        ))}
      </div>
      <div className="bg-white border p-6">
        <p className="font-serif-display text-lg mb-4">Top produits</p>
        {data.top_products.length === 0 ? <p className="text-sm text-black/50">Aucune vente encore.</p> :
          <ul className="space-y-2 text-sm">
            {data.top_products.map((p, i) => <li key={i} className="flex justify-between border-b py-2"><span>{p._id}</span><span>{p.qty} vendus — {p.revenue.toFixed(2)} €</span></li>)}
          </ul>}
      </div>
    </div>
  );
};

// ---------- Media Library ----------
const MediaLibrary = ({ pickerMode = false, onPick = null }) => {
  const { headers, token } = useAdmin();
  const [items, setItems] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const load = useCallback(() => {
    axios.get(`${API}/admin/media`, { headers }).then(r => setItems(r.data));
  }, []);
  useEffect(() => { load(); }, [load]);

  const upload = async (files) => {
    setUploading(true);
    for (const f of files) {
      const fd = new FormData();
      fd.append("file", f);
      try {
        await axios.post(`${API}/admin/media/upload`, fd, { headers: { ...headers, "Content-Type": "multipart/form-data" } });
      } catch (e) { toast.error(`${f.name} : ${e.response?.data?.detail || "erreur"}`); }
    }
    setUploading(false);
    toast.success("Fichiers importés");
    load();
  };

  const remove = async (id) => {
    if (!confirm("Supprimer ce média ?")) return;
    await axios.delete(`${API}/admin/media/${id}`, { headers });
    toast.success("Supprimé"); load();
  };

  const fullUrl = (u) => u.startsWith("http") ? u : `${process.env.REACT_APP_BACKEND_URL}${u}`;

  return (
    <div>
      {!pickerMode && <h1 className="font-serif-display text-2xl md:text-3xl mb-6">Bibliothèque média</h1>}
      <div className="flex items-center gap-4 mb-6">
        <input ref={fileRef} type="file" multiple accept="image/*" hidden onChange={e => upload(Array.from(e.target.files))} data-testid="media-file-input" />
        <button onClick={() => fileRef.current?.click()} disabled={uploading} className="nova-btn flex items-center gap-2" data-testid="media-upload-btn">
          <Upload className="w-4 h-4" /> {uploading ? "Import…" : "Importer des images"}
        </button>
        <p className="text-xs text-black/50">JPG, PNG, WEBP, GIF, AVIF</p>
      </div>
      {items.length === 0 ? (
        <div className="border-2 border-dashed border-black/20 p-16 text-center text-black/50">
          Aucun média. Importez vos premières images.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {items.map(m => (
            <div key={m.id} className="group relative border bg-white" data-testid={`media-${m.id}`}>
              <div className="aspect-square overflow-hidden bg-nova-soft">
                <img src={fullUrl(m.url)} alt={m.original_name} className="w-full h-full object-cover" />
              </div>
              <div className="p-2 text-xs">
                <p className="truncate">{m.original_name}</p>
                <p className="text-black/40">{(m.size / 1024).toFixed(0)} Ko</p>
              </div>
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                {pickerMode && (
                  <button onClick={() => onPick(fullUrl(m.url))} className="bg-white text-black px-3 py-2 text-xs uppercase tracking-widest" data-testid={`pick-${m.id}`}>Sélectionner</button>
                )}
                <button onClick={() => { navigator.clipboard.writeText(fullUrl(m.url)); toast.success("URL copiée"); }} className="text-white text-xs uppercase tracking-widest">Copier URL</button>
                <button onClick={() => remove(m.id)} className="text-red-300 text-xs uppercase tracking-widest flex items-center gap-1" data-testid={`delete-media-${m.id}`}><Trash2 className="w-3 h-3" /> Supprimer</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ---------- Products ----------
const ProductEditor = ({ product, onClose, onSaved }) => {
  const { headers } = useAdmin();
  const [form, setForm] = useState({ ...product });
  const [showPicker, setShowPicker] = useState(false);
  const [pickerFor, setPickerFor] = useState({ type: "main" }); // 'main' or variant index
  const isNew = !product.id;

  const save = async () => {
    try {
      if (isNew) {
        await axios.post(`${API}/admin/products`, form, { headers });
      } else {
        await axios.put(`${API}/admin/products/${form.id}`, form, { headers });
      }
      toast.success("Enregistré");
      onSaved();
    } catch (e) { toast.error(e.response?.data?.detail || "Erreur"); }
  };

  const addImage = (url) => {
    if (pickerFor.type === "main") {
      setForm({ ...form, images: [...(form.images || []), url] });
    } else {
      const variants = [...form.variants];
      variants[pickerFor.idx] = { ...variants[pickerFor.idx], image: url };
      setForm({ ...form, variants });
    }
    setShowPicker(false);
  };

  const removeImage = (idx) => {
    setForm({ ...form, images: form.images.filter((_, i) => i !== idx) });
  };

  const moveImage = (idx, dir) => {
    const imgs = [...form.images];
    const t = idx + dir;
    if (t < 0 || t >= imgs.length) return;
    [imgs[idx], imgs[t]] = [imgs[t], imgs[idx]];
    setForm({ ...form, images: imgs });
  };

  const addVariant = () => {
    setForm({ ...form, variants: [...(form.variants || []), { color_key: "", color_name: "", hex: "#cccccc", stock: 20, image: null }] });
  };
  const updateVariant = (i, key, val) => {
    const variants = [...form.variants];
    variants[i] = { ...variants[i], [key]: val };
    setForm({ ...form, variants });
  };
  const removeVariant = (i) => {
    setForm({ ...form, variants: form.variants.filter((_, k) => k !== i) });
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 overflow-y-auto p-4 md:p-8" onClick={onClose}>
      <div className="bg-white max-w-4xl mx-auto p-6 md:p-10" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <p className="font-serif-display text-2xl">{isNew ? "Nouveau produit" : `Modifier — ${form.name}`}</p>
          <button onClick={onClose} data-testid="close-editor"><X className="w-5 h-5" /></button>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="text-xs uppercase tracking-widest">Nom</label>
            <input value={form.name || ""} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full border-b py-2" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest">Slug (URL)</label>
            <input value={form.slug || ""} onChange={e => setForm({ ...form, slug: e.target.value })} className="w-full border-b py-2" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest">Catégorie</label>
            <input value={form.category || "sacs"} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full border-b py-2" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest">Prix (EUR)</label>
            <input type="number" step="0.01" value={form.price || 0} onChange={e => setForm({ ...form, price: parseFloat(e.target.value) })} className="w-full border-b py-2" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest">Matière</label>
            <input value={form.material || ""} onChange={e => setForm({ ...form, material: e.target.value })} className="w-full border-b py-2" />
          </div>
          <div className="flex items-center gap-6 pt-4">
            <label className="text-xs uppercase tracking-widest flex items-center gap-2">
              <input type="checkbox" checked={form.featured || false} onChange={e => setForm({ ...form, featured: e.target.checked })} /> Signature
            </label>
            <label className="text-xs uppercase tracking-widest flex items-center gap-2">
              <input type="checkbox" checked={form.active !== false} onChange={e => setForm({ ...form, active: e.target.checked })} /> Actif
            </label>
          </div>
        </div>

        <div className="mb-6">
          <label className="text-xs uppercase tracking-widest">Description</label>
          <textarea rows={4} value={form.description || ""} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full border p-2 mt-1" />
        </div>

        {/* IMAGES */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs uppercase tracking-widest">Galerie produit</p>
            <button onClick={() => { setPickerFor({ type: "main" }); setShowPicker(true); }} className="text-xs uppercase tracking-widest flex items-center gap-1 hover:text-nova-gold" data-testid="add-image-btn">
              <Plus className="w-3 h-3" /> Ajouter une image
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(form.images || []).map((img, i) => (
              <div key={i} className="relative group border">
                <div className="aspect-square bg-nova-soft overflow-hidden">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </div>
                {i === 0 && <span className="absolute top-1 left-1 bg-nova-black text-nova-ivory text-[9px] px-2 py-0.5">PRINCIPALE</span>}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                  <button onClick={() => moveImage(i, -1)} className="text-white text-xs">←</button>
                  <button onClick={() => moveImage(i, 1)} className="text-white text-xs">→</button>
                  <button onClick={() => removeImage(i)} className="text-red-300"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-black/50 mt-2">La première image est l'image principale. Glissez pour réordonner.</p>
        </div>

        {/* VARIANTS */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs uppercase tracking-widest">Coloris / variantes</p>
            <button onClick={addVariant} className="text-xs uppercase tracking-widest flex items-center gap-1 hover:text-nova-gold"><Plus className="w-3 h-3" /> Ajouter</button>
          </div>
          <div className="space-y-2">
            {(form.variants || []).map((v, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-6 gap-2 items-center border p-3">
                <input placeholder="clé (ex: citron)" value={v.color_key} onChange={e => updateVariant(i, "color_key", e.target.value)} className="border-b py-1 text-sm" />
                <input placeholder="Nom (Jaune Citron)" value={v.color_name} onChange={e => updateVariant(i, "color_name", e.target.value)} className="border-b py-1 text-sm md:col-span-2" />
                <div className="flex items-center gap-2">
                  <input type="color" value={v.hex} onChange={e => updateVariant(i, "hex", e.target.value)} className="w-8 h-8 border" />
                  <input value={v.hex} onChange={e => updateVariant(i, "hex", e.target.value)} className="border-b py-1 text-xs w-20" />
                </div>
                <input type="number" placeholder="stock" value={v.stock} onChange={e => updateVariant(i, "stock", parseInt(e.target.value))} className="border-b py-1 text-sm w-20" />
                <button onClick={() => removeVariant(i)} className="text-red-600 text-xs justify-self-end"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={save} className="nova-btn" data-testid="save-product">Enregistrer</button>
          <button onClick={onClose} className="nova-btn-outline">Annuler</button>
        </div>

        {showPicker && (
          <div className="fixed inset-0 bg-black/70 z-[60] overflow-y-auto p-4" onClick={() => setShowPicker(false)}>
            <div className="bg-white max-w-5xl mx-auto p-6" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between mb-4">
                <p className="font-serif-display text-xl">Choisir un média</p>
                <button onClick={() => setShowPicker(false)}><X className="w-5 h-5" /></button>
              </div>
              <MediaLibrary pickerMode onPick={addImage} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Products = () => {
  const { headers } = useAdmin();
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null);
  const load = useCallback(() => axios.get(`${API}/products`).then(r => setProducts(r.data)), []);
  useEffect(() => { load(); }, [load]);

  const del = async (id) => {
    if (!confirm("Supprimer ce produit ?")) return;
    await axios.delete(`${API}/admin/products/${id}`, { headers });
    toast.success("Supprimé"); load();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-serif-display text-2xl md:text-3xl">Produits</h1>
        <button
          className="nova-btn flex items-center gap-2"
          onClick={() => setEditing({ name: "", slug: "", category: "sacs", price: 0, description: "", material: "", images: [], variants: [], active: true, featured: false })}
          data-testid="new-product-btn"
        >
          <Plus className="w-4 h-4" /> Nouveau produit
        </button>
      </div>
      <div className="bg-white border overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead className="border-b"><tr>
            <th className="text-left p-3">Image</th>
            <th className="text-left p-3">Nom</th><th className="text-left p-3">Prix</th>
            <th className="text-left p-3">Coloris</th><th className="text-left p-3">Statut</th><th className="text-left p-3">Actions</th>
          </tr></thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className="border-b" data-testid={`admin-product-${p.slug}`}>
                <td className="p-3"><div className="w-12 h-12 bg-nova-soft overflow-hidden">{p.images?.[0] && <img src={p.images[0]} alt="" className="w-full h-full object-cover" />}</div></td>
                <td className="p-3 font-serif-display">{p.name}</td>
                <td className="p-3">{p.price} €</td>
                <td className="p-3">{p.variants?.length || 0}</td>
                <td className="p-3">{p.active ? <span className="text-green-700">Actif</span> : <span className="text-black/40">Masqué</span>}</td>
                <td className="p-3 flex gap-3">
                  <button onClick={() => setEditing(p)} className="text-nova-gold underline text-xs" data-testid={`edit-${p.slug}`}>Modifier</button>
                  <button onClick={() => del(p.id)} className="text-red-600 underline text-xs">Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editing && <ProductEditor product={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}
    </div>
  );
};

const Orders = () => {
  const { headers } = useAdmin();
  const [orders, setOrders] = useState([]);
  const load = useCallback(() => axios.get(`${API}/admin/orders`, { headers }).then(r => setOrders(r.data)), []);
  useEffect(() => { load(); }, [load]);
  const update = async (id, status, tracking = null) => {
    await axios.put(`${API}/admin/orders/${id}`, { status, tracking_number: tracking }, { headers });
    toast.success("Mis à jour"); load();
  };
  return (
    <div>
      <h1 className="font-serif-display text-2xl md:text-3xl mb-8">Commandes</h1>
      <div className="bg-white border overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead className="border-b"><tr>
            <th className="text-left p-3">N°</th><th className="text-left p-3">Email</th>
            <th className="text-left p-3">Total</th><th className="text-left p-3">Paiement</th>
            <th className="text-left p-3">Statut</th><th className="text-left p-3">Actions</th>
          </tr></thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id} className="border-b">
                <td className="p-3">{o.order_number}</td>
                <td className="p-3">{o.email}</td>
                <td className="p-3">{o.total.toFixed(2)} €</td>
                <td className="p-3"><span className={o.payment_status === "paid" ? "text-green-700" : "text-black/50"}>{o.payment_status}</span></td>
                <td className="p-3">{o.status}</td>
                <td className="p-3">
                  <select defaultValue={o.status} onChange={e => update(o.id, e.target.value)} className="border px-2 py-1 text-xs">
                    {["pending","paid","preparing","shipped","delivered","cancelled"].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Customers = () => {
  const { headers } = useAdmin();
  const [list, setList] = useState([]);
  useEffect(() => { axios.get(`${API}/admin/customers`, { headers }).then(r => setList(r.data)); }, []);
  return (
    <div>
      <h1 className="font-serif-display text-2xl md:text-3xl mb-8">Clients</h1>
      <div className="bg-white border overflow-x-auto">
        <table className="w-full text-sm min-w-[500px]">
          <thead className="border-b"><tr><th className="text-left p-3">Nom</th><th className="text-left p-3">Email</th><th className="text-left p-3">Inscription</th></tr></thead>
          <tbody>{list.map(c => <tr key={c.id} className="border-b"><td className="p-3">{c.first_name} {c.last_name}</td><td className="p-3">{c.email}</td><td className="p-3">{new Date(c.created_at).toLocaleDateString()}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
};

const Promos = () => {
  const { headers } = useAdmin();
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ code: "", percent_off: 10, active: true });
  const load = useCallback(() => axios.get(`${API}/admin/promos`, { headers }).then(r => setList(r.data)), []);
  useEffect(() => { load(); }, [load]);
  const create = async (e) => { e.preventDefault(); await axios.post(`${API}/admin/promos`, form, { headers }); setForm({ code: "", percent_off: 10, active: true }); load(); toast.success("Créé"); };
  const del = async (id) => { await axios.delete(`${API}/admin/promos/${id}`, { headers }); load(); };
  return (
    <div>
      <h1 className="font-serif-display text-2xl md:text-3xl mb-8">Promotions</h1>
      <form onSubmit={create} className="bg-white border p-4 md:p-6 mb-6 flex flex-wrap gap-4 items-end">
        <div><label className="text-xs uppercase">Code</label><input value={form.code} onChange={e => setForm({...form, code:e.target.value.toUpperCase()})} className="border-b py-1 block" required /></div>
        <div><label className="text-xs uppercase">% remise</label><input type="number" value={form.percent_off} onChange={e => setForm({...form, percent_off: parseFloat(e.target.value)})} className="border-b py-1 block w-24" /></div>
        <button className="nova-btn">Créer</button>
      </form>
      <div className="bg-white border overflow-x-auto">
        <table className="w-full text-sm"><thead className="border-b"><tr><th className="text-left p-3">Code</th><th className="text-left p-3">%</th><th className="text-left p-3">Actif</th><th></th></tr></thead>
          <tbody>{list.map(p => <tr key={p.id} className="border-b"><td className="p-3">{p.code}</td><td className="p-3">{p.percent_off}%</td><td className="p-3">{p.active ? "✓" : "—"}</td><td className="p-3"><button onClick={() => del(p.id)} className="text-red-600 text-xs">Supprimer</button></td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
};

const Messages = () => {
  const { headers } = useAdmin();
  const [list, setList] = useState([]);
  useEffect(() => { axios.get(`${API}/admin/contacts`, { headers }).then(r => setList(r.data)); }, []);
  return (
    <div>
      <h1 className="font-serif-display text-2xl md:text-3xl mb-8">Messages</h1>
      <div className="space-y-4">
        {list.length === 0 && <p className="text-sm text-black/50">Aucun message.</p>}
        {list.map(m => (
          <div key={m.id} className="bg-white border p-6">
            <div className="flex justify-between mb-2 flex-wrap gap-2">
              <p className="font-serif-display text-lg">{m.subject}</p>
              <p className="text-xs text-black/50">{new Date(m.created_at).toLocaleString()}</p>
            </div>
            <p className="text-sm text-black/60">{m.name} — {m.email}</p>
            <p className="mt-3 text-sm whitespace-pre-wrap">{m.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const Settings = () => {
  const { headers } = useAdmin();
  const [s, setS] = useState({ ga_id: "", meta_pixel_id: "", tiktok_pixel_id: "", company_info: { name: "", address: "", siret: "", email: "" } });
  useEffect(() => {
    axios.get(`${API}/admin/settings`, { headers }).then(r => {
      const d = r.data || {};
      setS({
        ga_id: d.ga_id || "", meta_pixel_id: d.meta_pixel_id || "", tiktok_pixel_id: d.tiktok_pixel_id || "",
        company_info: { name: "", address: "", siret: "", email: "", ...(d.company_info || {}) },
      });
    });
  }, []);
  const save = async () => { await axios.put(`${API}/admin/settings`, s, { headers }); toast.success("Sauvegardé"); };
  const setCompany = (k, v) => setS(prev => ({ ...prev, company_info: { ...prev.company_info, [k]: v } }));
  return (
    <div>
      <h1 className="font-serif-display text-2xl md:text-3xl mb-8">Réglages</h1>

      <div className="bg-white border p-6 max-w-2xl space-y-6 mb-8">
        <p className="font-serif-display text-lg">Analytics (public)</p>
        <div><label className="text-xs uppercase">Google Analytics ID</label><input value={s.ga_id || ""} onChange={e => setS({...s, ga_id: e.target.value})} className="w-full border-b py-1" placeholder="G-XXXXXXXX" /></div>
        <div><label className="text-xs uppercase">Meta Pixel ID</label><input value={s.meta_pixel_id || ""} onChange={e => setS({...s, meta_pixel_id: e.target.value})} className="w-full border-b py-1" /></div>
        <div><label className="text-xs uppercase">TikTok Pixel ID</label><input value={s.tiktok_pixel_id || ""} onChange={e => setS({...s, tiktok_pixel_id: e.target.value})} className="w-full border-b py-1" /></div>
      </div>

      <div className="bg-white border p-6 max-w-2xl space-y-6 mb-8">
        <div>
          <p className="font-serif-display text-lg">Informations société (privé)</p>
          <p className="text-xs text-black/50 mt-1">🔒 Ces informations restent confidentielles et ne s'affichent JAMAIS sur le site public. Elles sont conservées pour vos obligations légales internes.</p>
        </div>
        <div><label className="text-xs uppercase">Nom entreprise</label><input value={s.company_info.name} onChange={e => setCompany("name", e.target.value)} className="w-full border-b py-1" /></div>
        <div><label className="text-xs uppercase">Adresse</label><input value={s.company_info.address} onChange={e => setCompany("address", e.target.value)} className="w-full border-b py-1" /></div>
        <div><label className="text-xs uppercase">SIRET / RCS</label><input value={s.company_info.siret} onChange={e => setCompany("siret", e.target.value)} className="w-full border-b py-1" /></div>
        <div><label className="text-xs uppercase">Email contact</label><input value={s.company_info.email} onChange={e => setCompany("email", e.target.value)} className="w-full border-b py-1" /></div>
      </div>

      <button onClick={save} className="nova-btn" data-testid="save-settings">Enregistrer</button>
    </div>
  );
};

export default function Admin() {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-24 text-center">…</div>;
  if (!user || user.role !== "admin") {
    return (
      <div className="max-w-md mx-auto py-24 text-center">
        <p className="mb-6">Accès administrateur requis.</p>
        <Link to="/login" className="nova-btn" data-testid="admin-login-required">Se connecter</Link>
      </div>
    );
  }
  return (
    <div className="flex bg-nova-soft min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 md:p-10 overflow-x-auto" data-testid="admin-main">
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="orders" element={<Orders />} />
          <Route path="customers" element={<Customers />} />
          <Route path="promos" element={<Promos />} />
          <Route path="media" element={<MediaLibrary />} />
          <Route path="messages" element={<Messages />} />
          <Route path="settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}
