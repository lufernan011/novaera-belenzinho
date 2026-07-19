"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const NAV = [
  { href: "/espiritismo/", label: "Espiritismo" },
  { href: "/o-centro/", label: "O Centro" },
  { href: "/horarios/", label: "Horários" },
  { href: "/publicacoes/", label: "Publicações" },
  { href: "/fale-conosco/", label: "Fale Conosco" },
];

/**
 * Cabeçalho do site. Na home fica sobre a foto do pôr do sol
 * (transparent); nas demais páginas tem fundo crepúsculo sólido.
 */
export default function Header({ overlay = false }: { overlay?: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <header
      className={
        overlay
          ? "absolute inset-x-0 top-0 z-20"
          : "relative z-20 bg-petrol-700"
      }
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
        <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <Image
            src="/acervo/2017_10_Logo_NovaEraBelenzinho.jpg"
            alt=""
            width={44}
            height={44}
            className="h-11 w-11 rounded-full border-2 border-white/80 object-cover object-left"
          />
          <span className="leading-tight">
            <span className="block font-display text-lg text-white">
              Centro Espírita Nova Era
            </span>
            <span className="block text-xs text-amber-300">
              Belenzinho · desde 1947
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex" aria-label="Principal">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[15px] text-white/90 transition hover:text-amber-300"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/ajude-o-nova-era/"
            className="rounded-full bg-amber-500 px-5 py-2.5 text-[15px] font-medium text-ink-900 transition hover:bg-amber-300"
          >
            Ajude o Nova Era
          </Link>
        </nav>

        <button
          type="button"
          className="rounded-lg border border-white/40 p-2 text-white lg:hidden"
          aria-expanded={open}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <nav
          className="border-t border-white/15 bg-petrol-800 px-5 py-4 lg:hidden"
          aria-label="Principal (celular)"
        >
          <ul className="flex flex-col gap-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block rounded-lg px-3 py-3 text-lg text-white/95 hover:bg-white/10"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="mt-2">
              <Link
                href="/ajude-o-nova-era/"
                className="block rounded-full bg-amber-500 px-5 py-3 text-center text-lg font-medium text-ink-900"
                onClick={() => setOpen(false)}
              >
                Ajude o Nova Era
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
