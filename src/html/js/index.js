// setTimeout(() => location.reload(), 5000);
let socket;
let firstRun = true;

class Message {
  constructor(message, type) {
    $('body').append(`<div class="${type}-message message">${message}</div>`);
    this._errorElement = $('body> *:last-child');
    this._errorElement.css('left',
        `${$(window).width() / 2 - this._errorElement.width() / 2}px`);
  }
}

$(ready);

function ready() {
  socketHandler();
  $('button#settings').on('click', onClick);
  $('div.darken-background').on('click', onDarkenBackgroundClick);
  if (getUrlVars().authorized) {
    const message = new Message('Spotify was successfully connected', 'info');
    setTimeout(() => {
      message._errorElement.remove();
      window.location.href = '/';
    }, 5000);
  }
}

function onClick() {
  $('div.darken-background').css('display', 'unset');
  centerElement();
  $(window).on('resize', centerElement);
}

function centerElement() {
  const settingsDialog = $('div.settings-dialog');
  settingsDialog.css('top',
      `${$(window).height() / 2 - parseInt(settingsDialog.height()) / 2}px`);
  settingsDialog.css('left',
      `${$(window).width() / 2 - parseInt(settingsDialog.width()) / 2}px`);
}

function onDarkenBackgroundClick(event) {
  if (event.target.className !== 'darken-background') return;
  $('div.darken-background').css('display', 'none');
  $(window).removeEventListener('resize');
}

function socketHandler() {
  socket = new WebSocket('ws://localhost:8889');
  socket.addEventListener('message', onMessageHandler);
  socket.addEventListener('error', onErrorHandler);
  socket.addEventListener('open', onOpenHandler);
  if (!firstRun) return;
  $('input#message').on('keyup', (e) => {
    if (e.keyCode === 13) {
      const message = $('input#message');
      if (message.val() === '') {
        const channelError = new Message('Please specify a message', 'error');
        setTimeout(() => channelError._errorElement.remove(), 5000);
        return;
      }
      socket.send(JSON.stringify({event: 'message', value: message.val()}));
      message.val('');
    }
  });
  $('button#connect-spotify').
      on('click', () => window.location.href = '/login');
  firstRun = false;
}

let webSocketError;

function onOpenHandler() {
  if (webSocketError) {
    webSocketError._errorElement.remove();
    webSocketError = undefined;
  }
}

function reconnect() {
  setTimeout(socketHandler, 5000);
}

let count = 0;

function onMessageHandler(event) {
  const data = JSON.parse(event.data);
  const value = data.value;
  switch (data.type) {
    case 'done':
      $('div.metadata-0').remove();
      count--;
      for (const div of $('div.metadata')) {
        div.className = `metadata metadata-${parseInt(
            div.className.split(/metadata-/)[1]) - 1}`;
        if (!isNaN(div.innerHTML)) {
          const newCount = parseInt(div.innerHTML) - 1;
          div.innerHTML = newCount === 0 ? 'Currently Playing' : newCount;
        }
      }
      break;
    case 'settings':
      const spotifyConnectionButton = $('button.connect-spotify');
      const discordButtons = $(
          'button.discord-bot-join, button.discord-bot-leave');
      const twitchInput = $('input#message');
      spotifyConnectionButton.addClass('btn');
      spotifyConnectionButton.removeClass('btn-disabled');
      discordButtons.addClass('btn');
      discordButtons.removeClass('btn-disabled');
      twitchInput.prop('disabled', false);
      for (const service of value.disabled.services) {
        switch (service) {
          case 'spotify':
            spotifyConnectionButton.addClass('btn-disabled');
            spotifyConnectionButton.removeClass('btn');
            break;
          case 'youtube':
            discordButtons.addClass('btn-disabled');
            discordButtons.removeClass('btn');
            break;
          case 'twitch':
            twitchInput.prop('disabled', true);
            break;
        }
      }
      const twitchUsername = $('input#twitch-username');
      const aliases = $('input#aliases');
      const commandAliases = $('select#commands-aliases');
      loadAliases(value);
      commandAliases.on('change', () => loadAliases(value));
      const disabledServices = $('input#disabled-services');
      const viewersRequiredSongSkip = $('input#viewers-required-song-skip');
      const maximumLength = $('input#maximum-length');
      const maximumRequests = $('input#maximum-requests');
      const modRoles = $('input#mod-roles');
      const prefix = $('input#prefix');
      twitchUsername.val(value.twitch.username);
      if (value.disabled.services.length !== 0) disabledServices.
          val(value.disabled.services.join(', '));
      viewersRequiredSongSkip.val(value.properties.skip.viewers);
      maximumLength.val(value.limitations.length);
      maximumRequests.val(value.limitations.requests);
      modRoles.val(value.discord['mod-roles'].join(', '));
      prefix.val(value.prefix);

      twitchUsername.on('keyup', () => socket.send(JSON.stringify(
          {
            event: 'twitch-username',
            value: twitchUsername.val(),
          },
      )));
      aliases.on('keyup', () => socket.send(JSON.stringify({
            event: 'aliases',
            value: {[commandAliases.val()]: aliases.val().split(', ')},
          },
      )));
      disabledServices.on('keyup', () => socket.send(JSON.stringify(
          {
            event: 'disabled-services',
            value: disabledServices.val().split(', '),
          },
      )));
      viewersRequiredSongSkip.on('keyup', () => socket.send(JSON.stringify(
          {
            event: 'viewers-required-song-skip',
            value: viewersRequiredSongSkip.val(),
          },
      )));
      maximumLength.on('keyup', () => socket.send(JSON.stringify(
          {
            event: 'maximum-length',
            value: maximumLength.val(),
          },
      )));
      maximumRequests.on('keyup', () => socket.send(JSON.stringify(
          {
            event: 'maximum-requests',
            value: maximumRequests.val(),
          },
      )));
      modRoles.on('keyup', () => socket.send(JSON.stringify(
          {
            event: 'mod-roles',
            value: modRoles.val().split(', '),
          },
      )));
      prefix.on('keyup', () => socket.send(JSON.stringify(
          {
            event: 'prefix',
            value: prefix.val(),
          },
      )));

      $('button#done').
          on('click', () => $('div.darken-background').css('display', 'none'));
      break;
    case 'songrequest':
      $('div.songrequests').append(`
    <div class="metadata metadata-${count}">${count === 0 ?
          'Currently Playing' :
          count}</div>
    <div class="metadata metadata-${count}">${value.title}</div>
    <div class="metadata metadata-${count}">${value.artists}</div>
    <div class="metadata metadata-${count}">${value.totalDuration}s</div>
    <div class="metadata metadata-${count}">${value.requester}</div>
    <div class="metadata metadata-${count}">${value.origin}</div>
    <div class="metadata metadata-${count}"><i class="fas fa-trash-alt" id="${count}"></i></div>`);
      count++;
      break;
  }
}

function loadAliases(value) {
  let savedAliases = [];
  for (let i = 0; i < Object.keys(value.commands).length; i++) {
    const key = Object.keys(value.commands)[i];
    const select = $('select#commands-aliases').val();
    if (key === select) {
      savedAliases = Object.values(value.commands)[i];
      break;
    }
  }
  if (savedAliases) $('input#aliases').val(savedAliases.join(', '));
}

function onErrorHandler(error) {
  if (error.target.readyState === 3) {
    webSocketError = new Message(
        'Could not connect to the WebSocket. Make sure the application is running!',
        'error');
    $('div.songrequests').html('            <div>#</div>\n' +
        '            <div>Title</div>\n' +
        '            <div>Artists</div>\n' +
        '            <div>Duration</div>\n' +
        '            <div>Requester</div>\n' +
        '            <div>Origin</div>\n' +
        '            <div>Moderation</div>');
    count = 0;
    reconnect();
    return;
  }
  console.log(error);
}

function getUrlVars() {
  const vars = {};
  const parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,
      (m, key, value) => {
        vars[key] = value;
      });
  return vars;
}
