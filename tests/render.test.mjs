import test from 'node:test';
import assert from 'node:assert/strict';

test('application entry renders a project board, status borders, cards and inspector hooks',async()=>{
  let markup='';
  const el={addEventListener(){},querySelectorAll(){return []},set innerHTML(value){markup=value},get innerHTML(){return markup}};
  globalThis.localStorage={getItem(){return null},setItem(){}};
  globalThis.window={addEventListener(){}};
  globalThis.document={getElementById(id){return id==='app'?el:{className:'',textContent:''}},addEventListener(){}};
  await import('../src/app.mjs');
  assert.match(markup,/boardloom/i);
  assert.match(markup,/Opening Sequence/);
  assert.match(markup,/asset-card/);
  assert.match(markup,/--status-color:#84c9ab/);
  assert.match(markup,/Connections|connections/);
  assert.match(markup,/image-file-picker/);
  assert.match(markup,/Add images/);
  assert.match(markup,/data-click="settings"/);
});
