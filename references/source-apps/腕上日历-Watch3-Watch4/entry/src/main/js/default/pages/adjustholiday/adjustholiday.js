import router from '@system.router';
import { holiday } from '../../common/holiday.js'
import app from '@system.app';

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
        empty_content: [],
        yearselect: 0,
        ifyearselect: false,
        if_info: false,
        main_if: true,
        yeararray: [2020, 2021, 2022, 2023, 2024, 2025],
    },
    onInit() {
        var date = new Date();
        this.showyear = this.lastpageyear;
        this.nowyear = date.getFullYear();
    },
    onShow() {
        var that = this;
        that.judgeyear();
        that.getiftoday();
    },
    doNotPropagation(e) {
        e.stopPropagation();
    },
    onDestroy() {
        this.content = null;
    },
    judgeyear() {
        if (holiday["year" + this.showyear]) {
            this.content = holiday["year" + this.showyear];
        } else {
            this.empty_content = holiday.empty
        }
    },
    getiftoday() {
        const date = new Date();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const datestring = month + '月' + day + '日'
        for (var i = 0;i < this.content.length; i++) {
            let arraydata = this.content[i]
            let data = arraydata.content
            let length = data.indexOf("(")
            let content = data.slice(0, length)
            if (content == datestring && this.nowyear == this.showyear) {
                arraydata.show = true
                this.content[i] = arraydata
            }
        }
    },
    yearchange(a) {
        this.selectyear = Number(a.newValue)
    },
    confirm() {
        var that = this;
        this.ifyearselect = false
        this.showyear = this.selectyear
        that.empty_content = []
        that.judgeyear();
        that.getiftoday();
    },
    replacedetails(data) {
        router.replace({
            uri: 'pages/daydetails/daydetails',
            params: {
                year: this.showyear,
                month: Number(data.slice(0, data.indexOf("月"))),
                day: Number(data.slice(data.indexOf("月") + 1, data.indexOf("日"))),
                from: "adjustholiday",
                datachange: this.datachange,
                pagechange: this.pagechange,
                lastpagesyear: this.year,
                lastpagesmonth: this.month,
                lastpagesfrom: this.from,
            }
        })
    },
    showyearselect() {
        this.ifyearselect = true
        this.selectyear = this.showyear
        let yearselect = this.yeararray.indexOf(this.showyear)
        if (yearselect == -1) {
            let date = new Date();
            let year = date.getFullYear();
            this.yearselect = this.yeararray.indexOf(year)
            this.selectyear = year
        } else {
            this.yearselect = yearselect
        }
    },
    exit() {
        this.ifyearselect = false
    },
    back() {
        var that = this;
        let date = new Date();
        this.showyear = date.getFullYear();
        this.ifyearselect = false
        that.empty_content = []
        that.judgeyear();
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
    },
    showinfo() {
        this.main_if = false
        this.if_info = true
        app.setSwipeToDismiss(true);
    },
    swipeinfo(e) {
        if (e.direction == 'right' && e.distance >= 100) {
            app.setSwipeToDismiss(false);
            this.main_if = true
            this.if_info = false
        }
    }
}
