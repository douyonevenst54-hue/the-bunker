// Content drafted from official sources; pending review by Dr. Jhon Evenst Douyon, MD, MPH. Safety-critical: change only with review.
import type { Room } from "./types";

export const energyRoom: Room = {
 "id": "energy",
 "n": 6,
 "emoji": "🔋",
 "sortWeight": 0.25,
 "ui": {
  "en": {
   "room": "Room 6 · Energy & Electricity",
   "title": "Keep the power on, safely",
   "intro1": "Storms knock out power. The real dangers often come after: generators, candles and fallen power lines.",
   "intro2": "Your mission: build your power kit, connect backup power safely, decide what needs power most, then get through a blackout after a storm.",
   "catSort": "Power kit"
  },
  "ht": {
   "room": "Chanm 6 · Enèji ak Elektrisite",
   "title": "Kenbe kouran, san danje",
   "intro1": "Tanpèt koupe kouran. Vrè danje yo souvan vini apre: jeneratè, bouji ak fil kouran ki tonbe.",
   "intro2": "Misyon ou: prepare twous kouran ou, konekte kouran sekou san danje, deside kisa ki pi bezwen kouran, epi travèse yon blakawout apre yon tanpèt.",
   "catSort": "Twous kouran"
  }
 },
 "items": [
  {
   "e": "🔦",
   "b": "u",
   "en": [
    "Flashlights and extra batteries",
    "The safest light in a blackout. One per person."
   ],
   "ht": [
    "Flach ak pil anplis",
    "Limyè ki pi an sekirite nan yon blakawout. Youn pou chak moun."
   ]
  },
  {
   "e": "🔋",
   "b": "u",
   "en": [
    "Charged power bank for phones",
    "Keeps a phone alive to call for help and get alerts."
   ],
   "ht": [
    "Batri pòtab chaje pou telefòn",
    "Kenbe yon telefòn vivan pou rele èd epi resevwa alèt."
   ]
  },
  {
   "e": "📻",
   "b": "u",
   "en": [
    "Battery or crank radio",
    "News and official instructions when TV and internet are down."
   ],
   "ht": [
    "Radyo ak pil oswa ak manivèl",
    "Nouvèl ak enstriksyon ofisyèl lè televizyon ak entènèt pa mache."
   ]
  },
  {
   "e": "🔌",
   "b": "u",
   "en": [
    "Heavy-duty outdoor extension cord",
    "Plug appliances straight into the generator from a safe distance."
   ],
   "ht": [
    "Rallonj solid pou deyò",
    "Ploge aparèy yo dirèkteman nan jeneratè a depi yon distans ki an sekirite."
   ]
  },
  {
   "e": "🧾",
   "b": "u",
   "en": [
    "Backup plan for medical equipment",
    "Oxygen machines and other powered medical devices need a plan before the power goes out. Talk to the doctor and the power company."
   ],
   "ht": [
    "Plan sekou pou ekipman medikal",
    "Machin oksijèn ak lòt aparèy medikal ki mache ak kouran bezwen yon plan anvan kouran koupe. Pale ak doktè a ak konpayi elektrisite a."
   ]
  },
  {
   "e": "🕯️",
   "b": "a",
   "en": [
    "Candles for light",
    "Candles cause fires during blackouts. Use flashlights."
   ],
   "ht": [
    "Bouji pou limyè",
    "Bouji koz dife pandan blakawout. Sèvi ak flach."
   ]
  },
  {
   "e": "⚠️",
   "b": "a",
   "en": [
    "Cord to plug the generator into a wall outlet",
    "This backfeeds power into the lines and can electrocute utility workers and neighbors. Never do it."
   ],
   "ht": [
    "Kòd pou ploge jeneratè a nan yon priz miray",
    "Sa voye kouran tounen nan fil yo epi li ka elektwokite travayè elektrisite ak vwazen. Pa janm fè l."
   ],
   "critical": true
  },
  {
   "e": "🪢",
   "b": "a",
   "en": [
    "Extension cord with cracked insulation",
    "Damaged cords overheat and start fires. Replace them."
   ],
   "ht": [
    "Rallonj ki gen kawotchou fann",
    "Kòd ki domaje chofe epi mete dife. Ranplase yo."
   ]
  },
  {
   "e": "🎄",
   "b": "s",
   "en": [
    "Party string lights",
    "Decoration, not an emergency light source."
   ],
   "ht": [
    "Ti limyè fèt",
    "Dekorasyon, se pa yon limyè ijans."
   ]
  },
  {
   "e": "📺",
   "b": "s",
   "en": [
    "A second TV for the bunker",
    "Uses scarce power. A radio does the job."
   ],
   "ht": [
    "Yon dezyèm televizyon pou bunker la",
    "Li sèvi ak kouran ki ra. Yon radyo fè travay la."
   ]
  }
 ],
 "stages": [
  {
   "key": "place",
   "kind": "place",
   "w": 0.2,
   "label": {
    "en": "Stage 2 · Place",
    "ht": "Etap 2 · Plase"
   },
   "cat": {
    "en": "Safe placement",
    "ht": "Plase san danje"
   },
   "zones": [
    {
     "id": "yard",
     "label": {
      "en": "Yard, 20+ ft from the house",
      "ht": "Lakou, 20+ pye lwen kay la"
     },
     "x": 10,
     "y": 10,
     "w": 165,
     "h": 87
    },
    {
     "id": "panel",
     "label": {
      "en": "Electrical panel with a transfer switch",
      "ht": "Panno elektrik ak yon switch transfè"
     },
     "x": 185,
     "y": 10,
     "w": 165,
     "h": 87
    },
    {
     "id": "outlet",
     "label": {
      "en": "A regular wall outlet",
      "ht": "Yon priz miray nòmal"
     },
     "x": 10,
     "y": 107,
     "w": 165,
     "h": 87
    },
    {
     "id": "bedside",
     "label": {
      "en": "Bedside table",
      "ht": "Tab bò kabann"
     },
     "x": 185,
     "y": 107,
     "w": 165,
     "h": 87
    },
    {
     "id": "drawer",
     "label": {
      "en": "Kitchen drawer everyone knows",
      "ht": "Tiwa kwizin tout moun konnen"
     },
     "x": 10,
     "y": 204,
     "w": 165,
     "h": 87
    },
    {
     "id": "garage",
     "label": {
      "en": "Inside the garage",
      "ht": "Anndan garaj la"
     },
     "x": 185,
     "y": 204,
     "w": 165,
     "h": 87
    }
   ],
   "items": [
    {
     "id": "gen",
     "e": "/icons/generator.svg",
     "name": {
      "en": "Portable generator",
      "ht": "Jeneratè pòtab"
     },
     "ok": [
      "yard"
     ],
     "why": {
      "ok": {
       "en": "Outside and far from the house, where its exhaust can't get in.",
       "ht": "Deyò e lwen kay la, kote lafimen l pa ka antre."
      },
      "wrong": {
       "en": "A generator must run outside, more than 20 feet from windows, doors and vents.",
       "ht": "Yon jeneratè dwe mache deyò, plis pase 20 pye lwen fenèt, pòt ak vantilasyon."
      },
      "unsafe": {
       "en": "In a garage, even with the door open, generator exhaust can kill in minutes.",
       "ht": "Nan yon garaj, menm ak pòt louvri, lafimen jeneratè ka touye nan kèk minit."
      }
     },
     "unsafe": [
      "garage"
     ]
    },
    {
     "id": "hookup",
     "e": "🔌",
     "name": {
      "en": "Generator connection to the house",
      "ht": "Koneksyon jeneratè a ak kay la"
     },
     "ok": [
      "panel"
     ],
     "why": {
      "ok": {
       "en": "Through a transfer switch installed by a qualified electrician, so power can't flow back into the lines.",
       "ht": "Atravè yon switch transfè yon elektrisyen kalifye enstale, konsa kouran pa ka tounen nan fil yo."
      },
      "wrong": {
       "en": "Connect to the house only through a transfer switch, or plug appliances straight into the generator.",
       "ht": "Konekte ak kay la sèlman atravè yon switch transfè, oswa ploge aparèy yo dirèkteman nan jeneratè a."
      },
      "unsafe": {
       "en": "Plugging a generator into a wall outlet backfeeds the power lines and can electrocute line workers and neighbors.",
       "ht": "Ploge yon jeneratè nan yon priz miray voye kouran nan fil yo epi li ka elektwokite travayè elektrisite ak vwazen."
      }
     },
     "unsafe": [
      "outlet"
     ]
    },
    {
     "id": "flash",
     "e": "🔦",
     "name": {
      "en": "Flashlight",
      "ht": "Flach"
     },
     "ok": [
      "bedside",
      "drawer"
     ],
     "why": {
      "ok": {
       "en": "Where you'll reach for it in the dark.",
       "ht": "Kote ou pral chèche l nan fènwa."
      },
      "wrong": {
       "en": "Keep flashlights by the bed or in one drawer everyone knows.",
       "ht": "Kenbe flach bò kabann nan oswa nan yon tiwa tout moun konnen."
      }
     }
    },
    {
     "id": "batt",
     "e": "🔋",
     "name": {
      "en": "Spare batteries & power bank",
      "ht": "Pil derechany ak batri pòtab"
     },
     "ok": [
      "drawer",
      "bedside"
     ],
     "why": {
      "ok": {
       "en": "One known spot means nobody hunts for batteries in the dark.",
       "ht": "Yon sèl kote tout moun konnen vle di pèsonn pa chèche pil nan fènwa."
      },
      "wrong": {
       "en": "Keep them in one place everyone knows, close to the flashlights.",
       "ht": "Kenbe yo nan yon sèl kote tout moun konnen, toupre flach yo."
      }
     }
    }
   ]
  },
  {
   "key": "prioritize",
   "w": 0.2,
   "label": {
    "en": "Stage 3 · Prioritize",
    "ht": "Etap 3 · Priyorite"
   },
   "cat": {
    "en": "Smart power use",
    "ht": "Sèvi ak kouran ak sajès"
   },
   "qs": [
    {
     "en": {
      "q": "The power just went out. What should you do with major appliances?",
      "o": [
       "Leave them all on",
       "Turn them off or unplug them so the surge when power returns doesn't damage them",
       "Turn them on and off to test"
      ],
      "x": "Turn off major appliances and electronics. Leave one light switched on so you know when power is back."
     },
     "ht": {
      "q": "Kouran fèk koupe. Kisa ou dwe fè ak gwo aparèy yo?",
      "o": [
       "Kite yo tout limen",
       "Etenn yo oswa dekonekte yo pou kou kouran lè l tounen an pa domaje yo",
       "Limen yo e etenn yo pou teste"
      ],
      "x": "Etenn gwo aparèy ak aparèy elektwonik yo. Kite yon sèl limyè limen pou ou konnen lè kouran tounen."
     },
     "a": 1
    },
    {
     "en": {
      "q": "Limited generator power. What comes first?",
      "o": [
       "Video games",
       "Medical devices and medicines that need cold, then the fridge",
       "The coffee maker"
      ],
      "x": "Life-sustaining equipment first, then keeping food and medicines cold."
     },
     "ht": {
      "q": "Kouran jeneratè limite. Kisa ki vin anvan?",
      "o": [
       "Jwèt videyo",
       "Aparèy medikal ak medikaman ki bezwen frèt, apre sa frijidè a",
       "Machin kafe a"
      ],
      "x": "Ekipman ki kenbe moun vivan anvan, apre sa kenbe manje ak medikaman frèt."
     },
     "a": 1
    },
    {
     "en": {
      "q": "What's the safest way to light the house at night?",
      "o": [
       "Candles in every room",
       "Flashlights or battery lanterns",
       "A gas stove left on"
      ],
      "x": "Flashlights and battery lanterns can't tip over and start a fire."
     },
     "ht": {
      "q": "Ki fason ki pi an sekirite pou klere kay la lannwit?",
      "o": [
       "Bouji nan chak chanm",
       "Flach oswa lanp ak pil",
       "Recho gaz ki rete limen"
      ],
      "x": "Flach ak lanp ak pil pa ka tonbe epi mete dife."
     },
     "a": 1
    }
   ]
  },
  {
   "key": "emerg",
   "w": 0.3,
   "label": {
    "en": "Stage 4 · Emergency",
    "ht": "Etap 4 · Ijans"
   },
   "cat": {
    "en": "Emergency response",
    "ht": "Reyaksyon nan ijans"
   },
   "qs": [
    {
     "en": {
      "q": "Your neighbor wants to power his house by plugging his generator into the dryer outlet. What do you tell him?",
      "o": [
       "Good idea, it's cheaper",
       "Don't. It can backfeed the lines and electrocute line workers. Use a transfer switch installed by an electrician",
       "Only do it at night"
      ],
      "x": "Backfeeding is a known cause of deaths among utility line workers. A transfer switch keeps the house and the grid separated."
     },
     "ht": {
      "q": "Vwazen ou vle bay kay li kouran lè l ploge jeneratè l nan priz machin seche rad la. Kisa ou di l?",
      "o": [
       "Bon lide, li pi bon mache",
       "Pa fè sa. Li ka voye kouran nan fil yo epi elektwokite travayè yo. Sèvi ak yon switch transfè yon elektrisyen enstale",
       "Fè l lannwit sèlman"
      ],
      "x": "Kouran ki tounen nan fil yo konn touye travayè elektrisite. Yon switch transfè kenbe kay la separe ak rezo a."
     },
     "a": 1,
     "critical": true
    },
    {
     "en": {
      "q": "A power line is lying on the sidewalk. It isn't sparking. What do you do?",
      "o": [
       "Move it with a dry stick",
       "Stay far away, keep others away, and call the power company or 911",
       "Step over it carefully"
      ],
      "x": "Downed lines can be live even when silent, and they can electrify the ground around them. Never go near one."
     },
     "ht": {
      "q": "Yon fil kouran kouche sou twotwa a. Li pa fè etensèl. Kisa ou fè?",
      "o": [
       "Deplase l ak yon baton sèk",
       "Rete byen lwen, kenbe lòt moun lwen, epi rele konpayi elektrisite a oswa 911",
       "Janbe l dousman"
      ],
      "x": "Fil ki tonbe ka gen kouran menm lè yo pa fè bwi, epi yo ka mete kouran nan tè a bò kote yo. Pa janm pwoche youn."
     },
     "a": 1,
     "critical": true
    },
    {
     "en": {
      "q": "A power line falls on your car while you're inside. There's no fire. What do you do?",
      "o": [
       "Jump out and run",
       "Stay inside, call 911, and wait for help",
       "Touch the door to test it"
      ],
      "x": "Stay in the car unless there's fire. If you must get out, jump clear with feet together and shuffle away without touching the car and ground at once."
     },
     "ht": {
      "q": "Yon fil kouran tonbe sou machin ou pandan ou anndan. Pa gen dife. Kisa ou fè?",
      "o": [
       "Sote soti epi kouri",
       "Rete anndan, rele 911, epi tann èd",
       "Manyen pòt la pou teste"
      ],
      "x": "Rete nan machin nan sòf si gen dife. Si ou oblije soti, sote byen lwen ak de pye ansanm epi glise pye ou ale san ou pa manyen machin nan ak tè a an menm tan."
     },
     "a": 1
    },
    {
     "en": {
      "q": "Where does the generator go while it runs?",
      "o": [
       "In the garage with the door open",
       "Outside, more than 20 feet from windows, doors and vents",
       "On the porch under a window"
      ],
      "x": "Outside and far away. Garages and porches let deadly exhaust into the house."
     },
     "ht": {
      "q": "Ki kote jeneratè a dwe ye pandan l ap mache?",
      "o": [
       "Nan garaj ak pòt louvri",
       "Deyò, plis pase 20 pye lwen fenèt, pòt ak vantilasyon",
       "Sou galri a anba yon fenèt"
      ],
      "x": "Deyò e lwen. Garaj ak galri kite lafimen ki ka touye antre nan kay la."
     },
     "a": 1,
     "critical": true
    }
   ],
   "scene": {
    "en": "⚡ Blackout after a storm",
    "ht": "⚡ Blakawout apre yon tanpèt"
   }
  }
 ],
 "check": {
  "en": [
   "Flashlights and extra batteries, one per person; no candles",
   "Charged power banks and a battery or crank radio",
   "Generator outside only, 20+ ft from windows, doors and vents",
   "Never plug a generator into a wall outlet; use a transfer switch installed by an electrician",
   "Heavy-duty outdoor extension cords, no damaged cords",
   "Backup plan for medical devices: talk to your doctor and power company",
   "Outage: turn off major appliances; leave one light on",
   "Stay far from downed power lines; call the power company or 911"
  ],
  "ht": [
   "Flach ak pil anplis, youn pou chak moun; pa bouji",
   "Batri pòtab chaje ak yon radyo ak pil oswa manivèl",
   "Jeneratè deyò sèlman, 20+ pye lwen fenèt, pòt ak vantilasyon",
   "Pa janm ploge jeneratè nan priz miray; sèvi ak switch transfè yon elektrisyen enstale",
   "Rallonj solid pou deyò, pa kòd ki domaje",
   "Plan sekou pou aparèy medikal: pale ak doktè ou ak konpayi elektrisite a",
   "Koupi: etenn gwo aparèy yo; kite yon sèl limyè limen",
   "Rete lwen fil kouran ki tonbe; rele konpayi elektrisite a oswa 911"
  ]
 },
 "sources": [
  [
   "CDC · Worker safety in a power outage (backfeed)",
   "https://archive.cdc.gov/www_cdc_gov/disasters/poweroutage/workersafety.html"
  ],
  [
   "OSHA · Downed electrical wires",
   "https://www.osha.gov/sites/default/files/downed_electrical_wires.pdf"
  ],
  [
   "CDC · Carbon Monoxide Poisoning Basics",
   "https://www.cdc.gov/carbon-monoxide/about/index.html"
  ]
 ]
};
