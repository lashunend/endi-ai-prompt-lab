import {renderPrompt} from './prompts.mjs';
const source={
'Fashion / Boutique':[
['Boutique homepage hero','people','Adult model in an olive wrap jacket with horn buttons','Sunlit boutique with a stone threshold','Side light from the storefront','Leave the right third blank for a headline','No text baked into the negative space'],
['Tailored linen in motion','people','Adult model in oatmeal linen trousers and a boxy teal shirt','Brick market lane','Soft morning side light','Catch a mid-step with the hems clearing the ground','Avoid frozen fabric folds'],
['The navy capsule','people','Adult model pairing a navy suit with an oxblood belt','Warm gray fitting room','Broad overhead bounce','Frame the waist and lapel in a three-quarter composition','Avoid crushed shadow detail in navy wool'],
['Hardware close-up','product','Pebbled ocher crossbody bag with a brushed brass clasp','Pale limestone bench','Low raking light','Bring clasp and curved piping into sharp focus','Avoid mirror-like reflections on brushed metal'],
['The raincoat edit','people','Adult model wearing a slate waterproof coat','Covered train platform','Soft overcast light','Show the hood and placket in a wide environmental crop','Avoid wet shine on dry fabric']],
'Beauty / Skincare':[
['Berry lip campaign','people','Adult model with a sheer blackberry lip and brushed brows','Muted mauve backdrop','Large diffused beauty light','Frame lips and cheek closely with realistic lip lines','Avoid painted-on lip edges'],
['Morning skin ritual','people','Adult pressing moisturizer into one cheek','Bathroom with frosted window','Cool diffuse daylight','Capture one hand in a chest-up portrait','Avoid opaque cream streaks and beauty filters'],
['Amber serum hero','product','Amber glass serum bottle with ivory dropper','Cream tile and a shallow basin','Warm morning sidelight','Show a fine meniscus inside the glass','Avoid duplicate droppers or impossible refraction'],
['Soft-shimmer eye story','people','Adult with a satin taupe lid and minimal base','Warm gray studio','Directional bounce with a subtle catchlight','Crop above the brows and below the cheekbones','Avoid glitter fallout or duplicated lashes'],
['Balm texture study','product','Open sage tin of dense cleansing balm','Matte pale plaster block','Large window bounce','Keep the lid edge and a single scoop in focus','Avoid a liquid appearance']],
'Hair / Salon':[
['Wash-day lineup','product','Matching shampoo pump, conditioner tube and mask jar','Honey-toned salon counter','Broad diffuse sidelight','Keep each closure distinct and visible','Avoid inconsistent package dimensions'],
['Coil definition reveal','people','Adult with freshly defined tight coils','Salon mirror station','Translucent window light','Turn slightly so the hairline and coil pattern remain visible','Avoid repeating identical coils'],
['Braided crown detail','people','Adult with a braided updo and simple gold studs','Soft cream backdrop','Raking light from the left','Frame the crown and join points at three-quarter angle','Avoid floating braids'],
['Gloss service portrait','people','Adult with chest-length dark waves','Salon entry with sheer drapes','Neutral side light','Hold one section to show its natural fall','Avoid a plastic sheen'],
['Comb and clips kit','product','Carbon comb and two brushed steel section clips','Black salon towel','Soft overhead strip light','Lay items diagonally and keep teeth and spring geometry clear','Avoid extra comb teeth or duplicate hinges']],
'Fitness / Wellness':[
['Sunrise on the track','people','Adult runner in rust training layers','Outdoor track with distant oak trees','Low golden light behind the subject','Capture an easy warm-up stride from the side','Avoid sprint posture during an easy run'],
['After the last rep','people','Adult seated on a bench with a towel across one shoulder','Small training studio','Even window side light','Capture a relaxed breath with a high chest-up crop','Avoid heavy sweat effects or forced smiles'],
['Stretch at home','people','Adult in sage activewear doing a supported calf stretch','Living room with a plain rug','Gentle early daylight','Frame both feet and the support surface','Avoid unstable contact with the floor'],
['Reusable bottle detail','product','Matte clay-colored bottle with a loop cap','Gym bag on a bench','Diffuse window light','Show the lid seal and realistic scuffs','Avoid shiny metal texture on powder coating'],
['Quiet mobility class','people','Two adults doing a seated shoulder stretch','Simple movement studio','Balanced indirect light','Keep spacing and individual posture natural in a wide shot','Avoid mirrored bodies or duplicate faces']],
'Healthcare Branding':[
['Calm clinic reception','place','Small clinic reception with oak check-in desk and washable seating','Bright accessible entrance','Daylight through frosted panes','Keep the check-in route clear in a wide composition','Avoid glossy hospital glare and invented signage'],
['Provider profile','people','Adult clinician in navy scrubs with relaxed posture','Consultation room doorway','Soft reflected daylight','Compose a recognizable eye-level chest-up portrait','Avoid invented credentials on clothing'],
['Consultation without clutter','place','Neutral exam room with paper-covered table and storage','Suburban outpatient practice','Soft ceiling fill and side daylight','Show believable equipment scale and a clear walking route','Avoid impossible equipment placement'],
['Hands at the handwashing station','people','Adult clinician washing hands at a basin','Clinic sink with stainless controls','Neutral overhead light','Frame natural hand contact and running water','Avoid indistinct fingers or floating water'],
['Waiting area refresh','place','Waiting space with warm cork paneling and washable chairs','Street-level health practice','Indirect afternoon window light','Show circulation routes and believable furniture spacing','Avoid converging door frames']],
'Business / Personal Branding':[
['Executive beside the window','people','Adult founder in charcoal tailoring','Office with a textured shade','Soft directional daylight','Keep the shoulders relaxed and eyes at camera height','Avoid retouched facial symmetry'],
['Blank stationery flat lay','product','Unmarked ivory notebook, brass pen and closed linen folio','Walnut tabletop','Soft daylight across the grain','Use a 90-degree overhead frame with blank paper visible','Avoid text, grids and fabricated embossing'],
['Desk-side workshop','people','Adult host pointing to unmarked sticky notes','Corkboard and oak desk','Warm window fill','Show the gesture and hand clearly in a medium frame','Avoid duplicated pointers or fake writing'],
['Working lunch profile','people','Adult consultant with a folded notebook','Quiet bistro booth','Side-lit by a tall window','Use a seated eye-level three-quarter crop','Avoid stiff neck alignment'],
['Independent shop owner','people','Adult shop owner in a dark canvas apron','Ceramics store with neutral shelves','Light from the open front door','Place the subject off-center with an uncluttered background','Avoid merging the apron with shelf edges']],
'Food / Restaurant':[
['Cold cherry oat bowl','food','Dense chilled oat bowl with dark cherries, seeds and toasted coconut','Pale blue tile','Cool indirect daylight','Use a true overhead crop with the rim visible','Avoid steam or liquid soup texture'],
['Meal prep on Sunday','people','Adult arranging roasted vegetables and brown rice in glass containers','Home kitchen island','Diffused late-morning daylight','Show believable utensil contact and readable ingredients','Avoid invented ingredients and waxy vegetables'],
['Cafe toast special','food','Sourdough toast with whipped ricotta and sliced figs','Ivory café plate and linen napkin','Angled window light','Show the crumb and topping at 45 degrees','Avoid repeated fig patterns'],
['Roasted tomato soup','food','Roasted tomato soup with a little olive oil and basil','Soup bowl on dark wood','Warm restaurant sidelight','Crop near the rim for readable surface texture','Avoid dense theatrical steam'],
['Bakery counter detail','food','Two cardamom buns with coarse sugar','Parchment on a bakery tray','Cool front-window daylight','Focus on one bun and let the second fall gently out of focus','Avoid perfectly identical twists']],
'Real Estate / Interiors':[
['Home at blue hour','place','Low modern house with cedar, brick and large front windows','Street view with restrained landscaping','Twilight ambient light mixed with warm interior lamps','Use a level wide exterior composition','Avoid inflated room scale or neon HDR'],
['Breakfast nook','place','Compact breakfast nook with spindle chairs and a linen bench','Small kitchen alcove','Morning side light','Show believable chair clearance in a level corner view','Avoid widened furniture proportions'],
['Rental entry reveal','place','Entry with muted blue door, narrow runner and coat hooks','Small rental home','Balanced indirect light','Keep the door swing and circulation believable','Avoid floating hooks or stretched floorboards'],
['Courtyard garden','place','Small courtyard with gravel, olive tree and terracotta planters','Limewashed boundary wall','Warm late-afternoon light','Compose from the doorway with a natural perspective','Avoid inconsistent paving scale'],
['Bedroom textile study','place','Neutral bedroom with layered quilt and low walnut side tables','Renovated bungalow','Cloud-filtered daylight','Use a diagonal corner view with straight verticals','Avoid impossible wall depth']],
'Travel / Lifestyle':[
['Seated terrace portrait','people','Adult in a linen shirt and woven sandals','Terrace above blue water','Clear morning daylight','Frame seated at eye level with feet and chair visible','Avoid invisibly supported poses'],
['Corner bakery stop','people','Adult traveler in a striped shirt with a canvas tote','Quiet sidewalk café','Soft open shade','Capture a candid glance through the doorway','Avoid distorted pavement edges'],
['Lake cabin arrival','people','Adult unpacking a soft duffel on a porch','Wooded lake cabin','Late-afternoon side light','Show natural bag contact in a wide crop','Avoid weightless bag handles'],
['Rail window view','people','Adult seated by a train window with a closed book','Train compartment with textured fabric seats','Reflected morning light','Keep the seated pose and glass reflection coherent','Avoid duplicated reflections'],
['Flexible weekend carry','product','Cream canvas weekender with brown straps','Platform bench','Soft overcast light','Show base contact, seams and strap attachments','Avoid invented zipper hardware']],
'Celebration':[
['Birthday dinner portrait','people','Adult in a ruby satin blouse','Intimate dinner table with one cake','Warm dim light with soft fill','Capture a relaxed smile from seated eye level','Avoid duplicate flames or excessive smoothing'],
['Graduation keepsake','people','Adult graduate in navy regalia','Outdoor brick arcade','Open shade','Retain the cap, tassel and shoes in a full-length frame','Avoid invented school marks'],
['Anniversary table','place','Table for two with linen, candles and pale flowers','Quiet dining nook','Warm candle and window bounce','Show believable place settings and empty chair space','Avoid repetitive reflections'],
['Thank-you gift detail','product','Small kraft gift box tied with forest-green grosgrain','Cream tabletop','Warm sidelight','Focus on ribbon weave and box corners','Avoid fake lettering on the blank tag'],
['Garden gathering','people','Two adults toasting with clear water glasses','Small courtyard table','Gentle dusk light','Keep each glass rim separate in a medium composition','Avoid merged fingers and glass']],
'Products / Ecommerce':[
['Gold jewelry macro','product','Fine gold chain with an oval clear-stone pendant and small huggie earrings','Pale linen with gentle folds','Soft raking light','Show coherent chain links, clasps, prongs and stone facets','Avoid welded links or exaggerated sparkle'],
['White sneaker catalog','product','Low-profile white sneaker with gum sole','White seamless studio','Broad even light','Use a three-quarter product detail with visible stitching','Avoid washing out the sole edge'],
['Fragrance in reflected light','product','Rectangular fragrance bottle with a dark oval cap','Shallow dark water with one floating petal','Controlled side strip light','Show clean glass refraction and believable cap contact','Avoid invented label lettering'],
['Sunday candle','product','Frosted amber candle jar with a single wick','Coffee table beside pale linen','Soft afternoon light','Show the wick and rim in a tight composition','Avoid smoke when the wick is unlit'],
['Handbag in use','people','Adult holding a structured olive handbag by its handle','Quiet storefront steps','Open shade','Frame hand, bag construction and outfit without distracting background','Avoid merged fingers and handle loops']],
'Seasonal':[
['Seated Christmas portrait','people','Adult seated in a cream sweater with relaxed hands','Warm home with simple evergreen and wrapped gifts','Soft window daylight and distant warm bulbs','Compose three-quarter at seated eye height','Avoid artificial colored bokeh across the face'],
['Christmas breakfast table','food','Cinnamon French toast with a small bowl of berries','Rustic Christmas breakfast table','Soft winter-morning window light','Show the toast crumb from a low three-quarter angle','Avoid excessive syrup gloss'],
['Winter mantle','place','Plaster mantle with clipped evergreen and tiny brass bells','Cream living room','Cool daylight with subtle warm fill','Keep stonework and mantle shelf level','Avoid floating garland'],
['Spring window shop','place','Small boutique window with pale ceramic planters and clean shelving','Neighborhood storefront','Overcast spring daylight','Use a level exterior view and restrained glass reflections','Avoid fabricated shop lettering'],
['Autumn market tote','product','Heavy canvas tote with apples and visible woven handles','Wooden market counter','Warm late-afternoon light','Show realistic fabric tension and fruit weight','Avoid repeated identical apples']]
};
export const collections=Object.keys(source);
export const vault=Object.entries(source).flatMap(([category,entries],i)=>entries.map(([title,type,subject,setting,light,camera,uniqueAvoid],j)=>{
 const ratio=type==='place'||title==='Boutique homepage hero'?'3:2':title==='Blank stationery flat lay'?'1:1':'4:5';
 const a={type,subject,setting,light,camera,uniqueAvoid,ratio,goal:camera,fictional:type==='people',mixedFood:title==='Meal prep on Sunday',campaign:title==='Handbag in use',crop:/overhead/i.test(camera)?'Overhead':undefined};
 const tags=[category,type,...title.toLowerCase().split(' ').filter(x=>x.length>3)];
 return {id:'vault-'+(i+1)+'-'+(j+1),title,type,category,description:subject+' · '+setting,ratio,reference:type==='people'||type==='product'?'optional':'none',tags,added:'2026-11-'+String(19+j),featured:j===0,answers:a,...renderPrompt('vault',a)};
}));
