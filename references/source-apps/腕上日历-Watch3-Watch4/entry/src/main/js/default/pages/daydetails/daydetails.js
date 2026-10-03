let lunarInfo = [19416, 19168, 42352, 21717, 53856, 55632, 91476, 22176, 39632, 21970, 19168, 42422, 42192, 53840, 119381, 46400, 54944, 44450, 38320, 84343, 18800, 42160, 46261, 27216, 27968, 109396, 11104, 38256, 21234, 18800, 25958, 54432, 59984, 28309, 23248, 11104, 100067, 37600, 116951, 51536, 54432, 120998, 46416, 22176, 107956, 9680, 37584, 53938, 43344, 46423, 27808, 46416, 86869, 19872, 42448, 83315, 21200, 43432, 59728, 27296, 44710, 43856, 19296, 43748, 42352, 21088, 62051, 55632, 23383, 22176, 38608, 19925, 19152, 42192, 54484, 53840, 54616, 46400, 46496, 103846, 38320, 18864, 43380, 42160, 45690, 27216, 27968, 44870, 43872, 38256, 19189, 18800, 25776, 29859, 59984, 27480, 21952, 43872, 38613, 37600, 51552, 55636, 54432, 55888, 30034, 22176, 43959, 9680, 37584, 51893, 43344, 46240, 47780, 44368, 21977, 19360, 42416, 86390, 21168, 43312, 31060, 27296, 44368, 23378, 19296, 42726, 42208, 53856, 60005, 54576, 23200, 30371, 38608, 19415, 19152, 42192, 118966, 53840, 54560, 56645, 46496, 22224, 21938, 18864, 42359, 42160, 43600, 111189, 27936, 44448];

function lYearDays(b) {
    let a, c = 348;
    for (a = 32768; a > 8; a >>= 1) c += lunarInfo[b-1900] & a ? 1 : 0;
    return c + leapDays(b)
}

function leapDays(a) {
    return leapMonth(a) ? 65536 & lunarInfo[a-1900] ? 30 : 29 : 0
}

function monthDays(a, b) {
    return lunarInfo[a-1900] & 65536 >> b ? 30 : 29
}

function leapMonth(a) {
    return 15 & lunarInfo[a-1900]
}

function Lunar(h) {
    let a, d = 0, i = new Date(1900, 0, 31), b = Math.floor((h - i) / 864e5), e = 14;
    for (a = 1900; a < 2050 && b > 0; a++) b -= d = lYearDays(a), e += 12;
    b < 0 && (b += d, a--, e -= 12);
    let g = a, j = a - 1864, f = leapMonth(a), c = !1;
    for (a = 1; a < 13 && b > 0; a++) f > 0 && a === f + 1 && !1 === c ? (--a, c = !0, d = leapDays(g)) : d = monthDays(g, a),!0 === c && a === f + 1 && (c = !1), b -= d,!1 === c && e++;
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

export default {
    data: {
        year: 0,
        month: 0,
        day: 0,
        showyear: 0,
        showmonth: 0,
        showday: 0,
        weekday: '',
        lunarMonth: 0,
        lunarDay: 0,
        lunarMonthCn: '',
        lunarDayCn: '',
        lunarYearCn: '',
        zodiacYear: '',
        solarTerm: '',
        empty_string: '',
        gregorianterm: '',
        monthganzhi: '',
        dayganzhi: '',
        right_if: true,
        left_if: true,
        value: 0,
        Yi: '',
        Ji: '',
        from: "",
        DAY_YI_JI: "",
        lastpagesyear: "",
        lastpagesmonth: "",
        lastpagesfrom: "",
        pagechange: false,
        datachange: false,
        JIA_ZI: ["\u7532\u5B50", "\u4E59\u4E11", "\u4E19\u5BC5", "\u4E01\u536F", "\u620A\u8FB0", "\u5DF1\u5DF3", "\u5E9A\u5348", "\u8F9B\u672A", "\u58EC\u7533", "\u7678\u9149", "\u7532\u620C", "\u4E59\u4EA5", "\u4E19\u5B50", "\u4E01\u4E11", "\u620A\u5BC5", "\u5DF1\u536F", "\u5E9A\u8FB0", "\u8F9B\u5DF3", "\u58EC\u5348", "\u7678\u672A", "\u7532\u7533", "\u4E59\u9149", "\u4E19\u620C", "\u4E01\u4EA5", "\u620A\u5B50", "\u5DF1\u4E11", "\u5E9A\u5BC5", "\u8F9B\u536F", "\u58EC\u8FB0", "\u7678\u5DF3", "\u7532\u5348", "\u4E59\u672A", "\u4E19\u7533", "\u4E01\u9149", "\u620A\u620C", "\u5DF1\u4EA5", "\u5E9A\u5B50", "\u8F9B\u4E11", "\u58EC\u5BC5", "\u7678\u536F", "\u7532\u8FB0", "\u4E59\u5DF3", "\u4E19\u5348", "\u4E01\u672A", "\u620A\u7533", "\u5DF1\u9149", "\u5E9A\u620C", "\u8F9B\u4EA5", "\u58EC\u5B50", "\u7678\u4E11", "\u7532\u5BC5", "\u4E59\u536F", "\u4E19\u8FB0", "\u4E01\u5DF3", "\u620A\u5348", "\u5DF1\u672A", "\u5E9A\u7533", "\u8F9B\u9149", "\u58EC\u620C", "\u7678\u4EA5",],
        YI_JI: ["\u796D\u7940", "\u7948\u798F", "\u6C42\u55E3", "\u5F00\u5149", "\u5851\u7ED8", "\u9F50\u91AE", "\u658B\u91AE", "\u6C90\u6D74", "\u916C\u795E", "\u9020\u5E99", "\u7940\u7076", "\u711A\u9999", "\u8C22\u571F", "\u51FA\u706B", "\u96D5\u523B", "\u5AC1\u5A36", "\u8BA2\u5A5A", "\u7EB3\u91C7", "\u95EE\u540D", "\u7EB3\u5A7F", "\u5F52\u5B81", "\u5B89\u5E8A", "\u5408\u5E10", "\u51A0\u7B04", "\u8BA2\u76DF", "\u8FDB\u4EBA\u53E3", "\u88C1\u8863", "\u633D\u9762", "\u5F00\u5BB9", "\u4FEE\u575F", "\u542F\u94BB", "\u7834\u571F", "\u5B89\u846C", "\u7ACB\u7891", "\u6210\u670D", "\u9664\u670D", "\u5F00\u751F\u575F", "\u5408\u5BFF\u6728", "\u5165\u6B93", "\u79FB\u67E9", "\u666E\u6E21", "\u5165\u5B85", "\u5B89\u9999", "\u5B89\u95E8", "\u4FEE\u9020", "\u8D77\u57FA", "\u52A8\u571F", "\u4E0A\u6881", "\u7AD6\u67F1", "\u5F00\u4E95\u5F00\u6C60", "\u4F5C\u9642\u653E\u6C34", "\u62C6\u5378", "\u7834\u5C4B", "\u574F\u57A3", "\u8865\u57A3", "\u4F10\u6728\u505A\u6881", "\u4F5C\u7076", "\u89E3\u9664", "\u5F00\u67F1\u773C", "\u7A7F\u5C4F\u6247\u67B6", "\u76D6\u5C4B\u5408\u810A", "\u5F00\u5395", "\u9020\u4ED3", "\u585E\u7A74", "\u5E73\u6CBB\u9053\u6D82", "\u9020\u6865", "\u4F5C\u5395", "\u7B51\u5824", "\u5F00\u6C60", "\u4F10\u6728", "\u5F00\u6E20", "\u6398\u4E95", "\u626B\u820D", "\u653E\u6C34", "\u9020\u5C4B", "\u5408\u810A", "\u9020\u755C\u7A20", "\u4FEE\u95E8", "\u5B9A\u78C9", "\u4F5C\u6881", "\u4FEE\u9970\u57A3\u5899", "\u67B6\u9A6C", "\u5F00\u5E02", "\u6302\u533E", "\u7EB3\u8D22", "\u6C42\u8D22", "\u5F00\u4ED3", "\u4E70\u8F66", "\u7F6E\u4EA7", "\u96C7\u5EB8", "\u51FA\u8D27\u8D22", "\u5B89\u673A\u68B0", "\u9020\u8F66\u5668", "\u7ECF\u7EDC", "\u915D\u917F", "\u4F5C\u67D3", "\u9F13\u94F8", "\u9020\u8239", "\u5272\u871C", "\u683D\u79CD", "\u53D6\u6E14", "\u7ED3\u7F51", "\u7267\u517B", "\u5B89\u7893\u78D1", "\u4E60\u827A", "\u5165\u5B66", "\u7406\u53D1", "\u63A2\u75C5", "\u89C1\u8D35", "\u4E58\u8239", "\u6E21\u6C34", "\u9488\u7078", "\u51FA\u884C", "\u79FB\u5F99", "\u5206\u5C45", "\u5243\u5934", "\u6574\u624B\u8DB3\u7532", "\u7EB3\u755C", "\u6355\u6349", "\u754B\u730E", "\u6559\u725B\u9A6C", "\u4F1A\u4EB2\u53CB", "\u8D74\u4EFB", "\u6C42\u533B", "\u6CBB\u75C5", "\u8BCD\u8BBC", "\u8D77\u57FA\u52A8\u571F", "\u7834\u5C4B\u574F\u57A3", "\u76D6\u5C4B", "\u9020\u4ED3\u5E93", "\u7ACB\u5238\u4EA4\u6613", "\u4EA4\u6613", "\u7ACB\u5238", "\u5B89\u673A", "\u4F1A\u53CB", "\u6C42\u533B\u7597\u75C5", "\u8BF8\u4E8B\u4E0D\u5B9C", "\u9980\u4E8B\u52FF\u53D6", "\u884C\u4E27", "\u65AD\u8681", "\u5F52\u5CAB", "\u65E0",]
    },
    async onShow() {
        var that = this;
        this.DAY_YI_JI = this.$r("strings.data");
        that.getdate();
        that.getdatestate();
        that.getdata();
        that.getholiday();
        that.getGanZhi();
        that.getYiJi();
    },
    getdate() {
        this.showyear = this.year
        this.showmonth = this.month
        this.showday = this.day
    },
    getdata() {
        let sDObj = new Date(this.showyear, this.showmonth - 1, this.showday);
        let lDObj = new Lunar(sDObj);
        this.lunarMonth = lDObj.month
        this.lunarDay = lDObj.day
        let zodiacs = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪']
        this.lunarYearCn = this.cyclical(lDObj.year - 1900 + 36)
        this.zodiacYear = zodiacs[(lDObj.year - 4) % 12]
        this.lunarMonthCn = cDay(lDObj.month, lDObj.day).lunarMonthCn
        this.lunarDayCn = cDay(lDObj.month, lDObj.day).lunarDayCn
        const date = new Date(this.showyear, this.showmonth - 1, this.showday);
        let weekday = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
        this.weekday = weekday[date.getDay()]
        this.solarTerm = this.getSolarTerm();
    },
    getGanZhi() {
        var firstNode = this.getTerm(this.showmonth * 2 - 1);
        var gzM = this.toGanZhi((this.showyear - 1900) * 12 + this.showmonth + 11);
        if (this.showday >= firstNode) {
            gzM = this.toGanZhi((this.showyear - 1900) * 12 + this.showmonth + 12);
        }
        this.monthganzhi = gzM
        let dayCyclical = Date.UTC(this.showyear, this.showmonth - 1, 1, 0, 0, 0, 0) / 86400000 + 25567 + 10;
        this.dayganzhi = this.toGanZhi(dayCyclical + this.showday - 1);
    },
    getYiJi() {
        let yi = (this.getDayYi(this.monthganzhi, this.dayganzhi))
        let ji = (this.getDayJi(this.monthganzhi, this.dayganzhi))
        let yi_string = ""
        let ji_string = ""
        for (let i = 0, len = yi.length;i < len; i++) {
            yi_string += yi[i] + (len - 1 === i ? '' : ' ')
        }
        for (let i = 0, len = ji.length; i < len; i++) {
            ji_string += ji[i] + (len - 1 === i ? '' : ' ')
        }
        this.Yi = yi_string
        this.Ji = ji_string
    },
    getTerm(e) {
        if (this.showyear < 1900 || this.showyear > 2100 || e < 1 || e > 24) return -1;
        var c = ["9778397bd097c36b0b6fc9274c91aa", "97b6b97bd19801ec9210c965cc920e", "97bcf97c3598082c95f8c965cc920f", "97bd0b06bdb0722c965ce1cfcc920f", "b027097bd097c36b0b6fc9274c91aa", "97b6b97bd19801ec9210c965cc920e", "97bcf97c359801ec95f8c965cc920f", "97bd0b06bdb0722c965ce1cfcc920f", "b027097bd097c36b0b6fc9274c91aa", "97b6b97bd19801ec9210c965cc920e", "97bcf97c359801ec95f8c965cc920f", "97bd0b06bdb0722c965ce1cfcc920f", "b027097bd097c36b0b6fc9274c91aa", "9778397bd19801ec9210c965cc920e", "97b6b97bd19801ec95f8c965cc920f", "97bd09801d98082c95f8e1cfcc920f", "97bd097bd097c36b0b6fc9210c8dc2", "9778397bd197c36c9210c9274c91aa", "97b6b97bd19801ec95f8c965cc920e", "97bd09801d98082c95f8e1cfcc920f", "97bd097bd097c36b0b6fc9210c8dc2", "9778397bd097c36c9210c9274c91aa", "97b6b97bd19801ec95f8c965cc920e", "97bcf97c3598082c95f8e1cfcc920f", "97bd097bd097c36b0b6fc9210c8dc2", "9778397bd097c36c9210c9274c91aa", "97b6b97bd19801ec9210c965cc920e", "97bcf97c3598082c95f8c965cc920f", "97bd097bd097c35b0b6fc920fb0722", "9778397bd097c36b0b6fc9274c91aa", "97b6b97bd19801ec9210c965cc920e", "97bcf97c3598082c95f8c965cc920f", "97bd097bd097c35b0b6fc920fb0722", "9778397bd097c36b0b6fc9274c91aa", "97b6b97bd19801ec9210c965cc920e", "97bcf97c359801ec95f8c965cc920f", "97bd097bd097c35b0b6fc920fb0722", "9778397bd097c36b0b6fc9274c91aa", "97b6b97bd19801ec9210c965cc920e", "97bcf97c359801ec95f8c965cc920f", "97bd097bd097c35b0b6fc920fb0722", "9778397bd097c36b0b6fc9274c91aa", "97b6b97bd19801ec9210c965cc920e", "97bcf97c359801ec95f8c965cc920f", "97bd097bd07f595b0b6fc920fb0722", "9778397bd097c36b0b6fc9210c8dc2", "9778397bd19801ec9210c9274c920e", "97b6b97bd19801ec95f8c965cc920f", "97bd07f5307f595b0b0bc920fb0722", "7f0e397bd097c36b0b6fc9210c8dc2", "9778397bd097c36c9210c9274c920e", "97b6b97bd19801ec95f8c965cc920f", "97bd07f5307f595b0b0bc920fb0722", "7f0e397bd097c36b0b6fc9210c8dc2", "9778397bd097c36c9210c9274c91aa", "97b6b97bd19801ec9210c965cc920e", "97bd07f1487f595b0b0bc920fb0722", "7f0e397bd097c36b0b6fc9210c8dc2", "9778397bd097c36b0b6fc9274c91aa", "97b6b97bd19801ec9210c965cc920e", "97bcf7f1487f595b0b0bb0b6fb0722", "7f0e397bd097c35b0b6fc920fb0722", "9778397bd097c36b0b6fc9274c91aa", "97b6b97bd19801ec9210c965cc920e", "97bcf7f1487f595b0b0bb0b6fb0722", "7f0e397bd097c35b0b6fc920fb0722", "9778397bd097c36b0b6fc9274c91aa", "97b6b97bd19801ec9210c965cc920e", "97bcf7f1487f531b0b0bb0b6fb0722", "7f0e397bd097c35b0b6fc920fb0722", "9778397bd097c36b0b6fc9274c91aa", "97b6b97bd19801ec9210c965cc920e", "97bcf7f1487f531b0b0bb0b6fb0722", "7f0e397bd07f595b0b6fc920fb0722", "9778397bd097c36b0b6fc9274c91aa", "97b6b97bd19801ec9210c9274c920e", "97bcf7f0e47f531b0b0bb0b6fb0722", "7f0e397bd07f595b0b0bc920fb0722", "9778397bd097c36b0b6fc9210c91aa", "97b6b97bd197c36c9210c9274c920e", "97bcf7f0e47f531b0b0bb0b6fb0722", "7f0e397bd07f595b0b0bc920fb0722", "9778397bd097c36b0b6fc9210c8dc2", "9778397bd097c36c9210c9274c920e", "97b6b7f0e47f531b0723b0b6fb0722", "7f0e37f5307f595b0b0bc920fb0722", "7f0e397bd097c36b0b6fc9210c8dc2", "9778397bd097c36b0b70c9274c91aa", "97b6b7f0e47f531b0723b0b6fb0721", "7f0e37f1487f595b0b0bb0b6fb0722", "7f0e397bd097c35b0b6fc9210c8dc2", "9778397bd097c36b0b6fc9274c91aa", "97b6b7f0e47f531b0723b0b6fb0721", "7f0e27f1487f595b0b0bb0b6fb0722", "7f0e397bd097c35b0b6fc920fb0722", "9778397bd097c36b0b6fc9274c91aa", "97b6b7f0e47f531b0723b0b6fb0721", "7f0e27f1487f531b0b0bb0b6fb0722", "7f0e397bd097c35b0b6fc920fb0722", "9778397bd097c36b0b6fc9274c91aa", "97b6b7f0e47f531b0723b0b6fb0721", "7f0e27f1487f531b0b0bb0b6fb0722", "7f0e397bd097c35b0b6fc920fb0722", "9778397bd097c36b0b6fc9274c91aa", "97b6b7f0e47f531b0723b0b6fb0721", "7f0e27f1487f531b0b0bb0b6fb0722", "7f0e397bd07f595b0b0bc920fb0722", "9778397bd097c36b0b6fc9274c91aa", "97b6b7f0e47f531b0723b0787b0721", "7f0e27f0e47f531b0b0bb0b6fb0722", "7f0e397bd07f595b0b0bc920fb0722", "9778397bd097c36b0b6fc9210c91aa", "97b6b7f0e47f149b0723b0787b0721", "7f0e27f0e47f531b0723b0b6fb0722", "7f0e397bd07f595b0b0bc920fb0722", "9778397bd097c36b0b6fc9210c8dc2", "977837f0e37f149b0723b0787b0721", "7f07e7f0e47f531b0723b0b6fb0722", "7f0e37f5307f595b0b0bc920fb0722", "7f0e397bd097c35b0b6fc9210c8dc2", "977837f0e37f14998082b0787b0721", "7f07e7f0e47f531b0723b0b6fb0721", "7f0e37f1487f595b0b0bb0b6fb0722", "7f0e397bd097c35b0b6fc9210c8dc2", "977837f0e37f14998082b0787b06bd", "7f07e7f0e47f531b0723b0b6fb0721", "7f0e27f1487f531b0b0bb0b6fb0722", "7f0e397bd097c35b0b6fc920fb0722", "977837f0e37f14998082b0787b06bd", "7f07e7f0e47f531b0723b0b6fb0721", "7f0e27f1487f531b0b0bb0b6fb0722", "7f0e397bd097c35b0b6fc920fb0722", "977837f0e37f14998082b0787b06bd", "7f07e7f0e47f531b0723b0b6fb0721", "7f0e27f1487f531b0b0bb0b6fb0722", "7f0e397bd07f595b0b0bc920fb0722", "977837f0e37f14998082b0787b06bd", "7f07e7f0e47f531b0723b0b6fb0721", "7f0e27f1487f531b0b0bb0b6fb0722", "7f0e397bd07f595b0b0bc920fb0722", "977837f0e37f14998082b0787b06bd", "7f07e7f0e47f149b0723b0787b0721", "7f0e27f0e47f531b0b0bb0b6fb0722", "7f0e397bd07f595b0b0bc920fb0722", "977837f0e37f14998082b0723b06bd", "7f07e7f0e37f149b0723b0787b0721", "7f0e27f0e47f531b0723b0b6fb0722", "7f0e397bd07f595b0b0bc920fb0722", "977837f0e37f14898082b0723b02d5", "7ec967f0e37f14998082b0787b0721", "7f07e7f0e47f531b0723b0b6fb0722", "7f0e37f1487f595b0b0bb0b6fb0722", "7f0e37f0e37f14898082b0723b02d5", "7ec967f0e37f14998082b0787b0721", "7f07e7f0e47f531b0723b0b6fb0722", "7f0e37f1487f531b0b0bb0b6fb0722", "7f0e37f0e37f14898082b0723b02d5", "7ec967f0e37f14998082b0787b06bd", "7f07e7f0e47f531b0723b0b6fb0721", "7f0e37f1487f531b0b0bb0b6fb0722", "7f0e37f0e37f14898082b072297c35", "7ec967f0e37f14998082b0787b06bd", "7f07e7f0e47f531b0723b0b6fb0721", "7f0e27f1487f531b0b0bb0b6fb0722", "7f0e37f0e37f14898082b072297c35", "7ec967f0e37f14998082b0787b06bd", "7f07e7f0e47f531b0723b0b6fb0721", "7f0e27f1487f531b0b0bb0b6fb0722", "7f0e37f0e366aa89801eb072297c35", "7ec967f0e37f14998082b0787b06bd", "7f07e7f0e47f149b0723b0787b0721", "7f0e27f1487f531b0b0bb0b6fb0722", "7f0e37f0e366aa89801eb072297c35", "7ec967f0e37f14998082b0723b06bd", "7f07e7f0e47f149b0723b0787b0721", "7f0e27f0e47f531b0723b0b6fb0722", "7f0e37f0e366aa89801eb072297c35", "7ec967f0e37f14998082b0723b06bd", "7f07e7f0e37f14998083b0787b0721", "7f0e27f0e47f531b0723b0b6fb0722", "7f0e37f0e366aa89801eb072297c35", "7ec967f0e37f14898082b0723b02d5", "7f07e7f0e37f14998082b0787b0721", "7f07e7f0e47f531b0723b0b6fb0722", "7f0e36665b66aa89801e9808297c35", "665f67f0e37f14898082b0723b02d5", "7ec967f0e37f14998082b0787b0721", "7f07e7f0e47f531b0723b0b6fb0722", "7f0e36665b66a449801e9808297c35", "665f67f0e37f14898082b0723b02d5", "7ec967f0e37f14998082b0787b06bd", "7f07e7f0e47f531b0723b0b6fb0721", "7f0e36665b66a449801e9808297c35", "665f67f0e37f14898082b072297c35", "7ec967f0e37f14998082b0787b06bd", "7f07e7f0e47f531b0723b0b6fb0721", "7f0e26665b66a449801e9808297c35", "665f67f0e37f1489801eb072297c35", "7ec967f0e37f14998082b0787b06bd", "7f07e7f0e47f531b0723b0b6fb0721", "7f0e27f1487f531b0b0bb0b6fb0722"][this.showyear-1900],
            b = [parseInt("0x" + c.substr(0, 5)).toString(), parseInt("0x" + c.substr(5, 5)).toString(), parseInt("0x" + c.substr(10, 5)).toString(), parseInt("0x" + c.substr(15, 5)).toString(), parseInt("0x" + c.substr(20, 5)).toString(), parseInt("0x" + c.substr(25, 5)).toString()];
        return parseInt([b[0].substr(0, 1), b[0].substr(1, 2), b[0].substr(3, 1), b[0].substr(4, 2), b[1].substr(0, 1), b[1].substr(1, 2), b[1].substr(3, 1), b[1].substr(4, 2), b[2].substr(0, 1), b[2].substr(1, 2), b[2].substr(3, 1), b[2].substr(4, 2), b[3].substr(0, 1), b[3].substr(1, 2), b[3].substr(3, 1), b[3].substr(4, 2), b[4].substr(0, 1), b[4].substr(1, 2), b[4].substr(3, 1), b[4].substr(4, 2), b[5].substr(0, 1), b[5].substr(1, 2), b[5].substr(3, 1), b[5].substr(4, 2),][e-1])
    },
    toGanZhi(offset) {
        var Gan = ["\u7532", "\u4e59", "\u4e19", "\u4e01", "\u620a", "\u5df1", "\u5e9a", "\u8f9b", "\u58ec", "\u7678"]
        var Zhi = ["\u5b50", "\u4e11", "\u5bc5", "\u536f", "\u8fb0", "\u5df3", "\u5348", "\u672a", "\u7533", "\u9149", "\u620c", "\u4ea5"]
        return Gan[offset%10] + Zhi[offset%12];
    },
    getholiday() {
        let month = this.showmonth
        let day = this.showday
        let lunarmonth = this.lunarMonth
        let lunarday = this.lunarDay
        var dayIndex = [6, 0, 1, 2, 3, 4, 5];
        var mothersDayDate = (7 - dayIndex[new Date(this.year, 4, 1).getDay()]) + 7;
        var fathersDayDate = (7 - dayIndex[new Date(this.year, 5, 1).getDay()]) + 14;
        if ((month == 1) && (day == 1)) {
            this.gregorianterm = '元旦'
        } else if ((lunarmonth == 12) && (lunarday == 23)) {
            this.gregorianterm = '小年'
        } else if ((lunarmonth == 12) && (lunarday == monthDays(Number(this.showyear) - 1, 12))) {
            this.gregorianterm = '除夕'
        } else if ((lunarmonth == 1) && (lunarday == 1)) {
            this.gregorianterm = '春节'
        } else if ((lunarmonth == 1) && (lunarday == 15)) {
            this.gregorianterm = '元宵节'
        } else if ((month == 2) && (day == 14)) {
            this.gregorianterm = '情人节'
        } else if ((month == 3) && (day == 8)) {
            this.gregorianterm = '妇女节'
        } else if ((month == 3) && (day == 12)) {
            this.gregorianterm = '植树节'
        } else if ((month == 4) && ((day == 4) || (day == 5))) {
            if ((this.isLeapYear(this.year) || this.isLeapYear(this.year - 1)) && day == 4) {
                this.gregorianterm = '清明节'
            } else if (!(this.isLeapYear(this.year) || this.isLeapYear(this.year - 1)) && day == 5) {
                this.gregorianterm = '清明节'
            }
        } else if ((month == 4) && (day == 1)) {
            this.gregorianterm = '愚人节'
        } else if ((month == 5) && (day == 1)) {
            this.gregorianterm = '劳动节'
        } else if ((month == 5) && (day == 4)) {
            this.gregorianterm = '青年节'
        } else if ((month == 5) && (day == mothersDayDate)) {
            this.gregorianterm = '母亲节'
        } else if ((month == 6) && (day == 1)) {
            this.gregorianterm = '儿童节'
        } else if ((lunarmonth == 5) && (lunarday == 5)) {
            this.gregorianterm = '端午节'
        } else if ((month == 6) && (day == fathersDayDate)) {
            this.gregorianterm = '父亲节'
        } else if ((month == 7) && (day == 1)) {
            this.gregorianterm = '建党节'
        } else if ((month == 8) && (day == 1)) {
            this.gregorianterm = '建军节'
        } else if ((lunarmonth == 8) && (lunarday == 15)) {
            this.gregorianterm = '中秋节'
        } else if ((month == 9) && (day == 10)) {
            this.gregorianterm = '教师节'
        } else if ((lunarmonth == 9) && (lunarday == 9)) {
            this.gregorianterm = '重阳节'
        } else if ((lunarmonth == 7) && (lunarday == 7)) {
            this.gregorianterm = '七夕节'
        } else if ((month == 10) && (day == 1)) {
            this.gregorianterm = '国庆节'
        } else if ((month == 12) && (day == 24)) {
            this.gregorianterm = '平安夜'
        } else if ((month == 12) && (day == 25)) {
            this.gregorianterm = '圣诞节'
        }
        if (this.solarTerm != "") {
            if (this.gregorianterm != '') {
                this.empty_string = ' '
            }
        }
    },
    hex(b) {
        var a = b.toString(16);
        return a.length < 2 && (a = "0" + a), a.toUpperCase();
    },
    getJiaZiIndex(b) {
        for (var a = 0, c = this.JIA_ZI.length; a < c; a++)
        if (this.JIA_ZI[a] == b) return a;
        return -1;
    },
    getDayYi(l, m) {
        for (var c = [], i = this.hex(this.getJiaZiIndex(m)), n = this.hex(this.getJiaZiIndex(l)), d = this.DAY_YI_JI,
            g = d.indexOf(i + "=");g > -1; ) {
            var a, h, e, b = d = d.substr(g + 3);
            b.indexOf("=") > -1 && (b = b.substr(0, b.indexOf("=") - 2));
            var j = !1, k = b.substr(0, b.indexOf(":"));
            for (a = 0, e = k.length; a < e; a += 2) if ((h = k.substr(a, 2)) == n) {
                j = !0;
                break
            }
            if (j) {
                var f = b.substr(b.indexOf(":") + 1);
                for (a = 0, e = (f = f.substr(0, f.indexOf(","))).length; a < e; a += 2) h = f.substr(a, 2), c.push(this.YI_JI[parseInt(h, 16)]);
                break
            }
            g = d.indexOf(i + "=")
        }
        return c.length < 1 && c.push("\u65E0"), c;
    },
    getDayJi(l, m) {
        for (var c = [], h = this.hex(this.getJiaZiIndex(m)), n = this.hex(this.getJiaZiIndex(l)), d = this.DAY_YI_JI,
            f = d.indexOf(h + "=");f > -1; ) {
            var a, g, e, b = d = d.substr(f + 3);
            b.indexOf("=") > -1 && (b = b.substr(0, b.indexOf("=") - 2));
            var i = !1, j = b.substr(0, b.indexOf(":"));
            for (a = 0, e = j.length; a < e; a += 2) if ((g = j.substr(a, 2)) == n) {
                i = !0;
                break
            }
            if (i) {
                var k = b.substr(b.indexOf(",") + 1);
                for (a = 0, e = k.length; a < e; a += 2) g = k.substr(a, 2), c.push(this.YI_JI[parseInt(g, 16)]);
                break
            }
            f = d.indexOf(h + "=")
        }
        return c.length < 1 && c.push("\u65E0"), c;
    },
    cleandata() {
        this.weekday = ''
        this.lunarMonth = 0
        this.lunarDay = 0
        this.lunarMonthCn = ''
        this.lunarDayCn = ''
        this.lunarYearCn = ''
        this.zodiacYear = ''
        this.solarTerm = ''
        this.empty_string = ''
        this.gregorianterm = ''
        this.right_if = true
        this.left_if = true
    },
    isLeapYear(year) {
        if (((year % 4) == 0) && ((year % 100) != 0) || ((year % 400) == 0)) {
            return true;
        } else {
            return false;
        }
    },
    cyclical(num) {
        let Gan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
        let Zhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
        return (Gan[num % 10] + Zhi[num % 12])
    },
    getSolarTerm() {
        let solarTerm = ["\u5c0f\u5bd2", "\u5927\u5bd2", "\u7acb\u6625", "\u96e8\u6c34", "\u60ca\u86f0", "\u6625\u5206", "\u6e05\u660e", "\u8c37\u96e8", "\u7acb\u590f", "\u5c0f\u6ee1", "\u8292\u79cd", "\u590f\u81f3", "\u5c0f\u6691", "\u5927\u6691", "\u7acb\u79cb", "\u5904\u6691", "\u767d\u9732", "\u79cb\u5206", "\u5bd2\u9732", "\u971c\u964d", "\u7acb\u51ac", "\u5c0f\u96ea", "\u5927\u96ea", "\u51ac\u81f3"]
        var firstnode = this.getTerm(this.showmonth * 2 - 1)
        var secondnode = this.getTerm(this.showmonth * 2)
        var term = '';
        if (firstnode == this.showday) {
            term = solarTerm[this.showmonth * 2-2]
        }
        if (secondnode == this.showday) {
            term = solarTerm[this.showmonth * 2-1];
        }
        return term;
    },
    onSwipe(e) {
        if (e.direction == 'up' && e.distance > 120) {
            if (this.right_if != false) {
                this.next();
            }
        } else if (e.direction == 'down' && e.distance > 120) {
            if (this.left_if != false) {
                this.last();
            }
        }
    },
    getdatestate() {
        if ((this.showyear == 2037) && (this.showmonth == 12) && (this.showday == 31)) {
            this.right_if = false
        } else if ((this.showyear == 1970) && (this.showmonth == 1) && (this.showday == 1)) {
            this.left_if = false
        }
    },
    next() {
        const date = new Date(this.showyear, this.showmonth, 0)
        if (this.showmonth == 12 && this.showday == date.getDate()) {
            this.showyear = this.showyear + 1
            this.showmonth = 1
            this.showday = 1
        } else {
            if (this.showday == date.getDate()) {
                this.showmonth = this.showmonth + 1
                this.showday = 1
            } else {
                this.showday = this.showday + 1
            }
        }
        this.cleandata();
        this.getdatestate();
        this.getdata();
        this.getholiday();
        this.getGanZhi();
        this.getYiJi();
    },
    last() {
        if (this.showmonth == 1 && this.showday == 1) {
            this.showyear = this.showyear - 1
            this.showmonth = 12
            this.showday = 31
        } else {
            if (this.showday == 1) {
                this.showmonth = this.showmonth - 1
                const date = new Date(this.showyear, this.showmonth, 0)
                this.showday = date.getDate();
            } else {
                this.showday = this.showday - 1
            }
        }
        this.cleandata();
        this.getdatestate();
        this.getdata();
        this.getholiday();
        this.getGanZhi();
        this.getYiJi();
    },
}
