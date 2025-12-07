import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";

export default function MedicineForm({ mode }) {
  const isEdit = mode === "edit";
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    company: "",
    price: "",
    expiryDate: "",
    stock: "",
  });
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit && id) {
      api.get(`/api/medicines/${id}`).then(res => {
        const m = res.data;
        setForm({
          name: m.name,
          company: m.company,
          price: m.price,
          expiryDate: m.expiryDate.substring(0, 10),
          stock: m.stock,
        });
        setLoading(false);
      });
    }
  }, [isEdit, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      name: form.name,
      company: form.company,
      price: parseFloat(form.price),
      expiryDate: new Date(form.expiryDate).toISOString(),
      stock: parseInt(form.stock, 10),
    };

    const request = isEdit
      ? api.put(`/api/medicines/${id}`, payload)
      : api.post("/api/medicines", payload);

    request
      .then(() => navigate("/medicines"))
      .finally(() => setSaving(false));
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold mb-4">
        {isEdit ? "Edit Medicine" : "Add Medicine"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded-xl shadow">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Company</label>
          <input
            name="company"
            value={form.company}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Price</label>
            <input
              type="number"
              step="0.01"
              name="price"
              value={form.price}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Stock</label>
            <input
              type="number"
              name="stock"
              value={form.stock}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Expiry Date</label>
          <input
            type="date"
            name="expiryDate"
            value={form.expiryDate}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate("/medicines")}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded bg-blue-600 text-white font-semibold disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
