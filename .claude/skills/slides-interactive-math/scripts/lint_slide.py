#!/usr/bin/env python3
"""Lint a self-contained maths-slide HTML page for the published-artifact environment.

Usage: python lint_slide.py page.html
Exit code 1 if any FAIL. WARN items are advisory.
"""
import os, re, subprocess, sys, tempfile

ALLOWED_SCRIPT = ("https://cdn.jsdelivr.net/npm/", "https://cdnjs.cloudflare.com/",
                  "https://cdn.tailwindcss.com", "https://code.jquery.com/")
ALLOWED_CSS = ("https://fonts.googleapis.com/",)
res = []

def add(level, msg):
    res.append((level, msg))

def main(path):
    if not os.path.isfile(path):
        print("FAIL file not found:", path); return 1
    h = open(path, encoding="utf-8").read()
    size = os.path.getsize(path)
    if size > 16 * 1024 * 1024: add("FAIL", "file larger than 16 MB")

    if not re.search(r'<meta[^>]+name=["\']viewport["\']', h): add("FAIL", "missing viewport meta tag")
    if "1280" not in h or "720" not in h: add("WARN", "no 1280x720 (16:9) stage found")

    for m in re.finditer(r'<script[^>]+src=["\']([^"\']+)["\']', h):
        u = m.group(1)
        if not u.startswith(ALLOWED_SCRIPT): add("FAIL", "script host not allowed: " + u)
        elif "jsdelivr" in u and not re.search(r'@\d+\.\d+\.\d+', u): add("FAIL", "jsdelivr script not pinned to an exact version: " + u)
        elif "cdnjs" in u and not re.search(r'/\d+\.\d+\.\d+/', u): add("WARN", "cdnjs script may not be version-pinned: " + u)
    for m in re.finditer(r'<link[^>]+href=["\']([^"\']+)["\']', h):
        u = m.group(1)
        if u.startswith("http") and not u.startswith(ALLOWED_CSS): add("FAIL", "stylesheet host not allowed: " + u)
    for m in re.finditer(r'(?:src|href)=["\'](https?://[^"\']+)["\']', h):
        u = m.group(1)
        if not u.startswith(ALLOWED_SCRIPT + ALLOWED_CSS + ("https://fonts.gstatic.com/",)):
            add("FAIL", "external resource blocked by the page's security policy: " + u)
    if re.search(r'fetch\(\s*["\']https?://', h): add("FAIL", "network request to another site (blocked)")
    for bad in ("window.storage", "api.anthropic.com", "window.claude", "window.fs"):
        if bad in h: add("FAIL", "not available in a published page: " + bad)
    if "<form" in h.lower(): add("FAIL", "do not use <form> tags")
    if re.search(r'(local|session)Storage', h) and "try" not in h: add("WARN", "browser storage without try/catch")

    if "MathJax" in h:
        if "enableAssistiveMml:false" not in h.replace(" ", ""): add("FAIL", "MathJax: set options:{enableAssistiveMml:false} (formulas would appear twice)")
        if "mjx-assistive-mml" not in h: add("FAIL", "MathJax: hide/remove mjx-assistive-mml")
        if "fontCache:'none'" not in h.replace(" ", "").replace('"', "'"): add("WARN", "MathJax: fontCache 'none' recommended for many small formulas")
        if "tex-svg" not in h: add("FAIL", "MathJax: use the tex-svg component (SVG glyphs, no font files)")
        if "katex" in h.lower(): add("FAIL", "KaTeX CSS and fonts cannot load in a published page")
    if re.search(r'\\\\begin\{array\}[^;]*\\\\hline', h): add("WARN", "MathJax array rules may not render; use an HTML <table> with CSS borders")
    if re.search(r'\bdisplay\s*:\s*none[^}]*opacity', h) and "flex" not in h: add("WARN", "reveal lines with opacity inside a flow column so layout does not shift")
    if re.search(r"\bfullscreen", h, re.I) and "catch" not in h: add("WARN", "requestFullscreen should be wrapped in try/catch with a fallback message")

    scripts = re.findall(r'<script>(.*?)</script>', h, re.S)
    if scripts:
        js = "\n".join(scripts)
        with tempfile.NamedTemporaryFile("w", suffix=".js", delete=False) as f:
            f.write(js); tmp = f.name
        try:
            r = subprocess.run(["node", "--check", tmp], capture_output=True, text=True)
            if r.returncode != 0: add("FAIL", "JavaScript syntax error: " + r.stderr.strip().splitlines()[0])
        except FileNotFoundError:
            add("WARN", "node not found: JavaScript syntax not checked")
        finally:
            os.unlink(tmp)

    for level, msg in res: print(level, msg)
    fails = [m for l, m in res if l == "FAIL"]
    print("RESULT:", "FAIL (%d)" % len(fails) if fails else "PASS" + (" with warnings" if res else ""))
    return 1 if fails else 0

if __name__ == "__main__":
    sys.exit(main(sys.argv[1]) if len(sys.argv) > 1 else print(__doc__) or 2)
