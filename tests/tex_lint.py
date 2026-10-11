"""Lint the units of the TeX system (every *.fr.tex under content/tex). Run: python3 tests/tex_lint.py [files]

Every unit has the same shape: it opens with \\mxunit[n]{id}{title} (or \\mxfront{id} for front matter; a part that
a unit includes with \\mxinclude opens with neither) and uses only the
environments and commands of the shared class (content/tex/core). A unit may not:
  - break pages by hand, load packages, define macros, counters or colours, or use raw colours;
  - style text by hand (\\color, \\bfseries, \\sffamily, \\ttfamily, font sizes above normal, \\hspace, \\vspace,
    \\noindent, \\centering, minipage): the class commands carry the design (\\mxsubtitle, \\mxbanner, \\mxpseudo,
    figurebox, \\mxtwocols ...); figure code (TikZ, pgfplots) is exempt;
  - write a notation that differs between French and English by hand: numbers (0{,}5, 12\\,500), percentages,
    intervals, coordinates and listed sets are written \\num, \\pc, \\intff/\\intoo/\\intfo/\\intof, \\pt and \\ens
    (content/tex/core/mx-notation.sty), so the class prints each language's convention.
The English twin is generated, so these rules hold for it too.
"""
import re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'build'))
from mxbuild import notation

RULES = [
    (r'\\(?:clearpage|newpage|pagebreak|cleardoublepage)\b', 'manual page break (the class handles breaks; use \\mxneed{n})'),
    (r'\\(?:usepackage|RequirePackage)\b', 'package loaded in a unit'),
    (r'\\(?:(?:re)?newcommand|providecommand|def|let|(?:re)?newenvironment|newcounter|DeclareMathOperator)\b', 'macro or counter defined in a unit'),
    (r'\\(?:definecolor|colorlet)\b|[{\[](?:HTML|RGB|rgb|cmyk)[}\]]', 'raw colour (use the mx palette)'),
]
STYLE = (r'\\(?:color|textcolor|colorbox|bfseries|sffamily|ttfamily|fontsize|large|Large|LARGE|huge|Huge|hspace|vspace|'
         r'noindent|centering)(?![A-Za-z])|\\begin\{minipage\}')
DECIMAL_TEXT = r'(?<![\d{,])\d+,\d+(?![\d}]|,\d)'   # a decimal comma in text: \num{0,5}
OPENING = re.compile(r'\A(?:%[^\n]*\n|\s)*\\mx(?:unit(?:\[\d+\])?|front)\{')


def parts():
    """Part files: included by a unit with \\mxinclude{path} (figures, solutions, assessments of a chapter)."""
    out = set()
    courses = ROOT / 'content/tex/courses'
    for f in courses.rglob('*.fr.tex'):
        course = courses / f.relative_to(courses).parts[0]   # \mxinclude paths are relative to the course folder
        for m in re.finditer(r'\\mxinclude\{([^{}]+)\}', f.read_text()):
            out.add((course / (m.group(1) + '.fr.tex')).resolve())
    return out


FIGURE = re.compile(r'\\begin\{(tikzpicture|axis|pgfpicture)\}.*?\\end\{\1\}', re.S)
CODE = re.compile(r'\\begin\{(lstlisting|verbatim)\}.*?\\end\{\1\}|\\(?:code|texttt|mxpseudo)\{(?:[^{}]|\{[^{}]*\})*\}', re.S)
PAIR = re.compile(r'\(\s*-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?\s*\)')   # coordinates such as (1,2) in code or data


def lint(path, part=False):
    out, rel = [], path.relative_to(ROOT)
    source = path.read_text()
    if not part and not OPENING.match(source): out.append(f'{rel}:1: a unit opens with \\mxunit{{id}}{{title}} or \\mxfront{{id}}')
    if part and OPENING.match(source): out.append(f'{rel}:1: a part (included with \\mxinclude) does not open a unit')
    blank = lambda m: '\n' * m.group(0).count('\n')
    text = FIGURE.sub(blank, source)   # figure code: coordinates and drawing styles
    text = CODE.sub(blank, text)       # program code: argument lists, not decimals
    for n, line in enumerate(text.splitlines(), 1):
        code = PAIR.sub('', re.sub(r'(?<!\\)%.*', '', line))
        for pat, why in RULES:
            if re.search(pat, code): out.append(f'{rel}:{n}: {why}')
        if re.search(STYLE, code): out.append(f'{rel}:{n}: text styled by hand (use the class commands)')
        if re.search(DECIMAL_TEXT, re.sub(r'\$[^$]*\$', '', code)): out.append(f'{rel}:{n}: decimal comma in text (write \\num{{0,5}})')
    # hand-written notation anywhere, figure labels included: the notation rewrite must find nothing to do
    for n, (a, b) in enumerate(zip(source.splitlines(), notation.rewrite(source, 'fr').splitlines()), 1):
        if a != b: out.append(f'{rel}:{n}: notation written by hand (use \\num, \\pc, \\intff/\\intoo/\\intfo/\\intof, \\pt, \\ens)')
    return out


def main(argv):
    files = [Path(a).resolve() for a in argv] or sorted((ROOT / 'content/tex').rglob('*.fr.tex'))
    included = parts()
    problems = [p for f in files for p in lint(f, f.resolve() in included)]
    print('\n'.join(problems) if problems else f'tex lint: {len(files)} unit(s) OK')
    return 1 if problems else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
