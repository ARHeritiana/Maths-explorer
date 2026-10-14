import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
test('slide extraction preserves Python modulo and authored widgets are not duplicated',()=>{
 const code=String.raw`
import ast,re
from pathlib import Path
p=Path('scripts/build-slides.py');tree=ast.parse(p.read_text())
functions=[n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name in ('strip_comments','add_widgets')]
ns={'re':re,'WIDGETS':{'test':[(r'Three forms',{'type':'quad'})]}}
exec(compile(ast.Module(body=functions,type_ignores=[]),str(p),'exec'),ns)
s=r'''Before % TeX comment
\begin{lstlisting}[language=Python]
def f(a,b):
    return a % b == 0
\end{lstlisting}
After \% literal % comment
'''
out=ns['strip_comments'](s)
assert 'a % b == 0' in out and 'TeX comment' not in out and '\\% literal' in out
slides=[{'k':'concept','t':['Trois formes','Three forms']},{'k':'widget','w':{'type':'quad'}}]
assert len(ns['add_widgets']('test',slides))==2
`;
 const result=spawnSync('python3',['-I','-c',code],{cwd:new URL('..',import.meta.url),encoding:'utf8'});
 assert.equal(result.status,0,result.stderr);
});
