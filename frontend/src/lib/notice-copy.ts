import { formatDay, todayKey } from "./days";

export interface SpokenNotice {
  label: string;
  text: string;
}

function dayIn(text: string): string | undefined {
  return text.match(/\d{2}\/\d{2}\/\d{4}/)?.[0];
}

/** El texto guardado puede nombrar el libro. En pantalla se arma de nuevo, solo para el lector. */
export function speakNotice(kind: string, stored = ""): SpokenNotice {
  const date = dayIn(stored);
  const late = /fuera de plazo|ya había pasado/i.test(stored);
  if (kind === "loan") {
    return {
      label: "Retiro",
      text: date ? `Ya lo retiraste. Devolvelo antes del ${date}.` : "Ya lo retiraste. La fecha está en Alquilados.",
    };
  }
  if (kind === "returned") {
    return late
      ? { label: "Devolución", text: "Lo devolvimos, pero el plazo ya había pasado." }
      : { label: "Devolución", text: "Ya lo devolvimos. Si no llegaste a 3, podés pedir otro." };
  }
  if (kind === "overdue") {
    return {
      label: "Vencido",
      text: date
        ? `Se te pasó la fecha del ${date}. Devolvelo para poder pedir otro.`
        : "Se te venció un préstamo. Devolvelo para poder pedir otro.",
    };
  }
  if (kind === "updated") {
    return {
      label: "Nueva fecha",
      text: date ? `Te cambiamos la fecha. Ahora lo devolvés el ${date}.` : "Te cambiamos la fecha de devolución.",
    };
  }
  return { label: "Aviso", text: "Tenés una novedad de la biblioteca." };
}

export function tookBook(due: string): string {
  return `Ya lo retiraste. Devolvelo antes del ${formatDay(due)}.`;
}

export function gaveBook(due: string): string {
  return due.slice(0, 10) < todayKey()
    ? "Lo devolvimos, pero el plazo ya había pasado."
    : "Ya lo devolvimos. Si no llegaste a 3, podés pedir otro.";
}
