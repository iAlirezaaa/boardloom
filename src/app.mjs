import {uid,initialState,activeProject,activeBoard,newProject,newBoard,newAsset,addStatus,removeStatus,addField,removeField,removeBoard,removeAsset,connect,countsByStatus,BOARD_CATEGORIES,normalizeHex} from './core.mjs';
import {loadState,saveState,putImage,getImage,deleteImage,makeBackup,restoreBackup} from './storage.mjs';

let state=loadState();
let selectedId=null;
let statusFilter='all';
let categoryFilter='all';
let searchText='';
let settingsOpen=false;
let boardSettingsOpen=false;
let helpOpen=false;
let connectFrom=null;
let view={x:-85,y:10,z:0.88};
let pointer=null;
let toastTimer;
const imageUrls=new Map();
const app=document.getElementById('app');
const esc=(v)=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const attr=esc;
const icon=(name,size=18)=>{
  const paths={
    layers:'<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M8 8h8M8 12h8M8 16h5"/>',
    grid:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',
    settings:'<path d="M4 7h16M4 17h16M8 4v6M16 14v6"/>',
    upload:'<path d="M12 16V4m0 0-4 4m4-4 4 4M4 17v3h16v-3"/>',
    download:'<path d="M12 4v12m0 0-4-4m4 4 4-4M4 19v2h16v-2"/>',
    chevron:'<path d="m9 18 6-6-6-6"/>',
    link:'<path d="M10 13a5 5 0 0 0 7 .1l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7-.1l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
    search:'<circle cx="11" cy="11" r="7"/><path d="m16 16 4 4"/>',
    close:'<path d="M5 5l14 14M19 5 5 19"/>',
    trash:'<path d="M4 7h16M10 4h4M7 7l1 13h8l1-13M10 11v6m4-6v6"/>',
    image:'<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="9" r="2"/><path d="m5 18 5-5 3 3 3-4 3 5"/>',
    folder:'<path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v10H3z"/>',
    arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>',
    fit:'<path d="M9 3H4v5M15 3h5v5M4 16v5h5m11-5v5h-5"/>',
    more:'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
    info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5m0-8h.01"/>',
    check:'<path d="m4 12 5 5L20 6"/>',
    spark:'<path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5z"/>',
    path:'<path d="M4 6h7l3 3h6v9H4z"/>',
    external:'<path d="M14 3h7v7M10 14 21 3M21 13v8H3V3h8"/>'
  };
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||paths.grid}</svg>`;
};
function project(){return activeProject(state);}
function board(){return activeBoard(state);}
function assets(){return project().assets.filter(a=>a.boardId===board().id);}
function status(id){return project().statuses.find(s=>s.id===id)||project().statuses[0];}
function selected(){return project().assets.find(a=>a.id===selectedId)||null;}
function commit(rerender=true){try{saveState(state);}catch(e){notify(`Save failed: ${e.message}`,true);}if(rerender)render();}
function notify(message,error=false){const target=document.getElementById('toast'); target.textContent=message;target.className=`show${error?' danger':''}`;clearTimeout(toastTimer);toastTimer=setTimeout(()=>target.className='',3300);}
function resetPanels(){selectedId=null;connectFrom=null;settingsOpen=false;boardSettingsOpen=false;helpOpen=false;statusFilter='all';categoryFilter='all';searchText='';view={x:-85,y:10,z:.88};}
function options(values,selectedValue){return values.map(v=>`<option value="${attr(v)}"${v===selectedValue?' selected':''}>${esc(v)}</option>`).join('');}
function assetVisible(a){if(statusFilter!=='all'&&a.statusId!==statusFilter)return false;if(categoryFilter!=='all'&&a.category!==categoryFilter)return false;if(searchText&&!`${a.name} ${a.description} ${a.sourcePath} ${a.tags.join(' ')}`.toLowerCase().includes(searchText.toLowerCase()))return false;return true;}
function render(){
  const p=project(),b=board();
  if(!p||!b){state=initialState();saveState(state);return render();}
  const all=assets(),filtered=all.filter(assetVisible),counts=countsByStatus(p,b.id);
  const categories=[...new Set(all.map(a=>a.category).filter(Boolean))];
  app.innerHTML=`<div class="layout">
  <aside class="sidebar">
    <div class="brand"><div class="brand-mark">B<span>·</span></div><div><strong>boardloom</strong><small>VISUAL WORKSPACE</small></div></div>
    <div class="side-overline">WORKSPACE</div>
    <div class="project-switch"><select aria-label="Active project" data-change="project" class="project-select">${state.projects.map(x=>`<option value="${attr(x.id)}" ${x.id===p.id?'selected':''}>${esc(x.name)}</option>`).join('')}</select><button class="icon-btn muted" title="New project" data-click="new-project">${icon('plus')}</button></div>
    <div class="sidebar-section-head"><span>BOARDS <b>${p.boards.length}</b></span><button title="Create board" class="icon-btn" data-click="new-board">${icon('plus',16)}</button></div>
    <nav class="board-list" aria-label="Boards">${p.boards.map(x=>`<button class="board-item ${x.id===b.id?'active':''}" data-click="board" data-id="${attr(x.id)}">${icon('grid',17)}<span><strong>${esc(x.name)}</strong><small>${esc(x.category)}</small></span>${x.id===b.id?'<i></i>':''}</button>`).join('')}</nav>
    <div class="side-divider"></div>
    <div class="sidebar-section-head"><span>WORKFLOW</span><button class="icon-btn" title="Customize statuses" data-click="settings">${icon('settings',16)}</button></div>
    <div class="status-list"><button class="status-item ${statusFilter==='all'?'active':''}" data-click="filter-status" data-id="all"><span class="status-dot all-dot"></span>All statuses <b>${all.length}</b></button>${p.statuses.map(s=>`<button class="status-item ${statusFilter===s.id?'active':''}" data-click="filter-status" data-id="${attr(s.id)}"><span class="status-dot" style="background:${s.color}"></span>${esc(s.name)} <b>${counts[s.id]||0}</b></button>`).join('')}</div>
    <div class="sidebar-bottom"><div class="local-pill"><span class="live-dot"></span> Private · Local-first</div><button class="side-help" data-click="help">${icon('info',15)} Quick guide</button></div>
  </aside>
  <section class="content">
    <header class="topbar"><div class="breadcrumbs"><span>${esc(p.name)}</span>${icon('chevron',14)}<b>${esc(b.name)}</b><span class="category-tag">${esc(b.category)}</span></div><div class="top-actions"><button class="subtle-btn" data-click="import-backup" title="Import workspace backup">${icon('upload',16)} <span>Restore</span></button><button class="subtle-btn" data-click="export-backup" title="Save complete backup">${icon('download',16)} <span>Backup</span></button><span class="top-divider"></span><button class="icon-btn top-gear" title="Workspace settings" data-click="settings">${icon('settings',19)}</button></div></header>
    <div class="board-toolbar"><div class="board-title"><div class="board-title-row"><h1>${esc(b.name)}</h1><button class="icon-btn" title="Edit board details" data-click="board-settings">${icon('more',19)}</button></div><p>${all.length} visual assets · ${p.edges.filter(e=>e.boardId===b.id).length} connections${b.storagePath?' · '+esc(b.storagePath):''}</p></div>
      <div class="board-tools"><div class="search-box">${icon('search',17)}<input id="asset-search" type="search" placeholder="Search assets..." value="${attr(searchText)}" aria-label="Search visual assets"/></div><select data-change="category-filter" title="Filter asset category" class="filter-select"><option value="all">All categories</option>${options(categories,categoryFilter)}</select><button class="primary-btn" data-click="upload">${icon('plus',17)} Add images</button></div>
    </div>
    <div class="stage-area"><div id="stage" class="stage" aria-label="Image canvas"><div class="stage-grid"></div><div id="world" class="world" style="transform:translate(${view.x}px,${view.y}px) scale(${view.z})"><svg id="connections" class="connections" width="6000" height="6000" viewBox="0 0 6000 6000" aria-label="Visual connections">${buildEdges(filtered)}</svg>${filtered.map(buildCard).join('')}</div>${filtered.length===0?`<div class="empty-state" id="empty-state"><span class="empty-icon">${icon('image',30)}</span><h2>${all.length?'No matching assets':'Your visual story starts here'}</h2><p>${all.length?'Change your search or filters to see more assets.':'Drop your images here, arrange them freely, and turn every image into a trackable production item.'}</p><button class="secondary-btn" data-click="upload">${icon('plus',16)} Add images</button></div>`:''}
      <div id="drop-hint" class="drop-hint"><div>${icon('upload',34)}<h2>Drop images to your canvas</h2><p>PNG, JPG, WEBP, GIF and AVIF</p></div></div>
      ${connectFrom?`<div class="connection-banner">${icon('link',16)} Select a target card to connect <button data-click="cancel-link">Cancel</button></div>`:''}
      <div class="canvas-tip">${icon('info',14)} Drag cards · Drag empty space to pan · Scroll to zoom</div>
      <div class="zoom-tools"><button title="Fit content" data-click="fit">${icon('fit',18)}</button><button title="Zoom out" data-click="zoom-out">−</button><span>${Math.round(view.z*100)}%</span><button title="Zoom in" data-click="zoom-in">+</button></div>
    </div>
  </section>
  ${settingsOpen?renderSettings():boardSettingsOpen?renderBoardSettings():helpOpen?renderHelp():selected()?renderInspector(selected()):''}
  </div>
  <input type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/avif" multiple hidden id="image-file-picker" />
  <input type="file" accept="application/json,.json" hidden id="backup-file-picker" />`;
  hydrateImages();
}
function buildEdges(filtered){
  const visibleIds=new Set(filtered.map(a=>a.id));const byId=new Map(filtered.map(a=>[a.id,a]));
  return project().edges.filter(e=>e.boardId===board().id&&visibleIds.has(e.from)&&visibleIds.has(e.to)).map(e=>{
    const a=byId.get(e.from),b=byId.get(e.to);const x1=a.position.x+306,y1=a.position.y+99,x2=b.position.x,y2=b.position.y+99;
    const dx=Math.max(70,Math.abs(x2-x1)*.5);
    return `<g class="edge" data-edge="${attr(e.id)}"><path class="edge-glow" d="M ${x1} ${y1} C ${x1+dx} ${y1},${x2-dx} ${y2},${x2} ${y2}"/><path class="edge-line" d="M ${x1} ${y1} C ${x1+dx} ${y1},${x2-dx} ${y2},${x2} ${y2}"/><circle cx="${x2}" cy="${y2}" r="4" class="edge-end"/></g>`;
  }).join('');
}
function buildCard(a){
  const s=status(a.statusId),isActive=selectedId===a.id;
  const img=a.sample?`<img alt="" draggable="false" src="${attr(a.sample)}" />`:a.imageKey?`<img alt="" draggable="false" data-image-for="${attr(a.id)}"/>`:`<div class="image-placeholder">${icon('image',36)}</div>`;
  return `<article class="asset-card ${isActive?'selected':''} ${connectFrom?'link-target':''}" data-asset-id="${attr(a.id)}" style="left:${a.position.x}px;top:${a.position.y}px;--status-color:${s.color}" tabindex="0" aria-label="${attr(a.name)} — ${attr(s.name)}"><div class="asset-thumbnail">${img}<span class="asset-index">${esc(a.custom.shot||a.category)}</span><button class="asset-link" title="Connect to another image" aria-label="Connect ${attr(a.name)}" data-click="start-link" data-id="${attr(a.id)}">${icon('link',17)}</button></div><div class="asset-bottom"><div class="asset-name">${esc(a.name)}</div><div class="asset-meta"><span class="mini-dot" style="background:${s.color}"></span>${esc(s.name)} <span class="meta-sep">·</span> ${esc(a.category||'Reference')}</div></div><span class="asset-port"></span></article>`;
}
function renderInspector(a){
  const p=project(); const s=status(a.statusId);
  return `<aside class="detail-panel"><div class="detail-top"><span class="panel-eyebrow">ASSET INSPECTOR</span><button class="icon-btn" data-click="close-panel" title="Close inspector">${icon('close',18)}</button></div><div class="detail-scroll"><div class="detail-preview">${a.sample?`<img alt="${attr(a.name)}" src="${attr(a.sample)}">`:a.imageKey?`<img alt="${attr(a.name)}" data-image-for="${attr(a.id)}">`:`${icon('image',36)}`}</div><div class="detail-heading"><span class="detail-overline">VISUAL ASSET</span><span class="detail-id">${esc(a.id.slice(-8))}</span></div>
   <label class="field-label" for="asset-name">Name</label><input id="asset-name" class="form-input headline-input" data-change="asset-name" value="${attr(a.name)}" maxlength="160" />
   <label class="field-label" for="asset-description">Description</label><textarea id="asset-description" class="form-input text-area" rows="4" placeholder="Scene notes, feedback, production instructions..." data-change="asset-description">${esc(a.description)}</textarea>
   <div class="field-pair"><div><label class="field-label">Status</label><select class="form-input" data-change="asset-status" style="border-left:3px solid ${s.color}">${p.statuses.map(v=>`<option value="${attr(v.id)}" ${v.id===a.statusId?'selected':''}>${esc(v.name)}</option>`).join('')}</select></div><div><label class="field-label">Category</label><input class="form-input" list="categories" data-change="asset-category" value="${attr(a.category)}"/><datalist id="categories">${BOARD_CATEGORIES.map(c=>`<option value="${attr(c)}"></option>`).join('')}</datalist></div></div>
   <label class="field-label">Board</label><select class="form-input" data-change="asset-board">${p.boards.map(b=>`<option value="${attr(b.id)}" ${b.id===a.boardId?'selected':''}>${esc(b.name)}</option>`).join('')}</select>
   <label class="field-label">Original file / source path <span class="muted-text">(reference only)</span></label><input class="form-input" data-change="asset-path" placeholder="/production/sequence/sh010.png" value="${attr(a.sourcePath)}" />
   <label class="field-label">Tags <span class="muted-text">(comma-separated)</span></label><input class="form-input" data-change="asset-tags" placeholder="lighting, keyframe, animation" value="${attr((a.tags||[]).join(', '))}"/>
   <div class="custom-heading"><strong>CUSTOM FIELDS</strong><button data-click="settings">${icon('settings',14)} Edit fields</button></div>
   ${p.fields.length?p.fields.map(f=>`<label class="field-label">${esc(f.name)}<input class="form-input" type="${f.type==='url'?'url':f.type==='number'?'number':f.type==='date'?'date':'text'}" data-change="custom" data-id="${attr(f.id)}" value="${attr(a.custom[f.id]??'')}" placeholder="${f.type==='text'?'Add '+attr(f.name.toLowerCase()):''}" /></label>`).join(''):'<p class="muted-note">No custom fields. Add them in settings.</p>'}
   <div class="detail-actions"><button class="secondary-btn" data-click="start-link" data-id="${attr(a.id)}">${icon('link',16)} Connect image</button><button class="danger-btn" data-click="delete-asset">${icon('trash',16)} Delete</button></div></div></aside>`;
}
function renderSettings(){
  const p=project();
  return `<aside class="detail-panel settings-panel"><div class="detail-top"><span class="panel-eyebrow">WORKSPACE SETTINGS</span><button class="icon-btn" data-click="close-panel">${icon('close',18)}</button></div><div class="detail-scroll"><h2>Customize your workflow</h2><p class="panel-description">Define the statuses and metadata shared by every image in this project.</p><label class="field-label">Project name</label><input class="form-input" data-change="project-name" value="${attr(p.name)}" maxlength="90"/><label class="field-label">Project description</label><textarea class="form-input text-area" rows="2" data-change="project-description">${esc(p.description)}</textarea>
    <div class="custom-heading section-heading"><strong>STATUS PALETTE</strong><span class="section-count">${p.statuses.length}</span></div><p class="muted-note">Border colors update on every asset across every board.</p>
    <div class="editor-list">${p.statuses.map(s=>`<div class="editor-row"><input class="color-input" type="color" aria-label="Color for ${attr(s.name)}" value="${attr(normalizeHex(s.color))}" data-change="status-color" data-id="${attr(s.id)}"/><input class="form-input" value="${attr(s.name)}" data-change="status-name" data-id="${attr(s.id)}" maxlength="48" aria-label="Status name"/><button class="icon-btn delete-small" title="Remove status" data-click="remove-status" data-id="${attr(s.id)}">${icon('trash',16)}</button></div>`).join('')}</div>
    <button class="add-row" data-click="add-status">${icon('plus',15)} Add status</button>
    <div class="custom-heading section-heading"><strong>CUSTOM METADATA FIELDS</strong><span class="section-count">${p.fields.length}</span></div><p class="muted-note">Fields appear in the inspector for every image. Supports text, numbers, dates and URLs.</p>
    <div class="editor-list">${p.fields.map(f=>`<div class="editor-row"><input class="form-input" value="${attr(f.name)}" data-change="field-name" data-id="${attr(f.id)}" maxlength="48" aria-label="Field name"/><select class="form-input field-type" data-change="field-type" data-id="${attr(f.id)}">${options(['text','number','date','url'],f.type)}</select><button class="icon-btn delete-small" title="Delete custom field" data-click="remove-field" data-id="${attr(f.id)}">${icon('trash',16)}</button></div>`).join('')}</div>
    <button class="add-row" data-click="add-field">${icon('plus',15)} Add field</button><div class="settings-footer">Changes save automatically to your device.</div></div></aside>`;
}
function renderBoardSettings(){
 const b=board(),p=project();
 return `<aside class="detail-panel"><div class="detail-top"><span class="panel-eyebrow">BOARD SETTINGS</span><button class="icon-btn" data-click="close-panel">${icon('close',18)}</button></div><div class="detail-scroll"><h2>Board details</h2><p class="panel-description">Organize boards and attach meaningful production storage paths.</p>
 <label class="field-label">Board name</label><input class="form-input" value="${attr(b.name)}" data-change="board-name" maxlength="100" />
 <label class="field-label">Board category</label><input class="form-input" list="board-categories" data-change="board-category" value="${attr(b.category)}"/><datalist id="board-categories">${BOARD_CATEGORIES.map(c=>`<option value="${attr(c)}"></option>`).join('')}</datalist>
 <label class="field-label">Storage path <span class="muted-text">(reference only)</span></label><input class="form-input" data-change="board-path" value="${attr(b.storagePath)}" placeholder="Projects/Film/Sequences/Opening" /><div class="path-info">${icon('folder',17)} The path is saved as metadata. Browser security prevents direct access to arbitrary local folders.</div>
 <div class="detail-actions"><button class="danger-btn" data-click="delete-board" ${p.boards.length<2?'disabled':''}>${icon('trash',16)} Delete board</button></div></div></aside>`;
}
function renderHelp(){return `<aside class="detail-panel"><div class="detail-top"><span class="panel-eyebrow">QUICK GUIDE</span><button class="icon-btn" data-click="close-panel">${icon('close',18)}</button></div><div class="detail-scroll"><h2>Make images actionable.</h2><p class="panel-description">Boardloom blends visual reference boards with production tracking.</p><div class="help-row"><b>01 · Add</b><p>Drag image files onto the canvas or click Add images. Files stay on this device.</p></div><div class="help-row"><b>02 · Arrange</b><p>Drag images freely. Drag the canvas background to pan; scroll to zoom.</p></div><div class="help-row"><b>03 · Track</b><p>Select an image to edit its colored status, descriptions, tags and custom fields.</p></div><div class="help-row"><b>04 · Connect</b><p>Click the chain icon on one image, then another to create a directional dependency.</p></div><div class="help-row"><b>05 · Organize</b><p>Create multiple boards, set categories, and record paths for boards or source assets.</p></div><div class="help-row"><b>06 · Preserve</b><p>Backup exports a portable JSON with the images included. Restore recovers the workspace.</p></div><p class="muted-note">Designed for desktop browsers. There is no server sync or multi-user collaboration in v0.1.</p></div></aside>`;}
async function hydrateImages(){
  const targets=[...app.querySelectorAll('img[data-image-for]')];
  for(const img of targets){
    const asset=project().assets.find(a=>a.id===img.dataset.imageFor);
    if(!asset?.imageKey)return;
    if(!imageUrls.has(asset.imageKey)){
      try{const blob=await getImage(asset.imageKey);if(blob)imageUrls.set(asset.imageKey,URL.createObjectURL(blob));}
      catch(e){console.warn('Cannot load image',e);}
    }
    if(img.isConnected&&imageUrls.has(asset.imageKey))img.src=imageUrls.get(asset.imageKey);
  }
}
function clearUrls(){for(const url of imageUrls.values())URL.revokeObjectURL(url);imageUrls.clear();}
function setView(){const world=document.getElementById('world');if(world)world.style.transform=`translate(${view.x}px,${view.y}px) scale(${view.z})`;const zoom=document.querySelector('.zoom-tools span');if(zoom)zoom.textContent=`${Math.round(view.z*100)}%`;}
function zoomAt(factor,px,py){const stage=document.getElementById('stage');if(!stage)return;const box=stage.getBoundingClientRect();const x=px??box.width/2,y=py??box.height/2;const z=Math.max(.2,Math.min(2.5,view.z*factor));view.x=x-(x-view.x)*z/view.z;view.y=y-(y-view.y)*z/view.z;view.z=z;setView();}
function toWorld(clientX,clientY){const bounds=document.getElementById('stage').getBoundingClientRect();return{x:(clientX-bounds.left-view.x)/view.z,y:(clientY-bounds.top-view.y)/view.z};}
function fit(){const a=assets().filter(assetVisible);const stage=document.getElementById('stage');if(!stage)return;const box=stage.getBoundingClientRect();if(!a.length){view={x:60,y:75,z:1};setView();return;}const minX=Math.min(...a.map(x=>x.position.x)),maxX=Math.max(...a.map(x=>x.position.x+306));const minY=Math.min(...a.map(x=>x.position.y)),maxY=Math.max(...a.map(x=>x.position.y+240));const z=Math.min(1.25,Math.max(.25,Math.min((box.width-96)/(maxX-minX),(box.height-130)/(maxY-minY))));view={z,x:(box.width-(maxX-minX)*z)/2-minX*z,y:(box.height-(maxY-minY)*z)/2-minY*z};setView();}
function refreshEdges(){const svg=document.getElementById('connections');if(svg)svg.innerHTML=buildEdges(assets().filter(assetVisible));}
async function addFiles(files,position){
  const valid=[...files].filter(f=>['image/png','image/jpeg','image/webp','image/gif','image/avif'].includes(f.type));
  if(!valid.length){notify('Only PNG, JPG, WEBP, GIF or AVIF image files are supported.',true);return;}
  const p=project(),b=board();let added=0;
  for(const file of valid){try{
    const a=newAsset(b.id,file.name.replace(/\.[^.]+$/,''),p.statuses[0].id,{x:Math.round(position.x+added*36),y:Math.round(position.y+added*36)},{sourcePath:file.webkitRelativePath||file.name,imageKey:uid('image')});
    await putImage(a.imageKey,file);
    p.assets.push(a);added++;
  }catch(e){notify(`Could not store ${file.name}: ${e.message}`,true);}}
  if(added){commit();notify(`${added} image${added===1?'':'s'} added to ${b.name}.`);}
}
function download(name,content,type){const blob=new Blob([content],{type});const url=URL.createObjectURL(blob);const anchor=document.createElement('a');anchor.href=url;anchor.download=name;document.body.append(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);}
function runClick(target){
  const action=target.dataset.click,id=target.dataset.id;
  const p=project();
  try{switch(action){
    case 'board':state.activeBoardId=id;resetPanels();commit();break;
    case 'new-board':{const name=prompt('Board name','New board');if(name===null)return;const b=newBoard(p,name);state.activeBoardId=b.id;resetPanels();boardSettingsOpen=true;commit();break;}
    case 'new-project':{const name=prompt('Project name','Untitled project');if(name===null)return;const next=newProject(name);state.projects.push(next);state.activeProjectId=next.id;state.activeBoardId=next.boards[0].id;resetPanels();commit();break;}
    case 'filter-status':statusFilter=id;render();break;
    case 'settings':settingsOpen=true;boardSettingsOpen=false;helpOpen=false;render();break;
    case 'board-settings':boardSettingsOpen=true;settingsOpen=false;helpOpen=false;render();break;
    case 'help':helpOpen=true;boardSettingsOpen=false;settingsOpen=false;render();break;
    case 'close-panel':settingsOpen=false;boardSettingsOpen=false;helpOpen=false;selectedId=null;render();break;
    case 'add-status':addStatus(p,`Status ${p.statuses.length+1}`,'#ba9ae1');commit();break;
    case 'remove-status':if(!confirm(`Delete "${p.statuses.find(s=>s.id===id)?.name}"? Assigned images will move to the first status.`))return;removeStatus(p,id);if(statusFilter===id)statusFilter='all';commit();break;
    case 'add-field':addField(p,`Custom field ${p.fields.length+1}`);commit();break;
    case 'remove-field':if(!confirm('Remove this field and all values stored in it?'))return;removeField(p,id);commit();break;
    case 'delete-board':{if(!confirm('Delete this board, all its images and connections? This cannot be undone without a backup.'))return;const imageKeys=p.assets.filter(a=>a.boardId===board().id).map(a=>a.imageKey).filter(Boolean);removeBoard(p,board().id);for(const key of imageKeys){deleteImage(key).catch(console.warn);if(imageUrls.has(key)){URL.revokeObjectURL(imageUrls.get(key));imageUrls.delete(key);}}state.activeBoardId=p.boards[0].id;resetPanels();commit();break;}
    case 'delete-asset':{const a=selected();if(!a||!confirm(`Delete "${a.name}" and its connections?`))return;removeAsset(p,a.id);if(a.imageKey){deleteImage(a.imageKey).catch(console.warn);if(imageUrls.has(a.imageKey)){URL.revokeObjectURL(imageUrls.get(a.imageKey));imageUrls.delete(a.imageKey);}}selectedId=null;commit();break;}
    case 'start-link':connectFrom=id;selectedId=null;settingsOpen=false;boardSettingsOpen=false;render();notify('Click another image to draw a dependency arrow.');break;
    case 'cancel-link':connectFrom=null;render();break;
    case 'upload':document.getElementById('image-file-picker').click();break;
    case 'export-backup':void (async()=>{try{notify('Preparing complete backup with image data...');const backup=await makeBackup(state);download(`boardloom-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify(backup),'application/json');notify('Backup exported.');}catch(e){notify(e.message,true);}})();break;
    case 'import-backup':document.getElementById('backup-file-picker').click();break;
    case 'fit':fit();break;
    case 'zoom-in':zoomAt(1.2);break;
    case 'zoom-out':zoomAt(1/1.2);break;
    default:break;
  }}catch(e){notify(e.message,true);}
}
function runChange(target){
  const a=selected(),p=project(),b=board(),id=target.dataset.id,val=target.value,which=target.dataset.change;
  try{switch(which){
    case 'project':state.activeProjectId=val;state.activeBoardId=activeProject(state).boards[0].id;resetPanels();break;
    case 'category-filter':categoryFilter=val;render();return;
    case 'asset-name':if(a)a.name=val.trim()||'Untitled asset';break;
    case 'asset-description':if(a)a.description=val;break;
    case 'asset-status':if(a&&p.statuses.some(s=>s.id===val))a.statusId=val;break;
    case 'asset-category':if(a)a.category=val.trim().slice(0,80);break;
    case 'asset-board':if(a&&p.boards.some(x=>x.id===val)){a.boardId=val;p.edges=p.edges.filter(e=>e.from!==a.id&&e.to!==a.id);selectedId=null;}break;
    case 'asset-path':if(a)a.sourcePath=val.slice(0,2048);break;
    case 'asset-tags':if(a)a.tags=val.split(',').map(v=>v.trim()).filter(Boolean).slice(0,30);break;
    case 'custom':if(a&&p.fields.some(f=>f.id===id))a.custom[id]=val.slice(0,4000);break;
    case 'project-name':p.name=val.trim()||'Untitled project';break;
    case 'project-description':p.description=val;break;
    case 'board-name':b.name=val.trim()||'Untitled board';break;
    case 'board-category':b.category=val.trim()||'Other';break;
    case 'board-path':b.storagePath=val.slice(0,2048);break;
    case 'status-color':{const s=p.statuses.find(s=>s.id===id);if(s)s.color=normalizeHex(val);break;}
    case 'status-name':{const s=p.statuses.find(s=>s.id===id);if(s)s.name=val.trim().slice(0,48)||s.name;break;}
    case 'field-name':{const f=p.fields.find(f=>f.id===id);if(f)f.name=val.trim().slice(0,48)||f.name;break;}
    case 'field-type':{const f=p.fields.find(f=>f.id===id);if(f&&['text','number','date','url'].includes(val))f.type=val;break;}
    default:return;
  }commit();}catch(e){notify(e.message,true);}
}
app.addEventListener('click',(event)=>{
  const button=event.target.closest('[data-click]');if(button){event.stopPropagation();runClick(button);return;}
  const card=event.target.closest('.asset-card');if(card){
    const id=card.dataset.assetId;
    if(connectFrom){try{if(connect(project(),board().id,connectFrom,id)){notify('Connection created.');}else{notify('Connection already exists.');}connectFrom=null;selectedId=null;commit();}catch(e){notify(e.message,true);}return;}
    selectedId=id;settingsOpen=boardSettingsOpen=helpOpen=false;render();
  }
});
app.addEventListener('change',(event)=>{
  if(event.target.id==='image-file-picker'){const stage=document.getElementById('stage');const bounds=stage.getBoundingClientRect();void addFiles(event.target.files,toWorld(bounds.left+bounds.width/2-130,bounds.top+bounds.height/2-100));event.target.value='';return;}
  if(event.target.id==='backup-file-picker'){
    const file=event.target.files[0];event.target.value='';if(!file)return;
    if(!confirm('Restore will replace your current workspace. Export a backup first if you need it. Continue?'))return;
    void (async()=>{try{const backup=JSON.parse(await file.text());await restoreBackup(backup);clearUrls();state=backup.workspace;resetPanels();commit();notify('Workspace restored from backup.');}catch(e){notify(`Restore failed: ${e.message}`,true);}})();return;
  }
  if(event.target.dataset.change)runChange(event.target);
});
app.addEventListener('input',(event)=>{
 if(event.target.id==='asset-search'){searchText=event.target.value;const cursor=event.target.selectionStart;render();const input=document.getElementById('asset-search');input?.focus();input?.setSelectionRange(cursor,cursor);}
});
app.addEventListener('pointerdown',(event)=>{
  if(event.button!==0&&event.button!==1)return;
  if(event.target.closest('button,input,textarea,select'))return;
  const stage=event.target.closest('#stage');if(!stage)return;
  const card=event.target.closest('.asset-card');
  if(card&&event.button===0){
    if(connectFrom)return;
    const asset=project().assets.find(a=>a.id===card.dataset.assetId);if(!asset)return;
    pointer={kind:'asset',id:asset.id,startX:event.clientX,startY:event.clientY,x:asset.position.x,y:asset.position.y,moved:false};
    card.setPointerCapture(event.pointerId);
  }else{
    pointer={kind:'pan',startX:event.clientX,startY:event.clientY,x:view.x,y:view.y,moved:false};
    stage.setPointerCapture(event.pointerId);stage.classList.add('panning');
  }
});
app.addEventListener('pointermove',(event)=>{
 if(!pointer)return;
 const dx=event.clientX-pointer.startX,dy=event.clientY-pointer.startY;
 if(Math.hypot(dx,dy)>3)pointer.moved=true;
 if(pointer.kind==='pan'){
   view.x=pointer.x+dx;view.y=pointer.y+dy;setView();
 }else{
   const asset=project().assets.find(a=>a.id===pointer.id);if(!asset)return;
   asset.position.x=Math.round(Math.max(0,pointer.x+dx/view.z));asset.position.y=Math.round(Math.max(0,pointer.y+dy/view.z));
   const element=app.querySelector(`[data-asset-id="${CSS.escape(asset.id)}"]`);
   if(element){element.style.left=`${asset.position.x}px`;element.style.top=`${asset.position.y}px`;}
   refreshEdges();
 }
});
function endPointer(){if(!pointer)return;const ended=pointer;pointer=null;document.getElementById('stage')?.classList.remove('panning');if(ended.kind==='asset'&&ended.moved)commit(false);}
app.addEventListener('pointerup',endPointer);app.addEventListener('pointercancel',endPointer);
app.addEventListener('wheel',event=>{
 if(!event.target.closest('#stage'))return;event.preventDefault();const bounds=document.getElementById('stage').getBoundingClientRect();zoomAt(event.deltaY<0?1.08:1/1.08,event.clientX-bounds.left,event.clientY-bounds.top);
},{passive:false});
app.addEventListener('dragover',event=>{if(!event.target.closest('#stage')||!event.dataTransfer?.types.includes('Files'))return;event.preventDefault();document.getElementById('drop-hint')?.classList.add('visible');});
app.addEventListener('dragleave',event=>{if(!event.target.closest('#stage'))return;const next=event.relatedTarget;if(!next||!next.closest?.('#stage'))document.getElementById('drop-hint')?.classList.remove('visible');});
app.addEventListener('drop',event=>{if(!event.target.closest('#stage'))return;event.preventDefault();document.getElementById('drop-hint')?.classList.remove('visible');void addFiles(event.dataTransfer.files,toWorld(event.clientX,event.clientY));});
document.addEventListener('keydown',event=>{
 if(event.key==='Escape'){if(connectFrom){connectFrom=null;render();}else if(settingsOpen||boardSettingsOpen||helpOpen||selectedId){settingsOpen=boardSettingsOpen=helpOpen=false;selectedId=null;render();}}
 if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==='s'){event.preventDefault();commit(false);notify('Saved locally. Use Backup to export a portable file.');}
});
window.addEventListener('beforeunload',clearUrls);
render();
