// Report content. Written fresh for Personality Atlas.
// Rules: "your answers suggest" framing; no clinical language; outcome claims ONLY from replicated (100/100)
// associations in Soto (2019) Table 1 — the observed r is kept beside each claim for traceability.
// Facet descriptions paraphrase the four IPIP-NEO-120 items of each facet (Johnson, 2014).

export const reportText = {
  E: {
    name: 'Extraversion',
    oneLine: 'How much you seek out people, activity and excitement.',
    bands: {
      low: {
        adult: 'Your answers suggest you are more reserved than most people in your comparison group. You likely recharge in quiet settings, prefer a few close conversations to big gatherings, and think before you speak up.',
        youth: 'Your answers suggest you are on the quieter side. You probably enjoy calm time on your own or with one or two good friends, and like to think before you jump in.',
      },
      average: {
        adult: 'Your answers suggest a balance between being outgoing and reserved. You can enjoy company and lively settings, and you also value time to yourself.',
        youth: 'Your answers suggest you enjoy both: time with friends and time on your own. You can join in when you want to, and step back when you need a break.',
      },
      high: {
        adult: 'Your answers suggest you are more outgoing and energetic than most people in your comparison group. You likely enjoy company, speak up readily, and feel energised by activity and people.',
        youth: 'Your answers suggest you love being around people and keeping busy. You probably make friends easily, enjoy talking, and bring energy to a group.',
      },
    },
    strengths: {
      low: ['Comfortable working and thinking independently', 'A careful listener who gives others room to talk', 'Calm presence in busy or noisy settings'],
      high: ['Builds friendships and networks easily', 'Brings energy and warmth to groups', 'Comfortable taking the lead and speaking up'],
    },
    watchOuts: {
      low: ['Your ideas may go unheard in fast, loud discussions', 'Others can misread quietness as distance'],
      high: ['You may fill silences others need to think in', 'Constant activity can leave little time to recharge or reflect'],
    },
    tips: {
      low: ['Share one idea early in meetings, before the conversation speeds up', 'Plan recovery time after social events, and protect it'],
      high: ['Ask a question and wait a few seconds before answering it yourself', 'Schedule some quiet time, even when you feel you do not need it'],
    },
    outcomes: [
      { text: 'Higher Extraversion goes with greater life satisfaction and positive mood.', r: 0.37, source: 'soto2019' },
      { text: 'It also goes with more acceptance and friendship from peers.', r: 0.35, source: 'soto2019' },
      { text: 'People higher in Extraversion are more often seen as leaders.', r: 0.45, source: 'soto2019' },
    ],
    facets: {
      1: { name: 'Friendliness', low: 'Keeps others at a distance and takes time to warm up.', high: 'Makes friends easily and feels comfortable around people.' },
      2: { name: 'Gregariousness', low: 'Prefers being alone or in small groups to crowds.', high: 'Loves large gatherings and talking with many different people.' },
      3: { name: 'Assertiveness', low: 'Happy to let others lead the way.', high: 'Takes charge and likes to lead.' },
      4: { name: 'Activity Level', low: 'Likes a relaxed, unhurried pace.', high: 'Always busy and on the go.' },
      5: { name: 'Excitement-Seeking', low: 'Prefers calm and predictability to thrills.', high: 'Seeks adventure, excitement and bold experiences.' },
      6: { name: 'Cheerfulness', low: 'Expresses joy less often or less openly.', high: 'Radiates joy, has fun and looks on the bright side.' },
    },
  },

  A: {
    name: 'Agreeableness',
    oneLine: 'How much you prioritise getting along with and caring for others.',
    bands: {
      low: {
        adult: 'Your answers suggest you are more direct and sceptical than most people in your comparison group. You likely speak your mind, question others’ motives, and put your own view first when interests clash.',
        youth: 'Your answers suggest you say what you think and do not just go along with others. You like to make up your own mind about people.',
      },
      average: {
        adult: 'Your answers suggest a balance between cooperation and standing your ground. You are generally considerate, and you can also push back when it matters.',
        youth: 'Your answers suggest you are usually kind and easy to get along with, and you can also stand up for yourself when you need to.',
      },
      high: {
        adult: 'Your answers suggest you are warmer and more trusting than most people in your comparison group. You likely care about others’ feelings, prefer cooperation to conflict, and help readily.',
        youth: 'Your answers suggest you are kind, caring and trusting. You probably like helping people and try hard to keep the peace.',
      },
    },
    strengths: {
      low: ['Comfortable with tough decisions and honest feedback', 'Hard to manipulate or talk into things', 'Willing to challenge a weak idea'],
      high: ['A trusted, supportive teammate and friend', 'Calms conflict and builds cooperation', 'Notices and responds to how others feel'],
    },
    watchOuts: {
      low: ['Bluntness can be heard as harshness', 'Others may hesitate to bring problems to you'],
      high: ['You may say yes when you would rather say no', 'Avoiding conflict can let real problems grow'],
    },
    tips: {
      low: ['Before giving critical feedback, name one thing that works', 'Ask “what am I missing?” before deciding someone is wrong'],
      high: ['Practise one polite no each week', 'Raise small disagreements early, while they are still small'],
    },
    outcomes: [
      { text: 'Higher Agreeableness goes with more gratitude.', r: 0.54, source: 'soto2019' },
      { text: 'It also goes with being more forgiving.', r: 0.48, source: 'soto2019' },
      { text: 'It goes with more volunteering in the community.', r: 0.17, source: 'soto2019' },
    ],
    facets: {
      1: { name: 'Trust', low: 'Cautious about others’ intentions until they prove themselves.', high: 'Believes others mean well and takes people at their word.' },
      2: { name: 'Morality', low: 'More willing to bend rules or use others to get ahead.', high: 'Plays fair; does not cheat or take advantage of people.' },
      3: { name: 'Altruism', low: 'Focuses on own goals before others’ needs.', high: 'Loves to help and makes time for others.' },
      4: { name: 'Cooperation', low: 'Does not back away from a fight or confrontation.', high: 'Avoids fights, insults and getting even.' },
      5: { name: 'Modesty', low: 'Thinks highly of self and shows it.', high: 'Does not boast or see self as better than others.' },
      6: { name: 'Sympathy', low: 'Less moved by the hardships of strangers.', high: 'Feels for people who are worse off.' },
    },
  },

  C: {
    name: 'Conscientiousness',
    oneLine: 'How organised, reliable and goal-directed you are.',
    bands: {
      low: {
        adult: 'Your answers suggest you are more flexible and spontaneous than most people in your comparison group. You likely prefer to keep options open, work in bursts, and find strict routines confining.',
        youth: 'Your answers suggest you like to go with the flow rather than plan every step. Routines and tidy rooms may not be your favourite thing.',
      },
      average: {
        adult: 'Your answers suggest a balance between structure and flexibility. You can plan and follow through on what matters, without needing everything in order.',
        youth: 'Your answers suggest you can get organised when it matters, and you also like some freedom to do things your own way.',
      },
      high: {
        adult: 'Your answers suggest you are more organised and dependable than most people in your comparison group. You likely plan ahead, keep promises, and push to finish what you start.',
        youth: 'Your answers suggest you are organised and hard-working. You probably like to plan, keep your promises, and finish what you start.',
      },
    },
    strengths: {
      low: ['Adapts quickly when plans change', 'Comfortable improvising', 'Relaxed about small imperfections'],
      high: ['Reliable: people can count on you', 'Plans ahead and follows through', 'Persists with long or difficult tasks'],
    },
    watchOuts: {
      low: ['Deadlines and details can slip', 'Starting tasks may take more effort than for others'],
      high: ['High standards can tip into perfectionism', 'Hard to switch off when work is unfinished'],
    },
    tips: {
      low: ['Break big tasks into a first step that takes under five minutes', 'Use reminders and checklists so your memory does not have to'],
      high: ['Decide in advance what “good enough” looks like', 'Schedule rest the way you schedule work'],
    },
    outcomes: [
      { text: 'Higher Conscientiousness goes with feeling more successful and satisfied in one’s career.', r: 0.24, source: 'soto2019' },
      { text: 'It also goes with a clearer, more settled sense of identity.', r: 0.23, source: 'soto2019' },
      { text: 'In dating couples, it goes with more satisfying relationships.', r: 0.16, source: 'soto2019' },
    ],
    facets: {
      1: { name: 'Self-Efficacy', low: 'Less sure of getting things done well.', high: 'Confident in handling tasks and getting results.' },
      2: { name: 'Orderliness', low: 'Comfortable with some mess; things are not always put back.', high: 'Likes things tidy and in their proper place.' },
      3: { name: 'Dutifulness', low: 'Treats rules and promises as flexible.', high: 'Keeps promises, tells the truth and follows rules.' },
      4: { name: 'Achievement-Striving', low: 'Does what is needed without going further.', high: 'Works hard and does more than expected.' },
      5: { name: 'Self-Discipline', low: 'Finds it hard to start tasks and stay on them.', high: 'Prepared, starts promptly and carries out plans.' },
      6: { name: 'Cautiousness', low: 'Acts quickly, sometimes without thinking it through.', high: 'Thinks before acting; avoids rash decisions.' },
    },
  },

  N: {
    name: 'Neuroticism',
    alias: 'also called Negative Emotionality',
    oneLine: 'How strongly you tend to feel stress, worry and other negative emotions.',
    bands: {
      low: {
        adult: 'Your answers suggest you are calmer and more even-tempered than most people in your comparison group. You likely stay steady under pressure and recover quickly from setbacks.',
        youth: 'Your answers suggest you usually stay calm, even when things go wrong. You probably bounce back quickly after a hard day.',
      },
      average: {
        adult: 'Your answers suggest a typical level of emotional reactivity. Stress and setbacks affect you, and you can usually work through them.',
        youth: 'Your answers suggest you feel worried or upset sometimes, like most people, and you usually find your way through it.',
      },
      high: {
        adult: 'Your answers suggest you feel stress, worry and other strong emotions more often or more intensely than most people in your comparison group. You likely notice problems early and care a lot about how things turn out.',
        youth: 'Your answers suggest you feel things strongly: worries, frustrations and other big feelings can show up often. That is common, and there are good ways to handle it.',
      },
    },
    strengths: {
      low: ['Steady and reassuring in a crisis', 'Recovers quickly from setbacks', 'Rarely held back by worry'],
      high: ['Spots risks and problems early', 'Takes things seriously and cares about outcomes', 'Emotionally aware, often of others too'],
    },
    watchOuts: {
      low: ['May underestimate real risks or others’ stress', 'Others may read calm as not caring'],
      high: ['Worry can drain energy and make decisions harder', 'Stress can build up when it is not talked about'],
    },
    tips: {
      low: ['When others are stressed, acknowledge it before solving it', 'Do a quick “what could go wrong?” check on big decisions'],
      high: ['Name the feeling, then the next small step you can take', 'Build steady routines for sleep, exercise and talking things through. If worry or low mood feels hard to manage, talking to a professional helps.'],
    },
    outcomes: [
      { text: 'Lower Neuroticism goes with greater life satisfaction and positive mood.', r: 0.52, source: 'soto2019' },
      { text: 'It also goes with feeling more financially secure.', r: 0.33, source: 'soto2019' },
      { text: 'Higher Neuroticism goes with more anxious and low feelings.', r: 0.31, source: 'soto2019' },
    ],
    facets: {
      1: { name: 'Anxiety', low: 'Rarely worries or fears the worst.', high: 'Worries often and gets stressed easily.' },
      2: { name: 'Anger', low: 'Slow to anger and not easily annoyed.', high: 'Gets irritated or angry quickly.' },
      3: { name: 'Depression', low: 'Generally feels comfortable with self and upbeat.', high: 'Often feels down or hard on self.' },
      4: { name: 'Self-Consciousness', low: 'At ease in difficult social situations.', high: 'Feels awkward approaching people or drawing attention.' },
      5: { name: 'Immoderation', low: 'Resists cravings and temptations easily.', high: 'Finds it hard to resist cravings and overindulges.' },
      6: { name: 'Vulnerability', low: 'Stays calm under pressure.', high: 'Feels overwhelmed or panicky when events pile up.' },
    },
  },

  O: {
    name: 'Openness to Experience',
    oneLine: 'How much you are drawn to ideas, imagination, art and new experiences.',
    bands: {
      low: {
        adult: 'Your answers suggest you are more practical and conventional than most people in your comparison group. You likely prefer the familiar and proven, and focus on concrete facts over abstract ideas.',
        youth: 'Your answers suggest you like things that are real and practical, and you enjoy what you already know works.',
      },
      average: {
        adult: 'Your answers suggest a balance between curiosity and practicality. You enjoy some new ideas and experiences, and you also value the familiar.',
        youth: 'Your answers suggest you like trying some new things and ideas, and you also enjoy your favourite familiar things.',
      },
      high: {
        adult: 'Your answers suggest you are more curious and imaginative than most people in your comparison group. You likely enjoy ideas, art, and variety, and question conventional ways of doing things.',
        youth: 'Your answers suggest you are curious and imaginative. You probably love new ideas, creative things, and trying something different.',
      },
    },
    strengths: {
      low: ['Practical and grounded', 'Values what has been proven to work', 'Consistent and dependable in approach'],
      high: ['Generates original ideas', 'Learns new things quickly and enjoys complexity', 'Comfortable with change and ambiguity'],
    },
    watchOuts: {
      low: ['May dismiss new approaches before testing them', 'Change can feel more uncomfortable than it needs to'],
      high: ['New ideas can pull focus from finishing current ones', 'Routine tasks may feel especially dull'],
    },
    tips: {
      low: ['Try one small new thing each month, on your own terms', 'Ask for a concrete example when an idea feels too abstract'],
      high: ['Write ideas down, then pick one to finish before starting the next', 'Pair routine tasks with something that interests you'],
    },
    outcomes: [
      { text: 'Higher Openness goes with stronger artistic interests.', r: 0.41, source: 'soto2019' },
      { text: 'It also goes with feeling inspired more often.', r: 0.35, source: 'soto2019' },
      { text: 'It goes with a more integrated sense of identity.', r: 0.21, source: 'soto2019' },
    ],
    facets: {
      1: { name: 'Imagination', low: 'Focuses on the here and now rather than daydreams.', high: 'Has a vivid imagination and enjoys getting lost in thought.' },
      2: { name: 'Artistic Interests', low: 'Less drawn to art, poetry or museums.', high: 'Sees beauty others miss and values art.' },
      3: { name: 'Emotionality', low: 'Pays less attention to emotions, own or others’.', high: 'Feels emotions intensely and tunes in to others’ feelings.' },
      4: { name: 'Adventurousness', low: 'Prefers familiar routines and ways of doing things.', high: 'Prefers variety and welcomes change.' },
      5: { name: 'Intellect', low: 'Prefers concrete topics to abstract or theoretical ones.', high: 'Loves challenging reading and abstract discussion.' },
      6: { name: 'Liberalism', low: 'Leans towards tradition, firm rules and conventional values.', high: 'Readier to question tradition, authority and fixed rules.' },
    },
  },
};
