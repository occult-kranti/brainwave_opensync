import {cp,mkdir,rm,readFile,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
const root=fileURLToPath(new URL('.',import.meta.url));
const out=join(root,'dist');
await rm(out,{recursive:true,force:true});
await mkdir(out,{recursive:true});
for(const file of ['index.html','src','public','research']) {
  await cp(join(root,file),file==='public'?out:join(out,file),{recursive:true});
}
await mkdir(join(out,'code'),{recursive:true});
for(const file of ['src','tests','reference']) await cp(join(root,file),join(out,'code',file),{recursive:true});
await writeFile(join(out,'code/package.json'),JSON.stringify({name:'location-spectrum-model-source',private:true,type:'module',scripts:{test:'node --test tests/*.test.mjs'}},null,2)+'\n');
await cp(join(root,'../LICENSE'),join(out,'LICENSE'));
const commit=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
const modelSHA256=createHash('sha256').update(await readFile(join(root,'src/models.mjs'))).digest('hex');
const info=`export const BUILD_INFO = ${JSON.stringify({modelVersion:'1.0.0',researchDate:'2026-10-21',sourceCommit:commit,branch:'research/location-spectrum',modelSHA256})};\n`;
await writeFile(join(out,'src/build-info.mjs'),info);
await writeFile(join(out,'code/src/build-info.mjs'),info);
const sources=JSON.parse(await readFile(join(root,'public/data/sources.json'),'utf8'));
const graph=JSON.parse(await readFile(join(root,'public/data/graph.json'),'utf8'));
const manifest={site:'Fieldwork / Location Spectrum Lab',branch:'research/location-spectrum',commit,modelSHA256,path:'/brainwave_opensync/devices/location/',researchDate:'2026-10-21',sourceCount:sources.length,graphNodes:graph.nodes.length,graphEdges:graph.edges.length,physicalMeasurements:0,runtimeDependencies:0};
await writeFile(join(out,'deployment.json'),JSON.stringify(manifest,null,2)+'\n');
await writeFile(join(out,'.nojekyll'),'');
console.log(`Built Location Spectrum Lab: ${sources.length} sources, ${graph.nodes.length} graph nodes; simulations only.`);
