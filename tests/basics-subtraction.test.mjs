import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';

const html = await readFile(new URL('../dist/resources/basics/subtraction.html', import.meta.url), 'utf8');
const source = await readFile(new URL('../site/resources/basics/subtraction.html', import.meta.url), 'utf8');
const app = await readFile(new URL('../dist/js/app.js', import.meta.url), 'utf8');

test('subtraction is published and reachable as the third Basics lesson', () => {
  assert.equal(html, source);
  assert.match(app, /r\.id === "subtraction"/);
  assert.match(app, /id: "subtraction", number: "03"/);
  assert.match(app, /#basics\/subtraction/);
  assert.match(html, /mx-basics-size/);
  assert.match(html, /ResizeObserver/);
  assert.match(html, /prefers-reduced-motion/);
  assert.match(html, /data-theme="dark"/);
  assert.match(html, /Soustraire la colonne/);
  assert.match(html, /Dégrouper/);
  assert.match(html, /Les mêmes échanges, avec des chiffres/);
  assert.ok(!html.includes('fonts.googleapis.com'));
});

test('unbundling preserves differences in bases 2 to 16, including zero chains', () => {
  const script = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
  assert.ok(script, 'inline lesson model');
  const setup = script.slice(0, script.indexOf("$('step').onclick"));
  assert.ok(setup.includes('function reset()'));
  for (const B of [2,3,5,8,10,12,16]) {
    const cases = [[0,0],[1,0],[1,1],[452,267],[1000,1],[100,99],[1000,999],[9999,9999],[9999,0],[B*B,1],[B**3,1],[B-1,B-1],[3210,1234]]
      .filter(([a,z])=>a<=9999 && z<=a);
    for (let a=0; a<=9999; a+=113) cases.push([a, Math.floor(a*37/101)]);
    for (const [A,Z] of cases) {
      const data=JSON.parse(runInNewContext(setup+';S.B='+B+';S.A='+A+';S.Z='+Z+';reset();JSON.stringify({bad:S.bad,n:S.n,steps:S.st})'));
      assert.equal(data.bad, 0);
      assert.equal(data.steps.length, data.n);
      let sum=0;
      for (const st of data.steps) {
        assert.equal(st.r,st.x1-st.y);
        assert.ok(st.r>=0 && st.r<B, 'one result digit per column');
        if(st.need){
          assert.equal(st.x1,st.x+B);
          assert.ok(st.q>st.p && st.q<data.n);
          assert.equal(st.mid.t[st.q],st.pre.t[st.q]-1);
          for(let j=st.q-1;j>st.p;j--) assert.equal(st.mid.t[j],B-1);
        } else assert.equal(st.x1,st.x);
        sum+=st.r*B**st.p;
      }
      assert.equal(sum,A-Z, 'exact difference in the selected base');
    }
    for (const [A,Z] of [[0,1],[100,101],[500,501]]) {
      const invalid=runInNewContext(setup+';S.B='+B+';S.A='+A+';S.Z='+Z+';reset();S.bad===1&&S.st.length===0');
      assert.equal(invalid,true, 'negative differences are rejected in this natural-number lesson');
    }
  }
});
