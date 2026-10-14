"""Every deck has a self-contained HTML export that is up to date and passes the interactive-slides skill lint."""
import json, subprocess, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
LINT = ROOT / '.claude/skills/slides-interactive-math/scripts/lint_slide.py'
r = subprocess.run([sys.executable, '-I', str(ROOT / 'scripts/export-slides.py'), '--check'], capture_output=True, text=True)
print((r.stdout + r.stderr).strip())
bad = r.returncode != 0
for d in json.loads((ROOT / 'dist/slides/data/index.json').read_text()):
    f = ROOT / 'dist/slides/export' / f'{d["id"]}.html'
    if not f.exists(): print('missing export', f.name); bad = True; continue
    l = subprocess.run([sys.executable, '-I', str(LINT), str(f)], capture_output=True, text=True)
    if l.returncode != 0: print(f.name, l.stdout.strip()); bad = True
    html = f.read_text(encoding='utf8')
    if 'window.__MX_EXPORT__' not in html or any(w in html for w in (''.join(['dri', 've.goo', 'gle']), ''.join(['do', 'cs.goo', 'gle']))):   # personal-storage links are forbidden print(f.name, 'unexpected content'); bad = True
print('slide exports:', 'PROBLEMS' if bad else 'OK'); sys.exit(1 if bad else 0)
