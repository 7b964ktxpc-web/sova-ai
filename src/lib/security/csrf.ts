import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const CSRF_SECRET = process.env.CSRF_SECRET || 'sova-csrf-secret-change-in-production'
const CSRF_COOKIE = 'sova-csrf-token'
const CSRF_HEADER = 'x-sova-csrf-token'

function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

function signCsrfToken(token: string): string {
  const hmac = crypto.createHmac('sha256', CSRF_SECRET)
  hmac.update(token)
  return hmac.digest('hex')
}

export function getCsrfToken(): string {
  return generateCsrfToken()
}

export function validateCsrfToken(token: string, signature: string): boolean {
  const expectedSignature = signCsrfToken(token)
  return token.length === 64 && signature.length === 64 && signature === expectedSignature
}

export async function csrfMiddleware(request: NextRequest): Promise<{ valid: boolean; token?: string }> {
  const method = request.method
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return { valid: true }
  }

  const token = request.cookies.get(CSRF_COOKIE)?.value
  const signature = request.headers.get(CSRF_HEADER)

  if (!token || !signature) {
    return { valid: false }
  }

  const valid = validateCsrfToken(token, signature)
  return { valid, token }
}

export function setCsrfCookie(response: NextResponse, token: string) {
  const signature = signCsrfToken(token)
  response.cookies.set(CSRF_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 3600,
    path: '/',
  })
  response.headers.set(CSRF_HEADER, signature)
}
