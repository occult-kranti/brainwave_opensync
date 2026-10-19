import test from 'node:test';
import assert from 'node:assert/strict';
import {sources} from '../src/sources.mjs';
import {devices} from '../src/catalog.mjs';
import {deviceModels} from '../src/models.mjs';
test('every public hypothesis and model has provenance and a falsifier',()=>{
  const ids = new Set(sources.map(s=>s.id));
  assert.equal(ids.size,sources.length);
  for(const s of sources){
    for(const key of ['title','url','publisher','date','kind','status','readScope','claim','limit','application']) assert.ok(s[key]?.trim(),`${s.id}: ${key}`);
    assert.equal(new URL(s.url).protocol,'https:');
  }
  for(const device of devices){
    assert.ok(deviceModels[device.id]);
    for(const id of device.sourceIds) assert.ok(ids.has(id),`Missing ${id}`);
    for(const h of device.hypotheses) for(const key of ['useCase','prediction','control','falsifier']) assert.ok(h[key]);
  }
});
