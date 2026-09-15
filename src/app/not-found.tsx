import Link from "next/link";
import { SearchX } from "lucide-react";
export default function NotFound() {
  return (
    <div className="empty-state min-h-[60vh]">
      <SearchX size={36} className="text-slate-400" />
      <p className="eyebrow">404 / NOT FOUND</p>
      <h1 className="page-title">Candidate not found</h1>
      <p>This record may have moved, or the link may be incorrect.</p>
      <Link href="/" className="primary-button">
        Return to library
      </Link>
    </div>
  );
}
