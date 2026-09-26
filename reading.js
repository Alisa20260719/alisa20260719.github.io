'use strict';
const $=id=>document.getElementById(id);
let BOOKS=[],deck=[],cursor=0,busy=false,lastWall=null,loaded=false,loading=false;
const STORAGE='alisa-reading-deck-v2';
function shuffle(){deck=BOOKS.map(b=>b.id);for(let i=deck.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]]}cursor=0}
function restore(){try{const v=JSON.parse(sessionStorage.getItem(STORAGE));if(v&&Array.isArray(v.deck)&&v.deck.length===BOOKS.length&&new Set(v.deck).size===BOOKS.length&&v.deck.every(id=>BOOKS.some(b=>b.id===id))&&Number.isInteger(v.cursor)&&v.cursor>=0&&v.cursor<=v.deck.length){deck=v.deck;cursor=v.cursor;return}}catch{}shuffle()}
function save(){try{sessionStorage.setItem(STORAGE,JSON.stringify({deck,cursor}))}catch{}}
function contentText(value){return typeof value==='string'?value:Array.isArray(value)?value.map(n=>typeof n==='string'?n:[n.quote,n.thought].filter(Boolean).join('\n')).join('\n\n'):''}
function safeImage(path){try{const u=new URL(path,location.href);return ['https:','http:'].includes(u.protocol)?u.href:''}catch{return ''}}
function normalizeBooks(items){const ids=new Set();return items.filter(b=>b&&typeof b.title==='string'&&b.title.trim()&&b.visible!==false).map(b=>({...b,id:String(b.id||b.title).trim(),title:b.title.trim()})).filter(b=>{if(ids.has(b.id))return false;ids.add(b.id);return true})}
function paintCover(b){const img=$('cover');img.hidden=false;img.alt=b.title+'封面';img.onerror=()=>{img.hidden=true};const cover=safeImage(b.cover||'');if(!b.cover||!cover){img.hidden=true;img.removeAttribute('src');return}
const crop=/\/assets\/reading-sheets\/\d+\.(?:png|webp)$/.test(new URL(cover).pathname)&&Number.isFinite(b.y);
const atlas=new URL(cover).pathname==='/assets/reading-covers.webp'&&Number.isFinite(b.coverX)&&Number.isFinite(b.y);img.style.cssText=atlas?'position:absolute;width:1179px;height:2280px;max-width:none;left:'+(-b.coverX)+'px;top:'+(-b.y)+'px':crop?'position:absolute;width:941px;height:2048px;max-width:none;left:-731px;top:'+(-b.y)+'px':'position:static;width:100%;height:100%;max-width:100%;object-fit:contain';img.src=cover}
function encounter(wall){if(!loaded||busy||$('book-card').open)return;lastWall?.classList.remove('lit');lastWall=wall;wall.classList.add('lit');if(cursor===deck.length){$('end').showModal();return}
busy=true;const nextId=deck[cursor++];const b=BOOKS.find(b=>b.id===nextId);save();$('book-title').textContent=b.title;$('read-year').textContent=b.year?b.year+' · 读过的时光':'读过的时光';paintCover(b);
$('recommendation').textContent=contentText(b.recommendation)||'留待下一次落笔。';
$('reading-notes').textContent=contentText(b.notes)||'这里会慢慢收下我的阅读笔记。';
$('reflection').textContent=contentText(b.reflection)||'一些想法，正在重新生长。';
setTimeout(()=>{if(sceneVisible)$('book-card').showModal();busy=false},240)}
for(const wall of document.querySelectorAll('.book-control')){wall.addEventListener('click',()=>encounter(wall));wall.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();encounter(wall)}})}
function closeBook(){$('book-card').close();lastWall?.classList.remove('lit');lastWall?.focus({preventScroll:true});$('hint').textContent='再往前，或在这里停留一会儿。'}
$('close').onclick=closeBook;$('continue').onclick=closeBook;
$('book-card').addEventListener('close',()=>{lastWall?.classList.remove('lit');lastWall?.focus({preventScroll:true})});
function returnHome(){if(parent!==window)parent.postMessage({type:'alisa-reading-close'},'*');else location.href='index.html'}
$('return').onclick=returnHome;
$('restart').onclick=()=>{shuffle();save();$('end').close();lastWall?.classList.remove('lit');$('hint').textContent='带着新的目光，再出发。'};
$('end-close').onclick=()=>$('end').close();
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('book-card').open&&!$('end').open)returnHome()});
// Dialog Escape must not also close the surrounding exploration.
for(const id of ['book-card','end'])$(id).addEventListener('keydown',e=>{if(e.key==='Escape')e.stopPropagation()});
async function loadReading(){if(loading)return;loading=true;loaded=false;const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),12000);$('hint').textContent='正在翻开这段阅读……';$('reload-reading').hidden=true;
try{const res=await fetch('data/reading.json',{cache:'no-store',signal:ctrl.signal});if(!res.ok)throw Error('HTTP '+res.status);const data=await res.json();if(!Array.isArray(data.items))throw Error('Invalid reading data');BOOKS=normalizeBooks(data.items);$('reading-heading').textContent=data.title||'阅读，让边界向外。';$('reading-description').textContent=data.description||'我们从自己的中心出发，在别人的文字里找到一扇门。这里收着我读过的书，也有着等待重新想起的念头。';restore();loaded=true;$('hint').textContent=BOOKS.length?'轻触一本书，让边界向外。':'书页暂时合上了，稍后再来看看。';if(!BOOKS.length)loaded=false;
}catch(e){$('hint').textContent='书页暂时未能加载，请再试一次。';$('reload-reading').hidden=false}finally{clearTimeout(timer);loading=false}}
$('reload-reading').onclick=loadReading;
if(innerWidth<700)$('world').scrollLeft=(1050-innerWidth)/2;

// Ground-contact lines, independent of the books' tall visible silhouettes.
const wallShapes=[
  {
    "name": "后排月亮蓝书",
    "points": "492,60 620,29 624,30 628,39 634,42 638,96 558,114 555,118 561,129 497,155"
  },
  {
    "name": "后排玫瑰书",
    "points": "691,48 841,55 839,99 812,96 804,111 799,137 742,139 741,98 735,85 689,89 688,61"
  },
  {
    "name": "后排绿色星图",
    "points": "888,47 904,35 923,42 921,44 1047,91 1046,156 1004,174 1003,203 942,178 942,119 888,108"
  },
  {
    "name": "后排金色书",
    "points": "324,132 443,65 447,67 447,70 459,77 465,75 470,165 446,172 449,217 407,240 403,183 379,174 326,219"
  },
  {
    "name": "右后红色书",
    "points": "1085,90 1103,80 1106,79 1206,139 1209,182 1172,185 1165,194 1148,204 1147,247 1090,211 1092,136 1085,131"
  },
  {
    "name": "右后蓝色书",
    "points": "1209,143 1225,134 1229,128 1233,128 1291,182 1288,280 1281,293 1267,292 1267,255 1208,218"
  },
  {
    "name": "左后红色书",
    "points": "153,212 225,146 229,148 229,151 250,159 255,157 263,249 241,264 236,254 204,249 159,336"
  },
  {
    "name": "左后金色月亮书",
    "points": "445,173 549,119 560,130 565,190 530,208 528,213 533,270 525,276 521,244 500,234 469,275 450,264"
  },
  {
    "name": "后排棕色书",
    "points": "557,114 734,85 740,97 741,134 660,141 657,146 665,192 648,199 630,165 625,164 563,196 561,130 555,118"
  },
  {
    "name": "中后绿色书",
    "points": "658,142 798,125 802,207 725,209 721,216 721,255 704,266 704,241 691,228 666,241 664,155"
  },
  {
    "name": "中后紫色天文书",
    "points": "809,97 941,117 942,121 938,132 940,206 852,174 849,168 844,169 838,174 824,177 824,226 802,219 800,136 795,127"
  },
  {
    "name": "右后侧向红书",
    "points": "1004,173 1072,123 1076,120 1079,123 1079,127 1093,133 1094,136 1091,211 1063,199 1057,202 1023,208 1020,212 1020,277 1003,269"
  },
  {
    "name": "右内金色天文书",
    "points": "853,177 871,169 879,168 882,174 1000,242 1003,244 1001,248 1000,309 977,286 972,287 953,294 952,350 928,337 928,305 856,267"
  },
  {
    "name": "中后紫色星座书",
    "points": "527,208 627,163 631,163 635,169 646,175 647,259 609,285 556,324 551,326 535,316 532,222 526,214"
  },
  {
    "name": "左中蓝色书",
    "points": "302,250 374,178 379,173 381,174 386,178 401,182 404,183 409,298 399,305 380,291 375,291 326,362 307,356"
  },
  {
    "name": "左后小绿书",
    "points": "243,263 278,232 281,229 297,238 300,240 301,309 282,320 278,319 269,328 250,334"
  },
  {
    "name": "左侧绿色大书",
    "points": "138,374 202,250 207,250 208,253 234,255 239,253 241,259 251,411 226,416 222,419 231,506 199,517 174,514 139,497"
  },
  {
    "name": "左内蓝色窄书",
    "points": "458,277 498,235 502,235 503,238 521,243 523,289 518,292 523,295 527,391 519,395 473,359 468,355 450,362 449,329"
  },
  {
    "name": "中内蓝色斜书",
    "points": "556,323 627,264 627,261 689,230 693,230 698,238 704,241 704,308 655,329 655,399 652,421 604,371 598,362 594,365 575,370 576,419 562,415 556,402"
  },
  {
    "name": "中内蓝色正书",
    "points": "722,217 725,207 830,215 835,219 833,266 824,268 823,297 812,294 805,295 792,302 791,329 776,330 776,302 770,294 766,287 724,303"
  },
  {
    "name": "中央红色横书",
    "points": "655,329 762,287 766,287 769,294 776,302 777,393 679,426 674,432 671,434 654,420"
  },
  {
    "name": "中央后红色斜书",
    "points": "824,267 836,260 840,257 925,301 930,305 929,311 928,380 902,397 895,393 895,350 824,310"
  },
  {
    "name": "中央打开的门",
    "points": "792,302 806,293 813,292 892,344 895,349 895,466 876,480 871,481 825,447 822,320 819,317 819,402 797,414 794,417 791,414"
  },
  {
    "name": "右内紫色斜书",
    "points": "952,297 971,290 980,284 986,288 1065,364 1069,367 1068,377 1069,439 1047,446 1040,435 1034,432 1018,462 987,482 986,402 958,392 952,396"
  },
  {
    "name": "右后绿色大书",
    "points": "1024,207 1040,199 1045,196 1049,198 1050,202 1134,258 1141,260 1142,264 1139,297 1127,298 1124,304 1124,369 1109,381 1104,381 1020,321"
  },
  {
    "name": "右后紫色大书",
    "points": "1153,194 1168,186 1174,183 1179,185 1266,249 1272,253 1273,257 1266,262 1267,309 1259,305 1245,303 1240,305 1227,312 1220,313 1219,371 1206,359 1162,292 1156,288 1150,291"
  },
  {
    "name": "右内红色窄书",
    "points": "1127,296 1151,293 1156,289 1161,291 1201,353 1202,359 1197,362 1170,365 1167,383 1154,431 1145,437 1124,414"
  },
  {
    "name": "右外蓝色大书",
    "points": "1225,312 1239,306 1245,302 1250,301 1254,306 1308,336 1320,341 1323,345 1315,350 1316,406 1305,405 1303,402 1300,401 1279,405 1267,479 1254,485 1222,455"
  },
  {
    "name": "右外金色大书",
    "points": "1324,240 1353,236 1358,231 1362,232 1415,334 1418,338 1418,344 1407,467 1374,475 1368,474 1336,419 1338,408 1331,405 1325,409 1318,405 1316,351 1323,345 1324,330"
  },
  {
    "name": "右侧蓝色薄书",
    "points": "1168,370 1174,367 1197,370 1202,369 1203,374 1193,439 1184,487 1182,605 1177,615 1169,614 1167,562 1162,555 1147,540 1140,537 1146,481"
  },
  {
    "name": "右侧金色薄书",
    "points": "1303,401 1308,402 1310,405 1330,408 1336,405 1340,409 1333,465 1328,497 1321,520 1318,635 1311,644 1307,645 1274,640 1271,636 1280,513 1290,463"
  },
  {
    "name": "右侧绿色薄书",
    "points": "1420,473 1426,470 1428,473 1460,479 1466,478 1469,482 1465,497 1438,610 1425,742 1421,752 1413,754 1384,746 1376,741 1378,727 1388,612 1400,562 1418,489"
  },
  {
    "name": "右中金色斜薄书",
    "points": "1002,499 1032,435 1036,432 1041,437 1061,441 1067,439 1070,443 1067,453 1063,559 1031,578 1029,576 1029,534 1025,528 1012,513"
  },
  {
    "name": "右中紫色斜书",
    "points": "890,463 950,391 955,385 959,385 963,390 982,400 987,399 987,404 985,503 930,542 920,548 892,562 889,557"
  },
  {
    "name": "中央左红色斜书",
    "points": "574,370 594,365 598,361 603,363 653,419 657,422 662,426 665,432 665,458 652,465 651,519 639,522 634,519 577,476"
  },
  {
    "name": "中央左蓝色大书",
    "points": "445,365 468,359 473,355 478,356 581,463 585,468 590,548 580,519 574,515 569,526 558,541 557,570 529,548 473,489 473,443 447,421"
  },
  {
    "name": "左中金色大书",
    "points": "313,374 373,296 378,291 382,293 383,297 405,303 408,301 411,302 415,424 366,457 365,462 355,474 350,476 320,466"
  },
  {
    "name": "左中后小金书",
    "points": "364,458 449,423 454,422 457,426 470,437 473,439 474,494 457,501 455,493 448,486 441,489 368,520"
  },
  {
    "name": "左外蓝色薄书",
    "points": "73,405 77,401 80,405 106,403 110,398 114,402 133,526 139,577 125,583 127,668 110,674 107,671 84,528"
  },
  {
    "name": "左外红色斜书",
    "points": "222,418 253,410 260,407 264,411 270,426 268,431 323,526 326,530 333,543 331,549 345,690 305,703 301,702 244,591 230,476"
  },
  {
    "name": "左前绿色横书",
    "points": "323,527 442,487 448,486 454,491 457,499 475,505 477,617 462,624 389,586 385,587 377,601 366,611 366,667 348,680 344,650 334,547"
  },
  {
    "name": "中前绿色横书",
    "points": "557,541 566,529 574,515 579,515 584,521 723,561 728,565 725,578 724,683 718,696 699,698 697,691 557,648"
  },
  {
    "name": "中央红色正书",
    "points": "653,470 656,453 662,450 681,456 804,465 809,466 811,471 813,552 754,560 749,563 750,575 725,581 728,567 653,547"
  },
  {
    "name": "中前蓝色月亮书",
    "points": "750,562 855,549 860,549 862,553 866,565 871,569 872,674 813,685 812,689 811,692 753,695 750,690"
  },
  {
    "name": "右中蓝色横书",
    "points": "897,548 1002,498 1008,498 1011,503 1016,512 1027,525 1029,529 1027,605 993,625 990,631 989,641 918,674 899,669 896,557"
  },
  {
    "name": "右前红色横书",
    "points": "992,625 1122,544 1131,539 1136,535 1141,539 1142,542 1167,554 1170,558 1168,563 1165,684 1058,751 1019,775 1006,779 994,773 990,636"
  },
  {
    "name": "左前蓝色月亮书",
    "points": "365,610 369,605 377,600 386,586 390,586 514,642 526,646 530,650 528,658 531,663 531,784 505,805 498,807 458,790 451,768 447,756 371,723"
  },
  {
    "name": "左外前蓝色大书",
    "points": "124,583 148,576 155,570 160,571 270,674 275,680 277,687 286,823 260,845 254,847 140,737"
  },
  {
    "name": "左前红色大书",
    "points": "306,727 316,722 326,707 330,706 335,709 442,755 449,758 452,763 458,893 442,916 437,922 432,921 317,868"
  },
  {
    "name": "中前金色正书",
    "points": "530,655 541,641 546,640 548,643 690,686 696,688 699,693 698,787 582,780 578,782 574,792 571,801 532,787"
  },
  {
    "name": "右前小紫书",
    "points": "810,684 917,664 921,665 923,673 929,688 936,691 937,697 935,710 903,719 902,735 901,812 824,834 815,834 811,802"
  },
  {
    "name": "右前小绿书",
    "points": "900,716 988,693 993,693 997,705 1006,718 1008,722 1006,875 916,902 910,901 901,883"
  },
  {
    "name": "右前绿色大书",
    "points": "1053,756 1211,675 1214,677 1233,663 1238,661 1242,664 1262,682 1269,685 1271,692 1269,701 1263,827 1254,837 1247,843 1241,842 1191,872 1083,932 1076,934 1049,908 1050,766"
  },
  {
    "name": "最前蓝色天文书",
    "points": "567,811 574,807 578,786 580,780 587,780 790,795 814,794 819,797 820,819 823,833 817,967 811,972 801,973 575,950 571,946"
  }
].map(b=>b.points.split(' ').map(p=>p.split(',').map(Number)));
const bases=[
[497,195,638,161],[690,187,840,197],[890,195,1045,253],[327,269,470,213],
[1088,231,1207,302],[1209,279,1287,341],[160,355,264,284],[450,291,565,234],
[561,256,742,229],[665,287,801,268],[804,241,939,263],[1004,312,1093,266],
[855,315,1001,398],[535,316,647,263],[308,356,408,298],[250,334,301,309],
[139,497,199,517,251,451],[451,374,519,395],[562,415,704,346],[724,350,832,354],
[654,420,671,434,777,393],[825,355,902,397,928,380],[794,417,819,402,825,447,871,481,895,466],
[955,425,1034,478,1068,459],[1020,321,1104,381,1138,363],[1152,327,1239,397,1267,379],
[1124,414,1145,437,1180,412],[1222,455,1254,485,1316,448],[1318,405,1368,474,1407,467],
[1142,593,1171,615,1182,605],[1274,640,1311,644,1318,635],[1384,746,1413,754,1425,742],
[1003,549,1031,578,1063,559],[890,551,901,561,985,503],[577,476,639,522,663,510],
[448,460,559,571,588,553],[320,466,350,476,415,424],[368,557,474,516],
[107,671,127,668],[244,591,301,702,345,690],[347,680,475,632],
[557,648,699,698,724,683],[653,582,809,595],[750,690,753,695,872,674],
[899,669,918,674,1027,620],[994,773,1006,779,1165,684],[371,753,498,807,531,784],
[140,737,254,847,286,823],[317,868,437,922,458,893],[532,787,698,835],
[815,834,824,834,935,803],[901,883,916,902,1006,875],[1049,908,1076,934,1247,843,1263,827],
[571,946,801,973,817,967]
];
function distanceToSegment(x,y,ax,ay,bx,by){const dx=bx-ax,dy=by-ay,t=Math.max(0,Math.min(1,((x-ax)*dx+(y-ay)*dy)/(dx*dx+dy*dy||1)));return Math.hypot(x-ax-t*dx,y-ay-t*dy)}
const groundSegments=bases.flatMap((b,id)=>{const out=[];for(let k=0;k<b.length-2;k+=2){const [ax,ay,bx,by]=b.slice(k,k+4);out.push({id,ax,ay,bx,by,minX:Math.min(ax,bx)-9,maxX:Math.max(ax,bx)+9,minY:Math.min(ay,by)-9,maxY:Math.max(ay,by)+9})}return out});
function contactAt(x,y){if(((x-770)/666)**2+((y-521)/432)**2>1)return -2;for(const s of groundSegments){if(x<s.minX||x>s.maxX||y<s.minY||y>s.maxY)continue;if(distanceToSegment(x,y,s.ax,s.ay,s.bx,s.by)<9)return s.id}return -1}
function clearSegment(a,b){const n=Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/3);for(let i=0;i<=n;i++)if(contactAt(a.x+(b.x-a.x)*i/(n||1),a.y+(b.y-a.y)*i/(n||1))!==-1)return false;return true}
function baseYAt(i,x){const b=bases[i];let best=Infinity,y=-Infinity;for(let k=0;k<b.length-2;k+=2){const ax=b[k],ay=b[k+1],bx=b[k+2],by=b[k+3];const t=Math.max(0,Math.min(1,(x-ax)/(bx-ax||1)));const gap=Math.abs(x-(ax+t*(bx-ax)));if(gap<best){best=gap;y=ay+t*(by-ay)}}return y}
const walker={x:760,y:447,angle:0,phase:0,pause:0,distance:0,collisions:0,arrivals:0};
function paintWalker(){$('wanderer').setAttribute('transform','translate('+walker.x+' '+walker.y+')');const stride=Math.sin(walker.phase)*19;$('leg-l').setAttribute('transform','rotate('+stride+' -3 -10)');$('leg-r').setAttribute('transform','rotate('+(-stride)+' 3 -10)');$('arm-l').setAttribute('transform','rotate('+(-stride*.4)+' -4 -29)');$('arm-r').setAttribute('transform','rotate('+(stride*.4)+' 4 -29)');$('walker-body').setAttribute('transform','translate(0 '+(-Math.abs(Math.sin(walker.phase))*.9)+')');$('walker-facing').setAttribute('transform','scale('+(Math.cos(walker.angle)<0?-1:1)+' 1)');for(let i=0;i<bases.length;i++)$('occluder-'+i).setAttribute('fill',walker.y<baseYAt(i,walker.x)+2?'black':'none')}
const STEP=10,grid=new Map(),key=(x,y)=>x+','+y;
for(let y=100;y<=950;y+=STEP)for(let x=100;x<=1440;x+=STEP)if(contactAt(x,y)===-1)grid.set(key(x,y),{x,y});
function nearestNode(p){let best=null,d=Infinity;for(const n of grid.values()){const nd=Math.hypot(n.x-p.x,n.y-p.y);if(nd<d&&clearSegment(p,n)){best=n;d=nd}}return best}
const startNode=nearestNode(walker),reachable=[],visited=new Set([key(startNode.x,startNode.y)]);
function neighbours(n){if(n.links)return n.links;const out=[];for(const [dx,dy]of [[10,0],[-10,0],[0,10],[0,-10],[10,10],[10,-10],[-10,10],[-10,-10]]){const m=grid.get(key(n.x+dx,n.y+dy));if(m&&clearSegment(n,m))out.push(m)}n.links=out;return out}
for(let q=[startNode],i=0;i<q.length;i++){const n=q[i];reachable.push(n);for(const m of neighbours(n)){const k=key(m.x,m.y);if(!visited.has(k)){visited.add(k);q.push(m)}}}
function insidePoly(x,y,p){let hit=false;for(let i=0,j=p.length-1;i<p.length;j=i++){const [ax,ay]=p[i],[bx,by]=p[j];if((ay>y)!==(by>y)&&x<(bx-ax)*(y-ay)/(by-ay)+ax)hit=!hit}return hit}
const visibleStops=reachable.filter(n=>!wallShapes.some(p=>insidePoly(n.x,n.y,p)||insidePoly(n.x,n.y-25,p)));
let route=[];
function planRoute(){const start=nearestNode(walker),prev=new Map([[key(start.x,start.y),null]]),q=[start];
const outer=visibleStops.filter(n=>Math.hypot(n.x-760,n.y-447)>270&&Math.hypot(n.x-walker.x,n.y-walker.y)>230);
const inner=visibleStops.filter(n=>Math.hypot(n.x-760,n.y-447)<160);const pool=walker.arrivals%3===2?inner:(outer.length?outer:reachable),target=pool[Math.floor(Math.random()*pool.length)];
for(let i=0;i<q.length;i++){const n=q[i];if(n===target)break;for(const m of neighbours(n)){const k=key(m.x,m.y);if(!prev.has(k)){prev.set(k,n);q.push(m)}}}
route=[];for(let n=target;n;n=prev.get(key(n.x,n.y)))route.push(n);route.reverse();
let smooth=[],from=walker;for(let i=0;i<route.length;){let j=i;while(j+1<route.length&&clearSegment(from,route[j+1]))j++;smooth.push(route[j]);from=route[j];i=j+1}route=smooth;
}
function walkStep(dt){if(walker.pause>0){walker.pause-=dt;return}if(!route.length){planRoute();walker.arrivals++;walker.pause=.5+Math.random();return}const p=route[0],dx=p.x-walker.x,dy=p.y-walker.y,d=Math.hypot(dx,dy),move=Math.min(d,dt*30);if(d<.2){route.shift();return}const next={x:walker.x+dx/d*move,y:walker.y+dy/d*move};if(!clearSegment(walker,next)){route=[];walker.collisions++;return}walker.angle=Math.atan2(dy,dx);walker.x=next.x;walker.y=next.y;walker.distance+=move;walker.phase+=dt*9;paintWalker()}
let autoPaused=matchMedia('(prefers-reduced-motion: reduce)').matches,sceneVisible=true,lastTime=0;
$('wander-toggle').setAttribute('aria-pressed',String(autoPaused));$('wander-toggle').textContent=autoPaused?'继续漫游':'暂停漫游';
$('wander-toggle').onclick=()=>{autoPaused=!autoPaused;$('wander-toggle').setAttribute('aria-pressed',String(autoPaused));$('wander-toggle').textContent=autoPaused?'继续漫游':'暂停漫游'};
window.addEventListener('message',e=>{if(e.source===parent&&e.data?.type==='alisa-reading-visibility')sceneVisible=!!e.data.visible});
function animateWalk(t){const dt=lastTime?Math.min(.04,(t-lastTime)/1000):0;lastTime=t;if(!autoPaused&&sceneVisible&&!document.hidden&&!$('book-card').open&&!$('end').open&&!busy)walkStep(dt);requestAnimationFrame(animateWalk)}paintWalker();requestAnimationFrame(animateWalk);

loadReading();
