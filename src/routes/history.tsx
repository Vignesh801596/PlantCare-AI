import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { clearHistory, loadHistory, STATUS_LABEL, type ScanRecord } from "@/lib/history";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Recognition History | PlantCare AI" },
      {
        name: "description",
        content: "Locally stored history of plant disease recognitions with confidence and status.",
      },
      { property: "og:title", content: "Recognition History | PlantCare AI" },
      {
        property: "og:description",
        content: "Locally stored history of plant disease recognitions.",
      },
    ],
  }),
  component: History,
});

function History() {
  const [history, setHistory] = useState<ScanRecord[]>([]);
  useEffect(() => setHistory(loadHistory()), []);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Recognition History
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Stored only in this browser. Nothing is uploaded to a database.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            clearHistory();
            setHistory([]);
          }}
          disabled={history.length === 0}
          className="rounded-md border border-input px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50"
        >
          Clear History
        </button>
      </header>

      {history.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-10 text-center">
          <p className="text-sm text-muted-foreground">No scans recorded yet.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {history.map((r) => (
            <li
              key={r.id}
              className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center"
            >
              <img
                src={r.imageDataUrl}
                alt={`${r.plant} scan`}
                className="h-20 w-20 shrink-0 rounded-md border border-border object-cover"
              />
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">
                  Plant: {r.plant}
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    {r.plantConfidence == null ? "" : `(${r.plantConfidence}%)`}
                  </span>
                </p>
                <p className="text-sm text-muted-foreground">Disease: {r.disease}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(r.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-sm font-medium text-foreground">
                  Disease confidence: {r.confidence === null ? "Not available" : `${r.confidence}%`}
                </p>
                <p className="text-xs text-muted-foreground">{STATUS_LABEL[r.status]}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
