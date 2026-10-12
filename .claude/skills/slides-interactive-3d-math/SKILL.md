---
name: "slides-interactive-3d-math"
description: "Add-on for slides-interactive-math: every canvas must be draggable, and true rotatable 3D is used for surfaces, solids and cells. Use with any interactive maths slide request."
---

# Interactive canvases and real 3D for maths slides

This extends `slides-interactive-math` (same stage 1280x720, MathJax, `P`/`D` tween, step reveal, selectors, lint). It fixes two gaps found in practice: first versions drew **passive** canvases and **faked 3D with 2D contour plots**. The user's rule: *not every slide needs 3D, but every canvas must be interactive, and 3D must be used whenever the object is 3D.*

## 1. Rules

1. **Every canvas is interactive.** For each scene, list the quantities a teacher would otherwise set with a slider, and make each one a draggable on-canvas handle (sliders stay as the accessible fallback and stay in sync). Examples: initial value on a curve, an equilibrium line, a root in the complex plane, a rectangle's edge, a bar end, a slice position, a point on a surface (drag its shadow on the floor), a secant's second point.
2. **3D when the object is 3D**: surfaces z=f(x,y), tangent planes, solids under a surface, level-of-integration slices, spherical/cylindrical cells, space curves lifted onto a surface. Keep 2D for genuinely 1D/planar content (graphs of y(x), slope fields, root plots, sign tables) but still make them draggable. Pair a 3D panel with a small 2D companion (a slice, g(t), F(x)) when the 2D view carries the reading.
3. **Rotation by default**: dragging empty space in a 3D panel rotates it; handles take priority over rotation. Clamp pitch to [0.12, 1.45].
4. **Affordance**: pulsing dashed ring on every handle, hover cursor (`grab`, `ew-resize`, `ns-resize`, `move`, `grabbing`), and one line of hint text at the top of the text column ("Interactif : glissez ..."). Update the hint when a mode selector changes it.
5. Grabbing a handle stops any running animation.

## 2. Pointer protocol (copy this)

CSS: `#stage canvas{pointer-events:auto;touch-action:none}` (the template ships `pointer-events:none`; change it). Text column and controls sit above the canvas in DOM order, so they still receive their own events.

Each scene defines `sc.hit(x,y)` in stage coordinates returning `null` or `{cur, move(X,Y)}`; `move` writes to `P` (never to `D`). Hit-testing uses the **same positions that were drawn**, i.e. `D`.

```js
var cvs=$('c'),DRG=null;
function ptr(e){var r=cvs.getBoundingClientRect();return[(e.clientX-r.left)/(r.width||1280)*1280,(e.clientY-r.top)/(r.height||720)*720]}
cvs.addEventListener('pointerdown',function(e){var sc=S[si];if(!sc.hit||e.button>0)return;var q=ptr(e),h=sc.hit(q[0],q[1]);if(!h)return;
 if(A)stopAnim();DRG=h;try{cvs.setPointerCapture(e.pointerId)}catch(x){}e.preventDefault();cvs.style.cursor='grabbing'});
cvs.addEventListener('pointermove',function(e){var q=ptr(e);if(DRG){DRG.move(q[0],q[1]);ctlSync();return}
 var h=S[si].hit?S[si].hit(q[0],q[1]):null;cvs.style.cursor=h?(h.cur||'pointer'):'default'});
function endDrag(){if(!DRG)return;DRG=null;cvs.style.cursor='default';upd()}
cvs.addEventListener('pointerup',endDrag);cvs.addEventListener('pointercancel',endDrag);
// in frame(): if(DRG&&now-lastU>110){lastU=now;upd()}   // throttle MathJax text rebuild while dragging
```

Panels need inverse maps: `iX(X)=xa+(X-x0)/w*(xb-xa)`, `iY(Y)=yb-(Y-y0)/h*(yb-ya)`.

Helpers: `rs(v,step,a,b)` = snap to step, clamp, `toFixed(6)`; `nr(x,y,X,Y,r)` = within r px. Slider `step` must be <= the snap step used by the drag (else ctlSync fights the drag); widen `min/max` of sliders to the draggable range.

**Pitfalls**
- **Axis rescaling under the cursor**: if a parameter drives the axis range (e.g. `wy=Q0*1.15`), freeze the range while `DRG` is set (`if(DRG)return;` at the top of the scene's `pre()`), or the handle runs away from the pointer.
- **Relative dragging for projected points**: a point on a surface and its floor shadow project to different floor positions; compute the floor point under the pointer at pointerdown and apply only the delta, to avoid a jump.
- **Wrap-around quantities** (angles, polar): normalise differences to (-pi, pi].
- **Draw from `D`, write `P`**: every key a `draw()` reads from `D` must be in `tw`, otherwise the curve ignores the slider (a real bug found: `D.y0` was never updated). Check this for every scene.
- Hysteresis-free mappings for root handles: real root if |Im|<0.15 else complex (c=1+Im^2); snap afterwards.

## 3. True 3D with canvas 2D (no library)

Orthographic camera, z up, `cam={yaw,pitch}`; defaults about yaw -0.6..-0.75, pitch 0.5.

```js
M.pj=function(yw,pt,x,y,z){var cy=Math.cos(yw),sy=Math.sin(yw),cp=Math.cos(pt),sp=Math.sin(pt),x1=cy*x-sy*y,y1=sy*x+cy*y;return{u:x1,v:z*cp+y1*sp,d:y1*cp-z*sp}};   // d larger = farther
M.upj=function(yw,pt,u,v,z){var cy=Math.cos(yw),sy=Math.sin(yw),cp=Math.cos(pt),sp=Math.sin(pt),y1=(v-z*cp)/sp;return{x:cy*u+sy*y1,y:-sy*u+cy*y1}}; // unproject onto plane z
function P3(x0,y0,w,h,s,c,cam){return{x0:x0,y0:y0,w:w,h:h,s:s,c:c,cam:cam,
 pr:function(x,y,z){var q=M.pj(cam.yaw,cam.pitch,x-c[0],y-c[1],z-c[2]);return{X:x0+w/2+s*q.u,Y:y0+h/2-s*q.v,d:q.d}},
 un:function(X,Y,zf){var q=M.upj(cam.yaw,cam.pitch,(X-x0-w/2)/s,-(Y-y0-h/2)/s,zf-c[2]);return{x:q.x+c[0],y:q.y+c[1]}}}}
```

- **Painter's algorithm**: build facets `{pts:[[x,y,z],...],f:fill,a:alpha,s:stroke}`, project, sort by mean `d` descending, fill. Keep the facet count under about 600 per frame (surface 22x22, walls 30-60, cell faces 4x4).
- **Shading**: fixed light `L=(-0.35,-0.55,0.76)`; shade = 0.5+0.5|n.L|/|n| from the facet cross product; colour from sign/magnitude of z (green positive, red negative) mixed with the panel colour. Precompute static meshes once per scene; recolour per frame only when highlighting (e.g. slices already swept).
- **Fit**: choose `s` and centre `c` so the projected extent stays inside the panel for every yaw (check corners at pitch 0.5; extent about s*(r*1.4*0.5+zrange*0.9)). Scale z by a constant `k` (e.g. 0.07) when f ranges widely, and say so in the panel title if distances matter.
- **Floor plane below the surface** (z = below min) with a grid: it is the picking plane for dragging (x,y), the place for shadows, footprints, vectors, and the slice line. Draw floor first, then `flush(facets)`, then curves/points/vectors on top, all inside `pclip(panel)`.
- Slices: add a translucent vertical rectangle as one more facet so it sorts with the surface; draw the curve on the surface thick, the secant and tangent as 3D line segments.
- Tangent plane: 5x5 translucent facets, drawn in the same sorted list as the surface.
- Cones/solids: triangle fans (28 segments) plus a base polygon; perturbed copies as dashed wireframe.
- Spherical cell: six faces (rho, theta, phi constant), colour pairs per coordinate; draw the three edge vectors at a corner with labels d(rho), rho d(theta), rho sin(theta) d(phi).
- Layout: 3D panel about 380-400 wide x 390 tall at x=600; a 240-280 px wide 2D companion at the right; legends inside the panel bottom-left.
- Say honestly in the report that painter sorting is approximate where surfaces intersect (e.g. a tangent plane cutting a cone).

## 4. Verification additions

1. Unit-test the projection: `upj(pj(p)) = p` on random yaw/pitch/points (1e-9), and depth/orientation (farther y gives larger d and higher v).
2. Test any new analytic quantity used in 3D (e.g. spherical cell volume exact vs approximate ratio -> 1; unit ball volume 4pi/3).
3. jsdom pointer smoke test: stub `cvs.getBoundingClientRect` to `{left:0,top:0,width:1280,height:720}`; for every scene and mode scan the graph area with `pointermove` to confirm handles exist (cursor changes), then `pointerdown` on grabbable points, move to extremes (including far outside the canvas), `pointerup`; fail on any non-finite canvas argument, bad TeX (NaN/undefined/Infinity) or console error. A full scan is slow with a proxy canvas: use coarse grids and run scenes in separate processes in the background with output to a file.
4. Re-run `lint_slide.py` and the numeric tests after the patch; republish to the same artifact `url`.
5. Large edits: patch with a script that replaces each scene's `draw` block between markers and asserts each replacement matches exactly once; keep a backup of the previous version.

## 5. Report

List which canvases are now draggable and what each handle controls, which scenes are in 3D, what was tested (projection round trip, pointer smoke), and that the render itself was not seen unless it was.