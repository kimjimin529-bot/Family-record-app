#!/usr/bin/env python3
"""family-record-tablet 빌드: src/ 파일을 하나의 index.html로 인라인."""
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "src"


def main() -> None:
    template = (SRC / "index.template.html").read_text(encoding="utf-8")
    css = (SRC / "app.css").read_text(encoding="utf-8")
    js = (SRC / "app.js").read_text(encoding="utf-8")

    html = template.replace("/*__CSS__*/", css).replace("/*__JS__*/", js)
    out = ROOT / "index.html"
    out.write_text(html, encoding="utf-8")
    print(f"built {out} ({out.stat().st_size / 1024:.1f} KB)")


if __name__ == "__main__":
    main()
