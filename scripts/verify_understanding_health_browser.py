#!/usr/bin/env python3
"""Lightweight real-browser layout and interaction smoke test for learning pages.

Chrome is run locally against source files; no network requests or external
browser dependencies are required.
"""
from __future__ import annotations
from pathlib import Path
import html
import json
import re
import shutil
import subprocess
import sys

ROOT=Path(__file__).resolve().parents[1]
CHROME=shutil.which("google-chrome") or shutil.which("google-chrome-stable") or shutil.which("chromium")
PROBE=r"""
<script>
window.addEventListener("load",()=>setTimeout(()=>{
 const main=document.querySelector("main");
 const mathScroll=document.querySelector(".ulh-math-scroll");
 const term=document.querySelector(".ulh-term-list");
 const switcher=document.querySelector('[data-ulh-requirement="any"]');
 const quotientSwitcher=document.querySelector('[data-ulh-quotient="extended"]');
 const stageSwitcher=document.querySelector('[data-ulh-stage-choice="adult"]');
 const transportSwitcher=document.querySelector('[data-ulh-transport-choice="visible"]');
 const horizonSwitcher=document.querySelector('[data-ulh-support-choice="long"]');
 let supportState=null;
 if(horizonSwitcher){
  horizonSwitcher.click();
  supportState={pressed:horizonSwitcher.getAttribute("aria-pressed"),capacity:document.querySelector('[data-ulh-support-capacity="intermittent"]')?.textContent||"",status:document.querySelector('[data-ulh-support-status="intermittent"]')?.textContent||"",summary:document.querySelector("[data-ulh-support-summary]")?.textContent||""};
 }

 let transportState=null;
 if(transportSwitcher){
  transportSwitcher.click();
  transportState={pressed:transportSwitcher.getAttribute("aria-pressed"),visibleShown:document.querySelector('[data-ulh-transport-view="visible"]')?.hidden===false,rawHidden:document.querySelector('[data-ulh-transport-view="raw"]')?.hidden===true,summary:document.querySelector("[data-ulh-transport-summary]")?.textContent||""};
 }

 let stageState=null;
 if(stageSwitcher){
  stageSwitcher.click();
  stageState={pressed:stageSwitcher.getAttribute("aria-pressed"),adultVisible:document.querySelector('[data-ulh-stage-view="adult"]')?.hidden===false,newbornHidden:document.querySelector('[data-ulh-stage-view="newborn"]')?.hidden===true,summary:document.querySelector("[data-ulh-stage-summary]")?.textContent||""};
 }
 let quotientState=null;
 if(quotientSwitcher) {
  quotientSwitcher.click();
  quotientState={pressed:quotientSwitcher.getAttribute("aria-pressed"),expandedVisible:document.querySelector('[data-ulh-quotient-view="extended"]')?.hidden===false,originalHidden:document.querySelector('[data-ulh-quotient-view="base"]')?.hidden===true,explanation:document.querySelector("[data-ulh-quotient-explanation]")?.textContent||""};
 }
 let changed=null;
 if(switcher){switcher.click();changed={pressed:switcher.getAttribute("aria-pressed"),text:document.querySelector('[data-ulh-outcome="short"]')?.textContent||""};}
 const record={innerWidth:innerWidth,documentWidth:document.documentElement.scrollWidth,mainWidth:main?.getBoundingClientRect().width||0,mathScrollWidth:mathScroll?.clientWidth||0,mathFullWidth:mathScroll?.scrollWidth||0,termsWidth:term?.getBoundingClientRect().width||0,changed,quotientState,stageState,transportState,supportState,bodyText:document.body.innerText.length};
 const pre=document.createElement("pre");pre.id="ulh-layout-result";pre.textContent=JSON.stringify(record);document.body.appendChild(pre);
},160));
</script>
"""
def run(page:str,width:int)->dict:
    name=".ulh-layout-"+page.replace(".html","")+"-"+str(width)+".html"
    tmp=ROOT/name
    try:
        s=(ROOT/page).read_text(encoding="utf8")
        tmp.write_text(s.replace("</body>",PROBE+"</body>"),encoding="utf8")
        command=[CHROME,"--headless=new","--disable-gpu","--no-sandbox","--no-first-run","--disable-dev-shm-usage","--virtual-time-budget=2200",f"--window-size={width},900","--dump-dom",tmp.as_uri()]
        proc=subprocess.run(command,stdout=subprocess.PIPE,stderr=subprocess.PIPE,timeout=35,encoding="utf8",errors="replace")
        if proc.returncode!=0:raise RuntimeError("Chrome failed: "+proc.stderr[-1500:])
        m=re.search(r'<pre id="ulh-layout-result">(.*?)</pre>',proc.stdout,re.DOTALL)
        if not m:raise RuntimeError("Layout probe never ran. Browser stderr: "+proc.stderr[-1800:])
        return json.loads(html.unescape(m.group(1)))
    finally:
        tmp.unlink(missing_ok=True)

def main():
    if not CHROME:
        print("Chromium unavailable locally; static HTML/JS checks remain mandatory")
        return 0
    errors=[]
    for page in ["understanding-health.html"]+[p["slug"] for p in json.loads((ROOT/"learning"/"lessons.json").read_text(encoding="utf8"))["lessons"]]:
        for width in (430,1440):
            result=run(page,width)
            print(page,width,json.dumps(result,sort_keys=True))
            if result["innerWidth"]<=0 or result["mainWidth"]<=0 or result["bodyText"]<400:
                errors.append(page+" did not render meaningful content at "+str(width))
            if result["documentWidth"] > result["innerWidth"]+4:
                errors.append(page+" has horizontal document overflow at "+str(width))
            if page.startswith("understanding-health-") and page.endswith(".html"):
                if not result["mathScrollWidth"] or not result["termsWidth"]:
                    errors.append(page+" formal equation/glossary failed to render at "+str(width))
                if page.endswith("-07.html"):
                    support=result["supportState"]
                    if (not support or support["pressed"]!="true" or support["capacity"]!="∅" or
                        "Fails reserve requirement" not in support["status"] or
                        "long horizon" not in support["summary"].lower()):
                        errors.append(page+" horizon comparison did not update at "+str(width))
                if page.endswith("-06.html"):
                    transport=result["transportState"]
                    if not transport or transport["pressed"]!="true" or not transport["visibleShown"] or not transport["rawHidden"] or "quotient" not in transport["summary"].lower():
                        errors.append(page+" health-visible transport selector failed at "+str(width))
                if page.endswith("-05.html"):
                    stage=result["stageState"]
                    if not stage or stage["pressed"]!="true" or not stage["adultVisible"] or not stage["newbornHidden"] or "capacities have not changed" not in stage["summary"]:
                        errors.append(page+" stage licensing controls did not respond at "+str(width))
                if page.endswith("-03.html"):
                    quotient=result["quotientState"]
                    if not quotient or quotient["pressed"]!="true" or not quotient["expandedVisible"] or not quotient["originalHidden"] or "four subsets" not in quotient["explanation"].lower():
                        errors.append(page+" expanded quotient grouping didn't respond to the new requirement at "+str(width))
                if page.endswith("-01.html"):
                    change=result["changed"]
                    if not change or change["pressed"]!="true" or "Meets the any-response" not in change["text"]:
                        errors.append(page+" requirement selector did not update at "+str(width))
    if errors:
        print("Browser layout QA failed",file=sys.stderr)
        for err in errors:print(" - "+err,file=sys.stderr)
        return 1
    print("Chrome layout QA passed for all published chapters at phone and desktop widths")
    return 0

if __name__=="__main__":
    raise SystemExit(main())
