import { candidateRepository } from "@/lib/repository";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const candidate = await candidateRepository.findById(id);
  return candidate
    ? Response.json(candidate)
    : Response.json({ error: "Candidate not found." }, { status: 404 });
}
