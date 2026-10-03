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
        showEdit: false,
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
                        self.showEdit = (src === 'week');
                        if (cid) {
                            self.courseId = cid;
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
    onEdit: function () {
        router.push({
            uri: 'pages/add-course/add-course',
            params: { mode: 'edit', courseId: this.courseId }
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