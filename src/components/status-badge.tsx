import type { Status } from "@/lib/types";
const styles: Record<Status, string> = {
  "In Development": "bg-blue-50 text-blue-800 border-blue-200",
  Approved: "bg-emerald-50 text-emerald-800 border-emerald-200",
  "On Hold": "bg-amber-50 text-amber-900 border-amber-200",
  Discontinued: "bg-slate-100 text-slate-600 border-slate-200",
};
export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}
