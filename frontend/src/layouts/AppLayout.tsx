import { Outlet } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";

function AppLayout() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-950 font-sans antialiased">
      {/* Sleek Fixed Sidebar */}
      <Sidebar />

      {/* Main App Container */}
      <div className="flex flex-1 flex-col overflow-hidden bg-slate-50/80">
        <Header />

        {/* Scrollable Viewport with Ambient SaaS Background */}
        <main className="relative flex-1 overflow-y-auto px-6 py-6 lg:px-8 lg:py-8">
          {/* Subtle gradient background element */}
          <div className="pointer-events-none absolute -top-40 right-0 h-96 w-96 rounded-full bg-indigo-500/5 blur-3xl" />
          <div className="relative z-10 mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default AppLayout;