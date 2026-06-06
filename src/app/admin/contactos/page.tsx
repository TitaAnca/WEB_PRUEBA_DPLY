import type { Metadata } from "next";
import Link from "next/link";
import styles from "./AdminContactos.module.css";
import {
  getSupabaseServiceClient,
  type ContactSubmissionRow,
} from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Contactos · Admin | ETECÉ STUDIO",
  description: "Visor interno de mensajes recibidos a través del formulario de contacto.",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

type LoadResult =
  | { kind: "ok"; rows: ContactSubmissionRow[] }
  | { kind: "missing-env" }
  | { kind: "error"; message: string };

async function loadSubmissions(): Promise<LoadResult> {
  const supabase = getSupabaseServiceClient();
  if (!supabase) return { kind: "missing-env" };

  const { data, error } = await supabase
    .from("contact_submissions")
    .select(
      "id, created_at, name, company, email, message, source, status",
    )
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    return { kind: "error", message: error.message };
  }

  return { kind: "ok", rows: (data ?? []) as ContactSubmissionRow[] };
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    const date = new Date(iso);
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return iso;
  }
}

export default async function AdminContactosPage() {
  const result = await loadSubmissions();
  const rows = result.kind === "ok" ? result.rows : [];
  const count = rows.length;

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <p className={styles.warning}>
          Área interna provisional. Proteger antes de publicar en producción.
        </p>

        <header className={styles.header}>
          <h1 className={styles.title}>
            <span className={styles.titleAccent} aria-hidden="true" />
            Contactos recibidos
          </h1>
          <p className={styles.meta}>
            {result.kind === "ok" ? (
              <>
                Mensajes · <span className={styles.metaCount}>{count}</span>
              </>
            ) : null}
          </p>
        </header>

        {result.kind === "missing-env" ? (
          <p className={styles.error}>
            Faltan variables de entorno de Supabase
            (<code>NEXT_PUBLIC_SUPABASE_URL</code> y{" "}
            <code>SUPABASE_SERVICE_ROLE_KEY</code>). Añádelas y reinicia el
            servidor para ver los mensajes.
          </p>
        ) : null}

        {result.kind === "error" ? (
          <p className={styles.error}>
            No se han podido cargar los mensajes desde Supabase. Revisa la
            configuración del servidor.
          </p>
        ) : null}

        {result.kind === "ok" ? (
          rows.length === 0 ? (
            <div className={styles.empty}>
              <p className={styles.emptyMark}>—</p>
              <p className={styles.emptyText}>
                No hay mensajes recibidos todavía.
              </p>
            </div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Fecha</th>
                    <th scope="col">Nombre</th>
                    <th scope="col">Empresa</th>
                    <th scope="col">Email</th>
                    <th scope="col">Mensaje</th>
                    <th scope="col">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td>{formatDate(row.created_at)}</td>
                      <td>{row.name}</td>
                      <td>
                        {row.company ? (
                          row.company
                        ) : (
                          <span className={styles.muted}>—</span>
                        )}
                      </td>
                      <td>
                        <a
                          className={styles.email}
                          href={`mailto:${row.email}`}
                        >
                          {row.email}
                        </a>
                      </td>
                      <td className={styles.message}>{row.message}</td>
                      <td>
                        <span
                          className={styles.statusPill}
                          data-status={row.status ?? "new"}
                        >
                          {row.status ?? "new"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : null}

        <footer className={styles.footer}>
          <span>ETECÉ STUDIO · panel interno</span>
          <Link href="/">← Volver al inicio</Link>
        </footer>
      </div>
    </main>
  );
}
