import router from '../../common/router.js';
import data from '../../common/data.js';
import storage from '@system.storage';
import { DAY_NAMES, COURSE_COLORS, WEEK_TYPES } from '../../common/constants.js';

export default {
    data: {
        courseId: '',
        courseName: '',
        
        teacher: '',
        dayName: '',
        timeRange: '',
        periodText: '',
        weekTypeText: '',
        color: '',
        showDeleteConfirm: false,
        source: 'main'
    },
    onInit: function () {
        this.readNavData();
    },
    onShow: function () {
        this.readNavData();
    },
    readNavData: function () {
        var self = this;
        storage.get({
            key: 'nav_courseId',
            default: '',
            success: function (cid) {
                storage.get({
                    key: 'nav_source',
                    default: 'main',
                    success: function (src) {
                        self.source = src;
                        if (cid) {
                            /* 脏检查：onInit+onShow 连读两次，同 id 跳过第二次
                             * 全量加载渲染（性能优化 2026-10-10） */
                            if (self.courseId === cid && self._courseLoaded) { return; }
                            self.courseId = cid;
                            self._courseLoaded = true;
                            self.loadCourse();
                        }
                    }
                });
            }
        });
    },
    loadCourse: function () {
        if (!this.courseId) return;
        var page = this;
        data.findCourse(page.courseId, function (course) {
            if (!course) return;
            page.courseName = course.name;
            
            page.teacher = course.teacher || '-';
            page.dayName = DAY_NAMES[course.dayOfWeek];
            page.timeRange = course.startTime + '-' + course.endTime;
            page.periodText = course.startPeriod + '-' + course.endPeriod + '\u8282';
            var wt = '\u5168\u90e8';
            for (var i = 0; i < WEEK_TYPES.length; i++) {
                if (WEEK_TYPES[i].value === course.weekType) {
                    wt = WEEK_TYPES[i].label;
                    break;
                }
            }
            page.weekTypeText = wt;
            page.color = COURSE_COLORS[course.colorIndex || 0];
        });
    },
    onDelete: function () {
        this.showDeleteConfirm = true;
    },
    onConfirmDelete: function () {
        var page = this;
        data.deleteCourse(page.courseId, function (success) {
            if (success) {
                if (page.source === 'week') {
                    router.push({ uri: 'pages/week/week' });
                } else {
                    router.push({ uri: 'pages/index/index' });
                }
            }
        });
    },
    onCancelDelete: function () {
        this.showDeleteConfirm = false;
    },
    onBack: function () {
        if (this.source === 'week') {
            router.push({ uri: 'pages/week/week' });
        } else {
            router.push({ uri: 'pages/index/index' });
        }
    },
    onSwipe: function (e) {
        if (e.direction === 'right' && e.distance >= 150) {
            this.onBack();
        }
    }
};