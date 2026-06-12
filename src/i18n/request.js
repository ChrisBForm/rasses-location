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

export default getRequestConfig(async (request) => {
  const fromRequest = getLocaleFromCookie(request);
  const locale = fromRequest || (await getLocaleFromCookiesAsync()) || "en";

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});