// Content drafted from official sources; pending review by Dr. Jhon Evenst Douyon, MD, MPH. Safety-critical: change only with review.
import type { Room } from "./types";

export const airRoom: Room = {
 "id": "air",
 "n": 5,
 "emoji": "🌬️",
 "sortWeight": 0.25,
 "next": "energy",
 "ui": {
  "en": {
   "room": "Room 5 · Air & Ventilation",
   "title": "Keep the air safe to breathe",
   "intro1": "Carbon monoxide has no color and no smell. People who are asleep can die from it before they ever feel sick.",
   "intro2": "Your mission: choose your air-safety gear, place alarms and fuel-burning equipment safely, learn the warning signs, then respond to a CO alarm and a chemical spill.",
   "catSort": "Air-safety gear"
  },
  "ht": {
   "room": "Chanm 5 · Lè ak Vantilasyon",
   "title": "Kenbe lè a bon pou respire",
   "intro1": "Monoksid kabòn pa gen koulè ni odè. Moun k ap dòmi ka mouri ladan l anvan yo menm santi yo malad.",
   "intro2": "Misyon ou: chwazi materyèl pou sekirite lè a, plase alam ak aparèy ki boule gaz san danje, aprann siy avètisman yo, epi reyaji devan yon alam CO ak yon pwodui chimik ki gaye.",
   "catSort": "Materyèl sekirite lè"
  }
 },
 "items": [
  {
   "e": "/icons/co-alarm.svg",
   "b": "u",
   "en": [
    "Battery carbon monoxide (CO) alarm",
    "The only way to detect CO. Put battery or battery-backup alarms near every sleeping area."
   ],
   "ht": [
    "Alam monoksid kabòn (CO) ak pil",
    "Sèl fason pou detekte CO. Mete alam ak pil oswa ak pil sekou toupre chak kote moun dòmi."
   ]
  },
  {
   "e": "🔋",
   "b": "u",
   "en": [
    "Spare batteries for the alarms",
    "An alarm with a dead battery is silent. Check them when you change the clocks."
   ],
   "ht": [
    "Pil derechany pou alam yo",
    "Yon alam ki gen pil mouri pa fè bwi. Tcheke yo lè ou chanje lè revèy yo."
   ]
  },
  {
   "e": "/icons/duct-tape.svg",
   "b": "u",
   "en": [
    "Duct tape and plastic sheeting",
    "To seal a room's doors, windows and vents if officials tell you to shelter in place."
   ],
   "ht": [
    "Tep ak fèy plastik",
    "Pou bouche pòt, fenèt ak vantilasyon yon chanm si otorite yo di ou rete anndan."
   ]
  },
  {
   "e": "📻",
   "b": "u",
   "en": [
    "Battery or crank radio",
    "Officials announce when to shelter in place or evacuate, even when phones and power are down."
   ],
   "ht": [
    "Radyo ak pil oswa ak manivèl",
    "Otorite yo anonse lè pou rete anndan oswa evakye, menm lè telefòn ak kouran pa mache."
   ]
  },
  {
   "e": "🔌",
   "b": "u",
   "en": [
    "Long outdoor-rated extension cord",
    "Lets the generator stay more than 20 feet from windows, doors and vents."
   ],
   "ht": [
    "Long rallonj pou deyò",
    "Pèmèt jeneratè a rete plis pase 20 pye lwen fenèt, pòt ak vantilasyon."
   ]
  },
  {
   "e": "🔥",
   "b": "a",
   "en": [
    "Charcoal grill for indoor heat",
    "Burning charcoal indoors fills the room with CO. Never burn charcoal inside."
   ],
   "ht": [
    "Griy chabon pou chofe anndan",
    "Boule chabon anndan plen chanm nan ak CO. Pa janm boule chabon anndan."
   ],
   "critical": true
  },
  {
   "e": "♨️",
   "b": "a",
   "en": [
    "Gas oven left open to heat the house",
    "Never heat your home with a gas oven. It can fill the house with CO."
   ],
   "ht": [
    "Fou gaz louvri pou chofe kay la",
    "Pa janm chofe kay ou ak yon fou gaz. Li ka plen kay la ak CO."
   ],
   "critical": true
  },
  {
   "e": "/icons/generator.svg",
   "b": "a",
   "en": [
    "Generator running in the garage, door open",
    "Even with the door open, garage exhaust can kill in minutes. Generators go outside only."
   ],
   "ht": [
    "Jeneratè k ap mache nan garaj, pòt louvri",
    "Menm ak pòt louvri, lafimen jeneratè nan garaj ka touye nan kèk minit. Jeneratè se deyò sèlman."
   ],
   "critical": true
  },
  {
   "e": "🌸",
   "b": "s",
   "en": [
    "Scented air freshener",
    "It covers smells but does nothing for CO, which has no smell anyway."
   ],
   "ht": [
    "Espre pafen pou lè",
    "Li kache odè men li pa fè anyen pou CO, ki pa gen odè menm."
   ]
  },
  {
   "e": "🪭",
   "b": "s",
   "en": [
    "Decorative table fan",
    "Moving air around a room does not remove carbon monoxide."
   ],
   "ht": [
    "Ti vantilatè dekorasyon",
    "Fè lè vire nan yon chanm pa retire monoksid kabòn."
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
     "id": "bedrooms",
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
     "id": "interior",
     "label": {
      "en": "Interior room, few windows",
      "ht": "Chanm anndan, kèk fenèt"
     },
     "x": 185,
     "y": 10,
     "w": 165,
     "h": 87
    },
    {
     "id": "kitchen",
     "label": {
      "en": "Kitchen",
      "ht": "Kwizin"
     },
     "x": 10,
     "y": 107,
     "w": 165,
     "h": 87
    },
    {
     "id": "porch",
     "label": {
      "en": "Porch, right under a window",
      "ht": "Galri, anba yon fenèt"
     },
     "x": 185,
     "y": 107,
     "w": 165,
     "h": 87
    },
    {
     "id": "garage",
     "label": {
      "en": "Inside the attached garage",
      "ht": "Anndan garaj ki kole ak kay la"
     },
     "x": 10,
     "y": 204,
     "w": 165,
     "h": 87
    },
    {
     "id": "yard",
     "label": {
      "en": "Yard, 20+ ft from windows & doors",
      "ht": "Lakou, 20+ pye lwen fenèt ak pòt"
     },
     "x": 185,
     "y": 204,
     "w": 165,
     "h": 87
    }
   ],
   "items": [
    {
     "id": "co",
     "e": "/icons/co-alarm.svg",
     "name": {
      "en": "CO alarm",
      "ht": "Alam CO"
     },
     "ok": [
      "bedrooms"
     ],
     "why": {
      "ok": {
       "en": "Near where people sleep, so it can wake them before CO does harm.",
       "ht": "Toupre kote moun dòmi, pou l ka reveye yo anvan CO fè mal."
      },
      "wrong": {
       "en": "Put CO alarms near every sleeping area. Sleeping people can be poisoned before they notice any symptoms.",
       "ht": "Mete alam CO toupre chak kote moun dòmi. Moun k ap dòmi ka anpwazonnen anvan yo remake okenn sentòm."
      }
     }
    },
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
       "en": "Outside, more than 20 feet from windows, doors and vents, exhaust pointed away from the house.",
       "ht": "Deyò, plis pase 20 pye lwen fenèt, pòt ak vantilasyon, lafimen an vire lwen kay la."
      },
      "wrong": {
       "en": "Generators only run outside, more than 20 feet from any window, door or vent.",
       "ht": "Jeneratè mache sèlman deyò, plis pase 20 pye lwen nenpòt fenèt, pòt oswa vantilasyon."
      },
      "unsafe": {
       "en": "Generator exhaust indoors, in a garage or under a window can kill in minutes, even with doors open.",
       "ht": "Lafimen jeneratè anndan, nan garaj oswa anba yon fenèt ka touye nan kèk minit, menm ak pòt louvri."
      }
     },
     "unsafe": [
      "garage",
      "porch",
      "kitchen"
     ]
    },
    {
     "id": "grill",
     "e": "🔥",
     "name": {
      "en": "Charcoal grill",
      "ht": "Griy chabon"
     },
     "ok": [
      "yard"
     ],
     "why": {
      "ok": {
       "en": "Grills belong outside, away from the house.",
       "ht": "Griy yo dwe deyò, lwen kay la."
      },
      "wrong": {
       "en": "Burning charcoal makes CO. Only use a grill outdoors, away from windows and doors.",
       "ht": "Chabon k ap boule fè CO. Sèvi ak griy deyò sèlman, lwen fenèt ak pòt."
      },
      "unsafe": {
       "en": "A charcoal grill indoors or in a garage can fill the space with deadly CO.",
       "ht": "Yon griy chabon anndan oswa nan garaj ka plen kote a ak CO ki ka touye."
      }
     },
     "unsafe": [
      "kitchen",
      "garage"
     ]
    },
    {
     "id": "sip",
     "e": "/icons/duct-tape.svg",
     "name": {
      "en": "Shelter-in-place kit (tape, plastic, radio)",
      "ht": "Twous pou rete anndan (tep, plastik, radyo)"
     },
     "ok": [
      "interior"
     ],
     "why": {
      "ok": {
       "en": "Ready in the room you'll seal: an interior room with few windows, above ground level.",
       "ht": "Pare nan chanm ou pral bouche a: yon chanm anndan ak kèk fenèt, pi wo pase nivo atè a."
      },
      "wrong": {
       "en": "Keep this kit in your shelter room, an interior room with few windows, so you don't waste time.",
       "ht": "Kenbe twous sa a nan chanm pou abri a, yon chanm anndan ak kèk fenèt, pou ou pa pèdi tan."
      }
     }
    }
   ]
  },
  {
   "key": "recognize",
   "w": 0.2,
   "label": {
    "en": "Stage 3 · Recognize",
    "ht": "Etap 3 · Rekonèt"
   },
   "cat": {
    "en": "Recognizing danger",
    "ht": "Rekonèt danje"
   },
   "qs": [
    {
     "en": {
      "q": "Which could be carbon monoxide poisoning?",
      "o": [
       "One person with a sunburn",
       "Several family members with headache, dizziness and an upset stomach at the same time",
       "A child with a scraped knee"
      ],
      "x": "CO symptoms are often called flu-like: headache, dizziness, weakness, upset stomach, vomiting, chest pain, confusion. Several people sick at once is a red flag."
     },
     "ht": {
      "q": "Kilès ki ka yon anpwazònman monoksid kabòn?",
      "o": [
       "Yon moun ki gen kout solèy",
       "Plizyè moun nan fanmi an ki gen tèt fè mal, tèt vire ak vant boulvèse an menm tan",
       "Yon timoun ki kale jenou l"
      ],
      "x": "Sentòm CO yo sanble ak grip: tèt fè mal, tèt vire, feblès, vant boulvèse, vomisman, doulè nan pwatrin, konfizyon. Plizyè moun malad an menm tan se yon gwo siy."
     },
     "a": 1
    },
    {
     "en": {
      "q": "Who is more likely to get sick from CO?",
      "o": [
       "Only healthy adults",
       "Infants, older adults, and people with heart disease, anemia or breathing problems",
       "Nobody, CO is harmless"
      ],
      "x": "Everyone is at risk, but infants, the elderly and people with chronic heart disease, anemia or breathing problems are more likely to get sick."
     },
     "ht": {
      "q": "Kiyès ki gen plis chans pou CO rann malad?",
      "o": [
       "Sèlman granmoun ki an sante",
       "Tibebe, granmoun aje, ak moun ki gen maladi kè, anemi oswa pwoblèm respirasyon",
       "Pèsonn, CO pa danjere"
      ],
      "x": "Tout moun gen risk, men tibebe, granmoun aje ak moun ki gen maladi kè kwonik, anemi oswa pwoblèm respirasyon gen plis chans pou tonbe malad."
     },
     "a": 1
    },
    {
     "en": {
      "q": "Why put CO alarms near bedrooms?",
      "o": [
       "It looks nicer",
       "Sleeping people can die from CO before they have symptoms",
       "CO only exists at night"
      ],
      "x": "People who are asleep can die from CO poisoning before they notice anything. The alarm is what wakes them."
     },
     "ht": {
      "q": "Poukisa pou mete alam CO toupre chanm yo?",
      "o": [
       "Li pi bèl",
       "Moun k ap dòmi ka mouri nan CO anvan yo gen sentòm",
       "CO egziste lannwit sèlman"
      ],
      "x": "Moun k ap dòmi ka mouri nan anpwazònman CO anvan yo remake anyen. Se alam lan ki reveye yo."
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
      "q": "2 a.m. The CO alarm goes off. Nobody feels sick. What do you do?",
      "o": [
       "Take the battery out, it's probably wrong",
       "Get everyone and the pets outside into fresh air, then call 911",
       "Open a window and go back to sleep"
      ],
      "x": "Treat every CO alarm as real. Get outside first, then call 911. Don't go back in until responders say it's safe."
     },
     "ht": {
      "q": "2 è nan maten. Alam CO a sonnen. Pèsonn pa santi l malad. Kisa ou fè?",
      "o": [
       "Retire pil la, li pwobableman twonpe l",
       "Fè tout moun ak bèt yo soti deyò nan bon lè, epi rele 911",
       "Louvri yon fenèt epi retounen dòmi"
      ],
      "x": "Konsidere chak alam CO kòm yon vrè alam. Soti deyò anvan, epi rele 911. Pa antre ankò jiskaske sekouris yo di li an sekirite."
     },
     "a": 1,
     "critical": true
    },
    {
     "en": {
      "q": "The radio says a chemical tank leaked nearby: shelter in place. What first?",
      "o": [
       "Go outside to see",
       "Bring everyone and pets inside, then close and lock all doors and windows",
       "Open windows for fresh air"
      ],
      "x": "Get inside fast. Locking doors and windows pulls them tighter for a better seal."
     },
     "ht": {
      "q": "Radyo a di yon tank pwodui chimik koule toupre: rete anndan. Kisa an premye?",
      "o": [
       "Soti deyò pou gade",
       "Fè tout moun ak bèt antre, epi fèmen e kadnase tout pòt ak fenèt",
       "Louvri fenèt pou bon lè"
      ],
      "x": "Antre vit. Lè ou fèmen pòt ak fenèt akle, yo sere pi byen."
     },
     "a": 1
    },
    {
     "en": {
      "q": "What do you do with fans, heating and air conditioning?",
      "o": [
       "Turn them all off",
       "Turn the AC to maximum",
       "Leave them as they are"
      ],
      "x": "Turn off fans, heat and AC so outside air isn't pulled in. Close the fireplace damper too."
     },
     "ht": {
      "q": "Kisa ou fè ak vantilatè, chofaj ak klimatizasyon?",
      "o": [
       "Etenn yo tout",
       "Mete klimatizasyon an nan maksimòm",
       "Kite yo jan yo ye"
      ],
      "x": "Etenn vantilatè, chofaj ak klimatizasyon pou lè deyò pa antre. Fèmen chemine a tou."
     },
     "a": 0,
     "critical": true
    },
    {
     "en": {
      "q": "Which room do you shelter in?",
      "o": [
       "The basement",
       "An interior room with few or no windows, above ground level",
       "The room with the most windows"
      ],
      "x": "Pick an interior room above ground. Some chemicals are heavier than air and can seep into basements even with windows closed."
     },
     "ht": {
      "q": "Nan ki chanm ou rete pou abri?",
      "o": [
       "Sousòl la",
       "Yon chanm anndan ki gen kèk fenèt oswa okenn, pi wo pase nivo atè a",
       "Chanm ki gen plis fenèt la"
      ],
      "x": "Chwazi yon chanm anndan ki pi wo pase atè. Kèk pwodui chimik pi lou pase lè a epi yo ka antre nan sousòl menm ak fenèt fèmen."
     },
     "a": 1
    },
    {
     "en": {
      "q": "When can you leave the shelter and open up the house?",
      "o": [
       "As soon as the smell is gone",
       "When officials say it's safe; then open windows and turn on fans to air it out",
       "After one hour, no matter what"
      ],
      "x": "Wait for officials. Once they give the all-clear, ventilate the house."
     },
     "ht": {
      "q": "Kilè ou ka soti nan abri a epi louvri kay la?",
      "o": [
       "Depi ou pa santi odè a ankò",
       "Lè otorite yo di li an sekirite; apre sa louvri fenèt epi limen vantilatè pou bay kay la lè",
       "Apre inèdtan, kèlkeswa sa k rive"
      ],
      "x": "Tann otorite yo. Lè yo di tout bagay anfòm, bay kay la lè."
     },
     "a": 1
    }
   ],
   "scene": {
    "en": "☣️ CO alarm, then a chemical leak",
    "ht": "☣️ Alam CO, epi pwodui chimik ki koule"
   }
  }
 ],
 "check": {
  "en": [
   "Battery or battery-backup CO alarms near every sleeping area",
   "Test alarms and change batteries when you change the clocks",
   "Generators and grills outside only, 20+ ft from windows, doors and vents",
   "Never heat the house with a gas oven or burn charcoal indoors",
   "Know CO symptoms: headache, dizziness, nausea, confusion, often in several people at once",
   "CO alarm sounds: get outside first, then call 911",
   "Shelter-in-place room picked: interior, few windows, above ground",
   "Duct tape, plastic sheeting and a battery or crank radio in that room",
   "Shelter in place: close and lock doors and windows, turn off fans, heat and AC"
  ],
  "ht": [
   "Alam CO ak pil oswa pil sekou toupre chak kote moun dòmi",
   "Teste alam yo epi chanje pil lè ou chanje lè revèy yo",
   "Jeneratè ak griy deyò sèlman, 20+ pye lwen fenèt, pòt ak vantilasyon",
   "Pa janm chofe kay la ak fou gaz ni boule chabon anndan",
   "Konnen sentòm CO: tèt fè mal, tèt vire, kè plen, konfizyon, souvan nan plizyè moun an menm tan",
   "Alam CO sonnen: soti deyò anvan, epi rele 911",
   "Chanm abri chwazi: anndan, kèk fenèt, pi wo pase atè",
   "Tep, fèy plastik ak yon radyo ak pil oswa manivèl nan chanm sa a",
   "Rete anndan: fèmen e kadnase pòt ak fenèt, etenn vantilatè, chofaj ak klimatizasyon"
  ]
 },
 "sources": [
  [
   "CDC · Carbon Monoxide Poisoning Basics",
   "https://www.cdc.gov/carbon-monoxide/about/index.html"
  ],
  [
   "CDC · CO FAQs",
   "https://www.cdc.gov/co/faqs.htm"
  ],
  [
   "Ready.gov · Chemicals and hazardous materials incidents",
   "https://ready.gov/hazmat"
  ]
 ]
};
