import Link from "next/link";
import {
  FlaskConical,
  LibraryBig,
  ArrowUpRight,
  Microscope,
} from "lucide-react";
export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen lg:pl-60">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <aside className="sidebar">
        <Link href="/" className="brand" aria-label="Candidate Atlas home">
          <span className="brand-icon">
            <FlaskConical size={24} />
          </span>
          <span>
            candidate
            <span className="block font-normal tracking-[.2em] text-xs text-slate-400">
              ATLAS
            </span>
          </span>
        </Link>
        <div className="hidden lg:block">
          <p className="nav-label">RESEARCH WORKSPACE</p>
          <nav aria-label="Main navigation">
            <Link href="/" className="nav-active">
              <LibraryBig size={19} /> Candidate library{" "}
              <span className="ml-auto text-cyan-300">↗</span>
            </Link>
          </nav>
        </div>
        <div className="sidebar-bottom">
          <Microscope size={25} className="mb-4 text-cyan-300" />
          <p className="font-medium text-slate-100">
            Every discovery starts
            <br />
            with a closer look.
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Explore the research portfolio.
          </p>
          <div className="mt-8 border-t border-slate-700 pt-5 text-xs text-slate-400">
            Candidate Atlas <span className="float-right">v1.0</span>
          </div>
        </div>
      </aside>
      <div className="topbar">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-500">Workspace</span>
          <span className="text-slate-300">/</span>
          <span className="font-medium">Research & development</span>
        </div>
        <span className="demo-label">
          <span className="h-1.5 w-1.5 rounded-full bg-teal-600" />
          Demo dataset
        </span>
      </div>
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto max-w-[1600px] px-5 py-8 sm:px-9 lg:px-12 lg:py-10 focus:outline-none"
      >
        {children}
      </main>
      <footer className="mx-5 flex flex-wrap justify-between gap-2 border-t border-slate-200 py-5 text-xs text-slate-500 sm:mx-9 lg:mx-12">
        <span>Fictional research data · For demonstration only</span>
        <span className="inline-flex items-center gap-1">
          Candidate Atlas <ArrowUpRight size={12} />
        </span>
      </footer>
    </div>
  );
}
