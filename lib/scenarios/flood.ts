// Content drafted from official sources; pending review by Dr. Jhon Evenst Douyon, MD, MPH. Safety-critical: change only with review.
import type { Scenario } from "./types";

const T = (en: string, ht: string) => ({ en, ht });

export const flood: Scenario = {
  id: "flood",
  emoji: "🌊",
  title: T("Scenario: River Flood", "Senaryo: Inondasyon Rivyè"),
  briefing: [
    T("It has rained for three days. The river behind your neighborhood is rising fast.",
      "Lapli ap tonbe depi twa jou. Rivyè ki dèyè katye ou a ap monte vit."),
    T("Your family of five, with the baby and Grandma, lives in a two-story house with a basement. Your aunt lives in the country and uses a private well.",
      "Fanmi ou senk moun, ak tibebe a ak Grann, rete nan yon kay de etaj ki gen yon sousòl. Matant ou rete andeyò epi li sèvi ak yon pi prive."),
    T("Floods kill fast, and the danger keeps going after the water goes down. Watch your meters: power, food and safety.",
      "Inondasyon touye vit, epi danje a kontinye menm apre dlo a fin bese. Siveye mezi ou yo: kouran, manje ak sekirite."),
  ],
  events: [
    {
      time: T("Day 1 · 7:00 p.m. · Flood watch", "Jou 1 · 7:00 diswa · Siveyans inondasyon"), room: "security",
      text: T("A flood watch is issued for your area. What do you do tonight?",
        "Otorite yo pibliye yon siveyans inondasyon pou zòn ou an. Kisa ou fè aswè a?"),
      choices: [
        { text: T("Pack the go-bag, put papers and medicines in waterproof bags upstairs, charge phones and power banks, and plan your route to higher ground", "Pare sak ijans lan, mete papye ak medikaman nan sache ki pa pran dlo anwo, chaje telefòn ak batri pòtab, epi planifye wout pou monte sou tè ki pi wo"), outcome: "best", effects: { power: 10 },
          why: T("A watch means be prepared. Floods can rise in minutes, so get ready while it's still calm.", "Yon siveyans vle di pare. Dlo ka monte nan kèk minit, kidonk prepare pandan li toujou kalm.") },
        { text: T("Go to bed and deal with it if a warning comes", "Al dòmi epi wè sa lè yon alèt rive"), outcome: "poor", effects: { safety: -15, power: -10 },
          why: T("A warning means flooding is happening or about to. By then there may be no time to pack or plan.", "Yon alèt vle di inondasyon an ap fèt oswa prèt pou fèt. Lè sa a, ou ka pa gen tan pou pare anyen.") },
      ],
    },
    {
      time: T("Day 1 · 11:30 p.m. · Flash flood warning", "Jou 1 · 11:30 diswa · Alèt inondasyon brid sou kou"), room: "energy",
      text: T("Water is pouring into the basement. The electrical panel is down there, and the floor is already covered.",
        "Dlo ap antre nan sousòl la. Panno elektrik la anba a, epi atè a deja kouvri ak dlo."),
      choices: [
        { text: T("Stay out of the basement. Move everyone upstairs and call the power company", "Pa desann nan sousòl la. Fè tout moun monte anwo epi rele konpayi elektrisite a"), outcome: "best",
          why: T("Turn off power only if you can do it without touching water. Never touch electrical equipment while wet or standing in water.", "Etenn kouran an sèlman si ou ka fè l san ou pa touche dlo. Pa janm touche aparèy elektrik lè ou mouye oswa lè w kanpe nan dlo.") },
        { text: T("Wade in quickly and flip the main breaker", "Antre vit nan dlo a epi etenn gwo disjonktè a"), outcome: "unsafe", effects: { safety: -60 },
          why: T("Water around live wiring can electrocute you before you reach the panel.", "Dlo bò fil ki gen kouran ka elektwokite ou anvan ou rive nan panno a.") },
      ],
    },
    {
      time: T("Day 2 · 1:00 a.m.", "Jou 2 · 1:00 dimaten"), room: "security",
      text: T("Water is rising on the ground floor. The street is a river; you can't drive or walk out. Where do you go?",
        "Dlo ap monte nan premye etaj la. Lari a tounen yon rivyè; ou pa ka soti ni ak machin ni a pye. Ki kote ou ale?"),
      choices: [
        { text: T("The highest floor, with phones, flashlight and a whistle. Call 911. Go on the roof only if you must, and signal for help", "Etaj ki pi wo a, ak telefòn, flach ak yon sifle. Rele 911. Monte sou do kay la sèlman si ou oblije, epi fè siyal pou yo vin ede ou"), outcome: "best",
          why: T("Get to the highest level with a way out, and let rescuers know where you are.", "Monte nan nivo ki pi wo a ki gen yon fason pou soti, epi fè sekouris yo konnen kote ou ye.") },
        { text: T("Climb into the closed attic", "Monte nan grenye ki fèmen an"), outcome: "unsafe", effects: { safety: -60 },
          why: T("Never climb into a closed attic. Rising water can trap you there with no way out.", "Pa janm monte nan yon grenye fèmen. Dlo k ap monte ka kwense ou la san okenn fason pou soti.") },
        { text: T("Stay downstairs and stack furniture to stand on", "Rete anba epi anpile mèb pou kanpe sou yo"), outcome: "poor", effects: { safety: -25 },
          why: T("Flash floods can rise faster than you think. Move up while you still can.", "Inondasyon brid sou kou ka monte pi vit pase sa ou panse. Monte pandan ou toujou kapab.") },
      ],
    },
    {
      time: T("Day 2 · 2:00 p.m.", "Jou 2 · 2:00 apremidi"), room: "medical",
      text: T("The water is going down. The kids want to splash in the floodwater in the street.",
        "Dlo a ap bese. Timoun yo vle jwe nan dlo inondasyon an nan lari a."),
      choices: [
        { text: T("Keep them out. If anyone touches floodwater, wash with soap and clean water right away", "Kenbe yo lwen. Si yon moun touche dlo inondasyon, lave ak savon ak dlo pwòp touswit"), outcome: "best",
          why: T("Floodwater can carry sewage, chemicals, sharp debris and animals. It causes wound infections, rashes and stomach illness.", "Dlo inondasyon ka pote dlo egou, pwodui chimik, debri file ak bèt. Li bay enfeksyon nan blesi, gratèl ak maladi vant.") },
        { text: T("Let them play; the water is calm now", "Kite yo jwe; dlo a kalm kounye a"), outcome: "unsafe", effects: { safety: -40 },
          why: T("Calm floodwater is still contaminated and can hide holes, glass and live wires. Children should never play in it.", "Dlo inondasyon ki kalm toujou kontamine epi li ka kache twou, vè ak fil kouran. Timoun pa dwe janm jwe ladan l.") },
      ],
    },
    {
      time: T("Day 3 · 9:00 a.m.", "Jou 3 · 9:00 dimaten"), room: "security",
      text: T("You're staying with friends. Officials still say not to return. A neighbor already went back and says it's fine.",
        "Ou rete lakay zanmi. Otorite yo toujou di pa retounen. Yon vwazen deja tounen epi li di tout bagay anfòm."),
      choices: [
        { text: T("Wait until officials say it's safe to return", "Tann otorite yo di li an sekirite pou retounen"), outcome: "best",
          why: T("Flooded homes can hide structural damage, electrical hazards, gas leaks and snakes. Officials check before people return.", "Kay ki te inonde ka kache dega nan estrikti, danje elektrik, fwit gaz ak koulèv. Otorite yo tcheke anvan moun retounen.") },
        { text: T("Go back now; the neighbor says it's fine", "Retounen kounye a; vwazen an di li anfòm"), outcome: "unsafe", effects: { safety: -40 },
          why: T("One neighbor's luck doesn't make your house safe. Wait for the all-clear.", "Chans yon vwazen pa fè kay ou an sekirite. Tann otorite yo bay siyal la.") },
      ],
    },
    {
      time: T("Day 4 · 10:00 a.m.", "Jou 4 · 10:00 dimaten"), room: "air",
      text: T("You're allowed home. At the front door you smell rotten eggs, the smell of a gas leak.",
        "Yo kite ou retounen lakay ou. Devan pòt la ou santi yon odè ze pouri, odè yon fwit gaz."),
      choices: [
        { text: T("Don't go in. Move away from the house and call the gas company or 911 from there", "Pa antre. Ale lwen kay la epi rele konpayi gaz la oswa 911 depi la"), outcome: "best",
          why: T("Gas can explode from a single spark. Don't switch lights, light a match or use a phone near the house.", "Gaz ka eksploze ak yon sèl etensèl. Pa limen limyè, pa limen alimèt, pa sèvi ak telefòn toupre kay la.") },
        { text: T("Go in and find the leak with a lighter", "Antre epi chèche fwit la ak yon brikè"), outcome: "unsafe", effects: { safety: -70 },
          why: T("An open flame in a gas-filled house can cause an explosion. Leave and call for help.", "Yon flanm nan yon kay ki plen gaz ka fè eksplozyon. Soti epi rele pou èd.") },
        { text: T("Go in and switch on the lights to look", "Antre epi limen limyè yo pou gade"), outcome: "unsafe", effects: { safety: -60 },
          why: T("Even a light switch can spark. Stay out until the gas company says it's safe.", "Menm yon switch limyè ka fè etensèl. Rete deyò jiskaske konpayi gaz la di li an sekirite.") },
      ],
    },
    {
      time: T("Day 4 · 2:00 p.m.", "Jou 4 · 2:00 apremidi"), room: "food",
      text: T("Floodwater reached the pantry. There are metal cans, jars with screw caps, cardboard boxes of baby formula and bags of rice.",
        "Dlo inondasyon an te rive nan depo manje a. Gen bwat metal, bokal ak kouvèti vise, bwat katon lèt tibebe ak sak diri."),
      choices: [
        { text: T("Throw out everything the water touched, except undamaged factory metal cans. Remove their labels, wash and sanitize them", "Jete tout sa dlo a touche, eksepte bwat metal faktori ki pa domaje. Retire etikèt yo, lave yo epi dezenfekte yo"), outcome: "best", effects: { food: -15 },
          why: T("Screw caps, cardboard and bags can't be cleaned. Only undamaged commercial metal cans and pouches can be saved.", "Kouvèti vise, katon ak sak pa ka netwaye. Se sèlman bwat metal ak sachè faktori ki pa domaje ou ka sove.") },
        { text: T("Keep anything that's still sealed, like the jars and formula boxes", "Kenbe tout sa ki toujou fèmen, tankou bokal yo ak bwat lèt yo"), outcome: "unsafe", effects: { safety: -40 },
          why: T("Floodwater seeps under screw caps and into cardboard. Contaminated formula is especially dangerous for a baby.", "Dlo inondasyon antre anba kouvèti vise ak nan katon. Lèt ki kontamine danjere anpil pou yon tibebe.") },
        { text: T("Throw out everything, cans included", "Jete tout bagay, ak bwat metal yo tou"), outcome: "poor", effects: { food: -30 },
          why: T("Safe, but wasteful. Undamaged commercial metal cans can be washed and sanitized.", "Li san danje, men se gaspiyaj. Bwat metal faktori ki pa domaje ka lave epi dezenfekte.") },
      ],
    },
    {
      time: T("Day 4 · 5:00 p.m.", "Jou 4 · 5:00 diswa"), room: "water",
      text: T("Your aunt calls. Floodwater covered her well. The water from the tap looks clear.",
        "Matant ou rele. Dlo inondasyon te kouvri pi li a. Dlo ki soti nan tiyo a sanble klè."),
      choices: [
        { text: T("Use bottled water, or water boiled for 1 minute, until the well is disinfected and tested", "Sèvi ak dlo nan boutèy, oswa dlo ki bouyi 1 minit, jiskaske yo dezenfekte pi a epi teste l"), outcome: "best",
          why: T("A flooded well may be contaminated even if the water looks clear. Don't drink it until it's disinfected and tested.", "Yon pi ki te inonde ka kontamine menm si dlo a sanble klè. Pa bwè l jiskaske yo dezenfekte l epi teste l.") },
        { text: T("It looks clear, so it's fine to drink", "Li sanble klè, kidonk li bon pou bwè"), outcome: "unsafe", effects: { safety: -40 },
          why: T("Germs from floodwater can't be seen. Clear water can still make you very sick.", "Ou pa ka wè mikwòb ki soti nan dlo inondasyon. Dlo klè ka toujou rann ou malad anpil.") },
      ],
    },
    {
      time: T("Day 5 · 9:00 a.m.", "Jou 5 · 9:00 dimaten"), room: "air",
      text: T("Dark, musty spots are growing on the wet walls. Your cousin plans to mix bleach with an ammonia cleaner to make it stronger.",
        "Tach nwa ki gen move odè ap grandi sou mi ki mouye yo. Kouzen ou vle melanje klowòks ak yon pwodui netwayaj ki gen amonyak pou l pi fò."),
      choices: [
        { text: T("No mixing. Wear gloves, goggles and an N95 mask, open windows, remove wet items that can't dry, and clean with detergent or a weak bleach solution", "Pa melanje. Mete gan, linèt pwoteksyon ak mask N95, louvri fenèt, retire bagay mouye ki pa ka seche, epi netwaye ak detèjan oswa yon ti solisyon klowòks"), outcome: "best",
          why: T("Dry the house within 24 to 48 hours if you can. Use no more than 1 cup of bleach per gallon of water.", "Seche kay la nan 24 a 48 èdtan si ou kapab. Pa mete plis pase 1 tas klowòks pou chak galon dlo.") },
        { text: T("Mix them; stronger is better", "Melanje yo; pi fò pi bon"), outcome: "unsafe", effects: { safety: -60 },
          why: T("Bleach mixed with ammonia makes toxic gas that can badly hurt your lungs. Never mix cleaners.", "Klowòks melanje ak amonyak bay yon gaz toksik ki ka fè poumon ou mal anpil. Pa janm melanje pwodui netwayaj.") },
        { text: T("Paint over the spots", "Pentire sou tach yo"), outcome: "poor", effects: { safety: -15 },
          why: T("Paint doesn't stop mold. Dry the area, remove the mold, then repair.", "Penti pa rete kanpiyon. Seche kote a, retire kanpiyon an, apre sa repare.") },
      ],
    },
    {
      time: T("Day 5 · 4:00 p.m.", "Jou 5 · 4:00 apremidi"), room: "energy",
      text: T("Power is back on the street. The basement outlets and the washing machine were underwater.",
        "Kouran tounen nan lari a. Priz ak machin pou lave rad nan sousòl la te anba dlo."),
      choices: [
        { text: T("Keep the basement power off and have an electrician check the wiring and appliances before use", "Kenbe kouran sousòl la etenn epi fè yon elektrisyen tcheke fil ak aparèy yo anvan ou sèvi ak yo"), outcome: "best",
          why: T("Water damages wiring and appliances in ways you can't see. They can shock or start a fire.", "Dlo domaje fil ak aparèy nan fason ou pa ka wè. Yo ka bay chòk oswa mete dife.") },
        { text: T("Plug the washer in to see if it still works", "Ploge machin lan pou wè si l toujou mache"), outcome: "unsafe", effects: { safety: -50 },
          why: T("A flooded appliance can electrocute you or start a fire. Let an electrician check it first.", "Yon aparèy ki te anba dlo ka elektwokite ou oswa mete dife. Kite yon elektrisyen tcheke l anvan.") },
      ],
    },
  ],
  sources: [
    ["Ready.gov · Floods", "https://www.ready.gov/floods"],
    ["Mass.gov · Flood safety tips (watch vs. warning)", "https://www.mass.gov/service-details/flood-safety-tips"],
    ["CDC · Floodwater after a disaster", "https://cdc.gov/floods/safety/floodwater-after-a-disaster-or-emergency-safety.html"],
    ["FDA · Floods: food and water safety", "https://www.fda.gov/Food/RecallsOutbreaksEmergencies/Emergencies/ucm077029.htm"],
    ["CDC · How to disinfect wells after an emergency", "https://www.cdc.gov/water-emergency/about/how-to-disinfect-wells-after-an-emergency.html"],
    ["CDC · Mold cleanup after a flood", "https://www.cdc.gov/mold/cleanup-guide.html"],
    ["CDC · Cleaning safely after a disaster", "https://www.cdc.gov/DISASTERS/CLEANUP/FACTS.HTML"],
  ],
};
