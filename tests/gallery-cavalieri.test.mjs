// Cavalieri's principle (issue #30): the hemisphere and the cylinder-minus-cone sections are equal at every height, their
// volumes agree with independent computations (Simpson over the sections, and the solid of revolution by discs), and a
// leaning stack of cards keeps its volume.
import test from 'node:test';
import assert from 'node:assert/strict';
import {hemisphereSection,ringSection,hemisphereRadius,volumes,stack,volumeFromSections,volumeBelow,cardAt} from '../site/js/gallery/gallery-cavalieri-model.js';

const near=(a,b,tol=1e-9)=>assert.ok(Math.abs(a-b)<=tol*Math.max(1,Math.abs(b)),`${a} versus ${b}`);

test('equal sections at every height, by Pythagoras on one side and similar triangles on the other', () => {
  for(const R of [0.5,1,2.7,10])for(let i=0;i<=50;i++){const z=R*i/50;
    near(hemisphereSection(R,z),Math.PI*hemisphereRadius(R,z)**2);      // disc of the hemisphere
    const cone=z;   // the cone has apex at height 0 and radius R at height R: radius z at height z (similar triangles)
    near(ringSection(R,z),Math.PI*R*R-Math.PI*cone*cone);
    near(hemisphereSection(R,z),ringSection(R,z));}
});

test('volumes: hemisphere = cylinder − cone = 2πR³/3, by Simpson over the sections and by stacked discs', () => {
  for(const R of [1,2.5]){const V=volumes(R);
    near(V.cylinder-V.cone,V.hemisphere);near(2*V.hemisphere,V.sphere);
    near(volumeFromSections(z=>hemisphereSection(R,z),R),V.hemisphere,1e-9);
    // stacked discs (a Riemann sum with midpoints) converges to the same value
    const n=20000;let s=0;for(let i=0;i<n;i++){const z=(i+0.5)*R/n;s+=Math.PI*(R*R-z*z)*R/n;}near(s,V.hemisphere,1e-6);
  }
});

test('a leaning stack of cards keeps its volume, its height and its section; only its outline changes', () => {
  const base={n:12,w:4,d:3,e:0.25};
  const a=stack({...base,shear:0}),b=stack({...base,shear:0.4});
  near(a.volume,b.volume);near(a.height,b.height);near(a.section,b.section);assert.ok(b.footprint>a.footprint);
  near(b.cards.reduce((s,c)=>s+c.w*base.d*c.h,0),a.volume);
  const w=stack({...base,wave:1.5});near(w.volume,a.volume);assert.ok(w.footprint>a.footprint);
  for(const z of [0,0.3,1.1,2.99]){assert.equal(cardAt(a,z).w,cardAt(w,z).w);}assert.equal(cardAt(a,3),null);
});

test('volume below the plane: Simpson over the sections of either solid, up to every height', () => {
  for(const R of [1,1.7])for(let i=0;i<=10;i++){const z=R*i/10;
    near(volumeFromSections(u=>hemisphereSection(R,u),z,200),volumeBelow(R,z),1e-9);
    near(volumeFromSections(u=>ringSection(R,u),z,200),volumeBelow(R,z),1e-9);}
  near(volumeBelow(2,2),volumes(2).hemisphere);
});
