/* Maths Explorer service worker: the application shell always starts, and what was opened stays available offline.
   Contract and limits: docs/OFFLINE.md. The build (build/mxbuild/offline.py) replaces the next line by the manifest of
   the shell: { version, bytes, files: [[path, sha1 of the content cut to 10 characters], ...] }. */
self.__MX_SHELL = {"version":"f4121150633bbee5","bytes":10712874,"files":[["fonts/anton-latin-400-normal.woff2","b9beea0804"],["fonts/anton-latin-ext-400-normal.woff2","3ada4101c3"],["fonts/comic-neue-latin-400-italic.woff2","dce4ef3c0d"],["fonts/comic-neue-latin-400-normal.woff2","e6e2593793"],["fonts/comic-neue-latin-700-italic.woff2","0d93ef78a2"],["fonts/comic-neue-latin-700-normal.woff2","c24cd8da31"],["fonts/stix-two-text-latin-400-italic.woff2","e95441c02c"],["fonts/stix-two-text-latin-600-normal.woff2","9748966246"],["fonts/stix-two-text-latin-700-normal.woff2","c2768e0ce3"],["index.html","0fc44c97c2"],["js/annals-bank.js","49636c9652"],["js/app.js","3247581994"],["js/automatismes.js","51a105cb34"],["js/bank-page.js","56108896c9"],["js/basics-page.js","df5c9a13db"],["js/biographies-major.js","d52726aba4"],["js/camera3d.js","1bacf9765e"],["js/canvas-navigation.js","04396cab00"],["js/catalogue-data.js","e1f77e3cb4"],["js/challenges/ants/activity.js","976caa20eb"],["js/challenges/ants/art.js","b866e20fa8"],["js/challenges/ants/index.js","dbbb27f9e0"],["js/challenges/ants/maths.js","41b659837f"],["js/challenges/ants/solution.js","a64dce5ff3"],["js/challenges/artgallery/activity.js","589200b7d1"],["js/challenges/artgallery/index.js","a7726f35b4"],["js/challenges/artgallery/maths.js","dcc348abcb"],["js/challenges/artgallery/solution.js","a78d84e10c"],["js/challenges/box/activity.js","98296b5a15"],["js/challenges/box/index.js","c4441183c8"],["js/challenges/box/maths.js","6d1cb3faca"],["js/challenges/box/solution.js","382be0a9c0"],["js/challenges/box/view-3d.js","288f2e3642"],["js/challenges/braess/activity.js","b29a18ca42"],["js/challenges/braess/art.js","d82038b6ff"],["js/challenges/braess/index.js","68aaa0ce6f"],["js/challenges/braess/maths.js","4dccf4e1bc"],["js/challenges/braess/solution.js","0e1b167aeb"],["js/challenges/bridge/activity.js","ca98cb01ae"],["js/challenges/bridge/art.js","a0c25bc910"],["js/challenges/bridge/index.js","2dce15039f"],["js/challenges/bridge/maths.js","b9e3f98cf9"],["js/challenges/bridge/solution.js","1d19b55029"],["js/challenges/cake/activity.js","0e782cd417"],["js/challenges/cake/index.js","71af850423"],["js/challenges/cake/maths.js","95a9255a8b"],["js/challenges/cake/solution.js","ec39a46557"],["js/challenges/cake/view-3d.js","c618f01624"],["js/challenges/cham/activity.js","c4b9de476c"],["js/challenges/cham/art.js","519f7c2188"],["js/challenges/cham/index.js","5316ffc018"],["js/challenges/cham/maths.js","f6d666247b"],["js/challenges/cham/solution.js","df74de8fec"],["js/challenges/cheryl/activity.js","1697f08ed8"],["js/challenges/cheryl/index.js","e1b1099907"],["js/challenges/cheryl/maths.js","31f4cb511b"],["js/challenges/cheryl/solution.js","6fa879f4ef"],["js/challenges/chess/activity.js","1b16b6224e"],["js/challenges/chess/index.js","9500d590b3"],["js/challenges/chess/solution.js","c9b52544d9"],["js/challenges/coffee/activity.js","22a7240170"],["js/challenges/coffee/art.js","682e199aa3"],["js/challenges/coffee/index.js","4889f5ff66"],["js/challenges/coffee/maths.js","c5791ff7c7"],["js/challenges/coffee/solution.js","051d3fbe8e"],["js/challenges/common/bubble.js","63df7fab66"],["js/challenges/common/buddy.js","90124a79ff"],["js/challenges/common/cartoon.js","0c574f43f9"],["js/challenges/common/comic.js","3cf27209f0"],["js/challenges/common/helpers.js","64c36cb4fe"],["js/challenges/common/icon.js","4353f1f522"],["js/challenges/common/kit.js","6908de686d"],["js/challenges/common/knight-piece.js","1934ea7644"],["js/challenges/common/person.js","781a8fc5cb"],["js/challenges/common/player.js","be757eebda"],["js/challenges/common/scene-3d.js","dffb1f55e6"],["js/challenges/common/scene-kit.js","33aaff5e64"],["js/challenges/common/scene-props.js","30ee0ab200"],["js/challenges/common/view-3d.js","dd3a9c1f50"],["js/challenges/cookies/activity.js","fa1b349876"],["js/challenges/cookies/index.js","3d433f9948"],["js/challenges/cookies/maths.js","5b41aa410b"],["js/challenges/cookies/solution.js","1ad0c349dd"],["js/challenges/doors/activity.js","ca51a9f7a2"],["js/challenges/doors/index.js","68879a7ae4"],["js/challenges/doors/solution.js","57936dc96e"],["js/challenges/eggs/activity.js","98272e7b3d"],["js/challenges/eggs/index.js","6795d28a52"],["js/challenges/eggs/maths.js","223887d877"],["js/challenges/eggs/solution.js","63d6b7be12"],["js/challenges/factorials/activity.js","720d9d70a5"],["js/challenges/factorials/index.js","78699ac413"],["js/challenges/factorials/maths.js","6a8df18f95"],["js/challenges/factorials/solution.js","c7b61cf246"],["js/challenges/fakecoins/activity.js","f493000235"],["js/challenges/fakecoins/art.js","7448354aec"],["js/challenges/fakecoins/index.js","d917597076"],["js/challenges/fakecoins/maths.js","96bfb3c69d"],["js/challenges/fakecoins/solution.js","59b0c234ee"],["js/challenges/fly/activity.js","3780b83ddb"],["js/challenges/fly/art.js","65bdb1ddb2"],["js/challenges/fly/index.js","d768c929f9"],["js/challenges/fly/maths.js","c4fdd7e973"],["js/challenges/fly/solution.js","d930fd7331"],["js/challenges/gauss-sum/activity.js","394393780e"],["js/challenges/gauss-sum/index.js","bd22b8386c"],["js/challenges/gauss-sum/maths.js","9975981560"],["js/challenges/gauss-sum/solution.js","4b6abb50fa"],["js/challenges/gridpaths/activity.js","002906fa0a"],["js/challenges/gridpaths/index.js","d7c608725b"],["js/challenges/gridpaths/maths.js","624b417204"],["js/challenges/gridpaths/solution.js","5b62500c9f"],["js/challenges/handshakes/activity.js","6bd94f76a7"],["js/challenges/handshakes/index.js","1bc407980e"],["js/challenges/handshakes/maths.js","2d5c9e6812"],["js/challenges/handshakes/plan.js","20ef9cfcdf"],["js/challenges/handshakes/solution.js","4cd550a103"],["js/challenges/hanoi/activity.js","b1f2becfe4"],["js/challenges/hanoi/index.js","101df82592"],["js/challenges/hanoi/solution.js","5f0595b7a8"],["js/challenges/hiker/activity.js","5744c5ef90"],["js/challenges/hiker/art.js","8b3f55983f"],["js/challenges/hiker/index.js","d6784a5c65"],["js/challenges/hiker/maths.js","fe60e3c1ce"],["js/challenges/hiker/plan.js","fa0737ccc1"],["js/challenges/hiker/solution.js","b946dcd4e3"],["js/challenges/horses/activity.js","da9366a707"],["js/challenges/horses/art.js","5339b502e1"],["js/challenges/horses/index.js","fd6cf8d348"],["js/challenges/horses/maths.js","bf6072aeec"],["js/challenges/horses/solution.js","d2c2a2a0ec"],["js/challenges/inversions/activity.js","8ee7deaf8f"],["js/challenges/inversions/index.js","35d39b687c"],["js/challenges/inversions/maths.js","3b132143b3"],["js/challenges/inversions/solution.js","5110b2a9d1"],["js/challenges/josephus/activity.js","392b5de619"],["js/challenges/josephus/index.js","1c398e71b7"],["js/challenges/josephus/maths.js","95041e813f"],["js/challenges/josephus/solution.js","0eb5b410e2"],["js/challenges/jugs/activity.js","1c57464525"],["js/challenges/jugs/art.js","2b14ea431d"],["js/challenges/jugs/index.js","01682dd0ac"],["js/challenges/jugs/maths.js","7010209be2"],["js/challenges/jugs/solution.js","33837c74be"],["js/challenges/knights/activity.js","7fce21ae05"],["js/challenges/knights/index.js","9659f65f75"],["js/challenges/knights/maths.js","f5501916f8"],["js/challenges/knights/solution.js","fad70cb093"],["js/challenges/konigsberg/activity.js","56a9b2ff96"],["js/challenges/konigsberg/art.js","552b5b79a8"],["js/challenges/konigsberg/index.js","e15cc1d85b"],["js/challenges/konigsberg/maths.js","351be84ada"],["js/challenges/konigsberg/plan.js","0b0757ae0b"],["js/challenges/konigsberg/solution.js","523dbfc5be"],["js/challenges/lighteggs/activity.js","9b5d44db3f"],["js/challenges/lighteggs/index.js","a5a4713694"],["js/challenges/lighteggs/maths.js","7149070b35"],["js/challenges/lighteggs/solution.js","6021814cfc"],["js/challenges/lunes/activity.js","cb0610a7e5"],["js/challenges/lunes/index.js","ea3e0560e4"],["js/challenges/lunes/maths.js","35cd7ef023"],["js/challenges/lunes/solution.js","d8d483b081"],["js/challenges/merge/activity.js","d612b9f310"],["js/challenges/merge/index.js","8c6bba4330"],["js/challenges/merge/maths.js","2be5c08878"],["js/challenges/merge/solution.js","7c7403a6b6"],["js/challenges/nails/activity.js","ff4dac4ba3"],["js/challenges/nails/art.js","c73900b80a"],["js/challenges/nails/gesture.js","d80fb7e4d1"],["js/challenges/nails/index.js","fae5562214"],["js/challenges/nails/maths.js","2a30fb332c"],["js/challenges/nails/plan.js","bd2ee6bf45"],["js/challenges/nails/rope-path.js","d4ccc312b8"],["js/challenges/nails/solution.js","251ecaf934"],["js/challenges/nails/timeline.js","3eaf233ca4"],["js/challenges/nim/activity.js","de4ee9e9c9"],["js/challenges/nim/index.js","50b5153bc5"],["js/challenges/nim/maths.js","fd8d7a3a96"],["js/challenges/nim/solution.js","a527bf2ab8"],["js/challenges/pegs/activity.js","9397bb40d5"],["js/challenges/pegs/index.js","f2c29d816f"],["js/challenges/pegs/maths.js","be7d18b888"],["js/challenges/pegs/solution.js","fc3aaec0e4"],["js/challenges/pigeonhole/activity.js","dc1be9a6e3"],["js/challenges/pigeonhole/art.js","eb43f98762"],["js/challenges/pigeonhole/index.js","c4ae6b319c"],["js/challenges/pigeonhole/solution.js","4d4486f2f2"],["js/challenges/piles/activity.js","a50f72c6a3"],["js/challenges/piles/index.js","b7afcc1c06"],["js/challenges/piles/maths.js","1dac5fb496"],["js/challenges/piles/solution.js","65a812468e"],["js/challenges/queens/activity.js","8518655161"],["js/challenges/queens/index.js","c093aad195"],["js/challenges/queens/maths.js","6816f720a7"],["js/challenges/queens/solution.js","4ee34929f8"],["js/challenges/ramsey/activity.js","ee88af0590"],["js/challenges/ramsey/index.js","7c712f5e84"],["js/challenges/ramsey/solution.js","3461582807"],["js/challenges/reflect/activity.js","b627355c88"],["js/challenges/reflect/index.js","2859767e85"],["js/challenges/reflect/maths.js","6734c0be61"],["js/challenges/reflect/solution.js","5dc783e115"],["js/challenges/registry.js","409ce8a5b9"],["js/challenges/rooms/activity.js","ccf8d74812"],["js/challenges/rooms/art.js","f6f3913f8f"],["js/challenges/rooms/index.js","f8d9e678e0"],["js/challenges/rooms/maths.js","5341df01ec"],["js/challenges/rooms/solution.js","55b40474ba"],["js/challenges/snail/activity.js","516121a210"],["js/challenges/snail/art.js","804644d7e7"],["js/challenges/snail/index.js","41380a9e14"],["js/challenges/snail/maths.js","4eb4b5f2a8"],["js/challenges/snail/solution.js","d96cb9a536"],["js/challenges/squares/activity.js","a7bd2e6141"],["js/challenges/squares/index.js","f8f24369a8"],["js/challenges/squares/solution.js","144076ac0e"],["js/challenges/star/activity.js","81839d36c8"],["js/challenges/star/index.js","9a88225967"],["js/challenges/star/maths.js","838c8a4bb6"],["js/challenges/star/solution.js","30039e98a1"],["js/challenges/sumproduct/activity.js","d1719659dc"],["js/challenges/sumproduct/index.js","950c8e668d"],["js/challenges/sumproduct/maths.js","f69537406d"],["js/challenges/sumproduct/solution.js","050a906fdc"],["js/chapter-sequence.js","3419fc6e32"],["js/classroom-context.js","ede6ba9a15"],["js/content-language.js","a6f646dbc1"],["js/content.js","edbb2d4fea"],["js/control-policy.js","a7bac4dbb5"],["js/data-loader.js","cf9ec4f62b"],["js/device-capability.js","23bc059e65"],["js/discovery-index.js","575cafbdc0"],["js/discovery-previews.js","03865915ba"],["js/discovery.js","1b2ab88f55"],["js/dock-model.js","8b9f826098"],["js/dock.js","cc1cc5459d"],["js/dynamics-content.js","c240a27032"],["js/enrichment-data.js","8506e11c70"],["js/entry-nav.js","cdb6fa75d5"],["js/errors-data.js","0763306f2f"],["js/errors-model.js","88f5d0bf59"],["js/errors.js","5d64acf67b"],["js/exercises/authored-exams.js","e8a889de6e"],["js/exercises/authored-seconde.js","12c770ddce"],["js/exercises/authored.js","4e8c47aaa5"],["js/exercises/bank-select.js","92824edea6"],["js/exercises/bank.js","91600ebcb8"],["js/exercises/competencies.js","afc3d4ac2c"],["js/exercises/engine.js","acd62de68d"],["js/exercises/expertes-kit.js","abee042d16"],["js/exercises/export.js","1322452a08"],["js/exercises/premiere-kit.js","e61cacae22"],["js/exercises/problems-expertes.js","645ff0dd08"],["js/exercises/problems-premiere.js","6d998d8db0"],["js/exercises/problems-seconde-2.js","861b39310e"],["js/exercises/problems-seconde-3.js","5527935b89"],["js/exercises/problems-seconde.js","6e69bc6dad"],["js/exercises/problems-stmg.js","f77fefac57"],["js/exercises/problems-terminale.js","3fa409ccf7"],["js/exercises/problems.js","4c86e9f84e"],["js/exercises/seconde-kit-2.js","97ca1e4c2b"],["js/exercises/seconde-kit.js","f717d5e6bd"],["js/exercises/starter-visual.js","011a39e4ef"],["js/exercises/stmg-kit.js","916dd07b51"],["js/exercises/templates-competences.js","73f3bd71e5"],["js/exercises/templates-expertes-2.js","d30cce5d7f"],["js/exercises/templates-expertes-3.js","7e1b8f2c3b"],["js/exercises/templates-expertes-4.js","d5d66402dd"],["js/exercises/templates-expertes-5.js","8b90677baf"],["js/exercises/templates-expertes.js","220b9f6be6"],["js/exercises/templates-premiere-2.js","2b8810054f"],["js/exercises/templates-premiere-3.js","c05c6ef591"],["js/exercises/templates-premiere-4.js","7516918e14"],["js/exercises/templates-premiere.js","9f9ae86350"],["js/exercises/templates-seconde-2.js","fa559c6de3"],["js/exercises/templates-seconde-3.js","cf6b8a4c69"],["js/exercises/templates-seconde-4.js","a4caac940e"],["js/exercises/templates-seconde-5.js","697c46fd05"],["js/exercises/templates-seconde-6.js","7f99f3323c"],["js/exercises/templates-seconde-7.js","29ab56a0f4"],["js/exercises/templates-seconde-8.js","bf08d3318a"],["js/exercises/templates-seconde.js","86f149bd46"],["js/exercises/templates-stmg-2.js","bf8a87f572"],["js/exercises/templates-stmg-3.js","f9e6aec212"],["js/exercises/templates-stmg-4.js","1e356956b8"],["js/exercises/templates-stmg.js","c63d52ef48"],["js/exercises/templates-terminale-2.js","3ceab0bb75"],["js/exercises/templates-terminale-3.js","508628605c"],["js/exercises/templates-terminale-4.js","ba8b0fca11"],["js/exercises/templates-terminale-5.js","c85b254025"],["js/exercises/templates-terminale.js","9a04cdd499"],["js/exercises/terminale-kit.js","78ba04ffea"],["js/exercises/ui-kit.js","a30d9e4b46"],["js/fair-division-content.js","c28f52d8b6"],["js/figure-engine.js","d5b65644be"],["js/figure-layout.js","b7df1dfc88"],["js/figure-scenes.js","fc8bc5f067"],["js/fourier-links.js","1b59d3d3bf"],["js/fourier-model.js","9c50159b49"],["js/fractal-gl.js","8df272fa28"],["js/fractals-data.js","848205413e"],["js/fractals-page.js","dfc85543e3"],["js/gallery/article.js","aa4cd8fddf"],["js/gallery/articles/batch-1.js","e9af4bac88"],["js/gallery/articles/batch-2.js","16e270134c"],["js/gallery/articles/batch-3.js","4c11648a5b"],["js/gallery/articles/batch-4.js","6408caabcd"],["js/gallery/articles/batch-5.js","5c6e9a59b6"],["js/gallery/articles/batch-6.js","859e69311e"],["js/gallery/articles/index.js","156466a65d"],["js/gallery/articles/pilot.js","ea746b7d57"],["js/gallery/curiosity-explainers.js","3ed34a7bb9"],["js/gallery/fractal-sdf.js","c0e51b5ce1"],["js/gallery/gallery-additions.js","2f902eaf2b"],["js/gallery/gallery-apollonian-model.js","285d8da16e"],["js/gallery/gallery-apollonian.js","f98bef607d"],["js/gallery/gallery-banach-model.js","14be946729"],["js/gallery/gallery-banach.js","7817016c5f"],["js/gallery/gallery-basins-model.js","3224a7477b"],["js/gallery/gallery-basins.js","140aa44b09"],["js/gallery/gallery-boxes-model.js","5db1ec5142"],["js/gallery/gallery-boxes.js","34abc49ccd"],["js/gallery/gallery-cavalieri-model.js","f509f4e228"],["js/gallery/gallery-cavalieri.js","aa150bb9c9"],["js/gallery/gallery-collisions-model.js","8eefc332ad"],["js/gallery/gallery-collisions.js","38584b7680"],["js/gallery/gallery-context.js","992044c7b3"],["js/gallery/gallery-curiosities.js","0b2e9824ce"],["js/gallery/gallery-dandelin-model.js","d050f96ed5"],["js/gallery/gallery-dandelin.js","175d1e13df"],["js/gallery/gallery-dynamics.js","efa9fe0a01"],["js/gallery/gallery-equidecomposition-model.js","f93ceeeaab"],["js/gallery/gallery-equidecomposition.js","de07928b06"],["js/gallery/gallery-escape3d-model.js","7754c1aa08"],["js/gallery/gallery-escape3d.js","3ebe36ab1b"],["js/gallery/gallery-fair-division.js","f367965ea7"],["js/gallery/gallery-fastest.js","65baee4861"],["js/gallery/gallery-four-colour-model.js","00f5391d11"],["js/gallery/gallery-four-colour.js","0b68b03152"],["js/gallery/gallery-gomboc.js","581b970de9"],["js/gallery/gallery-hairy-model.js","2123d3739b"],["js/gallery/gallery-hairy.js","53b47223ee"],["js/gallery/gallery-hat-model.js","21e06b91d1"],["js/gallery/gallery-hat.js","04c68ee09d"],["js/gallery/gallery-inference.js","bff8c56862"],["js/gallery/gallery-inscribed-model.js","d40be4a61d"],["js/gallery/gallery-inscribed.js","8b0d3a673e"],["js/gallery/gallery-intuition.js","519401efc1"],["js/gallery/gallery-kit.js","db844828ad"],["js/gallery/gallery-knot-geometry.js","bfe0d0f0d9"],["js/gallery/gallery-knot-model.js","e6be1ef6ff"],["js/gallery/gallery-knot-render.js","a5c195c793"],["js/gallery/gallery-knots.js","a5ae37f44f"],["js/gallery/gallery-life-model.js","ba0e27f98b"],["js/gallery/gallery-life.js","3c49ffaf2a"],["js/gallery/gallery-math.js","98f99478d8"],["js/gallery/gallery-models.js","774f1f3edb"],["js/gallery/gallery-morley-model.js","919c8108e4"],["js/gallery/gallery-morley.js","950551a8a5"],["js/gallery/gallery-napkin-gl.js","88db08a7a3"],["js/gallery/gallery-napkin-model.js","916aeb3c15"],["js/gallery/gallery-napkin.js","d2152635dc"],["js/gallery/gallery-objects.js","d8aaece3ca"],["js/gallery/gallery-opaque-model.js","41f4465914"],["js/gallery/gallery-opaque.js","2bcf704c64"],["js/gallery/gallery-panels.js","9991aa6766"],["js/gallery/gallery-polyhedra-model.js","5b54ca9d17"],["js/gallery/gallery-polyhedra.js","89aa6e6140"],["js/gallery/gallery-room.js","cb2ce2affb"],["js/gallery/gallery-rupert-model.js","b2ffd403b6"],["js/gallery/gallery-rupert.js","d9f936aa6c"],["js/gallery/gallery-selfsimilar-model.js","0490c8a91f"],["js/gallery/gallery-selfsimilar.js","4a9be5778b"],["js/gallery/gallery-soap-model.js","97096e4613"],["js/gallery/gallery-soap.js","62c3f33786"],["js/gallery/gallery-sofa-gerver.js","87b46200fe"],["js/gallery/gallery-sofa-model.js","8e3931f9da"],["js/gallery/gallery-sofa.js","24dd589cb7"],["js/gallery/gallery-squares-data.js","582dc3da8f"],["js/gallery/gallery-squares-model.js","e80d1536da"],["js/gallery/gallery-squares.js","be9902fc63"],["js/gallery/gallery-stellation-model.js","1c0ce57510"],["js/gallery/gallery-stellation.js","2c60b80b60"],["js/gallery/gallery-topology.js","572b484af1"],["js/gallery/gallery-viviani-model.js","a829ec8992"],["js/gallery/gallery-viviani.js","66b4c62899"],["js/gallery/gallery-voronoi.js","dc7a0b4430"],["js/gallery/gallery-wythoff-model.js","9ae646426e"],["js/gallery/gallery-wythoff.js","ff99050af4"],["js/gallery/gl-progressive.js","55f8f879df"],["js/gallery/gl3d.js","afffa73686"],["js/gomboc-body.js","c7d71a715d"],["js/gomboc-content.js","84d2e499da"],["js/gomboc-gl.js","96593f2788"],["js/gomboc-rolling.js","77fc34cb24"],["js/gomboc-support-data.js","69c777890f"],["js/gomboc-support.js","f30ed2f7f2"],["js/history-data.js","c4b211c89c"],["js/history-images.js","d8a8d19015"],["js/history-layout.js","55ca8ef77d"],["js/history.js","01e430e734"],["js/home-art.js","5065ee03ee"],["js/home-slides.js","5aec319a13"],["js/icons.js","fe69dcac48"],["js/illumination-content.js","e0b78e701f"],["js/illumination-farm.js","c25e82c51a"],["js/illumination-gl.js","2e15e349fe"],["js/illumination-light-worker.js","49c8c902f1"],["js/illumination-light.js","b66c72982e"],["js/illumination-model.js","099605fd21"],["js/illumination-presets.js","9dd22f8ab8"],["js/illumination-view.js","415cfa2679"],["js/illumination-worker.js","e63b1593fc"],["js/inference-content.js","8d78550fce"],["js/intuition-data.js","4900066dc8"],["js/intuition-page.js","a866600a7e"],["js/knot-catalogue.js","3350a9a9c6"],["js/lab-objects.js","a956136825"],["js/lab/engine.js","17acdcb88c"],["js/lab/experiments/bertrand.js","19d3021f85"],["js/lab/experiments/buffon.js","6c03fd4dd7"],["js/lab/experiments/circle-regions.js","e3210363ae"],["js/lab/experiments/cobweb.js","1b7c7fedba"],["js/lab/experiments/complex.js","8f085b80a5"],["js/lab/experiments/derivative.js","a6cd559104"],["js/lab/experiments/dynamics.js","025d268434"],["js/lab/experiments/eratosthenes.js","006f210613"],["js/lab/experiments/euler-primes.js","0ac912504a"],["js/lab/experiments/exponential.js","bb6a0023a7"],["js/lab/experiments/fair-division.js","3bfa1e7299"],["js/lab/experiments/fair-scenes.js","86be3bbdfe"],["js/lab/experiments/fermat.js","257684da1a"],["js/lab/experiments/ferris-wheel.js","949c9a19c9"],["js/lab/experiments/fourier.js","1685f57776"],["js/lab/experiments/illumination.js","d9244669cb"],["js/lab/experiments/inference.js","e5e8e151bd"],["js/lab/experiments/integral.js","8c98df17ed"],["js/lab/experiments/line.js","d7ad2fc8ef"],["js/lab/experiments/logistic.js","7268a93f46"],["js/lab/experiments/matrix.js","60d40e01bd"],["js/lab/experiments/monte-carlo.js","590d74f6ea"],["js/lab/experiments/probability.js","eba7203507"],["js/lab/experiments/quadratic.js","d319bfa0f6"],["js/lab/experiments/sequences.js","8de0899c2e"],["js/lab/experiments/space-lines.js","df778b05fa"],["js/lab/experiments/statistics.js","ba7afbdb87"],["js/lab/experiments/tiles.js","14ea4b009c"],["js/lab/experiments/topology.js","e34a232db4"],["js/lab/experiments/trig.js","5703b01f4e"],["js/lab/experiments/vectors.js","1510d454d5"],["js/lab/format.js","63d506e03e"],["js/lab/models/benford-data.js","d676550255"],["js/lab/models/bertrand.js","a1d2f601ef"],["js/lab/models/buffon.js","56f5ed6770"],["js/lab/models/circle-regions.js","f6e47e2505"],["js/lab/models/cobweb.js","2ab8d0eea3"],["js/lab/models/complex.js","3d40da310b"],["js/lab/models/derivative.js","9adefa2f9b"],["js/lab/models/dynamics.js","fb7430ee84"],["js/lab/models/eratosthenes.js","51b0354e6a"],["js/lab/models/euler-primes.js","8057d80024"],["js/lab/models/exponential.js","6235ce9cad"],["js/lab/models/fair-division.js","7ace2ac308"],["js/lab/models/fermat.js","c37bd492fb"],["js/lab/models/ferris-wheel.js","9f2aa45153"],["js/lab/models/inference.js","6e64298585"],["js/lab/models/integral.js","4acdf2217b"],["js/lab/models/line.js","f94c47a578"],["js/lab/models/matrix.js","b6def82d17"],["js/lab/models/monte-carlo.js","3815f93f6b"],["js/lab/models/num.js","58ed3e9d53"],["js/lab/models/primes.js","9eee931636"],["js/lab/models/probability.js","e87227c18f"],["js/lab/models/quadratic.js","aaf08b6d50"],["js/lab/models/sequences.js","109abb897b"],["js/lab/models/space-lines.js","6233a40fe2"],["js/lab/models/statistics.js","395747ca6a"],["js/lab/models/tiles.js","d9d34bc963"],["js/lab/models/topology.js","a47e8093d4"],["js/lab/models/trig.js","0148d92458"],["js/lab/models/vectors.js","6189c8eeea"],["js/lab/mount.js","2a7ed0b707"],["js/lab/page.js","73c7d47eb2"],["js/lab/plot.js","d36ae342cf"],["js/lab/registry.js","df19272d1a"],["js/lab/scale.js","dcb2707244"],["js/lab/shell.js","065b42efd4"],["js/lab/templates/calculation.js","811a9d750e"],["js/lab/templates/chance.js","8556593635"],["js/lab/templates/data.js","6857b5f7d9"],["js/lab/templates/dynamics.js","9db45695f3"],["js/lab/templates/family.js","0364658055"],["js/lab/templates/figure.js","12708209de"],["js/lab/templates/fourier.js","6821db7c72"],["js/lab/templates/illumination.js","7f9d62a404"],["js/lab/templates/inference-figure.js","32be42c349"],["js/lab/templates/inference.js","2cf7f72248"],["js/lab/templates/logistic.js","a05156afe5"],["js/lab/templates/monte-carlo.js","960e5d9779"],["js/lab/templates/process.js","2f2335e9d1"],["js/lab/templates/space.js","ba9b88accd"],["js/lab/templates/stream.js","88bcef1a52"],["js/lab/templates/transform.js","7fbc2a99bb"],["js/launchpad-model.js","e4a26e3908"],["js/learning-content.js","e97b635b08"],["js/library.js","3608f3bcb1"],["js/live-curriculum.js","42acdc0e4e"],["js/mandelbrot-preview.js","4d3aee61f4"],["js/math.js","3728a18776"],["js/modes.js","47ed5c3351"],["js/motion.js","1dcf636a6a"],["js/nav-flyout.js","730d37e5e2"],["js/navigation-state.js","bba40bad57"],["js/object-kit.js","3c1eca9f7c"],["js/offline.js","b7a9bc94b7"],["js/pack-builder.js","0f50bf79d6"],["js/page-ergonomics.js","1072a69f9d"],["js/platonic-explorer.js","21a4ef1344"],["js/platonic-fold.js","5c1d7df0e6"],["js/prepare-model.js","2eefa87d1d"],["js/prepare-page.js","d841827d7f"],["js/quadratic-workshop.js","9bee7ed85a"],["js/reading-content.js","f362c66edf"],["js/reading-history-content.js","5d7f910beb"],["js/reading.js","758b791115"],["js/related-box.js","b4d54ac56e"],["js/relax-model.js","8f68320a6e"],["js/relax-page.js","00a671dfec"],["js/resource-editions.js","58cfc5e35d"],["js/resource-index.js","c446d91d3c"],["js/resource-library.js","ef4c6421e3"],["js/resource-search.js","aac0f17e13"],["js/resource-sources.js","1f8560c976"],["js/resources-data.js","e006b8ecb5"],["js/review-model.js","f00aff5f20"],["js/review-page.js","486fa00b8e"],["js/review-state.js","103c597b16"],["js/scroll-memory.js","e9eee1baf4"],["js/seance-model.js","ccdb187383"],["js/sequence-model.js","70fbefb3f1"],["js/slides-page.js","fa418ed680"],["js/study-guides.js","1b11b9ed93"],["js/teacher-dashboard.js","da7fbaca10"],["js/teacher-entry.js","104a96d3f4"],["js/teacher-state.js","e93ee3e7d2"],["js/topic-registry.js","fa3e4f044b"],["js/topology-content.js","a25be5c3ad"],["js/ui.js","8f3043c6ed"],["js/visible-loop.js","1bd00417d7"],["js/visual-lessons.js","2d994f8fbb"],["js/welcome.js","51b29b88b6"],["js/worksheets.js","c508fed939"],["slides/data/index.json","6c13ec36be"],["slides/lectures/index.json","2a03b13c91"],["styles/comic.css","c072e25ab0"],["styles/ergonomics.css","4a6e199373"],["styles/exhibit.css","4c586e62ef"],["styles/explorer.css","9fcda779f8"],["styles/figure-layout.css","2ab958748a"],["styles/generator.css","a5af338752"],["styles/history.css","7563185537"],["styles/home.css","18e716a2da"],["styles/inference.css","6bc9fe7415"],["styles/pages.css","54f7089b38"],["styles/review.css","9200017f1f"],["styles/teacher.css","9ddd66244e"],["styles/timeline-standalone.css","0fe5d9b7df"],["styles/tokens.css","c197d1e251"],["styles/topics.css","1ec2f6ee25"],["vendor/mathjax-tex-svg.js","b5ddbe0e5d"]]};

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
