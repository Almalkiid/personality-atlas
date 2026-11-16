// IPIP Big-Five Factor Markers (Goldberg, 1992), 50 items, public domain.
// Items and key: https://ipip.ori.org/new_ipip-50-item-scale.htm · https://ipip.ori.org/newBigFive5broadKey.htm
// Domain N is reported as Neuroticism: the official Emotional Stability key is inverted (N raw = 60 − ES raw).
export const ipip50 = {
  id: "ipip50",
  name: "Quick",
  fullName: "IPIP Big-Five Factor Markers (50 items)",
  minutes: 6,
  domains: [
    { id: "E", name: "Extraversion" },
    { id: "A", name: "Agreeableness" },
    { id: "C", name: "Conscientiousness" },
    { id: "N", name: "Neuroticism" },
    { id: "O", name: "Openness / Intellect" }
  ],
  items: [
    {
      "id": "q1",
      "text": "Am the life of the party.",
      "domain": "E",
      "keyed": "plus"
    },
    {
      "id": "q2",
      "text": "Feel little concern for others.",
      "domain": "A",
      "keyed": "minus"
    },
    {
      "id": "q3",
      "text": "Am always prepared.",
      "domain": "C",
      "keyed": "plus"
    },
    {
      "id": "q4",
      "text": "Get stressed out easily.",
      "domain": "N",
      "keyed": "plus"
    },
    {
      "id": "q5",
      "text": "Have a rich vocabulary.",
      "domain": "O",
      "keyed": "plus"
    },
    {
      "id": "q6",
      "text": "Don't talk a lot.",
      "domain": "E",
      "keyed": "minus"
    },
    {
      "id": "q7",
      "text": "Am interested in people.",
      "domain": "A",
      "keyed": "plus"
    },
    {
      "id": "q8",
      "text": "Leave my belongings around.",
      "domain": "C",
      "keyed": "minus"
    },
    {
      "id": "q9",
      "text": "Am relaxed most of the time.",
      "domain": "N",
      "keyed": "minus"
    },
    {
      "id": "q10",
      "text": "Have difficulty understanding abstract ideas.",
      "domain": "O",
      "keyed": "minus"
    },
    {
      "id": "q11",
      "text": "Feel comfortable around people.",
      "domain": "E",
      "keyed": "plus"
    },
    {
      "id": "q12",
      "text": "Insult people.",
      "domain": "A",
      "keyed": "minus"
    },
    {
      "id": "q13",
      "text": "Pay attention to details.",
      "domain": "C",
      "keyed": "plus"
    },
    {
      "id": "q14",
      "text": "Worry about things.",
      "domain": "N",
      "keyed": "plus"
    },
    {
      "id": "q15",
      "text": "Have a vivid imagination.",
      "domain": "O",
      "keyed": "plus"
    },
    {
      "id": "q16",
      "text": "Keep in the background.",
      "domain": "E",
      "keyed": "minus"
    },
    {
      "id": "q17",
      "text": "Sympathize with others' feelings.",
      "domain": "A",
      "keyed": "plus"
    },
    {
      "id": "q18",
      "text": "Make a mess of things.",
      "domain": "C",
      "keyed": "minus"
    },
    {
      "id": "q19",
      "text": "Seldom feel blue.",
      "domain": "N",
      "keyed": "minus"
    },
    {
      "id": "q20",
      "text": "Am not interested in abstract ideas.",
      "domain": "O",
      "keyed": "minus"
    },
    {
      "id": "q21",
      "text": "Start conversations.",
      "domain": "E",
      "keyed": "plus"
    },
    {
      "id": "q22",
      "text": "Am not interested in other people's problems.",
      "domain": "A",
      "keyed": "minus"
    },
    {
      "id": "q23",
      "text": "Get chores done right away.",
      "domain": "C",
      "keyed": "plus"
    },
    {
      "id": "q24",
      "text": "Am easily disturbed.",
      "domain": "N",
      "keyed": "plus"
    },
    {
      "id": "q25",
      "text": "Have excellent ideas.",
      "domain": "O",
      "keyed": "plus"
    },
    {
      "id": "q26",
      "text": "Have little to say.",
      "domain": "E",
      "keyed": "minus"
    },
    {
      "id": "q27",
      "text": "Have a soft heart.",
      "domain": "A",
      "keyed": "plus"
    },
    {
      "id": "q28",
      "text": "Often forget to put things back in their proper place.",
      "domain": "C",
      "keyed": "minus"
    },
    {
      "id": "q29",
      "text": "Get upset easily.",
      "domain": "N",
      "keyed": "plus"
    },
    {
      "id": "q30",
      "text": "Do not have a good imagination.",
      "domain": "O",
      "keyed": "minus"
    },
    {
      "id": "q31",
      "text": "Talk to a lot of different people at parties.",
      "domain": "E",
      "keyed": "plus"
    },
    {
      "id": "q32",
      "text": "Am not really interested in others.",
      "domain": "A",
      "keyed": "minus"
    },
    {
      "id": "q33",
      "text": "Like order.",
      "domain": "C",
      "keyed": "plus"
    },
    {
      "id": "q34",
      "text": "Change my mood a lot.",
      "domain": "N",
      "keyed": "plus"
    },
    {
      "id": "q35",
      "text": "Am quick to understand things.",
      "domain": "O",
      "keyed": "plus"
    },
    {
      "id": "q36",
      "text": "Don't like to draw attention to myself.",
      "domain": "E",
      "keyed": "minus"
    },
    {
      "id": "q37",
      "text": "Take time out for others.",
      "domain": "A",
      "keyed": "plus"
    },
    {
      "id": "q38",
      "text": "Shirk my duties.",
      "domain": "C",
      "keyed": "minus"
    },
    {
      "id": "q39",
      "text": "Have frequent mood swings.",
      "domain": "N",
      "keyed": "plus"
    },
    {
      "id": "q40",
      "text": "Use difficult words.",
      "domain": "O",
      "keyed": "plus"
    },
    {
      "id": "q41",
      "text": "Don't mind being the center of attention.",
      "domain": "E",
      "keyed": "plus"
    },
    {
      "id": "q42",
      "text": "Feel others' emotions.",
      "domain": "A",
      "keyed": "plus"
    },
    {
      "id": "q43",
      "text": "Follow a schedule.",
      "domain": "C",
      "keyed": "plus"
    },
    {
      "id": "q44",
      "text": "Get irritated easily.",
      "domain": "N",
      "keyed": "plus"
    },
    {
      "id": "q45",
      "text": "Spend time reflecting on things.",
      "domain": "O",
      "keyed": "plus"
    },
    {
      "id": "q46",
      "text": "Am quiet around strangers.",
      "domain": "E",
      "keyed": "minus"
    },
    {
      "id": "q47",
      "text": "Make people feel at ease.",
      "domain": "A",
      "keyed": "plus"
    },
    {
      "id": "q48",
      "text": "Am exacting in my work.",
      "domain": "C",
      "keyed": "plus"
    },
    {
      "id": "q49",
      "text": "Often feel blue.",
      "domain": "N",
      "keyed": "plus"
    },
    {
      "id": "q50",
      "text": "Am full of ideas.",
      "domain": "O",
      "keyed": "plus"
    }
  ]
};
