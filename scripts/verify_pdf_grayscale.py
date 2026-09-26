"""Verify that a PDF uses only neutral grayscale colors (R == G == B)."""

import re
import sys

from pypdf import PdfReader

PDF_PATH = sys.argv[1]

reader = PdfReader(PDF_PATH)

rgb_pattern = re.compile(r"([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+(rg|RG)\b")
gray_pattern = re.compile(r"([\d.]+)\s+(g|G)\b")

violations = []
total_rgb_ops = 0
total_gray_ops = 0

for page_number, page in enumerate(reader.pages, start=1):
    resources = page.get("/Resources") or {}
    xobjects = resources.get("/XObject")
    streams = []

    contents = page.get_contents()
    if contents is not None:
        streams.append(contents.get_data())

    for stream in streams:
        text = stream.decode("latin-1", errors="ignore")

        for r, g, b, op in rgb_pattern.findall(text):
            total_rgb_ops += 1
            if not (float(r) == float(g) == float(b)):
                violations.append((page_number, op, r, g, b))

        total_gray_ops += len(gray_pattern.findall(text))

print(f"Pages: {len(reader.pages)}")
print(f"RGB color operators: {total_rgb_ops}")
print(f"Grayscale operators: {total_gray_ops}")
print(f"Non-grayscale RGB violations: {len(violations)}")

for page_number, op, r, g, b in violations[:20]:
    print(f"  page {page_number}: {op} {r} {g} {b}")

if violations:
    print("RESULT: FAIL - colored content detected")
    sys.exit(1)

print("RESULT: PASS - document is strictly black and white / grayscale")
