"""Preserve source code and algorithm layout before Pandoc's prose conversion."""
import html
import re
import subprocess

ENV = re.compile(r'\\(begin|end)\{([^}]+)\}')
TABLES = {'tabular', 'tabularx', 'tblr', 'minipage'}
PYTHON = re.compile(r'\b(?:def\s+[\w]+\s*\(|from\s+\w+\s+import|while\b|for\s+\w+\s+in\b|print\s*\(|return\b)')
ALGORITHM = re.compile(r'\b(?:Tant\s+que|Fin\s+(?:tant|pour|si)|Affecter|Afficher|Saisir|Initialisation|Variables|Pour\s+\w+\s+(?:allant|de))\b', re.I)


def group(text, pos, left='{', right='}'):
    """Read a balanced TeX argument, including nested formatting groups."""
    while pos < len(text) and text[pos].isspace():
        pos += 1
    if pos >= len(text) or text[pos] != left:
        return '', pos
    start = pos + 1
    depth = 1
    pos += 1
    while pos < len(text):
        if text[pos] == '\\':
            pos += 2
            continue
        if text[pos] == left:
            depth += 1
        elif text[pos] == right:
            depth -= 1
            if depth == 0:
                return text[start:pos], pos + 1
        pos += 1
    raise ValueError('Unclosed code argument')


def table_body(text, env):
    pos = len('\\begin{' + env + '}')
    while True:
        start = pos
        while pos < len(text) and text[pos].isspace():
            pos += 1
        if text[pos:pos+1] != '[':
            break
        _, pos = group(text, pos, '[', ']')
    for _ in range(2 if env == 'tabularx' else 1):
        _, pos = group(text, pos)
    return text[pos:text.rfind('\\end{')]


def plain_code(text):
    """Decode TeX typography only; retain operators, placeholders and source values."""
    text = re.sub(r'(?<!\\)%[^\n]*', '', text)
    text = text.replace('\n', ' ').replace('\t', ' ')
    # Literal grouping and layout spaces are different from editor indentation.
    text = re.sub(r'\\(?:textcolor|colorbox)\s*\{[^{}]*\}', '', text)
    text = re.sub(r'\\(?:color|cellcolor)\s*\{[^{}]*\}', '', text)
    text = re.sub(r'\\(?:phantom|hphantom)\{([^{}]*)\}', lambda m: '\ue000' * len(m[1]), text)
    text = re.sub(r'\\(?:texttt|textbf|textit|textrm|textnormal|text|mbox|mathrm|mathbf|emph)\b\s*', '', text)
    text = re.sub(r'\\(?:red|blue|green|black|white|gray|ttfamily|bfseries|scriptsize|footnotesize|small|normalsize|bf|tiny)(?![A-Za-z])\s*', '', text)
    text = re.sub(r'\\hspace\*?\s*\{([\d.]+)(cm|em|mm)\}', lambda m: '\ue000' * max(1, round(float(m[1]) * {'cm':8,'em':4,'mm':.8}[m[2]])), text)
    text = re.sub(r'\\qquad\b\s*', '\ue000'*8, text)
    text = re.sub(r'\\quad\b\s*', '\ue000'*4, text)
    text = re.sub(r'\\(?:hline|toprule|midrule|bottomrule)\b', '', text)
    text = re.sub(r'\\(?:cline|cmidrule)\s*\{[^}]*\}', '', text)
    symbols = {'_':'_', '%':'%', '#':'#', '&':'&', '{':'\ue001', '}':'\ue002',
               'geqslant':'>=', 'geq':'>=', 'leqslant':'<=', 'leq':'<=', 'neq':'!=',
               'gets':'←', 'leftarrow':'←', 'rightarrow':'→', 'times':'×', 'cdot':'·',
               'ldots':'...', 'dots':'...', 'dotfill':'...', 'cdots':'...', 'ell':'ℓ', 'blacktriangledown':'', 'textgreater':'>', 'textless':'<',
               'textasciitilde':'~', 'textasciicircum':'^', 'lvert':'|', 'rvert':'|',
               'vert':'|', 'vline':'', 'np':'', 'numprint':'', 'num':''}
    text = re.sub(r'\\([A-Za-z]+|[_%#&{}])(?:\{\})?', lambda m: symbols.get(m[1], m[0]), text)
    text = re.sub(r'\\[,;:! ]', ' ', text)
    text = text.replace('$', '').replace('{', '').replace('}', '')
    text = text.replace('~', '\ue000')
    text = re.sub(' +', ' ', text).strip()
    return text.replace('\ue000',' ').replace('\ue001','{').replace('\ue002','}')


def code_block(lines, numbers=None):
    attrs = ' class="annal-code" tabindex="0" aria-label="Code informatique"'
    if numbers is None:
        content = html.escape('\n'.join(lines))
    else:
        content = '\n'.join('<span class="annal-code-line" data-line="'+html.escape(n, quote=True)+'">'+html.escape(line)+'</span>' for n,line in zip(numbers,lines))
    return '<pre'+attrs+'><code>'+content+'</code></pre>'


def protect_code(text):
    """Replace code by opaque, collision-free tokens before prose/math/figure parsing.

    Process innermost tables first: side-by-side candidate programs keep their
    column headings and each program remains an independent selectable block.
    Mathematical pseudocode stays in TeX for MathJax; it is never flattened to Python.
    """
    blocks = {}
    def keep(markup):
        token = 'MXANNALCODE' + str(len(blocks)) + 'END'
        if token in text:
            raise ValueError('Code placeholder collision')
        blocks[token] = markup
        return r'\texttt{'+token+'}'

    # Pandoc misses uppercase Verbatim and some custom listing environments.
    literal = re.compile(r'\\begin\{(lstlisting|verbatim|Verbatim|python)\}(?:\[[^\]]*\])?(?:[ \t]*\r?\n)?([\s\S]*?)\\end\{\1\}')
    def literal_block(m):
        # Remove the boundary newline only; leading spaces on the first line matter.
        body = m[2].strip('\r\n')
        return keep(code_block(body.expandtabs(4).splitlines()))
    text = literal.sub(literal_block, text)
    # Inline fancyvrb commands use a delimiter, not TeX grouping.
    text = re.sub(r'\\begin\{Verb\}([|!+])([\s\S]*?)\1\\end\{Verb\}', lambda m: r'\texttt{'+m[2].replace('_',r'\_')+'}', text)

    stack = []
    tables = []
    for m in ENV.finditer(text):
        action, env = m.groups()
        if action == 'begin':
            stack.append((env, m.start()))
        elif stack:
            found = next((i for i in range(len(stack)-1,-1,-1) if stack[i][0] == env), None)
            if found is None:
                continue
            start = stack[found][1]
            stack = stack[:found]
            if env in TABLES:
                chunk = text[start:m.end()]
                if not re.search(r'\\begin\{(?:tabularx?|tblr|minipage)\}', chunk[len('\\begin{'+env+'}'):]):
                    tables.append((start,m.end(),env,chunk))
    for start,end,env,chunk in reversed(tables):
        body = table_body(chunk,env)
        decoded = plain_code(body)
        # Explanatory answer tables can quote a loop in prose. Keep their maths
        # and paragraphs rather than treating the quoted keyword as a program.
        if re.search(r'\b(?:signifie que|après exécution|La valeur contenue|D.après le cours)\b', decoded, re.I):
            continue
        if not PYTHON.search(decoded) and ALGORITHM.search(decoded):
            if not re.search(r'\\begin\{(?:minipage|enumerate|array)\}', body):
                rows = re.split(r'\\\\(?:\s*\[[^\]]*\])?',body)
                rows = [re.sub(r'\\hline\b|\\cline\{[^}]*\}', '', row).strip() for row in rows]
                rows = [row for row in rows if row]
                rows = [re.sub(r'\\qquad\b\s*', 'MXCODEINDENTMXCODEINDENT', row) for row in rows]
                rows = [re.sub(r'\\quad\b\s*', 'MXCODEINDENT', row) for row in rows]
                run = subprocess.run(['pandoc','-f','latex','-t','html5','--mathjax','--wrap=none'], input='\n\n'.join(rows),text=True,capture_output=True,check=True)
                markup = run.stdout.replace('MXCODEINDENT','&#160;'*4)
                text = text[:start]+keep('<div class="annal-algorithm" tabindex="0" aria-label="Algorithme">'+markup+'</div>')+text[end:]
            continue
        if not PYTHON.search(decoded):
            # Non-code data/trace tables and mathematical algorithms retain their
            # original mathematical notation, row structure and symbols.
            continue
        if re.search(r'\\(?:includegraphics|begin\{(?:pspicture|tikzpicture|array|enumerate|minipage)\})', body):
            continue
        rows = re.split(r'\\\\(?:\s*\[[^\]]*\])?|\\par\b', body)
        lines, numbers = [], []
        numbered = any('&' in row and plain_code(row.split('&',1)[0]).strip().isdigit() for row in rows)
        for row in rows:
            row = re.sub(r'\\(?:hline|toprule|midrule|bottomrule)\b|\\(?:cline|cmidrule)\s*\{[^}]*\}', '', row).strip()
            if not row:
                continue
            number = ''
            if numbered and '&' in row:
                cell, rest = row.split('&',1)
                if plain_code(cell).strip().isdigit():
                    number = plain_code(cell).strip()
                    row = rest
            # A blank alignment column acts as an indentation column; a split
            # keyword such as "def & suite()" needs only a separating space.
            cells = re.split(r'(?<!\\)&',row)
            row = ('\ue000'*4 if len(cells)>1 and not cells[0].strip() else '')+' '.join(cells)
            line = plain_code(row)
            lines.append(line)
            numbers.append(number)
        text = text[:start]+keep(code_block(lines, numbers if numbered else None))+text[end:]

    # Bare ttfamily blocks use TeX line breaks/spacing rather than literal spaces.
    def typed_block(m):
        body = m[1]
        if 'MXANNALCODE' in body and '\\begin{' not in body:
            pieces = re.split(r'(\\texttt\{MXANNALCODE\d+END\})',body)
            return ''.join(piece if re.fullmatch(r'\\texttt\{MXANNALCODE\d+END\}',piece) else keep(code_block([plain_code(row.strip()) for row in re.split(r'\\\\|\\par\b',piece) if row.strip()])) if piece.strip() else '' for piece in pieces)
        if '\\begin{' in body or not PYTHON.search(plain_code(body)):
            return body  # Drop the font environment only; its converted tables stay.
        rows = re.split(r'\\\\|\\par\b',body)
        return keep(code_block([plain_code(row.strip()) for row in rows if row.strip()]))
    text = re.sub(r'\\begin\{ttfamily\}([\s\S]*?)\\end\{ttfamily\}', typed_block, text)
    # Pandoc discards single-column multicolumn wrappers, including their labels.
    for match in reversed(list(re.finditer(r'\\multicolumn\b',text))):
        count,pos = group(text,match.end())
        _,pos = group(text,pos)
        label,pos = group(text,pos)
        if count.strip() == '1':
            text = text[:match.start()]+label+text[pos:]
    return text, blocks


def restore_code(soup, blocks):
    from bs4 import BeautifulSoup
    seen = set()
    for code in list(soup.find_all('code')):
        token = code.get_text().strip()
        if token in blocks:
            target = code
            if code.parent.name in {'pre','p'} and code.parent.get_text().strip() == token:
                target = code.parent
            target.replace_with(BeautifulSoup(blocks[token], 'html.parser'))
            seen.add(token)
    if seen != blocks.keys():
        raise ValueError('Code block lost during semantic conversion: '+', '.join(blocks.keys()-seen))

    # Side-by-side answer candidates are layout, not data tables. Keep each
    # program with its own heading when the columns wrap on a narrow screen.
    for table in reversed(list(soup.find_all('table'))):
        rows = [row for row in table.find_all('tr') if row.find_parent('table') is table]
        program_rows = [row for row in rows if row.find('pre',class_='annal-code')]
        if len(program_rows) != 1:
            continue
        cells = program_rows[0].find_all(['td','th'],recursive=False)
        if len(cells)<2 or not all(cell.find('pre',class_='annal-code') for cell in cells):
            continue
        other_rows = [row for row in rows if row is not program_rows[0]]
        if len(other_rows)>1:
            continue
        headers = other_rows[0].find_all(['td','th'],recursive=False) if other_rows else []
        if headers and len(headers)!=len(cells):
            continue
        grid = soup.new_tag('div',attrs={'class':'annal-program-options'})
        for i,cell in enumerate(cells):
            section = soup.new_tag('section')
            if headers and headers[i].get_text(strip=True):
                title = soup.new_tag('h3')
                title.string = headers[i].get_text(' ',strip=True)
                section.append(title)
            for child in list(cell.contents):
                section.append(child.extract())
            grid.append(section)
        table.replace_with(grid)
