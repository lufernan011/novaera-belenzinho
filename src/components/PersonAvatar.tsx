import Image from "next/image";
import { avatarColor, initials } from "@/lib/people";

/** Retrato circular: foto (recorte no rosto) ou iniciais coloridas. */
export default function PersonAvatar({
  name,
  photo,
  size = 64,
}: {
  name: string;
  photo?: string;
  size?: number;
}) {
  if (photo) {
    return (
      <Image
        src={photo}
        alt={`Foto de ${name}`}
        width={size * 2}
        height={size * 2}
        className="rounded-full border-2 border-white object-cover object-top shadow-sm"
        style={{ width: size, height: size }}
      />
    );
  }
  const color = avatarColor(name);
  return (
    <span
      aria-hidden
      className="inline-flex items-center justify-center rounded-full border-2 border-white font-medium shadow-sm"
      style={{
        width: size,
        height: size,
        background: color.bg,
        color: color.fg,
        fontSize: size / 3.2,
      }}
    >
      {initials(name)}
    </span>
  );
}
