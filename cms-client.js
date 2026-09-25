// Both the static snapshot and local CMS render from the same structured content.
(async()=>{
let records=structuredClone(CONTENT_SEED);
// Each CMS form saves one JSON document; the public site reads it directly.
if(location.protocol.startsWith('http')){
 const names=['works','brands','hotspots','writing','about'];
 const loaded=await Promise.all(names.map(async name=>{try{const response=await fetch('data/'+name+'.json',{cache:'no-cache'});if(!response.ok)throw Error(response.status);return await response.json()}catch(error){console.warn('Content unavailable:',name,error);return null}}));
 for(let i=0;i<3;i++)if(Array.isArray(loaded[i]?.items))records[names[i]]=loaded[i].items;
 if(loaded[3])records.works=[...records.works.filter(w=>w.id!=='writing'),{...loaded[3],id:'writing'}];
 if(loaded[4])records.about=loaded[4];
}
window.STUDIO_CONTENT=records;
if(location.protocol.startsWith('http')&&['localhost','127.0.0.1'].includes(location.hostname)){try{const preview=location.hash==='#draft-preview';const r=await fetch(preview?'/api/admin':'/api/content');if(r.ok){const o=await r.json();records=preview?o.content:o;if(preview){const banner=document.createElement('div');banner.className='preview-banner';banner.textContent='草稿预览 · 尚未发布';document.body.append(banner)}}}catch{}}
const make=(tag,text,cls)=>{const e=document.createElement(tag);if(text)e.textContent=text;if(cls)e.className=cls;return e};
function documentShelf(r){
 const shelf=make('section',null,'manuscript-shelf');shelf.append(make('p','WRITING DESK','eyebrow'),make('h3','翻开一份稿件'));
 const docs=(r.documents||[]).filter(d=>d.path);
 if(!docs.length){shelf.append(make('p','稿件待上传。新的剧本、文案与写作，会陆续放进这本书里。','manuscript-empty'));return shelf}
 for(const doc of docs){
  const entry=make('details',null,'manuscript');const summary=make('summary');summary.append(make('span',doc.title),make('small',(doc.path||'').split('.').pop().toUpperCase()+' · 阅读'));entry.append(summary);
  const links=make('div',null,'manuscript-actions'),original=make('a','打开原文件 ↗');original.href=asset(doc.path);original.target='_blank';original.rel='noopener noreferrer';links.append(original);entry.append(links);
  let loaded=false;
  entry.addEventListener('toggle',async()=>{
   if(!entry.open||loaded)return;loaded=true;
   if(/\.pdf$/i.test(doc.path)){const frame=make('iframe');frame.className='manuscript-pdf';frame.title=doc.title;frame.src=asset(doc.path);entry.append(frame,make('p','如预览未显示，可打开原文件阅读。','manuscript-help'));return}
   const reading=make('div','正在翻开稿件…','manuscript-text');entry.append(reading);
   if(/\.docx$/i.test(doc.path)&&!doc.readPath){reading.textContent='Word 文件请点击上方打开原文件；如需页内阅读，请上传 PDF 或配套 TXT。';return}
   try{const response=await fetch(asset(doc.readPath||doc.path));if(!response.ok)throw Error();reading.textContent=await response.text()}catch{reading.textContent='暂时无法载入正文，请打开原文件阅读。'}
  });shelf.append(entry)
 }return shelf
}
function customCase(r,source){
 const hasCustom=r.body||r.link||r.media||r.documents?.length||r.id==='writing';
 if(r.case&&!hasCustom){openCase(r.case,source);return}
 if(r.case)openCase(r.case,source);else{trigger=source;currentRoot=null;content.replaceChildren();dialog.classList.remove('rich-dialog');dialog.setAttribute('aria-label',r.title);dialog.showModal();document.body.style.overflow='hidden'}
 const panel=make('article',null,'cms-detail');panel.append(make('h2',r.title));
 if(r.cover){const im=make('img');im.src=asset(r.cover);im.alt=r.title;panel.append(im)}
 if(r.summary)panel.append(make('p',r.summary));if(r.body)panel.append(make('p',r.body));
 if(r.id==='writing'||r.documents?.length)panel.append(documentShelf(r));
 if(r.media){const v=make(/\.(mp3|m4a)$/i.test(r.media)?'audio':'video');v.src=asset(r.media);v.controls=true;v.preload='none';panel.append(v);dialog.addEventListener('close',()=>v.pause(),{once:true});v.onplay=()=>bgm.pause()}
 if(r.link){const a=make('a','打开完整作品 ↗');a.href=r.link;a.target='_blank';a.rel='noopener noreferrer';panel.append(a)}
 content.prepend(panel);dialog.scrollTop=0
}
const treeWorks=document.querySelector('.tree-works');
const original=new Map([...treeWorks.children].map(b=>[b.dataset.case,b.cloneNode(true)]));
const treeRecords=records.works.filter(x=>x.visible!==false&&x.onTree!==false);
let treePage=0;const pageSize=5,pageCount=Math.max(1,Math.ceil(treeRecords.length/pageSize));
const pager=make('nav',null,'tree-pagination');pager.setAttribute('aria-label','灵感树案例翻页');
const previous=make('button','← 上一组'),status=make('span'),next=make('button','下一组 →');status.setAttribute('aria-live','polite');pager.append(previous,status,next);tree.after(pager);pager.hidden=pageCount<=1;
function renderTree(){
 treeWorks.replaceChildren();
 treeRecords.slice(treePage*pageSize,(treePage+1)*pageSize).forEach((r,i)=>{
  let b=original.get(r.id)?.cloneNode(true);
  if(!b){b=make('button');b.append(make('span',null,'fruit-image'),make('span',null,'fruit-label'))}
  b.removeAttribute('data-case');b.dataset.workId=r.id;b.type='button';b.setAttribute('aria-label',r.title);b.onclick=()=>customCase(r,b);
  const label=b.querySelector('.fruit-label');label.replaceChildren(make('small',r.category||'作品'),make('strong',r.title),make('span',r.summary||''));
  const picture=b.querySelector('.fruit-image');
  if(!original.has(r.id)||r.cover!==CONTENT_SEED.works.find(x=>x.id===r.id)?.cover){picture.replaceChildren();if(r.cover){const im=make('img');im.src=asset(r.cover);im.alt=r.title;im.loading='lazy';picture.append(im)}else picture.append(make('span','✦','fruit-placeholder'))}
  const inside=make('span',null,'bottle-picture');while(picture.firstChild)inside.append(picture.firstChild);picture.append(inside);
  b.className='tree-work '+['fruit-duyan','fruit-jml','fruit-stars','fruit-workflow','fruit-films'][i];treeWorks.append(b);
 });
 status.textContent=(treePage+1)+' / '+pageCount+' · 共 '+treeRecords.length+' 个灵感';previous.disabled=treePage===0;next.disabled=treePage===pageCount-1;
}
previous.onclick=()=>{if(treePage>0){treePage--;renderTree()}};next.onclick=()=>{if(treePage<pageCount-1){treePage++;renderTree()}};renderTree();
const board=document.querySelector('.brandwall');board.replaceChildren();for(const r of records.brands.filter(x=>x.visible!==false)){const b=make('button');b.setAttribute('aria-label','查看'+r.title+'项目经历');if(r.cover){const im=make('img');im.src=asset(r.cover);im.alt=r.title;im.loading='lazy';b.append(im)}else b.textContent=r.title;b.onclick=()=>customCase(r,b);board.append(b)}
document.querySelectorAll('.hotspots > .hotspot').forEach(b=>b.remove());records.hotspots.filter(x=>x.visible&&!x.id.startsWith('box-')).forEach((r,i)=>{const b=make('button',null,'hotspot');b.style.left=r.x+'%';b.style.top=r.y+'%';b.tabIndex=opened?0:-1;b.setAttribute('aria-label',r.title);b.append(make('span','✧'),make('b',r.title));b.onclick=()=>{if(r.target.startsWith('section:')){document.getElementById(r.target.slice(8))?.scrollIntoView({behavior:'smooth'});}else if(r.target==='about')document.getElementById('about').scrollIntoView({behavior:'smooth'});else{const w=records.works.find(x=>x.id===r.target&&x.visible!==false);if(w)customCase(w,b);else openCase(r.target,b)}};document.querySelector('.hotspots').append(b)});
const objectMap={'cat-hit':'box-0','camera-hit':'box-1','screen-hit':'box-2','clap-hit':'box-3','person-hit':'box-4','map-hit':'box-5','microphone-hit':'box-6','books-hit':'box-7','fitness-hit':'box-8','notebook-hit':'box-9'};
document.querySelectorAll('.object-hit').forEach(b=>{const cls=Object.keys(objectMap).find(k=>b.classList.contains(k));const r=records.hotspots.find(x=>x.id===objectMap[cls]);b.removeAttribute('data-case');if(r)b.setAttribute('aria-label',r.title);if(!r||r.visible===false){b.hidden=true;return}b.onclick=()=>{const launch=()=>{if(r.target.startsWith('locked:')){showLockedChapter(r.target.slice(7),b);return}if(r.target==='about'){const about=document.getElementById('about');about.scrollIntoView({behavior:'smooth'});const heading=about.querySelector('h2');heading.tabIndex=-1;heading.focus({preventScroll:true});return}const w=records.works.find(x=>x.id===r.target&&x.visible!==false);if(w)customCase(w,b);else if(records.works.some(w=>w.id===r.target))showLockedChapter('writing',b);else if(r.target.startsWith('section:'))document.getElementById(r.target.slice(8))?.scrollIntoView({behavior:'smooth'});else openCase(r.target,b)};if(cls==='clap-hit'){stage.classList.add('clapping');setTimeout(()=>{stage.classList.remove('clapping');launch()},420)}else launch()}});
if(records.about){
 const a=records.about,section=document.getElementById('about');
 section.querySelector('.about-image img').src=asset(a.image||'assets/a16.jpg');section.querySelector('.about-image span').textContent=a.name||'';
 section.querySelector('h2').textContent=a.heading||'';section.querySelector('.about-lead').textContent=a.lead||'';section.querySelector('.about-lead').nextElementSibling.textContent=a.body||'';
 section.querySelector('.self-labels').replaceChildren(...(a.tags||[]).map(t=>make('span',t)));
 section.querySelector('.beliefs').replaceChildren(...(a.beliefs||[]).map((v,i)=>{const article=make('article'),body=make('div');body.append(make('h3',v.title),make('p',v.body));article.append(make('span',String(i+1).padStart(2,'0')),body);return article}));
}
window.STUDIO_READY=true;
})();