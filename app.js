const traits = [
  ['Extraversion', 'Sociability and initiating conversation'],
  ['Agreeableness', 'Concern for others and their feelings'],
  ['Conscientiousness', 'Preparation, order and follow-through'],
  ['Emotional stability', 'Calmness and steadiness of mood'],
  ['Intellect / imagination', 'Engagement with ideas and abstract thought']
];
const labels = ['Very inaccurate','Moderately inaccurate','Neither accurate nor inaccurate','Moderately accurate','Very accurate'];
const app = document.querySelector('#app');
let answers = Array(items.length).fill(null);
let step = 0;
function score(values) {
  if (values.length !== items.length || !values.every(v => Number.isInteger(v) && v >= 1 && v <= 5)) throw Error('Complete every item first.');
  const totals = traits.map(() => 0);
  items.forEach((item, i) => { totals[item.trait] += item.reverse ? 6 - values[i] : values[i]; });
  return totals;
}
function show(content) {
  app.innerHTML = content;
  app.querySelector('h1').focus();
}
function intro() {
  show('<div class="tag">Big Five · 50 statements</div><h1 tabindex="-1">Your personality profile</h1><p>How accurately does each statement describe you as you generally are today? Choose one answer per statement to see your five trait scores.</p><p><small>Your answers stay in this tab. Refreshing clears your progress.</small></p><button class="primary" id="start">Start assessment →</button>');
  app.querySelector('#start').onclick = question;
}
function question() {
  const options = labels.map((label,i) => '<label><input type="radio" name="rating" value="'+(i+1)+'" '+(answers[step]===i+1?'checked':'')+'>'+label+'</label>').join('');
  show('<div class="tag">Statement '+(step+1)+' of '+items.length+'</div><progress aria-label="Questionnaire progress" value="'+step+'" max="'+items.length+'"></progress><h1 tabindex="-1">'+items[step].text+'</h1><fieldset><legend>How accurately does this describe you?</legend>'+options+'</fieldset><nav><button id="back">Back</button><button id="next" class="primary" '+(answers[step]===null?'disabled':'')+'>'+(step===items.length-1?'View results':'Next →')+'</button></nav>');
  const next = app.querySelector('#next');
  app.querySelector('fieldset').onchange = event => { answers[step]=Number(event.target.value); next.disabled=false; };
  app.querySelector('#back').onclick = () => { if(step===0) return intro(); step--; question(); };
  next.onclick = () => { if(step===items.length-1) return results(); step++; question(); };
}
function results() {
  const rows = score(answers).map((total,i) => '<div class="row"><strong>'+traits[i][0]+'<span>'+total+' / 50</span></strong><meter min="10" max="50" value="'+total+'" aria-label="'+traits[i][0]+'"></meter><small>'+traits[i][1]+'</small></div>').join('');
  show('<div class="tag">Assessment complete</div><h1 tabindex="-1">Your five traits</h1><p>Each scale runs from 10 to 50. A higher score means your answers more strongly reflect the trait described below. These are raw scores.</p>'+rows+'<nav><button id="review">Review answers</button><button id="restart">Start again</button></nav>');
  app.querySelector('#review').onclick = () => { step=0; question(); };
  app.querySelector('#restart').onclick = () => { answers.fill(null); step=0; intro(); };
}
intro();
