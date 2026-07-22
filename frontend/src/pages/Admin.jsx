import React, { useEffect, useState } from "react";
import { Routes, Route, Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth, API } from "@/contexts/AuthContext";
import axios from "axios";
import { toast } from "sonner";
import { LayoutDashboard, Package, ShoppingBag, Users, Percent, Settings as SettingsIcon, MessagesSquare, LogOut } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

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
    { to: "/admin/messages", label: "Messages", icon: MessagesSquare },
    { to: "/admin/settings", label: "Réglages", icon: SettingsIcon },
  ];
  return (
    <aside className="w-64 bg-nova-black text-nova-ivory min-h-screen p-6 flex flex-col" data-testid="admin-sidebar">
      <Link to="/" className="font-serif-display text-2xl mb-12">NOVA <span className="nova-gold">MILAN</span></Link>
      <nav className="flex flex-col gap-1 flex-1">
        {items.map(i => (
          <NavLink key={i.to} to={i.to} end={i.end} className={({ isActive }) => `flex items-center gap-3 px-3 py-2 text-sm rounded-sm ${isActive ? "bg-white/10 text-nova-gold" : "text-white/70 hover:bg-white/5"}`} data-testid={`admin-nav-${i.label.toLowerCase()}`}>
            <i.icon className="w-4 h-4" />{i.label}
          </NavLink>
        ))}
      </nav>
      <button onClick={() => { logout(); nav("/"); }} className="flex items-center gap-3 px-3 py-2 text-sm text-white/60 hover:text-white" data-testid="admin-logout"><LogOut className="w-4 h-4" />Se déconnecter</button>
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
      <h1 className="font-serif-display text-3xl mb-8">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
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

const Products = () => {
  const { headers } = useAdmin();
  const [products, setProducts] = useState([]);
  const load = () => axios.get(`${API}/products`).then(r => setProducts(r.data));
  useEffect(() => { load(); }, []);
  const del = async (id) => {
    if (!confirm("Supprimer ce produit ?")) return;
    await axios.delete(`${API}/admin/products/${id}`, { headers });
    toast.success("Supprimé"); load();
  };
  const [editing, setEditing] = useState(null);
  const save = async () => {
    await axios.put(`${API}/admin/products/${editing.id}`, editing, { headers });
    toast.success("Enregistré"); setEditing(null); load();
  };
  return (
    <div>
      <h1 className="font-serif-display text-3xl mb-8">Produits</h1>
      <div className="bg-white border">
        <table className="w-full text-sm">
          <thead className="border-b"><tr>
            <th className="text-left p-3">Nom</th><th className="text-left p-3">Prix</th>
            <th className="text-left p-3">Coloris</th><th className="text-left p-3">Actions</th>
          </tr></thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className="border-b" data-testid={`admin-product-${p.slug}`}>
                <td className="p-3">{p.name}</td>
                <td className="p-3">{p.price} €</td>
                <td className="p-3">{p.variants.length}</td>
                <td className="p-3 flex gap-4">
                  <button onClick={() => setEditing(p)} className="text-nova-gold underline text-xs">Modifier</button>
                  <button onClick={() => del(p.id)} className="text-red-600 underline text-xs">Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6" onClick={() => setEditing(null)}>
          <div className="bg-white p-8 max-w-lg w-full" onClick={e => e.stopPropagation()}>
            <p className="font-serif-display text-2xl mb-4">Modifier — {editing.name}</p>
            <label className="text-xs uppercase tracking-widest">Prix (EUR)</label>
            <input type="number" value={editing.price} onChange={e => setEditing({ ...editing, price: parseFloat(e.target.value) })} className="w-full border-b py-2 mb-4" />
            <label className="text-xs uppercase tracking-widest">Description</label>
            <textarea rows={4} value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} className="w-full border p-2 mb-4" />
            <button onClick={save} className="nova-btn">Enregistrer</button>
          </div>
        </div>
      )}
    </div>
  );
};

const Orders = () => {
  const { headers } = useAdmin();
  const [orders, setOrders] = useState([]);
  const load = () => axios.get(`${API}/admin/orders`, { headers }).then(r => setOrders(r.data));
  useEffect(() => { load(); }, []);
  const update = async (id, status, tracking = null) => {
    await axios.put(`${API}/admin/orders/${id}`, { status, tracking_number: tracking }, { headers });
    toast.success("Mis à jour"); load();
  };
  return (
    <div>
      <h1 className="font-serif-display text-3xl mb-8">Commandes</h1>
      <div className="bg-white border">
        <table className="w-full text-sm">
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
      <h1 className="font-serif-display text-3xl mb-8">Clients</h1>
      <div className="bg-white border">
        <table className="w-full text-sm">
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
  const load = () => axios.get(`${API}/admin/promos`, { headers }).then(r => setList(r.data));
  useEffect(() => { load(); }, []);
  const create = async (e) => { e.preventDefault(); await axios.post(`${API}/admin/promos`, form, { headers }); setForm({ code: "", percent_off: 10, active: true }); load(); toast.success("Créé"); };
  const del = async (id) => { await axios.delete(`${API}/admin/promos/${id}`, { headers }); load(); };
  return (
    <div>
      <h1 className="font-serif-display text-3xl mb-8">Promotions</h1>
      <form onSubmit={create} className="bg-white border p-6 mb-6 flex gap-4 items-end">
        <div><label className="text-xs uppercase">Code</label><input value={form.code} onChange={e => setForm({...form, code:e.target.value.toUpperCase()})} className="border-b py-1 block" required /></div>
        <div><label className="text-xs uppercase">% remise</label><input type="number" value={form.percent_off} onChange={e => setForm({...form, percent_off: parseFloat(e.target.value)})} className="border-b py-1 block" /></div>
        <button className="nova-btn">Créer</button>
      </form>
      <div className="bg-white border">
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
      <h1 className="font-serif-display text-3xl mb-8">Messages</h1>
      <div className="space-y-4">
        {list.map(m => (
          <div key={m.id} className="bg-white border p-6">
            <div className="flex justify-between mb-2">
              <p className="font-serif-display text-lg">{m.subject}</p>
              <p className="text-xs text-black/50">{new Date(m.created_at).toLocaleString()}</p>
            </div>
            <p className="text-sm text-black/60">{m.name} — {m.email}</p>
            <p className="mt-3 text-sm">{m.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const Settings = () => {
  const { headers } = useAdmin();
  const [s, setS] = useState({ ga_id: "", meta_pixel_id: "", tiktok_pixel_id: "" });
  useEffect(() => { axios.get(`${API}/admin/settings`, { headers }).then(r => setS({ ...s, ...r.data })); }, []);
  const save = async () => { await axios.put(`${API}/admin/settings`, s, { headers }); toast.success("Sauvegardé"); };
  return (
    <div>
      <h1 className="font-serif-display text-3xl mb-8">Réglages</h1>
      <div className="bg-white border p-6 max-w-xl space-y-6">
        <div><label className="text-xs uppercase">Google Analytics ID</label><input value={s.ga_id || ""} onChange={e => setS({...s, ga_id: e.target.value})} className="w-full border-b py-1" placeholder="G-XXXXXXXX" /></div>
        <div><label className="text-xs uppercase">Meta Pixel ID</label><input value={s.meta_pixel_id || ""} onChange={e => setS({...s, meta_pixel_id: e.target.value})} className="w-full border-b py-1" /></div>
        <div><label className="text-xs uppercase">TikTok Pixel ID</label><input value={s.tiktok_pixel_id || ""} onChange={e => setS({...s, tiktok_pixel_id: e.target.value})} className="w-full border-b py-1" /></div>
        <button onClick={save} className="nova-btn" data-testid="save-settings">Enregistrer</button>
      </div>
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
      <main className="flex-1 p-10 overflow-x-auto" data-testid="admin-main">
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="orders" element={<Orders />} />
          <Route path="customers" element={<Customers />} />
          <Route path="promos" element={<Promos />} />
          <Route path="messages" element={<Messages />} />
          <Route path="settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}
