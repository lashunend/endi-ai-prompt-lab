const key='revenue-architect-studio-v1';
const kinds=['twin','influencer','shoot','vault','consistency','video','fixer'];
const scalar=v=>typeof v==='string'?v.length<=100000:typeof v==='boolean'||v===null;
const validValue=v=>scalar(v)||(Array.isArray(v)&&v.length<=100&&v.every(scalar))||(v&&Object.getPrototypeOf(v)===Object.prototype&&Object.keys(v).length<=100&&Object.values(v).every(scalar));
export const empty=()=>({version:1,records:[],favorites:[]});
export function validate(data){
 if(!data||data.version!==1||!Array.isArray(data.records)||data.records.length>500||!Array.isArray(data.favorites)||!data.favorites.every(x=>typeof x==='string'&&/^vault-\d+-\d+$/.test(x))) throw Error('Choose a valid Studio v1 backup.');
 const ids=new Set();
 for(const r of data.records){
  if(!r||typeof r.id!=='string'||!r.id||r.id.length>120||ids.has(r.id)||!kinds.includes(r.tool)||typeof r.title!=='string'||!r.title.trim()||r.title.length>120||typeof r.body!=='string'||r.body.length>100000||typeof r.kind!=='string'||!r.answers||Object.getPrototypeOf(r.answers)!==Object.prototype||Object.keys(r.answers).length>160||!Object.values(r.answers).every(validValue)) throw Error('The backup contains an invalid or duplicate record.');
  ids.add(r.id);
 }
 return data;
}
export const read=storage=>validate(JSON.parse(storage.getItem(key)||JSON.stringify(empty())));
export const write=(storage,data)=>storage.setItem(key,JSON.stringify(validate(data)));
export function merge(base,incoming,replace,uuid){
 const records=[...base.records];
 for(const record of incoming.records){
  const i=records.findIndex(x=>x.id===record.id);
  if(i<0)records.push(record);
  else if(replace)records[i]=record;
  else records.push({...record,id:uuid(),title:(record.title.slice(0,110)+' (copy)')});
 }
 return validate({version:1,records,favorites:[...new Set([...base.favorites,...incoming.favorites])]});
}
