import type { LiveBucket } from './vocab';

export type ListenQuestion = {
  id: string;
  prompt: string;
  answer: string;
  distractors: [string, string];
};

export type ListenRise = {
  answer: string;
  rhymes: [string, string];
};

export type ListenPassage = {
  id: string;
  level: LiveBucket;
  title: string;
  text: string;
  questions: ListenQuestion[];
  /** Beginner only: the spoken word, plus two rhymes that are not in the story. */
  rises?: ListenRise[];
};

export const LISTEN_RATES: Record<LiveBucket, number> = {
  beginner: 0.82,
  intermediate: 0.94,
  advanced: 1,
};

/** Extra full plays after the first. Beginner is unlimited. */
export const LISTEN_REPLAYS: Record<LiveBucket, number | null> = {
  beginner: null,
  intermediate: 2,
  advanced: 1,
};

export const LISTEN_INTRO: Record<LiveBucket, string> = {
  beginner: 'Tap the word you hear. Rhymes float up with it.',
  intermediate: 'Answer while the story plays. You get two replays.',
  advanced: 'Answer while the story plays. You get one replay.',
};

const PASSAGES: ListenPassage[] = [
  {
    id: 'beginner-rain',
    level: 'beginner',
    title: 'Before school',
    text: 'Maya looked out the window before school. The sky was still dark, and she could hear birds outside. She washed her face, got dressed, and packed her bag with her book and her pencil. Her mother made breakfast with warm milk and a piece of bread. "Don\'t forget your umbrella," her mother said. "It might rain today." Maya smiled and hooked it on her bag. She walked to the bus stop with her friend Arun. They talked about the class and their homework. The street was quiet. A few cars passed, and the wind felt cool. When the bus came, they sat near the front. At school the teacher was kind, and the lesson was quiet.',
    questions: [
      { id: 'umbrella', prompt: 'What did Maya\'s mother tell her not to forget?', answer: 'umbrella', distractors: ['notebook', 'lunchbox'] },
      { id: 'window', prompt: 'Where did Maya look before she left home?', answer: 'window', distractors: ['door', 'roof'] },
      { id: 'breakfast', prompt: 'What did her mother make?', answer: 'breakfast', distractors: ['dinner', 'lunch'] },
      { id: 'friend', prompt: 'Who walked with Maya to the bus stop?', answer: 'friend', distractors: ['cousin', 'uncle'] },
    ],
    rises: [
      { answer: 'sky', rhymes: ['fly', 'pie'] },
      { answer: 'bag', rhymes: ['flag', 'tag'] },
      { answer: 'rain', rhymes: ['train', 'pain'] },
      { answer: 'friend', rhymes: ['send', 'bend'] },
      { answer: 'cool', rhymes: ['pool', 'stool'] },
    ],
  },
  {
    id: 'beginner-evening',
    level: 'beginner',
    title: 'After class',
    text: 'Arun was hungry after class. He walked home slowly and sat at the table. His father put rice and water on his plate and asked about the day. The kitchen was warm, and the window was open. Arun washed his hands and said thank you. He ate quietly, then opened his book and read for a little while. The story was funny, and he smiled at the last page. Later he helped his sister clean the room. They picked up the toys, put them in a box, and closed the door. His sister sang a short song while they worked. Before night, the house grew still. Arun looked at the moon from his bed, pulled up the blanket, and went to sleep.',
    questions: [
      { id: 'hungry', prompt: 'How did Arun feel after class?', answer: 'hungry', distractors: ['thirsty', 'angry'] },
      { id: 'kitchen', prompt: 'Which room was warm?', answer: 'kitchen', distractors: ['bathroom', 'garden'] },
      { id: 'book', prompt: 'What did Arun open so he could read?', answer: 'book', distractors: ['letter', 'map'] },
      { id: 'moon', prompt: 'What did Arun look at before night?', answer: 'moon', distractors: ['sun', 'star'] },
    ],
    rises: [
      { answer: 'day', rhymes: ['play', 'stay'] },
      { answer: 'book', rhymes: ['look', 'cook'] },
      { answer: 'room', rhymes: ['broom', 'bloom'] },
      { answer: 'song', rhymes: ['long', 'strong'] },
      { answer: 'moon', rhymes: ['soon', 'spoon'] },
    ],
  },
  {
    id: 'beginner-park',
    level: 'beginner',
    title: 'The park',
    text: 'Lina went to the park with her brother after lunch. The grass was green and the sun was bright. She saw a dog near the gate and a bird in the tree. They ran and laughed. A woman sat on a bench with a cup of tea. Lina waved, then sat down to rest. The sky stayed clear. Her brother brought a ball and played with it. When it was time to go, she held her brother\'s hand and walked home.',
    questions: [
      { id: 'park', prompt: 'Where did Lina go after lunch?', answer: 'park', distractors: ['school', 'beach'] },
      { id: 'grass', prompt: 'What was green?', answer: 'grass', distractors: ['sand', 'snow'] },
      { id: 'ball', prompt: 'What did her brother bring?', answer: 'ball', distractors: ['kite', 'rope'] },
      { id: 'bird', prompt: 'What was in the tree?', answer: 'bird', distractors: ['cat', 'nest'] },
    ],
    rises: [
      { answer: 'park', rhymes: ['dark', 'mark'] },
      { answer: 'grass', rhymes: ['class', 'glass'] },
      { answer: 'sun', rhymes: ['fun', 'bun'] },
      { answer: 'bird', rhymes: ['word', 'third'] },
      { answer: 'ball', rhymes: ['call', 'tall'] },
    ],
  },
  {
    id: 'beginner-market',
    level: 'beginner',
    title: 'The market',
    text: 'Ravi and his aunt went to the market on Saturday. The street was busy. They bought fruit, bread, and a bottle of milk. Ravi carried the bag. A shopkeeper smiled and gave him a sweet. The clock on the wall showed four. They paid and said goodbye. On the way home, Ravi told his aunt about school. She listened and nodded. The bag was heavy, but Ravi felt proud.',
    questions: [
      { id: 'aunt', prompt: 'Who went to the market with Ravi?', answer: 'aunt', distractors: ['uncle', 'cousin'] },
      { id: 'milk', prompt: 'What was in the bottle?', answer: 'milk', distractors: ['juice', 'rice'] },
      { id: 'sweet', prompt: 'What did the shopkeeper give Ravi?', answer: 'sweet', distractors: ['coin', 'pen'] },
      { id: 'bag', prompt: 'What did Ravi carry?', answer: 'bag', distractors: ['box', 'basket'] },
    ],
    rises: [
      { answer: 'fruit', rhymes: ['suit', 'boot'] },
      { answer: 'bread', rhymes: ['head', 'thread'] },
      { answer: 'sweet', rhymes: ['feet', 'meet'] },
      { answer: 'clock', rhymes: ['lock', 'rock'] },
      { answer: 'bag', rhymes: ['flag', 'rag'] },
    ],
  },
  {
    id: 'beginner-library',
    level: 'beginner',
    title: 'The library',
    text: 'Meera loved the library. It was quiet and cool. She chose a book about the sea and sat at a small table. The pages were clean. She read about a fish and a boat. A bell rang softly when it was time to stop. She closed the book and put it back on the shelf. The librarian smiled. Meera waved and stepped into the warm street.',
    questions: [
      { id: 'library', prompt: 'Where did Meera go?', answer: 'library', distractors: ['museum', 'station'] },
      { id: 'sea', prompt: 'What was the book about?', answer: 'sea', distractors: ['farm', 'moon'] },
      { id: 'table', prompt: 'Where did Meera sit?', answer: 'table', distractors: ['floor', 'stair'] },
      { id: 'bell', prompt: 'What rang softly?', answer: 'bell', distractors: ['phone', 'drum'] },
    ],
    rises: [
      { answer: 'book', rhymes: ['look', 'cook'] },
      { answer: 'sea', rhymes: ['tea', 'key'] },
      { answer: 'fish', rhymes: ['dish', 'wish'] },
      { answer: 'boat', rhymes: ['coat', 'goat'] },
      { answer: 'bell', rhymes: ['well', 'shell'] },
    ],
  },
  {
    id: 'intermediate-project',
    level: 'intermediate',
    title: 'The science project',
    text: 'The science teacher told the class about a new project that would run for three weeks. Every student could explain an idea, and the class would listen. Maya was curious about how plants grow in light, but she was not confident. She had never spoken in front of so many people, and the work looked difficult. At break, her friend said they should do the research together and share the reading. Maya had to decide quickly, because the schedule was short and the first notes were due on Friday. She knew the project was important for the school community, and that younger students might visit their table. It was also a real opportunity to learn from the experience of planning, measuring, and writing. They made a simple plan, listed the steps, and gave the experiment priority over other homework. Each afternoon they checked the plants, wrote what they saw, and asked the teacher one question. By the end of the week Maya felt more responsible. She could explain the idea clearly, and she was ready for the challenge of speaking to the class, even though her voice still shook a little at the start. On the morning itself she arrived early, set the pots in a row, and read her notes once more. When her name was called she looked at her friend, then at the plants, and began. The class asked how often they had watered them and what had changed by the window. Maya answered each question in turn. She did not rush. Afterwards the teacher said the records were clear and the teamwork had been steady. Maya walked back to her seat with her hands still cold, but she was smiling.',
    questions: [
      { id: 'curious', prompt: 'How did Maya feel about plants and light?', answer: 'curious', distractors: ['serious', 'popular'] },
      { id: 'confident', prompt: 'What was Maya not, when she first heard the task?', answer: 'confident', distractors: ['independent', 'creative'] },
      { id: 'research', prompt: 'What did her friend say they should do together?', answer: 'research', distractors: ['presentation', 'evaluation'] },
      { id: 'opportunity', prompt: 'What did Maya call this project, as a way to learn?', answer: 'opportunity', distractors: ['advantage', 'purpose'] },
      { id: 'challenge', prompt: 'What was she ready for at the end of the week?', answer: 'challenge', distractors: ['problem', 'solution'] },
    ],
  },
  {
    id: 'intermediate-garden',
    level: 'intermediate',
    title: 'The school garden',
    text: 'On Monday the class had to compare two ideas for a community garden behind the library. Some students wanted flowers along the path. Others wanted vegetables in neat rows. The teacher asked them to name the purpose of the garden and to think about how the school would use it through the year. It was necessary to agree, although their opinions were different and nobody wanted to give up a favourite plant. Nina recommended a simple plan. She said vegetables were more useful, because students could learn about health and food, and the kitchen could use what they grew. Ravi wanted flowers, because they were beautiful and the entrance would look bright. The discussion stayed calm. Students took turns, wrote both ideas on the board, and asked what would happen in the hot months. A few worried about water. Others talked about tools and who would come after class. Finally the class chose vegetables as the better solution for this year, and they left flowers for another year when they had more time and more help. Nina wrote the decision in the class book. Ravi offered to paint small signs for the rows so younger children would know what was growing. The teacher asked two students to check the soil each Monday and to tell the class if the leaves looked weak. They agreed to bring water from the tap by the library and to keep tools in a locked cupboard. Nobody argued. The bell rang, and the class left with a plan they could start the next dry afternoon.',
    questions: [
      { id: 'compare', prompt: 'What did the class have to do with the two ideas?', answer: 'compare', distractors: ['imagine', 'remember'] },
      { id: 'purpose', prompt: 'What did the teacher ask them to name?', answer: 'purpose', distractors: ['reason', 'example'] },
      { id: 'necessary', prompt: 'What word tells us they had to agree?', answer: 'necessary', distractors: ['important', 'difficult'] },
      { id: 'recommended', prompt: 'What did Nina do with her plan?', answer: 'recommended', distractors: ['suggested', 'explained'] },
      { id: 'solution', prompt: 'What did the class call the vegetable plan?', answer: 'solution', distractors: ['advantage', 'opportunity'] },
    ],
  },
  {
    id: 'advanced-feedback',
    level: 'advanced',
    title: 'The committee',
    text: 'Maya read the committee feedback twice, then a third time with a pencil in her hand. At first the decision seemed arbitrary. Her hypothesis about light and plants had taken weeks of measuring and late afternoons in the lab, and she thought the committee had dismissed it without real attention. She closed the file, walked once around the library, and sat down again. When she read the notes slowly, she found the reasoning meticulous. They had not rejected the idea. They had marked the places where her claim ran ahead of her numbers. They asked her to substantiate the hypothesis with clearer evidence, and to be pragmatic about what she could test in one term with the equipment the school already owned. The request was a way to mitigate the weak points before the final review, not a reason to start over. She stayed conscientious. She checked every line, separated what she had observed from what she had only hoped, and wrote a shorter plan with dates. In the morning she asked a teacher to corroborate her reading of the comments, to be sure she had not softened them. The teacher agreed with her new plan. By evening the work felt hard, but fair, and Maya could see the next step instead of only the disappointment. She spent the next days on a narrower test. She wrote what she would measure, how often, and what result would make her change her mind. She cut three pages that repeated the same claim. She asked two classmates to try the instructions without her help, and she fixed the line they both misunderstood. When she returned the file, it was shorter and steadier. The committee did not praise her. They simply accepted the revised plan and gave her a date for the next check. That was enough. Maya pinned the date above her desk and started the first measurement that same afternoon. She kept a spare notebook for mistakes, so the clean pages would show only what she could defend. When a number looked too neat, she measured again. When a sentence sounded grander than the data, she cut it. The work was quiet and ordinary, which surprised her. The fear had been loud. The repair was not. On the check date she arrived with the pots, the table of numbers, and the shorter plan. She did not argue with the first decision. She showed what had changed. The committee asked fewer questions this time, and the ones they asked she could answer from the page in front of her.',
    questions: [
      { id: 'arbitrary', prompt: 'How did the decision seem at first?', answer: 'arbitrary', distractors: ['mediocre', 'perfunctory'] },
      { id: 'meticulous', prompt: 'How did she describe the reasoning after a second reading?', answer: 'meticulous', distractors: ['ubiquitous', 'ephemeral'] },
      { id: 'substantiate', prompt: 'What did they ask her to do to the hypothesis?', answer: 'substantiate', distractors: ['ameliorate', 'exacerbate'] },
      { id: 'pragmatic', prompt: 'What kind of test did they want for one term?', answer: 'pragmatic', distractors: ['eloquent', 'dogmatic'] },
      { id: 'corroborate', prompt: 'What did she ask a teacher to do with her reading?', answer: 'corroborate', distractors: ['scrutinize', 'infer'] },
    ],
  },
  {
    id: 'advanced-storm',
    level: 'advanced',
    title: 'The shelter',
    text: 'The city council faced an unprecedented storm that arrived before dawn. Homes near the river were damaged, the water was already high, and the bridges were closed. People stood in doorways with bags and children, waiting for news. A quick speech full of eloquent promises would not keep them safe, and the mayor knew it. She chose a practical plan: open the school as a shelter, move families inside before the next surge, and mitigate the danger before night. Maps were spread on a table. Teachers unlocked classrooms. The kitchen lights came on. Critics called the plan too plain and said a larger hall would have been grander, but the volunteers were conscientious. They worked in the rain without complaint, carried blankets, marked names, and checked the rooms twice. Some reports tried to spread fear, describing waves that had not reached the town. The mayor asked the public to stay calm, to trust the people at the school, and to refute rumours that sent neighbours towards a bridge that was no longer open. Radios repeated the same short instructions. By morning the shelter was full, the river had stopped rising, and the town was quieter than anyone had expected. Families slept on mats in the classrooms. A nurse moved from room to room. At the door, volunteers wrote names and checked who still needed dry clothes. The mayor stayed until the lists matched. When the water fell back from the road, she walked to the river with two engineers and looked at the bank in daylight. There were cracks, but the shelter had held. She thanked the people who had carried blankets through the night and told the town they could return home in small groups, street by street. The radios changed their message. Children collected the cups. By the second evening the school was a school again, and the storm was only a mark on the wall where the water had stopped. In the days after, the council walked the streets that had flooded and wrote down which drains had failed. Shopkeepers swept mud from their floors and set chairs back outside. The school bell rang on time. Children pointed at the line on the paint and told the story louder than it had been. The mayor asked them to keep the telling accurate, and to thank the people who had stayed awake. A week later the lists were filed, the blankets were washed, and the town had a plainer memory of the night: not the fear on the radio, but the doors that opened and the names that were checked twice.',
    questions: [
      { id: 'unprecedented', prompt: 'What kind of storm did the council face?', answer: 'unprecedented', distractors: ['ephemeral', 'archaic'] },
      { id: 'eloquent', prompt: 'What kind of promises would not keep people safe?', answer: 'eloquent', distractors: ['laconic', 'reticent'] },
      { id: 'mitigate', prompt: 'What did the plan try to do to the danger?', answer: 'mitigate', distractors: ['ameliorate', 'subjugate'] },
      { id: 'conscientious', prompt: 'What were the volunteers?', answer: 'conscientious', distractors: ['meticulous', 'fastidious'] },
      { id: 'refute', prompt: 'What did the mayor ask the public to do to rumours?', answer: 'refute', distractors: ['concede', 'corroborate'] },
    ],
  },
];

function mentions(text: string, word: string) {
  return new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(text);
}

function checkPassages(passages: ListenPassage[]) {
  for (const passage of passages) {
    for (const question of passage.questions) {
      if (!mentions(passage.text, question.answer)) throw new Error(`Listening answer missing from ${passage.id}: ${question.answer}`);
      for (const distractor of question.distractors) {
        if (mentions(passage.text, distractor)) throw new Error(`Listening distractor is spoken in ${passage.id}: ${distractor}`);
      }
    }
    for (const rise of passage.rises ?? []) {
      if (!mentions(passage.text, rise.answer)) throw new Error(`Listening rise missing from ${passage.id}: ${rise.answer}`);
      for (const rhyme of rise.rhymes) {
        if (mentions(passage.text, rhyme)) throw new Error(`Listening rhyme is spoken in ${passage.id}: ${rhyme}`);
      }
    }
  }
}

checkPassages(PASSAGES);

export function passagesFor(level: LiveBucket) {
  return PASSAGES.filter((passage) => passage.level === level);
}

export function pickPassage(level: LiveBucket, avoidId?: string | null) {
  const bank = passagesFor(level);
  const choices = bank.filter((passage) => passage.id !== avoidId);
  const pool = choices.length ? choices : bank;
  return pool[Math.floor(Math.random() * pool.length)] ?? bank[0];
}
