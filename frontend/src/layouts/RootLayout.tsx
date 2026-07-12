import { Outlet, Link, useLocation } from "react-router-dom";

export function RootLayout() {
  const location = useLocation();

  const links = [
    { to: "/", label: "Home" },
    { to: "/run", label: "New Run" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b border-gray-200 bg-white">
        <nav className="mx-auto flex max-w-5xl items-center gap-6 px-4 py-3">
          <Link to="/" className="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors">
            AI Newsletter Agent
          </Link>
          <div className="flex gap-4">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                  location.pathname === link.to
                    ? "text-blue-600"
                    : "text-gray-500"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
