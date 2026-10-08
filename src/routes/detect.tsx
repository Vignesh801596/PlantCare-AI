import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Upload, ImageIcon, Loader2, AlertCircle, CheckCircle2, ShieldAlert, Leaf } from "lucide-react";
import { saveScan, STATUS_LABEL, type ScanRecord, type ScanStatus } from "@/lib/history";

export const Route = createFileRoute("/detect")({
  head: () => ({
    meta: [
      { title: "Disease Detection | PlantCare AI" },
      {
        name: "description",
        content:
          "Upload a leaf image: PlantCare AI identifies the plant first, then the disease, with honest confidence.",
      },
      { property: "og:title", content: "Disease Detection | PlantCare AI" },
      {
        property: "og:description",
        content: "Identify the plant first, then the disease, with real model confidence.",
      },
    ],
  }),
  component: Detect,
});

type Result = {
  plant: string;
  plantConfidence: number | null;
  plantInfo: string;
  disease: string;
  status: ScanStatus;
  confidence: number | null;
  meaning: string;
};

const MAX_BYTES = 8 * 1024 * 1024;

function clamp(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.min(100, Math.round(value)))
    : null;
}

function Detect() {
  const [image, setImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setResult(null);
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Unsupported format. Please use a JPG, PNG or WEBP image.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Image is larger than 8 MB. Please use a smaller image.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImage(String(reader.result));
      setFileName(file.name);
    };
    reader.onerror = () => setError("Could not read that file. Please try another image.");
    reader.readAsDataURL(file);
  }

  function reset() {
    setImage(null);
    setFileName("");
    setResult(null);
    setError(null);
    setLoading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function detect() {
    if (!image) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageDataUrl: image }),
      });
      const data = (await res.json()) as {
        error?: string;
        is_plant_image?: boolean;
        plant_name?: string | null;
        plant_confidence?: number | null;
        plant_info?: string;
        disease_name?: string | null;
        disease_confidence?: number | null;
        status?: string;
        meaning?: string;
      };
      if (!res.ok) {
        setError(data.error ?? "Detection failed. Please try again.");
        return;
      }

      const allowed: ScanStatus[] = ["healthy", "diseased", "undetermined", "not_plant"];
      let status: ScanStatus = allowed.includes(data.status as ScanStatus)
        ? (data.status as ScanStatus)
        : "undetermined";
      const plantName = data.plant_name?.trim() || "";
      if (!plantName && data.is_plant_image === false) status = "not_plant";
      if (!plantName && status === "diseased") status = "undetermined";
      const diseaseName = data.disease_name?.trim() || "";
      if (status === "diseased" && !diseaseName) status = "undetermined";

      // Confidence belongs to the prediction actually displayed; never shown when
      // the model could not settle on a disease.
      const diseaseConfidence = clamp(data.disease_confidence);
      const confidence =
        status === "diseased" || status === "healthy" ? diseaseConfidence : null;

      const next: Result = {
        plant: plantName || (status === "not_plant" ? "No plant detected" : "Unable to identify"),
        plantConfidence: plantName ? clamp(data.plant_confidence) : null,
        plantInfo: data.plant_info?.trim() ?? "",
        disease:
          status === "healthy"
            ? "None"
            : status === "diseased"
              ? diseaseName
              : "Unable to determine",
        status,
        confidence,
        meaning: data.meaning?.trim() ?? "",
      };
      setResult(next);

      if (status !== "not_plant") {
        const record: ScanRecord = {
          id: crypto.randomUUID(),
          imageDataUrl: image,
          plant: next.plant,
          plantConfidence: next.plantConfidence,
          disease: next.disease,
          status,
          confidence,
          createdAt: new Date().toISOString(),
        };
        saveScan(record);
      }
    } catch {
      setError("Network problem while contacting the AI model. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Disease Detection</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload a clear photo of a single leaf. The model identifies the plant first, then looks for
          disease symptoms.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-border bg-card p-5">
          <h2 className="text-sm font-semibold text-foreground">1. Upload image</h2>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              handleFile(e.dataTransfer.files?.[0]);
            }}
            className={`mt-4 flex flex-col items-center justify-center rounded-md border-2 border-dashed p-8 text-center transition-colors ${
              dragging ? "border-primary bg-secondary" : "border-border bg-background"
            }`}
          >
            {image ? (
              <div className="w-full">
                <img
                  src={image}
                  alt="Uploaded leaf preview"
                  className="mx-auto max-h-64 w-auto rounded-md object-contain"
                />
                <p className="mt-3 truncate text-xs text-muted-foreground">{fileName}</p>
              </div>
            ) : (
              <>
                <Upload className="h-8 w-8 text-muted-foreground" />
                <p className="mt-3 text-sm font-medium text-foreground">
                  Drag and drop a leaf image here
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Supported formats: JPG, PNG, WEBP · up to 8 MB
                </p>
              </>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
              >
                <ImageIcon className="h-4 w-4" /> Browse Image
              </button>
              <button
                type="button"
                onClick={detect}
                disabled={!image || loading}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {loading ? "Analyzing…" : "Detect Disease"}
              </button>
              <button
                type="button"
                onClick={reset}
                disabled={loading}
                className="rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
              >
                Clear
              </button>
            </div>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            The plant name and the disease both come from live model inference. When the symptoms are
            not clear enough, the result says so instead of guessing a disease.
          </p>
        </section>

        <section className="rounded-lg border border-border bg-card p-5">
          <h2 className="text-sm font-semibold text-foreground">2. Result</h2>

          {error ? (
            <div className="mt-4 flex items-start gap-3 rounded-md border border-destructive/40 bg-destructive/10 p-4">
              <AlertCircle className="mt-0.5 h-5 w-5 text-destructive" />
              <div>
                <p className="text-sm font-medium text-foreground">Detection failed</p>
                <p className="mt-1 text-sm text-muted-foreground">{error}</p>
              </div>
            </div>
          ) : null}

          {loading ? (
            <div className="mt-4 space-y-3 rounded-md border border-border p-4">
              <div className="flex items-center gap-2 text-sm text-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Identifying plant, then analysing
                symptoms…
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div className="h-full w-1/3 animate-pulse rounded-full bg-primary" />
              </div>
            </div>
          ) : null}

          {!loading && !error && !result ? (
            <div className="mt-4 rounded-md border border-dashed border-border p-8 text-center">
              <p className="text-sm text-muted-foreground">
                No analysis yet. Upload a leaf image and select “Detect Disease”.
              </p>
            </div>
          ) : null}

          {result && !loading ? (
            <div className="mt-4 space-y-5">
              <div
                className={`flex items-center gap-2 rounded-md p-3 text-sm font-medium ${
                  result.status === "healthy"
                    ? "bg-primary/10 text-foreground"
                    : result.status === "diseased"
                      ? "bg-destructive/10 text-foreground"
                      : "bg-secondary text-foreground"
                }`}
              >
                {result.status === "healthy" ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : result.status === "diseased" ? (
                  <AlertCircle className="h-4 w-4" />
                ) : (
                  <ShieldAlert className="h-4 w-4" />
                )}
                {STATUS_LABEL[result.status]}
              </div>

              <div className="space-y-4 rounded-md border border-border p-4">
                <Block label="Plant Identified">
                  <p className="flex items-center gap-2 text-lg font-semibold text-foreground">
                    <Leaf className="h-4 w-4 text-primary" />
                    {result.plant}
                  </p>
                  {result.plantConfidence !== null ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Plant identification confidence: {result.plantConfidence}%
                    </p>
                  ) : null}
                </Block>

                <Block label="Disease">
                  <p className="text-lg font-semibold text-foreground">{result.disease}</p>
                </Block>

                <Block label="Status">
                  <p className="text-sm font-medium text-foreground">
                    {STATUS_LABEL[result.status]}
                  </p>
                </Block>

                <Block label="Confidence">
                  {result.confidence === null ? (
                    <p className="text-sm font-medium text-foreground">Not available</p>
                  ) : (
                    <>
                      <p className="text-lg font-semibold text-foreground">{result.confidence}%</p>
                      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${result.confidence}%` }}
                        />
                      </div>
                    </>
                  )}
                </Block>
              </div>

              {result.meaning ? (
                <div>
                  <h3 className="text-sm font-semibold text-foreground">What this means</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{result.meaning}</p>
                </div>
              ) : null}

              {result.plantInfo ? (
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Plant information</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{result.plantInfo}</p>
                </div>
              ) : null}

              {result.status === "undetermined" ? (
                <div className="flex items-start gap-3 rounded-md border border-border bg-secondary p-3">
                  <ShieldAlert className="mt-0.5 h-4 w-4 text-foreground" />
                  <p className="text-sm text-muted-foreground">
                    The disease could not be reliably classified from this image, so no disease name
                    or confidence is shown. Retake the photo with a single affected leaf filling the
                    frame in even daylight, then analyze again.
                  </p>
                </div>
              ) : null}

              {result.status !== "undetermined" &&
              result.confidence !== null &&
              result.confidence < 60 ? (
                <div className="flex items-start gap-3 rounded-md border border-border bg-secondary p-3">
                  <ShieldAlert className="mt-0.5 h-4 w-4 text-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Low confidence ({result.confidence}%). Treat this as a weak indication only and
                    re-photograph the leaf in better light for a clearer call.
                  </p>
                </div>
              ) : null}

              <p className="text-xs text-muted-foreground">
                AI prediction is for educational purposes only. Verify the result with a qualified
                agricultural professional before taking action.
              </p>

              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
              >
                Analyze another image
              </button>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
      <div className="mt-1">{children}</div>
    </div>
  );
}
