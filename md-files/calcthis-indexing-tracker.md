# Indexing tracker (Google Search Console, property `sc-domain:calcthis.co`)

_How-to for requesting indexing with Claude in Chrome + the next batch: HANDOFF.md §10. Next batch = /auto-loan-calculator/ + the "not checked yet" list below, ~10 per day._

## ===== GSC STATUS — consolidated 2026-11-07 (THIS BLOCK IS AUTHORITATIVE; the dated notes below are history) =====
**DONE ("Indexing requested"):** tips + random numbers + sales tax (CA, TX, NYC, FL, car, chicago, los-angeles, las-vegas, michigan, virginia, north-carolina) + paycheck hub + new-york-city + 18 unit pairs + paycheck states new-jersey, ohio, massachusetts, maryland, wisconsin, indiana, oregon (the last 11 requested on 2026-11-07; quota hit on the 12th).
**TODO, in this order:**
1. Paycheck states: utah, louisiana, nebraska, oklahoma, arkansas, hawaii
2. The 10 older paycheck states: alaska, iowa, kentucky, missouri, montana, nevada, new-hampshire, south-dakota, tennessee, wyoming
3. Newest pages (2026-11-01/02): /salary-calculator/, /overtime-calculator/, /average-calculator/, /batting-average-calculator/, /stock-average-calculator/, /dice-average-calculator/, /time-average-calculator/, /percentage-change-calculator/, /semester-grade-calculator/, /calorie-deficit-calculator/ and re-request /grade-calculator/
4. Health block (all new, none requested; vitamin D added 2026-11-07, deployed v326; creatine v325): /vitamin-d-calculator/, /creatine-calculator/, /fiber-calculator/, /a1c-calculator/, /gmi-calculator/, /dog-age-calculator/, /cat-age-calculator/, /calories-burned-calculator/, /calories-burned-walking-calculator/, /calories-burned-running-calculator/, /keto-calculator/, /net-carb-calculator/, /intermittent-fasting-calculator/, /bsa-calculator/, /dog-food-calculator/, /ffmi-calculator/, /bulking-calculator/, /weight-loss-calculator/, /weight-loss-percentage-calculator/, /max-heart-rate-calculator/, /caffeine-half-life-calculator/, /caffeine-calculator/
5. Re-request (text changed): /heart-rate-zone-calculator/, /zone-2-heart-rate-calculator/, /calorie-calculator/
**Bing:** all 221 sitemap URLs submitted (2026-11-07). New pages go to Bing at deploy time (Webmaster is signed in again; IndexNow pinged by every build).
**Quota:** ~11 requests per window, resets about a day later; a request needs ~60 s end to end.

**GSC 2026-11-08 (after v337 deploy): 9 REQUESTED (paycheck utah, louisiana, nebraska, oklahoma, arkansas, hawaii, alaska, iowa, kentucky); /paycheck-calculator/missouri/ -> "Quota Exceeded". NEXT: missouri, montana, nevada, new-hampshire, south-dakota, tennessee, wyoming, newest pages, health block, then NEW: /markup-calculator/, /profit-margin-calculator/, /discount-calculator/, /commission-calculator/, /realtor-commission-calculator/, /unit-price-calculator/ (deployed v339 2026-11-09). BING: 2026-11-09 submitted manually (5 URLs, success): markup, profit margin, discount, commission, realtor commission; unit price NOT yet submitted.**

**GSC 2026-11-07 (later, "Start queue"): 0 requested — "Quota Exceeded" on the very first URL (/paycheck-calculator/utah/, status "Discovered - currently not indexed", no referring page). Quota had not reset since the morning batch of 11. Next attempt: after the quota resets (roughly a day after 2026-11-07 first batch); queue order unchanged, starts with utah.**

**GSC 2026-11-12 (after v343 thin-content deploy): 10 REQUESTED (confirmed "Indexing requested"): paycheck missouri, montana, nevada, new-hampshire, south-dakota, tennessee, wyoming, florida, texas, washington. /paycheck-calculator/alaska/ -> "Quota Exceeded". NEXT, same order: alaska (re-request, Alaska withholding fix), then the other changed pages: the 29 taxed paycheck states (alabama ... west-virginia; all with the new minimum-wage section), then RNG /random-number-generator-1-3/, -1-10/, -1-13/, -1-100/. Then the older queue (newest pages, health block, 3 time pages, p-value, confidence interval, markup ... unit price). Bing manual submit of the 42 changed pages DONE 2026-11-12 (all 42 appear in the Submitted list).**

## LIVE QUEUE (update at EVERY deploy and every request session; last updated 2026-11-02 — overtime deployed; GSC not requested since 2026-11-01 (10 done, quota hit at valet))
**GSC 2026-11-13: 11 REQUESTED (confirmed "Indexing requested"): paycheck alaska, alabama, arizona, arkansas, california, colorado, georgia, hawaii, illinois, indiana, iowa. /paycheck-calculator/kentucky/ -> "Quota Exceeded". NEXT, same order: kentucky, louisiana, maryland, massachusetts, michigan, minnesota, nebraska, new-jersey, new-york-city, new-york, north-carolina, ohio, oklahoma, oregon, pennsylvania, utah, virginia, wisconsin (+ remaining taxed states), then RNG 1-3, 1-10, 1-13, 1-100, then the 18 unit pairs (v344 text), then the older queue.**

**2026-11-05 (v316): NEW PAGE /bsa-calculator/ deployed (IndexNow 213 URLs HTTP 200; GitHub rejected the first two pushes, the third succeeded). Bing manual submit NOT done (signed out). Add to the END of the GSC queue (after intermittent fasting).**

**2026-11-05 (v315): NEW PAGE /intermittent-fasting-calculator/ deployed (IndexNow 212 URLs HTTP 200; live 200). Bing manual submit NOT done (signed out). Add to the END of the GSC queue (after keto + net carb).**

**2026-11-05 (v314): NEW PAGES /keto-calculator/ + /net-carb-calculator/ deployed (IndexNow 211 URLs HTTP 200; live 200). Bing manual submit NOT done (signed out). Add both to the END of the GSC queue (after calories burned).**

**2026-11-05 (v313): NEW PAGES /calories-burned-calculator/ + /calories-burned-walking-calculator/ + /calories-burned-running-calculator/ deployed (IndexNow 209 URLs HTTP 200; live 200). Bing manual submit NOT done (signed out). Add all 3 to the END of the GSC queue (after cat age).**

**2026-11-05 (v312): NEW PAGE /cat-age-calculator/ deployed (IndexNow pinged all 206, HTTP 200; live verified). Bing manual submit NOT done (signed out). Add to the END of the GSC queue (after dog age).**
**2026-11-05 (v311): NEW PAGE /dog-age-calculator/ deployed (IndexNow pinged all 205, HTTP 200; live verified). Bing manual submit NOT done (Bing Webmaster signed out in Chrome). Add to the END of the GSC queue (after a1c + gmi).**
**2026-11-05 (v310): NEW PAGES /a1c-calculator/ and /gmi-calculator/ deployed (IndexNow pinged all 204, HTTP 200; live verified). BING manual submit NOT done: Bing Webmaster Tools is signed out in Claude in Chrome (never sign in; ask him to sign in or submit the 2 URLs himself). Add both to the END of the GSC queue (after the newest pages).**
**GSC 2026-11-05: 10 REQUESTED (celsius-to-kelvin, knots-to-mph, kb-to-mb, cups-to-tablespoons, tablespoons-to-teaspoons, acres-to-sq-ft, tablespoons-to-ml, sales-tax/florida, car-sales-tax-calculator, sales-tax/chicago, sales-tax/los-angeles = 11 incl. LA); /sales-tax-calculator/las-vegas/ -> Quota Exceeded. NEXT: las-vegas, michigan, virginia, north-carolina, then 13 new paycheck states, 10 older, newest pages.**
**GSC REQUESTED 2026-11-01 (10, all confirmed "Indexing requested"): /sales-tax-calculator/new-york-city/, /tip-calculator/, /how-much-to-tip/, /how-much-to-tip/{hairdresser,barber,tattoo-artist,massage-therapist,dog-groomer,uber-driver,movers}/. Then "Quota Exceeded" on the 11th. NEXT (retry next day, in this order): /how-much-to-tip/valet/ · /tipping-in/canada/ italy/ japan/ · /random-number-generator-1-3/ · /speed-converter/ · /px-to-rem-converter/ · /sales-tax-calculator/california/ · texas/ · the 18 unit pair pages · 10 paycheck states · then the 8 new 2026-11-01 pages + re-request /grade-calculator/.**
**Google (GSC) — quota is per property ~10/day; "Quota Exceeded" seen again 2026-10-31 ~15:30 AND again 2026-11-01 (first request of the new session, NYC sales tax) — quota is NOT reset by the calendar day; retry later.** Requested so far (confirmed unless noted): /random-number-generator/ + -1-100 -wheel -no-repeats -1-10 -1-13 (2026-10-31), -1-3 (UNCONFIRMED), /speed-converter/ (UNCONFIRMED — GSC shows "Crawled – currently not indexed", last crawl Oct 27), /data-storage-converter/, /cooking-converter/.
**UPDATED 2026-11-01 (v286): /grade-calculator/ upgraded to Weighted Grade Calculator (new title/meta/FAQ) — already indexed, re-request in GSC to refresh the stale snippet; Bing submit.**
**2026-11-02 (v306): 5 NEW paycheck state pages deployed — /paycheck-calculator/{louisiana,nebraska,oklahoma,arkansas,hawaii}/ (IndexNow pinged all 194; BING manual submit DONE 2026-11-02: the 5 new pages + hub (6 URLs, all listed in Bing's submitted list; live site verified 200 + Gross pay label). Add to the GSC queue right after the 8 batch-2 states.**

**GSC REQUESTED 2026-11-02 (11 confirmed "Indexing requested"): /paycheck-calculator/ (hub, re-request for the Gross pay label), /paycheck-calculator/new-york-city/, /how-much-to-tip/valet/, /tipping-in/{canada,italy,japan}/, /random-number-generator-1-3/, /speed-converter/, /px-to-rem-converter/, /sales-tax-calculator/california/, /sales-tax-calculator/texas/. Then "Quota Exceeded" on /cm-to-inches/ (the 12th). NEXT (retry later, in this order): the 18 unit pairs starting /cm-to-inches/ (/cm-to-inches/ /kg-to-lbs/ /celsius-to-fahrenheit/ /mm-to-inches/ /grams-to-ounces/ /ml-to-oz/ /cups-to-grams/ /feet-to-inches/ /mb-to-gb/ /yards-to-meters/ /liters-to-quarts/ /celsius-to-kelvin/ /knots-to-mph/ /kb-to-mb/ /cups-to-tablespoons/ /tablespoons-to-teaspoons/ /acres-to-sq-ft/ /tablespoons-to-ml/) · the 8 new paycheck states (new-jersey ohio massachusetts maryland wisconsin indiana oregon utah) · the 10 older paycheck states (alaska iowa kentucky missouri montana nevada new-hampshire south-dakota tennessee wyoming) · then the newest pages (salary, overtime, average family, percentage change, semester grade, calorie deficit, /grade-calculator/ re-request). BING 2026-11-02: the 8 new paycheck states + hub submitted manually (9 URLs, success).**

**GSC retry 2026-11-02 (later, same day): first request (/cm-to-inches/) -> "Quota Exceeded — try again tomorrow". Nothing requested. Queue order unchanged (retry on a new day).**

**GSC REQUESTED 2026-11-03 (11 confirmed "Indexing requested", quota had reset): /cm-to-inches/ /kg-to-lbs/ /celsius-to-fahrenheit/ /mm-to-inches/ /grams-to-ounces/ /ml-to-oz/ /cups-to-grams/ /feet-to-inches/ /mb-to-gb/ /yards-to-meters/ /liters-to-quarts/. Then "Quota Exceeded" on /celsius-to-kelvin/ (12th). NEXT: /celsius-to-kelvin/ /knots-to-mph/ /kb-to-mb/ /cups-to-tablespoons/ /tablespoons-to-teaspoons/ /acres-to-sq-ft/ /tablespoons-to-ml/ (rest of the 18 pairs) -> 13 new paycheck states -> 10 older paycheck states -> newest pages.**
**2026-11-04 (v307): NEW PAGE /sales-tax-calculator/florida/ deployed (IndexNow pinged all 195; Bing manual submit: see below). Add to the GSC queue right after the 7 remaining unit pairs. BING manual submit DONE 2026-11-04 (/sales-tax-calculator/florida/, success; live site verified 200 + new placeholder).**
**2026-11-04 (v308): NEW PAGE /car-sales-tax-calculator/ deployed (IndexNow pinged all 196). Add to the GSC queue after /sales-tax-calculator/florida/. BING manual submit DONE 2026-11-04 (success; live 200 + new State typeahead verified).**
**GSC retry 2026-11-04: /celsius-to-kelvin/ -> "Quota Exceeded" (about 1 day after the 11 of 2026-11-03). Nothing requested; same queue.**
**(superseded) GSC retry 2026-11-03 earlier: /cm-to-inches/ -> "Quota Exceeded" again (quota had not reset ~a day after the 11 requests of 2026-11-02). Nothing requested; same queue order.**

**2026-11-02 (v305): 8 NEW paycheck state pages deployed — /paycheck-calculator/{new-jersey,ohio,massachusetts,maryland,wisconsin,indiana,oregon,utah}/ (IndexNow pinged; Bing manual submit pending/see HANDOFF). Add to the GSC queue after the NYC page; the Pay field label on the hub + all state pages is now "Gross pay, before taxes" (re-request the hub).**

**2026-11-02 (v304): NEW PAGE /paycheck-calculator/new-york-city/ deployed (IndexNow pinged, Bing manual submit done). Add to the GSC queue right after the hub re-request.**

**2026-11-02 (v303): paycheck Plan 2 (children, local tax, refund line) deployed on the hub + 25 state pages; IndexNow pinged; re-request /paycheck-calculator/ first when GSC resumes.**

**NEW 2026-11-02 (v302): paycheck hub + 25 state pages got new titles/H1/meta/FAQ ("Paycheck & Take-Home Pay Calculator"); IndexNow pinged; Bing manual submit of the hub only. When GSC resumes, RE-REQUEST /paycheck-calculator/ (stale snippet) before the state pages.**
**NEW 2026-11-02 (v299): /salary-calculator/ deployed (IndexNow pinged; Bing submitted manually); add to END of GSC queue (GSC not requested).**
**NEW 2026-11-02 (v294): /overtime-calculator/ deployed (IndexNow pinged, Bing submitted manually 2026-11-02); add to END of GSC queue (GSC not requested).**
**NEW 2026-11-01 (v284): /percentage-change-calculator/ deployed + Bing submitted — add to END of GSC queue.**
**NEW 2026-11-01 (v280): /average-calculator/, /batting-average-calculator/, /stock-average-calculator/, /dice-average-calculator/, /time-average-calculator/ deployed + Bing submitted — add to END of GSC queue (after semester grade).**
**NEW 2026-11-01 (v276): /semester-grade-calculator/ deployed + Bing submitted — add to END of GSC queue.**
**NEW 2026-11-01 (v273): /calorie-deficit-calculator/ — deployed; Bing submitted; add to END of the GSC queue.**
**NEXT for GSC, in this order (nothing from this list is requested yet; GSC said Quota Exceeded 2026-10-31, a new day = retry):** 1 /sales-tax-calculator/new-york-city/ · 2 /tip-calculator/ · 3 /how-much-to-tip/ · 4-11 /how-much-to-tip/hairdresser/ /barber/ /tattoo-artist/ /massage-therapist/ /dog-groomer/ /uber-driver/ /movers/ /valet/ · 12-14 /tipping-in/canada/ /italy/ /japan/ · then /random-number-generator-1-3/ (unconfirmed) · /speed-converter/ (unconfirmed) · /px-to-rem-converter/ · /sales-tax-calculator/california/ · /sales-tax-calculator/texas/ · the 18 unit pair pages (/cm-to-inches/ /kg-to-lbs/ /celsius-to-fahrenheit/ /mm-to-inches/ /grams-to-ounces/ /ml-to-oz/ /cups-to-grams/ /feet-to-inches/ /mb-to-gb/ /yards-to-meters/ /liters-to-quarts/ /celsius-to-kelvin/ /knots-to-mph/ /kb-to-mb/ /cups-to-tablespoons/ /tablespoons-to-teaspoons/ /acres-to-sq-ft/ /tablespoons-to-ml/) · then the 10 paycheck states (alaska iowa kentucky missouri montana nevada new-hampshire south-dakota tennessee wyoming). New pages built later (calorie deficit calculator …) go to the end.
**Bing:** (a) every deploy pings IndexNow with ALL sitemap URLs (Bing + Yandex; automatic in build.js); (b) manual Webmaster URL submission (quota 100/day) done 2026-10-29 (RNG 7, unit pages) and **2026-10-31 15:28 (30 URLs: California, px-to-rem, all 18 pair pages, 10 paycheck states)**. **All pages up to and including /tipping-in/* (170 URLs live) are submitted to Bing**; submit any new URL manually right after each deploy.
**New pages deployed 2026-10-31:** Tip phase 3 /tipping-in/{canada,italy,japan}/ (v270; Bing manually submitted 2026-10-31, GSC still to do), Tip phase 2 /how-much-to-tip/ hub + /how-much-to-tip/{hairdresser,barber,tattoo-artist,massage-therapist,dog-groomer,uber-driver,movers,valet}/ (v264; Bing manually submitted 2026-10-31, GSC still to do), Tip calculator hub /tip-calculator/ (v261; Bing manually submitted 2026-10-31, GSC still to do), NYC sales tax /sales-tax-calculator/new-york-city/ (v259; Bing manually submitted 2026-10-31; GSC tried 2026-10-31 -> Quota Exceeded, retry next day FIRST in queue), Texas sales tax /sales-tax-calculator/texas/ (v257; Bing manually submitted 2026-10-31, GSC still to do), California sales tax (v256), 18 unit pair pages (v249-251). Site-wide SEO metadata deployed v256 (calcthis-seo-checklist.md).

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

- 2026-11-05 deployed v309: `/sales-tax-calculator/chicago/ los-angeles/ las-vegas/ michigan/ virginia/ north-carolina/` — Bing submitted manually (7 URLs incl. hub), IndexNow HTTP 200; GSC NOT requested yet: add to the queue after `/sales-tax-calculator/florida/` + `/car-sales-tax-calculator/`.

- 2026-11-05 deployed v317: `/dog-food-calculator/` — IndexNow HTTP 200 (214 URLs); Bing NOT submitted (Bing Webmaster signed out in Chrome); GSC NOT requested: add to the end of the health block of the queue (after `/bsa-calculator/`).

- GSC retry 2026-11-05 (after the dog food deploy, same day as the 11 requests): `/sales-tax-calculator/las-vegas/` -> "Quota Exceeded — try again tomorrow". Nothing requested; queue unchanged (next: las-vegas, michigan, virginia, north-carolina, 13 new paycheck states, 10 older, newest pages, health block incl. `/dog-food-calculator/`).

- 2026-11-06 deployed v318: `/ffmi-calculator/` — IndexNow HTTP 200 (215 URLs); Bing NOT submitted (signed out); GSC NOT requested (quota still exceeded 2026-11-06): add after `/dog-food-calculator/` at the end of the health block.

- 2026-11-06 deployed v319: `/bulking-calculator/` — IndexNow HTTP 200 (216 URLs); Bing NOT submitted (signed out); GSC NOT requested (quota): add after `/ffmi-calculator/` at the end of the health block.
- 2026-11-06 deployed v320: `/weight-loss-calculator/` (+ "Calories you burn" label rename on bulking, calorie deficit, calorie calculator) — IndexNow HTTP 200 (217 URLs); Bing NOT submitted (signed out); GSC NOT requested (quota): add after `/bulking-calculator/` at the end of the health block.
- 2026-11-06 deployed v321: `/weight-loss-percentage-calculator/` — IndexNow HTTP 200 (218 URLs); Bing NOT submitted (signed out); GSC NOT requested (quota): add after `/weight-loss-calculator/` at the end of the health block.
- 2026-11-06 deployed v322: `/max-heart-rate-calculator/` (+ inbound links on the heart rate zone and Zone 2 pages) — IndexNow HTTP 200 (219 URLs); Bing NOT submitted (signed out); GSC NOT requested (quota): add after `/weight-loss-percentage-calculator/` at the end of the health block; also re-request `/heart-rate-zone-calculator/` and `/zone-2-heart-rate-calculator/` (text changed).
- 2026-11-07 deployed v323: `/caffeine-calculator/` + `/caffeine-half-life-calculator/` — IndexNow HTTP 200 (221 URLs); Bing NOT submitted (signed out); GSC NOT requested (quota): add both after `/max-heart-rate-calculator/` in the health block (the half-life page first: Ahrefs >1000 Easy).
- 2026-11-07: Bing URL Submission (signed in again): 19 URLs submitted manually, all health pages from v310 to v323 (a1c, gmi, dog-age, cat-age, calories-burned x3, keto, net-carb, intermittent-fasting, bsa, dog-food, ffmi, bulking, weight-loss, weight-loss-percentage, max-heart-rate, caffeine, caffeine-half-life) — "19 URLs submitted Successfully"; Bing list now 221 of 221 sitemap URLs. GSC quota is OPEN again: `/sales-tax-calculator/las-vegas/` -> "Indexing requested" (test request). Queue continues with `/sales-tax-calculator/michigan/` (then virginia, north-carolina, the 13 new paycheck states, ...), health block + the 2 caffeine pages at the end.
- 2026-11-07 deployed v326: `/vitamin-d-calculator/` — IndexNow HTTP 200 (224 URLs); Bing submitted manually; GSC NOT requested.
- 2026-11-07 deployed v325: `/creatine-calculator/` — IndexNow HTTP 200 (223 URLs); Bing submitted manually; GSC NOT requested.
- 2026-11-07 deployed v324: `/fiber-calculator/` — IndexNow HTTP 200 (222 URLs); Bing submitted manually (see below); GSC NOT requested.
- GSC 2026-11-07 "Start queue": 11 URLs requested ("Indexing requested"): `/sales-tax-calculator/las-vegas/ michigan/ virginia/ north-carolina/`, `/paycheck-calculator/new-jersey/ ohio/ massachusetts/ maryland/ wisconsin/ indiana/ oregon/`. The 12th (`/paycheck-calculator/utah/`) = "Quota Exceeded". NEXT in the queue: utah, louisiana, nebraska, oklahoma, arkansas, hawaii, then the 10 older paycheck states (alaska iowa kentucky missouri montana nevada new-hampshire south-dakota tennessee wyoming), newest pages, health block incl. both caffeine pages. Note: if the first click on "Request indexing" shows no dialog, wait ~15 s after the inspection loads before clicking (the page was not ready) — each request needs ~60 s end to end.
- 2026-11-07 deployed v329: `/body-recomposition-calculator/` - IndexNow HTTP 200 (225 URLs); Bing SUBMITTED 2026-11-07 (Success: URL submitted Successfully); GSC NOT requested (quota): add after `/vitamin-d-calculator/` at the end of the health block.

- 2026-11-08 deployed v330: `/markup-calculator/` - IndexNow HTTP 200 (226 URLs); Bing submit pending (manual); GSC NOT requested (quota): add to the money block / end of queue.
- 2026-11-08 deployed v331: `/profit-margin-calculator/` - IndexNow HTTP 200 (227 URLs); Bing submit pending (manual); GSC NOT requested (quota): add to the money block / end of queue.
- 2026-11-08 deployed v332: `/discount-calculator/` (+ global field symbols) - IndexNow HTTP 200 (228 URLs); Bing submit pending (manual, also markup + profit margin); GSC NOT requested (quota): add to the money block / end of queue.
- 2026-11-08 v333: global field symbols now cover all picker currencies (side per currency: ILS/EUR/SEK after, USD/INR/GBP before; no-symbol currencies show the code); app.js FIELD SYMBOLS block. No new pages.
- NOTE 2026-11-08 session end: Bing submit still pending for markup, profit margin, discount (v330-v332); v333-v336 had no new pages.

- 2026-11-10 v341: /seconds-to-hours-calculator/, /minutes-to-hours-calculator/, /seconds-to-minutes-calculator/ deployed; IndexNow sent; Bing manual submit NOT yet done; GSC not requested.
- 2026-11-10 v340: /p-value-calculator/ deployed; IndexNow sent; Bing manual submit NOT yet done; GSC not requested.

- 2026-11-10: confidence-interval-calculator deployed v342, NOT yet submitted to Bing or GSC.

- 2026-11-10: Bing manual submit DONE (5 URLs: p-value, seconds-to-hours, minutes-to-hours, seconds-to-minutes, confidence-interval) and GSC "Indexing requested" for the same 5. Older queue (utah first) not started.
- 2026-11-10 (queue): inspected /paycheck-calculator/utah/, louisiana/, nebraska/: all "URL is on Google / Page is indexed" (no request needed). The Pages report (last update 2026-11-06) still lists 50 Discovered + 25 Crawled-not-indexed, so it is stale; the queue order in this file is out of date. Next time: inspect first, request only pages that say "URL is not on Google". No quota error seen.
- 2026-11-10 (sweep): /average-calculator/ was "URL is not on Google" -> Indexing requested. /paycheck-calculator/hawaii/ and /dice-average-calculator/ on Google. /batting-average-calculator/ screenshot showed a "Submitting request" dialog (state unclear, re-inspect). NOT checked yet: oklahoma, arkansas, the other states, hours, mortgage, overtime, bmr, calorie-deficit, 2 blog pages, contact, and the 25 Crawled-not-indexed (Search Console report last updated 2026-11-06, stale).
- 2026-11-10: GSC quota EXCEEDED after 10 requests today (5 new pages + average, batting-average, hours, mortgage, overtime). Next in line: /bmr-calculator/ (quota hit on it), calorie-deficit, oklahoma, arkansas, other states, 2 blog pages. Retry on a new day.

**2026-11-12 (v344): 18 unit-pair pages rewritten with unique sourced sections and deployed; GSC re-request queue (after the paycheck block): cm-to-inches, kg-to-lbs, celsius-to-fahrenheit, mm-to-inches, grams-to-ounces, ml-to-oz, cups-to-grams, feet-to-inches, mb-to-gb, yards-to-meters, liters-to-quarts, celsius-to-kelvin, knots-to-mph, kb-to-mb, cups-to-tablespoons, tablespoons-to-teaspoons, acres-to-sq-ft, tablespoons-to-ml. Bing manual submit pending.**

- GSC 2026-11-13 "Start queue": 0 requested. First URL `/cm-to-inches/` (Crawled - currently not indexed, last crawl Nov 3) = "Quota Exceeded". Order for the next try: the 18 unit pairs (content fix v344), the 8 tip pages (v346) + hub, then paycheck states (kentucky onward). GSC Page indexing 2026-11-13: not indexed 71, indexed 139; no sales-tax URL in either not-indexed list (md-files/calcthis-salestax-seo-research.md).
- BING 2026-11-13: 29 URLs submitted manually (signed in, quota 100): 18 unit pairs, /how-much-to-tip/ + 8 service pages, /tip-calculator/, /tipping-in/canada/. They appear in the Submitted Urls list as "Today". GSC still pending (quota).
- 2026-11-13 (v350): /z-score-calculator/ deployed (commit 485c42f3, Pages built, live 200). IndexNow pinged 237 URLs (HTTP 200). Bing manual submit NOT done (signed out). GSC not requested: add to the queue after the unit pairs + tip pages.
- GSC 2026-11-13 later "Start queue": 0 requested, /cm-to-inches/ = Quota Exceeded again (same day as the first try). Queue order unchanged: 18 unit pairs, tip hub + 8 service pages, /z-score-calculator/, paycheck states from kentucky.
- 2026-11-13 (v351): /compound-interest-calculator/ deployed. IndexNow pinged 238 URLs (HTTP 200). Bing manual submit NOT done (signed out). GSC not requested: add to the queue after /z-score-calculator/.
- BING 2026-11-13 (evening): /z-score-calculator/ and /compound-interest-calculator/ submitted manually (signed in); both appear in the Submitted Urls list as "Today". GSC still pending (quota).
- 2026-11-14 (v352): /amortization-calculator/ deployed (commit 76c66039, Pages built, 200). IndexNow pinged 239 URLs (HTTP 200). Bing manual submit NOT done yet. GSC not requested: add to the queue after /compound-interest-calculator/.
- GSC 2026-11-14 "Start queue" (property sc-domain:calcthis.co): 11 REQUESTED: /amortization-calculator/, /compound-interest-calculator/, /z-score-calculator/, /cm-to-inches/, /kg-to-lbs/, /ml-to-oz/, /mb-to-gb/, /kb-to-mb/, /cups-to-grams/, /feet-to-inches/, /cups-to-tablespoons/. Already 'URL is on Google' (no request needed): /celsius-to-fahrenheit/, /mm-to-inches/, /grams-to-ounces/, /yards-to-meters/, /liters-to-quarts/, /celsius-to-kelvin/. /knots-to-mph/ = not on Google, request got 'Quota Exceeded' (12th). NEXT window: /knots-to-mph/, inspect /tablespoons-to-teaspoons/ and /tablespoons-to-ml/, then tip hub + 8 tip pages, paycheck states from kentucky (inspect first, request only 'not on Google'). Bing manual submit for /amortization-calculator/ still pending (his sign-in). Chrome tab closed.
- BING 2026-11-14: /amortization-calculator/ submitted manually (signed in); it is the first row of the Submitted Urls list, 'Today'. Chrome tab closed.
