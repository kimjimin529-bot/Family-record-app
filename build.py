#!/usr/bin/env python3
"""우리 가족 기록장 — src/ 파일을 하나의 index.html 로 묶습니다.

사용법:  python3 build.py
결과:    family-record-app/index.html (CSS/JS/SVG 모두 인라인)
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "src"

CSS = SRC / "app.css"
JS_FILES = [
    "00-core.js",
    "10-svg.js",
    "20-ui.js",
    "30-home.js",
    "40-routine.js",
    "50-pages.js",
    "60-chat.js",
    "90-init.js",
]


def main() -> None:
    template = (SRC / "index.template.html").read_text(encoding="utf-8")
    css = CSS.read_text(encoding="utf-8")
    js_parts = []
    for name in JS_FILES:
        body = (SRC / "js" / name).read_text(encoding="utf-8")
        js_parts.append(f"/* ---- {name} ---- */\n{body}")
    js = "\n".join(js_parts)

    out = template.replace("/*{{CSS}}*/", css).replace("/*{{JS}}*/", js)
    target = ROOT / "index.html"
    target.write_text(out, encoding="utf-8")
    kb = len(out.encode("utf-8")) / 1024
    print(f"빌드 완료: {target}  ({kb:.1f} KB)")


if __name__ == "__main__":
    main()
