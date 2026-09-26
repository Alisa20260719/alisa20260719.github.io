(()=>{const host=document.createElement('dialog');host.id='reading-portal';host.setAttribute('aria-label','阅读，让边界向外');host.innerHTML='<iframe title="Alisa 的书籍迷宫"></iframe>';document.body.append(host);const frame=host.querySelector('iframe');let source=null,oldOverflow='',ready=false;
const visibility=()=>frame.contentWindow?.postMessage({type:'alisa-reading-visibility',visible:host.open},'*');
frame.addEventListener('load',visibility);
window.openReadingMaze=function(button){if(host.open)return;source=button;oldOverflow=document.body.style.overflow;if(!ready){if(window.READING_SCENE)frame.srcdoc=window.READING_SCENE;else frame.src='reading.html';ready=true}host.showModal();document.body.style.overflow='hidden';visibility();frame.focus()};
host.addEventListener('close',()=>{visibility();document.body.style.overflow=oldOverflow;source?.focus({preventScroll:true})});
window.addEventListener('message',event=>{if(event.source===frame.contentWindow&&event.data?.type==='alisa-reading-close'&&host.open)host.close()});
})();
