// Read-only Twitch chat connection. Logs in anonymously, so no password or
// token is needed: it can only read public chat events for your channel.
(function () {
  function unescapeTag(v) {
    return v.replace(/\\(.)/g, (_, c) => ({ s: ' ', ':': ';', '\\': '\\', r: '\r', n: '\n' }[c] || c));
  }

  function parse(line) {
    const msg = { tags: {}, prefix: '', command: '', params: [], text: null };
    let rest = line;
    if (rest[0] === '@') {
      const i = rest.indexOf(' ');
      for (const kv of rest.slice(1, i).split(';')) {
        const j = kv.indexOf('=');
        if (j < 0) msg.tags[kv] = '';
        else msg.tags[kv.slice(0, j)] = unescapeTag(kv.slice(j + 1));
      }
      rest = rest.slice(i + 1);
    }
    if (rest[0] === ':') {
      const i = rest.indexOf(' ');
      msg.prefix = rest.slice(1, i);
      rest = rest.slice(i + 1);
    }
    const t = rest.indexOf(' :');
    if (t >= 0) {
      msg.text = rest.slice(t + 2);
      rest = rest.slice(0, t);
    }
    const parts = rest.split(' ').filter(Boolean);
    msg.command = parts.shift() || '';
    msg.params = parts;
    msg.login = msg.tags.login || msg.prefix.split('!')[0];
    return msg;
  }

  function connect(channel, on) {
    channel = String(channel || '').trim().replace(/^#/, '').toLowerCase();
    if (!channel) {
      on.status && on.status('no-channel');
      return;
    }
    let ws;
    let delay = 1000;

    function open() {
      on.status && on.status('connecting');
      ws = new WebSocket('wss://irc-ws.chat.twitch.tv:443');
      ws.onopen = () => {
        ws.send('CAP REQ :twitch.tv/tags twitch.tv/commands');
        ws.send('PASS SCHMOOPIIE');
        ws.send('NICK justinfan' + (10000 + Math.floor(Math.random() * 80000)));
        ws.send('JOIN #' + channel);
      };
      ws.onmessage = (e) => {
        for (const line of String(e.data).split('\r\n')) {
          if (line) handle(parse(line));
        }
      };
      ws.onclose = () => {
        on.status && on.status('offline');
        setTimeout(open, delay);
        delay = Math.min(delay * 2, 30000);
      };
    }

    function handle(m) {
      const tags = m.tags;
      const user = tags['display-name'] || m.login;
      switch (m.command) {
        case 'PING':
          ws.send('PONG :' + (m.text || 'tmi.twitch.tv'));
          break;
        case 'JOIN':
        case 'ROOMSTATE':
          delay = 1000;
          on.status && on.status('online');
          break;
        case 'RECONNECT':
          ws.close();
          break;
        case 'PRIVMSG': {
          let text = m.text || '';
          let action = false;
          if (text.startsWith('\u0001ACTION ') && text.endsWith('\u0001')) {
            text = text.slice(8, -1);
            action = true;
          }
          const data = { id: tags.id, login: m.login, user, color: tags.color, badges: tags.badges || '', emotes: tags.emotes || '', bits: +tags.bits || 0, text, action };
          on.message && on.message(data);
          if (data.bits && on.cheer) on.cheer({ user, bits: data.bits });
          break;
        }
        case 'USERNOTICE': {
          const id = tags['msg-id'];
          const p = (k) => tags['msg-param-' + k];
          if ((id === 'sub' || id === 'resub') && on.sub) {
            on.sub({ user, months: +p('cumulative-months') || 1, kind: id });
          } else if (id === 'subgift' && on.gift) {
            on.gift({ user, login: m.login, recipient: p('recipient-display-name'), count: 1, single: true });
          } else if (id === 'submysterygift' && on.gift) {
            on.gift({ user, login: m.login, count: +p('mass-gift-count') || 1, single: false });
          } else if (id === 'raid' && on.raid) {
            on.raid({ user: p('displayName') || user, viewers: +p('viewerCount') || 0 });
          }
          if (on.notice && tags['system-msg']) on.notice({ id: tags.id, text: tags['system-msg'], kind: id });
          break;
        }
        case 'CLEARMSG':
          on.remove && on.remove({ id: tags['target-msg-id'] });
          break;
        case 'CLEARCHAT':
          on.remove && on.remove(m.text ? { login: m.text.toLowerCase() } : { all: true });
          break;
      }
    }

    open();
  }

  window.CTC = window.CTC || {};
  window.CTC.twitch = { connect, parse };
})();
