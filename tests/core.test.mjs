import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,newProject,newBoard,newAsset,addStatus,removeStatus,addField,removeField,removeBoard,removeAsset,connect,countsByStatus,validateSnapshot} from '../src/core.mjs';

test('starter project is valid and shows asset workflow',()=>{
  const state=initialState();assert.equal(validateSnapshot(state),true);
  const p=state.projects[0],b=p.boards[0];assert.equal(p.assets.length,3);assert.equal(countsByStatus(p,b.id).approved,1);
});
test('statuses are configurable and deletion reassigns images without losing them',()=>{
  const p=newProject(),b=p.boards[0];const s=addStatus(p,'Blocking','#ff0000');const asset=newAsset(b.id,'Shot',s.id,{x:4,y:6});p.assets.push(asset);
  assert.equal(removeStatus(p,s.id),true);assert.equal(p.assets.length,1);assert.equal(asset.statusId,p.statuses[0].id);
  assert.throws(()=>addStatus(p,''),/name/);
});
test('custom fields support typed values and removal',()=>{
  const p=newProject();const f=addField(p,'Frame count','number');const a=newAsset(p.boards[0].id,'Ref',p.statuses[0].id,{x:0,y:0});p.assets.push(a);a.custom[f.id]='100';
  removeField(p,f.id);assert.equal(a.custom[f.id],undefined);assert.throws(()=>addField(p,'Broken','script'),/Unsupported/);
});
test('connections forbid cycles of same item, duplicates, cross-board links and clean on delete',()=>{
  const p=newProject(),a=newAsset(p.boards[0].id,'A',p.statuses[0].id,{x:0,y:0}),b=newAsset(p.boards[0].id,'B',p.statuses[0].id,{x:1,y:1});p.assets.push(a,b);
  assert.equal(connect(p,p.boards[0].id,a.id,b.id),true);assert.equal(connect(p,p.boards[0].id,a.id,b.id),false);assert.throws(()=>connect(p,p.boards[0].id,a.id,a.id),/itself/);
  assert.equal(p.edges.length,1);removeAsset(p,a.id);assert.equal(p.edges.length,0);
  const next=newBoard(p,'Second');assert.throws(()=>connect(p,next.id,b.id,b.id+'missing'),/same board/);
});
test('board deletion cascades assets and links safely',()=>{
  const p=newProject();const b=newBoard(p,'Another');const a=newAsset(b.id,'A',p.statuses[0].id,{x:1,y:1});p.assets.push(a);
  assert.deepEqual(removeBoard(p,b.id),[a.id]);assert.equal(p.assets.length,0);assert.throws(()=>removeBoard(p,p.boards[0].id),/at least one/);
});
test('snapshot verification rejects bad references and incompatible versions',()=>{
  const s=initialState();s.version=100;assert.throws(()=>validateSnapshot(s),/Invalid/);s.version=1;s.projects[0].assets[0].boardId='no-board';assert.throws(()=>validateSnapshot(s),/Invalid asset/);
});
