"""Kept for the documented pre-push command: the FR/EN twin check now covers every pair (tests/twin_parity.py)."""
import runpy, sys
from pathlib import Path
sys.argv = [sys.argv[0]]
runpy.run_path(str(Path(__file__).resolve().parents[1] / 'tests/twin_parity.py'), run_name='__main__')
