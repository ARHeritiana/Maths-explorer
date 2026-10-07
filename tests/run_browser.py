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
finally:
    if server:
        server.terminate()
        server.wait(timeout=5)
sys.exit(result.returncode)
