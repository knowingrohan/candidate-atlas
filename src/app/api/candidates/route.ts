import { candidateRepository } from "@/lib/repository";
import { parseQuery, QueryError } from "@/lib/query";
export async function GET(request: Request) {
  try {
    const query = parseQuery(new URL(request.url).searchParams, true);
    return Response.json(await candidateRepository.list(query), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    if (error instanceof QueryError)
      return Response.json({ error: error.message }, { status: 400 });
    console.error("Candidate listing failed", error);
    return Response.json(
      { error: "Unable to load candidates. Please try again." },
      { status: 500 },
    );
  }
}
