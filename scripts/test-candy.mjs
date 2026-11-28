import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function setup(random = () => 0, reduced = true) {
  const module = { exports: {} };
  vm.runInNewContext(fs.readFileSync(new URL('../assets/vendor/matter.min.js', import.meta.url), 'utf8'), {
    module, exports: module.exports, console,
  });
  const Matter = module.exports;
  const bodies = [];
  let contacts = 0, arcs = 0, frame = null, now = 0, resizeCallback = null;
  const size = { width: 300, height: 593 };
  const add = Matter.Composite.add;
  Matter.Composite.add = function (world, body) {
    if (body.parts && body.parts.length > 1) bodies.push(body);
    return add.apply(this, arguments);
  };
  const update = Matter.Engine.update;
  Matter.Engine.update = function (engine) {
    const result = update.apply(this, arguments);
    if (engine.pairs.list.some(pair => pair.isActive &&
      !pair.collision.bodyA.parent.isStatic && !pair.collision.bodyB.parent.isStatic)) contacts++;
    return result;
  };
  function makeCanvas() {
    const context = {
      fillText(char) { this.char = char; },
      strokeText() {}, clearRect() {}, save() {}, restore() {}, translate() {}, rotate() {}, scale() {}, drawImage() {}, setTransform() {},
      beginPath() {}, arc() { arcs++; }, stroke() {}, fill() {},
      getImageData() {
        const data = new Uint8ClampedArray(56 * 64 * 4);
        for (let y = 12; y < 52; y++) for (let x = 8; x < 48; x++) {
          const filled = this.char === 'I' ? x >= 24 && x < 32 :
            x < 16 || x >= 40 || y < 20 || y >= 44;
          if (filled) data[(y * 56 + x) * 4 + 3] = 255;
        }
        return { data };
      },
    };
    return { width: 300, height: 593, getContext: () => context, getBoundingClientRect: () => size };
  }
  const math = Object.create(Math);
  math.random = random;
  const context = {
    Matter, Math: math, document: { createElement: makeCanvas },
    window: { matchMedia: () => ({ matches: reduced }) }, console,
    requestAnimationFrame(callback) { frame = callback; return 1; },
    cancelAnimationFrame() { frame = null; },
    ResizeObserver: class {
      constructor(callback) { resizeCallback = callback; }
      observe() {}
      disconnect() { resizeCallback = null; }
    },
  };
  vm.runInNewContext(fs.readFileSync(new URL('../assets/candy-physics.js', import.meta.url), 'utf8'), context);
  let score = 0, status = '', matchEvents = 0;
  const game = context.createCandyGame(makeCanvas(), {
    score(value) { score = value; }, status(value) { status = value; },
    match() { matchEvents++; },
  });
  function advanceFrames(count) {
    for (let i = 0; i < count; i++) {
      if (!frame) break;
      const callback = frame;
      frame = null;
      now += 1000 / 60;
      callback(now);
    }
  }
  return {
    game, bodies, advanceFrames, getContacts: () => contacts, getScore: () => score,
    getStatus: () => status, getArcs: () => arcs, getMatchEvents: () => matchEvents,
    resize(width, height) { size.width = width; size.height = height; if (resizeCallback) resizeCallback(); },
  };
}

test('number keys and rapid virtual keyboard input all reach free play', () => {
  const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const keys = html.slice(html.indexOf('const NORM='), html.indexOf('\nlet freeOn='));
  const listeners = html.slice(html.indexOf('let keyT=0;'), html.indexOf("\nstage.addEventListener('pointerdown'"));
  const handlers = {}, received = [];
  const inp = { value: '', addEventListener(type, handler) { handlers[type] = handler; } };
  const context = {
    window: { addEventListener(type, handler) { handlers[type] = handler; } },
    inp, freeOn: true, running: false, performance: { now: () => 1000 },
    freeKey: char => received.push(char),
  };
  vm.runInNewContext(keys + '\n' + listeners, context);
  function key(code, value, options = {}) {
    handlers.keydown({
      code, key: value, shiftKey: false, cancelable: true, target: inp,
      preventDefault() {}, ...options,
    });
  }
  key('Digit1', '1');
  key('Numpad2', '2');
  key('Digit3', '3', { shiftKey: true });
  inp.value = '456789';
  handlers.input();
  key('Unidentified', '5', { cancelable: false });
  inp.value = '5';
  handlers.input();
  assert.equal(received.join(''), '1234567895');
});

test('free play creates letters and digits without typing sounds or speech', () => {
  const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const code = html.slice(html.indexOf('function freeKey(c){'), html.indexOf("\n$('#freeClear').onclick="));
  const spoken = [], pieces = [], sounds = [];
  const context = {
    candyGame: { push: value => pieces.push(value) },
    tone: frequency => sounds.push(frequency), speak: text => spoken.push(text),
  };
  vm.runInNewContext(code, context);
  for (const char of 'ab12') context.freeKey(char);
  assert.deepEqual(pieces, ['A', 'B', '1', '2']);
  assert.deepEqual(sounds, []);
  assert.deepEqual(spoken, []);
});

test('bubble pop is brief and does not play while muted', () => {
  const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const code = html.slice(html.indexOf('function bubblePop(){'), html.indexOf('\nconst SPD='));
  const starts = [], stops = [], ramps = [];
  function param(name) {
    return { setValueAtTime() {}, exponentialRampToValueAtTime(value, time) { ramps.push({ name, value, time }); } };
  }
  function node(name) {
    return {
      frequency: param('frequency'), gain: param('gain'), connect() {},
      start(time) { starts.push({ name, time }); }, stop(time) { stops.push({ name, time }); },
    };
  }
  const audio = {
    currentTime: 2, sampleRate: 44100, destination: {},
    createOscillator: () => node('oscillator'), createGain: () => node('gain'),
    createBiquadFilter: () => node('filter'), createBufferSource: () => node('noise'),
    createBuffer: (channels, length) => ({ getChannelData: () => new Float32Array(length) }),
  };
  const context = { ac: audio, muted: false, console, Math };
  vm.runInNewContext(code, context);
  context.bubblePop();
  assert.deepEqual(starts.map(event => event.name), ['oscillator', 'noise']);
  assert.ok(stops.every(event => event.time <= 2.1));
  assert.ok(ramps.some(event => event.name === 'frequency' && event.value > 650));
  context.muted = true;
  context.bubblePop();
  assert.equal(starts.length, 2);
});

test('speech uses a default voice outside free play', () => {
  const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const code = html.slice(html.indexOf('const FEM_PREF='), html.indexOf('\nfunction kill(m){'));
  const spoken = [], elements = {};
  let cancellations = 0;
  const synthesis = {
    getVoices: () => [{ lang: 'zh-TW', name: 'Chinese voice' }],
    cancel() { cancellations++; }, resume() {}, speak(utterance) { spoken.push(utterance); },
  };
  function Utterance(text) { this.text = text; }
  const context = {
    window: { speechSynthesis: synthesis, SpeechSynthesisUtterance: Utterance },
    speechSynthesis: synthesis, SpeechSynthesisUtterance: Utterance, muted: false, freeOn: false, console,
    $: selector => elements[selector] || (elements[selector] = {}),
  };
  vm.runInNewContext(code, context);
  context.speak('cat');
  assert.deepEqual(spoken.map(u => u.text), ['cat']);
  assert.ok(spoken.every(u => u.lang === 'en-US' && !u.voice));
  assert.equal(cancellations, 1);
  assert.match(elements['#voiceNoticeText'].textContent, /英文語音/);
  context.freeOn = true;
  context.speak('dog');
  assert.equal(spoken.length, 1);
  assert.equal(cancellations, 1);
});

test('glyph-shaped pieces fall and collide', () => {
  let index = 0;
  const values = [0, .5, .4, .5];
  const { game, bodies, getContacts } = setup(() => values[index++ % values.length]);
  game.start();
  game.push('O');
  game.push('I');
  assert.equal(bodies.length, 2);
  assert.notEqual(bodies[0].parts.length, bodies[1].parts.length);
  assert.ok(bodies.every(body => body.position.y > 400));
  assert.ok(getContacts() > 0);
  assert.ok(bodies[1].position.y < bodies[0].position.y - 10);
  game.stop();
});

test('typed pieces visibly descend before landing', () => {
  const { game, bodies, advanceFrames } = setup(() => .5, false);
  game.start();
  game.push('O');
  advanceFrames(3);
  assert.equal(bodies.length, 1);
  const initialY = bodies[0].position.y;
  advanceFrames(20);
  assert.ok(bodies[0].position.y > initialY + 10);
  assert.ok(bodies[0].position.y < 500);
  game.stop();
});

test('play area follows resizing and new pieces spawn in its centre', () => {
  const { game, bodies, advanceFrames, resize } = setup(() => .5, false);
  game.start();
  game.push('O');
  advanceFrames(250);
  const oldX = bodies[0].position.x, oldY = bodies[0].position.y;
  resize(900, 693);
  assert.ok(Math.abs(bodies[0].position.x - oldX - 300) < 1);
  assert.ok(Math.abs(bodies[0].position.y - oldY - 100) < 1);
  game.push('I');
  advanceFrames(3);
  assert.equal(bodies.length, 2);
  assert.ok(Math.abs(bodies[1].position.x - 450) < 10);
  game.stop();
});

test('shaking moves settled pieces apart without clearing them', () => {
  const { game, bodies, advanceFrames, getScore, getStatus } = setup(() => .5, false);
  game.start();
  game.shake();
  assert.match(getStatus(), /還沒有糖果/);
  game.setMatchCount(10);
  game.push('O');
  game.push('I');
  advanceFrames(400);
  const before = bodies.map(body => body.position.x);
  game.shake();
  advanceFrames(90);
  assert.equal(getScore(), 0);
  assert.ok(bodies.every((body, i) => Math.abs(body.position.x - before[i]) > 10));
  assert.ok(bodies.every(body => body.bounds.min.x >= -1 && body.bounds.max.x <= 301));
  game.stop();
});

test('shaking also redistributes pieces with reduced motion', () => {
  const { game, bodies } = setup(() => .5);
  game.start();
  game.push('O');
  const before = bodies[0].position.x;
  game.shake();
  assert.ok(Math.abs(bodies[0].position.x - before) > 10);
  game.stop();
});

test('reduced-motion users can enable falling without losing existing pieces', () => {
  const { game, bodies, advanceFrames } = setup();
  game.start();
  game.push('O');
  const settledY = bodies[0].position.y;
  game.playMotion();
  game.push('I');
  advanceFrames(3);
  assert.equal(bodies.length, 2);
  const initialY = bodies[1].position.y;
  advanceFrames(20);
  assert.ok(bodies[1].position.y > initialY + 10);
  assert.ok(bodies[0].position.y >= settledY - 5);
  game.start(true);
  game.push('I');
  advanceFrames(3);
  const resetY = bodies[2].position.y;
  advanceFrames(20);
  assert.ok(bodies[2].position.y > resetY + 10);
  game.stop();
});

test('three touching same-colour pieces disappear and reset clears the score', () => {
  const { game, getScore, getStatus, getArcs, getMatchEvents } = setup();
  game.start();
  game.push('O');
  game.push('O');
  assert.equal(getMatchEvents(), 0);
  game.push('O');
  assert.equal(getScore(), 3);
  assert.equal(getMatchEvents(), 1);
  assert.match(getStatus(), /消除了 3 顆/);
  assert.equal(getArcs(), 0);
  game.start();
  assert.equal(getScore(), 0);
  game.stop();
});

test('a higher match count waits for enough touching pieces and persists on reset', () => {
  const { game, getScore, getStatus } = setup();
  game.start();
  game.setMatchCount(4);
  game.push('O');
  game.push('O');
  game.push('O');
  assert.equal(getScore(), 0);
  game.push('O');
  assert.equal(getScore(), 4);
  game.start();
  assert.match(getStatus(), /4 顆以上/);
  game.stop();
});

test('lowering the match count clears existing touching pieces in reduced motion', () => {
  const { game, getScore, getMatchEvents } = setup();
  game.start();
  game.setMatchCount(4);
  game.push('O');
  game.push('O');
  assert.equal(getScore(), 0);
  game.setMatchCount(2);
  assert.equal(getScore(), 2);
  assert.equal(getMatchEvents(), 1);
  assert.throws(() => game.setMatchCount(1), /2 到 10/);
  game.stop();
});

test('matching pieces produce a temporary animation', () => {
  const { game, advanceFrames, getScore, getArcs } = setup(() => 0, false);
  game.start();
  game.push('O');
  game.push('O');
  game.push('O');
  for (let i = 0; i < 600 && getScore() === 0; i++) advanceFrames(1);
  assert.equal(getScore(), 3);
  assert.ok(getArcs() > 0);
  const during = getArcs();
  advanceFrames(10);
  assert.ok(getArcs() > during);
  advanceFrames(60);
  const ended = getArcs();
  advanceFrames(10);
  assert.equal(getArcs(), ended);
  game.stop();
});

test('reset stops an active match animation', () => {
  const { game, advanceFrames, getScore, getArcs } = setup(() => 0, false);
  game.start();
  game.push('O');
  game.push('O');
  game.push('O');
  for (let i = 0; i < 600 && getScore() === 0; i++) advanceFrames(1);
  assert.equal(getScore(), 3);
  assert.ok(getArcs() > 0);
  game.start();
  const cleared = getArcs();
  advanceFrames(60);
  assert.equal(getArcs(), cleared);
  game.stop();
});
