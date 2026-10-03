import router from "@ohos.router";
import { loadEvents, addEvent, removeEvent } from "../../common/storage.js";

function pad(n) { return n < 10 ? "0" + n : "" + n; }
function dateKey(y, m, d) { return y + "-" + pad(m + 1) + "-" + pad(d); }

export default {
  data: {
    year: 0, month: 0, day: 0,
    events: [], showDialog: false, draftTitle: "", draftTime: "",
    weekLabels: [], monthNames: []
  },
  onInit: function () {
    var p = router.getParams();
    if (p && p.year) { this.year = p.year; this.month = p.month; this.day = p.day; }
    this.weekLabels = this.$t("strings.week_days");
    this.monthNames = this.$t("strings.month_names");
    this.fetchEvents();
  },
  onDestroy: function () { this.events = []; },
  dateKeyValue: function () { return dateKey(this.year, this.month, this.day); },
  fetchEvents: function () {
    var self = this;
    loadEvents(self.dateKeyValue(), function (list) { self.events = list; });
  },
  weekdayLabel: function () {
    var d = new Date(this.year, this.month, this.day).getDay();
    return this.weekLabels[(d + 6) % 7];
  },
  monthLabel: function () { return this.monthNames[this.month]; },
  goBack: function () { router.back(); },
  onAdd: function () { this.draftTitle = ""; this.draftTime = ""; this.showDialog = true; },
  hideDialog: function () { this.showDialog = false; },
  onDraftTitleChange: function (e) { this.draftTitle = e.value || ""; },
  onDraftTimeChange: function (e) { this.draftTime = e.value || ""; },
  onSaveDraft: function () {
    if (!this.draftTitle) { return; }
    var self = this;
    self.showDialog = false;
    addEvent(self.dateKeyValue(), self.draftTitle, self.draftTime, function (list) { self.events = list; });
  },
  onDelete: function (idx) {
    var item = this.events[idx];
    if (!item) { return; }
    var self = this;
    removeEvent(self.dateKeyValue(), item.id, function (list) { self.events = list; });
  }
};
