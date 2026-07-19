import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getIronSession, type IronSession } from "iron-session";

export type AdminSession = {
  isAdmin?: boolean;
  userId?: number;
  /** Nome de quem entrou (ou "Recuperação" na senha mestre). */
  userName?: string;
};

const DEV_SECRET = "novaera-dev-secret-trocar-em-producao-0000";

export function sessionOptions() {
  const password = process.env.SESSION_SECRET ?? DEV_SECRET;
  if (process.env.NODE_ENV === "production" && password === DEV_SECRET) {
    throw new Error("SESSION_SECRET precisa estar definido em produção");
  }
  return {
    cookieName: "novaera_admin",
    password,
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax" as const,
      maxAge: 60 * 60 * 8, // 8 horas
    },
  };
}

export async function getSession(): Promise<IronSession<AdminSession>> {
  return getIronSession<AdminSession>(await cookies(), sessionOptions());
}

/** Usar no topo de toda página/action do admin. */
export async function requireAdmin(): Promise<void> {
  const session = await getSession();
  if (!session.isAdmin) redirect("/admin/login/");
}
