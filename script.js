(function(){
"use strict";
/* ===== CONFIG: replace these before launch ===== */
var CONFIG={
 freePerDay:2, adBonus:3, adSeconds:10,
 checkoutUrl:"https://paystack.shop/pay/m5nes--rav",
 demoKeys:["SLIMLY-DEMO"],                     // REMOVE: validate keys on your server instead
 verifyKey:null,                               // function(key){return Promise<boolean>} calling your backend
 showRewardedAd:null                           // function(done){...} call done() after a real rewarded ad (AdMob/AdSense H5)
};
var $=function(i){return document.getElementById(i)};
var mem={};
function ls(k,v){try{if(v===undefined){var r=localStorage.getItem(k);return r?JSON.parse(r):mem[k]||null}localStorage.setItem(k,JSON.stringify(v))}catch(e){if(v===undefined)return mem[k]||null;mem[k]=v}}

/* routing */
var views=["home","how","uses","pricing","faq","about","contact","privacy","terms","cookies"];
function route(){var h=(location.hash||"#home").slice(1);if(views.indexOf(h)<0)h="home";
views.forEach(function(v){$(v).classList.toggle("on",v===h)});
document.querySelectorAll("nav a").forEach(function(a){a.classList.toggle("on",a.getAttribute("href")==="#"+h)});
window.scrollTo(0,0)}
window.addEventListener("hashchange",route);route();
$("sub").href=CONFIG.checkoutUrl;

var menuToggle=$("menuToggle"),mainNav=$("mainNav"),menuBackdrop=$("menuBackdrop"),menuClose=$("menuClose");
function closeMobileMenu(){
 if(!mainNav||!menuToggle)return;
 mainNav.classList.remove("open");
 document.body.classList.remove("menu-open");
 menuToggle.setAttribute("aria-expanded","false");
 menuToggle.setAttribute("aria-label","Open navigation menu");
 if(menuBackdrop){menuBackdrop.hidden=true}
}
if(menuToggle&&mainNav){
 menuToggle.onclick=function(){
  var open=!mainNav.classList.contains("open");
  mainNav.classList.toggle("open",open);
  document.body.classList.toggle("menu-open",open);
  menuToggle.setAttribute("aria-expanded",open?"true":"false");
  menuToggle.setAttribute("aria-label",open?"Close navigation menu":"Open navigation menu");
  if(menuBackdrop){menuBackdrop.hidden=!open}
 };
 mainNav.querySelectorAll("a").forEach(function(link){link.onclick=closeMobileMenu});
 if(menuClose){menuClose.onclick=closeMobileMenu}
 if(menuBackdrop){menuBackdrop.onclick=closeMobileMenu}
 document.addEventListener("keydown",function(event){
  if(event.key==="Escape"&&mainNav.classList.contains("open")){closeMobileMenu();menuToggle.focus()}
 });
 window.addEventListener("resize",function(){if(window.innerWidth>760)closeMobileMenu()});
}

/* cookies and ads */
function consent(){return ls("sl_ck")}
function showCk(){$("ck").style.display="block"}
if(!consent())showCk();
$("ca").onclick=function(){ls("sl_ck","all");$("ck").style.display="none";loadAds()};
$("cd").onclick=function(){ls("sl_ck","essential");$("ck").style.display="none"};
$("reset").onclick=$("cs2").onclick=function(){showCk()};
function loadAds(){/* After consent, load AdSense here:
 var s=document.createElement("script");s.async=true;s.src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXX";document.head.appendChild(s);
 (Note: hosted preview pages block this host; use it on your own domain.) */}
if(consent()==="all")loadAds();

/* quota and plan */
var today=function(){return new Date().toISOString().slice(0,10)};
function Q(){var s=ls("sl_q");if(!s||s.d!==today())s={d:today(),n:0,b:0};return s}
function isPro(){return !!ls("sl_pro")}
function allowed(){var s=Q();return isPro()||s.n<CONFIG.freePerDay+s.b}
function useOne(){var s=Q();s.n++;ls("sl_q",s)}
function drawQuota(){var s=Q(),left=Math.max(0,CONFIG.freePerDay+s.b-s.n);
$("quota").textContent=isPro()?"Pro: unlimited":"Free compressions left today: "+left;
document.querySelectorAll("[data-ad]").forEach(function(a){a.style.display=isPro()?"none":"flex"})}
drawQuota();

var gate=$("gate");
function openGate(){$("adbox").hidden=true;gate.showModal()}
$("gx").onclick=function(){gate.close()};
$("topro").onclick=function(){gate.close()};
$("watch").onclick=function(){
function grant(){var s=Q();s.b+=CONFIG.adBonus;ls("sl_q",s);drawQuota();gate.close();sync()}
if(typeof CONFIG.showRewardedAd==="function"){CONFIG.showRewardedAd(grant);return}
var box=$("adbox"),t=CONFIG.adSeconds;box.hidden=false;$("watch").disabled=true;
var iv=setInterval(function(){box.textContent="Ad playing (demo)… "+t+"s";if(t--<=0){clearInterval(iv);$("watch").disabled=false;grant()}},1000);
box.textContent="Ad playing (demo)… "+t+"s"};
var kd=$("keyd");
$("havekey").onclick=function(){$("keymsg").textContent="";kd.showModal()};
$("keyx").onclick=function(){kd.close()};
$("keyok").onclick=function(){var k=$("keyin").value.trim();
var p=CONFIG.verifyKey?CONFIG.verifyKey(k):Promise.resolve(CONFIG.demoKeys.indexOf(k)>-1);
p.then(function(ok){if(ok){ls("sl_pro",k);drawQuota();kd.close();sync()}else $("keymsg").textContent="That key isn’t valid."})};

/* contact */
$("cs").onclick=function(){location.href="mailto:support@yourdomain.com?subject="+encodeURIComponent("Slimly message")+"&body="+encodeURIComponent($("cm").value+"\n\nFrom: "+$("ce").value)};

/* tool */
var items=[],busy=false;
var MAXS=[0,4096,3840,2560,2048,1920,1600,1280,1024];
function fmtB(n){return n<1024?n+" B":n<1048576?(n/1024).toFixed(1)+" KB":(n/1048576).toFixed(2)+" MB"}
$("max").oninput=function(){var v=MAXS[this.value];$("maxo").textContent=v?v+" px":"Original"};
$("br").oninput=function(){$("bro").textContent=(this.value/2)+" Mbps"};
$("mode").onchange=function(){if(this.value!=="lossless"&&$("fmt").value==="image/png")$("fmt").value="auto"};
var presetRules={
 whatsapp:{mode:"bal",fmt:"image/jpeg",max:5,target:500,br:8},
 email:{mode:"vis",fmt:"image/jpeg",max:6,target:1024,br:6},
 web:{mode:"bal",fmt:"image/webp",max:7,target:500,br:4},
 application:{mode:"vis",fmt:"auto",max:6,target:100,br:4}
};
$("preset").onchange=function(){
 var r=presetRules[this.value];if(!r)return;
 $("mode").value=r.mode;$("fmt").value=r.fmt;$("max").value=r.max;$("br").value=r.br;
 $("target").value=String(r.target);$("customTargetWrap").hidden=true;
 $("max").oninput();$("br").oninput();
};
$("target").onchange=function(){$("customTargetWrap").hidden=this.value!=="-1"};
function targetBytes(){var v=$("target").value;if(v==="0")return 0;if(v==="-1")v=$("customTarget").value;return Math.max(0,Number(v)*1024)}
var drop=$("drop");
["dragenter","dragover"].forEach(function(e){drop.addEventListener(e,function(x){x.preventDefault();drop.classList.add("over")})});
["dragleave","drop"].forEach(function(e){drop.addEventListener(e,function(x){x.preventDefault();drop.classList.remove("over")})});
drop.addEventListener("drop",function(x){add(x.dataTransfer.files)});
$("file").onchange=function(){add(this.files);this.value=""};
function add(fl){Array.prototype.forEach.call(fl,function(f){
var kind=f.type.indexOf("image/")===0?"img":f.type.indexOf("video/")===0?"vid":null;if(!kind)return;
var it={f:f,kind:kind,url:URL.createObjectURL(f),out:null,state:"ready"};it.el=row(it);items.push(it);$("list").appendChild(it.el)});sync()}
function row(it){var d=document.createElement("div");d.className="row";
var th=document.createElement(it.kind==="img"?"img":"video");th.className="th";th.src=it.url;th.alt="";if(it.kind==="vid"){th.muted=true;th.preload="metadata"}
var mid=document.createElement("div");mid.innerHTML='<div class="nm"></div><div class="meta"></div><progress max="1" hidden></progress>';mid.firstChild.textContent=it.f.name;
var a=document.createElement("div");a.className="acts";
var dl=document.createElement("button");dl.textContent="Download";dl.hidden=true;dl.onclick=function(){if(it.out)save(it)};
var rm=document.createElement("button");rm.textContent="Remove";rm.onclick=function(){if(busy)return;URL.revokeObjectURL(it.url);items.splice(items.indexOf(it),1);d.remove();sync()};
var compare=document.createElement("button");compare.textContent="Compare";compare.hidden=true;compare.onclick=function(){openCompare(it)};
a.appendChild(dl);a.appendChild(compare);a.appendChild(rm);d.appendChild(th);d.appendChild(mid);d.appendChild(a);
it.meta=mid.children[1];it.prog=mid.children[2];it.dl=dl;it.meta.textContent=fmtB(it.f.size)+" · "+(it.kind==="img"?"image":"video");return d}
function sync(){var ready=items.some(function(i){return i.state==="ready"}),hasOutput=items.some(function(i){return i.out&&i.state==="done"});
$("go").disabled=busy||!ready;$("clear").disabled=busy||!items.length;$("zip").disabled=busy||!hasOutput}
$("clear").onclick=function(){items.forEach(function(i){URL.revokeObjectURL(i.url)});items=[];$("list").innerHTML="";sync()};
$("go").onclick=async function(){busy=true;sync();
for(var i=0;i<items.length;i++){var it=items[i];if(it.state!=="ready")continue;
if(!allowed()){openGate();break}
useOne();drawQuota();it.state="working";it.prog.hidden=false;it.prog.removeAttribute("value");
try{it.out=it.kind==="img"?await shrinkImg(it):await shrinkVid(it)}catch(e){it.err=e}
it.prog.hidden=true;finish(it)}
busy=false;sync()};
function finish(it){it.state="done";it.meta.innerHTML="";var s=document.createElement("span");
if(it.err||!it.out){s.className="sav n";s.textContent="Couldn’t process this file. Try another format or setting.";it.meta.appendChild(s);return}
var o=it.f.size,n=it.out.size,ok=n<o;it.meta.appendChild(document.createTextNode(fmtB(o)+" → "+fmtB(n)+"  "));
s.className="sav"+(ok?"":" n");s.textContent=ok?"−"+Math.round((1-n/o)*100)+"%":"Already compact. Original kept.";it.meta.appendChild(s);
var rec=document.createElement("div");rec.className="recommendation";
if(it.kind==="img"){
var ext=it.out.type.indexOf("webp")>-1?"WebP":it.out.type.indexOf("jpeg")>-1?"JPEG":"PNG";
rec.textContent="Recommended format: "+ext+" · Best for "+(/png|image\/png/.test(it.f.type)?"graphics & text":/jpe?g/.test(it.f.type)?"photos":"web & general use");
}else rec.textContent="Recommended: re-encoded WebM · Video uses browser-side VP8/VP9";
it.meta.appendChild(rec);
if(!ok)it.out=null;it.dl.hidden=!ok;
var compareButton=it.el&&it.el.querySelector?it.el.querySelectorAll(".acts button")[1]:null;if(compareButton)compareButton.hidden=!ok||it.kind!=="img";
sync()}
function save(it){var t=it.out.type,e=t.indexOf("webp")>0?"webp":t.indexOf("jpeg")>0?"jpg":t.indexOf("png")>0?"png":"webm";
var a=document.createElement("a");a.href=URL.createObjectURL(it.out);a.download=outName(it,e);document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(a.href)},4000)}
function outName(it,e){return it.f.name.replace(/\.[^.]+$/,"")+"-slimly."+e}
function openCompare(it){
 if(!it.out||it.kind!=="img")return;
 $("compareOriginal").src=it.url;
 $("compareOutput").src=URL.createObjectURL(it.out);
 $("compareMeta").textContent=fmtB(it.f.size)+" original → "+fmtB(it.out.size)+" compressed";
 $("compareRange").value=50;$("compareOutput").style.clipPath="inset(0 50% 0 0)";
 $("compareDivider").style.left="50%";
 $("compare").showModal();
}
$("compareRange").oninput=function(){
 var split=Number(this.value);
 $("compareOutput").style.clipPath="inset(0 "+(100-split)+"% 0 0)";
 $("compareDivider").style.left=split+"%";
};
$("compareClose").onclick=function(){$("compare").close()};
$("zip").onclick=async function(){
 if(typeof JSZip==="undefined"){items.filter(function(i){return i.out}).forEach(save);return}
 var zip=new JSZip();
 items.forEach(function(i){
  if(!i.out)return;
  var t=i.out.type,e=t.indexOf("webp")>-1?"webp":t.indexOf("jpeg")>-1?"jpg":t.indexOf("png")>-1?"png":"webm";
  zip.file(outName(i,e),i.out);
 });
 var blob=await zip.generateAsync({type:"blob"});
 var a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="slimly-compressed-files.zip";document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(a.href)},4000);
};
function toBlob(c,t,q){return new Promise(function(r){c.toBlob(r,t,q)})}
async function shrinkImg(it){var b=await createImageBitmap(it.f),lim=MAXS[$("max").value],w=b.width,h=b.height;
if(lim&&Math.max(w,h)>lim){var s=lim/Math.max(w,h);w=Math.round(w*s);h=Math.round(h*s)}
var c=document.createElement("canvas");c.width=w;c.height=h;var x=c.getContext("2d");x.imageSmoothingQuality="high";
var mode=$("mode").value,fmt=$("fmt").value;
if(fmt==="auto")fmt=mode==="lossless"&&!/jpe?g/.test(it.f.type)?"image/webp":mode==="lossless"?"image/png":"image/webp";
if(mode!=="lossless"&&fmt==="image/png")fmt="image/webp";
var target=targetBytes(),cs=[],qualities=mode==="lossless"?[1]:mode==="vis"?[.92,.82,.72,.62,.52,.42]:[.8,.68,.56,.44,.32,.22];
var scales=target?[1,.85,.7,.55]:[1];
for(var si=0;si<scales.length;si++){var sw=Math.round(w*scales[si]),sh=Math.round(h*scales[si]);c.width=sw;c.height=sh;
if(fmt==="image/jpeg"){x.fillStyle="#fff";x.fillRect(0,0,sw,sh)}x.drawImage(b,0,0,sw,sh);
for(var qi=0;qi<qualities.length;qi++){var q=qualities[qi],m=await toBlob(c,fmt,fmt==="image/png"?undefined:q);if(m&&m.type===fmt)cs.push(m)}
if(target&&cs.some(function(v){return v.size<=target}))break}
if(!cs.length)throw new Error("encode");
cs.sort(function(a,b){return a.size-b.size});
if(target){var fits=cs.filter(function(v){return v.size<=target&&v.size<it.f.size});if(fits.length)return fits[0]}
return cs[0]}
function downloadBlob(blob,name){
 var a=document.createElement("a");
 a.href=URL.createObjectURL(blob);
 a.download=name;
 document.body.appendChild(a);
 a.click();
 a.remove();
 setTimeout(function(){URL.revokeObjectURL(a.href)},4000);
}
var brandAsset=$("brandAsset"),brandFormat=$("brandFormat"),brandDownload=$("brandDownload"),brandStatus=$("brandStatus");
function updateBrandExport(){
 var isMark=brandAsset.value==="slimly-mark";
 var format=brandFormat.value;
 brandDownload.textContent=format==="svg"?"Download SVG":format==="png"?"Download PNG":"Download JPEG";
 document.querySelector(".brand-export>img").src=brandAsset.value+".svg";
 brandStatus.textContent=isMark?"App and social mark · 1024 × 1024 px":"Full logo · 2400 × 640 px";
}
if(brandAsset&&brandFormat){
 brandAsset.onchange=updateBrandExport;
 brandFormat.onchange=updateBrandExport;
 updateBrandExport();
 brandDownload.onclick=async function(){
  var asset=brandAsset.value,format=brandFormat.value;
  brandDownload.disabled=true;
  brandStatus.textContent="Preparing download…";
  try{
   var svgResponse=await fetch(asset+".svg");
   if(!svgResponse.ok)throw new Error("Logo file could not be loaded.");
   var svgBlob=await svgResponse.blob();
   if(format==="svg"){
    downloadBlob(svgBlob,asset+"."+format);
   }else{
    var svgUrl=URL.createObjectURL(svgBlob);
    var image=new Image();
    await new Promise(function(resolve,reject){image.onload=resolve;image.onerror=function(){reject(new Error("Logo could not be rendered."))};image.src=svgUrl});
    var isMark=asset==="slimly-mark";
    var canvas=document.createElement("canvas");
    canvas.width=isMark?1024:2400;
    canvas.height=isMark?1024:640;
    var context=canvas.getContext("2d");
    context.imageSmoothingEnabled=true;
    context.imageSmoothingQuality="high";
    if(format==="jpeg"){context.fillStyle="#ffffff";context.fillRect(0,0,canvas.width,canvas.height)}
    context.drawImage(image,0,0,canvas.width,canvas.height);
    URL.revokeObjectURL(svgUrl);
    var mime=format==="png"?"image/png":"image/jpeg";
    var rasterBlob=await new Promise(function(resolve){canvas.toBlob(resolve,mime,format==="jpeg"?.95:undefined)});
    if(!rasterBlob)throw new Error("Image export is not supported by this browser.");
    downloadBlob(rasterBlob,asset+"."+format);
   }
   brandStatus.textContent="Download ready.";
  }catch(error){
   brandStatus.textContent=error.message||"The download could not be created.";
  }finally{
   brandDownload.disabled=false;
  }
 };
}
function shrinkVid(it){return new Promise(function(res,rej){
if(!window.MediaRecorder){rej(new Error("x"));return}
var v=document.createElement("video");v.src=it.url;v.playsInline=true;v.volume=0;v.onerror=function(){rej(new Error("load"))};
v.onloadedmetadata=function(){var st;try{st=v.captureStream?v.captureStream():v.mozCaptureStream()}catch(e){rej(e);return}
var mt=["video/webm;codecs=vp9,opus","video/webm;codecs=vp8,opus","video/webm"].filter(function(t){return MediaRecorder.isTypeSupported(t)})[0];
if(!mt){rej(new Error("codec"));return}
var target=targetBytes(),targetVideoBps=target&&v.duration?Math.max(100000,Math.floor(target*8/v.duration)):0;
var rec=new MediaRecorder(st,{mimeType:mt,videoBitsPerSecond:targetVideoBps||$("br").value*5e5,audioBitsPerSecond:128000}),ch=[];
rec.ondataavailable=function(e){if(e.data.size)ch.push(e.data)};
var tm=setInterval(function(){if(v.duration){it.prog.max=v.duration;it.prog.value=v.currentTime}},250);
rec.onstop=function(){clearInterval(tm);res(new Blob(ch,{type:"video/webm"}))};
v.onended=function(){rec.stop()};rec.start(1000);v.play().catch(function(e){rec.stop();rej(e)})}})}
})();