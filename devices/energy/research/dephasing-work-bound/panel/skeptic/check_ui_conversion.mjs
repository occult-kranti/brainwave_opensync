/** Focused DOM harness: tests conversion behavior, not layout/browser validity. */
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../../..');
const source=path.join(root,'src/dephasing-ui.mjs');
const digest=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const sourceSha256=digest(source);
const nodes=new Map();
function element(id){if(!nodes.has(id))nodes.set(id,{value:'',validity:{valid:true},textContent:'',innerHTML:'',hidden:true,disabled:true,handlers:{},addEventListener(event,handler){this.handlers[event]=handler;}});return nodes.get(id);}
globalThis.document={getElementById:element,querySelectorAll:()=>[]};
globalThis.fetch=async href=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(path.join(root,href),'utf8'))});
function values(p,k,d='.25',gap='1'){for(const [id,value]of Object.entries({'e1-population':p,'e1-fraction':k,'e1-retention':d,'e1-gap':gap}))element(id).value=value;}
values('.5','.8');
await import(new URL('../../../../src/dephasing-ui.mjs',import.meta.url));
const results=[];
function run(name,p,k,shouldReject){values(p,k);element('e1-form').handlers.input();const error=element('e1-error');const observed={name,p,k,errorVisible:!error.hidden,error:error.textContent,resultCleared:element('e1-result').innerHTML==='',exportDisabled:element('e1-export').disabled};observed.passed=shouldReject?observed.errorVisible&&observed.resultCleared&&observed.exportDisabled:!observed.errorVisible&&!observed.resultCleared&&!observed.exportDisabled;results.push(observed);}
run('positive product underflow','.5','5e-324',true);
run('positive text parse underflow','.5','1e-324',true);
run('literal zero remains valid','.5','0',false);
run('ground endpoint maximum is physically zero','0','5e-324',false);
run('excited endpoint maximum is physically zero','1','5e-324',false);
run('balanced ordinary coherent input','.5','.8',false);
const unchanged=digest(source)===sourceSha256;
const result={schema:'e1-skeptic-ui-conversion/1',passed:unchanged&&results.every(x=>x.passed),sourceSha256,sourceUnchangedDuringExecution:unchanged,checks:results,scope:'DOM harness independently exercises actual UI input handler. It does not certify browser input validity, layout, graph rendering or deployment; those remain browser gates.'};
console.log(JSON.stringify(result,null,2));
process.exitCode=result.passed?0:1;
