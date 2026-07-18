"use client";

import type { Block } from "@/db/schema";
import { PhotoInput, RowControls, inputCls } from "./ui";

/**
 * Editor visual do conteúdo em blocos: cada parágrafo, título e foto é
 * um cartão que pode ser editado, movido ou removido — como no site.
 */
export default function BlocksEditor({
  blocks,
  onChange,
}: {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
}) {
  function update(index: number, block: Block) {
    onChange(blocks.map((b, i) => (i === index ? block : b)));
  }
  function move(index: number, dir: -1 | 1) {
    const next = [...blocks];
    const j = index + dir;
    [next[index], next[j]] = [next[j], next[index]];
    onChange(next);
  }
  function remove(index: number) {
    onChange(blocks.filter((_, i) => i !== index));
  }
  function add(block: Block) {
    onChange([...blocks, block]);
  }

  return (
    <div>
      <ul className="space-y-3">
        {blocks.map((block, i) => (
          <li key={i} className="rounded-2xl border border-sand-300 bg-white p-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-[13px] font-medium tracking-wide text-ink-500 uppercase">
                {block.type === "image"
                  ? "Foto"
                  : block.type === "paragraph"
                    ? "Texto"
                    : block.type === "heading"
                      ? "Título"
                      : "Subtítulo"}
              </span>
              <RowControls
                onUp={i > 0 ? () => move(i, -1) : undefined}
                onDown={i < blocks.length - 1 ? () => move(i, 1) : undefined}
                onRemove={() => remove(i)}
              />
            </div>
            {block.type === "image" ? (
              <PhotoInput
                value={block.src}
                onChange={(url) => update(i, { ...block, src: url })}
              />
            ) : block.type === "paragraph" ? (
              <textarea
                rows={4}
                value={block.text}
                onChange={(e) => update(i, { ...block, text: e.target.value })}
                className={inputCls}
                aria-label="Texto do parágrafo"
              />
            ) : (
              <input
                type="text"
                value={block.text}
                onChange={(e) => update(i, { ...block, text: e.target.value })}
                className={`${inputCls} font-display text-xl`}
                aria-label="Texto do título"
              />
            )}
          </li>
        ))}
      </ul>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => add({ type: "paragraph", text: "" })}
          className="rounded-xl border border-dashed border-sand-300 px-4 py-2.5 text-[15px] text-coral-700 hover:border-coral-500"
        >
          + Texto
        </button>
        <button
          type="button"
          onClick={() => add({ type: "heading", text: "" })}
          className="rounded-xl border border-dashed border-sand-300 px-4 py-2.5 text-[15px] text-coral-700 hover:border-coral-500"
        >
          + Título
        </button>
        <button
          type="button"
          onClick={() => add({ type: "image", src: "" })}
          className="rounded-xl border border-dashed border-sand-300 px-4 py-2.5 text-[15px] text-coral-700 hover:border-coral-500"
        >
          + Foto
        </button>
      </div>
    </div>
  );
}
