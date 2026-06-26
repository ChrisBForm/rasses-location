import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

const BUCKET_BASE_URL = process.env.FIREBASE_MESSAGES_URL;

async function fetchSupportedLocales() {
  const res = await fetch(`${BUCKET_BASE_URL}config.json?alt=media`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error("Failed to fetch supported locales");
  const { supportedLocales } = await res.json();
  return supportedLocales;
}

async function fetchMessages(locale) {
  const res = await fetch(`${BUCKET_BASE_URL}${locale}.json?alt=media`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`Failed to fetch messages for locale "${locale}": ${res.status}`);
  return res.json();
}

function getLocaleFromCookie(request, supportedLocales) {
  if (request?.headers?.get) {
    const cookieHeader = request.headers.get("cookie") || "";
    const match = cookieHeader.match(/(?:^|; )site_lang=([^;]+)/);
    if (!match) return undefined;
    const locale = match[1].toLowerCase();
    return supportedLocales.includes(locale) ? locale : undefined;
  }
  return undefined;
}

async function getLocaleFromCookiesAsync(supportedLocales) {
  const cookieStore = await cookies();
  const cookie = cookieStore.get("site_lang");
  const locale = cookie?.value?.toLowerCase();
  return supportedLocales.includes(locale) ? locale : undefined;
}

export default getRequestConfig(async (request) => {
  const supportedLocales = await fetchSupportedLocales();
  const fromRequest = getLocaleFromCookie(request, supportedLocales);
  const locale = fromRequest || (await getLocaleFromCookiesAsync(supportedLocales)) || supportedLocales[0];

  return {
    locale,
    messages: await fetchMessages(locale),
  };
});