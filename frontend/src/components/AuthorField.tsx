import { useMemo, useState } from "react";

const NEW_AUTHOR = "__nuevo__";

interface AuthorFieldProps {
  value: string;
  authors: string[];
  error?: string;
  onChange: (author: string) => void;
}

export const AuthorField = ({ value, authors, error, onChange }: AuthorFieldProps) => {
  const known = useMemo(
    () => [...new Set(authors.map((author) => author.trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, "es")),
    [authors],
  );
  const [mode, setMode] = useState<"list" | "new">(value && !known.includes(value) ? "new" : "list");
  const options = mode === "list" && value && !known.includes(value) ? [...known, value].sort((a, b) => a.localeCompare(b, "es")) : known;

  return (
    <div className="flex flex-col gap-3">
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Autor
        <select
          className="field font-normal"
          value={mode === "new" ? NEW_AUTHOR : value}
          onChange={(event) => {
            if (event.target.value === NEW_AUTHOR) {
              setMode("new");
              onChange("");
              return;
            }
            setMode("list");
            onChange(event.target.value);
          }}
        >
          <option value="">Elegí un autor</option>
          {options.map((author) => (
            <option key={author} value={author}>
              {author}
            </option>
          ))}
          <option value={NEW_AUTHOR}>Autor nuevo</option>
        </select>
      </label>
      {mode === "new" && (
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Nombre del autor
          <input className="field font-normal" value={value} placeholder="Apellido y nombre" onChange={(event) => onChange(event.target.value)} />
        </label>
      )}
      {error && <span className="field-error">{error}</span>}
    </div>
  );
};
