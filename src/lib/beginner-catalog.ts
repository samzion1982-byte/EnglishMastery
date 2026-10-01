// Generated from notes/beginner/source by scripts/build-beginner-course.cjs.
import type { BeginnerLesson } from './beginner-types';

export const BEGINNER_LESSONS: BeginnerLesson[] = [
  {
    "id": "INTRO-04",
    "title": "Important Instruction",
    "kind": "concept",
    "sections": [
      {
        "title": "Important Instruction",
        "paragraphs": [
          "Follow the topics in order. Learn a little, try the examples, and return to anything you find difficult.",
          "Before each level assessment, watch the suggested video. If it will not play, use the written recap. Then try the questions in your own words.",
          "Practise for a short time each day. You can save your work and come back. Mistakes help you find what to practise next."
        ],
        "examples": []
      }
    ],
    "tasks": []
  },
  {
    "id": "INTRO-05",
    "title": "Importance of learning Grammar",
    "kind": "concept",
    "sections": [
      {
        "title": "What grammar is",
        "paragraphs": [
          "Grammar helps us put words together to share a meaning. “The cat sleeps” is clear. “Sleeps cat the” uses the same words in a confusing order."
        ],
        "examples": []
      },
      {
        "title": "Why it matters",
        "paragraphs": [
          "You can use a clear sentence to ask for help, answer a teacher, or tell a friend where to meet. You already use many grammar patterns when you speak. We will learn to notice and use them in writing too."
        ],
        "examples": []
      }
    ],
    "tasks": []
  },
  {
    "id": "INTRO-01",
    "title": "What Grammar helps us to do",
    "kind": "concept",
    "sections": [
      {
        "title": "Word order changes meaning",
        "paragraphs": [
          "“Asha helps Kabir.” Asha gives help. “Kabir helps Asha.” Kabir gives help. Both sentences make sense, but the person giving help changes."
        ],
        "examples": []
      },
      {
        "title": "Put the words in order",
        "paragraphs": [
          "“Mango a eats Ravi” is hard to follow. “Ravi eats a mango” is clear. In this simple telling sentence, name the person first, then say what the person does."
        ],
        "examples": []
      }
    ],
    "tasks": [],
    "visualGuide": {
      "title": "Who gives help?",
      "rows": [
        {
          "label": "Asha gives help",
          "parts": [
            {
              "text": "Asha",
              "label": "Who"
            },
            {
              "text": "helps",
              "label": "Action"
            },
            {
              "text": "Kabir",
              "label": "Gets help"
            }
          ],
          "note": ""
        },
        {
          "label": "Kabir gives help",
          "parts": [
            {
              "text": "Kabir",
              "label": "Who"
            },
            {
              "text": "helps",
              "label": "Action"
            },
            {
              "text": "Asha",
              "label": "Gets help"
            }
          ],
          "note": ""
        }
      ],
      "check": {
        "prompt": "In “Dev helps Neha”, who gives help?",
        "answer": "Dev. Changing the order of the names changes who gives help."
      }
    }
  },
  {
    "id": "INTRO-02",
    "title": "Why clear sentences matter",
    "kind": "concept",
    "sections": [
      {
        "title": "Give the reader enough information",
        "paragraphs": [
          "“Bring it there” can work when you and your friend can see the same things. A reader who cannot see them may need more help. “Bring the blue book to class” names the object and the place."
        ],
        "examples": []
      },
      {
        "title": "Make the person clear",
        "paragraphs": [
          "“Riya told Asha that she had won.” Who won? We cannot be sure. If Riya won, write “Riya won. She told Asha.” You will practise clear pronouns later."
        ],
        "examples": []
      }
    ],
    "tasks": [],
    "visualGuide": {
      "title": "Make a message clear",
      "rows": [
        {
          "label": "Without shared context",
          "parts": [
            {
              "text": "Bring",
              "label": "Action"
            },
            {
              "text": "it",
              "label": "Which object?"
            },
            {
              "text": "there",
              "label": "Which place?"
            }
          ],
          "note": ""
        },
        {
          "label": "The reader has the details",
          "parts": [
            {
              "text": "Bring",
              "label": "Action"
            },
            {
              "text": "the blue book",
              "label": "Object"
            },
            {
              "text": "to class",
              "label": "Place"
            }
          ],
          "note": ""
        }
      ],
      "check": {
        "prompt": "What is missing from “Meet me there” if your friend has no earlier message?",
        "answer": "Name the meeting place. Add a time too if your friend needs it."
      }
    }
  },
  {
    "id": "INTRO-03",
    "title": "Building your first sentence",
    "kind": "concept",
    "sections": [
      {
        "title": "Name someone and say something",
        "paragraphs": [
          "“Meera sings.” Meera names the person. Sings says what she does. “The milk is warm” says what the milk is like. A telling sentence can show an action or give a description."
        ],
        "examples": []
      },
      {
        "title": "Check the beginning and ending",
        "paragraphs": [
          "Start with a capital letter, leave spaces between words, and end your telling sentence with a full stop. “riya reads” becomes “Riya reads.” We will learn other sentence endings in Foundations."
        ],
        "examples": []
      }
    ],
    "tasks": [],
    "visual": "sentence"
  },
  {
    "id": "BEG-01",
    "title": "Parts of speech",
    "kind": "concept",
    "sections": [
      {
        "title": "What you will learn",
        "paragraphs": [
          "You will meet the eight parts of speech one at a time. A part of speech is the job a word does in its sentence.",
          "These eight names are a useful first map of word jobs. Later, you will learn more about small noun helpers such as a and the."
        ],
        "examples": []
      },
      {
        "title": "Eight parts of speech",
        "paragraphs": [
          "You will meet the eight parts of speech one at a time. A part of speech is the job a word does in its sentence.",
          "These eight names are a useful first map of word jobs. Later, you will learn more about small noun helpers such as a and the."
        ],
        "examples": [
          "Noun",
          "Pronoun",
          "Verb",
          "Adjective",
          "Adverb",
          "Preposition",
          "Conjunction",
          "Interjection"
        ]
      },
      {
        "title": "Noun",
        "paragraphs": [
          "A noun names a person, place, animal, thing, or idea. In “Asha kicks a ball”, Asha and ball are nouns.",
          "School, cat, and kindness are nouns too."
        ],
        "examples": []
      },
      {
        "title": "Pronoun",
        "paragraphs": [
          "A pronoun stands in place of a noun. “Asha is here. She has a ball.” She stands for Asha, so we do not repeat her name.",
          "I, you, he, it, we, and they are pronouns."
        ],
        "examples": []
      },
      {
        "title": "Verb",
        "paragraphs": [
          "A verb shows an action or a state. In “Asha kicks a ball”, kicks shows the action.",
          "In “Asha is happy”, is is a verb too. Not every verb is an action you can see."
        ],
        "examples": []
      },
      {
        "title": "Adjective",
        "paragraphs": [
          "An adjective describes a noun. In “Asha has a red ball”, red describes the ball.",
          "Small, kind, and green are adjectives."
        ],
        "examples": []
      },
      {
        "title": "Adverb",
        "paragraphs": [
          "An adverb can tell more about a verb, an adjective, or another adverb. In “Asha runs quickly”, quickly tells how she runs. In “very cold”, very tells how cold.",
          "Softly and slowly are adverbs. Not every adverb ends in ly: soon and here are adverbs too."
        ],
        "examples": []
      },
      {
        "title": "Preposition",
        "paragraphs": [
          "A preposition shows a relationship, often place or time. In “The ball is under the chair”, under shows where the ball is.",
          "In, on, after, and beside are prepositions."
        ],
        "examples": []
      },
      {
        "title": "Conjunction",
        "paragraphs": [
          "A conjunction joins words or groups of words. In “Asha and Dev play”, and joins their names.",
          "But, or, and because are conjunctions."
        ],
        "examples": []
      },
      {
        "title": "Interjection",
        "paragraphs": [
          "An interjection shows a sudden feeling. “Wow! That kite is high!” Wow shows surprise.",
          "Oh and Oops are interjections too."
        ],
        "examples": []
      },
      {
        "title": "Look at worked examples",
        "paragraphs": [],
        "examples": [
          "“Ravi reads a funny story.” Ravi and story are nouns. Reads is a verb. Funny is an adjective. A is a determiner.",
          "“He reads slowly.” He is a pronoun. Reads is a verb. Slowly is an adverb.",
          "“I drink water.” Drink is a verb here. “My drink is cold.” Drink is a noun here. A word’s job can change with its use."
        ]
      },
      {
        "title": "Remember",
        "paragraphs": [
          "The eight parts of speech are noun, pronoun, verb, adjective, adverb, preposition, conjunction, and interjection. Ask what a word does in its sentence. The same word can do different jobs in different sentences."
        ],
        "examples": []
      }
    ],
    "tasks": [
      {
        "id": "G1",
        "phase": "guided",
        "kind": "response",
        "prompt": "In “Zoya draws a small flower”, find the action word and the describing word.",
        "explanation": "Draws is the verb. Small is the adjective describing flower."
      },
      {
        "id": "G2",
        "phase": "guided",
        "kind": "response",
        "prompt": "Replace the second “Kabir” in “Kabir is kind. Kabir helps me” with a suitable pronoun.",
        "explanation": "Kabir is kind. He helps me. “He” refers to Kabir. “They” is also acceptable if that is Kabir’s pronoun."
      },
      {
        "id": "Q1",
        "phase": "quiz",
        "kind": "choice",
        "prompt": "Which word is a noun in “Meera opens the door”?",
        "explanation": "Door names a thing, so it is a noun.",
        "options": [
          "Opens.",
          "The.",
          "Door."
        ],
        "answer": 2
      },
      {
        "id": "Q2",
        "phase": "quiz",
        "kind": "choice",
        "prompt": "Which word is a verb in “The soup is hot”?",
        "explanation": "Is is the linking verb. Hot describes the soup.",
        "options": [
          "Is.",
          "Soup.",
          "Hot."
        ],
        "answer": 0
      },
      {
        "id": "Q3",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Find the adjective in “A green parrot sits here”.",
        "explanation": "Green. It describes the noun parrot."
      },
      {
        "id": "Q4",
        "phase": "quiz",
        "kind": "response",
        "prompt": "In “I drink milk”, is “drink” a noun or a verb?",
        "explanation": "A verb. It tells us what I do in this sentence."
      },
      {
        "id": "Q5",
        "phase": "quiz",
        "kind": "choice",
        "prompt": "In “Asha and Dev play”, which word joins the names?",
        "explanation": "And is a conjunction. It joins the two names.",
        "options": [
          "Play.",
          "And.",
          "Asha."
        ],
        "answer": 1
      },
      {
        "id": "W1",
        "phase": "write",
        "kind": "response",
        "prompt": "Write a sentence with a person’s name, an action, and a describing word. Name those three jobs.",
        "explanation": "Sample: “Sana carries a heavy bag.” Sana is a noun, carries is a verb, and heavy is an adjective. You can use other accurate examples."
      }
    ],
    "video": {
      "title": "Parts of Speech",
      "publisher": "Periwinkle",
      "url": "https://www.youtube.com/watch?v=ZqLeGm4k6CU",
      "youtubeId": "ZqLeGm4k6CU",
      "note": "Watch the eight parts again: noun, verb, adjective, adverb, pronoun, preposition, conjunction, and interjection. Each one is shown with a picture and an example.",
      "focus": "Which picture and example match each part of speech?",
      "recap": [
        "A noun names a person, place, animal, thing, or idea.",
        "A pronoun stands in place of a noun. A verb shows an action or a state.",
        "An adjective describes a noun. An adverb tells more about a verb, an adjective, or another adverb.",
        "A preposition shows a relationship such as place or time. A conjunction joins words.",
        "An interjection shows a sudden feeling. The same word can do a different job in another sentence."
      ],
      "checkedOn": "2026-09-26"
    },
    "visualGuide": {
      "title": "Find each word’s job",
      "rows": [
        {
          "label": "Name action and description",
          "parts": [
            {
              "text": "Neha",
              "label": "Noun"
            },
            {
              "text": "carries",
              "label": "Verb"
            },
            {
              "text": "a small bag",
              "label": "Small = adjective"
            }
          ],
          "note": ""
        },
        {
          "label": "Replace the name and describe the action",
          "parts": [
            {
              "text": "She",
              "label": "Pronoun"
            },
            {
              "text": "walks",
              "label": "Verb"
            },
            {
              "text": "slowly",
              "label": "Adverb"
            }
          ],
          "note": ""
        },
        {
          "label": "Join names and show a place",
          "parts": [
            {
              "text": "Neha and Dev",
              "label": "And = conjunction"
            },
            {
              "text": "sit under a tree",
              "label": "Under = preposition"
            }
          ],
          "note": ""
        }
      ],
      "check": {
        "prompt": "What job does drink do in “My drink is cold”?",
        "answer": "Drink is a noun here. It names something. In “I drink water”, drink is a verb."
      }
    }
  },
  {
    "id": "BEG-02",
    "title": "Types of sentences",
    "kind": "concept",
    "sections": [
      {
        "title": "What you will learn",
        "paragraphs": [
          "You will meet four kinds of sentences, one at a time."
        ],
        "examples": []
      },
      {
        "title": "Statement",
        "paragraphs": [
          "A statement tells something. “Isha likes mangoes.” It usually ends with a full stop.",
          "The longer textbook name is declarative sentence. Learn the everyday name first: statement."
        ],
        "examples": []
      },
      {
        "title": "Question",
        "paragraphs": [
          "A question asks something. “Does Isha like mangoes?” It ends with a question mark.",
          "The longer name is interrogative sentence. Notice the swap: “Aman is at home.” becomes “Is Aman at home?” Move is before Aman and add a question mark."
        ],
        "examples": []
      },
      {
        "title": "Command",
        "paragraphs": [
          "A command tells someone what to do. “Open your book.” “Please sit down.” “Do not run.”",
          "The longer name is imperative sentence. The listener is the understood subject. We do not need to write “you”."
        ],
        "examples": []
      },
      {
        "title": "Exclamation",
        "paragraphs": [
          "An exclamation shows a strong feeling. “What a lovely picture!” It ends with an exclamation mark.",
          "The longer name is exclamatory sentence. “Stop!” is a strong command. The mark does not make it the same pattern as “What a tall tree!”"
        ],
        "examples": []
      },
      {
        "title": "Look at worked examples",
        "paragraphs": [],
        "examples": [
          "Statement: “Aman is at home.” It tells us where Aman is.",
          "Question: “Is Aman at home?” It asks whether Aman is at home.",
          "Command: “Please come home.” It asks the listener to do something.",
          "Exclamation: “What a beautiful rainbow!” It expresses a strong feeling."
        ]
      },
      {
        "title": "Remember",
        "paragraphs": [
          "Think about the job of the whole sentence. Do you want to tell, ask, instruct, or express a strong feeling?"
        ],
        "examples": []
      }
    ],
    "tasks": [
      {
        "id": "G1",
        "phase": "guided",
        "kind": "response",
        "prompt": "Add the correct ending: “Where is my pencil”.",
        "explanation": "Where is my pencil? The sentence asks a question."
      },
      {
        "id": "G2",
        "phase": "guided",
        "kind": "response",
        "prompt": "Is “Please close the gate” a statement or an instruction?",
        "explanation": "It is an instruction, or imperative sentence. It tells the listener what to do politely."
      },
      {
        "id": "Q1",
        "phase": "quiz",
        "kind": "choice",
        "prompt": "“Neha has a bicycle.” is a…",
        "explanation": "It tells us something about Neha.",
        "options": [
          "Statement.",
          "Question.",
          "Command."
        ],
        "answer": 0
      },
      {
        "id": "Q2",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Add the ending mark: “Are you ready”.",
        "explanation": "Are you ready? It is a question, so it takes a question mark."
      },
      {
        "id": "Q3",
        "phase": "quiz",
        "kind": "choice",
        "prompt": "Which sentence gives an instruction?",
        "explanation": "It tells the listener what to do.",
        "options": [
          "The door is shut.",
          "Is the door shut?",
          "Shut the door, please."
        ],
        "answer": 2
      },
      {
        "id": "Q4",
        "phase": "quiz",
        "kind": "response",
        "prompt": "What is the purpose of “What a bright star!”?",
        "explanation": "It expresses a strong feeling, such as wonder. It is an exclamation."
      },
      {
        "id": "Q5",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Does “Wait!” need a written “you” to be complete?",
        "explanation": "No. In a command, the listener is understood. “Wait!” is complete on its own."
      },
      {
        "id": "W1",
        "phase": "write",
        "kind": "response",
        "prompt": "Write a statement, a question, and a polite instruction about a classroom.",
        "explanation": "Sample: “The window is open.” “Is the fan on?” “Please close the door.” Check the purpose and ending mark of each sentence."
      }
    ],
    "visualGuide": {
      "title": "Tell ask instruct or exclaim",
      "rows": [
        {
          "label": "Tell",
          "parts": [
            {
              "text": "Aman",
              "label": "Subject"
            },
            {
              "text": "is at home.",
              "label": "Predicate"
            }
          ],
          "note": ""
        },
        {
          "label": "Ask",
          "parts": [
            {
              "text": "Is",
              "label": "Move is first"
            },
            {
              "text": "Aman at home?",
              "label": "Question ending"
            }
          ],
          "note": ""
        },
        {
          "label": "Instruct",
          "parts": [
            {
              "text": "Please come home.",
              "label": "Understood you"
            }
          ],
          "note": ""
        },
        {
          "label": "Exclaim",
          "parts": [
            {
              "text": "What a lovely home!",
              "label": "Strong feeling"
            }
          ],
          "note": ""
        }
      ],
      "check": {
        "prompt": "Does “Stop!” stop being a command because it ends with !?",
        "answer": "No. Its purpose is still to give an instruction. The exclamation mark makes it forceful."
      }
    }
  },
  {
    "id": "BEG-03",
    "title": "Subject and predicate",
    "kind": "concept",
    "sections": [
      {
        "title": "What you will learn",
        "paragraphs": [
          "You will split a simple telling sentence into its subject and predicate."
        ],
        "examples": []
      },
      {
        "title": "Subject",
        "paragraphs": [
          "The subject tells us who or what the sentence is about. In “The little dog barks loudly”, the subject is “The little dog”.",
          "Keep the whole group. In “My younger sister sings”, the subject is “My younger sister”, not only sister."
        ],
        "examples": []
      },
      {
        "title": "Predicate",
        "paragraphs": [
          "The predicate says something about the subject and contains the verb. In “The little dog barks loudly”, the predicate is “barks loudly”.",
          "It can be longer than the verb. In “Asha reads a book after lunch”, the predicate is “reads a book after lunch”."
        ],
        "examples": []
      },
      {
        "title": "A predicate can describe",
        "paragraphs": [
          "The predicate need not show an action. In “The water is cold”, the subject is “The water” and the predicate is “is cold”.",
          "The verb “is” links the subject to a description. Find the verb, then keep every word that belongs with each part."
        ],
        "examples": []
      },
      {
        "title": "Commands",
        "paragraphs": [
          "In “Sit here”, the subject “you” is understood. We do not write it.",
          "This lesson practises mostly telling sentences, where both parts are written."
        ],
        "examples": []
      },
      {
        "title": "Look at worked examples",
        "paragraphs": [],
        "examples": [
          "“Rohan | carries his bag.” Subject: Rohan. Predicate: carries his bag. The line shows where the parts split.",
          "“The red bus | stops near our school.” Subject: The red bus. Predicate: stops near our school.",
          "“My hands | are clean.” Subject: My hands. Predicate: are clean. Are is a verb."
        ]
      },
      {
        "title": "Remember",
        "paragraphs": [
          "The subject names who or what we are talking about. The predicate says something about that subject."
        ],
        "examples": []
      }
    ],
    "tasks": [
      {
        "id": "G1",
        "phase": "guided",
        "kind": "response",
        "prompt": "Split “The baby sleeps peacefully” into the whole subject and predicate.",
        "explanation": "Subject: The baby. Predicate: sleeps peacefully. Sleeps is the verb within the predicate."
      },
      {
        "id": "G2",
        "phase": "guided",
        "kind": "response",
        "prompt": "Find the predicate in “Our classroom is bright”.",
        "explanation": "Is bright. It says something about our classroom and includes the verb is."
      },
      {
        "id": "Q1",
        "phase": "quiz",
        "kind": "choice",
        "prompt": "What is the whole subject in “The small cat drinks milk”?",
        "explanation": "All three words name the cat we are talking about.",
        "options": [
          "Small.",
          "The small cat.",
          "Drinks milk."
        ],
        "answer": 1
      },
      {
        "id": "Q2",
        "phase": "quiz",
        "kind": "choice",
        "prompt": "What is the whole predicate in “Sana opens the window”?",
        "explanation": "The predicate contains the verb opens and its object the window.",
        "options": [
          "Opens.",
          "Sana opens.",
          "Opens the window."
        ],
        "answer": 2
      },
      {
        "id": "Q3",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Split “My grandfather tells stories” into subject and predicate.",
        "explanation": "Subject: My grandfather. Predicate: tells stories."
      },
      {
        "id": "Q4",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Does the predicate in “The fruit is sweet” contain a verb? Name it.",
        "explanation": "Yes. Is is the verb. A verb can link a subject to a description."
      },
      {
        "id": "Q5",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Add a predicate to the subject “The children” to make a complete telling sentence.",
        "explanation": "Sample: “The children play outside.” You can use a suitable predicate such as “are happy” or “read books”."
      },
      {
        "id": "W1",
        "phase": "write",
        "kind": "response",
        "prompt": "Write a telling sentence about your home. Mark the whole subject and predicate.",
        "explanation": "Sample: “Our kitchen | is clean.” Check that the split keeps the noun group together and that the predicate includes a verb."
      }
    ],
    "visual": "sentence"
  },
  {
    "id": "BEG-04",
    "title": "Objects and complements",
    "kind": "concept",
    "sections": [
      {
        "title": "What you will learn",
        "paragraphs": [
          "You will see the difference between an object and a word that describes the subject."
        ],
        "examples": []
      },
      {
        "title": "Object",
        "paragraphs": [
          "An object names the person or thing an action is directed at. “Ravi kicks the ball.” Ravi kicks what? The ball.",
          "An object can be a person. “Asha helps Neha.” Whom does Asha help? Neha."
        ],
        "examples": []
      },
      {
        "title": "Subject complement",
        "paragraphs": [
          "A subject complement describes or identifies the subject. “Ravi is tired.” Tired describes Ravi. He does not act on tired.",
          "“My aunt is a doctor.” A doctor tells us who my aunt is. It is the same person, not an object receiving an action."
        ],
        "examples": []
      },
      {
        "title": "Linking verbs",
        "paragraphs": [
          "Is links the subject to a description. Seem, become, and some uses of look, feel, taste, and smell can do this too.",
          "“The soup tastes good.” Good describes the soup. It is a subject complement."
        ],
        "examples": []
      },
      {
        "title": "Not every word after the verb",
        "paragraphs": [
          "“Meera sleeps outside.” Outside tells us where she sleeps. It is not an object and not a subject complement in this sentence.",
          "Ask what job the words do. Do not assume that every word after a verb is an object."
        ],
        "examples": []
      },
      {
        "title": "Look at worked examples",
        "paragraphs": [],
        "examples": [
          "“Dev opens the box.” Opens is an action verb. The box is its object: Dev opens what? The box.",
          "“The box is empty.” Is is a linking verb. Empty is a complement describing the box.",
          "“Zoya becomes the captain.” The captain identifies Zoya. It is a subject complement."
        ]
      },
      {
        "title": "Remember",
        "paragraphs": [
          "An object goes with an action directed at someone or something. A subject complement describes or identifies the subject after a linking verb."
        ],
        "examples": []
      }
    ],
    "tasks": [
      {
        "id": "G1",
        "phase": "guided",
        "kind": "response",
        "prompt": "Find the object in “Isha carries a basket”. Ask “carries what?”",
        "explanation": "A basket. It names what Isha carries."
      },
      {
        "id": "G2",
        "phase": "guided",
        "kind": "response",
        "prompt": "In “Isha is cheerful”, does “cheerful” name something Isha acts on, or describe Isha?",
        "explanation": "It describes Isha. Cheerful is a subject complement after is."
      },
      {
        "id": "Q1",
        "phase": "quiz",
        "kind": "choice",
        "prompt": "Find the object in “Kabir reads a story”.",
        "explanation": "A story names what Kabir reads.",
        "options": [
          "A story.",
          "Reads.",
          "Kabir."
        ],
        "answer": 0
      },
      {
        "id": "Q2",
        "phase": "quiz",
        "kind": "choice",
        "prompt": "In “The mango is ripe”, “ripe” is a…",
        "explanation": "Ripe describes the mango after the linking verb is.",
        "options": [
          "Subject.",
          "Direct object.",
          "Subject complement."
        ],
        "answer": 2
      },
      {
        "id": "Q3",
        "phase": "quiz",
        "kind": "choice",
        "prompt": "Which sentence contains an object?",
        "explanation": "A cup is the object of washes.",
        "options": [
          "Tara is happy.",
          "Tara washes a cup.",
          "Tara sleeps."
        ],
        "answer": 1
      },
      {
        "id": "Q4",
        "phase": "quiz",
        "kind": "response",
        "prompt": "In “My brother is a teacher”, which words identify the subject?",
        "explanation": "A teacher. These words identify my brother and form a subject complement."
      },
      {
        "id": "Q5",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Complete “The room is ___” with a describing word.",
        "explanation": "Sample: “The room is quiet.” Quiet is a subject complement. You can use a suitable adjective such as clean, small, or bright."
      },
      {
        "id": "W1",
        "phase": "write",
        "kind": "response",
        "prompt": "Write one sentence using “opens” with an object. Write another using “is” with a description.",
        "explanation": "Sample: “Sana opens the door.” “The door is blue.” Check that the first has an object and the second has a subject complement."
      }
    ],
    "visual": "object"
  },
  {
    "id": "BEG-05",
    "title": "Phrases and clauses",
    "kind": "concept",
    "sections": [
      {
        "title": "What you will learn",
        "paragraphs": [
          "You will meet a phrase, a complete clause, and a clause that still needs help."
        ],
        "examples": []
      },
      {
        "title": "Phrase",
        "paragraphs": [
          "A phrase is a word group without its own subject and verb working together. “Under the table” tells a place, but not who is there.",
          "“The little puppy” names an animal. “Very happy” describes a feeling. “Running quickly” is still not a complete telling sentence."
        ],
        "examples": []
      },
      {
        "title": "Clause and independent clause",
        "paragraphs": [
          "In our simple examples, a clause has a subject and a verb that belong together. In “The puppy sleeps”, the puppy is the subject and sleeps is the verb.",
          "This is an independent clause: it can stand as a sentence. Do not count words to decide. “Birds fly” is short but gives a complete thought."
        ],
        "examples": []
      },
      {
        "title": "Dependent clause",
        "paragraphs": [
          "A dependent clause has a subject and a verb, but it still needs another clause. “Because the puppy is tired” leaves us asking what happened.",
          "Because, when, and if often begin these clauses. “The puppy sleeps because it is tired” completes the thought. “Because the little birds fly away” is longer, and still unfinished."
        ],
        "examples": []
      },
      {
        "title": "Look at worked examples",
        "paragraphs": [],
        "examples": [
          "“Near the gate” is a phrase. There is no subject and verb pair.",
          "“Aman waits near the gate” is an independent clause. It can stand as a sentence.",
          "“When the bell rings” is a dependent clause. “When the bell rings, we leave” completes the idea."
        ]
      },
      {
        "title": "Remember",
        "paragraphs": [
          "A phrase is a word group. A clause has its own grammatical structure. In our examples, an independent clause gives a complete thought; a dependent clause needs help from another clause."
        ],
        "examples": []
      }
    ],
    "tasks": [
      {
        "id": "G1",
        "phase": "guided",
        "kind": "response",
        "prompt": "Is “in the garden” a phrase or a clause? Look for a subject and verb pair.",
        "explanation": "It is a phrase. It gives a place but has no subject and verb pair."
      },
      {
        "id": "G2",
        "phase": "guided",
        "kind": "response",
        "prompt": "Finish “Because it was raining, ___” with a complete idea.",
        "explanation": "Sample: “Because it was raining, we stayed inside.” The added clause says what happened because of the rain."
      },
      {
        "id": "Q1",
        "phase": "quiz",
        "kind": "choice",
        "prompt": "Which group is a phrase?",
        "explanation": "Under the chair gives a place but has no subject and verb pair.",
        "options": [
          "Ravi laughs.",
          "Under the chair.",
          "The dog barks."
        ],
        "answer": 1
      },
      {
        "id": "Q2",
        "phase": "quiz",
        "kind": "choice",
        "prompt": "Which can stand alone as a telling sentence?",
        "explanation": "It expresses a complete thought. Because and while leave the other groups needing more information.",
        "options": [
          "Meera is reading.",
          "Because Meera is reading.",
          "While Meera is reading."
        ],
        "answer": 0
      },
      {
        "id": "Q3",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Find the subject and verb in “The baby cries”.",
        "explanation": "Subject: The baby. Verb: cries. Together they form a clause."
      },
      {
        "id": "Q4",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Is “When school ends” a phrase or a dependent clause?",
        "explanation": "A dependent clause. School is its subject and ends is its verb, but when leaves the thought unfinished."
      },
      {
        "id": "Q5",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Add a main clause to “If I finish my work, ___”.",
        "explanation": "Sample: “If I finish my work, I will play.” You can use a complete main clause that gives a sensible result."
      },
      {
        "id": "W1",
        "phase": "write",
        "kind": "response",
        "prompt": "Write a complete sentence using “because” to give a reason.",
        "explanation": "Sample: “I drank water because I was thirsty.” Check that there is a complete main idea and a reason clause with a subject and verb."
      }
    ],
    "visualGuide": {
      "title": "A word group or a complete thought?",
      "rows": [
        {
          "label": "Phrase",
          "parts": [
            {
              "text": "near the gate",
              "label": "No subject–verb pair"
            }
          ],
          "note": ""
        },
        {
          "label": "Independent clause",
          "parts": [
            {
              "text": "Aman",
              "label": "Subject"
            },
            {
              "text": "waits near the gate.",
              "label": "Verb and rest of thought"
            }
          ],
          "note": ""
        },
        {
          "label": "Dependent clause needs a main idea",
          "parts": [
            {
              "text": "When the bell rings,",
              "label": "Leaves us waiting"
            },
            {
              "text": "we leave.",
              "label": "Completes the thought"
            }
          ],
          "note": ""
        }
      ],
      "check": {
        "prompt": "Can “Because it rained” stand as a complete telling sentence here?",
        "answer": "It needs a main idea: “We stayed inside because it rained.”"
      }
    }
  },
  {
    "id": "BEG-06",
    "title": "Types of nouns",
    "kind": "concept",
    "sections": [
      {
        "title": "What you will learn",
        "paragraphs": [
          "You will meet five types of nouns, one at a time. A noun names a person, place, animal, thing, or idea."
        ],
        "examples": []
      },
      {
        "title": "Common noun",
        "paragraphs": [
          "A common noun is a general name. Girl, city, river, and school are common nouns.",
          "“We live in a city.” City could mean many places. “My friend is here.” Friend is general."
        ],
        "examples": []
      },
      {
        "title": "Proper noun",
        "paragraphs": [
          "A proper noun is one particular name, written with a capital letter. Anaya, Chennai, and the Ganga are proper nouns.",
          "“We live in Pune.” Pune names one city. “Zoya is here.” Zoya is a name."
        ],
        "examples": []
      },
      {
        "title": "Concrete noun",
        "paragraphs": [
          "A concrete noun is something we can notice with our senses. A drum can be seen and touched. Music can be heard.",
          "Something does not have to be touchable. Both drum and music are concrete nouns."
        ],
        "examples": []
      },
      {
        "title": "Abstract noun",
        "paragraphs": [
          "An abstract noun is an idea, feeling, or quality. Kindness, fear, honesty, and joy are abstract nouns.",
          "You can see a kind act. Kindness itself is a quality, not an object you can hold."
        ],
        "examples": []
      },
      {
        "title": "Collective noun",
        "paragraphs": [
          "A collective noun names a group as one. A team is a group of players. A flock is a group of birds. A class is a group of learners.",
          "These groups can overlap. Team is both a common noun and a collective noun."
        ],
        "examples": []
      },
      {
        "title": "Look at worked examples",
        "paragraphs": [],
        "examples": [
          "“Asha visits a temple.” Asha is a proper noun. Temple is a common noun.",
          "“The bell makes a sound.” Bell and sound are concrete nouns: we can see the bell and hear the sound.",
          "“Her honesty helped us.” Honesty is an abstract noun naming a quality."
        ]
      },
      {
        "title": "Remember",
        "paragraphs": [
          "The five types are common, proper, concrete, abstract, and collective. A particular name, a proper noun, begins with a capital letter."
        ],
        "examples": []
      }
    ],
    "tasks": [
      {
        "id": "G1",
        "phase": "guided",
        "kind": "response",
        "prompt": "Which is a particular name: “river” or “Yamuna”?",
        "explanation": "Yamuna. It is a proper noun. River is a common noun."
      },
      {
        "id": "G2",
        "phase": "guided",
        "kind": "response",
        "prompt": "Find the group noun in “Our team won the game”.",
        "explanation": "Team. It names the players as one group."
      },
      {
        "id": "Q1",
        "phase": "quiz",
        "kind": "choice",
        "prompt": "Which is a proper noun?",
        "explanation": "Jaipur names a particular city and begins with a capital letter.",
        "options": [
          "Village.",
          "City.",
          "Jaipur."
        ],
        "answer": 2
      },
      {
        "id": "Q2",
        "phase": "quiz",
        "kind": "choice",
        "prompt": "Which noun names a feeling?",
        "explanation": "Joy is an abstract noun naming a feeling.",
        "options": [
          "Joy.",
          "Desk.",
          "Spoon."
        ],
        "answer": 0
      },
      {
        "id": "Q3",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Is “music” a concrete or an abstract noun when you can hear it?",
        "explanation": "Concrete. We can hear music. A concrete noun does not have to name something we can touch."
      },
      {
        "id": "Q4",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Correct the capital letter: “We visited delhi.”",
        "explanation": "We visited Delhi. Delhi is a proper noun."
      },
      {
        "id": "Q5",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Is “flock” a collective noun or a person’s name?",
        "explanation": "It is a collective noun. A flock names a group, such as a group of birds."
      },
      {
        "id": "W1",
        "phase": "write",
        "kind": "response",
        "prompt": "Write a sentence containing a person’s name and a common noun. Then write one abstract noun.",
        "explanation": "Sample: “Kabir holds a cup.” Kabir is a proper noun and cup is a common noun. Kindness is an abstract noun. You can use other accurate examples."
      }
    ],
    "visualGuide": {
      "title": "One noun can have two labels",
      "rows": [
        {
          "label": "General and particular",
          "parts": [
            {
              "text": "city",
              "label": "Common noun"
            },
            {
              "text": "Pune",
              "label": "Proper noun"
            }
          ],
          "note": ""
        },
        {
          "label": "Sense and idea",
          "parts": [
            {
              "text": "music",
              "label": "Concrete: heard"
            },
            {
              "text": "kindness",
              "label": "Abstract: quality"
            }
          ],
          "note": ""
        },
        {
          "label": "Overlapping labels",
          "parts": [
            {
              "text": "team",
              "label": "Common name AND collective noun"
            }
          ],
          "note": ""
        }
      ],
      "check": {
        "prompt": "Why is team a collective noun?",
        "answer": "It names a group of people as one group. It is also a common noun, not a particular team’s name."
      }
    }
  },
  {
    "id": "BEG-07",
    "title": "Singular and plural nouns",
    "kind": "concept",
    "sections": [
      {
        "title": "What you will learn",
        "paragraphs": [
          "You will change a noun from one to more than one. Singular means one. Plural means more than one."
        ],
        "examples": []
      },
      {
        "title": "Add s",
        "paragraphs": [
          "Many nouns add s. Book becomes books. Pen becomes pens. Girl becomes girls.",
          "Do not add an apostrophe to make an ordinary plural. Three toys, not three toy’s."
        ],
        "examples": []
      },
      {
        "title": "Add es",
        "paragraphs": [
          "Nouns ending in s, sh, ch, x, or z often take es. Bus becomes buses. Dish becomes dishes.",
          "Watch becomes watches. Box becomes boxes."
        ],
        "examples": []
      },
      {
        "title": "Change y to ies",
        "paragraphs": [
          "The vowel letters are a, e, i, o, and u. The other letters are consonants for this spelling pattern. If a consonant comes before y, change y to ies. Baby becomes babies. City becomes cities.",
          "If a vowel comes before y, keep y and add s. Boy becomes boys. Toy becomes toys."
        ],
        "examples": []
      },
      {
        "title": "Special plurals",
        "paragraphs": [
          "Some plurals change their shape. Child becomes children. Man becomes men. Woman becomes women.",
          "Tooth becomes teeth. Foot becomes feet. Learn these with the word, not by adding s."
        ],
        "examples": []
      },
      {
        "title": "Same form",
        "paragraphs": [
          "Some nouns stay the same for one and for more than one. One sheep, two sheep. One deer, three deer."
        ],
        "examples": []
      },
      {
        "title": "Ending in f",
        "paragraphs": [
          "Some words ending in f or fe change to ves. Leaf becomes leaves. Knife becomes knives.",
          "Roof simply becomes roofs. If the word is unfamiliar, check it."
        ],
        "examples": []
      },
      {
        "title": "Look at worked examples",
        "paragraphs": [],
        "examples": [
          "“There is one box.” “There are two boxes.” Box takes es.",
          "“One baby is sleeping.” “Two babies are sleeping.” The consonant before y leads to ies.",
          "Needs correction: “Three childs are here.” Corrected: “Three children are here.” Children is already plural."
        ]
      },
      {
        "title": "Remember",
        "paragraphs": [
          "Many plurals take s or es. Some have special forms. An apostrophe does not make an ordinary plural."
        ],
        "examples": []
      }
    ],
    "tasks": [
      {
        "id": "G1",
        "phase": "guided",
        "kind": "response",
        "prompt": "Make “cup” and “brush” plural.",
        "explanation": "Cups and brushes. Cup takes s; brush takes es."
      },
      {
        "id": "G2",
        "phase": "guided",
        "kind": "response",
        "prompt": "Why is the plural of toy “toys”, not “toies”?",
        "explanation": "Toy has a vowel letter, o, before y. We keep y and add s."
      },
      {
        "id": "Q1",
        "phase": "quiz",
        "kind": "choice",
        "prompt": "Choose the plural of “bus”.",
        "explanation": "Bus ends in s, so this plural takes es.",
        "options": [
          "Buss.",
          "Buses.",
          "Bus’s."
        ],
        "answer": 1
      },
      {
        "id": "Q2",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Complete “One child, two ___”.",
        "explanation": "Children. This is a special plural form; do not add another s."
      },
      {
        "id": "Q3",
        "phase": "quiz",
        "kind": "choice",
        "prompt": "Which is correct?",
        "explanation": "Baby has a consonant before y, so y changes to ies.",
        "options": [
          "Three babies.",
          "Three babys.",
          "Three baby’s."
        ],
        "answer": 0
      },
      {
        "id": "Q4",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Write the plural of “sheep”.",
        "explanation": "Sheep. The singular and plural forms are the same."
      },
      {
        "id": "Q5",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Correct “Riya has two toy’s” to show more than one toy, not ownership.",
        "explanation": "Riya has two toys. An ordinary plural does not need an apostrophe."
      },
      {
        "id": "W1",
        "phase": "write",
        "kind": "response",
        "prompt": "Write about two things you can count. Use one plural ending in s and one ending in es.",
        "explanation": "Sample: “I have three pens and two boxes.” Check the spelling and the use of numbers with plural nouns."
      }
    ],
    "visualGuide": {
      "title": "From one to more than one",
      "rows": [
        {
          "label": "Add s",
          "parts": [
            {
              "text": "book",
              "label": "One"
            },
            {
              "text": "books",
              "label": "More than one"
            }
          ],
          "note": ""
        },
        {
          "label": "Add es",
          "parts": [
            {
              "text": "box",
              "label": "One"
            },
            {
              "text": "boxes",
              "label": "More than one"
            }
          ],
          "note": ""
        },
        {
          "label": "Check the letter before y",
          "parts": [
            {
              "text": "baby → babies",
              "label": "Consonant + y"
            },
            {
              "text": "toy → toys",
              "label": "Vowel + y"
            }
          ],
          "note": ""
        },
        {
          "label": "Special forms",
          "parts": [
            {
              "text": "child → children",
              "label": "Changes form"
            },
            {
              "text": "sheep → sheep",
              "label": "Stays the same"
            }
          ],
          "note": ""
        }
      ],
      "check": {
        "prompt": "Why is it two toys, not two toy’s?",
        "answer": "An apostrophe is not an ordinary plural mark. Keep y after the vowel o and add s."
      }
    }
  },
  {
    "id": "BEG-08",
    "title": "Countable and uncountable nouns",
    "kind": "concept",
    "sections": [
      {
        "title": "What you will learn",
        "paragraphs": [
          "You will choose words for counting separate things and for measuring amounts."
        ],
        "examples": []
      },
      {
        "title": "Countable noun",
        "paragraphs": [
          "A countable noun names something we can count one by one. One apple, two apples, three apples.",
          "These nouns have a singular form and a plural form. Use a or an with one: a banana, an orange."
        ],
        "examples": []
      },
      {
        "title": "Uncountable noun",
        "paragraphs": [
          "An uncountable noun is usually an amount or a whole. Water, rice, milk, and sand are common examples.",
          "Say “some rice”, not “three rices”, when you mean an amount. Furniture, homework, information, and advice are normally uncountable too. Say “some advice”, not “an advice”."
        ],
        "examples": []
      },
      {
        "title": "Count with a unit",
        "paragraphs": [
          "To count an amount, add a container or a unit. A glass of water. Two bowls of rice. Three pieces of advice.",
          "The unit is countable. The noun after of may not be. “Two slices of bread” counts slices, not breads."
        ],
        "examples": []
      },
      {
        "title": "Many and much",
        "paragraphs": [
          "Use many with plural countable nouns. “How many pencils?” Use much with uncountable nouns. “How much milk?”",
          "A lot of works with both: a lot of pencils, a lot of milk. Cake can change use. “Some cake” is an amount. “Two cakes” means two whole cakes."
        ],
        "examples": []
      },
      {
        "title": "Look at worked examples",
        "paragraphs": [],
        "examples": [
          "“Aman bought three bananas.” Bananas are counted separately.",
          "“Aman bought some bread.” Bread is usually uncountable. “Three slices of bread” counts slices.",
          "Needs correction: “Please give me an advice.” Corrected: “Please give me some advice.” “A piece of advice” also works."
        ]
      },
      {
        "title": "Remember",
        "paragraphs": [
          "Count separate items with numbers. Use amounts, containers, or measures for uncountable nouns."
        ],
        "examples": []
      }
    ],
    "tasks": [
      {
        "id": "G1",
        "phase": "guided",
        "kind": "response",
        "prompt": "Choose many or much: “How ___ books do you have?”",
        "explanation": "Many. Books is a plural countable noun."
      },
      {
        "id": "G2",
        "phase": "guided",
        "kind": "response",
        "prompt": "Make “water” countable by adding a container: “two ___ of water”.",
        "explanation": "Sample: two bottles of water. Also accept glasses, cups, or other suitable containers."
      },
      {
        "id": "Q1",
        "phase": "quiz",
        "kind": "choice",
        "prompt": "Which is normally uncountable?",
        "explanation": "We usually talk about an amount of milk, or count bottles or glasses of it.",
        "options": [
          "Pencil.",
          "Mango.",
          "Milk."
        ],
        "answer": 2
      },
      {
        "id": "Q2",
        "phase": "quiz",
        "kind": "choice",
        "prompt": "Choose the usual phrase.",
        "explanation": "Homework is normally uncountable. We can count tasks or assignments instead.",
        "options": [
          "Some homework.",
          "Three homeworks.",
          "A homework."
        ],
        "answer": 0
      },
      {
        "id": "Q3",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Complete “How ___ rice do we need?” with much or many.",
        "explanation": "Much. Rice is uncountable in this use."
      },
      {
        "id": "Q4",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Correct “two breads” when you mean two slices.",
        "explanation": "Two slices of bread. We count the slices."
      },
      {
        "id": "Q5",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Is “two cakes” possible when we mean two whole cakes?",
        "explanation": "Yes. Cake can be countable when it means a whole cake, and uncountable when it means an amount of cake."
      },
      {
        "id": "W1",
        "phase": "write",
        "kind": "response",
        "prompt": "Write a shopping list with two countable foods and two amounts or containers of uncountable foods.",
        "explanation": "Sample: “Three apples, two bananas, one bag of rice, and two bottles of milk.” Check that the units and noun forms fit."
      }
    ],
    "visual": "amount"
  },
  {
    "id": "BEG-09",
    "title": "Possessive forms",
    "kind": "concept",
    "sections": [
      {
        "title": "What you will learn",
        "paragraphs": [
          "You will place the apostrophe by looking at the owner first."
        ],
        "examples": []
      },
      {
        "title": "One owner",
        "paragraphs": [
          "For one owner, add apostrophe plus s. Meera’s bag. The girl’s pencil. The dog’s bowl. Rohan’s bicycle.",
          "A possessive can also show a relationship. “Asha’s brother” means the brother related to Asha."
        ],
        "examples": []
      },
      {
        "title": "Owners already ending in s",
        "paragraphs": [
          "When the plural already ends in s, add the apostrophe after that s. The girls’ pencils. The teachers’ room.",
          "Girls means more than one girl. The apostrophe does not make the plural. It shows whose things they are."
        ],
        "examples": []
      },
      {
        "title": "Owners that do not end in s",
        "paragraphs": [
          "Some plurals do not end in s. Add apostrophe plus s. Children’s books. Women’s bags. Men’s shoes.",
          "Children is already plural, so children’s can mean several children."
        ],
        "examples": []
      },
      {
        "title": "Not a plural mark",
        "paragraphs": [
          "An apostrophe does not mean “more than one”. “Three bags” is a plural. “The bag’s strap” means the strap of one bag.",
          "You will meet its and it’s later. Its shows possession and has no apostrophe."
        ],
        "examples": []
      },
      {
        "title": "Look at worked examples",
        "paragraphs": [],
        "examples": [
          "One boy owns a cap: “the boy’s cap”.",
          "Several boys own caps: “the boys’ caps”. The apostrophe comes after the plural s.",
          "Several children have toys: “the children’s toys”. Children does not end in s, so add ’s."
        ]
      },
      {
        "title": "Remember",
        "paragraphs": [
          "Find the owner before adding the apostrophe. Plural s and possessive ’s do different jobs."
        ],
        "examples": []
      }
    ],
    "tasks": [
      {
        "id": "G1",
        "phase": "guided",
        "kind": "response",
        "prompt": "Rewrite “the pencil belonging to Neha” using a possessive.",
        "explanation": "Neha’s pencil. Add apostrophe plus s to Neha."
      },
      {
        "id": "G2",
        "phase": "guided",
        "kind": "response",
        "prompt": "Several girls share a room. Write “the ___ room” using girls.",
        "explanation": "The girls’ room. Girls is a plural ending in s, so the apostrophe follows that s."
      },
      {
        "id": "Q1",
        "phase": "quiz",
        "kind": "choice",
        "prompt": "One dog has a bowl. Choose the correct phrase.",
        "explanation": "One dog takes dog’s. Dogs’ would indicate more than one dog.",
        "options": [
          "The dogs bowl.",
          "The dog’s bowl.",
          "The dogs’ bowl."
        ],
        "answer": 1
      },
      {
        "id": "Q2",
        "phase": "quiz",
        "kind": "response",
        "prompt": "More than one teacher shares a table. Write the possessive phrase.",
        "explanation": "The teachers’ table. Teachers is plural and already ends in s."
      },
      {
        "id": "Q3",
        "phase": "quiz",
        "kind": "choice",
        "prompt": "Choose the correct phrase.",
        "explanation": "Children is a plural without a final s, so add ’s.",
        "options": [
          "Childrens’ books.",
          "Childrens books.",
          "Children’s books."
        ],
        "answer": 2
      },
      {
        "id": "Q4",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Does “four cups” need an apostrophe?",
        "explanation": "No. It only means more than one cup; it does not show ownership."
      },
      {
        "id": "Q5",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Rewrite “the bicycle belonging to Arjun”.",
        "explanation": "Arjun’s bicycle. The possessive tells us whose bicycle it is."
      },
      {
        "id": "W1",
        "phase": "write",
        "kind": "response",
        "prompt": "Write one phrase about something owned by one person and one about something owned or shared by a group.",
        "explanation": "Sample: “Tara’s notebook” and “the students’ classroom”. Check the number of owners and the apostrophe position."
      }
    ],
    "visual": "ownership"
  },
  {
    "id": "BEG-10",
    "title": "Types of pronouns",
    "kind": "concept",
    "sections": [
      {
        "title": "What you will learn",
        "paragraphs": [
          "You will meet the main kinds of pronouns, one at a time. A pronoun stands in place of a noun. “Riya has a kite. She flies it.”"
        ],
        "examples": []
      },
      {
        "title": "Personal pronoun",
        "paragraphs": [
          "Personal pronouns have subject and object forms. The subject forms are I, you, he, she, it, we, and they. “She reads.”",
          "They can mean more than one person. “The children are here. They are ready.” They can also mean one person. “Someone left their bag. They may return.”"
        ],
        "examples": []
      },
      {
        "title": "Object pronoun",
        "paragraphs": [
          "The object forms of personal pronouns are me, you, him, her, it, us, and them. Use them as objects of a verb or after a preposition such as to or with.",
          "“He helps me.” You will practise subject and object jobs again in the lesson on correct pronoun usage."
        ],
        "examples": []
      },
      {
        "title": "Possessive pronoun",
        "paragraphs": [
          "A possessive pronoun shows ownership and can stand alone. Mine, yours, his, hers, ours, and theirs.",
          "“This pencil is mine.” Compare “her bag” with “the bag is hers”. Her comes before the noun. Hers stands alone."
        ],
        "examples": []
      },
      {
        "title": "Pointing pronoun",
        "paragraphs": [
          "A pointing pronoun points to something. This, that, these, and those.",
          "“This is my seat.” “Those are yours.” Before a noun, this is a determiner: “this book”. Standing alone, it is a pronoun: “This is new.”"
        ],
        "examples": []
      },
      {
        "title": "Asking pronoun",
        "paragraphs": [
          "An asking pronoun asks who or what. Who, what, and which.",
          "“Who is at the door?” “What is in the box?”"
        ],
        "examples": []
      },
      {
        "title": "Indefinite pronoun",
        "paragraphs": [
          "Someone, anyone, nobody, and something refer to people or things without naming them. “Someone is at the door.” We do not know or say the person’s name."
        ],
        "examples": []
      },
      {
        "title": "Reflexive pronoun",
        "paragraphs": [
          "A reflexive pronoun points back to the same person. Myself, yourself, himself, herself, itself, ourselves, and themselves.",
          "“Aman looked at himself in the mirror.” Aman and himself are the same person."
        ],
        "examples": []
      },
      {
        "title": "Look at worked examples",
        "paragraphs": [],
        "examples": [
          "“Kabir and I are friends. We play together.” We includes the speaker and Kabir.",
          "“That bottle is hers.” Hers means the bottle belonging to her.",
          "“This book is new.” This is a determiner before book. “This is new.” This stands as a pronoun."
        ]
      },
      {
        "title": "Remember",
        "paragraphs": [
          "A pronoun refers to someone or something. A possessive word before a noun and a possessive pronoun standing alone have different jobs."
        ],
        "examples": []
      }
    ],
    "tasks": [
      {
        "id": "G1",
        "phase": "guided",
        "kind": "response",
        "prompt": "Replace the repeated noun: “The rabbit is hungry. The rabbit eats a carrot.”",
        "explanation": "The rabbit is hungry. It eats a carrot. It refers to the rabbit."
      },
      {
        "id": "G2",
        "phase": "guided",
        "kind": "response",
        "prompt": "Choose my or mine: “This lunch box is ___.”",
        "explanation": "Mine. It stands without a noun after it. “This is my lunch box” would use my before the noun."
      },
      {
        "id": "Q1",
        "phase": "quiz",
        "kind": "choice",
        "prompt": "In “Asha reads. She smiles”, who does “she” refer to?",
        "explanation": "She refers back to Asha.",
        "options": [
          "Asha.",
          "A book.",
          "The reader."
        ],
        "answer": 0
      },
      {
        "id": "Q2",
        "phase": "quiz",
        "kind": "choice",
        "prompt": "Choose the possessive pronoun: “That bag is ___.”",
        "explanation": "Hers stands alone and means her bag.",
        "options": [
          "Her.",
          "Hers.",
          "She."
        ],
        "answer": 1
      },
      {
        "id": "Q3",
        "phase": "quiz",
        "kind": "response",
        "prompt": "In “This is my seat”, which word points to something and stands as a pronoun?",
        "explanation": "This. It points to something without coming directly before a noun. Compare “this seat”, where this is a determiner."
      },
      {
        "id": "Q4",
        "phase": "quiz",
        "kind": "response",
        "prompt": "In “Someone left a bag. They may return”, which word leaves the person unnamed? Can they refer to that one person?",
        "explanation": "Someone is an indefinite pronoun: it does not name the person. Yes, they can refer to that one person. They can also refer to several people."
      },
      {
        "id": "Q5",
        "phase": "quiz",
        "kind": "choice",
        "prompt": "Complete “Ravi saw ___ in the mirror” when Ravi saw his own reflection.",
        "explanation": "Himself refers back to Ravi in this example.",
        "options": [
          "Herself.",
          "Themselves only.",
          "Himself."
        ],
        "answer": 2
      },
      {
        "id": "W1",
        "phase": "write",
        "kind": "response",
        "prompt": "Write two connected sentences about a person or animal. Use a pronoun in the second sentence.",
        "explanation": "Sample: “Meera has a puppy. She feeds it.” Check that the reader can tell what each pronoun refers to."
      }
    ],
    "visualGuide": {
      "title": "Choose the pronoun for its job",
      "rows": [
        {
          "label": "Personal pronouns",
          "parts": [
            {
              "text": "She",
              "label": "Subject"
            },
            {
              "text": "helps",
              "label": "Verb"
            },
            {
              "text": "me.",
              "label": "Object"
            }
          ],
          "note": ""
        },
        {
          "label": "Ownership",
          "parts": [
            {
              "text": "her bag",
              "label": "Her before a noun"
            },
            {
              "text": "the bag is hers",
              "label": "Hers stands alone"
            }
          ],
          "note": ""
        },
        {
          "label": "Point or ask",
          "parts": [
            {
              "text": "This is new.",
              "label": "Pointing pronoun"
            },
            {
              "text": "Who is here?",
              "label": "Asking pronoun"
            }
          ],
          "note": ""
        },
        {
          "label": "Name no particular person",
          "parts": [
            {
              "text": "Someone is here.",
              "label": "Indefinite pronoun"
            }
          ],
          "note": ""
        }
      ],
      "check": {
        "prompt": "Which pronoun points back to Ravi in “Ravi saw himself”?",
        "answer": "Himself. It points back to the same person, so it is reflexive."
      }
    }
  },
  {
    "id": "BEG-11",
    "title": "Pronoun agreement and clear reference",
    "kind": "concept",
    "sections": [
      {
        "title": "What you will learn",
        "paragraphs": [
          "You will choose a pronoun that fits, and make it clear who or what it means."
        ],
        "examples": []
      },
      {
        "title": "One or more than one",
        "paragraphs": [
          "A pronoun points back to a noun. “The cup fell. It broke.” It means the cup.",
          "“The cups fell. They broke.” They means the cups. The pronoun changes when you mean more than one."
        ],
        "examples": []
      },
      {
        "title": "Point of view",
        "paragraphs": [
          "I means the speaker. You means the listener. We includes the speaker and others.",
          "“Riya and I brought our books.” Our includes me. “Riya and Dev brought their books.” Their means those people."
        ],
        "examples": []
      },
      {
        "title": "Singular they",
        "paragraphs": [
          "If you do not know who someone is, they is useful. “Someone forgot their umbrella.”",
          "Use the usual they verbs even for one person. “They are here”, not “They is here”."
        ],
        "examples": []
      },
      {
        "title": "Make the person clear",
        "paragraphs": [
          "“Meera told Asha that she had won.” She could mean either person.",
          "If Meera won, repeat her name or write “Meera told Asha, ‘I won!’” Do not replace every noun when the meaning would become unclear."
        ],
        "examples": []
      },
      {
        "title": "Look at worked examples",
        "paragraphs": [],
        "examples": [
          "“The birds spread their wings.” Their matches the birds.",
          "“Each child should bring their bottle.” Their can refer to each child without naming a gender.",
          "Unclear: “Kabir met Dev when he arrived.” Clearer if Dev arrived: “When Dev arrived, Kabir met him.”"
        ]
      },
      {
        "title": "Remember",
        "paragraphs": [
          "Choose a pronoun that fits the people or things you mean. Then check that the reader can identify them."
        ],
        "examples": []
      }
    ],
    "tasks": [
      {
        "id": "G1",
        "phase": "guided",
        "kind": "response",
        "prompt": "Choose it or they: “The flowers are fresh. ___ smell lovely.”",
        "explanation": "They. The pronoun refers to more than one flower."
      },
      {
        "id": "G2",
        "phase": "guided",
        "kind": "response",
        "prompt": "In “Sana and I carried our bags”, does our include the speaker?",
        "explanation": "Yes. Our refers to Sana and the speaker together."
      },
      {
        "id": "Q1",
        "phase": "quiz",
        "kind": "choice",
        "prompt": "Complete “The ball is new. ___ is red.”",
        "explanation": "It refers to one ball.",
        "options": [
          "They.",
          "We.",
          "It."
        ],
        "answer": 2
      },
      {
        "id": "Q2",
        "phase": "quiz",
        "kind": "choice",
        "prompt": "Complete “Asha and I packed ___ lunches.”",
        "explanation": "Our includes Asha and the speaker.",
        "options": [
          "Our.",
          "His.",
          "Its."
        ],
        "answer": 0
      },
      {
        "id": "Q3",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Correct “Someone is outside. They is waiting.”",
        "explanation": "Someone is outside. They are waiting. Singular they still takes are."
      },
      {
        "id": "Q4",
        "phase": "quiz",
        "kind": "response",
        "prompt": "In “Riya spoke to Tara after she won”, is it certain who won?",
        "explanation": "No. She could refer to Riya or Tara. Repeat the winner’s name to make the meaning clear."
      },
      {
        "id": "Q5",
        "phase": "quiz",
        "kind": "choice",
        "prompt": "Complete “The puppies wagged ___ tails.”",
        "explanation": "Their refers to the puppies and shows whose tails they are.",
        "options": [
          "Its.",
          "Their.",
          "My."
        ],
        "answer": 1
      },
      {
        "id": "W1",
        "phase": "write",
        "kind": "response",
        "prompt": "Write two sentences about two friends. Use a pronoun, then check that a reader knows exactly who it means.",
        "explanation": "Sample: “Aman and Kabir are friends. They play chess.” They clearly refers to both friends. You can use other examples with clear reference."
      }
    ],
    "visualGuide": {
      "title": "Show who the pronoun means",
      "rows": [
        {
          "label": "One clear referent",
          "parts": [
            {
              "text": "Asha and Dev",
              "label": "Two friends"
            },
            {
              "text": "They play chess.",
              "label": "They means both friends"
            }
          ],
          "note": ""
        },
        {
          "label": "Unclear",
          "parts": [
            {
              "text": "Neha told Tara",
              "label": "Two possible people"
            },
            {
              "text": "that she won.",
              "label": "Who won?"
            }
          ],
          "note": ""
        },
        {
          "label": "Clear if Tara won",
          "parts": [
            {
              "text": "Tara won.",
              "label": "Name the winner"
            },
            {
              "text": "Neha told her the news.",
              "label": "Her means Tara"
            }
          ],
          "note": ""
        }
      ],
      "check": {
        "prompt": "Which verb goes with singular they: are or is?",
        "answer": "Are. “Someone is outside. They are waiting.”"
      }
    }
  },
  {
    "id": "BEG-12",
    "title": "Correct pronoun usage",
    "kind": "concept",
    "sections": [
      {
        "title": "What you will learn",
        "paragraphs": [
          "You will choose subject pronouns and object pronouns in simple sentences."
        ],
        "examples": []
      },
      {
        "title": "Subject pronoun",
        "paragraphs": [
          "Use I, you, he, she, it, we, and they when the pronoun is the subject. “She helps me.” She is the person giving help.",
          "“Her is my friend” does not fit this writing pattern. Write “She is my friend.”"
        ],
        "examples": []
      },
      {
        "title": "Object pronoun",
        "paragraphs": [
          "Use me, you, him, her, it, us, and them after a verb or a word such as to, with, for, or beside.",
          "“She helps me.” Me is the person getting help. “The gift is for us.” “Asha sat beside me.”"
        ],
        "examples": []
      },
      {
        "title": "A name plus a pronoun",
        "paragraphs": [
          "Check the pronoun on its own. “Ravi and I play.” Without Ravi, “I play” works. “Me play” does not.",
          "“The teacher helped Ravi and me.” Without Ravi, “helped me” works. Do not change me to I just because another name is there."
        ],
        "examples": []
      },
      {
        "title": "Myself",
        "paragraphs": [
          "Myself is not a polite form of I or me. “I am Rohan.” “I made a card.”",
          "Use myself when it points back to I. “I made myself a sandwich.” In “I made it myself”, myself adds emphasis: I did it without help."
        ],
        "examples": []
      },
      {
        "title": "Look at worked examples",
        "paragraphs": [],
        "examples": [
          "Needs correction: “Her is my friend.” Corrected: “She is my friend.” The subject form is she.",
          "“Grandmother called him.” Him is the object of called.",
          "“This gift is for Tara and me.” For takes the object form me."
        ]
      },
      {
        "title": "Remember",
        "paragraphs": [
          "Use I, he, she, we, and they as subjects. Use me, him, her, us, and them as objects. You and it keep the same form in these jobs."
        ],
        "examples": []
      }
    ],
    "tasks": [
      {
        "id": "G1",
        "phase": "guided",
        "kind": "response",
        "prompt": "Choose I or me: “Neha and ___ read together.” Try the pronoun alone.",
        "explanation": "I. “I read” is the subject pattern, so “Neha and I read together” works."
      },
      {
        "id": "G2",
        "phase": "guided",
        "kind": "response",
        "prompt": "Choose we or us: “The coach spoke to ___.”",
        "explanation": "Us. The pronoun follows the preposition to."
      },
      {
        "id": "Q1",
        "phase": "quiz",
        "kind": "choice",
        "prompt": "Complete “___ opened the door.”",
        "explanation": "She is the subject form before opened.",
        "options": [
          "Her.",
          "She.",
          "Hers."
        ],
        "answer": 1
      },
      {
        "id": "Q2",
        "phase": "quiz",
        "kind": "choice",
        "prompt": "Complete “Aman gave the ball to ___.”",
        "explanation": "Him is the object form after to.",
        "options": [
          "He.",
          "His.",
          "Him."
        ],
        "answer": 2
      },
      {
        "id": "Q3",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Correct “Me and Dev are ready” for standard school writing.",
        "explanation": "Dev and I are ready. I is the subject form. “I and Dev are ready” has the correct pronoun case, although naming the other person first is more usual."
      },
      {
        "id": "Q4",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Choose I or me: “The teacher thanked Asha and ___.”",
        "explanation": "Me. “The teacher thanked me” shows the object form needed here."
      },
      {
        "id": "Q5",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Correct “Myself am Rohan” as a simple introduction.",
        "explanation": "I am Rohan. I is the subject pronoun. Myself does not replace I in this sentence."
      },
      {
        "id": "W1",
        "phase": "write",
        "kind": "response",
        "prompt": "Write one sentence beginning with “My friend and I” and one ending with “my friend and me”.",
        "explanation": "Sample: “My friend and I walk to school.” “The teacher helped my friend and me.” Check subject I and object me in their different jobs."
      }
    ],
    "visualGuide": {
      "title": "Check the pronoun on its own",
      "rows": [
        {
          "label": "Subject check",
          "parts": [
            {
              "text": "Asha and I read.",
              "label": "Full sentence"
            },
            {
              "text": "I read.",
              "label": "Remove Asha and"
            }
          ],
          "note": ""
        },
        {
          "label": "Object check",
          "parts": [
            {
              "text": "The teacher helped Asha and me.",
              "label": "Full sentence"
            },
            {
              "text": "The teacher helped me.",
              "label": "Remove Asha and"
            }
          ],
          "note": ""
        }
      ],
      "check": {
        "prompt": "Which fits: “The gift is for Ravi and I” or “for Ravi and me”?",
        "answer": "For Ravi and me. “For me” shows the object form needed after for."
      }
    }
  },
  {
    "id": "BEG-13",
    "title": "Main and helping verbs",
    "kind": "concept",
    "sections": [
      {
        "title": "What you will learn",
        "paragraphs": [
          "You will find the main verb, then see how a helping verb works with it."
        ],
        "examples": []
      },
      {
        "title": "Main verb",
        "paragraphs": [
          "The main verb carries the action or state. “Sana paints.” Paints is the main verb.",
          "“Sana is painting.” Painting carries the action. Is is helping it."
        ],
        "examples": []
      },
      {
        "title": "Helping verb",
        "paragraphs": [
          "A helping verb works with a main verb. It can show time, make a question or a negative, or add a meaning such as ability.",
          "Another name is auxiliary verb. Ask whether the word is working with another verb. Do not decide from the spelling alone."
        ],
        "examples": []
      },
      {
        "title": "Be and have",
        "paragraphs": [
          "Be with an ing form shows an action in progress. “I am reading.” “They are reading.” “Ravi was reading.”",
          "In “I have finished my work”, have is a helper and finished carries the action. For now, notice the two verbs. You will study this time pattern later."
        ],
        "examples": []
      },
      {
        "title": "Do and can",
        "paragraphs": [
          "The base form is the simple dictionary form: play, go, eat. Use it after does, did, or can. “Does Kabir play?” “Kabir does not play.” “Did Riya go?” “Riya did not go.”",
          "Can shows ability. “Neha can swim”, not “Neha can swims”. The helper changes the meaning while the main verb keeps its base form."
        ],
        "examples": []
      },
      {
        "title": "Not always a helper",
        "paragraphs": [
          "Be, have, and do can be the main verb. “Ravi is happy.” Is links Ravi to happy. There is no second verb.",
          "“I have a pencil.” Have shows possession. “We do our homework.” Do is the main verb."
        ],
        "examples": []
      },
      {
        "title": "Look at worked examples",
        "paragraphs": [],
        "examples": [
          "“Asha is drawing.” Helping verb: is. Main verb: drawing.",
          "“Asha is cheerful.” Main linking verb: is. There is no second verb here for is to help.",
          "Needs correction: “Does Kabir plays?” Corrected: “Does Kabir play?” Does already carries the present form needed for Kabir."
        ]
      },
      {
        "title": "Remember",
        "paragraphs": [
          "A helping verb works with a main verb. The same word can be a main verb in a different sentence."
        ],
        "examples": []
      }
    ],
    "tasks": [
      {
        "id": "G1",
        "phase": "guided",
        "kind": "response",
        "prompt": "Find the helping verb and main verb in “The children are singing”.",
        "explanation": "Helping verb: are. Main verb: singing. Together they form the verb group are singing."
      },
      {
        "id": "G2",
        "phase": "guided",
        "kind": "response",
        "prompt": "Choose go or went: “Did Riya ___ home?”",
        "explanation": "Go. Use the base form after did in this question."
      },
      {
        "id": "Q1",
        "phase": "quiz",
        "kind": "choice",
        "prompt": "In “I am writing”, which is the helping verb?",
        "explanation": "Am helps the main verb writing show an action in progress.",
        "options": [
          "Am.",
          "Writing.",
          "I."
        ],
        "answer": 0
      },
      {
        "id": "Q2",
        "phase": "quiz",
        "kind": "choice",
        "prompt": "Complete “Meera can ___.”",
        "explanation": "Can is followed by the base form sing.",
        "options": [
          "Sings.",
          "Singing.",
          "Sing."
        ],
        "answer": 2
      },
      {
        "id": "Q3",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Correct “She does not likes tea.”",
        "explanation": "She does not like tea. The main verb uses the base form after does not."
      },
      {
        "id": "Q4",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Is “have” a helping verb in “I have two pencils”?",
        "explanation": "No. It is the main verb expressing possession. There is no second verb in the sentence."
      },
      {
        "id": "Q5",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Find the main verb in “We have finished lunch”.",
        "explanation": "Finished. Have is the helping verb in have finished."
      },
      {
        "id": "W1",
        "phase": "write",
        "kind": "response",
        "prompt": "Write one sentence using “is” with an ing action and one using “can” with a base verb.",
        "explanation": "Sample: “Aman is dancing.” “Aman can dance.” Check is plus dancing and can plus dance."
      }
    ],
    "visualGuide": {
      "title": "A helper works with a main verb",
      "rows": [
        {
          "label": "Action in progress",
          "parts": [
            {
              "text": "is",
              "label": "Helper"
            },
            {
              "text": "singing",
              "label": "Main verb"
            }
          ],
          "note": ""
        },
        {
          "label": "A completed action",
          "parts": [
            {
              "text": "have",
              "label": "Helper"
            },
            {
              "text": "finished",
              "label": "Main verb"
            }
          ],
          "note": ""
        },
        {
          "label": "Question or negative",
          "parts": [
            {
              "text": "does not / did not",
              "label": "Helper + not"
            },
            {
              "text": "play",
              "label": "Base form"
            }
          ],
          "note": ""
        },
        {
          "label": "Ability",
          "parts": [
            {
              "text": "can",
              "label": "Helper"
            },
            {
              "text": "swim",
              "label": "Base form"
            }
          ],
          "note": ""
        }
      ],
      "check": {
        "prompt": "Is is a helping verb in “Riya is happy”?",
        "answer": "No. Is is the main linking verb. Happy is a description, not another verb."
      }
    }
  },
  {
    "id": "BEG-14",
    "title": "Transitive and intransitive verbs",
    "kind": "concept",
    "sections": [
      {
        "title": "What you will learn",
        "paragraphs": [
          "You will check whether an action verb has a direct object in that sentence."
        ],
        "examples": []
      },
      {
        "title": "Transitive",
        "paragraphs": [
          "A transitive use has a direct object. “Priya carries a bag.” Priya carries what? A bag.",
          "“Kabir helps his sister.” His sister is the direct object. “Asha carries” usually leaves us asking what. Add the object: “Asha carries a basket.”"
        ],
        "examples": []
      },
      {
        "title": "Intransitive",
        "paragraphs": [
          "An intransitive use has no direct object. “The baby sleeps.” The sentence is still complete.",
          "Words after the verb may tell how or where. “The baby sleeps peacefully.” “The baby sleeps in the cot.” “Ravi walks to school.” School follows to. It is not a direct object of walks."
        ],
        "examples": []
      },
      {
        "title": "Both ways",
        "paragraphs": [
          "Some verbs work both ways. “Meera eats a banana.” Eats has an object. “Meera eats slowly.” There is no object. Both sentences are complete.",
          "This lesson is about action verbs. “Asha is happy” has a complement, not a direct object."
        ],
        "examples": []
      },
      {
        "title": "Look at worked examples",
        "paragraphs": [],
        "examples": [
          "“Zoya opens the window.” Direct object: the window. Opens is used transitively.",
          "“The children laugh.” No direct object. Laugh is used intransitively.",
          "“Dev reads a story.” Read is transitive here. “Dev reads every evening.” Read is intransitive here; every evening tells us when."
        ]
      },
      {
        "title": "Remember",
        "paragraphs": [
          "Check the verb in its sentence. Some action verbs can be used with or without a direct object."
        ],
        "examples": []
      }
    ],
    "tasks": [
      {
        "id": "G1",
        "phase": "guided",
        "kind": "response",
        "prompt": "Find the direct object in “Rohan washes the plates”.",
        "explanation": "The plates. Ask “Rohan washes what?”"
      },
      {
        "id": "G2",
        "phase": "guided",
        "kind": "response",
        "prompt": "Does “Asha runs quickly” have a direct object?",
        "explanation": "No. Quickly tells us how Asha runs. It is not an object."
      },
      {
        "id": "Q1",
        "phase": "quiz",
        "kind": "choice",
        "prompt": "Which sentence has a direct object?",
        "explanation": "A box is the direct object of carries.",
        "options": [
          "The baby sleeps.",
          "Sana carries a box.",
          "The children laugh."
        ],
        "answer": 1
      },
      {
        "id": "Q2",
        "phase": "quiz",
        "kind": "response",
        "prompt": "In “Kabir waits outside”, is outside a direct object?",
        "explanation": "No. Outside tells us where he waits."
      },
      {
        "id": "Q3",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Label the use of eats in “Ravi eats rice”: transitive or intransitive.",
        "explanation": "Transitive. Rice is the direct object of eats."
      },
      {
        "id": "Q4",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Label the use of eats in “Ravi eats slowly”: transitive or intransitive.",
        "explanation": "Intransitive. There is no direct object; slowly tells us how he eats."
      },
      {
        "id": "Q5",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Add a suitable direct object: “Meera kicks ___.”",
        "explanation": "Sample: “Meera kicks the ball.” The ball names what she kicks."
      },
      {
        "id": "W1",
        "phase": "write",
        "kind": "response",
        "prompt": "Write one sentence with “reads a book” and one with “reads quietly”. Identify which has a direct object.",
        "explanation": "Sample: “Neha reads a book.” “Neha reads quietly.” The first has the direct object a book. The second has no direct object."
      }
    ],
    "visualGuide": {
      "title": "The same verb can work both ways",
      "rows": [
        {
          "label": "With an object",
          "parts": [
            {
              "text": "Meera reads",
              "label": "Who and action"
            },
            {
              "text": "a book.",
              "label": "Reads what? Object"
            }
          ],
          "note": ""
        },
        {
          "label": "Without an object",
          "parts": [
            {
              "text": "Meera reads",
              "label": "Who and action"
            },
            {
              "text": "quietly.",
              "label": "How? Not an object"
            }
          ],
          "note": ""
        }
      ],
      "check": {
        "prompt": "Does “Ravi walks to school” have a direct object of walks?",
        "answer": "No. To school tells where he goes. School follows the preposition to."
      }
    }
  },
  {
    "id": "BEG-15",
    "title": "Regular and irregular verbs",
    "kind": "concept",
    "sections": [
      {
        "title": "What you will learn",
        "paragraphs": [
          "You will use simple past forms for a completed action. “Yesterday, Riya played outside.”"
        ],
        "examples": []
      },
      {
        "title": "Habit now and finished past",
        "paragraphs": [
          "“I walk to school every day” tells a habit. “I am walking now” tells what is happening now. “I walked yesterday” tells a finished past action. This lesson practises that last pattern."
        ],
        "examples": []
      },
      {
        "title": "Regular past",
        "paragraphs": [
          "A regular verb usually adds ed. Play becomes played. Walk becomes walked. Help becomes helped.",
          "If the word already ends in e, add d. Smile becomes smiled. Study becomes studied and stop becomes stopped. They are still regular. You will practise those spellings later."
        ],
        "examples": []
      },
      {
        "title": "Irregular past",
        "paragraphs": [
          "An irregular verb does not follow the ed pattern. Go becomes went. Eat becomes ate. See becomes saw. Take becomes took. Write becomes wrote.",
          "Some keep the same spelling. Put stays put. Cut stays cut. Read keeps its letters, but the past sounds like “red”. Gone and eaten belong with helping verbs. They are not the simple past."
        ],
        "examples": []
      },
      {
        "title": "The same form, except be",
        "paragraphs": [
          "For most verbs, the simple past stays the same for every subject. I played. She played. They played.",
          "Be changes. I was. She was. You were. We were. They were."
        ],
        "examples": []
      },
      {
        "title": "After did",
        "paragraphs": [
          "After did or did not, use the base form. “Did Asha go?” “Asha did not go.”",
          "Do not write “did went” or “did ate”. Did already marks the past."
        ],
        "examples": []
      },
      {
        "title": "Look at worked examples",
        "paragraphs": [],
        "examples": [
          "“Today I walk. Yesterday I walked.” Walk is regular.",
          "“Today I eat rice. Yesterday I ate rice.” Eat is irregular.",
          "Needs correction: “Dev goed home.” Corrected: “Dev went home.” The past of go is went."
        ]
      },
      {
        "title": "Remember",
        "paragraphs": [
          "Regular past forms follow an ed pattern. Irregular forms need to be learned, and some stay the same. Use the base form after did."
        ],
        "examples": []
      }
    ],
    "tasks": [
      {
        "id": "G1",
        "phase": "guided",
        "kind": "response",
        "prompt": "Change “I help Neha” to a sentence beginning “Yesterday”.",
        "explanation": "Yesterday, I helped Neha. Help forms the past with ed. The comma after Yesterday is optional here."
      },
      {
        "id": "G2",
        "phase": "guided",
        "kind": "response",
        "prompt": "Correct “Did Aman ate lunch?”",
        "explanation": "Did Aman eat lunch? Use the base form eat after did."
      },
      {
        "id": "Q1",
        "phase": "quiz",
        "kind": "choice",
        "prompt": "What is the simple past of go?",
        "explanation": "Went is the simple past. Gone is used in other patterns, such as has gone.",
        "options": [
          "Goed.",
          "Gone.",
          "Went."
        ],
        "answer": 2
      },
      {
        "id": "Q2",
        "phase": "quiz",
        "kind": "choice",
        "prompt": "Which past form is regular?",
        "explanation": "Played follows the regular ed pattern.",
        "options": [
          "Played.",
          "Took.",
          "Saw."
        ],
        "answer": 0
      },
      {
        "id": "Q3",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Complete “Yesterday, Tara ___ an apple” using the simple past of eat.",
        "explanation": "Ate. “Yesterday, Tara ate an apple.”"
      },
      {
        "id": "Q4",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Does every irregular verb change its spelling in the past? Give an example.",
        "explanation": "No. Put and cut keep the same spelling in the simple past."
      },
      {
        "id": "Q5",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Correct “She did not went to the park.”",
        "explanation": "She did not go to the park. Use the base form after did not."
      },
      {
        "id": "W1",
        "phase": "write",
        "kind": "response",
        "prompt": "Write two sentences about yesterday. Use one regular past verb and one irregular past verb.",
        "explanation": "Sample: “I played with my friend.” “I ate a banana.” Check completed past meanings and the correct past forms."
      }
    ],
    "visualGuide": {
      "title": "Choose the finished past form",
      "rows": [
        {
          "label": "Regular",
          "parts": [
            {
              "text": "play",
              "label": "Base"
            },
            {
              "text": "played",
              "label": "Simple past"
            }
          ],
          "note": ""
        },
        {
          "label": "Irregular",
          "parts": [
            {
              "text": "go",
              "label": "Base"
            },
            {
              "text": "went",
              "label": "Simple past"
            }
          ],
          "note": ""
        },
        {
          "label": "After did",
          "parts": [
            {
              "text": "Did Asha",
              "label": "Did marks past"
            },
            {
              "text": "go?",
              "label": "Use base form"
            }
          ],
          "note": ""
        }
      ],
      "check": {
        "prompt": "Repair “Aman did not ate lunch.”",
        "answer": "Aman did not eat lunch. Did already marks the past, so use eat."
      }
    }
  },
  {
    "id": "BEG-16",
    "title": "Subject and verb agreement",
    "kind": "concept",
    "sections": [
      {
        "title": "What you will learn",
        "paragraphs": [
          "You will match a present-tense verb to its subject. This fit is called agreement."
        ],
        "examples": []
      },
      {
        "title": "One or more than one",
        "paragraphs": [
          "“The girl walks.” “The girls walk.” One girl takes walks. More than one girl takes walk."
        ],
        "examples": []
      },
      {
        "title": "I, you, we, they",
        "paragraphs": [
          "In the simple present, I, you, we, and they use the base form: play.",
          "He, she, it, and one named person or thing use plays. “Aman plays football.”"
        ],
        "examples": []
      },
      {
        "title": "Present verb changes",
        "paragraphs": [
          "Some present forms use es or ies: watches, goes, studies. Have becomes has. “She has a kite.”",
          "Do not add s in “She played” or “She can play”. Those are different patterns."
        ],
        "examples": []
      },
      {
        "title": "Be",
        "paragraphs": [
          "Be has its own forms. I am. You are. He, she, and it use is. We and they use are.",
          "“The child is happy.” “The children are happy.” In ordinary past statements, I, he, she, and it use was. You, we, and they use were."
        ],
        "examples": []
      },
      {
        "title": "Words in between",
        "paragraphs": [
          "Two people joined by and usually take a plural verb. “Ravi and Meera play chess.”",
          "Words between the subject and the verb do not change the match. “The box of pencils is open.” The subject is the box, not pencils."
        ],
        "examples": []
      },
      {
        "title": "Everyone and they",
        "paragraphs": [
          "Everyone, someone, and each child take a singular verb. Everyone is. Someone has. Each child brings.",
          "A later they still takes are or have. “Someone is here. They are waiting.”"
        ],
        "examples": []
      },
      {
        "title": "Look at worked examples",
        "paragraphs": [],
        "examples": [
          "“The bird sings.” “The birds sing.” The present verb matches the subject.",
          "Needs correction: “She have a kite.” Corrected: “She has a kite.”",
          "“The bag of apples is heavy.” Bag is the main noun in the subject. Apples does not make the verb plural."
        ]
      },
      {
        "title": "Remember",
        "paragraphs": [
          "Find the subject first. Then choose the verb form for that subject and that sentence pattern."
        ],
        "examples": []
      }
    ],
    "tasks": [
      {
        "id": "G1",
        "phase": "guided",
        "kind": "response",
        "prompt": "Choose play or plays: “Aman ___ football every evening.”",
        "explanation": "Plays. Aman is one person, so the simple present uses plays."
      },
      {
        "id": "G2",
        "phase": "guided",
        "kind": "response",
        "prompt": "Choose is or are: “The children ___ ready.”",
        "explanation": "Are. Children is plural."
      },
      {
        "id": "Q1",
        "phase": "quiz",
        "kind": "choice",
        "prompt": "Complete “I ___ happy.”",
        "explanation": "I takes am in this present-tense pattern.",
        "options": [
          "Is.",
          "Am.",
          "Be."
        ],
        "answer": 1
      },
      {
        "id": "Q2",
        "phase": "quiz",
        "kind": "choice",
        "prompt": "Complete “My sister ___ to school.”",
        "explanation": "My sister is a singular subject, so use walks in the simple present.",
        "options": [
          "Walk.",
          "Walking.",
          "Walks."
        ],
        "answer": 2
      },
      {
        "id": "Q3",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Correct “Riya and Sana likes music.”",
        "explanation": "Riya and Sana like music. Two separate people joined by and take like."
      },
      {
        "id": "Q4",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Choose is or are: “The basket of mangoes ___ full.”",
        "explanation": "Is. The subject is the basket. Of mangoes does not change the singular agreement."
      },
      {
        "id": "Q5",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Complete “Everyone ___ a pencil” with has or have.",
        "explanation": "Has. Everyone takes a singular verb in this pattern."
      },
      {
        "id": "W1",
        "phase": "write",
        "kind": "response",
        "prompt": "Write a present habit sentence about one friend. Then rewrite it about two friends.",
        "explanation": "Sample: “Asha reads after lunch.” “Asha and Neha read after lunch.” Check reads for one person and read for two."
      }
    ],
    "visualGuide": {
      "title": "Match the subject and verb",
      "rows": [
        {
          "label": "Simple present",
          "parts": [
            {
              "text": "I / you / we / they",
              "label": "Subject"
            },
            {
              "text": "play",
              "label": "Base form"
            }
          ],
          "note": ""
        },
        {
          "label": "Simple present",
          "parts": [
            {
              "text": "he / she / it / Riya",
              "label": "Subject"
            },
            {
              "text": "plays",
              "label": "Add s here"
            }
          ],
          "note": ""
        },
        {
          "label": "Find the main noun",
          "parts": [
            {
              "text": "The box",
              "label": "One box"
            },
            {
              "text": "of pencils",
              "label": "Extra information"
            },
            {
              "text": "is open.",
              "label": "Matches box"
            }
          ],
          "note": ""
        }
      ],
      "check": {
        "prompt": "Why do we write “The girls play”, not “The girls plays”?",
        "answer": "Girls is plural. In the simple present it takes play. The plural noun s does not mean the verb needs s too."
      }
    }
  },
  {
    "id": "BEG-17",
    "title": "Types of adjectives",
    "kind": "concept",
    "sections": [
      {
        "title": "What you will learn",
        "paragraphs": [
          "An adjective gives more information about a noun. “Asha has a blue bag.” Blue describes the bag. You will meet four useful groups of describing words. These are not the only possible groups."
        ],
        "examples": []
      },
      {
        "title": "Size",
        "paragraphs": [
          "A size adjective tells how big or small. Big, small, tall, and short.",
          "“A small bird sits on the wall.” Small describes bird."
        ],
        "examples": []
      },
      {
        "title": "Shape",
        "paragraphs": [
          "A shape adjective tells the form. Round, square, and flat.",
          "“A round plate.” Round describes plate."
        ],
        "examples": []
      },
      {
        "title": "Colour",
        "paragraphs": [
          "A colour adjective tells the colour. Red, green, yellow, and purple.",
          "“A blue bag.” The adjective stays the same when the noun becomes plural. Two red flowers, not two reds flowers."
        ],
        "examples": []
      },
      {
        "title": "Quality",
        "paragraphs": [
          "A quality adjective tells a feeling or a kind of character. Kind, useful, tired, and happy.",
          "“The kind teacher helps us.” “Neha is cheerful.” Cheerful describes Neha after is."
        ],
        "examples": []
      },
      {
        "title": "Before the noun or after is",
        "paragraphs": [
          "An adjective can come before the noun. “A quiet room.” It can come after a linking verb. “The room is quiet.”",
          "In “my three red pencils”, my shows whose, three counts, and red describes. My and three are not descriptive adjectives in this course."
        ],
        "examples": []
      },
      {
        "title": "Look at worked examples",
        "paragraphs": [],
        "examples": [
          "“The kind teacher helps us.” Kind describes the teacher’s quality.",
          "“The mango is sweet.” Sweet describes the mango after is.",
          "Needs correction: “Two greens leaves fell.” Corrected: “Two green leaves fell.” Green does not take a plural s."
        ]
      },
      {
        "title": "Remember",
        "paragraphs": [
          "An adjective describes a noun. It can come before the noun or after a linking verb."
        ],
        "examples": []
      }
    ],
    "tasks": [
      {
        "id": "G1",
        "phase": "guided",
        "kind": "response",
        "prompt": "Find the adjective in “A small bird sits on the wall”. What does it describe?",
        "explanation": "Small. It describes the noun bird."
      },
      {
        "id": "G2",
        "phase": "guided",
        "kind": "response",
        "prompt": "Move the adjective before the noun: “The bag is heavy.” Write “a ___ bag”.",
        "explanation": "A heavy bag. Heavy describes bag in both positions."
      },
      {
        "id": "Q1",
        "phase": "quiz",
        "kind": "choice",
        "prompt": "Which word describes colour?",
        "explanation": "Purple is a colour adjective.",
        "options": [
          "Round.",
          "Tall.",
          "Purple."
        ],
        "answer": 2
      },
      {
        "id": "Q2",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Find the adjective in “Neha is cheerful”.",
        "explanation": "Cheerful. It describes Neha after the linking verb is."
      },
      {
        "id": "Q3",
        "phase": "quiz",
        "kind": "choice",
        "prompt": "Choose the correct phrase.",
        "explanation": "Soft describes pillows and does not change for the plural.",
        "options": [
          "Two soft pillows.",
          "Two softs pillows.",
          "Two softly pillows."
        ],
        "answer": 0
      },
      {
        "id": "Q4",
        "phase": "quiz",
        "kind": "response",
        "prompt": "In “my red pencil”, which word is the descriptive adjective?",
        "explanation": "Red. My is a possessive determiner in the terminology used in this course."
      },
      {
        "id": "Q5",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Add an adjective that describes shape: “a ___ plate”.",
        "explanation": "Sample: a round plate. You can use a suitable shape adjective such as square or oval."
      },
      {
        "id": "W1",
        "phase": "write",
        "kind": "response",
        "prompt": "Describe a favourite object in two sentences. Use at least two different adjectives.",
        "explanation": "Sample: “My kite is blue. It has a long tail.” Blue describes kite and long describes tail. You can use sensible descriptions."
      }
    ],
    "visualGuide": {
      "title": "Describe the noun",
      "rows": [
        {
          "label": "Before the noun",
          "parts": [
            {
              "text": "a small blue",
              "label": "Size and colour"
            },
            {
              "text": "bag",
              "label": "Noun"
            }
          ],
          "note": ""
        },
        {
          "label": "After a linking verb",
          "parts": [
            {
              "text": "The bag",
              "label": "Subject"
            },
            {
              "text": "is useful.",
              "label": "Useful describes bag"
            }
          ],
          "note": ""
        },
        {
          "label": "Keep the adjective unchanged",
          "parts": [
            {
              "text": "one red flower",
              "label": "One"
            },
            {
              "text": "two red flowers",
              "label": "More than one"
            }
          ],
          "note": ""
        }
      ],
      "check": {
        "prompt": "Which is correct: green leaves or greens leaves?",
        "answer": "Green leaves. The noun becomes plural, but the adjective green stays the same."
      }
    }
  },
  {
    "id": "BEG-18",
    "title": "Degrees of comparison",
    "kind": "concept",
    "sections": [
      {
        "title": "What you will learn",
        "paragraphs": [
          "You will describe something, compare two things, and pick one from a group."
        ],
        "examples": []
      },
      {
        "title": "Positive",
        "paragraphs": [
          "The positive form is the basic adjective. Tall, small, kind, heavy.",
          "Here positive means the basic form, not “happy” or “good”. “Asha is tall.”"
        ],
        "examples": []
      },
      {
        "title": "Comparative",
        "paragraphs": [
          "The comparative compares two. Taller, smaller, kinder. “Ravi is taller than Dev.”"
        ],
        "examples": []
      },
      {
        "title": "Short or long",
        "paragraphs": [
          "Many short adjectives add er. Large becomes larger. Big becomes bigger. Happy becomes happier.",
          "Longer adjectives use more. More useful. More interesting. Do not write more taller or more heavier."
        ],
        "examples": []
      },
      {
        "title": "Superlative",
        "paragraphs": [
          "The superlative picks one from a group. Tallest, smallest, kindest. “This is the biggest of the three boxes.”",
          "Short adjectives add est. Longer ones use most: most useful. A common pattern is the + superlative: “the tallest child”. Other words can come before a superlative too: “my best friend”. Name the group when it helps."
        ],
        "examples": []
      },
      {
        "title": "Irregular forms",
        "paragraphs": [
          "Good, better, best. Bad, worse, worst. Learn these as a set.",
          "Do not write gooder or goodest."
        ],
        "examples": []
      },
      {
        "title": "As ... as",
        "paragraphs": [
          "To say two things are equal, use as plus the basic adjective plus as. “This bag is as heavy as that one.”",
          "Do not use heavier or heaviest in the as ... as pattern."
        ],
        "examples": []
      },
      {
        "title": "Look at worked examples",
        "paragraphs": [],
        "examples": [
          "“Asha is tall. Asha is taller than Riya. Asha is the tallest of the three friends.”",
          "“This story is more interesting than that story.” Use more with interesting.",
          "Needs correction: “My bag is more heavier.” Corrected: “My bag is heavier.” Use one comparative pattern."
        ]
      },
      {
        "title": "Remember",
        "paragraphs": [
          "Use a comparative to compare two. Use a superlative to pick the greatest or least degree within a group."
        ],
        "examples": []
      }
    ],
    "tasks": [
      {
        "id": "G1",
        "phase": "guided",
        "kind": "response",
        "prompt": "Complete the set: small, ___, ___.",
        "explanation": "Smaller, smallest. Add er and est to this short adjective."
      },
      {
        "id": "G2",
        "phase": "guided",
        "kind": "response",
        "prompt": "Choose better or gooder: “This drawing is ___ than my first one.”",
        "explanation": "Better. Good has the irregular comparative better."
      },
      {
        "id": "Q1",
        "phase": "quiz",
        "kind": "choice",
        "prompt": "Complete “Ravi is ___ than Dev” using tall.",
        "explanation": "Taller compares the two people.",
        "options": [
          "Tallest.",
          "Taller.",
          "More taller."
        ],
        "answer": 1
      },
      {
        "id": "Q2",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Complete “Of these three boxes, this is the ___” using big.",
        "explanation": "Biggest. The superlative compares one box with the whole group; double g before est."
      },
      {
        "id": "Q3",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Correct “This book is more cheaper.”",
        "explanation": "This book is cheaper. Do not combine more with cheaper."
      },
      {
        "id": "Q4",
        "phase": "quiz",
        "kind": "choice",
        "prompt": "Choose the superlative of good.",
        "explanation": "The forms are good, better, best.",
        "options": [
          "Goodest.",
          "Better.",
          "Best."
        ],
        "answer": 2
      },
      {
        "id": "Q5",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Complete “This bag is as ___ as that one” using heavy, heavier, or heaviest.",
        "explanation": "Heavy. The as...as pattern uses the base adjective."
      },
      {
        "id": "W1",
        "phase": "write",
        "kind": "response",
        "prompt": "Compare two objects using than. Then write a sentence about one object in a group using a superlative.",
        "explanation": "Sample: “My ruler is longer than my pencil.” “The blue ruler is the longest ruler in my box.” Check the comparative, the superlative, and a clear comparison group."
      }
    ],
    "visual": "comparison"
  },
  {
    "id": "BEG-19",
    "title": "Order of adjectives",
    "kind": "concept",
    "sections": [
      {
        "title": "What you will learn",
        "paragraphs": [
          "You will put two or three describing words in a natural order before a noun."
        ],
        "examples": []
      },
      {
        "title": "The usual order",
        "paragraphs": [
          "For reference, a usual order is opinion, size, age, shape, colour, origin, material, and purpose, then the noun. Do not try to memorise this whole list today. Practise the short patterns below.",
          "You do not need every category. Two or three useful details are enough. “A small red bag” is natural. “A red small bag” usually is not."
        ],
        "examples": []
      },
      {
        "title": "Opinion, size, and age",
        "paragraphs": [
          "Opinion is what someone thinks: lovely, nice, useful. Size includes small and large. Age includes old and new.",
          "“A lovely small garden.” Opinion before size. “A new blue shirt.” Age before colour."
        ],
        "examples": []
      },
      {
        "title": "Shape, colour, and material",
        "paragraphs": [
          "Shape includes round and square. Colour includes blue and yellow. Material tells what it is made from, as in wooden.",
          "“A round wooden table.” Shape before material. “A small wooden box.” Size before material."
        ],
        "examples": []
      },
      {
        "title": "Purpose stays near the noun",
        "paragraphs": [
          "Purpose tells what something is for. In “a new school bag”, school shows the kind of bag and stays next to bag.",
          "New describes the age. School is not a colour or a size."
        ],
        "examples": []
      },
      {
        "title": "Look at worked examples",
        "paragraphs": [],
        "examples": [
          "“A lovely small garden”: opinion before size.",
          "“A new blue shirt”: age before colour.",
          "“A small wooden box”: size before material.",
          "“A new school bag”: new describes age; school tells the bag’s purpose and stays close to bag."
        ]
      },
      {
        "title": "Remember",
        "paragraphs": [
          "Use a short group of useful descriptions. Size usually comes before colour, and material usually comes close to the noun."
        ],
        "examples": []
      }
    ],
    "tasks": [
      {
        "id": "G1",
        "phase": "guided",
        "kind": "response",
        "prompt": "Put small and green before “cup” in the usual order.",
        "explanation": "A small green cup. Size usually comes before colour."
      },
      {
        "id": "G2",
        "phase": "guided",
        "kind": "response",
        "prompt": "Put wooden and round before “table” in the usual order.",
        "explanation": "A round wooden table. Shape usually comes before material."
      },
      {
        "id": "Q1",
        "phase": "quiz",
        "kind": "choice",
        "prompt": "Choose the usual order.",
        "explanation": "Size usually comes before colour, and both words come before the noun.",
        "options": [
          "A small red ball.",
          "A red small ball.",
          "A ball small red."
        ],
        "answer": 0
      },
      {
        "id": "Q2",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Arrange “blue / new / shirt” after a.",
        "explanation": "A new blue shirt. Age comes before colour in this group."
      },
      {
        "id": "Q3",
        "phase": "quiz",
        "kind": "choice",
        "prompt": "Choose the usual order.",
        "explanation": "Shape usually comes before material.",
        "options": [
          "A wooden round table.",
          "A round wooden table.",
          "A table round wooden."
        ],
        "answer": 1
      },
      {
        "id": "Q4",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Must you use all the adjective categories in one phrase?",
        "explanation": "No. Two or three useful details are usually enough, and often one is better."
      },
      {
        "id": "Q5",
        "phase": "quiz",
        "kind": "response",
        "prompt": "In “a new school bag”, which word tells the purpose of the bag?",
        "explanation": "School. It is a noun used to show the kind or purpose of the bag."
      },
      {
        "id": "W1",
        "phase": "write",
        "kind": "response",
        "prompt": "Describe two objects using two describing words for each. Try size plus colour in one.",
        "explanation": "Sample: “A small yellow cup” and “a new wooden chair”. Check natural order without insisting that every possible alternative is ungrammatical."
      }
    ],
    "visualGuide": {
      "title": "Build a short noun group",
      "rows": [
        {
          "label": "Size before colour",
          "parts": [
            {
              "text": "a",
              "label": "Article"
            },
            {
              "text": "small",
              "label": "Size"
            },
            {
              "text": "red",
              "label": "Colour"
            },
            {
              "text": "bag",
              "label": "Noun"
            }
          ],
          "note": ""
        },
        {
          "label": "Age before colour",
          "parts": [
            {
              "text": "a new",
              "label": "Age"
            },
            {
              "text": "blue",
              "label": "Colour"
            },
            {
              "text": "shirt",
              "label": "Noun"
            }
          ],
          "note": ""
        },
        {
          "label": "Shape before material",
          "parts": [
            {
              "text": "a round",
              "label": "Shape"
            },
            {
              "text": "wooden",
              "label": "Material"
            },
            {
              "text": "table",
              "label": "Noun"
            }
          ],
          "note": ""
        }
      ],
      "check": {
        "prompt": "Put green and small before cup.",
        "answer": "A small green cup. Use a short group of useful details; you do not need every adjective category."
      }
    }
  },
  {
    "id": "BEG-20",
    "title": "Types of adverbs",
    "kind": "concept",
    "sections": [
      {
        "title": "What you will learn",
        "paragraphs": [
          "You will meet five kinds of adverbs, one at a time. An adverb tells more about a verb, an adjective, or another adverb."
        ],
        "examples": []
      },
      {
        "title": "Manner",
        "paragraphs": [
          "A manner adverb tells how. “Riya speaks softly.” Softly tells how she speaks.",
          "Slowly, quietly, and carefully end in ly. Fast and well do not. Friendly is usually an adjective, not an adverb. A manner adverb often follows the verb. “She reads carefully.”"
        ],
        "examples": []
      },
      {
        "title": "Time",
        "paragraphs": [
          "A time adverb tells when. “We will leave soon.” “Aman arrived yesterday.”",
          "Soon, yesterday, and tomorrow are time adverbs."
        ],
        "examples": []
      },
      {
        "title": "Place",
        "paragraphs": [
          "A place adverb tells where. “Please sit here.” “The children play outside.”",
          "Here, outside, and upstairs give a place."
        ],
        "examples": []
      },
      {
        "title": "Frequency",
        "paragraphs": [
          "A frequency adverb tells how often. Always, usually, often, sometimes, and never.",
          "Often means many times, not necessarily every time."
        ],
        "examples": []
      },
      {
        "title": "Degree",
        "paragraphs": [
          "A degree adverb tells how much. “The water is very cold.” Very tells more about cold.",
          "Quite and too work this way too. “Meera runs quite quickly.” Quite tells more about quickly."
        ],
        "examples": []
      },
      {
        "title": "Where it goes",
        "paragraphs": [
          "A frequency adverb usually comes before a main verb. “She often reads.” “I often read.”",
          "After be, it usually comes after the verb. “She is often cheerful.” “Asha is often happy.”"
        ],
        "examples": []
      },
      {
        "title": "Look at worked examples",
        "paragraphs": [],
        "examples": [
          "“Kabir writes neatly.” Neatly answers how.",
          "“We will meet tomorrow.” Tomorrow answers when.",
          "“The bag is too heavy.” Too tells us that the heaviness is more than wanted or suitable."
        ]
      },
      {
        "title": "Remember",
        "paragraphs": [
          "Adverbs can tell us more about verbs, adjectives, or other adverbs. Look at their job, not just their ending."
        ],
        "examples": []
      }
    ],
    "tasks": [
      {
        "id": "G1",
        "phase": "guided",
        "kind": "response",
        "prompt": "What question does quietly answer in “Tara walks quietly”: how or when?",
        "explanation": "How. Quietly tells us the manner of walking."
      },
      {
        "id": "G2",
        "phase": "guided",
        "kind": "response",
        "prompt": "Put often into “Asha is happy” in its usual position.",
        "explanation": "Asha is often happy. Often usually comes after the main verb is."
      },
      {
        "id": "Q1",
        "phase": "quiz",
        "kind": "response",
        "prompt": "In “We will meet tomorrow”, which word tells when?",
        "explanation": "Tomorrow. It is an adverb of time."
      },
      {
        "id": "Q2",
        "phase": "quiz",
        "kind": "choice",
        "prompt": "Which word tells how often?",
        "explanation": "Sometimes tells us frequency.",
        "options": [
          "Outside.",
          "Gently.",
          "Sometimes."
        ],
        "answer": 2
      },
      {
        "id": "Q3",
        "phase": "quiz",
        "kind": "response",
        "prompt": "In “The tea is very hot”, which word does very give more information about?",
        "explanation": "Hot. Very adds degree to the adjective hot."
      },
      {
        "id": "Q4",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Must an adverb end in ly? Give an example.",
        "explanation": "No. Fast, well, here, soon, and often are examples of adverbs without ly."
      },
      {
        "id": "Q5",
        "phase": "quiz",
        "kind": "choice",
        "prompt": "Choose the usual order.",
        "explanation": "Often usually comes before the main verb read in this simple pattern.",
        "options": [
          "I often read.",
          "I read often the book.",
          "Often I the book read."
        ],
        "answer": 0
      },
      {
        "id": "W1",
        "phase": "write",
        "kind": "response",
        "prompt": "Write one sentence with an adverb telling how and another with an adverb telling when or how often.",
        "explanation": "Sample: “Sana draws carefully.” “She draws daily.” Check the job of each chosen word in its sentence."
      }
    ],
    "visualGuide": {
      "title": "Ask what the adverb tells you",
      "rows": [
        {
          "label": "How?",
          "parts": [
            {
              "text": "speaks softly",
              "label": "Softly = manner"
            }
          ],
          "note": ""
        },
        {
          "label": "When and where?",
          "parts": [
            {
              "text": "arrived yesterday",
              "label": "Yesterday = time"
            },
            {
              "text": "waits outside",
              "label": "Outside = place"
            }
          ],
          "note": ""
        },
        {
          "label": "How often?",
          "parts": [
            {
              "text": "often reads",
              "label": "Before main verb"
            },
            {
              "text": "is often happy",
              "label": "After main verb be"
            }
          ],
          "note": ""
        },
        {
          "label": "How much?",
          "parts": [
            {
              "text": "very cold",
              "label": "Very modifies cold"
            }
          ],
          "note": ""
        }
      ],
      "check": {
        "prompt": "In “quite slowly”, does quite tell more about a noun or an adverb?",
        "answer": "An adverb. Quite tells more about slowly."
      }
    }
  },
  {
    "id": "BEG-21",
    "title": "Adjective or adverb",
    "kind": "concept",
    "sections": [
      {
        "title": "What you will learn",
        "paragraphs": [
          "You will choose an adjective for a noun, or an adverb for an action."
        ],
        "examples": []
      },
      {
        "title": "Adjective",
        "paragraphs": [
          "An adjective describes a noun. “A careful painter.” Careful describes the painter. “It is a quiet room.” Quiet describes room.",
          "“Riya has neat handwriting.” Neat describes handwriting."
        ],
        "examples": []
      },
      {
        "title": "Adverb",
        "paragraphs": [
          "An adverb can tell how an action happens. “Paints carefully.” Carefully describes the painting. “We speak quietly.”",
          "“Riya writes neatly.” Neatly tells how she writes. Many adjectives add ly: slow, slowly; happy, happily."
        ],
        "examples": []
      },
      {
        "title": "After a linking verb",
        "paragraphs": [
          "When describing the subject after a linking verb in these examples, choose an adjective. “The soup smells good.” Good describes the soup. “The fruit tastes sweet.” “Aman looks tired.”",
          "“Aman looks carefully at the map” is different. Looks is an action, and carefully tells how."
        ],
        "examples": []
      },
      {
        "title": "Special forms",
        "paragraphs": [
          "Good usually becomes well for an action. A good singer. Sings well.",
          "Fast and hard can be adjectives or adverbs. A fast runner. Runs fast. Do not write fastly. Hard work. Works hard. Hardly means almost not. “I can hardly hear.”"
        ],
        "examples": []
      },
      {
        "title": "Look at worked examples",
        "paragraphs": [],
        "examples": [
          "“It is a quiet room.” Quiet describes room. “We speak quietly.” Quietly describes speak.",
          "“The mango tastes sweet.” Sweet describes mango after a linking verb.",
          "Needs correction: “She is a carefully driver.” Corrected: “She is a careful driver.” Use an adjective before driver."
        ]
      },
      {
        "title": "Remember",
        "paragraphs": [
          "Ask what the word describes. Use an adjective for a noun or after a linking verb; use an adverb when you are describing how an action happens."
        ],
        "examples": []
      }
    ],
    "tasks": [
      {
        "id": "G1",
        "phase": "guided",
        "kind": "response",
        "prompt": "Choose careful or carefully: “Please carry the glass ___.”",
        "explanation": "Carefully. It tells us how to carry the glass."
      },
      {
        "id": "G2",
        "phase": "guided",
        "kind": "response",
        "prompt": "Choose good or well: “Dev plays chess ___.”",
        "explanation": "Well. It describes how Dev plays."
      },
      {
        "id": "Q1",
        "phase": "quiz",
        "kind": "choice",
        "prompt": "Complete “It is a ___ song.”",
        "explanation": "Beautiful is an adjective describing the noun song.",
        "options": [
          "Beautifully.",
          "Beautiful.",
          "Beauty."
        ],
        "answer": 1
      },
      {
        "id": "Q2",
        "phase": "quiz",
        "kind": "choice",
        "prompt": "Complete “She sings ___.”",
        "explanation": "Beautifully tells us how she sings.",
        "options": [
          "Beautifully.",
          "Beautiful.",
          "Beauty."
        ],
        "answer": 0
      },
      {
        "id": "Q3",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Choose sweet or sweetly: “The fruit tastes ___.”",
        "explanation": "Sweet. It describes the fruit after the linking verb tastes."
      },
      {
        "id": "Q4",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Correct “The horse runs fastly.”",
        "explanation": "The horse runs fast. Fast is already an adverb in this use."
      },
      {
        "id": "Q5",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Do “works hard” and “hardly works” mean the same thing?",
        "explanation": "No. Works hard means works with effort. Hardly works means does very little work."
      },
      {
        "id": "W1",
        "phase": "write",
        "kind": "response",
        "prompt": "Use careful and carefully in two different sentences.",
        "explanation": "Sample: “Asha is a careful reader.” “Asha reads carefully.” Check that careful describes a noun or subject, and carefully describes an action."
      }
    ],
    "visualGuide": {
      "title": "Follow the word being described",
      "rows": [
        {
          "label": "Describe a noun",
          "parts": [
            {
              "text": "a careful",
              "label": "Adjective"
            },
            {
              "text": "reader",
              "label": "Noun"
            }
          ],
          "note": ""
        },
        {
          "label": "Describe an action",
          "parts": [
            {
              "text": "reads",
              "label": "Action"
            },
            {
              "text": "carefully",
              "label": "Adverb"
            }
          ],
          "note": ""
        },
        {
          "label": "Describe the subject",
          "parts": [
            {
              "text": "The mango tastes",
              "label": "Linking verb"
            },
            {
              "text": "sweet.",
              "label": "Adjective describing mango"
            }
          ],
          "note": ""
        }
      ],
      "check": {
        "prompt": "Why do we say “runs fast”, not “runs fastly”?",
        "answer": "Fast already works as an adverb. Not every adverb needs ly."
      }
    }
  },
  {
    "id": "BEG-22",
    "title": "Articles a an and the",
    "kind": "concept",
    "sections": [
      {
        "title": "What you will learn",
        "paragraphs": [
          "You will choose a, an, the, or no article. These words help show which thing you mean."
        ],
        "examples": []
      },
      {
        "title": "A",
        "paragraphs": [
          "Use a with a singular countable noun when the next word starts with a consonant sound. A pencil. A cat. A red apple.",
          "Listen to the next sound, not only the first letter. A uniform begins with a y sound, like you. A new umbrella uses a because new starts with a consonant sound."
        ],
        "examples": []
      },
      {
        "title": "An",
        "paragraphs": [
          "Use an with a singular countable noun when the next word starts with a vowel sound. An apple. An empty box. An umbrella.",
          "An hour uses an because the h is silent. An old book uses an because old starts with a vowel sound."
        ],
        "examples": []
      },
      {
        "title": "The",
        "paragraphs": [
          "Use the when the reader can tell which one you mean. “I found a pencil. The pencil is blue.”",
          "The also fits when the situation identifies it. “Please close the door.” “The book on my desk.” The can go with one thing, many things, or an amount: the cup, the cups, the water."
        ],
        "examples": []
      },
      {
        "title": "No article",
        "paragraphs": [
          "When you speak generally, a plural or an uncountable noun often has no article. “Birds need water.”",
          "Do not write “a birds” or “a water” for that general meaning. Say a glass of milk, not a milk."
        ],
        "examples": []
      },
      {
        "title": "Look at worked examples",
        "paragraphs": [],
        "examples": [
          "“Rohan has an umbrella.” Umbrella starts with a vowel sound.",
          "“Rohan has a new umbrella.” New starts with a consonant sound, so a fits.",
          "“I bought a mango. The mango was sweet.” First introduce one mango, then refer to that mango."
        ]
      },
      {
        "title": "Remember",
        "paragraphs": [
          "Choose a or an by sound. Use the for something the reader can identify. Some general nouns need no article."
        ],
        "examples": []
      }
    ],
    "tasks": [
      {
        "id": "G1",
        "phase": "guided",
        "kind": "response",
        "prompt": "Choose a or an: “___ empty box”. Listen to empty.",
        "explanation": "An empty box. Empty begins with a vowel sound."
      },
      {
        "id": "G2",
        "phase": "guided",
        "kind": "response",
        "prompt": "Complete “I saw a puppy. ___ puppy followed me.”",
        "explanation": "The puppy followed me. The reader can identify the puppy already mentioned."
      },
      {
        "id": "Q1",
        "phase": "quiz",
        "kind": "choice",
        "prompt": "Choose the correct phrase.",
        "explanation": "Umbrella starts with a vowel sound. Red starts with a consonant sound, so the third phrase would need a.",
        "options": [
          "A umbrella.",
          "An umbrella.",
          "An red umbrella."
        ],
        "answer": 1
      },
      {
        "id": "Q2",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Choose a or an: “___ uniform”.",
        "explanation": "A uniform. Uniform begins with a consonant y sound."
      },
      {
        "id": "Q3",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Choose a or an: “___ hour”.",
        "explanation": "An hour. The h is silent, so the word begins with a vowel sound."
      },
      {
        "id": "Q4",
        "phase": "quiz",
        "kind": "choice",
        "prompt": "Complete “Please pass me ___ bowl beside you” when there is one bowl beside the listener.",
        "explanation": "The phrase beside you identifies which bowl is meant.",
        "options": [
          "An.",
          "No article.",
          "The."
        ],
        "answer": 2
      },
      {
        "id": "Q5",
        "phase": "quiz",
        "kind": "choice",
        "prompt": "Choose the general statement.",
        "explanation": "General plural birds and uncountable water need no article in this sentence.",
        "options": [
          "Birds need water.",
          "A birds need a water.",
          "An birds need water."
        ],
        "answer": 0
      },
      {
        "id": "W1",
        "phase": "write",
        "kind": "response",
        "prompt": "Introduce one object using a or an. Refer to the same object with the in your next sentence.",
        "explanation": "Sample: “I found a shell. The shell is white.” Check a or an by sound and the for the already identified object."
      }
    ],
    "visualGuide": {
      "title": "Listen first then choose",
      "rows": [
        {
          "label": "Consonant sound",
          "parts": [
            {
              "text": "a",
              "label": "Article"
            },
            {
              "text": "uniform",
              "label": "Starts with a y sound"
            }
          ],
          "note": ""
        },
        {
          "label": "Vowel sound",
          "parts": [
            {
              "text": "an",
              "label": "Article"
            },
            {
              "text": "hour",
              "label": "Silent h"
            }
          ],
          "note": ""
        },
        {
          "label": "First mention then known object",
          "parts": [
            {
              "text": "I found a shell.",
              "label": "Introduce one"
            },
            {
              "text": "The shell is white.",
              "label": "The same shell"
            }
          ],
          "note": ""
        }
      ],
      "check": {
        "prompt": "Choose a or an before new umbrella.",
        "answer": "A new umbrella. Listen to the next word, new, not only to umbrella."
      }
    }
  },
  {
    "id": "BEG-23",
    "title": "Determiners and quantifiers",
    "kind": "concept",
    "sections": [
      {
        "title": "What you will learn",
        "paragraphs": [
          "You will use words that point, show whose, or tell how many."
        ],
        "examples": []
      },
      {
        "title": "This, that, these, those",
        "paragraphs": [
          "This and that go with one thing. This cup. That cup. These and those go with more than one. These cups. Those books.",
          "This and these are often near. That and those are often farther away. “Those books on that far shelf.”"
        ],
        "examples": []
      },
      {
        "title": "My, your, our",
        "paragraphs": [
          "My, your, his, her, its, our, and their come before a noun. Our classroom. Her pencil.",
          "Say my bag, not the my bag. The possessive word takes the place of a or the."
        ],
        "examples": []
      },
      {
        "title": "Many, much, a few, a little",
        "paragraphs": [
          "Many and a few go with plural countable nouns. Many books. A few apples. Much and a little go with uncountable nouns. Much water. A little milk."
        ],
        "examples": []
      },
      {
        "title": "Some and any",
        "paragraphs": [
          "Some is common in positive sentences and in offers. “I have some paper.” “Would you like some fruit?” Any is common in negatives and questions. “I do not have any paper.” “Do you have any paper?”"
        ],
        "examples": []
      },
      {
        "title": "A few and few",
        "paragraphs": [
          "A few means a small number you do have. “We have a few pencils.” Few, without a, stresses that there are not many. “We have few pencils, so we need more.”"
        ],
        "examples": []
      },
      {
        "title": "Each and every",
        "paragraphs": [
          "Each and every go with one countable noun. Each child. Every day. “Every child has a pencil”, not “every children”.",
          "A number matches the noun too. One pencil. Three pencils."
        ],
        "examples": []
      },
      {
        "title": "Look at worked examples",
        "paragraphs": [],
        "examples": [
          "“This mango is ripe. These mangoes are ripe.” This changes to these for the plural.",
          "“Our teacher has a little chalk.” Our shows whose; a little gives an amount of uncountable chalk.",
          "Needs correction: “Much students are here.” Corrected: “Many students are here.” Students is plural and countable."
        ]
      },
      {
        "title": "Remember",
        "paragraphs": [
          "Determiners help show which noun we mean. Quantifiers show amount or number. Match them to the noun’s use."
        ],
        "examples": []
      }
    ],
    "tasks": [
      {
        "id": "G1",
        "phase": "guided",
        "kind": "response",
        "prompt": "Choose this or these: “___ shoes are new.”",
        "explanation": "These. Shoes is plural."
      },
      {
        "id": "G2",
        "phase": "guided",
        "kind": "response",
        "prompt": "Choose a few or a little: “Please add ___ milk.”",
        "explanation": "A little. Milk is uncountable in this use."
      },
      {
        "id": "Q1",
        "phase": "quiz",
        "kind": "choice",
        "prompt": "Complete “___ books on that far shelf are mine.”",
        "explanation": "Those fits plural books and the distant location.",
        "options": [
          "That.",
          "This.",
          "Those."
        ],
        "answer": 2
      },
      {
        "id": "Q2",
        "phase": "quiz",
        "kind": "choice",
        "prompt": "Choose the usual phrase.",
        "explanation": "A possessive determiner normally replaces the article in this noun group.",
        "options": [
          "My bag.",
          "The my bag.",
          "A my bag."
        ],
        "answer": 0
      },
      {
        "id": "Q3",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Complete “How ___ chairs do we need?”",
        "explanation": "Many. Chairs is a plural countable noun."
      },
      {
        "id": "Q4",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Correct “Every children has a pencil.”",
        "explanation": "Every child has a pencil. Every takes a singular noun in this pattern."
      },
      {
        "id": "Q5",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Can we use some in “Would you like some fruit?”",
        "explanation": "Yes. Some is common in offers, even though the sentence is a question."
      },
      {
        "id": "W1",
        "phase": "write",
        "kind": "response",
        "prompt": "Write a sentence with these or those. Then write one with a few or a little.",
        "explanation": "Sample: “These flowers are fresh.” “We have a little water.” Check plural agreement after these or those and countability after the quantifier."
      }
    ],
    "visualGuide": {
      "title": "Match number amount and distance",
      "rows": [
        {
          "label": "Count separate items",
          "parts": [
            {
              "text": "many / a few",
              "label": "Number"
            },
            {
              "text": "books",
              "label": "Plural countable"
            }
          ],
          "note": ""
        },
        {
          "label": "Measure an amount",
          "parts": [
            {
              "text": "much / a little",
              "label": "Amount"
            },
            {
              "text": "water",
              "label": "Uncountable here"
            }
          ],
          "note": ""
        },
        {
          "label": "Near",
          "parts": [
            {
              "text": "this cup",
              "label": "One"
            },
            {
              "text": "these cups",
              "label": "More than one"
            }
          ],
          "note": ""
        },
        {
          "label": "Farther away",
          "parts": [
            {
              "text": "that cup",
              "label": "One"
            },
            {
              "text": "those cups",
              "label": "More than one"
            }
          ],
          "note": ""
        }
      ],
      "check": {
        "prompt": "Complete “Every ___ has a pencil”: child or children?",
        "answer": "Child. Each and every go with a singular countable noun in this pattern."
      }
    }
  },
  {
    "id": "BEG-24",
    "title": "Correct use of prepositions",
    "kind": "concept",
    "sections": [
      {
        "title": "What you will learn",
        "paragraphs": [
          "You will use common prepositions for place, time, and movement."
        ],
        "examples": []
      },
      {
        "title": "In, on, and at for place",
        "paragraphs": [
          "In often means inside. In the box. In the room. On often means touching a surface. On the table. On the shelf.",
          "At can mark a point. At the gate. At the bus stop. “The pencils are in the box” means they are inside it."
        ],
        "examples": []
      },
      {
        "title": "Other places",
        "paragraphs": [
          "Under, above, behind, beside, between, and in front of also show place.",
          "“The bag is beside the chair.” It is next to the chair. “Riya sits between Asha and Dev.” She is in the middle of those two people."
        ],
        "examples": []
      },
      {
        "title": "Time",
        "paragraphs": [
          "Use at with a clock time. At five o’clock. At nine. Use on with a day or a date. On Monday. On Friday. On 15 August.",
          "Use in with a month, a year, or a part of the day. In July. In the morning. Remember the phrase at night."
        ],
        "examples": []
      },
      {
        "title": "Next, last, and every",
        "paragraphs": [
          "Do not add a preposition before next, last, or every. Next Monday. Last week. Every morning.",
          "“I will visit next Monday”, not “on next Monday”."
        ],
        "examples": []
      },
      {
        "title": "Movement",
        "paragraphs": [
          "To, into, and across show movement. “We walk to school.” “The cat jumps into the box.”",
          "“The cat is in the box” only tells where it is now. Into shows the movement. In shows the place."
        ],
        "examples": []
      },
      {
        "title": "Partner words",
        "paragraphs": [
          "Some words keep a partner. Good at drawing. Listen to the teacher. Wait for a friend.",
          "Learn each pair as a phrase. Good at is not a movement word."
        ],
        "examples": []
      },
      {
        "title": "Look at worked examples",
        "paragraphs": [],
        "examples": [
          "“The cup is on the shelf.” On shows contact with the shelf’s surface.",
          "“We meet at four on Friday.” At goes with the time; on goes with the day.",
          "“Please listen to the teacher.” To belongs with listen in this pattern."
        ]
      },
      {
        "title": "Remember",
        "paragraphs": [
          "Use prepositions in meaningful phrases. In, on, and at have useful patterns, but some expressions must be learned together."
        ],
        "examples": []
      }
    ],
    "tasks": [
      {
        "id": "G1",
        "phase": "guided",
        "kind": "response",
        "prompt": "Choose in, on, or at: “The pencils are ___ the box.” They are inside it.",
        "explanation": "In. The pencils are inside the box."
      },
      {
        "id": "G2",
        "phase": "guided",
        "kind": "response",
        "prompt": "Complete “Our class starts ___ nine o’clock ___ Tuesday.”",
        "explanation": "At nine o’clock on Tuesday. Use at for the clock time and on for the day."
      },
      {
        "id": "Q1",
        "phase": "quiz",
        "kind": "choice",
        "prompt": "Complete “My birthday is ___ July.”",
        "explanation": "Use in with a month.",
        "options": [
          "In.",
          "On.",
          "At."
        ],
        "answer": 0
      },
      {
        "id": "Q2",
        "phase": "quiz",
        "kind": "response",
        "prompt": "A book rests on the surface of a desk. Complete “The book is ___ the desk.”",
        "explanation": "On. It is supported by the desk’s surface."
      },
      {
        "id": "Q3",
        "phase": "quiz",
        "kind": "choice",
        "prompt": "Choose the movement sentence.",
        "explanation": "Into shows movement from outside to inside.",
        "options": [
          "The cat is into the box.",
          "The cat jumps into the box.",
          "The cat sleeps into the box."
        ],
        "answer": 1
      },
      {
        "id": "Q4",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Correct “We will play on next Sunday.”",
        "explanation": "We will play next Sunday. Do not normally use on before next Sunday."
      },
      {
        "id": "Q5",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Complete “Sana is good ___ drawing.”",
        "explanation": "At. Good at is the usual word partnership for a skill."
      },
      {
        "id": "W1",
        "phase": "write",
        "kind": "response",
        "prompt": "Write one sentence about where an object is and one about when you do an activity.",
        "explanation": "Sample: “My shoes are under the bed.” “I read at seven in the evening.” Check that the prepositions match the intended place and time."
      }
    ],
    "visual": "place",
    "visualGuide": {
      "title": "Choose a time phrase",
      "rows": [
        {
          "label": "Clock time",
          "parts": [
            {
              "text": "at",
              "label": "Preposition"
            },
            {
              "text": "nine o’clock",
              "label": "Exact time"
            }
          ],
          "note": ""
        },
        {
          "label": "Day or date",
          "parts": [
            {
              "text": "on",
              "label": "Preposition"
            },
            {
              "text": "Tuesday / 15 August",
              "label": "Day or date"
            }
          ],
          "note": ""
        },
        {
          "label": "Month year or part of day",
          "parts": [
            {
              "text": "in",
              "label": "Preposition"
            },
            {
              "text": "July / 2026 / the morning",
              "label": "Longer time period"
            }
          ],
          "note": ""
        },
        {
          "label": "Useful exceptions",
          "parts": [
            {
              "text": "at night",
              "label": "Learn the phrase"
            },
            {
              "text": "next Monday",
              "label": "No on"
            }
          ],
          "note": ""
        }
      ],
      "check": {
        "prompt": "Complete “We meet ___ six ___ Friday.”",
        "answer": "At six on Friday. At for the clock time, on for the day."
      },
      "afterSection": "Time"
    }
  },
  {
    "id": "BEG-25",
    "title": "Capitalisation",
    "kind": "concept",
    "sections": [
      {
        "title": "What you will learn",
        "paragraphs": [
          "You will use capital letters at the start of a sentence and in particular names."
        ],
        "examples": []
      },
      {
        "title": "Sentence beginnings and I",
        "paragraphs": [
          "Begin a sentence with a capital letter. Always write the pronoun I as a capital too. “Riya and I are ready.”",
          "Check both positions: Riya starts the sentence and names a person. I stays capital even inside the sentence."
        ],
        "examples": []
      },
      {
        "title": "People and places",
        "paragraphs": [
          "Begin people’s names with capitals. Asha, Kabir, Aman, Neha. Begin place names with capitals. India, Chennai, Pune, Mumbai, Kochi.",
          "A name with several main words may need more than one capital. New Delhi."
        ],
        "examples": []
      },
      {
        "title": "Days, months, and languages",
        "paragraphs": [
          "Days and months begin with capitals. Monday, Tuesday, June, January. Languages and nationalities do too. English, Hindi, Tamil, Indian.",
          "Named festivals such as Diwali and Eid also begin with capitals. “Aman visits Chennai in June.”"
        ],
        "examples": []
      },
      {
        "title": "Ordinary words",
        "paragraphs": [
          "School, pencil, river, park, friend, and blue stay lower case inside a sentence. “We went to a park on Sunday.” Sunday is a name. Park is not.",
          "Seasons usually stay lower case: “summer”, “winter”. “My mother is here” uses mother as a common noun. “Thank you, Amma” uses Amma as a name."
        ],
        "examples": []
      },
      {
        "title": "Look at worked examples",
        "paragraphs": [],
        "examples": [
          "Needs correction: “riya and i live in pune.” Corrected: “Riya and I live in Pune.”",
          "“We study English on Monday.” English is a language and Monday is a day.",
          "“My blue bag is on the chair.” Blue, bag, and chair do not need capitals here."
        ]
      },
      {
        "title": "Remember",
        "paragraphs": [
          "Start sentences and particular names with capitals. Always write I as a capital. Most ordinary nouns stay lower case."
        ],
        "examples": []
      }
    ],
    "tasks": [
      {
        "id": "G1",
        "phase": "guided",
        "kind": "response",
        "prompt": "Correct the capitals: “aman visits chennai in june.”",
        "explanation": "Aman visits Chennai in June. Capitalise the person, place, and month."
      },
      {
        "id": "G2",
        "phase": "guided",
        "kind": "response",
        "prompt": "Which needs a capital inside a sentence: “winter” or “Tuesday”?",
        "explanation": "Tuesday. Days are proper names. Winter normally stays lower case."
      },
      {
        "id": "Q1",
        "phase": "quiz",
        "kind": "choice",
        "prompt": "Choose the correctly written sentence.",
        "explanation": "The sentence starts with My and the name Neha has a capital. Friend is a common noun.",
        "options": [
          "my friend is Neha.",
          "My Friend is neha.",
          "My friend is Neha."
        ],
        "answer": 2
      },
      {
        "id": "Q2",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Correct “Ravi and i speak hindi.”",
        "explanation": "Ravi and I speak Hindi. I is always capital, and Hindi is a language name."
      },
      {
        "id": "Q3",
        "phase": "quiz",
        "kind": "choice",
        "prompt": "Which word normally needs a capital inside a sentence?",
        "explanation": "August names a month. Garden and pencil are usually common nouns.",
        "options": [
          "August.",
          "Garden.",
          "Pencil."
        ],
        "answer": 0
      },
      {
        "id": "Q4",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Correct “we will meet on friday.”",
        "explanation": "We will meet on Friday. Capitalise the sentence beginning and the day."
      },
      {
        "id": "Q5",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Does red need a capital in “I have a red pen”?",
        "explanation": "No. Red is an ordinary colour word here, not the beginning of a sentence or a proper name."
      },
      {
        "id": "W1",
        "phase": "write",
        "kind": "response",
        "prompt": "Write two sentences using a person’s name, a place, a day, and I. Check the capitals.",
        "explanation": "Sample: “Asha and I live in Kochi. We visit the library on Saturday.” You can use different accurate names and details."
      }
    ],
    "visualGuide": {
      "title": "Find the letters that need capitals",
      "rows": [
        {
          "label": "Before checking",
          "parts": [
            {
              "text": "riya and i visit pune on monday.",
              "label": "Needs capitals"
            }
          ],
          "note": ""
        },
        {
          "label": "After checking",
          "parts": [
            {
              "text": "Riya",
              "label": "Name and sentence start"
            },
            {
              "text": "and I",
              "label": "Pronoun I"
            },
            {
              "text": "visit Pune",
              "label": "Place"
            },
            {
              "text": "on Monday.",
              "label": "Day"
            }
          ],
          "note": ""
        }
      ],
      "check": {
        "prompt": "Does blue need a capital in “My blue bag is here”?",
        "answer": "No. It is an ordinary colour word inside the sentence."
      }
    }
  },
  {
    "id": "BEG-26",
    "title": "Punctuation",
    "kind": "concept",
    "sections": [
      {
        "title": "What you will learn",
        "paragraphs": [
          "You will meet the marks that show endings, lists, names you speak to, and exact words."
        ],
        "examples": []
      },
      {
        "title": "Full stop",
        "paragraphs": [
          "A full stop ends a statement. “The shop is open.”",
          "One mark is enough. Do not add a second mark after it."
        ],
        "examples": []
      },
      {
        "title": "Question mark",
        "paragraphs": [
          "A question mark ends a direct question. “Is the shop open?” “Did you finish your work?”",
          "If the sentence asks, use this mark, not a full stop."
        ],
        "examples": []
      },
      {
        "title": "Exclamation mark",
        "paragraphs": [
          "An exclamation mark shows a strong feeling or a forceful instruction. “What a lovely surprise!” “Stop!”",
          "It is for strength, not for every sentence."
        ],
        "examples": []
      },
      {
        "title": "Comma",
        "paragraphs": [
          "A comma can separate items in a list. “I packed a pen, a ruler and a book.” A comma before and is also fine if you keep one style."
        ],
        "examples": []
      },
      {
        "title": "Commas with names and openings",
        "paragraphs": [
          "Use a comma when you speak to someone. “Ravi, please sit here.” “Thank you, Asha.”",
          "Do not split a subject from its verb. “Asha is my friend”, not “Asha, is my friend”."
        ],
        "examples": []
      },
      {
        "title": "An opening clause",
        "paragraphs": [
          "A comma can follow a clause that opens the sentence. “When the bell rang, we left.”",
          "If the main idea comes first, a comma is often unnecessary. “We left when the bell rang.”"
        ],
        "examples": []
      },
      {
        "title": "Quotation marks",
        "paragraphs": [
          "Quotation marks show the exact words spoken. Riya said, “I am ready.” Rohan said, “I am tired.”",
          "In this pattern, put a comma after said and before the speech. For this course, the full stop of the spoken sentence stays inside the closing marks."
        ],
        "examples": []
      },
      {
        "title": "Two sentences",
        "paragraphs": [
          "A comma alone cannot join two complete sentences. “The bell rang, we left” needs a full stop or a joining word.",
          "“The bell rang. We left.” “The bell rang, so we left.” An apostrophe is for possession or a contraction, not for ending a statement."
        ],
        "examples": []
      },
      {
        "title": "Look at worked examples",
        "paragraphs": [],
        "examples": [
          "“Where is my notebook?” The question mark fits a direct question.",
          "“Please help me, Sana.” The comma separates the name of the person being addressed.",
          "Dev said, “The bus is here.” Quotation marks enclose Dev’s exact words."
        ]
      },
      {
        "title": "Remember",
        "paragraphs": [
          "Choose punctuation for the sentence’s meaning and structure. Do not insert a comma at every place you might pause."
        ],
        "examples": []
      }
    ],
    "tasks": [
      {
        "id": "G1",
        "phase": "guided",
        "kind": "response",
        "prompt": "Add a comma to show that you are speaking to Meera: “Meera please open the window.”",
        "explanation": "Meera, please open the window. The comma separates the name used to address Meera."
      },
      {
        "id": "G2",
        "phase": "guided",
        "kind": "response",
        "prompt": "Add marks to the list: “I bought apples bananas and oranges.”",
        "explanation": "I bought apples, bananas and oranges. A comma before and is also acceptable."
      },
      {
        "id": "Q1",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Add the ending mark: “Did you finish your work”.",
        "explanation": "Did you finish your work? It is a direct question."
      },
      {
        "id": "Q2",
        "phase": "quiz",
        "kind": "choice",
        "prompt": "Which uses a comma for direct address?",
        "explanation": "The speaker is thanking Asha directly. Do not normally split a subject from its verb with a comma.",
        "options": [
          "The, girl is here.",
          "Thank you, Asha.",
          "Asha, is my friend."
        ],
        "answer": 1
      },
      {
        "id": "Q3",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Punctuate the exact speech: Rohan said I am tired.",
        "explanation": "Rohan said, “I am tired.” Add a comma before the speech and quotation marks around the exact words."
      },
      {
        "id": "Q4",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Is a comma alone enough in “The bell rang, we left” when these are two complete clauses?",
        "explanation": "No. Use “The bell rang. We left.” or “The bell rang, so we left.” Other suitable joins are possible."
      },
      {
        "id": "Q5",
        "phase": "quiz",
        "kind": "choice",
        "prompt": "Which mark usually ends a simple statement?",
        "explanation": "A statement such as “The gate is open” normally ends with a full stop.",
        "options": [
          "Full stop.",
          "Question mark.",
          "Apostrophe."
        ],
        "answer": 0
      },
      {
        "id": "W1",
        "phase": "write",
        "kind": "response",
        "prompt": "Write a short note with a statement, a question, and a sentence speaking directly to a named person.",
        "explanation": "Sample: “The game starts soon. Are you ready? Asha, please bring the ball.” Check the endings and the comma after the name."
      }
    ],
    "visualGuide": {
      "title": "Let the mark show the job",
      "rows": [
        {
          "label": "Statement",
          "parts": [
            {
              "text": "The door is open",
              "label": ". Full stop"
            }
          ],
          "note": ""
        },
        {
          "label": "Question",
          "parts": [
            {
              "text": "Is the door open",
              "label": "? Question mark"
            }
          ],
          "note": ""
        },
        {
          "label": "Strong feeling",
          "parts": [
            {
              "text": "What a surprise",
              "label": "! Exclamation mark"
            }
          ],
          "note": ""
        },
        {
          "label": "Exact words",
          "parts": [
            {
              "text": "Riya said,",
              "label": "Reporting words and comma"
            },
            {
              "text": "“I am ready.”",
              "label": "Speech inside quotation marks"
            }
          ],
          "note": ""
        }
      ],
      "check": {
        "prompt": "Add one comma: “Thank you Asha.”",
        "answer": "Thank you, Asha. The comma separates the name of the person being addressed."
      }
    }
  },
  {
    "id": "BEG-27",
    "title": "Sentence fragments",
    "kind": "concept",
    "sections": [
      {
        "title": "What you will learn",
        "paragraphs": [
          "You will find an unfinished group and complete it for ordinary school writing."
        ],
        "examples": []
      },
      {
        "title": "Missing the predicate",
        "paragraphs": [
          "“The small kitten.” names an animal but says nothing about it. Add a predicate. “The small kitten sleeps.”",
          "“The old tree” needs the same help. “The old tree gives us shade.” “My favourite game is chess.”"
        ],
        "examples": []
      },
      {
        "title": "Missing the subject",
        "paragraphs": [
          "“Walked to the shop.” has an action but no subject. Add who did it. “Ravi walked to the shop.”",
          "“Bought a new notebook” becomes “I bought a new notebook.”"
        ],
        "examples": []
      },
      {
        "title": "Missing a complete verb",
        "paragraphs": [
          "“Neha playing outside.” needs a verb that finishes the sentence. “Neha is playing outside.”",
          "“The children running” becomes “The children are running.” “Asha is reading a story.”"
        ],
        "examples": []
      },
      {
        "title": "A hanging because, when, or if",
        "paragraphs": [
          "“Because I was tired.” has a subject and a verb, and still waits for the main idea. “I went to bed because I was tired.”",
          "“When the class ended, we packed our bags.” “Because the rain stopped” is not a complete telling sentence by itself. “The rain stopped” is."
        ],
        "examples": []
      },
      {
        "title": "Commands are complete",
        "paragraphs": [
          "“Come here.” and “Close the door.” are complete. The listener, you, is understood.",
          "A short answer or a heading can be useful. “At the park.” These exercises ask for complete sentences in a paragraph."
        ],
        "examples": []
      },
      {
        "title": "Look at worked examples",
        "paragraphs": [],
        "examples": [
          "Fragment in a paragraph: “My favourite game.” Complete: “My favourite game is chess.”",
          "Fragment: “Because it was hot.” Complete: “We stayed inside because it was hot.”",
          "Complete command: “Please wait.” The subject is understood."
        ]
      },
      {
        "title": "Remember",
        "paragraphs": [
          "A subject and some words are not always enough. Check for a complete verb group and a complete thought. Commands and short answers have their own uses."
        ],
        "examples": []
      }
    ],
    "tasks": [
      {
        "id": "G1",
        "phase": "guided",
        "kind": "response",
        "prompt": "Complete “The old tree” by saying something about it.",
        "explanation": "Sample: “The old tree gives us shade.” You can use a suitable complete predicate."
      },
      {
        "id": "G2",
        "phase": "guided",
        "kind": "response",
        "prompt": "Repair “Asha reading a story” as an action happening now.",
        "explanation": "Asha is reading a story. Is completes the verb group is reading."
      },
      {
        "id": "Q1",
        "phase": "quiz",
        "kind": "choice",
        "prompt": "Which is complete?",
        "explanation": "It gives a complete thought. The other two need more information to work as ordinary telling sentences.",
        "options": [
          "Because the rain stopped.",
          "The red bicycle.",
          "The rain stopped."
        ],
        "answer": 2
      },
      {
        "id": "Q2",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Complete “When the class ended, ___”.",
        "explanation": "Sample: “When the class ended, we packed our bags.” Add a complete main clause."
      },
      {
        "id": "Q3",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Is “Close the door” a fragment because you is not written?",
        "explanation": "No. It is a complete command with an understood subject you."
      },
      {
        "id": "Q4",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Repair “The children running” as an action happening now.",
        "explanation": "The children are running. Are completes the verb group."
      },
      {
        "id": "Q5",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Add a subject to “Bought a new notebook” to make a telling sentence.",
        "explanation": "Sample: “I bought a new notebook.” You can use any subject that fits the sentence."
      },
      {
        "id": "W1",
        "phase": "write",
        "kind": "response",
        "prompt": "Complete both groups in different ways: “My best friend…” and “Because I was hungry, …”.",
        "explanation": "Sample: “My best friend lives nearby.” “Because I was hungry, I ate a banana.” Check a full predicate in the first and a main clause in the second."
      }
    ],
    "visualGuide": {
      "title": "Add the missing part",
      "rows": [
        {
          "label": "Missing subject",
          "parts": [
            {
              "text": "Walked home.",
              "label": "Who walked?"
            },
            {
              "text": "Riya walked home.",
              "label": "Add Riya"
            }
          ],
          "note": ""
        },
        {
          "label": "Missing helper",
          "parts": [
            {
              "text": "Neha playing.",
              "label": "Verb is unfinished"
            },
            {
              "text": "Neha is playing.",
              "label": "Add is"
            }
          ],
          "note": ""
        },
        {
          "label": "Missing main idea",
          "parts": [
            {
              "text": "Because it rained.",
              "label": "What happened?"
            },
            {
              "text": "We stayed inside because it rained.",
              "label": "Add the main idea"
            }
          ],
          "note": ""
        }
      ],
      "check": {
        "prompt": "Is “Please wait” a fragment?",
        "answer": "No. It is a complete command. The listener, you, is understood."
      }
    }
  },
  {
    "id": "BEG-28",
    "title": "Run on sentences",
    "kind": "concept",
    "sections": [
      {
        "title": "What you will learn",
        "paragraphs": [
          "You will separate two complete ideas, or join them with the right word."
        ],
        "examples": []
      },
      {
        "title": "A run-on",
        "paragraphs": [
          "“The rain stopped we went outside.” Each part could be its own sentence. They were pushed together with no join.",
          "A run-on is not just a long sentence. “The sun rose we woke up” is short and still needs a repair. A long sentence can be correct if the parts are joined properly."
        ],
        "examples": []
      },
      {
        "title": "Use a full stop",
        "paragraphs": [
          "The simplest repair is two sentences. “The rain stopped. We went outside.”",
          "“Asha finished her work. She went to play.” “The gate opened. The children entered.”"
        ],
        "examples": []
      },
      {
        "title": "Use a joining word",
        "paragraphs": [
          "You can use a comma plus and, but, or so. “The rain stopped, so we went outside.” So shows a result.",
          "“I wanted to go out, but it was raining.” But shows a contrast. “The sun rose, and we woke up.” And adds a related idea. “Meera likes tea, but Asha prefers milk.”"
        ],
        "examples": []
      },
      {
        "title": "A comma is not enough",
        "paragraphs": [
          "“The bell rang, we left” is two sentences with only a comma. Repair it. “The bell rang. We left.” “Ravi was hungry, so he ate lunch.”",
          "“The dog barked and ran outside” is one subject with two actions. It does not need a comma just because and is there."
        ],
        "examples": []
      },
      {
        "title": "Look at worked examples",
        "paragraphs": [],
        "examples": [
          "Needs correction: “I was thirsty I drank water.” Repair: “I was thirsty, so I drank water.”",
          "Needs correction: “The shop was shut, we went home.” Repair: “The shop was shut. We went home.”",
          "“The dog barked and ran outside.” This has one subject with two actions. It does not need a comma just because and is present."
        ]
      },
      {
        "title": "Remember",
        "paragraphs": [
          "Find the complete clauses. Give them a full stop or a suitable joining pattern. A comma alone is usually not enough."
        ],
        "examples": []
      }
    ],
    "tasks": [
      {
        "id": "G1",
        "phase": "guided",
        "kind": "response",
        "prompt": "Repair “Asha finished her work she went to play” using two sentences.",
        "explanation": "Asha finished her work. She went to play. Add a full stop and capitalise She."
      },
      {
        "id": "G2",
        "phase": "guided",
        "kind": "response",
        "prompt": "Join “I wanted to go out” and “It was raining” with but.",
        "explanation": "I wanted to go out, but it was raining. But shows a contrast between the wish and the situation."
      },
      {
        "id": "Q1",
        "phase": "quiz",
        "kind": "choice",
        "prompt": "Which needs a repair?",
        "explanation": "Two complete clauses have no punctuation or joining word between them.",
        "options": [
          "The sun rose. We woke up.",
          "The sun rose we woke up.",
          "The sun rose, and we woke up."
        ],
        "answer": 1
      },
      {
        "id": "Q2",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Repair “Ravi was hungry, he ate lunch” using so.",
        "explanation": "Ravi was hungry, so he ate lunch. So connects the hunger to its result."
      },
      {
        "id": "Q3",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Is every long sentence a run-on?",
        "explanation": "No. A run-on has incorrectly joined independent clauses. Length alone does not decide it."
      },
      {
        "id": "Q4",
        "phase": "quiz",
        "kind": "choice",
        "prompt": "Join “Meera likes tea” and “Asha prefers milk” to show contrast.",
        "explanation": "A comma and but make the contrast clear and join the clauses correctly.",
        "options": [
          "Meera likes tea, but Asha prefers milk.",
          "Meera likes tea Asha prefers milk.",
          "Meera likes tea, Asha prefers milk."
        ],
        "answer": 0
      },
      {
        "id": "Q5",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Repair “The gate opened the children entered” using two sentences.",
        "explanation": "The gate opened. The children entered. Each clause becomes a complete sentence."
      },
      {
        "id": "W1",
        "phase": "write",
        "kind": "response",
        "prompt": "Write two related complete sentences. Then join them with and, but, or so. Explain your choice.",
        "explanation": "Sample: “It was hot. We drank water.” “It was hot, so we drank water.” So shows a result. You can use other meaningful joins."
      }
    ],
    "visualGuide": {
      "title": "Two complete ideas need a proper join",
      "rows": [
        {
          "label": "Needs repair",
          "parts": [
            {
              "text": "It rained we stayed inside.",
              "label": "Two complete clauses"
            }
          ],
          "note": ""
        },
        {
          "label": "Repair one",
          "parts": [
            {
              "text": "It rained.",
              "label": "Full stop"
            },
            {
              "text": "We stayed inside.",
              "label": "New capital"
            }
          ],
          "note": ""
        },
        {
          "label": "Repair two",
          "parts": [
            {
              "text": "It rained,",
              "label": "Comma"
            },
            {
              "text": "so",
              "label": "Result"
            },
            {
              "text": "we stayed inside.",
              "label": "Second clause"
            }
          ],
          "note": ""
        }
      ],
      "check": {
        "prompt": "Does “It rained, we stayed inside” fix the problem?",
        "answer": "No. A comma alone is not enough here. Use a full stop or a suitable comma-plus-joining-word pattern."
      }
    }
  },
  {
    "id": "BEG-29",
    "title": "Contractions",
    "kind": "concept",
    "sections": [
      {
        "title": "What you will learn",
        "paragraphs": [
          "You will shorten common word pairs and put the apostrophe where letters are missing."
        ],
        "examples": []
      },
      {
        "title": "What a contraction is",
        "paragraphs": [
          "A contraction is a short form. The apostrophe marks the missing letters. I am becomes I’m. Do not becomes don’t. I will becomes I’ll.",
          "“We do not know” becomes “We don’t know.” Expand the short form to check it. “She doesn’t play” means “She does not play.”"
        ],
        "examples": []
      },
      {
        "title": "Be and not",
        "paragraphs": [
          "I’m, you’re, he’s, she’s, it’s, we’re, and they’re. “She’s happy” means “She is happy”. “They’re in the garden” means “They are in the garden”.",
          "Isn’t, aren’t, don’t, doesn’t, didn’t, and can’t are common negatives. Won’t means will not. It is not willn’t. “I can’t find my bag.”"
        ],
        "examples": []
      },
      {
        "title": "You’re and your",
        "paragraphs": [
          "You’re means you are. Your shows possession. “You’re my friend.” “You’re holding your bag.”"
        ],
        "examples": []
      },
      {
        "title": "They’re their and there",
        "paragraphs": [
          "They’re means they are. “They’re playing.” Their shows possession: “their ball”. There can point to a place: “Put the ball there.”"
        ],
        "examples": []
      },
      {
        "title": "It’s and its",
        "paragraphs": [
          "It’s means it is or it has. “It’s raining” means “It is raining”. “It’s been fun” means “It has been fun”.",
          "Its shows possession and has no apostrophe: “The cat licks its paws.”"
        ],
        "examples": []
      },
      {
        "title": "Look at worked examples",
        "paragraphs": [],
        "examples": [
          "“We do not know” becomes “We don’t know”. The apostrophe marks missing letters in not.",
          "“It’s raining” means “It is raining”. “The bird cleans its wings” shows possession.",
          "Needs correction: “Your very kind.” Corrected: “You’re very kind.” Expand it to “You are very kind”."
        ]
      },
      {
        "title": "Remember",
        "paragraphs": [
          "Expand a contraction to check it. Possessive words such as its and your are not contractions."
        ],
        "examples": []
      }
    ],
    "tasks": [
      {
        "id": "G1",
        "phase": "guided",
        "kind": "response",
        "prompt": "Shorten “I am happy” with a contraction.",
        "explanation": "I’m happy. I am becomes I’m."
      },
      {
        "id": "G2",
        "phase": "guided",
        "kind": "response",
        "prompt": "Expand “She doesn’t play”.",
        "explanation": "She does not play. Doesn’t means does not; play stays in the base form."
      },
      {
        "id": "Q1",
        "phase": "quiz",
        "kind": "choice",
        "prompt": "What does won’t mean?",
        "explanation": "Won’t is the contraction of will not.",
        "options": [
          "Was not.",
          "Would not.",
          "Will not."
        ],
        "answer": 2
      },
      {
        "id": "Q2",
        "phase": "quiz",
        "kind": "choice",
        "prompt": "Choose the correct form: “___ my friend.”",
        "explanation": "You’re means you are, which fits “You are my friend”.",
        "options": [
          "You’re.",
          "Your.",
          "Yours."
        ],
        "answer": 0
      },
      {
        "id": "Q3",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Complete “The cat licks ___ paws” using its or it’s.",
        "explanation": "Its. It shows possession. It is paws would not make sense."
      },
      {
        "id": "Q4",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Fill the gaps with they’re, their, or there: “___ putting ___ bags over ___.”",
        "explanation": "They’re putting their bags over there. They’re means they are. Their shows whose bags. There names a place."
      },
      {
        "id": "Q5",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Add the missing apostrophe: “I cant find my bag.”",
        "explanation": "I can’t find my bag. Can’t is the contraction of cannot."
      },
      {
        "id": "W1",
        "phase": "write",
        "kind": "response",
        "prompt": "Write a friendly two-sentence message using two contractions. Then write the full forms underneath.",
        "explanation": "Sample: “I’m at home. I’ll call soon.” Full forms: I am; I will. Check that each expansion preserves the intended meaning."
      }
    ],
    "visualGuide": {
      "title": "Expand it to check",
      "rows": [
        {
          "label": "Contraction",
          "parts": [
            {
              "text": "you’re",
              "label": "Short form"
            },
            {
              "text": "you are",
              "label": "Full form"
            }
          ],
          "note": ""
        },
        {
          "label": "Contraction",
          "parts": [
            {
              "text": "it’s",
              "label": "Short form"
            },
            {
              "text": "it is / it has",
              "label": "Choose by meaning"
            }
          ],
          "note": ""
        },
        {
          "label": "Possession",
          "parts": [
            {
              "text": "your bag",
              "label": "Whose bag"
            },
            {
              "text": "its paws",
              "label": "Whose paws"
            }
          ],
          "note": ""
        },
        {
          "label": "Place",
          "parts": [
            {
              "text": "over there",
              "label": "Where"
            }
          ],
          "note": ""
        }
      ],
      "check": {
        "prompt": "Choose its or it’s: “___ raining.”",
        "answer": "It’s raining. It is raining makes sense. Its without an apostrophe shows possession."
      }
    }
  },
  {
    "id": "BEG-30",
    "title": "Common spelling rules",
    "kind": "concept",
    "sections": [
      {
        "title": "What you will learn",
        "paragraphs": [
          "You will use a few spelling patterns, and check a word when the pattern does not fit."
        ],
        "examples": []
      },
      {
        "title": "Add ed or d",
        "paragraphs": [
          "Many regular past forms add ed. Walk becomes walked. Help becomes helped. Play becomes played.",
          "If the word already ends in e, add d. Smile becomes smiled. Hope becomes hoped."
        ],
        "examples": []
      },
      {
        "title": "Drop silent e",
        "paragraphs": [
          "Before ing, often drop a final silent e. Make becomes making. Write becomes writing. Hope becomes hoping.",
          "Keep e in words ending in ee, such as seeing. Play keeps its y: playing."
        ],
        "examples": []
      },
      {
        "title": "Change y",
        "paragraphs": [
          "If a consonant comes before y, change y to i before es or ed. Baby becomes babies. Carry becomes carried.",
          "Keep y before ing. Carry becomes carrying. If a vowel comes before y, keep y. Play, plays, played."
        ],
        "examples": []
      },
      {
        "title": "Double the consonant",
        "paragraphs": [
          "A one-syllable word has one spoken beat, like stop or sit. In many one-syllable words with a short vowel and one final consonant, double that consonant. Stop becomes stopped and stopping. Sit becomes sitting. Big becomes bigger.",
          "Compare hop → hopping with hope → hoping. Hop doubles p; hope drops its silent e.",
          "Do not double w, x, or y. Snowing, fixing, playing. Not every word follows these patterns. If you are unsure, check a dictionary."
        ],
        "examples": []
      },
      {
        "title": "Look at worked examples",
        "paragraphs": [],
        "examples": [
          "“Hope + ed” gives hoped. “Hope + ing” gives hoping.",
          "“Stop + ed” gives stopped. The final p doubles in this short-vowel pattern.",
          "“Study + ed” gives studied, but “study + ing” gives studying."
        ]
      },
      {
        "title": "Remember",
        "paragraphs": [
          "Use spelling patterns where they apply. Check exceptions. Keep a small list of words you want to practise."
        ],
        "examples": []
      }
    ],
    "tasks": [
      {
        "id": "G1",
        "phase": "guided",
        "kind": "response",
        "prompt": "Add ing to make and play.",
        "explanation": "Making and playing. Drop the silent e in make; keep y in play."
      },
      {
        "id": "G2",
        "phase": "guided",
        "kind": "response",
        "prompt": "Make the regular past forms of stop and carry.",
        "explanation": "Stopped and carried. Double p in stop; change consonant-plus-y to i before ed in carry."
      },
      {
        "id": "Q1",
        "phase": "quiz",
        "kind": "choice",
        "prompt": "Choose the correct form.",
        "explanation": "Drop the final silent e before ing in make.",
        "options": [
          "Makeing.",
          "Making.",
          "Makking."
        ],
        "answer": 1
      },
      {
        "id": "Q2",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Write the past form of hope.",
        "explanation": "Hoped. Hope already ends in e, so add d."
      },
      {
        "id": "Q3",
        "phase": "quiz",
        "kind": "choice",
        "prompt": "Choose the correct form.",
        "explanation": "Stop follows the one-syllable short-vowel doubling pattern.",
        "options": [
          "Stoped.",
          "Stoppped.",
          "Stopped."
        ],
        "answer": 2
      },
      {
        "id": "Q4",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Add ing to carry.",
        "explanation": "Carrying. Keep y before ing."
      },
      {
        "id": "Q5",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Is every English word covered by these spelling patterns? What should you do when unsure?",
        "explanation": "No. There are exceptions and other patterns. Check a dictionary or a trusted word list instead of forcing a rule onto the word."
      },
      {
        "id": "W1",
        "phase": "write",
        "kind": "response",
        "prompt": "Write a short sentence using each of these words: making, played, stopped, and carried.",
        "explanation": "Sample: “I am making a card.” “We played chess.” “The bus stopped.” “Asha carried the bag.” Check the target spellings and a complete sentence for each."
      }
    ],
    "visualGuide": {
      "title": "Build the ending carefully",
      "rows": [
        {
          "label": "Drop silent e",
          "parts": [
            {
              "text": "hope + ing",
              "label": "Start"
            },
            {
              "text": "hoping",
              "label": "Drop e"
            }
          ],
          "note": ""
        },
        {
          "label": "Double the consonant",
          "parts": [
            {
              "text": "hop + ing",
              "label": "Short vowel, one final consonant"
            },
            {
              "text": "hopping",
              "label": "Double p"
            }
          ],
          "note": ""
        },
        {
          "label": "Change or keep y",
          "parts": [
            {
              "text": "carry + ed → carried",
              "label": "Change y to i"
            },
            {
              "text": "carry + ing → carrying",
              "label": "Keep y"
            }
          ],
          "note": ""
        }
      ],
      "check": {
        "prompt": "Why does play become played rather than plaied?",
        "answer": "A vowel, a, comes before y. Keep y and add ed."
      }
    }
  },
  {
    "id": "REVIEW-02",
    "title": "Level 1 revision",
    "kind": "review",
    "sections": [
      {
        "title": "Try without looking back",
        "paragraphs": [
          "Use the word jobs and sentence parts you learned in Foundations."
        ],
        "examples": []
      }
    ],
    "tasks": [
      {
        "id": "Q1",
        "phase": "quiz",
        "kind": "response",
        "prompt": "In “Asha opens a heavy box”, identify the main verb and the adjective.",
        "explanation": "Opens is the main verb. Heavy is the adjective describing box."
      },
      {
        "id": "Q2",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Is “Please pass the salt” a command or a question in form?",
        "explanation": "It is a command or instruction in form, even though it is a polite request. The listener is understood as the subject."
      },
      {
        "id": "Q3",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Split “The little puppy sleeps beside me” into its whole subject and predicate.",
        "explanation": "Subject: The little puppy. Predicate: sleeps beside me."
      },
      {
        "id": "Q4",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Compare “Ravi holds a cup” and “Ravi is tired”. Name the object in the first and the complement in the second.",
        "explanation": "A cup is the object of holds. Tired is a subject complement describing Ravi after is."
      },
      {
        "id": "Q5",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Is “because the road was wet” an independent clause? Why?",
        "explanation": "No. It is dependent. It has the subject the road and the verb was, but because leaves it needing a main clause."
      },
      {
        "id": "Q6",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Write a complete sentence using “when”.",
        "explanation": "Sample: “When the bell rang, we left.” You can use a main clause joined to a sensible when clause. Check the sentence is complete."
      }
    ],
    "video": {
      "title": "Three ways to end a sentence",
      "publisher": "Khan Academy",
      "url": "https://www.khanacademy.org/humanities/grammar/punctuation-the-comma-and-the-apostrophe/introduction-to-commas/v/three-ways-to-end-a-sentence-punctuation-khan-academy",
      "note": "This video revisits sentence endings. It is one part of Foundations, not a recap of every topic. The video calls a full stop a period.",
      "focus": "Which mark would you use for a question?",
      "recap": [
        "A word’s job depends on its sentence: noun, verb, adjective and the other word jobs.",
        "Tell with a statement, ask with a question, give a command, or express a strong feeling.",
        "Keep the whole subject and whole predicate. Commands can have an understood you.",
        "An object goes with an action; a subject complement describes or identifies the subject.",
        "A phrase has no subject–verb pair in our examples. A dependent clause needs a main idea."
      ],
      "checkedOn": "2026-09-26",
      "youtubeId": "B9bJaoIHRp4"
    }
  },
  {
    "id": "REVIEW-03",
    "title": "Level 2 revision",
    "kind": "review",
    "sections": [
      {
        "title": "Try without looking back",
        "paragraphs": [
          "Some questions bring together nouns, ownership, and pronouns."
        ],
        "examples": []
      }
    ],
    "tasks": [
      {
        "id": "Q1",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Write the plurals of child, box, and toy.",
        "explanation": "Children, boxes, and toys. Child has a special plural; box takes es; toy keeps y and takes s."
      },
      {
        "id": "Q2",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Correct “Please give me two advices” using a countable unit.",
        "explanation": "Please give me two pieces of advice. Advice is normally uncountable, but pieces can be counted."
      },
      {
        "id": "Q3",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Several girls own bags. Write the possessive phrase using girls and bags.",
        "explanation": "The girls’ bags. Girls is a plural ending in s, so the apostrophe follows the s."
      },
      {
        "id": "Q4",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Choose the forms: “Asha and ___ are ready. The coach calls Asha and ___.” Use I or me.",
        "explanation": "Asha and I are ready. The coach calls Asha and me. I is a subject; me is an object."
      },
      {
        "id": "Q5",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Explain the difference between “her bag” and “the bag is hers”.",
        "explanation": "Her is a possessive determiner before bag. Hers is a possessive pronoun standing alone. Both can show the same ownership."
      },
      {
        "id": "Q6",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Correct “Someone left their bag. They is coming back.”",
        "explanation": "Someone left their bag. They are coming back. Singular they is acceptable and takes are."
      },
      {
        "id": "Q7",
        "phase": "quiz",
        "kind": "response",
        "prompt": "In “Our team showed kindness”, name the group noun and the abstract noun.",
        "explanation": "Team is the collective noun. Kindness is the abstract noun. Team is also a common noun; noun groups can overlap."
      },
      {
        "id": "Q8",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Make “Riya told Sana that she won” clear when Sana was the winner.",
        "explanation": "Sample: “Sana won. Riya told her the news.” Also accept a clear sentence that repeats Sana’s name. The original she could mean either person."
      }
    ],
    "video": {
      "title": "How many sweets?",
      "publisher": "British Council LearnEnglish Kids",
      "url": "https://learnenglishkids.britishcouncil.org/grammar-vocabulary/grammar-videos/how-many-sweets",
      "note": "This video revisits countable and uncountable food. In other meanings, a word can change its use: some cake, but two whole cakes.",
      "focus": "Which container or unit could you use to count an amount of water?",
      "recap": [
        "Noun labels can overlap: team is common and collective. Kindness is abstract; music can be heard and is concrete.",
        "Check plural forms: boxes, toys, children. Count amounts with units: two pieces of advice.",
        "Find the owner: the girl’s bag, the girls’ bags, the children’s bags.",
        "Use I as a subject and me as an object. Her bag uses a determiner; the bag is hers uses a pronoun.",
        "Make pronoun reference clear. Singular they still takes are."
      ],
      "checkedOn": "2026-09-26"
    }
  },
  {
    "id": "REVIEW-04",
    "title": "Level 3 revision",
    "kind": "review",
    "sections": [
      {
        "title": "Try without looking back",
        "paragraphs": [
          "Find the subject and the whole verb group before choosing a form."
        ],
        "examples": []
      }
    ],
    "tasks": [
      {
        "id": "Q1",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Find the helping verb and main verb in “We are making lunch”.",
        "explanation": "Are is the helping verb. Making is the main verb in the group are making."
      },
      {
        "id": "Q2",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Does “The baby sleeps quietly” have a direct object?",
        "explanation": "No. Quietly tells us how the baby sleeps; it is an adverb, not an object."
      },
      {
        "id": "Q3",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Change “Riya goes home” into a sentence beginning “Yesterday”.",
        "explanation": "Yesterday, Riya went home. Went is the simple past of go."
      },
      {
        "id": "Q4",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Correct “Did Aman took the book?”",
        "explanation": "Did Aman take the book? Use the base form take after did."
      },
      {
        "id": "Q5",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Choose is or are: “The box of crayons ___ open.”",
        "explanation": "Is. The subject is the singular box, not the plural crayons inside the of phrase."
      },
      {
        "id": "Q6",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Write a simple present sentence about one person reading. Rewrite it about two people.",
        "explanation": "Sample: “Meera reads daily.” “Meera and Zoya read daily.” Check the present-tense agreement change."
      }
    ],
    "video": {
      "title": "Kitty’s school day",
      "publisher": "British Council LearnEnglish Kids",
      "url": "https://learnenglishkids.britishcouncil.org/grammar-vocabulary/grammar-videos/kittys-school-day",
      "note": "This video revisits regular and irregular simple past forms. The assessment also checks helping verbs, objects and agreement.",
      "focus": "Why is wrote different from a regular form such as played?",
      "recap": [
        "In are singing, are is a helper and singing is the main verb. In is happy, is is a linking verb.",
        "Check whether the action has a direct object: reads a book, but reads quietly.",
        "A finished past action may use played or an irregular form such as went. After did, use go.",
        "In present habits, one friend reads; two friends read. The box of crayons is open because box is singular."
      ],
      "checkedOn": "2026-09-26"
    }
  },
  {
    "id": "REVIEW-05",
    "title": "Level 4 revision",
    "kind": "review",
    "sections": [
      {
        "title": "Try without looking back",
        "paragraphs": [
          "Check what each describing word or noun helper does."
        ],
        "examples": []
      }
    ],
    "tasks": [
      {
        "id": "Q1",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Choose careful or carefully: “Sana carries the tray ___.”",
        "explanation": "Carefully. It describes how Sana carries the tray."
      },
      {
        "id": "Q2",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Correct “This rope is more longer than that one.”",
        "explanation": "This rope is longer than that one. Do not combine more with the er comparative."
      },
      {
        "id": "Q3",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Arrange “red / small / bag” after a.",
        "explanation": "A small red bag. Size normally comes before colour."
      },
      {
        "id": "Q4",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Complete “I waited for ___ hour” using a or an.",
        "explanation": "An hour. The h is silent, so hour begins with a vowel sound."
      },
      {
        "id": "Q5",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Correct “This pens need a little ink” so that the first word agrees with pens.",
        "explanation": "These pens need a little ink. These agrees with plural pens. A little fits uncountable ink."
      },
      {
        "id": "Q6",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Complete “We meet ___ eight o’clock ___ Monday.”",
        "explanation": "At eight o’clock on Monday. Use at with the clock time and on with the day."
      },
      {
        "id": "Q7",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Put usually in its usual position: “Asha is cheerful.” What does usually tell us?",
        "explanation": "Asha is usually cheerful. Usually tells how often and normally comes after the main verb is."
      },
      {
        "id": "Q8",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Correct “two reds bags” and name the job of red.",
        "explanation": "Two red bags. Red is a colour adjective describing bags. It does not take a plural s."
      }
    ],
    "video": {
      "title": "Kitty’s science test",
      "publisher": "British Council LearnEnglish Kids",
      "url": "https://learnenglishkids.britishcouncil.org/grammar-vocabulary/grammar-videos/kittys-science-test",
      "note": "This video revisits comparisons. The assessment also checks adjectives, adverbs, articles, determiners and prepositions.",
      "focus": "Why should we say bigger instead of more bigger?",
      "recap": [
        "Adjectives describe nouns and do not become plural: two red bags. A small red bag uses size before colour.",
        "Use taller to compare two and tallest for the greatest degree in a group. Do not combine more with taller.",
        "Adverbs can tell how, when, where, how often or how much. Usually comes before reads but after is.",
        "Choose a or an by the next sound: a uniform, an hour. The identifies something known.",
        "Use these with plural nouns; every child is singular. Many books, a little water.",
        "Use at for a clock time, on for a day, in for a month. Say next Monday without on."
      ],
      "checkedOn": "2026-09-26"
    }
  },
  {
    "id": "REVIEW-06",
    "title": "Level 5 revision",
    "kind": "review",
    "sections": [
      {
        "title": "Try without looking back",
        "paragraphs": [
          "Read slowly and check one kind of error at a time."
        ],
        "examples": []
      }
    ],
    "tasks": [
      {
        "id": "Q1",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Correct the capitals: “sana and i visit delhi in april.”",
        "explanation": "Sana and I visit Delhi in April. Capitalise the person, I, the place, and the month."
      },
      {
        "id": "Q2",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Add the comma and question mark: “Ravi are you ready”.",
        "explanation": "Ravi, are you ready? The comma marks direct address and the question mark ends the question."
      },
      {
        "id": "Q3",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Complete “Because I was tired” as one full sentence.",
        "explanation": "Sample: “I went to bed because I was tired.” You can use another main clause that completes the thought."
      },
      {
        "id": "Q4",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Repair “The bell rang we packed our bags” using two sentences.",
        "explanation": "The bell rang. We packed our bags. Separate the two independent clauses."
      },
      {
        "id": "Q5",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Choose its or it’s: “___ cold. The cat is in ___ bed.”",
        "explanation": "It’s cold. The cat is in its bed. It’s means it is; its shows possession."
      },
      {
        "id": "Q6",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Write the ing forms of make, stop, and carry.",
        "explanation": "Making, stopping, and carrying. Drop silent e; double p in the short-vowel pattern; keep y before ing."
      }
    ],
    "video": {
      "title": "Three ways to end a sentence",
      "publisher": "Khan Academy",
      "url": "https://www.khanacademy.org/humanities/grammar/punctuation-the-comma-and-the-apostrophe/introduction-to-commas/v/three-ways-to-end-a-sentence-punctuation-khan-academy",
      "note": "Rewatch this short reminder of sentence endings. The assessment also checks capitals, repairs, contractions and spelling.",
      "focus": "Which ending would you use for a calm telling sentence?",
      "recap": [
        "Capitalise sentence starts, I, names, days, months and languages.",
        "Use a full stop for a statement, a question mark for a question and ! for strong feeling or a forceful command.",
        "Separate a name in direct address: Thank you, Asha. Use quotation marks for exact speech.",
        "Complete unfinished thoughts. Separate two complete clauses or join them properly; a comma alone is not enough.",
        "It’s means it is or it has. Its shows possession. Write making, stopping and carrying."
      ],
      "checkedOn": "2026-09-26",
      "youtubeId": "B9bJaoIHRp4"
    }
  },
  {
    "id": "FINAL-01",
    "title": "Beginner final practice",
    "kind": "capstone",
    "sections": [
      {
        "title": "Part one Check your understanding",
        "paragraphs": [
          "Try these questions after you have studied all the Beginner levels. You can pause between parts. These questions help you find what to practise next; they do not measure your worth or intelligence."
        ],
        "examples": []
      },
      {
        "title": "Part two Write your own paragraph",
        "paragraphs": [
          "A paragraph keeps related sentences together. Choose one event or daily activity. Start by telling the reader what it is about. Add two or three things that happened, or details that belong with that idea. End with a final detail or feeling.",
          "For example, a school visit could follow this order: where we went, what we saw, what we did, and how the visit ended. Use your own details. Read the paragraph aloud to check that the sentences fit together."
        ],
        "examples": []
      },
      {
        "title": "Check your paragraph",
        "paragraphs": [],
        "examples": [
          "Can a reader tell who or what each sentence is about?",
          "Are the verbs complete and suited to the subject and time?",
          "Can the reader identify what each pronoun refers to?",
          "Have you used the right noun forms and articles?",
          "Do sentences begin with capitals and end with suitable marks?",
          "Are any thoughts unfinished or joined with only a comma?",
          "Choose one sentence to improve, then read the paragraph aloud."
        ]
      },
      {
        "title": "Choose your next practice",
        "paragraphs": [
          "If questions 1 to 3 were difficult, return to Foundations. For questions 4 and 5, review Nouns and pronouns. For questions 6 and 7, review Basic verbs. For questions 8 to 10, review Describing words and noun helpers. For questions 11 and 12, review Writing accuracy. Revisit an example, try a new sentence, and explain your choice in your own words."
        ],
        "examples": []
      }
    ],
    "tasks": [
      {
        "id": "Q1",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Find the noun, verb, and adjective in “A small bird sings”. There is one answer for each requested job.",
        "explanation": "Noun: bird. Verb: sings. Adjective: small. A is a determiner."
      },
      {
        "id": "Q2",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Write a question asking whether Asha is ready.",
        "explanation": "Is Asha ready? Move is before Asha and use a question mark."
      },
      {
        "id": "Q3",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Split “My younger brother reads stories” into its whole subject and predicate.",
        "explanation": "Subject: My younger brother. Predicate: reads stories."
      },
      {
        "id": "Q4",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Write the plural of baby and the possessive phrase for toys belonging to several children.",
        "explanation": "Babies; the children’s toys. Change consonant-plus-y to ies for babies. Children is already plural and takes ’s for possession."
      },
      {
        "id": "Q5",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Complete “The teacher spoke to Neha and ___” with I or me.",
        "explanation": "Me. The pronoun is an object after to."
      },
      {
        "id": "Q6",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Correct “She does not plays chess.”",
        "explanation": "She does not play chess. Use the base form after does not."
      },
      {
        "id": "Q7",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Complete “Yesterday, we ___ rice” with the simple past of eat.",
        "explanation": "Ate. It is the irregular simple past form of eat."
      },
      {
        "id": "Q8",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Choose sweet or sweetly: “The mango tastes ___.”",
        "explanation": "Sweet. It describes the mango after the linking verb tastes."
      },
      {
        "id": "Q9",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Complete “I saw ___ elephant. ___ elephant was near a tree.”",
        "explanation": "I saw an elephant. The elephant was near a tree. An introduces one elephant; the identifies the elephant already mentioned."
      },
      {
        "id": "Q10",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Correct “These boy has many book.”",
        "explanation": "This boy has many books. This matches one boy; many takes plural books. “These boys have many books” is also correct if more than one boy is intended."
      },
      {
        "id": "Q11",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Repair “Because it was raining” as a complete sentence. Then briefly explain why the original is unfinished when used as a sentence in a paragraph.",
        "explanation": "Sample: “We stayed indoors because it was raining.” The original is a dependent clause and leaves us waiting for the main idea."
      },
      {
        "id": "Q12",
        "phase": "quiz",
        "kind": "response",
        "prompt": "Correct “riya cant come on next monday she is visiting pune.” Use two sentences.",
        "explanation": "Riya can’t come next Monday. She is visiting Pune. Capitalise names and sentence beginnings, add the apostrophe, remove on before next Monday, and separate the clauses."
      },
      {
        "id": "W1",
        "phase": "write",
        "kind": "response",
        "prompt": "Write five to seven sentences about a day at school, a visit, or a game. Include a name, a pronoun with a clear reference, two describing words, and a time or place phrase. Use full sentences. Choose present habits or a past event and keep the verb forms sensible. You may use any real or imagined details.",
        "explanation": "Sample: “Yesterday, Asha and I visited a small park. We carried a red ball. Asha kicked the ball to me. We played near a large tree. The sky became dark, so we went home. It was a happy afternoon.” You can use different content. Check complete thoughts, clear pronouns, suitable verb forms, sensible descriptions, and capitals and punctuation. Write five to seven sentences in your own words."
      }
    ],
    "video": {
      "title": "Recognizing fragments",
      "publisher": "Khan Academy",
      "url": "https://www.khanacademy.org/humanities/grammar/syntax-conventions-of-standard-english/fragments-and-run-ons/v/recognizing-fragments-syntax-khan-academy",
      "note": "This is a reminder about complete sentences before your final writing. It does not replace the whole course. A command such as “Please wait” can be complete without a written subject.",
      "focus": "What could you add to “Because I was tired” to make a complete sentence?",
      "recap": [
        "Name who or what you mean and give a complete thought. Keep commands and ordinary telling sentences distinct.",
        "Check noun forms, pronouns, articles and agreement. Choose verb forms for the time you mean.",
        "Choose adjective and adverb forms by their jobs. Check comparison, quantity and time/place phrases.",
        "Check capitals, punctuation, spelling and contractions. Finish fragments and repair wrongly joined clauses.",
        "For the paragraph, use five to seven connected sentences. Reread it and improve one sentence."
      ],
      "checkedOn": "2026-09-26",
      "youtubeId": "xpoZBnXHg3E"
    }
  }
];

export const BEGINNER_UNITS = [
  {
    "number": 0,
    "title": "Before you begin",
    "lessonIds": [
      "INTRO-04",
      "INTRO-05",
      "INTRO-01",
      "INTRO-02",
      "INTRO-03"
    ]
  },
  {
    "number": 1,
    "title": "Foundations",
    "lessonIds": [
      "BEG-01",
      "BEG-02",
      "BEG-03",
      "BEG-04",
      "BEG-05",
      "REVIEW-02"
    ]
  },
  {
    "number": 2,
    "title": "Nouns and pronouns",
    "lessonIds": [
      "BEG-06",
      "BEG-07",
      "BEG-08",
      "BEG-09",
      "BEG-10",
      "BEG-11",
      "BEG-12",
      "REVIEW-03"
    ]
  },
  {
    "number": 3,
    "title": "Basic verbs",
    "lessonIds": [
      "BEG-13",
      "BEG-14",
      "BEG-15",
      "BEG-16",
      "REVIEW-04"
    ]
  },
  {
    "number": 4,
    "title": "Describing words and noun helpers",
    "lessonIds": [
      "BEG-17",
      "BEG-18",
      "BEG-19",
      "BEG-20",
      "BEG-21",
      "BEG-22",
      "BEG-23",
      "BEG-24",
      "REVIEW-05"
    ]
  },
  {
    "number": 5,
    "title": "Writing accuracy",
    "lessonIds": [
      "BEG-25",
      "BEG-26",
      "BEG-27",
      "BEG-28",
      "BEG-29",
      "BEG-30",
      "REVIEW-06",
      "FINAL-01"
    ]
  }
];
