'use client'

import type { ByokProvider } from './types'

const WRAP_KEY_LS = 'nexinc-byok-wrap-v2'
const BUNDLE_LS = 'nexinc-byok-bundle-v2'

function u8ToB64(buf: Uint8Array): string {
  let s = ''
  for (let i = 0; i < buf.length; i++) s += String.fromCharCode(buf[i])
  return btoa(s)
}

function b64ToU8(b64: string): Uint8Array {
  const bin = atob(b64)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

async function getWrappingKey(): Promise<CryptoKey> {
  if (typeof window === 'undefined') {
    throw new Error('BYOK storage is only available in the browser')
  }
  let rawB64 = localStorage.getItem(WRAP_KEY_LS)
  if (!rawB64) {
    const raw = new Uint8Array(32)
    crypto.getRandomValues(raw)
    rawB64 = u8ToB64(raw)
    localStorage.setItem(WRAP_KEY_LS, rawB64)
  }
  const rawKey = b64ToU8(rawB64)
  return crypto.subtle.importKey('raw', rawKey, 'AES-GCM', false, ['encrypt', 'decrypt'])
}

export async function encryptSecret(plain: string): Promise<string> {
  const key = await getWrappingKey()
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const enc = new TextEncoder().encode(plain)
  const ct = new Uint8Array(
    await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc),
  )
  return JSON.stringify({
    iv: u8ToB64(iv),
    ct: u8ToB64(ct),
  })
}

export async function decryptSecret(payload: string): Promise<string> {
  const key = await getWrappingKey()
  const { iv: ivB64, ct: ctB64 } = JSON.parse(payload) as { iv: string; ct: string }
  const iv = b64ToU8(ivB64)
  const ct = b64ToU8(ctB64)
  const dec = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct)
  return new TextDecoder().decode(dec)
}

export type EncryptedKeyBundle = Partial<Record<ByokProvider, string>>

export function readEncryptedBundle(): EncryptedKeyBundle {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(BUNDLE_LS)
    if (!raw) return {}
    return JSON.parse(raw) as EncryptedKeyBundle
  } catch {
    return {}
  }
}

export async function saveProviderKey(
  provider: ByokProvider,
  apiKey: string | null,
): Promise<void> {
  if (typeof window === 'undefined') return
  const bundle = readEncryptedBundle()
  if (!apiKey?.trim()) {
    delete bundle[provider]
  } else {
    bundle[provider] = await encryptSecret(apiKey.trim())
  }
  localStorage.setItem(BUNDLE_LS, JSON.stringify(bundle))
}

export async function loadProviderKey(provider: ByokProvider): Promise<string | null> {
  const bundle = readEncryptedBundle()
  const entry = bundle[provider]
  if (!entry) return null
  try {
    return await decryptSecret(entry)
  } catch {
    return null
  }
}

export async function clearAllProviderKeys(): Promise<void> {
  if (typeof window === 'undefined') return
  localStorage.removeItem(BUNDLE_LS)
}
