import { lemmaOf } from './vocab';

/**
 * Curated teen CEFR reference lemmas for the local Core Vocabulary sorter.
 * Exact list matches beat shape heuristics. Prefer expanding these lists over
 * tuning scores when a word is repeatedly mis-banded.
 */

function bag(source: string) {
  return new Set(
    source
      .split(/\s+/)
      .map((w) => lemmaOf(w))
      .filter(Boolean),
  );
}

/** High-frequency everyday / lower-secondary English → Beginner. */
export const BEGINNER_LIST = bag(`
the be to of and a in that have i it for not on with he as you do at this but his by from they we say her she or an will my one all would there their what so up out if about who get which go me when make can like time no just him know take people into year your good some could them see other than then now look only come its over think also back after use two how our work first well way even new want because any these give day most us
a an the this that these those my your his her its our their me you him her us them who what where when why how which
yes no please thank thanks sorry hello goodbye hi ok okay maybe
cat dog run play happy school home friend family food water book help small big red blue green yellow black white eat drink walk talk sleep morning night today yesterday tomorrow week month year
house car bus train bike apple ball child mother father teacher student name age city country english maths math science art music sport
kind nice polite rude honest quiet loud busy tired hungry thirsty careful helpful cheerful lonely nervous proud shy clever silly dirty clean soft sweet bitter funny angry sad brave lazy calm weak strong rich poor sick well better best worse worst pretty beautiful ugly smart wise true false right wrong safe danger dark light heavy empty full closed broken fixed wet dry thick thin near far inside outside above below before after
friendly selfish patient impatient lovely lonely lucky unlucky useful useless careless helpless hopeful hopeless peaceful fearful painful
friend friendship selfishness patience kindness bravery anger fun
reliable unreliable dishonest possible impossible comfortable uncomfortable interesting boring exciting dangerous unsafe healthy unhealthy
boy girl man woman person people baby kid teen adult uncle aunt cousin brother sister husband wife neighbour neighbor
sun moon star sky rain wind snow cloud day hour minute second clock watch phone computer game song movie story letter number colour color picture photo map road street park shop market garden farm animal bird fish tree flower grass
feel feeling think thought know knowledge want like dislike enjoy hate fear worry smile laugh cry shout whisper
ask call wait sit stand jump study learn teach read write speak listen hear see watch find show tell put keep let try need wish hope love hate win lose start stop begin finish open close
buy sell pay cost money cash bank shop store price cheap expensive free
room door window wall floor table chair bed kitchen bathroom classroom library hospital
knife fork spoon plate bowl cup glass pot pan dish towel soap brush comb bag box key lock
melt cook boil fry bake roast mix pour wash cut chop stir heat freeze wipe sweep mop iron fold hang wear
stairs roof fence gate path tool hammer nail screw scissors tape glue paint needle pin
shirt pants trousers dress shoe sock hat coat pocket button zip umbrella
food meal breakfast lunch dinner rice bread milk tea coffee juice fruit vegetable meat fish egg
body head hand foot eye ear nose mouth face hair
weather hot cold warm cool rain sunny cloudy
holiday vacation travel trip visit stay leave arrive return
school homework class lesson test exam mark grade pass fail
team game play player ball win lose score
happy sad angry afraid surprised bored excited worried
access account active adapt address adjust adopt advance afford alert alter annual appeal approve arrange aspect assess assign assist assure attain
afraid asleep awake aware awkward barrier basis beautiful bias big blunt bond boost bored brief cheap complex constant crispy deny enhance expand fast free hard image invest least major narrow occupy poor quiet round shift some sudden tidy willing
delicious suspicious precious wonderful terrible
clear code bright deep easy early fair few flat fresh huge late long many old quick real rough sharp short silent simple slow smooth sour straight sure tall tiny tough weird whole wide young soft hard warm cool cold hot wet dry thick thin near far
acquire affect bright casual certain compete compute conceal concept conclude concur conduct confine confirm conform confront consent consist consult consume content context contract contrast convert convey convince core correct create credit crowded crucial curved cycle
data debate decade decline define delayed depress deprive derive despite detect deter devise diminish direct diverse domain doubtful dumb eager enable enforce enough ensure entity equal equip error establish ethnic evolve exceed exclude expert exploit expose extra extract
factor failed faithful fake fancy feature fee final firm forced formal fragile frequent fund gentle genuine gradual grant grasp grateful hidden hinder impact income index input insight inspect instruct intense involve issue item jealous journal juicy label lasting layer lecture legal license logic loose loser loyal main maintain media mental messy method minor mode modern modify network noisy none normal notify notion observe obtain obvious occur option outcome panel period persist plain plenty policy primary prior private proceed process prompt prospect public punctual rare reckless regard region reject rely reside retain reveal role route routine salty scheme scope sector seek series shallow skilled speedy spicy stable stale status stranded strange stress strict survey suspend sustain tackle target tasty tense thorough timely trend unfair unique unsure urgent valid verify via violent vital volume wealthy welfare whereas winner worthless worthy
foolish sincere single source special tight last emerge
`);

/** School / essay English (B1–B2) → Intermediate. */
export const INTERMEDIATE_LIST = bag(`
curious persevere collaborate resilient improve develop achieve challenge opportunity responsible independent confident creative flexible organise organize discuss explain describe compare decide prefer suggest recommend agree disagree although however therefore instead unless whether according available similar various several common recent previous current further rather especially generally actually probably possibly certainly necessary important difficult successful famous popular serious particular personal social cultural national international environment experience education information technology science health business government community problem solution result reason purpose example opinion advantage disadvantage increase decrease include provide require allow consider expect believe remember imagine understand
ambition ambitious motivation motivate strategy strategic analyse analyze analysis evaluate evaluation persuade persuasion influence negotiate negotiation compromise conflict resolution teamwork leadership presentation research project deadline schedule priority efficient efficiency effective effectiveness
dependable consistent inconsistency inconsistent unusual complicated complexity magnificent
achieve achievement challenge challenging improve improvement develop development decide decision discuss discussion explain explanation describe description compare comparison suggest suggestion recommend recommendation
opportunity opportunities responsible responsibility independent independence confident confidence creative creativity flexible flexibility organise organize organisation organization
environment environmental experience experienced education educational information technology technical science scientific health healthy business government community communal
advantage disadvantages disadvantage increase decrease include including provide providing require required allow allowing consider considering expect expected
opinion opinions purpose purposes example examples result results reason reasons solution solutions problem problems
culture cultural society social national international local global
economy economic politics political history historical geography geographic
paragraph essay article report summary conclusion introduction argument evidence opinion
although however therefore meanwhile furthermore moreover instead unless whether according
available similar various several common recent previous current further especially generally actually probably possibly certainly
necessary important difficult successful famous popular serious particular personal
analyse analyze analysis evaluate evaluation persuade persuasion influence negotiate negotiation
compromise conflict resolution teamwork leadership presentation research project deadline schedule priority
efficient efficiency effective effectiveness ambition ambitious motivation motivate strategy strategic
consistent consistency inconsistent unusual complicated complexity dependable
persuade persuasive recommend recommendation suggest suggestion
advantageous disadvantageous
communicate communication compensation comprehensive considerable consequently construct construction
fundamental investigate investigation intelligence inexperienced irresponsible participate participation
professional significant simultaneous sophisticated technique traditional incorporate unqualified
allocate allocation assert assertion denote denotation approximate approximation differentiate differentiation
imply implication critical categorical hypothesis
abundant accelerate accompany accomplish accurate accustomed acknowledge additional adequate adjacent administer advantage advocate aesthetic affable affordable aggravate aggregate alleviate analyze anticipate apparent applicable appropriate arbitrary articulate ascertain ashamed assemble associate assumption attentive attribute authentic authority authorize autonomy available background beneficial benefit
adverse analogy
technology
diligent pertinent plausible pervasive
deference exemplary expedient fortuitous
accommodate deteriorate detrimental immense tedious mandate mediate provoke campaign chaotic clause compile analogy adverse
sluggish stranded reckless
`);

/**
 * Rare / literary / low-frequency academic English (C1+) → Advanced.
 * Do NOT put common school verbs here (communicate, allocate, assert, …).
 */
export const ADVANCED_LIST = bag(`
emaciated meticulous ubiquitous ephemeral pragmatic eloquent idiosyncrasy paradigm juxtaposition juxtapose dichotomy ambiguous nuanced unprecedented conscientious scrupulous fastidious erudite sagacious perspicacious magnanimous benevolent malevolent anachronism superfluous redundant obsolete archaic esoteric empirical anecdotal methodology synthesis critique mitigate exacerbate ameliorate substantiate corroborate refute concede infer connote anomaly discrepancy conundrum quandary predicament scrutinise scrutinize unequivocal nevertheless notwithstanding albeit hitherto
emaciate emaciation gaunt haggard cadaverous atrophy atrophied languid lethargic indolent indolence
ostensible ostensibly precarious precariousness perfunctory perfunctorily laconic reticent reticence verbose verbosity
ubiquity ephemeralness pragmatism eloquence idiosyncratic paradigmatic dichotomous ambiguity nuance conscientiousness
scrupulousness fastidiousness erudition sagacity perspicacity magnanimity benevolence malevolence
superfluity redundancy obsolescence archaism esotericism empiricism
hypothesise hypothesize methodological synthesise synthesize
mitigate mitigation exacerbate exacerbation ameliorate amelioration substantiate substantiation corroborate corroboration
refutation concession inference connotation anomalous discrepant
scrutinise scrutinize unequivocalness notwithstanding
alacrity assiduous assiduity bellicose belligerent cacophony callous capricious circumspect clandestine
cogent commensurate conciliatory convoluted dearth debilitate deleterious demure deride derogatory
didactic diffident dilatory disparate dogmatic egregious enigma enigmatic ephemeral epitome
equivocal ersatz esoteric exonerate facetious fallacious fastidious feral furtive
gregarious harbinger heinous iconoclast idiosyncratic immutable impecunious imperturbable
inchoate incontrovertible indolent ineffable inexorable iniquity inscrutable insidious
insipid intrepid inure invective inveterate irascible jejune laconic lament lamentable
largess latent lethargy lucid ludicrous lugubrious magnanimous maladroit malevolent
maudlin mercurial meticulous misanthrope mollify morose multifarious mundane
myopic nebulous nefarious noxious obdurate obfuscate oblique obscure obstinate
officious onerous opulent ostentatious ostracize palatable paradigm paradoxical
paragon paucity pejorative penchant penurious perfidious perfunctory pernicious
perspicacious pertinacious petulant philanthropy phlegmatic pithy placate placid
platitude plethora poignant polemical pragmatic precarious precipitate preclude
precocious predilection prevaricate pristine proclivity prodigal prodigious
profligate progenitor prolific propensity prosaic protean provincial provocative
prudent puerile pugnacious pulchritude punctilious quandary querulous quixotic
rancorous recalcitrant recondite redolent refute relegate remonstrate
reprehensible reproach repudiate resolute respite reticent
revere rife ruminate sagacious salient sanctimonious sanguine sardonic
scathing scrupulous sedentary sententious serendipity servile solicitous
solvent somber sophistry soporific spurious staid stentorian stoic
stolid strident stringent stymie subjugate sublime subterfuge succinct
sycophant tacit taciturn tangential tenuous terse timid timorous
torpid tortuous tractable transient trenchant truculent turgid
ubiquitous unctuous unprecedented unruly upbraid usurp utilitarian
vacillate vacuous vapid vehement veneer venerable verbose
vex vigilant vilify vindicate vindictive virtuoso virulent
vitriolic vociferous volatile voracious wanting wistful zeal
zealot zealous zenith
abate abhor abscond abstain acumen admonish affluent anarchy apathy appease arcane arduous astute augment austere
aberration abrogate acrimonious adulation altruism ambivalent antagonist antithesis avarice aversion bombastic
acquiesce audacious auspicious authoritarian
benign bolster candid caustic coerce concise condone cursory daunt dearth demure deride
desist despot detract discreet disparage divulge dogma dubious eclectic elusive emulate
erudite esoteric exacerbate exemplary expedite extol fallacy fervent fortuitous frugal futile
garrulous guile haughty hedonist heresy hiatus hyperbole
ignominious impugn inane incisive incongruous indigent inept infamy ingenuous innocuous
inundate jargon jovial judicious
laud levity lucrative lurid
malleable maxim meander mediocre melancholy mercenary
miser modicum munificent myriad nadir nascent neophyte nonchalant
obsequious obtuse odious ominous opaque
overt pacify painstaking palliate palpable panacea paramount pariah
parody parsimonious pathos patronize pecuniary pedantic penitent pensive
peripheral permeate perplex pious plight polarize ponderous portent
precedent precept predecessor predispose preeminent preempt premise premonition preponderance
prerogative presage presentiment prestige presumptuous pretentious pretext prevalent
privation probity procrastinate prodigy profane profound profuse prognosis proliferate
prologue promulgate propaganda prophetic propitious proponent propriety proscribe
protocol prototype protract provisional prowess proximity proxy prurient
pseudonym psyche pundit pungent punitive purge purport putative
quagmire quaint quarantine quash quell quibble quiescent quirk quisling quizzical quotidian
compunction conflagration contemplative cosmopolitan credulous
dilapidated disconcerting egalitarian
extraneous extrapolate homogeneous
inadvertent inarticulate incarceration intransigent
loquacious philanthropic
docile cognizant complacent
equanimity
brusque buoyant candor censure coalesce coincide contrite deplore diatribe elicit espouse evoke flagrant fervor impede innate meager
perpetuate partisan
anomalous assiduity bellicose commensurate dilatory ersatz impecunious imperturbable inchoate incontrovertible iniquity inscrutable inure jejune largess ludicrous maladroit misanthrope multifarious myopic penurious perfidious pertinacious phlegmatic predilection prevaricate profligate progenitor protean puerile pugnacious pulchritude punctilious querulous quixotic rancorous recalcitrant recondite redolent remonstrate reprehensible reproach repudiate ruminate sanctimonious sanguine sardonic scathing sedentary sententious serendipity servile solicitous sophistry soporific spurious stentorian stolid strident stymie subjugate subterfuge sycophant taciturn tangential tenuous timorous torpid tortuous tractable trenchant truculent turgid unctuous upbraid usurp vacillate vacuous vapid vehement veneer venerable vilify vindicate vindictive virtuoso virulent vitriolic vociferous voracious
heresy hedonist
`);

/** Common school -tion/-sion nouns — Intermediate, never Advanced by shape alone. */
export const SCHOOL_ATION = bag(`
nation station question attention condition education information situation conversation celebration competition
relation direction collection protection connection correction selection election fiction section fraction
action reaction attraction subtraction addition multiplication division television permission decision
discussion conclusion introduction organisation organization communication transportation imagination
description destination invitation preparation presentation population compensation ratification
`);

/**
 * School / everyday lemmas forced Intermediate even if shape looks “hard”
 * (long, many syllables, mild Latinate clusters).
 */
export const SCHOOL_FORCE_INTERMEDIATE = bag(`
communicate communication compensation comprehensive considerable consequently construct construction
fundamental investigate investigation intelligence inexperienced irresponsible participate participation
professional significant simultaneous sophisticated technique traditional incorporate unqualified
allocate allocation assert assertion denote denotation approximate approximation differentiate differentiation
imply implication critical categorical hypothesis
`);

/** Everyday lemmas forced Beginner (overrides Intermediate shape noise). */
export const EVERYDAY_FORCE_BEGINNER = bag(`
delicious suspicious precious comfortable uncomfortable unreliable reliable interesting boring exciting
dangerous healthy unhealthy beautiful wonderful terrible possible impossible
afraid angry happy sad brave quiet loud busy tired hungry thirsty careful helpful
big small free hard fast poor quiet some sudden tidy willing brief cheap constant
`);
