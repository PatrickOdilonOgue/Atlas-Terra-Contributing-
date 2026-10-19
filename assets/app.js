// Terra: data in data/*.json, texts in i18n/<lang>.json
const LANGS=["fr","en","de","zh","ru"],TABS=["map","places","continents","maps","3d","api","space","kids"];
const $=s=>document.querySelector(s),j=u=>fetch(u).then(r=>r.json());
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
let P,C,RS,T,lang,tab="map",grp="all",q="",map,mg,issM,cur;
const CG={"002":"af","142":"as","150":"eu","003":"na","005":"sa","009":"oc","AQ":"an"};
const dn=(t,v)=>{try{return new Intl.DisplayNames([lang],{type:t}).of(v)||v}catch(e){return v}};
const nf=(n,d=1)=>n.toLocaleString(lang,{maximumFractionDigits:d});
const gname=g=>T.groups[g]||g;
const pname=p=>{const n=p.iso?dn("region",p.iso.toUpperCase()):null;return n&&n!==p.iso.toUpperCase()?n:(p.name[lang]||p.name.en)};
const fact=p=>p.fact[lang]||p.fact.en;
const desc=r=>r.desc[lang]||r.desc.en;
const clat=v=>Math.max(-85,Math.min(85,v));
const links=p=>[["OpenStreetMap",`https://www.openstreetmap.org/#map=9/${p.lat}/${p.lon}`],["NASA Worldview",`https://worldview.earthdata.nasa.gov/?v=${p.lon-6},${clat(p.lat-4)},${p.lon+6},${clat(p.lat+4)}`],["EO Browser",`https://apps.sentinel-hub.com/eo-browser/?zoom=9&lat=${p.lat}&lng=${p.lon}`],["earth.nullschool",`https://earth.nullschool.net/#current/wind/surface/level/orthographic=${p.lon},${p.lat},3000`]];
const lkHtml=p=>`<div class="lk">${T.openin}: ${links(p).map(([n,u])=>`<a target="_blank" rel="noopener" href="${u}">${n}</a>`).join("")}</div>`;

async function init(){
  [P,C,RS]=await Promise.all([j("data/places.json"),j("data/continents.json"),j("data/resources.json")]);
  const sel=$("#lang");LANGS.forEach(l=>sel.append(new Option(l.toUpperCase(),l)));
  sel.onchange=()=>setLang(sel.value);
  const u=new URLSearchParams(location.search).get("lang");
  await setLang([u,localStorage.getItem("lang"),(navigator.language||"en").slice(0,2)].find(l=>LANGS.includes(l))||"en");
  setInterval(updIss,10000);updIss();
}
async function setLang(l){
  lang=l;$("#lang").value=l;localStorage.setItem("lang",l);
  T=await j(`i18n/${l}.json`);document.documentElement.lang=l;
  $("#sub").textContent=T.sub;$("#foot").textContent=T.foot;
  $("#tabs").innerHTML="";TABS.forEach(t=>{const b=document.createElement("button");b.textContent=T.tabs[t];b.dataset.t=t;b.onclick=()=>showTab(t);$("#tabs").append(b)});
  renderPlaces();renderContinents();["maps","3d","api","space"].forEach(renderRes);renderKids();
  if(map)drawMarkers();
  showTab(tab);
}
function showTab(t){
  tab=t;TABS.forEach(x=>$("#t-"+x).hidden=x!==t);
  [...$("#tabs").children].forEach(b=>b.classList.toggle("on",b.dataset.t===t));
  if(t==="map"){initMap();setTimeout(()=>map.invalidateSize(),50)}
}
function initMap(){
  if(map)return;
  map=L.map("map",{worldCopyJump:true}).setView([15,10],2);
  const d=new Date(Date.now()-2*864e5).toISOString().slice(0,10);
  const osm=L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:"© OpenStreetMap contributors"}).addTo(map);
  const topo=L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",{maxZoom:17,attribution:"© OpenTopoMap (CC-BY-SA), © OpenStreetMap contributors"});
  const sat=L.tileLayer(`https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/${d}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`,{maxNativeZoom:9,maxZoom:12,attribution:"NASA GIBS / MODIS Terra"});
  L.control.layers({[T.layers.osm]:osm,[T.layers.topo]:topo,[T.layers.sat]:sat}).addTo(map);
  mg=L.layerGroup().addTo(map);drawMarkers();updIss();
}
function drawMarkers(){
  mg.clearLayers();
  P.forEach(p=>L.circleMarker([p.lat,p.lon],{radius:7,color:"#c2571a",weight:2,fillOpacity:.75}).bindTooltip(esc(pname(p))).on("click",()=>show(p)).addTo(mg));
}
async function show(p){
  $("#info").innerHTML=`<h2>${esc(pname(p))}</h2><div class="sub">${gname(p.g)} · ${T.coords}: ${p.lat}°, ${p.lon}°</div><p>${esc(fact(p))}</p><div id="wx" class="sub">${T.weather}: …</div>${lkHtml(p)}`;
  map.flyTo([p.lat,p.lon],Math.max(map.getZoom(),5));
  try{const r=await j(`https://api.open-meteo.com/v1/forecast?latitude=${p.lat}&longitude=${p.lon}&current=temperature_2m,wind_speed_10m`);
    const c=r.current;$("#wx").textContent=`${T.weather}: ${c.temperature_2m} °C · ${c.wind_speed_10m} km/h`}catch(e){$("#wx").textContent=""}
}
async function updIss(){
  try{const r=await j("https://api.wheretheiss.at/v1/satellites/25544");
    const t=`🛰️ ${T.iss}: ${r.latitude.toFixed(2)}°, ${r.longitude.toFixed(2)}° · ${Math.round(r.altitude)} km`;
    const el=$("#issinfo");if(el)el.textContent=t;
    if(map){if(!issM)issM=L.circleMarker([0,0],{radius:9,color:"#d33",fillOpacity:.9}).bindTooltip("ISS").addTo(map);issM.setLatLng([r.latitude,r.longitude])}
  }catch(e){}
}
function placeCard(p){
  const e=document.createElement("article");e.className="c";
  e.innerHTML=`<div class="bd"><div><h3>${esc(pname(p))}</h3><div class="sub">${gname(p.g)} · ${p.lat}°, ${p.lon}°</div></div><div class="tip">${esc(fact(p))}</div>${lkHtml(p)}<a href="#" class="go">🗺️ ${T.seemap}</a></div>`;
  e.querySelector(".go").onclick=ev=>{ev.preventDefault();showTab("map");map.flyTo([p.lat,p.lon],6);show(p)};
  return e;
}
function renderPlaces(){
  const s=$("#t-places"),gs=["all",...new Set(P.map(p=>p.g))];
  s.innerHTML=`<div class="f" id="gf"></div><input id="q" placeholder="${esc(T.search)}" value="${esc(q)}"> <button class="btn" id="csv">${T.csv}</button> <a class="btn" href="data/places.json" target="_blank">${T.json}</a><div class="grid" id="pg" style="margin-top:14px"></div>`;
  gs.forEach(g=>{const b=document.createElement("button");b.textContent=g==="all"?T.all:gname(g);b.className=g===grp?"on":"";b.onclick=()=>{grp=g;renderPlaces()};$("#gf").append(b)});
  $("#q").oninput=e=>{q=e.target.value.toLowerCase();fillPlaces()};
  $("#csv").onclick=()=>{const rows=[["id","group","name_en","lat","lon","fact_en"],...P.map(p=>[p.id,p.g,p.name.en,p.lat,p.lon,p.fact.en])];
    const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n")],{type:"text/csv"}));a.download="terra-places.csv";a.click()};
  fillPlaces();
}
function fillPlaces(){const g=$("#pg");g.innerHTML="";P.filter(p=>(grp==="all"||p.g===grp)&&(pname(p)+p.name.en).toLowerCase().includes(q)).forEach(p=>g.append(placeCard(p)))}
function renderContinents(){
  $("#t-continents").innerHTML=`<div class="grid">${C.map(c=>`<article class="c"><div class="bd"><div class="em">${c.emoji}</div><h3>${esc(gname(CG[c.code]))}</h3>
  <div class="g"><div><small>${T.area}</small>${nf(c.area)} ${T.mil}</div><div><small>${T.countries}</small>${c.countries}</div>
  <div><small>${T.pop}</small>${c.pop==null?T.seasonal:"~"+nf(c.pop,2)+" "+T.bn}</div><div></div>
  <div><small>${T.high}</small>${esc(c.high[0])}<br>${nf(c.high[1],0)} m</div><div><small>${T.low}</small>${esc(c.low[0])}<br>${nf(c.low[1],0)} m</div></div></div></article>`).join("")}</div>`;
}
function resCards(tabk){return `<div class="grid">${RS.filter(r=>r.tab===tabk).map(r=>`<article class="c"><div class="bd"><h3><a target="_blank" rel="noopener" href="${r.url}">${esc(r.name)} ↗</a></h3><span class="badge">${T.lic}: ${esc(r.license)}</span><div class="sub">${esc(desc(r))}</div></div></article>`).join("")}</div>`}
function renderRes(t){
  let h=resCards(t);
  if(t==="api")h+=`<p class="s">Open-Meteo, JavaScript</p><pre class="tip">fetch("https://api.open-meteo.com/v1/forecast?latitude=-25.07&amp;longitude=-130.1&amp;current=temperature_2m")\n  .then(r =&gt; r.json()).then(d =&gt; console.log(d.current.temperature_2m));</pre>`;
  if(t==="space")h=`<div class="info" id="issinfo">🛰️ …</div><p></p>`+h;
  $("#t-"+t).innerHTML=h;
}
function renderKids(){
  $("#t-kids").innerHTML=`<div class="info" id="clue"></div><p class="s">NASA</p>${resCards("kids")}<p class="s">${T.family}</p>${resCards("family")}`;
  mystery();
}
function mystery(){
  cur=P[Math.random()*P.length|0];
  $("#clue").innerHTML=`<h2>🔎 ${T.mys}</h2><p class="sub">${T.mysIntro}</p><p>❓ ${esc(fact(cur))}</p><button class="btn" id="rv">${T.reveal}</button> <button class="btn" id="nx">${T.next}</button><div id="ans"></div>`;
  $("#nx").onclick=mystery;
  $("#rv").onclick=()=>{$("#ans").innerHTML=`<h3>${esc(pname(cur))} <span class="sub">(${gname(cur.g)})</span></h3><a href="#" id="go">🗺️ ${T.seemap}</a>`;
    $("#go").onclick=e=>{e.preventDefault();showTab("map");map.flyTo([cur.lat,cur.lon],6);show(cur)}};
}
init();
