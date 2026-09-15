import { Suspense } from "react";
import { Explorer, ResultsSkeleton } from "@/components/explorer";
export default function HomePage() {
  return (
    <Suspense
      fallback={
        <>
          <h1 className="page-title mb-8">Candidate library.</h1>
          <ResultsSkeleton />
        </>
      }
    >
      <Explorer />
    </Suspense>
  );
}
