/* CalcThis Paycheck — state withholding data (2026). Each entry copied from the OFFICIAL state publication named in src.
   Progressive tables are rows [floor, base, rate] on ANNUAL taxable wages: tax = base + rate*(x-floor) (same shape as IRS Pub 15-T).
   Verified-by: "pdf" = downloaded the official PDF and read the table; "web" = official web page.            Status: WORK IN PROGRESS */
var PAY_STATES = {
CA: { name:'California', src:'https://edd.ca.gov/siteassets/files/pdf_pub_ctr/26methb.pdf', eff:'2026-01-01', ver:'pdf',
  method:'ca', // annualize; low-income exempt; minus estimated deduction ($1,000/add\'l allowance) and standard deduction; table; minus $168.30 x allowances credit
  stdDed:{ single:5706, married0:5706, married2:11412, hoh:11412 },
  lowIncome:{ single:18896, married0:18896, married2:37791, hoh:37791 },
  credit:168.30, estDed:1000,
  tab:{
   single:[[0,0,.011],[11079,121.87,.022],[26264,455.94,.044],[41452,1124.21,.066],[57542,2186.15,.088],[72724,3522.17,.1023],[371479,34084.81,.1133],[445771,42502.09,.1243],[742953,79441.81,.1353],[1000000,114220.27,.1463]],
   married:[[0,0,.011],[22158,243.74,.022],[52528,911.88,.044],[82904,2248.42,.066],[115084,4372.30,.088],[145448,7044.33,.1023],[742958,68169.60,.1133],[891542,85004.17,.1243],[1000000,98485.50,.1353],[1485906,164228.58,.1463]],
   hoh:[[0,0,.011],[22173,243.90,.022],[52530,911.75,.044],[67716,1579.93,.066],[83805,2641.80,.088],[98990,3978.08,.1023],[505208,45534.18,.1133],[606251,56982.35,.1243],[1000000,105925.35,.1353],[1010417,107334.77,.1463]] } },
GA: { name:'Georgia', src:'https://dor.georgia.gov/document/document/2026-employers-tax-guide-updated-june-2026/download', eff:'2026-05-11', ver:'pdf',
  method:'flatann', rate:.0499, stdDed:{ married:30000, single:15000, hoh:15000, mfs:15000 }, dep:5000 },
NY: { name:'New York', src:'https://www.tax.ny.gov/pdf/publications/withholding/nys50_t_nys.pdf', eff:'2026-01-01', ver:'pdf',
  method:'ny', // net = wages - (deduction + 1000*exemptions); table; >= topFrom use method III flat rate on annualized net wages
  ded:{ single:7400, married:7950 }, exemption:1000,
  tab:{
   single:[[0,0,.039],[8500,332,.044],[11700,472,.0515],[13900,586,.054],[80650,4190,.059],[96800,5143,.0703],[107650,5906,.0753],[157650,9673,.064],[215400,13369,.1144],[265400,19091,.0735]],
   married:[[0,0,.039],[8500,332,.044],[11700,472,.0515],[13900,586,.054],[80650,4190,.059],[96800,5143,.0657],[107650,5855,.0707],[157650,9388,.0801],[211550,13708,.064],[323200,20854,.1349],[373200,27600,.0735],[1077550,79369,.0765]] },
  top:{ single:{from:1077550, rows:[[1077550,.1045],[5000000,.111],[25000000,.117]]}, married:{from:2155350, rows:[[2155350,.1045],[5000000,.111],[25000000,.117]]} } },
IL: { name:'Illinois', src:'https://tax.illinois.gov/forms/withholding/currentyear/il-700-t-withholding-guide-tables.html', eff:'2026-01-01', ver:'web-snippet(verify)',
  method:'flatann', rate:.0495, allow1:2925, allow2:1000 }
};
