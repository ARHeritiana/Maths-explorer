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
    # The live site is French-curriculum only. Standalone collection and other-curriculum
    # scripts remain in tests/ alongside their source modules; their unit suites still run.
    for script in ['ergonomics_browser.py', 'live_curriculum_browser.py', 'slides_lab_browser.py',
                   'generators_browser.py', 'chapter_destinations_browser.py', 'teacher_browser.py', 'search_browser.py', 'related_browser.py', 'exercise_link_browser.py']:
        result = subprocess.run([sys.executable, 'tests/' + script], cwd=root)
        if result.returncode:
            break
finally:
    if server:
        server.terminate()
        server.wait(timeout=5)
sys.exit(result.returncode)
