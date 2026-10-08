# PlantCare AI — Plant Disease Detection

AI/ML computer-vision web application that analyzes an uploaded plant/leaf photo,
identifies the plant, then attempts disease classification and reports an honest
confidence score with educational information.

**Sections:** Dashboard · Disease Detection · Recognition History · About Project

## How it works

1. Upload an image (JPG/PNG/WEBP, up to 8 MB) on the Disease Detection page.
2. The photo is sent to a server-side AI inference endpoint.
3. The AI identifies the plant first, then looks for disease symptoms.
4. The result shows plant name, disease (or "Unable to determine"), status,
   confidence, what the result means, and basic plant information.
5. Every successful scan is saved to Recognition History in your browser
   (localStorage only — no database, no login).

Confidence always reflects the actual prediction: when the disease cannot be
reliably classified, the app shows "Not available" instead of a misleading
high percentage. Predictions are for educational purposes only.

## Run locally

Requirements: Node.js 20+ (install via [nvm](https://github.com/nvm-sh/nvm#installing-and-updating)) and npm.

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

Open the printed local URL (default `http://localhost:8080`).

### AI detection key

The `/api/detect` endpoint calls the Lovable AI Gateway and reads
`LOVABLE_API_KEY` from the environment. Running `npm run dev` inside the
Lovable editor supplies this automatically. To run fully outside Lovable,
provide your own compatible key:

```sh
LOVABLE_API_KEY=<your-key> npm run dev
```

Without a working key, the pages render normally but detection returns an
error state — upload, preview, history, and all other features keep working.

## Other scripts

| Command | Purpose |
| --- | --- |
| `npm run build` | Production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

## Tech stack

- TanStack Start (React 19, file-based routing, server functions/routes)
- TypeScript
- Tailwind CSS v4
- Lovable AI Gateway (multimodal image inference)

## Notes

- No authentication, database, or external accounts are required.
- Recognition history lives only in this browser; use "Clear History" to wipe it.
- The AI recognizes plant/disease classes it was trained on and reports
  uncertainty honestly rather than guessing outside that scope.
