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
      hint="Cada pessoa pertence a um grupo (Secretaria, Tesouraria...), que vira uma seção na página. Para criar um grupo novo, basta digitar um nome novo no campo. A ordem das pessoas define a ordem dos grupos no site."
      roleLabel="Cargo (ex.: 1ª Secretária)"
      initial={people.map(({ name, role, photo, group }) => ({ name, role, photo, group }))}
    />
  );
}
