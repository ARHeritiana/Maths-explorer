/* Maths Explorer service worker: the application shell always starts, and what was opened stays available offline.
   Contract and limits: docs/OFFLINE.md. The build (build/mxbuild/offline.py) replaces the next line by the manifest of
   the shell: { version, bytes, files: [[path, sha1 of the content cut to 10 characters], ...] }. */
self.__MX_SHELL = {"version":"7c0356dc1a691e02","bytes":9501373,"files":[["fonts/atkinson-hyperlegible-latin-400-normal.woff2","3201099022"],["fonts/atkinson-hyperlegible-latin-700-normal.woff2","05dadf003f"],["fonts/atkinson-hyperlegible-latin-ext-400-normal.woff2","3a54aad037"],["fonts/atkinson-hyperlegible-latin-ext-700-normal.woff2","97dbf56ced"],["fonts/bricolage-grotesque-latin-ext-wght-normal.woff2","98be87f64b"],["fonts/bricolage-grotesque-latin-wght-normal.woff2","9b03f9ffed"],["fonts/stix-two-text-latin-400-italic.woff2","e95441c02c"],["fonts/stix-two-text-latin-600-normal.woff2","9748966246"],["fonts/stix-two-text-latin-700-normal.woff2","c2768e0ce3"],["index.html","46c58981b0"],["js/annals-bank.js","49636c9652"],["js/app.js","b298b0e7a4"],["js/automatismes.js","027ca4e4ff"],["js/bank-page.js","56108896c9"],["js/basics-page.js","ffbd569767"],["js/biographies-major.js","d52726aba4"],["js/camera3d.js","1bacf9765e"],["js/canvas-navigation.js","04396cab00"],["js/catalogue-data.js","49511d3a61"],["js/challenges/ants/activity.js","976caa20eb"],["js/challenges/ants/art.js","b866e20fa8"],["js/challenges/ants/index.js","dbbb27f9e0"],["js/challenges/ants/maths.js","41b659837f"],["js/challenges/ants/solution.js","b2be3921bc"],["js/challenges/artgallery/activity.js","589200b7d1"],["js/challenges/artgallery/index.js","a7726f35b4"],["js/challenges/artgallery/maths.js","dcc348abcb"],["js/challenges/artgallery/solution.js","a78d84e10c"],["js/challenges/box/activity.js","98296b5a15"],["js/challenges/box/index.js","c4441183c8"],["js/challenges/box/maths.js","6d1cb3faca"],["js/challenges/box/solution.js","382be0a9c0"],["js/challenges/box/view-3d.js","288f2e3642"],["js/challenges/bridge/activity.js","ca98cb01ae"],["js/challenges/bridge/art.js","a0c25bc910"],["js/challenges/bridge/index.js","2dce15039f"],["js/challenges/bridge/maths.js","b9e3f98cf9"],["js/challenges/bridge/solution.js","1d19b55029"],["js/challenges/cake/activity.js","3fa1945f7b"],["js/challenges/cake/index.js","71af850423"],["js/challenges/cake/maths.js","95a9255a8b"],["js/challenges/cake/solution.js","ec39a46557"],["js/challenges/cake/view-3d.js","c618f01624"],["js/challenges/cham/activity.js","c4b9de476c"],["js/challenges/cham/art.js","519f7c2188"],["js/challenges/cham/index.js","b1f0ea2d40"],["js/challenges/cham/maths.js","f6d666247b"],["js/challenges/cham/solution.js","001d4718c0"],["js/challenges/cheryl/activity.js","1697f08ed8"],["js/challenges/cheryl/index.js","b5799daa31"],["js/challenges/cheryl/maths.js","31f4cb511b"],["js/challenges/cheryl/solution.js","7ff1f9b49d"],["js/challenges/chess/activity.js","1b16b6224e"],["js/challenges/chess/index.js","9500d590b3"],["js/challenges/chess/solution.js","c9b52544d9"],["js/challenges/coffee/activity.js","22a7240170"],["js/challenges/coffee/art.js","682e199aa3"],["js/challenges/coffee/index.js","4889f5ff66"],["js/challenges/coffee/maths.js","c5791ff7c7"],["js/challenges/coffee/solution.js","051d3fbe8e"],["js/challenges/common/bubble.js","63df7fab66"],["js/challenges/common/cartoon.js","0c574f43f9"],["js/challenges/common/helpers.js","64c36cb4fe"],["js/challenges/common/icon.js","4353f1f522"],["js/challenges/common/kit.js","fb95cbefd7"],["js/challenges/common/knight-piece.js","769c1fab06"],["js/challenges/common/person.js","781a8fc5cb"],["js/challenges/common/player.js","be757eebda"],["js/challenges/common/scene-3d.js","dffb1f55e6"],["js/challenges/common/scene-kit.js","33aaff5e64"],["js/challenges/common/scene-props.js","30ee0ab200"],["js/challenges/common/view-3d.js","dd3a9c1f50"],["js/challenges/cookies/activity.js","fa1b349876"],["js/challenges/cookies/index.js","616417edce"],["js/challenges/cookies/maths.js","5b41aa410b"],["js/challenges/cookies/solution.js","a5908e1de4"],["js/challenges/doors/activity.js","ca51a9f7a2"],["js/challenges/doors/index.js","68879a7ae4"],["js/challenges/doors/solution.js","57936dc96e"],["js/challenges/eggs/activity.js","98272e7b3d"],["js/challenges/eggs/index.js","6795d28a52"],["js/challenges/eggs/maths.js","223887d877"],["js/challenges/eggs/solution.js","63d6b7be12"],["js/challenges/factorials/activity.js","cfde0e19d8"],["js/challenges/factorials/index.js","68d9f68daa"],["js/challenges/factorials/maths.js","6a8df18f95"],["js/challenges/factorials/solution.js","bb7a0605ce"],["js/challenges/fakecoins/activity.js","f493000235"],["js/challenges/fakecoins/art.js","7448354aec"],["js/challenges/fakecoins/index.js","d917597076"],["js/challenges/fakecoins/maths.js","96bfb3c69d"],["js/challenges/fakecoins/solution.js","59b0c234ee"],["js/challenges/fly/activity.js","c866d4a7a3"],["js/challenges/fly/index.js","b088840594"],["js/challenges/fly/maths.js","c4fdd7e973"],["js/challenges/fly/solution.js","5b43d8f3ae"],["js/challenges/gauss-sum/activity.js","394393780e"],["js/challenges/gauss-sum/index.js","bd22b8386c"],["js/challenges/gauss-sum/maths.js","9975981560"],["js/challenges/gauss-sum/solution.js","be350101c0"],["js/challenges/gridpaths/activity.js","002906fa0a"],["js/challenges/gridpaths/index.js","d7c608725b"],["js/challenges/gridpaths/maths.js","624b417204"],["js/challenges/gridpaths/solution.js","5b62500c9f"],["js/challenges/handshakes/activity.js","fef116d9cc"],["js/challenges/handshakes/index.js","1bc407980e"],["js/challenges/handshakes/maths.js","2d5c9e6812"],["js/challenges/handshakes/plan.js","20ef9cfcdf"],["js/challenges/handshakes/solution.js","e149ef3da4"],["js/challenges/hanoi/activity.js","b1f2becfe4"],["js/challenges/hanoi/index.js","101df82592"],["js/challenges/hanoi/solution.js","5f0595b7a8"],["js/challenges/hiker/activity.js","5744c5ef90"],["js/challenges/hiker/art.js","8b3f55983f"],["js/challenges/hiker/index.js","d6784a5c65"],["js/challenges/hiker/maths.js","fe60e3c1ce"],["js/challenges/hiker/plan.js","fa0737ccc1"],["js/challenges/hiker/solution.js","b946dcd4e3"],["js/challenges/horses/activity.js","da9366a707"],["js/challenges/horses/art.js","5339b502e1"],["js/challenges/horses/index.js","fd6cf8d348"],["js/challenges/horses/maths.js","bf6072aeec"],["js/challenges/horses/solution.js","d2c2a2a0ec"],["js/challenges/inversions/activity.js","e2bf89fe9d"],["js/challenges/inversions/index.js","35d39b687c"],["js/challenges/inversions/maths.js","3b132143b3"],["js/challenges/inversions/solution.js","5110b2a9d1"],["js/challenges/josephus/activity.js","4477eba71d"],["js/challenges/josephus/index.js","1c398e71b7"],["js/challenges/josephus/maths.js","95041e813f"],["js/challenges/josephus/solution.js","0eb5b410e2"],["js/challenges/jugs/activity.js","48f7204d9d"],["js/challenges/jugs/index.js","62dd5d5f30"],["js/challenges/jugs/maths.js","7010209be2"],["js/challenges/jugs/solution.js","82427e65bf"],["js/challenges/knights/activity.js","02a07ccd85"],["js/challenges/knights/index.js","9659f65f75"],["js/challenges/knights/maths.js","f5501916f8"],["js/challenges/knights/solution.js","df8ff5ae79"],["js/challenges/konigsberg/activity.js","56a9b2ff96"],["js/challenges/konigsberg/art.js","552b5b79a8"],["js/challenges/konigsberg/index.js","e15cc1d85b"],["js/challenges/konigsberg/maths.js","351be84ada"],["js/challenges/konigsberg/plan.js","0b0757ae0b"],["js/challenges/konigsberg/solution.js","523dbfc5be"],["js/challenges/lighteggs/activity.js","9b5d44db3f"],["js/challenges/lighteggs/index.js","a5a4713694"],["js/challenges/lighteggs/maths.js","7149070b35"],["js/challenges/lighteggs/solution.js","6021814cfc"],["js/challenges/lunes/activity.js","cb0610a7e5"],["js/challenges/lunes/index.js","ea3e0560e4"],["js/challenges/lunes/maths.js","35cd7ef023"],["js/challenges/lunes/solution.js","d8d483b081"],["js/challenges/merge/activity.js","d612b9f310"],["js/challenges/merge/index.js","8c6bba4330"],["js/challenges/merge/maths.js","2be5c08878"],["js/challenges/merge/solution.js","7c7403a6b6"],["js/challenges/nails/activity.js","699b7dd5e9"],["js/challenges/nails/art.js","89ac2caeab"],["js/challenges/nails/gesture.js","d80fb7e4d1"],["js/challenges/nails/index.js","fae5562214"],["js/challenges/nails/maths.js","2a30fb332c"],["js/challenges/nails/plan.js","bd2ee6bf45"],["js/challenges/nails/rope-path.js","d4ccc312b8"],["js/challenges/nails/solution.js","bc6e2abbc6"],["js/challenges/nails/timeline.js","3eaf233ca4"],["js/challenges/nim/activity.js","bcd3730b99"],["js/challenges/nim/index.js","50b5153bc5"],["js/challenges/nim/maths.js","fd8d7a3a96"],["js/challenges/nim/solution.js","a527bf2ab8"],["js/challenges/pegs/activity.js","9397bb40d5"],["js/challenges/pegs/index.js","f2c29d816f"],["js/challenges/pegs/maths.js","be7d18b888"],["js/challenges/pegs/solution.js","fc3aaec0e4"],["js/challenges/pigeonhole/activity.js","d95b1abb23"],["js/challenges/pigeonhole/art.js","eb43f98762"],["js/challenges/pigeonhole/index.js","c4ae6b319c"],["js/challenges/pigeonhole/solution.js","4d4486f2f2"],["js/challenges/piles/activity.js","a50f72c6a3"],["js/challenges/piles/index.js","b7afcc1c06"],["js/challenges/piles/maths.js","1dac5fb496"],["js/challenges/piles/solution.js","65a812468e"],["js/challenges/queens/activity.js","8518655161"],["js/challenges/queens/index.js","c093aad195"],["js/challenges/queens/maths.js","6816f720a7"],["js/challenges/queens/solution.js","4ee34929f8"],["js/challenges/ramsey/activity.js","ee88af0590"],["js/challenges/ramsey/index.js","7c712f5e84"],["js/challenges/ramsey/solution.js","3461582807"],["js/challenges/reflect/activity.js","b627355c88"],["js/challenges/reflect/index.js","2859767e85"],["js/challenges/reflect/maths.js","6734c0be61"],["js/challenges/reflect/solution.js","5dc783e115"],["js/challenges/registry.js","957cff2e6e"],["js/challenges/rooms/activity.js","3006f7d71c"],["js/challenges/rooms/art.js","f6f3913f8f"],["js/challenges/rooms/index.js","f8d9e678e0"],["js/challenges/rooms/maths.js","5341df01ec"],["js/challenges/rooms/solution.js","5e0adfb551"],["js/challenges/snail/activity.js","516121a210"],["js/challenges/snail/art.js","804644d7e7"],["js/challenges/snail/index.js","41380a9e14"],["js/challenges/snail/maths.js","4eb4b5f2a8"],["js/challenges/snail/solution.js","d96cb9a536"],["js/challenges/squares/activity.js","a7bd2e6141"],["js/challenges/squares/index.js","f8f24369a8"],["js/challenges/squares/solution.js","144076ac0e"],["js/challenges/star/activity.js","81839d36c8"],["js/challenges/star/index.js","9a88225967"],["js/challenges/star/maths.js","838c8a4bb6"],["js/challenges/star/solution.js","30039e98a1"],["js/challenges/sumproduct/activity.js","2caa7eaa49"],["js/challenges/sumproduct/index.js","950c8e668d"],["js/challenges/sumproduct/maths.js","f69537406d"],["js/challenges/sumproduct/solution.js","050a906fdc"],["js/chapter-sequence.js","5b924a75bd"],["js/classroom-context.js","ede6ba9a15"],["js/config.js","5637398774"],["js/content-language.js","a6f646dbc1"],["js/content.js","8a17715897"],["js/control-policy.js","a7bac4dbb5"],["js/data-loader.js","cf9ec4f62b"],["js/device-capability.js","23bc059e65"],["js/discovery-index.js","575cafbdc0"],["js/discovery-previews.js","02906a4b14"],["js/discovery.js","1b2ab88f55"],["js/dock-model.js","8b9f826098"],["js/dock.js","cc1cc5459d"],["js/dynamics-content.js","c240a27032"],["js/enrichment-data.js","8506e11c70"],["js/entry-nav.js","cdb6fa75d5"],["js/errors-data.js","0763306f2f"],["js/errors-model.js","88f5d0bf59"],["js/errors.js","5d64acf67b"],["js/exercises/authored-exams.js","e8a889de6e"],["js/exercises/authored-seconde.js","12c770ddce"],["js/exercises/authored.js","4e8c47aaa5"],["js/exercises/bank-select.js","92824edea6"],["js/exercises/bank.js","91600ebcb8"],["js/exercises/competencies.js","afc3d4ac2c"],["js/exercises/engine.js","acd62de68d"],["js/exercises/expertes-kit.js","abee042d16"],["js/exercises/export.js","ab8472aa57"],["js/exercises/premiere-kit.js","e61cacae22"],["js/exercises/problems-expertes.js","645ff0dd08"],["js/exercises/problems-premiere.js","6d998d8db0"],["js/exercises/problems-seconde-2.js","861b39310e"],["js/exercises/problems-seconde-3.js","5527935b89"],["js/exercises/problems-seconde.js","6e69bc6dad"],["js/exercises/problems-stmg.js","f77fefac57"],["js/exercises/problems-terminale.js","3fa409ccf7"],["js/exercises/problems.js","4c86e9f84e"],["js/exercises/seconde-kit-2.js","97ca1e4c2b"],["js/exercises/seconde-kit.js","f717d5e6bd"],["js/exercises/starter-visual.js","cfa96eb18c"],["js/exercises/stmg-kit.js","916dd07b51"],["js/exercises/templates-competences.js","73f3bd71e5"],["js/exercises/templates-expertes-2.js","d30cce5d7f"],["js/exercises/templates-expertes-3.js","7e1b8f2c3b"],["js/exercises/templates-expertes-4.js","d5d66402dd"],["js/exercises/templates-expertes-5.js","8b90677baf"],["js/exercises/templates-expertes.js","220b9f6be6"],["js/exercises/templates-premiere-2.js","2b8810054f"],["js/exercises/templates-premiere-3.js","c05c6ef591"],["js/exercises/templates-premiere-4.js","7516918e14"],["js/exercises/templates-premiere.js","9f9ae86350"],["js/exercises/templates-seconde-2.js","fa559c6de3"],["js/exercises/templates-seconde-3.js","cf6b8a4c69"],["js/exercises/templates-seconde-4.js","a4caac940e"],["js/exercises/templates-seconde-5.js","697c46fd05"],["js/exercises/templates-seconde-6.js","7f99f3323c"],["js/exercises/templates-seconde-7.js","29ab56a0f4"],["js/exercises/templates-seconde-8.js","bf08d3318a"],["js/exercises/templates-seconde.js","86f149bd46"],["js/exercises/templates-stmg-2.js","bf8a87f572"],["js/exercises/templates-stmg-3.js","f9e6aec212"],["js/exercises/templates-stmg-4.js","1e356956b8"],["js/exercises/templates-stmg.js","c63d52ef48"],["js/exercises/templates-terminale-2.js","3ceab0bb75"],["js/exercises/templates-terminale-3.js","508628605c"],["js/exercises/templates-terminale-4.js","ba8b0fca11"],["js/exercises/templates-terminale-5.js","c85b254025"],["js/exercises/templates-terminale.js","9a04cdd499"],["js/exercises/terminale-kit.js","78ba04ffea"],["js/exercises/ui-kit.js","a30d9e4b46"],["js/fair-division-content.js","c28f52d8b6"],["js/figure-engine.js","a36b274b3b"],["js/figure-scenes.js","fc8bc5f067"],["js/fourier-links.js","1b59d3d3bf"],["js/fourier-model.js","9c50159b49"],["js/fractal-gl.js","8df272fa28"],["js/gallery/curiosity-explainers.js","3ed34a7bb9"],["js/gallery/gallery-additions.js","2f902eaf2b"],["js/gallery/gallery-context.js","992044c7b3"],["js/gallery/gallery-curiosities.js","64be147b46"],["js/gallery/gallery-dynamics.js","efa9fe0a01"],["js/gallery/gallery-equidecomposition-model.js","f93ceeeaab"],["js/gallery/gallery-equidecomposition.js","37b989f810"],["js/gallery/gallery-fair-division.js","f367965ea7"],["js/gallery/gallery-fastest.js","5502dc9a66"],["js/gallery/gallery-four-colour-model.js","00f5391d11"],["js/gallery/gallery-four-colour.js","4846f7a400"],["js/gallery/gallery-gomboc.js","d2dd6e2f77"],["js/gallery/gallery-hat-model.js","21e06b91d1"],["js/gallery/gallery-hat.js","58184aa64a"],["js/gallery/gallery-inference.js","bff8c56862"],["js/gallery/gallery-inscribed-model.js","d40be4a61d"],["js/gallery/gallery-inscribed.js","ba0fe58125"],["js/gallery/gallery-kit.js","95967b7318"],["js/gallery/gallery-knot-geometry.js","bfe0d0f0d9"],["js/gallery/gallery-knot-model.js","e6be1ef6ff"],["js/gallery/gallery-knot-render.js","a5c195c793"],["js/gallery/gallery-knots.js","b50e8ac60f"],["js/gallery/gallery-life-model.js","52ae5309ee"],["js/gallery/gallery-life.js","27dfb3acab"],["js/gallery/gallery-math.js","8654f28e26"],["js/gallery/gallery-models.js","418c0ec1b2"],["js/gallery/gallery-objects.js","45b4e1016c"],["js/gallery/gallery-opaque-model.js","41f4465914"],["js/gallery/gallery-opaque.js","a3dea5baa6"],["js/gallery/gallery-room.js","cb2ce2affb"],["js/gallery/gallery-soap-model.js","97096e4613"],["js/gallery/gallery-soap.js","192dd81f78"],["js/gallery/gallery-sofa-gerver.js","87b46200fe"],["js/gallery/gallery-sofa-model.js","8e3931f9da"],["js/gallery/gallery-sofa.js","d9f5301de1"],["js/gallery/gallery-squares-data.js","582dc3da8f"],["js/gallery/gallery-squares-model.js","e80d1536da"],["js/gallery/gallery-squares.js","a05fcbe807"],["js/gallery/gallery-topology.js","572b484af1"],["js/gallery/gallery-voronoi.js","86540e0b4c"],["js/gomboc-body.js","c7d71a715d"],["js/gomboc-content.js","84d2e499da"],["js/gomboc-gl.js","96593f2788"],["js/gomboc-rolling.js","77fc34cb24"],["js/gomboc-support-data.js","69c777890f"],["js/gomboc-support.js","f30ed2f7f2"],["js/history-data.js","c4b211c89c"],["js/history-images.js","d8a8d19015"],["js/history-layout.js","55ca8ef77d"],["js/history.js","01e430e734"],["js/home-art.js","427918d6df"],["js/home-slides.js","5aec319a13"],["js/icons.js","fe69dcac48"],["js/illumination-content.js","e0b78e701f"],["js/illumination-farm.js","c25e82c51a"],["js/illumination-gl.js","2e15e349fe"],["js/illumination-light-worker.js","49c8c902f1"],["js/illumination-light.js","b66c72982e"],["js/illumination-model.js","099605fd21"],["js/illumination-presets.js","9dd22f8ab8"],["js/illumination-view.js","415cfa2679"],["js/illumination-worker.js","e63b1593fc"],["js/inference-content.js","56a60a9334"],["js/knot-catalogue.js","3350a9a9c6"],["js/lab-objects.js","a39d94dbfa"],["js/lab/engine.js","c9c98b28b5"],["js/lab/experiments/bertrand.js","599ac52f31"],["js/lab/experiments/buffon.js","f67ca54439"],["js/lab/experiments/circle-regions.js","23201634d3"],["js/lab/experiments/cobweb.js","c23198e428"],["js/lab/experiments/complex.js","5883c6f513"],["js/lab/experiments/derivative.js","b3ab6c2f3f"],["js/lab/experiments/dynamics.js","7fc01412cc"],["js/lab/experiments/euler-primes.js","388f74344b"],["js/lab/experiments/exponential.js","1e8df010fb"],["js/lab/experiments/fair-division.js","be0086e990"],["js/lab/experiments/fair-scenes.js","57de202a84"],["js/lab/experiments/fermat.js","bf837ea6a6"],["js/lab/experiments/ferris-wheel.js","ed988fe7dc"],["js/lab/experiments/fourier.js","286b5da3c4"],["js/lab/experiments/illumination.js","0101562a39"],["js/lab/experiments/inference.js","b52341b1dd"],["js/lab/experiments/integral.js","16adf179de"],["js/lab/experiments/line.js","ce2d45f971"],["js/lab/experiments/logistic.js","048ce0b7cb"],["js/lab/experiments/matrix.js","51cf4c5c49"],["js/lab/experiments/monte-carlo.js","c9a4b8804e"],["js/lab/experiments/probability.js","6d0d416723"],["js/lab/experiments/quadratic.js","5e5905d04e"],["js/lab/experiments/sequences.js","b2c4dea625"],["js/lab/experiments/space-lines.js","9382fb67d5"],["js/lab/experiments/statistics.js","945959c83e"],["js/lab/experiments/tiles.js","0d657e9039"],["js/lab/experiments/topology.js","8700bf6723"],["js/lab/experiments/trig.js","2d99506b5f"],["js/lab/experiments/vectors.js","5b8b9b7a39"],["js/lab/format.js","63d506e03e"],["js/lab/models/bertrand.js","a1d2f601ef"],["js/lab/models/buffon.js","56f5ed6770"],["js/lab/models/circle-regions.js","f6e47e2505"],["js/lab/models/cobweb.js","2ab8d0eea3"],["js/lab/models/complex.js","3d40da310b"],["js/lab/models/derivative.js","9adefa2f9b"],["js/lab/models/dynamics.js","fb7430ee84"],["js/lab/models/euler-primes.js","8057d80024"],["js/lab/models/exponential.js","6235ce9cad"],["js/lab/models/fair-division.js","7ace2ac308"],["js/lab/models/fermat.js","c37bd492fb"],["js/lab/models/ferris-wheel.js","9f2aa45153"],["js/lab/models/inference.js","cddf94d90f"],["js/lab/models/integral.js","4acdf2217b"],["js/lab/models/line.js","f94c47a578"],["js/lab/models/matrix.js","b6def82d17"],["js/lab/models/monte-carlo.js","3815f93f6b"],["js/lab/models/num.js","58ed3e9d53"],["js/lab/models/primes.js","9eee931636"],["js/lab/models/probability.js","e87227c18f"],["js/lab/models/quadratic.js","aaf08b6d50"],["js/lab/models/sequences.js","109abb897b"],["js/lab/models/space-lines.js","6233a40fe2"],["js/lab/models/statistics.js","395747ca6a"],["js/lab/models/tiles.js","d9d34bc963"],["js/lab/models/topology.js","b96c42346b"],["js/lab/models/trig.js","0148d92458"],["js/lab/models/vectors.js","6189c8eeea"],["js/lab/mount.js","2a7ed0b707"],["js/lab/page.js","a17aaa64cc"],["js/lab/plot.js","5e34997ec5"],["js/lab/registry.js","818b9a546a"],["js/lab/scale.js","dcb2707244"],["js/lab/shell.js","2ad7faa8b2"],["js/lab/templates/calculation.js","811a9d750e"],["js/lab/templates/chance.js","b5041bbb65"],["js/lab/templates/data.js","6857b5f7d9"],["js/lab/templates/dynamics.js","9db45695f3"],["js/lab/templates/family.js","0364658055"],["js/lab/templates/figure.js","12708209de"],["js/lab/templates/fourier.js","baf2fee5c9"],["js/lab/templates/illumination.js","7f9d62a404"],["js/lab/templates/inference-figure.js","316dd1257a"],["js/lab/templates/inference.js","81d2523b3a"],["js/lab/templates/logistic.js","a05156afe5"],["js/lab/templates/monte-carlo.js","eb31a6ef48"],["js/lab/templates/process.js","2f2335e9d1"],["js/lab/templates/space.js","cfb2f59a0a"],["js/lab/templates/stream.js","88bcef1a52"],["js/lab/templates/transform.js","7fbc2a99bb"],["js/launchpad-model.js","e4a26e3908"],["js/learning-content.js","e97b635b08"],["js/library.js","3608f3bcb1"],["js/live-curriculum.js","07d6d2d03d"],["js/mandelbrot-preview.js","4d3aee61f4"],["js/math.js","3728a18776"],["js/modes.js","47ed5c3351"],["js/motion.js","5fe0a274ee"],["js/navigation-state.js","bba40bad57"],["js/object-kit.js","6e3215f507"],["js/offline.js","b7a9bc94b7"],["js/pack-builder.js","0f50bf79d6"],["js/page-ergonomics.js","1072a69f9d"],["js/platonic-explorer.js","9e7298423e"],["js/platonic-fold.js","5c1d7df0e6"],["js/prepare-model.js","2eefa87d1d"],["js/prepare-page.js","d841827d7f"],["js/quadratic-workshop.js","9bee7ed85a"],["js/reading-content.js","f362c66edf"],["js/reading-history-content.js","5d7f910beb"],["js/reading.js","5da87e0156"],["js/related-box.js","b4d54ac56e"],["js/relax-model.js","8f68320a6e"],["js/relax-page.js","00a671dfec"],["js/resource-editions.js","58cfc5e35d"],["js/resource-index.js","00c411815d"],["js/resource-library.js","ef4c6421e3"],["js/resource-search.js","aac0f17e13"],["js/resource-sources.js","1f8560c976"],["js/resources-data.js","85a8d13eca"],["js/review-model.js","f00aff5f20"],["js/review-page.js","486fa00b8e"],["js/review-state.js","103c597b16"],["js/scroll-memory.js","e9eee1baf4"],["js/seance-model.js","ccdb187383"],["js/sequence-model.js","70fbefb3f1"],["js/slides-page.js","fa418ed680"],["js/study-guides.js","1b11b9ed93"],["js/teacher-dashboard.js","da7fbaca10"],["js/teacher-entry.js","104a96d3f4"],["js/teacher-state.js","e93ee3e7d2"],["js/topic-registry.js","67afd07eb0"],["js/topology-content.js","b33a20de64"],["js/ui.js","4dbe58d90f"],["js/visible-loop.js","1bd00417d7"],["js/visual-lessons.js","2d994f8fbb"],["js/welcome.js","b786ca6224"],["js/worksheets.js","c508fed939"],["slides/data/index.json","c8d1b52379"],["slides/lectures/index.json","f60bbe22cb"],["styles/ergonomics.css","4a6e199373"],["styles/exhibit.css","0c1617d5cb"],["styles/explorer.css","3a87a17495"],["styles/generator.css","a24739a4f0"],["styles/history.css","7563185537"],["styles/home.css","18e716a2da"],["styles/inference.css","40d36cdb0d"],["styles/pages.css","a0bf62abf1"],["styles/review.css","9200017f1f"],["styles/teacher.css","9ddd66244e"],["styles/timeline-standalone.css","0fe5d9b7df"],["styles/topics.css","1ec2f6ee25"],["vendor/mathjax-tex-svg.js","b5ddbe0e5d"]]};

const SHELL = self.__MX_SHELL;
const SCOPE = new URL('./', self.location).href;                 // the folder of index.html
const SCOPE_PATH = new URL(SCOPE).pathname;
const PREFIX = 'mx|' + SCOPE_PATH + '|';                         // two editions may share one origin
const SHELL_PREFIX = PREFIX + 'shell|';
const SHELL_CACHE = SHELL_PREFIX + (SHELL ? SHELL.version : 'none');
const RUNTIME = PREFIX + 'runtime|1';
const META = SCOPE + '__mx-offline-index__';                     // sizes and dates of the runtime entries
const LIMITS = { entries: 400, bytes: 150 * 1024 * 1024, item: 40 * 1024 * 1024 };
const NETWORK_WAIT = 4000;                                       // ms before a cached copy answers a slow network
const FILES = new Map(SHELL ? SHELL.files : []);
const HASH10 = /^[0-9a-f]{10}$/;
const FRESH = /\.(html?|json|js|mjs|css)$/i;                     // network first; anything else: stale-while-revalidate

const subtle = self.crypto && self.crypto.subtle;
async function sha10(buffer) {
  if (!subtle) return null;
  const bytes = new Uint8Array(await subtle.digest('SHA-1', buffer));
  return [...bytes.slice(0, 5)].map(b => b.toString(16).padStart(2, '0')).join('');
}
const kept = (headers, extra = {}) => {
  const out = { ...extra };
  for (const name of ['content-type', 'etag', 'last-modified']) { const v = headers.get(name); if (v) out[name] = v; }
  return out;
};

/* ---------------------------------------------------------------- install: the shell, verified, all or nothing */
async function shellEntry(path, hash, old) {
  for (const cache of old) {                                     // an unchanged file is copied, not downloaded again
    const hit = await cache.match(SCOPE + path);
    if (!hit) continue;
    const buffer = await hit.arrayBuffer();
    if (await sha10(buffer) === hash) return new Response(buffer, { headers: kept(hit.headers) });
  }
  const response = await fetch(SCOPE + path + '?v=' + hash, { cache: 'no-cache' });
  if (response.status !== 200) throw new Error('shell file ' + path + ': HTTP ' + response.status);
  const buffer = await response.arrayBuffer();
  const actual = await sha10(buffer);
  // A deployment in progress can serve a file of another version: refuse it, the next update check tries again.
  if (actual && actual !== hash) throw new Error('shell file ' + path + ' does not match the manifest');
  return new Response(buffer, { headers: kept(response.headers) });
}

async function install() {
  const cache = await caches.open(SHELL_CACHE);
  const done = new Set((await cache.keys()).map(r => r.url));    // an interrupted install of this version resumes
  const names = (await caches.keys()).filter(n => n.startsWith(SHELL_PREFIX) && n !== SHELL_CACHE);
  const old = await Promise.all(names.map(n => caches.open(n)));
  const todo = SHELL.files.filter(([path]) => !done.has(SCOPE + path));
  let next = 0;
  const worker = async () => {
    while (next < todo.length) {
      const [path, hash] = todo[next++];
      await cache.put(SCOPE + path, await shellEntry(path, hash, old));
    }
  };
  await Promise.all(Array.from({ length: 6 }, worker));
}

if (SHELL) {
  // No skipWaiting here: a new version waits until the page asks for it (Reload in the notice) or every tab is closed.
  self.addEventListener('install', event => event.waitUntil(install()));
  self.addEventListener('activate', event => event.waitUntil((async () => {
    for (const name of await caches.keys()) if (name.startsWith(SHELL_PREFIX) && name !== SHELL_CACHE) await caches.delete(name);
    await self.clients.claim();                                  // first visit: start caching what this page opens
  })()));
  self.addEventListener('fetch', onFetch);
} else {
  // Served without a build (no manifest): do nothing and go away.
  self.addEventListener('install', () => self.skipWaiting());
  self.addEventListener('activate', event => event.waitUntil(self.registration.unregister()));
}

self.addEventListener('message', event => {
  const type = event.data && event.data.type;
  if (type === 'mx-skip-waiting') self.skipWaiting();
  if (type === 'mx-version' && event.ports[0]) event.ports[0].postMessage({ version: SHELL && SHELL.version, files: FILES.size, bytes: SHELL && SHELL.bytes, limits: LIMITS });
});

/* ---------------------------------------------------------------- runtime cache with a budget */
let meta = null, chain = Promise.resolve();
async function loadMeta(cache) {
  if (meta) return meta;
  const stored = await cache.match(META);
  let table = {};
  try { if (stored) table = await stored.json(); } catch { table = {}; }
  // Reconcile with the real entries (the worker may have been stopped between a put and the index write).
  const urls = new Set((await cache.keys()).map(r => r.url));
  for (const url of Object.keys(table)) if (!urls.has(url)) delete table[url];
  for (const url of urls) if (url !== META && !table[url]) await cache.delete(url);
  return meta = table;
}
async function trim(cache, table) {
  const order = Object.keys(table).sort((a, b) => table[a][1] - table[b][1]);   // oldest first
  let total = order.reduce((sum, url) => sum + table[url][0], 0), count = order.length;
  for (const url of order) {
    if (count <= LIMITS.entries && total <= LIMITS.bytes) break;
    await cache.delete(url); total -= table[url][0]; count--; delete table[url];
  }
}
function record(url, response, size) {
  chain = chain.then(async () => {
    const cache = await caches.open(RUNTIME), table = await loadMeta(cache);
    await cache.put(url, response);
    table[url] = [size, Date.now()];
    await trim(cache, table);
    await cache.put(META, new Response(JSON.stringify(table), { headers: { 'content-type': 'application/json' } }));
  }).catch(() => {});                                            // quota or storage error: the page already has its answer
  return chain;
}
const touch = url => { if (meta && meta[url]) meta[url][1] = Date.now(); };   // written with the next record

// Keep a copy of a complete, same-origin answer. Never a partial (206), opaque, redirected or error answer.
async function save(url, response, version) {
  if (response.status !== 200 || response.type !== 'basic') return;
  if (Number(response.headers.get('content-length') || 0) > LIMITS.item) return;
  const buffer = await response.arrayBuffer();
  if (buffer.byteLength > LIMITS.item) return;
  if (version && HASH10.test(version)) {
    const actual = await sha10(buffer);
    // The server now has another version of this file: do not keep it under the old address, look for the update.
    if (actual && actual !== version) { self.registration.update().catch(() => {}); return; }
  }
  await record(url, new Response(buffer, { headers: kept(response.headers) }), buffer.byteLength);
}
const keep = (event, url, response, version) => event.waitUntil(save(url, response.clone(), version).catch(() => {}));

async function cached(url) {
  const hit = await (await caches.open(RUNTIME)).match(url);
  if (hit) touch(url);
  return hit;
}

/* ---------------------------------------------------------------- answers */
function shellKey(path, url) {
  const file = path === '' ? 'index.html' : path, hash = FILES.get(file);
  if (!hash) return null;
  const v = url.searchParams.get('v');
  if (v && HASH10.test(v) && v !== hash) return null;            // a module of another version is never served from the shell
  return SCOPE + file;
}

const withTimeout = (promise, ms) => new Promise((resolve, reject) => {
  const timer = setTimeout(() => reject(new Error('timeout')), ms);
  promise.then(v => { clearTimeout(timer); resolve(v); }, e => { clearTimeout(timer); reject(e); });
});

// Ask the server again, cheaply when a copy exists (conditional request: 304 means the copy is current).
async function revalidate(event, request, url, copy) {
  const headers = {};
  if (copy) {
    const etag = copy.headers.get('etag'), modified = copy.headers.get('last-modified');
    if (etag) headers['If-None-Match'] = etag; else if (modified) headers['If-Modified-Since'] = modified;
  }
  const conditional = Object.keys(headers).length > 0;
  let response = await fetch(conditional ? new Request(url.href, { headers }) : request);
  if (conditional && response.status === 304) { touch(url.href); return copy; }
  if (conditional && response.redirected) response = new Response(response.body, { status: response.status, headers: response.headers });
  if (response.status === 200) keep(event, url.href, response);
  return response;
}

const OFFLINE_PAGE = back => `<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Hors connexion · Offline</title>
<style>body{font:1.1rem/1.6 system-ui,sans-serif;margin:0;padding:2rem;max-width:40rem;color:#000;background:#fff}@media(prefers-color-scheme:dark){body{color:#fff;background:#0a0a0a}a{color:#fff}}a{color:#000}</style>
<main><h1>Hors connexion</h1>
<p>Ce document n’a pas encore été ouvert sur cet appareil : il n’est pas disponible sans connexion. Les pages et les documents déjà ouverts le restent.</p>
<p lang="en">Offline: this document has not been opened on this device yet, so it is not available without a connection. Pages and documents you already opened remain available.</p>
<p><a href="${back}">Retour à Maths Explorer · Back to Maths Explorer</a></p></main></html>`;

// Nothing in the network, nothing in the caches.
async function miss(event, request, path) {
  if (request.mode === 'navigate') {
    // An address of the application itself (hash routes live in index.html): start the shell.
    if (!path.includes('/') && (!path.includes('.') || /\.html?$/i.test(path))) {
      const shell = await caches.match(SCOPE + 'index.html', { cacheName: SHELL_CACHE });
      if (shell) return shell;
    }
    return new Response(OFFLINE_PAGE(SCOPE), { status: 503, headers: { 'content-type': 'text/html; charset=utf-8' } });
  }
  event.waitUntil((async () => {
    const client = event.clientId && await self.clients.get(event.clientId);
    if (client) client.postMessage({ type: 'mx-offline-miss', url: request.url });
  })());
  return Response.error();
}

// A Range request (PDF viewers, media): answered from a complete cached copy, else passed to the network, never cached.
async function ranged(request, url, key) {
  const full = key ? await caches.match(key, { cacheName: SHELL_CACHE }) : await cached(url.href);
  if (!full) return fetch(request);
  const buffer = await full.arrayBuffer(), size = buffer.byteLength;
  const m = /^bytes=(\d*)-(\d*)$/.exec(request.headers.get('range').trim());
  const type = { 'content-type': full.headers.get('content-type') || 'application/octet-stream', 'accept-ranges': 'bytes' };
  if (!m || (m[1] === '' && m[2] === '')) return new Response(buffer, { headers: type });   // several ranges: the whole file is a valid answer
  let start, end;
  if (m[1] === '') { start = Math.max(0, size - Number(m[2])); end = size - 1; }
  else { start = Number(m[1]); end = m[2] === '' ? size - 1 : Math.min(Number(m[2]), size - 1); }
  if (start >= size || start > end) return new Response(null, { status: 416, headers: { 'content-range': 'bytes */' + size } });
  return new Response(buffer.slice(start, end + 1), { status: 206, headers: { ...type, 'content-range': `bytes ${start}-${end}/${size}`, 'content-length': String(end - start + 1) } });
}

async function respond(event, request, url) {
  let path = url.pathname.slice(SCOPE_PATH.length);
  try { path = decodeURIComponent(path); } catch { /* keep the raw path */ }
  const key = shellKey(path, url);
  if (request.headers.has('range')) return ranged(request, url, key);

  // 1. The shell: always from the cache of this version, so a page never mixes modules of two versions.
  if (key) {
    const hit = await caches.match(key, { cacheName: SHELL_CACHE });
    if (hit) return hit;
  }
  const version = url.searchParams.get('v');
  try {
    // 2. An address that names its version never changes: cache first.
    if (version) {
      const hit = await cached(url.href);
      if (hit) return hit;
      const response = await fetch(request);
      if (response.status === 200) keep(event, url.href, response, version);
      return response;
    }
    const copy = await cached(url.href);
    // 3. Pages, data and scripts without a version: the network when it answers in time, else the copy.
    if (request.mode === 'navigate' || FRESH.test(path)) {
      if (!copy) return await revalidate(event, request, url, null);
      try {
        const response = await withTimeout(revalidate(event, request, url, copy), NETWORK_WAIT);
        return response.status >= 500 ? copy : response;
      } catch { return copy; }
    }
    // 4. Images, figures, unversioned documents: the copy at once, refreshed behind for the next time.
    if (copy) { event.waitUntil(revalidate(event, request, url, copy).catch(() => {})); return copy; }
    return await revalidate(event, request, url, null);
  } catch {
    return miss(event, request, path);
  }
}

function onFetch(event) {
  const request = event.request;
  if (request.method !== 'GET') return;                          // never a form post, never a write
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !url.href.startsWith(SCOPE)) return;   // never another origin
  if (url.pathname === SCOPE_PATH + 'sw.js') return;
  event.respondWith(respond(event, request, url));
}
