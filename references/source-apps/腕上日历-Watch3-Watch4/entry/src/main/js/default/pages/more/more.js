import router from '@system.router';

export default {
    data: {
        show_loading: false,
        year: 0,
        month: 0,
        datachange: true
    },
    jumpto() {
        router.push({
            uri: 'pages/jumpto/jumpto',
            params: {
                from: 'more',
                month: this.month,
                year: this.year,
                datachange: this.datachange,
            }
        })
    },
    jumpnow() {
        let appData = getApp().data;
        let date = new Date();
        appData.newDate.year = date.getFullYear();
        appData.newDate.month = date.getMonth() + 1;
        appData.dateChange = true;
        router.back({
            uri: 'pages/details/details'
        })
    },
    jumpfestival() {
        router.push({
            uri: 'pages/festival/festival',
            params: {
                lastpageyear: this.year,
                month: this.month,
                year: this.year,
                datachange: this.datachange,
            }
        })
    },
    jumpsolar() {
        router.push({
            uri: 'pages/solarterm/solarterm',
            params: {
                lastpageyear: this.year,
                month: this.month,
                year: this.year,
                datachange: this.datachange,
            }
        })
    },
    jumpadjust() {
        router.push({
            uri: 'pages/adjustholiday/adjustholiday',
            params: {
                lastpageyear: this.year,
                month: this.month,
                year: this.year,
                datachange: this.datachange,
            }
        })
    }
}
