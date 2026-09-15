import { describe, expect, it } from "vitest";
import {
  DEFAULT_QUERY,
  parseQuery,
  serializeQuery,
  QueryError,
} from "@/lib/query";
import { candidateRepository } from "@/lib/repository";
import { GET as list } from "@/app/api/candidates/route";
import { GET as detail } from "@/app/api/candidates/[id]/route";

describe("query contract", () => {
  it("uses bounded defaults", () =>
    expect(parseQuery(new URLSearchParams())).toEqual(DEFAULT_QUERY));
  it("trims search and round-trips shareable state", () => {
    const query = {
      ...DEFAULT_QUERY,
      q: "Aderinib",
      status: "In Development",
      page: 2,
    };
    expect(parseQuery(new URLSearchParams(serializeQuery(query)))).toEqual(
      query,
    );
    expect(parseQuery(new URLSearchParams("q=%20Aderinib%20")).q).toBe(
      "Aderinib",
    );
  });
  it.each([
    "page=-1",
    "page=0",
    "page=1.5",
    "page=1e3",
    "pageSize=51",
    "pageSize=0",
    "page=1000001",
    "status=unknown",
    "area=unknown",
    "sort=bad",
    `q=${"x".repeat(101)}`,
  ])("rejects invalid API query %s", (raw) =>
    expect(() => parseQuery(new URLSearchParams(raw), true)).toThrow(
      QueryError,
    ),
  );
  it("recovers from malformed browser URLs", () =>
    expect(
      parseQuery(new URLSearchParams("page=-4&status=bad&sort=bad")),
    ).toEqual(DEFAULT_QUERY));
});
describe("candidate repository", () => {
  it("searches by name case-insensitively and combines filters", async () => {
    const found = await candidateRepository.list({
      ...DEFAULT_QUERY,
      q: "ADER",
      area: "Oncology",
      status: "In Development",
    });
    expect(found.items.map((c) => c.name)).toEqual(["Aderinib"]);
    expect(
      (
        await candidateRepository.list({
          ...DEFAULT_QUERY,
          q: "ADER",
          area: "Neurology",
        })
      ).total,
    ).toBe(0);
  });
  it("returns bounded, nonoverlapping pages and only summary fields", async () => {
    const a = await candidateRepository.list(DEFAULT_QUERY);
    const b = await candidateRepository.list({ ...DEFAULT_QUERY, page: 2 });
    expect(a.items).toHaveLength(8);
    expect(new Set([...a.items, ...b.items].map((c) => c.id)).size).toBe(16);
    expect(a.items[0]).not.toHaveProperty("mechanismOfAction");
    expect(a.portfolio.total).toBe(24);
  });
  it("clamps pages after filtering and handles empty results", async () => {
    const found = await candidateRepository.list({
      ...DEFAULT_QUERY,
      q: "Ader",
      page: 999,
    });
    expect(found.page).toBe(1);
    const empty = await candidateRepository.list({
      ...DEFAULT_QUERY,
      q: "not-a-candidate",
    });
    expect(empty.items).toEqual([]);
    expect(empty.totalPages).toBe(1);
  });
  it("sorts by name and most recent update deterministically", async () => {
    expect(
      (await candidateRepository.list({ ...DEFAULT_QUERY, sort: "name-desc" }))
        .items[0].name,
    ).toBe("Zerunex");
    const latest = await candidateRepository.list({
      ...DEFAULT_QUERY,
      sort: "updated",
    });
    expect(latest.items.map((c) => c.updatedAt)).toEqual(
      latest.items
        .map((c) => c.updatedAt)
        .sort()
        .reverse(),
    );
  });
  it("looks up a full record by ID and returns undefined for an unknown ID", async () => {
    expect(await candidateRepository.findById("ca-001")).toHaveProperty(
      "mechanismOfAction",
    );
    expect(await candidateRepository.findById("missing")).toBeUndefined();
  });
});
describe("HTTP handlers", () => {
  it("returns a successful filtered page", async () => {
    const response = await list(
      new Request("http://localhost/api/candidates?status=Approved"),
    );
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.total).toBe(3);
    expect(
      body.items.every((c: { status: string }) => c.status === "Approved"),
    ).toBe(true);
  });
  it("returns 400 with a safe validation error", async () => {
    const response = await list(
      new Request("http://localhost/api/candidates?pageSize=100000"),
    );
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Invalid pageSize." });
  });
  it("returns detail and a real 404 for an unknown ID", async () => {
    const response = await detail(new Request("http://localhost"), {
      params: Promise.resolve({ id: "ca-001" }),
    });
    expect((await response.json()).name).toBe("Aderinib");
    expect(
      (
        await detail(new Request("http://localhost"), {
          params: Promise.resolve({ id: "unknown" }),
        })
      ).status,
    ).toBe(404);
  });
});
