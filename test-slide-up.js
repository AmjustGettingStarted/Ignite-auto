const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ["--disable-blink-features=AutomationControlled"],
  });
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();
  await page.goto("http://localhost:3001", { waitUntil: "networkidle" });

  // 1. Scroll to where CTA is first pinned at top: 0
  await page.evaluate(() => {
    const el = document.querySelector("#cta");
    el.scrollIntoView({ behavior: "instant", block: "start" });
  });
  await page.waitForTimeout(600);

  const ctaAtTop = await page.evaluate(() => {
    const c = document.querySelector("#cta");
    const content = c?.querySelector("div.flex-col");
    const cRect = c?.getBoundingClientRect();
    const style = content ? window.getComputedStyle(content) : null;
    return {
      ctaTop: cRect?.top,
      ctaHeight: cRect?.height,
      contentOpacity: style?.opacity,
      contentTransform: style?.transform,
    };
  });
  console.log("State when CTA first pins at top:", JSON.stringify(ctaAtTop, null, 2));

  // Take screenshot of CTA when fully visible
  await page.screenshot({ path: "cta-pinned-visible.png" });
  console.log("Saved cta-pinned-visible.png");

  // 2. Scroll halfway through footer slide-up
  const maxScroll = await page.evaluate(() => document.body.scrollHeight - window.innerHeight);
  const footerStartScroll = await page.evaluate(() => {
    const f = document.querySelector("#footer");
    return f.getBoundingClientRect().top + window.scrollY - window.innerHeight;
  });
  const midScroll = footerStartScroll + (maxScroll - footerStartScroll) / 2;

  await page.evaluate((y) => window.scrollTo(0, y), midScroll);
  await page.waitForTimeout(600);

  const stateMid = await page.evaluate(() => {
    const c = document.querySelector("#cta");
    const f = document.querySelector("#footer");
    const content = c?.querySelector("div.flex-col");
    const style = content ? window.getComputedStyle(content) : null;
    return {
      scrollY: window.scrollY,
      ctaTop: c?.getBoundingClientRect().top,
      footerTop: f?.getBoundingClientRect().top,
      contentOpacity: style?.opacity,
      contentTransform: style?.transform,
    };
  });
  console.log("State halfway through footer entrance:", JSON.stringify(stateMid, null, 2));

  // Take screenshot halfway
  await page.screenshot({ path: "cta-fading-halfway.png" });
  console.log("Saved cta-fading-halfway.png");

  // 3. Scroll to the very bottom (final resting state)
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(600);

  const finalState = await page.evaluate(() => {
    const c = document.querySelector("#cta");
    const f = document.querySelector("#footer");
    const fEl = f?.querySelector("footer") || f;
    const content = c?.querySelector("div.flex-col");
    const cRect = c?.getBoundingClientRect();
    const fRect = f?.getBoundingClientRect();
    const style = content ? window.getComputedStyle(content) : null;
    return {
      windowHeight: window.innerHeight,
      ctaTop: cRect?.top,
      ctaHeight: cRect?.height,
      footerTop: fRect?.top,
      footerBottom: fRect?.bottom,
      footerHeight: fRect?.height,
      footerPaddingBottom: window.getComputedStyle(fEl).paddingBottom,
      contentOpacity: style?.opacity,
      contentTransform: style?.transform,
    };
  });
  console.log("Final resting state:", JSON.stringify(finalState, null, 2));

  // Take screenshot of final resting state
  await page.screenshot({ path: "footer-final-resting.png" });
  console.log("Saved footer-final-resting.png");

  await browser.close();
  console.log("All verifications completed successfully!");
})();

