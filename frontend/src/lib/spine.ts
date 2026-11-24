const spines = ["#4f46e5", "#0f766e", "#be185d", "#b45309", "#1d4ed8", "#7c3aed"];

export function spineColor(title: string): string {
  let index = 0;
  for (const char of title) index = (index + char.charCodeAt(0)) % spines.length;
  return spines[index] ?? spines[0];
}
