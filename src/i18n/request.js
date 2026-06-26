import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

const supportedLocales = ["en", "fr"];

function getLocaleFromCookie(request) {
  if (request?.headers?.get) {
    const cookieHeader = request.headers.get("cookie") || "";
    const match = cookieHeader.match(/(?:^|; )site_lang=([^;]+)/);
    if (!match) return undefined;
    const locale = match[1].toLowerCase();
    return supportedLocales.includes(locale) ? locale : undefined;
  }
  return undefined;
}

async function getLocaleFromCookiesAsync() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get("site_lang");
  const locale = cookie?.value?.toLowerCase();
  return supportedLocales.includes(locale) ? locale : undefined;
}

async function fetchMessages(locale) {
  const BUCKET_BASE_URL = process.env.FIREBASE_MESSAGES_URL;

  const url = `${BUCKET_BASE_URL}${locale}.json?alt=media`;

  const res = await fetch(url, {
    next: { revalidate: 3600 }, // cache for 1 hour, or use { cache: "no-store" } to always fetch fresh
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch messages for locale "${locale}": ${res.status}`);
  }

  return res.json();
}

export default getRequestConfig(async (request) => {
  const fromRequest = getLocaleFromCookie(request);
  const locale = fromRequest || (await getLocaleFromCookiesAsync()) || "en";

  return {
    locale,
    messages: await fetchMessages(locale),
  };
});