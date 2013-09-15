$(document).ready(function() {
    "use strict";

    moment.lang("ru");

    /*
     * We assume that there's only one event per day.
     * So the 'events' list should have only one entry per day.
     */
    var events = [];

    var currentMonth;

    // called once in init(), see below
    function mockEvents() {
        var mocks = [{title: "Митинг победителей",
                      date: moment({year: 2013, month: 8, day: 9}),
                      participants: "Леонид Волков, Алексей Навальный",
                      description: "Митинг сторонников Навального на Болотной площади"
                     },
                     {title: "Дедлайн по вступительной в HH",
                      date: moment({year: 2013, month: 8, day: 15}),
                      participants: ["Виталий Павленко"],
                      description: "Задание тут: http://school.hh.ru/#form"
                     },
                     {title: "Hallowe'en",
                      date: moment({year: 2013, month: 9, day: 31}),
                      participants: "Ghosts, vampires",
                      description: "Может, в этом году таки отметить?"
                     }
                    ];
        events = mocks;
    }

    function saveToLocalStorage() {
        localStorage.setItem('events', JSON.stringify(events));
    }

    function restoreFromLocalStorage() {
        events = JSON.parse(localStorage.getItem('events'));
        for (var i in events) {
            events[i].date = moment(events[i].date);
        }
        return events !== undefined;
    }

    function datesEqual(x, y) {
        return x.year() == y.year() && x.month() == y.month() && x.date() == y.date();
    }

    function getEventByDate(date) {
        for (var i in events) {
            var event_ = events[i];
            if (datesEqual(event_.date, date)) {
                return event_;
            }
        }

        return undefined;
    }

    function getTableEntryByEvent(event_) {
        var entry = $('<div class="table-event">');
        entry.append($('<div class="table-event-title">').text(event_.title));
        entry.append($('<div class="table-event-participants">').text(event_.participants));
        return entry;
    }

    function drawGrid(startDate, endDate) {
        var table = $('<table>');
        var tr;
        var first_week = true;
        var today = moment();

        for (var date = startDate; !datesEqual(date, endDate); date.add('day', 1)) {
            if (date.day() === 1) {
                tr = $('<tr>');
            }

            var title = (first_week ? (date.format('dddd') + ', ') : '') + date.format('D');
            var td = $('<td>').html($('<div class="cell-title">').text(capitalizeFirstLetter(title)));
            if (datesEqual(date, today)) {
                td.addClass('today');
            }

            var currentDateEvent = getEventByDate(date);
            if (currentDateEvent !== undefined) {
                td.append(getTableEntryByEvent(currentDateEvent));
                td.addClass('hasEvent');
            }

            tr.append(td);

            if (date.day() === 0) {
                table.append(tr);
                first_week = false;
            }
        }
        $('#month-div').html(table);
    }

    function gotoMonth(day) {
        currentMonth = day;

        $('#month').text(capitalizeFirstLetter(currentMonth.format("MMMM YYYY")));

        var firstDateOfMonth = currentMonth.clone().date(1);
        var lastDateOfMonth = currentMonth.clone().add('months', 1).date(0);

        var startDate;
        var endDate;

        // calendar will represent dates in range [startDate; endDate)

        if (firstDateOfMonth.day() === 0) {
            startDate = firstDateOfMonth.clone().day(-6);
        } else {
            startDate = firstDateOfMonth.clone().day(1);
        }

        if (lastDateOfMonth.day() === 0) {
            endDate = lastDateOfMonth.clone().add('day', 1);
        } else {
            endDate = lastDateOfMonth.clone().day(7).add('day', 1);
        }

        drawGrid(startDate, endDate);
    }

    function gotoToday() {
        gotoMonth(moment());
    }

    function addEvent(date, title) {
        var newEvent = {
            date: date,
            title: title,
            participants: '',
            description: ''
        };

        var found = false;
        for (var i in events) {
            if (datesEqual(events[i].date, date)) {
                events[i] = newEvent;
                found = true;
            }
        }

        if (!found) {
            events.push(newEvent);
        }

        saveToLocalStorage();
    }

    function editEvent(date) {
        // TODO: implement
    }

    function addQuickEvent(text) {
        var parts = splitByComma(text);

        if (parts.length == 0) {
            return;
        }
        if (parts.length == 1) {
            parts.push('');
        }
        if (parts.length > 2) {
            parts[1] = parts.slice(1, parts.length).join(', ');
            parts.length = 2;
        }

        var date = moment(parts[0], 'DD MMMM');
        date.year(moment().year());

        addEvent(date, parts[1]);
        gotoMonth(date);
        editEvent(date);
    }

    function init() {
        if (!restoreFromLocalStorage()) {
            mockEvents();
        }

        $('#button-add').click(function() {
            $('#quick-add').modal({backdrop: false});
            $('#quick-add-text').focus();
        });

        $('#button-refresh').click(function() {
            window.location.reload();
        });

        $('#button-prev-month').click(function() {
            gotoMonth(currentMonth.clone().add('month', -1));
        });

        $('#button-next-month').click(function() {
            gotoMonth(currentMonth.clone().add('month', 1));
        });

        $('#button-today').click(function() {
            gotoToday();
        });

        $('#quick-add-button').click(function() {
            $('#quick-add .close').click();
            addQuickEvent($('#quick-add-text').val());
        });

        gotoToday();
    }

    init();
});