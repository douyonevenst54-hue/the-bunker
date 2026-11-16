// Content reviewed by Dr. Jhon Evenst Douyon, MD, MPH. Safety-critical: change only with review.
import type { Room } from "./types";

export const medicalRoom: Room = {
 "id": "medical",
 "n": 2,
 "emoji": "🩹",
 "sortWeight": 0.25,
 "ui": {
  "en": {
   "room": "Room 2 · Medical & First Aid",
   "title": "Keep everyone alive until help comes",
   "intro1": "After a hurricane, ambulances can take hours to arrive. What your family does in the first minutes matters most.",
   "intro2": "Your mission: stock the medical kit, organize it, recognize real emergencies, then handle injuries after the storm.",
   "catSort": "Medical kit"
  },
  "ht": {
   "room": "Chanm 2 · Medikal ak Premye Swen",
   "title": "Kenbe tout moun vivan jiskaske èd rive",
   "intro1": "Apre yon siklòn, anbilans ka pran plizyè èdtan pou rive. Sa fanmi ou fè nan premye minit yo se sa ki konte plis.",
   "intro2": "Misyon ou: ranpli twous medikal la, òganize l, rekonèt vrè ijans yo, epi okipe blesi apre tanpèt la.",
   "catSort": "Twous medikal"
  }
 },
 "items": [
  {
   "e": "🧤",
   "b": "u",
   "en": [
    "Disposable gloves (for blood and body fluids)",
    "Gloves protect you and the injured person from infection. Put them on before touching blood or any body fluid: vomit, urine, stool, saliva or drainage from a wound."
   ],
   "ht": [
    "Gan jetab (pou san ak likid kò)",
    "Gan pwoteje ou ak moun ki blese a kont enfeksyon. Mete yo anvan ou manyen san oswa nenpòt likid kò: vomisman, pipi, poupou, krache oswa likid k ap soti nan yon blesi."
   ]
  },
  {
   "e": "🩹",
   "b": "u",
   "en": [
    "Sterile gauze pads and medical tape",
    "Gauze is what you press on a bleeding wound. Tape holds it in place."
   ],
   "ht": [
    "Konprès steril ak adezif medikal",
    "Konprès la se sa ou peze sou yon blesi k ap senyen. Adezif la kenbe l an plas."
   ]
  },
  {
   "e": "🩹",
   "b": "u",
   "en": [
    "Adhesive bandages, assorted sizes",
    "Small cuts happen constantly during storm cleanup. Covered wounds stay cleaner."
   ],
   "ht": [
    "Pansman adezif, plizyè gwosè",
    "Ti koupi rive tout tan pandan netwayaj apre tanpèt. Blesi ki kouvri rete pi pwòp."
   ]
  },
  {
   "e": "🌡️",
   "b": "u",
   "en": [
    "Digital thermometer",
    "A fever after a wound or flood exposure can be an early sign of infection."
   ],
   "ht": [
    "Tèmomèt dijital",
    "Lafyèv apre yon blesi oswa apre kontak ak dlo inondasyon ka yon premye siy enfeksyon."
   ]
  },
  {
   "e": "✂️",
   "b": "u",
   "en": [
    "Tweezers and scissors",
    "For splinters and debris, and for cutting gauze, tape or clothing."
   ],
   "ht": [
    "Pens ak sizo",
    "Pou retire ti bout bwa ak salte, epi pou koupe konprès, adezif oswa rad."
   ]
  },
  {
   "e": "💊",
   "b": "u",
   "en": [
    "7-day supply of each person's prescriptions + a written medication list",
    "Pharmacies may be closed after a disaster. The list helps any doctor treat your family safely."
   ],
   "ht": [
    "Medikaman preskripsyon chak moun pou 7 jou + yon lis medikaman ekri",
    "Famasi yo ka fèmen apre yon dezas. Lis la ede nenpòt doktè trete fanmi ou san danje."
   ]
  },
  {
   "e": "🪙",
   "b": "u",
   "en": [
    "Emergency (space) blanket",
    "Keeps an injured or wet person warm. Shock and cold make injuries worse."
   ],
   "ht": [
    "Kouvèti ijans (an aliminyòm)",
    "Kenbe yon moun ki blese oswa ki mouye cho. Chòk ak frèt fè blesi yo vin pi grav."
   ]
  },
  {
   "e": "🧈",
   "b": "a",
   "en": [
    "Butter or toothpaste for burns",
    "These trap heat in the skin and raise infection risk. Cool, clean running water is what treats a burn."
   ],
   "ht": [
    "Bè oswa pat dantifris pou brili",
    "Yo bloke chalè a nan po a epi yo ogmante risk enfeksyon. Dlo pwòp k ap koule, ki fre, se li ki trete yon brili."
   ]
  },
  {
   "e": "💊",
   "b": "a",
   "en": [
    "A neighbor's leftover prescription pills",
    "Medicine prescribed for someone else can be the wrong drug or dose and can react badly with your own."
   ],
   "ht": [
    "Rès grenn preskripsyon yon vwazen",
    "Medikaman yo preskri pou yon lòt moun ka move medikaman an oswa move dòz la, epi li ka reyaji mal ak pa ou."
   ],
   "critical": true
  },
  {
   "e": "📅",
   "b": "a",
   "en": [
    "Medicines that expired years ago",
    "Expired medicine may not work when you need it. Check dates and replace them."
   ],
   "ht": [
    "Medikaman ki ekspire depi plizyè ane",
    "Medikaman ki ekspire ka pa mache lè ou bezwen l. Tcheke dat yo epi ranplase yo."
   ]
  },
  {
   "e": "💨",
   "b": "s",
   "en": [
    "Hair dryer",
    "There may be no power, and it does nothing for injuries. Save the space."
   ],
   "ht": [
    "Seche cheve",
    "Ka pa gen kouran, epi li pa itil pou blesi. Sere plas la."
   ]
  },
  {
   "e": "🌺",
   "b": "s",
   "en": [
    "Perfume",
    "Not a medical supply. Use the space for gauze or medication."
   ],
   "ht": [
    "Pafen",
    "Se pa yon materyèl medikal. Sèvi ak plas la pou konprès oswa medikaman."
   ]
  }
 ],
 "stages": [
  {
   "key": "store",
   "w": 0.2,
   "label": {
    "en": "Stage 2 · Organize",
    "ht": "Etap 2 · Òganize"
   },
   "cat": {
    "en": "Organizing the kit",
    "ht": "Òganize twous la"
   },
   "qs": [
    {
     "en": {
      "q": "Where should the family first aid kit be kept?",
      "o": [
       "In one easy-to-reach spot that everyone in the family knows",
       "Locked in the attic so kids can't reach it",
       "Only in the car",
       "Split up in different drawers around the house"
      ],
      "x": "In an emergency nobody has time to search. One known, reachable spot. Keep medicines themselves out of children's reach."
     },
     "ht": {
      "q": "Ki kote fanmi an dwe sere twous premye swen an?",
      "o": [
       "Nan yon sèl kote ki fasil pou rive, ke tout moun nan fanmi an konnen",
       "Fèmen akle nan grenye a pou timoun pa rive ladan l",
       "Nan machin nan sèlman",
       "Separe nan plizyè tiwa nan kay la"
      ],
      "x": "Nan yon ijans, pèsonn pa gen tan pou chèche. Yon sèl kote tout moun konnen, ki fasil pou rive. Kenbe medikaman yo menm lwen men timoun."
     },
     "a": 0
    },
    {
     "en": {
      "q": "What should the written medication list include for each person?",
      "o": [
       "Just the color of the pills",
       "Name of each medicine, the dose, allergies, and the doctor or pharmacy",
       "Only the most expensive medicines"
      ],
      "x": "If someone is hurt or confused, this list lets a responder or a new doctor continue treatment safely. Keep a copy in the kit and one on your phone."
     },
     "ht": {
      "q": "Kisa lis medikaman ekri a dwe genyen pou chak moun?",
      "o": [
       "Sèlman koulè grenn yo",
       "Non chak medikaman, dòz la, alèji yo, ak doktè oswa famasi a",
       "Sèlman medikaman ki pi chè yo"
      ],
      "x": "Si yon moun blese oswa konfonn, lis sa a pèmèt yon sekouris oswa yon nouvo doktè kontinye tretman an san danje. Kenbe yon kopi nan twous la ak youn sou telefòn ou."
     },
     "a": 1
    },
    {
     "en": {
      "q": "How often should you check the kit?",
      "o": [
       "Never, once packed it's done",
       "On a regular schedule, for example every 6 months when you rotate your water",
       "Only after an emergency starts"
      ],
      "x": "Medicines expire, supplies get used, and prescriptions change. A set schedule keeps the kit ready."
     },
     "ht": {
      "q": "Chak konbyen tan ou dwe tcheke twous la?",
      "o": [
       "Pa janm, depi li fèt li fini",
       "Selon yon orè regilye, pa egzanp chak 6 mwa lè ou chanje dlo ou",
       "Sèlman apre yon ijans fin kòmanse"
      ],
      "x": "Medikaman ekspire, materyèl yo itilize, preskripsyon chanje. Yon orè fiks kenbe twous la pare."
     },
     "a": 1
    }
   ]
  },
  {
   "key": "triage",
   "w": 0.2,
   "label": {
    "en": "Stage 3 · Recognize",
    "ht": "Etap 3 · Rekonèt"
   },
   "cat": {
    "en": "Recognizing emergencies",
    "ht": "Rekonèt ijans"
   },
   "qs": [
    {
     "en": {
      "q": "Three people need help. Who needs 911 right now?",
      "o": [
       "A child with a scraped knee",
       "A man with chest pain who is sweating and short of breath",
       "A teenager with a mild sunburn"
      ],
      "x": "Chest pain with sweating or shortness of breath can be a heart attack. Call 911 immediately. The others can be handled with first aid."
     },
     "ht": {
      "q": "Twa moun bezwen èd. Kilès ki bezwen 911 kounye a menm?",
      "o": [
       "Yon timoun ki kale jenou l",
       "Yon nonm ki gen doulè nan pwatrin, k ap swe, ki manke souf",
       "Yon adolesan ki gen yon ti kout solèy"
      ],
      "x": "Doulè nan pwatrin ak swe oswa souf kout ka yon atak kè. Rele 911 touswit. Lòt yo, ou ka okipe yo ak premye swen."
     },
     "a": 1
    },
    {
     "en": {
      "q": "Someone collapses. They don't respond and aren't breathing normally. What do you do first?",
      "o": [
       "Give them water",
       "Call 911 (on speaker) and start CPR right away",
       "Wait a few minutes to see if they wake up",
       "Lay them down and go look for a doctor"
      ],
      "x": "Every minute without CPR lowers the chance of survival. Call 911, put the phone on speaker, and start CPR."
     },
     "ht": {
      "q": "Yon moun tonbe. Li pa reponn epi li pa respire nòmalman. Kisa ou fè an premye?",
      "o": [
       "Ba l dlo",
       "Rele 911 (sou opalè) epi kòmanse CPR touswit",
       "Tann kèk minit pou wè si l ap leve",
       "Kouche l epi al chèche yon doktè"
      ],
      "x": "Chak minit san CPR diminye chans pou moun nan viv. Rele 911, mete telefòn nan sou opalè, epi kòmanse CPR."
     },
     "a": 1,
     "critical": true
    },
    {
     "en": {
      "q": "How do you do CPR on an adult?",
      "o": [
       "Gentle pushes once every few seconds",
       "30 hard, fast chest compressions, then 2 rescue breaths. Repeat the cycle",
       "Pat their back"
      ],
      "x": "Push in the center of the chest 100–120 times a minute, at least 2 inches (5 cm) deep, letting the chest come back up each time. After 30 compressions, give 2 rescue breaths, then repeat. If you are not trained or can't give breaths, keep doing compressions without stopping. Continue until help arrives."
     },
     "ht": {
      "q": "Kijan pou fè CPR sou yon granmoun?",
      "o": [
       "Peze dousman yon fwa chak kèk segonn",
       "30 konpresyon fò e vit sou pwatrin lan, epi 2 souf sekou. Repete sik la",
       "Tape do l"
      ],
      "x": "Peze nan mitan pwatrin lan 100–120 fwa pa minit, omwen 2 pous (5 cm) fon, epi kite pwatrin lan remonte chak fwa. Apre 30 konpresyon, bay 2 souf sekou, epi rekòmanse. Si ou pa fòme oswa ou pa ka bay souf, kontinye fè konpresyon san rete. Kontinye jiskaske èd rive."
     },
     "a": 1
    }
   ]
  },
  {
   "key": "emerg",
   "w": 0.35,
   "label": {
    "en": "Stage 4 · Emergency",
    "ht": "Etap 4 · Ijans"
   },
   "cat": {
    "en": "Emergency response",
    "ht": "Reyaksyon nan ijans"
   },
   "scene": {
    "en": "🌀 After the hurricane: cleanup day",
    "ht": "🌀 Apre siklòn nan: jou netwayaj"
   },
   "qs": [
    {
     "en": {
      "q": "Your brother cuts his forearm on metal debris. It's bleeding a lot. What do you do?",
      "o": [
       "Rinse it in the flood water",
       "Put on gloves and press firmly on the wound with clean gauze",
       "Let it bleed to clean itself",
       "Tie a string tightly above it right away"
      ],
      "x": "Firm, direct pressure stops most bleeding. Gloves protect you both. Flood water is contaminated. If bleeding is severe or won't stop, call 911."
     },
     "ht": {
      "q": "Frè ou koupe avanbra l sou yon moso metal. L ap senyen anpil. Kisa ou fè?",
      "o": [
       "Rense l nan dlo inondasyon an",
       "Mete gan epi peze fò sou blesi a ak yon konprès pwòp",
       "Kite l senyen pou l netwaye tèt li",
       "Mare yon fil byen sere anwo l touswit"
      ],
      "x": "Peze fò dirèkteman sou blesi a kanpe pifò senyen. Gan yo pwoteje nou toude. Dlo inondasyon sal. Si l ap senyen anpil oswa li pa kanpe, rele 911."
     },
     "a": 1,
     "critical": true
    },
    {
     "en": {
      "q": "Blood soaks through the gauze. Now what?",
      "o": [
       "Pull the gauze off to look",
       "Add more gauze on top and keep pressing",
       "Stop pressing so blood can flow"
      ],
      "x": "Removing soaked gauze pulls away the clot that is forming. Add layers and keep steady pressure."
     },
     "ht": {
      "q": "San an travèse konprès la. Kisa pou fè kounye a?",
      "o": [
       "Retire konprès la pou gade",
       "Mete plis konprès anlè l epi kontinye peze",
       "Sispann peze pou san an ka koule"
      ],
      "x": "Si ou retire konprès ki tranpe a, ou rache kayo k ap fòme a. Ajoute lòt kouch epi kontinye peze fèm."
     },
     "a": 1
    },
    {
     "en": {
      "q": "The bleeding has stopped, but the cut touched dirty flood water. What next?",
      "o": [
       "Leave it uncovered and dirty",
       "Wash it with soap and clean, safe water, then cover it with a clean bandage",
       "Wash it with more flood water"
      ],
      "x": "Cleaning a wound with soap and safe water lowers infection risk. Watch over the next days for redness, swelling, pus or fever, and get care if they appear."
     },
     "ht": {
      "q": "Senyen an kanpe, men koupi a te touche dlo inondasyon sal. Kisa pou fè apre?",
      "o": [
       "Kite l dekouvri e sal",
       "Lave l ak savon ak dlo pwòp ki an sekirite, epi kouvri l ak yon pansman pwòp",
       "Lave l ak plis dlo inondasyon"
      ],
      "x": "Lave blesi a ak savon ak dlo ki an sekirite diminye risk enfeksyon. Siveye pandan jou ki vin apre yo pou wouj, anfle, pi oswa lafyèv, epi al chèche swen si yo parèt."
     },
     "a": 1
    },
    {
     "en": {
      "q": "His last tetanus shot was 7 years ago. Does this dirty wound matter?",
      "o": [
       "No, tetanus shots last forever",
       "Yes. For a dirty or puncture wound, get a booster if it's been 5 or more years",
       "Only if the wound is bigger than a hand"
      ],
      "x": "CDC guidance: adults need a booster every 10 years, but a dirty or puncture wound needs one if it has been 5 or more years. Being in flood water alone does not require a shot."
     },
     "ht": {
      "q": "Dènye vaksen tetanòs li te gen 7 an. Èske blesi sal sa a enpòtan?",
      "o": [
       "Non, vaksen tetanòs dire pou tout tan",
       "Wi. Pou yon blesi sal oswa yon blesi pike, fè yon rapèl si sa fè 5 an oswa plis",
       "Sèlman si blesi a pi gwo pase yon men"
      ],
      "x": "Gid CDC: granmoun bezwen yon rapèl chak 10 an, men yon blesi sal oswa pike bezwen youn si sa fè 5 an oswa plis. Sèlman antre nan dlo inondasyon pa mande vaksen."
     },
     "a": 1
    },
    {
     "en": {
      "q": "Your aunt burns her hand on a hot pot while cooking. What do you do?",
      "o": [
       "Put ice directly on it",
       "Spread butter on it",
       "Hold it under cool, clean running water for 10–20 minutes",
       "Pop the blisters"
      ],
      "x": "Red Cross: cool the burn with clean, cool running water as soon as possible. No ice, butter or grease. Get medical care for large or deep burns, or burns on the face, hands, feet or joints."
     },
     "ht": {
      "q": "Matant ou brile men l sou yon chodyè cho pandan l ap kwit manje. Kisa ou fè?",
      "o": [
       "Mete glas dirèkteman sou li",
       "Fwote bè sou li",
       "Kenbe l anba dlo pwòp ki fre k ap koule pandan 10–20 minit",
       "Pete zanpoud yo"
      ],
      "x": "Lakwa Wouj: refwadi brili a ak dlo pwòp, fre, k ap koule, pi vit posib. Pa glas, pa bè, pa grès. Al chèche swen medikal pou gwo brili, brili fon, oswa brili sou figi, men, pye oswa jwenti."
     },
     "a": 2
    },
    {
     "en": {
      "q": "That night the power is out and the generator runs in the garage with the door open. Everyone has a headache, dizziness and nausea. What do you do?",
      "o": [
       "Take headache pills and go to sleep",
       "Open one window and stay inside",
       "Get everyone outside into fresh air right away and call 911"
      ],
      "x": "This is carbon monoxide poisoning. You can't see or smell it, and it kills people in their sleep. CDC: never run a generator indoors or in a garage, even with the door open. Keep it outside, at least 20 feet from windows, doors and vents."
     },
     "ht": {
      "q": "Nan aswè, pa gen kouran epi jeneratè a ap mache nan garaj la ak pòt la louvri. Tout moun gen tèt fè mal, tèt vire ak kè plen. Kisa ou fè?",
      "o": [
       "Bwè grenn pou tèt fè mal epi al dòmi",
       "Louvri yon fenèt epi rete anndan",
       "Fè tout moun soti deyò nan bon lè touswit epi rele 911"
      ],
      "x": "Se anpwazònman monoksid kabòn. Ou pa ka wè l ni santi l, epi li touye moun pandan y ap dòmi. CDC: pa janm fè jeneratè mache anndan kay oswa nan garaj, menm ak pòt la louvri. Kenbe l deyò, omwen 20 pye lwen fenèt, pòt ak vantilasyon."
     },
     "a": 2,
     "critical": true
    }
   ]
  }
 ],
 "check": {
  "en": [
   "Disposable gloves for blood and body fluids, sterile gauze, medical tape and assorted bandages",
   "Thermometer, tweezers, scissors and an emergency blanket",
   "At least a 7-day supply of each person's prescriptions",
   "A written list for each person: medicines, doses, allergies, doctor and pharmacy (one copy in the kit, one on your phone)",
   "Keep the kit in one spot everyone knows; keep medicines out of children's reach",
   "Check the kit every 6 months; replace expired items",
   "Know when to call 911: chest pain, trouble breathing, heavy bleeding, collapse",
   "Learn CPR: 30 chest compressions (hard and fast, 100–120 a minute) then 2 rescue breaths, repeated. Not trained? Compressions only, without stopping",
   "Burns: cool, clean running water. Never ice or butter",
   "Generators always outside, at least 20 feet from windows and doors; a battery CO alarm inside",
   "Dirty or puncture wound and last tetanus shot 5+ years ago: get a booster"
  ],
  "ht": [
   "Gan jetab pou san ak likid kò, konprès steril, adezif medikal ak pansman plizyè gwosè",
   "Tèmomèt, pens, sizo ak yon kouvèti ijans",
   "Omwen 7 jou medikaman preskripsyon pou chak moun",
   "Yon lis ekri pou chak moun: medikaman, dòz, alèji, doktè ak famasi (yon kopi nan twous la, youn sou telefòn ou)",
   "Kenbe twous la nan yon sèl kote tout moun konnen; kenbe medikaman lwen men timoun",
   "Tcheke twous la chak 6 mwa; ranplase sa ki ekspire",
   "Konnen kilè pou rele 911: doulè nan pwatrin, difikilte pou respire, gwo senyen, moun ki tonbe",
   "Aprann CPR: 30 konpresyon sou pwatrin (fò e vit, 100–120 fwa pa minit) epi 2 souf sekou, repete. Pa fòme? Konpresyon sèlman, san rete",
   "Brili: dlo pwòp, fre, k ap koule. Pa janm glas ni bè",
   "Jeneratè toujou deyò, omwen 20 pye lwen fenèt ak pòt; yon alam CO ak pil anndan kay la",
   "Blesi sal oswa pike epi dènye vaksen tetanòs fè 5 an oswa plis: fè yon rapèl"
  ]
 },
 "sources": [
  [
   "American Red Cross · Burns",
   "https://www.redcross.org/take-a-class/resources/learn-first-aid/burns"
  ],
  [
   "American Heart Association · What is CPR",
   "https://cpr.heart.org/en/resources/what-is-cpr-"
  ],
  [
   "CDC · Carbon Monoxide Poisoning",
   "https://www.cdc.gov/carbon-monoxide/about/index.html"
  ],
  [
   "NC DHHS (CDC guidance) · Wounds and Tetanus After a Storm",
   "https://ncdhhs.gov/after-storm-wounds-and-tetanus"
  ]
 ]
};
