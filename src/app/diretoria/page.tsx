import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import PeopleGrid from "@/components/PeopleGrid";
import { getPeople } from "@/lib/content";

export const metadata: Metadata = { title: "Diretoria" };

export default async function Page() {
  const board = await getPeople("board");
  return (
    <PageShell
      title="Diretoria"
      intro="Dedicamos esta seção a honrar e homenagear nosso corpo diretivo, cujo esforço mantém viva a nossa casa. Agradecemos também a todos que passaram pelo quadro de diretores desde a fundação."
    >
      <PeopleGrid people={board} columns={3} />
    </PageShell>
  );
}
