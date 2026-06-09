export interface UploadOptions {
  /** Tiden base URL, e.g. http://localhost:1140 */
  url: string
  productId: string
  /** API token (CI). */
  authToken: string
  release?: string
}

export interface UploadItem {
  fileName: string
  debugId: string
  mapBytes: Uint8Array
}

// makeUploader returns a two-phase uploader: create (presigned PUT) -> PUT bytes
// -> confirm. The server validates the staged object on confirm.
export function makeUploader(o: UploadOptions): (item: UploadItem) => Promise<void> {
  const base = o.url.replace(/\/+$/, '')
  const authHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${o.authToken}` }

  return async (item) => {
    const createRes = await fetch(`${base}/v1/products/${o.productId}/sourcemaps`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        debug_id: item.debugId,
        file_name: item.fileName,
        release_name: o.release ?? '',
        byte_size: item.mapBytes.length,
      }),
    })
    if (!createRes.ok) throw new Error(`create failed: ${createRes.status}`)
    const created = (await createRes.json()) as { id: string; uploadUrl: string }

    const put = await fetch(created.uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: item.mapBytes,
    })
    if (!put.ok) throw new Error(`PUT failed: ${put.status}`)

    const confirm = await fetch(`${base}/v1/sourcemaps/${created.id}:confirm`, {
      method: 'POST',
      headers: authHeaders,
      body: '{}',
    })
    if (!confirm.ok) throw new Error(`confirm failed: ${confirm.status}`)
  }
}
