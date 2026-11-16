#!/usr/bin/env python3
"""우리 가족 기록장 점검: 렌더·상호작용·콘솔 오류·스크린샷."""
import sys, time
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent
URL = (ROOT / "index.html").as_uri()
OUT = ROOT / "screenshots"
OUT.mkdir(exist_ok=True)

PAGES = ["home", "routine", "meals", "schedule", "health", "praise", "allowance", "chat"]


def main():
    errors, warns, results = [], [], []
    with sync_playwright() as p:
        browser = p.chromium.launch()
        ctx = browser.new_context(viewport={"width": 390, "height": 844},
                                  device_scale_factor=2, is_mobile=True, has_touch=True,
                                  locale="ko-KR", timezone_id="Asia/Seoul")
        page = ctx.new_page()
        page.on("console", lambda m: (errors if m.type == "error" else warns).append(m.text))
        page.on("pageerror", lambda e: errors.append("pageerror: " + str(e)))
        page.goto(URL, wait_until="load")
        page.wait_for_timeout(2500)

        results.append(("title", page.title()))
        results.append(("tab count", page.locator(".tabbar .tab").count()))
        results.append(("member rows", page.locator(".member-row").count()))

        # 뷰포트(실제 화면) 스크린샷
        for name in PAGES:
            page.click(f'.tab[data-page="{name}"]')
            page.wait_for_timeout(420)
            overflow = page.evaluate("() => document.documentElement.scrollWidth - document.documentElement.clientWidth")
            results.append((f"overflow {name}", overflow))
            page.screenshot(path=str(OUT / f"10-{name}.png"))          # 화면에 보이는 그대로
            page.screenshot(path=str(OUT / f"11-{name}-full.png"), full_page=True)

        # 작은 화면(320px) 점검
        page.set_viewport_size({"width": 320, "height": 700})
        page.wait_for_timeout(400)
        for name in ["home", "routine", "chat"]:
            page.click(f'.tab[data-page="{name}"]')
            page.wait_for_timeout(350)
            ov = page.evaluate("() => document.documentElement.scrollWidth - document.documentElement.clientWidth")
            results.append((f"overflow320 {name}", ov))
        page.screenshot(path=str(OUT / "12-small-home.png"))
        page.set_viewport_size({"width": 390, "height": 844})
        page.wait_for_timeout(300)

        # ---- 상호작용 ----
        page.click('.tab[data-page="routine"]')
        page.wait_for_timeout(300)
        before = page.locator("#page-routine .progress-wrap .progress-label").first.inner_text()
        page.locator('.study-item .check').nth(1).click()   # 미완료 항목 체크
        page.wait_for_timeout(500)
        after = page.locator("#page-routine .progress-wrap .progress-label").first.inner_text()
        results.append(("study progress", f"{before} -> {after}"))
        toast = page.locator(".toast").first.inner_text() if page.locator(".toast").count() else "(none)"
        results.append(("study toast", toast))

        page.click('.tab[data-page="allowance"]')
        page.wait_for_timeout(350)
        results.append(("choco balance", page.locator(".allow-total").inner_text()))
        # 시작 금액 편집
        page.fill("#startMoney", "50000")
        page.dispatch_event("#startMoney", "change")
        page.wait_for_timeout(400)
        results.append(("balance after start edit", page.locator(".allow-total").inner_text()))
        page.fill("#startMoney", "44200")
        page.dispatch_event("#startMoney", "change")
        page.wait_for_timeout(300)
        # 입금
        page.fill("#txAmount", "500")
        page.fill("#txNote", "테스트 입금")
        page.click('[data-act="allow.in"]')
        page.wait_for_timeout(400)
        results.append(("balance after deposit", page.locator(".allow-total").inner_text()))

        # 채팅
        page.click('.tab[data-page="chat"]')
        page.wait_for_timeout(300)
        n0 = page.locator(".msg").count()
        page.fill("#chatInput", "테스트 메시지예요")
        page.click('[data-act="chat.send"]')
        page.wait_for_timeout(400)
        results.append(("chat messages", f"{n0} -> {page.locator('.msg').count()}"))
        page.click('[data-act="chat.tray"]')
        page.wait_for_timeout(350)
        results.append(("sticker buttons", page.locator(".sticker-btn").count()))
        page.screenshot(path=str(OUT / "13-chat-stickers.png"))
        page.locator(".sticker-btn").nth(1).click()
        page.wait_for_timeout(400)
        results.append(("after sticker", page.locator(".msg").count()))
        page.locator('[data-act="chat.react"]').last.click()
        page.wait_for_timeout(300)
        page.screenshot(path=str(OUT / "14-chat-reaction.png"))

        # 설정 · 가족 꾸미기 · 도장판 달력 · 공부 추가
        page.click('[data-act="settings.open"]')
        page.wait_for_timeout(500)
        page.screenshot(path=str(OUT / "15-settings.png"))
        results.append(("settings sheet", page.locator(".sheet").count()))
        page.click('.sheet [data-act="settings.members"]')
        page.wait_for_timeout(700)
        page.screenshot(path=str(OUT / "16-members.png"))
        results.append(("member fields", page.locator('[data-mfield="name"]').count()))
        page.fill('[data-mfield="traits"][data-member="mom"]', "우리집 든든한 대장")
        page.click('[data-act="members.save"]')
        page.wait_for_timeout(400)

        page.click('.tab[data-page="home"]')
        page.wait_for_timeout(300)
        page.click('[data-act="stamp.cal"]')
        page.wait_for_timeout(500)
        page.screenshot(path=str(OUT / "17-stampcal.png"))
        page.keyboard.press("Escape")
        page.wait_for_timeout(200)

        page.click('.tab[data-page="routine"]')
        page.wait_for_timeout(300)
        page.click('[data-act="study.add"]')
        page.wait_for_timeout(500)
        page.screenshot(path=str(OUT / "18-study-add.png"))
        page.fill('[data-field="title"]', "영어 단어 10개")
        page.fill('[data-field="tag"]', "10개")
        page.fill('[data-field="reward"]', "100")
        page.click('[data-act="sheet.submit"]')
        page.wait_for_timeout(500)
        results.append(("new study item", page.locator('text=영어 단어 10개').count()))

        # 미션
        page.click('.tab[data-page="home"]')
        page.wait_for_timeout(300)
        page.click('[data-act="mission.done"]')
        page.wait_for_timeout(400)
        results.append(("mission count", page.locator(".mission-card .chip").first.inner_text()))

        # 새로고침 후 유지
        page.reload(wait_until="load")
        page.wait_for_timeout(1800)
        results.append(("persist page", page.locator(".page.active").get_attribute("id")))
        results.append(("persist study item", page.locator('text=영어 단어 10개').count()))

        # 데스크톱
        page.set_viewport_size({"width": 1280, "height": 900})
        page.wait_for_timeout(400)
        page.click('.tab[data-page="home"]')
        page.wait_for_timeout(400)
        page.screenshot(path=str(OUT / "19-desktop.png"))

        ctx.close()
        browser.close()

    print("== 결과 ==")
    for r in results:
        print(" -", r)
    print("== console errors:", len(errors))
    for e in errors[:20]:
        print("   !", e)
    print("== warnings:", len(warns))
    for w in warns[:10]:
        print("   ~", w)

    ok = (not errors) and all(v == 0 for k, v in results if k.startswith("overflow"))
    print("== RESULT:", "PASS" if ok else "CHECK")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
