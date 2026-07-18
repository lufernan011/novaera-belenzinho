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
      hint="Adicione, remova ou reordene os membros. A ordem aqui é a ordem no site."
      roleLabel="Cargo (ex.: 1ª Secretária)"
      initial={people.map(({ name, role, photo }) => ({ name, role, photo }))}
    />
  );
}
