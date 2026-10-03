import router from "@ohos.router";
import { getToday, daysInMonth, buildMonthGrid, normalizeDay } from "../../common/calendar.js";

export default {
  data: {
    year: 0, month: 0, selectedDay: 1,
    grid: [], weekLabels: [], monthNames: [],
    today: { year: 0, month: 0, day: 0 }
  },
  onInit: function () {
    var t = getToday();
    this.today = t;
    this.year = t.year;
    this.month = t.month;
    this.selectedDay = t.day;
    this.weekLabels = this.$t("strings.week_days");
    this.monthNames = this.$t("strings.month_names");
    this.rebuildGrid();
  },
  onDestroy: function () { this.grid = []; },
  title: function () {
    var m = this.monthNames[this.month];
    return this.year === this.today.year ? m : m + " " + this.year;
  },
  rebuildGrid: function () {
    this.grid = buildMonthGrid(this.year, this.month);
    this.selectedDay = normalizeDay(this.year, this.month, this.selectedDay);
  },
  prevMonth: function () {
    var y = this.year, m = this.month - 1;
    if (m < 0) { m = 11; y = y - 1; }
    this.year = y; this.month = m; this.rebuildGrid();
  },
  nextMonth: function () {
    var y = this.year, m = this.month + 1;
    if (m > 11) { m = 0; y = y + 1; }
    this.year = y; this.month = m; this.rebuildGrid();
  },
  goToday: function () {
    var t = getToday();
    this.year = t.year; this.month = t.month; this.selectedDay = t.day;
    this.rebuildGrid();
  },
  onPickDay: function (cell) {
    if (!cell || cell.type !== "day") { return; }
    this.selectedDay = cell.day;
  },
  openDay: function () {
    router.push({ uri: "pages/day/day", params: { year: this.year, month: this.month, day: this.selectedDay } });
  }
};
