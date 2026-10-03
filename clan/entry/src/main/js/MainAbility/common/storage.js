import file from "@system.file";

var SAVE_DIR = "internal://app/calendar/events";

function eventPath(dateKey) {
  return SAVE_DIR + "/" + dateKey + ".json";
}

function ensureDir(cb) {
  file.mkdir({
    uri: SAVE_DIR,
    recursive: true,
    success: function () { cb(); },
    fail: function (data, code) {
      file.access({
        uri: SAVE_DIR,
        success: function () { cb(); },
        fail: function () { console.error("mkdir failed: " + code); cb(); }
      });
    }
  });
}

export function loadEvents(dateKey, cb) {
  ensureDir(function () {
    file.readText({
      uri: eventPath(dateKey),
      encoding: "UTF-8",
      success: function (data) {
        try { cb(JSON.parse(data.text) || []); } catch (e) { cb([]); }
      },
      fail: function () { cb([]); }
    });
  });
}

export function saveEvents(dateKey, events, cb) {
  ensureDir(function () {
    file.writeText({
      uri: eventPath(dateKey),
      text: JSON.stringify(events || []),
      encoding: "UTF-8",
      append: false,
      success: function () { if (cb) { cb(true); } },
      fail: function (data, code) { console.error("write failed: " + code); if (cb) { cb(false); } }
    });
  });
}

export function addEvent(dateKey, title, time, cb) {
  loadEvents(dateKey, function (list) {
    list.push({ id: Date.now(), title: title, time: time || "" });
    saveEvents(dateKey, list, function () { cb(list); });
  });
}

export function removeEvent(dateKey, eventId, cb) {
  loadEvents(dateKey, function (list) {
    var filtered = [];
    for (var i = 0; i < list.length; i++) {
      if (list[i].id !== eventId) { filtered.push(list[i]); }
    }
    saveEvents(dateKey, filtered, function () { cb(filtered); });
  });
}
