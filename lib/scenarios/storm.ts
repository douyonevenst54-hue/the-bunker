// Content drafted from official sources; pending review by Dr. Jhon Evenst Douyon, MD, MPH. Safety-critical: change only with review.
import type { Scenario } from "./types";

const T = (en: string, ht: string) => ({ en, ht });

export const storm: Scenario = {
  id: "storm",
  emoji: "🌀",
  title: T("Scenario: Hurricane Warning", "Senaryo: Alèt Siklòn"),
  briefing: [
    T("A hurricane is heading for your coast. Forecasters expect it in about two days.",
      "Yon siklòn ap vin sou kòt ou a. Espesyalis meteyo yo di l ap rive nan apeprè de jou."),
    T("Your home is outside the evacuation zone. Your family of five, with the baby and Grandma, will ride out the storm there. Your sister lives near the water.",
      "Kay ou pa nan zòn evakyasyon an. Fanmi ou senk moun, ak tibebe a ak Grann, pral pase siklòn nan la. Sè ou rete toupre lanmè a."),
    T("Before, during and after the storm, every choice counts. Watch your meters: power, food and safety.",
      "Anvan, pandan ak apre siklòn nan, chak chwa konte. Siveye mezi ou yo: kouran, manje ak sekirite."),
  ],
  events: [
    {
      time: T("Day 1 · 9:00 a.m. · Hurricane watch", "Jou 1 · 9:00 dimaten · Siveyans siklòn"), room: "medical",
      text: T("A hurricane watch is issued. Grandma has only three days of her heart medicine left. What do you do first?",
        "Otorite yo pibliye yon siveyans siklòn. Grann gen sèlman twa jou medikaman kè l ki rete. Kisa ou fè an premye?"),
      choices: [
        { text: T("Call the pharmacy for an early refill, and pack her medicine in a waterproof bag with the kit", "Rele famasi a pou renouvle l davans, epi mete medikaman l nan yon sache ki pa pran dlo ak twous la"), outcome: "best",
          why: T("Refill medicines before the storm. Pharmacies may close and roads may be unsafe for days.", "Renouvle medikaman anvan siklòn nan. Famasi ka fèmen epi wout yo ka danjere pandan plizyè jou.") },
        { text: T("Wait for the warning; the storm may turn away", "Tann alèt la; siklòn nan ka chanje direksyon"), outcome: "poor", effects: { safety: -15 },
          why: T("By the warning, stores are crowded and time is short. A watch is the moment to finish preparing.", "Lè alèt la soti, magazen yo plen moun epi tan an kout. Siveyans lan se moman pou fin prepare.") },
      ],
    },
    {
      time: T("Day 1 · 2:00 p.m.", "Jou 1 · 2:00 apremidi"), room: "security",
      text: T("Your neighbor is taping big X's on his windows and tells you to do the same.",
        "Vwazen ou ap kole gwo X ak tep sou fenèt li yo epi li di ou fè menm bagay la."),
      choices: [
        { text: T("Close storm shutters or put up cut plywood, and bring loose outdoor items inside", "Fèmen kontravan siklòn yo oswa kloure planch kontreplake, epi rantre tout bagay ki lage deyò yo"), outcome: "best",
          why: T("Shutters and plywood protect windows. Loose outdoor items become flying debris.", "Kontravan ak planch pwoteje fenèt yo. Bagay ki lage deyò vin tounen pwojektil nan van an.") },
        { text: T("Tape the windows like the neighbor", "Kole tep sou fenèt yo tankou vwazen an"), outcome: "poor", effects: { safety: -15 },
          why: T("Tape does not stop glass from breaking and can make bigger, more dangerous pieces. It wastes time you need.", "Tep pa anpeche vit kase epi li ka fè pi gwo moso ki pi danjere. Li fè ou pèdi tan ou bezwen.") },
        { text: T("Plan to crack the windows open during the storm to balance the pressure", "Planifye pou louvri fenèt yo yon ti kras pandan siklòn nan pou balanse presyon an"), outcome: "poor", effects: { safety: -15 },
          why: T("This is a myth. Open windows let wind and rain in and cause more damage. Keep them closed.", "Se yon fo kwayans. Fenèt louvri kite van ak lapli antre epi fè plis dega. Kenbe yo fèmen.") },
      ],
    },
    {
      time: T("Day 1 · 6:00 p.m.", "Jou 1 · 6:00 diswa"), room: "water",
      text: T("Officials warn the water system may fail. How do you prepare water?",
        "Otorite yo avèti sistèm dlo a ka tonbe an pàn. Kijan ou prepare dlo?"),
      choices: [
        { text: T("Fill clean, covered containers with drinking water (1 gallon per person per day, at least 3 days), and fill the bathtub for washing and flushing", "Plen veso pwòp ki gen kouvèti ak dlo pou bwè (1 galon pa moun pa jou, omwen 3 jou), epi plen basen benyen an pou lave ak rale twalèt"), outcome: "best", effects: { food: 10 },
          why: T("Drinking water goes in clean, covered containers. Bathtub water is for washing and flushing.", "Dlo pou bwè ale nan veso pwòp ki kouvri. Dlo basen an se pou lave ak rale twalèt.") },
        { text: T("Fill the bathtub and drink from it later", "Plen basen an epi bwè ladan l pita"), outcome: "poor", effects: { safety: -15 },
          why: T("An open tub collects dirt and germs. Keep it for washing and flushing, and store drinking water separately.", "Yon basen louvri ranmase pousyè ak mikwòb. Kenbe l pou lave ak rale twalèt, epi sere dlo pou bwè apa.") },
        { text: T("Nothing; the tap will be fine", "Anyen; tiyo a ap toujou mache"), outcome: "poor", effects: { food: -20 },
          why: T("Hurricanes often cut or contaminate tap water. Store at least 3 days of water before the storm.", "Siklòn konn koupe oswa kontamine dlo tiyo. Sere omwen 3 jou dlo anvan siklòn nan.") },
      ],
    },
    {
      time: T("Day 2 · 8:00 a.m. · Evacuation order", "Jou 2 · 8:00 dimaten · Lòd evakyasyon"), room: "security",
      text: T("Officials order your sister's coastal zone to evacuate. The sky is blue. She says she'll wait and see.",
        "Otorite yo bay lòd pou zòn sè ou bò lanmè a evakye. Syèl la ble. Li di l ap tann pou l wè."),
      choices: [
        { text: T("Tell her to leave now and stay with you, since your home is outside the zone", "Di l soti kounye a epi vin rete lakay ou, paske kay ou pa nan zòn nan"), outcome: "best",
          why: T("Evacuation zones are based on storm surge and flooding, the deadliest hurricane threat. Leave as soon as you're told.", "Zòn evakyasyon yo baze sou leve lanmè ak inondasyon, sa ki pi touye moun nan siklòn. Soti depi yo di ou soti.") },
        { text: T("Agree: the sky is clear, so there's time", "Dakò: syèl la klè, kidonk gen tan"), outcome: "unsafe", effects: { safety: -50 },
          why: T("Calm weather before landfall fools people. Roads close and rescuers can't reach anyone once the storm hits.", "Bon tan anvan siklòn nan rive twonpe moun. Wout yo fèmen epi sekouris pa ka rive jwenn pèsonn lè siklòn nan frape.") },
        { text: T("Her house is solid concrete, so she can ride it out", "Kay li fèt an beton solid, kidonk li ka rete"), outcome: "unsafe", effects: { safety: -50 },
          why: T("Evacuation is about water, not walls. Storm surge can flood even strong houses.", "Evakyasyon se pou dlo, pa pou mi. Leve lanmè ka inonde menm kay ki solid.") },
      ],
    },
    {
      time: T("Day 2 · 9:00 p.m.", "Jou 2 · 9:00 diswa"), room: "security",
      text: T("Winds reach hurricane strength. Where does the family wait out the storm?",
        "Van an rive fòs siklòn. Ki kote fanmi an rete pandan siklòn nan?"),
      choices: [
        { text: T("A small interior room, closet or hallway on the lowest floor that doesn't flood, away from windows", "Yon ti chanm anndan, yon klozèt oswa yon koridò nan etaj ki pi ba a ki pa inonde, lwen fenèt"), outcome: "best",
          why: T("Put as many walls as you can between you and the outside. Glass can break and fly.", "Mete otan mi ou kapab ant ou menm ak deyò a. Vit ka kase epi vole.") },
        { text: T("The living room by the sliding glass doors, to watch the storm", "Nan salon an bò pòt vit glise yo, pou gade siklòn nan"), outcome: "unsafe", effects: { safety: -40 },
          why: T("Large glass doors are among the most dangerous places in a hurricane. Flying glass and debris injure and kill.", "Gwo pòt vit se youn nan kote ki pi danjere nan siklòn. Vit ak debri k ap vole blese epi touye moun.") },
        { text: T("Upstairs bedrooms, so everyone can sleep in a bed", "Chanm anwo yo, pou tout moun ka dòmi nan kabann"), outcome: "poor", effects: { safety: -20 },
          why: T("Upper floors and rooms with windows take the strongest wind. Go low and inside.", "Etaj anwo ak chanm ki gen fenèt resevwa van ki pi fò a. Desann ba epi rete anndan.") },
      ],
    },
    {
      time: T("Day 3 · 1:00 a.m.", "Jou 3 · 1:00 dimaten"), room: "security",
      text: T("Suddenly the wind stops and you can see stars. Your cousin wants to go out and check the car.",
        "Toudenkou van an kanpe epi ou ka wè zetwal. Kouzen ou vle soti al gade machin nan."),
      choices: [
        { text: T("Stay inside: this may be the eye of the storm", "Rete anndan: sa ka je siklòn nan"), outcome: "best",
          why: T("The calm eye passes quickly. The wind returns at full force from the other direction.", "Je siklòn nan pase vit. Van an tounen ak tout fòs li soti nan lòt direksyon an.") },
        { text: T("Go quickly; the storm is over", "Ale vit; siklòn nan fini"), outcome: "unsafe", effects: { safety: -50 },
          why: T("People caught outside when the eye passes are hit by the second half of the storm. Wait for an official all-clear.", "Moun ki deyò lè je a fin pase pran dezyèm mwatye siklòn nan. Tann otorite yo di danje a fini.") },
      ],
    },
    {
      time: T("Day 3 · 9:00 a.m.", "Jou 3 · 9:00 dimaten"), room: "security",
      text: T("The storm has passed. You want more baby formula. Water is flowing across the road to the store. It looks only ankle-deep.",
        "Siklòn nan pase. Ou bezwen plis lèt pou tibebe a. Dlo ap koule sou wout ki mennen nan magazen an. Li sanble li rive sèlman nan cheviy."),
      choices: [
        { text: T("Turn around. Use the formula you stored and wait until officials say roads are open", "Vire tounen. Sèvi ak lèt ou te sere a epi tann otorite yo di wout yo louvri"), outcome: "best",
          why: T("Turn around, don't drown. You can't tell how deep water is, or whether the road under it washed away.", "Vire tounen, pa neye. Ou pa ka konnen ki fon dlo a ye, ni si wout la anba a pa kraze.") },
        { text: T("Drive through slowly", "Travèse l dousman ak machin nan"), outcome: "unsafe", effects: { safety: -60 },
          why: T("About 12 inches of moving water can float a car. Most flood deaths happen in vehicles.", "Apeprè 12 pous dlo k ap koule ka fè yon machin flote. Pifò moun ki mouri nan inondasyon mouri nan machin.") },
        { text: T("Walk across; it's shallow", "Travèse a pye; li pa fon"), outcome: "unsafe", effects: { safety: -50 },
          why: T("Six inches of moving water can knock an adult down. Floodwater can hide sewage, debris and live wires.", "Sis pous dlo k ap koule ka jete yon granmoun atè. Dlo inondasyon ka kache dlo egou, debri ak fil kouran.") },
      ],
    },
    {
      time: T("Day 3 · 11:00 a.m. · Boil-water advisory", "Jou 3 · 11:00 dimaten · Avi pou bouyi dlo"), room: "water",
      text: T("Officials issue a boil-water advisory. You need to mix powdered formula for the baby.",
        "Otorite yo pibliye yon avi pou bouyi dlo. Ou bezwen fè lèt an poud pou tibebe a."),
      choices: [
        { text: T("Use bottled water, or tap water kept at a rolling boil for 1 minute and cooled, for formula, drinking and brushing teeth", "Sèvi ak dlo nan boutèy, oswa dlo tiyo ou kite bouyi fò pandan 1 minit epi kite l refwadi, pou lèt la, pou bwè ak pou bwose dan"), outcome: "best",
          why: T("A boil-water advisory means the water may carry germs. Ready-to-use formula is best if you have it.", "Yon avi pou bouyi dlo vle di dlo a ka gen mikwòb. Lèt ki deja prepare pi bon si ou genyen.") },
        { text: T("Use tap water from your filter pitcher", "Sèvi ak dlo tiyo ki pase nan krich filt ou a"), outcome: "unsafe", effects: { safety: -40 },
          why: T("Boil tap water even if it's filtered. Most home filters don't remove the germs that sicken babies.", "Bouyi dlo tiyo menm si l filtre. Pifò filt lakay pa retire mikwòb ki fè tibebe malad.") },
      ],
    },
    {
      time: T("Day 3 · 6:00 p.m.", "Jou 3 · 6:00 diswa"), room: "air",
      text: T("Still no power. Grandpa wants to cook on the charcoal grill in the kitchen with the back door open.",
        "Toujou pa gen kouran. Granpapa vle kwit manje sou griy chabon an nan kwizin nan ak pòt dèyè a louvri."),
      choices: [
        { text: T("Grill outside, far from doors, windows and vents", "Fè griy la deyò, lwen pòt, fenèt ak vantilasyon"), outcome: "best",
          why: T("Charcoal gives off carbon monoxide. Use grills only outdoors, away from openings.", "Chabon bay monoksid kabòn. Sèvi ak griy sèlman deyò, lwen ouvèti yo.") },
        { text: T("The kitchen is fine with the door open", "Kwizin nan bon si pòt la louvri"), outcome: "unsafe", effects: { safety: -60 },
          why: T("An open door does not clear carbon monoxide. It can kill everyone in the house.", "Yon pòt louvri pa retire monoksid kabòn. Li ka touye tout moun nan kay la.") },
        { text: T("In the garage, out of the wind", "Nan garaj la, lwen van an"), outcome: "unsafe", effects: { safety: -60 },
          why: T("Never burn charcoal in a garage, even with the door open. Carbon monoxide builds up fast.", "Pa janm boule chabon nan garaj, menm ak pòt louvri. Monoksid kabòn ranmase vit.") },
      ],
    },
    {
      time: T("Day 4 · 10:00 a.m.", "Jou 4 · 10:00 dimaten"), room: "medical",
      text: T("Clearing debris, your teenager cuts his hand on a nail that was in floodwater.",
        "Pandan l ap netwaye debri, adolesan ou a koupe men l sou yon klou ki te nan dlo inondasyon."),
      choices: [
        { text: T("Wear gloves, stop the bleeding, wash with soap and clean water, cover it, and have a health worker check his tetanus shot", "Mete gan, rete san an, lave ak savon ak dlo pwòp, kouvri l, epi fè yon travayè sante tcheke vaksen tetanòs li"), outcome: "best",
          why: T("Wounds exposed to floodwater get infected easily, and a puncture may need a tetanus booster. Get care for redness, swelling, pus or fever.", "Blesi ki touche dlo inondasyon enfekte fasil, epi yon blesi pike ka bezwen yon rapèl tetanòs. Chèche swen si gen wouj, anflamasyon, pi oswa lafyèv.") },
        { text: T("Put a bandage on it and keep working", "Mete yon pansman sou li epi kontinye travay"), outcome: "poor", effects: { safety: -20 },
          why: T("Covering a dirty wound traps germs. Clean it first, and check whether he needs a tetanus shot.", "Kouvri yon blesi sal fèmen mikwòb ladan l. Netwaye l anvan, epi tcheke si l bezwen yon vaksen tetanòs.") },
        { text: T("Rinse it in a puddle and keep going", "Rense l nan yon flak dlo epi kontinye"), outcome: "unsafe", effects: { safety: -30 },
          why: T("Floodwater carries sewage and bacteria. Use only clean or boiled water on wounds.", "Dlo inondasyon pote dlo egou ak bakteri. Sèvi sèlman ak dlo pwòp oswa dlo bouyi sou blesi.") },
      ],
    },
  ],
  sources: [
    ["NWS · Hurricane safety: before, during, after", "https://www.weather.gov/safety/hurricane-action"],
    ["Ready.gov · Hurricanes", "https://www.ready.gov/hurricanes"],
    ["NOAA · Taping windows provides no protection", "https://noaa.gov/node/10997"],
    ["CDC · Be prepared for hurricane season", "https://www.cdc.gov/disasters/psa/prepareforhurricaneseason.html"],
    ["NWS · Turn Around Don't Drown", "https://www.weather.gov/safety/flood-turn-around-dont-drown"],
    ["CDC · Drinking water advisories", "https://cdc.gov/water-emergency/about/drinking-water-advisories-an-overview.html"],
    ["CDC · Carbon Monoxide Poisoning Basics", "https://www.cdc.gov/carbon-monoxide/about/index.html"],
    ["CDC · Floodwater safety and wound care", "https://cdc.gov/floods/safety/floodwater-after-a-disaster-or-emergency-safety.html"],
  ],
};
