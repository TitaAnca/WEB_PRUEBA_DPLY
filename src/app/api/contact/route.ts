import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MESSAGE_MAX_LENGTH = 4000;
const NAME_MAX_LENGTH = 200;
const FIELD_MAX_LENGTH = 200;

type ContactPayload = {
  name?: unknown;
  company?: unknown;
  email?: unknown;
  message?: unknown;
};

function asTrimmedString(value: unknown, max = FIELD_MAX_LENGTH): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

export async function POST(request: Request) {
  let payload: ContactPayload;
  try {
    payload = (await request.json()) as ContactPayload;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Solicitud no válida." },
      { status: 400 },
    );
  }

  const name = asTrimmedString(payload.name, NAME_MAX_LENGTH);
  const company = asTrimmedString(payload.company);
  const email = asTrimmedString(payload.email);
  const message = asTrimmedString(payload.message, MESSAGE_MAX_LENGTH);

  if (!name) {
    return NextResponse.json(
      { ok: false, error: "Falta el nombre." },
      { status: 400 },
    );
  }
  if (!email || !EMAIL_REGEX.test(email)) {
    return NextResponse.json(
      { ok: false, error: "Email no válido." },
      { status: 400 },
    );
  }
  if (!message) {
    return NextResponse.json(
      { ok: false, error: "Falta el mensaje." },
      { status: 400 },
    );
  }

  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    console.error(
      "Contact | Missing Supabase environment variables. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env.local and restart the dev server.",
    );
    return NextResponse.json(
      {
        ok: false,
        error:
          "El formulario no está configurado todavía. Escríbenos a contacto@etecestudio.com.",
      },
      { status: 503 },
    );
  }

  const { error } = await supabase.from("contact_submissions").insert({
    name,
    company: company || null,
    email,
    message,
    source: "website",
    status: "new",
  });

  if (error) {
    console.error("[contact] Supabase insert error:", error.message);
    return NextResponse.json(
      { ok: false, error: "No se ha podido guardar el mensaje." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
