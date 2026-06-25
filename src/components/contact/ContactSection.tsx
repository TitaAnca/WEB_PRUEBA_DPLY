"use client";

import { useState, type FormEvent } from "react";
import styles from "./ContactSection.module.css";

type FormState = {
  name: string;
  company: string;
  email: string;
  message: string;
};

type FieldErrors = Partial<Record<keyof FormState, string>>;
type Status = "idle" | "submitting" | "success" | "error";

const INITIAL_FORM: FormState = {
  name: "",
  company: "",
  email: "",
  message: "",
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(form: FormState): FieldErrors {
  const errors: FieldErrors = {};
  if (!form.name.trim()) errors.name = "Indícanos cómo te llamas.";
  if (!form.email.trim()) {
    errors.email = "Necesitamos un email.";
  } else if (!EMAIL_REGEX.test(form.email.trim())) {
    errors.email = "Revisa el formato del email.";
  }
  if (!form.message.trim()) errors.message = "Cuéntanos algo, aunque sea breve.";
  return errors;
}

export function ContactSection() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>("idle");

  function updateField<K extends keyof FormState>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (fieldErrors[key]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;

    const errors = validate(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setStatus("error");
      return;
    }

    setFieldErrors({});
    setStatus("submitting");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          company: form.company.trim(),
          email: form.email.trim(),
          message: form.message.trim(),
        }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };

      if (!response.ok || !data.ok) {
        setStatus("error");
        return;
      }

      setStatus("success");
      setForm(INITIAL_FORM);
    } catch {
      setStatus("error");
    }
  }

  const isSubmitting = status === "submitting";
  const showFormError = status === "error";
  const isSuccess = status === "success";

  return (
    <section
      id="contacto"
      className={`${styles.section} landing-block landing-block--contacto`}
      data-theme="light"
      aria-label="Contacto"
    >
      {/* THE BRIEF ROOM — sala de brief negra dentro de la página clara. */}
      <div className={`${styles.shell} postHeroSafeFrame`}>
        {/* Firma de marca: tres puntos Etecé gigantes, sutiles y recortados. */}
        <div className={styles.backgroundDots} aria-hidden="true">
          <span />
          <span />
          <span />
        </div>

        {/* ── Invitación del estudio ───────────────────────────── */}
        <div className={styles.left}>
          <h2 className={styles.kicker}>
            Etecé Studio | Branding &amp; Comunicación visual
          </h2>

          <div className={styles.leadIn}>
            <p className={styles.statement}>
              <span>
                EMPEZAMOS A CREAR LA HISTORIA<span className={styles.statementMarks}>???</span>
              </span>
            </p>

            <p className={styles.copy}>
              Las mejores marcas no suelen empezar con respuestas. Suelen empezar
              con una conversación diferente, una identidad por descubrir y una
              historia todavía por escribir.
            </p>
          </div>

          <div className={styles.emailBlock}>
            <span>Email</span>
            <div className={styles.emailAddressGroup}>
              <div className={styles.emailLinkRow}>
                <a href="mailto:contacto@etecestudio.com">contacto@etecestudio.com</a>
              </div>
              <span className={styles.emailUnderline} aria-hidden="true" />
            </div>
          </div>
        </div>

        {/* ── Formulario integrado en la superficie negra ──────── */}
        <div className={styles.right}>
          {isSuccess ? (
            <div className={styles.success} role="status" aria-live="polite">
              <span className={styles.successDots} aria-hidden="true">
                <span className={styles.successDot} />
                <span className={styles.successDot} />
                <span className={styles.successDot} />
              </span>
              <h3 className={styles.successTitle}>Mensaje enviado</h3>
              <p className={styles.successSubtitle}>
                Gracias. Hemos recibido tu mensaje y te responderemos pronto.
              </p>
              <p className={styles.successHint}>
                Etecé Studio · Branding &amp; Comunicación Visual
              </p>
            </div>
          ) : (
            <form
              id="contact-form"
              className={styles.form}
              onSubmit={handleSubmit}
              noValidate
              aria-describedby={showFormError ? "contact-form-error" : undefined}
            >
              <p className={styles.formLabel}>CUÉNTANOS TU HISTORIA</p>

              <div className={styles.formGrid}>
                <div className={styles.field}>
                  <label
                    className={styles.label}
                    htmlFor="contact-name"
                    data-required="true"
                  >
                    Nombre
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    className={styles.input}
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    aria-invalid={fieldErrors.name ? "true" : "false"}
                    aria-describedby={
                      fieldErrors.name ? "contact-name-error" : undefined
                    }
                    required
                  />
                  {fieldErrors.name ? (
                    <p
                      id="contact-name-error"
                      className={styles.fieldError}
                      role="alert"
                    >
                      {fieldErrors.name}
                    </p>
                  ) : null}
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="contact-company">
                    Empresa
                  </label>
                  <input
                    id="contact-company"
                    name="company"
                    type="text"
                    autoComplete="organization"
                    className={styles.input}
                    value={form.company}
                    onChange={(e) => updateField("company", e.target.value)}
                  />
                </div>

                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <label
                    className={styles.label}
                    htmlFor="contact-email"
                    data-required="true"
                  >
                    Email
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    className={styles.input}
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    aria-invalid={fieldErrors.email ? "true" : "false"}
                    aria-describedby={
                      fieldErrors.email ? "contact-email-error" : undefined
                    }
                    required
                  />
                  {fieldErrors.email ? (
                    <p
                      id="contact-email-error"
                      className={styles.fieldError}
                      role="alert"
                    >
                      {fieldErrors.email}
                    </p>
                  ) : null}
                </div>

                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <label
                    className={styles.label}
                    htmlFor="contact-message"
                    data-required="true"
                  >
                    Mensaje
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={5}
                    className={styles.textarea}
                    value={form.message}
                    onChange={(e) => updateField("message", e.target.value)}
                    aria-invalid={fieldErrors.message ? "true" : "false"}
                    aria-describedby={
                      fieldErrors.message ? "contact-message-error" : undefined
                    }
                    required
                  />
                  {fieldErrors.message ? (
                    <p
                      id="contact-message-error"
                      className={styles.fieldError}
                      role="alert"
                    >
                      {fieldErrors.message}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className={styles.actions}>
                <button
                  type="submit"
                  className={styles.submit}
                  disabled={isSubmitting}
                >
                  <span>{isSubmitting ? "Enviando..." : "Enviar mensaje"}</span>
                  <span className={styles.arrow} aria-hidden="true">
                    →
                  </span>
                </button>

                {showFormError ? (
                  <p
                    id="contact-form-error"
                    className={styles.formError}
                    role="alert"
                  >
                    No hemos podido enviar el mensaje. Inténtalo de nuevo o
                    escríbenos a{" "}
                    <a href="mailto:contacto@etecestudio.com">
                      contacto@etecestudio.com
                    </a>
                    .
                  </p>
                ) : null}
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
