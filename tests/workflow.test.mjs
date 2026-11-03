import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState, newProject, newAsset, connect, batchUpdateAssets, exportBoardCsv, newBoard, validateSnapshot} from '../src/core.mjs';
import {createHistory} from '../src/history.mjs';

test('bulk status and category edits affect only selected assets', () => {
  const project = newProject(), board = project.boards[0];
  const a = newAsset(board.id, 'A', 'backlog', {x:0,y:0});
  const b = newAsset(board.id, 'B', 'backlog', {x:0,y:0});
  const c = newAsset(board.id, 'C', 'backlog', {x:0,y:0});
  project.assets.push(a,b,c);
  assert.equal(batchUpdateAssets(project,board.id,[a.id,b.id],{statusId:'review',category:'Storyboard'}),2);
  assert.equal(a.statusId,'review');assert.equal(b.category,'Storyboard');assert.equal(c.statusId,'backlog');
});
test('bulk moves prune broken connections and preserve remaining board', () => {
  const project=newProject(), board=project.boards[0], next=newBoard(project,'Next');
  const a=newAsset(board.id,'A','backlog',{x:0,y:0});
  const b=newAsset(board.id,'B','backlog',{x:0,y:0});
  project.assets.push(a,b);connect(project,board.id,a.id,b.id);
  assert.throws(()=>batchUpdateAssets(project,board.id,[a.id],{boardId:'missing'}),/Unknown/);
  assert.equal(project.edges.length,1);
  batchUpdateAssets(project,board.id,[a.id],{boardId:next.id});
  assert.equal(project.edges.length,0);assert.equal(a.boardId,next.id);assert.equal(validateSnapshot({...initialState(),projects:[project],activeProjectId:project.id,activeBoardId:board.id}),true);
});
test('bulk invalid selection is atomic, duplicates rejected',()=>{
  const project=newProject(), board=project.boards[0], a=newAsset(board.id,'A','backlog',{x:0,y:0});project.assets.push(a);
  assert.throws(()=>batchUpdateAssets(project,board.id,[a.id,'bad'],{statusId:'approved'}),/unknown/);
  assert.throws(()=>batchUpdateAssets(project,board.id,[a.id,a.id],{statusId:'approved'}),/unique/);
  assert.equal(a.statusId,'backlog');
});
test('CSV export escapes commas quotes and newlines and includes custom fields',()=>{
  const project=newProject(),board=project.boards[0];
  const a=newAsset(board.id,'Quote "A", test','approved',{x:0,y:0});a.description='first\nsecond';a.custom.owner='Crew';project.assets.push(a);
  const result=exportBoardCsv(project,board.id);
  assert.ok(result.startsWith('\uFEFF"ID"'));
  assert.match(result,/"Quote ""A"", test"/);
  assert.match(result,/"first\nsecond"/);
  assert.match(result,/"Crew"/);
  assert.equal(exportBoardCsv(project,board.id,[]).split('\r\n').length,2);
});
test('bounded metadata undo/redo preserves originals and clears redo on new action',()=>{
  const h=createHistory(2);const s=initialState();const a=structuredClone(s);s.projects[0].name='A';h.capture(a,s);
  const b=structuredClone(s);s.projects[0].name='B';h.capture(b,s);
  const previous=h.undo(s);assert.equal(previous.projects[0].name,'A');
  previous.projects[0].name='changed';
  const redo=h.redo(b);assert.equal(redo.projects[0].name,'B');
  const old=h.undo(redo);const c=structuredClone(old);old.projects[0].name='C';h.capture(c,old);assert.equal(h.canRedo,false);
});
