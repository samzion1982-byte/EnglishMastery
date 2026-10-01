import { writeFileSync } from 'node:fs';
import { register } from './more-topics.mjs';

/** @type {Array<[string, string, string, string, string, string, string, string, Array<[string, string, string, string, string, number, string]>]>} */
const seeds = [];

function add(level, section, id, title, summary, good, goodNote, weak, weakNote, questions) {
  if (questions.length !== 4) throw new Error(id + ' needs 4 questions');
  for (const q of questions) {
    if (!Number.isInteger(q[5]) || q[5] < 0 || q[5] > 3) throw new Error(id + ' bad index');
    if (q.length !== 7) throw new Error(id + ' bad question');
  }
  seeds.push([level, section, id, title, summary, good, goodNote, weak, weakNote, questions]);
}

const q = (prompt, a, b, c, d, index, why) => [prompt, a, b, c, d, index, why];

add('beginner', 'Foundations', 'BEG-01', 'Parts of speech',
  'A part of speech is the job a word does in a sentence.',
  'Maya grabbed her loud phone.',
  'Maya is a noun, grabbed is a verb, loud is an adjective.',
  'Grabbed loud Maya her.',
  'The same words have no clear jobs.',
  [
    q('Which word is the verb in “Maya grabbed her phone”?', 'phone', 'grabbed', 'loud', 'her', 1, 'Grabbed is the action. Phone names a thing.'),
    q('Loud in “loud phone” is…', 'a noun', 'a verb', 'an adjective', 'a pronoun', 2, 'Loud describes the noun phone.'),
    q('Her stands in for Maya. Her is a…', 'pronoun', 'preposition', 'conjunction', 'noun', 0, 'A pronoun takes the place of a noun.'),
    q('Which line gives each word a clear job?', 'Maya grabbed her loud phone.', 'Grabbed loud Maya her.', 'Phone loud grabbed her.', 'Her Maya grabbed phone loud.', 0, 'The first line has a person, an action, and a describing word in a natural order.'),
  ]);

add('beginner', 'Foundations', 'BEG-02', 'Types of sentences',
  'A sentence can tell, ask, command, or exclaim.',
  'Did you miss the bus?',
  'This asks for an answer.',
  'You did miss the bus.',
  'This tells a fact. It does not ask.',
  [
    q('“Sit down.” is a…', 'question', 'command', 'statement of fact only', 'fragment', 1, 'It tells someone what to do.'),
    q('Which one asks?', 'The bus left.', 'The bus left!', 'Did the bus leave?', 'Leave now.', 2, 'Did…? is a question.'),
    q('“We missed the last bus.” is a…', 'statement', 'command', 'question', 'single word', 0, 'It tells what happened.'),
    q('Which ending matches a question?', 'We left.', 'Did we leave?', 'Leave.', 'We left!', 1, 'A question asks, and this one starts with did.'),
  ]);

add('beginner', 'Foundations', 'BEG-03', 'Subject and predicate',
  'The subject is who or what the sentence is about. The predicate is what they do or are.',
  'The last bus left without us.',
  'The last bus is the subject. Left without us is the predicate.',
  'Left without us.',
  'The action is there, but nobody is named.',
  [
    q('What is the subject of “Nobody remembered the homework”?', 'Nobody', 'remembered', 'the homework', 'remembered the homework', 0, 'Nobody is who the sentence is about.'),
    q('The predicate of “The last bus left without us” is…', 'The last bus', 'left without us', 'bus', 'the', 1, 'Left without us tells what the bus did.'),
    q('Which line is missing a subject?', 'My group chat blew up.', 'Blew up during dinner.', 'Priya laughed.', 'The bus waited.', 1, 'Blew up needs someone or something in front of it.'),
    q('In “We missed the train,” we is the…', 'subject', 'predicate', 'object only', 'article', 0, 'We is who the sentence is about.'),
  ]);

add('beginner', 'Foundations', 'BEG-04', 'Objects and complements',
  'An object receives the action. A complement completes the meaning after a linking verb.',
  'She texted Priya. The quiz was easy.',
  'Priya receives texted. Easy describes the quiz.',
  'She texted. The quiz.',
  'Texted has no receiver, and the quiz has no completion.',
  [
    q('In “She texted Priya,” Priya is the…', 'subject', 'object', 'article', 'adverb', 1, 'Priya receives the text.'),
    q('In “The quiz was easy,” easy is a…', 'complement', 'command', 'pronoun', 'preposition', 0, 'Easy completes what the quiz was.'),
    q('Which sentence has an object?', 'She slept.', 'She sent a message.', 'She is tired.', 'She arrived.', 1, 'A message is what she sent.'),
    q('Which complement fits? The hallway was ___.', 'quiet', 'quietly', 'a send', 'texted', 0, 'Quiet describes the hallway after was.'),
  ]);

add('beginner', 'Foundations', 'BEG-05', 'Phrases and clauses',
  'A phrase is a group of words without its own subject and verb. A clause has both.',
  'When the bus left, we were still inside.',
  'When the bus left is a clause: bus is the subject and left is the verb.',
  'At the bus stop.',
  'That is only a phrase. It does not say who did what.',
  [
    q('“At the bus stop” is a…', 'phrase', 'full sentence', 'question', 'command', 0, 'It has no subject and verb of its own.'),
    q('Which group is a clause?', 'after school', 'the loud phone', 'when the bus left', 'in a hurry', 2, 'The bus left has a subject and a verb.'),
    q('A clause needs…', 'a subject and a verb', 'only a noun', 'only a comma', 'two adjectives', 0, 'That pair is what makes a clause.'),
    q('“We missed it” inside a longer sentence is a…', 'clause', 'single noun', 'article', 'spelling rule', 0, 'We is the subject and missed is the verb.'),
  ]);

add('beginner', 'Nouns and Pronouns', 'BEG-06', 'Types of nouns',
  'A noun can name a person, a place, a thing, or an idea.',
  'Courage kept Maya in the cafeteria.',
  'Courage is an idea. Maya is a person. Cafeteria is a place.',
  'Courage kept.',
  'The idea is named, but the sentence does not finish the picture.',
  [
    q('Which noun names an idea?', 'cafeteria', 'Maya', 'courage', 'bus', 2, 'Courage is not a person, place, or thing you can touch.'),
    q('Cafeteria names a…', 'place', 'action', 'describing word', 'question', 0, 'It is a location.'),
    q('Which word is not a noun?', 'phone', 'quickly', 'cousin', 'fries', 1, 'Quickly tells how. The others name something.'),
    q('Maya is which kind of noun?', 'a person', 'a place', 'an idea', 'a helping verb', 0, 'Maya names a person.'),
  ]);

add('beginner', 'Nouns and Pronouns', 'BEG-07', 'Singular and plural nouns',
  'Singular means one. Plural means more than one.',
  'One bus left. Two buses waited.',
  'Bus is one. Buses is more than one.',
  'Two bus waited.',
  'Two needs the plural form.',
  [
    q('Which form means more than one?', 'bus', 'buses', 'a bus', 'the bus', 1, 'Buses is the plural.'),
    q('One phone, many…', 'phone', 'phones', 'a phone', 'phoning', 1, 'Phones is the plural.'),
    q('“Three friend” should be…', 'three friends', 'three a friend', 'friend three', 'three friendes', 0, 'More than one friend takes friends.'),
    q('Which sentence matches one item?', 'The buses are late.', 'A bus is late.', 'Buses leave together.', 'The phones rang.', 1, 'A bus is one bus.'),
  ]);

add('beginner', 'Nouns and Pronouns', 'BEG-08', 'Countable and uncountable nouns',
  'Countable nouns can be numbered. Uncountable nouns are treated as a mass.',
  'I ate two fries and some rice.',
  'Fries can be counted. Rice is treated as a mass.',
  'I ate two rices.',
  'Rice is not normally counted as two rices.',
  [
    q('Which noun is uncountable here?', 'message', 'bus', 'rice', 'friend', 2, 'Rice is a mass, not one rice, two rices.'),
    q('You can count…', 'advice as two advices', 'two messages', 'two furnitures', 'two homeworks', 1, 'Messages come in numbers. Advice and homework usually do not.'),
    q('“Some information” fits because information is…', 'uncountable', 'always plural', 'a pronoun', 'a verb', 0, 'We say some information, not two informations.'),
    q('Which line is natural?', 'I need two informations.', 'I need some information.', 'I need an informations.', 'I need informations three.', 1, 'Information stays uncountable.'),
  ]);

add('beginner', 'Nouns and Pronouns', 'BEG-09', 'Possessive forms',
  'A possessive shows that something belongs to someone.',
  'Maya’s phone is in Priya’s bag.',
  'The apostrophe shows whose phone and whose bag.',
  'Mayas phone is in Priyas bag.',
  'Without the apostrophe, the ownership is not marked.',
  [
    q('Which mark shows ownership?', 'Maya’s phone', 'Mayas phone', 'Maya phone', 'phone Maya', 0, 'The apostrophe plus s shows the phone belongs to Maya.'),
    q('The bag belonging to the students is…', 'the students bag', 'the student’s bags only', 'the students’ bag', 'the students’s bag', 2, 'A plural ending in s takes the apostrophe after the s.'),
    q('“The phone’s screen” means…', 'the screen of the phone', 'a screen named phone', 'two screens', 'a verb', 0, 'The possessive ties the screen to the phone.'),
    q('Which is a possessive?', 'its screen', 'it’s late', 'it is', 'it screens', 0, 'Its shows ownership. It’s means it is.'),
  ]);

add('beginner', 'Nouns and Pronouns', 'BEG-10', 'Types of pronouns',
  'Pronouns stand in for nouns: I, you, she, they, it, mine, who.',
  'Maya forgot her charger, so she borrowed mine.',
  'Her, she, and mine all point back without repeating the names.',
  'Maya forgot Maya’s charger, so Maya borrowed Maya’s.',
  'The name is repeated instead of using a pronoun.',
  [
    q('Which word is a pronoun?', 'charger', 'she', 'forgot', 'borrowed', 1, 'She stands in for Maya.'),
    q('Mine in “borrowed mine” refers to…', 'my charger', 'the bus', 'a verb', 'a place', 0, 'Mine means the one that belongs to me.'),
    q('They is used for…', 'one thing', 'more than one person or a group', 'only a question', 'an adjective', 1, 'They replaces a plural noun.'),
    q('Which sentence uses a pronoun?', 'Jordan grabbed his bag.', 'Jordan grabbed Jordan bag.', 'Grabbed the bag Jordan.', 'Bag Jordan grabbed.', 0, 'His replaces Jordan’s.'),
  ]);

add('beginner', 'Nouns and Pronouns', 'BEG-11', 'Pronoun–antecedent agreement',
  'A pronoun must match the noun it points back to, in number and person.',
  'Each student packed their own lunch. The team won its match.',
  'The pronoun agrees with the noun it replaces.',
  'Each student packed our own lunch.',
  'Our does not match each student.',
  [
    q('“The team won ___ match.”', 'its', 'their only if you mean the players', 'our', 'my', 0, 'Team as one group takes its.'),
    q('“Maya said ___ was late.”', 'she', 'they', 'it', 'we', 0, 'Maya is one person, so she matches.'),
    q('Which pronoun disagrees?', 'The buses left. They were full.', 'A student forgot their pass.', 'Priya lost his notes when Priya is a girl named in the sentence as she.', 'We missed it.', 2, 'If Priya is she, his does not agree.'),
    q('The noun a pronoun points to is called the…', 'antecedent', 'adverb', 'article', 'comma', 0, 'The antecedent is the earlier noun.'),
  ]);

add('beginner', 'Nouns and Pronouns', 'BEG-12', 'Correct pronoun usage',
  'Use the subject form when the pronoun does the action, and the object form when it receives it.',
  'She texted me. I texted her.',
  'She and I are subjects. Me and her are objects.',
  'Her texted I.',
  'The subject and object forms are swapped.',
  [
    q('Which is the subject form?', 'I texted her.', 'Me texted she.', 'Her texted I.', 'Them called we.', 0, 'I is the subject. Her is the object.'),
    q('“Between you and ___.”', 'me', 'I', 'she', 'they', 0, 'Between is followed by the object form me.'),
    q('“___ and Maya missed the bus.”', 'She', 'Her', 'Them', 'Me', 0, 'The pronoun is part of the subject, so she fits.'),
    q('Choose the natural line.', 'The teacher called us.', 'The teacher called we.', 'Us called the teacher did.', 'Me and her was called.', 0, 'Us is the object of called.'),
  ]);

add('beginner', 'Verbs (basic forms)', 'BEG-13', 'Main and helping verbs',
  'The main verb carries the meaning. A helping verb supports the tense or the question.',
  'She is saving a seat. They have left.',
  'Saving and left are the main verbs. Is and have help them.',
  'She saving a seat.',
  'The -ing form needs a helping verb here.',
  [
    q('In “She is saving a seat,” the main verb is…', 'is', 'saving', 'seat', 'she', 1, 'Saving carries the action. Is helps it.'),
    q('Which helping verb fits? ___ she leave yet?', 'Has', 'Leave', 'Yet', 'Seat', 0, 'Has helps leave to make the question.'),
    q('“They have left” — have is…', 'a helping verb', 'the object', 'an adjective', 'a noun', 0, 'Have supports the main verb left.'),
    q('Which line is complete?', 'She is texting.', 'She texting.', 'Is texting she now only.', 'Texting she.', 0, 'Is plus texting is a complete verb phrase.'),
  ]);

add('beginner', 'Verbs (basic forms)', 'BEG-14', 'Transitive and intransitive verbs',
  'A transitive verb needs an object. An intransitive verb does not.',
  'She sent a message. Then she slept.',
  'Sent needs a message. Slept does not need an object.',
  'She sent. Then she slept a message.',
  'Sent is missing its object, and slept does not take one.',
  [
    q('Which verb is transitive?', 'slept', 'arrived', 'sent', 'waited', 2, 'Sent needs something that was sent.'),
    q('“She slept” is complete because slept is…', 'intransitive', 'always plural', 'an article', 'a noun', 0, 'It does not need an object.'),
    q('Which line gives the transitive verb its object?', 'She sent a message.', 'She sent.', 'She message.', 'Sent she.', 0, 'A message is the object.'),
    q('Arrived in “The bus arrived” is…', 'intransitive', 'transitive with a hidden object', 'an adjective', 'a pronoun', 0, 'Arrived does not take an object here.'),
  ]);

add('beginner', 'Verbs (basic forms)', 'BEG-15', 'Regular and irregular verbs',
  'Regular past forms add -ed. Irregular past forms change shape.',
  'We missed the bus and left.',
  'Missed is regular. Left is the irregular past of leave.',
  'We miss the bus and leaved yesterday.',
  'Yesterday needs a past form, and leaved is not the past of leave.',
  [
    q('The past of leave is…', 'leaved', 'left', 'leaving', 'leaves', 1, 'Left is irregular.'),
    q('Which past form is regular?', 'left', 'went', 'missed', 'took', 2, 'Missed adds -ed to miss.'),
    q('Yesterday she ___ the file.', 'sent', 'send', 'sending', 'sends always', 0, 'Sent is the irregular past of send.'),
    q('Which pair is correct?', 'go / went', 'go / goed', 'take / taked', 'leave / leaved', 0, 'Went is the irregular past of go.'),
  ]);

add('beginner', 'Verbs (basic forms)', 'BEG-16', 'Subject–verb agreement',
  'A singular subject takes a singular verb. A plural subject takes a plural verb.',
  'The bus leaves at 7. The buses leave at 7.',
  'One bus takes leaves. Several buses take leave.',
  'The bus leave at 7. The buses leaves at 7.',
  'The endings are swapped.',
  [
    q('“She ___ the 7:40 bus.”', 'takes', 'take', 'taking', 'taken', 0, 'She is singular, so takes.'),
    q('“They ___ the 7:40 bus.”', 'take', 'takes', 'takes often', 'a take', 0, 'They is plural, so take.'),
    q('Which sentence agrees?', 'The list of names is long.', 'The list of names are long.', 'She take the bus.', 'They takes the bus.', 0, 'List is the singular subject, not names.'),
    q('Maya and Priya ___ waiting.', 'are', 'is', 'am', 'be', 0, 'Two people together are plural.'),
  ]);

add('beginner', 'Modifiers and Determiners', 'BEG-17', 'Types of adjectives',
  'An adjective describes a noun: which one, what kind, or how many.',
  'Those three loud notifications ruined the quiet scene.',
  'Those, three, loud, and quiet all describe nouns.',
  'Notifications ruined loudly scene.',
  'Loudly describes an action, not the scene.',
  [
    q('Which word describes a noun?', 'quietly', 'loud', 'left', 'quickly', 1, 'Loud can describe a notification. Quietly describes an action.'),
    q('In “three buses,” three tells…', 'how many', 'how the bus drove', 'who owns it', 'a tense', 0, 'Three is a quantity adjective.'),
    q('“Those seats” — those tells…', 'which ones', 'a verb', 'a pronoun only', 'a command', 0, 'Those points out which seats.'),
    q('Which is an adjective use?', 'a quiet scene', 'she left quietly', 'they left', 'a leaving', 0, 'Quiet describes scene.'),
  ]);

add('beginner', 'Modifiers and Determiners', 'BEG-18', 'Degrees of comparison',
  'Compare one thing, two things, or more than two: tall, taller, tallest.',
  'This seat is bigger than that one. It is the biggest on the bus.',
  'Bigger compares two. Biggest compares with the whole group.',
  'This seat is the bigger on the bus.',
  'The group needs the biggest, not the bigger.',
  [
    q('Comparing two phones, you say…', 'better', 'best', 'goodest', 'most good', 0, 'Better is the form for two.'),
    q('Of all the seats, this is the…', 'biggest', 'bigger', 'big', 'most big', 0, 'The superlative covers the whole group.'),
    q('“More careful than” compares…', 'two actions or people', 'a list of ten with the', 'a command', 'a pronoun', 0, 'Than marks a comparison of two.'),
    q('Which line is right?', 'She is the tallest in the group.', 'She is the taller in the group.', 'She is most tallest.', 'She is taller of the whole class without the.', 0, 'Tallest is the form for the whole group.'),
  ]);

add('beginner', 'Modifiers and Determiners', 'BEG-19', 'Order of adjectives',
  'When several adjectives stack, opinion usually comes before size, color, and purpose.',
  'A nice small red school bag.',
  'Opinion, size, color, then purpose.',
  'A school red small nice bag.',
  'The usual order is scrambled.',
  [
    q('Which order sounds natural?', 'a nice small red bag', 'a red small nice bag', 'a bag red nice small', 'small red a nice bag', 0, 'Opinion comes before size and color.'),
    q('In “a lovely old song,” lovely is the…', 'opinion', 'color', 'verb', 'object', 0, 'Lovely is a judgment, so it comes early.'),
    q('Color usually comes…', 'after size and before the noun', 'before every opinion', 'after the verb always', 'instead of a noun', 0, 'We say a small red bag, not a red small bag, in the usual stack.'),
    q('Which phrase follows the usual order?', 'a huge grey metal locker', 'a metal grey huge locker', 'a locker huge metal grey', 'grey huge a metal locker', 0, 'Size, color, then material.'),
  ]);

add('beginner', 'Modifiers and Determiners', 'BEG-20', 'Types of adverbs',
  'An adverb tells how, when, where, or how often an action happens.',
  'She answered quietly, then left early.',
  'Quietly tells how. Early tells when.',
  'She answered quiet, then left early bus.',
  'Quiet describes a thing, not the answering.',
  [
    q('Which word tells how she answered?', 'quietly', 'answer', 'she', 'then', 0, 'Quietly modifies the verb.'),
    q('Early in “left early” tells…', 'when', 'which noun', 'who', 'a plural', 0, 'It places the action in time.'),
    q('“She looked everywhere” — everywhere tells…', 'where', 'how many', 'whose', 'a tense', 0, 'Everywhere is a place adverb.'),
    q('Which word is an adverb of frequency?', 'often', 'phone', 'loud', 'bus', 0, 'Often tells how frequently.'),
  ]);

add('beginner', 'Modifiers and Determiners', 'BEG-21', 'Adjective versus adverb',
  'Adjectives describe nouns. Adverbs describe verbs, adjectives, or other adverbs.',
  'It was a quiet bus. She answered quietly.',
  'Quiet describes the bus. Quietly describes answered.',
  'She answered quiet. It was a quietly bus.',
  'The forms are attached to the wrong kind of word.',
  [
    q('Describe the noun bus.', 'quiet', 'quietly', 'quietness as a verb', 'quietly bus', 0, 'Quiet is the adjective.'),
    q('Describe the verb answered.', 'quietly', 'quiet', 'a quiet', 'quieted bus', 0, 'Quietly is the adverb.'),
    q('“She looks ___.” meaning her appearance.', 'calm', 'calmly only', 'a calmly', 'calm verb', 0, 'Looks as a linking verb takes the adjective calm.'),
    q('Which sentence is right?', 'He ran quickly.', 'He ran quick to school in this pair.', 'A quickly runner only.', 'He quick ran.', 0, 'Quickly tells how he ran.'),
  ]);

add('beginner', 'Modifiers and Determiners', 'BEG-22', 'Articles: a, an, the',
  'A and an introduce one new thing. The points to a thing you both already know.',
  'I need a charger. The charger in my bag is dead.',
  'A introduces it. The comes back to that charger.',
  'I need the charger I have never mentioned, and a charger in my bag we both see.',
  'The articles are swapped for a first mention and a known one.',
  [
    q('First mention, consonant sound.', 'a charger', 'an charger', 'the charger we have not identified', 'charger a', 0, 'Charger starts with a consonant sound, and it is new.'),
    q('Umbrella takes…', 'an', 'a', 'no article ever', 'two the', 0, 'Umbrella starts with a vowel sound.'),
    q('“The seat we saved” uses the because…', 'we both know which seat', 'seat starts with a vowel', 'it is a command', 'the is only for people', 0, 'The points to a known seat.'),
    q('Which pair is natural?', 'I found a seat. The seat was sticky.', 'I found an seat.', 'I found a umbrella.', 'I found the seat. A seat was that same one first.', 0, 'A introduces the seat. The returns to it.'),
  ]);

add('beginner', 'Modifiers and Determiners', 'BEG-23', 'Determiners and quantifiers',
  'Determiners and quantifiers say which or how much: this, some, many, a few.',
  'Many students had some time, but few had a pencil.',
  'Many, some, and few measure the nouns.',
  'Much students had a few time.',
  'Much does not fit a plural countable noun, and a few does not fit time here.',
  [
    q('Students can be counted, so use…', 'many', 'much', 'a little students', 'an student', 0, 'Many goes with countable plurals.'),
    q('Time as a mass takes…', 'much time or a little time', 'many time', 'few time', 'a few time', 0, 'Much and a little fit uncountable time.'),
    q('“This seat” tells…', 'which one', 'how the bus moved', 'a past tense', 'a command', 0, 'This is a determiner.'),
    q('Which line is natural?', 'a few friends', 'a few water', 'much friends', 'many water in this pair', 0, 'Friends are countable, so a few fits.'),
  ]);

add('beginner', 'Modifiers and Determiners', 'BEG-24', 'Correct use of prepositions',
  'A preposition shows a relationship such as time, place, or direction.',
  'We meet at 4 on Monday in the library.',
  'At a clock time, on a day, in a place you can be inside.',
  'We meet in 4 on the library at Monday.',
  'The prepositions are paired with the wrong kind of information.',
  [
    q('A clock time takes…', 'at 4', 'on 4', 'in 4', 'by the 4 noun', 0, 'At is used with clock times.'),
    q('A day of the week takes…', 'on Monday', 'at Monday', 'in Monday', 'to Monday as a place', 0, 'On is used with days.'),
    q('“The phone is ___ my bag.”', 'in', 'at', 'on the inside word only if it is a surface', 'to', 0, 'In fits something inside a bag.'),
    q('Which sentence uses the prepositions naturally?', 'She sat on the bench at noon.', 'She sat at the bench on noon.', 'She sat in noon.', 'Noon on she sat bench.', 0, 'On a surface, at a clock time.'),
  ]);

add('beginner', 'Accuracy Basics', 'BEG-25', 'Capitalisation',
  'Capital letters start sentences, names, and the pronoun I.',
  'Maya and I missed the bus on Monday.',
  'The name, I, and the sentence start are capitals. Monday is a name of a day.',
  'maya and i missed the Bus On monday.',
  'The capitals are missing or sitting on ordinary words.',
  [
    q('Which word must stay capital even in the middle?', 'I', 'bus', 'and', 'missed', 0, 'The pronoun I is always capital.'),
    q('A sentence starts with…', 'a capital letter', 'a comma', 'a question mark', 'a small i for I', 0, 'The first word is capitalised.'),
    q('Which line is capitalised correctly?', 'Priya left on Friday.', 'priya left on friday.', 'Priya Left On The Bus.', 'friday is when Priya left.', 0, 'The name and the day take capitals. Ordinary words do not.'),
    q('Names of people take…', 'a capital', 'a plural only', 'an adverb ending', 'no mark', 0, 'Maya and Priya are proper nouns.'),
  ]);

add('beginner', 'Accuracy Basics', 'BEG-26', 'Punctuation',
  'Punctuation shows where a sentence ends and how it is said.',
  'We missed the bus. Did you see it?',
  'A full stop ends the statement. A question mark ends the question.',
  'We missed the bus did you see it',
  'The two sentences are run together with no marks.',
  [
    q('A statement ends with…', 'a full stop', 'a question mark always', 'a comma always', 'nothing', 0, 'The full stop closes a statement.'),
    q('“Did you see it” needs…', '?', '.', 'no mark', 'a capital only', 0, 'It is a question.'),
    q('A comma can…', 'separate items in a list', 'end every sentence', 'replace a verb', 'make a noun plural', 0, 'Phones, chargers, and bags uses commas.'),
    q('Which line is punctuated?', 'Wait. I am coming.', 'Wait I am coming', 'Wait I. am coming', 'Wait? I am. coming now always as one question', 0, 'Each sentence has its own closing mark.'),
  ]);

add('beginner', 'Accuracy Basics', 'BEG-27', 'Sentence fragments',
  'A fragment is a piece that cannot stand alone because it lacks a subject, a verb, or a finished thought.',
  'We missed the bus because we left late.',
  'The because-piece is joined to a full sentence.',
  'Because we left late.',
  'The reason is hanging. It does not say what happened.',
  [
    q('Which one is a fragment?', 'Because we left late.', 'We left late.', 'The bus waited.', 'She laughed.', 0, 'Because… needs a main sentence.'),
    q('A fragment often feels like…', 'an unfinished piece', 'two complete thoughts', 'a correct question', 'a capital name', 0, 'It does not stand on its own.'),
    q('How do you repair “At the stop.”?', 'We waited at the stop.', 'At the stop', 'Stop at.', 'The at.', 0, 'Add who did what.'),
    q('Which line is a full sentence?', 'The notification arrived.', 'When the notification.', 'In the hallway.', 'Because Maya.', 0, 'It has a subject and a finished verb.'),
  ]);

add('beginner', 'Accuracy Basics', 'BEG-28', 'Run-on sentences',
  'A run-on sticks two sentences together without a proper join.',
  'The bus left. We walked.',
  'Two sentences, each with its own ending.',
  'The bus left we walked.',
  'Two clauses are fused with no punctuation or joining word.',
  [
    q('Which line is a run-on?', 'The bus left we walked.', 'The bus left, so we walked.', 'The bus left. We walked.', 'After the bus left, we walked.', 0, 'Two sentences are fused.'),
    q('A comma plus so…', 'can join two sentences', 'always creates a fragment', 'replaces the subject', 'is a plural', 0, 'So is a joining word, and the comma comes before it.'),
    q('Which repair works?', 'She texted. I replied.', 'She texted I replied.', 'She texted, I replied.', 'Texted she I replied.', 0, 'A full stop splits the run-on. A comma alone does not.'),
    q('“I was late I ran.” needs…', 'a break or a joining word', 'another adjective', 'a plural noun', 'an article only', 0, 'Two clauses are sitting together.'),
  ]);

add('beginner', 'Accuracy Basics', 'BEG-29', 'Contractions',
  'A contraction joins two words and marks the missing letters with an apostrophe.',
  'I can’t find it. It’s on the seat.',
  'Can’t means cannot. It’s means it is.',
  'I cant find it. Its on the seat if you mean it is.',
  'The apostrophes that mark the missing letters are gone, so its looks like ownership.',
  [
    q('Can’t means…', 'cannot', 'can', 'can to', 'cannon', 0, 'The apostrophe stands for the missing letters in not.'),
    q('It’s on the seat means…', 'it is on the seat', 'the seat owns it', 'its seat', 'it was never', 0, 'It’s is the contraction of it is.'),
    q('The possessive that means belonging to it is…', 'its', 'it’s', 'its’', 'it,s', 0, 'Its has no apostrophe.'),
    q('Which contraction is formed correctly?', 'don’t', 'dont', 'do’nt', 'dont’', 0, 'The apostrophe marks the missing o in not.'),
  ]);

add('beginner', 'Accuracy Basics', 'BEG-30', 'Common spelling rules',
  'A few spelling patterns show up again and again, such as doubling a consonant or dropping a silent e.',
  'She stopped and hoped.',
  'Stop doubles the p before -ed. Hope drops the e before -ed.',
  'She stoped and hopeed.',
  'The doubling and the dropped e are both missing.',
  [
    q('Stop plus -ed is…', 'stopped', 'stoped', 'stoppded', 'stoppped', 0, 'A short vowel before a single consonant often doubles that consonant.'),
    q('Hope plus -ed is…', 'hoped', 'hopeed', 'hopped in this meaning', 'hopinged', 0, 'Drop the silent e before -ed.'),
    q('Run plus -ing is…', 'running', 'runing', 'runeing', 'runying', 0, 'The n doubles before -ing.'),
    q('Which pair is spelled in the usual way?', 'writing / written', 'writting / writen', 'hopeing / hopedd', 'stoped / stopping', 0, 'Writing drops the e. Written doubles the t.'),
  ]);

function writeCatalog() {
  const lessons = [];
  const units = { beginner: [], intermediate: [], advanced: [] };
  const unitIndex = { beginner: new Map(), intermediate: new Map(), advanced: new Map() };
  for (const [level, section, id, title, summary, good, goodNote, weak, weakNote, questions] of seeds) {
    if (!unitIndex[level].has(section)) {
      unitIndex[level].set(section, units[level].length + 1);
      units[level].push({ number: units[level].length + 1, title: section, lessonIds: [] });
    }
    units[level].find((unit) => unit.title === section).lessonIds.push(id);
    const order = units[level].find((unit) => unit.title === section).lessonIds.length;
    const quiz = questions.map(([prompt, a, b, c, d, answer, why], questionIndex) => {
      const options = [a, b, c, d];
      const correct = options[answer];
      const shift = (id.charCodeAt(id.length - 1) + questionIndex * 3) % 4;
      const rotated = options.map((_, index) => options[(index + shift) % 4]);
      return { kind: 'choice', prompt, options: rotated, answer: rotated.indexOf(correct), why };
    });
    lessons.push({
      id, level, order, type: 'concept', title, minutes: 6, summary,
      examples: [good, weak],
      diagram: {
        kind: 'compare',
        title,
        left: { label: good, lines: [goodNote] },
        right: { label: weak, lines: [weakNote] },
      },
      practice: [],
      quiz,
    });
  }
  const body = `import type { GrammarLesson, GrammarLevelId } from './grammar-course';

export const GRAMMAR_LESSONS: GrammarLesson[] = ${JSON.stringify(lessons, null, 2)};

export const SYLLABUS_UNITS: Record<GrammarLevelId, { number: number; title: string; lessonIds: string[] }[]> = ${JSON.stringify(units, null, 2)};
`;
  writeFileSync(new URL('../src/lib/grammar-catalog.ts', import.meta.url), body);
  console.log('topics', lessons.length, 'units', Object.values(units).map((list) => list.length).join(','));
}

export { add, q, seeds, writeCatalog };

register(add, q);

if (process.argv[1] && process.argv[1].endsWith('emit-grammar.mjs')) {
  writeCatalog();
}
