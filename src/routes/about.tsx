import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Project | PlantCare AI" },
      {
        name: "description",
        content:
          "About PlantCare AI: an AI/ML computer vision project that classifies plant leaf diseases.",
      },
      { property: "og:title", content: "About Project | PlantCare AI" },
      {
        property: "og:description",
        content: "An AI/ML computer vision project that classifies plant leaf diseases.",
      },
    ],
  }),
  component: About,
});

const workflow = [
  "Upload Image",
  "Image Preprocessing",
  "Plant Identification",
  "Disease Identification",
  "Healthy / Diseased Decision",
  "Confidence Score",
  "Result and Meaning",
];

function About() {
  return (
    <div className="max-w-3xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">About Project</h1>
      </header>

      <section className="rounded-lg border border-border bg-card p-5">
        <dl className="grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs text-muted-foreground">Project Name</dt>
            <dd className="text-sm font-medium text-foreground">PlantCare AI</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Project</dt>
            <dd className="text-sm font-medium text-foreground">Plant Disease Detection</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Domain</dt>
            <dd className="text-sm font-medium text-foreground">
              Artificial Intelligence / Machine Learning / Computer Vision
            </dd>
          </div>
        </dl>
        <p className="mt-4 text-sm text-muted-foreground">
          PlantCare AI analyses an uploaded plant or leaf image in two stages using an AI/ML vision
          model. The image is read and validated in the browser, then sent to a server-side inference
          endpoint which first identifies the plant species, and only then examines the visible
          symptoms to decide whether the plant is healthy or diseased and which disease it is. The
          plant name, disease name, status, confidence and explanation shown in the result card all
          come from that inference. CodeTech AI internship project #24.
        </p>
      </section>

      <section className="rounded-lg border border-border bg-card p-5">
        <h2 className="text-sm font-semibold text-foreground">Workflow</h2>
        <ol className="mt-4 space-y-2">
          {workflow.map((step, i) => (
            <li key={step} className="text-sm text-foreground">
              <span className="mr-2 text-muted-foreground">{i + 1}.</span>
              {step}
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-lg border border-border bg-card p-5">
        <h2 className="text-sm font-semibold text-foreground">Scope and honesty</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Plant identification and disease recognition are both produced by live model inference, not
          by fixed rules or stored mappings. The model covers a broad range of common ornamental and
          crop plants, but it is not exhaustive: when the symptoms in an image are ambiguous or the
          disease cannot be named reliably, the result shows “Unable to determine” with the status
          “Needs further analysis” and no confidence value, rather than an invented disease or an
          inflated percentage. The confidence shown always belongs to the prediction displayed next
          to it.
        </p>
      </section>

      <p className="rounded-md border border-border bg-secondary p-4 text-sm text-foreground">
        AI prediction is for educational purposes only. Verify the result with a qualified
        agricultural professional before taking action.
      </p>
    </div>
  );
}
