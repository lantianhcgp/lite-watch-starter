import router from '@system.router';

export default {
    data: {
        lastpageyear: 0,
        from: "",
        month: 0,
        year: 0,
        datachange: false,
        pagechange: false,
        showyear: 0,
        nowyear: 0,
        selectyear: 0,
        content: [],
        yearselect: 0,
        ifyearselect: false,
        yeararray: [1970, 1971, 1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980, 1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989, 1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035, 2036, 2037],
    },
    onInit() {
        this.getyear();
    },
    onShow() {
        var that = this;
        that.getsolarterminfo();
        that.getiftoday();
    },
    doNotPropagation(e) {
        e.stopPropagation();
    },
    onDestroy() {
        this.content = null;
    },
    getsolarterminfo() {
        let temp = []
        let lichun = {
            festival: "立春", content: "2月" + this.getTerm(3) + "日"
        }
        let yushui = {
            festival: "雨水", content: "2月" + this.getTerm(4) + "日"
        }
        let jingzhe = {
            festival: "惊蛰", content: "3月" + this.getTerm(5) + "日"
        }
        let chunfen = {
            festival: "春分", content: "3月" + this.getTerm(6) + "日"
        }
        let qingming = {
            festival: "清明", content: "4月" + this.getTerm(7) + "日"
        }
        let guyu = {
            festival: "谷雨", content: "4月" + this.getTerm(8) + "日"
        }
        let lixia = {
            festival: "立夏", content: "5月" + this.getTerm(9) + "日"
        }
        let xiaoman = {
            festival: "小满", content: "5月" + this.getTerm(10) + "日"
        }
        let mangzhong = {
            festival: "芒种", content: "6月" + this.getTerm(11) + "日"
        }
        let xiazhi = {
            festival: "夏至", content: "6月" + this.getTerm(12) + "日"
        }
        let xiaoshu = {
            festival: "小暑", content: "7月" + this.getTerm(13) + "日"
        }
        let dashu = {
            festival: "大暑", content: "7月" + this.getTerm(14) + "日"
        }
        let liqiu = {
            festival: "立秋", content: "8月" + this.getTerm(15) + "日"
        }
        let chushu = {
            festival: "处暑", content: "8月" + this.getTerm(16) + "日"
        }
        let bailu = {
            festival: "白露", content: "9月" + this.getTerm(17) + "日"
        }
        let qiufen = {
            festival: "秋分", content: "9月" + this.getTerm(18) + "日"
        }
        let hanlu = {
            festival: "寒露", content: "10月" + this.getTerm(19) + "日"
        }
        let shuangjiang = {
            festival: "霜降", content: "10月" + this.getTerm(20) + "日"
        }
        let lidong = {
            festival: "立冬", content: "11月" + this.getTerm(21) + "日"
        }
        let xiaoxue = {
            festival: "小雪", content: "11月" + this.getTerm(22) + "日"
        }
        let daxue = {
            festival: "大雪", content: "12月" + this.getTerm(23) + "日"
        }
        let dongzhi = {
            festival: "冬至", content: "12月" + this.getTerm(24) + "日"
        }
        let xiaohan = {
            festival: "小寒", content: "1月" + this.getTerm(1) + "日"
        }
        let dahan = {
            festival: "大寒", content: "1月" + this.getTerm(2) + "日"
        }
        temp.push(lichun, yushui, jingzhe, chunfen, qingming, guyu, lixia, xiaoman, mangzhong, xiazhi, xiaoshu, dashu, liqiu, chushu, bailu, qiufen, hanlu, shuangjiang, lidong, xiaoxue, daxue, dongzhi, xiaohan, dahan)
        this.content = temp;
        temp = null;
    },
    yearchange(a) {
        this.selectyear = Number(a.newValue)
    },
    confirm() {
        var that = this;
        this.ifyearselect = false
        that.showyear = that.selectyear
        that.getsolarterminfo();
        that.getiftoday();
    },
    getyear() {
        let date = new Date();
        this.showyear = this.lastpageyear;
        this.nowyear = date.getFullYear();
    },
    getiftoday() {
        const date = new Date();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const datestring = month + '月' + day + '日'
        for (var i = 0;i <= 22; i++) {
            if (this.content[i].content == datestring && this.nowyear == this.showyear) {
                let content = this.content[i]
                content.show = true
                this.content[i] = content
            }
        }
    },
    getTerm(e) {
        if (this.showyear < 1900 || this.showyear > 2100 || e < 1 || e > 24) return -1;
        var c = ["9778397bd097c36b0b6fc9274c91aa", "97b6b97bd19801ec9210c965cc920e", "97bcf97c3598082c95f8c965cc920f", "97bd0b06bdb0722c965ce1cfcc920f", "b027097bd097c36b0b6fc9274c91aa", "97b6b97bd19801ec9210c965cc920e", "97bcf97c359801ec95f8c965cc920f", "97bd0b06bdb0722c965ce1cfcc920f", "b027097bd097c36b0b6fc9274c91aa", "97b6b97bd19801ec9210c965cc920e", "97bcf97c359801ec95f8c965cc920f", "97bd0b06bdb0722c965ce1cfcc920f", "b027097bd097c36b0b6fc9274c91aa", "9778397bd19801ec9210c965cc920e", "97b6b97bd19801ec95f8c965cc920f", "97bd09801d98082c95f8e1cfcc920f", "97bd097bd097c36b0b6fc9210c8dc2", "9778397bd197c36c9210c9274c91aa", "97b6b97bd19801ec95f8c965cc920e", "97bd09801d98082c95f8e1cfcc920f", "97bd097bd097c36b0b6fc9210c8dc2", "9778397bd097c36c9210c9274c91aa", "97b6b97bd19801ec95f8c965cc920e", "97bcf97c3598082c95f8e1cfcc920f", "97bd097bd097c36b0b6fc9210c8dc2", "9778397bd097c36c9210c9274c91aa", "97b6b97bd19801ec9210c965cc920e", "97bcf97c3598082c95f8c965cc920f", "97bd097bd097c35b0b6fc920fb0722", "9778397bd097c36b0b6fc9274c91aa", "97b6b97bd19801ec9210c965cc920e", "97bcf97c3598082c95f8c965cc920f", "97bd097bd097c35b0b6fc920fb0722", "9778397bd097c36b0b6fc9274c91aa", "97b6b97bd19801ec9210c965cc920e", "97bcf97c359801ec95f8c965cc920f", "97bd097bd097c35b0b6fc920fb0722", "9778397bd097c36b0b6fc9274c91aa", "97b6b97bd19801ec9210c965cc920e", "97bcf97c359801ec95f8c965cc920f", "97bd097bd097c35b0b6fc920fb0722", "9778397bd097c36b0b6fc9274c91aa", "97b6b97bd19801ec9210c965cc920e", "97bcf97c359801ec95f8c965cc920f", "97bd097bd07f595b0b6fc920fb0722", "9778397bd097c36b0b6fc9210c8dc2", "9778397bd19801ec9210c9274c920e", "97b6b97bd19801ec95f8c965cc920f", "97bd07f5307f595b0b0bc920fb0722", "7f0e397bd097c36b0b6fc9210c8dc2", "9778397bd097c36c9210c9274c920e", "97b6b97bd19801ec95f8c965cc920f", "97bd07f5307f595b0b0bc920fb0722", "7f0e397bd097c36b0b6fc9210c8dc2", "9778397bd097c36c9210c9274c91aa", "97b6b97bd19801ec9210c965cc920e", "97bd07f1487f595b0b0bc920fb0722", "7f0e397bd097c36b0b6fc9210c8dc2", "9778397bd097c36b0b6fc9274c91aa", "97b6b97bd19801ec9210c965cc920e", "97bcf7f1487f595b0b0bb0b6fb0722", "7f0e397bd097c35b0b6fc920fb0722", "9778397bd097c36b0b6fc9274c91aa", "97b6b97bd19801ec9210c965cc920e", "97bcf7f1487f595b0b0bb0b6fb0722", "7f0e397bd097c35b0b6fc920fb0722", "9778397bd097c36b0b6fc9274c91aa", "97b6b97bd19801ec9210c965cc920e", "97bcf7f1487f531b0b0bb0b6fb0722", "7f0e397bd097c35b0b6fc920fb0722", "9778397bd097c36b0b6fc9274c91aa", "97b6b97bd19801ec9210c965cc920e", "97bcf7f1487f531b0b0bb0b6fb0722", "7f0e397bd07f595b0b6fc920fb0722", "9778397bd097c36b0b6fc9274c91aa", "97b6b97bd19801ec9210c9274c920e", "97bcf7f0e47f531b0b0bb0b6fb0722", "7f0e397bd07f595b0b0bc920fb0722", "9778397bd097c36b0b6fc9210c91aa", "97b6b97bd197c36c9210c9274c920e", "97bcf7f0e47f531b0b0bb0b6fb0722", "7f0e397bd07f595b0b0bc920fb0722", "9778397bd097c36b0b6fc9210c8dc2", "9778397bd097c36c9210c9274c920e", "97b6b7f0e47f531b0723b0b6fb0722", "7f0e37f5307f595b0b0bc920fb0722", "7f0e397bd097c36b0b6fc9210c8dc2", "9778397bd097c36b0b70c9274c91aa", "97b6b7f0e47f531b0723b0b6fb0721", "7f0e37f1487f595b0b0bb0b6fb0722", "7f0e397bd097c35b0b6fc9210c8dc2", "9778397bd097c36b0b6fc9274c91aa", "97b6b7f0e47f531b0723b0b6fb0721", "7f0e27f1487f595b0b0bb0b6fb0722", "7f0e397bd097c35b0b6fc920fb0722", "9778397bd097c36b0b6fc9274c91aa", "97b6b7f0e47f531b0723b0b6fb0721", "7f0e27f1487f531b0b0bb0b6fb0722", "7f0e397bd097c35b0b6fc920fb0722", "9778397bd097c36b0b6fc9274c91aa", "97b6b7f0e47f531b0723b0b6fb0721", "7f0e27f1487f531b0b0bb0b6fb0722", "7f0e397bd097c35b0b6fc920fb0722", "9778397bd097c36b0b6fc9274c91aa", "97b6b7f0e47f531b0723b0b6fb0721", "7f0e27f1487f531b0b0bb0b6fb0722", "7f0e397bd07f595b0b0bc920fb0722", "9778397bd097c36b0b6fc9274c91aa", "97b6b7f0e47f531b0723b0787b0721", "7f0e27f0e47f531b0b0bb0b6fb0722", "7f0e397bd07f595b0b0bc920fb0722", "9778397bd097c36b0b6fc9210c91aa", "97b6b7f0e47f149b0723b0787b0721", "7f0e27f0e47f531b0723b0b6fb0722", "7f0e397bd07f595b0b0bc920fb0722", "9778397bd097c36b0b6fc9210c8dc2", "977837f0e37f149b0723b0787b0721", "7f07e7f0e47f531b0723b0b6fb0722", "7f0e37f5307f595b0b0bc920fb0722", "7f0e397bd097c35b0b6fc9210c8dc2", "977837f0e37f14998082b0787b0721", "7f07e7f0e47f531b0723b0b6fb0721", "7f0e37f1487f595b0b0bb0b6fb0722", "7f0e397bd097c35b0b6fc9210c8dc2", "977837f0e37f14998082b0787b06bd", "7f07e7f0e47f531b0723b0b6fb0721", "7f0e27f1487f531b0b0bb0b6fb0722", "7f0e397bd097c35b0b6fc920fb0722", "977837f0e37f14998082b0787b06bd", "7f07e7f0e47f531b0723b0b6fb0721", "7f0e27f1487f531b0b0bb0b6fb0722", "7f0e397bd097c35b0b6fc920fb0722", "977837f0e37f14998082b0787b06bd", "7f07e7f0e47f531b0723b0b6fb0721", "7f0e27f1487f531b0b0bb0b6fb0722", "7f0e397bd07f595b0b0bc920fb0722", "977837f0e37f14998082b0787b06bd", "7f07e7f0e47f531b0723b0b6fb0721", "7f0e27f1487f531b0b0bb0b6fb0722", "7f0e397bd07f595b0b0bc920fb0722", "977837f0e37f14998082b0787b06bd", "7f07e7f0e47f149b0723b0787b0721", "7f0e27f0e47f531b0b0bb0b6fb0722", "7f0e397bd07f595b0b0bc920fb0722", "977837f0e37f14998082b0723b06bd", "7f07e7f0e37f149b0723b0787b0721", "7f0e27f0e47f531b0723b0b6fb0722", "7f0e397bd07f595b0b0bc920fb0722", "977837f0e37f14898082b0723b02d5", "7ec967f0e37f14998082b0787b0721", "7f07e7f0e47f531b0723b0b6fb0722", "7f0e37f1487f595b0b0bb0b6fb0722", "7f0e37f0e37f14898082b0723b02d5", "7ec967f0e37f14998082b0787b0721", "7f07e7f0e47f531b0723b0b6fb0722", "7f0e37f1487f531b0b0bb0b6fb0722", "7f0e37f0e37f14898082b0723b02d5", "7ec967f0e37f14998082b0787b06bd", "7f07e7f0e47f531b0723b0b6fb0721", "7f0e37f1487f531b0b0bb0b6fb0722", "7f0e37f0e37f14898082b072297c35", "7ec967f0e37f14998082b0787b06bd", "7f07e7f0e47f531b0723b0b6fb0721", "7f0e27f1487f531b0b0bb0b6fb0722", "7f0e37f0e37f14898082b072297c35", "7ec967f0e37f14998082b0787b06bd", "7f07e7f0e47f531b0723b0b6fb0721", "7f0e27f1487f531b0b0bb0b6fb0722", "7f0e37f0e366aa89801eb072297c35", "7ec967f0e37f14998082b0787b06bd", "7f07e7f0e47f149b0723b0787b0721", "7f0e27f1487f531b0b0bb0b6fb0722", "7f0e37f0e366aa89801eb072297c35", "7ec967f0e37f14998082b0723b06bd", "7f07e7f0e47f149b0723b0787b0721", "7f0e27f0e47f531b0723b0b6fb0722", "7f0e37f0e366aa89801eb072297c35", "7ec967f0e37f14998082b0723b06bd", "7f07e7f0e37f14998083b0787b0721", "7f0e27f0e47f531b0723b0b6fb0722", "7f0e37f0e366aa89801eb072297c35", "7ec967f0e37f14898082b0723b02d5", "7f07e7f0e37f14998082b0787b0721", "7f07e7f0e47f531b0723b0b6fb0722", "7f0e36665b66aa89801e9808297c35", "665f67f0e37f14898082b0723b02d5", "7ec967f0e37f14998082b0787b0721", "7f07e7f0e47f531b0723b0b6fb0722", "7f0e36665b66a449801e9808297c35", "665f67f0e37f14898082b0723b02d5", "7ec967f0e37f14998082b0787b06bd", "7f07e7f0e47f531b0723b0b6fb0721", "7f0e36665b66a449801e9808297c35", "665f67f0e37f14898082b072297c35", "7ec967f0e37f14998082b0787b06bd", "7f07e7f0e47f531b0723b0b6fb0721", "7f0e26665b66a449801e9808297c35", "665f67f0e37f1489801eb072297c35", "7ec967f0e37f14998082b0787b06bd", "7f07e7f0e47f531b0723b0b6fb0721", "7f0e27f1487f531b0b0bb0b6fb0722"][this.showyear-1900],
            b = [parseInt("0x" + c.substr(0, 5)).toString(), parseInt("0x" + c.substr(5, 5)).toString(), parseInt("0x" + c.substr(10, 5)).toString(), parseInt("0x" + c.substr(15, 5)).toString(), parseInt("0x" + c.substr(20, 5)).toString(), parseInt("0x" + c.substr(25, 5)).toString()];
        return parseInt([b[0].substr(0, 1), b[0].substr(1, 2), b[0].substr(3, 1), b[0].substr(4, 2), b[1].substr(0, 1), b[1].substr(1, 2), b[1].substr(3, 1), b[1].substr(4, 2), b[2].substr(0, 1), b[2].substr(1, 2), b[2].substr(3, 1), b[2].substr(4, 2), b[3].substr(0, 1), b[3].substr(1, 2), b[3].substr(3, 1), b[3].substr(4, 2), b[4].substr(0, 1), b[4].substr(1, 2), b[4].substr(3, 1), b[4].substr(4, 2), b[5].substr(0, 1), b[5].substr(1, 2), b[5].substr(3, 1), b[5].substr(4, 2),][e-1])
    },
    showyearselect() {
        this.ifyearselect = true
        this.selectyear = this.showyear
        this.yearselect = this.yeararray.indexOf(this.showyear)
        if (this.$element("list")) {
            this.$element("list").focus({
                focus: false
            });
        }
        if (this.$element("picker")) {
            this.$element("picker").focus({
                focus: true
            });
        }
    },
    exit() {
        this.ifyearselect = false
    },
    replacedetails(data) {
        router.replace({
            uri: 'pages/daydetails/daydetails',
            params: {
                year: this.showyear,
                month: Number(data.slice(0, data.indexOf("月"))),
                day: Number(data.slice(data.indexOf("月") + 1, data.indexOf("日"))),
                from: "solarterm",
                datachange: this.datachange,
                pagechange: this.pagechange,
                lastpagesyear: this.year,
                lastpagesmonth: this.month,
                lastpagesfrom: this.from,
            }
        })
    },
    back() {
        var that = this;
        this.ifyearselect = false
        let date = new Date();
        that.showyear = date.getFullYear();
        that.getsolarterminfo();
        that.getiftoday();
    },
    lastpages() {
        if (this.from == 'index') {
            router.replace({
                uri: 'pages/index1/index1'
            })
        } else {
            router.replace({
                uri: 'pages/more/more',
                params: {
                    month: this.month,
                    year: this.year,
                    datachange: this.datachange,
                }
            })
        }
    }
}
