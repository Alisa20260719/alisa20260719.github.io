const stage=document.getElementById('box-stage'),openButton=document.getElementById('open-box'),lid=document.getElementById('lid'),world=document.getElementById('inner-world'),replay=document.getElementById('replay'),motion=document.getElementById('motion'),note=document.getElementById('box-note');let opened=false;
function revealWorld(){if(opened){stage.scrollIntoView({behavior:'smooth',block:'center'});return}opened=true;stage.classList.add('open');lid.tabIndex=-1;lid.setAttribute('aria-hidden','true');world.setAttribute('aria-hidden','false');world.querySelectorAll('button').forEach(b=>b.tabIndex=0);openButton.innerHTML='探索盒中物件 <span>↗</span>';note.textContent='轻触物件探索作品；点击人物了解我。轻触书本，走进阅读迷宫。地图、音乐与运动，等待解锁。';replay.hidden=false;motion.hidden=false;}
function openWorld(){revealWorld()}
openButton.addEventListener('click',openWorld);lid.addEventListener('click',()=>{openWorld();openButton.focus({preventScroll:true})});
replay.addEventListener('click',()=>{opened=false;stage.classList.remove('open','paused','video-opened','playing-opening');motion.textContent='暂停动效';motion.setAttribute('aria-pressed','false');lid.tabIndex=0;lid.removeAttribute('aria-hidden');world.setAttribute('aria-hidden','true');world.querySelectorAll('button').forEach(b=>b.tabIndex=-1);openButton.innerHTML='打开我的世界 <span>＋</span>';note.textContent='一个盒子，装着创作，也装着生活。';replay.hidden=true;motion.hidden=true;openButton.focus({preventScroll:true})});
motion.addEventListener('click',()=>{const paused=stage.classList.toggle('paused');motion.setAttribute('aria-pressed',String(paused));motion.textContent=paused?'播放动效':'暂停动效'});

const asset=p=>typeof resolveAsset==='function'?resolveAsset(p):p;
const groups={writing:['writing','narrative'],platform:['founder','platform'],capabilities:['founder','platform','business','chain'],brands:['brands','platform','midea','mcn'],jml:['jml','jml-results','matrix','ip','ip-works','auto','aigc'],duyan:['duyan'],stars:['celebrity'],workflow:['workflow','aigc'],films:['writing','tvc','narrative','tech','motion','photo'],interactive:['design','interactive','svg-demo'],team:['team','delivery','archive']};
const labels={writing:'写作与稿件',platform:'平台运营与用户思维',capabilities:'能力全景与营销链路',brands:'品牌经历',jml:'家美乐 · 企业内容全案',duyan:'独眼 · 原创 AI 叙事短片',stars:'明星广告 · 完整成片',workflow:'企业 AI 应用与工作流',films:'影像与编剧作品',interactive:'视觉与交互',team:'团队与完整作品库'};
const dialog=document.getElementById('case-dialog'),content=document.getElementById('case-content');let trigger=null,currentRoot=null;
function openCase(key,source){if(!groups[key])return;trigger=source;content.replaceChildren();content.classList.add('rich-content');dialog.classList.add('rich-dialog');dialog.setAttribute('aria-label',labels[key]);dialog.removeAttribute('aria-labelledby');const host=document.createElement('div');content.append(host);const shadow=host.attachShadow({mode:'open'});currentRoot=shadow;
shadow.innerHTML='<style>'+DETAIL_STYLE+'</style><div class="chapter-nav" role="navigation" aria-label="项目章节"></div>'+groups[key].map(id=>DETAIL_SECTIONS[id]||'').join('');
shadow.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();const id=a.getAttribute('href').slice(1),target=shadow.getElementById(id);if(target){dialog.scrollTo({top:target.getBoundingClientRect().top-dialog.getBoundingClientRect().top+dialog.scrollTop-100,behavior:'smooth'})}else{const group=Object.keys(groups).find(k=>groups[k].includes(id));if(group)openCase(group,source)}}));
const nav=shadow.querySelector('.chapter-nav');shadow.querySelectorAll('section').forEach(sec=>{const button=document.createElement('button');button.textContent=sec.querySelector('h2').textContent;button.addEventListener('click',()=>{const offset=sec.getBoundingClientRect().top-dialog.getBoundingClientRect().top+dialog.scrollTop-100;dialog.scrollTo({top:offset,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})});nav.append(button)});
shadow.querySelectorAll('[data-asset]').forEach(im=>{im.src=asset(DETAIL_ASSETS[im.dataset.asset])});
shadow.querySelectorAll('video').forEach(v=>{v.src=asset(v.dataset.video);v.poster=asset(v.dataset.poster);v.addEventListener('play',()=>{document.getElementById('bgm')?.pause();shadow.querySelectorAll('video').forEach(other=>{if(other!==v)other.pause()})})});
const light=document.createElement('dialog');light.className='zoom-modal';light.innerHTML='<button aria-label="关闭放大内容">关闭 ×</button><div class="zoom-body"></div>';shadow.append(light);light.querySelector('button').onclick=()=>light.close();light.addEventListener('click',ev=>{if(ev.target===light)light.close()});light.addEventListener('close',()=>light.querySelector('.zoom-body').replaceChildren());
shadow.querySelectorAll('[data-zoom]').forEach(button=>button.addEventListener('click',()=>{const im=document.createElement('img');im.src=asset(DETAIL_ASSETS[button.dataset.zoom]);im.alt=button.querySelector('img')?.alt||'项目截图';light.querySelector('.zoom-body').append(im);light.showModal()}));
shadow.getElementById('open-svg-demo')?.addEventListener('click',()=>{const frame=document.createElement('iframe');frame.className='demo-frame';frame.title='通信生活交互 Demo';frame.setAttribute('sandbox','allow-scripts');frame.src=asset(DETAIL_ASSETS.svg_demo);light.querySelector('.zoom-body').append(frame);light.showModal()});
dialog.showModal();if(typeof magicCanvas!=="undefined")dialog.append(magicCanvas);dialog.scrollTop=0;document.body.style.overflow='hidden';}
document.addEventListener('click',ev=>{const btn=ev.target.closest('[data-case]');if(!btn)return;if(btn.classList.contains('clap-hit')){stage.classList.add('clapping');setTimeout(()=>{stage.classList.remove('clapping');openCase(btn.dataset.case,btn)},420)}else openCase(btn.dataset.case,btn)});
document.querySelector('.cat-hit').addEventListener('pointerenter',()=>stage.classList.add('petting'));document.querySelector('.cat-hit').addEventListener('pointerleave',()=>stage.classList.remove('petting'));
document.querySelectorAll('[data-jump]').forEach(btn=>btn.addEventListener('click',()=>document.getElementById(btn.dataset.jump).scrollIntoView({behavior:'smooth'})));
document.getElementById('close-dialog').addEventListener('click',()=>{currentRoot?.querySelectorAll('video').forEach(v=>v.pause());dialog.close()});dialog.addEventListener('click',ev=>{if(ev.target===dialog){const r=dialog.getBoundingClientRect();if(ev.clientX<r.left||ev.clientX>r.right||ev.clientY<r.top||ev.clientY>r.bottom)dialog.close()}});dialog.addEventListener('close',()=>{currentRoot?.querySelectorAll('video').forEach(v=>v.pause());document.body.style.overflow='';trigger?.focus({preventScroll:true})});
document.getElementById('copy-phone').addEventListener('click',async()=>{const status=document.getElementById('copy-status');try{await navigator.clipboard.writeText('13288691712');status.textContent='已复制：13288691712'}catch{const t=document.createElement('textarea');t.value='13288691712';document.body.append(t);t.select();const ok=document.execCommand('copy');t.remove();status.textContent=ok?'已复制：13288691712':'联系电话：13288691712，可长按或选中复制。'}});
// Optional local listening; a soundtrack is never autoplayed or uploaded.
const musicToggle=document.getElementById('music-toggle'),musicPanel=document.getElementById('music-panel'),bgm=document.getElementById('bgm'),musicPlay=document.getElementById('music-play'),musicStatus=document.getElementById('music-status');let musicURL=null;
bgm.src=asset("assets/audio/atelier-bgm.m4a");bgm.volume=.25;musicToggle.addEventListener('click',()=>{musicPanel.hidden=!musicPanel.hidden;musicToggle.setAttribute('aria-expanded',String(!musicPanel.hidden))});
document.getElementById('music-file').addEventListener('change',e=>{const f=e.target.files?.[0];if(!f)return;bgm.pause();if(musicURL)URL.revokeObjectURL(musicURL);musicURL=URL.createObjectURL(f);bgm.src=musicURL;musicStatus.textContent=f.name;musicPlay.disabled=false;musicPlay.textContent='播放'});
musicPlay.addEventListener('click',async()=>{if(!bgm.paused){bgm.pause();return}try{await bgm.play()}catch{musicStatus.textContent='这份音频未能播放，请换用 MP3 或 M4A。'}});bgm.addEventListener('play',()=>musicPlay.textContent='暂停');bgm.addEventListener('pause',()=>musicPlay.textContent='播放');document.getElementById('music-volume').addEventListener('input',e=>bgm.volume=Number(e.target.value));document.addEventListener('play',e=>{if(e.target!==bgm&&e.target.tagName==='VIDEO')bgm.pause()},true);document.addEventListener('visibilitychange',()=>{if(document.hidden)bgm.pause()});
// Abstract golden particles follow the wand and form a brief circular stroke on click.
const magicCanvas=document.createElement('canvas');magicCanvas.className='magic-canvas';magicCanvas.setAttribute('aria-hidden','true');document.body.append(magicCanvas);const magic=magicCanvas.getContext('2d');let sparks=[],rings=[],raf=0,lastTrail=0;const reduceMagic=matchMedia('(prefers-reduced-motion: reduce)');
function sizeMagic(){const d=Math.min(devicePixelRatio||1,2);magicCanvas.width=innerWidth*d;magicCanvas.height=innerHeight*d;magic.setTransform(d,0,0,d,0,0)}sizeMagic();addEventListener('resize',sizeMagic);
function paintMagic(){magic.clearRect(0,0,innerWidth,innerHeight);sparks=sparks.filter(s=>s.life>0);rings=rings.filter(s=>s.life>0);for(const s of sparks){s.life-=.025;s.x+=s.vx;s.y+=s.vy;s.vy+=.015;magic.globalAlpha=Math.max(0,s.life);magic.fillStyle=s.color;magic.shadowBlur=8;magic.shadowColor=s.color;magic.beginPath();magic.arc(s.x,s.y,s.r,0,Math.PI*2);magic.fill()}for(const r of rings){r.life-=.035;magic.globalAlpha=Math.max(0,r.life);magic.strokeStyle='#e7cc8c';magic.lineWidth=1.1;magic.shadowBlur=10;magic.shadowColor='#e7cc8c';magic.beginPath();magic.arc(r.x,r.y,10+(1-r.life)*36,-Math.PI/2,-Math.PI/2+Math.PI*2*(1-r.life));magic.stroke()}magic.globalAlpha=1;magic.shadowBlur=0;raf=sparks.length||rings.length?requestAnimationFrame(paintMagic):0}
function sparkAt(x,y,burst=false){if(reduceMagic.matches||stage.classList.contains('paused'))return;const top=document.querySelector('dialog[open]');(top||document.body).append(magicCanvas);for(let i=0;i<(burst?22:2);i++){const a=Math.random()*Math.PI*2,v=burst?(.8+Math.random()*2.2):.25;sparks.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:burst?1:.6,r:.6+Math.random()*1.7,color:Math.random()>.3?'#e9d6a1':'#b7d7b7'})}if(burst)rings.push({x,y,life:1});if(sparks.length>150)sparks=sparks.slice(-150);if(!raf)raf=requestAnimationFrame(paintMagic)}
document.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse'||performance.now()-lastTrail<35)return;lastTrail=performance.now();sparkAt(e.clientX,e.clientY)});document.addEventListener('pointerdown',e=>{if(e.composedPath().some(n=>n instanceof Element&&n.matches('button,a,summary')))sparkAt(e.clientX,e.clientY,true)});dialog.addEventListener('close',()=>{document.body.append(magicCanvas)});

// Start soundtrack only after an explicit opening gesture; retain user pause control.
let musicStarted=false;
async function startAtelierMusic(){if(musicStarted)return;musicStarted=true;try{await bgm.play()}catch{musicStatus.textContent='点击播放，开启循环背景音乐。'}}
openButton.addEventListener('click',startAtelierMusic);lid.addEventListener('click',startAtelierMusic);
const tree=document.getElementById('inspiration-tree'),fireflies=tree.querySelector('.firefly-field');
for(let i=0;i<32;i++){const f=document.createElement('i');f.style.cssText=`left:${8+Math.random()*84}%;top:${10+Math.random()*77}%;--delay:${-Math.random()*9}s;--duration:${4+Math.random()*5}s`;fireflies.append(f)}
const treeObserver=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting)tree.classList.add('grown')})},{threshold:.15});treeObserver.observe(tree);
motion.addEventListener('click',()=>tree.classList.toggle('tree-paused',stage.classList.contains('paused')));

const adminGuide=document.getElementById('admin-guide');document.getElementById('owner-entry').onclick=()=>{location.href='https://app.pagescms.org/'};
const space=document.querySelector('.ability-space');
const galleryCards=[...space.querySelectorAll('.gallery-frame')];
function selectGalleryFrame(card){
 galleryCards.forEach(c=>c.classList.toggle('is-selected',c===card));
 if(card)space.dataset.active=card.dataset.node;else delete space.dataset.active;
}
galleryCards.forEach(card=>{
 card.addEventListener('pointerenter',()=>selectGalleryFrame(card));
 card.addEventListener('focus',()=>selectGalleryFrame(card));
 const clear=()=>{if(card.classList.contains('is-selected'))selectGalleryFrame(null)};
 card.addEventListener('pointerleave',clear);card.addEventListener('blur',clear);
});

// Resolve local imagery inside the SVG mask in the standalone edition too.
document.querySelectorAll('.object-glow-layer image, .gallery-backfill image, .frame-picture image').forEach(im=>im.setAttribute('href',asset(im.getAttribute('href'))));
const galleryViewport=document.querySelector('.gallery-viewport');if(innerWidth<700)galleryViewport.scrollLeft=(galleryViewport.scrollWidth-galleryViewport.clientWidth)/2;

// Unpublished personal chapters remain explorable without pretending content is ready.
function showLockedChapter(key, source){
 if(key==='books'){window.openReadingMaze(source);return;}
 const themes={travel:['旅行坐标','沿途的风景，和走过的地方。'],music:['声音与音乐','关于唱歌、音乐，和声音的记忆。'],books:['私人书单','那些读过、想读，也想与你分享的书。'],fitness:['身体与生活','在运动与日常里，寻找自己的节奏。']};
 const chapter=themes[key]||['新的章节','新的故事，正在慢慢积累。'];trigger=source;currentRoot=null;content.replaceChildren();content.classList.remove('rich-content');dialog.classList.remove('rich-dialog');dialog.setAttribute('aria-label',chapter[0]+'，待解锁');
 const article=document.createElement('article');article.className='locked-chapter';
 article.innerHTML='<div class="chapter-lock" aria-hidden="true"><i></i></div><p class="locked-status">待解锁</p><h2></h2><p class="locked-description"></p><p class="locked-note">这一格，留给下一次更新。</p>';
 article.querySelector('h2').textContent=chapter[0];article.querySelector('.locked-description').textContent=chapter[1];content.append(article);dialog.showModal();dialog.scrollTop=0;document.body.style.overflow='hidden';
}

// Pause the gallery while it is outside the viewport; honour the visitor's pause control.
const galleryObserver=new IntersectionObserver(entries=>entries.forEach(e=>space.classList.toggle('gallery-offscreen',!e.isIntersecting)),{threshold:.05});galleryObserver.observe(space);
motion.addEventListener('click',()=>space.classList.toggle('gallery-paused',stage.classList.contains('paused')));

replay.addEventListener('click',()=>{space.classList.remove('gallery-paused');tree.classList.remove('tree-paused')});

// Local editing remains available in the working copy; the public portfolio has no local admin link.
if(location.protocol.startsWith('http')&&!['localhost','127.0.0.1'].includes(location.hostname))document.getElementById('owner-entry').hidden=false;
