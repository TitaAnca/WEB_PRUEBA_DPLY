from playwright.sync_api import sync_playwright

VIEWPORTS = [(1536, 864), (1440, 900), (1366, 768), (1920, 1080), (1280, 720)]
PORT = 3003

MEASURE = """
() => {
  const root = document.querySelector('#nosotros');
  const grid = root?.querySelector('[class*="grid"]');
  const frame = root?.querySelector('[class*="visualFrame"]');
  const para = root?.querySelector('[class*="copyText"]');
  const title = root?.querySelector('h2');
  if (!frame || !para || !grid) return { error: 'missing' };
  const fr = frame.getBoundingClientRect();
  const pr = para.getBoundingClientRect();
  const tr = title?.getBoundingClientRect();
  const gap = pr.bottom - fr.bottom;
  return {
    gridCols: getComputedStyle(grid).gridTemplateColumns,
    gap: Math.round(gap * 10) / 10,
    frameHeight: Math.round(fr.height * 10) / 10,
    frameHeightCss: getComputedStyle(frame).height,
    titleTop: title ? Math.round(tr.top * 10) / 10 : null,
    titleMarginTop: title ? getComputedStyle(title).marginTop : null,
  };
}
"""

with sync_playwright() as p:
    browser = p.chromium.launch()
    for w, h in VIEWPORTS:
        page = browser.new_page(viewport={"width": w, "height": h})
        page.goto(f"http://localhost:{PORT}/", wait_until="networkidle", timeout=120000)
        page.wait_for_timeout(8000)
        page.evaluate("document.getElementById('nosotros')?.scrollIntoView({ block: 'center' })")
        page.wait_for_timeout(1500)
        d = page.evaluate(MEASURE)
        d["viewport"] = f"{w}x{h}"
        print(d)
        page.close()
    browser.close()
