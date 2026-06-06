/** Wait until document.body has `site-revealed` (post-preloader). */

export function waitForSiteReveal(): Promise<void> {
  const body = document.body;
  return new Promise((resolve) => {
    if (body.classList.contains("site-revealed")) {
      resolve();
      return;
    }
    const observer = new MutationObserver(() => {
      if (!body.classList.contains("site-revealed")) return;
      observer.disconnect();
      resolve();
    });
    observer.observe(body, { attributes: true, attributeFilter: ["class"] });
  });
}
