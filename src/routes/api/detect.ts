import { createFileRoute } from "@tanstack/react-router";

type Body = { imageDataUrl?: string };

export const Route = createFileRoute("/api/detect")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) {
          return Response.json({ error: "AI service is not configured." }, { status: 500 });
        }

        let body: Body;
        try {
          body = (await request.json()) as Body;
        } catch {
          return Response.json({ error: "Invalid request." }, { status: 400 });
        }

        const imageDataUrl = body.imageDataUrl;
        if (!imageDataUrl || !imageDataUrl.startsWith("data:image/")) {
          return Response.json({ error: "Please upload a valid image file." }, { status: 400 });
        }

        const schema = {
          type: "object",
          additionalProperties: false,
          required: [
            "is_plant_image",
            "plant_name",
            "plant_confidence",
            "plant_info",
            "disease_name",
            "disease_confidence",
            "status",
            "meaning",
          ],
          properties: {
            is_plant_image: {
              type: "boolean",
              description: "True only if the image shows a plant, leaf, flower or crop.",
            },
            plant_name: {
              type: ["string", "null"],
              description:
                "Common name of the identified plant species (e.g. 'Rose', 'Tomato'), or null if no plant can be identified.",
            },
            plant_confidence: {
              type: ["number", "null"],
              description:
                "Your genuine confidence in the plant identification, 0-100, or null if no plant was identified.",
            },
            plant_info: {
              type: "string",
              description:
                "One or two sentences of basic information about the identified plant. Empty string if no plant identified.",
            },
            disease_name: {
              type: ["string", "null"],
              description:
                "Common name of the disease/disorder visible on the plant (e.g. 'Black Spot', 'Early Blight'). Use null when the plant looks healthy OR when the disease cannot be determined from the image.",
            },
            disease_confidence: {
              type: ["number", "null"],
              description:
                "Your genuine confidence in the disease determination, 0-100. Must be null whenever status is 'undetermined' or 'not_plant'. Never inflate this value.",
            },
            status: {
              type: "string",
              enum: ["healthy", "diseased", "undetermined", "not_plant"],
              description:
                "'healthy' if no disease signs, 'diseased' if a disease is identified, 'undetermined' if a plant is visible but the disease cannot be reliably determined, 'not_plant' if the image shows no plant.",
            },
            meaning: {
              type: "string",
              description:
                "Two or three sentences: the visible symptoms observed, what the disease means for the plant, and basic care information. If undetermined, explain why the disease could not be classified reliably.",
            },
          },
        };

        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Lovable-API-Key": apiKey,
            "X-Lovable-AIG-SDK": "fetch",
          },
          body: JSON.stringify({
            model: "openai/gpt-6-astra",
            stream: true,
            reasoning: { effort: "low", summary: "auto" },
            include: ["reasoning.encrypted_content"],
            text: {
              format: {
                type: "json_schema",
                name: "plant_identification_and_disease",
                strict: true,
                schema,
              },
            },
            input: [
              {
                role: "user",
                content: [
                  {
                    type: "input_text",
                    text: "You are a plant pathology vision model. Work in two stages. STAGE 1 - identify the plant species from the image (leaf shape, margin, venation, flower, growth habit) and report plant_name with your honest plant_confidence. STAGE 2 - only then examine the visible symptoms (lesion shape, colour, halo, distribution, mould, mottling, webbing, chlorosis) and decide whether the plant is healthy or diseased, and which disease it is. Use standard pathology names as in public datasets such as PlantVillage (Tomato: Early Blight, Late Blight, Leaf Mold, Septoria Leaf Spot, Bacterial Spot, Target Spot, Yellow Leaf Curl Virus, Mosaic Virus, Spider Mites; Potato: Early/Late Blight; Apple: Apple Scab, Black Rot, Cedar Apple Rust; Grape: Black Rot, Esca, Leaf Blight; Corn: Common Rust, Northern Leaf Blight, Gray Leaf Spot; Pepper: Bacterial Spot; plus others like Powdery Mildew, Rust, Black Spot, Downy Mildew, Anthracnose, Sooty Mold, Chlorosis) and PlantDoc, but only name a disease the visible symptoms support. Report disease_confidence as your genuine calibrated confidence in that disease call. If the symptoms are ambiguous, obscured, or you cannot name a disease reliably, set status to 'undetermined', disease_name to null and disease_confidence to null - never invent a disease and never report a high confidence for a call you are not sure about. If the plant cannot be identified, set plant_name and plant_confidence to null. If the image contains no plant, set status 'not_plant' with null plant and disease fields.",
                  },
                  { type: "input_image", image_url: imageDataUrl },
                ],
              },
            ],
          }),
        });

        if (!upstream.ok || !upstream.body) {
          const detail = await upstream.text().catch(() => "");
          const message =
            upstream.status === 402
              ? "AI credits are exhausted for this workspace."
              : upstream.status === 429
                ? "Too many requests right now. Please try again in a moment."
                : "The AI model could not process this image.";
          console.error("gateway error", upstream.status, detail.slice(0, 500));
          return Response.json({ error: message }, { status: upstream.status });
        }

        // Consume the SSE stream server-side and keep only the final JSON text.
        const reader = upstream.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let text = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            if (!line.startsWith("data:")) continue;
            const payload = line.slice(5).trim();
            if (!payload || payload === "[DONE]") continue;
            try {
              const event = JSON.parse(payload) as {
                type?: string;
                delta?: string;
              };
              if (event.type === "response.output_text.delta" && typeof event.delta === "string") {
                text += event.delta;
              }
            } catch {
              /* ignore keep-alive and partial frames */
            }
          }
        }

        let parsed: {
          is_plant_image?: boolean;
          plant_name?: string | null;
          plant_confidence?: number | null;
          plant_info?: string;
          disease_name?: string | null;
          disease_confidence?: number | null;
          status?: string;
          meaning?: string;
        };
        try {
          parsed = JSON.parse(text.trim());
        } catch {
          return Response.json(
            { error: "The model returned no usable classification. Please try another image." },
            { status: 502 },
          );
        }

        return Response.json(parsed);
      },
    },
  },
});
