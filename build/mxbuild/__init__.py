"""Maths Explorer build pipeline.

Run as `PYTHONPATH=build python3 -m mxbuild <command>` (the Makefile does this). Paths are resolved from the repository
root, so commands work from any directory.
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DIST = ROOT / 'dist'
DATA = ROOT / 'content/data'
TEX = ROOT / 'content/tex'
OUT = ROOT / 'build/out'
