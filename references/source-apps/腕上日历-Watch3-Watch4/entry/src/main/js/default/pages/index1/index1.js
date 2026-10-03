import storage from '@system.storage';
import router from '@system.router';
import { calendar, monthDays } from '../../common/calendar.js'

export default {
    data: {
        year: 0,
        month: 0,
        day: 0,
        lunarMonthCn: '',
        lunarDayCn: '',
        lunarYearCn: '',
        zodiacYear: '',
        solarTerm: '',
        weekday: '',
        gregorianterm: '',
        showgregorianterm: false,
        solarTermshow: false,
        tips_show: false,
        showterm: false,
        value: 0,
        slidermax: 1,
    },
    onInit() {
        this.gettips();
        this.writedata();
        this.getholiday();
        this.getdate();
        this.checksolarterm();
    },
    onShow() {
        if (!getApp().data.isStarted) {
            this.getReplaceState();
        }
    },
    getReplaceState() {
        storage.get({
            key: 'whenstart',
            default: 'index',
            success: (data) => {
                switch (data) {
                    case 'details':
                        router.replace({
                            uri: 'pages/details/details'
                        })
                        break;
                    case 'festival':
                        router.push({
                            uri: 'pages/festival/festival',
                            params: {
                                from: 'index',
                                lastpageyear: this.year
                            }
                        })
                        break;
                    case 'adjustholiday':
                        router.push({
                            uri: 'pages/adjustholiday/adjustholiday',
                            params: {
                                from: 'index',
                                lastpageyear: this.year
                            }
                        })
                    case 'solarterm':
                        router.push({
                            uri: 'pages/solarterm/solarterm',
                            params: {
                                from: 'index',
                                lastpageyear: this.year
                            }
                        })
                        break;
                    case 'timer':
                        router.push({
                            uri: 'pages/timer/timer',
                            params: {
                                from: 'index'
                            }
                        })
                        break;
                }
                getApp().data.isStarted = true;
            },
        })
    },
    sliderchange(data) {
        if (data == 1) {
            router.replace({
                uri: 'pages/details/details',
            })
        }
    },
    gettips() {
        var that = this;
        storage.get({
            key: 'gesture_help',
            default: '0',
            success: function (data) {
                switch (data) {
                    case '0':
                        that.tips_show = true;
                        that.slidermax = 0;
                        break;
                    case '1':
                        that.tips_show = false;
                }
            }
        })
    },
    writedata() {
        this.lunarDayCn = calendar.lunarDayCn;
        this.lunarMonthCn = calendar.lunarMonthCn;
        this.lunarYearCn = calendar.lunarYearCn;
        this.zodiacYear = calendar.zodiacYear;
        this.weekday = calendar.weekday;
        this.year = calendar.gregorianYear;
        this.month = calendar.gregorianMonth;
        this.solarTerm = this.getSolarTerm();
    },
    isLeapYear(year) {
        if (((year % 4) == 0) && ((year % 100) != 0) || ((year % 400) == 0)) {
            return (true);
        } else {
            return (false);
        }
    },
    getTerm(e) {
        if (this.year < 1900 || this.year > 2100 || e < 1 || e > 24) return -1;
        var c = ["9778397bd097c36b0b6fc9274c91aa", "97b6b97bd19801ec9210c965cc920e", "97bcf97c3598082c95f8c965cc920f", "97bd0b06bdb0722c965ce1cfcc920f", "b027097bd097c36b0b6fc9274c91aa", "97b6b97bd19801ec9210c965cc920e", "97bcf97c359801ec95f8c965cc920f", "97bd0b06bdb0722c965ce1cfcc920f", "b027097bd097c36b0b6fc9274c91aa", "97b6b97bd19801ec9210c965cc920e", "97bcf97c359801ec95f8c965cc920f", "97bd0b06bdb0722c965ce1cfcc920f", "b027097bd097c36b0b6fc9274c91aa", "9778397bd19801ec9210c965cc920e", "97b6b97bd19801ec95f8c965cc920f", "97bd09801d98082c95f8e1cfcc920f", "97bd097bd097c36b0b6fc9210c8dc2", "9778397bd197c36c9210c9274c91aa", "97b6b97bd19801ec95f8c965cc920e", "97bd09801d98082c95f8e1cfcc920f", "97bd097bd097c36b0b6fc9210c8dc2", "9778397bd097c36c9210c9274c91aa", "97b6b97bd19801ec95f8c965cc920e", "97bcf97c3598082c95f8e1cfcc920f", "97bd097bd097c36b0b6fc9210c8dc2", "9778397bd097c36c9210c9274c91aa", "97b6b97bd19801ec9210c965cc920e", "97bcf97c3598082c95f8c965cc920f", "97bd097bd097c35b0b6fc920fb0722", "9778397bd097c36b0b6fc9274c91aa", "97b6b97bd19801ec9210c965cc920e", "97bcf97c3598082c95f8c965cc920f", "97bd097bd097c35b0b6fc920fb0722", "9778397bd097c36b0b6fc9274c91aa", "97b6b97bd19801ec9210c965cc920e", "97bcf97c359801ec95f8c965cc920f", "97bd097bd097c35b0b6fc920fb0722", "9778397bd097c36b0b6fc9274c91aa", "97b6b97bd19801ec9210c965cc920e", "97bcf97c359801ec95f8c965cc920f", "97bd097bd097c35b0b6fc920fb0722", "9778397bd097c36b0b6fc9274c91aa", "97b6b97bd19801ec9210c965cc920e", "97bcf97c359801ec95f8c965cc920f", "97bd097bd07f595b0b6fc920fb0722", "9778397bd097c36b0b6fc9210c8dc2", "9778397bd19801ec9210c9274c920e", "97b6b97bd19801ec95f8c965cc920f", "97bd07f5307f595b0b0bc920fb0722", "7f0e397bd097c36b0b6fc9210c8dc2", "9778397bd097c36c9210c9274c920e", "97b6b97bd19801ec95f8c965cc920f", "97bd07f5307f595b0b0bc920fb0722", "7f0e397bd097c36b0b6fc9210c8dc2", "9778397bd097c36c9210c9274c91aa", "97b6b97bd19801ec9210c965cc920e", "97bd07f1487f595b0b0bc920fb0722", "7f0e397bd097c36b0b6fc9210c8dc2", "9778397bd097c36b0b6fc9274c91aa", "97b6b97bd19801ec9210c965cc920e", "97bcf7f1487f595b0b0bb0b6fb0722", "7f0e397bd097c35b0b6fc920fb0722", "9778397bd097c36b0b6fc9274c91aa", "97b6b97bd19801ec9210c965cc920e", "97bcf7f1487f595b0b0bb0b6fb0722", "7f0e397bd097c35b0b6fc920fb0722", "9778397bd097c36b0b6fc9274c91aa", "97b6b97bd19801ec9210c965cc920e", "97bcf7f1487f531b0b0bb0b6fb0722", "7f0e397bd097c35b0b6fc920fb0722", "9778397bd097c36b0b6fc9274c91aa", "97b6b97bd19801ec9210c965cc920e", "97bcf7f1487f531b0b0bb0b6fb0722", "7f0e397bd07f595b0b6fc920fb0722", "9778397bd097c36b0b6fc9274c91aa", "97b6b97bd19801ec9210c9274c920e", "97bcf7f0e47f531b0b0bb0b6fb0722", "7f0e397bd07f595b0b0bc920fb0722", "9778397bd097c36b0b6fc9210c91aa", "97b6b97bd197c36c9210c9274c920e", "97bcf7f0e47f531b0b0bb0b6fb0722", "7f0e397bd07f595b0b0bc920fb0722", "9778397bd097c36b0b6fc9210c8dc2", "9778397bd097c36c9210c9274c920e", "97b6b7f0e47f531b0723b0b6fb0722", "7f0e37f5307f595b0b0bc920fb0722", "7f0e397bd097c36b0b6fc9210c8dc2", "9778397bd097c36b0b70c9274c91aa", "97b6b7f0e47f531b0723b0b6fb0721", "7f0e37f1487f595b0b0bb0b6fb0722", "7f0e397bd097c35b0b6fc9210c8dc2", "9778397bd097c36b0b6fc9274c91aa", "97b6b7f0e47f531b0723b0b6fb0721", "7f0e27f1487f595b0b0bb0b6fb0722", "7f0e397bd097c35b0b6fc920fb0722", "9778397bd097c36b0b6fc9274c91aa", "97b6b7f0e47f531b0723b0b6fb0721", "7f0e27f1487f531b0b0bb0b6fb0722", "7f0e397bd097c35b0b6fc920fb0722", "9778397bd097c36b0b6fc9274c91aa", "97b6b7f0e47f531b0723b0b6fb0721", "7f0e27f1487f531b0b0bb0b6fb0722", "7f0e397bd097c35b0b6fc920fb0722", "9778397bd097c36b0b6fc9274c91aa", "97b6b7f0e47f531b0723b0b6fb0721", "7f0e27f1487f531b0b0bb0b6fb0722", "7f0e397bd07f595b0b0bc920fb0722", "9778397bd097c36b0b6fc9274c91aa", "97b6b7f0e47f531b0723b0787b0721", "7f0e27f0e47f531b0b0bb0b6fb0722", "7f0e397bd07f595b0b0bc920fb0722", "9778397bd097c36b0b6fc9210c91aa", "97b6b7f0e47f149b0723b0787b0721", "7f0e27f0e47f531b0723b0b6fb0722", "7f0e397bd07f595b0b0bc920fb0722", "9778397bd097c36b0b6fc9210c8dc2", "977837f0e37f149b0723b0787b0721", "7f07e7f0e47f531b0723b0b6fb0722", "7f0e37f5307f595b0b0bc920fb0722", "7f0e397bd097c35b0b6fc9210c8dc2", "977837f0e37f14998082b0787b0721", "7f07e7f0e47f531b0723b0b6fb0721", "7f0e37f1487f595b0b0bb0b6fb0722", "7f0e397bd097c35b0b6fc9210c8dc2", "977837f0e37f14998082b0787b06bd", "7f07e7f0e47f531b0723b0b6fb0721", "7f0e27f1487f531b0b0bb0b6fb0722", "7f0e397bd097c35b0b6fc920fb0722", "977837f0e37f14998082b0787b06bd", "7f07e7f0e47f531b0723b0b6fb0721", "7f0e27f1487f531b0b0bb0b6fb0722", "7f0e397bd097c35b0b6fc920fb0722", "977837f0e37f14998082b0787b06bd", "7f07e7f0e47f531b0723b0b6fb0721", "7f0e27f1487f531b0b0bb0b6fb0722", "7f0e397bd07f595b0b0bc920fb0722", "977837f0e37f14998082b0787b06bd", "7f07e7f0e47f531b0723b0b6fb0721", "7f0e27f1487f531b0b0bb0b6fb0722", "7f0e397bd07f595b0b0bc920fb0722", "977837f0e37f14998082b0787b06bd", "7f07e7f0e47f149b0723b0787b0721", "7f0e27f0e47f531b0b0bb0b6fb0722", "7f0e397bd07f595b0b0bc920fb0722", "977837f0e37f14998082b0723b06bd", "7f07e7f0e37f149b0723b0787b0721", "7f0e27f0e47f531b0723b0b6fb0722", "7f0e397bd07f595b0b0bc920fb0722", "977837f0e37f14898082b0723b02d5", "7ec967f0e37f14998082b0787b0721", "7f07e7f0e47f531b0723b0b6fb0722", "7f0e37f1487f595b0b0bb0b6fb0722", "7f0e37f0e37f14898082b0723b02d5", "7ec967f0e37f14998082b0787b0721", "7f07e7f0e47f531b0723b0b6fb0722", "7f0e37f1487f531b0b0bb0b6fb0722", "7f0e37f0e37f14898082b0723b02d5", "7ec967f0e37f14998082b0787b06bd", "7f07e7f0e47f531b0723b0b6fb0721", "7f0e37f1487f531b0b0bb0b6fb0722", "7f0e37f0e37f14898082b072297c35", "7ec967f0e37f14998082b0787b06bd", "7f07e7f0e47f531b0723b0b6fb0721", "7f0e27f1487f531b0b0bb0b6fb0722", "7f0e37f0e37f14898082b072297c35", "7ec967f0e37f14998082b0787b06bd", "7f07e7f0e47f531b0723b0b6fb0721", "7f0e27f1487f531b0b0bb0b6fb0722", "7f0e37f0e366aa89801eb072297c35", "7ec967f0e37f14998082b0787b06bd", "7f07e7f0e47f149b0723b0787b0721", "7f0e27f1487f531b0b0bb0b6fb0722", "7f0e37f0e366aa89801eb072297c35", "7ec967f0e37f14998082b0723b06bd", "7f07e7f0e47f149b0723b0787b0721", "7f0e27f0e47f531b0723b0b6fb0722", "7f0e37f0e366aa89801eb072297c35", "7ec967f0e37f14998082b0723b06bd", "7f07e7f0e37f14998083b0787b0721", "7f0e27f0e47f531b0723b0b6fb0722", "7f0e37f0e366aa89801eb072297c35", "7ec967f0e37f14898082b0723b02d5", "7f07e7f0e37f14998082b0787b0721", "7f07e7f0e47f531b0723b0b6fb0722", "7f0e36665b66aa89801e9808297c35", "665f67f0e37f14898082b0723b02d5", "7ec967f0e37f14998082b0787b0721", "7f07e7f0e47f531b0723b0b6fb0722", "7f0e36665b66a449801e9808297c35", "665f67f0e37f14898082b0723b02d5", "7ec967f0e37f14998082b0787b06bd", "7f07e7f0e47f531b0723b0b6fb0721", "7f0e36665b66a449801e9808297c35", "665f67f0e37f14898082b072297c35", "7ec967f0e37f14998082b0787b06bd", "7f07e7f0e47f531b0723b0b6fb0721", "7f0e26665b66a449801e9808297c35", "665f67f0e37f1489801eb072297c35", "7ec967f0e37f14998082b0787b06bd", "7f07e7f0e47f531b0723b0b6fb0721", "7f0e27f1487f531b0b0bb0b6fb0722"][this.year-1900],
            b = [parseInt("0x" + c.substr(0, 5)).toString(), parseInt("0x" + c.substr(5, 5)).toString(), parseInt("0x" + c.substr(10, 5)).toString(), parseInt("0x" + c.substr(15, 5)).toString(), parseInt("0x" + c.substr(20, 5)).toString(), parseInt("0x" + c.substr(25, 5)).toString()];
        return parseInt([b[0].substr(0, 1), b[0].substr(1, 2), b[0].substr(3, 1), b[0].substr(4, 2), b[1].substr(0, 1), b[1].substr(1, 2), b[1].substr(3, 1), b[1].substr(4, 2), b[2].substr(0, 1), b[2].substr(1, 2), b[2].substr(3, 1), b[2].substr(4, 2), b[3].substr(0, 1), b[3].substr(1, 2), b[3].substr(3, 1), b[3].substr(4, 2), b[4].substr(0, 1), b[4].substr(1, 2), b[4].substr(3, 1), b[4].substr(4, 2), b[5].substr(0, 1), b[5].substr(1, 2), b[5].substr(3, 1), b[5].substr(4, 2),][e-1])
    },
    getSolarTerm() {
        let solarTerm = ["\u5c0f\u5bd2", "\u5927\u5bd2", "\u7acb\u6625", "\u96e8\u6c34", "\u60ca\u86f0", "\u6625\u5206", "\u6e05\u660e", "\u8c37\u96e8", "\u7acb\u590f", "\u5c0f\u6ee1", "\u8292\u79cd", "\u590f\u81f3", "\u5c0f\u6691", "\u5927\u6691", "\u7acb\u79cb", "\u5904\u6691", "\u767d\u9732", "\u79cb\u5206", "\u5bd2\u9732", "\u971c\u964d", "\u7acb\u51ac", "\u5c0f\u96ea", "\u5927\u96ea", "\u51ac\u81f3"]
        var firstnode = this.getTerm(this.month * 2 - 1)
        var secondnode = this.getTerm(this.month * 2)
        var term = '';
        if (firstnode == calendar.gregorianDay) {
            term = solarTerm[this.month * 2-2]
        }
        if (secondnode == calendar.gregorianDay) {
            term = solarTerm[this.month * 2-1];
        }
        return term;
    },
    getholiday() {
        let month = calendar.gregorianMonth
        let day = calendar.gregorianDay
        let lunarmonth = calendar.lunarMonth
        let lunarday = calendar.lunarDay
        var dayIndex = [6, 0, 1, 2, 3, 4, 5];
        var mothersDayDate = (7 - dayIndex[new Date(this.year, 4, 1).getDay()]) + 7;
        var fathersDayDate = (7 - dayIndex[new Date(this.year, 5, 1).getDay()]) + 14;
        if ((month == 1) && (day == 1)) {
            this.gregorianterm = '元旦'
        } else if ((lunarmonth == 12) && (lunarday == 23)) {
            this.gregorianterm = '小年'
        } else if (lunarmonth == 12 && lunarday == monthDays((Number(this.year) - 1), 12)) {
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
    },
    getdate() {
        let date = String(calendar.gregorianDay)
        this.day = date
        if (date.length == 1) {
            this.day = '0' + date
        } else {
            this.day = date
        }
    },
    checksolarterm() {
        if (this.solarTerm != "") {
            this.showterm = true
            this.solarTermshow = true
        } else if (this.gregorianterm != '') {
            this.showterm = true
            this.showgregorianterm = true
        }
    },
    touchMove(e) {
        if (e.direction === 'up' && e.distance >= 150) {
            router.replace({
                uri: 'pages/details/details',
            })
        } else if (e.direction === 'left' && e.distance >= 150) {
            router.push({
                uri: "pages/index2/index2"
            })
        }
    },
    festival() {
        router.push({
            uri: 'pages/festival/festival',
            params: {
                from: 'index',
                lastpageyear: this.year
            }
        })
    },
    tips() {
        var that = this;
        storage.set({
            key: 'gesture_help',
            value: '1',
            success: function () {
                that.tips_show = false;
                that.slidermax = 1;
            }
        })
    },
    replacedetails() {
        router.push({
            uri: 'pages/daydetails/daydetails',
            params: {
                year: Number(this.year),
                month: Number(this.month),
                day: Number(this.day),
                from: 'index1',
            }
        })
    },
    replacemore() {
        router.replace({
            uri: 'pages/details/details'
        })
    },
    solarterm() {
        router.push({
            uri: 'pages/solarterm/solarterm',
            params: {
                from: 'index1',
                lastpageyear: this.year
            }
        })
    },
}
