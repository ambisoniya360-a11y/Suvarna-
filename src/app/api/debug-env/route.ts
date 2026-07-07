import { NextResponse } from 'next/server';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  return NextResponse.json({
    hasUrl: !!url,
    urlValue: url,
    urlLength: url.length,
    urlContainsSpace: url.includes(' '),
    urlContainsQuote: url.includes('"') || url.includes("'"),
    urlContainsPlaceholder: url.includes('placeholder'),
    hasAnonKey: !!anonKey,
    anonKeyLength: anonKey.length,
    anonKeyContainsQuote: anonKey.includes('"') || anonKey.includes("'"),
    hasServiceKey: !!serviceKey,
    serviceKeyLength: serviceKey.length,
    serviceKeyContainsQuote: serviceKey.includes('"') || serviceKey.includes("'"),
  });
}
