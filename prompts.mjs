import {describeChoice} from './prompt-directions.mjs';
import {issueMap,isTwin,value} from './schema.mjs';
export const cameraDefaults={Headshot:'Eye-level 85mm portrait perspective at f/2.8–4', 'Head-and-shoulders':'Eye-level 85mm portrait perspective at f/4','Chest-up':'Eye-level 50–85mm portrait perspective','Three-quarter':'50mm perspective at a natural chest-to-waist camera height','Full-body':'50mm at about f/4 from waist height, with enough distance to fit head, hands and shoes','Environmental wide':'35mm environmental framing with important subjects clear of the edges','Product detail':'Macro perspective with enough depth to read the relevant surfaces','Overhead':'True 90-degree overhead view with even focus'};
export const profileKeys='name presentation age heritage skin undertone build faceshape eyeshape eyecolor nosestructure lipshape distinguishingfeatures cheekbones jawline naturalasymmetry hairline proportions texture hairColor length cut highlights features'.split(' ');
const profileLabels=['Name','Presentation','Apparent adult age','Ethnicity / Heritage','Skin depth','Undertone','Build','Face shape','Eye shape','Eye color','Nose structure','Lip shape','Distinguishing features','Cheekbones','Jawline','Natural asymmetry','Hairline','Proportions','Natural hair texture','Hair color','Hair length','Haircut','Highlights','Features to preserve'];
const realism={
 people:'Keep skin tone continuous across visible areas, with fine pores and local tonal variation. Keep visible irises and catchlights believable, maintain the hairline and strand detail, and use plausible anatomy, fabric drape and contact shadows.',
 product:'Keep scale and edges accurate. Render materials with their actual finish, plausible contact shadows and reflections. Preserve recognizable construction and any legible supplied branding. Leave intentionally unmarked surfaces blank.',
 food:'Keep ingredient shape, portions, surface moisture and texture true to the named dish. Match visual cues to serving temperature and keep food contact with the plate credible.',
 place:'Keep scale and perspective coherent, architectural verticals straight where appropriate, and materials, lighting, shadows and reflections physically plausible.'
};
const negatives={people:['Facial drift or generic facial substitutions','Beauty-filter skin or distorted anatomy'],product:['Warped packaging or invented label text','Floating objects or physically inconsistent reflections'],food:['Waxy textures or invented ingredients','Temperature cues that contradict the dish'],place:['Crooked verticals, implausible scale or impossible structures','Unmotivated light or reflections'],video:['Identity or object morphing','Flicker, sliding motion or background warping','Abrupt camera jumps'],correction:['Unrequested changes to the image','New details that conflict with the confirmed source'],improve:['Inventing requirements, reference images or facts','Dropping the intended deliverable or meaningful constraints']};
const labeled=(a,fields)=>fields.map(([key,label])=>describeChoice(key,label,value(a,key))).filter(Boolean);
const lines=(...items)=>items.flat().filter(Boolean);
const blocks=(sections)=>sections.filter(([,body])=>body?.length).map(([title,body])=>title+'\n'+(Array.isArray(body)?body.join('\n'):body)).join('\n\n');
const list=(items)=>[...new Set(items.filter(Boolean))].map(x=>'• '+x);
const humanRealism=[
 'Skin: Preserve visible pores, fine facial hair, subtle tonal variation, and consistent complexion across the face, neck, and hands. Keep texture visible through makeup.',
 'Face: Retain natural asymmetry, eye and lip texture, believable irises, and catchlights that match the actual light sources.',
 'Hair: Render the natural hairline, individual strands, and believable flyaways for the chosen style.',
 'Anatomy: Use natural posture, credible joints, and anatomically correct hands with believable contact and grip.',
 'Lighting: Match shadows, reflections, and depth of field to the chosen environment and camera setup.'
];
const detailStandards={
 product:[
  'Construction: Maintain the selected silhouette, proportions, closures, edges, seams, and packaging dimensions. Use the supplied reference or description as the source for those details.',
  'Materials: Distinguish matte, polished, transparent, and textured surfaces. Match highlights and reflections to the material and direction of the light.',
  'Placement: Show believable scale, weight, and contact shadows between the object and its support. Keep the main features legible at the requested crop.',
  'Branding: Reproduce supplied label text only where it can be rendered faithfully. Leave unsupported lettering and marks off the packaging.'
 ],
 food:[
  'Ingredients: Keep the named components recognizable and preserve believable serving size and relative scale.',
  'Texture: Render the expected cut surfaces, crumb, moisture, and sheen for the dish. Use melting, condensation, or steam only when appropriate to its serving temperature.',
  'Plating: Show realistic contact with the dish, natural variations in placement, and coherent shadows.'
 ],
 place:[
  'Geometry: Keep architectural edges, floor levels, openings, and verticals coherent with the selected viewpoint.',
  'Scale: Maintain credible relationships between doors, furniture, circulation space, and surrounding structures where visible.',
  'Materials and light: Render surface texture, glazing, reflections, and shadows consistently with the materials and actual light sources.'
 ]
};
const influencerRealism=[
 ['Skin realism',[
  'Show natural pores across the nose, cheeks, and forehead. Include fine facial hairs, subtle unevenness, and natural tonal changes that remain visible through makeup.',
  'Keep complexion consistent across visible skin. Let highlights and shadows follow facial structure and the selected lighting.'
 ]],
 ['Facial realism',[
  'Use anatomically believable proportions with small differences between the eyes, brows, nostrils, and corners of the mouth.',
  'Render detailed irises, natural pupils, a subtle waterline, and catchlights that correspond to the light sources.',
  'Show fine lip lines and natural color variation. If teeth are visible, keep their shape, spacing, and shade believable.'
 ]],
 ['Hair realism',[
  'Render individual strands, realistic density, an irregular hairline, and any fine edge hairs or flyaways appropriate to the selected style. Keep sheen consistent with hair texture and light.'
 ]],
 ['Body realism',[
  'Follow the specified build and keep the shoulders, arms, joints, and posture anatomically credible. Preserve natural weight distribution, with five fingers per visible hand, believable knuckles, and correctly placed nails.'
 ]],
 ['Photographic realism',[
  'Use coherent perspective, plausible depth of field, and shadows where the subject, clothing, and props touch surrounding surfaces. Retain believable material texture and garment construction.'
 ]]
];
const aestheticDirections={
 'Quiet luxury':'Use understated tailoring, a restrained palette, and subtle material texture. Keep accessories refined and free of conspicuous logos, while following any explicit styling choices.',
 'Beauty content':'Use styling and composition that direct attention to the face, skin, and makeup. When clothing is unspecified, use a simple neutral top with a clean neckline.',
 Editorial:'Use intentional styling and a composed fashion-editorial presentation. Keep the selected garments and accessories recognizable.',
 Professional:'Use polished, well-fitted styling appropriate for a professional portrait.',
 'Everyday casual':'Use relaxed, credible everyday styling with natural garment fit and movement.',
 Streetwear:'Emphasize the selected silhouette, layering, and streetwear details while keeping scale and drape believable.',
 Fitness:'Keep the styling suited to movement and preserve realistic fabric tension and fit.'
};
const wardrobeRealism='Clothing realism: Show credible fabric weight, seams, hems, folds at the joints, and a fit that follows the subject’s body.';
function identityPreservation(refs){
 const face=refs.findIndex(ref=>ref.role==='identity')+1;
 const body=refs.findIndex(ref=>ref.role==='body')+1;
 if(!face)return [];
 return [
  `Preserve exactly, from Image ${face}: facial structure, skin tone and undertone, eye shape, nose and lip proportions, distinguishing features (including any freckles, marks, scars, or dimples), and natural facial asymmetry.`,
  body?`Preserve the subject’s natural body proportions, apparent height, and body shape from Image ${body}.`:'Preserve natural body proportions wherever visible in the identity reference. Where the portrait does not show the body, use the supplied body description and avoid guessing an exact height or build.',
  'Do not beautify, slim, reshape, de-age, lighten or darken the subject. Do not invent a new face.',
  'Tailor the clothing to the subject’s real body. Never change body proportions to fit the outfit.'
 ];
}
const improvementGuidance={
 'Stronger photorealism':'Specify plausible materials, surface detail, scale, and natural variation suited to the subject.',
 'Better lighting':'Clarify light direction, quality, and plausible sources. Align shadows, reflections, and catchlights with those sources.',
 'Detailed clothing':'Describe the selected garment’s fit, construction, fabric weight, seams, and natural folds without substituting garments.',
 'Natural skin':'Keep natural pores, tonal variation, and complexion continuity across visible skin. Avoid airbrushing.',
 'Stable identity':'Assign each reference a clear role. Preserve facial structure, complexion and undertone, distinguishing features, and body proportions where supported.',
 'Clearer camera composition':'Specify the framing, viewpoint, focus priority, and what must remain in frame.',
 'Product accuracy':'Maintain the reference product’s silhouette, materials, colors, packaging, and supplied legible branding.',
 'Shorter and clearer wording':'Remove repetition and combine overlapping directions while preserving all decisions.',
 'Conflict removal':'Resolve incompatible instructions in favor of explicitly selected details and retain compatible constraints.'
};
const imageFocus={
 people:'Focus precisely on the nearest visible eye. Resolve the iris, eyelashes, brow hairs, and natural skin texture at the chosen framing. In a full-body shot, retain clear facial features and garment detail without changing the crop.',
 product:'Focus on the featured product and use enough depth of field to resolve its defining edges, surface texture, and any supplied legible label.',
 food:'Focus on the main dish and keep the visible ingredients, cut surfaces, and textures cleanly resolved.',
 place:'Keep the key architectural features, material textures, and edges sharply resolved, with depth of field suited to the scene.'
};
export const isCorrection=kind=>['correction','review','twinCorrection','drift'].includes(kind);
export function referenceList(a,kind){
 const refs=[];
 const add=(role,label,instruction)=>refs.push({role,label,instruction});
 if(kind==='video'){
   if(a.method==='Image-to-Video') add('frame',a.frame?.trim()||'Starting still','Animate this exact frame and preserve the subject and scene continuity.');
   return refs;
 }
 if(kind==='improve') return refs;
 const twin=isTwin(a,kind);
 const approved=kind==='companion'||(twin&&!['portrait','review','twinCorrection','correction','drift'].includes(kind));
 if(a.identity||['portrait','companion'].includes(kind)||kind==='review') add('identity',approved?'Approved master portrait':twin?'Original identity photo':a.startSource==='Upload a Reference Photo'?'Original subject reference photo':a.startSource==='My AI Influencer'?'Approved AI influencer portrait':'Approved identity portrait','Use this as the authority for facial structure, proportions, complexion, distinguishing features and natural asymmetry.');
 if(a.body&&kind!=='portrait'&&kind!=='review') add('body',kind==='companion'?'Original head-to-toe photo':'Approved full-body photograph','Use this only for actual body proportions and stature.');
 if(a.outfitRef&&!['companion','lock','scene'].includes(kind)) add('outfitRef','Outfit inspiration photo','Use only the garment cut, color, fabric, fit and accessories. Derive the subject’s face, body, hair and pose independently of the clothing model.');
 if(a.productRef&&!['portrait','companion','lock','scene','review'].includes(kind)) add('productRef','Product reference photo','Preserve the product’s supplied silhouette, material, color, seams, packaging geometry and existing branding.');
 if(isCorrection(kind)&&a.chat!=='Same chat'&&a.target) add('target','Generated result to edit','Apply corrections to this image and use it as the source for selected details that should stay.');
 return refs;
}
export function usageGuide(a,kind,refs=referenceList(a,kind)){
 if(!isTwin(a,kind)||['video','lock','improve'].includes(kind))return '';
 const same=isCorrection(kind)&&a.chat==='Same chat';
 const steps=[same?'Return to the ChatGPT chat that contains the result you want to edit. Reuse that result as the correction target.':'Open a new chat in ChatGPT.',
 ...refs.map(({role,label},i)=>role==='identity'&&kind==='portrait'?'Use the + or paperclip button to attach the same original reference photo you used to create your AI twin. Attach it first.':role==='outfitRef'?'Attach your outfit inspiration photo as Image '+(i+1)+'. This photo lets ChatGPT match the clothing and accessories.':'Attach '+label.toLowerCase()+' as Image '+(i+1)+'.'),
 refs.length?'Paste this entire prompt into the same message as your photos and send it.':'Paste this entire prompt into the conversation and send it.',
 'Download your image. If anything looks off, '+(kind==='portrait'||kind==='companion'?'return to the generator and select Review & fix.':'use Prompt Fixer to describe the change.')];
 return 'HOW TO USE THIS PROMPT\n\n'+steps.map((step,i)=>(i+1)+'. '+step).join('\n');
}
export function correctionConflicts(a){
 return (a.issues||[]).map(issue=>issueMap[issue]?.[0]).filter(key=>key&&key!=='identity'&&(a.preserve||[]).includes(key));
}
function videoFormat(a){
 const framing=value(a,'crop')||'';
 if(/wide|establishing|landscape|environmental/i.test(framing))return '16:9 landscape';
 if(/close.up|medium|full.body|portrait|vertical|headshot/i.test(framing))return '9:16 vertical';
 if(a.method==='Image-to-Video')return 'Match the starting image';
 return ['Slow side tracking','Slow pan','Crane rise'].includes(a.motion)?'16:9 landscape':'9:16 vertical';
}
export function renderPrompt(kind,input){
 const companion=kind==='companion';
 const a=companion?{...input,crop:'Full-body',pose:input.bodyPose,shoes:input.bodyShoes,outfit:input.bodyOutfit,setting:input.bodySetting,light:input.bodyLight,outfitRef:false,makeup:'',hairStyle:'',background:''}:input;
 const refs=referenceList(a,kind);
 const section=['REFERENCE INSTRUCTIONS',refs.map(({label,instruction},i)=>'Image '+(i+1)+' — '+label+'. '+instruction+(label==='Outfit inspiration photo'&&value(a,'outfit')?' Requested outfit details: '+value(a,'outfit')+'.':''))];
 const guide=usageGuide(a,kind,refs);
 const likeness=identityPreservation(refs);
 const type=a.type||({'Product or Object':'product','Food':'food','Architecture or Interior':'place'}[a.subjectType])||'people';
 const mode=a.subjectType||'';
 const fictional=['influencer','content'].includes(kind)||/Fictional|Saved AI Influencer/.test(mode)||a.fictional;
 const identity=labeled(a,profileKeys.map((key,i)=>[key,profileLabels[i]]));
 const styling=labeled(a,[['aesthetic','Aesthetic'],['outfitType','Outfit type'],['outfit','Clothing and fit'],['colors','Palette'],['fabric','Fabric'],['shoes','Footwear'],['accessories','Accessories'],['jewelry','Jewelry'],['nails','Nails'],['styling','Styling notes']]);
 const hair=labeled(a,[['texture','Natural texture'],['length','Length'],['cut','Cut'],['hairColor','Color'],['highlights','Highlights'],['hairStyle','Styled finish'],['makeup','Makeup'],['grooming','Grooming']]);
 const setting=labeled(a,[['setting','Location'],['background','Background'],['scenePalette','Scene palette'],['surface','Surface'],['time','Time of day']]);
 const light=labeled(a,[['light','Light'],['mood','Mood'],...(type!=='people'?[['colors','Palette']]:[]),['brandColors','Brand palette']]);
 const crop=value(a,'crop')||(kind==='portrait'?'Head-and-shoulders':kind==='influencer'?'Chest-up':'');
 const chosenRatio=value(a,'ratio');
 const automaticRatio=['Full-body','Walking lifestyle'].includes(crop)?'2:3':crop==='Environmental wide'||(!crop&&type==='place')?'3:2':crop==='Overhead'?'1:1':'4:5';
 const ratio=a.verticalSeriesShot?'9:16':kind==='vault'&&chosenRatio?chosenRatio:automaticRatio;
 const camera=lines(describeChoice('crop','Framing',crop),describeChoice('angle','Camera angle',value(a,'angle')),value(a,'camera')||(value(a,'angle')&&crop==='Full-body'?'50mm at about f/4 with enough distance to fit head, hands and shoes':(cameraDefaults[crop]||cameraDefaults[{'Close-up beauty portrait':'Headshot','Head-and-shoulders portrait':'Head-and-shoulders','Waist-up portrait':'Chest-up','Three-quarter body':'Three-quarter','Seated portrait':'Three-quarter','Walking lifestyle':'Full-body','Editorial pose':'Three-quarter','Product interaction':'Chest-up'}[crop]])),labeled(a,[['depth','Depth of field']]));
 const action=lines(labeled(a,[['pose','Action or pose'],['position','Body positioning'],['gaze','Eye contact'],['expression','Expression'],['customProps','Props'],['placement','Placement and interaction'],['interaction','Product interaction']]),a.props?.length?'Include these props: '+a.props.join(', '):'');
 const outcome=labeled(a,[['goal','Intended use'],['audience','Audience'],['occasion','Occasion'],['channel','Platform'],['requirements','Requirements'],['notes','Creative notes']]);
 const extra=value(a,'exclude');
 const finish=(avoid,output)=>[['AVOID',list([...avoid,...(a.avoid||[]),extra])],['OUTPUT',output]];
 const imageOutput='Deliver one realistic '+ratio+' photograph.'+(['portrait','influencer'].includes(kind)?' Keep the face recognizable and unobstructed.':crop==='Full-body'?' Preserve the complete head-to-shoes frame.':'');
 const defaultAvoid=[...(negatives[type]||negatives.people),...(a.uniqueAvoid?[a.uniqueAvoid]:['Unrequested text, logos or watermarks'])];
 let opening,sections;
 if(isCorrection(kind)){
   const targetIndex=refs.findIndex(r=>r.role==='target');
   opening=targetIndex>=0?'Edit Image '+(targetIndex+1)+' and return a corrected photograph.':a.chat==='Same chat'?'Edit the existing generated image in this conversation and return a corrected photograph.':'Correct the result image and return a revised photograph.';
   const preserve=(a.preserve||[]).map(x=>x==='identity'&&refs.some(r=>r.role==='identity')?'identity from the authority portrait':x);
   const corrections=(a.issues||[]).map((issue,i)=>issueMap[issue]&&((i+1)+'. '+issueMap[issue][1]+(a.issueDetails?.[issue]?' Target: '+a.issueDetails[issue]:'')));
   sections=[section,['WHAT TO FIX',lines(corrections,labeled(a,[['problem','Observed problem'],['desired','Requested result']]))],['WHAT TO PRESERVE',list(lines(preserve.length&&'Keep '+preserve.join(', ')+'.',preserve.includes('identity from the authority portrait')&&likeness,a.keep,'Keep untargeted composition, background, camera perspective, lighting, wardrobe, and props as they appear in the result. Apply only the requested corrections.'))],[(a.resultType==='Product or object image'?'PRODUCT ACCURACY':'REALISM'),list(a.resultType==='Product or object image'?detailStandards.product:humanRealism)],...finish(negatives.correction,'Return one corrected image at the result’s original aspect ratio unless a reframing was requested. Compare the corrected details against the confirmed source.')];
 }else if(kind==='improve'){
   opening='Rewrite the supplied prompt text using the selected editorial guidance.';
   sections=[['SOURCE PROMPT',a.source],['IMPROVEMENT INSTRUCTIONS',list(lines((a.improvements||[]).map(x=>improvementGuidance[x]||x),a.improveCustom,'Preserve the original task, selected details, references, and output requirements. Resolve only genuine conflicts and keep the revised instructions actionable.','If the source requests a photograph, specify the primary focus point, naturally resolved fine detail, and the highest native image quality available while respecting the requested depth of field.'))],...finish(negatives.improve,'Return the revised prompt text, ready to paste into the intended tool.')];
 }else if(kind==='video'){
   const image=a.method==='Image-to-Video';
   const videoRatio=videoFormat(a);
   opening=image?'Animate the attached starting still into one continuous realistic video clip.':'Create one continuous realistic video clip from the described scene.';
   sections=[section,['SUBJECT AND CONTINUITY',lines(a.subject,identity,image&&'Preserve the starting still’s subject, materials and geometry throughout the shot.')],['SETTING AND LIGHT',lines(setting,light,a.atmosphere&&'Use this background motion: '+a.atmosphere+'. Keep it consistent with the environment and secondary to the main action.')],['ACTION AND TIMING',labeled(a,[['start','Start'],['movement','Main action'],['expression','Expression'],['pace','Pace'],['end','Finish'],['sound','Audio preference']])],['CAMERA AND COMPOSITION',labeled(a,[['motion','Camera movement'],['crop','Shot size']])],['MOTION REALISM',list(lines('Continuity: Keep subject scale, scene geometry, materials, and lighting coherent from the first frame to the last.',image&&'Use the starting still as the visual authority for identity, clothing, props, and background. Keep selected changes confined to the requested movement.',type==='people'&&'Preserve visible facial structure, complexion, distinctive features, and body proportions through movement. Use natural blinking, weight shifts, and hair and fabric motion when visible.','Physics: Begin, accelerate, and settle naturally. Keep feet, hands, and objects in credible contact with their surfaces.','Camera: Keep the chosen camera motion consistent. Maintain perspective, focus behavior, and readable framing throughout.'))],...finish(negatives.video,'Return one continuous clip'+(a.duration?' with a preferred duration of '+a.duration:'')+'. '+(videoRatio==='Match the starting image'?'Match the aspect ratio of the starting image.':'Use a '+videoRatio+' frame.')+' Keep the start, motion and finish legible.')];
 }else if(kind==='lock'||kind==='scene'){
   const allow=new Set(a.changes||[]);
   const selected=lines(allow.has('Outfit')&&styling,allow.has('Hairstyle')&&labeled(a,[['hairStyle','Hairstyle']]),allow.has('Makeup')&&labeled(a,[['makeup','Makeup']]),allow.has('Pose')&&action,allow.has('Setting')&&setting,allow.has('Framing')&&camera,allow.has('Light')&&labeled(a,[['light','Lighting']]),allow.has('Mood')&&labeled(a,[['mood','Mood']]));
   opening=kind==='lock'?'Establish the following identity for future image requests in this conversation.':'Create one photorealistic image of the defined character in the requested new scene.';
   sections=[section,['CHARACTER IDENTITY',fictional?'The character is an original fictional adult.':'Preserve the defined subject’s identity.'],['FEATURES TO PRESERVE',lines(identity,a.subject,likeness.length?list(likeness):'Keep these written traits consistent.')],[kind==='lock'?'ALLOWED CHANGES':'SCENE AND PHOTOGRAPHY',kind==='lock'?'Allow scene, lighting, expression and styling to vary only when explicitly requested.':selected],['HUMAN REALISM',list(humanRealism)],...finish(defaultAvoid,kind==='lock'?'Acknowledge these identity instructions in text and wait for a scene request.':imageOutput)];
 }else if(kind==='influencer'||kind==='content'){
   const name=value(a,'name');
   const fullBody=crop==='Full-body';
   const makeup=value(a,'makeup');
   const texture=value(a,'texture');
   const finishStyle=value(a,'hairStyle');
   const hairDetails=value(a,'cut')==='Bald'?['bald scalp with natural texture']:lines(value(a,'hairColor')&&'color '+value(a,'hairColor'),value(a,'highlights')&&'highlights '+value(a,'highlights'),texture&&'naturally '+texture.toLowerCase()+' texture',value(a,'length')&&value(a,'length').toLowerCase()+' length',value(a,'cut')&&value(a,'cut').toLowerCase()+(value(a,'cut')==='Short crop'?'':' cut'),finishStyle&&'styled as '+finishStyle.toLowerCase());
   const features=labeled(a,profileKeys.map((key,i)=>[key,profileLabels[i]]).filter(([key])=>!['name','skin','undertone','texture','hairColor','length','cut','highlights'].includes(key)));
   const cameraDetail=fullBody?'Keep both feet and any footwear clearly visible.':'Leave the face unobstructed within the chosen crop.';
   opening='Create a single photorealistic photograph of an original fictional adult'+(name?' named '+name:'')+', designed as a realistic AI influencer. This character should have a distinct appearance. Do not model the character on any real person, celebrity, or public figure.'+(name?' The name is a character label. Do not render it as text.':'');
   sections=[
    section,
    ['CHARACTER IDENTITY (keep exactly as described)',list(lines(features,
     value(a,'age')&&'The character must clearly read as an adult.',
     (value(a,'skin')||value(a,'undertone'))&&lines(labeled(a,[['skin','Skin'],['undertone','Undertone']]),'Keep the complexion consistent across the face, neck, hands, and body.'),
     likeness,'Give the face individual, natural features. Follow the supplied traits without inferring facial features, hair texture, or body type from ethnicity or heritage.'))],
    ['HAIR AND BEAUTY',list(lines(hairDetails.length&&'Render the character’s hair with '+hairDetails.join(', ')+'.',makeup&&describeChoice('makeup','Makeup',makeup),value(a,'grooming')&&describeChoice('grooming','Grooming',value(a,'grooming'))))],
    ['WARDROBE AND STYLE',list(lines(styling,aestheticDirections[value(a,'aesthetic')],wardrobeRealism,'Show the garment’s natural weave or knit, construction, and any selected closures.'))],
    ['SCENE AND PHOTOGRAPHY',list(lines(setting,action,light,camera,cameraDetail,
     fullBody&&'Use a level camera and avoid stretching or foreshortening the body. Focus on the nearest eye and keep the background recognizable through natural depth of field.',
     `Compose the image in ${ratio}${ratio==='2:3'?' vertical':''} orientation.`))],
    ['HUMAN REALISM STANDARDS',influencerRealism.map(([title,items])=>title+':\n'+list(items).join('\n')).join('\n\n')],
    ...finish(['Cartoonish features or doll-like appearance','Plastic skin, over-smoothing, or beauty filters','Unnaturally perfect facial symmetry','Distorted anatomy or extra, missing, or fused fingers','Painted, helmet-like hair or excessive shine','Excessive HDR or oversharpening','Added text, logos, or watermarks','Unwanted changes to the specified character'],`Return one high-resolution ${ratio}${ratio==='2:3'?' vertical':''} image. Keep the face clearly visible, sharp, and unobstructed. Before finishing, compare the result with the selected identity, styling, scene, and framing, and correct any mismatch.`)
   ];
 }else if(['portrait','companion'].includes(kind)){
   opening=fictional?'Create one photorealistic '+(kind==='content'?'content photograph':'master character portrait')+' of an original fictional adult.':'Create one photorealistic '+(companion?'full-length companion image':'master portrait')+' to serve as a reusable likeness reference.';
   sections=[section,[fictional?'CHARACTER IDENTITY':'IDENTITY FEATURES TO PRESERVE',list(lines(identity,likeness,fictional?'Give this original fictional adult individual, credible features. Do not base the character on a real person or infer facial features, hair texture, or body type from heritage.':''))],['HAIR AND BEAUTY',hair.length?hair:'Keep visible hair and grooming credible and consistent with the identity reference when relevant.'],['WARDROBE AND STYLE',lines(styling,a.clothing==='Preserve clothing in the identity photo'&&!companion?'Preserve clothing visible in the original identity photo.':'')],['SCENE AND PHOTOGRAPHY',lines(setting,action,light,camera)],['HUMAN REALISM STANDARDS',list(humanRealism)],...finish(defaultAvoid,imageOutput)];
 }else if(kind==='shoot'&&type==='people'){
   const productIndex=refs.findIndex(ref=>ref.role==='productRef')+1;
   const concept=value(a,'idea')||value(a,'concept');
   const props=lines(a.props?.length?'Scene props: '+a.props.join(', '):'',value(a,'customProps')&&'Additional props: '+value(a,'customProps'));
   const product=a.campaign?lines(
    labeled(a,[['product','Featured product'],['interaction','Product interaction'],['placement','Placement'],['packaging','Packaging'],['productText','Label text or logo']]),
    productIndex&&`Match the product’s shape, scale, colors, materials, and packaging to Image ${productIndex}. Use it only as a product reference.`,
    'Preserve supplied branding where legible. If lettering cannot be rendered clearly, leave that area clean rather than inventing text.'
   ):[];
   opening='Create one high-resolution, photorealistic professional photoshoot image.'+(fictional?' Use the defined original fictional adult.':likeness.length?' Preserve the subject’s actual appearance using the numbered identity reference.':'');
   sections=[
    section,
    ['CREATIVE CONCEPT',list(lines(concept&&'Build the shoot around this concept: '+concept+'.',outcome,'Give the chosen concept, wardrobe, location, pose, and aesthetic priority. Use photography defaults only to fill gaps.'))],
    [likeness.length?'IDENTITY PRESERVATION':'CHARACTER IDENTITY',list(lines(likeness,identity,a.subject))],
    ['WARDROBE AND STYLING',list(lines(styling,hair,a.keepOutfit&&likeness.length&&'Retain the wardrobe from the approved subject reference.',wardrobeRealism))],
    ['LOCATION AND ENVIRONMENT',list(lines(setting,'Use believable depth and perspective. Match reflections and shadows to the surfaces and light sources in the selected scene.'))],
    ['PROPS AND PRODUCT',list(lines(props,props.length&&'Scale props to the subject and keep hand contact anatomically credible.',product))],
    ['POSE AND CAMERA',list(lines(labeled(a,[['pose','Pose'],['position','Body positioning'],['gaze','Eye contact'],['expression','Expression']]),camera,light,`Compose the image in a ${ratio} frame.`))],
    ['HUMAN REALISM',list(humanRealism)],
    ...finish(['Plastic-looking skin or excessive airbrushing','Facial drift, artificial symmetry or altered proportions','Distorted anatomy or extra or fused fingers','Unnatural lighting or overprocessed HDR','Unrequested text, logos or watermarks'],`${imageOutput} Before finishing, check the framing, scene, wardrobe, and product against the selected directions. ${likeness.length?'Compare the face and any body details supplied against the relevant references.':'Compare the subject against the supplied character details.'}`)
   ];
 }else{
   const category={people:'SUBJECT AND STYLING',product:'PRODUCT',food:'FOOD',place:'SPACE AND STYLING'}[type];
   const detail={people:'HUMAN REALISM',product:'PRODUCT ACCURACY',food:'FOOD REALISM',place:'ENVIRONMENT REALISM'}[type];
   opening='Create one photorealistic '+({people:'portrait',product:'product photograph',food:'food photograph',place:'architectural photograph'}[type])+' '+(value(a,'idea')?'following this creative direction: '+value(a,'idea'):'for the described scene')+'.'+(fictional&&type==='people'?' The subject is an original fictional adult.':'');
   sections=[section,[category,lines(a.subject,type==='people'?identity:[],type==='people'?hair:[],styling,type==='people'&&wardrobeRealism,type==='people'&&a.keepOutfit?'Retain clothing from the approved reference.':'',labeled(a,[['materials','Materials and packaging']]),a.product&&(type==='product'||a.campaign)?describeChoice('product','Featured product',a.product):'')],['SETTING',setting],['ACTION AND PROPS',type==='place'?[]:action],['COLOR, LIGHT AND MOOD',light],['CAMERA AND COMPOSITION',camera],['VISUAL OUTCOME',outcome.length?outcome:'Make the named subject the first point of attention.'],[detail,list(lines(type==='people'?humanRealism:detailStandards[type],a.detail))],...(type==='people'&&a.mixedFood?[['FOOD REALISM',realism.food]]:[]),...(type==='people'&&a.campaign?[['PRODUCT ACCURACY',lines(labeled(a,[['packaging','Packaging'],['productText','Requested packaging text or logo']]),a.interaction==='Holding it near the face'?'Hold the product beside the face with the front of its packaging toward camera and keep the face unobstructed.':'',realism.product)]]:[]),...finish(defaultAvoid,imageOutput+' Before finishing, check subject accuracy, the chosen camera composition, and any supplied references.')];
 }
 if(kind==='video'){
  sections.splice(-2,0,['FOCUS AND VIDEO QUALITY',list(lines(
   type==='people'?'Track the nearest visible eye as the subject moves. Keep facial features, hair, and natural skin texture clearly resolved through the shot.':imageFocus[type],
   'Track the main point of interest smoothly as distance changes. Avoid focus hunting, flickering edges, and distracting shifts in sharpness between frames.',
   'Use the highest native video quality available. Keep edges clean and fine detail stable while allowing natural motion blur where movement calls for it. Avoid compression blocks and sharpening halos.'
  ))]);
 }
 const isImage=['portrait','companion','influencer','content','shoot','vault','scene'].includes(kind)||isCorrection(kind);
 if(isImage){
  const focusType=a.resultType==='Product or object image'?'product':type;
  const primaryFocus=isCorrection(kind)
   ?'Resolve the corrected details clearly while preserving the existing focus, depth of field, and naturally soft areas elsewhere.'
   :imageFocus[focusType];
  const quality=lines(primaryFocus,a.campaign&&focusType==='people'&&'Use enough depth of field to keep the featured product and the subject’s face both clearly resolved when they share the frame.','Use the highest native image quality available for the requested framing. Resolve fine detail with natural tonal transitions and clean edges. Keep intentional background blur and avoid pixelated edges, compression blocks, artificial sharpening halos, and waxy smoothing.');
  sections.splice(-2,0,['FOCUS AND IMAGE QUALITY',list(quality)]);
 }
 return {body:[opening,blocks(sections)].join('\n\n'),guide,refs,videoRatio:kind==='video'?videoFormat(a):undefined,photoRatio:['portrait','companion','influencer','content','shoot','vault','scene'].includes(kind)?ratio:undefined,negative:sections.find(([heading])=>heading==='AVOID')?.[1].join('\n')||''};
}
export const completeText=(guide,body)=>[guide,body].filter(Boolean).join('\n\n');
export const wordCount=text=>text.trim()?text.trim().split(/\s+/u).length:0;
export function series(a){
 return [['Hero',a.crop||'Three-quarter','Primary campaign image'],['Medium action','Three-quarter','Show the planned action at a readable distance'],['Close-up','Headshot','Emphasize the primary subject detail'],['Detail','Product detail','Isolate the key material or accessory'],['Vertical',a.crop||'Three-quarter','Compose for a vertical social placement']].map(([label,crop,goal])=>({label,...renderPrompt('shoot',{...a,crop,goal,verticalSeriesShot:label==='Vertical'})}));
}
