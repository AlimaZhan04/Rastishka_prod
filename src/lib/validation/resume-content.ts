const DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export function isDetectedResumeTypeCompatible({
  extension,
  declaredMime,
  detectedMime,
}: {
  extension: string;
  declaredMime: string;
  detectedMime: string | undefined;
}): boolean {
  if (!detectedMime) return false;
  if (extension === ".docx") return detectedMime === DOCX_MIME;
  if (extension === ".doc") return detectedMime === "application/x-cfb";
  return detectedMime === declaredMime;
}
