const St = imports.gi.St;
const Main = imports.ui.main;
const Mainloop = imports.mainloop;
const Meta = imports.gi.Meta;

let label, text, button;

let timeoutID;

let activeSeconds;
let inBreak;

function _hideBreakMessage() {
  Main.uiGroup.remove_actor(text);
  text = null;
  inBreak = false;
}

function _showBreakMessage() {
  if (!text) {
    text = new St.Label({ style_class: 'takeabreak-label', text: "Take a break!" });
    Main.uiGroup.add_actor(text);
  }

  text.opacity = 255;

  let monitor = Main.layoutManager.primaryMonitor;

  text.set_position(monitor.x + Math.floor(monitor.width / 2 - text.width / 2),
    monitor.y + Math.floor(monitor.height / 2 - text.height / 2));

  inBreak = true;
  activeSeconds = 0;
  breakSeconds = 30;
}

function init() {
  button = new St.Bin({ style_class: 'panel-button',
    reactive: true,
    can_focus: true,
    x_fill: true,
    y_fill: false,
    track_hover: true });
  label = new St.Label({text: "Active"})

  button.set_child(label);
  button.connect('button-press-event', _showBreakMessage);

  activeSeconds = 0;
}

function timer() {
  if (inBreak) {
    breakSeconds--;
    if (breakSeconds > 0) {
      label.text = "Break: " + breakSeconds;
    } else {
      _hideBreakMessage();
    }
  } else {
    if (idleMonitor.get_idletime() > 5000) {
      activeSeconds--;
    } else {
      activeSeconds++;
    }

    if (activeSeconds > 0) {
      label.text = "Active: " + activeSeconds;
    } else {
      activeSeconds = 0;
      label.text = "Inactive";
    }

    if (activeSeconds > 180) {
      _showBreakMessage();
    }
  }

  return true
}


function enable() {
  Main.panel._rightBox.insert_child_at_index(button, 0);
  timeoutID = Mainloop.timeout_add_seconds(1, timer);
  idleMonitor = Meta.IdleMonitor.get_core()
}

function disable() {
  Main.panel._rightBox.remove_child(button);
  Mainloop.source_remove(timeoutID);
}
