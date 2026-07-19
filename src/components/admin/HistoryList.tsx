import { authorLabel, timeAgo, type Revision } from "@/lib/history";

const ACTION_STYLE: Record<string, string> = {
  Criação: "bg-green-100 text-green-800",
  Edição: "bg-sand-200 text-coral-700",
  Exclusão: "bg-red-100 text-red-700",
};

/** Lista de alterações: ação (badge) · o quê · quem · quando. */
export default function HistoryList({ rows }: { rows: Revision[] }) {
  if (rows.length === 0) {
    return <p className="text-[15px] text-ink-500">Nenhuma alteração ainda.</p>;
  }
  return (
    <ul className="divide-y divide-sand-200">
      {rows.map((r) => (
        <li key={r.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-3">
          <span
            className={`rounded-full px-2.5 py-0.5 text-[13px] font-medium ${
              ACTION_STYLE[r.action] ?? "bg-sand-200 text-ink-600"
            }`}
          >
            {r.action}
          </span>
          <span className="text-[16px] text-petrol-700">{r.label || r.entity}</span>
          <span className="ml-auto text-[14px] text-ink-500">
            por {authorLabel(r.author)} · {timeAgo(r.createdAt)}
          </span>
        </li>
      ))}
    </ul>
  );
}
