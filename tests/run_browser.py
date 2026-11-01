"""Start a server and browser tests in one process environment; no app dependencies."""
import os
from pathlib import Path
import subprocess
import sys
import time
from urllib.request import urlopen

root = Path(__file__).resolve().parents[1]
# An externally selected URL uses the caller's already-running server.
server = None
if not os.environ.get('MATHS_EXPLORER_URL'):
    server = subprocess.Popen(['node', 'scripts/serve.mjs'], cwd=root,
                              stdout=subprocess.DEVNULL)
    try:
        for _ in range(100):
            if server.poll() is not None:
                raise RuntimeError('Local server exited before browser checks')
            try:
                with urlopen('http://localhost:4173', timeout=.2):
                    break
            except OSError:
                time.sleep(.05)
        else:
            raise RuntimeError('Local server did not become ready')
    except BaseException:
        server.terminate()
        server.wait(timeout=5)
        raise
try:
    result = subprocess.run([sys.executable, 'tests/browser.py'], cwd=root)
    if result.returncode == 0:   # laboratory v2: smoothness, overflow, keyboard, reduced motion
        result = subprocess.run([sys.executable, 'tests/lab_browser.py'], cwd=root)
    if result.returncode == 0:   # the laboratory in slides and on chapter pages
        result = subprocess.run([sys.executable, 'tests/slides_lab_browser.py'], cwd=root)
    if result.returncode == 0:   # heavy modes only where the device allows
        result = subprocess.run([sys.executable, 'tests/device_scale_browser.py'], cwd=root)
    if result.returncode == 0:   # long lists keep their scroll position
        result = subprocess.run([sys.executable, 'tests/ergonomics_browser.py'], cwd=root)
    if result.returncode == 0:   # automatismes and sheets: MathJax on every class, projection stage, phone width
        result = subprocess.run([sys.executable, 'tests/generators_browser.py'], cwd=root)
    if result.returncode == 0:   # the four chapter destinations and the legacy stage links
        result = subprocess.run([sys.executable, 'tests/chapter_destinations_browser.py'], cwd=root)
    if result.returncode == 0:   # the unpublished references of docs/future-work (workstream G), opened from files
        result = subprocess.run([sys.executable, 'tests/future_work_browser.py'], cwd=root)
    if result.returncode == 0:
        result = subprocess.run([sys.executable, 'tests/history_browser.py'], cwd=root)
    if result.returncode == 0:   # the sets foundation lesson, both languages and themes
        result = subprocess.run([sys.executable, 'tests/sets_browser.py'], cwd=root)
    if result.returncode == 0:   # the six foundation lessons follow the site language, also when it is switched (#24)
        result = subprocess.run([sys.executable, 'tests/basics_browser.py'], cwd=root)
finally:
    if server:
        server.terminate()
        server.wait(timeout=5)
sys.exit(result.returncode)
