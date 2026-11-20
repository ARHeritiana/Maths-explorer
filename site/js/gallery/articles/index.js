// Registry of the encyclopedia articles of the gallery (one module per batch, each exports a map id -> article; see
// ../article.js for the shape). A curiosity without an article still shows the older page.
import { LIFE_ARTICLES } from "./pilot.js";
import { BATCH1 } from "./batch-1.js";
import { BATCH2 } from "./batch-2.js";
import { BATCH3 } from "./batch-3.js";
import { BATCH4 } from "./batch-4.js";
import { BATCH5 } from "./batch-5.js";
import { BATCH6 } from "./batch-6.js";
export const ARTICLES = { ...LIFE_ARTICLES, ...BATCH1, ...BATCH2, ...BATCH3, ...BATCH4, ...BATCH5, ...BATCH6 };
