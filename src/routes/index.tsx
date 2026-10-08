import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ScanLine } from "lucide-react";
import { loadHistory, STATUS_LABEL, type ScanRecord } from "@/lib/history";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard | PlantCare AI" },
      {
        name: "description",
        content: "Scan totals, latest plant disease prediction and confidence for PlantCare AI.",
      },
      { property: "og:title", content: "Dashboard | PlantCare AI" },
      {
        property: "og:description",
        content: "Scan totals, latest plant disease prediction and confidence.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const [history, setHistory] = useState<ScanRecord[]>([]);
  useEffect(() => setHistory(loadHistory()), []);
  const last = history[0];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            AI plant disease recognition overview for this browser session.
          </p>
        </div>
        <Link
          to="/detect"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <ScanLine className="h-4 w-4" /> Start Disease Detection
        </Link>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Stat label="Total Scans" value={String(history.length)} />
        <Stat label="Last Plant" value={last ? last.plant : "—"} />
        <Stat label="Last Disease" value={last ? last.disease : "—"} />
        <Stat
          label="Last Confidence"
          value={last ? (last.confidence === null ? "Not available" : `${last.confidence}%`) : "—"}
        />
        <Stat label="Last Status" value={last ? STATUS_LABEL[last.status] : "No scans yet"} />
      </div>

      <section className="rounded-lg border border-border bg-card p-5">
        <h2 className="text-sm font-semibold text-foreground">Recent Recognition</h2>
        {last ? (
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
            <img
              src={last.imageDataUrl}
              alt={`${last.plant} scan`}
              className="h-32 w-32 shrink-0 rounded-md border border-border object-cover"
            />
            <dl className="grid flex-1 gap-2 sm:grid-cols-2">
              <Field label="Plant" value={last.plant} />
              <Field label="Disease" value={last.disease} />
              <Field
                label="Confidence"
                value={last.confidence === null ? "Not available" : `${last.confidence}%`}
              />
              <Field label="Status" value={STATUS_LABEL[last.status]} />
              <Field label="Scanned" value={new Date(last.createdAt).toLocaleString()} />
            </dl>
          </div>
        ) : (
          <div className="mt-4 rounded-md border border-dashed border-border p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No recognitions yet. Upload a leaf image to run your first scan.
            </p>
            <Link
              to="/detect"
              className="mt-4 inline-flex items-center gap-2 rounded-md border border-input px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              Go to Disease Detection
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-2 text-lg font-semibold text-foreground">{value}</p>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}
