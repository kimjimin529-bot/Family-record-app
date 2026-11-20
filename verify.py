#!/usr/bin/env python3
"""family-record-tablet 레이아웃 점검: 콘솔 오류·가로 오버플로·스크린샷."""
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
LOCAL_LIBS = "/workspace/.local/lib/usr/lib/x86_64-linux-gnu"
os.environ["LD_LIBRARY_PATH"] = LOCAL_LIBS + ":" + os.environ.get("LD_LIBRARY_PATH", "")

from playwright.sync_api import sync_playwright  # noqa: E402

URL = (ROOT / "index.html").as_uri()
OUT = ROOT / "screenshots"
PAGES = ["home", "study", "stamps", "allowance", "calendar", "chat"]
VIEWPORTS = [("tablet", 1180, 820), ("tablet-sm", 1024, 768), ("phone", 390, 844)]


def overflow(page):
    return page.evaluate(
        """() => {
            const d = document.documentElement;
            const body = document.body;
            const sw = Math.max(d.scrollWidth, body.scrollWidth);
            const cw = d.clientWidth;
            // 넓은 요소 추적
            const wide = [];
            const inScroller = (el) => {
                let p = el.parentElement;
                while (p && p !== document.body) {
                    const st = getComputedStyle(p);
                    if (/auto|scroll/.test(st.overflowX)) return true;
                    p = p.parentElement;
                }
                return false;
            };
            document.querySelectorAll('body *').forEach(el => {
                const r = el.getBoundingClientRect();
                if (r.width === 0 && r.height === 0) return;
                if (r.right > cw + 1.5 || r.left < -1.5) {
                    if (inScroller(el)) return;
                    wide.push((el.className || el.tagName) + ' ' + Math.round(r.left) + '..' + Math.round(r.right));
                }
            });
            return { diff: sw - cw, scrollWidth: sw, clientWidth: cw, wide: wide.slice(0, 6) };
        }"""
    )


def main():
    OUT.mkdir(exist_ok=True)
    problems = []
    with sync_playwright() as p:
        browser = p.chromium.launch(args=["--no-sandbox", "--font-render-hinting=none"])
        for name, w, h in VIEWPORTS:
            ctx = browser.new_context(
                viewport={"width": w, "height": h},
                device_scale_factor=2,
                is_mobile=(name == "phone"),
                has_touch=(name == "phone"),
                locale="ko-KR",
                timezone_id="Asia/Seoul",
            )
            page = ctx.new_page()
            console_errors, page_errors, warns = [], [], []
            page.on("console", lambda m: (console_errors if m.type == "error" else warns).append(m.text))
            page.on("pageerror", lambda e: page_errors.append(str(e)))
            page.goto(URL, wait_until="load")
            page.wait_for_timeout(1800)

            for view in PAGES:
                page.evaluate("v => window.__FAMILY__.setPage(v)", view)
                page.wait_for_timeout(450)
                of = overflow(page)
                if of["diff"] > 0 or of["wide"]:
                    problems.append(f"{name} {view}: overflow diff={of['diff']} wide={of['wide']}")
                print(f"[{name} {w}x{h}] {view}: overflow={of['diff']}px scrollW={of['scrollWidth']}")
                if name == "tablet":
                    page.screenshot(path=str(OUT / f"{view}-1180x820.png"))
                elif name == "phone":
                    page.screenshot(path=str(OUT / f"{view}-390x844.png"))

            # 스크롤 영역 내부 오버플로(예: 본문 카드가 옆으로 넘침) 점검
            inner = page.evaluate(
                """() => Array.from(document.querySelectorAll('.card')).filter(el => el.scrollWidth - el.clientWidth > 2)
                     .map(el => (el.className || '') + ' +' + (el.scrollWidth - el.clientWidth)).slice(0, 5)"""
            )
            if inner:
                problems.append(f"{name}: card inner overflow {inner}")

            if console_errors:
                problems.append(f"{name}: console errors {console_errors[:5]}")
            if page_errors:
                problems.append(f"{name}: page errors {page_errors[:5]}")
            print(f"[{name}] console errors={len(console_errors)} pageerrors={len(page_errors)} warns={len(warns)}")
            ctx.close()

        browser.close()

    print("\n=== 결과 ===")
    if problems:
        print("문제 발견:")
        for x in problems:
            print(" -", x)
        sys.exit(1)
    print("OK: 콘솔 오류 0 · 페이지 오류 0 · 가로 오버플로 0 (1180x820 / 1024x768 / 390x844)")


if __name__ == "__main__":
    main()
