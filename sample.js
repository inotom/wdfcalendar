/**
 * WdfCalendar sample code
 *
 * file created in 2013/04/26 21:30:26.
 * LastUpdated :2013/04/26 23:22:18.
 *
 * Author: iNo
 * Copyright (c) 2013 Serendip (www.serendip.ws)
 * License: BSD License
 *
 */

(function() {
    'use strict';
    var setCal = function(cal){
        var getTitleAttr = function(calData) {
            if (calData.holidayName) {
                return ' title="' + calData.holidayName + '"';
            } else if (calData.isFurikae) {
                return ' title="振替休日"';
            } else {
                return '';
            }
        };

        var calData = cal.get();
        var year = cal.getYear();
        var month = cal.getMonth();
        var aWeekName = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
        var weekLabel = ["\u65E5", "\u6708", "\u706B", "\u6C34", "\u6728", "\u91D1", "\u571F"];

        var tag = '<table class="calendar">';
        tag += '<tr class="year-name"><td><button id="prev">&laquo;</button></td><td class="year-name" colspan="5">' + year + '\u5E74' + month + '\u6708</td><td><button id="next">&raquo;</td></tr>';

        tag += '<tr class="week week-name">';
        for (var i = 0; i < aWeekName.length; i++) {
            tag += '<td class="day day-' + aWeekName[i] + '">' + weekLabel[i] + '</td>';
        }
        tag += '</tr>';

        for (var i = 0; i < calData.length; i++) {
            var cDt = calData[i];
            var day = cDt.isBlank ? '&nbsp;' : cDt.day;
            tag += cDt.dayWeek === 0 ? '<tr class="week week-' + cDt.weekLineRows + '">' : '';
            tag += '<td class="day day-' + aWeekName[cDt.dayWeek] + (cDt.holidayName ? ' holiday' : '') + (cDt.isFurikae ? ' furikae' : '') + (cDt.isBlank ? ' blank' : '') + '"' + getTitleAttr(cDt) + '>' + day + '</td>';
            tag += cDt.dayWeek === 6 ? '</tr>' : '';
        }

        tag += '</table>';

        document.getElementById('cal').innerHTML = tag;
        document.getElementById('prev').addEventListener('click', function() {
            cal.prev();
            setCal(cal);
        }, false);
        document.getElementById('next').addEventListener('click', function() {
            cal.next();
            setCal(cal);
        }, false);
    };

    window.onload = function() {
        var cal = new WdfCalendar();
        setCal(cal);
    };
})();

/*
vim:fdl=0 fdm=marker:ts=4 sw=4 sts=0:
*/
