# CalcThis — Nav Structure

Exact nav HTML used in `partials/header.html`. When adding a calculator, add its link in the correct column.
`class="current"` is added by build.js at deploy — never bake it into source.

Columns:
- Column 1: Home (standalone, ABOVE Construction), then Construction
- Column 2: Health & Fitness, then School & Grades
- Column 3: Math & Numbers

No `.navsep` dividers in the nav (removed). Extra top spacing before a section head that follows links via `.menu-col a + .menu-col-head`.

```html
  <header>
    <button class="menu-btn" id="menuBtn" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="siteMenu">
      <svg class="ic-open" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
      <svg class="ic-close" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
    </button>
    <a class="brand" href="/">
      <img src="/assets/favicon.svg" width="24" height="24" alt="CalcThis">
      <span>Calc<b>This</b></span>
    </a>
    <nav class="menu" id="siteMenu" hidden>
      <div class="menu-cols">
        <div class="menu-col">
          <a href="/">Home</a>
          <span class="menu-col-head">Construction</span>
          <a href="/board-foot-calculator/">Board Foot</a>
          <a href="/gravel-calculator/">Gravel</a>
          <a href="/sand-calculator/">Sand</a>
          <a href="/topsoil-calculator/">Topsoil</a>
          <a href="/mulch-calculator/">Mulch</a>
          <a href="/concrete-calculator/">Concrete</a>
          <a href="/flooring-calculator/">Flooring</a>
          <a href="/tile-calculator/">Tile</a>
        </div>
        <div class="menu-col">
          <span class="menu-col-head">Health &amp; Fitness</span>
          <a href="/pace-calculator/">Pace</a>
          <a href="/race-time-predictor/">Race Time Predictor</a>
          <a href="/heart-rate-zone-calculator/">Heart Rate Zone</a>
          <a href="/body-fat-calculator/">Body Fat</a>
          <a href="/tdee-calculator/">TDEE / Calories</a>
          <a href="/one-rep-max-calculator/">One Rep Max</a>
          <a href="/sleep-calculator/">Sleep</a>
          <span class="menu-col-head">School &amp; Grades</span>
          <a href="/final-grade-calculator/">Final Grade</a>
          <a href="/gpa-calculator/">GPA</a>
          <a href="/grade-calculator/">Grade</a>
          <a href="/test-score-calculator/">Test Score</a>
        </div>
        <div class="menu-col">
          <span class="menu-col-head">Math &amp; Numbers</span>
          <a href="/ratio-calculator/">Ratio</a>
          <a href="/percentage-calculator/">Percentage</a>
        </div>
      </div>
    </nav>
  </header>
```

Mobile menu: single column, `max-height:calc(100dvh - 70px - 40px)` (40px gap above viewport bottom), scrollable.
