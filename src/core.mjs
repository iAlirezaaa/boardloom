/** Framework-independent domain model and guarded mutations. */
export const VERSION = 1;
export const uid = (prefix='id') => `${prefix}_${globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)}`;
const now = () => new Date().toISOString();
export const DEFAULT_STATUSES = [
  {id:'backlog', name:'Backlog', color:'#9a96a8'},
  {id:'working', name:'In progress', color:'#e3ad69'},
  {id:'review', name:'In review', color:'#84a9e8'},
  {id:'approved', name:'Approved', color:'#84c9ab'},
  {id:'fix', name:'Needs changes', color:'#e68fa4'}
];
export const DEFAULT_FIELDS = [
  {id:'shot', name:'Shot ID', type:'text'},
  {id:'owner', name:'Assignee', type:'text'},
  {id:'deadline', name:'Due date', type:'date'}
];
export const BOARD_CATEGORIES = ['Storyboard','Concept Art','Production','References','Other'];
export function newProject(name='Untitled project', demo=false) {
  const id=uid('project'), boardId=uid('board');
  return {
    id, name, description:'', createdAt:now(),
    statuses:structuredClone(DEFAULT_STATUSES),
    fields:structuredClone(DEFAULT_FIELDS),
    boards:[{id:boardId,name:'Main board',category:'Storyboard',storagePath:'',createdAt:now()}],
    assets:[],edges:[],
    ...(demo ? {sample:true} : {})
  };
}
export function initialState() {
  const project=newProject('Orion · Short Film',true);
  const board=project.boards[0]; board.name='Opening Sequence'; board.storagePath='Projects/Orion/Sequences/01_Opening';
  const items=[
    {id:'demo-a',name:'01 · Establishing frame',statusId:'approved',description:'Opening landscape: check visual mood, lighting consistency and composition.',sample:'/public/samples/frame-01.svg',category:'Storyboard',position:{x:190,y:200},custom:{shot:'SQ01-SH010',owner:'Layout',deadline:''}},
    {id:'demo-b',name:'02 · Character entrance',statusId:'review',description:'Review perspective and hero silhouette before final approval.',sample:'/public/samples/frame-02.svg',category:'Storyboard',position:{x:590,y:145},custom:{shot:'SQ01-SH020',owner:'Animation',deadline:''}},
    {id:'demo-c',name:'03 · City approach',statusId:'working',description:'Lighting pass and atmosphere pending.',sample:'/public/samples/frame-03.svg',category:'Storyboard',position:{x:980,y:260},custom:{shot:'SQ01-SH030',owner:'Lighting',deadline:''}}
  ];
  project.assets=items.map((a)=>({...a,boardId:board.id,sourcePath:`Samples/${a.name}.svg`,tags:[],createdAt:now()}));
  project.edges=[{id:'demo-e1',boardId:board.id,from:'demo-a',to:'demo-b',label:''},{id:'demo-e2',boardId:board.id,from:'demo-b',to:'demo-c',label:''}];
  return {version:VERSION,projects:[project],activeProjectId:project.id,activeBoardId:board.id};
}
export function activeProject(state) {return state.projects.find(p=>p.id===state.activeProjectId)||state.projects[0];}
export function activeBoard(state) {const p=activeProject(state); return p?.boards.find(b=>b.id===state.activeBoardId)||p?.boards[0];}
export const normalizeHex=(value)=> /^#[0-9a-f]{6}$/i.test(value)?value:'#9a96a8';
export function addStatus(project,name,color='#a0a0a0') {
  const clean=String(name||'').trim().slice(0,48);
  if (!clean) throw new Error('Status name is required');
  const status={id:uid('status'),name:clean,color:normalizeHex(color)};
  project.statuses.push(status);return status;
}
export function removeStatus(project,id) {
  if (project.statuses.length<2) throw new Error('Keep at least one status');
  if (!project.statuses.some(s=>s.id===id)) return false;
  project.statuses=project.statuses.filter(s=>s.id!==id);
  const fallback=project.statuses[0].id;
  for(const a of project.assets) if(a.statusId===id)a.statusId=fallback;
  return true;
}
export function addField(project,name,type='text') {
  const clean=String(name||'').trim().slice(0,48);
  if(!clean)throw new Error('Field name is required');
  if(!['text','number','date','url'].includes(type))throw new Error('Unsupported field type');
  const field={id:uid('field'),name:clean,type};project.fields.push(field);return field;
}
export function removeField(project,id) {
  project.fields=project.fields.filter(f=>f.id!==id);
  for(const asset of project.assets) delete asset.custom[id];
}
export function newBoard(project,name='New board',category='Storyboard') {
  const board={id:uid('board'),name:String(name).trim()||'New board',category,storagePath:'',createdAt:now()};
  project.boards.push(board);return board;
}
export function removeBoard(project,id) {
  if(project.boards.length<2)throw new Error('Keep at least one board');
  const removedIds=new Set(project.assets.filter(a=>a.boardId===id).map(a=>a.id));
  project.assets=project.assets.filter(a=>a.boardId!==id);
  project.edges=project.edges.filter(e=>e.boardId!==id&&!removedIds.has(e.from)&&!removedIds.has(e.to));
  project.boards=project.boards.filter(b=>b.id!==id);
  return [...removedIds];
}
export function newAsset(boardId, name, statusId, position, opts={}) {
  return {id:uid('asset'),boardId,name,description:'',statusId,category:'Reference',sourcePath:opts.sourcePath||name,tags:[],custom:{},position:{x:Math.max(0,position.x),y:Math.max(0,position.y)},createdAt:now(),...(opts.imageKey?{imageKey:opts.imageKey}:{})};
}
export function connect(project,boardId,from,to) {
  if(from===to)throw new Error('An item cannot link to itself');
  if(!project.assets.some(a=>a.id===from&&a.boardId===boardId)||!project.assets.some(a=>a.id===to&&a.boardId===boardId))throw new Error('Links must remain on the same board');
  if(project.edges.some(e=>e.boardId===boardId&&e.from===from&&e.to===to))return false;
  project.edges.push({id:uid('edge'),boardId,from,to,label:''});return true;
}
export function removeAsset(project,id) {
  const before=project.assets.length;
  project.assets=project.assets.filter(a=>a.id!==id);
  project.edges=project.edges.filter(e=>e.from!==id&&e.to!==id);
  return project.assets.length!==before;
}
export function validateSnapshot(snapshot) {
  if(!snapshot || snapshot.version!==VERSION || !Array.isArray(snapshot.projects) || snapshot.projects.length<1 || snapshot.projects.length>250)throw new Error('Invalid or incompatible Boardloom backup');
  const okText=(value,max=5000)=>typeof value==='string'&&value.length<=max;
  const unique=(list)=>new Set(list).size===list.length;
  const projectIds=snapshot.projects.map(p=>p?.id);
  if(!unique(projectIds)||!projectIds.includes(snapshot.activeProjectId))throw new Error('Invalid project selection');
  for(const project of snapshot.projects){
    if(!project || !okText(project.id,150)||!okText(project.name,160)||!Array.isArray(project.boards)||!project.boards.length||!Array.isArray(project.assets)||!Array.isArray(project.statuses)||!project.statuses.length||!Array.isArray(project.fields)||!Array.isArray(project.edges))throw new Error('Incomplete project data');
    const boardIds=project.boards.map(b=>b.id), statusIds=project.statuses.map(s=>s.id),assetIds=project.assets.map(a=>a.id),fieldIds=project.fields.map(f=>f.id);
    if(!unique(boardIds)||!unique(statusIds)||!unique(assetIds)||!unique(fieldIds))throw new Error('Duplicate entity identifiers');
    const boards=new Set(boardIds), statuses=new Set(statusIds), assets=new Map(project.assets.map(a=>[a.id,a]));
    for(const b of project.boards){
      if(!okText(b.id,150)||!okText(b.name,160)||!okText(b.category,100)||!okText(b.storagePath,2048))throw new Error('Invalid board data');
    }
    for(const s of project.statuses){
      if(!okText(s.id,150)||!okText(s.name,60)||!/^#[a-f0-9]{6}$/i.test(s.color))throw new Error('Invalid status definition');
    }
    for(const f of project.fields){
      if(!okText(f.id,150)||!okText(f.name,60)||!['text','number','date','url'].includes(f.type))throw new Error('Invalid custom field definition');
    }
    for(const a of project.assets){
      if(!okText(a.id,150)||!boards.has(a.boardId)||!statuses.has(a.statusId)||!okText(a.name,160)||!okText(a.description,20000)||!okText(a.category,100)||!okText(a.sourcePath,2048)||!Array.isArray(a.tags)||a.tags.some(t=>!okText(t,140))||!a.custom||typeof a.custom!=='object'||Array.isArray(a.custom)||!Number.isFinite(a.position?.x)||!Number.isFinite(a.position?.y)||a.position.x<0||a.position.y<0||a.position.x>10000000||a.position.y>10000000)throw new Error('Invalid asset references or positions');
      if(a.sample!==undefined&&!['/public/samples/frame-01.svg','/public/samples/frame-02.svg','/public/samples/frame-03.svg'].includes(a.sample))throw new Error('Invalid sample source');
      if(a.imageKey!==undefined&&!okText(a.imageKey,150))throw new Error('Invalid image key');
      if(Object.values(a.custom).some(v=>!okText(v,10000)))throw new Error('Invalid custom field value');
    }
    for(const e of project.edges){
      if(!okText(e.id,150)||!boards.has(e.boardId)||!assets.has(e.from)||!assets.has(e.to)||e.from===e.to||assets.get(e.from).boardId!==e.boardId||assets.get(e.to).boardId!==e.boardId)throw new Error('Invalid connection');
    }
  }
  const active=snapshot.projects.find(p=>p.id===snapshot.activeProjectId);
  if(!active.boards.some(b=>b.id===snapshot.activeBoardId))throw new Error('Invalid active board');
  return true;
}
export function countsByStatus(project,boardId) {
  const counts=Object.fromEntries(project.statuses.map(s=>[s.id,0]));
  for(const a of project.assets)if(a.boardId===boardId&&counts[a.statusId]!==undefined)counts[a.statusId]++;
  return counts;
}
