import type { CardioKey, DayGroup, Exercise, Gear, Pattern } from "./types";

export const PEAK_KIT = [
  "Mega mass linear T-bar row",
  "Watson animal T-bar row",
  "Prime extreme row",
  "Prime seated row",
  "Prime hybrid seated row",
  "Newtech ONHIM seated row inward",
  "Watson cable lat pulldown/ low row",
  "Atlantis unilateral lat pulldown",
  "Prime pulldown 2.0",
  "Nautilus nitro plus lat pulldown",
  "Prime hybrid lat pulldown",
  "Watson pull up/ dip assist",
  "Prime arm curl",
  "Newtech ONHIM arm curl",
  "Prime hybrid seated chest press",
  "Gymleco seated chest press",
  "Nautilus nitro plus vertical chest press",
  "Prime flat chest press",
  "Atlantis incline chest press",
  "Prime incline chest press",
  "Life fitness pec fly/ rear delt",
  "Prime hybrid pec fly/ rear delt",
  "Nautilus nitro plus 30 degree pec fly",
  "Gymleco incline pec fly",
  "Newtech torture shoulder press",
  "Nautilus nitro plus overhead press",
  "Newtech ONHIM standing lateral raise",
  "Prime hybrid seated lateral raise",
  "Prime hack squat",
  "Rodgers power squat pro XT",
  "Pit shark belt squat",
  "Watson pendulum squat",
  "Rodgers hip press",
  "Atlantis 40 degree leg press",
  "Atlantis pivot press",
  "Newtech ONHIM leg extension",
  "Prime hybrid leg extension",
  "Newtech ONHIM lying leg curl",
  "Prime hybrid lying leg curl",
  "Life fitness seated leg curl",
  "Prime hybrid seated leg curl",
  "Max pump 3d abductor",
  "Prime hybrid abduction/ adduction",
  "Watson glute blaster",
  "Glute builder hip thrust elite",
  "Watson animal hyperextension",
  "Glute builder kneeling glute ISO",
  "Glute builder pendulum kickback",
  "Hoist standing calf raise",
  "Watson vertical smith machine",
  "Life fitness slanted smith machine",
  "Atlantis cable crossover",
  "Prime functional trainer",
  "Life fitness functional trainer",
] as const;

interface Draft {
  id: string;
  name: string;
  kit: string;
  day: DayGroup;
  muscle: string;
  gear: Gear;
  pattern: Pattern;
  cue: string;
  freeWeight?: boolean;
  cardio?: CardioKey;
}

function ex(d: Draft): Exercise {
  return { freeWeight: false, ...d };
}

export const EXERCISES: Exercise[] = [
  ex({ id: "prime-flat-press", name: "Flat chest press", kit: "Prime flat chest press", day: "push", muscle: "Chest", gear: "machine", pattern: "h-press", cue: "Set the seat so the handles meet your lower chest. Press out and slightly in, then let the stretch come to you." }),
  ex({ id: "prime-hybrid-press", name: "Hybrid chest press", kit: "Prime hybrid seated chest press", day: "push", muscle: "Chest", gear: "machine", pattern: "h-press", cue: "Use the hybrid arms if you want a freer path. Keep your shoulder blades on the pad the whole set." }),
  ex({ id: "gymleco-press", name: "Seated chest press", kit: "Gymleco seated chest press", day: "push", muscle: "Chest", gear: "machine", pattern: "h-press", cue: "A steadier press for days the Prime is taken. Shoulder blades stay set, and don't bounce the stack." }),
  ex({ id: "nautilus-vertical-press", name: "Vertical chest press", kit: "Nautilus nitro plus vertical chest press", day: "push", muscle: "Chest", gear: "machine", pattern: "incline-press", cue: "The upright path hits higher on the chest. Don't turn it into a shrug by chasing lockout." }),
  ex({ id: "atlantis-incline-press", name: "Incline chest press", kit: "Atlantis incline chest press", day: "push", muscle: "Upper chest", gear: "machine", pattern: "incline-press", cue: "Let the handles travel down until the upper chest lengthens. Press up without locking hard." }),
  ex({ id: "prime-incline-press", name: "Prime incline press", kit: "Prime incline chest press", day: "push", muscle: "Upper chest", gear: "machine", pattern: "incline-press", cue: "Pick the grip that keeps your wrists quiet. Pause where the chest is longest, then press." }),
  ex({ id: "lf-pec-fly", name: "Pec fly", kit: "Life fitness pec fly/ rear delt", day: "push", muscle: "Chest", gear: "machine", pattern: "fly", cue: "Fly, not press. Soft elbows, and hold the open position for a breath before the arms come across." }),
  ex({ id: "prime-pec-fly", name: "Hybrid pec fly", kit: "Prime hybrid pec fly/ rear delt", day: "push", muscle: "Chest", gear: "machine", pattern: "fly", cue: "Open until the chest, not the front of the shoulder, is what feels the stretch." }),
  ex({ id: "nautilus-pec-fly", name: "30° pec fly", kit: "Nautilus nitro plus 30 degree pec fly", day: "push", muscle: "Chest", gear: "machine", pattern: "fly", cue: "This is the lengthened fly. Sit tall, open slowly, and don't yank the stack to start the rep." }),
  ex({ id: "gymleco-incline-fly", name: "Incline pec fly", kit: "Gymleco incline pec fly", day: "push", muscle: "Upper chest", gear: "machine", pattern: "fly", cue: "Upper-chest fly. If the front delts take over, shorten the range rather than adding plates." }),
  ex({ id: "newtech-shoulder-press", name: "Shoulder press", kit: "Newtech torture shoulder press", day: "push", muscle: "Delts", gear: "machine", pattern: "v-press", cue: "The long bottom is the point. Only go as deep as the shoulders stay happy, then own that range." }),
  ex({ id: "nautilus-ohp", name: "Overhead press", kit: "Nautilus nitro plus overhead press", day: "push", muscle: "Delts", gear: "machine", pattern: "v-press", cue: "Forearms vertical at the bottom. Don't bounce the stack to get out of the stretch." }),
  ex({ id: "newtech-lateral", name: "Standing lateral raise", kit: "Newtech ONHIM standing lateral raise", day: "push", muscle: "Side delts", gear: "machine", pattern: "lateral", cue: "Stand into the pads and let the arms hang into the stretch. Raise to shoulder height, not your ears." }),
  ex({ id: "prime-lateral", name: "Seated lateral raise", kit: "Prime hybrid seated lateral raise", day: "push", muscle: "Side delts", gear: "machine", pattern: "lateral", cue: "Lead with the elbows. A slight pause at the bottom beats swinging a heavier pin." }),
  ex({ id: "cable-pressdown", name: "Cable pressdown", kit: "Prime functional trainer", day: "push", muscle: "Triceps", gear: "cable", pattern: "dip", cue: "Elbows pinned. Stop before the shoulders roll forward. Bar or rope, on either Prime trainer." }),
  ex({ id: "dip-assist", name: "Assisted dip", kit: "Watson pull up/ dip assist", day: "push", muscle: "Triceps", gear: "machine", pattern: "dip", cue: "A small forward lean hits chest as well. Stop the depth where the shoulders still feel packed." }),
  ex({ id: "cable-fly", name: "Cable fly", kit: "Atlantis cable crossover", day: "push", muscle: "Chest", gear: "cable", pattern: "fly", cue: "Pulleys high or mid. Cross just short of the midline and keep the tension on the chest." }),
  ex({ id: "cable-lateral", name: "Cable lateral raise", kit: "Life fitness functional trainer", day: "push", muscle: "Side delts", gear: "cable", pattern: "lateral", cue: "The cable pulls from across the body. Raise to just below shoulder height and don't lean away." }),
  ex({ id: "prime-ft-press", name: "Cable press", kit: "Prime functional trainer", day: "push", muscle: "Chest", gear: "cable", pattern: "h-press", cue: "Two Prime trainers are on the floor. Press from a staggered stance so balance isn't the hard part." }),
  ex({ id: "watson-smith-press", name: "Vertical Smith press", kit: "Watson vertical smith machine", day: "push", muscle: "Chest", gear: "smith", pattern: "h-press", cue: "Guided bar, still set your shoulder blades. Flat press, or a seated overhead if the machines are busy." }),
  ex({ id: "lf-smith-press", name: "Slanted Smith press", kit: "Life fitness slanted smith machine", day: "push", muscle: "Chest", gear: "smith", pattern: "incline-press", cue: "The slanted path suits a flat or low-incline press. Wrists stacked over the elbows." }),
  ex({ id: "bb-bench", name: "Barbell bench press", kit: "Barbell and flat bench", day: "push", muscle: "Chest", gear: "barbell", pattern: "h-press", freeWeight: true, cue: "Feet planted, slight arch, bar to the lower chest. Touch and go. Don't bounce." }),
  ex({ id: "db-incline-press", name: "Incline dumbbell press", kit: "Dumbbells and adjustable bench", day: "push", muscle: "Upper chest", gear: "dumbbell", pattern: "incline-press", freeWeight: true, cue: "Bench around 30 degrees. Lower until the dumbbells sit beside the chest, then press up and slightly in." }),
  ex({ id: "db-fly", name: "Dumbbell fly", kit: "Dumbbells and flat bench", day: "push", muscle: "Chest", gear: "dumbbell", pattern: "fly", freeWeight: true, cue: "Soft elbows. Open only as far as the shoulder stays comfortable." }),
  ex({ id: "megamass-tbar", name: "Linear T-bar row", kit: "Mega mass linear T-bar row", day: "pull", muscle: "Back", gear: "machine", pattern: "row", cue: "Chest on the pad. Pull toward your hips, not your neck, and let the shoulders glide forward at the bottom." }),
  ex({ id: "watson-tbar", name: "Animal T-bar row", kit: "Watson animal T-bar row", day: "pull", muscle: "Back", gear: "machine", pattern: "row", cue: "Brace before you pull. A full stretch at the bottom beats a violent squeeze at the top." }),
  ex({ id: "prime-extreme-row", name: "Extreme row", kit: "Prime extreme row", day: "pull", muscle: "Back", gear: "machine", pattern: "row", cue: "Chest supported, so the back has to do it. Pause where the handles meet your ribs." }),
  ex({ id: "prime-seated-row", name: "Seated row", kit: "Prime seated row", day: "pull", muscle: "Back", gear: "machine", pattern: "row", cue: "Sit tall. Stop the pull when the shoulders start to roll forward. That last inch is usually a shrug." }),
  ex({ id: "prime-hybrid-row", name: "Hybrid seated row", kit: "Prime hybrid seated row", day: "pull", muscle: "Back", gear: "machine", pattern: "row", cue: "Freer handles if a fixed grip bothers a wrist. Elbows back, chest up." }),
  ex({ id: "newtech-row", name: "Inward seated row", kit: "Newtech ONHIM seated row inward", day: "pull", muscle: "Back", gear: "machine", pattern: "row", cue: "The inward path loads the stretch. Don't cut the bottom short just to move more plates." }),
  ex({ id: "watson-low-row", name: "Cable low row", kit: "Watson cable lat pulldown/ low row", day: "pull", muscle: "Back", gear: "cable", pattern: "row", cue: "This station is a pulldown and a low row. For the row, brace the feet and keep the torso still." }),
  ex({ id: "atlantis-uni-pulldown", name: "One-arm pulldown", kit: "Atlantis unilateral lat pulldown", day: "pull", muscle: "Lats", gear: "machine", pattern: "v-pull", cue: "One side at a time. Let the shoulder rise a little at the top so the lat actually lengthens." }),
  ex({ id: "prime-pulldown", name: "Pulldown", kit: "Prime pulldown 2.0", day: "pull", muscle: "Lats", gear: "machine", pattern: "v-pull", cue: "Pull toward the upper chest, elbows down. A small lean is fine. A big swing is not." }),
  ex({ id: "nautilus-pulldown", name: "Nitro pulldown", kit: "Nautilus nitro plus lat pulldown", day: "pull", muscle: "Lats", gear: "machine", pattern: "v-pull", cue: "Thigh pads tight enough that you can't float off the seat. Control the return all the way up." }),
  ex({ id: "prime-hybrid-pulldown", name: "Hybrid pulldown", kit: "Prime hybrid lat pulldown", day: "pull", muscle: "Lats", gear: "machine", pattern: "v-pull", cue: "Independent arms if one side does all the work. Match the weaker side's range." }),
  ex({ id: "pullup-assist", name: "Assisted pull-up", kit: "Watson pull up/ dip assist", day: "pull", muscle: "Lats", gear: "machine", pattern: "v-pull", cue: "Dead hang at the bottom if the shoulders allow it. Chin over the bar is enough. No kipping." }),
  ex({ id: "prime-curl", name: "Arm curl", kit: "Prime arm curl", day: "pull", muscle: "Biceps", gear: "machine", pattern: "curl", cue: "Upper arms stay on the pad. Lower until the biceps lengthen, then curl without swinging the torso." }),
  ex({ id: "newtech-curl", name: "Stretch curl", kit: "Newtech ONHIM arm curl", day: "pull", muscle: "Biceps", gear: "machine", pattern: "curl", cue: "Built for the long position. Pause at the bottom. If the elbow complains, shorten the last few degrees." }),
  ex({ id: "lf-rear-delt", name: "Rear delt fly", kit: "Life fitness pec fly/ rear delt", day: "pull", muscle: "Rear delts", gear: "machine", pattern: "rear-delt", cue: "Reverse the fly. Reach forward, then open with the rear delts. Chest stays on the pad." }),
  ex({ id: "prime-rear-delt", name: "Hybrid rear delt", kit: "Prime hybrid pec fly/ rear delt", day: "pull", muscle: "Rear delts", gear: "machine", pattern: "rear-delt", cue: "Light enough to feel the back of the shoulder, not the traps. Stop before you shrug." }),
  ex({ id: "face-pull", name: "Face pull", kit: "Life fitness functional trainer", day: "pull", muscle: "Rear delts", gear: "cable", pattern: "rear-delt", cue: "Rope to the face, elbows high, hands turn out at the finish. A pump set, not a strength test." }),
  ex({ id: "bb-row", name: "Barbell row", kit: "Barbell", day: "pull", muscle: "Back", gear: "barbell", pattern: "row", freeWeight: true, cue: "Hinge until the torso is near parallel. Pull to the belly. Rest the bar down if your back fades." }),
  ex({ id: "db-row", name: "One-arm dumbbell row", kit: "Dumbbell and bench", day: "pull", muscle: "Back", gear: "dumbbell", pattern: "row", freeWeight: true, cue: "Hand and knee on the bench. Pull toward the hip and let the shoulder blade move." }),
  ex({ id: "bb-curl", name: "Barbell curl", kit: "Barbell", day: "pull", muscle: "Biceps", gear: "barbell", pattern: "curl", freeWeight: true, cue: "Elbows under the shoulders. Lower all the way. If you have to swing, the bar is too heavy." }),
  ex({ id: "db-curl", name: "Dumbbell curl", kit: "Dumbbells", day: "pull", muscle: "Biceps", gear: "dumbbell", pattern: "curl", freeWeight: true, cue: "Supinate as you curl. Match the reps side to side, and don't shrug the last two." }),
  ex({ id: "prime-hack", name: "Hack squat", kit: "Prime hack squat", day: "legs", muscle: "Quads", gear: "machine", pattern: "squat", cue: "Feet lower on the plate if you want more knee bend. Control the bottom. Don't bounce." }),
  ex({ id: "rodgers-squat", name: "Power squat", kit: "Rodgers power squat pro XT", day: "legs", muscle: "Quads", gear: "machine", pattern: "squat", cue: "Shoulders in the pads, knees tracking over the toes. Stand tall without locking hard." }),
  ex({ id: "pitshark-belt", name: "Belt squat", kit: "Pit shark belt squat", day: "legs", muscle: "Quads", gear: "machine", pattern: "squat", cue: "The load sits at the hips, so the back can stay quiet. Use it when a shouldered squat is a bad idea." }),
  ex({ id: "watson-pendulum", name: "Pendulum squat", kit: "Watson pendulum squat", day: "legs", muscle: "Quads", gear: "machine", pattern: "squat", cue: "Let the pendulum carry you into the bottom. Knees travel forward. Heels stay down." }),
  ex({ id: "rodgers-hip", name: "Hip press", kit: "Rodgers hip press", day: "legs", muscle: "Quads", gear: "machine", pattern: "leg-press", cue: "A different angle from the leg press. Brace, and don't let the lower back peel off at the bottom." }),
  ex({ id: "atlantis-leg-press", name: "40° leg press", kit: "Atlantis 40 degree leg press", day: "legs", muscle: "Quads", gear: "machine", pattern: "leg-press", cue: "Feet mid-plate for quads. Lower until the hips stay tucked, then press without locking the knees." }),
  ex({ id: "atlantis-pivot", name: "Pivot press", kit: "Atlantis pivot press", day: "legs", muscle: "Quads", gear: "machine", pattern: "leg-press", cue: "Shorter, smoother press. Useful when the big squat machines feel like too much before a run." }),
  ex({ id: "newtech-extension", name: "Leg extension", kit: "Newtech ONHIM leg extension", day: "legs", muscle: "Quads", gear: "machine", pattern: "extension", cue: "The value is the stretched start. Pad above the ankles. Squeeze, then lower slowly." }),
  ex({ id: "prime-extension", name: "Hybrid leg extension", kit: "Prime hybrid leg extension", day: "legs", muscle: "Quads", gear: "machine", pattern: "extension", cue: "Independent legs if one quad hides. Match the weaker side. No swinging the shins." }),
  ex({ id: "newtech-lying-curl", name: "Lying leg curl", kit: "Newtech ONHIM lying leg curl", day: "legs", muscle: "Hamstrings", gear: "machine", pattern: "ham-curl", cue: "Hips stay down. Curl the heels toward you and let the hamstrings lengthen on the way back." }),
  ex({ id: "prime-lying-curl", name: "Hybrid lying curl", kit: "Prime hybrid lying leg curl", day: "legs", muscle: "Hamstrings", gear: "machine", pattern: "ham-curl", cue: "Don't let the hips hike to finish the rep. If they do, take a plate off." }),
  ex({ id: "lf-seated-curl", name: "Seated leg curl", kit: "Life fitness seated leg curl", day: "legs", muscle: "Hamstrings", gear: "machine", pattern: "ham-curl", cue: "Seated curls load the hamstrings while they're stretched. Hold the start for a second." }),
  ex({ id: "prime-seated-curl", name: "Hybrid seated curl", kit: "Prime hybrid seated leg curl", day: "legs", muscle: "Hamstrings", gear: "machine", pattern: "ham-curl", cue: "Back against the pad. Curl smoothly and don't kick the weight down." }),
  ex({ id: "maxpump-abductor", name: "3D abductor", kit: "Max pump 3d abductor", day: "legs", muscle: "Glutes", gear: "machine", pattern: "glute", cue: "Drive the knees out and pause. Light enough that the glutes, not the lower back, do the work." }),
  ex({ id: "prime-abd-add", name: "Abduction / adduction", kit: "Prime hybrid abduction/ adduction", day: "legs", muscle: "Glutes", gear: "machine", pattern: "glute", cue: "Abduction on hinge day. Sit tall, open the knees, and don't clap the pads with momentum." }),
  ex({ id: "watson-glute", name: "Glute blaster", kit: "Watson glute blaster", day: "legs", muscle: "Glutes", gear: "machine", pattern: "thrust", cue: "Ribs down, chin tucked. Drive through the heels and stop when the hips are through." }),
  ex({ id: "gb-hip-thrust", name: "Hip thrust", kit: "Glute builder hip thrust elite", day: "legs", muscle: "Glutes", gear: "machine", pattern: "thrust", cue: "Pad on the hip bones, not the stomach. Pause at the top and keep the ribs down." }),
  ex({ id: "watson-hyper", name: "Hyperextension", kit: "Watson animal hyperextension", day: "legs", muscle: "Hamstrings", gear: "machine", pattern: "hinge", cue: "Hinge from the hips until the hamstrings load, then come up to a straight line. Don't round for range." }),
  ex({ id: "gb-kneeling", name: "Kneeling glute", kit: "Glute builder kneeling glute ISO", day: "legs", muscle: "Glutes", gear: "machine", pattern: "glute", cue: "Small range, hard squeeze. A glute finisher, not a place to stack plates." }),
  ex({ id: "gb-kickback", name: "Pendulum kickback", kit: "Glute builder pendulum kickback", day: "legs", muscle: "Glutes", gear: "machine", pattern: "glute", cue: "Lock the torso. Kick back until the glute tightens, then return without swinging the leg." }),
  ex({ id: "hoist-calf", name: "Standing calf raise", kit: "Hoist standing calf raise", day: "legs", muscle: "Calves", gear: "machine", pattern: "calf", cue: "Pause in the stretch and at the top. Knees softly straight. No bouncing off the bottom." }),
  ex({ id: "leg-press-calf", name: "Leg press calf raise", kit: "Atlantis 40 degree leg press", day: "legs", muscle: "Calves", gear: "machine", pattern: "calf", cue: "Balls of the feet on the edge of the 40° press. Straight knees, full stretch, quiet reps." }),
  ex({ id: "bb-squat", name: "Back squat", kit: "Barbell and rack", day: "legs", muscle: "Quads", gear: "barbell", pattern: "squat", freeWeight: true, cue: "Brace, sit between the hips, heels down. Use safeties if you are alone." }),
  ex({ id: "bb-rdl", name: "Romanian deadlift", kit: "Barbell", day: "legs", muscle: "Hamstrings", gear: "barbell", pattern: "hinge", freeWeight: true, cue: "Soft knees, bar close to the legs, hinge until the hamstrings stop you. Stand by driving the hips through." }),
  ex({ id: "smith-rdl", name: "Smith Romanian deadlift", kit: "Watson vertical smith machine", day: "legs", muscle: "Hamstrings", gear: "smith", pattern: "hinge", cue: "The guided bar keeps the path honest. Hinge, don't squat it. Stop when the back wants to round." }),
  ex({ id: "db-lunge", name: "Walking lunge", kit: "Dumbbells", day: "legs", muscle: "Quads", gear: "dumbbell", pattern: "lunge", freeWeight: true, cue: "Short steps, torso tall, knee over the mid foot. Skip these the day before a long run." }),
  ex({ id: "run-easy", name: "Easy run", kit: "Outdoor or treadmill", day: "conditioning", muscle: "Run", gear: "cardio", pattern: "run", cue: "You should be able to speak in sentences. If you can only get a few words out, slow down." }),
  ex({ id: "run-long", name: "Long run", kit: "Outdoor", day: "conditioning", muscle: "Run", gear: "cardio", pattern: "run", cue: "Easy the whole way. Walk the hills if Saturday's hinge is still in your legs." }),
  ex({ id: "run-strides", name: "Strides", kit: "Outdoor or treadmill", day: "conditioning", muscle: "Run", gear: "cardio", pattern: "run", cue: "After an easy 20 minutes, 6 × 20 seconds smooth and quick with a full walk back. Not a race." }),
  ex({ id: "treadmill", name: "Treadmill", kit: "Treadmill", day: "conditioning", muscle: "Run", gear: "cardio", pattern: "erg", cardio: "treadmill", cue: "Same easy rule as outside. A slight incline if the belt feels like it is pulling you." }),
  ex({ id: "bike", name: "Bike", kit: "Bike", day: "conditioning", muscle: "Conditioning", gear: "cardio", pattern: "erg", cardio: "bike", cue: "For days the legs need blood flow without impact. Easy cadence." }),
  ex({ id: "rower", name: "Rower", kit: "Rower", day: "conditioning", muscle: "Conditioning", gear: "cardio", pattern: "erg", cardio: "rower", cue: "Legs, then hips, then arms. Easy rows, not a sprint test, especially after pull day." }),
  ex({ id: "ski", name: "Ski erg", kit: "Ski erg", day: "conditioning", muscle: "Conditioning", gear: "cardio", pattern: "erg", cardio: "ski", cue: "Short and easy if you use it. It loads the same tissues as pulldowns." }),
];

const BY_ID = new Map(EXERCISES.map((exercise) => [exercise.id, exercise]));

export function getExercise(id: string): Exercise | undefined {
  return BY_ID.get(id);
}

export function uncoveredKit(): string[] {
  const blob = EXERCISES.map((exercise) => `${exercise.name} ${exercise.kit}`).join("\n").toLowerCase();
  return PEAK_KIT.filter((name) => !blob.includes(name.toLowerCase()));
}
