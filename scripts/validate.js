// Usage: node scripts/validate.js [--links]   (--links checks that every resource URL answers; needs Node 18+)
const fs=require("fs"),rd=f=>JSON.parse(fs.readFileSync(f));
const P=rd("data/places.json"),R=rd("data/resources.json"),C=rd("data/continents.json");
let err=0;const bad=m=>{console.error("ERROR:",m);err++};
const G=["an","eu","na","sa","oc","as","af","atl","ind"],TABS=["maps","3d","api","space","kids","family"];
const ids=new Set();
P.forEach(p=>{if(ids.has(p.id))bad("duplicate id "+p.id);ids.add(p.id);
 if(!G.includes(p.g))bad(p.id+": unknown group");
 if(!(p.lat>=-90&&p.lat<=90&&p.lon>=-180&&p.lon<=180))bad(p.id+": bad coordinates");
 if(!p.name?.en||!p.name?.fr||!p.fact?.en||!p.fact?.fr)bad(p.id+": missing name/fact (fr and en required)")});
R.forEach(r=>{if(!TABS.includes(r.tab))bad(r.name+": unknown tab");if(!/^https:\/\//.test(r.url))bad(r.name+": URL must be https");if(!r.desc?.en||!r.license)bad(r.name+": missing desc.en or license")});
C.forEach(c=>{if(!c.code||!c.high||!c.low)bad("continent "+c.code+" incomplete")});
for(const l of ["fr","en","de","zh","ru"]){const T=rd(`i18n/${l}.json`),E=rd("i18n/en.json");
 const miss=Object.keys(E).filter(k=>!(k in T));if(miss.length)bad(`${l}.json missing keys: ${miss.join(", ")}`)}
console.log(`${P.length} places, ${R.length} resources, ${C.length} continents`);
(async()=>{
 if(process.argv.includes("--links"))for(const r of R){try{const x=await fetch(r.url,{method:"GET",redirect:"follow",signal:AbortSignal.timeout(15000)});console.log(x.ok?"OK  ":"FAIL",x.status,r.url);if(!x.ok)err++}catch(e){console.log("FAIL",r.url,e.message);err++}}
 process.exit(err?1:0)})();
