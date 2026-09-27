import { apiJson } from "../../lib/api.js";
import { type Scope } from "../shared.js";
export const root = ({ companyId, branchId }: Scope) =>
  `v1/companies/${companyId}/branches/${branchId}`;

export async function uploadTrainingEvidence(scope: Scope, file: File): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', await file.arrayBuffer());
  const sha256 = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
  const reserved = await apiJson<{ id: string; status: string; upload?: { url: string; headers: Record<string, string> } }>(`${root(scope)}/training-certificates`, {
    method: 'post', json: { clientUuid: crypto.randomUUID(), mimeType: file.type, byteSize: file.size, sha256 },
  });
  if (reserved.status !== 'confirmed' && reserved.upload) {
    const response = await fetch(reserved.upload.url, { method: 'PUT', headers: reserved.upload.headers, body: file });
    if (!response.ok) throw new Error('Falha ao enviar a evidência');
    await apiJson(`${root(scope)}/training-certificates/${reserved.id}/confirm`, { method: 'post' });
  }
  return reserved.id;
}

