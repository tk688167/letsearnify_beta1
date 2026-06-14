import type { UploadKind } from "@/lib/upload-types"

type UploadResponse = {
  path: string
  url: string
}

export async function uploadFileFromClient(file: File, kind: UploadKind): Promise<UploadResponse> {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("kind", kind)

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || "Upload failed.")
  }

  return response.json()
}
