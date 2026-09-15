"use client";
import { AlertCircle } from "lucide-react";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="empty-state min-h-[60vh]" role="alert">
      <AlertCircle size={32} className="text-amber-600" />
      <h1 className="page-title">Something went wrong</h1>
      <p>We couldn’t open this page. Please try again.</p>
      <button className="primary-button" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
