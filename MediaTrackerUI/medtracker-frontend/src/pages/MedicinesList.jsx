import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

export default function MedicinesList() {
  const [data, setData] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [sortBy, setSortBy] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [loading, setLoading] = useState(false);

  const fetchData = () => {
    setLoading(true);
    const params = new URLSearchParams({
      page,
      pageSize,
      search,
      sortBy,
      sortDirection,
    }).toString();

    api.get(`/api/medicines?${params}`)
      .then(res => setData(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(fetchData, [page, search, sortBy, sortDirection]);

  const handleDelete = (id) => {
    if (!confirm("Are you sure you want to delete this medicine?")) return;
    api.delete(`/api/medicines/${id}`).then(fetchData);
  };

  const toggleSort = (column) => {
    if (sortBy === column) {
      setSortDirection(d => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortDirection("asc");
    }
  };

  const renderSortIcon = (column) => {
    if (sortBy !== column) return null;
    return sortDirection === "asc" ? "▲" : "▼";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Medicines</h1>
        <Link
          to="/medicines/add"
          className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700"
        >
          + Add Medicine
        </Link>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <input
          type="text"
          className="border rounded-md px-3 py-2 w-full md:w-64"
          placeholder="Search by name or company..."
          value={search}
          onChange={e => { setPage(1); setSearch(e.target.value); }}
        />
        {loading && <span className="text-sm text-gray-500">Loading...</span>}
      </div>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-4 py-2 cursor-pointer" onClick={() => toggleSort("name")}>
                Name {renderSortIcon("name")}
              </th>
              <th className="text-left px-4 py-2 cursor-pointer" onClick={() => toggleSort("company")}>
                Company {renderSortIcon("company")}
              </th>
              <th className="text-right px-4 py-2 cursor-pointer" onClick={() => toggleSort("price")}>
                Price {renderSortIcon("price")}
              </th>
              <th className="text-left px-4 py-2 cursor-pointer" onClick={() => toggleSort("expirydate")}>
                Expiry Date {renderSortIcon("expirydate")}
              </th>
              <th className="text-right px-4 py-2 cursor-pointer" onClick={() => toggleSort("stock")}>
                Stock {renderSortIcon("stock")}
              </th>
              <th className="text-center px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.items?.length ? (
              data.items.map(m => (
                <tr key={m.medicineId} className="border-t">
                  <td className="px-4 py-2">{m.name}</td>
                  <td className="px-4 py-2">{m.company}</td>
                  <td className="px-4 py-2 text-right">₹{m.price.toFixed(2)}</td>
                  <td className="px-4 py-2">
                    {new Date(m.expiryDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 text-right">{m.stock}</td>
                  <td className="px-4 py-2 text-center space-x-2">
                    <Link
                      to={`/medicines/edit/${m.medicineId}`}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(m.medicineId)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-4 py-4 text-center text-gray-500" colSpan={6}>
                  No medicines found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {data && (
        <div className="flex items-center justify-between mt-4 text-sm text-gray-700">
          <span>
            Page {data.page} of {Math.ceil(data.totalCount / data.pageSize) || 1}
          </span>
          <div className="space-x-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Previous
            </button>
            <button
              disabled={data.page * data.pageSize >= data.totalCount}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
