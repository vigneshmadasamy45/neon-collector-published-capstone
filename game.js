(() => {
  "use strict";
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d", { alpha: false });
  const scoreEl = document.getElementById("score");
  const timerEl = document.getElementById("timer");
  const bestEl = document.getElementById("best");
  const overlay = document.getElementById("overlay");
  const overlayTitle = document.getElementById("overlayTitle");
  const overlayText = document.getElementById("overlayText");
  const startButton = document.getElementById("startButton");
  const pauseButton = document.getElementById("pauseButton");
  const restartButton = document.getElementById("restartButton");
  const soundToggle = document.getElementById("soundToggle");
  const motionToggle = document.getElementById("motionToggle");
  const liveMessage = document.getElementById("liveMessage");

  const W = canvas.width, H = canvas.height;
  const TARGET = 10, START_TIME = 30;
  const keys = new Set();
  const touch = { up: false, down: false, left: false, right: false };
  let state = "ready", score = 0, timeLeft = START_TIME, lastFrame = 0;
  let player, orb, hazards, particles, audioContext = null, soundOn = false;
  let reducedMotion = false, hitFlash = 0;
  let best = readBest();

  function readBest() {
    try { return Math.max(0, Number(localStorage.getItem("neonCollectorBest")) || 0); }
    catch (_) { return 0; }
  }
  function saveBest(value) {
    try { localStorage.setItem("neonCollectorBest", String(value)); } catch (_) { /* storage may be blocked */ }
  }
  function random(min, max) { return min + Math.random() * (max - min); }
  function distance(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
  function safeSpot(radius, avoidPlayer = true) {
    let candidate, tries = 0;
    do {
      candidate = { x: random(30 + radius, W - 30 - radius), y: random(30 + radius, H - 30 - radius), r: radius };
      tries++;
    } while (tries < 80 && ((avoidPlayer && player && distance(candidate, player) < 95) ||
      (hazards || []).some(h => distance(candidate, h) < 60)));
    return candidate;
  }
  function resetGame() {
    score = 0; timeLeft = START_TIME; hitFlash = 0;
    player = { x: W / 2, y: H / 2, r: 12, speed: 235, invulnerable: 0 };
    hazards = [
      { x: W * .24, y: H * .32, r: 15, vx: 85, vy: 65 },
      { x: W * .73, y: H * .68, r: 17, vx: -70, vy: 92 },
      { x: W * .75, y: H * .25, r: 12, vx: -95, vy: 75 }
    ];
    particles = [];
    orb = safeSpot(9);
    updateHud();
    draw();
  }
  function updateHud() {
    scoreEl.innerHTML = `${score} <small>/ ${TARGET}</small>`;
    timerEl.textContent = `${Math.max(0, timeLeft).toFixed(1)}s`;
    bestEl.textContent = String(best);
  }
  function announce(message) { liveMessage.textContent = message; }
  function showOverlay(title, text, buttonText = "Start game") {
    overlayTitle.textContent = title; overlayText.textContent = text;
    startButton.innerHTML = `${buttonText} <span aria-hidden="true">→</span>`;
    overlay.classList.remove("hidden");
  }
  function hideOverlay() { overlay.classList.add("hidden"); }
  function startGame() {
    if (state === "ready" || state === "won" || state === "lost") resetGame();
    state = "playing"; hideOverlay(); pauseButton.disabled = false;
    pauseButton.textContent = "Pause"; announce("Game started. Collect ten energy orbs.");
    lastFrame = performance.now(); requestAnimationFrame(loop);
    canvas.focus({ preventScroll: true });
  }
  function pauseGame() {
    if (state === "playing") {
      state = "paused"; pauseButton.textContent = "Resume";
      showOverlay("Take a breather.", "Your game is paused. Resume when you are ready.", "Resume game");
      announce("Game paused.");
    } else if (state === "paused") {
      state = "playing"; hideOverlay(); pauseButton.textContent = "Pause";
      lastFrame = performance.now(); requestAnimationFrame(loop); announce("Game resumed.");
    }
  }
  function finish(won) {
    state = won ? "won" : "lost";
    pauseButton.disabled = true;
    if (score > best) { best = score; saveBest(best); }
    updateHud();
    showOverlay(won ? "Arena cleared!" : "Time is up.", won ? `You collected ${score} energy orbs. Nice run!` : `You collected ${score} of ${TARGET} orbs. Try another run.`, "Play again");
    announce(won ? "You win. Arena cleared." : "Game over. Time is up.");
    tone(won ? 660 : 180, .15);
  }
  function tone(freq, duration) {
    if (!soundOn) return;
    try {
      audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
      if (audioContext.state === "suspended") audioContext.resume();
      const osc = audioContext.createOscillator(), gain = audioContext.createGain();
      osc.type = "sine"; osc.frequency.value = freq;
      gain.gain.setValueAtTime(.0001, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(.07, audioContext.currentTime + .01);
      gain.gain.exponentialRampToValueAtTime(.0001, audioContext.currentTime + duration);
      osc.connect(gain); gain.connect(audioContext.destination);
      osc.start(); osc.stop(audioContext.currentTime + duration + .02);
    } catch (_) { /* sound is optional */ }
  }
  function burst(x, y, color, count = 10) {
    if (reducedMotion) return;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2, speed = random(35, 145);
      particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: random(.2, .55), max: .55, color });
    }
  }
  function update(dt) {
    timeLeft -= dt;
    if (timeLeft <= 0) { timeLeft = 0; finish(false); return; }
    let dx = 0, dy = 0;
    if (keys.has("ArrowLeft") || keys.has("a") || touch.left) dx--;
    if (keys.has("ArrowRight") || keys.has("d") || touch.right) dx++;
    if (keys.has("ArrowUp") || keys.has("w") || touch.up) dy--;
    if (keys.has("ArrowDown") || keys.has("s") || touch.down) dy++;
    if (dx && dy) { dx *= Math.SQRT1_2; dy *= Math.SQRT1_2; }
    player.x = Math.max(player.r, Math.min(W - player.r, player.x + dx * player.speed * dt));
    player.y = Math.max(player.r, Math.min(H - player.r, player.y + dy * player.speed * dt));
    player.invulnerable = Math.max(0, player.invulnerable - dt);
    hitFlash = Math.max(0, hitFlash - dt);
    hazards.forEach(h => {
      h.x += h.vx * dt; h.y += h.vy * dt;
      if (h.x < h.r || h.x > W - h.r) h.vx *= -1;
      if (h.y < h.r || h.y > H - h.r) h.vy *= -1;
      h.x = Math.max(h.r, Math.min(W - h.r, h.x));
      h.y = Math.max(h.r, Math.min(H - h.r, h.y));
      if (player.invulnerable <= 0 && distance(player, h) < player.r + h.r) {
        timeLeft = Math.max(0, timeLeft - 2);
        player.invulnerable = 1;
        hitFlash = .22; burst(player.x, player.y, "#ff5378", 8); tone(130, .08);
        announce("Hazard hit. Two seconds removed.");
      }
    });
    if (distance(player, orb) < player.r + orb.r + 2) {
      score++; burst(orb.x, orb.y, "#59f3ff", 12); tone(520 + score * 20, .07);
      orb = safeSpot(9);
      announce(`Energy orb collected. Score ${score} of ${TARGET}.`);
      if (score >= TARGET) { finish(true); return; }
    }
    particles = particles.filter(p => p.life > 0);
    particles.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; });
    updateHud();
  }
  function drawGrid() {
    ctx.fillStyle = "#090d1d"; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = reducedMotion ? "#151b32" : "#17203b"; ctx.lineWidth = 1;
    for (let x = 20; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 20; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    ctx.strokeStyle = "#252d51"; ctx.strokeRect(1, 1, W - 2, H - 2);
  }
  function glowCircle(x, y, r, color, glow = 16) {
    ctx.save(); ctx.shadowBlur = reducedMotion ? 0 : glow; ctx.shadowColor = color;
    ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  }
  function draw() {
    drawGrid();
    ctx.save(); ctx.globalAlpha = .15; ctx.strokeStyle = "#59f3ff"; ctx.beginPath(); ctx.arc(orb.x, orb.y, 20, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    glowCircle(orb.x, orb.y, orb.r, "#59f3ff", 18);
    hazards.forEach(h => {
      glowCircle(h.x, h.y, h.r, "#ff5378", 14);
      ctx.strokeStyle = "#ffe1e8"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(h.x - 4, h.y - 4); ctx.lineTo(h.x + 4, h.y + 4);
      ctx.moveTo(h.x + 4, h.y - 4); ctx.lineTo(h.x - 4, h.y + 4); ctx.stroke();
    });
    particles.forEach(p => { ctx.globalAlpha = Math.max(0, p.life / p.max); glowCircle(p.x, p.y, 2.5, p.color, 5); ctx.globalAlpha = 1; });
    if (player) {
      if (player.invulnerable > 0 && Math.floor(player.invulnerable * 12) % 2 === 0) ctx.globalAlpha = .35;
      glowCircle(player.x, player.y, player.r, "#b8a2ff", 18);
      ctx.globalAlpha = 1; ctx.strokeStyle = "#f5f0ff"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(player.x, player.y, player.r + 4, 0, Math.PI * 2); ctx.stroke();
    }
    if (hitFlash > 0) { ctx.fillStyle = `rgba(255,83,120,${hitFlash * .25})`; ctx.fillRect(0, 0, W, H); }
  }
  function loop(now) {
    if (state !== "playing") return;
    const dt = Math.min((now - lastFrame) / 1000, .035);
    lastFrame = now;
    update(dt); draw();
    if (state === "playing") requestAnimationFrame(loop);
  }
  function setDirection(dir, active) { touch[dir] = active; }
  window.addEventListener("keydown", e => {
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," "].includes(e.key)) e.preventDefault();
    keys.add(k);
    if (e.key === "Escape" && (state === "playing" || state === "paused")) pauseGame();
    if ((e.key === "Enter" || e.key === " ") && (state === "ready" || state === "won" || state === "lost")) startGame();
  });
  window.addEventListener("keyup", e => keys.delete(e.key.length === 1 ? e.key.toLowerCase() : e.key));
  window.addEventListener("blur", () => { keys.clear(); Object.keys(touch).forEach(k => touch[k] = false); });
  document.querySelectorAll("[data-dir]").forEach(button => {
    const dir = button.dataset.dir;
    button.addEventListener("pointerdown", e => { e.preventDefault(); setDirection(dir, true); });
    ["pointerup","pointercancel","pointerleave"].forEach(ev => button.addEventListener(ev, () => setDirection(dir, false)));
  });
  startButton.addEventListener("click", () => state === "paused" ? pauseGame() : startGame());
  pauseButton.addEventListener("click", pauseGame);
  restartButton.addEventListener("click", () => {
    resetGame(); state = "ready"; pauseButton.disabled = true;
    showOverlay("Ready for another run?", "Collect 10 cyan orbs in 30 seconds. Red hazards cost you time.", "Start game");
    announce("Game reset.");
  });
  soundToggle.addEventListener("click", () => {
    soundOn = !soundOn;
    soundToggle.textContent = `Sound: ${soundOn ? "On" : "Off"}`;
    soundToggle.setAttribute("aria-pressed", String(soundOn));
    soundToggle.setAttribute("aria-label", soundOn ? "Turn sound off" : "Turn sound on");
    if (soundOn) tone(440, .08);
  });
  motionToggle.addEventListener("change", () => { reducedMotion = motionToggle.checked; draw(); });
  resetGame();
  showOverlay("Light up the arena.", "Collect 10 cyan orbs in 30 seconds. Red hazards cost you time.", "Start game");
})();