import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';
const html = await readFile(new URL('../dist/resources/basics/addition.html', import.meta.url), 'utf8');
const source = await readFile(new URL('../site/resources/basics/addition.html', import.meta.url), 'utf8');
const app = await readFile(new URL('../dist/js/app.js', import.meta.url), 'utf8');
test('addition is published and accessible through Basics', () => {
  assert.equal(html, source);
  assert.match(app, /r\.id === "addition"/);
  assert.match(app, /id: "addition"/);
  assert.match(app, /resources\/basics\//);
  assert.match(html, /mx-basics-size/);
  assert.match(html, /ResizeObserver/);
  assert.match(html, /prefers-reduced-motion/);
  assert.match(html, /data-theme="dark"/);
  assert.match(html, /Ajouter la colonne/);
  assert.match(html, /Regrouper/);
  assert.ok(!html.includes('fonts.googleapis.com'));
});
test('the carry model reconstructs each sum in bases 2 to 16', () => {
  const script = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
  assert.ok(script, 'inline lesson model');
  const setup = script.slice(0, script.indexOf("$('step').onclick"));
  assert.ok(setup.includes('function reset()'));
  for (const b of [2,3,5,8,10,12,16])
    for (const [a,z] of [[0,0],[1,1],[478,256],[9999,9999],[b-1,1],[b*b-1,1]]) {
      const data = JSON.parse(runInNewContext(setup + '\nS.B='+b+';S.A='+a+';S.Z='+z+';reset();JSON.stringify({n:S.n,steps:S.st})'));
      let carry=0, sum=0;
      for (const st of data.steps) {
        assert.equal(st.ca,carry);
        assert.equal(st.s,st.x+st.y+carry);
        assert.equal(st.q,Math.floor(st.s/b));
        assert.equal(st.r,st.s%b);
        sum += st.r * b**st.p;
        carry=st.q;
      }
      assert.equal(carry,0);
      assert.equal(sum,a+z);
    }
});

test('written addition stays synchronized with the carried column in every base', () => {
  assert.match(html, /Les mêmes échanges, en chiffres/);
  assert.match(html, /id="o1"/);
  assert.match(html, /function digits\(\)/);
  const script=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
  const setup=script.slice(0,script.indexOf("$('step').onclick"));
  for(const [base,a,b,unit] of [[2,1,1,'0'],[10,478,256,'4'],[16,15,1,'0']]){
    const output=JSON.parse(runInNewContext(setup+`
S.B=${base};S.A=${a};S.Z=${b};reset();
S.k=0;S.pend=1;digits();const pending=$('o1').innerHTML;
S.k=1;S.pend=0;digits();JSON.stringify({pending,after:$('o1').innerHTML,step:S.st[0]});
`,{document:{getElementById(){return cell}},cell:{innerHTML:''}}}));
    assert.equal(output.step.q,1);
    assert.equal(output.step.r,parseInt(unit,16));
    assert.ok(output.pending.includes('<sup>1</sup>'+unit),'pending bundle must be visible in written sum');
    assert.match(output.after,/class="dc sm"[^>]*>1<\/div>/,'carry must appear in the next written column');
    assert.ok(!output.after.includes('NaN'));
  }
});
