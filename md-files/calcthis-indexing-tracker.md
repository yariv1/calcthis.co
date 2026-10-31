# Indexing tracker (Google Search Console, property `sc-domain:calcthis.co`)

_How-to for requesting indexing with Claude in Chrome + the next batch: HANDOFF.md §10. Next batch = /auto-loan-calculator/ + the "not checked yet" list below, ~10 per day._

## LIVE QUEUE (update at EVERY deploy and every request session; last updated 2026-10-31 evening)
**Google (GSC) — quota is per property ~10/day; "Quota Exceeded" seen again 2026-10-31 ~15:30 (reset time unclear, retry later).** Requested so far (confirmed unless noted): /random-number-generator/ + -1-100 -wheel -no-repeats -1-10 -1-13 (2026-10-31), -1-3 (UNCONFIRMED), /speed-converter/ (UNCONFIRMED — GSC shows "Crawled – currently not indexed", last crawl Oct 27), /data-storage-converter/, /cooking-converter/.
**NEXT for GSC, in this order:** 1 /random-number-generator-1-3/ (unconfirmed) · 2 /speed-converter/ (unconfirmed) · 3 /px-to-rem-converter/ · 4 /sales-tax-calculator/california/ · 5 /sales-tax-calculator/texas/ · 6 /cm-to-inches/ · 7 /kg-to-lbs/ · 8 /celsius-to-fahrenheit/ · 9 /mm-to-inches/ · 10 /grams-to-ounces/ · then /ml-to-oz/ /cups-to-grams/ /feet-to-inches/ /mb-to-gb/ /yards-to-meters/ /liters-to-quarts/ /celsius-to-kelvin/ /knots-to-mph/ /kb-to-mb/ /cups-to-tablespoons/ /tablespoons-to-teaspoons/ /acres-to-sq-ft/ /tablespoons-to-ml/ · then the 10 paycheck states (alaska iowa kentucky missouri montana nevada new-hampshire south-dakota tennessee wyoming). NYC sales tax page (when built) goes to the end of this list.
**Bing:** (a) every deploy pings IndexNow with ALL sitemap URLs (Bing + Yandex; automatic in build.js); (b) manual Webmaster URL submission (quota 100/day) done 2026-10-29 (RNG 7, unit pages) and **2026-10-31 15:28 (30 URLs: California, px-to-rem, all 18 pair pages, 10 paycheck states)**. Nothing pending for Bing; submit any new URL manually right after each deploy.
**New pages deployed 2026-10-31:** Tip phase 2 /how-much-to-tip/ hub + /how-much-to-tip/{hairdresser,barber,tattoo-artist,massage-therapist,dog-groomer,uber-driver,movers,valet}/ (v264; Bing manually submitted 2026-10-31, GSC still to do), Tip calculator hub /tip-calculator/ (v261; Bing manually submitted 2026-10-31, GSC still to do), NYC sales tax /sales-tax-calculator/new-york-city/ (v259; Bing manually submitted 2026-10-31; GSC tried 2026-10-31 -> Quota Exceeded, retry next day FIRST in queue), Texas sales tax /sales-tax-calculator/texas/ (v257; Bing manually submitted 2026-10-31, GSC still to do), California sales tax (v256), 18 unit pair pages (v249-251). Site-wide SEO metadata deployed v256 (calcthis-seo-checklist.md).

**Rule:** every new calculator/article is added to the table below the moment it deploys (status `Not requested`).
Request indexing in GSC → URL Inspection → Request indexing. **Quota is per property (~10/day, shared by the whole domain), not per user.**
Requesting only queues a crawl; re-check status ~1–2 weeks later and update the table.

GSC snapshot 2026-10-26: 69 indexed, 13 not indexed (8 Discovered, 1 Crawled, 1 alternate-canonical, 1 404, 2 redirect error).

## Calculators — not indexed yet
| URL | GSC status (2026-10-26) | Indexing requested | Verified indexed |
|---|---|---|---|
| /ideal-weight-calculator/ | Discovered – not indexed | 2026-10-26 | |
| /vo2-max-calculator/ | Discovered – not indexed | 2026-10-26 | |
| /wallpaper-calculator/ | Discovered – not indexed | 2026-10-26 | |
| /water-intake-calculator/ | Discovered – not indexed | 2026-10-26 | |
| /scientific-notation-calculator/ | Discovered – not indexed | 2026-10-26 | |
| /loan-calculator/ | URL unknown to Google (new, v163) | 2026-10-26 | |
| /mortgage-calculator/ | URL unknown to Google | 2026-10-26 | |
| /triangle-calculator/ | URL unknown to Google | 2026-10-26 | |
| /hours-calculator/ | URL unknown to Google | 2026-10-26 | |
| /bmr-calculator/ | URL unknown to Google | 2026-10-26 | |

## Calculators — status not checked yet (check + request next, ~10/day)
/recipe-converter/ · /paint-calculator/ · /standard-deviation-calculator/ · /fraction-calculator/ · /weighted-average-calculator/ · /grade-curve-calculator/ · /waist-to-hip-ratio-calculator/ · /lean-body-mass-calculator/ · /stair-calculator/ · /square-footage-calculator/ · /protein-intake-calculator/ · /steps-to-miles-calculator/ · /time-calculator/ · /date-calculator/

## Other pages not indexed
| URL | GSC status | Requested |
|---|---|---|
| /blog/how-much-flooring-do-i-need/ | Discovered – not indexed | no |
| /blog/how-to-calculate-the-number-of-days-between-two-dates/ | Discovered – not indexed | no |
| /contact/ | Discovered – not indexed | no |
| (1 page) | Crawled – currently not indexed | not opened yet |
| (1 page) | Alternate page with proper canonical | not opened yet |
| (1 page) | Not found (404) | not opened yet — fix or remove |
| (2 pages) | Redirect error | not opened yet — investigate |

## Newly deployed (add here at every deploy)
| URL | Deployed | Indexing requested |
|---|---|---|
| /auto-loan-calculator/ | 2026-10-26 (v169) | 2026-10-27 (GSC) |
| /paycheck-calculator/ | 2026-10-27 (v175) | 2026-10-27 (GSC) (Bing: submitted via sitemap + IndexNow) |
| /paycheck-calculator/alabama/ | 2026-10-27 (v185) | 2026-10-28 (GSC + Bing) (Bing: sitemap + IndexNow) |
| /paycheck-calculator/alaska/ | 2026-10-27 (v185) | not yet (Bing: sitemap + IndexNow) |
| /paycheck-calculator/arizona/ | 2026-10-27 (v185) | 2026-10-28 (GSC + Bing) (Bing: sitemap + IndexNow) |
| /paycheck-calculator/california/ | 2026-10-27 (v185) | 2026-10-27 (GSC) (Bing: sitemap + IndexNow) |
| /paycheck-calculator/colorado/ | 2026-10-27 (v185) | 2026-10-28 (GSC + Bing) (Bing: sitemap + IndexNow) |
| /paycheck-calculator/florida/ | 2026-10-27 (v185) | 2026-10-27 (GSC) (Bing: sitemap + IndexNow) |
| /paycheck-calculator/georgia/ | 2026-10-27 (v185) | 2026-10-27 (GSC) (Bing: sitemap + IndexNow) |
| /paycheck-calculator/illinois/ | 2026-10-27 (v185) | 2026-10-27 (GSC) (Bing: sitemap + IndexNow) |
| /paycheck-calculator/iowa/ | 2026-10-27 (v185) | not yet (Bing: sitemap + IndexNow) |
| /paycheck-calculator/kentucky/ | 2026-10-27 (v185) | not yet (Bing: sitemap + IndexNow) |
| /paycheck-calculator/michigan/ | 2026-10-27 (v185) | 2026-10-28 (GSC + Bing) (Bing: sitemap + IndexNow) |
| /paycheck-calculator/minnesota/ | 2026-10-27 (v185) | 2026-10-28 (GSC + Bing) (Bing: sitemap + IndexNow) |
| /paycheck-calculator/missouri/ | 2026-10-27 (v185) | not yet (Bing: sitemap + IndexNow) |
| /paycheck-calculator/montana/ | 2026-10-27 (v185) | not yet (Bing: sitemap + IndexNow) |
| /paycheck-calculator/nevada/ | 2026-10-27 (v185) | not yet (Bing: sitemap + IndexNow) |
| /paycheck-calculator/new-hampshire/ | 2026-10-27 (v185) | not yet (Bing: sitemap + IndexNow) |
| /paycheck-calculator/new-york/ | 2026-10-27 (v185) | 2026-10-27 (GSC) (Bing: sitemap + IndexNow) |
| /paycheck-calculator/north-carolina/ | 2026-10-27 (v185) | 2026-10-27 (GSC) (Bing: sitemap + IndexNow) |
| /paycheck-calculator/pennsylvania/ | 2026-10-27 (v185) | 2026-10-27 (GSC) (Bing: sitemap + IndexNow) |
| /paycheck-calculator/south-dakota/ | 2026-10-27 (v185) | not yet (Bing: sitemap + IndexNow) |
| /paycheck-calculator/tennessee/ | 2026-10-27 (v185) | not yet (Bing: sitemap + IndexNow) |
| /paycheck-calculator/texas/ | 2026-10-27 (v185) | 2026-10-27 (GSC) (Bing: sitemap + IndexNow) |
| /paycheck-calculator/virginia/ | 2026-10-27 (v185) | 2026-10-28 (GSC + Bing) (Bing: sitemap + IndexNow) |
| /paycheck-calculator/washington/ | 2026-10-27 (v185) | 2026-10-28 (GSC + Bing) (Bing: sitemap + IndexNow) |
| /paycheck-calculator/wyoming/ | 2026-10-27 (v185) | not yet (Bing: sitemap + IndexNow) |
| /turkey-cooking-time-calculator/ | 2026-10-28 | 2026-10-28 (GSC + Bing) |
| /turkey-thawing-time-calculator/ | 2026-10-28 | 2026-10-28 (GSC + Bing) |
| /turkey-size-calculator/ | 2026-10-28 | 2026-10-28 (GSC + Bing) |
| /sales-tax-calculator/ | 2026-10-28 (v208) | 2026-10-28 (GSC + Bing) |
| /sales-tax-calculator/new-jersey/ | 2026-10-28 (v208) | 2026-10-28 (GSC + Bing) |
| /sales-tax-calculator/missouri/ | 2026-10-28 (v224) | 2026-10-28 (GSC + Bing) |
| /sales-tax-calculator/ohio/ | 2026-10-28 (v233) | 2026-10-28 (GSC + Bing) |
| /sales-tax-calculator/minnesota/ | 2026-10-29 (v235) | 2026-10-29 (GSC + Bing) |
| /unit-converter/ + /length-converter/ /weight-converter/ /volume-converter/ /temperature-converter/ /area-converter/ /speed-converter/ /data-storage-converter/ /cooking-converter/ /px-to-rem-converter/ | 2026-10-29 (v241) | Bing: all 10 submitted 2026-10-29. GSC: hub, length, weight, volume, temperature, area requested 2026-10-29; TODO next day (quota hit): speed, data-storage, cooking, px-to-rem |
| /random-number-generator/ | 2026-10-29 (v246) | GSC not yet (quota exceeded 2026-10-29); Bing submitted 2026-10-29 |
| /random-number-generator-1-100/ | 2026-10-29 (v246) | GSC not yet (quota exceeded 2026-10-29); Bing submitted 2026-10-29 |
| /random-number-generator-1-10/ | 2026-10-29 (v246) | GSC not yet (quota exceeded 2026-10-29); Bing submitted 2026-10-29 |
| /random-number-generator-1-3/ | 2026-10-29 (v246) | GSC not yet (quota exceeded 2026-10-29); Bing submitted 2026-10-29 |
| /random-number-generator-1-13/ | 2026-10-29 (v246) | GSC not yet (quota exceeded 2026-10-29); Bing submitted 2026-10-29 |
| /random-number-generator-no-repeats/ | 2026-10-29 (v246) | GSC not yet (quota exceeded 2026-10-29); Bing submitted 2026-10-29 |
| /random-number-generator-wheel/ | 2026-10-29 (v246) | GSC not yet (quota exceeded 2026-10-29); Bing submitted 2026-10-29 |