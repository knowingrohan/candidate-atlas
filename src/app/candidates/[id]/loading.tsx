export default function Loading() {
  return (
    <div
      role="status"
      aria-label="Loading candidate details"
      className="space-y-6"
    >
      <span className="sr-only">Loading candidate details</span>
      <div className="skeleton h-6 w-40 rounded" />
      <div className="skeleton h-12 w-60 rounded" />
      <div className="skeleton h-48 w-full rounded-xl" />
      <div className="skeleton h-64 w-full rounded-xl" />
    </div>
  );
}
