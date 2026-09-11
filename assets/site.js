(function(){
  "use strict";
  // ---- 1. expandable source from raw.githubusercontent ----
  document.addEventListener("click", async function(e){
    var b = e.target.closest(".expand"); if(!b) return;
    var ev = b.closest(".ev"); var open = ev.querySelector(".ev-more");
    if(open){ open.remove(); b.textContent="전체 맥락"; return; }
    b.textContent="불러오는 중…"; b.disabled = true;
    var repo=b.dataset.repo, path=b.dataset.path,
        s=parseInt(b.dataset.start,10), t=parseInt(b.dataset.end,10)||s;
    var box=document.createElement("div"); box.className="ev-more";
    try{
      var url="https://raw.githubusercontent.com/jiunbae/"+repo+"/HEAD/"+path
              .split("/").map(encodeURIComponent).join("/");
      var res=await fetch(url); if(!res.ok) throw new Error("HTTP "+res.status);
      var lines=(await res.text()).split("\n");
      var from=Math.max(1,s-15), to=Math.min(lines.length,t+15);
      var pre=document.createElement("pre");
      for(var i=from;i<=to;i++){
        var row=document.createElement(i>=s&&i<=t?"mark":"span");
        var n=document.createElement("span"); n.className="ln"; n.textContent=i;
        row.appendChild(n); row.appendChild(document.createTextNode(lines[i-1]+"\n"));
        pre.appendChild(row);
      }
      box.appendChild(pre);
    }catch(err){
      var d=document.createElement("div"); d.className="err";
      d.textContent="원본을 불러오지 못했습니다 ("+err.message+"). 위 파일명을 눌러 GitHub에서 확인하세요.";
      box.appendChild(d);
    }
    ev.appendChild(box); b.textContent="접기"; b.disabled=false;
  });

  // ---- 2. severity filter on report pages ----
  var findings = document.querySelectorAll(".finding[data-sev]");
  if(findings.length > 2){
    var counts={critical:0,major:0,minor:0};
    findings.forEach(function(f){ var k=f.dataset.sev; if(k in counts) counts[k]++; });
    var host = document.querySelector("section");
    if(host){
      var bar=document.createElement("div"); bar.className="filters";
      bar.innerHTML='<span class="lbl">심각도</span>';
      [["all","전체",findings.length],["critical","치명적",counts.critical],
       ["major","중대",counts.major],["minor","경미",counts.minor]].forEach(function(o){
        if(o[0]!=="all" && !o[2]) return;
        var btn=document.createElement("button");
        btn.type="button"; btn.dataset.sev=o[0];
        btn.setAttribute("aria-pressed", o[0]==="all");
        btn.textContent=o[1]+" "+o[2];
        bar.appendChild(btn);
      });
      host.parentNode.insertBefore(bar, host);
      bar.addEventListener("click", function(e){
        var b=e.target.closest("button"); if(!b) return;
        bar.querySelectorAll("button").forEach(function(x){
          x.setAttribute("aria-pressed", x===b); });
        var want=b.dataset.sev;
        findings.forEach(function(f){
          f.hidden = (want!=="all" && f.dataset.sev!==want); });
      });
    }
  }

  // ---- 3. index: grade / year filter ----
  var rows=document.querySelectorAll(".row");
  if(rows.length>4 && document.querySelector(".yr")){
    var grades=[...new Set([...rows].map(function(r){
      var g=r.querySelector(".rg"); return g?g.textContent.trim():""; }))].filter(Boolean).sort();
    var sec=document.querySelector(".yr").parentNode;
    var bar=document.createElement("div"); bar.className="filters";
    bar.innerHTML='<span class="lbl">등급</span>';
    [["all","전체"]].concat(grades.map(function(g){return [g,g];})).forEach(function(o){
      var b=document.createElement("button"); b.type="button"; b.dataset.g=o[0];
      b.setAttribute("aria-pressed", o[0]==="all"); b.textContent=o[1];
      bar.appendChild(b);
    });
    sec.insertBefore(bar, document.querySelector(".yr"));
    bar.addEventListener("click", function(e){
      var b=e.target.closest("button"); if(!b) return;
      bar.querySelectorAll("button").forEach(function(x){ x.setAttribute("aria-pressed", x===b); });
      var want=b.dataset.g;
      rows.forEach(function(r){
        var g=r.querySelector(".rg"); var m = want==="all" || (g && g.textContent.trim()===want);
        r.style.display = m ? "" : "none";
      });
      document.querySelectorAll(".yr").forEach(function(y){
        var n=0, el=y.nextElementSibling;
        while(el && el.classList.contains("row")){ if(el.style.display!=="none") n++; el=el.nextElementSibling; }
        y.style.display = n ? "" : "none";
      });
    });
  }
})();
