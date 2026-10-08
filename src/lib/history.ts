export type ScanStatus = "healthy" | "diseased" | "undetermined" | "not_plant";

export type ScanRecord = {
  id: string;
  imageDataUrl: string;
  plant: string;
  plantConfidence?: number | null;
  disease: string;
  status: ScanStatus;
  /** null when the model could not give an honest confidence for the shown prediction */
  confidence: number | null;
  createdAt: string;
};

export const STATUS_LABEL: Record<ScanStatus, string> = {
  healthy: "Healthy",
  diseased: "Disease Detected",
  undetermined: "Needs further analysis",
  not_plant: "No plant detected",
};

const KEY = "plantcare-ai-history";

export function loadHistory(): ScanRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const list = raw ? (JSON.parse(raw) as ScanRecord[]) : [];
    return list.filter((r) => r && typeof r.plant === "string" && STATUS_LABEL[r.status]);
  } catch {
    return [];
  }
}

export function saveScan(record: ScanRecord): ScanRecord[] {
  const next = [record, ...loadHistory()].slice(0, 30);
  window.localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export function clearHistory() {
  window.localStorage.removeItem(KEY);
}
