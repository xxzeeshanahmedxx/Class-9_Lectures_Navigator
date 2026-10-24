// Redirect every *.pages.dev hostname to the canonical custom domain.
//
// 9lectures.pages.dev and its per-deployment aliases (<hash>.9lectures.pages.dev)
// are permanently published by Cloudflare Pages and cannot be disabled, so the
// only place to neutralise them is here, in front of the assets.
//
// class9hub.com and www.class9hub.com are untouched: the hostname check below
// only matches pages.dev hosts, so production traffic is never redirected.

const CANONICAL = "https://class9hub.com";
const PAGES_HOST = "9lectures.pages.dev";

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const host = url.hostname.toLowerCase();

  if (host === PAGES_HOST || host.endsWith("." + PAGES_HOST)) {
    return Response.redirect(CANONICAL + url.pathname + url.search, 301);
  }

  return context.next();
}
