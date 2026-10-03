import router from '../../common/router.js';
import data from '../../common/data.js';
import storage from '@system.storage';
import utils from '../../common/utils.js';
import { DAY_NAMES, COURSE_COLORS } from '../../common/constants.js';

export default {
    data: {
        dayName: '',
        weekDisplay: '',
        todayCourses: [],
        isEmpty: true
    },
    onInit: function () {
        this.loadData();
    },
    onShow: function () {
        this.loadData();
        this.enableRotation('courseList', true);
    },
    onHide: function () {
        this.enableRotation('courseList', false);
    },
    onDestroy: function () {
        this.enableRotation('courseList', false);
        data.clearCache();
    },
    enableRotation: function (ref, value) {
        var r = this.$refs[ref];
        if (r && r.rotation) {
            r.rotation({ focus: value });
        }
    },
    loadData: function () {
        var self = this;
        var day = utils.getDayOfWeek();
        self.dayName = DAY_NAMES[day];
        data.loadSettings(function (settings) {
            var week = utils.calculateCurrentWeek(settings.semesterStart);
            self.weekDisplay = utils.getDateString() + ' \u7b2c' + week + '\u5468';
            data.getCoursesForDay(day, week, function (courses) {
                var list = [];
                var now = utils.getCurrentMinutes();
                var currentIdx = -1;
                for (var i = 0; i < courses.length; i++) {
                    var c = courses[i];
                    var startMin = utils.timeToMinutes(c.startTime);
                    var endMin = utils.timeToMinutes(c.endTime);
                    var statusColor = '#4caf50';
                    if (now >= endMin) {
                        statusColor = '#f44336';
                    } else if (now >= startMin) {
                        statusColor = '#ffc107';
                        currentIdx = i;
                    }
                    list.push({
                        id: c.id, name: c.name, teacher: c.teacher,
                        timeRange: c.startTime + ' - ' + c.endTime,
                        periodText: c.startPeriod + '-' + c.endPeriod + '\u8282',
                        statusColor: statusColor
                    });
                }
                self.todayCourses = list;
                self.isEmpty = list.length === 0;
                if (currentIdx > 0) {
                    setTimeout(function () {
                        var listRef = self.$refs.courseList;
                        if (listRef && listRef.scrollTo) {
                            listRef.scrollTo({ index: currentIdx });
                        }
                    }, 100);
                }
            });
        });
    },
    onCourseClick: function (courseId) {
        storage.set({
            key: 'nav_courseId',
            value: courseId,
            success: function () {
                storage.set({
                    key: 'nav_source',
                    value: 'main',
                    success: function () {
                        router.push({ uri: 'pages/detail/detail' });
                    }
                });
            }
        });
    },
    onWeekViewClick: function () {
        router.push({ uri: 'pages/week/week' });
    },
    onSwipe: function (e) {
        if (e.direction === 'right' && e.distance >= 150) { router.back(); }
    }
};