#!/usr/bin/env python3
"""family-record-tablet 상호작용 흐름 점검."""
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
os.environ["LD_LIBRARY_PATH"] = "/workspace/.local/lib/usr/lib/x86_64-linux-gnu:" + os.environ.get("LD_LIBRARY_PATH", "")

from playwright.sync_api import sync_playwright  # noqa: E402

URL = (ROOT / "index.html").as_uri()
fails = []


def check(name, cond, detail=""):
    print(("PASS " if cond else "FAIL ") + name + ((" · " + str(detail)) if detail else ""))
    if not cond:
        fails.append(name)


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(args=["--no-sandbox"])
        ctx = browser.new_context(viewport={"width": 1180, "height": 820}, device_scale_factor=2,
                                  locale="ko-KR", timezone_id="Asia/Seoul", accept_downloads=True)
        page = ctx.new_page()
        errors = []
        page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
        page.on("pageerror", lambda e: errors.append("pageerror: " + str(e)))
        page.goto(URL)
        page.evaluate("() => { try { localStorage.clear(); } catch (e) {} }")
        page.reload()
        page.wait_for_timeout(900)

        # 1. 구성원 전환
        page.click('.member-btn[data-member="hodori"]')
        page.wait_for_timeout(250)
        check("구성원 전환 호도리", page.evaluate("window.__FAMILY__.state.activeMember") == "hodori")
        check("사이드바 활성 표시", page.locator('.member-btn.is-active[data-member="hodori"]').count() == 1)
        page.evaluate("v => window.__FAMILY__.setPage(v)", "study")
        page.wait_for_timeout(300)
        check("호도리 고정 루틴 표시", page.locator('.routine-txt:text("영어 집중듣기 2권")').count() == 1)

        # 2. 터치로 바로 추가 (프리셋)
        page.evaluate("v => window.__FAMILY__.setPage(v)", "study")
        page.wait_for_timeout(300)
        before = page.evaluate("window.__FAMILY__.state.routines.length")
        page.click('.preset-chip[data-text="수학숙제"]')
        page.wait_for_timeout(250)
        after = page.evaluate("window.__FAMILY__.state.routines.length")
        check("프리셋 한 번 터치로 추가(둘 다)", after == before + 2, f"{before}->{after}")
        page.click('[data-act="preset:target"][data-member="choco"]')
        page.wait_for_timeout(150)
        page.click('.preset-chip[data-text="한자"]')
        page.wait_for_timeout(250)
        added = page.evaluate("window.__FAMILY__.state.routines.filter(r=>r.text==='한자').map(r=>r.member)")
        check("프리셋 대상 지정 추가", sorted(added) == ["choco"], added)
        page.click('[data-act="preset:slot"][data-slot="morning"]')
        page.wait_for_timeout(150)
        page.click('.preset-chip[data-text="신문읽기"]')
        page.wait_for_timeout(250)
        slot = page.evaluate("window.__FAMILY__.state.routines.filter(r=>r.text==='신문읽기').map(r=>r.group)")
        check("프리셋 시간대 지정 추가", slot and all(s == "morning" for s in slot), slot)
        check("루틴 11개 프리셋", page.evaluate("document.querySelectorAll('.preset-chip').length") == 11)

        # 3. 루틴 체크 (프리셋 추가 후 호도리 화면으로 복귀)
        page.click('[data-act="preset:target"][data-member="both"]')
        page.wait_for_timeout(150)
        page.click('.member-btn[data-member="hodori"]')
        page.wait_for_timeout(250)
        page.click('.routine-row .check')
        page.wait_for_timeout(250)
        check("루틴 체크 표시", page.locator('.routine-row.is-done').count() >= 1)
        done = page.evaluate("Object.keys(window.__FAMILY__.state.routineDone).length")
        check("루틴 날짜 저장", done >= 1, done)
        page.click('.routine-row.is-done .check')
        page.wait_for_timeout(200)
        check("루틴 체크 해제", page.evaluate("window.__FAMILY__.state.routines.length") > 0)

        # 4. 할 일 추가·토글·삭제
        page.fill('form[data-form="todo"] input[name="text"]', "테스트 할 일")
        page.click('form[data-form="todo"] button[type="submit"]')
        page.wait_for_timeout(250)
        check("할 일 추가", page.locator('.todo-txt:text("테스트 할 일")').count() == 1)
        page.click('.todo-row:has-text("테스트 할 일") .check')
        page.wait_for_timeout(200)
        check("할 일 완료", page.locator('.todo-row.is-done:has-text("테스트 할 일")').count() == 1)
        page.click('.todo-row:has-text("테스트 할 일") [data-act="todo:del"]')
        page.wait_for_timeout(200)
        check("할 일 삭제", page.locator('.todo-txt:text("테스트 할 일")').count() == 0)

        # 5. 타이머
        page.click('[data-act="timer:start"]')
        page.wait_for_timeout(1200)
        running = page.evaluate("window.__FAMILY__.state.timer.running")
        text1 = page.inner_text("#timerDisplay")
        page.wait_for_timeout(1100)
        text2 = page.inner_text("#timerDisplay")
        check("타이머 시작", running)
        check("타이머 시간 변화", text1 != text2, f"{text1} -> {text2}")
        page.click('[data-act="timer:pause"]')
        page.wait_for_timeout(200)
        check("타이머 일시정지", page.evaluate("window.__FAMILY__.state.timer.running") is False)
        page.evaluate("() => { const s = window.__FAMILY__.state; s.timer.baseMs = 35*60*1000; s.timer.running = false; }")
        stars_before = page.evaluate("window.__FAMILY__.state.members.hodori.stars")
        page.click('[data-act="timer:save"]')
        page.wait_for_timeout(300)
        saved = page.evaluate("window.__FAMILY__.state.sessions.length")
        ledger_study = page.evaluate("window.__FAMILY__.state.ledger.filter(e=>e.type==='study').length")
        stars_after = page.evaluate("window.__FAMILY__.state.members.hodori.stars")
        check("공부 세션 저장", saved == 1, saved)
        check("공부 용돈 적립", ledger_study == 1)
        check("공부 별 적립", stars_after == stars_before + 3, f"{stars_before}->{stars_after}")
        check("타이머 초기화", page.inner_text("#timerDisplay") == "20:00", page.inner_text("#timerDisplay"))

        # 6. 도장판
        page.evaluate("v => window.__FAMILY__.setPage(v)", "stamps")
        page.wait_for_timeout(300)
        page.click('.stamp-slot[data-member="choco"][data-index="0"]')
        page.wait_for_timeout(250)
        check("도장 찍기", page.locator('.stamp-slot.is-stamped[data-member="choco"][data-index="0"]').count() == 1)
        page.click('.stamp-slot[data-member="choco"][data-index="0"]')
        page.wait_for_timeout(200)
        check("도장 지우기", page.locator('.stamp-slot.is-stamped[data-member="choco"][data-index="0"]').count() == 0)

        # 7. 칭찬 스티커
        praise_before = page.evaluate("window.__FAMILY__.state.praise.length")
        page.click('[data-act="praise:to"][data-member="hodori"]')
        page.wait_for_timeout(150)
        page.click('[data-act="praise:sticker"][data-key="star"]')
        page.wait_for_timeout(150)
        page.fill('form[data-form="praise"] input[name="text"]', "오늘 최고였어!")
        page.click('form[data-form="praise"] button[type="submit"]')
        page.wait_for_timeout(300)
        praise_after = page.evaluate("window.__FAMILY__.state.praise.length")
        check("칭찬 스티커 보내기", praise_after == praise_before + 1)
        check("칭찬 벽 표시", page.locator('.praise-card:has-text("오늘 최고였어!")').count() == 1)

        # 8. 용돈기입장
        page.evaluate("v => window.__FAMILY__.setPage(v)", "allowance")
        page.wait_for_timeout(300)
        bal_before = page.evaluate("document.querySelectorAll('.bc-amount')[1].innerText")
        page.fill("#lgAmt", "3000")
        page.select_option("#lgType", "expense")
        page.fill("#lgMemo", "문구점 공책")
        page.click('form[data-form="ledger"] button[type="submit"]')
        page.wait_for_timeout(300)
        check("내역 추가", page.locator('.lr-title:text("문구점 공책")').count() == 1)
        bal_after = page.evaluate("document.querySelectorAll('.bc-amount')[1].innerText")
        check("잔액 반영", bal_before != bal_after, f"{bal_before} -> {bal_after}")
        page.click('[data-act="ledger:filter"][data-filter="expense"]')
        page.wait_for_timeout(200)
        check("분류 필터", page.locator('.ledger-row.is-out').count() >= 1)
        page.click('[data-act="ledger:member"][data-member="hodori"]')
        page.wait_for_timeout(200)
        page.click('[data-act="ledger:filter"][data-filter="study"]')
        page.wait_for_timeout(200)
        check("공부 적립 필터", page.locator('.ledger-row.is-study').count() >= 1)
        page.click('[data-act="ledger:filter"][data-filter="all"]')
        page.wait_for_timeout(200)
        claim = page.locator('[data-act="claim:bonus"][data-member="hodori"]')
        check("30분 보너스 활성화", claim.count() == 1 and claim.first.is_enabled())
        claim.first.click()
        page.wait_for_timeout(300)
        check("30분 보너스 적립", page.evaluate("window.__FAMILY__.state.ledger.some(e=>e.memo==='공부 30분 보너스')"))

        # 9. 가족 건의 & 채팅
        page.evaluate("v => window.__FAMILY__.setPage(v)", "chat")
        page.wait_for_timeout(300)
        msg_before = page.evaluate("window.__FAMILY__.state.chat.length")
        page.click('.cw-btn[data-member="hodori"]')
        page.wait_for_timeout(200)
        page.click('.chip[data-act="chat:quick"]')
        val = page.input_value('.compose-box .field')
        check("빠른 문장 채우기", "팬케이크" in val, val)
        page.click('form[data-form="chat"] button[type="submit"]')
        page.wait_for_timeout(300)
        check("채팅 보내기", page.evaluate("window.__FAMILY__.state.chat.length") == msg_before + 1)
        page.click('.compose-stk')
        page.wait_for_timeout(200)
        page.click('.sticker-drawer button[data-key="pancake"]')
        page.wait_for_timeout(300)
        check("스티커 보내기", page.evaluate("window.__FAMILY__.state.chat.filter(m=>m.type==='sticker').length") >= 1)
        page.locator('.react[data-react="doit"]').last.click()
        page.wait_for_timeout(250)
        check("확인/해줄게 반응", page.locator('.react.is-on').count() >= 1)

        # 10. 가족 캘린더
        page.evaluate("v => window.__FAMILY__.setPage(v)", "calendar")
        page.wait_for_timeout(350)
        check("월간 달력 렌더", page.locator('.cal-day').count() >= 28)
        check("학원 예시 일정", page.locator('.week-row').count() >= 4)
        page.click('.cal-day[data-date="2026-11-26"]')
        page.wait_for_timeout(250)
        page.click('[data-act="event:new"]')
        page.wait_for_timeout(250)
        page.fill('.ev-modal input[name="title"]', "치과 가는 날")
        page.fill('.ev-modal input[name="place"]', "밝은치과")
        page.fill('.ev-modal input[name="prep"]', "보험카드")
        page.fill('.ev-modal input[name="start"]', "10:30")
        page.fill('.ev-modal input[name="end"]', "11:10")
        page.click('.ev-modal button[type="submit"]')
        page.wait_for_timeout(350)
        check("일정 추가", page.locator('.day-row:has-text("치과 가는 날")').count() == 1)
        check("일정 날짜 선택 유지", page.evaluate("document.querySelector('.cal-day.is-selected').dataset.date") == "2026-11-26")
        page.click('[data-act="event:edit"]')
        page.wait_for_timeout(250)
        page.fill('.ev-modal input[name="title"]', "치과 가는 날 (오전)")
        page.click('.ev-modal button[type="submit"]')
        page.wait_for_timeout(300)
        check("일정 수정", page.locator('.day-row:has-text("치과 가는 날 (오전)")').count() == 1)

        # 반복 일정 추가 (수요일)
        page.click('[data-act="event:new"]')
        page.wait_for_timeout(250)
        page.fill('.ev-modal input[name="title"]', "주말 축구교실")
        page.click('.wd-chip[data-wd="6"]')
        page.wait_for_timeout(250)
        check("요일 토글 유지(제목 유지)", page.input_value('.ev-modal input[name="title"]') == "주말 축구교실")
        page.fill('.ev-modal input[name="start"]', "10:00")
        page.click('.ev-modal button[type="submit"]')
        page.wait_for_timeout(300)
        check("반복 일정 추가", page.evaluate("window.__FAMILY__.state.events.some(e=>e.title==='주말 축구교실' && e.repeat.includes(6))"))
        page.click('.cal-day[data-date="2026-11-28"]')
        page.wait_for_timeout(250)
        check("반복 일정 토요일 표시", page.locator('.day-row:has-text("주말 축구교실")').count() == 1)

        # 일정 삭제
        page.click('.day-row:has-text("주말 축구교실") [data-act="event:del"]')
        page.wait_for_timeout(250)
        page.click('.modal .btn-primary')
        page.wait_for_timeout(300)
        check("일정 삭제", page.evaluate("window.__FAMILY__.state.events.some(e=>e.title==='주말 축구교실')") is False)

        # 11. 저장 후 새로고침 유지
        snapshot = page.evaluate("""() => {
            const s = window.__FAMILY__.state;
            return { routines: s.routines.length, chat: s.chat.length, ledger: s.ledger.length,
                     events: s.events.length, sessions: s.sessions.length, page: s.page };
        }""")
        page.wait_for_timeout(400)
        page.reload()
        page.wait_for_timeout(900)
        restored = page.evaluate("""() => {
            const s = window.__FAMILY__.state;
            return { routines: s.routines.length, chat: s.chat.length, ledger: s.ledger.length,
                     events: s.events.length, sessions: s.sessions.length, page: s.page };
        }""")
        check("localStorage 유지", snapshot == restored, f"{snapshot} vs {restored}")

        # 12. JSON 내보내기
        with page.expect_download(timeout=5000) as dl:
            page.click('[data-act="backup:export"]')
        download = dl.value
        check("JSON 내보내기", download.suggested_filename.endswith(".json"), download.suggested_filename)

        if errors:
            check("콘솔 오류 없음", False, errors[:3])
        else:
            check("콘솔 오류 없음", True)
        ctx.close()

        # 13. 월요일 전용 루틴 (받아쓰기 연습 · 호도리)
        ctx2 = browser.new_context(viewport={"width": 1180, "height": 820}, locale="ko-KR", timezone_id="Asia/Seoul")
        page2 = ctx2.new_page()
        page2.clock.install(time="2026-11-23T09:00:00+09:00")  # 월요일
        page2.goto(URL)
        page2.wait_for_timeout(800)
        page2.evaluate("v => window.__FAMILY__.setPage(v)", "study")
        page2.evaluate("m => window.__FAMILY__.setMember(m)", "hodori")
        page2.wait_for_timeout(300)
        badge = page2.locator('.routine-row:has-text("받아쓰기 연습") .routine-badge')
        check("월요일 받아쓰기 루틴 표시", page2.locator('.routine-row:has-text("받아쓰기 연습")').count() == 1)
        check("월요일 고정 배지", badge.count() == 1 and "월요일" in badge.inner_text(), badge.inner_text() if badge.count() else "none")
        page2.evaluate("m => window.__FAMILY__.setMember(m)", "choco")
        page2.wait_for_timeout(250)
        check("초코하임에겐 받아쓰기 없음", page2.locator('.routine-row:has-text("받아쓰기 연습")').count() == 0)
        page2.screenshot(path=str(ROOT / "screenshots" / "study-monday-hodori.png"))
        ctx2.close()
        browser.close()

    print("\n실패:", len(fails))
    for f in fails:
        print(" -", f)
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    main()
