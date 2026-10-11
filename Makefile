# Maths Explorer build. Python package: build/mxbuild (run with PYTHONPATH=build).
#   make tex [COURSE=terminale]   compile course PDFs (cached per course), style, regenerate catalogue, publish sources
#   make site                     copy site/ into dist/ (the served folder)
#   make catalog                  regenerate catalog.json, resources-data.js, RESOURCE_PROVENANCE.json from the manifest
#   make check [FAST=1]           every pre-push check
#   make all                      tex + site + catalog + check
PY := PYTHONPATH=build python3
COURSE ?=
FORCE ?=

.PHONY: tex site catalog check all inventory slides
tex:
	$(PY) -m mxbuild tex $(COURSE) $(if $(FORCE),--force)
site:
	$(PY) -m mxbuild site
catalog:
	$(PY) -m mxbuild catalog
slides:
	python3 scripts/build-slides.py
inventory:
	python3 scripts/tex-inventory.py
check:
	$(PY) -m mxbuild check $(if $(FAST),--fast)
all: tex site catalog check
