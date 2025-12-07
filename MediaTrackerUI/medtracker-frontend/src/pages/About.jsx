export default function About() {
  return (
    <div className="max-w-2xl space-y-3">
      <h1 className="text-2xl font-bold mb-2">About MedTracker</h1>
      <p className="text-sm text-gray-700">
        MedTracker is a sample .NET 8 + React application demonstrating:
      </p>
      <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
        <li>Azure AD Single Sign-On (OpenID Connect / OAuth 2.0).</li>
        <li>JWT-protected minimal API backend with EF Core + SQL Server.</li>
        <li>Medicines management with full CRUD, search, sorting, and pagination.</li>
        <li>Login history and user tracking in the database.</li>
        <li>Tailwind CSS responsive UI.</li>
      </ul>
    </div>
  );
}
