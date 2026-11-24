import { createTransport } from "nodemailer";

interface ResetMail {
  to: string;
  name: string;
  url: string;
}

function smtp() {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  if (!host || !user || !pass) return null;
  const port = Number(process.env.SMTP_PORT) || 587;
  return { host, port, secure: port === 465, auth: { user, pass } };
}

export async function sendLibraryNotice(to: string, name: string, subject: string, text: string): Promise<void> {
  const config = smtp();
  const greeting = name.trim() || "Hola";
  const body = `${greeting},\n\n${text}\n\nBiblioteca UAI`;
  if (!config) {
    console.info(`\n[biblioteca] aviso para ${to}: ${subject}\n${body}\n`);
    return;
  }
  const from = process.env.SMTP_FROM?.trim() || config.auth.user;
  const transport = createTransport(config);
  await transport.sendMail({ from, to, subject, text: body });
}

export async function sendPasswordResetEmail({ to, name, url }: ResetMail): Promise<void> {
  const config = smtp();
  const greeting = name.trim() || "Hola";
  const text = [
    `${greeting},`,
    "",
    "Pediste cambiar la contraseña de Biblioteca UAI.",
    "El enlace vale una hora:",
    url,
    "",
    "Si no fuiste vos, ignorá este mensaje.",
  ].join("\n");

  if (!config) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Faltan SMTP_HOST, SMTP_USER y SMTP_PASS para enviar el correo de recuperación");
    }
    console.info(`\n[biblioteca] SMTP no configurado. Enlace de recuperación para ${to}:\n${url}\n`);
    return;
  }

  const from = process.env.SMTP_FROM?.trim() || config.auth.user;
  const transport = createTransport(config);
  await transport.sendMail({
    from,
    to,
    subject: "Restablecé tu contraseña — Biblioteca UAI",
    text,
  });
}
