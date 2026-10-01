import type { GrammarLesson, GrammarLevelId } from './grammar-course';

export const GRAMMAR_LESSONS: GrammarLesson[] = [
  {
    "id": "BEG-01",
    "level": "beginner",
    "order": 1,
    "type": "concept",
    "title": "Parts of speech",
    "minutes": 6,
    "summary": "A part of speech is the job a word does in a sentence.",
    "examples": [
      "Maya grabbed her loud phone.",
      "Grabbed loud Maya her."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Parts of speech",
      "left": {
        "label": "Maya grabbed her loud phone.",
        "lines": [
          "Maya is a noun, grabbed is a verb, loud is an adjective."
        ]
      },
      "right": {
        "label": "Grabbed loud Maya her.",
        "lines": [
          "The same words have no clear jobs."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "Which word is the verb in “Maya grabbed her phone”?",
        "options": [
          "grabbed",
          "loud",
          "her",
          "phone"
        ],
        "answer": 0,
        "why": "Grabbed is the action. Phone names a thing."
      },
      {
        "kind": "choice",
        "prompt": "Loud in “loud phone” is…",
        "options": [
          "a noun",
          "a verb",
          "an adjective",
          "a pronoun"
        ],
        "answer": 2,
        "why": "Loud describes the noun phone."
      },
      {
        "kind": "choice",
        "prompt": "Her stands in for Maya. Her is a…",
        "options": [
          "noun",
          "pronoun",
          "preposition",
          "conjunction"
        ],
        "answer": 1,
        "why": "A pronoun takes the place of a noun."
      },
      {
        "kind": "choice",
        "prompt": "Which line gives each word a clear job?",
        "options": [
          "Phone loud grabbed her.",
          "Her Maya grabbed phone loud.",
          "Maya grabbed her loud phone.",
          "Grabbed loud Maya her."
        ],
        "answer": 2,
        "why": "The first line has a person, an action, and a describing word in a natural order."
      }
    ]
  },
  {
    "id": "BEG-02",
    "level": "beginner",
    "order": 2,
    "type": "concept",
    "title": "Types of sentences",
    "minutes": 6,
    "summary": "A sentence can tell, ask, command, or exclaim.",
    "examples": [
      "Did you miss the bus?",
      "You did miss the bus."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Types of sentences",
      "left": {
        "label": "Did you miss the bus?",
        "lines": [
          "This asks for an answer."
        ]
      },
      "right": {
        "label": "You did miss the bus.",
        "lines": [
          "This tells a fact. It does not ask."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "“Sit down.” is a…",
        "options": [
          "statement of fact only",
          "fragment",
          "question",
          "command"
        ],
        "answer": 3,
        "why": "It tells someone what to do."
      },
      {
        "kind": "choice",
        "prompt": "Which one asks?",
        "options": [
          "The bus left!",
          "Did the bus leave?",
          "Leave now.",
          "The bus left."
        ],
        "answer": 1,
        "why": "Did…? is a question."
      },
      {
        "kind": "choice",
        "prompt": "“We missed the last bus.” is a…",
        "options": [
          "statement",
          "command",
          "question",
          "single word"
        ],
        "answer": 0,
        "why": "It tells what happened."
      },
      {
        "kind": "choice",
        "prompt": "Which ending matches a question?",
        "options": [
          "We left!",
          "We left.",
          "Did we leave?",
          "Leave."
        ],
        "answer": 2,
        "why": "A question asks, and this one starts with did."
      }
    ]
  },
  {
    "id": "BEG-03",
    "level": "beginner",
    "order": 3,
    "type": "concept",
    "title": "Subject and predicate",
    "minutes": 6,
    "summary": "The subject is who or what the sentence is about. The predicate is what they do or are.",
    "examples": [
      "The last bus left without us.",
      "Left without us."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Subject and predicate",
      "left": {
        "label": "The last bus left without us.",
        "lines": [
          "The last bus is the subject. Left without us is the predicate."
        ]
      },
      "right": {
        "label": "Left without us.",
        "lines": [
          "The action is there, but nobody is named."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "What is the subject of “Nobody remembered the homework”?",
        "options": [
          "remembered the homework",
          "Nobody",
          "remembered",
          "the homework"
        ],
        "answer": 1,
        "why": "Nobody is who the sentence is about."
      },
      {
        "kind": "choice",
        "prompt": "The predicate of “The last bus left without us” is…",
        "options": [
          "bus",
          "the",
          "The last bus",
          "left without us"
        ],
        "answer": 3,
        "why": "Left without us tells what the bus did."
      },
      {
        "kind": "choice",
        "prompt": "Which line is missing a subject?",
        "options": [
          "Blew up during dinner.",
          "Priya laughed.",
          "The bus waited.",
          "My group chat blew up."
        ],
        "answer": 0,
        "why": "Blew up needs someone or something in front of it."
      },
      {
        "kind": "choice",
        "prompt": "In “We missed the train,” we is the…",
        "options": [
          "subject",
          "predicate",
          "object only",
          "article"
        ],
        "answer": 0,
        "why": "We is who the sentence is about."
      }
    ]
  },
  {
    "id": "BEG-04",
    "level": "beginner",
    "order": 4,
    "type": "concept",
    "title": "Objects and complements",
    "minutes": 6,
    "summary": "An object receives the action. A complement completes the meaning after a linking verb.",
    "examples": [
      "She texted Priya. The quiz was easy.",
      "She texted. The quiz."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Objects and complements",
      "left": {
        "label": "She texted Priya. The quiz was easy.",
        "lines": [
          "Priya receives texted. Easy describes the quiz."
        ]
      },
      "right": {
        "label": "She texted. The quiz.",
        "lines": [
          "Texted has no receiver, and the quiz has no completion."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "In “She texted Priya,” Priya is the…",
        "options": [
          "subject",
          "object",
          "article",
          "adverb"
        ],
        "answer": 1,
        "why": "Priya receives the text."
      },
      {
        "kind": "choice",
        "prompt": "In “The quiz was easy,” easy is a…",
        "options": [
          "preposition",
          "complement",
          "command",
          "pronoun"
        ],
        "answer": 1,
        "why": "Easy completes what the quiz was."
      },
      {
        "kind": "choice",
        "prompt": "Which sentence has an object?",
        "options": [
          "She is tired.",
          "She arrived.",
          "She slept.",
          "She sent a message."
        ],
        "answer": 3,
        "why": "A message is what she sent."
      },
      {
        "kind": "choice",
        "prompt": "Which complement fits? The hallway was ___.",
        "options": [
          "quietly",
          "a send",
          "texted",
          "quiet"
        ],
        "answer": 3,
        "why": "Quiet describes the hallway after was."
      }
    ]
  },
  {
    "id": "BEG-05",
    "level": "beginner",
    "order": 5,
    "type": "concept",
    "title": "Phrases and clauses",
    "minutes": 6,
    "summary": "A phrase is a group of words without its own subject and verb. A clause has both.",
    "examples": [
      "When the bus left, we were still inside.",
      "At the bus stop."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Phrases and clauses",
      "left": {
        "label": "When the bus left, we were still inside.",
        "lines": [
          "When the bus left is a clause: bus is the subject and left is the verb."
        ]
      },
      "right": {
        "label": "At the bus stop.",
        "lines": [
          "That is only a phrase. It does not say who did what."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "“At the bus stop” is a…",
        "options": [
          "full sentence",
          "question",
          "command",
          "phrase"
        ],
        "answer": 3,
        "why": "It has no subject and verb of its own."
      },
      {
        "kind": "choice",
        "prompt": "Which group is a clause?",
        "options": [
          "after school",
          "the loud phone",
          "when the bus left",
          "in a hurry"
        ],
        "answer": 2,
        "why": "The bus left has a subject and a verb."
      },
      {
        "kind": "choice",
        "prompt": "A clause needs…",
        "options": [
          "two adjectives",
          "a subject and a verb",
          "only a noun",
          "only a comma"
        ],
        "answer": 1,
        "why": "That pair is what makes a clause."
      },
      {
        "kind": "choice",
        "prompt": "“We missed it” inside a longer sentence is a…",
        "options": [
          "article",
          "spelling rule",
          "clause",
          "single noun"
        ],
        "answer": 2,
        "why": "We is the subject and missed is the verb."
      }
    ]
  },
  {
    "id": "BEG-06",
    "level": "beginner",
    "order": 1,
    "type": "concept",
    "title": "Types of nouns",
    "minutes": 6,
    "summary": "A noun can name a person, a place, a thing, or an idea.",
    "examples": [
      "Courage kept Maya in the cafeteria.",
      "Courage kept."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Types of nouns",
      "left": {
        "label": "Courage kept Maya in the cafeteria.",
        "lines": [
          "Courage is an idea. Maya is a person. Cafeteria is a place."
        ]
      },
      "right": {
        "label": "Courage kept.",
        "lines": [
          "The idea is named, but the sentence does not finish the picture."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "Which noun names an idea?",
        "options": [
          "courage",
          "bus",
          "cafeteria",
          "Maya"
        ],
        "answer": 0,
        "why": "Courage is not a person, place, or thing you can touch."
      },
      {
        "kind": "choice",
        "prompt": "Cafeteria names a…",
        "options": [
          "action",
          "describing word",
          "question",
          "place"
        ],
        "answer": 3,
        "why": "It is a location."
      },
      {
        "kind": "choice",
        "prompt": "Which word is not a noun?",
        "options": [
          "phone",
          "quickly",
          "cousin",
          "fries"
        ],
        "answer": 1,
        "why": "Quickly tells how. The others name something."
      },
      {
        "kind": "choice",
        "prompt": "Maya is which kind of noun?",
        "options": [
          "a helping verb",
          "a person",
          "a place",
          "an idea"
        ],
        "answer": 1,
        "why": "Maya names a person."
      }
    ]
  },
  {
    "id": "BEG-07",
    "level": "beginner",
    "order": 2,
    "type": "concept",
    "title": "Singular and plural nouns",
    "minutes": 6,
    "summary": "Singular means one. Plural means more than one.",
    "examples": [
      "One bus left. Two buses waited.",
      "Two bus waited."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Singular and plural nouns",
      "left": {
        "label": "One bus left. Two buses waited.",
        "lines": [
          "Bus is one. Buses is more than one."
        ]
      },
      "right": {
        "label": "Two bus waited.",
        "lines": [
          "Two needs the plural form."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "Which form means more than one?",
        "options": [
          "the bus",
          "bus",
          "buses",
          "a bus"
        ],
        "answer": 2,
        "why": "Buses is the plural."
      },
      {
        "kind": "choice",
        "prompt": "One phone, many…",
        "options": [
          "a phone",
          "phoning",
          "phone",
          "phones"
        ],
        "answer": 3,
        "why": "Phones is the plural."
      },
      {
        "kind": "choice",
        "prompt": "“Three friend” should be…",
        "options": [
          "three a friend",
          "friend three",
          "three friendes",
          "three friends"
        ],
        "answer": 3,
        "why": "More than one friend takes friends."
      },
      {
        "kind": "choice",
        "prompt": "Which sentence matches one item?",
        "options": [
          "The buses are late.",
          "A bus is late.",
          "Buses leave together.",
          "The phones rang."
        ],
        "answer": 1,
        "why": "A bus is one bus."
      }
    ]
  },
  {
    "id": "BEG-08",
    "level": "beginner",
    "order": 3,
    "type": "concept",
    "title": "Countable and uncountable nouns",
    "minutes": 6,
    "summary": "Countable nouns can be numbered. Uncountable nouns are treated as a mass.",
    "examples": [
      "I ate two fries and some rice.",
      "I ate two rices."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Countable and uncountable nouns",
      "left": {
        "label": "I ate two fries and some rice.",
        "lines": [
          "Fries can be counted. Rice is treated as a mass."
        ]
      },
      "right": {
        "label": "I ate two rices.",
        "lines": [
          "Rice is not normally counted as two rices."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "Which noun is uncountable here?",
        "options": [
          "message",
          "bus",
          "rice",
          "friend"
        ],
        "answer": 2,
        "why": "Rice is a mass, not one rice, two rices."
      },
      {
        "kind": "choice",
        "prompt": "You can count…",
        "options": [
          "two homeworks",
          "advice as two advices",
          "two messages",
          "two furnitures"
        ],
        "answer": 2,
        "why": "Messages come in numbers. Advice and homework usually do not."
      },
      {
        "kind": "choice",
        "prompt": "“Some information” fits because information is…",
        "options": [
          "a pronoun",
          "a verb",
          "uncountable",
          "always plural"
        ],
        "answer": 2,
        "why": "We say some information, not two informations."
      },
      {
        "kind": "choice",
        "prompt": "Which line is natural?",
        "options": [
          "I need some information.",
          "I need an informations.",
          "I need informations three.",
          "I need two informations."
        ],
        "answer": 0,
        "why": "Information stays uncountable."
      }
    ]
  },
  {
    "id": "BEG-09",
    "level": "beginner",
    "order": 4,
    "type": "concept",
    "title": "Possessive forms",
    "minutes": 6,
    "summary": "A possessive shows that something belongs to someone.",
    "examples": [
      "Maya’s phone is in Priya’s bag.",
      "Mayas phone is in Priyas bag."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Possessive forms",
      "left": {
        "label": "Maya’s phone is in Priya’s bag.",
        "lines": [
          "The apostrophe shows whose phone and whose bag."
        ]
      },
      "right": {
        "label": "Mayas phone is in Priyas bag.",
        "lines": [
          "Without the apostrophe, the ownership is not marked."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "Which mark shows ownership?",
        "options": [
          "Mayas phone",
          "Maya phone",
          "phone Maya",
          "Maya’s phone"
        ],
        "answer": 3,
        "why": "The apostrophe plus s shows the phone belongs to Maya."
      },
      {
        "kind": "choice",
        "prompt": "The bag belonging to the students is…",
        "options": [
          "the students bag",
          "the student’s bags only",
          "the students’ bag",
          "the students’s bag"
        ],
        "answer": 2,
        "why": "A plural ending in s takes the apostrophe after the s."
      },
      {
        "kind": "choice",
        "prompt": "“The phone’s screen” means…",
        "options": [
          "a verb",
          "the screen of the phone",
          "a screen named phone",
          "two screens"
        ],
        "answer": 1,
        "why": "The possessive ties the screen to the phone."
      },
      {
        "kind": "choice",
        "prompt": "Which is a possessive?",
        "options": [
          "it is",
          "it screens",
          "its screen",
          "it’s late"
        ],
        "answer": 2,
        "why": "Its shows ownership. It’s means it is."
      }
    ]
  },
  {
    "id": "BEG-10",
    "level": "beginner",
    "order": 5,
    "type": "concept",
    "title": "Types of pronouns",
    "minutes": 6,
    "summary": "Pronouns stand in for nouns: I, you, she, they, it, mine, who.",
    "examples": [
      "Maya forgot her charger, so she borrowed mine.",
      "Maya forgot Maya’s charger, so Maya borrowed Maya’s."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Types of pronouns",
      "left": {
        "label": "Maya forgot her charger, so she borrowed mine.",
        "lines": [
          "Her, she, and mine all point back without repeating the names."
        ]
      },
      "right": {
        "label": "Maya forgot Maya’s charger, so Maya borrowed Maya’s.",
        "lines": [
          "The name is repeated instead of using a pronoun."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "Which word is a pronoun?",
        "options": [
          "charger",
          "she",
          "forgot",
          "borrowed"
        ],
        "answer": 1,
        "why": "She stands in for Maya."
      },
      {
        "kind": "choice",
        "prompt": "Mine in “borrowed mine” refers to…",
        "options": [
          "a place",
          "my charger",
          "the bus",
          "a verb"
        ],
        "answer": 1,
        "why": "Mine means the one that belongs to me."
      },
      {
        "kind": "choice",
        "prompt": "They is used for…",
        "options": [
          "only a question",
          "an adjective",
          "one thing",
          "more than one person or a group"
        ],
        "answer": 3,
        "why": "They replaces a plural noun."
      },
      {
        "kind": "choice",
        "prompt": "Which sentence uses a pronoun?",
        "options": [
          "Jordan grabbed Jordan bag.",
          "Grabbed the bag Jordan.",
          "Bag Jordan grabbed.",
          "Jordan grabbed his bag."
        ],
        "answer": 3,
        "why": "His replaces Jordan’s."
      }
    ]
  },
  {
    "id": "BEG-11",
    "level": "beginner",
    "order": 6,
    "type": "concept",
    "title": "Pronoun–antecedent agreement",
    "minutes": 6,
    "summary": "A pronoun must match the noun it points back to, in number and person.",
    "examples": [
      "Each student packed their own lunch. The team won its match.",
      "Each student packed our own lunch."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Pronoun–antecedent agreement",
      "left": {
        "label": "Each student packed their own lunch. The team won its match.",
        "lines": [
          "The pronoun agrees with the noun it replaces."
        ]
      },
      "right": {
        "label": "Each student packed our own lunch.",
        "lines": [
          "Our does not match each student."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "“The team won ___ match.”",
        "options": [
          "their only if you mean the players",
          "our",
          "my",
          "its"
        ],
        "answer": 3,
        "why": "Team as one group takes its."
      },
      {
        "kind": "choice",
        "prompt": "“Maya said ___ was late.”",
        "options": [
          "she",
          "they",
          "it",
          "we"
        ],
        "answer": 0,
        "why": "Maya is one person, so she matches."
      },
      {
        "kind": "choice",
        "prompt": "Which pronoun disagrees?",
        "options": [
          "We missed it.",
          "The buses left. They were full.",
          "A student forgot their pass.",
          "Priya lost his notes when Priya is a girl named in the sentence as she."
        ],
        "answer": 3,
        "why": "If Priya is she, his does not agree."
      },
      {
        "kind": "choice",
        "prompt": "The noun a pronoun points to is called the…",
        "options": [
          "article",
          "comma",
          "antecedent",
          "adverb"
        ],
        "answer": 2,
        "why": "The antecedent is the earlier noun."
      }
    ]
  },
  {
    "id": "BEG-12",
    "level": "beginner",
    "order": 7,
    "type": "concept",
    "title": "Correct pronoun usage",
    "minutes": 6,
    "summary": "Use the subject form when the pronoun does the action, and the object form when it receives it.",
    "examples": [
      "She texted me. I texted her.",
      "Her texted I."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Correct pronoun usage",
      "left": {
        "label": "She texted me. I texted her.",
        "lines": [
          "She and I are subjects. Me and her are objects."
        ]
      },
      "right": {
        "label": "Her texted I.",
        "lines": [
          "The subject and object forms are swapped."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "Which is the subject form?",
        "options": [
          "Her texted I.",
          "Them called we.",
          "I texted her.",
          "Me texted she."
        ],
        "answer": 2,
        "why": "I is the subject. Her is the object."
      },
      {
        "kind": "choice",
        "prompt": "“Between you and ___.”",
        "options": [
          "I",
          "she",
          "they",
          "me"
        ],
        "answer": 3,
        "why": "Between is followed by the object form me."
      },
      {
        "kind": "choice",
        "prompt": "“___ and Maya missed the bus.”",
        "options": [
          "She",
          "Her",
          "Them",
          "Me"
        ],
        "answer": 0,
        "why": "The pronoun is part of the subject, so she fits."
      },
      {
        "kind": "choice",
        "prompt": "Choose the natural line.",
        "options": [
          "Me and her was called.",
          "The teacher called us.",
          "The teacher called we.",
          "Us called the teacher did."
        ],
        "answer": 1,
        "why": "Us is the object of called."
      }
    ]
  },
  {
    "id": "BEG-13",
    "level": "beginner",
    "order": 1,
    "type": "concept",
    "title": "Main and helping verbs",
    "minutes": 6,
    "summary": "The main verb carries the meaning. A helping verb supports the tense or the question.",
    "examples": [
      "She is saving a seat. They have left.",
      "She saving a seat."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Main and helping verbs",
      "left": {
        "label": "She is saving a seat. They have left.",
        "lines": [
          "Saving and left are the main verbs. Is and have help them."
        ]
      },
      "right": {
        "label": "She saving a seat.",
        "lines": [
          "The -ing form needs a helping verb here."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "In “She is saving a seat,” the main verb is…",
        "options": [
          "she",
          "is",
          "saving",
          "seat"
        ],
        "answer": 2,
        "why": "Saving carries the action. Is helps it."
      },
      {
        "kind": "choice",
        "prompt": "Which helping verb fits? ___ she leave yet?",
        "options": [
          "Yet",
          "Seat",
          "Has",
          "Leave"
        ],
        "answer": 2,
        "why": "Has helps leave to make the question."
      },
      {
        "kind": "choice",
        "prompt": "“They have left” — have is…",
        "options": [
          "the object",
          "an adjective",
          "a noun",
          "a helping verb"
        ],
        "answer": 3,
        "why": "Have supports the main verb left."
      },
      {
        "kind": "choice",
        "prompt": "Which line is complete?",
        "options": [
          "She is texting.",
          "She texting.",
          "Is texting she now only.",
          "Texting she."
        ],
        "answer": 0,
        "why": "Is plus texting is a complete verb phrase."
      }
    ]
  },
  {
    "id": "BEG-14",
    "level": "beginner",
    "order": 2,
    "type": "concept",
    "title": "Transitive and intransitive verbs",
    "minutes": 6,
    "summary": "A transitive verb needs an object. An intransitive verb does not.",
    "examples": [
      "She sent a message. Then she slept.",
      "She sent. Then she slept a message."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Transitive and intransitive verbs",
      "left": {
        "label": "She sent a message. Then she slept.",
        "lines": [
          "Sent needs a message. Slept does not need an object."
        ]
      },
      "right": {
        "label": "She sent. Then she slept a message.",
        "lines": [
          "Sent is missing its object, and slept does not take one."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "Which verb is transitive?",
        "options": [
          "slept",
          "arrived",
          "sent",
          "waited"
        ],
        "answer": 2,
        "why": "Sent needs something that was sent."
      },
      {
        "kind": "choice",
        "prompt": "“She slept” is complete because slept is…",
        "options": [
          "a noun",
          "intransitive",
          "always plural",
          "an article"
        ],
        "answer": 1,
        "why": "It does not need an object."
      },
      {
        "kind": "choice",
        "prompt": "Which line gives the transitive verb its object?",
        "options": [
          "She message.",
          "Sent she.",
          "She sent a message.",
          "She sent."
        ],
        "answer": 2,
        "why": "A message is the object."
      },
      {
        "kind": "choice",
        "prompt": "Arrived in “The bus arrived” is…",
        "options": [
          "transitive with a hidden object",
          "an adjective",
          "a pronoun",
          "intransitive"
        ],
        "answer": 3,
        "why": "Arrived does not take an object here."
      }
    ]
  },
  {
    "id": "BEG-15",
    "level": "beginner",
    "order": 3,
    "type": "concept",
    "title": "Regular and irregular verbs",
    "minutes": 6,
    "summary": "Regular past forms add -ed. Irregular past forms change shape.",
    "examples": [
      "We missed the bus and left.",
      "We miss the bus and leaved yesterday."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Regular and irregular verbs",
      "left": {
        "label": "We missed the bus and left.",
        "lines": [
          "Missed is regular. Left is the irregular past of leave."
        ]
      },
      "right": {
        "label": "We miss the bus and leaved yesterday.",
        "lines": [
          "Yesterday needs a past form, and leaved is not the past of leave."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "The past of leave is…",
        "options": [
          "left",
          "leaving",
          "leaves",
          "leaved"
        ],
        "answer": 0,
        "why": "Left is irregular."
      },
      {
        "kind": "choice",
        "prompt": "Which past form is regular?",
        "options": [
          "left",
          "went",
          "missed",
          "took"
        ],
        "answer": 2,
        "why": "Missed adds -ed to miss."
      },
      {
        "kind": "choice",
        "prompt": "Yesterday she ___ the file.",
        "options": [
          "sends always",
          "sent",
          "send",
          "sending"
        ],
        "answer": 1,
        "why": "Sent is the irregular past of send."
      },
      {
        "kind": "choice",
        "prompt": "Which pair is correct?",
        "options": [
          "take / taked",
          "leave / leaved",
          "go / went",
          "go / goed"
        ],
        "answer": 2,
        "why": "Went is the irregular past of go."
      }
    ]
  },
  {
    "id": "BEG-16",
    "level": "beginner",
    "order": 4,
    "type": "concept",
    "title": "Subject–verb agreement",
    "minutes": 6,
    "summary": "A singular subject takes a singular verb. A plural subject takes a plural verb.",
    "examples": [
      "The bus leaves at 7. The buses leave at 7.",
      "The bus leave at 7. The buses leaves at 7."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Subject–verb agreement",
      "left": {
        "label": "The bus leaves at 7. The buses leave at 7.",
        "lines": [
          "One bus takes leaves. Several buses take leave."
        ]
      },
      "right": {
        "label": "The bus leave at 7. The buses leaves at 7.",
        "lines": [
          "The endings are swapped."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "“She ___ the 7:40 bus.”",
        "options": [
          "taking",
          "taken",
          "takes",
          "take"
        ],
        "answer": 2,
        "why": "She is singular, so takes."
      },
      {
        "kind": "choice",
        "prompt": "“They ___ the 7:40 bus.”",
        "options": [
          "takes",
          "takes often",
          "a take",
          "take"
        ],
        "answer": 3,
        "why": "They is plural, so take."
      },
      {
        "kind": "choice",
        "prompt": "Which sentence agrees?",
        "options": [
          "The list of names is long.",
          "The list of names are long.",
          "She take the bus.",
          "They takes the bus."
        ],
        "answer": 0,
        "why": "List is the singular subject, not names."
      },
      {
        "kind": "choice",
        "prompt": "Maya and Priya ___ waiting.",
        "options": [
          "be",
          "are",
          "is",
          "am"
        ],
        "answer": 1,
        "why": "Two people together are plural."
      }
    ]
  },
  {
    "id": "BEG-17",
    "level": "beginner",
    "order": 1,
    "type": "concept",
    "title": "Types of adjectives",
    "minutes": 6,
    "summary": "An adjective describes a noun: which one, what kind, or how many.",
    "examples": [
      "Those three loud notifications ruined the quiet scene.",
      "Notifications ruined loudly scene."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Types of adjectives",
      "left": {
        "label": "Those three loud notifications ruined the quiet scene.",
        "lines": [
          "Those, three, loud, and quiet all describe nouns."
        ]
      },
      "right": {
        "label": "Notifications ruined loudly scene.",
        "lines": [
          "Loudly describes an action, not the scene."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "Which word describes a noun?",
        "options": [
          "quickly",
          "quietly",
          "loud",
          "left"
        ],
        "answer": 2,
        "why": "Loud can describe a notification. Quietly describes an action."
      },
      {
        "kind": "choice",
        "prompt": "In “three buses,” three tells…",
        "options": [
          "who owns it",
          "a tense",
          "how many",
          "how the bus drove"
        ],
        "answer": 2,
        "why": "Three is a quantity adjective."
      },
      {
        "kind": "choice",
        "prompt": "“Those seats” — those tells…",
        "options": [
          "a verb",
          "a pronoun only",
          "a command",
          "which ones"
        ],
        "answer": 3,
        "why": "Those points out which seats."
      },
      {
        "kind": "choice",
        "prompt": "Which is an adjective use?",
        "options": [
          "a quiet scene",
          "she left quietly",
          "they left",
          "a leaving"
        ],
        "answer": 0,
        "why": "Quiet describes scene."
      }
    ]
  },
  {
    "id": "BEG-18",
    "level": "beginner",
    "order": 2,
    "type": "concept",
    "title": "Degrees of comparison",
    "minutes": 6,
    "summary": "Compare one thing, two things, or more than two: tall, taller, tallest.",
    "examples": [
      "This seat is bigger than that one. It is the biggest on the bus.",
      "This seat is the bigger on the bus."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Degrees of comparison",
      "left": {
        "label": "This seat is bigger than that one. It is the biggest on the bus.",
        "lines": [
          "Bigger compares two. Biggest compares with the whole group."
        ]
      },
      "right": {
        "label": "This seat is the bigger on the bus.",
        "lines": [
          "The group needs the biggest, not the bigger."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "Comparing two phones, you say…",
        "options": [
          "better",
          "best",
          "goodest",
          "most good"
        ],
        "answer": 0,
        "why": "Better is the form for two."
      },
      {
        "kind": "choice",
        "prompt": "Of all the seats, this is the…",
        "options": [
          "most big",
          "biggest",
          "bigger",
          "big"
        ],
        "answer": 1,
        "why": "The superlative covers the whole group."
      },
      {
        "kind": "choice",
        "prompt": "“More careful than” compares…",
        "options": [
          "a command",
          "a pronoun",
          "two actions or people",
          "a list of ten with the"
        ],
        "answer": 2,
        "why": "Than marks a comparison of two."
      },
      {
        "kind": "choice",
        "prompt": "Which line is right?",
        "options": [
          "She is the taller in the group.",
          "She is most tallest.",
          "She is taller of the whole class without the.",
          "She is the tallest in the group."
        ],
        "answer": 3,
        "why": "Tallest is the form for the whole group."
      }
    ]
  },
  {
    "id": "BEG-19",
    "level": "beginner",
    "order": 3,
    "type": "concept",
    "title": "Order of adjectives",
    "minutes": 6,
    "summary": "When several adjectives stack, opinion usually comes before size, color, and purpose.",
    "examples": [
      "A nice small red school bag.",
      "A school red small nice bag."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Order of adjectives",
      "left": {
        "label": "A nice small red school bag.",
        "lines": [
          "Opinion, size, color, then purpose."
        ]
      },
      "right": {
        "label": "A school red small nice bag.",
        "lines": [
          "The usual order is scrambled."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "Which order sounds natural?",
        "options": [
          "a red small nice bag",
          "a bag red nice small",
          "small red a nice bag",
          "a nice small red bag"
        ],
        "answer": 3,
        "why": "Opinion comes before size and color."
      },
      {
        "kind": "choice",
        "prompt": "In “a lovely old song,” lovely is the…",
        "options": [
          "opinion",
          "color",
          "verb",
          "object"
        ],
        "answer": 0,
        "why": "Lovely is a judgment, so it comes early."
      },
      {
        "kind": "choice",
        "prompt": "Color usually comes…",
        "options": [
          "instead of a noun",
          "after size and before the noun",
          "before every opinion",
          "after the verb always"
        ],
        "answer": 1,
        "why": "We say a small red bag, not a red small bag, in the usual stack."
      },
      {
        "kind": "choice",
        "prompt": "Which phrase follows the usual order?",
        "options": [
          "a locker huge metal grey",
          "grey huge a metal locker",
          "a huge grey metal locker",
          "a metal grey huge locker"
        ],
        "answer": 2,
        "why": "Size, color, then material."
      }
    ]
  },
  {
    "id": "BEG-20",
    "level": "beginner",
    "order": 4,
    "type": "concept",
    "title": "Types of adverbs",
    "minutes": 6,
    "summary": "An adverb tells how, when, where, or how often an action happens.",
    "examples": [
      "She answered quietly, then left early.",
      "She answered quiet, then left early bus."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Types of adverbs",
      "left": {
        "label": "She answered quietly, then left early.",
        "lines": [
          "Quietly tells how. Early tells when."
        ]
      },
      "right": {
        "label": "She answered quiet, then left early bus.",
        "lines": [
          "Quiet describes a thing, not the answering."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "Which word tells how she answered?",
        "options": [
          "quietly",
          "answer",
          "she",
          "then"
        ],
        "answer": 0,
        "why": "Quietly modifies the verb."
      },
      {
        "kind": "choice",
        "prompt": "Early in “left early” tells…",
        "options": [
          "a plural",
          "when",
          "which noun",
          "who"
        ],
        "answer": 1,
        "why": "It places the action in time."
      },
      {
        "kind": "choice",
        "prompt": "“She looked everywhere” — everywhere tells…",
        "options": [
          "whose",
          "a tense",
          "where",
          "how many"
        ],
        "answer": 2,
        "why": "Everywhere is a place adverb."
      },
      {
        "kind": "choice",
        "prompt": "Which word is an adverb of frequency?",
        "options": [
          "phone",
          "loud",
          "bus",
          "often"
        ],
        "answer": 3,
        "why": "Often tells how frequently."
      }
    ]
  },
  {
    "id": "BEG-21",
    "level": "beginner",
    "order": 5,
    "type": "concept",
    "title": "Adjective versus adverb",
    "minutes": 6,
    "summary": "Adjectives describe nouns. Adverbs describe verbs, adjectives, or other adverbs.",
    "examples": [
      "It was a quiet bus. She answered quietly.",
      "She answered quiet. It was a quietly bus."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Adjective versus adverb",
      "left": {
        "label": "It was a quiet bus. She answered quietly.",
        "lines": [
          "Quiet describes the bus. Quietly describes answered."
        ]
      },
      "right": {
        "label": "She answered quiet. It was a quietly bus.",
        "lines": [
          "The forms are attached to the wrong kind of word."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "Describe the noun bus.",
        "options": [
          "quietly",
          "quietness as a verb",
          "quietly bus",
          "quiet"
        ],
        "answer": 3,
        "why": "Quiet is the adjective."
      },
      {
        "kind": "choice",
        "prompt": "Describe the verb answered.",
        "options": [
          "quietly",
          "quiet",
          "a quiet",
          "quieted bus"
        ],
        "answer": 0,
        "why": "Quietly is the adverb."
      },
      {
        "kind": "choice",
        "prompt": "“She looks ___.” meaning her appearance.",
        "options": [
          "calm verb",
          "calm",
          "calmly only",
          "a calmly"
        ],
        "answer": 1,
        "why": "Looks as a linking verb takes the adjective calm."
      },
      {
        "kind": "choice",
        "prompt": "Which sentence is right?",
        "options": [
          "A quickly runner only.",
          "He quick ran.",
          "He ran quickly.",
          "He ran quick to school in this pair."
        ],
        "answer": 2,
        "why": "Quickly tells how he ran."
      }
    ]
  },
  {
    "id": "BEG-22",
    "level": "beginner",
    "order": 6,
    "type": "concept",
    "title": "Articles: a, an, the",
    "minutes": 6,
    "summary": "A and an introduce one new thing. The points to a thing you both already know.",
    "examples": [
      "I need a charger. The charger in my bag is dead.",
      "I need the charger I have never mentioned, and a charger in my bag we both see."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Articles: a, an, the",
      "left": {
        "label": "I need a charger. The charger in my bag is dead.",
        "lines": [
          "A introduces it. The comes back to that charger."
        ]
      },
      "right": {
        "label": "I need the charger I have never mentioned, and a charger in my bag we both see.",
        "lines": [
          "The articles are swapped for a first mention and a known one."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "First mention, consonant sound.",
        "options": [
          "the charger we have not identified",
          "charger a",
          "a charger",
          "an charger"
        ],
        "answer": 2,
        "why": "Charger starts with a consonant sound, and it is new."
      },
      {
        "kind": "choice",
        "prompt": "Umbrella takes…",
        "options": [
          "a",
          "no article ever",
          "two the",
          "an"
        ],
        "answer": 3,
        "why": "Umbrella starts with a vowel sound."
      },
      {
        "kind": "choice",
        "prompt": "“The seat we saved” uses the because…",
        "options": [
          "we both know which seat",
          "seat starts with a vowel",
          "it is a command",
          "the is only for people"
        ],
        "answer": 0,
        "why": "The points to a known seat."
      },
      {
        "kind": "choice",
        "prompt": "Which pair is natural?",
        "options": [
          "I found the seat. A seat was that same one first.",
          "I found a seat. The seat was sticky.",
          "I found an seat.",
          "I found a umbrella."
        ],
        "answer": 1,
        "why": "A introduces the seat. The returns to it."
      }
    ]
  },
  {
    "id": "BEG-23",
    "level": "beginner",
    "order": 7,
    "type": "concept",
    "title": "Determiners and quantifiers",
    "minutes": 6,
    "summary": "Determiners and quantifiers say which or how much: this, some, many, a few.",
    "examples": [
      "Many students had some time, but few had a pencil.",
      "Much students had a few time."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Determiners and quantifiers",
      "left": {
        "label": "Many students had some time, but few had a pencil.",
        "lines": [
          "Many, some, and few measure the nouns."
        ]
      },
      "right": {
        "label": "Much students had a few time.",
        "lines": [
          "Much does not fit a plural countable noun, and a few does not fit time here."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "Students can be counted, so use…",
        "options": [
          "an student",
          "many",
          "much",
          "a little students"
        ],
        "answer": 1,
        "why": "Many goes with countable plurals."
      },
      {
        "kind": "choice",
        "prompt": "Time as a mass takes…",
        "options": [
          "few time",
          "a few time",
          "much time or a little time",
          "many time"
        ],
        "answer": 2,
        "why": "Much and a little fit uncountable time."
      },
      {
        "kind": "choice",
        "prompt": "“This seat” tells…",
        "options": [
          "how the bus moved",
          "a past tense",
          "a command",
          "which one"
        ],
        "answer": 3,
        "why": "This is a determiner."
      },
      {
        "kind": "choice",
        "prompt": "Which line is natural?",
        "options": [
          "a few friends",
          "a few water",
          "much friends",
          "many water in this pair"
        ],
        "answer": 0,
        "why": "Friends are countable, so a few fits."
      }
    ]
  },
  {
    "id": "BEG-24",
    "level": "beginner",
    "order": 8,
    "type": "concept",
    "title": "Correct use of prepositions",
    "minutes": 6,
    "summary": "A preposition shows a relationship such as time, place, or direction.",
    "examples": [
      "We meet at 4 on Monday in the library.",
      "We meet in 4 on the library at Monday."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Correct use of prepositions",
      "left": {
        "label": "We meet at 4 on Monday in the library.",
        "lines": [
          "At a clock time, on a day, in a place you can be inside."
        ]
      },
      "right": {
        "label": "We meet in 4 on the library at Monday.",
        "lines": [
          "The prepositions are paired with the wrong kind of information."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "A clock time takes…",
        "options": [
          "at 4",
          "on 4",
          "in 4",
          "by the 4 noun"
        ],
        "answer": 0,
        "why": "At is used with clock times."
      },
      {
        "kind": "choice",
        "prompt": "A day of the week takes…",
        "options": [
          "to Monday as a place",
          "on Monday",
          "at Monday",
          "in Monday"
        ],
        "answer": 1,
        "why": "On is used with days."
      },
      {
        "kind": "choice",
        "prompt": "“The phone is ___ my bag.”",
        "options": [
          "on the inside word only if it is a surface",
          "to",
          "in",
          "at"
        ],
        "answer": 2,
        "why": "In fits something inside a bag."
      },
      {
        "kind": "choice",
        "prompt": "Which sentence uses the prepositions naturally?",
        "options": [
          "She sat at the bench on noon.",
          "She sat in noon.",
          "Noon on she sat bench.",
          "She sat on the bench at noon."
        ],
        "answer": 3,
        "why": "On a surface, at a clock time."
      }
    ]
  },
  {
    "id": "BEG-25",
    "level": "beginner",
    "order": 1,
    "type": "concept",
    "title": "Capitalisation",
    "minutes": 6,
    "summary": "Capital letters start sentences, names, and the pronoun I.",
    "examples": [
      "Maya and I missed the bus on Monday.",
      "maya and i missed the Bus On monday."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Capitalisation",
      "left": {
        "label": "Maya and I missed the bus on Monday.",
        "lines": [
          "The name, I, and the sentence start are capitals. Monday is a name of a day."
        ]
      },
      "right": {
        "label": "maya and i missed the Bus On monday.",
        "lines": [
          "The capitals are missing or sitting on ordinary words."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "Which word must stay capital even in the middle?",
        "options": [
          "bus",
          "and",
          "missed",
          "I"
        ],
        "answer": 3,
        "why": "The pronoun I is always capital."
      },
      {
        "kind": "choice",
        "prompt": "A sentence starts with…",
        "options": [
          "a capital letter",
          "a comma",
          "a question mark",
          "a small i for I"
        ],
        "answer": 0,
        "why": "The first word is capitalised."
      },
      {
        "kind": "choice",
        "prompt": "Which line is capitalised correctly?",
        "options": [
          "friday is when Priya left.",
          "Priya left on Friday.",
          "priya left on friday.",
          "Priya Left On The Bus."
        ],
        "answer": 1,
        "why": "The name and the day take capitals. Ordinary words do not."
      },
      {
        "kind": "choice",
        "prompt": "Names of people take…",
        "options": [
          "an adverb ending",
          "no mark",
          "a capital",
          "a plural only"
        ],
        "answer": 2,
        "why": "Maya and Priya are proper nouns."
      }
    ]
  },
  {
    "id": "BEG-26",
    "level": "beginner",
    "order": 2,
    "type": "concept",
    "title": "Punctuation",
    "minutes": 6,
    "summary": "Punctuation shows where a sentence ends and how it is said.",
    "examples": [
      "We missed the bus. Did you see it?",
      "We missed the bus did you see it"
    ],
    "diagram": {
      "kind": "compare",
      "title": "Punctuation",
      "left": {
        "label": "We missed the bus. Did you see it?",
        "lines": [
          "A full stop ends the statement. A question mark ends the question."
        ]
      },
      "right": {
        "label": "We missed the bus did you see it",
        "lines": [
          "The two sentences are run together with no marks."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "A statement ends with…",
        "options": [
          "a comma always",
          "nothing",
          "a full stop",
          "a question mark always"
        ],
        "answer": 2,
        "why": "The full stop closes a statement."
      },
      {
        "kind": "choice",
        "prompt": "“Did you see it” needs…",
        "options": [
          ".",
          "no mark",
          "a capital only",
          "?"
        ],
        "answer": 3,
        "why": "It is a question."
      },
      {
        "kind": "choice",
        "prompt": "A comma can…",
        "options": [
          "separate items in a list",
          "end every sentence",
          "replace a verb",
          "make a noun plural"
        ],
        "answer": 0,
        "why": "Phones, chargers, and bags uses commas."
      },
      {
        "kind": "choice",
        "prompt": "Which line is punctuated?",
        "options": [
          "Wait? I am. coming now always as one question",
          "Wait. I am coming.",
          "Wait I am coming",
          "Wait I. am coming"
        ],
        "answer": 1,
        "why": "Each sentence has its own closing mark."
      }
    ]
  },
  {
    "id": "BEG-27",
    "level": "beginner",
    "order": 3,
    "type": "concept",
    "title": "Sentence fragments",
    "minutes": 6,
    "summary": "A fragment is a piece that cannot stand alone because it lacks a subject, a verb, or a finished thought.",
    "examples": [
      "We missed the bus because we left late.",
      "Because we left late."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Sentence fragments",
      "left": {
        "label": "We missed the bus because we left late.",
        "lines": [
          "The because-piece is joined to a full sentence."
        ]
      },
      "right": {
        "label": "Because we left late.",
        "lines": [
          "The reason is hanging. It does not say what happened."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "Which one is a fragment?",
        "options": [
          "She laughed.",
          "Because we left late.",
          "We left late.",
          "The bus waited."
        ],
        "answer": 1,
        "why": "Because… needs a main sentence."
      },
      {
        "kind": "choice",
        "prompt": "A fragment often feels like…",
        "options": [
          "a correct question",
          "a capital name",
          "an unfinished piece",
          "two complete thoughts"
        ],
        "answer": 2,
        "why": "It does not stand on its own."
      },
      {
        "kind": "choice",
        "prompt": "How do you repair “At the stop.”?",
        "options": [
          "At the stop",
          "Stop at.",
          "The at.",
          "We waited at the stop."
        ],
        "answer": 3,
        "why": "Add who did what."
      },
      {
        "kind": "choice",
        "prompt": "Which line is a full sentence?",
        "options": [
          "The notification arrived.",
          "When the notification.",
          "In the hallway.",
          "Because Maya."
        ],
        "answer": 0,
        "why": "It has a subject and a finished verb."
      }
    ]
  },
  {
    "id": "BEG-28",
    "level": "beginner",
    "order": 4,
    "type": "concept",
    "title": "Run-on sentences",
    "minutes": 6,
    "summary": "A run-on sticks two sentences together without a proper join.",
    "examples": [
      "The bus left. We walked.",
      "The bus left we walked."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Run-on sentences",
      "left": {
        "label": "The bus left. We walked.",
        "lines": [
          "Two sentences, each with its own ending."
        ]
      },
      "right": {
        "label": "The bus left we walked.",
        "lines": [
          "Two clauses are fused with no punctuation or joining word."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "Which line is a run-on?",
        "options": [
          "The bus left we walked.",
          "The bus left, so we walked.",
          "The bus left. We walked.",
          "After the bus left, we walked."
        ],
        "answer": 0,
        "why": "Two sentences are fused."
      },
      {
        "kind": "choice",
        "prompt": "A comma plus so…",
        "options": [
          "is a plural",
          "can join two sentences",
          "always creates a fragment",
          "replaces the subject"
        ],
        "answer": 1,
        "why": "So is a joining word, and the comma comes before it."
      },
      {
        "kind": "choice",
        "prompt": "Which repair works?",
        "options": [
          "She texted, I replied.",
          "Texted she I replied.",
          "She texted. I replied.",
          "She texted I replied."
        ],
        "answer": 2,
        "why": "A full stop splits the run-on. A comma alone does not."
      },
      {
        "kind": "choice",
        "prompt": "“I was late I ran.” needs…",
        "options": [
          "another adjective",
          "a plural noun",
          "an article only",
          "a break or a joining word"
        ],
        "answer": 3,
        "why": "Two clauses are sitting together."
      }
    ]
  },
  {
    "id": "BEG-29",
    "level": "beginner",
    "order": 5,
    "type": "concept",
    "title": "Contractions",
    "minutes": 6,
    "summary": "A contraction joins two words and marks the missing letters with an apostrophe.",
    "examples": [
      "I can’t find it. It’s on the seat.",
      "I cant find it. Its on the seat if you mean it is."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Contractions",
      "left": {
        "label": "I can’t find it. It’s on the seat.",
        "lines": [
          "Can’t means cannot. It’s means it is."
        ]
      },
      "right": {
        "label": "I cant find it. Its on the seat if you mean it is.",
        "lines": [
          "The apostrophes that mark the missing letters are gone, so its looks like ownership."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "Can’t means…",
        "options": [
          "can",
          "can to",
          "cannon",
          "cannot"
        ],
        "answer": 3,
        "why": "The apostrophe stands for the missing letters in not."
      },
      {
        "kind": "choice",
        "prompt": "It’s on the seat means…",
        "options": [
          "it is on the seat",
          "the seat owns it",
          "its seat",
          "it was never"
        ],
        "answer": 0,
        "why": "It’s is the contraction of it is."
      },
      {
        "kind": "choice",
        "prompt": "The possessive that means belonging to it is…",
        "options": [
          "it,s",
          "its",
          "it’s",
          "its’"
        ],
        "answer": 1,
        "why": "Its has no apostrophe."
      },
      {
        "kind": "choice",
        "prompt": "Which contraction is formed correctly?",
        "options": [
          "do’nt",
          "dont’",
          "don’t",
          "dont"
        ],
        "answer": 2,
        "why": "The apostrophe marks the missing o in not."
      }
    ]
  },
  {
    "id": "BEG-30",
    "level": "beginner",
    "order": 6,
    "type": "concept",
    "title": "Common spelling rules",
    "minutes": 6,
    "summary": "A few spelling patterns show up again and again, such as doubling a consonant or dropping a silent e.",
    "examples": [
      "She stopped and hoped.",
      "She stoped and hopeed."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Common spelling rules",
      "left": {
        "label": "She stopped and hoped.",
        "lines": [
          "Stop doubles the p before -ed. Hope drops the e before -ed."
        ]
      },
      "right": {
        "label": "She stoped and hopeed.",
        "lines": [
          "The doubling and the dropped e are both missing."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "Stop plus -ed is…",
        "options": [
          "stopped",
          "stoped",
          "stoppded",
          "stoppped"
        ],
        "answer": 0,
        "why": "A short vowel before a single consonant often doubles that consonant."
      },
      {
        "kind": "choice",
        "prompt": "Hope plus -ed is…",
        "options": [
          "hopinged",
          "hoped",
          "hopeed",
          "hopped in this meaning"
        ],
        "answer": 1,
        "why": "Drop the silent e before -ed."
      },
      {
        "kind": "choice",
        "prompt": "Run plus -ing is…",
        "options": [
          "runeing",
          "runying",
          "running",
          "runing"
        ],
        "answer": 2,
        "why": "The n doubles before -ing."
      },
      {
        "kind": "choice",
        "prompt": "Which pair is spelled in the usual way?",
        "options": [
          "writting / writen",
          "hopeing / hopedd",
          "stoped / stopping",
          "writing / written"
        ],
        "answer": 3,
        "why": "Writing drops the e. Written doubles the t."
      }
    ]
  },
  {
    "id": "INT-01",
    "level": "intermediate",
    "order": 1,
    "type": "concept",
    "title": "Finite and non-finite verbs",
    "minutes": 6,
    "summary": "A finite verb shows tense and agrees with a subject. A non-finite form does not stand as the main verb alone.",
    "examples": [
      "She leaves at 7, hoping the bus is there.",
      "She hoping the bus is there."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Finite and non-finite verbs",
      "left": {
        "label": "She leaves at 7, hoping the bus is there.",
        "lines": [
          "Leaves is finite. Hoping is non-finite."
        ]
      },
      "right": {
        "label": "She hoping the bus is there.",
        "lines": [
          "Hoping cannot be the only verb."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "The finite verb in “She leaves at 7” is…",
        "options": [
          "at",
          "she",
          "7",
          "leaves"
        ],
        "answer": 3,
        "why": "Leaves shows present tense and matches she."
      },
      {
        "kind": "choice",
        "prompt": "Hoping in “leaves, hoping” is…",
        "options": [
          "non-finite",
          "the only verb the sentence needs",
          "a noun",
          "an article"
        ],
        "answer": 0,
        "why": "It does not carry the tense by itself."
      },
      {
        "kind": "choice",
        "prompt": "Which line has a finite verb?",
        "options": [
          "The waiting students only as a phrase.",
          "They waited.",
          "Waiting at the stop.",
          "To wait there."
        ],
        "answer": 1,
        "why": "Waited is a finished finite verb."
      },
      {
        "kind": "choice",
        "prompt": "A non-finite form often looks like…",
        "options": [
          "a question mark",
          "a capital",
          "to leave, leaving, or left as a participle",
          "she leaves"
        ],
        "answer": 2,
        "why": "Infinitives and participles are non-finite."
      }
    ]
  },
  {
    "id": "INT-02",
    "level": "intermediate",
    "order": 2,
    "type": "concept",
    "title": "Infinitives, gerunds and participles",
    "minutes": 6,
    "summary": "To leave is an infinitive. Leaving can be a gerund. Left or leaving can be a participle.",
    "examples": [
      "Leaving early means we catch the bus. She wants to leave.",
      "Leave early mean we catch the bus."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Infinitives, gerunds and participles",
      "left": {
        "label": "Leaving early means we catch the bus. She wants to leave.",
        "lines": [
          "Leaving is a gerund subject. To leave is an infinitive."
        ]
      },
      "right": {
        "label": "Leave early mean we catch the bus.",
        "lines": [
          "The -ing form is missing, so the subject is not a noun-like verb."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "“To leave” is an…",
        "options": [
          "article",
          "plural noun",
          "infinitive",
          "gerund"
        ],
        "answer": 2,
        "why": "To plus the base verb is the infinitive."
      },
      {
        "kind": "choice",
        "prompt": "“Leaving early is hard” uses leaving as a…",
        "options": [
          "finite past verb",
          "preposition",
          "pronoun",
          "gerund"
        ],
        "answer": 3,
        "why": "The -ing form is the subject, so it works as a noun."
      },
      {
        "kind": "choice",
        "prompt": "A participle can describe a noun, as in…",
        "options": [
          "the students waiting outside",
          "to the outside",
          "wait they",
          "a wait"
        ],
        "answer": 0,
        "why": "Waiting describes students."
      },
      {
        "kind": "choice",
        "prompt": "Which pair matches the names?",
        "options": [
          "goes / a goes",
          "to go / going",
          "goed / goest",
          "a go / an go"
        ],
        "answer": 1,
        "why": "To go is the infinitive. Going can be the gerund."
      }
    ]
  },
  {
    "id": "INT-03",
    "level": "intermediate",
    "order": 3,
    "type": "concept",
    "title": "The 12 tenses",
    "minutes": 6,
    "summary": "English builds twelve tense-aspect forms from past, present, and future, each simple, continuous, perfect, or perfect continuous.",
    "examples": [
      "I text, I am texting, I have texted, I have been texting.",
      "I am texted now for a habit."
    ],
    "diagram": {
      "kind": "compare",
      "title": "The 12 tenses",
      "left": {
        "label": "I text, I am texting, I have texted, I have been texting.",
        "lines": [
          "Those four are the present group."
        ]
      },
      "right": {
        "label": "I am texted now for a habit.",
        "lines": [
          "The names of the forms are mixed up."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "A habit such as “I take the bus” is…",
        "options": [
          "future perfect",
          "present simple",
          "present perfect continuous",
          "past perfect"
        ],
        "answer": 1,
        "why": "Repeated facts use the present simple."
      },
      {
        "kind": "choice",
        "prompt": "“I am texting” is…",
        "options": [
          "future perfect",
          "present perfect only",
          "present continuous",
          "past simple"
        ],
        "answer": 2,
        "why": "Am plus -ing is present continuous."
      },
      {
        "kind": "choice",
        "prompt": "“She had left” is…",
        "options": [
          "present simple",
          "future continuous",
          "a noun",
          "past perfect"
        ],
        "answer": 3,
        "why": "Had plus the past participle is past perfect."
      },
      {
        "kind": "choice",
        "prompt": "How many tense-aspect combinations are in the usual set?",
        "options": [
          "12",
          "3",
          "2",
          "20"
        ],
        "answer": 0,
        "why": "Three times and four aspects make twelve."
      }
    ]
  },
  {
    "id": "INT-04",
    "level": "intermediate",
    "order": 4,
    "type": "concept",
    "title": "Sequence of tenses",
    "minutes": 6,
    "summary": "The tense of a later verb should fit the tense of the verb it follows.",
    "examples": [
      "She said she was tired.",
      "She said she is tired yesterday in reported speech."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Sequence of tenses",
      "left": {
        "label": "She said she was tired.",
        "lines": [
          "Said is past, so was matches that past point of view."
        ]
      },
      "right": {
        "label": "She said she is tired yesterday in reported speech.",
        "lines": [
          "The second verb does not follow the past reporting verb."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "After “She said,” the usual match is…",
        "options": [
          "she was tired",
          "she is tired yesterday",
          "she tired",
          "she being tired as the only verb"
        ],
        "answer": 0,
        "why": "A past reporting verb pulls the next verb into the past."
      },
      {
        "kind": "choice",
        "prompt": "“I know she leaves at 7” keeps the present because…",
        "options": [
          "7 is plural",
          "know is present",
          "know is past",
          "leaves is a noun"
        ],
        "answer": 1,
        "why": "A present main verb can keep a present following verb."
      },
      {
        "kind": "choice",
        "prompt": "Which sequence fits?",
        "options": [
          "He realise he had miss.",
          "Had he realised miss.",
          "He realised he had missed it.",
          "He realised he misses it yesterday."
        ],
        "answer": 2,
        "why": "Realised is past, and had missed is earlier than that."
      },
      {
        "kind": "choice",
        "prompt": "Sequence of tenses is about…",
        "options": [
          "adding capital letters",
          "counting nouns",
          "spelling -ed",
          "making the times fit together"
        ],
        "answer": 3,
        "why": "The times in one sentence should agree."
      }
    ]
  },
  {
    "id": "INT-05",
    "level": "intermediate",
    "order": 5,
    "type": "concept",
    "title": "Modal verbs",
    "minutes": 6,
    "summary": "Modals such as can, could, may, might, must, should, and will add meaning and are followed by the base verb.",
    "examples": [
      "You should text her. I can hear the bus.",
      "You should to text her."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Modal verbs",
      "left": {
        "label": "You should text her. I can hear the bus.",
        "lines": [
          "Should and can take the base form, with no to."
        ]
      },
      "right": {
        "label": "You should to text her.",
        "lines": [
          "To does not sit between a modal and the verb."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "After can, use…",
        "options": [
          "to plus verb",
          "the past participle always",
          "an -ing form always",
          "the base verb"
        ],
        "answer": 3,
        "why": "Can hear, not can to hear."
      },
      {
        "kind": "choice",
        "prompt": "Should often means…",
        "options": [
          "advice",
          "a finished past fact by itself",
          "a plural noun",
          "ownership"
        ],
        "answer": 0,
        "why": "You should text her is advice."
      },
      {
        "kind": "choice",
        "prompt": "Must can mean…",
        "options": [
          "a spelling rule",
          "obligation",
          "a question mark",
          "an article"
        ],
        "answer": 1,
        "why": "You must show your pass is a strong obligation."
      },
      {
        "kind": "choice",
        "prompt": "Which line is formed correctly?",
        "options": [
          "She might being late.",
          "She mights be late.",
          "She might be late.",
          "She might to be late."
        ],
        "answer": 2,
        "why": "Might is followed by the base form be."
      }
    ]
  },
  {
    "id": "INT-06",
    "level": "intermediate",
    "order": 6,
    "type": "concept",
    "title": "Phrasal verbs",
    "minutes": 6,
    "summary": "A phrasal verb is a verb plus a particle whose meaning is often different from the verb alone.",
    "examples": [
      "Look up the word. We put off the quiz.",
      "Look the word to the sky only, when you mean search."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Phrasal verbs",
      "left": {
        "label": "Look up the word. We put off the quiz.",
        "lines": [
          "Look up means search. Put off means postpone."
        ]
      },
      "right": {
        "label": "Look the word to the sky only, when you mean search.",
        "lines": [
          "The particle changes the meaning."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "“Put off the quiz” means…",
        "options": [
          "cancel the particle",
          "spell it",
          "postpone it",
          "place it on a table only"
        ],
        "answer": 2,
        "why": "Put off is a phrasal verb meaning postpone."
      },
      {
        "kind": "choice",
        "prompt": "“Look up a word” means…",
        "options": [
          "stare at the ceiling only",
          "delete it",
          "capitalise it",
          "search for it"
        ],
        "answer": 3,
        "why": "The particle up makes it mean search."
      },
      {
        "kind": "choice",
        "prompt": "Which is a phrasal verb?",
        "options": [
          "give up",
          "give a gift only",
          "gift up",
          "a give"
        ],
        "answer": 0,
        "why": "Give up means quit."
      },
      {
        "kind": "choice",
        "prompt": "The little word in a phrasal verb is called a…",
        "options": [
          "capital",
          "particle",
          "article",
          "subject"
        ],
        "answer": 1,
        "why": "Up, off, and out are particles here."
      }
    ]
  },
  {
    "id": "INT-07",
    "level": "intermediate",
    "order": 1,
    "type": "concept",
    "title": "Simple, compound and complex sentences",
    "minutes": 6,
    "summary": "A simple sentence has one clause. A compound sentence joins two equals. A complex sentence has a main clause and a dependent one.",
    "examples": [
      "The bus left, and we walked. When the bus left, we walked.",
      "The bus left we walked."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Simple, compound and complex sentences",
      "left": {
        "label": "The bus left, and we walked. When the bus left, we walked.",
        "lines": [
          "And joins equals. When makes the first clause dependent."
        ]
      },
      "right": {
        "label": "The bus left we walked.",
        "lines": [
          "Two clauses are stuck together with no join."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "“The bus left” is…",
        "options": [
          "two sentences",
          "simple",
          "compound",
          "a fragment with when"
        ],
        "answer": 1,
        "why": "It has one subject and one verb."
      },
      {
        "kind": "choice",
        "prompt": "And in “The bus left, and we walked” makes the sentence…",
        "options": [
          "a phrase only",
          "a question",
          "compound",
          "complex"
        ],
        "answer": 2,
        "why": "And joins two independent clauses."
      },
      {
        "kind": "choice",
        "prompt": "“When the bus left, we walked” is…",
        "options": [
          "simple",
          "a single noun",
          "a spelling rule",
          "complex"
        ],
        "answer": 3,
        "why": "When introduces a dependent clause."
      },
      {
        "kind": "choice",
        "prompt": "Which join is missing?",
        "options": [
          "The bus left we walked.",
          "The bus left, so we walked.",
          "When the bus left, we walked.",
          "We walked."
        ],
        "answer": 0,
        "why": "Those two clauses need punctuation or a joining word."
      }
    ]
  },
  {
    "id": "INT-08",
    "level": "intermediate",
    "order": 2,
    "type": "concept",
    "title": "Independent and dependent clauses",
    "minutes": 6,
    "summary": "An independent clause can stand alone. A dependent clause cannot.",
    "examples": [
      "We walked because the bus left.",
      "Because the bus left."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Independent and dependent clauses",
      "left": {
        "label": "We walked because the bus left.",
        "lines": [
          "We walked can stand alone. Because the bus left cannot."
        ]
      },
      "right": {
        "label": "Because the bus left.",
        "lines": [
          "The dependent clause is pretending to be a sentence."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "Which clause can stand alone?",
        "options": [
          "We walked.",
          "Because the bus left.",
          "When Maya texted.",
          "If the bus is late."
        ],
        "answer": 0,
        "why": "We walked is independent."
      },
      {
        "kind": "choice",
        "prompt": "Because the bus left is…",
        "options": [
          "an article",
          "dependent",
          "a full sentence",
          "a noun only"
        ],
        "answer": 1,
        "why": "It needs a main clause."
      },
      {
        "kind": "choice",
        "prompt": "A dependent clause often starts with a word such as…",
        "options": [
          "a capital I",
          "a full stop",
          "because, when, or if",
          "and only"
        ],
        "answer": 2,
        "why": "Those words make the clause lean on another one."
      },
      {
        "kind": "choice",
        "prompt": "Which line is complete?",
        "options": [
          "Because the bus left.",
          "When Maya.",
          "If late.",
          "We walked because the bus left."
        ],
        "answer": 3,
        "why": "The independent clause is attached."
      }
    ]
  },
  {
    "id": "INT-09",
    "level": "intermediate",
    "order": 3,
    "type": "concept",
    "title": "Noun, adjective and adverb clauses",
    "minutes": 6,
    "summary": "A clause can do the job of a noun, an adjective, or an adverb.",
    "examples": [
      "I know that she left. The bus that we missed is gone. We left when it started.",
      "I know that. The bus that. We left when."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Noun, adjective and adverb clauses",
      "left": {
        "label": "I know that she left. The bus that we missed is gone. We left when it started.",
        "lines": [
          "That she left is a noun clause. That we missed describes the bus. When it started tells when."
        ]
      },
      "right": {
        "label": "I know that. The bus that. We left when.",
        "lines": [
          "The clauses are cut off."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "“I know that she left” — that she left works as a…",
        "options": [
          "adjective describing know",
          "capital letter",
          "plural",
          "noun clause"
        ],
        "answer": 3,
        "why": "It is the thing you know."
      },
      {
        "kind": "choice",
        "prompt": "“The bus that we missed” — the clause describes…",
        "options": [
          "the bus",
          "the verb only",
          "a preposition",
          "a comma"
        ],
        "answer": 0,
        "why": "It works like an adjective."
      },
      {
        "kind": "choice",
        "prompt": "“We left when it started” tells…",
        "options": [
          "a name",
          "when we left",
          "who owns the bus",
          "a spelling"
        ],
        "answer": 1,
        "why": "When it started is an adverb clause."
      },
      {
        "kind": "choice",
        "prompt": "Which is a noun clause?",
        "options": [
          "quickly",
          "on Monday",
          "what she said",
          "the loud bus"
        ],
        "answer": 2,
        "why": "What she said can be the object of a verb."
      }
    ]
  },
  {
    "id": "INT-10",
    "level": "intermediate",
    "order": 4,
    "type": "concept",
    "title": "Relative clauses and relative pronouns",
    "minutes": 6,
    "summary": "Who, which, and that introduce a clause that describes a noun.",
    "examples": [
      "The friend who lent me the charger is waiting.",
      "The friend which lent me the charger."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Relative clauses and relative pronouns",
      "left": {
        "label": "The friend who lent me the charger is waiting.",
        "lines": [
          "Who lent me the charger tells us which friend."
        ]
      },
      "right": {
        "label": "The friend which lent me the charger.",
        "lines": [
          "Which is for things. A friend takes who or that."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "A person is usually followed by…",
        "options": [
          "who",
          "which",
          "where for a person",
          "at"
        ],
        "answer": 0,
        "why": "Who refers to people."
      },
      {
        "kind": "choice",
        "prompt": "A thing is often followed by…",
        "options": [
          "a capital",
          "which or that",
          "who",
          "she"
        ],
        "answer": 1,
        "why": "Which and that refer to things."
      },
      {
        "kind": "choice",
        "prompt": "“The seat that we saved” describes…",
        "options": [
          "we only",
          "a tense",
          "the seat",
          "saved as a noun"
        ],
        "answer": 2,
        "why": "The relative clause identifies the seat."
      },
      {
        "kind": "choice",
        "prompt": "Which line fits a person?",
        "options": [
          "The coach which waited is new.",
          "The coach where waited.",
          "Coach who the.",
          "The coach who waited is new."
        ],
        "answer": 3,
        "why": "Who agrees with a person."
      }
    ]
  },
  {
    "id": "INT-11",
    "level": "intermediate",
    "order": 5,
    "type": "concept",
    "title": "Coordinating and subordinating conjunctions",
    "minutes": 6,
    "summary": "And, but, and or join equals. Because, although, and if start a dependent clause.",
    "examples": [
      "We ran, but the bus left because we were late.",
      "We ran but, the bus left because."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Coordinating and subordinating conjunctions",
      "left": {
        "label": "We ran, but the bus left because we were late.",
        "lines": [
          "But joins two main ideas. Because starts the reason."
        ]
      },
      "right": {
        "label": "We ran but, the bus left because.",
        "lines": [
          "The joining words are stranded."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "But is a…",
        "options": [
          "subordinating conjunction",
          "pronoun",
          "tense",
          "coordinating conjunction"
        ],
        "answer": 3,
        "why": "It joins two clauses of the same rank."
      },
      {
        "kind": "choice",
        "prompt": "Because is a…",
        "options": [
          "subordinating conjunction",
          "coordinating conjunction",
          "noun",
          "article"
        ],
        "answer": 0,
        "why": "It makes the following clause dependent."
      },
      {
        "kind": "choice",
        "prompt": "Which word can replace and between equals?",
        "options": [
          "when",
          "or",
          "although",
          "because"
        ],
        "answer": 1,
        "why": "Or coordinates. Although subordinates."
      },
      {
        "kind": "choice",
        "prompt": "Choose the natural join.",
        "options": [
          "Although she stayed, because.",
          "But she stayed because,",
          "She stayed although she was tired.",
          "She stayed and although tired was."
        ],
        "answer": 2,
        "why": "Although introduces the contrast and the main clause is complete."
      }
    ]
  },
  {
    "id": "INT-12",
    "level": "intermediate",
    "order": 6,
    "type": "concept",
    "title": "Conditional sentences",
    "minutes": 6,
    "summary": "If sets a condition. The tense shows whether the result is real, unlikely, or imagined.",
    "examples": [
      "If the bus is late, I walk. If I had set an alarm, I would not be late now.",
      "If the bus will late, I walked always."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Conditional sentences",
      "left": {
        "label": "If the bus is late, I walk. If I had set an alarm, I would not be late now.",
        "lines": [
          "The first is a real habit. The second is an unreal past with a present result."
        ]
      },
      "right": {
        "label": "If the bus will late, I walked always.",
        "lines": [
          "The verb forms do not match a conditional pattern."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "“If you heat water, it boils” is a…",
        "options": [
          "command",
          "plural noun",
          "real, always-true conditional",
          "past unreal wish"
        ],
        "answer": 2,
        "why": "Both verbs are present because the result always happens."
      },
      {
        "kind": "choice",
        "prompt": "“If I were you, I would leave” imagines…",
        "options": [
          "a scientific fact",
          "a plural",
          "an article",
          "something unreal now"
        ],
        "answer": 3,
        "why": "Were and would mark an unreal present."
      },
      {
        "kind": "choice",
        "prompt": "A past mistake with a present result can be…",
        "options": [
          "If I had left earlier, I would be there now.",
          "If I leave yesterday, I am there.",
          "If I had, leave.",
          "Had if leave now."
        ],
        "answer": 0,
        "why": "Had left is past. Would be is present."
      },
      {
        "kind": "choice",
        "prompt": "If is the word that…",
        "options": [
          "replaces a subject",
          "sets the condition",
          "always means and",
          "makes a noun plural"
        ],
        "answer": 1,
        "why": "The if-clause is the condition."
      }
    ]
  },
  {
    "id": "INT-13",
    "level": "intermediate",
    "order": 7,
    "type": "concept",
    "title": "Question formation and question tags",
    "minutes": 6,
    "summary": "Most questions move a helping verb before the subject. A tag asks for agreement.",
    "examples": [
      "Did she leave? She left, didn’t she?",
      "She did leave? She left, did she? when you expect agreement with a positive."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Question formation and question tags",
      "left": {
        "label": "Did she leave? She left, didn’t she?",
        "lines": [
          "Did opens the question. The tag didn’t she? checks the positive statement."
        ]
      },
      "right": {
        "label": "She did leave? She left, did she? when you expect agreement with a positive.",
        "lines": [
          "The helping verb and the tag do not match the usual pattern."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "A yes/no question often starts with…",
        "options": [
          "a full stop",
          "a helping verb",
          "the object",
          "an adjective"
        ],
        "answer": 1,
        "why": "Did she leave? starts with did."
      },
      {
        "kind": "choice",
        "prompt": "A positive statement takes a…",
        "options": [
          "noun tag",
          "no tag ever",
          "negative tag",
          "positive tag when you simply expect yes"
        ],
        "answer": 2,
        "why": "She left, didn’t she?"
      },
      {
        "kind": "choice",
        "prompt": "“You can hear it, ___?”",
        "options": [
          "can you as the usual check",
          "hear you",
          "it you",
          "can’t you"
        ],
        "answer": 3,
        "why": "The positive can takes the negative tag."
      },
      {
        "kind": "choice",
        "prompt": "Which question is formed in the usual way?",
        "options": [
          "Where did they go?",
          "Where they did go?",
          "Where went they?",
          "Did where they go?"
        ],
        "answer": 0,
        "why": "Did comes before the subject."
      }
    ]
  },
  {
    "id": "INT-14",
    "level": "intermediate",
    "order": 8,
    "type": "concept",
    "title": "Negative sentences",
    "minutes": 6,
    "summary": "A negative sentence uses not, usually with a helping verb, and avoids a second negative.",
    "examples": [
      "She does not have a pass. I can hear nothing.",
      "She does not have no pass."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Negative sentences",
      "left": {
        "label": "She does not have a pass. I can hear nothing.",
        "lines": [
          "Does not is one negative. Nothing is the single negative in the second sentence."
        ]
      },
      "right": {
        "label": "She does not have no pass.",
        "lines": [
          "Not and no cancel or clash."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "The natural negative of “She has a pass” is…",
        "options": [
          "She does not have a pass.",
          "She does not have no pass.",
          "She not has a pass.",
          "She have not pass."
        ],
        "answer": 0,
        "why": "One negative is enough, and does supports not."
      },
      {
        "kind": "choice",
        "prompt": "“I can’t find it” means…",
        "options": [
          "find is a noun",
          "I am unable to find it",
          "I can find it",
          "I found it"
        ],
        "answer": 1,
        "why": "Can’t is the negative of can."
      },
      {
        "kind": "choice",
        "prompt": "Double negatives such as “don’t have no” …",
        "options": [
          "replace the subject",
          "make a plural",
          "are avoided in standard sentences",
          "are required"
        ],
        "answer": 2,
        "why": "One negative carries the meaning."
      },
      {
        "kind": "choice",
        "prompt": "Not usually follows…",
        "options": [
          "the object with no helper",
          "a comma only",
          "a capital",
          "a helping verb"
        ],
        "answer": 3,
        "why": "Does not, is not, cannot."
      }
    ]
  },
  {
    "id": "INT-15",
    "level": "intermediate",
    "order": 9,
    "type": "concept",
    "title": "Sentence transformation",
    "minutes": 6,
    "summary": "The same meaning can be reshaped: active to passive, statement to question, or two sentences into one.",
    "examples": [
      "Maya sent the file. The file was sent by Maya.",
      "Maya sent the file. The file sent Maya."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Sentence transformation",
      "left": {
        "label": "Maya sent the file. The file was sent by Maya.",
        "lines": [
          "The meaning stays. The focus moves from Maya to the file."
        ]
      },
      "right": {
        "label": "Maya sent the file. The file sent Maya.",
        "lines": [
          "The second line changes who did the action."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "“Maya sent the file” becomes…",
        "options": [
          "The file sent Maya.",
          "Maya was sent the file did.",
          "Sent Maya file was.",
          "The file was sent by Maya."
        ],
        "answer": 3,
        "why": "The object becomes the subject of the passive."
      },
      {
        "kind": "choice",
        "prompt": "A statement can become a question by…",
        "options": [
          "moving a helping verb forward",
          "deleting the verb",
          "adding a plural",
          "removing the subject always"
        ],
        "answer": 0,
        "why": "She left. Did she leave?"
      },
      {
        "kind": "choice",
        "prompt": "Transformation should keep…",
        "options": [
          "a new fact",
          "the meaning",
          "none of the words ever",
          "only the commas"
        ],
        "answer": 1,
        "why": "The shape changes. The message should not."
      },
      {
        "kind": "choice",
        "prompt": "Which pair matches?",
        "options": [
          "She is tired. / Tired she is being a different fact.",
          "I left. / Left I no.",
          "We missed the bus. / The bus was missed by us.",
          "We missed the bus. / The bus missed we."
        ],
        "answer": 2,
        "why": "The passive keeps the same event."
      }
    ]
  },
  {
    "id": "INT-16",
    "level": "intermediate",
    "order": 10,
    "type": "concept",
    "title": "Combining and rearranging sentences",
    "minutes": 6,
    "summary": "Short sentences can be combined so the relationship between them is clear.",
    "examples": [
      "The bus was late. We walked. → Because the bus was late, we walked.",
      "The bus was late we walked."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Combining and rearranging sentences",
      "left": {
        "label": "The bus was late. We walked. → Because the bus was late, we walked.",
        "lines": [
          "Because shows the reason instead of leaving two bare facts."
        ]
      },
      "right": {
        "label": "The bus was late we walked.",
        "lines": [
          "The combine has no relationship word."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "A clear way to join a reason is…",
        "options": [
          "Late bus walked we.",
          "Because, walked.",
          "Because the bus was late, we walked.",
          "The bus was late we walked."
        ],
        "answer": 2,
        "why": "Because states the reason."
      },
      {
        "kind": "choice",
        "prompt": "But shows…",
        "options": [
          "a plural",
          "ownership",
          "a clock time",
          "contrast"
        ],
        "answer": 3,
        "why": "We ran, but we missed it."
      },
      {
        "kind": "choice",
        "prompt": "Rearranging should not…",
        "options": [
          "change who did the action by accident",
          "use a capital",
          "keep the meaning",
          "use a verb"
        ],
        "answer": 0,
        "why": "The file sent Maya is a different event."
      },
      {
        "kind": "choice",
        "prompt": "Which combine is clear?",
        "options": [
          "Sat she tired was.",
          "She was tired, so she sat down.",
          "She was tired she sat down.",
          "Tired so she."
        ],
        "answer": 1,
        "why": "So shows the result."
      }
    ]
  },
  {
    "id": "INT-17",
    "level": "intermediate",
    "order": 1,
    "type": "concept",
    "title": "Active and passive voice",
    "minutes": 6,
    "summary": "Active voice says who does the action. Passive voice says what receives it.",
    "examples": [
      "Priya wrote the note. The note was written by Priya.",
      "The note wrote Priya."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Active and passive voice",
      "left": {
        "label": "Priya wrote the note. The note was written by Priya.",
        "lines": [
          "The first names the doer first. The second names the note first."
        ]
      },
      "right": {
        "label": "The note wrote Priya.",
        "lines": [
          "The receiver has become the doer."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "“Priya wrote the note” is…",
        "options": [
          "a plural",
          "active",
          "passive",
          "a fragment"
        ],
        "answer": 1,
        "why": "The doer is the subject."
      },
      {
        "kind": "choice",
        "prompt": "“The note was written by Priya” is…",
        "options": [
          "a command",
          "an infinitive only",
          "passive",
          "active"
        ],
        "answer": 2,
        "why": "Was written moves the focus to the note."
      },
      {
        "kind": "choice",
        "prompt": "Passive voice needs a form of be plus…",
        "options": [
          "the -ing form only",
          "an article",
          "a capital",
          "the past participle"
        ],
        "answer": 3,
        "why": "Was written, is sent, were taken."
      },
      {
        "kind": "choice",
        "prompt": "Choose the passive.",
        "options": [
          "The seats were saved.",
          "We saved the seats.",
          "Save the seats.",
          "We seats."
        ],
        "answer": 0,
        "why": "Were saved does not start with the doer."
      }
    ]
  },
  {
    "id": "INT-18",
    "level": "intermediate",
    "order": 2,
    "type": "concept",
    "title": "Direct and indirect speech",
    "minutes": 6,
    "summary": "Direct speech quotes the words. Indirect speech reports them and usually shifts the tense.",
    "examples": [
      "Maya said, “I am late.” Maya said that she was late.",
      "Maya said that I am late, when she was talking about herself yesterday."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Direct and indirect speech",
      "left": {
        "label": "Maya said, “I am late.” Maya said that she was late.",
        "lines": [
          "The quote keeps am. The report shifts to was and she."
        ]
      },
      "right": {
        "label": "Maya said that I am late, when she was talking about herself yesterday.",
        "lines": [
          "The pronoun and the tense were not shifted."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "Direct speech uses…",
        "options": [
          "quotation marks",
          "only the word that",
          "a passive always",
          "no verb"
        ],
        "answer": 0,
        "why": "The exact words sit inside the marks."
      },
      {
        "kind": "choice",
        "prompt": "“I am tired,” she said, is often reported as…",
        "options": [
          "Said she am tired.",
          "She said that she was tired.",
          "She said that I am tired.",
          "She said she tired."
        ],
        "answer": 1,
        "why": "I becomes she and am becomes was."
      },
      {
        "kind": "choice",
        "prompt": "That in indirect speech…",
        "options": [
          "makes a plural",
          "is a modal",
          "introduces the report",
          "is always a relative for a bus"
        ],
        "answer": 2,
        "why": "She said that she was tired."
      },
      {
        "kind": "choice",
        "prompt": "Which keeps the exact words?",
        "options": [
          "He said that we should wait.",
          "He told us to wait.",
          "He said to wait.",
          "He said, “Wait.”"
        ],
        "answer": 3,
        "why": "The quotation is direct speech."
      }
    ]
  },
  {
    "id": "INT-19",
    "level": "intermediate",
    "order": 3,
    "type": "concept",
    "title": "Reported questions and commands",
    "minutes": 6,
    "summary": "Reported questions use statement word order. Reported commands often use to plus the verb.",
    "examples": [
      "She asked where I was. She told me to wait.",
      "She asked where was I. She told me wait."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Reported questions and commands",
      "left": {
        "label": "She asked where I was. She told me to wait.",
        "lines": [
          "Where I was, not where was I. To wait reports the command."
        ]
      },
      "right": {
        "label": "She asked where was I. She told me wait.",
        "lines": [
          "The question order stays, and the command has no to."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "Report “Where are you?” as…",
        "options": [
          "She asked where was I.",
          "She asked where I am being you.",
          "Asked where are you she.",
          "She asked where I was."
        ],
        "answer": 3,
        "why": "Reported questions use statement order."
      },
      {
        "kind": "choice",
        "prompt": "Report “Wait.” as…",
        "options": [
          "She told me to wait.",
          "She told me wait.",
          "She asked wait I.",
          "She said waiting me."
        ],
        "answer": 0,
        "why": "Tell plus to plus the base verb."
      },
      {
        "kind": "choice",
        "prompt": "Asked is for…",
        "options": [
          "capitals",
          "questions",
          "commands only",
          "plurals"
        ],
        "answer": 1,
        "why": "She asked if we were ready."
      },
      {
        "kind": "choice",
        "prompt": "“Did you leave?” can be reported as…",
        "options": [
          "He asked if did I leave.",
          "Asked he leave did.",
          "He asked if I had left.",
          "He asked did I leave."
        ],
        "answer": 2,
        "why": "If replaces the question form, and the tense shifts."
      }
    ]
  },
  {
    "id": "INT-20",
    "level": "intermediate",
    "order": 4,
    "type": "concept",
    "title": "Gerunds versus infinitives",
    "minutes": 6,
    "summary": "Some verbs are followed by a gerund, some by an infinitive, and a few by either with a change in meaning.",
    "examples": [
      "She enjoys reading. She decided to leave.",
      "She enjoys to read. She decided leaving."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Gerunds versus infinitives",
      "left": {
        "label": "She enjoys reading. She decided to leave.",
        "lines": [
          "Enjoy takes the gerund. Decide takes the infinitive."
        ]
      },
      "right": {
        "label": "She enjoys to read. She decided leaving.",
        "lines": [
          "The forms after those verbs are swapped."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "Enjoy is followed by…",
        "options": [
          "a gerund",
          "an infinitive in the usual pattern",
          "a past participle only",
          "an article"
        ],
        "answer": 0,
        "why": "She enjoys reading."
      },
      {
        "kind": "choice",
        "prompt": "Decide is followed by…",
        "options": [
          "a comma",
          "an infinitive",
          "a gerund in the usual pattern",
          "a plural noun"
        ],
        "answer": 1,
        "why": "She decided to leave."
      },
      {
        "kind": "choice",
        "prompt": "“I stopped to text” means…",
        "options": [
          "text is a noun only",
          "I never had a phone",
          "I paused in order to text",
          "I no longer text"
        ],
        "answer": 2,
        "why": "The infinitive gives the purpose of stopping."
      },
      {
        "kind": "choice",
        "prompt": "“I stopped texting” means…",
        "options": [
          "I paused so I could start",
          "texting is a place",
          "stopped is an adjective",
          "I no longer do it"
        ],
        "answer": 3,
        "why": "The gerund is the activity that ended."
      }
    ]
  },
  {
    "id": "INT-21",
    "level": "intermediate",
    "order": 5,
    "type": "concept",
    "title": "Participial phrases",
    "minutes": 6,
    "summary": "A participial phrase begins with a participle and describes a noun, usually the subject.",
    "examples": [
      "Rushing for the bus, Maya dropped her phone.",
      "Rushing for the bus, the phone dropped Maya."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Participial phrases",
      "left": {
        "label": "Rushing for the bus, Maya dropped her phone.",
        "lines": [
          "Rushing describes Maya, the subject."
        ]
      },
      "right": {
        "label": "Rushing for the bus, the phone dropped Maya.",
        "lines": [
          "The phrase is attached to the wrong noun."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "In the clear sentence, rushing describes…",
        "options": [
          "the phone",
          "the bus as the one rushing",
          "dropped",
          "Maya"
        ],
        "answer": 3,
        "why": "Maya is the one rushing."
      },
      {
        "kind": "choice",
        "prompt": "A dangling participle…",
        "options": [
          "is attached to the wrong noun",
          "is always correct",
          "replaces a subject on purpose",
          "is a spelling rule"
        ],
        "answer": 0,
        "why": "The phone cannot be the one rushing."
      },
      {
        "kind": "choice",
        "prompt": "A present participle ends in…",
        "options": [
          "to",
          "-ing",
          "-est",
          "a capital"
        ],
        "answer": 1,
        "why": "Rushing, waiting, hoping."
      },
      {
        "kind": "choice",
        "prompt": "Which line is attached correctly?",
        "options": [
          "Left the bus, carrying.",
          "Bag carrying she the.",
          "Carrying the bag, she boarded.",
          "Carrying the bag, the bus left her."
        ],
        "answer": 2,
        "why": "She is the one carrying the bag."
      }
    ]
  },
  {
    "id": "INT-22",
    "level": "intermediate",
    "order": 6,
    "type": "concept",
    "title": "Comparison structures",
    "minutes": 6,
    "summary": "As…as, more than, and the most mark different kinds of comparison.",
    "examples": [
      "This seat is as wide as that one. It is the most comfortable on the bus.",
      "This seat is as wider as that one."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Comparison structures",
      "left": {
        "label": "This seat is as wide as that one. It is the most comfortable on the bus.",
        "lines": [
          "As…as says they match. The most picks one from a group."
        ]
      },
      "right": {
        "label": "This seat is as wider as that one.",
        "lines": [
          "The comparative ending and as…as are mixed."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "Equal comparison uses…",
        "options": [
          "the most as",
          "wider as",
          "as wide as",
          "more wide as"
        ],
        "answer": 2,
        "why": "As…as is the equal pattern."
      },
      {
        "kind": "choice",
        "prompt": "“Than” appears with…",
        "options": [
          "as…as",
          "a plural only",
          "an article only",
          "a comparative"
        ],
        "answer": 3,
        "why": "Bigger than, more careful than."
      },
      {
        "kind": "choice",
        "prompt": "The whole group takes…",
        "options": [
          "the most or the -est form",
          "as…as only",
          "than without a comparative",
          "a command"
        ],
        "answer": 0,
        "why": "The most comfortable on the bus."
      },
      {
        "kind": "choice",
        "prompt": "Which line is well formed?",
        "options": [
          "She is the taller as the class.",
          "She is as tall as Maya.",
          "She is as taller as Maya.",
          "She is more tall as Maya."
        ],
        "answer": 1,
        "why": "As tall as compares equals."
      }
    ]
  },
  {
    "id": "INT-23",
    "level": "intermediate",
    "order": 7,
    "type": "concept",
    "title": "Parallel structure",
    "minutes": 6,
    "summary": "Items in a pair or a list should use the same grammatical shape.",
    "examples": [
      "She likes reading, writing, and drawing.",
      "She likes reading, to write, and draws."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Parallel structure",
      "left": {
        "label": "She likes reading, writing, and drawing.",
        "lines": [
          "Three gerunds match."
        ]
      },
      "right": {
        "label": "She likes reading, to write, and draws.",
        "lines": [
          "The three items use three different shapes."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "Which list is parallel?",
        "options": [
          "read, to writing, and drawed",
          "reading, writing, and drawing",
          "reading, to write, and draws",
          "to read, writing, and drew"
        ],
        "answer": 1,
        "why": "The gerunds match."
      },
      {
        "kind": "choice",
        "prompt": "Parallel structure matters in…",
        "options": [
          "plurals of bus",
          "question marks only",
          "lists and paired ideas",
          "capital letters only"
        ],
        "answer": 2,
        "why": "The items should share a shape."
      },
      {
        "kind": "choice",
        "prompt": "“She wanted to sit and to wait” is parallel because both parts use…",
        "options": [
          "a gerund and a noun",
          "two tenses",
          "an adjective and a verb",
          "to plus a verb"
        ],
        "answer": 3,
        "why": "The infinitives match."
      },
      {
        "kind": "choice",
        "prompt": "Fix “fast, careful, and quietly.”",
        "options": [
          "fast, careful, and quiet",
          "fast, carefully, and quietly if all are adverbs",
          "fastly, careful, quietly",
          "a fast and quietly careful"
        ],
        "answer": 0,
        "why": "If they describe a noun, the adjectives should match. If they describe an action, use adverbs throughout."
      }
    ]
  },
  {
    "id": "INT-24",
    "level": "intermediate",
    "order": 8,
    "type": "concept",
    "title": "Common collocations",
    "minutes": 6,
    "summary": "A collocation is a word partnership that sounds natural to a fluent speaker.",
    "examples": [
      "Make a mistake. Do your homework. Catch the bus.",
      "Do a mistake. Make your homework."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Common collocations",
      "left": {
        "label": "Make a mistake. Do your homework. Catch the bus.",
        "lines": [
          "Those verbs partner with those nouns."
        ]
      },
      "right": {
        "label": "Do a mistake. Make your homework.",
        "lines": [
          "The verbs are paired with the wrong nouns."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "The natural partner of mistake is…",
        "options": [
          "make",
          "do",
          "catch",
          "tell a mistake"
        ],
        "answer": 0,
        "why": "Make a mistake."
      },
      {
        "kind": "choice",
        "prompt": "Homework usually goes with…",
        "options": [
          "a do homework make",
          "do",
          "make",
          "say"
        ],
        "answer": 1,
        "why": "Do your homework."
      },
      {
        "kind": "choice",
        "prompt": "You ___ the bus.",
        "options": [
          "make",
          "tell",
          "catch",
          "do"
        ],
        "answer": 2,
        "why": "Catch the bus is the collocation."
      },
      {
        "kind": "choice",
        "prompt": "Which line sounds natural?",
        "options": [
          "strong rain in this usual pair",
          "big rain as the normal phrase",
          "fat rain",
          "heavy rain"
        ],
        "answer": 3,
        "why": "Heavy rain is the partnership English uses."
      }
    ]
  },
  {
    "id": "INT-25",
    "level": "intermediate",
    "order": 9,
    "type": "concept",
    "title": "Idioms and appropriate usage",
    "minutes": 6,
    "summary": "An idiom means something other than the literal words, and it has to fit the situation.",
    "examples": [
      "She said the quiz was a piece of cake.",
      "She said the quiz was a piece of cake to a formal board as slang she did not intend."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Idioms and appropriate usage",
      "left": {
        "label": "She said the quiz was a piece of cake.",
        "lines": [
          "That means the quiz was easy, not a dessert."
        ]
      },
      "right": {
        "label": "She said the quiz was a piece of cake to a formal board as slang she did not intend.",
        "lines": [
          "The meaning may be clear to friends and odd in a formal room."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "“A piece of cake” often means…",
        "options": [
          "a dessert you must bring",
          "impossible",
          "late",
          "easy"
        ],
        "answer": 3,
        "why": "The words are not literal."
      },
      {
        "kind": "choice",
        "prompt": "An idiom should…",
        "options": [
          "fit the audience",
          "be used in every formal email",
          "replace every verb",
          "avoid meaning"
        ],
        "answer": 0,
        "why": "Friends may enjoy it. A formal report may not."
      },
      {
        "kind": "choice",
        "prompt": "“Hit the books” means…",
        "options": [
          "finish a meal",
          "study",
          "strike a library shelf",
          "throw a book"
        ],
        "answer": 1,
        "why": "The meaning is not literal."
      },
      {
        "kind": "choice",
        "prompt": "Which use is literal, not an idiom?",
        "options": [
          "We hit the books.",
          "Hold your horses.",
          "She ate a piece of cake.",
          "The test was a piece of cake."
        ],
        "answer": 2,
        "why": "Here cake is actual food."
      }
    ]
  },
  {
    "id": "INT-26",
    "level": "intermediate",
    "order": 1,
    "type": "concept",
    "title": "Misplaced and dangling modifiers",
    "minutes": 6,
    "summary": "Put a describing phrase next to the word it describes.",
    "examples": [
      "Maya saw a bus rushing down the road.",
      "Rushing down the road, a bus was seen by Maya when Maya is the one rushing."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Misplaced and dangling modifiers",
      "left": {
        "label": "Maya saw a bus rushing down the road.",
        "lines": [
          "If Maya is rushing, say Rushing down the road, Maya saw a bus."
        ]
      },
      "right": {
        "label": "Rushing down the road, a bus was seen by Maya when Maya is the one rushing.",
        "lines": [
          "The phrase is closer to the bus than to Maya."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "A misplaced modifier…",
        "options": [
          "is a spelling error only",
          "replaces the verb",
          "sits too far from the word it describes",
          "is always at the start on purpose"
        ],
        "answer": 2,
        "why": "The reader attaches it to the wrong word."
      },
      {
        "kind": "choice",
        "prompt": "If Maya is the one rushing, write…",
        "options": [
          "Rushing down the road, a bus appeared.",
          "A bus rushing Maya saw.",
          "Saw rushing Maya bus the.",
          "Rushing down the road, Maya saw a bus."
        ],
        "answer": 3,
        "why": "The phrase is next to Maya."
      },
      {
        "kind": "choice",
        "prompt": "A dangling modifier has…",
        "options": [
          "nothing correct in the sentence to attach to",
          "a perfect subject",
          "two objects",
          "a capital only"
        ],
        "answer": 0,
        "why": "The described person is missing."
      },
      {
        "kind": "choice",
        "prompt": "“I only texted Maya” can mean…",
        "options": [
          "an article",
          "texting was the only action, or Maya was the only person, depending on placement",
          "a plural",
          "a past participle"
        ],
        "answer": 1,
        "why": "Only should sit next to the word it limits."
      }
    ]
  },
  {
    "id": "INT-27",
    "level": "intermediate",
    "order": 2,
    "type": "concept",
    "title": "Commonly confused words",
    "minutes": 6,
    "summary": "Some pairs look or sound alike and mean different things.",
    "examples": [
      "The delay affected the plan. The effect was a late bus.",
      "The delay effected the plan when you mean influenced it. The affect was late."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Commonly confused words",
      "left": {
        "label": "The delay affected the plan. The effect was a late bus.",
        "lines": [
          "Affect is usually the verb. Effect is usually the noun."
        ]
      },
      "right": {
        "label": "The delay effected the plan when you mean influenced it. The affect was late.",
        "lines": [
          "The usual verb and noun are swapped."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "Which word is usually the verb meaning to influence?",
        "options": [
          "effects as a noun only",
          "affect",
          "effect",
          "a effect"
        ],
        "answer": 1,
        "why": "The delay affected the plan."
      },
      {
        "kind": "choice",
        "prompt": "“The effect” is usually…",
        "options": [
          "a pronoun",
          "a command",
          "a noun",
          "a helping verb"
        ],
        "answer": 2,
        "why": "The effect was a late bus."
      },
      {
        "kind": "choice",
        "prompt": "Their, there, or they’re: belonging to them is…",
        "options": [
          "there",
          "they’re",
          "thier",
          "their"
        ],
        "answer": 3,
        "why": "Their shows ownership."
      },
      {
        "kind": "choice",
        "prompt": "You’re means…",
        "options": [
          "you are",
          "belonging to you",
          "a place",
          "your bag"
        ],
        "answer": 0,
        "why": "The apostrophe marks are."
      }
    ]
  },
  {
    "id": "INT-28",
    "level": "intermediate",
    "order": 3,
    "type": "concept",
    "title": "Common grammatical errors",
    "minutes": 6,
    "summary": "A few slips show up constantly: agreement, tense, double negatives, and the wrong pronoun form.",
    "examples": [
      "She doesn’t have a pass, and they were late.",
      "She don’t have no pass, and they was late."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Common grammatical errors",
      "left": {
        "label": "She doesn’t have a pass, and they were late.",
        "lines": [
          "Doesn’t matches she. Were matches they."
        ]
      },
      "right": {
        "label": "She don’t have no pass, and they was late.",
        "lines": [
          "Agreement, a double negative, and was for they all slip."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "She ___ want to be late.",
        "options": [
          "doesn’t",
          "don’t",
          "not",
          "doesn’t not"
        ],
        "answer": 0,
        "why": "Doesn’t agrees with she."
      },
      {
        "kind": "choice",
        "prompt": "They ___ waiting.",
        "options": [
          "be",
          "were",
          "was",
          "is being a plural was"
        ],
        "answer": 1,
        "why": "They takes were."
      },
      {
        "kind": "choice",
        "prompt": "Avoid…",
        "options": [
          "cannot find",
          "did not leave",
          "don’t have no",
          "does not have"
        ],
        "answer": 2,
        "why": "One negative is enough."
      },
      {
        "kind": "choice",
        "prompt": "“Me and her went” is better as…",
        "options": [
          "Her and me went.",
          "Me went and her.",
          "Went me her.",
          "She and I went."
        ],
        "answer": 3,
        "why": "Subject pronouns belong in the subject."
      }
    ]
  },
  {
    "id": "INT-29",
    "level": "intermediate",
    "order": 4,
    "type": "concept",
    "title": "Formal and informal English",
    "minutes": 6,
    "summary": "The grammar can be correct and still sound wrong for the room.",
    "examples": [
      "I will arrive a few minutes late.",
      "Gonna be late lol."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Formal and informal English",
      "left": {
        "label": "I will arrive a few minutes late.",
        "lines": [
          "That is clear enough for a teacher."
        ]
      },
      "right": {
        "label": "Gonna be late lol.",
        "lines": [
          "That fits a friend’s text, not a teacher’s inbox."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "Which line belongs in an email to a teacher?",
        "options": [
          "gonna be late",
          "u there",
          "save me a seat or else",
          "I will arrive a few minutes late."
        ],
        "answer": 3,
        "why": "Will arrive keeps a formal register."
      },
      {
        "kind": "choice",
        "prompt": "Gonna is…",
        "options": [
          "informal",
          "required in essays",
          "a past participle",
          "an article"
        ],
        "answer": 0,
        "why": "It stands in for going to among friends."
      },
      {
        "kind": "choice",
        "prompt": "Could you… is useful when you want to…",
        "options": [
          "make a plural",
          "sound polite",
          "sound angry",
          "remove the verb"
        ],
        "answer": 1,
        "why": "Could you save a seat?"
      },
      {
        "kind": "choice",
        "prompt": "Same news, two rooms. A friend may hear…",
        "options": [
          "Dear Sir or Madam only",
          "Pursuant to the bus.",
          "Gonna be late.",
          "I wished to inform you of a delay."
        ],
        "answer": 2,
        "why": "The short form matches a close friend."
      }
    ]
  },
  {
    "id": "INT-30",
    "level": "intermediate",
    "order": 5,
    "type": "concept",
    "title": "Paragraph construction",
    "minutes": 6,
    "summary": "A paragraph usually has one main idea, a few supporting sentences, and a closing line.",
    "examples": [
      "We missed the bus. The stop clock was wrong, and we left class late. Next time we will leave five minutes earlier.",
      "We missed the bus. Fries are salty. Monday is a day. Phones are loud."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Paragraph construction",
      "left": {
        "label": "We missed the bus. The stop clock was wrong, and we left class late. Next time we will leave five minutes earlier.",
        "lines": [
          "The first sentence is the point. The middle gives reasons. The last looks ahead."
        ]
      },
      "right": {
        "label": "We missed the bus. Fries are salty. Monday is a day. Phones are loud.",
        "lines": [
          "The sentences do not share one idea."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "A paragraph should mainly…",
        "options": [
          "stick to one idea",
          "change topic every sentence",
          "avoid verbs",
          "be one word"
        ],
        "answer": 0,
        "why": "The reader should feel a single point."
      },
      {
        "kind": "choice",
        "prompt": "The first sentence often…",
        "options": [
          "hides the idea",
          "states the point",
          "introduces a new unrelated topic",
          "is a fragment on purpose"
        ],
        "answer": 1,
        "why": "We missed the bus tells the point."
      },
      {
        "kind": "choice",
        "prompt": "Supporting sentences…",
        "options": [
          "remove the verb",
          "are always questions",
          "explain or give reasons",
          "contradict the topic with new subjects"
        ],
        "answer": 2,
        "why": "The clock and the late exit explain the miss."
      },
      {
        "kind": "choice",
        "prompt": "Which group is one paragraph idea?",
        "options": [
          "missed bus, salty fries, loud phones",
          "Monday, a cat, a comma",
          "three unrelated jokes",
          "missed bus, wrong clock, left late"
        ],
        "answer": 3,
        "why": "Those details belong together."
      }
    ]
  },
  {
    "id": "INT-31",
    "level": "intermediate",
    "order": 6,
    "type": "concept",
    "title": "Editing and proofreading",
    "minutes": 6,
    "summary": "Editing checks meaning and structure. Proofreading checks surface slips.",
    "examples": [
      "Read once for the point, then once for capitals, agreement, and full stops.",
      "Change nothing and call it checked."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Editing and proofreading",
      "left": {
        "label": "Read once for the point, then once for capitals, agreement, and full stops.",
        "lines": [
          "The two passes catch different problems."
        ]
      },
      "right": {
        "label": "Change nothing and call it checked.",
        "lines": [
          "A single glance misses both kinds of error."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "Proofreading looks mainly for…",
        "options": [
          "a new plot",
          "a different assignment",
          "longer paragraphs only",
          "slips such as spelling, capitals, and punctuation"
        ],
        "answer": 3,
        "why": "It is the surface pass."
      },
      {
        "kind": "choice",
        "prompt": "Editing may ask…",
        "options": [
          "Does this sentence belong?",
          "Is the full stop a circle?",
          "How many letters in bus?",
          "Is the font blue?"
        ],
        "answer": 0,
        "why": "Editing cares about structure and meaning."
      },
      {
        "kind": "choice",
        "prompt": "A useful order is…",
        "options": [
          "delete the point",
          "meaning first, then surface slips",
          "surface only",
          "never reread"
        ],
        "answer": 1,
        "why": "Fix the idea before polishing marks."
      },
      {
        "kind": "choice",
        "prompt": "“She don’t leaves.” needs…",
        "options": [
          "an idiom",
          "a passive only",
          "agreement and a simpler verb: She doesn’t leave.",
          "a new topic"
        ],
        "answer": 2,
        "why": "Both the meaning of the verb and the agreement slip."
      }
    ]
  },
  {
    "id": "INT-32",
    "level": "intermediate",
    "order": 7,
    "type": "concept",
    "title": "Roots, prefixes and suffixes",
    "minutes": 6,
    "summary": "A root carries the core meaning. A prefix comes before it. A suffix comes after.",
    "examples": [
      "I reread the unfair comment.",
      "I unread the refair comment when you mean read again and not fair."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Roots, prefixes and suffixes",
      "left": {
        "label": "I reread the unfair comment.",
        "lines": [
          "Re- means again. Un- reverses fair."
        ]
      },
      "right": {
        "label": "I unread the refair comment when you mean read again and not fair.",
        "lines": [
          "The pieces are attached to the wrong meaning."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "Re- often means…",
        "options": [
          "a person",
          "a tense",
          "again",
          "not"
        ],
        "answer": 2,
        "why": "Reread means read again."
      },
      {
        "kind": "choice",
        "prompt": "Un- often means…",
        "options": [
          "again",
          "full of",
          "a plural",
          "not or the reverse"
        ],
        "answer": 3,
        "why": "Unfair means not fair."
      },
      {
        "kind": "choice",
        "prompt": "-ful in careful means…",
        "options": [
          "full of",
          "again",
          "not",
          "past tense"
        ],
        "answer": 0,
        "why": "Careful means full of care."
      },
      {
        "kind": "choice",
        "prompt": "Which word adds a prefix that reverses?",
        "options": [
          "reading",
          "unfair",
          "careful",
          "reader"
        ],
        "answer": 1,
        "why": "Un- flips fair."
      }
    ]
  },
  {
    "id": "INT-33",
    "level": "intermediate",
    "order": 8,
    "type": "concept",
    "title": "Compound words",
    "minutes": 6,
    "summary": "A compound joins two words into one meaning. It may be open, hyphenated, or closed.",
    "examples": [
      "We missed the bus stop and left a goodbye.",
      "We missed the busstop and left a good bye as if the pattern were random."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Compound words",
      "left": {
        "label": "We missed the bus stop and left a goodbye.",
        "lines": [
          "Bus stop is open. Goodbye is closed."
        ]
      },
      "right": {
        "label": "We missed the busstop and left a good bye as if the pattern were random.",
        "lines": [
          "The spacing does not follow the usual form."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "Bus stop is usually written…",
        "options": [
          "as one letter",
          "as two words",
          "as busstop",
          "as bus-stop in every everyday use"
        ],
        "answer": 1,
        "why": "It is an open compound."
      },
      {
        "kind": "choice",
        "prompt": "Goodbye is usually…",
        "options": [
          "good-bye in all modern use only",
          "a verb plus to",
          "one word",
          "good bye"
        ],
        "answer": 2,
        "why": "It is a closed compound."
      },
      {
        "kind": "choice",
        "prompt": "A compound’s meaning…",
        "options": [
          "is always the first word only",
          "deletes the second word",
          "is a prefix",
          "is shared by the two parts together"
        ],
        "answer": 3,
        "why": "Bus stop is a place, not just a bus."
      },
      {
        "kind": "choice",
        "prompt": "Which is a compound?",
        "options": [
          "homework",
          "the",
          "and",
          "quickly as one job"
        ],
        "answer": 0,
        "why": "Home and work have joined."
      }
    ]
  },
  {
    "id": "INT-34",
    "level": "intermediate",
    "order": 9,
    "type": "concept",
    "title": "Homophones, homonyms and homographs",
    "minutes": 6,
    "summary": "Homophones sound alike. Homonyms share a spelling or sound. Homographs share a spelling and may differ in sound.",
    "examples": [
      "We ate two fries, too. She read the note, and she will read another.",
      "We eight too fries to."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Homophones, homonyms and homographs",
      "left": {
        "label": "We ate two fries, too. She read the note, and she will read another.",
        "lines": [
          "Ate and eight sound different; two, too, and to sound alike. Read is spelled the same for two pronunciations."
        ]
      },
      "right": {
        "label": "We eight too fries to.",
        "lines": [
          "The sound-alikes are swapped."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "Two, too, and to are…",
        "options": [
          "homophones",
          "the same meaning",
          "prefixes",
          "tenses"
        ],
        "answer": 0,
        "why": "They sound alike and mean different things."
      },
      {
        "kind": "choice",
        "prompt": "Read (present) and read (past) are…",
        "options": [
          "commands",
          "homographs",
          "homophones with different spelling",
          "articles"
        ],
        "answer": 1,
        "why": "Same spelling, different sound and tense."
      },
      {
        "kind": "choice",
        "prompt": "Their and there…",
        "options": [
          "are both places",
          "are verbs",
          "sound alike and mean different things",
          "are both possessives"
        ],
        "answer": 2,
        "why": "That is why they are confused."
      },
      {
        "kind": "choice",
        "prompt": "Choose the homophone that means also.",
        "options": [
          "two",
          "to",
          "toe",
          "too"
        ],
        "answer": 3,
        "why": "Too means also or excessive."
      }
    ]
  },
  {
    "id": "INT-35",
    "level": "intermediate",
    "order": 10,
    "type": "concept",
    "title": "Synonyms and antonyms",
    "minutes": 6,
    "summary": "A synonym is close in meaning. An antonym is opposite.",
    "examples": [
      "The bus was late, not early. It was delayed.",
      "The bus was late, which means early."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Synonyms and antonyms",
      "left": {
        "label": "The bus was late, not early. It was delayed.",
        "lines": [
          "Late and delayed are close. Early is the opposite of late."
        ]
      },
      "right": {
        "label": "The bus was late, which means early.",
        "lines": [
          "The opposite has been treated as a synonym."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "A synonym for late in this context is…",
        "options": [
          "early",
          "quiet",
          "plural",
          "delayed"
        ],
        "answer": 3,
        "why": "Delayed is close to late."
      },
      {
        "kind": "choice",
        "prompt": "An antonym of late is…",
        "options": [
          "early",
          "delayed",
          "tardy",
          "behind"
        ],
        "answer": 0,
        "why": "Early is the opposite."
      },
      {
        "kind": "choice",
        "prompt": "Big and large are…",
        "options": [
          "articles",
          "synonyms",
          "antonyms",
          "homophones"
        ],
        "answer": 1,
        "why": "They are close in meaning."
      },
      {
        "kind": "choice",
        "prompt": "Start and finish are…",
        "options": [
          "prefixes",
          "spellings of one word",
          "antonyms",
          "the same verb"
        ],
        "answer": 2,
        "why": "They point in opposite directions."
      }
    ]
  },
  {
    "id": "INT-36",
    "level": "intermediate",
    "order": 11,
    "type": "concept",
    "title": "Word families and changing parts of speech",
    "minutes": 6,
    "summary": "Words in a family share a root and change job with a suffix.",
    "examples": [
      "Decide, decision, decisive. She made a decision.",
      "She made a decide."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Word families and changing parts of speech",
      "left": {
        "label": "Decide, decision, decisive. She made a decision.",
        "lines": [
          "Decide is the verb. Decision is the noun."
        ]
      },
      "right": {
        "label": "She made a decide.",
        "lines": [
          "The verb form is sitting where a noun is needed."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "Decision is the noun from…",
        "options": [
          "quick",
          "they",
          "decide",
          "bus"
        ],
        "answer": 2,
        "why": "The family shares the root."
      },
      {
        "kind": "choice",
        "prompt": "“Her ___ was quick.”",
        "options": [
          "decide",
          "deciding as the only noun here",
          "decidedly noun",
          "decision"
        ],
        "answer": 3,
        "why": "The blank needs a noun."
      },
      {
        "kind": "choice",
        "prompt": "Quick, quickly, and quickness are…",
        "options": [
          "a word family",
          "unrelated",
          "three tenses of be",
          "articles"
        ],
        "answer": 0,
        "why": "The suffix changes the job."
      },
      {
        "kind": "choice",
        "prompt": "A suffix can…",
        "options": [
          "remove spelling",
          "change the part of speech",
          "delete the meaning always",
          "replace the subject"
        ],
        "answer": 1,
        "why": "-ion, -ly, and -ness do that work."
      }
    ]
  },
  {
    "id": "INT-37",
    "level": "intermediate",
    "order": 1,
    "type": "concept",
    "title": "Future forms: will, going to, and present continuous",
    "minutes": 6,
    "summary": "Will often marks a decision made now. Going to marks a plan. The present continuous can mark an arrangement.",
    "examples": [
      "The bus is late, so I will walk. I am meeting Priya at 4.",
      "I will meeting Priya at 4. I am walk because I just decided."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Future forms: will, going to, and present continuous",
      "left": {
        "label": "The bus is late, so I will walk. I am meeting Priya at 4.",
        "lines": [
          "Will is the new decision. Am meeting is already arranged."
        ]
      },
      "right": {
        "label": "I will meeting Priya at 4. I am walk because I just decided.",
        "lines": [
          "The forms are attached to the wrong kind of future."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "A decision you make while speaking uses…",
        "options": [
          "an article",
          "will",
          "a past participle alone",
          "had left"
        ],
        "answer": 1,
        "why": "I will walk."
      },
      {
        "kind": "choice",
        "prompt": "An arrangement with a time often uses…",
        "options": [
          "a noun only",
          "was",
          "the present continuous",
          "will plus -ing"
        ],
        "answer": 2,
        "why": "I am meeting Priya at 4."
      },
      {
        "kind": "choice",
        "prompt": "Going to fits…",
        "options": [
          "a past fact",
          "a fragment",
          "a plural",
          "a plan you already have"
        ],
        "answer": 3,
        "why": "I am going to catch the early bus."
      },
      {
        "kind": "choice",
        "prompt": "Which pair matches?",
        "options": [
          "just decided → will; already arranged → am meeting",
          "just decided → had met; arranged → a noun",
          "will → yesterday",
          "am meeting → a finished past"
        ],
        "answer": 0,
        "why": "The form follows the kind of future."
      }
    ]
  },
  {
    "id": "INT-38",
    "level": "intermediate",
    "order": 2,
    "type": "concept",
    "title": "Perfect and perfect-continuous forms",
    "minutes": 6,
    "summary": "The perfect links an earlier time to a later one. The perfect continuous stresses the length of that activity.",
    "examples": [
      "I have missed two buses. I have been waiting since 7.",
      "I have miss two buses since I am wait."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Perfect and perfect-continuous forms",
      "left": {
        "label": "I have missed two buses. I have been waiting since 7.",
        "lines": [
          "Have missed looks at the result. Have been waiting looks at the time spent."
        ]
      },
      "right": {
        "label": "I have miss two buses since I am wait.",
        "lines": [
          "The participle and the continuous piece are incomplete."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "“I have lost my pass” links the loss to…",
        "options": [
          "now",
          "a future plan only",
          "a command",
          "a noun"
        ],
        "answer": 0,
        "why": "The present perfect reaches the present."
      },
      {
        "kind": "choice",
        "prompt": "Since 7 with a waiting activity prefers…",
        "options": [
          "waited since as a habit of tomorrow",
          "have been waiting",
          "wait",
          "am wait"
        ],
        "answer": 1,
        "why": "The perfect continuous shows duration."
      },
      {
        "kind": "choice",
        "prompt": "Had left means the leaving happened…",
        "options": [
          "as a noun",
          "without a subject ever",
          "before another past moment",
          "in the future"
        ],
        "answer": 2,
        "why": "The bus had left before we arrived."
      },
      {
        "kind": "choice",
        "prompt": "Which line shows duration?",
        "options": [
          "She texts.",
          "She texted once.",
          "A text.",
          "She has been texting for an hour."
        ],
        "answer": 3,
        "why": "Has been texting covers the stretch of time."
      }
    ]
  },
  {
    "id": "INT-39",
    "level": "intermediate",
    "order": 3,
    "type": "concept",
    "title": "Tense consistency in writing",
    "minutes": 6,
    "summary": "Stay in one time unless the meaning really changes time.",
    "examples": [
      "We missed the bus, walked, and arrived late.",
      "We missed the bus, walk, and arrive late."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Tense consistency in writing",
      "left": {
        "label": "We missed the bus, walked, and arrived late.",
        "lines": [
          "Three past verbs tell one past story."
        ]
      },
      "right": {
        "label": "We missed the bus, walk, and arrive late.",
        "lines": [
          "The story jumps tense for no reason."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "A past story should mostly use…",
        "options": [
          "a new tense every clause",
          "only future",
          "no verbs",
          "past verbs"
        ],
        "answer": 3,
        "why": "Missed, walked, arrived."
      },
      {
        "kind": "choice",
        "prompt": "Change tense when…",
        "options": [
          "the time of the events really changes",
          "you want variety",
          "a noun is plural",
          "you add a comma"
        ],
        "answer": 0,
        "why": "We missed it, and now we are walking."
      },
      {
        "kind": "choice",
        "prompt": "Which paragraph is consistent?",
        "options": [
          "Left she texts waited.",
          "She left, texted, and waited.",
          "She left, texts, and waited.",
          "She leaves, texted, and waits yesterday."
        ],
        "answer": 1,
        "why": "All three verbs are past."
      },
      {
        "kind": "choice",
        "prompt": "“Yesterday I leave” should be…",
        "options": [
          "Yesterday I leaving.",
          "Leave yesterday I.",
          "Yesterday I left.",
          "Yesterday I am leave."
        ],
        "answer": 2,
        "why": "Yesterday requires the past."
      }
    ]
  },
  {
    "id": "INT-40",
    "level": "intermediate",
    "order": 1,
    "type": "concept",
    "title": "Requests, permission, advice and obligation",
    "minutes": 6,
    "summary": "Can, could, may, should, and must separate a soft request from a duty.",
    "examples": [
      "Could you save a seat? You must show your pass.",
      "You must maybe save a seat if you only want to be polite. Could you show your pass as a rule."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Requests, permission, advice and obligation",
      "left": {
        "label": "Could you save a seat? You must show your pass.",
        "lines": [
          "Could you is a polite request. Must is an obligation."
        ]
      },
      "right": {
        "label": "You must maybe save a seat if you only want to be polite. Could you show your pass as a rule.",
        "lines": [
          "The strength of the modal does not match the situation."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "A polite request is…",
        "options": [
          "Could you save a seat?",
          "You must save a seat or else.",
          "Save.",
          "Seat you could."
        ],
        "answer": 0,
        "why": "Could you softens the request."
      },
      {
        "kind": "choice",
        "prompt": "Must often marks…",
        "options": [
          "a nickname",
          "obligation",
          "a casual guess only",
          "a plural"
        ],
        "answer": 1,
        "why": "You must show your pass."
      },
      {
        "kind": "choice",
        "prompt": "Should often marks…",
        "options": [
          "ownership",
          "a capital",
          "advice",
          "a finished fact"
        ],
        "answer": 2,
        "why": "You should leave earlier."
      },
      {
        "kind": "choice",
        "prompt": "May I sit here? asks for…",
        "options": [
          "a past time",
          "a synonym",
          "a fragment",
          "permission"
        ],
        "answer": 3,
        "why": "May I is a permission question."
      }
    ]
  },
  {
    "id": "INT-41",
    "level": "intermediate",
    "order": 2,
    "type": "concept",
    "title": "Ability, possibility, probability and certainty",
    "minutes": 6,
    "summary": "Can marks ability. Might marks a weak possibility. Must can mark a strong conclusion.",
    "examples": [
      "I can hear the bus. It might be late. That must be our stop.",
      "I might hear it if the sound is certain, and I must hear it if I am only guessing weakly."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Ability, possibility, probability and certainty",
      "left": {
        "label": "I can hear the bus. It might be late. That must be our stop.",
        "lines": [
          "Can is ability. Might is unsure. Must here is a confident conclusion."
        ]
      },
      "right": {
        "label": "I might hear it if the sound is certain, and I must hear it if I am only guessing weakly.",
        "lines": [
          "The strength of the modal does not match the evidence."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "Ability uses…",
        "options": [
          "might for a skill you definitely have",
          "a noun",
          "must for a maybe",
          "can"
        ],
        "answer": 3,
        "why": "I can hear it."
      },
      {
        "kind": "choice",
        "prompt": "A weak possibility uses…",
        "options": [
          "might",
          "must as a guess with little evidence",
          "can as a finished fact",
          "a full stop only"
        ],
        "answer": 0,
        "why": "It might be late."
      },
      {
        "kind": "choice",
        "prompt": "“That must be our stop” means…",
        "options": [
          "stop is past",
          "I am almost sure",
          "I have no idea",
          "it was a noun"
        ],
        "answer": 1,
        "why": "Must draws a strong conclusion."
      },
      {
        "kind": "choice",
        "prompt": "Which is the least sure?",
        "options": [
          "She is here.",
          "She came.",
          "She might come.",
          "She will come."
        ],
        "answer": 2,
        "why": "Might leaves the result open."
      }
    ]
  },
  {
    "id": "INT-42",
    "level": "intermediate",
    "order": 3,
    "type": "concept",
    "title": "Offers, suggestions and invitations",
    "minutes": 6,
    "summary": "Offers, suggestions, and invitations use different patterns.",
    "examples": [
      "I will grab your hoodie. Shall we walk? Would you like to come?",
      "I grab your hoodie as an offer with no modal. You come."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Offers, suggestions and invitations",
      "left": {
        "label": "I will grab your hoodie. Shall we walk? Would you like to come?",
        "lines": [
          "Will offers. Shall we suggests. Would you like invites."
        ]
      },
      "right": {
        "label": "I grab your hoodie as an offer with no modal. You come.",
        "lines": [
          "The inviting and offering language is missing."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "An offer of help can be…",
        "options": [
          "You grab it.",
          "Hoodie will.",
          "I will grab your hoodie.",
          "Grab."
        ],
        "answer": 2,
        "why": "Will volunteers the action."
      },
      {
        "kind": "choice",
        "prompt": "Shall we… is a…",
        "options": [
          "strong order",
          "past fact",
          "plural noun",
          "suggestion"
        ],
        "answer": 3,
        "why": "It invites a shared decision."
      },
      {
        "kind": "choice",
        "prompt": "Would you like to come? is an…",
        "options": [
          "invitation",
          "refusal",
          "article",
          "past participle"
        ],
        "answer": 0,
        "why": "It asks the other person to join."
      },
      {
        "kind": "choice",
        "prompt": "Which is the softest invitation?",
        "options": [
          "Sitting.",
          "Would you like to sit with us?",
          "Sit.",
          "You sit now."
        ],
        "answer": 1,
        "why": "Would you like leaves room to say no."
      }
    ]
  },
  {
    "id": "INT-43",
    "level": "intermediate",
    "order": 4,
    "type": "concept",
    "title": "Agreement and disagreement",
    "minutes": 6,
    "summary": "Agree and disagree in a way that matches how well you know the person.",
    "examples": [
      "I see what you mean, but I think we should wait.",
      "You’re wrong, shut up."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Agreement and disagreement",
      "left": {
        "label": "I see what you mean, but I think we should wait.",
        "lines": [
          "The first clause respects the other view. But introduces yours."
        ]
      },
      "right": {
        "label": "You’re wrong, shut up.",
        "lines": [
          "The disagreement attacks the person."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "A respectful disagreement can start with…",
        "options": [
          "Shut the idea.",
          "I see what you mean, but…",
          "No, you’re silly.",
          "Wrong."
        ],
        "answer": 1,
        "why": "It acknowledges the other person first."
      },
      {
        "kind": "choice",
        "prompt": "I agree means…",
        "options": [
          "you leave",
          "you own it",
          "you share the view",
          "you refuse it"
        ],
        "answer": 2,
        "why": "Agree is the same side."
      },
      {
        "kind": "choice",
        "prompt": "But after a partial agreement signals…",
        "options": [
          "a plural",
          "a name",
          "a tense",
          "a different view"
        ],
        "answer": 3,
        "why": "The contrast follows."
      },
      {
        "kind": "choice",
        "prompt": "Which reply disagrees politely?",
        "options": [
          "I’m not sure that’s right.",
          "That’s stupid.",
          "No way, idiot.",
          "False, you."
        ],
        "answer": 0,
        "why": "It challenges the idea, not the person."
      }
    ]
  },
  {
    "id": "INT-44",
    "level": "intermediate",
    "order": 5,
    "type": "concept",
    "title": "Making comparisons and expressing preferences",
    "minutes": 6,
    "summary": "Prefer, would rather, and comparison forms say which option you want.",
    "examples": [
      "I prefer the early bus. I would rather walk than wait.",
      "I prefer walk than the bus. I would rather to wait."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Making comparisons and expressing preferences",
      "left": {
        "label": "I prefer the early bus. I would rather walk than wait.",
        "lines": [
          "Prefer takes the noun. Would rather takes the base verb."
        ]
      },
      "right": {
        "label": "I prefer walk than the bus. I would rather to wait.",
        "lines": [
          "The patterns after prefer and would rather are mixed up."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "Prefer is often followed by…",
        "options": [
          "a noun or a gerund",
          "the base verb with rather’s pattern",
          "a past participle only",
          "an article only"
        ],
        "answer": 0,
        "why": "I prefer walking. I prefer the early bus."
      },
      {
        "kind": "choice",
        "prompt": "Would rather is followed by…",
        "options": [
          "an -ing form always",
          "the base verb",
          "to plus verb in the usual pattern",
          "a plural noun always"
        ],
        "answer": 1,
        "why": "I would rather walk."
      },
      {
        "kind": "choice",
        "prompt": "Than joins…",
        "options": [
          "a question",
          "an article",
          "the option you reject",
          "a capital"
        ],
        "answer": 2,
        "why": "Rather walk than wait."
      },
      {
        "kind": "choice",
        "prompt": "Which line states a preference clearly?",
        "options": [
          "I rather to walking than.",
          "Prefer I wait walk.",
          "Than walk rather.",
          "I would rather walk than wait."
        ],
        "answer": 3,
        "why": "The base verbs match on both sides of than."
      }
    ]
  },
  {
    "id": "INT-45",
    "level": "intermediate",
    "order": 6,
    "type": "concept",
    "title": "Polite and indirect questions",
    "minutes": 6,
    "summary": "An indirect question asks softly and uses statement word order.",
    "examples": [
      "Could you tell me where the stop is?",
      "Could you tell me where is the stop?"
    ],
    "diagram": {
      "kind": "compare",
      "title": "Polite and indirect questions",
      "left": {
        "label": "Could you tell me where the stop is?",
        "lines": [
          "Where the stop is, not where is the stop, after the polite opening."
        ]
      },
      "right": {
        "label": "Could you tell me where is the stop?",
        "lines": [
          "The question order stays inside the indirect question."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "Inside “Can you tell me…”, use…",
        "options": [
          "question order",
          "no verb",
          "a command",
          "statement order"
        ],
        "answer": 3,
        "why": "Where the stop is."
      },
      {
        "kind": "choice",
        "prompt": "A polite opener is…",
        "options": [
          "Could you tell me…?",
          "Tell me now.",
          "Where.",
          "Say."
        ],
        "answer": 0,
        "why": "Could you softens the question."
      },
      {
        "kind": "choice",
        "prompt": "Which line is indirect and well formed?",
        "options": [
          "If did she leave know?",
          "Do you know if she left?",
          "Do you know did she leave?",
          "Know you if left she?"
        ],
        "answer": 1,
        "why": "If she left uses statement order."
      },
      {
        "kind": "choice",
        "prompt": "Indirect questions are useful when you want to sound…",
        "options": [
          "past tense only",
          "plural",
          "less abrupt",
          "angry"
        ],
        "answer": 2,
        "why": "They give the other person room."
      }
    ]
  },
  {
    "id": "ADV-01",
    "level": "advanced",
    "order": 1,
    "type": "concept",
    "title": "Emphasis and inversion",
    "minutes": 6,
    "summary": "Moving a negative or limiting phrase to the front, and flipping the helping verb, puts weight on that phrase.",
    "examples": [
      "Never have I seen a bus that late.",
      "Never I have seen a bus that late."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Emphasis and inversion",
      "left": {
        "label": "Never have I seen a bus that late.",
        "lines": [
          "Never is fronted, so have comes before I."
        ]
      },
      "right": {
        "label": "Never I have seen a bus that late.",
        "lines": [
          "The helping verb stays after the subject, so the emphasis pattern is incomplete."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "After a negative opener such as never, the usual pattern is…",
        "options": [
          "subject before the helping verb",
          "no verb",
          "a plural noun",
          "helping verb before the subject"
        ],
        "answer": 3,
        "why": "Never have I, not Never I have."
      },
      {
        "kind": "choice",
        "prompt": "“Rarely do we catch it” emphasises…",
        "options": [
          "how seldom it happens",
          "that we always catch it",
          "a person named Rarely",
          "the noun bus"
        ],
        "answer": 0,
        "why": "Rarely plus inversion spotlights the rarity."
      },
      {
        "kind": "choice",
        "prompt": "Which line uses inversion for emphasis?",
        "options": [
          "Did little she.",
          "Little did she know the bus had left.",
          "Little she knew the bus had left.",
          "She little did know."
        ],
        "answer": 1,
        "why": "Little did she know flips did in front of she."
      },
      {
        "kind": "choice",
        "prompt": "Inversion here changes…",
        "options": [
          "the spelling of never",
          "the number of nouns",
          "the focus, while the basic meaning stays",
          "who took the bus"
        ],
        "answer": 2,
        "why": "The event is the same. The fronted word gets the stress."
      }
    ]
  },
  {
    "id": "ADV-02",
    "level": "advanced",
    "order": 1,
    "type": "concept",
    "title": "Concrete and abstract nouns",
    "minutes": 6,
    "summary": "A concrete noun names something you can sense. An abstract noun names an idea, feeling, or quality.",
    "examples": [
      "The delay caused real anxiety.",
      "The anxiety sat on the seat next to the delay as if both were objects you could pick up."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Concrete and abstract nouns",
      "left": {
        "label": "The delay caused real anxiety.",
        "lines": [
          "Delay can be noticed in time. Anxiety is a feeling, so it is abstract."
        ]
      },
      "right": {
        "label": "The anxiety sat on the seat next to the delay as if both were objects you could pick up.",
        "lines": [
          "A feeling is treated as if it were a thing you can touch."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "Which noun is abstract?",
        "options": [
          "phone",
          "seat",
          "honesty",
          "bus"
        ],
        "answer": 2,
        "why": "Honesty is a quality. The others can be seen or touched."
      },
      {
        "kind": "choice",
        "prompt": "Which noun is concrete?",
        "options": [
          "relief",
          "silence",
          "freedom",
          "hoodie"
        ],
        "answer": 3,
        "why": "A hoodie is a physical thing."
      },
      {
        "kind": "choice",
        "prompt": "“The silence in the hallway” uses silence as…",
        "options": [
          "an abstract noun",
          "a verb",
          "an article",
          "a concrete object you can carry"
        ],
        "answer": 0,
        "why": "Silence names a quality of the place, not a thing you hold."
      },
      {
        "kind": "choice",
        "prompt": "A concrete noun is one you can…",
        "options": [
          "always capitalise",
          "see, hear, or touch",
          "only feel as an idea",
          "never use as a subject"
        ],
        "answer": 1,
        "why": "Bus, phone, and rain are available to the senses."
      }
    ]
  },
  {
    "id": "ADV-03",
    "level": "advanced",
    "order": 2,
    "type": "concept",
    "title": "Collective nouns and agreement",
    "minutes": 6,
    "summary": "A collective noun names a group. It can take a singular verb when the group acts as one, and a plural verb when the members act separately.",
    "examples": [
      "The team is on the bus. The team are arguing about the playlist.",
      "The team are on the bus if you mean one vehicle as a single unit, and the team is arguing if you mean each person is arguing a different point."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Collective nouns and agreement",
      "left": {
        "label": "The team is on the bus. The team are arguing about the playlist.",
        "lines": [
          "Is treats the team as one unit. Are treats the members as individuals."
        ]
      },
      "right": {
        "label": "The team are on the bus if you mean one vehicle as a single unit, and the team is arguing if you mean each person is arguing a different point.",
        "lines": [
          "The verb does not match whether you mean the unit or the members."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "When the group acts as one, choose…",
        "options": [
          "a past participle only",
          "a singular verb",
          "a plural verb",
          "no verb"
        ],
        "answer": 1,
        "why": "The class is waiting."
      },
      {
        "kind": "choice",
        "prompt": "“The jury are divided” treats the jury as…",
        "options": [
          "a place",
          "an article",
          "separate people",
          "one single mind"
        ],
        "answer": 2,
        "why": "Divided points at the members, so a plural verb fits."
      },
      {
        "kind": "choice",
        "prompt": "Which line matches a united group?",
        "options": [
          "The class are a single ready thing.",
          "Class ready is.",
          "Is the class are.",
          "The class is ready."
        ],
        "answer": 3,
        "why": "Is matches one unit."
      },
      {
        "kind": "choice",
        "prompt": "A collective noun names…",
        "options": [
          "a group",
          "one person’s feeling only",
          "a helping verb",
          "a suffix"
        ],
        "answer": 0,
        "why": "Team, class, and jury are groups."
      }
    ]
  },
  {
    "id": "ADV-04",
    "level": "advanced",
    "order": 3,
    "type": "concept",
    "title": "Case of nouns and pronouns",
    "minutes": 6,
    "summary": "Subject pronouns do the action. Object pronouns receive it. Possessive forms show ownership.",
    "examples": [
      "She texted me, and the reply was hers.",
      "Her texted I, and the reply was she."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Case of nouns and pronouns",
      "left": {
        "label": "She texted me, and the reply was hers.",
        "lines": [
          "She is the subject, me is the object, and hers shows ownership."
        ]
      },
      "right": {
        "label": "Her texted I, and the reply was she.",
        "lines": [
          "The subject, object, and possessive forms are swapped."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "Which pronoun can be the subject?",
        "options": [
          "she",
          "her",
          "me",
          "him"
        ],
        "answer": 0,
        "why": "She texted me. Her cannot be the doer."
      },
      {
        "kind": "choice",
        "prompt": "The object of “texted” in “She texted me” is…",
        "options": [
          "a noun only",
          "me",
          "she",
          "texted"
        ],
        "answer": 1,
        "why": "Me receives the text."
      },
      {
        "kind": "choice",
        "prompt": "Hers is…",
        "options": [
          "a verb",
          "an article",
          "a possessive pronoun",
          "a subject pronoun"
        ],
        "answer": 2,
        "why": "The reply was hers."
      },
      {
        "kind": "choice",
        "prompt": "“Maya and ___ left” needs…",
        "options": [
          "me",
          "hers",
          "my",
          "I"
        ],
        "answer": 3,
        "why": "I is a subject, paired with Maya before the verb."
      }
    ]
  },
  {
    "id": "ADV-05",
    "level": "advanced",
    "order": 4,
    "type": "concept",
    "title": "Reflexive and emphatic pronouns",
    "minutes": 6,
    "summary": "A reflexive pronoun shows that the subject and the object are the same person. An emphatic pronoun simply stresses who did it.",
    "examples": [
      "She blamed herself. She herself sent the file.",
      "She blamed her when she means she is the one at fault. Myself sent the file."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Reflexive and emphatic pronouns",
      "left": {
        "label": "She blamed herself. She herself sent the file.",
        "lines": [
          "Herself is the object of blamed. In the second line, herself only emphasises she."
        ]
      },
      "right": {
        "label": "She blamed her when she means she is the one at fault. Myself sent the file.",
        "lines": [
          "The reflexive is missing where the subject is the object, and myself cannot be the subject."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "“She taught herself the chord” uses herself as…",
        "options": [
          "a subject",
          "an article",
          "a tense",
          "a reflexive pronoun"
        ],
        "answer": 3,
        "why": "The subject and the object are the same person."
      },
      {
        "kind": "choice",
        "prompt": "“I myself checked the time” uses myself to…",
        "options": [
          "add emphasis",
          "replace the subject",
          "make a plural",
          "show a new person"
        ],
        "answer": 0,
        "why": "I is already the subject. Myself stresses it."
      },
      {
        "kind": "choice",
        "prompt": "Which line is well formed?",
        "options": [
          "Me hurt myself as the subject.",
          "He hurt himself.",
          "He hurt hisself.",
          "Himself hurt he."
        ],
        "answer": 1,
        "why": "Himself matches he."
      },
      {
        "kind": "choice",
        "prompt": "A reflexive pronoun…",
        "options": [
          "is a preposition",
          "replaces the verb",
          "points back to the subject",
          "always means a different person"
        ],
        "answer": 2,
        "why": "Herself, himself, and themselves point back."
      }
    ]
  },
  {
    "id": "ADV-06",
    "level": "advanced",
    "order": 5,
    "type": "concept",
    "title": "Indefinite and reciprocal pronouns",
    "minutes": 6,
    "summary": "Indefinite pronouns such as someone and everyone do not name a particular person. Reciprocal pronouns show an exchange between people.",
    "examples": [
      "Someone left a seat. Maya and Priya texted each other.",
      "Someone left their named passport of Maya only. Maya texted each other."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Indefinite and reciprocal pronouns",
      "left": {
        "label": "Someone left a seat. Maya and Priya texted each other.",
        "lines": [
          "Someone is unnamed. Each other means the texting went both ways."
        ]
      },
      "right": {
        "label": "Someone left their named passport of Maya only. Maya texted each other.",
        "lines": [
          "An indefinite pronoun is treated as a named person, and each other needs more than one person."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "Someone is…",
        "options": [
          "a named person",
          "a verb",
          "an indefinite pronoun",
          "a reciprocal pronoun"
        ],
        "answer": 2,
        "why": "It does not say who."
      },
      {
        "kind": "choice",
        "prompt": "Each other shows…",
        "options": [
          "one person acting alone",
          "a place",
          "a tense",
          "an action that goes both ways"
        ],
        "answer": 3,
        "why": "They helped each other."
      },
      {
        "kind": "choice",
        "prompt": "One another usually refers to…",
        "options": [
          "more than two people in an exchange",
          "one person",
          "a bus",
          "a capital letter"
        ],
        "answer": 0,
        "why": "The whole group blamed one another."
      },
      {
        "kind": "choice",
        "prompt": "Which line uses a reciprocal pronoun correctly?",
        "options": [
          "Each other called.",
          "The two friends called each other.",
          "Maya called each other.",
          "Someone called each other alone."
        ],
        "answer": 1,
        "why": "Two people are required for each other."
      }
    ]
  },
  {
    "id": "ADV-07",
    "level": "advanced",
    "order": 6,
    "type": "concept",
    "title": "Demonstratives",
    "minutes": 6,
    "summary": "This and these point to something near. That and those point to something farther away. This and that are singular. These and those are plural.",
    "examples": [
      "This seat is free. Those buses have left.",
      "These seat is free. That buses have left."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Demonstratives",
      "left": {
        "label": "This seat is free. Those buses have left.",
        "lines": [
          "This is one nearby seat. Those is more than one bus at a distance."
        ]
      },
      "right": {
        "label": "These seat is free. That buses have left.",
        "lines": [
          "The singular and plural demonstratives are swapped."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "One thing nearby takes…",
        "options": [
          "them",
          "this",
          "these",
          "those"
        ],
        "answer": 1,
        "why": "This seat, not these seat."
      },
      {
        "kind": "choice",
        "prompt": "More than one thing farther away takes…",
        "options": [
          "that",
          "a",
          "those",
          "this"
        ],
        "answer": 2,
        "why": "Those buses."
      },
      {
        "kind": "choice",
        "prompt": "These agrees with…",
        "options": [
          "a singular noun",
          "a verb only",
          "an adverb",
          "a plural noun"
        ],
        "answer": 3,
        "why": "These seats, not these seat."
      },
      {
        "kind": "choice",
        "prompt": "Which line matches number and distance?",
        "options": [
          "That stop is across the road.",
          "Those stop is across the road.",
          "This buses are here.",
          "These bus."
        ],
        "answer": 0,
        "why": "That is singular and points farther away."
      }
    ]
  },
  {
    "id": "ADV-08",
    "level": "advanced",
    "order": 7,
    "type": "concept",
    "title": "Distributives: each, every, either, and neither",
    "minutes": 6,
    "summary": "Each and every single out members of a group and take a singular verb. Either and neither choose between options.",
    "examples": [
      "Each student has a pass. Neither bus is on time.",
      "Each students has a pass. Neither buses is on time."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Distributives: each, every, either, and neither",
      "left": {
        "label": "Each student has a pass. Neither bus is on time.",
        "lines": [
          "Each and neither take a singular verb."
        ]
      },
      "right": {
        "label": "Each students has a pass. Neither buses is on time.",
        "lines": [
          "The noun after each and neither should be singular here."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "Every takes…",
        "options": [
          "a singular verb",
          "a plural verb",
          "no noun",
          "a past participle as the subject"
        ],
        "answer": 0,
        "why": "Every seat is taken."
      },
      {
        "kind": "choice",
        "prompt": "Neither of the two buses ___ late.",
        "options": [
          "were being a required plural",
          "is",
          "are",
          "be"
        ],
        "answer": 1,
        "why": "Neither is grammatically singular."
      },
      {
        "kind": "choice",
        "prompt": "Either means…",
        "options": [
          "none of a large group",
          "the owner",
          "one or the other",
          "both for certain"
        ],
        "answer": 2,
        "why": "Either seat is fine."
      },
      {
        "kind": "choice",
        "prompt": "Which line is well formed?",
        "options": [
          "Each of the students have a seat in this careful pattern.",
          "Every students has a seat.",
          "Neither buses are here.",
          "Each of the students has a seat."
        ],
        "answer": 3,
        "why": "Each takes has, and students is inside the of-phrase."
      }
    ]
  },
  {
    "id": "ADV-09",
    "level": "advanced",
    "order": 8,
    "type": "concept",
    "title": "Quantifiers: much, many, few, little, etc.",
    "minutes": 6,
    "summary": "Many and few go with countable nouns. Much and little go with uncountable nouns.",
    "examples": [
      "Many seats are free. Little time is left.",
      "Much seats are free. Many time is left."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Quantifiers: much, many, few, little, etc.",
      "left": {
        "label": "Many seats are free. Little time is left.",
        "lines": [
          "Seats can be counted. Time cannot, so little fits."
        ]
      },
      "right": {
        "label": "Much seats are free. Many time is left.",
        "lines": [
          "The quantifiers are paired with the wrong kind of noun."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "Seats take…",
        "options": [
          "much",
          "little",
          "a much",
          "many"
        ],
        "answer": 3,
        "why": "Seats are countable."
      },
      {
        "kind": "choice",
        "prompt": "Time, as an amount, takes…",
        "options": [
          "much or little",
          "many or few",
          "these",
          "each as a plural"
        ],
        "answer": 0,
        "why": "Time is uncountable here."
      },
      {
        "kind": "choice",
        "prompt": "A few means…",
        "options": [
          "the owner",
          "a small number of countable things",
          "a small amount of water",
          "none"
        ],
        "answer": 1,
        "why": "A few seats."
      },
      {
        "kind": "choice",
        "prompt": "Which line matches?",
        "options": [
          "Few time is left.",
          "Much friends arrived.",
          "We have little hope and many options.",
          "We have many hope and much options."
        ],
        "answer": 2,
        "why": "Hope is uncountable. Options are countable."
      }
    ]
  },
  {
    "id": "ADV-10",
    "level": "advanced",
    "order": 9,
    "type": "concept",
    "title": "Possessive determiners versus possessive pronouns",
    "minutes": 6,
    "summary": "A possessive determiner comes before a noun. A possessive pronoun stands alone.",
    "examples": [
      "That is her seat. That seat is hers.",
      "That is hers seat. That seat is her."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Possessive determiners versus possessive pronouns",
      "left": {
        "label": "That is her seat. That seat is hers.",
        "lines": [
          "Her needs the noun seat. Hers replaces her seat."
        ]
      },
      "right": {
        "label": "That is hers seat. That seat is her.",
        "lines": [
          "The determiner and the pronoun are in each other’s places."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "Before a noun, use…",
        "options": [
          "her",
          "hers",
          "theirs as a determiner",
          "ours seat"
        ],
        "answer": 0,
        "why": "Her seat, their bus, your pass."
      },
      {
        "kind": "choice",
        "prompt": "Standing alone, use…",
        "options": [
          "your",
          "hers",
          "her",
          "my"
        ],
        "answer": 1,
        "why": "The seat is hers."
      },
      {
        "kind": "choice",
        "prompt": "“Our bus” uses our as…",
        "options": [
          "a verb",
          "a reflexive",
          "a possessive determiner",
          "a possessive pronoun standing alone"
        ],
        "answer": 2,
        "why": "Our comes before bus."
      },
      {
        "kind": "choice",
        "prompt": "Which pair is split correctly?",
        "options": [
          "mine pass / my",
          "hers seat / her",
          "their / theirs bus",
          "my pass / mine"
        ],
        "answer": 3,
        "why": "My needs a noun. Mine stands alone."
      }
    ]
  },
  {
    "id": "ADV-11",
    "level": "advanced",
    "order": 1,
    "type": "concept",
    "title": "Stative and dynamic verbs",
    "minutes": 6,
    "summary": "Dynamic verbs can take a continuous form. Stative verbs, which describe states, usually stay simple.",
    "examples": [
      "I am catching the bus. I know the stop.",
      "I am knowing the stop. I catch the bus right now without a continuous form when the action is in progress."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Stative and dynamic verbs",
      "left": {
        "label": "I am catching the bus. I know the stop.",
        "lines": [
          "Catching is an action in progress. Know is a state, so it stays simple."
        ]
      },
      "right": {
        "label": "I am knowing the stop. I catch the bus right now without a continuous form when the action is in progress.",
        "lines": [
          "The state is forced into the continuous, and the action in progress is left simple."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "Which verb is usually stative?",
        "options": [
          "run",
          "eat",
          "text",
          "know"
        ],
        "answer": 3,
        "why": "Know describes a state, not an action you watch happening."
      },
      {
        "kind": "choice",
        "prompt": "An action in progress can be…",
        "options": [
          "I am texting.",
          "I am knowing.",
          "I am owning the seat.",
          "I am believing it for a simple opinion."
        ],
        "answer": 0,
        "why": "Texting is dynamic."
      },
      {
        "kind": "choice",
        "prompt": "“I have a pass” prefers the simple form because have here means…",
        "options": [
          "a command",
          "possession, a state",
          "an activity you can watch",
          "a future arrangement"
        ],
        "answer": 1,
        "why": "Ownership is stative."
      },
      {
        "kind": "choice",
        "prompt": "Which line fits?",
        "options": [
          "I am knowing her name.",
          "They are owning the bus.",
          "She understands the rule.",
          "She is understanding the rule as a simple state."
        ],
        "answer": 2,
        "why": "Understand stays in the simple form for a state."
      }
    ]
  },
  {
    "id": "ADV-12",
    "level": "advanced",
    "order": 2,
    "type": "concept",
    "title": "Linking verbs and complements",
    "minutes": 6,
    "summary": "A linking verb joins the subject to a complement. The complement describes the subject, so it is often an adjective, not an adverb.",
    "examples": [
      "The bus seems late. The fries taste salty.",
      "The bus seems lately. The fries taste saltily."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Linking verbs and complements",
      "left": {
        "label": "The bus seems late. The fries taste salty.",
        "lines": [
          "Late describes the bus. Salty describes the fries."
        ]
      },
      "right": {
        "label": "The bus seems lately. The fries taste saltily.",
        "lines": [
          "Adverbs are describing the subject as if they described the verb."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "After a linking verb, a description of the subject is usually…",
        "options": [
          "a modal",
          "a clause with no subject",
          "an adjective",
          "an adverb"
        ],
        "answer": 2,
        "why": "The bus seems late."
      },
      {
        "kind": "choice",
        "prompt": "Which is a linking verb here?",
        "options": [
          "catch",
          "text",
          "run",
          "taste"
        ],
        "answer": 3,
        "why": "The fries taste salty. Taste links fries to salty."
      },
      {
        "kind": "choice",
        "prompt": "“She looks tired” means…",
        "options": [
          "she appears tired",
          "she is looking with her eyes at tired",
          "tired is an adverb",
          "looks is a noun only"
        ],
        "answer": 0,
        "why": "Looks links she to the adjective tired."
      },
      {
        "kind": "choice",
        "prompt": "Choose the complement that fits.",
        "options": [
          "She seems tiredly.",
          "The hallway fell silent.",
          "The hallway fell silently if you mean it became quiet.",
          "The fries taste salt."
        ],
        "answer": 1,
        "why": "Silent describes the hallway after fell."
      }
    ]
  },
  {
    "id": "ADV-13",
    "level": "advanced",
    "order": 3,
    "type": "concept",
    "title": "Causative verbs: have, get, make and let",
    "minutes": 6,
    "summary": "Have, get, make, and let can mean you cause another person to do something. The pattern after each verb is different.",
    "examples": [
      "She had the driver wait. She got him to wait. She made him wait. She let him wait.",
      "She had the driver to wait. She made him to wait. She got him wait."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Causative verbs: have, get, make and let",
      "left": {
        "label": "She had the driver wait. She got him to wait. She made him wait. She let him wait.",
        "lines": [
          "Have and make and let take the base verb. Get takes to plus the verb."
        ]
      },
      "right": {
        "label": "She had the driver to wait. She made him to wait. She got him wait.",
        "lines": [
          "To is added after have and make, and dropped after get."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "Get someone ___ it.",
        "options": [
          "done as a command to them",
          "to do",
          "do, with no to",
          "doing as the only pattern"
        ],
        "answer": 1,
        "why": "She got him to wait."
      },
      {
        "kind": "choice",
        "prompt": "Make someone ___ it.",
        "options": [
          "doing",
          "does",
          "do",
          "to do"
        ],
        "answer": 2,
        "why": "She made him wait."
      },
      {
        "kind": "choice",
        "prompt": "Let means…",
        "options": [
          "force with make’s strength",
          "finish",
          "own",
          "allow"
        ],
        "answer": 3,
        "why": "She let him wait means she allowed it."
      },
      {
        "kind": "choice",
        "prompt": "Which set of patterns is right?",
        "options": [
          "have him wait / get him to wait",
          "have him to wait / get him wait",
          "make him to leave / let him to leave",
          "let him leaving"
        ],
        "answer": 0,
        "why": "Have takes the base verb. Get takes to."
      }
    ]
  },
  {
    "id": "ADV-14",
    "level": "advanced",
    "order": 4,
    "type": "concept",
    "title": "Participial adjectives: bored/boring",
    "minutes": 6,
    "summary": "The -ed participle describes how someone feels. The -ing participle describes what causes the feeling.",
    "examples": [
      "The delay was boring. We were bored.",
      "The delay was bored. We were boring if the delay is what tired us."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Participial adjectives: bored/boring",
      "left": {
        "label": "The delay was boring. We were bored.",
        "lines": [
          "Boring describes the delay. Bored describes us."
        ]
      },
      "right": {
        "label": "The delay was bored. We were boring if the delay is what tired us.",
        "lines": [
          "The cause and the feeling are swapped."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "A film that causes the feeling is…",
        "options": [
          "boring",
          "bored",
          "bore",
          "a bored film about us"
        ],
        "answer": 0,
        "why": "The film is boring. The audience is bored."
      },
      {
        "kind": "choice",
        "prompt": "The people who feel it are…",
        "options": [
          "bores",
          "bored",
          "boring",
          "bore"
        ],
        "answer": 1,
        "why": "We were bored."
      },
      {
        "kind": "choice",
        "prompt": "“An exciting match” means…",
        "options": [
          "excite is a noun",
          "the crowd is the adjective",
          "the match causes excitement",
          "the match feels excited"
        ],
        "answer": 2,
        "why": "-ing describes the source."
      },
      {
        "kind": "choice",
        "prompt": "Which pair matches?",
        "options": [
          "a tired day / tiring students who feel the day",
          "a bored lesson / a boring class of people",
          "exciting fans / excited news",
          "a tiring day / tired students"
        ],
        "answer": 3,
        "why": "The day causes the tiredness. The students feel it."
      }
    ]
  },
  {
    "id": "ADV-15",
    "level": "advanced",
    "order": 5,
    "type": "concept",
    "title": "Used to, be used to and get used to",
    "minutes": 6,
    "summary": "Used to plus a base verb marks a past habit. Be used to and get used to are followed by a noun or a gerund and mark familiarity.",
    "examples": [
      "I used to walk. I am used to walking. I am getting used to the early bus.",
      "I use to walked. I am used to walk as the habit meaning. I used to walking."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Used to, be used to and get used to",
      "left": {
        "label": "I used to walk. I am used to walking. I am getting used to the early bus.",
        "lines": [
          "Used to walk is the old habit. Am used to walking means walking feels normal now."
        ]
      },
      "right": {
        "label": "I use to walked. I am used to walk as the habit meaning. I used to walking.",
        "lines": [
          "The verb form after each pattern is wrong."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "A past habit is…",
        "options": [
          "I am used to walk.",
          "I use to walked.",
          "I used to walking.",
          "I used to walk."
        ],
        "answer": 3,
        "why": "Used to plus the base verb."
      },
      {
        "kind": "choice",
        "prompt": "“I am used to waking early” means…",
        "options": [
          "waking early feels normal",
          "I no longer wake early",
          "used is the main past habit with to waking",
          "wake is a noun only"
        ],
        "answer": 0,
        "why": "Be used to is about familiarity."
      },
      {
        "kind": "choice",
        "prompt": "Get used to means…",
        "options": [
          "own something",
          "become familiar",
          "stop a past habit",
          "force someone"
        ],
        "answer": 1,
        "why": "I am getting used to the noise."
      },
      {
        "kind": "choice",
        "prompt": "Which line is a past habit?",
        "options": [
          "She is getting used to crowds.",
          "Used to the bus she.",
          "She used to take the 7:40.",
          "She is used to the 7:40."
        ],
        "answer": 2,
        "why": "Used to take names what she did before."
      }
    ]
  },
  {
    "id": "ADV-16",
    "level": "advanced",
    "order": 6,
    "type": "concept",
    "title": "Present forms used for the future",
    "minutes": 6,
    "summary": "A present form can point to the future when the future is scheduled, arranged, or part of a timetable.",
    "examples": [
      "The bus leaves at 7:40. I am meeting Priya after school.",
      "The bus is leave at 7:40. I meet Priya after school if the meeting is a one-off arrangement you want to mark as continuous."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Present forms used for the future",
      "left": {
        "label": "The bus leaves at 7:40. I am meeting Priya after school.",
        "lines": [
          "Leaves is a timetable. Am meeting is an arrangement."
        ]
      },
      "right": {
        "label": "The bus is leave at 7:40. I meet Priya after school if the meeting is a one-off arrangement you want to mark as continuous.",
        "lines": [
          "The timetable and the arrangement use the wrong present pattern."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "A timetable often uses…",
        "options": [
          "used to",
          "a modal perfect",
          "the present simple",
          "the past perfect"
        ],
        "answer": 2,
        "why": "The bus leaves at 7:40."
      },
      {
        "kind": "choice",
        "prompt": "An arrangement you have already made can use…",
        "options": [
          "the past simple",
          "a stative continuous of know",
          "had left",
          "the present continuous"
        ],
        "answer": 3,
        "why": "I am meeting Priya after school."
      },
      {
        "kind": "choice",
        "prompt": "“When the bus arrives, we leave” uses present verbs for…",
        "options": [
          "a future time",
          "a finished past",
          "a wish",
          "a passive"
        ],
        "answer": 0,
        "why": "The arrival is still ahead."
      },
      {
        "kind": "choice",
        "prompt": "Which line is a schedule?",
        "options": [
          "Ended the term will.",
          "Term ends on Friday.",
          "I am knowing Friday.",
          "She used to end on Friday."
        ],
        "answer": 1,
        "why": "A fixed future date takes the present simple."
      }
    ]
  },
  {
    "id": "ADV-17",
    "level": "advanced",
    "order": 7,
    "type": "concept",
    "title": "Modal perfect forms: should have, might have, etc.",
    "minutes": 6,
    "summary": "A modal plus have plus the past participle looks back and judges a past possibility, duty, or conclusion.",
    "examples": [
      "I should have left earlier. She might have missed it.",
      "I should have leave earlier. She might missed it."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Modal perfect forms: should have, might have, etc.",
      "left": {
        "label": "I should have left earlier. She might have missed it.",
        "lines": [
          "Should have marks a past duty that did not happen. Might have marks a past possibility."
        ]
      },
      "right": {
        "label": "I should have leave earlier. She might missed it.",
        "lines": [
          "Have and the past participle are incomplete."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "A regret about the past uses…",
        "options": [
          "have should left",
          "should have plus the past participle",
          "should plus the past participle with no have",
          "should having left"
        ],
        "answer": 1,
        "why": "I should have left earlier."
      },
      {
        "kind": "choice",
        "prompt": "“She might have missed it” means…",
        "options": [
          "she will miss it",
          "miss is a noun",
          "it is possible she missed it",
          "she certainly missed it"
        ],
        "answer": 2,
        "why": "Might have is a past possibility."
      },
      {
        "kind": "choice",
        "prompt": "Must have draws…",
        "options": [
          "a weak guess about tomorrow",
          "a command for now",
          "a plural",
          "a strong conclusion about the past"
        ],
        "answer": 3,
        "why": "The bus must have left. The stop is empty."
      },
      {
        "kind": "choice",
        "prompt": "Which line is formed correctly?",
        "options": [
          "You could have texted.",
          "You could have text.",
          "You could texted.",
          "You have could texted."
        ],
        "answer": 0,
        "why": "Could have plus the past participle."
      }
    ]
  },
  {
    "id": "ADV-18",
    "level": "advanced",
    "order": 8,
    "type": "concept",
    "title": "Mood: indicative, imperative and subjunctive",
    "minutes": 6,
    "summary": "The indicative states a fact. The imperative gives a command. The subjunctive marks a wish, a demand, or an unreal situation.",
    "examples": [
      "The bus is late. Wait here. I suggest that she leave early.",
      "I suggest that she leaves early, when the careful subjunctive is wanted. The bus be late as a fact."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Mood: indicative, imperative and subjunctive",
      "left": {
        "label": "The bus is late. Wait here. I suggest that she leave early.",
        "lines": [
          "Is states a fact. Wait commands. Leave has no -s because the suggestion uses the subjunctive."
        ]
      },
      "right": {
        "label": "I suggest that she leaves early, when the careful subjunctive is wanted. The bus be late as a fact.",
        "lines": [
          "The fact is given a subjunctive shape, and the suggestion is given an ordinary -s."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "“The bus is late” is…",
        "options": [
          "indicative",
          "imperative",
          "subjunctive",
          "a participle"
        ],
        "answer": 0,
        "why": "It states a fact."
      },
      {
        "kind": "choice",
        "prompt": "“Wait here” is…",
        "options": [
          "passive",
          "imperative",
          "indicative",
          "a tense name"
        ],
        "answer": 1,
        "why": "It tells someone what to do."
      },
      {
        "kind": "choice",
        "prompt": "After suggest, a careful subjunctive is…",
        "options": [
          "that she left yesterday as the wish",
          "leave she that",
          "that she leave",
          "that she leaves as the formal subjunctive"
        ],
        "answer": 2,
        "why": "The base form leave has no -s."
      },
      {
        "kind": "choice",
        "prompt": "“If I were you” uses were because the situation is…",
        "options": [
          "a present fact about me",
          "a command",
          "plural people only",
          "unreal"
        ],
        "answer": 3,
        "why": "Were is the unreal subjunctive."
      }
    ]
  },
  {
    "id": "ADV-19",
    "level": "advanced",
    "order": 1,
    "type": "concept",
    "title": "Compound-complex sentences",
    "minutes": 6,
    "summary": "A compound-complex sentence has at least two independent clauses and at least one dependent clause.",
    "examples": [
      "The bus left, and we walked because the rain started.",
      "Because the rain started."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Compound-complex sentences",
      "left": {
        "label": "The bus left, and we walked because the rain started.",
        "lines": [
          "The bus left and we walked are independent. Because the rain started is dependent."
        ]
      },
      "right": {
        "label": "Because the rain started.",
        "lines": [
          "Only the dependent clause is there."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "A compound-complex sentence needs…",
        "options": [
          "one clause only",
          "no verb",
          "only a phrase",
          "two independent clauses and one dependent clause"
        ],
        "answer": 3,
        "why": "That mix is what the name says."
      },
      {
        "kind": "choice",
        "prompt": "In “The bus left, and we walked because it rained,” the dependent clause is…",
        "options": [
          "because it rained",
          "the bus left",
          "we walked",
          "and"
        ],
        "answer": 0,
        "why": "Because makes that clause dependent."
      },
      {
        "kind": "choice",
        "prompt": "And in that sentence joins…",
        "options": [
          "nothing",
          "two independent clauses",
          "two dependent clauses only",
          "a noun to its article"
        ],
        "answer": 1,
        "why": "The bus left and we walked can each stand."
      },
      {
        "kind": "choice",
        "prompt": "Which line is compound-complex?",
        "options": [
          "She texted.",
          "But I stayed.",
          "She texted, but I stayed when the rain started.",
          "When the rain started."
        ],
        "answer": 2,
        "why": "Texted and stayed are independent. When the rain started depends."
      }
    ]
  },
  {
    "id": "ADV-20",
    "level": "advanced",
    "order": 2,
    "type": "concept",
    "title": "Main, subordinate and coordinate clauses",
    "minutes": 6,
    "summary": "A main clause can stand alone. A subordinate clause cannot. Coordinate clauses are equals joined by a word such as and or but.",
    "examples": [
      "I stayed, but she left because the bus came.",
      "Because the bus came, but."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Main, subordinate and coordinate clauses",
      "left": {
        "label": "I stayed, but she left because the bus came.",
        "lines": [
          "I stayed and she left are coordinate. Because the bus came is subordinate."
        ]
      },
      "right": {
        "label": "Because the bus came, but.",
        "lines": [
          "The subordinate clause is left without a main clause, and but has nothing to join."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "A subordinate clause…",
        "options": [
          "depends on a main clause",
          "can always stand alone",
          "is always joined by and",
          "has no verb"
        ],
        "answer": 0,
        "why": "Because the bus came cannot be the whole sentence."
      },
      {
        "kind": "choice",
        "prompt": "Coordinate clauses are…",
        "options": [
          "articles",
          "equal in rank",
          "one inside the other",
          "phrases without verbs"
        ],
        "answer": 1,
        "why": "And and but join equals."
      },
      {
        "kind": "choice",
        "prompt": "The main clause in “Because it rained, we walked” is…",
        "options": [
          "because",
          "it",
          "we walked",
          "because it rained"
        ],
        "answer": 2,
        "why": "We walked can stand alone."
      },
      {
        "kind": "choice",
        "prompt": "Which word coordinates?",
        "options": [
          "because",
          "although",
          "when",
          "but"
        ],
        "answer": 3,
        "why": "But joins equals. The others subordinate."
      }
    ]
  },
  {
    "id": "ADV-21",
    "level": "advanced",
    "order": 3,
    "type": "concept",
    "title": "Restrictive and non-restrictive clauses",
    "minutes": 6,
    "summary": "A restrictive clause identifies which person or thing. A non-restrictive clause adds extra information and is set off with commas.",
    "examples": [
      "Students who finish early can leave. Priya, who lent me the charger, is waiting.",
      "Students, who finish early, can leave if you mean only some students. Priya who lent me the charger is waiting with no commas when the clause is only extra."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Restrictive and non-restrictive clauses",
      "left": {
        "label": "Students who finish early can leave. Priya, who lent me the charger, is waiting.",
        "lines": [
          "Who finish early tells which students. Who lent me the charger is extra, because Priya is already named."
        ]
      },
      "right": {
        "label": "Students, who finish early, can leave if you mean only some students. Priya who lent me the charger is waiting with no commas when the clause is only extra.",
        "lines": [
          "The commas do not match whether the clause identifies or merely adds."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "A clause that tells you which one is…",
        "options": [
          "non-restrictive",
          "always between commas",
          "a fragment",
          "restrictive"
        ],
        "answer": 3,
        "why": "Who finish early identifies the students."
      },
      {
        "kind": "choice",
        "prompt": "Extra information about a person already named takes…",
        "options": [
          "commas",
          "no commas, so it seems to identify them",
          "a question mark",
          "a modal"
        ],
        "answer": 0,
        "why": "Priya, who lent me the charger, is waiting."
      },
      {
        "kind": "choice",
        "prompt": "Removing a non-restrictive clause…",
        "options": [
          "changes the plural",
          "leaves the main meaning intact",
          "makes the noun impossible to identify",
          "deletes the verb’s meaning"
        ],
        "answer": 1,
        "why": "Priya is waiting still makes sense."
      },
      {
        "kind": "choice",
        "prompt": "Which clause is restrictive?",
        "options": [
          "The coach, who is new, waited.",
          "Friday, which was wet, ended.",
          "The bus that we missed is gone.",
          "Maya, who is my cousin, texted."
        ],
        "answer": 2,
        "why": "That we missed tells which bus."
      }
    ]
  },
  {
    "id": "ADV-22",
    "level": "advanced",
    "order": 4,
    "type": "concept",
    "title": "Relative-clause reduction",
    "minutes": 6,
    "summary": "A relative clause can sometimes shrink to a participle phrase when the meaning stays clear.",
    "examples": [
      "The students who are waiting outside can board. The students waiting outside can board.",
      "The students are waiting outside can board."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Relative-clause reduction",
      "left": {
        "label": "The students who are waiting outside can board. The students waiting outside can board.",
        "lines": [
          "Who are waiting shrinks to waiting."
        ]
      },
      "right": {
        "label": "The students are waiting outside can board.",
        "lines": [
          "The relative pronoun is gone, but the finite verb are is still there, so the clauses collide."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "“The bus that is parked outside” can become…",
        "options": [
          "parked the bus which",
          "the that bus",
          "the bus parked outside",
          "the bus is parked outside as one noun phrase"
        ],
        "answer": 2,
        "why": "That is drops out and the participle remains."
      },
      {
        "kind": "choice",
        "prompt": "Reduction works when the meaning…",
        "options": [
          "gains a new subject",
          "loses the noun",
          "becomes a question",
          "stays the same"
        ],
        "answer": 3,
        "why": "Waiting outside still identifies the students."
      },
      {
        "kind": "choice",
        "prompt": "Which reduction is safe?",
        "options": [
          "people living nearby",
          "people are living nearby can vote, with no who",
          "living people are nearby can",
          "who people living"
        ],
        "answer": 0,
        "why": "Living nearby replaces who live nearby."
      },
      {
        "kind": "choice",
        "prompt": "A reduced clause often starts with…",
        "options": [
          "a modal perfect",
          "a participle",
          "a finite verb plus the subject again",
          "an article only"
        ],
        "answer": 1,
        "why": "Waiting, parked, chosen."
      }
    ]
  },
  {
    "id": "ADV-23",
    "level": "advanced",
    "order": 5,
    "type": "concept",
    "title": "Adverbial clauses of time, reason, purpose, result, condition and contrast",
    "minutes": 6,
    "summary": "An adverbial clause tells when, why, for what purpose, with what result, under what condition, or in spite of what.",
    "examples": [
      "We left when the rain stopped, although we were still tired, so that we would catch the bus.",
      "We left when. Although tired so that."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Adverbial clauses of time, reason, purpose, result, condition and contrast",
      "left": {
        "label": "We left when the rain stopped, although we were still tired, so that we would catch the bus.",
        "lines": [
          "When marks time, although marks contrast, and so that marks purpose."
        ]
      },
      "right": {
        "label": "We left when. Although tired so that.",
        "lines": [
          "The joining words have no clauses attached."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "Because introduces…",
        "options": [
          "a command",
          "a reason",
          "a time only",
          "a contrast only"
        ],
        "answer": 1,
        "why": "We walked because the bus had left."
      },
      {
        "kind": "choice",
        "prompt": "So that introduces…",
        "options": [
          "a noun",
          "a plural",
          "a purpose",
          "a finished fact with no aim"
        ],
        "answer": 2,
        "why": "We ran so that we would catch it."
      },
      {
        "kind": "choice",
        "prompt": "Although introduces…",
        "options": [
          "a timetable",
          "possession",
          "a question",
          "contrast"
        ],
        "answer": 3,
        "why": "Although we were tired, we left."
      },
      {
        "kind": "choice",
        "prompt": "If introduces…",
        "options": [
          "a condition",
          "a result by itself",
          "an appositive",
          "a reflexive"
        ],
        "answer": 0,
        "why": "If the bus is late, we walk."
      }
    ]
  },
  {
    "id": "ADV-24",
    "level": "advanced",
    "order": 6,
    "type": "concept",
    "title": "Ellipsis and substitution",
    "minutes": 6,
    "summary": "Ellipsis leaves out words that the reader can restore. Substitution uses a short word such as do or one in their place.",
    "examples": [
      "Maya caught the early bus, and Priya did too. I wanted a window seat and she wanted one too.",
      "Maya caught the early bus, and Priya caught. I wanted a window seat and she wanted a too."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Ellipsis and substitution",
      "left": {
        "label": "Maya caught the early bus, and Priya did too. I wanted a window seat and she wanted one too.",
        "lines": [
          "Did stands in for caught the early bus. One stands in for a window seat."
        ]
      },
      "right": {
        "label": "Maya caught the early bus, and Priya caught. I wanted a window seat and she wanted a too.",
        "lines": [
          "The repeated words are cut without a substitute, so the second clause is unfinished."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "In “Priya did too,” did substitutes for…",
        "options": [
          "the verb phrase already used",
          "a new noun",
          "a comma",
          "the subject Priya"
        ],
        "answer": 0,
        "why": "Did means caught the early bus."
      },
      {
        "kind": "choice",
        "prompt": "One in “she wanted one too” replaces…",
        "options": [
          "too",
          "a window seat",
          "wanted",
          "she"
        ],
        "answer": 1,
        "why": "One is the substitute noun."
      },
      {
        "kind": "choice",
        "prompt": "Ellipsis is safe when…",
        "options": [
          "the verb is new information",
          "no earlier clause exists",
          "the missing words are obvious",
          "the reader must guess the subject"
        ],
        "answer": 2,
        "why": "I can go if you can. Can implies can go."
      },
      {
        "kind": "choice",
        "prompt": "Which line substitutes cleanly?",
        "options": [
          "She left early, and I did the bus a new object.",
          "She left, and I.",
          "Did too she left nothing before.",
          "She left early, and I did too."
        ],
        "answer": 3,
        "why": "Did recovers left early."
      }
    ]
  },
  {
    "id": "ADV-25",
    "level": "advanced",
    "order": 7,
    "type": "concept",
    "title": "Appositives",
    "minutes": 6,
    "summary": "An appositive is a noun phrase that renames the noun beside it. Extra appositives take commas.",
    "examples": [
      "Priya, my cousin, saved the seat.",
      "Priya my cousin saved the seat when the renaming is extra news."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Appositives",
      "left": {
        "label": "Priya, my cousin, saved the seat.",
        "lines": [
          "My cousin renames Priya and is extra, so the commas belong."
        ]
      },
      "right": {
        "label": "Priya my cousin saved the seat when the renaming is extra news.",
        "lines": [
          "The commas that mark the extra name are missing."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "An appositive…",
        "options": [
          "is always a verb",
          "asks a question",
          "is a tense",
          "renames a noun"
        ],
        "answer": 3,
        "why": "My cousin renames Priya."
      },
      {
        "kind": "choice",
        "prompt": "An extra appositive is set off with…",
        "options": [
          "commas",
          "question marks",
          "no punctuation, so it looks essential",
          "a modal"
        ],
        "answer": 0,
        "why": "Priya, my cousin, saved the seat."
      },
      {
        "kind": "choice",
        "prompt": "Removing “my cousin” from that sentence…",
        "options": [
          "makes Priya plural",
          "leaves a complete sentence",
          "removes the verb",
          "changes who saved it"
        ],
        "answer": 1,
        "why": "Priya saved the seat still works."
      },
      {
        "kind": "choice",
        "prompt": "Which line contains an appositive?",
        "options": [
          "Left at 11 the.",
          "A night left bus.",
          "The bus, a night service, left at 11.",
          "The bus left at 11."
        ],
        "answer": 2,
        "why": "A night service renames the bus."
      }
    ]
  },
  {
    "id": "ADV-26",
    "level": "advanced",
    "order": 8,
    "type": "concept",
    "title": "Sentence connectors and transition words",
    "minutes": 6,
    "summary": "A connector such as however, therefore, or meanwhile shows how the new sentence relates to the one before it.",
    "examples": [
      "The bus was late. Therefore we walked.",
      "The bus was late, therefore we walked."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Sentence connectors and transition words",
      "left": {
        "label": "The bus was late. Therefore we walked.",
        "lines": [
          "Therefore tells the reader the walking is a result."
        ]
      },
      "right": {
        "label": "The bus was late, therefore we walked.",
        "lines": [
          "Therefore is a connector, not a joining word that can glue two full sentences with only a comma."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "Therefore signals…",
        "options": [
          "a time of day only",
          "possession",
          "a result",
          "a contrast"
        ],
        "answer": 2,
        "why": "The lateness leads to the walk."
      },
      {
        "kind": "choice",
        "prompt": "However signals…",
        "options": [
          "a result you must accept",
          "a plural",
          "a command",
          "contrast"
        ],
        "answer": 3,
        "why": "The bus was late. However, we still made it."
      },
      {
        "kind": "choice",
        "prompt": "A connector between two full sentences usually needs…",
        "options": [
          "a full stop or a semicolon before it",
          "only a comma, as if it were and",
          "no punctuation",
          "a question mark"
        ],
        "answer": 0,
        "why": "The bus was late; therefore, we walked."
      },
      {
        "kind": "choice",
        "prompt": "Meanwhile marks…",
        "options": [
          "an article",
          "the same time",
          "a cause",
          "a possessive"
        ],
        "answer": 1,
        "why": "We waited. Meanwhile, the rain stopped."
      }
    ]
  },
  {
    "id": "ADV-27",
    "level": "advanced",
    "order": 9,
    "type": "concept",
    "title": "Correlative conjunctions: either…or, neither…nor, etc.",
    "minutes": 6,
    "summary": "Correlative conjunctions work in pairs. The grammar after each half should match.",
    "examples": [
      "Either we catch this bus or we walk. Neither Maya nor Priya was late.",
      "Either we catch this bus or walking. Neither Maya or Priya were late."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Correlative conjunctions: either…or, neither…nor, etc.",
      "left": {
        "label": "Either we catch this bus or we walk. Neither Maya nor Priya was late.",
        "lines": [
          "Either…or offers two choices. Neither…nor excludes both, and the verb agrees with Priya, the nearer subject."
        ]
      },
      "right": {
        "label": "Either we catch this bus or walking. Neither Maya or Priya were late.",
        "lines": [
          "The second half does not match the first, and or is paired with neither."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "The partner of either is…",
        "options": [
          "but",
          "or",
          "nor",
          "and"
        ],
        "answer": 1,
        "why": "Either…or."
      },
      {
        "kind": "choice",
        "prompt": "The partner of neither is…",
        "options": [
          "and",
          "so",
          "nor",
          "or"
        ],
        "answer": 2,
        "why": "Neither…nor."
      },
      {
        "kind": "choice",
        "prompt": "The two halves should be…",
        "options": [
          "a noun and then a full story with no match",
          "a question and a comma",
          "different tenses on purpose",
          "the same kind of structure"
        ],
        "answer": 3,
        "why": "We catch this bus matches we walk."
      },
      {
        "kind": "choice",
        "prompt": "With neither…nor, the verb often agrees with…",
        "options": [
          "the subject nearer the verb",
          "the subject farther away always",
          "neither itself as a plural",
          "the first noun only"
        ],
        "answer": 0,
        "why": "Neither Maya nor Priya was late."
      }
    ]
  },
  {
    "id": "ADV-28",
    "level": "advanced",
    "order": 10,
    "type": "concept",
    "title": "Parallelism with paired structures",
    "minutes": 6,
    "summary": "With both…and, either…or, and not only…but also, the words after each piece should share a shape.",
    "examples": [
      "She not only missed the bus but also left her pass.",
      "She not only missed the bus but also her pass was left behind in a different shape."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Parallelism with paired structures",
      "left": {
        "label": "She not only missed the bus but also left her pass.",
        "lines": [
          "Missed and left are both verbs."
        ]
      },
      "right": {
        "label": "She not only missed the bus but also her pass was left behind in a different shape.",
        "lines": [
          "The second half switches from a verb to a new clause."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "Parallel paired structures need…",
        "options": [
          "the same shape after each piece",
          "a longer second half no matter the grammar",
          "a comma only",
          "two subjects always"
        ],
        "answer": 0,
        "why": "Not only missed… but also left…"
      },
      {
        "kind": "choice",
        "prompt": "Which line is parallel?",
        "options": [
          "not only the bus but also she left",
          "both tired and late",
          "both tired and she was late",
          "either walking or we walk"
        ],
        "answer": 1,
        "why": "Tired and late are both adjectives."
      },
      {
        "kind": "choice",
        "prompt": "Either…or should be followed by…",
        "options": [
          "a question and a command",
          "unrelated tenses",
          "matching forms",
          "a noun and then a paragraph"
        ],
        "answer": 2,
        "why": "Either a bus or a walk."
      },
      {
        "kind": "choice",
        "prompt": "Fix the pair “not only late but also she missed it.”",
        "options": [
          "not only was late but also the pass",
          "late not only missed",
          "but also not only",
          "not only late but also lost"
        ],
        "answer": 3,
        "why": "Late and lost can both describe her result. Matching adjectives or matching verbs keep the pair parallel."
      }
    ]
  },
  {
    "id": "ADV-29",
    "level": "advanced",
    "order": 1,
    "type": "concept",
    "title": "Expressing cause, purpose, result and contrast",
    "minutes": 6,
    "summary": "Because, so that, so, and although each name a different relationship.",
    "examples": [
      "Because the bus was late, we ran so that we would arrive, although we were tired.",
      "Although the bus was late, we ran because we would arrive, so that we were tired."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Expressing cause, purpose, result and contrast",
      "left": {
        "label": "Because the bus was late, we ran so that we would arrive, although we were tired.",
        "lines": [
          "Because gives the cause, so that gives the purpose, and although gives the contrast."
        ]
      },
      "right": {
        "label": "Although the bus was late, we ran because we would arrive, so that we were tired.",
        "lines": [
          "The relationship words point at the wrong ideas."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "A cause is marked by…",
        "options": [
          "so that",
          "although",
          "meanwhile as a cause",
          "because"
        ],
        "answer": 3,
        "why": "Because the bus was late."
      },
      {
        "kind": "choice",
        "prompt": "A purpose is marked by…",
        "options": [
          "so that",
          "because",
          "however",
          "too"
        ],
        "answer": 0,
        "why": "So that we would arrive."
      },
      {
        "kind": "choice",
        "prompt": "A contrast is marked by…",
        "options": [
          "therefore only",
          "although",
          "because",
          "so"
        ],
        "answer": 1,
        "why": "Although we were tired."
      },
      {
        "kind": "choice",
        "prompt": "So between two clauses often marks…",
        "options": [
          "a possessive",
          "a relative",
          "a result",
          "a person"
        ],
        "answer": 2,
        "why": "The bus was late, so we walked."
      }
    ]
  },
  {
    "id": "ADV-30",
    "level": "advanced",
    "order": 2,
    "type": "concept",
    "title": "Formal versus conversational constructions",
    "minutes": 6,
    "summary": "The same meaning can be built in a formal shape or a conversational one.",
    "examples": [
      "I am writing to explain the delay. Just wanted to say the bus was late.",
      "I am writing to explain the delay lol. Just wanted to say the bus was late, Dear Sir."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Formal versus conversational constructions",
      "left": {
        "label": "I am writing to explain the delay. Just wanted to say the bus was late.",
        "lines": [
          "The first fits a teacher. The second fits a friend."
        ]
      },
      "right": {
        "label": "I am writing to explain the delay lol. Just wanted to say the bus was late, Dear Sir.",
        "lines": [
          "The construction and the audience do not match."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "A formal explanation can begin…",
        "options": [
          "I am writing to explain…",
          "Gonna explain real quick…",
          "u there",
          "lol so"
        ],
        "answer": 0,
        "why": "I am writing to is a formal opener."
      },
      {
        "kind": "choice",
        "prompt": "A conversational version may use…",
        "options": [
          "passive voice in every chat",
          "short forms and a direct tone",
          "Dear Sir or Madam in a text to a friend",
          "no verb on purpose"
        ],
        "answer": 1,
        "why": "Just wanted to say is conversational."
      },
      {
        "kind": "choice",
        "prompt": "The construction should follow…",
        "options": [
          "a single style for every room",
          "the spelling of bus",
          "the audience",
          "the longest possible sentence"
        ],
        "answer": 2,
        "why": "A teacher and a friend do not need the same shape."
      },
      {
        "kind": "choice",
        "prompt": "Which line is conversational?",
        "options": [
          "I wish to inform you of a delay to my arrival.",
          "Please accept this account of events.",
          "I am writing with regard to the timetable.",
          "The bus was late, so I walked."
        ],
        "answer": 3,
        "why": "The short cause-and-result line sounds like speech."
      }
    ]
  },
  {
    "id": "ADV-31",
    "level": "advanced",
    "order": 3,
    "type": "concept",
    "title": "Register, audience and tone",
    "minutes": 6,
    "summary": "Register is the level of language. Audience is who will read or hear it. Tone is the attitude that comes through.",
    "examples": [
      "Sorry I missed the start. The bus did not come, so I walked.",
      "Yo, bus ghosted me, not my fault."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Register, audience and tone",
      "left": {
        "label": "Sorry I missed the start. The bus did not come, so I walked.",
        "lines": [
          "That is respectful, specific, and aimed at a teacher."
        ]
      },
      "right": {
        "label": "Yo, bus ghosted me, not my fault.",
        "lines": [
          "The tone blames and the register is too casual for a teacher."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "Register means…",
        "options": [
          "the bus route number",
          "the tense only",
          "the page count",
          "how formal or casual the language is"
        ],
        "answer": 3,
        "why": "Sorry I missed the start is a different register from yo."
      },
      {
        "kind": "choice",
        "prompt": "Audience means…",
        "options": [
          "the people who will receive the message",
          "the writer only",
          "the verb",
          "the comma"
        ],
        "answer": 0,
        "why": "A teacher and a friend are different audiences."
      },
      {
        "kind": "choice",
        "prompt": "Tone is…",
        "options": [
          "a prefix",
          "the attitude in the wording",
          "the font",
          "the subject only"
        ],
        "answer": 1,
        "why": "Not my fault sounds defensive."
      },
      {
        "kind": "choice",
        "prompt": "Which tone fits an apology to a teacher?",
        "options": [
          "Not my problem.",
          "Bus ghosted me.",
          "Sorry I missed the start. I walked.",
          "Whatever, I was late."
        ],
        "answer": 2,
        "why": "It takes responsibility and stays respectful."
      }
    ]
  },
  {
    "id": "ADV-32",
    "level": "advanced",
    "order": 4,
    "type": "concept",
    "title": "Hedging: perhaps, may, tends to, etc.",
    "minutes": 6,
    "summary": "A hedge softens a claim when you are not fully certain or when a hard claim would sound too strong.",
    "examples": [
      "The bus tends to be late on Fridays. She may have missed it.",
      "The bus is always late on Fridays, I know it, and she definitely missed it, when you only have a pattern and a guess."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Hedging: perhaps, may, tends to, etc.",
      "left": {
        "label": "The bus tends to be late on Fridays. She may have missed it.",
        "lines": [
          "Tends to avoids always. May have leaves the past possible rather than certain."
        ]
      },
      "right": {
        "label": "The bus is always late on Fridays, I know it, and she definitely missed it, when you only have a pattern and a guess.",
        "lines": [
          "The wording is more certain than the evidence."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "A hedge is useful when…",
        "options": [
          "you are giving a command",
          "you are naming a person",
          "you are not fully sure",
          "you saw the event yourself and need a fact"
        ],
        "answer": 2,
        "why": "May and perhaps leave room."
      },
      {
        "kind": "choice",
        "prompt": "Tends to means…",
        "options": [
          "never",
          "must",
          "a finished single event",
          "usually, not always"
        ],
        "answer": 3,
        "why": "The bus tends to be late."
      },
      {
        "kind": "choice",
        "prompt": "“She may have missed it” is…",
        "options": [
          "a cautious past possibility",
          "a proven fact",
          "a command",
          "a plural noun"
        ],
        "answer": 0,
        "why": "May have hedges the conclusion."
      },
      {
        "kind": "choice",
        "prompt": "Which claim is hedged?",
        "options": [
          "Wrong clock, full stop, no doubt.",
          "It is possible the stop clock is wrong.",
          "The stop clock is wrong. I am certain.",
          "The clock broke. I watched it."
        ],
        "answer": 1,
        "why": "It is possible softens the claim."
      }
    ]
  },
  {
    "id": "ADV-33",
    "level": "advanced",
    "order": 5,
    "type": "concept",
    "title": "Cohesion and reference across sentences",
    "minutes": 6,
    "summary": "Cohesion is how sentences hold together. Pronouns, repeated nouns, and connectors point back so the reader can follow.",
    "examples": [
      "Maya missed the bus. She then texted Priya, who was already on it.",
      "Maya missed the bus. She then texted her, who was already on it, when both people could be she or her."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Cohesion and reference across sentences",
      "left": {
        "label": "Maya missed the bus. She then texted Priya, who was already on it.",
        "lines": [
          "She points to Maya. Who points to Priya. It points to the bus."
        ]
      },
      "right": {
        "label": "Maya missed the bus. She then texted her, who was already on it, when both people could be she or her.",
        "lines": [
          "The pronouns do not tell the reader which person is meant."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "Cohesion is…",
        "options": [
          "an article",
          "the links between sentences",
          "a single spelling rule",
          "a tense name"
        ],
        "answer": 1,
        "why": "Pronouns and connectors make those links."
      },
      {
        "kind": "choice",
        "prompt": "In the clear pair, she refers to…",
        "options": [
          "the bus",
          "the text",
          "Maya",
          "Priya"
        ],
        "answer": 2,
        "why": "Maya is the earlier named person who missed the bus."
      },
      {
        "kind": "choice",
        "prompt": "An unclear pronoun…",
        "options": [
          "always points to the subject",
          "is more precise",
          "replaces cohesion on purpose",
          "could point to more than one noun"
        ],
        "answer": 3,
        "why": "She texted her leaves both people possible."
      },
      {
        "kind": "choice",
        "prompt": "A connector such as then…",
        "options": [
          "shows the next step",
          "renames Maya",
          "is a possessive",
          "starts a new topic with no link"
        ],
        "answer": 0,
        "why": "Then ties the text to the missed bus."
      }
    ]
  },
  {
    "id": "ADV-34",
    "level": "advanced",
    "order": 1,
    "type": "concept",
    "title": "Common prepositional combinations",
    "minutes": 6,
    "summary": "Many adjectives, verbs, and nouns take one preposition and sound wrong with another.",
    "examples": [
      "She is good at maths. We arrived at the stop. He apologised for the delay.",
      "She is good in maths in this usual pair. We arrived to the stop. He apologised the delay."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Common prepositional combinations",
      "left": {
        "label": "She is good at maths. We arrived at the stop. He apologised for the delay.",
        "lines": [
          "Good takes at. Arrive takes at for a point. Apologise takes for."
        ]
      },
      "right": {
        "label": "She is good in maths in this usual pair. We arrived to the stop. He apologised the delay.",
        "lines": [
          "The prepositions are not the ones these words partner with."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "Good in “good ___ maths” takes…",
        "options": [
          "at",
          "in",
          "on",
          "for"
        ],
        "answer": 0,
        "why": "Good at maths."
      },
      {
        "kind": "choice",
        "prompt": "Apologise takes…",
        "options": [
          "on a delay",
          "for",
          "to the thing you did, with no for",
          "at a fault"
        ],
        "answer": 1,
        "why": "Apologise for the delay. Apologise to a person."
      },
      {
        "kind": "choice",
        "prompt": "Arrive at a building or stop uses…",
        "options": [
          "in a point you reach",
          "on",
          "at",
          "to"
        ],
        "answer": 2,
        "why": "We arrived at the stop."
      },
      {
        "kind": "choice",
        "prompt": "Which line uses the usual preposition?",
        "options": [
          "interested on the result",
          "interested at the result",
          "interested for the result",
          "interested in the result"
        ],
        "answer": 3,
        "why": "Interested in is the combination."
      }
    ]
  },
  {
    "id": "ADV-35",
    "level": "advanced",
    "order": 2,
    "type": "concept",
    "title": "Verb patterns and complementation",
    "minutes": 6,
    "summary": "The complement is the pattern a verb requires: a gerund, an infinitive, a that-clause, or an object plus a form.",
    "examples": [
      "She suggested leaving. She suggested that we leave. She wanted us to leave.",
      "She suggested to leave. She wanted that we leave as the usual pattern. She suggested us leaving as the main pattern."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Verb patterns and complementation",
      "left": {
        "label": "She suggested leaving. She suggested that we leave. She wanted us to leave.",
        "lines": [
          "Suggest takes a gerund or a that-clause. Want takes an object plus to."
        ]
      },
      "right": {
        "label": "She suggested to leave. She wanted that we leave as the usual pattern. She suggested us leaving as the main pattern.",
        "lines": [
          "Suggest is given want’s infinitive, and want is given suggest’s that-clause."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "Suggest is commonly followed by…",
        "options": [
          "to plus the base verb",
          "an object plus a base verb with no to",
          "a possessive only",
          "a gerund or a that-clause"
        ],
        "answer": 3,
        "why": "She suggested leaving. She suggested that we leave."
      },
      {
        "kind": "choice",
        "prompt": "Want someone to do it uses…",
        "options": [
          "an object plus to plus the verb",
          "a that-clause in the usual pattern",
          "a gerund only",
          "a modal perfect"
        ],
        "answer": 0,
        "why": "She wanted us to leave."
      },
      {
        "kind": "choice",
        "prompt": "Enjoy takes…",
        "options": [
          "a base verb",
          "a gerund",
          "an infinitive",
          "a that-clause as its main pattern"
        ],
        "answer": 1,
        "why": "She enjoys walking."
      },
      {
        "kind": "choice",
        "prompt": "Which pattern fits recommend?",
        "options": [
          "I recommend us wait.",
          "Recommend waiting I to.",
          "I recommend waiting.",
          "I recommend to wait."
        ],
        "answer": 2,
        "why": "Recommend takes the gerund."
      }
    ]
  },
  {
    "id": "ADV-36",
    "level": "advanced",
    "order": 3,
    "type": "concept",
    "title": "Phrasal-prepositional verbs",
    "minutes": 6,
    "summary": "A phrasal-prepositional verb has a particle and a preposition, and the object comes after both.",
    "examples": [
      "We ran out of time. She looks forward to the trip. I will catch up with you.",
      "We ran out time. She looks forward the trip. I will catch up you."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Phrasal-prepositional verbs",
      "left": {
        "label": "We ran out of time. She looks forward to the trip. I will catch up with you.",
        "lines": [
          "Out of, forward to, and up with are fixed. The object follows the whole combination."
        ]
      },
      "right": {
        "label": "We ran out time. She looks forward the trip. I will catch up you.",
        "lines": [
          "The preposition in the combination is missing."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "Run out of means…",
        "options": [
          "postpone",
          "search a list",
          "have no more of something",
          "exit a building only"
        ],
        "answer": 2,
        "why": "We ran out of time."
      },
      {
        "kind": "choice",
        "prompt": "The object of look forward to comes…",
        "options": [
          "between look and forward",
          "before look",
          "nowhere",
          "after to"
        ],
        "answer": 3,
        "why": "Look forward to the trip."
      },
      {
        "kind": "choice",
        "prompt": "Catch up with is…",
        "options": [
          "a verb plus a particle plus a preposition",
          "a single-word verb",
          "an article",
          "a tense"
        ],
        "answer": 0,
        "why": "Up is the particle and with is the preposition."
      },
      {
        "kind": "choice",
        "prompt": "Which line keeps the whole combination?",
        "options": [
          "Gets she on.",
          "She gets on with her partner.",
          "She gets on her partner.",
          "She gets with on her partner."
        ],
        "answer": 1,
        "why": "Get on with needs both on and with."
      }
    ]
  },
  {
    "id": "ADV-37",
    "level": "advanced",
    "order": 4,
    "type": "concept",
    "title": "Reduced clauses",
    "minutes": 6,
    "summary": "A reduced clause drops a subject and a form of be, or a relative pronoun, when the reader can still see who does the action.",
    "examples": [
      "While waiting for the bus, Maya checked the time. The pass left on the seat was hers.",
      "While waiting for the bus, the time was checked, if Maya is the one waiting."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Reduced clauses",
      "left": {
        "label": "While waiting for the bus, Maya checked the time. The pass left on the seat was hers.",
        "lines": [
          "While she was waiting shrinks because Maya is the one waiting. Left on the seat shrinks that was left."
        ]
      },
      "right": {
        "label": "While waiting for the bus, the time was checked, if Maya is the one waiting.",
        "lines": [
          "The reduced clause is attached to the wrong noun."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "A reduced clause must still make clear…",
        "options": [
          "a question",
          "who or what the phrase describes",
          "a new unrelated subject",
          "a second tense"
        ],
        "answer": 1,
        "why": "While waiting describes Maya."
      },
      {
        "kind": "choice",
        "prompt": "“The pass left on the seat” comes from…",
        "options": [
          "left is the main finite verb of a new clause",
          "a command",
          "the pass that was left on the seat",
          "the pass left the seat as an action"
        ],
        "answer": 2,
        "why": "That was drops out."
      },
      {
        "kind": "choice",
        "prompt": "Which reduction is attached well?",
        "options": [
          "After missing the bus, the walk started.",
          "Waiting at the stop, a delay happened to us as the waiters.",
          "Left on the seat, Maya was a pass.",
          "After missing the bus, we walked."
        ],
        "answer": 3,
        "why": "We are the people who missed the bus."
      },
      {
        "kind": "choice",
        "prompt": "While waiting is reduced from…",
        "options": [
          "while she was waiting",
          "wait",
          "a noun",
          "although"
        ],
        "answer": 0,
        "why": "The subject and was are restored from the main clause."
      }
    ]
  },
  {
    "id": "ADV-38",
    "level": "advanced",
    "order": 5,
    "type": "concept",
    "title": "Cleft sentences for emphasis",
    "minutes": 6,
    "summary": "A cleft sentence splits one idea so that one piece is spotlighted.",
    "examples": [
      "It was Maya who sent the file. What we need is a later bus.",
      "Maya sent the file, with no extra focus, when the point is to stress Maya. It was Maya which sent the file."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Cleft sentences for emphasis",
      "left": {
        "label": "It was Maya who sent the file. What we need is a later bus.",
        "lines": [
          "It was… who spotlights Maya. What we need spotlights a later bus."
        ]
      },
      "right": {
        "label": "Maya sent the file, with no extra focus, when the point is to stress Maya. It was Maya which sent the file.",
        "lines": [
          "The plain sentence does not spotlight anyone, and which is the wrong pronoun for a person."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "“It was Maya who sent the file” emphasises…",
        "options": [
          "Maya",
          "the file more than Maya",
          "sent",
          "a time"
        ],
        "answer": 0,
        "why": "The it-cleft puts Maya in the frame."
      },
      {
        "kind": "choice",
        "prompt": "A person in an it-cleft takes…",
        "options": [
          "what as the person",
          "who",
          "which",
          "where"
        ],
        "answer": 1,
        "why": "It was Maya who, not which."
      },
      {
        "kind": "choice",
        "prompt": "“What we need is a later bus” spotlights…",
        "options": [
          "need as a noun",
          "is",
          "a later bus",
          "we"
        ],
        "answer": 2,
        "why": "The what-cleft frames the thing needed."
      },
      {
        "kind": "choice",
        "prompt": "Which line is a cleft?",
        "options": [
          "The late bus made us walk.",
          "We walked.",
          "A bus.",
          "It was the late bus that made us walk."
        ],
        "answer": 3,
        "why": "It was… that splits out the late bus."
      }
    ]
  },
  {
    "id": "ADV-39",
    "level": "advanced",
    "order": 6,
    "type": "concept",
    "title": "Inversion after negative expressions",
    "minutes": 6,
    "summary": "When a negative or near-negative expression opens the sentence, the helping verb comes before the subject.",
    "examples": [
      "Not until 8 did the bus arrive. Under no circumstances should you leave your pass.",
      "Not until 8 the bus arrived. Under no circumstances you should leave your pass."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Inversion after negative expressions",
      "left": {
        "label": "Not until 8 did the bus arrive. Under no circumstances should you leave your pass.",
        "lines": [
          "Did and should move in front of the subject because the negative phrase is first."
        ]
      },
      "right": {
        "label": "Not until 8 the bus arrived. Under no circumstances you should leave your pass.",
        "lines": [
          "The negative phrase is first, but the helping verb has not moved."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "Not until 8 ___ the bus arrive.",
        "options": [
          "the bus did before arrive",
          "arrived with no helping verb",
          "does after the subject",
          "did"
        ],
        "answer": 3,
        "why": "Did comes before the bus."
      },
      {
        "kind": "choice",
        "prompt": "Under no circumstances ___ you leave.",
        "options": [
          "should",
          "you should",
          "leave you",
          "should to"
        ],
        "answer": 0,
        "why": "The modal comes before the subject."
      },
      {
        "kind": "choice",
        "prompt": "This inversion happens because…",
        "options": [
          "there is a comma",
          "a negative expression is in front",
          "the sentence is a normal statement",
          "the noun is plural"
        ],
        "answer": 1,
        "why": "The fronted negative triggers the flip."
      },
      {
        "kind": "choice",
        "prompt": "Which line inverts correctly?",
        "options": [
          "Never we have seen it.",
          "Little she did know.",
          "Rarely have we been this late.",
          "Rarely we have been this late."
        ],
        "answer": 2,
        "why": "Have comes before we."
      }
    ]
  },
  {
    "id": "ADV-40",
    "level": "advanced",
    "order": 7,
    "type": "concept",
    "title": "Conditionals: zero, first, second, third and mixed",
    "minutes": 6,
    "summary": "The tense in an if-sentence shows whether the result is always true, likely, unreal now, unreal in the past, or mixed across times.",
    "examples": [
      "If you heat water, it boils. If I had set an alarm, I would not be late now.",
      "If you will heat water, it boiled. If I set an alarm yesterday, I am not late now as the unreal past."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Conditionals: zero, first, second, third and mixed",
      "left": {
        "label": "If you heat water, it boils. If I had set an alarm, I would not be late now.",
        "lines": [
          "The first is a zero conditional, always true. The second is mixed: a past cause with a present result."
        ]
      },
      "right": {
        "label": "If you will heat water, it boiled. If I set an alarm yesterday, I am not late now as the unreal past.",
        "lines": [
          "The verb forms do not match a conditional type."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "“If you heat water, it boils” is…",
        "options": [
          "zero",
          "third",
          "mixed",
          "a command"
        ],
        "answer": 0,
        "why": "Both halves are present because the result always follows."
      },
      {
        "kind": "choice",
        "prompt": "A real future possibility is…",
        "options": [
          "Rains if will.",
          "If it rains, we will walk.",
          "If it rained yesterday, we walk.",
          "If it had rained, we walked as a fact."
        ],
        "answer": 1,
        "why": "Present in the if-clause and will in the result is the first conditional."
      },
      {
        "kind": "choice",
        "prompt": "An unreal past is…",
        "options": [
          "If I had left, I catch it.",
          "Had leave if.",
          "If I had left earlier, I would have caught it.",
          "If I leave earlier, I caught it."
        ],
        "answer": 2,
        "why": "Had left and would have caught are both past and unreal."
      },
      {
        "kind": "choice",
        "prompt": "“If I had set an alarm, I would not be late now” mixes…",
        "options": [
          "two present facts",
          "a command and a noun",
          "two articles",
          "a past cause and a present result"
        ],
        "answer": 3,
        "why": "Had set is past. Would not be is present."
      }
    ]
  },
  {
    "id": "ADV-41",
    "level": "advanced",
    "order": 8,
    "type": "concept",
    "title": "Wishes, regrets and hypothetical situations",
    "minutes": 6,
    "summary": "Wish and if only shift the tense back to show that the situation is not real.",
    "examples": [
      "I wish I knew the answer. If only I had left earlier.",
      "I wish I know the answer. If only I left earlier yesterday as the regret form."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Wishes, regrets and hypothetical situations",
      "left": {
        "label": "I wish I knew the answer. If only I had left earlier.",
        "lines": [
          "Knew is present unreal. Had left is a past regret."
        ]
      },
      "right": {
        "label": "I wish I know the answer. If only I left earlier yesterday as the regret form.",
        "lines": [
          "The tense has not shifted, so the wish sounds like a fact."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "A wish about now uses…",
        "options": [
          "a present form",
          "a future will",
          "an -s verb",
          "a past form"
        ],
        "answer": 3,
        "why": "I wish I knew, not I wish I know."
      },
      {
        "kind": "choice",
        "prompt": "A regret about the past uses…",
        "options": [
          "had plus the past participle",
          "the present simple",
          "will",
          "a gerund only"
        ],
        "answer": 0,
        "why": "If only I had left earlier."
      },
      {
        "kind": "choice",
        "prompt": "“I wish I were taller” uses were because…",
        "options": [
          "wish is an adjective",
          "the wish is unreal",
          "it is a fact",
          "were is only for crowds"
        ],
        "answer": 1,
        "why": "Were marks the unreal present."
      },
      {
        "kind": "choice",
        "prompt": "Which line is a past regret?",
        "options": [
          "She wishes she will text.",
          "Wish she texted now as a finished regret only.",
          "She wishes she had texted.",
          "She wishes she texts."
        ],
        "answer": 2,
        "why": "Had texted places the regret in the past."
      }
    ]
  },
  {
    "id": "ADV-42",
    "level": "advanced",
    "order": 9,
    "type": "concept",
    "title": "Advanced passive constructions",
    "minutes": 6,
    "summary": "The passive can be built with modals, perfect forms, and reporting verbs when the receiver of the action matters more than the doer.",
    "examples": [
      "The file should have been sent. It is thought that the bus left early. She was made to wait.",
      "The file should have sent. It thinks that the bus left. She was made wait."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Advanced passive constructions",
      "left": {
        "label": "The file should have been sent. It is thought that the bus left early. She was made to wait.",
        "lines": [
          "Should have been sent is a modal perfect passive. Is thought reports a view. Was made to wait keeps to in this passive."
        ]
      },
      "right": {
        "label": "The file should have sent. It thinks that the bus left. She was made wait.",
        "lines": [
          "The passive auxiliaries and the to after made are missing."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "A modal perfect passive looks like…",
        "options": [
          "should sent been",
          "been should sent",
          "should have been sent",
          "should have sent"
        ],
        "answer": 2,
        "why": "Modal plus have been plus the past participle."
      },
      {
        "kind": "choice",
        "prompt": "“It is thought that…” …",
        "options": [
          "names the thinker as the subject",
          "is a command",
          "is active with a person",
          "reports a general view"
        ],
        "answer": 3,
        "why": "The thinker is left unstated."
      },
      {
        "kind": "choice",
        "prompt": "The passive of “They made her wait” is…",
        "options": [
          "She was made to wait.",
          "She was made wait.",
          "She made was to wait.",
          "Wait was she made."
        ],
        "answer": 0,
        "why": "Make loses its bare infinitive and takes to in the passive."
      },
      {
        "kind": "choice",
        "prompt": "Which line is passive?",
        "options": [
          "We saved them.",
          "The seats are being saved.",
          "We are saving the seats.",
          "Save the seats."
        ],
        "answer": 1,
        "why": "Are being saved puts the seats first."
      }
    ]
  },
  {
    "id": "ADV-43",
    "level": "advanced",
    "order": 10,
    "type": "concept",
    "title": "Reported speech with tense, time and place changes",
    "minutes": 6,
    "summary": "When you report speech later or from somewhere else, tense, time words, and place words often shift.",
    "examples": [
      "“I will finish this here today,” she said. She said she would finish that there that day.",
      "She said she will finish this here today, spoken the next day from another room."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Reported speech with tense, time and place changes",
      "left": {
        "label": "“I will finish this here today,” she said. She said she would finish that there that day.",
        "lines": [
          "Will becomes would, this becomes that, here becomes there, and today becomes that day."
        ]
      },
      "right": {
        "label": "She said she will finish this here today, spoken the next day from another room.",
        "lines": [
          "The time and place words still belong to the original moment."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "Will in a later report often becomes…",
        "options": [
          "a noun",
          "would",
          "will, unchanged, after a past reporting verb",
          "willed"
        ],
        "answer": 1,
        "why": "She said she would finish."
      },
      {
        "kind": "choice",
        "prompt": "Today, reported the next day, often becomes…",
        "options": [
          "yesterday as the same day",
          "now",
          "that day",
          "today"
        ],
        "answer": 2,
        "why": "The day has moved."
      },
      {
        "kind": "choice",
        "prompt": "Here, reported from somewhere else, often becomes…",
        "options": [
          "here",
          "this",
          "where never",
          "there"
        ],
        "answer": 3,
        "why": "The place is no longer the speaker’s here."
      },
      {
        "kind": "choice",
        "prompt": "“I did it yesterday,” said on Monday about Sunday, and reported on Tuesday, can become…",
        "options": [
          "She said she had done it the day before.",
          "She said she did it yesterday, meaning Monday.",
          "She said I did it yesterday.",
          "Said she yesterday did."
        ],
        "answer": 0,
        "why": "The tense steps back and yesterday becomes the day before."
      }
    ]
  },
  {
    "id": "ADV-44",
    "level": "advanced",
    "order": 11,
    "type": "concept",
    "title": "Ambiguity and unclear references",
    "minutes": 6,
    "summary": "A sentence is ambiguous when a phrase or a pronoun can attach to more than one word.",
    "examples": [
      "Maya told Priya that she had missed the bus, and Maya was the one who missed it.",
      "Maya told Priya that she had missed the bus."
    ],
    "diagram": {
      "kind": "compare",
      "title": "Ambiguity and unclear references",
      "left": {
        "label": "Maya told Priya that she had missed the bus, and Maya was the one who missed it.",
        "lines": [
          "Naming Maya again removes the doubt about she."
        ]
      },
      "right": {
        "label": "Maya told Priya that she had missed the bus.",
        "lines": [
          "She could be Maya or Priya."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "An ambiguous pronoun…",
        "options": [
          "can point to more than one noun",
          "has one possible meaning",
          "is always herself",
          "is a connector"
        ],
        "answer": 0,
        "why": "She could be either person."
      },
      {
        "kind": "choice",
        "prompt": "A clearer version…",
        "options": [
          "uses only pronouns",
          "repeats the name or rebuilds the sentence",
          "adds another she",
          "deletes the verb"
        ],
        "answer": 1,
        "why": "Maya was the one who missed it."
      },
      {
        "kind": "choice",
        "prompt": "“I saw the student with the phone” can mean…",
        "options": [
          "a tense change",
          "a plural verb",
          "the student had the phone, or I used the phone to see them",
          "only one meaning"
        ],
        "answer": 2,
        "why": "With the phone can attach in two places."
      },
      {
        "kind": "choice",
        "prompt": "Which line is unambiguous?",
        "options": [
          "She told her that she missed it.",
          "The student with the binoculars saw the student with the phone, and with could be either.",
          "He asked him if he knew.",
          "Priya missed the bus, and Maya told her."
        ],
        "answer": 3,
        "why": "The names and her line up in one direction."
      }
    ]
  },
  {
    "id": "ADV-45",
    "level": "advanced",
    "order": 12,
    "type": "concept",
    "title": "British and American grammar differences",
    "minutes": 6,
    "summary": "Both varieties are standard. A piece of writing should stay with one variety’s forms.",
    "examples": [
      "British: The team are ready. She has got a pass. American: The team is ready. She has a pass.",
      "The team are ready and she has gotten a pass in the same formal paragraph that also says whilst and toward without choosing a variety."
    ],
    "diagram": {
      "kind": "compare",
      "title": "British and American grammar differences",
      "left": {
        "label": "British: The team are ready. She has got a pass. American: The team is ready. She has a pass.",
        "lines": [
          "The collective verb and have got versus have are familiar differences. Each line is consistent inside its variety."
        ]
      },
      "right": {
        "label": "The team are ready and she has gotten a pass in the same formal paragraph that also says whilst and toward without choosing a variety.",
        "lines": [
          "British and American forms are mixed in one passage."
        ]
      }
    },
    "practice": [],
    "quiz": [
      {
        "kind": "choice",
        "prompt": "A collective noun as a unit is often singular in…",
        "options": [
          "neither variety",
          "only headlines",
          "questions",
          "American English"
        ],
        "answer": 3,
        "why": "The team is ready is the usual American choice."
      },
      {
        "kind": "choice",
        "prompt": "Have got for possession is common in…",
        "options": [
          "British English",
          "neither standard variety",
          "past perfect only",
          "commands"
        ],
        "answer": 0,
        "why": "She has got a pass."
      },
      {
        "kind": "choice",
        "prompt": "A single piece of writing should…",
        "options": [
          "use only slang",
          "stay with one variety",
          "switch forms every sentence",
          "avoid both"
        ],
        "answer": 1,
        "why": "Mixing whilst and gotten in one paragraph looks unsettled."
      },
      {
        "kind": "choice",
        "prompt": "Which pair is internally consistent?",
        "options": [
          "Have got and gotten in one formal note.",
          "Whilst the team is, gotten.",
          "The team is ready. She has a pass.",
          "The team are ready. She has gotten a pass. Whilst we traveled toward…"
        ],
        "answer": 2,
        "why": "Both choices match one common American pattern."
      }
    ]
  }
];

export const SYLLABUS_UNITS: Record<GrammarLevelId, { number: number; title: string; lessonIds: string[] }[]> = {
  "beginner": [
    {
      "number": 1,
      "title": "Foundations",
      "lessonIds": [
        "BEG-01",
        "BEG-02",
        "BEG-03",
        "BEG-04",
        "BEG-05"
      ]
    },
    {
      "number": 2,
      "title": "Nouns and Pronouns",
      "lessonIds": [
        "BEG-06",
        "BEG-07",
        "BEG-08",
        "BEG-09",
        "BEG-10",
        "BEG-11",
        "BEG-12"
      ]
    },
    {
      "number": 3,
      "title": "Verbs (basic forms)",
      "lessonIds": [
        "BEG-13",
        "BEG-14",
        "BEG-15",
        "BEG-16"
      ]
    },
    {
      "number": 4,
      "title": "Modifiers and Determiners",
      "lessonIds": [
        "BEG-17",
        "BEG-18",
        "BEG-19",
        "BEG-20",
        "BEG-21",
        "BEG-22",
        "BEG-23",
        "BEG-24"
      ]
    },
    {
      "number": 5,
      "title": "Accuracy Basics",
      "lessonIds": [
        "BEG-25",
        "BEG-26",
        "BEG-27",
        "BEG-28",
        "BEG-29",
        "BEG-30"
      ]
    }
  ],
  "intermediate": [
    {
      "number": 1,
      "title": "Verbs (deeper forms)",
      "lessonIds": [
        "INT-01",
        "INT-02",
        "INT-03",
        "INT-04",
        "INT-05",
        "INT-06"
      ]
    },
    {
      "number": 2,
      "title": "Sentence Construction",
      "lessonIds": [
        "INT-07",
        "INT-08",
        "INT-09",
        "INT-10",
        "INT-11",
        "INT-12",
        "INT-13",
        "INT-14",
        "INT-15",
        "INT-16"
      ]
    },
    {
      "number": 3,
      "title": "Advanced Grammar (most)",
      "lessonIds": [
        "INT-17",
        "INT-18",
        "INT-19",
        "INT-20",
        "INT-21",
        "INT-22",
        "INT-23",
        "INT-24",
        "INT-25"
      ]
    },
    {
      "number": 4,
      "title": "Accuracy in Writing (rest)",
      "lessonIds": [
        "INT-26",
        "INT-27",
        "INT-28",
        "INT-29",
        "INT-30",
        "INT-31",
        "INT-32",
        "INT-33",
        "INT-34",
        "INT-35",
        "INT-36"
      ]
    },
    {
      "number": 5,
      "title": "Verb and tense usage (basic parts)",
      "lessonIds": [
        "INT-37",
        "INT-38",
        "INT-39"
      ]
    },
    {
      "number": 6,
      "title": "Meaning and communication (everyday)",
      "lessonIds": [
        "INT-40",
        "INT-41",
        "INT-42",
        "INT-43",
        "INT-44",
        "INT-45"
      ]
    }
  ],
  "advanced": [
    {
      "number": 1,
      "title": "From Advanced Grammar",
      "lessonIds": [
        "ADV-01"
      ]
    },
    {
      "number": 2,
      "title": "Nouns, pronouns and determiners",
      "lessonIds": [
        "ADV-02",
        "ADV-03",
        "ADV-04",
        "ADV-05",
        "ADV-06",
        "ADV-07",
        "ADV-08",
        "ADV-09",
        "ADV-10"
      ]
    },
    {
      "number": 3,
      "title": "Verbs and tense usage (advanced)",
      "lessonIds": [
        "ADV-11",
        "ADV-12",
        "ADV-13",
        "ADV-14",
        "ADV-15",
        "ADV-16",
        "ADV-17",
        "ADV-18"
      ]
    },
    {
      "number": 4,
      "title": "Sentence relationships",
      "lessonIds": [
        "ADV-19",
        "ADV-20",
        "ADV-21",
        "ADV-22",
        "ADV-23",
        "ADV-24",
        "ADV-25",
        "ADV-26",
        "ADV-27",
        "ADV-28"
      ]
    },
    {
      "number": 5,
      "title": "Meaning and communication (nuanced)",
      "lessonIds": [
        "ADV-29",
        "ADV-30",
        "ADV-31",
        "ADV-32",
        "ADV-33"
      ]
    },
    {
      "number": 6,
      "title": "Advanced accuracy",
      "lessonIds": [
        "ADV-34",
        "ADV-35",
        "ADV-36",
        "ADV-37",
        "ADV-38",
        "ADV-39",
        "ADV-40",
        "ADV-41",
        "ADV-42",
        "ADV-43",
        "ADV-44",
        "ADV-45"
      ]
    }
  ]
};
