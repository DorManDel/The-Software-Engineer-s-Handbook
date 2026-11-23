import {analyzePrime, PRIME_STRATEGIES, MAX_PRIME_INPUT} from './prime-engine.mjs';

// The catalog is intentionally separate from executable code snippets.
// "planned" means the language is documented, not that code can be run.
const LANGUAGES = Object.freeze([
  {id:'c', name:'C', family:'Systems', available:true, note:'Explicit integer operations and loops.'},
  {id:'cpp', name:'C++', family:'Systems', available:false, note:'STL and modern C++ idioms.'},
  {id:'python', name:'Python', family:'Scripting', available:true, note:'Readable loops and integer arithmetic.'},
  {id:'javascript', name:'JavaScript', family:'Web', available:true, note:'Browser-side interactive algorithms.'},
  {id:'typescript', name:'TypeScript', family:'Web', available:false, note:'Types around JavaScript algorithms.'},
  {id:'csharp', name:'C#', family:'Games', available:false, note:'C# and Unity implementation details.'},
  {id:'java', name:'Java', family:'JVM', available:false, note:'Collections, methods, JVM execution.'},
  {id:'cobol', name:'COBOL', family:'Legacy', available:false, note:'Procedural language and data divisions.'},
  {id:'assembly', name:'x86-64 Assembly', family:'Systems', available:false, note:'Registers, arithmetic, branches and loops.'},
  {id:'html', name:'HTML', family:'Markup', available:false, note:'Page structure; not a general-purpose algorithm language.'},
  {id:'css', name:'CSS', family:'Markup', available:false, note:'Presentation rules; not a general-purpose algorithm language.'}
]);

// These are teaching examples meant to be copied to the relevant compiler/runtime.
// Only the JavaScript trace engine runs in this browser.
const SNIPPETS = Object.freeze({
  c: [
    '#include <stdbool.h>',
    '',
    'bool is_prime(int n) {',
    '    if (n < 2) return false;',
    '    if (n <= 3) return true;',
    '    if (n % 2 == 0 || n % 3 == 0) return false;',
    '',
    '    for (int i = 5; i <= n / i; i += 6) {',
    '        if (n % i == 0 || n % (i + 2) == 0)',
    '            return false;',
    '    }',
    '    return true;',
    '}'
  ].join('\n'),
  python: [
    'def is_prime(n: int) -> bool:',
    '    if n < 2:',
    '        return False',
    '    if n <= 3:',
    '        return True',
    '    if n % 2 == 0 or n % 3 == 0:',
    '        return False',
    '',
    '    i = 5',
    '    while i <= n // i:',
    '        if n % i == 0 or n % (i + 2) == 0:',
    '            return False',
    '        i += 6',
    '    return True'
  ].join('\n'),
  javascript: [
    'function isPrime(n) {',
    '  if (!Number.isSafeInteger(n) || n < 2) return false;',
    '  if (n <= 3) return true;',
    '  if (n % 2 === 0 || n % 3 === 0) return false;',
    '',
    '  for (let i = 5; i <= Math.floor(n / i); i += 6) {',
    '    if (n % i === 0 || n % (i + 2) === 0)',
    '      return false;',
    '  }',
    '  return true;',
    '}'
  ].join('\n')
});

function make(tag, cls, content) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (content !== undefined) node.textContent = content;
  return node;
}

export function mountAlgorithmArcade() {
  const root = document.querySelector('#view-arcade');
  if (!root) return;
  const number = root.querySelector('#prime-number');
  const strategy = root.querySelector('#prime-strategy');
  const feedback = root.querySelector('#prime-feedback');
  const operations = root.querySelector('#prime-operations');
  const time = root.querySelector('#prime-time');
  const divisor = root.querySelector('#prime-divisor');
  const trace = root.querySelector('#prime-trace');
  const languageFilter = root.querySelector('#language-filter');
  const languageSearch = root.querySelector('#language-search');
  const languageList = root.querySelector('#language-list');
  const codeLanguage = root.querySelector('#prime-code-language');
  const code = root.querySelector('#prime-code');

  const renderPrime = () => {
    try {
      if (!number.value.trim()) throw new RangeError('Enter a whole number to begin.');
      const n = Number(number.value);
      const result = analyzePrime(n, strategy.value);
      number.setAttribute('aria-invalid', 'false');
      feedback.className = 'alg-feedback ' + (result.prime ? 'alg-success' : 'alg-neutral');
      feedback.textContent = n < 2
        ? n + ' is not prime: prime numbers must be greater than 1.'
        : result.prime ? n + ' is prime.' : n + ' is composite (divisible by ' + result.divisor + ').';
      operations.textContent = String(result.checks);
      time.textContent = result.time;
      divisor.textContent = result.divisor === null ? 'None' : String(result.divisor);
      trace.replaceChildren();
      if (!result.trace.length) trace.append(make('span', 'muted small', 'No remainder checks required.'));
      for (const item of result.trace) {
        const chip = make('span', 'alg-check' + (item.remainder === 0 ? ' alg-divides' : ''),
          '÷' + item.divisor + ' → r ' + item.remainder);
        chip.title = 'Remainder when ' + n + ' is divided by ' + item.divisor;
        trace.append(chip);
      }
      if (result.hiddenChecks) trace.append(make('span', 'muted small', '+ ' + result.hiddenChecks + ' additional checks not displayed'));
    } catch (error) {
      number.setAttribute('aria-invalid', 'true');
      feedback.className = 'alg-feedback alg-error';
      feedback.textContent = error.message;
      operations.textContent = '—';
      time.textContent = '—';
      divisor.textContent = '—';
      trace.replaceChildren();
    }
  };

  for (const preset of root.querySelectorAll('[data-prime-example]')) {
    preset.addEventListener('click', () => {
      number.value = preset.dataset.primeExample;
      renderPrime();
      number.focus();
    });
  }
  number.max = String(MAX_PRIME_INPUT);
  number.addEventListener('input', renderPrime);
  strategy.addEventListener('change', renderPrime);

  const renderCode = () => {
    const chosen = codeLanguage.value;
    code.textContent = SNIPPETS[chosen] ?? 'No reviewed example available for this language yet.';
  };
  codeLanguage.addEventListener('change', renderCode);

  const renderLanguages = () => {
    const filter = languageFilter.value;
    const query = languageSearch.value.trim().toLowerCase();
    const shown = LANGUAGES.filter(lang => {
      const matchesFilter = filter === 'all' || (filter === 'available' && lang.available) ||
        (filter === 'planned' && !lang.available) || lang.family === filter;
      const matchesQuery = !query || [lang.name, lang.family, lang.note].join(' ').toLowerCase().includes(query);
      return matchesFilter && matchesQuery;
    });
    languageList.replaceChildren();
    if (!shown.length) languageList.append(make('p', 'muted small', 'No matching languages.'));
    for (const lang of shown) {
      const card = make('article', 'alg-language-card');
      const row = make('div', 'alg-language-heading');
      row.append(make('strong', '', lang.name));
      row.append(make('span', 'alg-language-status ' + (lang.available ? 'alg-available' : ''), lang.available ? 'Prime example' : 'Planned'));
      card.append(row);
      card.append(make('span', 'alg-family', lang.family));
      card.append(make('p', 'muted small', lang.note));
      if (lang.available) {
        const open = make('button', 'quiz-button', 'View prime example');
        open.type = 'button';
        open.addEventListener('click', () => {
          codeLanguage.value = lang.id;
          renderCode();
          root.querySelector('#language-code-panel').scrollIntoView({behavior:'smooth', block:'nearest'});
        });
        card.append(open);
      }
      languageList.append(card);
    }
  };
  languageFilter.addEventListener('change', renderLanguages);
  languageSearch.addEventListener('input', renderLanguages);
  renderPrime();
  renderCode();
  renderLanguages();
}
