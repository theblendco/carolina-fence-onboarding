(function(){
  "use strict";
  var KEY = "carolina-fence-demo-v1";
  var TOTAL = 10;
  var CATS = ["Wood privacy","Vinyl","Aluminum","Chain link","Pool fence","Pet fence","Other"];
  var TIMES = ["8:30 AM","10:00 AM","1:00 PM","3:30 PM"];
  var CAPS = [
    ["They tap Get a quote","A homeowner lands on the profile, taps Get a quote and tells you about their fence in one short form."],
    ["Service area check","They see right away that you cover their area."],
    ["Fence options","Good, better and best options for their fence, with no prices until the quote."],
    ["Book the quote visit","They pick a time for the free on-site visit. It lands on your calendar on its own."],
    ["Instant confirmation","An email confirms the visit and tells them what happens next."],
    ["Proposal","After the visit, a branded proposal with every term spelled out in plain words."],
    ["Contract","They read the terms first, then sign on their phone."],
    ["Deposit","They pay the deposit online with a secure payment link."],
    ["Schedule install","They pick their install week. Your crew schedule updates."],
    ["Your view (Josh)","A new job card lands in your tracker with the crew checklist started."]
  ];
  // Good / Better / Best per fence type: [fence, best for, includes]
  var OPTS = {
    "Wood privacy":[["6 ft pine privacy","Backyard privacy on a budget","Posts in concrete + 1 walk gate"],["6 ft board-on-board","Full privacy, no gaps","Cap and trim + walk gate"],["Board-on-board + upgrades","The finished look","Cap and trim, double drive gate + stain"]],
    "Vinyl":[["4 ft vinyl picket","Front yards and curb appeal","Posts in concrete + walk gate"],["6 ft vinyl privacy","Maintenance-free privacy","Walk gate + post caps"],["6 ft vinyl + lattice top","Privacy with style","Lattice top, double gate + caps"]],
    "Aluminum":[["4 ft aluminum","Open views, light security","Posts in concrete + walk gate"],["5 ft aluminum","Pets and kids","Walk gate + self-closing hinges"],["Ornamental aluminum","Curb appeal and security","Decorative tops, double gate + finials"]],
    "Chain link":[["4 ft galvanized","Simple, sturdy boundary","Posts + walk gate"],["5 ft black vinyl-coated","Cleaner look that blends in","Coated posts + walk gate"],["6 ft black chain link","Security and larger dogs","Drive gate + bottom tension wire"]],
    "Pool fence":[["4 ft aluminum pool fence","Meets pool safety code","Self-closing, self-latching gate"],["5 ft aluminum pool fence","Extra peace of mind","Code gate + puppy pickets"],["Ornamental pool enclosure","The full backyard upgrade","Code gates, decorative tops + finials"]],
    "Pet fence":[["4 ft chain link dog run","One small dog","Walk gate + dig guard"],["5 ft aluminum with puppy pickets","Small dogs that squeeze","Tight pickets + self-closing gate"],["6 ft privacy pet fence","Big dogs and jumpers","No-gap boards + locking gate"]],
    "Other":[["Full fence replacement","Old or storm-damaged fence","Tear-out, haul-away + new fence"],["Composite fence","Wood look, low upkeep","Posts in concrete + walk gate"],["Custom fence project","Something different","We design it with you on site"]]
  };
  var TIERS = ["Good","Better","Best"];
  var AREAS = [["mount pleasant","Mt. Pleasant"],["mt pleasant","Mt. Pleasant"],["daniel island","Daniel Island"],["west ashley","West Ashley"],["james island","James Island"],["johns island","Johns Island"],["north charleston","North Charleston"],["summerville","Summerville"],["goose creek","Goose Creek"],["isle of palms","Isle of Palms"],["sullivans island","Sullivan's Island"],["folly beach","Folly Beach"],["kiawah","Kiawah Island"],["hanahan","Hanahan"],["ladson","Ladson"],["moncks corner","Moncks Corner"],["park west","Park West"],["wando","Mt. Pleasant"],["downtown","Downtown Charleston"],["charleston","Charleston"]];

  // ---------- state ----------
  function fresh(){ return {step:1,name:"",cat:"",area:"",feet:"",email:"",phone:"",sig:"",agree:false,read:false,pay:"card",day:"",time:"",week:""}; }
  var state = (function(){ try{ var s = JSON.parse(localStorage.getItem(KEY)); if(s && typeof s === "object") return Object.assign(fresh(), s); }catch(e){} return fresh(); })();
  function save(){ try{ localStorage.setItem(KEY, JSON.stringify(state)); }catch(e){} }

  var $ = function(id){ return document.getElementById(id); };
  var screens = [].slice.call(document.querySelectorAll(".screen"));
  var scroller = $("screens");

  // ---------- helpers ----------
  function el(tag, cls, txt){ var e = document.createElement(tag); if(cls) e.className = cls; if(txt != null) e.textContent = txt; return e; }
  function fmtDate(d, o){ return d.toLocaleDateString("en-US", o || {month:"short", day:"numeric", year:"numeric"}); }
  function firstName(){ return state.name.trim().split(/\s+/)[0] || ""; }
  function areaName(){
    var t = state.area.toLowerCase().replace(/[.']/g, "").replace(/\s+/g, " ");
    for(var i = 0; i < AREAS.length; i++){ if(t.indexOf(AREAS[i][0]) > -1) return AREAS[i][1]; }
    var parts = state.area.split(",").map(function(x){ return x.trim(); }).filter(Boolean);
    if(parts.length > 1) return parts[parts.length - 1].replace(/\b(SC|South Carolina)\b.*$/i, "").trim() || "Charleston area";
    return parts[0] && !/\d/.test(parts[0]) ? parts[0] : "Charleston area";
  }
  function feetNum(){ var d = (state.feet || "").replace(/[^\d]/g, ""); return d ? (+d).toLocaleString("en-US") : ""; }
  function iso(d){ return d.getFullYear() + "-" + ("0"+(d.getMonth()+1)).slice(-2) + "-" + ("0"+d.getDate()).slice(-2); }
  function parseIso(v){ var a = (v||"").split("-"); return a.length === 3 ? new Date(+a[0], +a[1]-1, +a[2], 12) : null; }
  function today(){ var d = new Date(); d.setHours(12,0,0,0); return d; }

  // ---------- navigation ----------
  function go(n, opts){
    opts = opts || {};
    n = Math.max(1, Math.min(TOTAL, n));
    var rev = n < state.step;
    state.step = n; save();
    screens.forEach(function(s){
      var on = +s.dataset.step === n;
      s.classList.toggle("active", on);
      s.classList.toggle("rev", on && rev && !opts.initial);
      if(on) $("clock").textContent = s.dataset.time;
    });
    $("stepnum").textContent = "Step " + n + " of " + TOTAL;
    $("backBtn").classList.toggle("hide", n === 1);
    $("capNum").textContent = n; $("capT").textContent = CAPS[n-1][0]; $("capD").textContent = CAPS[n-1][1];
    render(n);
    scroller.scrollTop = 0;
    if(!opts.initial){ window.scrollTo(0,0); }
  }
  document.addEventListener("click", function(e){
    if(e.target.closest("[data-next]")) go(state.step + 1);
    else if(e.target.closest("[data-prev]")) go(state.step - 1);
  });
  $("backBtn").addEventListener("click", function(){ go(state.step - 1); });

  // ---------- errors ----------
  function setErr(id, msg, target){
    msg = ""; // click-through demo: no validation errors
    var p = $("e-" + id); if(p) p.textContent = msg || "";
    if(target){ target.classList.toggle("invalid", !!msg); if(target.tagName === "INPUT" || target.tagName === "TEXTAREA"){ if(msg){ target.setAttribute("aria-invalid","true"); target.setAttribute("aria-describedby","e-"+id); } else target.removeAttribute("aria-invalid"); } }
  }

  // ---------- 3 intake ----------
  var F = {name:$("f-name"), area:$("f-area"), feet:$("f-feet"), email:$("f-email"), phone:$("f-phone")};
  function digits(s){ return (s||"").replace(/\D/g,""); }
  function fmtPhone(s){
    var d = digits(s); if(d.length === 11 && d[0] === "1") d = d.slice(1); d = d.slice(0,10);
    if(d.length < 4) return d;
    if(d.length < 7) return "(" + d.slice(0,3) + ") " + d.slice(3);
    return "(" + d.slice(0,3) + ") " + d.slice(3,6) + "-" + d.slice(6);
  }
  var checks = {
    name:function(){ return state.name.trim().length < 2 ? "Add your name." : ""; },
    cat:function(){ return !state.cat ? "Pick your fence type." : ""; },
    area:function(){ return state.area.trim().length < 3 ? "Add your address or area." : ""; },
    feet:function(){ var v = state.feet.trim(); if(!v) return ""; var d = +v.replace(/[^\d]/g, ""); return (d >= 10 && d <= 20000) ? "" : "Enter a rough number, like 150."; },
    email:function(){ return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(state.email.trim()) ? "" : "Enter an email like you@company.com."; },
    phone:function(){ var d = digits(state.phone); if(d.length === 11 && d[0] === "1") d = d.slice(1); return d.length === 10 ? "" : "Enter a 10-digit phone number."; }
  };
  Object.keys(F).forEach(function(k){
    var inp = F[k];
    inp.addEventListener("input", function(){
      if(k === "phone") inp.value = fmtPhone(inp.value);
      state[k] = inp.value; save();
      if(checks[k] && inp.classList.contains("invalid")) setErr(k, checks[k](), inp);
    });
    inp.addEventListener("blur", function(){ if(checks[k] && inp.value) setErr(k, checks[k](), inp); });
  });
  function buildCats(){
    var box = $("catChips"); box.innerHTML = "";
    CATS.forEach(function(c){
      var b = el("button", "chip", c); b.type = "button"; b.setAttribute("role","radio");
      b.setAttribute("aria-checked", state.cat === c ? "true" : "false");
      b.addEventListener("click", function(){
        state.cat = c; save();
        [].forEach.call(box.children, function(x){ x.setAttribute("aria-checked", x === b ? "true" : "false"); });
        setErr("cat", "", box);
      });
      box.appendChild(b);
    });
  }
  $("intake").addEventListener("submit", function(e){
    e.preventDefault();
    var first = null;
    ["name","area","cat","feet","email","phone"].forEach(function(k){
      var m = checks[k](); setErr(k, m, k === "cat" ? $("catChips") : F[k]);
      if(m && !first) first = k;
    });
    go(2);
  });

  $("quoteBtn").addEventListener("click", function(e){ e.preventDefault(); $("intake").scrollIntoView({behavior:"smooth", block:"start"}); setTimeout(function(){ F.name.focus({preventScroll:true}); }, 400); });

  // ---------- 9 install week ----------
  function weeks(){
    var t = today(), m = new Date(t); m.setDate(t.getDate() + ((8 - t.getDay()) % 7 || 7) + 14);
    var out = []; for(var i = 0; i < 3; i++){ var a = new Date(m); a.setDate(m.getDate() + i*7); var b = new Date(a); b.setDate(a.getDate() + 4); out.push([iso(a), "Week of " + fmtDate(a, {month:"short", day:"numeric"}), fmtDate(a,{month:"short",day:"numeric"}) + " \u2013 " + fmtDate(b,{month:"short",day:"numeric"})]); }
    return out;
  }
  function buildWeeks(){
    var box = $("weeks"); box.innerHTML = "";
    var w = weeks(); if(state.week && !w.some(function(x){ return x[0] === state.week; })){ state.week = ""; save(); }
    w.forEach(function(x, i){
      var b = el("button", "slot radio" + (state.week === x[0] ? " on" : "")); b.type = "button"; b.setAttribute("role","radio"); b.setAttribute("aria-checked", state.week === x[0]);
      b.appendChild(el("span","rad")); var s = el("span","wk"); s.appendChild(el("b",null,x[1])); s.appendChild(el("br")); s.appendChild(el("small",null,"Monday to Friday")); b.appendChild(s);
      b.appendChild(el("span","tag", i === 0 ? "2 SPOTS" : "OPEN"));
      b.addEventListener("click", function(){ state.week = x[0]; save(); setErr("week",""); buildWeeks(); });
      box.appendChild(b);
    });
  }
  $("weekBtn").addEventListener("click", function(){ if(!state.week){ state.week = weeks()[0][0]; save(); } go(10); });

  // ---------- 6 pdf ----------
  $("pdfBtn").addEventListener("click", function(){ window.print(); });

  // ---------- 7 signature ----------
  var cv = $("sig"), ctx = cv.getContext("2d"), drawing = false, hasInk = !!state.sig, last = null;
  function sizeCanvas(){
    var r = cv.getBoundingClientRect(); if(!r.width) return;
    var dpr = window.devicePixelRatio || 1;
    cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.strokeStyle = "#1d1d1f"; ctx.lineWidth = 2.6;
    if(state.sig){ var img = new Image(); img.onload = function(){ ctx.drawImage(img, 0, 0, r.width, r.height); }; img.src = state.sig; }
    $("sigHint").classList.toggle("gone", hasInk);
  }
  function pt(e){ var r = cv.getBoundingClientRect(); return {x:e.clientX - r.left, y:e.clientY - r.top}; }
  cv.addEventListener("pointerdown", function(e){
    e.preventDefault(); drawing = true; last = pt(e);
    try{ cv.setPointerCapture(e.pointerId); }catch(_){}
    ctx.beginPath(); ctx.arc(last.x, last.y, 1.2, 0, Math.PI*2); ctx.fillStyle = "#1d1d1f"; ctx.fill();
    if(!hasInk){ hasInk = true; $("sigHint").classList.add("gone"); }
  });
  cv.addEventListener("pointermove", function(e){
    if(!drawing) return; e.preventDefault();
    var p = pt(e); ctx.beginPath(); ctx.moveTo(last.x, last.y);
    var mx = (last.x + p.x)/2, my = (last.y + p.y)/2;
    ctx.quadraticCurveTo(last.x, last.y, mx, my); ctx.lineTo(p.x, p.y); ctx.stroke(); last = p;
  });
  function endStroke(){ if(!drawing) return; drawing = false; state.sig = cv.toDataURL("image/png"); save(); setErr("sig", "", $("sigbox")); }
  cv.addEventListener("pointerup", endStroke); cv.addEventListener("pointercancel", endStroke); cv.addEventListener("pointerleave", endStroke);
  $("clearSig").addEventListener("click", function(){ ctx.clearRect(0,0,cv.width,cv.height); state.sig = ""; hasInk = false; save(); $("sigHint").classList.remove("gone"); });
  $("f-agree").addEventListener("change", function(){ state.agree = this.checked; save(); if(this.checked) setErr("agree",""); });
  function tab(which){
    var sign = which === "sign";
    $("tabSign").setAttribute("aria-selected", sign); $("tabReview").setAttribute("aria-selected", !sign);
    $("paneSign").hidden = !sign; $("paneReview").hidden = sign;
    if(sign) requestAnimationFrame(sizeCanvas);
  }
  $("tabSign").addEventListener("click", function(){ tab("sign"); });
  $("tabReview").addEventListener("click", function(){ tab("review"); });
  $("toSign").addEventListener("click", function(){ state.read = true; save(); tab("sign"); });
  $("signForm").addEventListener("submit", function(e){
    e.preventDefault(); var ok = true;
    if(ok) go(8);
  });
  var rt; window.addEventListener("resize", function(){ clearTimeout(rt); rt = setTimeout(function(){ if(state.step === 7 && !$("paneSign").hidden) sizeCanvas(); }, 150); });

  // ---------- 8 payment ----------
  [].forEach.call(document.querySelectorAll("#payMethod .radio"), function(b){
    b.addEventListener("click", function(){
      state.pay = b.dataset.v; save(); paintPay();
    });
  });
  function paintPay(){
    [].forEach.call(document.querySelectorAll("#payMethod .radio"), function(x){ var on = x.dataset.v === state.pay; x.classList.toggle("on", on); x.setAttribute("aria-checked", on); });
    var card = state.pay === "card";
    document.querySelector(".paydemo .achbox").hidden = card;
    [].forEach.call(document.querySelectorAll(".paydemo > .lbl, .paydemo > .in, .paydemo > .two"), function(x){ x.hidden = !card; });
  }

  // ---------- 9 calendar ----------
  var monthOffset = 0;
  function bookable(d){ var t = today(); var max = new Date(t); max.setDate(max.getDate() + 45); var w = d.getDay(); return d > t && d <= max && w !== 0 && w !== 6; }
  function firstOpenDay(){ var d = today(); for(var i = 0; i < 60; i++){ d.setDate(d.getDate() + 1); if(bookable(d)) return iso(d); } return iso(today()); }
  function buildCal(){
    var t = today(), base = new Date(t.getFullYear(), t.getMonth() + monthOffset, 1, 12);
    $("monthLbl").textContent = base.toLocaleDateString("en-US", {month:"long", year:"numeric"});
    $("prevM").disabled = monthOffset === 0; $("nextM").disabled = monthOffset >= 1;
    var g = $("cal"); g.innerHTML = "";
    ["S","M","T","W","T","F","S"].forEach(function(d){ g.appendChild(el("div","dw",d)); });
    var days = new Date(base.getFullYear(), base.getMonth()+1, 0).getDate();
    var startDn = 1;
    if(monthOffset === 0){ var ws = new Date(t); ws.setDate(t.getDate() - t.getDay() - 7); if(ws.getMonth() === t.getMonth()) startDn = ws.getDate(); }
    var lead = new Date(base.getFullYear(), base.getMonth(), startDn).getDay();
    for(var i = 0; i < lead; i++) g.appendChild(el("span","e",""));
    for(var dn = startDn; dn <= days; dn++){
      var d = new Date(base.getFullYear(), base.getMonth(), dn, 12), id = iso(d);
      if(bookable(d)){
        var b = el("button", null, dn); b.type = "button"; b.dataset.d = id;
        b.setAttribute("aria-pressed", state.day === id ? "true" : "false");
        b.setAttribute("aria-label", fmtDate(d, {weekday:"long", month:"long", day:"numeric"}));
        b.addEventListener("click", function(){ state.day = this.dataset.d; save(); setErr("day",""); buildCal(); buildSlots(); });
        g.appendChild(b);
      } else {
        var s = el("span", "x" + (iso(t) === id ? " today" : ""), dn); s.setAttribute("aria-hidden","true"); g.appendChild(s);
      }
    }
  }
  function buildSlots(){
    var d = parseIso(state.day);
    $("dayLbl").textContent = d ? fmtDate(d, {weekday:"long", month:"short", day:"numeric"}) : "Pick a day, then a time";
    var box = $("slots"); box.innerHTML = "";
    TIMES.forEach(function(t){
      var b = el("button", "slot radio" + (state.time === t ? " on" : "")); b.type = "button"; b.setAttribute("role","radio"); b.setAttribute("aria-checked", state.time === t);
      b.appendChild(el("span","rad")); b.appendChild(document.createTextNode(t));
      b.addEventListener("click", function(){ state.time = t; save(); setErr("time",""); buildSlots(); });
      box.appendChild(b);
    });
  }
  $("prevM").addEventListener("click", function(){ if(monthOffset > 0){ monthOffset--; buildCal(); } });
  $("nextM").addEventListener("click", function(){ if(monthOffset < 1){ monthOffset++; buildCal(); } });
  $("bookBtn").addEventListener("click", function(){
    var ok = true;
    if(!state.day || !bookable(parseIso(state.day))) state.day = firstOpenDay();
    if(!state.time) state.time = TIMES[0];
    save();
    if(ok) go(5);
  });

  // ---------- 10 ----------
  $("folderBtn").addEventListener("click", function(){ $("toast").hidden = false; });
  $("restart").addEventListener("click", function(){
    try{ localStorage.removeItem(KEY); }catch(e){}
    state = fresh(); hasInk = false; monthOffset = 0; hydrate();
    document.querySelectorAll(".invalid").forEach(function(x){ x.classList.remove("invalid"); });
    document.querySelectorAll(".err").forEach(function(x){ x.textContent = ""; });
    $("toast").hidden = true;
    go(1);
  });

  // ---------- per-screen fill ----------
  function render(n){
    var cat = state.cat || "Wood privacy", ar = areaName(), who = state.name.trim() || "New customer", ft = feetNum();
    if(n === 2){
      var box = $("spots"); box.innerHTML = "";
      var open = el("div","slot open"); var s1 = el("span"); s1.appendChild(el("b",null,ar)); s1.appendChild(document.createTextNode(" \u00b7 Service area")); open.appendChild(s1); open.appendChild(el("span","tag","YES")); box.appendChild(open);
      [["Free quote visits this week","AVAILABLE"],["Install dates","AVAILABLE"]].forEach(function(r){
        var row = el("div","slot open"); row.appendChild(el("span",null,r[0])); row.appendChild(el("span","tag",r[1])); box.appendChild(row);
      });
    }
    if(n === 3){
      $("leadSub").textContent = [cat, ft ? "about " + ft + " linear ft" : "", ar].filter(Boolean).join(" \u00b7 ");
      var w = $("leads"); w.innerHTML = "";
      (OPTS[cat] || OPTS.Other).forEach(function(o, i){
        var c = el("div","lead");
        var t = el("div","tier"); t.appendChild(el("b",null,TIERS[i].toUpperCase())); t.appendChild(el("span","ph","Your quote")); c.appendChild(t);
        [["FENCE",o[0]],["FOR",o[1]],["WITH",o[2]]].forEach(function(p){ var r = el("div","r"); r.appendChild(el("span","k",p[0])); r.appendChild(el("span",null,p[1])); c.appendChild(r); });
        w.appendChild(c);
      });
    }
    if(n === 4){
      if(state.day){ var dd = parseIso(state.day); if(!dd || !bookable(dd)) { state.day = ""; save(); } else { var t = today(); monthOffset = (dd.getFullYear() - t.getFullYear()) * 12 + dd.getMonth() - t.getMonth(); } }
      buildCal(); buildSlots();
    }
    if(n === 5){
      $("hiLine").textContent = firstName() ? "Hi " + firstName() + "," : "Hi there,";
      $("toLine").textContent = "to " + (firstName() || "you") + " \u00b7 just now";
      var d5 = parseIso(state.day);
      $("visitLine").textContent = d5 ? fmtDate(d5, {weekday:"long", month:"long", day:"numeric"}) + " at " + state.time : "at your visit";
    }
    if(n === 6){
      var pr = $("prepared"); pr.textContent = "";
      pr.appendChild(document.createTextNode("Prepared for " + (state.name.trim() || "you"))); pr.appendChild(el("br"));
      pr.appendChild(document.createTextNode((state.area.trim() || ar) + " \u00b7 " + fmtDate(today())));
      $("projLine").textContent = cat + (ft ? ", about " + ft + " linear ft" : "");
    }
    if(n === 7){
      $("signName").textContent = state.name.trim() || "Your name";
      $("signDate").textContent = fmtDate(today());
      $("f-agree").checked = !!state.agree;
      requestAnimationFrame(sizeCanvas);
    }
    if(n === 8) paintPay();
    if(n === 9) buildWeeks();
    if(n === 10){
      $("cBiz").textContent = who;
      $("cMeta").textContent = [cat, ft ? ft + " linear ft" : "", ar].filter(Boolean).join(" \u00b7 ");
      var wk = parseIso(state.week);
      $("cCall").textContent = wk ? "Install wk of " + fmtDate(wk, {month:"short", day:"numeric"}) : "Install week booked";
    }
  }

  function hydrate(){
    Object.keys(F).forEach(function(k){ F[k].value = state[k] || ""; });
    buildCats();
    $("f-agree").checked = !!state.agree;
    ctx.clearRect(0,0,cv.width,cv.height); $("sigHint").classList.toggle("gone", hasInk);
    tab(state.read ? "sign" : "review");
  }

  hydrate();
  go(state.step || 1, {initial:true});
})();
