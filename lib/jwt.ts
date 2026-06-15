const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-xeno-crm-jwt-key";

// Helper to convert array buffer or Uint8Array to base64url
function bufferToBase64Url(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

// Helper to convert base64url to array buffer
function base64UrlToBuffer(base64url: string): ArrayBuffer {
  let base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// Helper to import the crypto key
async function getCryptoKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: { name: "SHA-256" } },
    false,
    ["sign", "verify"]
  );
}

// Sign JWT (returns standard encoded token)
export async function signJWT(payload: Record<string, any>): Promise<string> {
  const enc = new TextEncoder();
  const header = { alg: "HS256", typ: "JWT" };
  const headerStr = bufferToBase64Url(enc.encode(JSON.stringify(header)));
  const payloadStr = bufferToBase64Url(enc.encode(JSON.stringify(payload)));
  
  const key = await getCryptoKey(JWT_SECRET);
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    enc.encode(`${headerStr}.${payloadStr}`)
  );
  const signatureStr = bufferToBase64Url(signatureBuffer);
  
  return `${headerStr}.${payloadStr}.${signatureStr}`;
}

// Verify JWT (returns parsed payload if valid, else null)
export async function verifyJWT(token: string): Promise<Record<string, any> | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [headerStr, payloadStr, signatureStr] = parts;
    
    const key = await getCryptoKey(JWT_SECRET);
    const enc = new TextEncoder();
    const data = enc.encode(`${headerStr}.${payloadStr}`);
    const signatureBuffer = base64UrlToBuffer(signatureStr);
    
    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBuffer,
      data
    );
    
    if (!isValid) return null;
    
    const dec = new TextDecoder();
    const payloadBytes = base64UrlToBuffer(payloadStr);
    const payload = JSON.parse(dec.decode(payloadBytes));
    return payload;
  } catch {
    return null;
  }
}
