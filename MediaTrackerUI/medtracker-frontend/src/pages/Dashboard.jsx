import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/auth/me")
      .then(res => setUser(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;

  if (!user) return <div>Unable to load user info.</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="text-sm font-semibold text-gray-500">User</h2>
          <p className="text-lg font-semibold mt-1">{user.displayName}</p>
          <p className="text-sm text-gray-600">{user.email}</p>
          <p className="text-xs text-gray-400 mt-1">Provider: {user.provider}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 md:col-span-2">
          <h2 className="text-sm font-semibold text-gray-500">
            App Overview
          </h2>
          <ul className="list-disc list-inside mt-2 text-sm text-gray-700">
            <li>Manage medicines with full CRUD.</li>
            <li>Search, sort, and paginate medicine list.</li>
            <li>Azure AD single sign-on with JWT-secured API.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
