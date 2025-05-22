
import { ReactNode } from "react";

const Layout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen bg-gray-100 flex flex-col">
    <header className="bg-white shadow py-4 px-6 flex items-center justify-between z-30 relative">
      <span className="text-lg sm:text-2xl font-bold text-emerald-700 tracking-wide">
        <a href="/" className="hover:text-emerald-900 transition-colors">Wongnok recipes</a>
      </span>
      <nav>
        <a href="#" className="text-emerald-700 font-semibold px-3 py-2 hover:text-emerald-900 transition-colors rounded">Login</a>
        <a href="#" className="ml-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2 rounded transition">Register</a>
      </nav>
    </header>
    <main className="flex-1 w-full max-w-7xl mx-auto p-4">{children}</main>
    <footer className="py-8 bg-emerald-50 mt-12 text-center text-gray-600 text-sm rounded-t-lg">
      &copy; {new Date().getFullYear()} Wongnok recipes. All rights reserved.
    </footer>
  </div>
);

export default Layout;
