// Content drafted from official sources; pending review by Dr. Jhon Evenst Douyon, MD, MPH. Safety-critical: change only with review.
import type { Room } from "./types";

export const securityRoom: Room = {
 "id": "security",
 "n": 3,
 "emoji": "🚪",
 "sortWeight": 0.25,
 "next": "food",
 "ui": {
  "en": {
   "room": "Room 3 · Security & Entrance",
   "title": "Get everyone out alive",
   "intro1": "Most home fire deaths happen in homes without working smoke alarms. When an alarm sounds, you may have only minutes.",
   "intro2": "Your mission: equip the entrance, put alarms and exits in the right places, plan your escape, then get your family out of a night fire.",
   "catSort": "Fire & safety gear"
  },
  "ht": {
   "room": "Chanm 3 · Sekirite ak Antre",
   "title": "Fè tout moun soti vivan",
   "intro1": "Pifò moun ki mouri nan dife lakay yo mouri nan kay ki pa gen alam lafimen k ap mache. Lè yon alam sonnen, ou ka gen sèlman kèk minit.",
   "intro2": "Misyon ou: ekipe antre a, mete alam ak sòti yo nan bon kote, planifye kijan pou soti, epi fè fanmi ou soti nan yon dife lannwit.",
   "catSort": "Materyèl dife ak sekirite"
  }
 },
 "items": [
  {
   "e": "/icons/smoke-alarm.svg",
   "b": "u",
   "en": [
    "Working smoke alarms",
    "They warn you early. Working smoke alarms cut the chance of dying in a home fire nearly in half."
   ],
   "ht": [
    "Alam lafimen k ap mache",
    "Yo avèti ou bonè. Alam lafimen k ap mache diminye chans pou mouri nan yon dife lakay prèske pa mwatye."
   ]
  },
  {
   "e": "🧯",
   "b": "u",
   "en": [
    "Fire extinguisher",
    "For small fires only, and only once everyone is out of danger and your exit is behind you."
   ],
   "ht": [
    "Etenn dife",
    "Pou ti dife sèlman, epi sèlman lè tout moun an sekirite e ou gen sòti a dèyè ou."
   ]
  },
  {
   "e": "🔦",
   "b": "u",
   "en": [
    "Flashlight with spare batteries",
    "Safe light in the dark when the power is out. Keep one by each bed."
   ],
   "ht": [
    "Flach ak pil derechany",
    "Limyè san danje nan fènwa lè pa gen kouran. Kenbe youn bò chak kabann."
   ]
  },
  {
   "e": "🪜",
   "b": "u",
   "en": [
    "Escape ladder for upstairs bedrooms",
    "Gives upstairs rooms a second way out through the window."
   ],
   "ht": [
    "Nechèl pou soti nan chanm anwo yo",
    "Bay chanm anwo yo yon dezyèm fason pou soti pa fenèt la."
   ]
  },
  {
   "e": "📣",
   "b": "u",
   "en": [
    "Whistle",
    "Lets you call for help if you're trapped or can't shout."
   ],
   "ht": [
    "Siflèt",
    "Pèmèt ou rele pou èd si ou bloke oswa ou pa ka rele fò."
   ]
  },
  {
   "e": "🔑",
   "b": "u",
   "en": [
    "Door keys kept by the exit",
    "If a lock needs a key, the key must be right there. No searching in the smoke."
   ],
   "ht": [
    "Kle pòt yo kenbe bò sòti a",
    "Si yon seri bezwen kle, kle a dwe la menm. Pa gen tan pou chèche nan lafimen."
   ]
  },
  {
   "e": "🕯️",
   "b": "a",
   "en": [
    "Candles for emergency light",
    "Candles start fires, especially in the dark and in a rush. Use flashlights instead."
   ],
   "ht": [
    "Bouji pou limyè ijans",
    "Bouji ka mete dife, sitou nan fènwa ak lè moun prese. Sèvi ak flach pito."
   ]
  },
  {
   "e": "🔕",
   "b": "a",
   "en": [
    "Smoke alarm with the battery taken out",
    "An alarm without a battery protects no one. About two-thirds of home fire deaths happen in homes without working smoke alarms."
   ],
   "ht": [
    "Alam lafimen yo retire pil li",
    "Yon alam san pil pa pwoteje pèsonn. Apeprè de tyè moun ki mouri nan dife lakay mouri nan kay ki pa gen alam k ap mache."
   ],
   "critical": true
  },
  {
   "e": "📦",
   "b": "a",
   "en": [
    "Boxes stacked in front of the back door",
    "A blocked exit can trap your family. Keep every way out clear."
   ],
   "ht": [
    "Bwat anpile devan pòt dèyè a",
    "Yon sòti ki bloke ka fèmen fanmi ou anndan. Kenbe chak sòti klè."
   ],
   "critical": true
  },
  {
   "e": "/icons/wreath.svg",
   "b": "s",
   "en": [
    "Decorative door wreath",
    "Pretty, but it does nothing for safety."
   ],
   "ht": [
    "Kouwòn dekorasyon pou pòt",
    "Li bèl, men li pa fè anyen pou sekirite."
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
     "id": "hall",
     "label": {
      "en": "Hallway outside the bedrooms",
      "ht": "Koridò deyò chanm yo"
     },
     "x": 10,
     "y": 10,
     "w": 165,
     "h": 87
    },
    {
     "id": "bedroom",
     "label": {
      "en": "Inside each bedroom",
      "ht": "Anndan chak chanm"
     },
     "x": 185,
     "y": 10,
     "w": 165,
     "h": 87
    },
    {
     "id": "kitchenexit",
     "label": {
      "en": "Kitchen, by the exit door",
      "ht": "Kwizin, bò pòt sòti a"
     },
     "x": 10,
     "y": 107,
     "w": 165,
     "h": 87
    },
    {
     "id": "stove",
     "label": {
      "en": "Right above the stove",
      "ht": "Dirèkteman anwo recho a"
     },
     "x": 185,
     "y": 107,
     "w": 165,
     "h": 87
    },
    {
     "id": "backdoor",
     "label": {
      "en": "In front of the back door",
      "ht": "Devan pòt dèyè a"
     },
     "x": 10,
     "y": 204,
     "w": 165,
     "h": 87
    },
    {
     "id": "upwindow",
     "label": {
      "en": "Under the upstairs bedroom window",
      "ht": "Anba fenèt chanm anwo a"
     },
     "x": 185,
     "y": 204,
     "w": 165,
     "h": 87
    }
   ],
   "items": [
    {
     "id": "alarm",
     "e": "/icons/smoke-alarm.svg",
     "name": {
      "en": "Smoke alarm",
      "ht": "Alam lafimen"
     },
     "ok": [
      "hall",
      "bedroom"
     ],
     "why": {
      "ok": {
       "en": "Alarms belong inside each bedroom, outside each sleeping area, and on every level of the home.",
       "ht": "Alam yo dwe anndan chak chanm, deyò chak kote moun dòmi, epi sou chak etaj nan kay la."
      },
      "wrong": {
       "en": "Put alarms where people sleep: inside bedrooms and in the hallway outside them. Right over the stove, cooking sets it off and people end up removing the battery.",
       "ht": "Mete alam kote moun dòmi: anndan chanm yo ak nan koridò deyò yo. Dirèkteman anwo recho a, lè w ap kwit manje l ap sonnen, epi moun fini pa retire pil la."
      }
     }
    },
    {
     "id": "ext",
     "e": "🧯",
     "name": {
      "en": "Fire extinguisher",
      "ht": "Etenn dife"
     },
     "ok": [
      "kitchenexit"
     ],
     "why": {
      "ok": {
       "en": "Near the kitchen but by the exit: you can grab it and still have your way out behind you.",
       "ht": "Toupre kwizin nan men bò sòti a: ou ka pran l epi toujou gen chemen sòti a dèyè ou."
      },
      "wrong": {
       "en": "Keep it by an exit near the kitchen, where fires often start, so your way out stays behind you.",
       "ht": "Kenbe l bò yon sòti toupre kwizin nan, kote dife konn kòmanse, pou chemen sòti a rete dèyè ou."
      },
      "unsafe": {
       "en": "Stored above the stove, it's surrounded by flames when you need it most.",
       "ht": "Si l anwo recho a, li nan mitan flanm yo lè ou pi bezwen l."
      }
     },
     "unsafe": [
      "stove"
     ]
    },
    {
     "id": "ladder",
     "e": "🪜",
     "name": {
      "en": "Escape ladder",
      "ht": "Nechèl pou chape"
     },
     "ok": [
      "upwindow"
     ],
     "why": {
      "ok": {
       "en": "Under the upstairs window, ready to hook on and climb down.",
       "ht": "Anba fenèt anwo a, pare pou kwoke epi desann."
      },
      "wrong": {
       "en": "The ladder is for the upstairs window. That's the second way out it creates.",
       "ht": "Nechèl la se pou fenèt anwo a. Se dezyèm sòti sa a li kreye."
      },
      "unsafe": {
       "en": "A ladder in front of the back door blocks your other way out.",
       "ht": "Yon nechèl devan pòt dèyè a bloke lòt sòti ou a."
      }
     },
     "unsafe": [
      "backdoor"
     ]
    },
    {
     "id": "light",
     "e": "🔦",
     "name": {
      "en": "Flashlight",
      "ht": "Flach"
     },
     "ok": [
      "bedroom",
      "hall"
     ],
     "why": {
      "ok": {
       "en": "Within reach at night, when most deadly fires happen.",
       "ht": "Fasil pou pran lannwit, lè pifò dife ki touye moun rive."
      },
      "wrong": {
       "en": "Keep flashlights where people sleep so you can find your way out in the dark.",
       "ht": "Kenbe flach kote moun dòmi pou ou ka jwenn chemen sòti nan fènwa."
      }
     }
    }
   ]
  },
  {
   "key": "plan",
   "w": 0.2,
   "label": {
    "en": "Stage 3 · Plan",
    "ht": "Etap 3 · Planifye"
   },
   "cat": {
    "en": "Escape planning",
    "ht": "Plan pou chape"
   },
   "qs": [
    {
     "en": {
      "q": "How often should you test your smoke alarms?",
      "o": [
       "Once a month",
       "Once a year",
       "Only when they beep",
       "Never, they test themselves"
      ],
      "x": "Push the test button every month. Replace the whole alarm every 10 years."
     },
     "ht": {
      "q": "Chak konbyen tan ou dwe teste alam lafimen yo?",
      "o": [
       "Yon fwa pa mwa",
       "Yon fwa pa ane",
       "Sèlman lè yo fè bip",
       "Pa janm, yo teste tèt yo"
      ],
      "x": "Peze bouton tès la chak mwa. Chanje tout alam lan chak 10 an."
     },
     "a": 0
    },
    {
     "en": {
      "q": "How many ways out of every room should your escape plan have?",
      "o": [
       "One, the door",
       "Two, if possible",
       "None, wait for firefighters"
      ],
      "x": "Know two ways out of every room, usually the door and a window. Fire or smoke may block one."
     },
     "ht": {
      "q": "Konbyen fason pou soti chak chanm plan ou dwe genyen?",
      "o": [
       "Youn, pòt la",
       "De, si sa posib",
       "Okenn, tann ponpye"
      ],
      "x": "Konnen de fason pou soti chak chanm, souvan pòt la ak yon fenèt. Dife oswa lafimen ka bloke youn."
     },
     "a": 1
    },
    {
     "en": {
      "q": "How often should your family practice a home fire drill?",
      "o": [
       "Never, it scares the kids",
       "At least twice a year, day and night",
       "Only after a fire"
      ],
      "x": "Practice at least twice a year with everyone, once at night. Pick an outside meeting place, like a tree or mailbox, a safe distance away."
     },
     "ht": {
      "q": "Chak konbyen tan fanmi ou dwe pratike yon egzèsis dife?",
      "o": [
       "Pa janm, li fè timoun yo pè",
       "Omwen de fwa pa ane, lajounen ak lannwit",
       "Sèlman apre yon dife"
      ],
      "x": "Pratike omwen de fwa pa ane ak tout moun, youn lannwit. Chwazi yon kote pou rankontre deyò, tankou yon pye bwa oswa bwat lèt, a yon distans ki an sekirite."
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
      "q": "2 a.m. The smoke alarm sounds and there's smoke in the hallway. What do you do?",
      "o": [
       "Gather your valuables first",
       "Get everyone out using your plan, crawling low under the smoke",
       "Open windows to clear the smoke",
       "Hide in a closet"
      ],
      "x": "Get out fast. Smoke and heat rise, so the cleaner air is near the floor. Call 911 from outside."
     },
     "ht": {
      "q": "2 è nan maten. Alam lafimen an sonnen epi gen lafimen nan koridò a. Kisa ou fè?",
      "o": [
       "Ranmase bagay ki gen valè yo anvan",
       "Fè tout moun soti dapre plan an, an rale ba anba lafimen an",
       "Louvri fenèt pou retire lafimen an",
       "Kache nan yon pandri"
      ],
      "x": "Soti vit. Lafimen ak chalè monte, kidonk lè ki pi pwòp la toupre atè. Rele 911 depi deyò."
     },
     "a": 1,
     "critical": true
    },
    {
     "en": {
      "q": "You reach a closed door. How do you check it?",
      "o": [
       "Open it fast",
       "Touch the door, knob and gap with the back of your hand. If it's hot, use your second way out",
       "Grab the knob with your palm"
      ],
      "x": "Use the back of your hand: burned palms and fingers make it hard to climb or crawl out. A hot door means fire on the other side."
     },
     "ht": {
      "q": "Ou rive devan yon pòt ki fèmen. Kijan pou tcheke l?",
      "o": [
       "Louvri l vit",
       "Manyen pòt la, manch lan ak twou a ak do men ou. Si l cho, sèvi ak dezyèm sòti a",
       "Pran manch lan ak pla men ou"
      ],
      "x": "Sèvi ak do men ou: si pla men ak dwèt ou boule, li difisil pou monte oswa rale soti. Yon pòt cho vle di gen dife lòt bò a."
     },
     "a": 1
    },
    {
     "en": {
      "q": "A pan of oil catches fire on the stove. What do you do?",
      "o": [
       "Throw water on it",
       "Slide a lid over the pan and turn off the heat",
       "Carry the burning pan outside"
      ],
      "x": "Never use water on a grease fire: it makes burning oil explode outward. Cover it and cut the heat. If it spreads, get out."
     },
     "ht": {
      "q": "Yon chodyè lwil pran dife sou recho a. Kisa ou fè?",
      "o": [
       "Voye dlo sou li",
       "Mete yon kouvèti sou chodyè a epi etenn dife recho a",
       "Pote chodyè k ap boule a deyò"
      ],
      "x": "Pa janm mete dlo sou dife lwil: li fè lwil k ap boule a eksploze voye toupatou. Kouvri l epi koupe chalè a. Si l gaye, soti."
     },
     "a": 1,
     "critical": true
    },
    {
     "en": {
      "q": "A small fire, everyone is out of the room. How do you use the extinguisher?",
      "o": [
       "Spray the top of the flames",
       "PASS: Pull the pin, Aim low at the base, Squeeze, Sweep side to side",
       "Shake it and throw it"
      ],
      "x": "Aim at the base of the fire, not the flames. Keep your exit behind you, and leave if the fire grows."
     },
     "ht": {
      "q": "Yon ti dife, tout moun soti nan chanm nan. Kijan pou sèvi ak etenn dife a?",
      "o": [
       "Flite anwo flanm yo",
       "PASS: Rale goupi a, Vize ba nan pye dife a, Peze, Bale de bò",
       "Souke l epi voye l"
      ],
      "x": "Vize pye dife a, pa flanm yo. Kenbe sòti ou dèyè ou, epi soti si dife a vin pi gwo."
     },
     "a": 1
    },
    {
     "en": {
      "q": "Everyone is outside, but the dog is still in the house. What now?",
      "o": [
       "Run back in quickly",
       "Stay out. Tell the firefighters where the dog is",
       "Send the oldest child in"
      ],
      "x": "Get out and stay out. Never go back into a burning home, for people or pets. Firefighters have the gear to go in."
     },
     "ht": {
      "q": "Tout moun deyò, men chen an toujou anndan kay la. Kisa kounye a?",
      "o": [
       "Kouri antre vit",
       "Rete deyò. Di ponpye yo kote chen an ye",
       "Voye pi gran timoun nan antre"
      ],
      "x": "Soti epi rete deyò. Pa janm retounen nan yon kay k ap boule, ni pou moun ni pou bèt. Ponpye yo gen materyèl pou antre."
     },
     "a": 1,
     "critical": true
    }
   ],
   "scene": {
    "en": "🔥 Night fire",
    "ht": "🔥 Dife lannwit"
   }
  }
 ],
 "check": {
  "en": [
   "Smoke alarms inside each bedroom, outside sleeping areas, on every level",
   "Test alarms monthly; replace them every 10 years",
   "Fire extinguisher by an exit near the kitchen; learn PASS",
   "Two ways out of every room; keep exits clear",
   "Escape ladder for upstairs bedrooms",
   "Outside meeting place everyone knows",
   "Fire drill at least twice a year, once at night",
   "Flashlights by the beds, never candles",
   "Get out, stay out, call 911 from outside"
  ],
  "ht": [
   "Alam lafimen anndan chak chanm, deyò kote moun dòmi, sou chak etaj",
   "Teste alam yo chak mwa; chanje yo chak 10 an",
   "Etenn dife bò yon sòti toupre kwizin nan; aprann PASS",
   "De fason pou soti chak chanm; kenbe sòti yo klè",
   "Nechèl pou chanm anwo yo",
   "Yon kote pou rankontre deyò tout moun konnen",
   "Egzèsis dife omwen de fwa pa ane, youn lannwit",
   "Flach bò kabann yo, pa janm bouji",
   "Soti, rete deyò, rele 911 depi deyò"
  ]
 },
 "sources": [
  [
   "NFPA / ESFI · Smoke alarms & escape planning",
   "https://www.esfi.org/smoke-alarms-carbon-monoxide-alarms-and-fire-escape-planning/"
  ],
  [
   "Safe Kids · Fire safety checklist",
   "https://www.safekids.org/sites/default/files/documents/2019_fire_safety_checklist-eng.pdf"
  ],
  [
   "FEMA · What to do during a fire",
   "https://webarchive.library.unt.edu/web/20080916061555/http://www.fema.gov/hazard/fire/fire_during.shtm"
  ]
 ]
};
