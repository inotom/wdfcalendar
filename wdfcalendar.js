/**********************************************************************************
 *
 * WdfCalendar ver 1.1
 *
 * A Calendar Data JavaScript
 *
 * file created in 2006/02/26 19:23:22.
 * Author: iNo
 *
 * Usage:
 * var cal = new WdfCalendar();
 * cal.get();       // get Array of CalDay object
 * cal.next();      // set next month
 * cal.prev();      // set previous month
 * cal.getYear();   // get number of year
 * cal.getMonth();  // get number of month (January is 1)
 *
 * License: BSD license
 *
  Copyright (c) 2006-2016 iNo (http://www.serendip.ws/) All rights reserved. {{{

  Redistribution and use in source and binary forms, with or without modification,
  are permitted provided that the following conditions are met:
  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice, this
    list of conditions and the following disclaimer in the documentation and/or
    other materials provided with the distribution.
  * Neither the name of “Serendip“ nor the names of its contributors may be used to
    endorse or promote products derived from this software without specific prior
    written permission.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS “AS IS” AND
  ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
  DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
  ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
  ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
  SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 ********************************************************************************* }}}
 *
 *********************************************************************************/

(function(root, factory) {
  'use strict';

  if (typeof exports === 'object') { // CommonJS
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) { // RequireJS
    define([], factory);
  } else { // <script>
    root.WdfCalendar = factory();
  }
})(this, function() {
  'use strict';

  var WdfCalendar = (function () {

    /**
     * A day object
     */
    var CalDay = (function() {
      /**
       * @constructor
       * @param {number} dayWeek Index of week. Sunday is 0,
       * @param {number} weekLineRows Index of calendar table row.
       * @param {Object} options Unrequired arguments
       */
       function CalDay(dayWeek, weekLineRows, options) {
        if (typeof options === 'undefined') {
          options = {};
        }
        this.isBlank = (typeof options.isBlank === 'undefined') ? true : options.isBlank;
        this.day = (typeof options.day === 'undefined') ? 0 : options.day;
        this.dayWeek = dayWeek;
        this.weekLineRows = weekLineRows;
        this.isToday = (typeof options.isToday === 'undefined') ? false : options.isToday;
        this.holidayName = (typeof options.holidayName === 'undefined') ? null : options.holidayName;
        this.isFurikae = (typeof options.isFurikae === 'undefined') ? false : options.isFurikae;
       }
       return CalDay;
     })();

     var aNumDays = [31, 0, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

     /**
      * @constructor
      * @param {number} year Number of year.
      * @param {number} month Number of month. January is 1.
      */
     function WdfCalendar(year, month) {
       if ((typeof year === 'undefined') || (typeof month === 'undefined')) {
         var now = new Date();
         this.year = now.getFullYear();
         this.month = now.getMonth() + 1;
       } else {
         this.year = year;
         this.month = month;
       }
       this.set(this.year, this.month);
     }

     /**
      * get calData
      * @return {Array.<Object>}
      */
     WdfCalendar.prototype.get = function() {
       return this.calData;
     };

     /**
      * set calData to next month
      */
     WdfCalendar.prototype.next = function() {
       this.year = (this.month === 12) ? this.year + 1 : this.year;
       this.month = (this.month === 12) ? 1 : this.month + 1;
       this.set(this.year, this.month);
     };

     /**
      * set calData to previous month
      */
     WdfCalendar.prototype.prev = function() {
       this.year = (this.month === 1) ? this.year - 1 : this.year;
       this.month = (this.month === 1) ? 12 : this.month - 1;
       this.set(this.year, this.month);
     };

     /**
      * get WdfCalendar object year
      * @return {number} Number of year.
      */
     WdfCalendar.prototype.getYear = function() {
       return this.year;
     };

     /**
      * get WdfCalendar object month
      * @return {number} Number of month.
      */
     WdfCalendar.prototype.getMonth = function() {
       return this.month;
     };

     /**
      * set calData to given year and month
      * @param {number} year Number of year.
      * @param {number} month Number of month.
      */
     WdfCalendar.prototype.set = function(year, month) {
       /* initialize calData */
       if (this.calData) {
         this.calData = null;
       }
       this.calData = [];

       var numDays = getNumberOfDays(year, month);
       var firstDate = new Date(Date.UTC(year, month - 1, 1));
       var dayWeek = firstDate.getDay();
       var firstDayWeek = firstDate.getDay();
       var holidays = getHolidays(year, month , numDays);

       setFirstWeekBlankLine(dayWeek, this.calData);

       /* set days */
       for (var i = 0; i < numDays; i++) {
         var day = i + 1;
         var options = {
           'isBlank' : false,
           'day' : day,
           'isToday' : checkToday(year, month, day),
           'holidayName' : holidays[day],
           'isFurikae' : checkAltHoliday(dayWeek, day, holidays, i)
         };
         var calDay = new CalDay(dayWeek, parseInt((firstDayWeek + day - 1) / 7, 10), options);
         this.calData.push(calDay);
         dayWeek = ((dayWeek === 6) ? 0 : dayWeek + 1);
       }

       var weekLineRows = setEndWeekBlankLine(dayWeek, firstDayWeek, numDays, month, this.calData);

       if ((weekLineRows >= 4 && weekLineRows < 5) || (weekLineRows === 5 && dayWeek === 0 && numDays > 29)) {
         setLastBlankLine(this.calData);
       }
     };

     /**
      * set previous month blank days
      * @param {number} dayWeek Index of week. Sunday is 0.
      * @param {Array.<Object>} calData
      */
     var setFirstWeekBlankLine = function(dayWeek, calData) {
       for (var i = 0; i < dayWeek; i++) {
         var calDay = new CalDay(i, 0);
         calData.push(calDay);
       }
     };

     /**
      * set next month blank days
      * @param {number} dayWeek Index of week. Sunday is 0.
      * @param {number} month Number of month.
      * @param {Array.<Object>} calData
      * @return {number} weekLineRows
      */
     var setEndWeekBlankLine = function(dayWeek, firstDayWeek, numDays, month, calData) {
       var endWeekLen = (dayWeek === 0) && (month !== 2) ? 7 : dayWeek;
       var weekLineRows = parseInt((firstDayWeek + numDays) / 7, 10);
       for (var i = 0; i < 7 - endWeekLen; i++) {
         var calDay = new CalDay(dayWeek, weekLineRows);
         calData.push(calDay);
         dayWeek = ((dayWeek === 6) ? 0 : dayWeek + 1);
       }
       return weekLineRows;
     };

     /**
      * set 5th row blank line
      * @param {Array.<Object>} calData
      */
     var setLastBlankLine = function(calData) {
       for (var i = 0; i < 7; i++) {
         var calDay = new CalDay(i, 5);
         calData.push(calDay);
       }
     };

     /**
      * Checking whether it is a leap year. (うるう年)
      * @param {number} year Number of year.
      * @return boolean
      */
     var checkLeap = function(year) {
       if ((year % 4) === 0) {
         if ((year % 100) === 0) {
           return ((year % 400) === 0) ? true : false;
         } else {
           return true;
         }
       } else {
         return false;
       }
     };

     /**
      * Get vernal equinox day. (春分の日)
      * @param {number} year Number of year.
      * @return {number} Number of vernal equinox day.
      */
     var getVernal = function(year) {
       var v = (year < 2000) ? 2213 : 2089;
       return Math.floor((31 * year + v) / 128) - Math.floor(year / 4) + Math.floor(year / 100);
     };

     /**
      * Get autumnal equinox day. (秋分の日)
      * @param {number} year Number of year.
      * @return {number} Number of autumnal equinox day.
      */
     var getAutumnal = function(year) {
       var v = (year < 2000) ? 2525 : 2395;
       return Math.floor((31 * year + v) / 128) - Math.floor(year / 4) + Math.floor(year / 100);
     };

     /**
      * Get array of holiday label string.
      * @param {number} year Number of year.
      * @param {number} month Number of month. January is 1.
      * @param {number} numDays Number of days in a month.
      * @return {Array.<string>} Array of holiday label.
      */
     var getHolidays = function(year, month, numDays) {
       var weekRow = 0;
       var holidays = [null];
       for (var i = 1; i < numDays + 1; i++) {
         var theDay = new Date(Date.UTC(year, month - 1, i));
         holidays[i] = null;
         if (theDay.getDay() === 1) {
           weekRow++;
         }

         if (month === 1 && i === 1) { // 元旦
           holidays[i] = "元旦";
         } else if (month === 1 && i === 15 && year < 2000) { // 成人の日
           holidays[i] = "成人の日";
         } else if (month === 1 && weekRow === 2 && theDay.getDay() === 1 && year >= 2000) { // 成人の日
           holidays[i] = "成人の日";
         } else if (month === 2 && i === 11) { // 建国記念の日
           holidays[i] = "建国記念の日";
         } else if (month === 3 && i === getVernal(year)) { // 春分
           holidays[i] = "春分の日";
         } else if (month === 4 && i === 29 && year <= 1988) { // 天皇誕生日
           holidays[i] = "天皇誕生日";
         } else if (month === 4 && i === 29 && year >= 1989 && year < 2007) { // みどりの日
           holidays[i] = "みどりの日";
         } else if (month === 4 && i === 29 && year >= 2007) { // 昭和の日
           holidays[i] = "昭和の日";
         } else if (month === 5 && i === 3) { // 憲法記念日
           holidays[i] = "憲法記念日";
         } else if (month === 5 && i === 4 && year >= 1986 && year <= 2006) { // 国民の休日
           holidays[i] = "国民の休日";
         } else if (month === 5 && i === 4 && year >= 2007) { // みどりの日
           holidays[i] = "みどりの日";
         } else if (month === 5 && i === 5) { // こどもの日
           holidays[i] = "こどもの日";
         } else if (month === 7 && i === 20 && year >= 1996 && year <=2002) { // 海の日
           holidays[i] = "海の日";
         } else if (month === 7 && weekRow === 3 && theDay.getDay() === 1 && year >= 2003) { // 海の日
           holidays[i] = "海の日";
         } else if (month === 8 && i === 11 && year >= 2016) { // 山の日
           holidays[i] = "山の日";
         } else if (month === 9 && i === 15 && year <= 2002) { // 敬老の日
           holidays[i] = "敬老の日";
         } else if (month === 9 && weekRow === 3 && theDay.getDay() === 1 && year >= 2003) { // 敬老の日
           holidays[i] = "敬老の日";
         } else if (month === 9 && i === getAutumnal(year)) { // 秋分の日
           holidays[i] = "秋分の日";
         } else if (month === 10 && i === 10 && year < 2000) { // 体育の日
           holidays[i] = "体育の日";
         } else if (month === 10 && weekRow === 2 && theDay.getDay() === 1 && year >= 2000) { // 体育の日
           holidays[i] = "体育の日";
         } else if (month === 11 && i === 3) { // 文化の日
           holidays[i] = "文化の日";
         } else if (month === 11 && i === 23) { // 勤労感謝の日
           holidays[i] = "勤労感謝の日";
         } else if (month === 12 && i === 23 && year >= 1989) { // 天皇誕生日
           holidays[i] = "天皇誕生日";
         }
       }
       return holidays;
     };

     /**
      * Get number of days in a month.
      * @param {number} year Number of year.
      * @param {number} month Number of month. January is 1.
      * @return number Number of days in a month.
      */
     var getNumberOfDays = function(year, month) {
       if (month === 2) {
         return checkLeap(year) ? 29 : 28;
       } else {
         return aNumDays[month - 1];
       }
     };

     /**
      * Checking the day is today.
      * @param {number} year Number of year.
      * @param {number} month Number of month. January is 1.
      * @param {number} day Number of day.
      * @return {boolean}
      */
     var checkToday = function(year, month, day) {
       var today = new Date();
       if (year === today.getFullYear() && month === today.getMonth() + 1) {
         return day === today.getDate();
       } else {
         return false;
       }
     };

     /**
      * Checking if the day is alternate holiday.
      * @param {number} dayWeek Index of week. Sunday is 0.
      * @param {number} day Number of day.
      * @param {Array.<string>} holidays Array of holiday label string.
      * @return {boolean}
      */
     var checkAltHoliday = function(dayWeek, day,  holidays, index) {
       // 曜日が月曜日で祝日でなくかつ前日が祝日
       // 曜日が火曜日で祝日でなくかつ前日・前々日が祝日
       // 曜日が水曜日で祝日でなくかつ前日・前々日・前々前日が祝日
       return ((dayWeek === 1 && holidays[index] && !holidays[day]) ||
               (index > 1 && dayWeek === 2 && holidays[index - 1] && holidays[index] && !holidays[day]) ||
               (index > 2 && dayWeek === 3 && holidays[index - 2] && holidays[index - 1] && holidays[index] && !holidays[day])) ? true : false;
     };

     return WdfCalendar;
  })();

  return WdfCalendar;
});
