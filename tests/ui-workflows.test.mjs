import test from 'node:test';
import assert from 'node:assert/strict';

test('table workflow, row status updates and Undo are wired in the browser entry',async()=>{
  const handlers={};let markup='',saved='';
  const el={addEventListener(type,cb){handlers[type]=cb;},querySelectorAll(){return[];},set innerHTML(x){markup=x;},get innerHTML(){return markup;}};
  const toast={textContent:'',className:''};
  globalThis.localStorage={getItem(){return saved||null;},setItem(_k,v){saved=v;}};
  globalThis.window={addEventListener(){}};
  globalThis.document={getElementById(id){return id==='app'?el:id==='stage'?null:toast;},addEventListener(){}};
  await import('../src/app.mjs');
  assert.match(markup,/view-table/);
  const click=(action,id)=>handlers.click({stopPropagation(){},target:{closest(selector){return selector==='[data-click]'?{dataset:{click:action,id}}:null;}}});
  click('view-table');
  assert.match(markup,/Production overview/);
  assert.match(markup,/table-asset-name/);
  assert.doesNotThrow(()=>handlers.change({target:{id:'image-file-picker',files:[],value:''}}));
  handlers.change({target:{dataset:{change:'row-status',id:'demo-b'},value:'approved'}});
  assert.equal(JSON.parse(saved).projects[0].assets.find(a=>a.id==='demo-b').statusId,'approved');
  click('undo');
  assert.equal(JSON.parse(saved).projects[0].assets.find(a=>a.id==='demo-b').statusId,'review');
  click('view-canvas');
  assert.match(markup,/asset-card/);
});
