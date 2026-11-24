const choices=text=>text.split('|');
export const styles=Object.fromEntries(Object.entries({
 'Birthday & Celebrations':'Minimalist milestone birthday|Luxury black-and-gold portraits|Elegant studio birthday celebration|Glamorous evening portraits|Garden birthday party',
 'Fashion & Editorial':'Luxury editorial|Streetwear campaign|Boutique clothing shoot|Designer-inspired fashion|Seasonal fashion collection',
 'Business & Personal Branding':'CEO branding|Modern entrepreneur|Luxury office|Professional content creator|Business magazine cover',
 'Lifestyle & Travel':'Luxury hotel lobby|Coffee shop|Rooftop restaurant|Airport travel|Modern apartment|Vacation resort',
 'Beauty & Skincare':'Close-up skincare portrait|Makeup campaign|Natural beauty campaign|Dewy glow editorial',
 'Hair & Cosmetics':'Hair editorial|Salon hair campaign|Braids & protective styles|Cosmetics product shoot',
 'Fitness & Wellness':'Outdoor fitness|Wellness retreat|Luxury gym|Activewear campaign',
 'Holidays & Seasonal':'Christmas editorial|Valentine’s Day portraits|Fall fashion|Spring floral campaign|Summer vacation|New Year’s Eve glam',
 'Product Advertising':'Beauty product campaign|Fashion accessories|Skincare product photography|Branded lifestyle advertising',
 'Luxury & Glamour':'Old Hollywood glamour|Penthouse evening|Yacht day|Red-carpet style',
 'Creative & Cinematic':'Cinematic film still|Retro 1970s film look|Neon night city|Moody fine-art portrait',
 'Custom Photoshoot':''
}).map(([name,options])=>[name,[...choices(options).filter(Boolean),'Custom concept']]));
export const locations={
 'Photography studio':['Seamless light backdrop','Dark studio backdrop','Textured backdrop'],
 'Luxury hotel':['Hotel lobby','Hotel suite','Hotel balcony'],
 Office:['Executive office','Modern workspace'],Restaurant:['Dining room','Rooftop terrace'],
 'Coffee shop':['Window seat','Café counter'],Rooftop:['City skyline','Outdoor terrace'],
 'City street':['Downtown street','Storefront'], 'Modern home':['Living room','Kitchen'],
 Gym:['Training floor','Fitness studio'],Beach:['Sandy shoreline','Oceanfront deck'],
 Resort:['Poolside','Resort terrace'],'Outdoor nature':['Garden','Wooded trail'],
 'Airport & travel':['Terminal with plane view','Airport lounge']
};
export const selectables={outfitType:'Smart casual|Casual everyday|Business professional|Evening glamour|Streetwear|Activewear|Editorial fashion|Keep as in the reference|Custom',hairStyle:'Keep as in the reference|Sleek straight|Soft waves|Defined curls|Natural coils|Braids|Updo|Sleek ponytail|Custom',makeup:'Keep as in the reference|No makeup|Natural finish|Soft glam|Full glam|Editorial makeup|Custom',fabric:'Match the outfit|Satin / silk|Velvet|Linen|Cotton|Wool tailoring|Knit|Denim|Leather|Sequins / embellished|Chiffon / tulle|Custom',jewelry:'Not specified|Minimal gold|Minimal silver|Pearls|Diamonds / sparkle|Statement pieces|Custom',nails:'Not specified|Short and natural|Neutral manicure|French manicure|Bold color|Custom',crop:'Headshot|Close-up beauty portrait|Head-and-shoulders portrait|Waist-up portrait|Three-quarter body|Three-quarter|Full-body|Seated portrait|Walking lifestyle|Editorial pose|Product interaction|Environmental wide|Product detail|Overhead|Custom',expression:'Soft smile|Confident|Joyful laugh|Serious, editorial|Calm and serene|Warm, open smile|Custom',mood:'Luxurious|Bright and airy|Warm and intimate|Moody and cinematic|High-fashion editorial|Joyful and celebratory|Calm and serene|Energetic|Romantic|Clean and minimal|Custom',position:'Facing the camera|Three-quarter turn|Profile|Over the shoulder|Leaning|Custom',gaze:'Looking into the camera|Looking off camera|Eyes lowered|Looking at the product or prop|Custom',angle:'Eye level|Slightly above|Slightly below|Custom',light:'Match the location naturally|Soft daylight|Golden hour|Window light|Studio softbox|High-key|Dramatic single light|Warm evening ambience|Night city / neon|Custom',interaction:'Holding it near the face|Holding it at chest level|Using or applying it|Wearing it|Displaying it on a surface|Custom'};
