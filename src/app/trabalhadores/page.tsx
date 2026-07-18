import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import PeopleGrid from "@/components/PeopleGrid";
import Blocks from "@/components/Blocks";
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
        <div className="mb-10">
          <Blocks blocks={intro} />
        </div>
      )}
      <PeopleGrid people={workers} columns={4} />
    </PageShell>
  );
}
