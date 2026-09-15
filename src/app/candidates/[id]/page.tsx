import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  ArrowLeft,
  ArrowRight,
  Dna,
  ShieldCheck,
  FileText,
  Info,
  CalendarDays,
  FlaskConical,
} from "lucide-react";
import { candidateRepository } from "@/lib/repository";
import { formatDate, parseQuery, serializeQuery } from "@/lib/query";
import { StatusBadge } from "@/components/status-badge";
type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const candidate = await candidateRepository.findById((await params).id);
  return { title: candidate ? candidate.name : "Candidate not found" };
}
export default async function CandidateDetail({ params, searchParams }: Props) {
  const candidate = await candidateRepository.findById((await params).id);
  if (!candidate) notFound();
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(await searchParams))
    if (typeof value === "string") search.set(key, value);
  const query = serializeQuery(parseQuery(search));
  const back = query ? `/?${query}` : "/";
  const stages = [
    "Preclinical",
    "Phase I",
    "Phase II",
    "Phase III",
    "Approved",
  ];
  const current = stages.indexOf(candidate.phase);
  return (
    <>
      <Link
        href={back}
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-teal-800"
      >
        <ArrowLeft size={16} />
        Back to candidates
      </Link>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="eyebrow">CANDIDATE PROFILE / {candidate.code}</p>
          <div className="flex flex-wrap items-center gap-4">
            <h1 className="page-title">{candidate.name}</h1>
            <StatusBadge status={candidate.status} />
          </div>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-500">
            {candidate.description}
          </p>
        </div>
        <span className="flex items-center gap-2 text-xs text-slate-500">
          <CalendarDays size={14} />
          Updated {formatDate(candidate.updatedAt)}
        </span>
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-5">
          <section className="detail-card">
            <h2 className="detail-heading">
              <FlaskConical />
              Development stage
            </h2>
            <p className="mb-6 text-sm text-slate-500">
              {candidate.status === "Approved"
                ? "Approved in the fictional portfolio."
                : candidate.status === "Discontinued"
                  ? `Program discontinued at ${candidate.phase}.`
                  : candidate.status === "On Hold"
                    ? `Program on hold at ${candidate.phase}.`
                    : `Currently in ${candidate.phase.toLowerCase()} development.`}
            </p>
            <ol
              className="flex flex-col gap-4 sm:flex-row sm:gap-0"
              aria-label="Development stages"
            >
              {stages.map((stage, index) => (
                <li
                  key={stage}
                  aria-current={index === current ? "step" : undefined}
                  className="relative flex flex-1 items-center gap-3 sm:flex-col sm:items-start"
                >
                  <div className="flex w-full max-sm:w-auto items-center">
                    <span
                      className={`relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border text-xs font-semibold ${index === current ? "border-teal-700 bg-teal-700 text-white ring-4 ring-teal-50" : index < current ? "border-teal-200 bg-teal-50 text-teal-800" : "border-slate-200 bg-white text-slate-500"}`}
                    >
                      {index + 1}
                    </span>
                    {index < stages.length - 1 && (
                      <span
                        className={`hidden h-px flex-1 sm:block ${index < current ? "bg-teal-200" : "bg-slate-200"}`}
                      />
                    )}
                  </div>
                  <span
                    className={`text-sm ${index === current ? "font-semibold text-teal-800" : "text-slate-500"}`}
                  >
                    {stage}
                    {index === current && (
                      <span className="sr-only">, current stage</span>
                    )}
                  </span>
                </li>
              ))}
            </ol>
          </section>
          <section className="detail-card">
            <h2 className="detail-heading">
              <FileText />
              Program overview
            </h2>
            <p className="text-base leading-7 text-slate-600">
              {candidate.overview}
            </p>
          </section>
          <section className="detail-card">
            <h2 className="detail-heading">
              <Dna />
              Mechanism of action
            </h2>
            <div className="border-l-[3px] border-teal-500 bg-teal-50/60 px-5 py-4">
              <p className="text-base leading-7 text-slate-700">
                {candidate.mechanismOfAction}
              </p>
            </div>
          </section>
          <section className="detail-card">
            <h2 className="detail-heading">
              <ShieldCheck />
              Side effects & safety
            </h2>
            <p className="mb-4 text-sm text-slate-500">
              Illustrative side effects in this sample record
            </p>
            <ul className="mb-5 flex flex-wrap gap-2">
              {candidate.sideEffects.map((effect) => (
                <li
                  key={effect}
                  className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                >
                  {effect}
                </li>
              ))}
            </ul>
            <p className="text-sm leading-6 text-slate-500">
              {candidate.safetyNote}
            </p>
          </section>
        </div>
        <aside className="space-y-5">
          <section className="detail-card">
            <h2 className="mb-6 text-base font-semibold">At a glance</h2>
            <dl className="space-y-5">
              {[
                ["Candidate ID", candidate.code],
                ["Therapeutic area", candidate.area],
                ["Modality", candidate.modality],
                ["Administration", candidate.route],
                ["Development stage", candidate.phase],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="mb-1.5 text-xs text-slate-500">{label}</dt>
                  <dd className="text-sm font-medium text-slate-800">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
          <section className="rounded-lg border border-teal-100 bg-teal-50/70 p-5">
            <Info size={20} className="mb-3 text-teal-700" />
            <h2 className="mb-2 text-sm font-semibold text-teal-900">
              A demonstration portfolio
            </h2>
            <p className="text-sm leading-6 text-teal-800">
              This candidate and its scientific details are fictional. This
              information is not intended for clinical use.
            </p>
          </section>
          <Link
            href={back}
            className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-5 text-sm font-medium text-slate-700"
          >
            Return to library
            <ArrowRight size={16} />
          </Link>
        </aside>
      </div>
    </>
  );
}
