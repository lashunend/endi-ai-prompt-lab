const select=(key,label,options,required=false)=>({key,label,options:options.split('|'),required});
const field=(key,label,required=false,long=false)=>({key,label,required,long});
const check=(key,label)=>({key,label,check:true});
const multi=(key,label,options)=>({...select(key,label,options),multi:true});
const adult=select('owner','Whose appearance are we keeping consistent?','My own appearance|A client’s appearance',true);
const permission=check('permission','I confirm I am the adult in the reference, or the adult client gave me permission to use their likeness.');
const identity=check('identity','I will attach an approved identity portrait');
const body=check('body','I will attach a separate full-body reference');
const outfitRef=check('outfitRef','I will attach an outfit inspiration photo');
const productRef=check('productRef','I will attach a product reference');
const crop=select('crop','Photo type','Headshot|Chest-up|Three-quarter|Full-body|Environmental wide|Product detail|Overhead|Custom');
const light=select('light','Lighting','Window daylight|Open shade|Late-afternoon sun|Overcast|Controlled studio|Custom');
const expression=select('expression','Expression','Relaxed|Soft smile|Candid laugh|Warm and friendly|Calm/neutral|Custom');
const setting=select('setting','Setting','Studio|Office|Café|Outdoor greenery|Cozy home|Plain neutral wall|Neighborhood street|White seamless|Gray seamless|City street|Beach|Park|Rooftop|Living room|Kitchen|Gym|Coworking|Hotel lobby|Penthouse city view|Yacht|Fine dining|Custom');
const wardrobe=[field('outfit','Clothing and fit'),field('colors','Colors'),field('fabric','Fabric and texture'),field('shoes','Footwear'),field('accessories','Accessories and jewelry'),field('nails','Nail style'),field('hairStyle','Hairstyle'),field('makeup','Makeup or grooming'),field('styling','Styling notes')];
const camera=[crop,expression,field('pose','Pose or action'),field('camera','Camera angle and lens'),field('depth','Depth of field'),field('mood','Mood')];
const location=[setting,field('background','Background'),light,field('time','Time of day')];
const foundation=[field('name','Character name'),select('presentation','Presentation','Feminine|Masculine|Androgynous|Custom',true),select('age','Adult age band','18–24|25–34|35–44|45–54|55–64|65+|Custom',true),select('heritage','Ethnicity / Heritage','East Asian|South Asian|Southeast Asian|Central Asian|Black · African|Black · Caribbean|African American|Hispanic / Latino|Middle Eastern|North African|White · European|Indigenous · Americas|Pacific Islander|Aboriginal / Torres Strait Islander|Mixed heritage|Custom'),select('skin','Skin depth','Very fair|Fair|Light|Medium|Tan|Brown|Medium-deep brown|Deep brown|Custom',true),select('undertone','Undertone','Warm golden/peach|Cool|Neutral|Olive|Custom'),select('build','Body type','Average|Slim|Athletic|Broad|Curvy|Plus-size|Custom',true)];
const traits=['Face shape','Eye shape','Eye color','Nose structure','Lip shape','Distinguishing features','Cheekbones','Jawline','Natural asymmetry','Hairline','Proportions'].map(label=>field(label.replaceAll(' ','').toLowerCase(),label));
const hair=[select('texture','Natural texture','Straight|Wavy|Curly|Tight coils|Custom'),select('length','Hair length','Short|Chin-length|Shoulder-length|Mid-back|Waist-length|Custom'),select('cut','Cut','Bob|Short crop|Layered|Bald|Custom'),select('hairStyle','Styled finish','Sleek straight|Waves|Defined curls|Full rounded afro|Braids|Twists|Locs|Bun|Custom'),field('hairColor','Natural hair color'),field('highlights','Highlights'),select('makeup','Makeup','No makeup|Natural finish|Soft glam|Full glam|Editorial finish|Custom'),field('grooming','Grooming or facial hair')];
const subject=select('subjectType','Subject source','My AI Twin|A client’s AI Twin|My Saved AI Influencer|Character From a Reference Photo|New Fictional Character|My Photoshoot Image|Product or Object|Food|Architecture or Interior|Custom Subject',true);
const record={key:'recordId',label:'Reuse a saved profile or shoot',record:true};
const description=field('subject','Describe the subject');
const chat=select('chat','Where will you edit?','Fresh chat|Same chat',true);
const target=check('target','I will attach the result image to edit');
export const issueMap={
 'Face differs from reference':['identity','Restore individual facial structure, feature placement and natural asymmetry using the confirmed identity source.'],
 'Face changes across images':['identity','Keep the restored facial identity stable between images.'],
 'Changed complexion':['skin tone','Restore the source complexion and undertone under the current lighting.'],
 'Overly smooth skin':['skin texture','Restore believable pores and fine tonal variation.'],
 'Mismatched features':['identity','Restore the specified facial features using the confirmed likeness source.'],
 'Wrong hairstyle':['hairstyle','Correct the hairstyle to match the requested finish.'],
 'Wrong hair color or texture':['hairstyle','Restore the requested hair color and texture.'],
 'Artificial hair sheen':['hairstyle','Use natural strand detail and realistic highlights.'],
 'Changed proportions':['body proportions','Restore the intended body proportions and scale.'],
 'Unintentionally slimmer or larger':['body proportions','Restore the requested body size.'],
 'Distorted hands or limbs':['anatomy','Correct hand, finger and limb anatomy while preserving natural contact.'],
 'Wrong pose':['pose','Apply the intended pose and credible weight distribution.'],
 'Wrong outfit or accessories':['outfit','Correct the specified garment, fabric, fit, color or accessories.'],
 'Wrong setting':['background','Correct the background to the specified setting.'],
 'Wrong camera angle or crop':['camera framing','Reframe at the requested angle and crop.'],
 'Missing full-body view':['camera framing','Frame the complete subject from head to shoes.'],
 'Unrealistic light or shadows':['lighting','Reconcile light direction and physically plausible shadows.'],
 'Distorted surroundings':['background','Restore coherent geometry and perspective.'],
 'Wrong product color or details':['product appearance','Restore the supplied product color, construction and details.'],
 'Warped packaging or unreadable lettering':['product appearance','Restore packaging geometry and legible supplied branding.'],
 'Artificial appearance':['realism','Restore physically credible detail and tonal variation.'],
 'Unnecessary objects':['objects','Remove the unintended objects and restore the exposed surfaces.'],
 'Result misses the prompt':['concept','Apply the requested original concept.'],
 'Custom':['custom','Apply the specified correction.']
};
const issues=multi('issues','Issues to correct',Object.keys(issueMap).join('|'));
const clarify=[field('problem','What happened?',false,true),field('desired','What should happen instead?',false,true),chat];
const preserve=multi('preserve','Details to retain from the result','identity|skin tone|body proportions|hairstyle|outfit|background|pose|camera framing|product appearance|lighting');
export const fixes=[['Choose result type',[select('resultType','Result type','AI Twin|Fictional AI influencer|Photoshoot|Product or object image|General image',true),record]],['Choose issues',[issues]],['Clarify the edits',clarify],['Choose what stays',[preserve,field('keep','Other details to keep'),identity,body,outfitRef,productRef,target]],['Correction result',[],'correction']];
export const tools={
 twin:{title:'Create Your AI Twin',short:'AI Twin',desc:'Build a likeness reference you can reuse.',steps:[
 ['Start',[adult,permission]],['Creation style',[select('goal','What would you like to create?','Professional headshot|Full-body portrait|Lifestyle image|Personal branding image',true),select('aesthetic','Styling','Natural everyday|Polished editorial')]],
 ['Portrait prep',[identity,...location,field('hairStyle','Hairstyle'),field('makeup','Makeup or grooming'),select('clothing','Clothing source','Preserve clothing in the identity photo|Describe clothing|Use outfit inspiration'),field('outfit','Clothing details or what to take from inspiration'),outfitRef,expression,select('pose','Pose','Facing camera|Slight turn|Looking off-camera|Custom'),select('crop','Portrait crop','Head-and-shoulders|Chest-up'),field('features','Features to preserve')]],
 ['Portrait prompt',[],'portrait'],['Review & fix',[issues,...clarify,target,preserve,check('approved','I approved and saved the master portrait')],'review'],
 ['Full-body prep',[body,field('proportions','Visible proportions'),field('bodyPose','Stance'),field('bodyShoes','Footwear'),field('bodyOutfit','Wardrobe'),field('bodySetting','Background'),field('bodyLight','Lighting')]],
 ['Full-body prompt',[],'companion'],['Master references',[check('bodyApproved','I approved and saved the full-body image')],'summary']]},
 influencer:{title:'Create a Photoreal AI Influencer',short:'AI Influencer',desc:'Design an original fictional adult and a master portrait.',saved:'My Characters',steps:[
 ['Creation mode',[select('mode','Mode','Quick Create|Detailed',true)]],['Character foundation',[...foundation,...traits]],['Hair and grooming',hair],['Wardrobe and visual style',[select('aesthetic','Aesthetic','Quiet luxury|Everyday casual|Professional|Streetwear|Fitness|Editorial|Beauty content|Custom'),...wardrobe.filter(x=>!['hairStyle','makeup'].includes(x.key))]],['Background and photography',[...location,...camera]],['Master character prompt',[],'influencer'],['Save and reuse',[identity,...wardrobe,...location,...camera],'content']]},
 shoot:{title:'Plan a Photoshoot',short:'Photoshoot',desc:'Build a single image or a coordinated shot series.',saved:'Saved Photoshoots',steps:[
 ['Subject',[subject,record,description,permission,identity,body]],['Shoot idea',[select('direction','Planning mode','Style Library|Creative Director Mode',true),select('concept','Style Library concept','Birthday celebration|Fashion editorial|Personal branding|Lifestyle travel|Beauty hero|Salon reveal|Fitness wellness|Christmas gathering|Fashion accessory campaign|Skincare campaign|Branded lifestyle campaign|Luxury portrait|Cinematic story|Custom'),field('idea','Creative concept',false,true),field('goal','Goal'),field('audience','Audience'),field('occasion','Occasion'),field('channel','Platform'),field('requirements','Non-negotiables')]],
 ['Wardrobe and appearance',[...wardrobe,check('keepOutfit','Keep clothing as shown in the approved reference'),outfitRef,field('materials','Product materials and packaging'),field('surface','Surface or set')]],
 ['Location and light',location],['Pose and camera',camera],['Props and details',[multi('props','Props','Birthday cake|Balloons|Number balloons|Flowers|Candles|Wrapped gifts|Luggage|Coffee cup|Laptop|Skincare products|Cosmetics|Bags/accessories|Fitness equipment|Seasonal decor'),field('customProps','Additional props'),check('campaign','This is a product campaign'),field('product','Product name and appearance'),field('placement','Position and interaction'),productRef,field('brandColors','Brand colors'),field('exclude','Exclusions'),field('notes','Additional instructions')]],['Photoshoot prompt',[],'shoot']]},
 vault:{title:'Ready-made Prompts',short:'Prompt Vault',desc:'Browse, customize, and save 60 finished prompts.',saved:'My Prompts'},
 consistency:{title:'Character Consistency',short:'Consistency',desc:'Lock identity, move into new scenes, and repair drift.',saved:'Saved',steps:[
 ['Choose character',[subject,record,adult,permission]],['Define fixed identity',[...foundation.map(x=>({...x,required:false})),...traits,...hair.filter(x=>['texture','hairColor'].includes(x.key))]],['Reference checklist',[identity,body]],['Lock identity',[],'lock'],['Change the scene',[multi('changes','Allow these elements to change','Outfit|Hairstyle|Makeup|Pose|Setting|Framing|Light|Mood'),...wardrobe,...location,...camera],'scene']]},
 video:{title:'AI Video Studio',short:'Video Studio',desc:'Direct a continuous clip from text or a starting still.',saved:'Saved Videos',steps:[
 ['Method',[select('method','Creation method','Image-to-Video|Text-to-Video',true)]],['Subject',[subject,record,description,adult,permission,field('features','Features to preserve'),field('frame','Name the starting still'),identity,body]],['Platform',[select('platform','Platform','Higgsfield|Kling|Runway|Pika|Custom',true)]],
 ['Details',[field('start','Starting scene or pose'),select('movement','Main movement','Turn toward the camera|Head turn|Subtle expression change|Walk|Product reveal|Custom',true),field('end','Ending state'),expression,select('motion','Camera motion','Static|Slow push-in|Slow pull-back|Gentle handheld follow|Smooth side tracking|Slow orbit|Slow tilt|Slow pan|Crane rise|Custom'),...location,select('crop','Shot framing','Close-up|Medium shot|Full-body|Wide scene|Custom'),field('duration','Desired duration'),field('pace','Pacing'),field('atmosphere','Background motion'),field('sound','Dialogue or ambient sound'),field('mood','Mood')]],['Video prompt',[],'video']]},
 fixer:{title:'Prompt Fixer',short:'Prompt Fixer',desc:'Describe a correction or prepare a prompt for rewriting.',saved:'Saved',steps:fixes}
};
export const improvementOptions=['Stronger photorealism','Better lighting','Detailed clothing','Natural skin','Stable identity','Clearer camera composition','Product accuracy','Shorter and clearer wording','Conflict removal'];
export const customizeFields=[description,...wardrobe,...location,...camera,field('product','Product'),field('materials','Materials and packaging'),field('surface','Surface'),field('customProps','Props'),field('notes','Creative notes'),field('exclude','Exclusions'),identity,body,outfitRef,productRef,permission];
export const isTwin=(a,kind)=>['portrait','companion','review','twinCorrection'].includes(kind)||a.resultType==='AI Twin'||/AI Twin/.test(a.subjectType||'');
export const realSubject=a=>/AI Twin|Reference Photo/.test(a.subjectType||'');
export const value=(a,k)=>a[k]==='Custom' ? (a[k+'Custom']||'').trim() : (typeof a[k]==='string'?a[k].trim():a[k]);
