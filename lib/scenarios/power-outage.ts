// Content drafted from official sources; pending review by Dr. Jhon Evenst Douyon, MD, MPH. Safety-critical: change only with review.
import type { Scenario } from "./types";

const T = (en: string, ht: string) => ({ en, ht });

export const powerOutage: Scenario = {
  id: "power-outage",
  emoji: "⚡",
  title: T("Scenario: 3-Day Power Outage", "Senaryo: Koupi Kouran 3 Jou"),
  briefing: [
    T("A strong storm hits at 7 p.m. The whole neighborhood loses power. Crews say it could take three days.",
      "Yon gwo tanpèt frape a 7è diswa. Tout katye a pèdi kouran. Ekip yo di sa ka pran twa jou."),
    T("Your family of five, including a baby and Grandma, depends on your decisions. Watch your three meters: power, food and safety.",
      "Fanmi ou senk moun, ak yon tibebe ak Grann, depann de desizyon ou. Siveye twa mezi ou yo: kouran, manje ak sekirite."),
    T("Every choice uses something you learned in the six rooms. Unsafe choices are critical errors.",
      "Chak chwa sèvi ak yon bagay ou te aprann nan sis chanm yo. Chwa ki danjere se erè grav."),
  ],
  events: [
    {
      time: T("Day 1 · 7:05 p.m.", "Jou 1 · 7:05 diswa"), room: "energy",
      text: T("The lights go out. It's dark and the kids are scared. How do you light the house?", "Limyè yo etenn. Fè nwa epi timoun yo pè. Kijan ou klere kay la?"),
      choices: [
        { text: T("Flashlights and battery lanterns", "Flach ak lanp ak pil"), outcome: "best",
          why: T("Safe light that can't tip over and start a fire.", "Limyè san danje ki pa ka tonbe epi mete dife.") },
        { text: T("Candles in every room", "Bouji nan chak chanm"), outcome: "poor", effects: { safety: -20 },
          why: T("Candles start fires during blackouts, especially with kids around. Use flashlights.", "Bouji konn mete dife pandan blakawout, sitou ak timoun bò kote. Sèvi ak flach.") },
        { text: T("Everyone uses their phone flashlight", "Tout moun sèvi ak flach telefòn yo"), outcome: "poor", effects: { power: -30 },
          why: T("It works, but drains the phones you'll need to call for help and get alerts.", "Li mache, men li vide telefòn ou pral bezwen pou rele èd epi resevwa alèt.") },
      ],
    },
    {
      time: T("Day 1 · 7:20 p.m.", "Jou 1 · 7:20 diswa"), room: "energy",
      text: T("What do you do with the TV, computer and other major appliances?", "Kisa ou fè ak televizyon, òdinatè ak lòt gwo aparèy yo?"),
      choices: [
        { text: T("Turn them off or unplug them, and leave one light switched on", "Etenn oswa dekonekte yo, epi kite yon sèl limyè limen"), outcome: "best",
          why: T("This protects them from the surge when power returns, and the one light tells you when it's back.", "Sa pwoteje yo kont kou kouran lè l tounen, epi limyè a ap di ou lè l tounen.") },
        { text: T("Leave everything as it is", "Kite tout bagay jan yo ye"), outcome: "poor", effects: { power: -10 },
          why: T("The surge when power comes back can damage appliances and electronics.", "Kou kouran lè l tounen ka domaje aparèy ak elektwonik yo.") },
      ],
    },
    {
      time: T("Day 1 · 8:00 p.m.", "Jou 1 · 8:00 diswa"), room: "food",
      text: T("Your teenager keeps opening the fridge \"to check if it's still cold.\"", "Adolesan ou a ap louvri frijidè a tout tan \"pou wè si l toujou frèt.\""),
      choices: [
        { text: T("Keep the fridge and freezer doors closed", "Kenbe pòt frijidè ak frizè a fèmen"), outcome: "best",
          why: T("A closed fridge keeps food safe about 4 hours; a full freezer about 48. Every opening lets the cold out.", "Yon frijidè fèmen kenbe manje an sekirite apeprè 4 èdtan; yon frizè plen apeprè 48. Chak fwa ou louvri, frèt la soti.") },
        { text: T("Let them check every hour", "Kite l tcheke chak èdtan"), outcome: "poor", effects: { food: -25 },
          why: T("Each opening shortens how long the food stays safe.", "Chak fwa ou louvri, manje a rete an sekirite mwens tan.") },
      ],
    },
    {
      time: T("Day 1 · 9:30 p.m.", "Jou 1 · 9:30 diswa"), room: "energy",
      text: T("Your phone is at 40%. How do you stay informed through the night?", "Telefòn ou a 40%. Kijan ou rete enfòme pandan nwit lan?"),
      choices: [
        { text: T("Battery radio for news; charge the phone from a power bank and save it for calls", "Radyo ak pil pou nouvèl; chaje telefòn nan ak batri pòtab epi sere l pou apèl"), outcome: "best", effects: { power: 10 },
          why: T("The radio gives official updates without draining the phone you need for emergencies.", "Radyo a bay nouvèl ofisyèl san li vide telefòn ou bezwen pou ijans.") },
        { text: T("Stream videos to keep the kids calm", "Gade videyo pou kalme timoun yo"), outcome: "poor", effects: { power: -35 },
          why: T("Streaming empties the battery fast. You may not be able to call for help later.", "Videyo vide batri a vit. Ou ka pa ka rele èd pita.") },
      ],
    },
    {
      time: T("Day 1 · 11:00 p.m.", "Jou 1 · 11:00 diswa"), room: "air",
      text: T("A neighbor lends you a portable generator. It's raining hard. Where do you run it?", "Yon vwazen prete ou yon jeneratè pòtab. Lapli ap tonbe fò. Ki kote ou fè l mache?"),
      choices: [
        { text: T("Outside, more than 20 feet from windows, doors and vents", "Deyò, plis pase 20 pye lwen fenèt, pòt ak vantilasyon"), outcome: "best",
          why: T("Exhaust stays outside. Keep it dry under an open canopy, never inside.", "Lafimen an rete deyò. Kenbe l sèk anba yon tant louvri, pa janm anndan.") },
        { text: T("In the garage with the door open, out of the rain", "Nan garaj la ak pòt louvri, lwen lapli"), outcome: "unsafe", effects: { safety: -60 },
          why: T("Never run a generator in a garage, even with the door open. Carbon monoxide can kill in minutes.", "Pa janm fè jeneratè mache nan garaj, menm ak pòt louvri. Monoksid kabòn ka touye nan kèk minit.") },
        { text: T("On the porch, right under a window", "Sou galri a, anba yon fenèt"), outcome: "unsafe", effects: { safety: -50 },
          why: T("Exhaust under a window drifts into the house while people sleep.", "Lafimen anba yon fenèt antre nan kay la pandan moun ap dòmi.") },
      ],
    },
    {
      time: T("Day 2 · 7:00 a.m.", "Jou 2 · 7:00 dimaten"), room: "energy",
      text: T("Your cousin says: \"Just plug the generator into the dryer outlet and the whole house gets power.\"", "Kouzen ou di: \"Annik ploge jeneratè a nan priz machin seche a epi tout kay la ap gen kouran.\""),
      choices: [
        { text: T("No. Plug the fridge and Grandma's oxygen machine straight into the generator with outdoor cords", "Non. Ploge frijidè a ak machin oksijèn Grann dirèkteman nan jeneratè a ak rallonj pou deyò"), outcome: "best", effects: { food: 15 },
          why: T("Without a transfer switch, a generator can backfeed the lines and electrocute line workers or neighbors.", "San switch transfè, yon jeneratè ka voye kouran nan fil yo epi elektwokite travayè oswa vwazen.") },
        { text: T("Do it, it's faster", "Fè l, li pi vit"), outcome: "unsafe", effects: { safety: -60 },
          why: T("Backfeeding through a wall outlet can kill utility workers repairing the lines. Never do it.", "Voye kouran pa yon priz miray ka touye travayè k ap repare fil yo. Pa janm fè l.") },
      ],
    },
    {
      time: T("Day 2 · 8:00 a.m.", "Jou 2 · 8:00 dimaten"), room: "food",
      text: T("The fridge was without power for 12 hours before the generator. The chicken smells fine. Grandma says to cook it.", "Frijidè a te san kouran pandan 12 èdtan anvan jeneratè a. Poul la pa gen move odè. Grann di pou kwit li."),
      choices: [
        { text: T("Throw it out. Perishable food is unsafe after 4 hours without power", "Jete l. Manje ki ka gate pa an sekirite apre 4 èdtan san kouran"), outcome: "best",
          why: T("Food poisoning germs usually don't change the smell. Never taste to check. When in doubt, throw it out.", "Mikwòb entoksikasyon pa chanje odè pifò tan. Pa janm goute pou tcheke. Si ou gen dout, jete l.") },
        { text: T("Cook it well; heat kills everything", "Kwit li byen; chalè touye tout bagay"), outcome: "unsafe", effects: { food: -40, safety: -30 },
          why: T("Cooking doesn't make spoiled perishable food safe. A baby and an older adult are at extra risk.", "Kwit pa fè manje ki gate vin san danje. Yon tibebe ak yon granmoun aje gen plis risk.") },
        { text: T("Taste a small piece first", "Goute yon ti moso anvan"), outcome: "unsafe", effects: { safety: -30 },
          why: T("Never taste food to decide if it's safe.", "Pa janm goute manje pou deside si l an sekirite.") },
      ],
    },
    {
      time: T("Day 2 · 3:00 p.m.", "Jou 2 · 3:00 apremidi"), room: "energy",
      text: T("A power line is down across the sidewalk. It isn't sparking. The kids want to look.", "Yon fil kouran tonbe atravè twotwa a. Li pa fè etensèl. Timoun yo vle gade."),
      choices: [
        { text: T("Keep everyone far away and call the power company or 911", "Kenbe tout moun byen lwen epi rele konpayi elektrisite a oswa 911"), outcome: "best",
          why: T("Downed lines can be live even when silent, and can energize the ground around them.", "Fil ki tonbe ka gen kouran menm lè yo pa fè bwi, epi yo ka mete kouran nan tè a bò kote yo.") },
        { text: T("It's not sparking, so it's dead. Let them look", "Li pa fè etensèl, kidonk li mouri. Kite yo gade"), outcome: "unsafe", effects: { safety: -60 },
          why: T("Never assume a fallen line is safe because it's quiet.", "Pa janm kwè yon fil ki tonbe pa danjere paske l pa fè bwi.") },
      ],
    },
    {
      time: T("Day 3 · 2:00 a.m.", "Jou 3 · 2:00 dimaten"), room: "air",
      text: T("The CO alarm goes off. Nobody feels sick. Everyone is exhausted.", "Alam CO a sonnen. Pèsonn pa santi l malad. Tout moun bouke."),
      choices: [
        { text: T("Get everyone and the pets outside into fresh air, then call 911", "Fè tout moun ak bèt yo soti deyò nan bon lè, epi rele 911"), outcome: "best",
          why: T("Treat every CO alarm as real. Sleeping people can die before they notice symptoms.", "Konsidere chak alam CO kòm vrè. Moun k ap dòmi ka mouri anvan yo remake sentòm.") },
        { text: T("Take the battery out so everyone can sleep", "Retire pil la pou tout moun ka dòmi"), outcome: "unsafe", effects: { safety: -70 },
          why: T("This is exactly how families die in blackouts. Never silence a CO alarm without getting out first.", "Se konsa fanmi mouri nan blakawout. Pa janm fè yon alam CO fè silans san ou pa soti anvan.") },
        { text: T("Open one window and go back to bed", "Louvri yon fenèt epi retounen nan kabann"), outcome: "unsafe", effects: { safety: -50 },
          why: T("One open window isn't enough. Get outside and call 911.", "Yon fenèt louvri pa ase. Soti deyò epi rele 911.") },
      ],
    },
    {
      time: T("Day 3 · 10:00 a.m.", "Jou 3 · 10:00 dimaten"), room: "food",
      text: T("Power is back. The freezer was full and you kept it closed. The meat inside still has ice crystals.", "Kouran tounen. Frizè a te plen epi ou te kenbe l fèmen. Vyann anndan an toujou gen kristal glas."),
      choices: [
        { text: T("It can be refrozen or cooked. Check each item with the thermometer", "Ou ka refrize l oswa kwit li. Tcheke chak bagay ak tèmomèt la"), outcome: "best", effects: { food: 20 },
          why: T("Thawed frozen food that still has ice crystals, or is at 40°F (4°C) or below, can be safely refrozen or cooked.", "Manje glase ki fonn men ki toujou gen kristal glas, oswa ki 40°F (4°C) oswa mwens, ka refrize oswa kwit san danje.") },
        { text: T("Throw out everything in the freezer", "Jete tout sa ki nan frizè a"), outcome: "poor", effects: { food: -20 },
          why: T("Safe, but wasteful. A full, closed freezer holds about 48 hours, and ice crystals mean the food stayed cold.", "Li san danje, men se gaspiyaj. Yon frizè plen e fèmen kenbe apeprè 48 èdtan, epi kristal glas vle di manje a te rete frèt.") },
      ],
    },
  ],
  sources: [
    ["CDC · Carbon Monoxide Poisoning Basics", "https://www.cdc.gov/carbon-monoxide/about/index.html"],
    ["CDC · Keep food safe after a disaster", "https://www.cdc.gov/food-safety/foods/keep-food-safe-after-emergency.html"],
    ["CDC · Worker safety in a power outage (backfeed)", "https://archive.cdc.gov/www_cdc_gov/disasters/poweroutage/workersafety.html"],
    ["OSHA · Downed electrical wires", "https://www.osha.gov/sites/default/files/downed_electrical_wires.pdf"],
  ],
};
