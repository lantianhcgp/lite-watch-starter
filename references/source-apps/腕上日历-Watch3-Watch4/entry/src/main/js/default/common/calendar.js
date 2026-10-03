let calendar = {
    gregorianYear: null,
    gregorianMonth: null,
    gregorianDay: null,
    weekday: null,
    lunarYear: null,
    lunarMonth: null,
    lunarDay: null,
    monthDays: null,
    lunarYearCn: "",
    lunarMonthCn: "",
    lunarDayCn: "",
    zodiacYear: ""
},
    lunarInfo = [19416, 19168, 42352, 21717, 53856, 55632, 91476, 22176, 39632, 21970, 19168, 42422, 42192, 53840, 119381, 46400, 54944, 44450, 38320, 84343, 18800, 42160, 46261, 27216, 27968, 109396, 11104, 38256, 21234, 18800, 25958, 54432, 59984, 28309, 23248, 11104, 100067, 37600, 116951, 51536, 54432, 120998, 46416, 22176, 107956, 9680, 37584, 53938, 43344, 46423, 27808, 46416, 86869, 19872, 42448, 83315, 21200, 43432, 59728, 27296, 44710, 43856, 19296, 43748, 42352, 21088, 62051, 55632, 23383, 22176, 38608, 19925, 19152, 42192, 54484, 53840, 54616, 46400, 46496, 103846, 38320, 18864, 43380, 42160, 45690, 27216, 27968, 44870, 43872, 38256, 19189, 18800, 25776, 29859, 59984, 27480, 21952, 43872, 38613, 37600, 51552, 55636, 54432, 55888, 30034, 22176, 43959, 9680, 37584, 51893, 43344, 46240, 47780, 44368, 21977, 19360, 42416, 86390, 21168, 43312, 31060, 27296, 44368, 23378, 19296, 42726, 42208, 53856, 60005, 54576, 23200, 30371, 38608, 19415, 19152, 42192, 118966, 53840, 54560, 56645, 46496, 22224, 21938, 18864, 42359, 42160, 43600, 111189, 27936, 44448],
    zodiacs = ["\u9F20", "\u725B", "\u864E", "\u5154", "\u9F99", "\u86C7", "\u9A6C", "\u7F8A", "\u7334", "\u9E21", "\u72D7", "\u732A"],
    Gan = ["\u7532", "\u4E59", "\u4E19", "\u4E01", "\u620A", "\u5DF1", "\u5E9A", "\u8F9B", "\u58EC", "\u7678"],
    Zhi = ["\u5B50", "\u4E11", "\u5BC5", "\u536F", "\u8FB0", "\u5DF3", "\u5348", "\u672A", "\u7533", "\u9149", "\u620C", "\u4EA5"],
    weekday = ["\u661F\u671F\u65E5", "\u661F\u671F\u4E00", "\u661F\u671F\u4E8C", "\u661F\u671F\u4E09", "\u661F\u671F\u56DB", "\u661F\u671F\u4E94", "\u661F\u671F\u516D"],
    now = new Date(), GY = now.getFullYear(), GM = now.getMonth(), GD = now.getDate(), year = now.getFullYear(),
    month = now.getMonth() + 1, date = now.getDate();

function cyclical(a) {
    return Gan[a%10] + Zhi[a%12]
}

function lYearDays(b) {
    let a, c = 348;
    for (a = 32768; a > 8; a >>= 1)c += lunarInfo[b-1900] & a ? 1 : 0;
    return c + leapDays(b)
}

function leapDays(a) {
    return leapMonth(a) ? 65536 & lunarInfo[a-1900] ? 30 : 29 : 0
}

function leapMonth(a) {
    return 15 & lunarInfo[a-1900]
}

function monthDays(a, b) {
    return lunarInfo[a-1900] & 65536 >> b ? 30 : 29
}

function Lunar(h) {
    let a, d = 0, i = new Date(1900, 0, 31), b = Math.floor((h - i) / 864e5), e = 14;
    for (a = 1900; a < 2050 && b > 0; a++)b -= d = lYearDays(a), e += 12;
    b < 0 && (b += d, a--, e -= 12);
    let g = a, j = a - 1864, f = leapMonth(a), c = !1;
    for (a = 1; a < 13 && b > 0; a++)f > 0 && a === f + 1 && !1 === c ? (--a, c = !0, d = leapDays(g)) : d = monthDays(g, a),!0 === c && a === f + 1 && (c = !1), b -= d,!1 === c && e++;
    return 0 === b && f > 0 && a === f + 1 && (c ? c = !1 : (c = !0, --a, --e)), b < 0 && (b += d, --a, --e), {
        year: g,
        month: a,
        day: b + 1,
        isLeap: c,
        leap: f,
        yearCyl: j,
        dayCyl: b + 40,
        monCyl: e
    }
}

function cDay(b, c) {
    let d = ["\u65E5", "\u4E00", "\u4E8C", "\u4E09", "\u56DB", "\u4E94", "\u516D", "\u4E03", "\u516B", "\u4E5D", "\u5341"],
        e, a;
    switch (e = b > 10 ? "\u5341" + d[b-10] : d[b], e += "\u6708", c) {
        case 10:
            a = "\u521D\u5341";
            break;
        case 20:
            a = "\u4E8C\u5341";
            break;
        case 30:
            a = "\u4E09\u5341";
            break;
        default:
            a = ["\u521D", "\u5341", "\u5EFF", "\u5345", ""][Math.floor(c / 10)] + d[c%10]
    }
    return { lunarMonthCn: e, lunarDayCn: a }
}

calendar.monthDays = monthDays(), calendar.gregorianYear = year, calendar.gregorianMonth = month, calendar.gregorianDay = date, calendar.weekday = weekday[now.getDay()];
let sDObj = new Date(GY, GM, GD), lDObj = new Lunar(sDObj);
calendar.lunarYear = lDObj.year, calendar.lunarMonth = lDObj.month, calendar.lunarDay = lDObj.day, calendar.zodiacYear = zodiacs[(calendar.lunarYear - 4)%12], calendar.lunarYearCn = cyclical(calendar.lunarYear - 1900 + 36), calendar.lunarMonthCn = cDay(lDObj.month, lDObj.day).lunarMonthCn, calendar.lunarDayCn = cDay(lDObj.month, lDObj.day).lunarDayCn;

export { calendar,monthDays }