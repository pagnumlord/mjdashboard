// Regenerates backend/data/shots.json, tasks.json, and project_stats.json
// from a single source of truth derived from the latest script draft.
//
// Usage:  node scripts/regenerate-script-data.js
//
// Update this file when the script changes (new scenes, new shots, retitled
// sequences, new pipeline tasks) and re-run it. Then commit the resulting
// JSON files in backend/data/.

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'backend', 'data');

// ---------- SHOTS ----------------------------------------------------------
// status options understood by the dashboard:
//   SCRIPT, STRYBRD, REF, BLCKOUT, MOCAP, VFX, SFX, MUSIC, DONE DONE
// Everything starts at SCRIPT — promote as you finish each stage.
// scriptPage is a free-form label; we use "Scene N - Name" so the dropdown
// in ShotList.js groups everything logically.

const scenes = [
  {
    label: 'Scene 1 - Opening Flashback',
    shots: [
      ['Black screen, piano chord fades in (audio only)'],
      ['CU - Young Jax\'s hands on piano keys'],
      ['Wide - Young Jax and Jett at piano, record player visible'],
      ['MED - Jax looking up frustrated, "Dang it!"'],
      ['MED - Jett reassuring, "The notes are already there"'],
      ['CU - Jax\'s fingers finding the rhythm'],
      ['Two-shot - Jax and Jett, melody syncing'],
      ['Quick cut - front door splinters inward (action)'],
      ['Mother\'s scream, shadowy figures pour in'],
      ['CU - Jax SLAMMED to ground'],
      ['VFX - dark tendrils strangle the boys'],
      ['Tear-blurred POV - dark energy swirls around Jett'],
      ['CU - Jett, "Just close your eyes. Think about the music"'],
      ['CU - Jax closes eyes, stomp rings out'],
      ['Fade to black + text "2076... 12 years later"'],
    ],
  },
  {
    label: 'Scene 2 - Jax Bedroom Intro',
    shots: [
      ['Black screen, Speed Relay button click SFX repeats'],
      ['CU - green flicker brightens screen under blanket'],
      ['Wide reveal - Jax clicking Speed Relay under covers'],
      ['Cut to silence/dark'],
    ],
  },
  {
    label: 'Scene 3 - Streets of Metaneapolis (Busking)',
    shots: [
      ['Black, acoustic guitar strum builds (audio bridge)'],
      ['Wide aerial - Metaneapolis cityscape establishing'],
      ['Dolly through busy street, color fades in'],
      ['Various inserts - city street life vignettes'],
      ['Tracking - camera lands on Jax on stool in front of Hiro\'s'],
      ['CU - Jax humming, eyes closed, strumming'],
      ['Wide - Kiko approaches'],
      ['Two-shot - Kiko/Jax dialogue start'],
      ['CU - Jax, "It\'s Yori… Takahashi"'],
      ['CU - Kiko reacting, "He\'s a long lost legend!"'],
      ['OTS Kiko, "Our guitarist just split"'],
      ['CU - Jax guarded, "I usually work better alone"'],
      ['MED - Kiko closing the pitch, "Just one practice"'],
      ['Insert - Loops exchange info'],
      ['Insert - Jax clicks Stress Relay'],
      ['Pull back - they walk into shop, "Hiro\'s Music Store" sign revealed'],
      ['Time-lapse - sundown transition'],
    ],
  },
  {
    label: 'Scene 4 - Jax Bedroom Late Night',
    shots: [
      ['Wide - Jax on bed practicing difficult songs'],
      ['CU - fingers stumbling on fretboard'],
      ['CU - frustrated, sets guitar down'],
      ['Insert - Loop activates with ding, "Call Hiro"'],
      ['MED - second attempt, no answer'],
      ['Wide - Jax lays back, large screen activates'],
      ['Insert - News reporter on big screen, attacks rising'],
      ['CU - relay clicking accelerates, fade to black'],
      ['CU - alarm jolts Jax awake'],
      ['Wide - Jax scrambles out the door'],
      ['Punk rock running montage through streets'],
      ['TITLE: MELODIC JUSTICE - a film by Karsten Allen'],
    ],
  },
  {
    label: 'Scene 5 - Ext. Kai\'s Garage Door',
    shots: [
      ['Camera falls down to garage door'],
      ['Wide - Kiko waiting, Jax runs up out of breath'],
      ['Two-shot dialogue, "didn\'t want to be late"'],
      ['Wide - they go inside'],
    ],
  },
  {
    label: 'Scene 6 - Garage First Practice + Black Sun Story',
    shots: [
      ['Wide - Kai sprawled on couch watching Stress Relay broadcast'],
      ['CU - Kai jumps up at sight of Jax'],
      ['Three-shot intro / dap exchange'],
      ['CU - Jax\'s pink cybernetic mods (insert)'],
      ['CU - Kai\'s haptic gloves (insert)'],
      ['Wide - Kai gives garage tour'],
      ['VFX - coffee table mechanical whir, transforms to pool table'],
      ['Reactions to the transform'],
      ['Wide - move to practice area'],
      ['Quick setup montage'],
      ['Tracking - first song begins'],
      ['CU coverage - each player jamming'],
      ['Through Kiko\'s goggles - colored explosions behind each player'],
      ['Wide - song ends, all collapse exhausted'],
      ['Wide - sitting around chatting after'],
      ['Two-shot - Jax explains cybernetics + brother Jett'],
      ['CU - Stress Relay in palm'],
      ['Transition: dark tendrils take over screen'],
      ['Black Sun montage - graffiti, symbol everywhere'],
      ['Underground concert venue - Shadow at destroyed instruments'],
      ['CU - Shadow\'s hand crushes microphone'],
      ['Neon signs flicker and die'],
      ['Wide - Shadow addressing his Umbrals'],
      ['Wide - Black Sun facility, twisted music equipment'],
      ['Fade back to garage'],
      ['Continued conversation, "How do you turn someone?"'],
      ['Insert - Jax holds up his relay, "These right here"'],
      ['MED - Kai shows Dr. White announcement holo'],
      ['Insert - Dr. White holo (Stress Relay launch)'],
      ['Wide - realization about Alex'],
      ['Goodbyes - Jax leaves garage'],
    ],
  },
  {
    label: 'Scene 7 - Jax Bedroom Nightmare',
    shots: [
      ['CU - Jax tossing in bed, anxious music ramps'],
      ['Quick cuts - Alex suffering, Jett dying, attack flashes'],
      ['CU - Jax jolts awake, arms out in panic'],
      ['Insert - scrolls Loop comments, black profile pictures'],
      ['MED - tosses Loop, "I need to get out of here"'],
    ],
  },
  {
    label: 'Scene 8 - Rooftop Greenhouse (Contemplative)',
    shots: [
      ['Wide - rooftop with overgrown foliage, greenhouse in middle'],
      ['MED - Jax opens creaky greenhouse door'],
      ['Wide interior - broken glass, plants reclaiming space'],
      ['CU - Jax on crate strumming, slower melody'],
      ['Slow tracking - plants appearing to move with music'],
      ['Two-shot - Jax to the plants, "You guys get it, right?"'],
      ['Timelapse - daybreak transition'],
    ],
  },
  {
    label: 'Scene 9 - Hiro\'s Shop, New Guitar',
    shots: [
      ['EXT wide - Jax jogs up to shop, mid-day'],
      ['INT handheld - Jax enters in a hurry'],
      ['MED - Hiro behind main counter'],
      ['CU - Jax throws Loop, plays band practice holo'],
      ['OTS - both watching the holo'],
      ['Workbench - Hiro adjusts Jax\'s guitar'],
      ['Two-shot dialogue, "Your technique is better"'],
      ['CU - Jax, "concert coming up"'],
      ['MED - Hiro pulls case from under counter'],
      ['CU - case opens, new electric guitar revealed'],
      ['CU - Jax wide-eyed'],
      ['Two-shot - "This guitar will have to learn you too"'],
      ['Wide - random customer interrupts'],
      ['MED - Jax leaves with new guitar'],
    ],
  },
  {
    label: 'Scene 10 - Garage Night + Shadow\'s Office',
    shots: [
      ['Three-shot - chatting before practice, recording idea'],
      ['CU - new guitar revealed from case'],
      ['Insert - tiny hidden box behind neck'],
      ['CU - upgraded fancy Stress Relay revealed'],
      ['Insert - new outlet on bottom of guitar'],
      ['MED - Kai admires "old school DigiTones pickup"'],
      ['Wide - they jam, guitar tone smoother'],
      ['Through Kiko\'s goggles - Jax\'s colors now brighter'],
      ['Quick montage cuts - views climbing, fans in merch'],
      ['Insert - Melodic Justice symbol as street art'],
      ['Music wanes; cut to Shadow\'s dark office'],
      ['CU - Shadow\'s mask watching MJ perform'],
      ['CU - Shadow\'s hand CRUSHES device'],
      ['Quick flashback - young Jett with stolen plans'],
      ['CU - Shadow pulls out jerry-rigged Stress Relay prototype'],
      ['Insert - connects to Black Sun necklace'],
      ['MED - Shadow looming over Alex (Umbral)'],
      ['CU - "WHAT DO YOU KNOW?"'],
      ['VFX - dark energy pulses, Alex recoils'],
      ['Shadow unleashes inhuman roar'],
      ['Cut to Dr. White\'s pristine office, watching holo'],
      ['Insert - hologram corrupts with black tendrils, dies'],
      ['CU - Dr. White stares at his reflection on black screen'],
      ['Fade back to garage'],
    ],
  },
  {
    label: 'Scene 11 - Garage Night, Band Name',
    shots: [
      ['Three-shot - band name brainstorming'],
      ['Various reaction cuts to bad name suggestions'],
      ['CU - "Melodic Justice" landing line'],
      ['Insert - Kai spray-paints MELODIC JUSTICE on his drums'],
      ['Quick montage - holos exploding in views'],
      ['Fade to black'],
    ],
  },
  {
    label: 'Scene 12 - Garage, Dr. White Call',
    shots: [
      ['Wide - Kiko holds up Loop, Dr. White holo'],
      ['Insert - Dr. White hologram pitch'],
      ['CU coverage - each band member reacting'],
    ],
  },
  {
    label: 'Scene 13 - Concert Venue, Meet Dr. White',
    shots: [
      ['Wide - venue interior, band hanging posters'],
      ['MED - Dr. White enters with glowing cane'],
      ['CU - cane with red ball + relay button'],
      ['Group dialogue, Kai stammering'],
      ['Insert - Dr. White\'s Loop rings'],
      ['MED - Dr. White excuses himself toward bathrooms'],
      ['Tracking - Jax follows past, overhears'],
      ['CU - Dr. White on call, "I have done nothing to disturb The Black Sun"'],
      ['MED - Jax dashes into bathroom'],
      ['CU - Jax against wall thinking, "what does Dr. White know?"'],
      ['Wide - rejoin group, Dr. White says farewell'],
      ['CU - Jax\'s suspicious look as Dr. White leaves'],
    ],
  },
  {
    label: 'Scene 14 - Jax Room, Call Hiro About Doc',
    shots: [
      ['Insert - relay clicking transition'],
      ['MED - Jax sits up suddenly'],
      ['Intercut - Loop call with Hiro (split between rooms)'],
      ['CU - Jax lays back, city lights play across face'],
    ],
  },
  {
    label: 'Scene 15 - Garage, Necklace Attack',
    shots: [
      ['Wide - band playing, much tighter'],
      ['CU coverage - each player in their element'],
      ['Insert - Kai\'s relay charging haptic glove'],
      ['Insert - Kiko\'s keytar screen lit up'],
      ['Insert - drum pad "Kai Loop 419"'],
      ['Wide - rest, talking'],
      ['SFX - garage doorbell rings'],
      ['Wide - they approach door curiously'],
      ['Insert - black package on doormat'],
      ['Wide - Kiko picks it up, scans street'],
      ['Insert - "Melodic Justice" stamp on box'],
      ['Insert - holo letter opens with warning'],
      ['Insert - Black Sun necklace inside box'],
      ['VFX - necklace floats up, dark energy emanates'],
      ['MED - all three react in horror'],
      ['VFX - necklace flies to Kai\'s neck, slams him to wall'],
      ['Wide - struggle to pry necklace off'],
      ['VFX - burst of dark energy zaps between band members'],
      ['Insert - necklace falls, then re-floats'],
      ['Wide - Kai kicks it, it flies out window'],
      ['Aftermath dialogue - Kai catching breath'],
      ['Resolve dialogue - "we can\'t back down"'],
    ],
  },
  {
    label: 'Scene 16 - Hiro\'s Shop, Yori Guitar History',
    shots: [
      ['EXT - Jax walks up at midnight'],
      ['INT wide - Hiro quickly hides something behind counter'],
      ['Two-shot dialogue, threat from Black Sun'],
      ['CU - Hiro telling the Yori story'],
      ['Insert - Jax looks at his guitar with new context'],
      ['MED - Hiro, "That guitar will protect you as much as I did"'],
      ['Wide - Jax leaves, calls Kiko + Kai'],
    ],
  },
  {
    label: 'Scene 17 - Stress Relay HQ (Lobby + Office)',
    shots: [
      ['EXT - billboard pan down to street'],
      ['Wide - Stress Relay office building exterior'],
      ['INT lobby - digital front desk assistant'],
      ['Elevator interior - cramped, MJ\'s song on speaker'],
      ['Top floor - reveal city view through window'],
      ['Wide - Dr. White\'s office'],
      ['Group dialogue establishment'],
      ['CU - Dr. White removes sunglasses, cybernetic eyes revealed'],
      ['MED - Dr. White explains Shadow history'],
      ['Reaction shots - Kai, Kiko, Jax'],
      ['MED - hands out new Stress Relays'],
      ['CU - significant glance between Dr. White and Jax'],
      ['Wide - elevator goodbye, doors close'],
    ],
  },
  {
    label: 'Scene 18 - Jax Room, Restless Night',
    shots: [
      ['Black + noise builds in Jax\'s head'],
      ['CU - Jax sits up sharply, wide awake'],
      ['MED - grabs new relay + guitar, leaves'],
    ],
  },
  {
    label: 'Scene 19 - Greenhouse, Arashi Reveal',
    shots: [
      ['Wide - Jax walks rooftops to hideout, early AM'],
      ['MED - opens greenhouse door, settles on crate'],
      ['CU - inspects guitar charge indicator (empty)'],
      ['CU - new Stress Relay in hand'],
      ['Insert - clicks, melody plays, missing two notes'],
      ['CU - Jax tilts head, "That\'s our song"'],
      ['Wide - grabs guitar, plays the final two notes'],
      ['VFX - relay POPS open like a container'],
      ['Audio play - Shadow recording, distorted'],
      ['CU - Jax listening intently'],
      ['Insert - reveal "ARASHI" inside container'],
      ['Intercut - Hiro Loop call'],
      ['Wide - Jax sits looking out at city lights'],
      ['CU - elbow bumps guitar, DING, panel shifts'],
      ['CU - Jax stares at guitar, "You got secrets too?"'],
    ],
  },
  {
    label: 'Scene 20 - Stress Relay Office, Snooping',
    shots: [
      ['EXT - Jax at office building doors'],
      ['Wide - elevator pings open onto Dr. White\'s floor'],
      ['Wide - empty office, papers scattered'],
      ['Tracking - Jax around desk cautiously'],
      ['Insert - papers with "Arashi" name'],
      ['Insert - Black Sun necklace under papers'],
      ['Insert - screen with map, dot signatures, "ARASHI INCIDENT"'],
      ['CU - Jax realizes the relays were trackers'],
      ['SFX - bathroom door creaks, Dr. White voice O.S.'],
      ['MED - Jax grabs necklace, hides it'],
      ['Wide - bolts out into hallway'],
      ['CU - frantic Loop calls to Kiko, Hiro (no answer)'],
      ['CU - leaves voice message to Hiro'],
    ],
  },
  {
    label: 'Scene 21 - Concert Backstage, Destroy Trackers',
    shots: [
      ['Wide - Kiko/Kai pre-show backstage'],
      ['Through curtain - crowd buzzes'],
      ['MED - Jax bursts in out of breath'],
      ['CU coverage - Jax explains'],
      ['FLASH - Umbrals surrounding past Jax, cybernetics failing'],
      ['FLASH - Jax collapsing in an alley'],
      ['FLASH - Hiro finds him, corrects cybernetics'],
      ['Insert - Jax pulls out Black Sun necklace'],
      ['CU - Kai recoils'],
      ['Action - Kai SMASHES his relay with drumstick'],
      ['Action - Kiko\'s bag wails red, Jax SMASHES her relay'],
      ['VFX - necklace activates, drifts away'],
      ['MED - "we follow it, ladies first"'],
    ],
  },
  {
    label: 'Scene 22 - Backstage Hallway, Confront White',
    shots: [
      ['Tracking - corridor gets darker'],
      ['Wide - find Hiro standing over bound Dr. White'],
      ['CU - necklace shoots to White\'s outstretched hand, powers down'],
      ['Two-shot dialogue, Hiro strikes White'],
      ['CU - Dr. White\'s robotic eye looks side to side (hint)'],
    ],
  },
  {
    label: 'Scene 23 - Concert + First Battle',
    shots: [
      ['Backstage - venue worker rushes them out, 5-4-3-2'],
      ['Wide - band runs on stage, crowd cheers'],
      ['Quick setup of instruments'],
      ['Through Kiko\'s goggles - color washes over crowd'],
      ['Performance: first song'],
      ['CU coverage - each player at peak'],
      ['Wide - song one ends, crowd cheers'],
      ['Performance: second song begins'],
      ['Wide - disturbance at entrance'],
      ['MED - security goes down, then another guard'],
      ['Wide - dark figures push through'],
      ['Music dies, instruments drop'],
      ['Wide - Umbrals storm in, chaos'],
      ['Wide - crowd panics, scrambles for exits'],
      ['Action - Kai\'s drumstick whistles, hits Umbral'],
      ['Action - Kiko swings keytar like a bat'],
      ['Action - Jax sweeps with steel pole'],
      ['Wide - Kai tackled mid-sentence'],
      ['MED - Jax whacks attacker off Kai'],
      ['CU - Kai recognizes Alex among the Umbrals'],
      ['Wide - Kiko pulls Kai away, they exit'],
      ['MED - Jax stays, "I need my guitar"'],
      ['Action - Umbral lunges, impales on broken pole'],
      ['Wide - Jax helps trapped fan out, guides to exit'],
      ['Wide - Jax at front of venue, alone with guitar'],
      ['CU - hand trembles on Stress Relay, click click click'],
      ['Insert - charge indicator on guitar fills'],
      ['VFX - guitar DINGS, panels open, ready'],
      ['HERO VFX - guitar TRANSFORMS to laser-machine-gun-relay'],
      ['CU - Jax stares in disbelief at weapon'],
      ['TIME SLOWS - red laser bolts tear through air'],
      ['VFX - Umbrals fall in slow motion, dissolve to shadow'],
      ['REAL TIME - Jax dives behind cover'],
      ['First-person - looks down at instrument'],
      ['VFX - wall EXPLODES inward, debris showers him'],
      ['HERO SHOT - THE SHADOW enters through dust'],
      ['CU - massive corrupted power bank on Shadow\'s back'],
      ['CU - Jax struggles to stand, "Oh shit"'],
      ['MED - Shadow stalks forward, deliberate steps'],
      ['CU - guitar trembles back to normal form'],
      ['CU - Jax hammering relay button'],
      ['VFX - CRACK, red electricity'],
      ['HERO SHOT - Dr. White stands between them'],
      ['CU - cane + necklace energy crackle'],
      ['VFX - electric cage forms around Shadow'],
      ['VFX - Dr. White SLAMS Shadow down with energy beam'],
      ['CU - Dr. White\'s missing eye socket revealed'],
      ['Two-shot - quick exposition while Shadow rises'],
      ['Wide - guitar pulses back to life, charged'],
      ['Action - Shadow charges, Jax barrage of laser fire'],
      ['VFX - Shadow rips metal divider as cover'],
      ['VFX - lasers slice divider mid-flight'],
      ['VFX - Shadow gathers dark energy sphere'],
      ['Wide - sphere flies, detonates, smoke fills venue'],
      ['Tracking - Jax flanks, precision fire stagger'],
      ['CU - Jax shoots laser circle in ceiling'],
      ['VFX - ceiling crashes down, buries Shadow'],
      ['MED - Jax runs to Dr. White'],
      ['Exposition - "He\'s here for you"'],
      ['Wide - Shadow emerges from rubble, roaring'],
      ['Insert - Dr. White hands Jax the necklace'],
      ['Wide - they move into position'],
      ['Shadow gathers another large dark sphere'],
      ['CU - behind Jax, Alex (Umbral) rises with debris'],
      ['VFX - CRACK, Alex hits Jax\'s neck'],
      ['First-person - world tilts, colors blur, sound fades'],
      ['Wide - Kai/Kiko enter screaming from doorway'],
      ['Camera sinks - Jax unconscious fills frame'],
      ['FADE TO BLACK'],
    ],
  },
  {
    label: 'Scene 24 - Flashback: Jett\'s Last Night',
    shots: [
      ['Black - relay clicking builds to fever pitch then stops'],
      ['Wide - childhood home hallway'],
      ['MED - Young Jax creeps down hallway'],
      ['Wide - Jett at desk with jerry-rigged relay'],
      ['CU - sparks fly from device'],
      ['Two-shot - "I thought they put you to bed"'],
      ['Insert - device display: coordinates, names, attack plans'],
      ['Wide - piano nearby, Young Jax hops up'],
      ['CU - Jett\'s finger lifts to play one note'],
      ['SFX CUT - door splinters (memory fractures forward)'],
      ['Wide - Young Jax pinned to floor'],
      ['MED - Jett tries to destroy relay, dark tendrils wrap him'],
      ['Shadow silhouette fills doorway'],
      ['CU - Jett locks eyes with Young Jax'],
      ['CU - "Listen to the music, Jax. Just listen to the music"'],
      ['VFX - darkness consumes screen'],
      ['Rapid flashes - bandmates smiles, Hiro wisdom, playing together'],
    ],
  },
  {
    label: 'Scene 25 - Final Battle, Rhythm Sequence',
    shots: [
      ['CU - Jax\'s eyes snap open'],
      ['POV blurred - Alex\'s dust remains under Shadow\'s feet'],
      ['Wide - Kai screams from entrance, Kiko holds him back'],
      ['Sound syncs back up'],
      ['Wide - Shadow delivers devastating blow to Dr. White'],
      ['Wide - cane skips across debris'],
      ['MED - Shadow kneels, spent'],
      ['CU - Jax forces himself up'],
      ['POV - scans battlefield, sees dangling lighting rig'],
      ['Tracking - Jax moves toward stage'],
      ['Action - Shadow fires energy bolts'],
      ['VFX - Jax dives between debris chunks'],
      ['Wide - Jax rips wires, lighting rig swings free'],
      ['VFX HERO - rig CRASHES on Shadow, voltage arcing'],
      ['Wide - Kai and Kiko on stage'],
      ['MED - Kai reconnects drum machine to speakers'],
      ['CU - hovers finger over switch'],
      ['VFX - power surge through venue'],
      ['MED - Dr. White finishes powering necklace'],
      ['VFX - tosses necklace, wraps Shadow\'s throat'],
      ['Shadow falls back howling'],
      ['MED - Dr. White exhausts cane holding Shadow'],
      ['Wide - Jax with cane and guitar, unsteady'],
      ['VFX - drum pad activates BOOM-CLAP loop'],
      ['VFX - reverberation distorts Shadow\'s shield'],
      ['Action - Jax dances through, dodging blasts on beat'],
      ['Wide - "Your rhythm always sucked"'],
      ['Shadow POV - Jax slipping between debris'],
      ['Quick cuts - Shadow firing off-beat, missing'],
      ['Wide - Jax behind rubble breathing'],
      ['CU - exposed relays on Shadow\'s back'],
      ['Action - Jax rips energy shots at the bank'],
      ['VFX - casing cracks, sparks fly'],
      ['CU - Jax charges relay, planning path'],
      ['CU - "For my family… For my friends… For everyone you\'ve tried to hurt"'],
      ['MED - Jax straps necklace to cane'],
      ['Action - Jax sprints up collapsed lighting rig to the beat'],
      ['Shadow grows massive dark sphere'],
      ['HERO VFX - Jax LEAPS, slams cane + necklace down'],
      ['VFX HERO - massive multi-colored beam vs dark sphere'],
      ['BOOOOOOM - shockwave throws Jax backward'],
      ['Through clearing smoke - Shadow crawls to exit'],
      ['Insert - mask cracked, real face peeks through'],
      ['Wide - Jax lies spent on floor'],
      ['MED - stumbles to Dr. White, "You going to make it?"'],
      ['Wide - Kiko/Kai run in to aid'],
      ['Group standing in rubble'],
      ['Fade to black'],
    ],
  },
  {
    label: 'Scene 26 - Epilogue: Hiro\'s Shop',
    shots: [
      ['EXT - Hiro\'s shop morning'],
      ['INT - Jax walks up to Hiro (in a sling)'],
      ['Two-shot dialogue about Dr. White'],
      ['CU - Hiro reveals "personal guitar of Yori Takahashi"'],
      ['Insert - Yori Takahashi poster on shop wall'],
      ['CU - Jax stares in awe'],
      ['MED - Kiko and Kai enter'],
      ['CU - Kai realizing he\'s been here before'],
      ['Wide - Hiro leads to register'],
      ['Insert - TV broadcast: news report on MJ victory'],
      ['MED - Hiro fake-pulls a book, laughs'],
      ['CU - pushes hidden button under register'],
      ['VFX - record case lowers into the floor'],
      ['Wide reveal - weapons room below'],
      ['CU - Kiko\'s portable keyboard weapon'],
      ['CU - Kai\'s drum-chucks'],
      ['CU - mechanical box attaches to Jax\'s guitar'],
      ['VFX - guitar unfolds to match Yori\'s famous design'],
      ['Wide - action poses, camera spin around'],
      ['VFX transition - weapons room to rooftop'],
      ['Wide - band facing the district'],
      ['VFX - fade to white'],
      ['VFX HERO - Shadow appears, shoots screen black'],
      ['TITLE SCREEN: MELODIC JUSTICE'],
    ],
  },
  {
    label: 'Scene 27 - After-Credits Teaser',
    shots: [
      ['Wide - Jax at grey door, tapping foot'],
      ['VFX - door slides up, fog rolls out'],
      ['Silhouette walks forward'],
      ['CU - revealed as Yori Takahashi'],
      ['CU - Jax\'s jaw drops'],
      ['Black + audio: "Yori?"'],
      ['Poster: MELODIC JUSTICE 2 TOUR'],
    ],
  },
];

// Flatten to shots[]
const shots = [];
const now = new Date().toISOString();
scenes.forEach((scene, sceneIdx) => {
  const sceneNum = sceneIdx + 1;
  scene.shots.forEach((shotData, shotIdx) => {
    const suffix = String.fromCharCode(65 + (shotIdx % 26));
    const rollover = shotIdx >= 26 ? String.fromCharCode(65 + Math.floor(shotIdx / 26) - 1) : '';
    const id = `${sceneNum}${rollover}${suffix}`;
    shots.push({
      id,
      description: shotData[0],
      scriptPage: scene.label,
      status: 'SCRIPT',
      storyboard: false,
      lastUpdate: now,
    });
  });
});

// ---------- TASKS ----------------------------------------------------------
// milestone must match one of the names in milestones.json:
// "Pre-Production", "Production", "Post-Production"
// progress is 0-100, completed is boolean, category groups tasks visually.
//
// Tuple shape:  [milestone, category, name]            -> not done (default)
//               [milestone, category, name, true]      -> already done (100%)

const taskDefs = [
  // ===== PRE-PRODUCTION =====
  // Mocap pipeline
  ['Pre-Production', 'Mocap Pipeline', 'Finalize RTM Pose + WHAM mix integration script'],
  ['Pre-Production', 'Mocap Pipeline', 'Test full mocap pipeline end-to-end with Jax rig'],
  ['Pre-Production', 'Mocap Pipeline', 'Write mocap shoot checklist (lighting, framing, S25 vs ZV1F)'],
  ['Pre-Production', 'Mocap Pipeline', 'Document pipeline steps in README for re-use'],
  ['Pre-Production', 'Mocap Pipeline', 'Build calibration sequence (T-pose, range of motion) for each shoot'],
  ['Pre-Production', 'Mocap Pipeline', 'Document mocap wardrobe + lighting requirements for AI clarity (tight clothing, even light, no mirrors)'],
  ['Pre-Production', 'Mocap Pipeline', 'Decide multi-camera recording plan (S25 + ZV1F simultaneous if WHAM benefits)'],

  // Blender workflow learning
  ['Pre-Production', 'Blender Workflow', 'Decide blend file structure (one-file-per-shot vs per-scene)'],
  ['Pre-Production', 'Blender Workflow', 'Set up Asset Browser library for shared models/materials'],
  ['Pre-Production', 'Blender Workflow', 'Learn multi-camera setup: timeline markers bound to cameras'],
  ['Pre-Production', 'Blender Workflow', 'Test linked vs appended assets to control file size'],
  ['Pre-Production', 'Blender Workflow', 'Establish naming convention + incremental save (Ctrl+Alt+S) workflow'],
  ['Pre-Production', 'Blender Workflow', 'Research color attribute node workflow for procedural detail'],
  ['Pre-Production', 'Blender Workflow', 'Set up EEVEE render presets per scene type (interior/exterior/battle)'],
  ['Pre-Production', 'Blender Workflow', 'Set up render output structure (EXR passes for DaVinci comp)'],

  // Hardware & 3060 Ti (8GB VRAM) — concrete constraints to plan around
  ['Pre-Production', 'Hardware & Render', '3060 Ti VRAM budget: test scene complexity ceiling (poly count, texture size, material count)'],
  ['Pre-Production', 'Hardware & Render', 'Test render times on a representative shot (single 5-second shot, full assets, find baseline)'],
  ['Pre-Production', 'Hardware & Render', 'Configure Blender autosave + crash recovery + incremental save defaults'],
  ['Pre-Production', 'Hardware & Render', 'Decide bake-vs-procedural strategy: which heavy procedurals to bake before final render'],
  ['Pre-Production', 'Hardware & Render', 'Plan render strategy: separate passes + compositor assembly vs single-pass'],
  ['Pre-Production', 'Hardware & Render', 'Set up overnight render queue workflow (batch render queue addon or simple shell loop)'],
  ['Pre-Production', 'Hardware & Render', 'Install GPU temp / VRAM monitor (HWiNFO or MSI Afterburner) for long renders'],

  // Backup & Storage — SSD + Google Drive plan
  ['Pre-Production', 'Backup & Storage', 'Buy external SSD (1 TB minimum, USB 3.2 or Thunderbolt)'],
  ['Pre-Production', 'Backup & Storage', 'Set up SSD with project folder structure mirroring local'],
  ['Pre-Production', 'Backup & Storage', 'Set up Google Drive sync for Master folder (auto)'],
  ['Pre-Production', 'Backup & Storage', 'Set up Google Drive sync for Blender folder (selective: scenes + library)'],
  ['Pre-Production', 'Backup & Storage', 'Establish weekly SSD copy schedule (e.g. Sundays)'],
  ['Pre-Production', 'Backup & Storage', 'Test backup restore once — verify it actually works before relying on it'],
  ['Pre-Production', 'Backup & Storage', 'Document recovery plan: if PC dies, step-by-step rebuild from backups'],
  ['Pre-Production', 'Backup & Storage', 'In Blender: File > External Data > Make Paths Relative (before moving folders)'],

  // Material library expansion
  ['Pre-Production', 'Materials', 'Build foundational procedural EEVEE shader library', true],
  ['Pre-Production', 'Materials', 'Audit existing procedural material library, list what\'s there'],
  ['Pre-Production', 'Materials', 'Build chrome/brushed steel/cyber metal procedurals'],
  ['Pre-Production', 'Materials', 'Build concrete + asphalt procedurals for streets'],
  ['Pre-Production', 'Materials', 'Build glass shaders: clean, dirty, cracked, broken'],
  ['Pre-Production', 'Materials', 'Build neon emission shader pack with color variants'],
  ['Pre-Production', 'Materials', 'Build skin shader pack (Jax with cybernetic transitions)'],
  ['Pre-Production', 'Materials', 'Build fabric procedurals (denim, leather, cotton, mesh)'],
  ['Pre-Production', 'Materials', 'Build dark energy / Black Sun shader (tendrils, particles)'],
  ['Pre-Production', 'Materials', 'Build hologram shader (Loop projections, Dr. White holos)'],
  ['Pre-Production', 'Materials', 'Build wood procedurals for Hiro shop counters + furniture'],
  ['Pre-Production', 'Materials', 'Color attribute setup for Jax cybernetics + character details'],

  // Existing scenes - base modeling done, finishing work remaining
  ['Pre-Production', 'Existing Scenes', 'Model Hiro\'s shop interior (base geometry)', true],
  ['Pre-Production', 'Existing Scenes', 'Model Hiro\'s shop exterior + street corner (base geometry)', true],
  ['Pre-Production', 'Existing Scenes', 'Model Jax\'s bedroom (base geometry)', true],
  ['Pre-Production', 'Existing Scenes', 'Model Dr. White\'s office (base geometry)', true],
  ['Pre-Production', 'Existing Scenes', 'Model concert venue (base geometry)', true],
  ['Pre-Production', 'Existing Scenes', 'Model practice garage (base geometry)', true],
  ['Pre-Production', 'Existing Scenes', 'Hiro\'s shop interior: final texture pass'],
  ['Pre-Production', 'Existing Scenes', 'Hiro\'s shop interior: dress with vintage instruments + posters'],
  ['Pre-Production', 'Existing Scenes', 'Hiro\'s shop interior: lighting (day + midnight + morning)'],
  ['Pre-Production', 'Existing Scenes', 'Hiro\'s shop exterior + street corner: final texture pass'],
  ['Pre-Production', 'Existing Scenes', 'Hiro\'s shop exterior: day + night lighting'],
  ['Pre-Production', 'Existing Scenes', 'Jax bedroom: final texture pass'],
  ['Pre-Production', 'Existing Scenes', 'Jax bedroom: dress (clothes, posters, personal items)'],
  ['Pre-Production', 'Existing Scenes', 'Jax bedroom: lighting (night, late night, after midnight, early AM)'],
  ['Pre-Production', 'Existing Scenes', 'Dr. White\'s office: final texture pass'],
  ['Pre-Production', 'Existing Scenes', 'Dr. White\'s office: dress (screens, cane display, decor)'],
  ['Pre-Production', 'Existing Scenes', 'Dr. White\'s office: lighting (afternoon + dark snoop)'],
  ['Pre-Production', 'Existing Scenes', 'Concert venue: final texture pass'],
  ['Pre-Production', 'Existing Scenes', 'Concert venue: stage gear dressing (amps, mics, cables, lighting rig)'],
  ['Pre-Production', 'Existing Scenes', 'Concert venue: lighting setup (showtime concert)'],
  ['Pre-Production', 'Existing Scenes', 'Concert venue: lighting setup (battle / chaos / smoke version)'],
  ['Pre-Production', 'Existing Scenes', 'Practice garage: final texture pass'],
  ['Pre-Production', 'Existing Scenes', 'Practice garage: dress (couch, drum kit, transforming pool table)'],
  ['Pre-Production', 'Existing Scenes', 'Practice garage: lighting (late afternoon + night + mid day)'],

  // Scenes/sets to model from scratch
  ['Pre-Production', 'New Scenes', 'Model Jax childhood home (piano room + hallway for flashbacks)'],
  ['Pre-Production', 'New Scenes', 'Model Metaneapolis street segments (modular blocks for busking + walking)'],
  ['Pre-Production', 'New Scenes', 'Model abandoned rooftop with greenhouse (broken glass, foliage)'],
  ['Pre-Production', 'New Scenes', 'Model underground concert venue (destroyed instruments, neon)'],
  ['Pre-Production', 'New Scenes', 'Model Black Sun facility (twisted music equipment, dark industrial)'],
  ['Pre-Production', 'New Scenes', 'Model Stress Relay HQ exterior + billboard'],
  ['Pre-Production', 'New Scenes', 'Model Stress Relay lobby with digital assistant'],
  ['Pre-Production', 'New Scenes', 'Model Stress Relay elevator interior'],
  ['Pre-Production', 'New Scenes', 'Model concert venue backstage + hallway'],
  ['Pre-Production', 'New Scenes', 'Model concert venue bathroom (Dr. White call moment)'],
  ['Pre-Production', 'New Scenes', 'Model news reporter studio (for news broadcast inserts)'],
  ['Pre-Production', 'New Scenes', 'Model hidden weapons room under Hiro\'s shop (epilogue)'],
  ['Pre-Production', 'New Scenes', 'Model after-credits door + fog reveal room'],
  ['Pre-Production', 'New Scenes', 'Model Shadow\'s dark office (silhouette environment)'],

  // Props - characters carry / interact
  ['Pre-Production', 'Props', 'Model Speed Relay handheld (Jax\'s OG)'],
  ['Pre-Production', 'Props', 'Model standard Stress Relay (commercial Dr. White version)'],
  ['Pre-Production', 'Props', 'Model jerry-rigged Stress Relay prototype (Shadow\'s)'],
  ['Pre-Production', 'Props', 'Model upgraded Stress Relay (Hiro\'s gift to Jax)'],
  ['Pre-Production', 'Props', 'Model Loop wearable communication device'],
  ['Pre-Production', 'Props', 'Build Loop hologram projection rig (Dr. White call, holos)'],
  ['Pre-Production', 'Props', 'Model Jax\'s acoustic guitar (busking)'],
  ['Pre-Production', 'Props', 'Model Jax\'s electric guitar (Yori\'s, Hiro\'s gift)'],
  ['Pre-Production', 'Props', 'Model + rig guitar transformation to gun-tar (laser machine gun)'],
  ['Pre-Production', 'Props', 'Model final Yori-design guitar form (epilogue add-on)'],
  ['Pre-Production', 'Props', 'Model Kiko\'s keytar (normal)'],
  ['Pre-Production', 'Props', 'Model + rig Kiko\'s keytar weapon form (sonic blast keyboard)'],
  ['Pre-Production', 'Props', 'Model Kiko\'s AR goggles + colored explosion overlay'],
  ['Pre-Production', 'Props', 'Model Kai\'s drum kit'],
  ['Pre-Production', 'Props', 'Model Kai\'s drum pad machine (with loop display)'],
  ['Pre-Production', 'Props', 'Model Kai\'s haptic gloves'],
  ['Pre-Production', 'Props', 'Model + rig Kai\'s drum-chucks (extendable nun-chucks)'],
  ['Pre-Production', 'Props', 'Model Black Sun necklace + tendril rig'],
  ['Pre-Production', 'Props', 'Model Black Sun symbol set (graffiti decals, packaging)'],
  ['Pre-Production', 'Props', 'Model Dr. White\'s cane (glowing red ball + relay button)'],
  ['Pre-Production', 'Props', 'Model Dr. White\'s cybernetic eye (intact + missing socket)'],
  ['Pre-Production', 'Props', 'Model Shadow\'s mask (intact + cracked variants)'],
  ['Pre-Production', 'Props', 'Model Shadow\'s power bank backpack (corrupted relays array)'],
  ['Pre-Production', 'Props', 'Model old vinyl record player (opening flashback)'],
  ['Pre-Production', 'Props', 'Model vintage piano (Jax childhood)'],
  ['Pre-Production', 'Props', 'Model holo-letter device (necklace package)'],
  ['Pre-Production', 'Props', 'Model background instrument inventory (10+ pieces for Hiro shop)'],
  ['Pre-Production', 'Props', 'Model city background pack (streetlights, signs, trash, vehicles)'],

  // Character work
  ['Pre-Production', 'Characters', 'Model Jax character', true],
  ['Pre-Production', 'Characters', 'Model Kiko character', true],
  ['Pre-Production', 'Characters', 'Model Kai character', true],
  ['Pre-Production', 'Characters', 'Model Hiro character', true],
  ['Pre-Production', 'Characters', 'Model Dr. White character', true],
  ['Pre-Production', 'Characters', 'Model Shadow character', true],
  ['Pre-Production', 'Characters', 'Rig Jax (base rig)', true],
  ['Pre-Production', 'Characters', 'Finalize Jax rig for shoot-readiness (controls, weights, deformations)'],
  ['Pre-Production', 'Characters', 'Remodel Kai\'s hair'],
  ['Pre-Production', 'Characters', 'Remodel Kiko\'s hair'],
  ['Pre-Production', 'Characters', 'Assess + possibly remodel Hiro\'s hair'],
  ['Pre-Production', 'Characters', 'Design + model Umbral variants (5+ unique looks)'],
  ['Pre-Production', 'Characters', 'Design + model Shadow\'s real face (mask-cracked reveal)'],
  ['Pre-Production', 'Characters', 'Design + model Yori Takahashi (after-credits reveal)'],
  ['Pre-Production', 'Characters', 'Design + model Alex (band\'s old guitarist, Umbral form)'],
  ['Pre-Production', 'Characters', 'Design + model random customer (Hiro shop interrupter)'],
  ['Pre-Production', 'Characters', 'Design + model venue worker'],
  ['Pre-Production', 'Characters', 'Design + model city pedestrian variety pack (8+ for street scenes)'],
  ['Pre-Production', 'Characters', 'Rig Kiko (face + body)'],
  ['Pre-Production', 'Characters', 'Rig Kai (face + body)'],
  ['Pre-Production', 'Characters', 'Rig Hiro'],
  ['Pre-Production', 'Characters', 'Rig Dr. White (with cybernetic eye + missing eye variant)'],
  ['Pre-Production', 'Characters', 'Rig Shadow (with power bank backpack constraint)'],

  // Concept Art — substantial body of work already done; tracking remaining gaps
  ['Pre-Production', 'Concept Art', 'Concept art - main characters (Jax, Kiko, Kai, Hiro, Dr. White, Shadow)', true],
  ['Pre-Production', 'Concept Art', 'Concept art - key environments', true],
  ['Pre-Production', 'Concept Art', 'Concept art - props + weapons (relays, Loop, guitars, cane)', true],
  ['Pre-Production', 'Concept Art', 'Concept art - Umbral variants + secondary characters (Alex, Yori, young Jax, Jett)'],

  // Storyboards (Procreate) — initial pass done, may revisit per scene
  ['Pre-Production', 'Storyboards', 'Storyboard Scene 1 (opening flashback)', true],
  ['Pre-Production', 'Storyboards', 'Storyboard Scene 3 (busking + meet Kiko)', true],
  ['Pre-Production', 'Storyboards', 'Storyboard Scene 6 (first practice + Shadow montage)', true],
  ['Pre-Production', 'Storyboards', 'Storyboard Scene 9 (Hiro shop new guitar)', true],
  ['Pre-Production', 'Storyboards', 'Storyboard Scene 10 (Shadow office cuts)', true],
  ['Pre-Production', 'Storyboards', 'Storyboard Scene 15 (necklace attack)', true],
  ['Pre-Production', 'Storyboards', 'Storyboard Scene 17 (Stress Relay HQ meeting)', true],
  ['Pre-Production', 'Storyboards', 'Storyboard Scene 19 (greenhouse Arashi reveal)', true],
  ['Pre-Production', 'Storyboards', 'Storyboard Scene 20 (snoop Dr. White\'s office)', true],
  ['Pre-Production', 'Storyboards', 'Storyboard Scene 23 (concert + first battle)', true],
  ['Pre-Production', 'Storyboards', 'Storyboard Scene 24 (Jett flashback)', true],
  ['Pre-Production', 'Storyboards', 'Storyboard Scene 25 (rhythm sequence final battle)', true],
  ['Pre-Production', 'Storyboards', 'Storyboard Scene 26 (epilogue + weapons room)', true],
  ['Pre-Production', 'Storyboards', 'Storyboard Scene 27 (after-credits teaser)', true],
  ['Pre-Production', 'Storyboards', 'Procreate impact frames: pick + render 10-15 hero moments'],

  // Study & Learning — ongoing craft development across disciplines
  ['Pre-Production', 'Study & Learning', 'Music theory fundamentals (scales, chord progressions, key signatures)'],
  ['Pre-Production', 'Study & Learning', 'Piano + guitar practice for composition (weekly routine)'],
  ['Pre-Production', 'Study & Learning', 'Film scoring techniques (Zimmer, Williams, Sakamoto deep dives)'],
  ['Pre-Production', 'Study & Learning', 'Video editing fundamentals (cut on action, pacing, J/L cuts, montage)'],
  ['Pre-Production', 'Study & Learning', 'DaVinci Resolve advanced (Fusion compositing, color page deep dive)'],
  ['Pre-Production', 'Study & Learning', 'Color theory + grading principles'],
  ['Pre-Production', 'Study & Learning', 'Cinematography fundamentals (composition, blocking, lens choice)'],
  ['Pre-Production', 'Study & Learning', 'Animation principles (the 12 principles)'],
  ['Pre-Production', 'Study & Learning', 'Sound design for action sequences'],
  ['Pre-Production', 'Study & Learning', 'Procreate advanced techniques for impact frames + storyboards'],
  ['Pre-Production', 'Study & Learning', 'Character rigging study (for remaining cast)'],
  ['Pre-Production', 'Study & Learning', 'Blender compositor + node workflows'],
  ['Pre-Production', 'Study & Learning', 'Blender particle + simulation systems (for tendrils, debris, smoke)'],
  ['Pre-Production', 'Study & Learning', 'Cinematic lighting principles (3-point, motivated, color temp)'],
  ['Pre-Production', 'Study & Learning', 'EEVEE optimization for heavy scenes'],
  ['Pre-Production', 'Study & Learning', 'Reference watch: cyberpunk (Akira, Ghost in the Shell, Edgerunners)'],
  ['Pre-Production', 'Study & Learning', 'Reference watch: music-driven films (Whiplash, Sing Street, Scott Pilgrim)'],
  ['Pre-Production', 'Study & Learning', 'Manga panel composition study (for impact frame layouts)'],
  ['Pre-Production', 'Study & Learning', 'VFX breakdowns study (Corridor Crew, etc.)'],

  // Misc
  ['Pre-Production', 'Planning', 'Lock the script (final draft sign-off)', true],
  ['Pre-Production', 'Planning', 'Voice casting (family + friends): assign roles, share script excerpts'],
  ['Pre-Production', 'Planning', 'Voice direction notes per character (tone, pace, key beats)'],
  ['Pre-Production', 'Planning', 'Build per-scene shot calendar (which mocap shoot day covers what)'],
  ['Pre-Production', 'Planning', 'Set up home filming space (lighting, backdrop, S25 + ZV1F mount points)'],
  ['Pre-Production', 'Planning', 'Write project pipeline doc (tools, file structure, workflow per discipline — for future you)'],
  ['Pre-Production', 'Planning', 'Document RTM/WHAM mocap pipeline usage step-by-step'],

  // Audio Setup — your sole responsibility (FL Studio + Reaper + SteelSeries Alias)
  ['Pre-Production', 'Audio Setup', 'Set up FL Studio project template (instruments, drum kits, MJ band patches)'],
  ['Pre-Production', 'Audio Setup', 'Set up Reaper project template (tracks, routing, mix bus, master chain)'],
  ['Pre-Production', 'Audio Setup', 'Test + calibrate SteelSeries Alias USB-C mic signal chain'],
  ['Pre-Production', 'Audio Setup', 'Build voice recording workflow (gain staging, monitoring, take management)'],
  ['Pre-Production', 'Audio Setup', 'Establish stem export convention (dialogue, music, FX, ambience) for DaVinci handoff'],
  ['Pre-Production', 'Audio Setup', 'Treat home recording space (foam, blankets, closet booth for vocals)'],
  ['Pre-Production', 'Audio Setup', 'Test recording space room tone / noise floor (target -60 dB or lower)'],
  ['Pre-Production', 'Audio Setup', 'Record voice direction reference tracks per character (you reading lines for tone guidance)'],

  // ===== PRODUCTION =====
  ['Production', 'Mocap Shoot', 'Mocap day: Jax solo (busking, bedroom, rooftop)'],
  ['Production', 'Mocap Shoot', 'Mocap day: band practice sessions + dialogue'],
  ['Production', 'Mocap Shoot', 'Mocap day: Hiro shop interactions'],
  ['Production', 'Mocap Shoot', 'Mocap day: Dr. White office scenes'],
  ['Production', 'Mocap Shoot', 'Mocap day: concert performance (all songs)'],
  ['Production', 'Mocap Shoot', 'Mocap day: concert battle (Jax)'],
  ['Production', 'Mocap Shoot', 'Mocap day: concert battle (Shadow + Dr. White)'],
  ['Production', 'Mocap Shoot', 'Mocap day: Jett flashback (young Jax + Jett)'],
  ['Production', 'Mocap Shoot', 'Mocap day: epilogue + after-credits'],
  ['Production', 'Mocap Shoot', 'Mocap day: pickup / reshoot day'],

  // Voice recording sessions — family + friends in your home studio
  ['Production', 'Voice Recording', 'Voice session: Jax (all dialogue)'],
  ['Production', 'Voice Recording', 'Voice session: Kiko (all dialogue)'],
  ['Production', 'Voice Recording', 'Voice session: Kai (all dialogue)'],
  ['Production', 'Voice Recording', 'Voice session: Hiro (all dialogue)'],
  ['Production', 'Voice Recording', 'Voice session: Dr. White (all dialogue)'],
  ['Production', 'Voice Recording', 'Voice session: The Shadow (all dialogue, distorted/processed)'],
  ['Production', 'Voice Recording', 'Voice session: secondary characters (Jett, young Jax, Alex, Kiko-friend, news reporter, venue worker, random customer)'],
  ['Production', 'Voice Recording', 'Voice ADR / pickup session for any reshoots'],

  ['Production', 'Animation', 'Animate guitar transformation sequence (gun-tar)'],
  ['Production', 'Animation', 'Animate Black Sun necklace floating + attack on Kai'],
  ['Production', 'Animation', 'Animate dark tendril / particle simulations'],
  ['Production', 'Animation', 'Animate transforming coffee table to pool table'],
  ['Production', 'Animation', 'Animate Shadow\'s energy spheres + projectiles'],
  ['Production', 'Animation', 'Animate Dr. White\'s cane energy + electric cage'],
  ['Production', 'Animation', 'Animate guitar laser fire bursts (time-slow + real-time)'],
  ['Production', 'Animation', 'Animate weapons room reveal (case sinks into floor)'],
  ['Production', 'Animation', 'Animate after-credits door + fog reveal'],
  ['Production', 'Animation', 'Animate Speed Relay click variations'],
  ['Production', 'Animation', 'Animate guitar Yori-form transformation (epilogue)'],

  ['Production', 'Camera + Light', 'Camera blocking: Act 1 (busking through new guitar)'],
  ['Production', 'Camera + Light', 'Camera blocking: Act 2 (necklace attack through Stress Relay HQ)'],
  ['Production', 'Camera + Light', 'Camera blocking: Act 3 (concert through epilogue)'],
  ['Production', 'Camera + Light', 'Lighting pass: Act 1'],
  ['Production', 'Camera + Light', 'Lighting pass: Act 2'],
  ['Production', 'Camera + Light', 'Lighting pass: Act 3 + epilogue'],
  ['Production', 'Camera + Light', 'Concert battle lighting + smoke FX pass'],

  ['Production', 'Render', 'Render test pass for quality calibration (3-5 shots per act)'],
  ['Production', 'Render', 'Render final passes: Act 1'],
  ['Production', 'Render', 'Render final passes: Act 2'],
  ['Production', 'Render', 'Render final passes: Act 3 + epilogue'],

  // ===== POST-PRODUCTION =====
  ['Post-Production', 'Edit', 'DaVinci project setup + media bins'],
  ['Post-Production', 'Edit', 'Rough cut: Act 1'],
  ['Post-Production', 'Edit', 'Rough cut: Act 2'],
  ['Post-Production', 'Edit', 'Rough cut: Act 3'],
  ['Post-Production', 'Edit', 'Fine cut + pacing pass'],
  ['Post-Production', 'Edit', 'Trim transitions / match cuts pass'],

  ['Post-Production', 'VFX', 'Procreate impact frames integration'],
  ['Post-Production', 'VFX', 'Dark energy compositing pass (all Black Sun moments)'],
  ['Post-Production', 'VFX', 'Hologram look pass (Loop projections, Dr. White holos)'],
  ['Post-Production', 'VFX', 'Title card animation: MELODIC JUSTICE (intro)'],
  ['Post-Production', 'VFX', 'Title card animation: final title with Shadow shooting screen'],
  ['Post-Production', 'VFX', 'Slow-mo guitar transformation final pass'],
  ['Post-Production', 'VFX', 'Glitch/corruption on Dr. White\'s screen'],
  ['Post-Production', 'VFX', 'Kiko goggles POV color overlay system'],
  ['Post-Production', 'VFX', 'After-credits poster reveal'],

  ['Post-Production', 'Sound', 'Score: Yori Takahashi melody theme (recurring leitmotif)'],
  ['Post-Production', 'Sound', 'Band song 1: opening practice / busking-energy song'],
  ['Post-Production', 'Sound', 'Band song 2: mid-arc song (more polished, finding identity)'],
  ['Post-Production', 'Sound', 'Band song 3: concert finale song'],
  ['Post-Production', 'Sound', 'Score: Shadow / Black Sun motif'],
  ['Post-Production', 'Sound', 'Score: Dr. White motif'],
  ['Post-Production', 'Sound', 'Score: Ambient + transition cues'],
  ['Post-Production', 'Sound', 'Score: End credits / outro track'],
  ['Post-Production', 'Sound', 'SFX library: Stress Relay click variations'],
  ['Post-Production', 'Sound', 'SFX library: Loop notification + holo dings'],
  ['Post-Production', 'Sound', 'SFX library: guitar transformation mechanical whirs'],
  ['Post-Production', 'Sound', 'SFX library: dark tendril atmospheres'],
  ['Post-Production', 'Sound', 'SFX library: concert venue ambience (full crowd + post-attack)'],
  ['Post-Production', 'Sound', 'Foley pass: footsteps, clothing, props'],
  ['Post-Production', 'Sound', 'Voice cleanup pass: denoise, EQ, compression per take'],
  ['Post-Production', 'Sound', 'Shadow voice processing chain (distortion, reverb, layered demonic FX)'],
  ['Post-Production', 'Sound', 'Final mix (stereo + 5.1)'],

  ['Post-Production', 'Color', 'Color grade Act 1 (warm, optimistic)'],
  ['Post-Production', 'Color', 'Color grade Act 2 + Shadow scenes (darker palette)'],
  ['Post-Production', 'Color', 'Color grade concert battle (high contrast)'],
  ['Post-Production', 'Color', 'Color grade epilogue (warm morning)'],
  ['Post-Production', 'Color', 'Final color sign-off'],

  ['Post-Production', 'Delivery', 'Export master file (ProRes / DNxHR)'],
  ['Post-Production', 'Delivery', 'Export streaming variants (H.264, web)'],
  ['Post-Production', 'Delivery', 'Subtitles / captions pass'],
  ['Post-Production', 'Delivery', 'Poster artwork + key art'],
];

// ---------- MERGE WITH EXISTING --------------------------------------------
// Default behavior: preserve user edits (completed, progress, order) from
// the existing JSON files, only adding/removing tasks + shots based on what's
// in this generator. Run with --reset to wipe and apply generator defaults.

const RESET = process.argv.slice(2).includes('--reset');

const readJsonOrEmpty = (p) => {
  if (RESET || !fs.existsSync(p)) return [];
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return []; }
};

const existingTasks = readJsonOrEmpty(path.join(DATA_DIR, 'tasks.json'));
const existingTasksByName = new Map(existingTasks.map(t => [t.name, t]));
const existingTaskMaxId = existingTasks.reduce((m, t) => Math.max(m, t.id || 0), 0);
const existingTaskMaxOrder = existingTasks.reduce((m, t) => Math.max(m, t.order || 0), 0);

let nextTaskId = existingTaskMaxId + 1;
let nextTaskOrder = existingTaskMaxOrder + 1;

const tasks = taskDefs.map(([milestone, category, name, done], idx) => {
  const existing = existingTasksByName.get(name);
  if (existing) {
    // Preserve user state (completed, progress, order, createdAt, id) but
    // update milestone + category in case we've moved the task in the generator.
    return { ...existing, milestone, category };
  }
  // Genuinely new task — use generator defaults
  return {
    id: nextTaskId++,
    name,
    milestone,
    category,
    completed: !!done,
    progress: done ? 100 : 0,
    order: RESET ? (idx + 1) : nextTaskOrder++,
    createdAt: now,
  };
});

// When --reset, also flatten IDs so they start from 1
if (RESET) {
  tasks.forEach((t, i) => { t.id = i + 1; t.order = i + 1; });
}

// Reapply per-shot merge (preserve status + storyboard flag by shot ID)
const existingShots = readJsonOrEmpty(path.join(DATA_DIR, 'shots.json'));
const existingShotsById = new Map(existingShots.map(s => [s.id, s]));
shots.forEach(s => {
  const existing = existingShotsById.get(s.id);
  if (existing) {
    s.status = existing.status || s.status;
    s.storyboard = existing.storyboard || s.storyboard;
    s.lastUpdate = existing.lastUpdate || s.lastUpdate;
  }
});

// ---------- PROJECT STATS --------------------------------------------------
const completedTasks = tasks.filter(t => t.completed).length;
const completedShots = shots.filter(s => s.status === 'DONE DONE').length;
const projectStats = {
  scenes: { total: scenes.length, completed: 0 },
  characters: { total: 9, completed: 0 }, // Jax, Kiko, Kai, Hiro, Dr. White, Shadow, Jett, Alex, Yori
  shots: { total: shots.length, completed: completedShots },
  music: { total: 5, completed: 0 }, // Yori theme, MJ songs, Shadow motif, White motif, ambient
};

// ---------- WRITE ----------------------------------------------------------
fs.writeFileSync(path.join(DATA_DIR, 'shots.json'), JSON.stringify(shots, null, 2));
fs.writeFileSync(path.join(DATA_DIR, 'tasks.json'), JSON.stringify(tasks, null, 2));
fs.writeFileSync(path.join(DATA_DIR, 'project_stats.json'), JSON.stringify(projectStats, null, 2));

console.log(`Mode: ${RESET ? 'RESET (wiping user state)' : 'MERGE (preserving user edits)'}`);
console.log(`Wrote ${shots.length} shots across ${scenes.length} scenes (${completedShots} DONE DONE)`);
console.log(`Wrote ${tasks.length} tasks across 3 milestones (${completedTasks} marked complete)`);
