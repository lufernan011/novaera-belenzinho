import Image from "next/image";
import type { Block } from "@/db/schema";

/**
 * Renderiza o conteúdo em blocos (acervo migrado do WordPress e edições
 * futuras do admin). Imagens consecutivas viram uma galeria em grade.
 */
export default function Blocks({ blocks }: { blocks: Block[] }) {
  const groups: Array<Block | Block[]> = [];
  for (const block of blocks) {
    const last = groups[groups.length - 1];
    if (block.type === "image" && Array.isArray(last)) {
      last.push(block);
    } else if (block.type === "image") {
      groups.push([block]);
    } else {
      groups.push(block);
    }
  }

  return (
    <div className="space-y-5">
      {groups.map((group, i) => {
        if (Array.isArray(group)) {
          const imgs = group.filter(
            (b): b is Extract<Block, { type: "image" }> => b.type === "image"
          );
          return (
            <div
              key={i}
              className={
                imgs.length === 1
                  ? "my-7"
                  : "my-7 grid grid-cols-2 gap-3 sm:grid-cols-3"
              }
            >
              {imgs.map((img) => (
                <Image
                  key={img.src}
                  src={img.src}
                  alt={img.alt ?? ""}
                  width={800}
                  height={600}
                  className={
                    imgs.length === 1
                      ? "mx-auto max-h-[480px] w-auto rounded-xl border border-sand-200"
                      : "h-44 w-full rounded-xl border border-sand-200 object-cover sm:h-52"
                  }
                />
              ))}
            </div>
          );
        }
        if (group.type === "heading") {
          return (
            <h2 key={i} className="pt-4 font-display text-2xl text-twilight-700 sm:text-3xl">
              {group.text}
            </h2>
          );
        }
        if (group.type === "subheading") {
          return (
            <h3 key={i} className="pt-2 font-display text-xl text-coral-600">
              {group.text}
            </h3>
          );
        }
        return (
          <p key={i} className="text-[17px] leading-relaxed text-ink-800">
            {group.text}
          </p>
        );
      })}
    </div>
  );
}
