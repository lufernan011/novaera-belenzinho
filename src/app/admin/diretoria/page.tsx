import { requireAdmin } from "@/lib/session";
import { getPeople } from "@/lib/content";
import PeopleEditor from "@/components/admin/PeopleEditor";

export default async function Page() {
  await requireAdmin();
  const people = await getPeople("board");
  return (
    <PeopleEditor
      kind="board"
      title="Diretoria"
      hint="O site agrupa as pessoas automaticamente pelo cargo (Secretaria, Tesouraria, Biblioteca, Conselho Fiscal) — a etiqueta abaixo de cada cargo mostra onde a pessoa vai aparecer."
      roleLabel="Cargo (ex.: 1ª Secretária)"
      initial={people.map(({ name, role, photo }) => ({ name, role, photo }))}
    />
  );
}
