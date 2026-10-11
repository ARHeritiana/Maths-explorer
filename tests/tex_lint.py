"""Lint the units of the new TeX system (every *.fr.tex under content/tex). Run: python3 tests/tex_lint.py [files]

A unit may not: break pages by hand (\\clearpage, \\newpage, \\pagebreak), load packages, define or redefine macros,
counters or colours, use raw colours, or write a decimal comma without braces (write 0{,}5). The English twin is
generated, so these rules hold for it too.
"""
import re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RULES = [
    (r'\\(?:clearpage|newpage|pagebreak|cleardoublepage)\b', 'manual page break (the class handles breaks; use \\mxneed{n})'),
    (r'\\(?:usepackage|RequirePackage)\b', 'package loaded in a unit'),
    (r'\\(?:(?:re)?newcommand|providecommand|def|let|(?:re)?newenvironment|newcounter|DeclareMathOperator)\b', 'macro or counter defined in a unit'),
    (r'\\(?:definecolor|colorlet)\b|[{\[](?:HTML|RGB|rgb|cmyk)[}\]]', 'raw colour (use the mx palette)'),
    (r'(?<![\d{])\d+,\d+(?!\})', 'decimal comma without braces (write 0{,}5)'),   # checked outside figures and (x,y) pairs
]


FIGURE = re.compile(r'\\begin\{(tikzpicture|axis|pgfpicture)\}.*?\\end\{\1\}', re.S)
CODE = re.compile(r'\\begin\{(lstlisting|verbatim)\}.*?\\end\{\1\}|\\(?:code|texttt)\{[^{}]*\}', re.S)
PAIR = re.compile(r'\(\s*-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?\s*\)')   # coordinates such as (1,2)


def lint(path):
    out = []
    blank = lambda m: '\n' * m.group(0).count('\n')
    text = FIGURE.sub(blank, path.read_text())   # figure code: coordinates, not decimals
    text = CODE.sub(blank, text)                 # program code: argument lists, not decimals
    for n, line in enumerate(text.splitlines(), 1):
        code = PAIR.sub('', re.sub(r'(?<!\\)%.*', '', line))
        for pat, why in RULES:
            if re.search(pat, code): out.append(f'{path.relative_to(ROOT)}:{n}: {why}')
    return out


def main(argv):
    files = [Path(a).resolve() for a in argv] or sorted((ROOT / 'content/tex').rglob('*.fr.tex'))
    problems = [p for f in files for p in lint(f)]
    print('\n'.join(problems) if problems else f'tex lint: {len(files)} unit(s) OK')
    return 1 if problems else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
