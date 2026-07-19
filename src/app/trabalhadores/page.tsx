import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import Blocks from "@/components/Blocks";
import WorkersMural from "@/components/WorkersMural";
import { getPage, getPeople } from "@/lib/content";

export const metadata: Metadata = { title: "Trabalhadores" };

export default async function Page() {
  const [workers, page] = await Promise.all([
    getPeople("worker"),
    getPage("trabalhadores"),
  ]);
  const intro =
    page?.blocks.filter(
      (b) => b.type === "paragraph" || b.type === "subheading"
    ) ?? [];

  return (
    <PageShell title="Trabalhadores">
      {intro.length > 0 && (
        <div className="mx-auto mb-10 max-w-2xl">
          <Blocks blocks={intro} />
        </div>
      )}
      <WorkersMural
        workers={workers.map(({ id, name, role, photo }) => ({ id, name, role, photo }))}
      />
    </PageShell>
  );
}
