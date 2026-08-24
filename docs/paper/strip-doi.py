#!/usr/bin/env python3
from pathlib import Path
import re

BIB_IN  = Path("sample-ceur.bib")
BIB_OUT = Path("sample-ceur.cleaned.bib")

# Field detectors (line-based, BibTeX-ish)
HAS_URL_RE = re.compile(r"(?mi)^\s*url\s*=\s*\{")
HAS_DOI_RE = re.compile(r"(?mi)^\s*doi\s*=\s*\{")
DROP_DOI_LINE_RE = re.compile(r"(?mi)^\s*doi\s*=\s*\{.*?\}\s*,?\s*\n")

ENTRY_START_RE = re.compile(r"(?m)^@")

text = BIB_IN.read_text(encoding="utf-8")

starts = [m.start() for m in ENTRY_START_RE.finditer(text)]
if not starts:
    BIB_OUT.write_text(text, encoding="utf-8")
    print(f"No BibTeX entries found. Wrote unchanged: {BIB_OUT}")
    raise SystemExit(0)

out = []
# keep anything before the first entry (comments, whitespace)
out.append(text[:starts[0]])

for i, s in enumerate(starts):
    e = starts[i + 1] if i + 1 < len(starts) else len(text)
    entry = text[s:e]

    if HAS_URL_RE.search(entry) and HAS_DOI_RE.search(entry):
        entry = DROP_DOI_LINE_RE.sub("", entry)

    out.append(entry)

BIB_OUT.write_text("".join(out), encoding="utf-8")
print(f"Wrote: {BIB_OUT}")
