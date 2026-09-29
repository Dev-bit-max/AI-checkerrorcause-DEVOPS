import React from "react";
import { useLocation } from "react-router-dom";

const navLinks = [
  { label: "Overview",     href: "/" },
  { label: "Incidents",    href: "/incidents" },
  { label: "Analyze Logs", href: "/analyze" },
  { label: "Reports",      href: "/reports" },
];

function Navbar() {
  const { pathname } = useLocation();
  return (
    <nav className="sticky top-0 z-30 flex items-stretch justify-between bg-slate-900 px-8 shadow-lg">
      <div className="flex items-stretch gap-8">
        <div className="flex items-center py-4 mr-2">
          <span className="text-lg font-bold tracking-tight">
            <span className="text-blue-400">RootCause</span>
            <span className="text-white"> AI</span>
          </span>
        </div>
        <div className="flex items-stretch">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <a
                key={link.href}
                href={link.href}
                className={[
                  "flex items-center px-4 text-sm font-medium border-b-2 transition-colors",
                  active
                    ? "border-blue-400 text-white"
                    : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-600",
                ].join(" ")}
              >
                {link.label}
              </a>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
