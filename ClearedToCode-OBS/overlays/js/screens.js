// Starting Soon / Be Right Back / Ending / Offline screens.
// Each page sets <body data-screen="..."> and loads this file.
(function () {
  const { cfg, esc, icons, duration } = CTC;
  const mode = document.body.dataset.screen;
  const hero = document.getElementById('hero');
  // ?demo (browser preview only) pretends 2.5 minutes have passed.
  const started = Date.now() - (CTC.demo ? 150000 : 0);
  const elapsed = () => (Date.now() - started) / 1000;

  const SCREENS = {
    starting: { kicker: 'Pre-flight', title: 'Starting<br>soon', text: "Grab a coffee — we're running the checklist." },
    brb: { kicker: 'Holding short', title: 'Be right<br>back', text: 'Stretch your legs. Back in a few minutes.' },
    ending: { kicker: 'On final approach', title: 'Thanks for<br>flying with us', text: 'Stream is wrapping up — stick around for the raid.' },
    offline: { kicker: 'Parked at the gate', title: 'Currently<br>offline', text: 'Follow so you get a notification when we take off next.' },
  };
  const s = SCREENS[mode];

  function scheduleHTML() {
    if (!cfg.schedule.length) return '';
    return '<div class="sched">' + cfg.schedule.map((d) =>
      '<div class="sched-item"><div class="sched-day">' + esc(d.day) + '</div><div class="sched-time">' + esc(d.time) + '</div></div>').join('') + '</div>';
  }

  let extra = '';
  if (mode === 'starting') {
    const steps = ['Avionics on', 'Fuel & weight set', 'Flight plan loaded', 'Chat checked in', 'Cleared for takeoff'];
    extra =
      '<div class="big-timer"><span id="timer">00:00</span><span class="kicker" id="timer-label">until takeoff</span></div>' +
      '<div class="route"><div class="route-track"><div class="route-fill" id="fill"></div></div>' +
      '<div class="route-plane" id="plane">' + icons.plane + '</div>' +
      '<div class="route-labels"><span class="kicker">Gate</span><span class="kicker">Takeoff</span></div></div>' +
      '<div class="checklist">' + steps.map((t) => '<div class="check"><i></i>' + esc(t) + '</div>').join('') + '</div>';
  } else if (mode === 'brb') {
    extra = '<div class="big-timer"><span class="kicker">Away for</span><span id="timer">00:00</span></div>';
  } else {
    extra = scheduleHTML();
  }

  hero.innerHTML =
    '<div class="kicker">' + esc(s.kicker) + '</div>' +
    '<h1>' + s.title + '</h1>' +
    '<p>' + esc(s.text) + '</p>' + extra;

  if (mode === 'starting') {
    const total = Math.max(1, cfg.startingMinutes * 60);
    const checks = hero.querySelectorAll('.check');
    const update = () => {
      const left = total - elapsed();
      const pct = Math.min(1, elapsed() / total);
      document.getElementById('timer').textContent = duration(Math.ceil(Math.max(0, left)));
      document.getElementById('fill').style.width = pct * 100 + '%';
      document.getElementById('plane').style.left = pct * 100 + '%';
      checks.forEach((c, i) => c.classList.toggle('done', pct >= (i + 1) / checks.length - 0.001));
      if (left <= 0) document.getElementById('timer-label').textContent = 'any moment now';
    };
    update();
    setInterval(update, 1000);
  } else if (mode === 'brb') {
    const update = () => { document.getElementById('timer').textContent = duration(elapsed()); };
    update();
    setInterval(update, 1000);
  }

  document.getElementById('runway').innerHTML = Array.from({ length: 9 }, (_, i) =>
    '<i style="animation-delay:' + (i * 0.18).toFixed(2) + 's"></i>').join('');
})();
