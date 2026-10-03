import router from '@system.router';
import { calendar } from '../../common/festival.js'

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
        that.getfestival();
        that.getiftoday();
    },
    doNotPropagation(e) {
        e.stopPropagation();
    },
    onDestroy() {
        this.content = null;
    },
    yearchange(a) {
        this.selectyear = Number(a.newValue)
    },
    confirm() {
        var that = this;
        this.ifyearselect = false
        this.showyear = this.selectyear
        that.getfestival();
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
    getfestival() {
        let content2 = calendar.lunar2solar(this.showyear - 1, 12, 23)
        let content3 = calendar.lunar2solar(this.showyear - 1, 12, calendar.monthDays(this.showyear - 1, 12))
        let content4 = calendar.lunar2solar(this.showyear, 1, 1)
        let content5 = calendar.lunar2solar(this.showyear, 1, 15)
        if (this.isLeapYear(this.showyear) || this.isLeapYear(this.showyear - 1)) {
            var content9 = {
                month: 4, day: 4
            }
        } else {
            content9 = {
                month: 4, day: 5
            }
        }
        let content14 = calendar.lunar2solar(this.showyear, 5, 5)
        let content20 = calendar.lunar2solar(this.showyear, 7, 7)
        let content18 = calendar.lunar2solar(this.showyear, 8, 15)
        let content21 = calendar.lunar2solar(this.showyear, 9, 9)
        var dayIndex = [6, 0, 1, 2, 3, 4, 5];
        var mothersDayDate = (7 - dayIndex[new Date(this.showyear, 4, 1).getDay()]) + 7;
        var fathersDayDate = (7 - dayIndex[new Date(this.showyear, 5, 1).getDay()]) + 14;
        this.content = [{
                            festival: "元旦", content: "1月1日"
                        }, {
                            festival: "小年", content: content2.month + "月" + content2.day + "日"
                        }, {
                            festival: "除夕", content: content3.month + "月" + content3.day + "日"
                        }, {
                            festival: "春节", content: content4.month + "月" + content4.day + "日"
                        }, {
                            festival: "元宵节", content: content5.month + "月" + content5.day + "日"
                        }, {
                            festival: "情人节", content: "2月14日"
                        }, {
                            festival: "妇女节", content: "3月8日"
                        }, {
                            festival: "植树节", content: "3月12日"
                        }, {
                            festival: "清明节", content: content9.month + "月" + content9.day + "日"
                        }, {
                            festival: "愚人节", content: "4月1日"
                        }, {
                            festival: "劳动节", content: "5月1日"
                        }, {
                            festival: "青年节", content: "5月4日"
                        }, {
                            festival: "母亲节", content: "5月" + mothersDayDate + "日"
                        }, {
                            festival: "儿童节", content: "6月1日"
                        }, {
                            festival: "父亲节", content: "6月" + fathersDayDate + "日"
                        }, {
                            festival: "端午节", content: content14.month + "月" + content14.day + "日"
                        }, {
                            festival: "建党节", content: "7月1日"
                        }, {
                            festival: "建军节", content: "8月1日"
                        }, {
                            festival: "七夕节", content: content20.month + "月" + content20.day + "日"
                        }, {
                            festival: "教师节", content: "9月10日"
                        }, {
                            festival: "中秋节", content: content18.month + "月" + content18.day + "日"
                        }, {
                            festival: "国庆节", content: "10月1日"
                        }, {
                            festival: "重阳节", content: content21.month + "月" + content21.day + "日"
                        }, {
                            festival: "平安夜", content: "12月24日"
                        }, {
                            festival: "圣诞节", content: "12月25日"
                        },]
    },
    isLeapYear(year) {
        if (((year % 4) == 0) && ((year % 100) != 0) || ((year % 400) == 0)) {
            return (true);
        } else {
            return (false);
        }
    },
    showyearselect() {
        this.ifyearselect = true
        this.selectyear = this.showyear
        this.yearselect = this.yeararray.indexOf(this.showyear)
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
                from: "festival",
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
        let date = new Date()
        that.showyear = date.getFullYear();
        that.getfestival();
        that.getiftoday();
    }
}
