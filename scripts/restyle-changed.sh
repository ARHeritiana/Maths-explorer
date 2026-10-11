#!/bin/sh
# After a resource rebuild: style the PDFs that git sees as modified or new, resolve the bilingual catalogues, republish the sources.
# Usage: sh scripts/restyle-changed.sh   (run from the repository root)
set -e
FILES=$(git status --short dist/resources | awk '{print $2}' | grep '\.pdf$' | tr '\n' ' ')
[ -n "$FILES" ] && python3 scripts/style-resource-pdfs.py $FILES | tail -1
python3 scripts/finalize-resources.py | tail -1
python3 scripts/publish-sources.py | tail -1
