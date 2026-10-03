import router from '@system.router';

export default {
    data: {
        month: 0,
        year: 0,
        from: "",
        datachange: false,
        yearcolor: '#808080',
        monthcolor: '#808080',
        newyear: 0,
        newmonth: 0,
        yearcount: 0,
        monthcount: 0,
        yearvalue: [1970, 1971, 1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980, 1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989, 1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035, 2036, 2037],
        monthvalue: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    },
    onInit() {
        this.newmonth = this.month
        this.newyear = this.year
        let yearcount = this.yearvalue.indexOf(this.newyear)
        let monthcount = this.monthvalue.indexOf(this.newmonth)
        this.yearcount = yearcount
        this.monthcount = monthcount
    },
    onShow() {
        this.yearcolor = '#1e90ff'
    },
    yearchange(a) {
        this.newyear = Number(a.newValue)
    },
    monthchange(a) {
        this.newmonth = Number(a.newValue)
    },
    back() {
        let appData = getApp().data;
        appData.newDate.year = this.newyear;
        appData.newDate.month = this.newmonth;
        appData.dateChange = true;
        router.back({
            uri: 'pages/details/details'
        })
    },
    clickyear() {
        this.yearcolor = '#1e90ff'
        this.monthcolor = '#808080'
    },
    clickmonth() {
        this.monthcolor = '#1e90ff'
        this.yearcolor = '#808080'
    }
}
