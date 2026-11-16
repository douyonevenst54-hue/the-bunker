// Content drafted from official sources; pending review by Dr. Jhon Evenst Douyon, MD, MPH. Safety-critical: change only with review.
import type { Room } from "./types";

export const foodRoom: Room = {
 "id": "food",
 "n": 4,
 "emoji": "🥫",
 "sortWeight": 0.25,
 "next": "air",
 "ui": {
  "en": {
   "room": "Room 4 · Food & Nutrition",
   "title": "Feed everyone, safely",
   "intro1": "When the power goes out, food in the fridge can turn dangerous within hours, and you can't smell or taste most of the germs.",
   "intro2": "Your mission: stock the pantry, store food right, know your time limits, then handle a power outage and a flood.",
   "catSort": "Pantry supplies"
  },
  "ht": {
   "room": "Chanm 4 · Manje ak Nitrisyon",
   "title": "Bay tout moun manje, san danje",
   "intro1": "Lè kouran koupe, manje nan frijidè a ka vin danjere nan kèk èdtan, epi ou pa ka santi ni goute pifò mikwòb yo.",
   "intro2": "Misyon ou: ranpli depo manje a, sere manje kòrèkteman, konnen limit tan yo, epi okipe yon koupi kouran ak yon inondasyon.",
   "catSort": "Materyèl depo manje"
  }
 },
 "items": [
  {
   "e": "🥫",
   "b": "u",
   "en": [
    "Canned beans, fish and vegetables",
    "Shelf-stable food needs no fridge. Use it and replace it from time to time."
   ],
   "ht": [
    "Pwa, pwason ak legim nan bwat",
    "Manje ki kenbe san frijidè pa bezwen kouran. Manje l epi ranplase l de tanzantan."
   ]
  },
  {
   "e": "🔧",
   "b": "u",
   "en": [
    "Manual can opener",
    "Without power, an electric opener is useless. Keep a hand-held one with your food."
   ],
   "ht": [
    "Ouvrebwat alamen",
    "San kouran, yon ouvrebwat elektrik pa sèvi anyen. Kenbe youn alamen ak manje ou."
   ]
  },
  {
   "e": "🥜",
   "b": "u",
   "en": [
    "Peanut butter and crackers",
    "High-energy food you can eat without cooking."
   ],
   "ht": [
    "Manba ak biskwit",
    "Manje ki bay anpil enèji ou ka manje san kwit."
   ]
  },
  {
   "e": "🍼",
   "b": "u",
   "en": [
    "Ready-to-feed baby formula",
    "Infants need their own supply. Ready-to-feed formula needs no water mixing."
   ],
   "ht": [
    "Lèt tibebe pare pou bwè",
    "Tibebe bezwen pwòp rezèv yo. Lèt ki pare pa bezwen melanje ak dlo."
   ]
  },
  {
   "e": "🌡️",
   "b": "u",
   "en": [
    "Fridge and freezer thermometers",
    "The only way to know if food stayed cold enough: 40°F (4°C) or below in the fridge, 0°F (-18°C) in the freezer."
   ],
   "ht": [
    "Tèmomèt pou frijidè ak frizè",
    "Sèl fason pou konnen si manje a te rete frèt ase: 40°F (4°C) oswa mwens nan frijidè, 0°F (-18°C) nan frizè."
   ]
  },
  {
   "e": "🧊",
   "b": "u",
   "en": [
    "Cooler and ice packs",
    "If the power stays off past 4 hours, move perishable food into a cooler with ice."
   ],
   "ht": [
    "Glasyè ak sache glas",
    "Si kouran an rete koupe plis pase 4 èdtan, mete manje ki ka gate yo nan yon glasyè ak glas."
   ]
  },
  {
   "e": "🥫",
   "b": "a",
   "en": [
    "Dented, bulging or leaking cans",
    "Swollen, leaking or badly dented cans can hold dangerous germs. Throw them out."
   ],
   "ht": [
    "Bwat ki kabose, gonfle oswa k ap koule",
    "Bwat ki gonfle, k ap koule oswa ki kabose anpil ka gen mikwòb danjere. Jete yo."
   ],
   "critical": true
  },
  {
   "e": "🌊",
   "b": "a",
   "en": [
    "Food that touched floodwater",
    "Floodwater carries sewage and chemicals. Food it touched is unsafe to eat."
   ],
   "ht": [
    "Manje dlo inondasyon touche",
    "Dlo inondasyon pote twalèt ak pwodui chimik. Manje li touche pa bon pou manje."
   ],
   "critical": true
  },
  {
   "e": "🍫",
   "b": "s",
   "en": [
    "Chocolate fountain",
    "Fun at parties, useless without power."
   ],
   "ht": [
    "Fontèn chokola",
    "Amizan nan fèt, pa itil san kouran."
   ]
  },
  {
   "e": "🍞",
   "b": "s",
   "en": [
    "Electric bread maker",
    "Needs power you won't have. Not part of an emergency kit."
   ],
   "ht": [
    "Machin elektrik pou fè pen",
    "Li bezwen kouran ou p ap genyen. Li pa fè pati yon twous ijans."
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
     "id": "pantry",
     "label": {
      "en": "Cool, dry pantry shelf",
      "ht": "Etajè depo fre e sèk"
     },
     "x": 10,
     "y": 10,
     "w": 165,
     "h": 87
    },
    {
     "id": "kit",
     "label": {
      "en": "Emergency kit bin",
      "ht": "Bwat twous ijans"
     },
     "x": 185,
     "y": 10,
     "w": 165,
     "h": 87
    },
    {
     "id": "fridge",
     "label": {
      "en": "Refrigerator",
      "ht": "Frijidè"
     },
     "x": 10,
     "y": 107,
     "w": 165,
     "h": 87
    },
    {
     "id": "freezer",
     "label": {
      "en": "Freezer",
      "ht": "Frizè"
     },
     "x": 185,
     "y": 107,
     "w": 165,
     "h": 87
    },
    {
     "id": "floor",
     "label": {
      "en": "Basement floor (floods first)",
      "ht": "Atè nan sousòl la (inonde anvan)"
     },
     "x": 10,
     "y": 204,
     "w": 165,
     "h": 87
    },
    {
     "id": "stove",
     "label": {
      "en": "Next to the stove (hot)",
      "ht": "Bò recho a (cho)"
     },
     "x": 185,
     "y": 204,
     "w": 165,
     "h": 87
    }
   ],
   "items": [
    {
     "id": "cans",
     "e": "🥫",
     "name": {
      "en": "Canned food",
      "ht": "Manje nan bwat"
     },
     "ok": [
      "pantry",
      "kit"
     ],
     "why": {
      "ok": {
       "en": "Cool, dry and off the floor: canned food keeps its quality and stays out of floodwater.",
       "ht": "Fre, sèk, epi pa atè: manje nan bwat kenbe kalite l epi li rete lwen dlo inondasyon."
      },
      "wrong": {
       "en": "Heat damages stored food, and low spots flood first. Food that floodwater touches has to be thrown out.",
       "ht": "Chalè gate manje ou sere, epi kote ki ba yo inonde anvan. Manje dlo inondasyon touche dwe jete."
      }
     }
    },
    {
     "id": "thermo",
     "e": "🌡️",
     "name": {
      "en": "Appliance thermometer",
      "ht": "Tèmomèt aparèy"
     },
     "ok": [
      "fridge",
      "freezer"
     ],
     "why": {
      "ok": {
       "en": "Inside the fridge or freezer, it tells you whether food stayed safe during an outage.",
       "ht": "Anndan frijidè oswa frizè a, li di ou si manje a te rete san danje pandan koupi a."
      },
      "wrong": {
       "en": "A thermometer only helps inside the fridge or freezer, where you need to check the temperature.",
       "ht": "Yon tèmomèt itil sèlman anndan frijidè oswa frizè a, kote ou bezwen tcheke tanperati a."
      }
     }
    },
    {
     "id": "opener",
     "e": "🔧",
     "name": {
      "en": "Manual can opener",
      "ht": "Ouvrebwat alamen"
     },
     "ok": [
      "kit",
      "pantry"
     ],
     "why": {
      "ok": {
       "en": "Right next to the cans, so the food is never out of reach.",
       "ht": "Bò bwat yo menm, konsa manje a toujou disponib."
      },
      "wrong": {
       "en": "Keep the opener with your canned food. A can you can't open won't feed anyone.",
       "ht": "Kenbe ouvrebwat la ak manje nan bwat yo. Yon bwat ou pa ka louvri pa ka bay pèsonn manje."
      }
     }
    },
    {
     "id": "jugs",
     "e": "🧊",
     "name": {
      "en": "Frozen jugs of water",
      "ht": "Galon dlo glase"
     },
     "ok": [
      "freezer"
     ],
     "why": {
      "ok": {
       "en": "They fill empty space so a full freezer stays cold longer, and the melted ice is drinking water.",
       "ht": "Yo ranpli espas vid pou frizè a rete frèt pi lontan, epi glas ki fonn lan se dlo pou bwè."
      },
      "wrong": {
       "en": "Frozen jugs belong in the freezer: a full freezer holds its temperature about twice as long as a half-full one.",
       "ht": "Galon glase yo dwe nan frizè a: yon frizè plen kenbe frèt prèske de fwa pi lontan pase yon frizè mwatye vid."
      }
     }
    }
   ]
  },
  {
   "key": "store",
   "w": 0.2,
   "label": {
    "en": "Stage 3 · Store",
    "ht": "Etap 3 · Sere"
   },
   "cat": {
    "en": "Safe storage",
    "ht": "Sere san danje"
   },
   "qs": [
    {
     "en": {
      "q": "What temperature should your refrigerator be?",
      "o": [
       "40°F (4°C) or below",
       "50°F (10°C)",
       "Room temperature"
      ],
      "x": "Keep the fridge at 40°F (4°C) or below and the freezer at 0°F (-18°C). Check with an appliance thermometer."
     },
     "ht": {
      "q": "Ki tanperati frijidè ou dwe ye?",
      "o": [
       "40°F (4°C) oswa mwens",
       "50°F (10°C)",
       "Tanperati chanm"
      ],
      "x": "Kenbe frijidè a 40°F (4°C) oswa mwens, frizè a 0°F (-18°C). Tcheke ak yon tèmomèt aparèy."
     },
     "a": 0
    },
    {
     "en": {
      "q": "Your emergency food has been on the shelf a long time. What should you do?",
      "o": [
       "Leave it forever",
       "Use it in regular meals and replace it from time to time",
       "Throw it all out every month"
      ],
      "x": "Rotate your supply: eat the oldest items in regular meals and buy fresh ones, so the kit is never expired."
     },
     "ht": {
      "q": "Manje ijans ou gen lontan sou etajè a. Kisa ou dwe fè?",
      "o": [
       "Kite l la pou tout tan",
       "Sèvi ak li nan manje regilye epi ranplase l de tanzantan",
       "Jete tout chak mwa"
      ],
      "x": "Fè woulman: manje sa ki pi ansyen yo nan manje regilye epi achte nouvo, konsa twous la pa janm ekspire."
     },
     "a": 1
    },
    {
     "en": {
      "q": "Who in the family needs their own special supply?",
      "o": [
       "Nobody, everyone eats the same",
       "Infants (formula) and pets (pet food)",
       "Only teenagers"
      ],
      "x": "Plan for infants with ready-to-feed formula, and for pets with pet food. They can't share the family's canned beans."
     },
     "ht": {
      "q": "Kiyès nan fanmi an bezwen pwòp rezèv espesyal yo?",
      "o": [
       "Pèsonn, tout moun manje menm bagay",
       "Tibebe (lèt) ak bèt (manje bèt)",
       "Sèlman adolesan"
      ],
      "x": "Planifye pou tibebe ak lèt ki pare, epi pou bèt ak manje bèt. Yo pa ka pataje pwa nan bwat fanmi an."
     },
     "a": 1
    }
   ]
  },
  {
   "key": "calc",
   "w": 0.2,
   "label": {
    "en": "Stage 4 · Time limits",
    "ht": "Etap 4 · Limit tan"
   },
   "cat": {
    "en": "Knowing the limits",
    "ht": "Konnen limit yo"
   },
   "qs": [
    {
     "en": {
      "q": "Power's out and the fridge door stays closed. How long does it keep food safe?",
      "o": [
       "About 4 hours",
       "2 days",
       "A week"
      ],
      "x": "About 4 hours with the door closed. After that, move perishable food to a cooler with ice."
     },
     "ht": {
      "q": "Kouran koupe epi pòt frijidè a rete fèmen. Pandan konbyen tan li kenbe manje a san danje?",
      "o": [
       "Apeprè 4 èdtan",
       "2 jou",
       "Yon semèn"
      ],
      "x": "Apeprè 4 èdtan si pòt la rete fèmen. Apre sa, mete manje ki ka gate yo nan yon glasyè ak glas."
     },
     "a": 0
    },
    {
     "en": {
      "q": "And a full freezer, door closed?",
      "o": [
       "About 4 hours",
       "About 48 hours (24 if half full)",
       "Forever, as long as it's closed"
      ],
      "x": "A full freezer holds its temperature about 48 hours, a half-full one about 24. Keep the door shut."
     },
     "ht": {
      "q": "E yon frizè plen, pòt fèmen?",
      "o": [
       "Apeprè 4 èdtan",
       "Apeprè 48 èdtan (24 si l mwatye plen)",
       "Pou tout tan, depi l fèmen"
      ],
      "x": "Yon frizè plen kenbe frèt apeprè 48 èdtan, yon frizè mwatye plen apeprè 24. Kenbe pòt la fèmen."
     },
     "a": 1
    },
    {
     "en": {
      "q": "How much emergency food should a family keep?",
      "o": [
       "One meal",
       "At least several days' worth, more if you can",
       "Nothing, stores reopen fast"
      ],
      "x": "Start with at least several days of food that needs no fridge or cooking, then build up. Stores can stay closed after a disaster."
     },
     "ht": {
      "q": "Konbyen manje ijans yon fanmi dwe kenbe?",
      "o": [
       "Yon sèl repa",
       "Omwen pou plizyè jou, plis si ou kapab",
       "Anyen, magazen yo relouvri vit"
      ],
      "x": "Kòmanse ak omwen plizyè jou manje ki pa bezwen frijidè ni kwit, epi ogmante. Magazen ka rete fèmen apre yon dezas."
     },
     "a": 1
    }
   ]
  },
  {
   "key": "emerg",
   "w": 0.3,
   "label": {
    "en": "Stage 5 · Emergency",
    "ht": "Etap 5 · Ijans"
   },
   "cat": {
    "en": "Emergency response",
    "ht": "Reyaksyon nan ijans"
   },
   "qs": [
    {
     "en": {
      "q": "The power was out 6 hours. The chicken in the fridge smells fine. Eat it?",
      "o": [
       "Yes, it smells fine",
       "Taste a little first",
       "No. Perishable food goes after 4 hours without power, and you never taste to check"
      ],
      "x": "Germs that cause food poisoning usually don't change smell or taste. When in doubt, throw it out."
     },
     "ht": {
      "q": "Kouran te koupe 6 èdtan. Poul nan frijidè a pa gen move odè. Manje l?",
      "o": [
       "Wi, li pa gen odè",
       "Goute yon ti kras anvan",
       "Non. Manje ki ka gate pa bon apre 4 èdtan san kouran, epi pa janm goute pou tcheke"
      ],
      "x": "Mikwòb ki bay entoksikasyon pa chanje odè ni gou manje a pifò tan. Si ou gen dout, jete l."
     },
     "a": 2,
     "critical": true
    },
    {
     "en": {
      "q": "During the outage, what do you do with the fridge and freezer doors?",
      "o": [
       "Open them often to check",
       "Keep them closed as much as possible",
       "Leave them open to air out"
      ],
      "x": "Every opening lets cold air escape. Keep both doors shut."
     },
     "ht": {
      "q": "Pandan koupi a, kisa ou fè ak pòt frijidè ak frizè a?",
      "o": [
       "Louvri yo souvan pou tcheke",
       "Kenbe yo fèmen otank posib",
       "Kite yo louvri pou yo pran lè"
      ],
      "x": "Chak fwa ou louvri, lè frèt la soti. Kenbe tou de pòt yo fèmen."
     },
     "a": 1
    },
    {
     "en": {
      "q": "Floodwater reached the pantry. A sealed jar of peanut butter with a screw cap sat in it. Keep it?",
      "o": [
       "Yes, it's sealed",
       "No. Screw caps, snap lids and cardboard boxes can't be cleaned well enough",
       "Yes, after a rinse"
      ],
      "x": "Floodwater gets under screw caps and lids. Throw out jars, boxes and home-canned food it touched."
     },
     "ht": {
      "q": "Dlo inondasyon rive nan depo a. Yon bokal manba ki fèmen ak kouvèti vise te ladan l. Kenbe l?",
      "o": [
       "Wi, li fèmen",
       "Non. Kouvèti vise, kouvèti klips ak bwat katon pa ka netwaye ase",
       "Wi, apre ou rense l"
      ],
      "x": "Dlo inondasyon antre anba kouvèti vise ak kouvèti yo. Jete bokal, bwat katon ak manje kanze lakay li touche."
     },
     "a": 1
    },
    {
     "en": {
      "q": "Undamaged store-bought metal cans also sat in the floodwater. What now?",
      "o": [
       "Throw them all out",
       "Eat them as they are",
       "They can be saved: remove labels, wash, then sanitize them before opening"
      ],
      "x": "Undamaged commercial metal cans can be saved if you clean and sanitize them first. Damaged ones go in the trash."
     },
     "ht": {
      "q": "Bwat metal komèsyal ki pa domaje te nan dlo inondasyon an tou. Kisa kounye a?",
      "o": [
       "Jete yo tout",
       "Manje yo jan yo ye a",
       "Ou ka sove yo: retire etikèt yo, lave yo, epi dezenfekte yo anvan ou louvri yo"
      ],
      "x": "Bwat metal komèsyal ki pa domaje ka sove si ou netwaye epi dezenfekte yo anvan. Sa ki domaje yo ale nan fatra."
     },
     "a": 2
    },
    {
     "en": {
      "q": "One can is swollen at the top. What do you do?",
      "o": [
       "Open it carefully and smell it",
       "Throw it out without opening it",
       "Cook it longer to be safe"
      ],
      "x": "Swelling, leaking or deep dents mean the food may be dangerous. Don't open it, don't taste it."
     },
     "ht": {
      "q": "Yon bwat gonfle anwo. Kisa ou fè?",
      "o": [
       "Louvri l dousman epi santi l",
       "Jete l san louvri l",
       "Kwit li pi lontan pou asire"
      ],
      "x": "Si yon bwat gonfle, ap koule oswa kabose fon, manje a ka danjere. Pa louvri l, pa goute l."
     },
     "a": 1,
     "critical": true
    }
   ],
   "scene": {
    "en": "⚡🌊 Power outage, then a flood",
    "ht": "⚡🌊 Koupi kouran, epi inondasyon"
   }
  }
 ],
 "check": {
  "en": [
   "At least several days of food that needs no fridge or cooking",
   "Manual can opener",
   "Formula for infants, food for pets",
   "Thermometers in fridge (40°F/4°C or below) and freezer (0°F/-18°C)",
   "Cooler and ice packs; frozen water jugs to fill the freezer",
   "Outage: keep doors closed; fridge ~4 hours, full freezer ~48 hours",
   "Never taste to check. When in doubt, throw it out",
   "Throw out food touched by floodwater and any bulging or damaged cans",
   "Store food high, cool and dry, off the floor"
  ],
  "ht": [
   "Omwen plizyè jou manje ki pa bezwen frijidè ni kwit",
   "Ouvrebwat alamen",
   "Lèt pou tibebe, manje pou bèt",
   "Tèmomèt nan frijidè (40°F/4°C oswa mwens) ak frizè (0°F/-18°C)",
   "Glasyè ak sache glas; galon dlo glase pou ranpli frizè a",
   "Koupi: kenbe pòt yo fèmen; frijidè ~4 èdtan, frizè plen ~48 èdtan",
   "Pa janm goute pou tcheke. Si ou gen dout, jete l",
   "Jete manje dlo inondasyon touche ak tout bwat ki gonfle oswa domaje",
   "Sere manje wo, fre e sèk, pa atè"
  ]
 },
 "sources": [
  [
   "USDA FSIS · Keep your food safe during emergencies",
   "https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/emergencies/keep-your-food-safe-during-emergencies"
  ],
  [
   "CDC · Keep food safe after a disaster",
   "https://www.cdc.gov/food-safety/foods/keep-food-safe-after-emergency.html"
  ],
  [
   "FDA · Food and water safety during power outages and floods",
   "https://www.fda.gov/food/buy-store-serve-safe-food/food-and-water-safety-during-power-outages-and-floods"
  ]
 ]
};
