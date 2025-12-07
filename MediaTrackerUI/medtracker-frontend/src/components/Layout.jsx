import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMsal } from "@azure/msal-react";

export default function Layout({ children }) {
  const { instance } = useMsal();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    instance.logoutPopup().then(() => navigate("/"));
  };

  const navItem = (to, label) => (
    <Link
      to={to}
      className={`px-3 py-2 rounded-md text-sm font-medium ${
        location.pathname === to
          ? "bg-blue-600 text-white"
          : "text-gray-700 hover:bg-gray-200"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <span className="text-lg font-semibold text-blue-700">
            MedTracker
          </span>
          <nav className="space-x-2">
            {navItem("/dashboard", "Dashboard")}
            {navItem("/medicines", "Medicines")}
            {navItem("/about", "About App")}
          </nav>
          <button
            onClick={handleLogout}
            className="text-sm px-3 py-1.5 rounded-md bg-red-500 text-white hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        {children}
      </main>
    </div>
  );
}
