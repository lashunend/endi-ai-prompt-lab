import {styles,locations,selectables} from './shoot-options.mjs';
import {tools,customizeFields,improvementOptions,value,isTwin,realSubject,issueMap} from './schema.mjs';
import {renderPrompt,completeText,wordCount,correctionConflicts,profileKeys,series,referenceList} from './prompts.mjs';
import {vault,collections} from './vault.mjs';
import {read,write,empty,validate,merge} from './storage.mjs';
const app=document.querySelector('#app');
const nav=document.querySelector('#nav');
const menu=document.querySelector('#menu');
const status=document.querySelector('#status');
const e=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const glyphs={
 twin:'<circle cx="12" cy="7" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
 influencer:'<path d="M12 2c1 6 4 9 10 10-6 1-9 4-10 10C11 16 8 13 2 12c6-1 9-4 10-10Z"/>',
 shoot:'<path d="M3 7h5l2-3h4l2 3h5a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Z"/><circle cx="12" cy="13" r="4"/>',
 vault:'<path d="m2 8 10-5 10 5-10 5L2 8Zm0 5 10 5 10-5M2 18l10 5 10-5"/>',
 consistency:'<path d="M20 8a8 8 0 0 0-14-3L3 8m0-5v5h5m-4 8a8 8 0 0 0 14 3l3-3m0 5v-5h-5"/>',
 video:'<rect x="2" y="4" width="20" height="16" rx="3"/><path d="m10 8 6 4-6 4Z"/>',
 fixer:'<path d="M15 3a5 5 0 0 0-5 7L3 17a2.8 2.8 0 0 0 4 4l7-7a5 5 0 0 0 7-5l-4 3-3-3 3-4Z"/>'
};
const icon=id=>`<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${glyphs[id]}</svg>`;
const previewPortrait='<figure class="espresso-portrait"><img src="./espresso-portrait.jpg" width="772" height="701" alt="Black woman in profile in champagne satin and gold earrings, lit by warm studio light"><figcaption>Editorial example</figcaption></figure>';
const btn=(action,label,primary=false)=>`<button type="button" data-action="${action}"${primary?' class="primary"':''}>${e(label)}</button>`;
const link=(url,label)=>`<a class="button" href="${url}">${e(label)}</a>`;
const open='<a class="button" href="https://chatgpt.com/" target="_blank" rel="noopener noreferrer">Open ChatGPT</a>';
const states={};
let data=empty(),model,route='',timer,previous='',backup;
const previews=new Map();
const defaults={twin:{identity:true,chat:'Fresh chat',crop:'Head-and-shoulders'},fixer:{chat:'Fresh chat'},shoot:{direction:'Style Library',locationGroup:'Photography studio',background:'Dark studio backdrop',light:'Studio softbox',crop:'Waist-up portrait'},video:{},consistency:{chat:'Fresh chat'}};
const make=tool=>({a:{...defaults[tool]},out:{},title:'',notes:'',series:false});
let loadError='';
try{data=read(localStorage)}catch(err){loadError=err.message}
function say(message){status.textContent=message;clearTimeout(timer);timer=setTimeout(()=>status.textContent='',4200)}
function persist(candidate){try{write(localStorage,candidate);data=candidate;return true}catch(err){say('Could not save. '+err.message);return false}}
function go(path){location.hash=path}
function clearPreviews(){for(const url of previews.values())URL.revokeObjectURL(url);previews.clear()}
function current(){
 const [tool='',view='',extra='']=location.hash.slice(1).split('/');
 const steps=tools[tool]?.steps||[];
 const index=/^\d+$/.test(view)?Math.max(0,Math.min(steps.length-1,+view-1)):0;
 return {tool,view,extra,index,steps};
}
function tabs(tool,view){
 const items={vault:[['','Browse'],['favorites','Favorites'],['saved','My Prompts']],consistency:[['','Build'],['drift','Fix Drift'],['checklist','Checklist'],['saved','Saved']],fixer:[['','Fix a Result'],['improve','Improve My Prompt'],['help','Help'],['saved','Saved']]}[tool]||[['','Create'],['saved',tools[tool].saved||'Saved']];
 return '<div class="tabs">'+items.map(([id,label])=>`<a href="#${tool}${id?'/'+id:''}" ${(view===id||(!id&&/^\d+$/.test(view)))?'aria-current="page"':''}>${label}</a>`).join('')+'</div>';
}
function control(f,a){
 const {key,label,options,check,multi,required,long,record}=f;
 const stored=a[key]??'';
 const legacyHeritage=key==='heritage'&&stored&&options&&!options.includes(stored);
 const val=legacyHeritage?'Custom':stored;
 if(multi)return `<fieldset class="multi-field"><legend>${e(label)}</legend><div class="choices">${options.map(item=>`<label class="choice"><input type="checkbox" data-field="${key}" data-item="${e(item)}" ${val.includes(item)?'checked':''}>${e(item)}</label>`).join('')}</div></fieldset>`;
 if(check)return `<label><input type="checkbox" data-field="${key}" ${val?'checked':''}>${e(label)}</label>`;
 const opts=record?data.records.filter(r=>a.startSource==='My AI Twin'?r.tool==='twin':a.startSource==='My AI Influencer'?r.tool==='influencer'||(r.tool==='consistency'&&/Fictional|Influencer/.test(r.answers.subjectType||'')):['twin','influencer','consistency','shoot'].includes(r.tool)).map(r=>[r.id,r.title]):options?.map(s=>[s,s]);
 if(opts){
  const group=opts.map(([id,text])=>`<label class="choice"><input type="radio" name="choice-${key}" data-field="${key}" value="${e(id)}" ${val===id?'checked':''}><span>${e(key==='heritage'&&id==='Custom'?'Custom / describe it yourself':text)}</span></label>`).join('');
  const custom=val==='Custom'?`<label for="field-${key}Custom">Describe your choice</label><input id="field-${key}Custom" data-field="${key}Custom" maxlength="1000" value="${e(legacyHeritage?stored:a[key+'Custom'])}">`:'';
  return `<fieldset class="choice-field"><legend>${e(label)}${required?' *':''}</legend><div class="choices">${group}</div>${custom}${record&&!opts.length?'<p class="meta">Save a profile first in <a href="#twin">AI Twin</a> or <a href="#influencer">AI Influencer</a>.</p>':''}</fieldset>`;
 }
 const attr=`data-field="${key}" id="field-${key}"`;
 return `<div><label for="field-${key}">${e(label)}${required?' *':''}</label>${opts?`<select ${attr}><option value="">Choose an option</option>${opts.map(([id,text])=>`<option value="${e(id)}" ${val===id?'selected':''}>${e(text)}</option>`).join('')}</select>`:long?`<textarea ${attr} maxlength="20000">${e(val)}</textarea>`:`<input ${attr} maxlength="1000" value="${e(val)}">`}${opts&&val==='Custom'?`<label for="field-${key}Custom">Describe your choice</label><input id="field-${key}Custom" data-field="${key}Custom" maxlength="1000" value="${e(a[key+'Custom'])}">`:''}${record&&!opts.length?'<small>Save a character or shoot first. <a href="#twin">AI Twin</a> · <a href="#influencer">AI Influencer</a></small>':''}</div>`;
}
const field=(key,label,long=false)=>({key,label,long});
const check=(key,label)=>({key,label,check:true});
const multi=(key,label,options)=>({key,label,multi:true,options});
const fields=(items,a)=>'<div class="fields">'+items.map(f=>control(f,a)).join('')+'</div>';
function merged(s){
 const a={...s.a};
 if(current().tool==='shoot'&&!a.startSource&&a.subjectType)a.startSource=({'My AI Twin':'My AI Twin','A client’s AI Twin':'My AI Twin','My Saved AI Influencer':'My AI Influencer','Character From a Reference Photo':'Upload a Reference Photo'}[a.subjectType]);
 if(a.startSource&&a.identity&&!a.refSet&&a.startSource!=='My AI Influencer')a.refSet=a.body?'Portrait + full-body':'Portrait only';
 if(Object.hasOwn(a,'campaign')&&!a.campaign&&a.subjectType!=='Product or Object'){
  for(const key of ['product','placement','productRef','brandColors','packaging','productText','interaction'])delete a[key];
 }
 if(a.subjectType==='Product or Object'||a.subjectType==='Food'||a.subjectType==='Architecture or Interior'){
  for(const key of ['identity','body','outfitRef','outfit','hairStyle','makeup','shoes','accessories','nails','keepOutfit'])delete a[key];
 }
 if(a.startSource==='My AI Twin'||a.startSource==='Upload a Reference Photo'){
  a.identity=!!a.refSet;
  a.body=a.refSet==='Portrait + full-body';
 }
 if(a.shootStyle&&a.direction!=='Creative Director Mode'&&a.concept!=='Custom concept')a.idea=[a.shootStyle,a.concept].filter(Boolean).join(' — ');
 if(a.locationGroup)a.setting=a.specificLocation?.trim()||value(a,'locationGroup')||a.setting;

 if(a.direction==='Creative Director Mode'&&a.idea){
  a.crop ||= a.subjectType==='Product or Object'?'Product detail':a.subjectType==='Architecture or Interior'?'Environmental wide':a.subjectType==='Food'?'Overhead':'Three-quarter';
  a.light ||= 'Soft directional light consistent with the specified scene';
 }
 const record=data.records.find(r=>r.id===a.recordId);
 if(record){
  const source=record.answers;
  for(const k of [...profileKeys,...profileKeys.map(key=>key+'Custom'),'subject','identity','body']) if(a[k]===undefined&&source[k]!==undefined)a[k]=source[k];
  if(record.tool==='twin'){a.subjectType=/client/i.test(source.owner||'')?'A client’s AI Twin':'My AI Twin';a.identity=s.a.identity??true;a.body=s.a.body??!!source.bodyApproved}
  if(record.tool==='influencer'){a.fictional=true;a.identity=s.a.identity??!!source.identity}
  if(record.tool==='shoot'&&a.subjectType==='My Photoshoot Image'){a.subject=source.subject||record.title;a.frame=a.frame||record.title+' approved image'}
 }
 return a;
}
const requiredReferenceIssues=['Face differs from reference','Face changes across images','Changed complexion','Mismatched features'];
const productIssues=['Wrong product color or details','Warped packaging or unreadable lettering'];
function failures(tool,index,fs,a){
 const missing=fs.find(f=>(f.required&&!value(a,f.key))||(a[f.key]==='Custom'&&!value(a,f.key)&&!(f.key==='locationGroup'&&a.specificLocation?.trim())));
 if(missing)return 'Complete '+missing.label.toLowerCase()+'.';
 if(tool==='twin'&&index===0&&!a.permission)return 'Confirm adult likeness permission to continue.';
 if(tool==='twin'&&index===2&&!a.identity)return 'Confirm that you will attach your original reference photo.';
 if(tool==='twin'&&index===2&&a.clothing==='Use outfit inspiration'&&!a.outfitRef)return 'Confirm that you will attach the outfit inspiration photo.';
 if(tool==='twin'&&index===2&&a.clothing==='Describe clothing'&&!a.outfit?.trim())return 'Describe the clothing you want to use.';
 if(tool==='twin'&&index===4&&!a.approved)return 'Approve and save the master portrait first, or finish with the portrait only.';
 if(tool==='influencer'&&index===2){
  if(a.cut==='Short crop'&&a.length&&a.length!=='Short'&&a.length!=='Custom')return 'Choose Short for a short crop, or select a different cut.';
  if(a.cut==='Bob'&&['Mid-back','Waist-length'].includes(a.length))return 'Choose a compatible hair length or haircut for the bob.';
 }
 if((tool==='shoot'||tool==='consistency'||tool==='video')&&fs.some(x=>x.key==='subjectType')){
  if(realSubject(a)&&!a.permission)return 'Confirm adult likeness permission.';
  if(a.subjectType==='My Saved AI Influencer'&&!a.recordId)return 'Select a saved influencer.';
  if(a.subjectType==='My Photoshoot Image'&&!a.recordId&&!a.subject?.trim())return 'Select a saved photoshoot or describe the approved image.';
  if(['Product or Object','Food','Architecture or Interior','Custom Subject','New Fictional Character'].includes(a.subjectType)&&!a.subject?.trim())return 'Describe the subject to continue.';
 }
 if(tool==='shoot'&&index===0&&a.startSource==='My AI Influencer'&&!a.recordId)return 'Choose a saved influencer or fictional character profile.';
 if(tool==='shoot'&&index===0&&realSubject(a)&&!a.identity)return 'Confirm the approved identity portrait.';
 if(tool==='consistency'&&index===2&&realSubject(a)&&!a.identity)return 'Confirm the approved identity portrait.';
 if(tool==='shoot'&&index===3&&a.locationGroup==='Custom'&&!(a.specificLocation?.trim()||a.locationGroupCustom?.trim()))return 'Describe the location.';
 if(tool==='shoot'&&index===5&&a.campaign&&!a.product?.trim())return 'Enter the featured product name.';
 if(tool==='shoot'&&index===1&&a.direction==='Creative Director Mode'&&!a.idea?.trim())return 'Describe your creative idea.';
 if(tool==='video'&&index===3&&a.method==='Text-to-Video'&&(!a.start?.trim()||(!a.subject?.trim()&&!a.recordId)))return 'Describe the subject and the starting scene.';
 if(tool==='fixer'&&index===0&&!a.resultType)return 'Choose a result type.';
 if(tool==='fixer'&&index===1&&!a.issues?.length)return 'Select at least one issue.';
 if(tool==='fixer'&&index===2&&a.issues?.includes('Custom')&&!a.desired?.trim()&&!a.issueDetails?.Custom?.trim())return 'Describe the custom correction.';
 if(tool==='fixer'&&index===3){
  if(a.chat!=='Same chat'&&!a.target)return 'Confirm the generated target image for a fresh chat.';
  if((a.resultType==='AI Twin'||a.issues?.some(x=>requiredReferenceIssues.includes(x)))&&!a.identity)return 'Confirm the original likeness photo.';
  if(a.issues?.some(x=>productIssues.includes(x))&&!a.productRef)return 'Confirm the original product photo.';
  const conflicts=correctionConflicts(a);
  if(conflicts.length)return 'Remove conflicting preservation choices: '+[...new Set(conflicts)].join(', ')+'.';
 }
 return '';
}
const helpers={
 'twin/2':'A sharp, evenly lit portrait with an unobstructed face will serve as your master reference. You can add a head-to-toe source after reviewing the portrait.',
 'twin/3':'Choose a sharp identity photograph with even light and minimal filters. Use an outfit inspiration photo only as clothing guidance.',
 'twin/6':'Use the approved master portrait for the face. A separate head-to-toe photograph can guide proportions and stature. Without one, describe proportions explicitly.',
 'influencer/1':'Design an original fictional adult. The first image establishes the identity from your written choices.',
 'consistency/3':'Choose sharp, evenly lit photos with a visible face. A separate approved full-body image can help with seated, three-quarter or head-to-toe framing.',
 'shoot/2':'Start from a style preset or direct the scene yourself. Your written concept takes priority.',
 'video/3':'Use the chosen platform’s settings to check input limits, supported formats, duration and audio options.',
 'fixer/4':'A fresh chat requires the result image. For same-chat edits, use the result already in the conversation.'
};
function result(s,kind,options={}){
 const a=options.answers||merged(s);
 if(kind==='content'&&!a.identity)a.identity=false;
 const generated=options.generated||renderPrompt(kind,a);
 const saved=s.out[kind]??={};
 const refs=generated.refs;
 const signature=JSON.stringify(refs);
 const ack=refs.length>0&&saved.ack!==signature;
 const signatureChanged=saved.signature!==undefined&&saved.signature!==signature;
 if(signatureChanged&&saved.edited!==undefined){
  saved.previous=saved.edited;
  delete saved.edited;
 }
 saved.signature=signature;
 const text=saved.edited??generated.body;
 const combined=completeText(generated.guide,text);
 model={s,kind,generated,text,signature,ack,options};
 const attachments=refs.length?`<div class="panel"><h3>Attachment order</h3>${kind==='portrait'?'<p>Upload the same original reference photo you used to create your AI twin. ChatGPT uses that photo with your prompt to preserve your appearance.</p>':''}<ol>${refs.map(r=>`<li><strong>${e(r.label)}</strong> ${e(r.instruction)}<div><label>Optional local preview<input type="file" accept="image/jpeg,image/png,image/webp" data-preview="${r.role}"></label>${previews.has(r.role)?`<img class="preview" src="${previews.get(r.role)}" alt="${e(r.label)} preview">${btn('remove:'+r.role,'Remove preview')}`:''}</div></li>`).join('')}</ol><label><input type="checkbox" id="ack" ${ack?'':'checked'}>${kind==='portrait'?'I understand that I need to upload my original reference photo with my prompt in ChatGPT.':kind==='shoot'?'I understand that I need to attach my reference photos in ChatGPT.':'I understand which images to attach and in what order.'}</label></div>`:'';
 let extras='';
 if(kind==='influencer')extras='<ol><li>Copy the prompt into a new ChatGPT chat and generate the first image from text.</li><li>Refine the result in the same conversation.</li><li>Download the approved image as your master reference.</li></ol>';
 if(kind==='content')extras='<p>Use the same fictional character traits and change the styling for the first content image. Enable the reference field if you have saved the approved master image.</p>';
 if(kind==='video')extras=`<div class="grid">${[['Motion',value(a,'movement')],['Camera',value(a,'motion')],['Reference Guidance',refs[0]?.label||'Create from the written scene.'],['Identity and Continuity','Keep the described subject and geometry consistent.'],['Optional Negative Constraints',generated.negative],['Platform Notes','Check '+(value(a,'platform')||'your platform')+' settings for supported inputs and preferences.']].map(([title,content])=>`<div class="card"><h3>${e(title)}</h3><p>${e(content||'Use the platform default.')}</p>${title==='Optional Negative Constraints'&&!ack?btn('negative','Copy negative constraints'):''}</div>`).join('')}</div>`;
 if(['correction','drift','review','twinCorrection'].includes(kind))extras=`<div class="panel"><h3>Review your corrections</h3><ol>${(a.issues||[]).map(i=>`<li>${e(i)}</li>`).join('')}</ol><p>${e((a.preserve||[]).length?'Preserve '+a.preserve.join(', ')+'.':'Retain untargeted details.')}</p><p>Compare the result with the original authority reference and the image you edited.</p></div>`;
 return attachments+extras+(ack?'':`<section class="panel prompt-preview"><h3>Prompt Preview</h3>${(generated.photoRatio||generated.videoRatio)?`<p class="meta">Automatic aspect ratio · ${e(generated.photoRatio||generated.videoRatio)}</p>`:''}${generated.guide?`<pre class="guide">${e(generated.guide)}</pre>`:''}<label for="output">Editable prompt request</label><textarea class="output" id="output">${e(text)}</textarea><p class="meta" id="words">${wordCount(combined)} words</p>${saved.edited!==undefined?'<p class="meta">Regenerate to apply changed answers to your edited text.</p>':''}<div class="actions">${btn('copy',kind==='correction'?'Copy Correction Prompt':'Copy Prompt',true)}${open}${btn('regenerate','Regenerate')}</div>${saved.previous!==undefined?'<details><summary>Previous edited text</summary><pre>'+e(saved.previous)+'</pre></details>':''}${options.canSave===false?'':`<div class="fields"><div><label for="title">Save as</label><input id="title" maxlength="120" value="${e(s.title)}" placeholder="Give this a name"></div><div><label for="notes">Private notes</label><input id="notes" maxlength="1000" value="${e(s.notes)}"></div></div><div class="actions">${btn('save',options.saveLabel||'Save '+({twin:'Twin',influencer:'Character',shoot:'Photoshoot',consistency:'Character',video:'Video Concept',fixer:'Correction',vault:'Prompt'}[current().tool]||'Prompt'))}${s.id?btn('update','Update saved record'):''}</div>`}</section>`);
}
const choose=(key,label,options,required=false)=>({key,label,options:Array.isArray(options)?options:options.split('|'),required});
const preset=(key,label,required=false)=>choose(key,label,selectables[key],required);
const more=(items,a)=>'<details class="panel" '+(items.some(f=>a[f.key])?'open':'')+'><summary>More options</summary>'+fields(items,a)+'</details>';
function shootFields(index,a,original){
 if(index===0){
  const options=choose('startSource','Who is this photoshoot for?','My AI Twin|My AI Influencer|Upload a Reference Photo',true);
  const chosen=[options];
  const source=a.startSource||({'My AI Twin':'My AI Twin','A client’s AI Twin':'My AI Twin','My Saved AI Influencer':'My AI Influencer','Character From a Reference Photo':'Upload a Reference Photo'}[a.subjectType]);
  if(source==='My AI Influencer')return [...chosen,{key:'recordId',label:'Choose a saved influencer or fictional character profile',record:true,required:true},check('identity','I’ll attach the approved character image in ChatGPT')];
  if(source==='My AI Twin'||source==='Upload a Reference Photo')return [...chosen,choose('owner','Whose likeness is it?','My own appearance|A client’s appearance',true),check('permission',a.owner==='A client’s appearance'?'The client is 18 or older and gave permission.':'I am 18 or older and this is my likeness.'),...(source==='My AI Twin'?[{key:'recordId',label:'Reuse a saved Twin (optional)',record:true}]:[]),choose('refSet','Which photos will you attach in ChatGPT?','Portrait only|Portrait + full-body',true)];
  return chosen;
 }
 if(index===1){
  const mode=choose('direction','How do you want to plan your shoot?','Style Library|Creative Director Mode',true);
  if(a.direction==='Creative Director Mode')return [mode,{...field('idea','Describe your photoshoot',true),required:true},...original.filter(f=>['goal','audience','occasion','channel','requirements'].includes(f.key))];
  return [mode,choose('shootStyle','Choose a style',Object.keys(styles),true),...(a.shootStyle?[choose('concept','Choose a concept',styles[a.shootStyle]||[],true)]:[]),...(a.concept==='Custom concept'?[{...field('idea','Describe your concept',true),required:true}]:[])];
 }
 if(index===2)return [preset('outfitType','Outfit type'),field('outfit','Clothing description',true),field('colors','Clothing colors'),preset('hairStyle','Hairstyle'),preset('makeup','Makeup'),...original.filter(f=>['keepOutfit','outfitRef','materials','surface'].includes(f.key)),preset('fabric','Fabric and texture'),field('shoes','Footwear'),preset('jewelry','Jewelry'),field('accessories','Accessories'),preset('nails','Nail style'),field('styling','Additional styling notes',true)];
 if(index===3)return [choose('locationGroup','Location',[...Object.keys(locations),'Custom'],true),...(locations[a.locationGroup]?[choose('background','Background details',locations[a.locationGroup],true)]:[]),field('specificLocation','Describe a specific location',true),field('scenePalette','Overall color palette')];
 if(index===4)return [preset('crop','Photo type',true),preset('expression','Facial expression'),preset('mood','Overall mood'),preset('position','Body positioning'),preset('gaze','Eye contact'),preset('angle','Camera angle'),preset('light','Lighting style')];
 if(index===5)return [...original.filter(f=>!['product','placement'].includes(f.key)),{...field('product','What is the product?'),required:!!a.campaign},preset('interaction','How the subject uses it'),field('packaging','Product and packaging description',true),field('productText','Text or logo on the product'),multi('avoid','What to avoid',['Plastic-looking skin','Excessive beauty filters','Distorted anatomy','Extra or fused fingers','Artificial facial symmetry','Unnatural lighting','Incorrect proportions','Overprocessed HDR','Unwanted identity changes','Added text or watermarks'])];
 return original;
}
function shootPreview(a){
 const scene=a.specificLocation||a.background||a.setting;
 const look=a.outfit||a.outfitType;
 const parts=[a.concept||a.idea||'A professional photoshoot',scene&&'set in '+scene,look&&'with '+look,a.light&&'lit with '+a.light,a.crop&&'framed as '+a.crop,a.product&&'featuring '+a.product].filter(Boolean);
 return `<aside class="draft-preview"><div class="preview-heading"><h3>Prompt Preview</h3><button type="button" class="preview-copy" data-action="copy-shoot-preview" aria-label="Copy preview summary" title="Copy preview summary" ${parts.length?'':'disabled'}><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="8" y="7" width="12" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h2"/></svg></button></div><p>${parts.length?e(parts.join(', ')+'.'):'Choose a scene, lighting, and framing to preview your photo direction.'}</p></aside>`;
}
function quickShootChoices(a){
 const groups=[
  ['Scene','locationGroup',[['Office','Luxury Office','scene-office'],['Resort','Resort','scene-resort'],['Photography studio','Studio','scene-studio'],['City street','Cityscape','scene-city'],['Modern home','Lifestyle','scene-lifestyle']]],
  ['Lighting','light',[['Soft daylight','Natural','light-natural'],['Golden hour','Golden Hour','light-golden'],['Studio softbox','Studio Soft','light-softbox'],['Dramatic single light','Dramatic','light-dramatic'],['High-key','High-Key','light-high-key']]],
  ['Framing','crop',[['Close-up beauty portrait','Close-Up'],['Head-and-shoulders portrait','Head & Shoulders'],['Waist-up portrait','Medium Shot'],['Three-quarter body','Three-Quarter'],['Full-body','Full Body']]]
 ];
 const silhouettes=['M8 21v-3a4 4 0 0 1 8 0v3','M4 22v-3a8 8 0 0 1 16 0v3','M4 22v-3a8 8 0 0 1 16 0v3M8 18v4m8-4v4','M9 22l1-6-3-1 2-4h6l2 4-3 1 1 6','M10 22v-6l-3-1 2-4h6l2 4-3 1v6'];
 return `<div class="shoot-quick">${groups.map(([title,key,options])=>`<fieldset><legend>${title}</legend><div class="choices">${options.map(([v,label,asset],index)=>`<label class="choice"><input type="radio" name="quick-${key}" data-field="${key}" value="${e(v)}" ${a[key]===v?'checked':''}>${asset?`<img src="./${asset}.jpg" alt="" width="160" height="96">`:`<svg class="frame-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="6" r="3"/><path d="${silhouettes[index]}"/></svg>`}<span>${e(label)}</span><i aria-hidden="true">✓</i></label>`).join('')}</div></fieldset>`).join('')}</div>`;
}
function canGenerateShoot(steps,a){
 return [0,1,2,3,4,5].every(index=>!failures('shoot',index,shootFields(index,a,steps[index][1]).filter(f=>index!==5||a.campaign||!['product','interaction','packaging','productText'].includes(f.key)),a));
}
function wizard(c,s){
 const {tool,index,steps}=c;
 const a=merged(s);
 const [heading,original,kind]=steps[index];
 const shootDashboard=tool==='shoot'&&index===3;
 const raw=tool==='shoot'?shootFields(index,a,original):original;
 const fs=raw.map(f=>tool==='shoot'&&index===2&&!a.identity&&f.options?.includes('Keep as in the reference')?{...f,options:f.options.filter(x=>x!=='Keep as in the reference')}:f).filter(f=>{
  if(tool==='twin'&&index===2&&f.key==='outfitRef')return a.clothing==='Use outfit inspiration';
  if(tool==='twin'&&index===4&&f.key==='target')return a.chat!=='Same chat';
  if(tool==='fixer'&&f.key==='target')return a.chat!=='Same chat';
  if(['shoot','consistency','video'].includes(tool)&&f.key==='permission')return realSubject(a);
  if(tool==='video'&&['frame','identity','body'].includes(f.key))return a.method==='Image-to-Video'&&f.key==='frame';
  if(tool==='shoot'&&index===2){const object=['Product or Object','Food','Architecture or Interior'].includes(a.subjectType);return object?['materials','surface','colors','styling'].includes(f.key):!['materials','surface'].includes(f.key)}
  if(tool==='shoot'&&index===0&&['identity','body'].includes(f.key)&&['Product or Object','Food','Architecture or Interior'].includes(a.subjectType))return false;
  if(tool==='shoot'&&index===5&&!a.campaign&&a.subjectType!=='Product or Object'&&['product','placement','productRef','brandColors','packaging','productText','interaction'].includes(f.key))return false;
  return true;
 });
 const error=failures(tool,index,fs,a);
 const advanced=tool==='shoot'&&index===2?['fabric','shoes','jewelry','accessories','nails','styling']:tool==='shoot'&&index===4?['position','gaze','angle','light']:[];
 let content=fields(fs.filter(f=>!advanced.includes(f.key)),a)+(advanced.length?more(fs.filter(f=>advanced.includes(f.key)),a):'');
 if(shootDashboard){
  const ready=canGenerateShoot(steps,a);
  content=`<div class="espresso-workspace"><div class="espresso-controls">${quickShootChoices(a)}
   <button class="primary generate" type="button" data-action="generate-shoot" ${ready?'':'disabled'}>${icon('influencer')} Generate Prompt <span class="generate-arrow" aria-hidden="true">→</span></button>
   ${!ready?'<p class="meta">Complete the required choices to generate.</p>':''}</div>
   <div class="espresso-preview">${previewPortrait}${shootPreview(a)}<div class="espresso-tail" aria-hidden="true"></div></div></div>
   <details class="panel scene-details" ${a.locationGroup&&!a.background?'open':''}><summary>More scene, lighting, and framing options</summary>
   ${fields([...fs,preset('light','Lighting style'),preset('crop','Photo type')],a)}</details>`;

 }
 if(tool==='shoot'&&index===5&&a.campaign&&a.productRef)content+='<p>Attach the product photo in ChatGPT. Generated label text may need a correction pass.</p>';
 if(tool==='shoot'&&index===4&&a.identity&&!a.body&&['Full-body','Seated portrait','Walking lifestyle','Three-quarter','Three-quarter body'].includes(a.crop))content+='<p>A full-body reference can help preserve proportions in this shot.</p>'+btn('add-body','Switch to face + full-body references');

 if(tool==='fixer'&&index===2)content+=`<div class="fields">${(a.issues||[]).map(issue=>`<div><label>${e(issue)} — target detail<input maxlength="1000" data-detail="${e(issue)}" value="${e(a.issueDetails?.[issue])}"></label></div>`).join('')}</div>`;
 if(tool==='twin'&&kind==='review'){
  content='<p>Compare face shape and features, complexion and undertone, skin texture, proportions, hands, lighting, clothing and the background against your source.</p>'+content;
  if(a.issues?.length)content+=a.chat!=='Same chat'&&!a.target?'<p>Confirm the generated target for a fresh chat.</p>':correctionConflicts(a).length?'<p>Resolve conflicting preservation choices.</p>':result(s,'review');
  content+=btn('portrait-only','Finish with portrait only');
 }else if(kind==='summary'){
  if(!a.approved)return link('#twin/5','Approve the master portrait first');
  content+='<p>Use the approved portrait for close-ups. Add the approved body image for seated, three-quarter and head-to-toe framing when available.</p>'+result(s,a.portraitOnly?'portrait':'companion');
 }else if(kind){
  if(tool==='fixer'&&(failures(tool,0,[],a)||failures(tool,1,[],a)||failures(tool,2,[],a)||failures(tool,3,[],a))) content='<p>Finish the issue and reference steps before generating.</p>'+link('#fixer/2','Choose issues');
  else if(tool==='twin'&&(!a.permission||!a.goal||failures(tool,2,steps[2][1],a)||(kind==='companion'&&!a.approved)))content='<p>Complete the likeness and portrait setup first.</p>'+link('#twin','Start setup');
  else if(['influencer','content'].includes(kind)&&(failures(tool,0,steps[0][1],a)||failures(tool,1,steps[1][1],a)||failures(tool,2,steps[2][1],a)))content=link('#influencer/2','Complete character foundation');
  else if(kind==='video'&&(failures(tool,0,steps[0][1],a)||failures(tool,1,steps[1][1],a)||failures(tool,2,steps[2][1],a)||failures(tool,3,steps[3][1],a)))content=link('#video','Complete video setup');
  else if(kind==='shoot'&&(failures(tool,0,shootFields(0,a,steps[0][1]),a)||failures(tool,1,shootFields(1,a,steps[1][1]),a)||failures(tool,5,[],a))&&!s.id)content=link('#shoot','Complete subject and shoot idea');
  else if(['lock','scene'].includes(kind)&&(failures(tool,0,steps[0][1],a)||failures(tool,2,steps[2][1],a)))content=link('#consistency','Complete character setup');
  else content+=result(s,kind);
 }
 if(kind==='shoot'&&model){
  if(a.identity&&!a.body&&['Three-quarter','Full-body','Seated portrait','Walking lifestyle','Three-quarter body'].includes(value(a,'crop')))content+=btn('add-body','Switch to face + full-body references');
  content+=`<div class="actions">${btn('another','Create Another Look')}${btn('series','Create a Photoshoot Series')}</div>`;
  if(s.series&&!model.ack)content+=series(a).map((shot,i)=>`<details class="panel"><summary>${shot.label}</summary><pre>${e(completeText(shot.guide,shot.body))}</pre>${btn('shot:'+i,'Copy '+shot.label)}</details>`).join('');
 }
 if(kind==='video'&&model)content+=btn('another','Create Another Scene');
 if(kind==='correction'&&model)content+=`<div class="actions">${btn('another','Try Another Fix')}${link('#consistency/drift','Character Consistency')}</div>`;
 if(kind==='companion'&&model)content+=btn('companion-fix','Review & fix');
 if(kind==='content'||kind==='influencer'||kind==='summary'||kind==='lock')content+=`<div class="actions">${['consistency','shoot','video'].filter(t=>t!==tool).map(t=>btn('reuse:'+t,'Use in '+tools[t].short)).join('')}</div>`;
 const preview=tool==='shoot'&&index===5?shootPreview(a):'';
 const progress=`<p class="meta">Step ${index+1} of ${steps.length}</p><progress aria-label="Workflow progress" value="${index+1}" max="${steps.length}"></progress>`;
 return `${shootDashboard?'':progress}<section class="${shootDashboard?'shoot-dashboard':'panel'}"><h2 tabindex="-1" class="${shootDashboard?'sr-only':''}">${heading}</h2>${helpers[tool+'/'+(index+1)]?`<p>${helpers[tool+'/'+(index+1)]}</p>`:''}${content}<p id="error" class="error" tabindex="-1">${error?e(error):''}</p><div class="wizard-end">${preview}<div class="actions">${index?btn('back','Back'):''}${index<steps.length-1?`<button type="button" class="primary ${tool==='shoot'&&index===5?'generate':''}" data-action="next" ${error?'disabled':''}>${kind==='portrait'?'Review & fix':kind==='lock'?'Change the scene':tool==='shoot'?['Continue','Continue to Wardrobe','Continue to Location','Continue to Pose & Camera','Continue to Props','Generate Photoshoot Prompt'][index]:'Continue'}</button>`:''}${btn('reset','Start Over')}</div></div></section>`;
}
const filters={query:'',category:'',type:'',reference:'',sort:'newest',favorites:false};
function favorite(id){return data.favorites.includes(id)}
function vaultView(c,s){
 const entry=vault.find(v=>v.id===c.extra);
 if(entry&&['detail','custom'].includes(c.view)){
  if(c.view==='custom'){
   if(s.base!==entry.id){s.base=entry.id;s.a={...entry.answers};s.out={};s.title=entry.title+' — custom';s.id=undefined}
   const available=customizeFields.filter(f=>entry.type==='people'?!['productRef','product','materials','surface'].includes(f.key):!['identity','body','outfitRef','permission','outfit','hairStyle','makeup','shoes','accessories','nails','productRef'].includes(f.key)||f.key==='productRef'&&entry.type==='product');
   const a={...s.a,fictional:entry.type==='people'&&!s.a.identity};
   if(a.identity)a.subjectType='Character From a Reference Photo';
   return link('#vault/detail/'+entry.id,'Back to prompt')+'<section class="panel"><h2>Customize '+e(entry.title)+'</h2>'+fields(available,s.a)+(a.identity&&!a.permission?'<p>Confirm adult likeness permission to generate.</p>':result(s,'vault',{answers:a}))+'</section>';
  }
  return link('#vault','Back to browse')+`<section class="panel"><p class="meta">${e(entry.category)} · ${entry.type} · ${entry.ratio} · Added ${entry.added}</p><h2>${e(entry.title)}</h2><p>${e(entry.description)}</p><p>${entry.reference==='optional'?'No reference needed for the base prompt. Customize to assign an approved likeness or product source.':'No reference needed.'}</p><p class="meta">${e(entry.tags.join(' · '))} · ${wordCount(entry.body)} words</p><div class="actions">${btn('basecopy:'+entry.id,'Copy',true)}${btn('favorite:'+entry.id,favorite(entry.id)?'Remove favorite':'Save to Favorites')}${link('#vault/custom/'+entry.id,'Customize')}${open}</div><pre>${e(entry.body)}</pre></section>`;
 }
 const f=filters;
 const matched=vault.filter(v=>(!f.query||[v.title,v.description,...v.tags].join(' ').toLowerCase().includes(f.query.toLowerCase().trim()))&&(!f.category||v.category===f.category)&&(!f.type||v.type===f.type)&&(!f.reference||v.reference===f.reference)&&(!(f.favorites||c.view==='favorites')||favorite(v.id))).sort((a,b)=>f.sort==='title'?a.title.localeCompare(b.title):f.sort==='oldest'?a.added.localeCompare(b.added):b.added.localeCompare(a.added));
 const select=(key,label,options)=>`<label>${label}<select data-filter="${key}">${options.map(([v,t])=>`<option value="${e(v)}" ${v===f[key]?'selected':''}>${e(t)}</option>`).join('')}</select></label>`;
 const card=v=>`<article class="card"><p class="meta">${e(v.category)} · ${v.ratio}</p><h3><a href="#vault/detail/${v.id}">${e(v.title)}</a></h3><p>${e(v.description)}</p><div class="actions">${btn('basecopy:'+v.id,'Copy')}${link('#vault/detail/'+v.id,'View')}${btn('favorite:'+v.id,favorite(v.id)?'Remove favorite':'Favorite')}</div></article>`;
 const featured=c.view!=='favorites'&&!f.query&&!f.category&&!f.type&&!f.reference&&!f.favorites?matched.filter(v=>v.featured).slice(0,4):[];
 return `<section class="panel"><div class="fields"><label>Search prompts<input data-filter="query" value="${e(f.query)}"></label>${select('category','Collection',[['','All collections'],...collections.map(x=>[x,x])])}${select('type','Image type',[['','All image types'],...['people','product','food','place'].map(x=>[x,x])])}${select('reference','Reference',[['','Any'],['optional','Optional'],['required','Required'],['none','None']])}${select('sort','Sort by',[['newest','Newest'],['oldest','Oldest'],['title','Title']])}</div><div class="actions"><label><input type="checkbox" data-filter="favorites" ${f.favorites?'checked':''}>Favorites only</label>${btn('clear-filters','Clear filters')}</div><details><summary>Browse prompt packs</summary><div class="actions">${collections.map((x,i)=>btn('pack:'+i,x)).join('')}</div></details></section>${featured.length?'<h2>Featured</h2><div class="grid">'+featured.map(card).join('')+'</div>':''}<h2>${matched.length} ${matched.length===1?'prompt':'prompts'}</h2><div class="grid">${matched.map(card).join('')}</div>${!matched.length?'<p>No matches. Clear a filter or browse all prompts.</p>':''}`;
}
function savedView(c,s){
 const records=data.records.filter(r=>r.tool===c.tool);
 const active=records.find(r=>r.id===s.open);
 let content=`<div class="actions">${btn('export','Export JSON backup')}<label>Import JSON backup<input type="file" id="import" accept=".json,application/json"></label></div>`;
 if(backup)content+=`<div class="panel"><p>${backup.records.length} records ready to import. Choose what to do if IDs already exist.</p><div class="actions">${btn('import-copy','Keep both copies')}${btn('import-replace','Replace matching IDs')}${btn('cancel-import','Cancel')}</div></div>`;
 content+=records.length?'<div class="grid">'+records.map(r=>`<article class="card"><h3>${e(r.title)}</h3><p>${e(r.notes||r.body.slice(0,110))}</p><div class="actions">${btn('open-record:'+encodeURIComponent(r.id),'Open')}${btn('draft-record:'+encodeURIComponent(r.id),'Reopen workflow')}${btn('rename:'+encodeURIComponent(r.id),'Rename')}${btn('duplicate:'+encodeURIComponent(r.id),'Duplicate')}${btn('delete:'+encodeURIComponent(r.id),'Delete')}</div></article>`).join('')+'</div>':'<p>No saved records yet.</p>'+link('#'+c.tool,'Start here');
 if(active){
  const a={...active.answers};
  if(s.id!==active.id){s.id=active.id;s.title=active.title;s.notes=active.notes||'';s.out={[active.kind]:{edited:active.body}};s.a=a}
  content+='<section class="panel"><h2>'+e(active.title)+'</h2>'+(a.source?'<h3>Original text</h3><pre>'+e(a.source)+'</pre>':'')+result(s,active.kind,{answers:a})+'</section>';
  if(['twin','consistency','influencer','shoot'].includes(active.tool))content+='<div class="actions">'+['consistency','shoot','video'].map(t=>btn('reuse:'+t,'Use in '+tools[t].short)).join('')+'</div>';
 }
 return content;
}
function special(c,s){
 if(c.view==='saved')return savedView(c,s);
 if(c.tool==='vault')return vaultView(c,s);
 if(c.view==='help')return '<section class="panel"><h2>Choose the right correction chat</h2><p>In the same chat, point to the existing image. In a new chat, attach the authority reference first and the generated result in the listed order. Describe one target change per issue and compare the result with both sources.</p></section>';
 if(c.view==='checklist')return '<section class="panel"><h2>Reference preflight and review</h2>'+fields(['Reference approved','Face unobstructed','Body reference ready if needed','Attachment order confirmed','Labels match','Changes separated from identity','Result checked against the same reference'].map((x,i)=>check('check'+i,x)),s.a)+'</section>';
 if(c.view==='improve'){
  const fs=[field('source','Original prompt',true),multi('improvements','Improvements',improvementOptions),field('improveCustom','Custom improvement')];
  const ready=s.a.source?.trim()&&(s.a.improvements?.length||s.a.improveCustom?.trim());
  return '<section class="panel"><h2>Improve My Prompt</h2><p>Prepare rewrite instructions for ChatGPT with your original prompt intact.</p>'+fields(fs,s.a)+btn('improve-generate','Generate rewrite prompt',true)+(ready&&s.improve?result(s,'improve',{saveLabel:'Save Prompt'}):'')+'</section>';
 }
 if(c.view==='drift'){
  const a={...merged(s),chat:s.a.chat||'Fresh chat'};
  const controls=[{key:'recordId',label:'Saved character',record:true},check('identity','I will attach the approved portrait'),multi('issues','Identity drift',Object.keys(issueMap).slice(0,10)),field('desired','Describe the discrepancy',true),{key:'chat',label:'Correction chat',options:['Fresh chat','Same chat']},...(a.chat==='Same chat'?[]:[check('target','I will attach the generated result')])];
  return '<section class="panel"><h2>Fix identity drift</h2>'+fields(controls,a)+(a.identity&&(a.issues?.length||a.desired?.trim())&&(a.chat==='Same chat'||a.target)?result(s,'drift',{answers:a}):'<p>Confirm the authority portrait and correction target, and describe the drift.</p>')+btn('carry-fix','Continue in Prompt Fixer')+'</section>';
 }
 return wizard(c,s);
}
function render(focus){
 const c=current();
 app.classList.toggle('reference-layout',c.tool==='shoot'&&c.index===3);
 if(route!==location.hash){clearPreviews();route=location.hash;model=null}
 model=null;
 nav.innerHTML=Object.entries(tools).map(([id,t])=>`<a href="#${id}" ${c.tool===id?'aria-current="page"':''}>${icon(id)}<span>${e(t.short)}</span></a>`).join('');
 if(!Object.hasOwn(tools,c.tool)){
  app.innerHTML=`<section class="hero"><div><h1>AI Prompt Lab</h1><p>Build prompts for realistic images, consistent characters, and short videos.</p></div><img src="./espresso-portrait.jpg" alt="Editorial example in champagne satin with warm studio light" width="551" height="523"></section><div class="grid tool-grid">${Object.entries(tools).map(([id,t])=>`<a href="#${id}" class="card tile">${icon(id)}<h3>${e(t.title)}</h3><span>${e(t.desc)}</span></a>`).join('')}</div>`;
 }else{
  const s=states[c.tool]??=make(c.tool);
  const tool=tools[c.tool];
  app.innerHTML=`<div class="page-intro"><h1>${e(c.tool==='shoot'?'Photoshoot':tool.title)}</h1><p>${e(c.tool==='shoot'?'Create a high-converting photoshoot prompt with your preferred scene, lighting, and framing.':tool.desc)}</p></div>${c.tool==='shoot'&&c.index===3?'':tabs(c.tool,c.view)}${special(c,s)}`;
 }
 if(focus){
  const heading=app.classList.contains('reference-layout')?app.querySelector('h1'):app.querySelector('h2[tabindex],h1');
  heading?.setAttribute('tabindex','-1');heading?.focus({preventScroll:true});window.scrollTo(0,0);
 }
}
function changeField(target){
 const c=current(),s=states[c.tool],a=s.a,key=target.dataset.field;
 if(target.dataset.item){a[key]=[...new Set([...(a[key]||[]).filter(x=>x!==target.dataset.item),...(target.checked?[target.dataset.item]:[])])]}
 else a[key]=target.type==='checkbox'?target.checked:target.value;
 if(key==='heritageCustom')a.heritage='Custom';
 if(['startSource','refSet','identity','body','outfitRef','productRef','frame','chat','clothing','subjectType','recordId','target','method'].includes(key)){
  for(const out of Object.values(s.out)){out.ack=undefined}
  if(previews.has(key)&&!a[key]){URL.revokeObjectURL(previews.get(key));previews.delete(key)}
 }
 if(key==='startSource'){
  a.subjectType={'My AI Twin':a.owner==='A client’s appearance'?'A client’s AI Twin':'My AI Twin','My AI Influencer':'My Saved AI Influencer','Upload a Reference Photo':'Character From a Reference Photo'}[a.startSource];
  delete a.refSet;delete a.identity;delete a.body;delete a.recordId;a.permission=false;
 }
 if(key==='owner'&&a.startSource==='My AI Twin')a.subjectType=a.owner==='A client’s appearance'?'A client’s AI Twin':'My AI Twin';
 if(key==='owner'||key==='subjectType')a.permission=false;
 if(key==='shootStyle')delete a.concept;
 if(key==='direction'&&a.direction==='Style Library'&&a.concept!=='Custom concept')delete a.idea;
 if(key==='locationGroup')delete a.background;

 if(key==='clothing'&&a.clothing!=='Use outfit inspiration')a.outfitRef=false;
 if(key==='concept'&&c.tool==='shoot'&&a.concept&&a.concept!=='Custom concept'){
  const starter=vault.find(v=>v.title.toLowerCase().includes(({ 'Christmas gathering':'Christmas portrait','Beauty hero':'serum hero','Personal branding':'Executive','Cinematic story':'blue hour','Salon reveal':'Coil definition','Lifestyle travel':'terrace','Birthday celebration':'birthday dinner','Fitness wellness':'after the last rep','Luxury portrait':'terrace','Skincare campaign':'serum hero','Fashion accessory campaign':'hardware close-up','Branded lifestyle campaign':'handbag in use','Fashion editorial':'linen in motion'})[a.concept]?.toLowerCase()||'__'));
  const preset=starter?{idea:starter.title,background:starter.answers.setting,notes:starter.answers.camera}:null;
  if(preset)for(const [k,v] of Object.entries(preset))if(!a[k])a[k]=v;
 }
}
function retainFocus(target){
 const selector=target.id?'#'+CSS.escape(target.id):target.dataset.detail?`[data-detail="${CSS.escape(target.dataset.detail)}"]`:target.dataset.filter?`[data-filter="${target.dataset.filter}"]`:null;
 const pos=target.selectionStart;
 const disclosure=target.closest('details');
 render();
 if(disclosure?.open){const updated=app.querySelector('details.panel');if(updated)updated.open=true}
 const next=selector&&app.querySelector(selector);
 if(next){next.focus();if(typeof pos==='number')next.setSelectionRange(pos,pos)}
}
app.addEventListener('input',event=>{
 const t=event.target;
 const s=states[current().tool];
 if(t.id==='output'&&model&&!model.ack){model.s.out[model.kind].edited=t.value;model.text=t.value;document.querySelector('#words').textContent=wordCount(completeText(model.generated.guide,t.value))+' words';return}
 if(t.id==='title'||t.id==='notes'){s[t.id]=t.value;return}
 if(t.dataset.filter==='query'){filters.query=t.value;retainFocus(t);return}
 if(t.dataset.detail){(s.a.issueDetails??={})[t.dataset.detail]=t.value;retainFocus(t);return}
 if(t.dataset.field&&(t.tagName==='TEXTAREA'||t.type==='text')){changeField(t);retainFocus(t)}
});
app.addEventListener('change',async event=>{
 const t=event.target;
 if(t.id==='ack'&&model){model.s.out[model.kind].ack=t.checked?model.signature:undefined;render();document.querySelector('#ack')?.focus();return}
 if(t.dataset.filter&&t.dataset.filter!=='query'){filters[t.dataset.filter]=t.type==='checkbox'?t.checked:t.value;retainFocus(t);return}
 if(t.dataset.preview){
  const file=t.files[0];if(!file)return;
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>20*1024*1024){say('Choose a JPEG, PNG or WebP under 20 MB.');t.value='';return}
  const old=previews.get(t.dataset.preview);if(old)URL.revokeObjectURL(old);
  previews.set(t.dataset.preview,URL.createObjectURL(file));
  model.s.out[model.kind].ack=undefined;render();return
 }
 if(t.id==='import'){
  const file=t.files[0];if(!file)return;
  try{if(file.size>10*1024*1024)throw Error('Backup exceeds 10 MB.');backup=validate(JSON.parse(await file.text()));render()}catch(err){say('Import rejected. '+err.message)}
  return
 }
 if(t.dataset.field&&t.type!=='text'&&t.tagName!=='TEXTAREA'){
  const key=t.dataset.field,item=t.dataset.item;const openDetails=t.closest('details')?.open;changeField(t);render();if(openDetails){const details=app.querySelector('details.panel');if(details)details.open=true}
  [...app.querySelectorAll('[data-field]')].find(el=>el.dataset.field===key&&el.dataset.item===item&&(t.type!=='radio'||(el.value===t.value&&el.name===t.name)))?.focus();
 }
});
async function copy(text){
 try{if(!navigator.clipboard)throw Error();await navigator.clipboard.writeText(text);say('Copied to clipboard.')}
 catch{
  const fallback=document.createElement('textarea');fallback.value=text;fallback.className='output';fallback.setAttribute('aria-label','Text to copy manually');fallback.readOnly=true;app.append(fallback);fallback.focus();fallback.select();say('Use your device’s Copy command on the selected text.');
 }
}
const uuid=()=>globalThis.crypto?.randomUUID?.()||Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
function writeRecord(c,s,update){
 if(!model||model.ack)return;
 const title=s.title.trim()||(c.tool==='shoot'?(merged(s).concept||'Photoshoot'):'');
 if(!title){say('Enter a name first.');document.querySelector('#title')?.focus();return}
 const id=update&&s.id?s.id:uuid();
 const a={...(model.options.answers||merged(s))};
 const record={id,tool:c.tool,kind:model.kind,title,notes:s.notes,answers:a,body:model.text};
 const records=[...data.records.filter(x=>x.id!==id),record];
 if(persist({...data,records})){s.id=id;if(c.view==='saved')s.open=id;say('Saved '+title+'.');render()}
}
document.querySelector('.masthead-tools').addEventListener('click',event=>{const open=event.target.closest('details');for(const item of document.querySelectorAll('.masthead-popover[open]'))if(item!==open||event.target.closest('a'))item.open=false});
app.addEventListener('click',async event=>{
 const target=event.target.closest('[data-action]');if(!target)return;
 const [action,raw]=target.dataset.action.split(':');
 const id=raw?decodeURIComponent(raw):'';
 const c=current(),s=states[c.tool];
 const a=merged(s);
 const record=data.records.find(r=>r.id===id);
 if(action==='copy-shoot-preview'){const summary=app.querySelector('.draft-preview p')?.textContent;if(summary)await copy(summary);return}
 if(action==='generate-shoot'&&c.tool==='shoot'&&canGenerateShoot(c.steps,a)){go('shoot/7');return}
 if(action==='next'||action==='back'){
  if(action==='next'&&target.disabled)return;
  if(c.tool==='twin'&&c.index===4&&action==='next')s.a.portraitOnly=false;
  go(c.tool+'/'+(action==='next'?c.index+2:c.index));return
 }
 if(action==='reset'){
  const existing=app.querySelector('#reset-panel');
  if(existing){existing.querySelector('button').focus();return}
  const panel=document.createElement('section');
  panel.id='reset-panel';
  panel.className='panel';
  panel.setAttribute('aria-labelledby','reset-title');
  panel.innerHTML='<h3 id="reset-title">Start a new draft?</h3><p>This clears your current answers. You can still reopen any saved work.</p><div class="actions">'+btn('reset-cancel','Keep editing')+btn('reset-confirm','Clear draft and start over',true)+'</div>';
  target.closest('.actions').after(panel);
  panel.querySelector('button').focus();
  return
 }
 if(action==='reset-cancel'){
  app.querySelector('#reset-panel')?.remove();
  app.querySelector('[data-action="reset"]')?.focus();
  return
 }
 if(action==='reset-confirm'){
  states[c.tool]=make(c.tool);
  clearPreviews();
  go(c.tool);
  render(true);
  say('Started a new draft.');
  return
 }
 if(action==='portrait-only'){if(!a.approved){say('Approve and save your portrait first.');return}s.a.portraitOnly=true;go('twin/8');return}
 if(action==='copy'&&model&&!model.ack)return copy(completeText(model.generated.guide,model.text));
 if(action==='negative'&&model&&!model.ack)return copy(model.generated.negative);
 if(action==='shot'&&model&&!model.ack){const shot=series(a)[Number(id)];return copy(completeText(shot.guide,shot.body))}
 if(action==='regenerate'&&model){delete model.s.out[model.kind].edited;render();say('Prompt regenerated.');return}
 if(action==='remove'&&previews.has(id)){URL.revokeObjectURL(previews.get(id));previews.delete(id);if(model)model.s.out[model.kind].ack=undefined;render();return}
 if(action==='save'||action==='update')return writeRecord(c,s,action==='update');
 if(action==='add-body'){s.a.refSet='Portrait + full-body';s.a.body=true;for(const out of Object.values(s.out))out.ack=undefined;render();return}
 if(action==='series'){s.series=!s.series;render();return}
 if(action==='another'){
  const next=make(c.tool);
  const keys=c.tool==='video'?['method','subjectType','recordId','subject','owner','permission','features','platform','platformCustom']:c.tool==='shoot'?['startSource','refSet','owner','subjectType','subject','recordId','permission','identity','body',...(confirm('Keep the current wardrobe for the new look?')?['outfit','outfitRef','colors','fabric','shoes','accessories','nails','hairStyle','makeup','styling','keepOutfit']:[])]:['resultType','identity','productRef','chat','recordId'];
  for(const k of keys)if(s.a[k]!==undefined)next.a[k]=s.a[k];states[c.tool]=next;
  go(c.tool+'/'+(c.tool==='video'?'4':'2'));render();return
 }
 if(action==='reuse'){
  const selected=data.records.find(r=>r.id===s.id);
  const next=make(id);
  const linked=selected&&['twin','influencer','consistency','shoot'].includes(selected.tool)?selected:undefined;
  const subjectType=c.tool==='twin'?'My AI Twin':c.tool==='influencer'?(linked?'My Saved AI Influencer':'New Fictional Character'):c.tool==='shoot'?'My Photoshoot Image':a.subjectType||'New Fictional Character';
  next.a={...next.a,...Object.fromEntries([...profileKeys,...profileKeys.map(key=>key+'Custom')].filter(k=>a[k]!==undefined).map(k=>[k,a[k]])),subjectType,recordId:linked?.id||'',subject:a.subject||a.name||s.title||'Defined adult subject',permission:!!a.permission,identity:c.tool==='twin'||!!a.identity,body:c.tool==='twin'?!!a.bodyApproved:!!a.body};
  states[id]=next;go(id);return
 }
 if(action==='companion-fix'){
  const next=make('fixer');next.a={...next.a,resultType:'AI Twin',identity:true,body:!!a.body};states.fixer=next;go('fixer/2');return
 }
 if(action==='carry-fix'){
  const next=make('fixer');next.a={...a,resultType:isTwin(a,'drift')?'AI Twin':'General image',issues:a.issues?.length?a.issues:['Custom']};states.fixer=next;go('fixer/2');return
 }
 if(action==='improve-generate'){if(!a.source?.trim()||(!a.improvements?.length&&!a.improveCustom?.trim())){say('Enter a prompt and choose at least one improvement.');return}s.improve=true;delete s.out.improve;render();return}
 if(action==='basecopy')return copy(vault.find(v=>v.id===id).body);
 if(action==='favorite'){
  const favorites=favorite(id)?data.favorites.filter(x=>x!==id):[...data.favorites,id];
  if(persist({...data,favorites}))render();return
 }
 if(action==='pack'){filters.category=collections[Number(id)];render();return}
 if(action==='clear-filters'){Object.assign(filters,{query:'',category:'',type:'',reference:'',sort:'newest',favorites:false});render();return}
 if(action==='export'){
  const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));
  const a=document.createElement('a');a.href=url;a.download='revenue-architect-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);return
 }
 if(action==='cancel-import'){backup=undefined;render();return}
 if(['import-copy','import-replace'].includes(action)){
  try{if(backup&&persist(merge(data,backup,action==='import-replace',uuid))){backup=undefined;render();say('Backup imported.')}}catch(err){say(err.message)}return
 }
 if(record&&action==='draft-record'){
  const next=make(record.tool);
  Object.assign(next,{a:{...record.answers},id:record.id,title:record.title,notes:record.notes||'',out:{[record.kind]:{edited:record.body}}});
  states[record.tool]=next;
  if(record.tool==='vault'){next.open=record.id;render();return}
  if(record.kind==='improve'){next.improve=true;go('fixer/improve');return}
  if(record.kind==='drift'){go('consistency/drift');return}
  const step=tools[record.tool].steps?.findIndex(x=>x[2]===record.kind);
  go(record.tool+(step>=0?'/'+(step+1):''));return
 }
 if(record&&action==='open-record'){s.open=record.id;s.id=undefined;render();return}
 if(record&&action==='delete'&&confirm('Delete '+record.title+'?')){
  if(persist({...data,records:data.records.filter(r=>r.id!==id)})){if(s.open===id)s.open=undefined;render()}return
 }
 if(record&&action==='rename'){
  const title=prompt('New name',record.title)?.trim();if(title&&title.length<=120&&persist({...data,records:data.records.map(r=>r.id===id?{...r,title}:r)})){if(s.id===id)s.title=title;render()}return
 }
 if(record&&action==='duplicate'){
  if(persist({...data,records:[...data.records,{...record,id:uuid(),title:record.title.slice(0,110)+' (copy)'}]}))render();
 }
});
document.querySelector('.skip').addEventListener('click',event=>{event.preventDefault();app.tabIndex=-1;app.focus()});
menu.addEventListener('click',()=>menu.setAttribute('aria-expanded',String(nav.classList.toggle('open'))));
window.addEventListener('hashchange',()=>{
 if(previous!==current().tool){nav.classList.remove('open');menu.setAttribute('aria-expanded','false')}
 previous=current().tool;render(true)
});
render();
if(loadError)say('Saved data could not be opened. '+loadError);
