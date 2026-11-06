# FFMI calculator research (2026-11-06) — Ahrefs `ffmi calculator` >10,000 Easy (male/natural limit/formula variants <100 or >100 N/A)

## Site check
No FFMI page or mention exists on calcthis.co. Neighbours: /lean-body-mass-calculator/, /body-fat-calculator/, /bmi-calculator/ (cross-link).

## Competitors opened LIVE (2026-11-06)
- **ffmicalculator.org** (the top result by name): imperial/metric, height (ft+in), weight, body fat % -> fat-free mass, body fat, FFMI, normalized FFMI; a bare number strip 16-30; two static tables (men / women) with overlapping, inconsistent ranges (men "Fat man 19-21" vs "Athlete 20-21"). Normalization uses 6.3 x (1.8 - h). No sex input in the calculator itself.
- **Omnicalculator** (omnicalculator.com/health/ffmi): sex, height (8 units), weight (7 units), body fat; outputs FFMI, normalized FFMI, fat-free mass, total fat. Interpretation tables men + women. Uses **6.1** x (1.8 - h) -> differs from the primary paper (6.3). No visual, no natural-limit estimate, no what-if. Its worked example: 180 cm, 75 kg, 22% -> FFMI 18.1, FFM 58.5 kg, fat 16.5 kg.
- **Menno Henselmans** (mennohenselmans.com/ffmi-calculator): two goals ("my natural potential" via Casey Butt tape-measure formulas, "natty or not" probability), imperial/metric, sex, body composition step; reference ladder: 18.9 average Caucasian, 21.8 competitive power athlete, 22.6 internationally competitive bodybuilder, 24.8 average steroid user, 24.9 upper limit for most people, 25.4 world class natural pro, 28.0 largest natural trainee documented. Heavy, tape-measure needed, pushes an app.
- **Built With Science**: 5-step wizard (gender first), percentile vs the American population, roadmap; FAQ says 18-19 typical, 20-21 lean athletic, 22-23 fitness models, 24-25 elite, 26+ rare drug-free, 28+ extremely rare. Result page not reachable without completing the wizard (not read).
- Seen only as search snippets (NOT opened): Athlean-X, jkoo.nl, Ekklo, SatisFIT, BodySpec.

## Sources READ (verified)
- **Kouri et al. 1995**, Clin J Sport Med 5:223-228 (abstract read via Europe PMC): FFMI = fat-free mass (kg) / height (m)^2; normalized with **6.3 x (1.80 - height in m)**; non-user athletes up to a "well-defined limit of 25.0"; 20 pre-steroid-era Mr. America winners mean 25.4; steroid users easily over 25, some over 30; 157 male athletes (83 users, 74 non-users); authors call it preliminary.
- **Trexler et al. 2017**, J Strength Cond Res 31(10):2719-2727 (abstract read via Europe PMC): 235 collegiate football players, DEXA, FFMI normalized to 180 cm; 26.4% above 25; mean 23.7 +/- 2.1; 97.5th percentile 28.1; max 31.7 -> "25" is NOT a hard natural ceiling.
- Omni formulas page (above): 6.1 constant. ffmicalculator.org: 6.3 constant. The primary paper says 6.3.

## NOT verified (flag or drop)
- Women's category cut-offs (Omni/ffmicalculator tables, sources not read), Chappell 2018 women estimate (searched Europe PMC, paper not found; only Menno's page cites it), Casey Butt max-potential formulas (not read), Schutz 2002 averages 18.9 men / 15.4 women (only quoted by Menno), BWS percentiles. PubMed/Google Scholar block our tools (reCAPTCHA) - not bypassed.

## Findings (what beats them)
1. Competitors disagree on the normalization constant (6.1 vs 6.3); we use the primary paper's 6.3 and say so (Omni's value does not match Kouri).
2. Everyone shows a bare number + a table; nobody draws where you sit. Menno has the only ladder but it is text.
3. Nobody tells the user that body-fat % is the weak link (a few % error moves FFMI a lot) - show FFMI across body fat +/-3%.
4. "Natural limit 25" is quoted as fact everywhere; Trexler shows 26.4% of football players exceed it. Say the honest version.

## Proposed differentiators (for approval)
VISUAL: horizontal FFMI scale (about 14-32) with the user's marker (normalized), bands for below average / average / above average / athletic / elite / above the 25 reference line, plus reference ticks from the sources read (25.0 Kouri limit, 25.4 pre-steroid Mr. America mean, 28.1 Trexler 97.5th pct football). Sex-specific bands.
FUNCTIONAL: (1) FFMI + normalized FFMI + fat-free mass + fat mass in kg and lb; (2) "range for your body fat +/-3%" so the weak input is visible; (3) goal mode: type a target FFMI (e.g. 22) -> fat-free mass needed at your height, and the muscle to gain at the same body fat or at a goal body fat; (4) height-normalization shown with the working; (5) "I don't know my body fat" link/estimate from the existing body-fat calculator (link, not a hidden guess); (6) Go advanced = choose constant is NOT offered (one verified constant); show non-normalized vs normalized; decimals; copy.
INPUT PARITY: sex, units (metric / US, with stones+lb for UK like Omni), height (ft+in / cm), weight, body fat %. All match or exceed ffmicalculator.org + Omni.
DROPPED unless approved: Casey Butt max-potential (needs wrist/ankle, source not read), "natty or not" probability (needs the distribution, not read), steroid verdict wording (page says only "above the range found in drug-free samples", never "you use steroids").
