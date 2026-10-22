import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,readFileSync,writeFileSync,existsSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';

test('actual parent rsync policy preserves all independently published children',()=>{
 const policy=readFileSync(new URL('../deployment/parent-device-workflow.yml',import.meta.url),'utf8');
 const match=policy.match(/rsync (.+) device-observatory\/dist\/ site\/devices\//);
 assert.ok(match,'Parent publisher rsync command must be explicit');
 const flags=match[1].trim().split(/\s+/);
 const root=mkdtempSync(join(tmpdir(),'copper-publish-boundary-'));
 try{
  const source=join(root,'source'),target=join(root,'target');mkdirSync(source);mkdirSync(target);
  writeFileSync(join(source,'index.html'),'new parent');writeFileSync(join(target,'stale-parent.txt'),'stale');
  for(const name of ['location','position','copper']){
   mkdirSync(join(source,name));mkdirSync(join(target,name));
   writeFileSync(join(source,name,'keep.txt'),'incorrect parent copy');writeFileSync(join(target,name,'keep.txt'),`${name} owned by child`);
  }
  execFileSync('rsync',[...flags,source+'/',target+'/']);
  for(const name of ['location','position','copper'])assert.equal(readFileSync(join(target,name,'keep.txt'),'utf8'),`${name} owned by child`);
  assert.equal(readFileSync(join(target,'index.html'),'utf8'),'new parent');assert.equal(existsSync(join(target,'stale-parent.txt')),false);
 }finally{rmSync(root,{recursive:true,force:true})}
});
