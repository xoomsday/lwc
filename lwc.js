// Will be revamped when Temporal becomes available
function parse_offset(gmtofs)
{
    var match = gmtofs.match(/^GMT([-+])([0-9]{2})([0-9]{2})$/);
    if (!match)
        return 0;
    var sign = match[1];
    var hour = match[2];
    var minute = match[3];
    minute = (parseInt(hour, 10) * 60 + parseInt(minute, 10));
    if (sign == '-')
        minute = 0 - minute;
    return minute;
}

function abbrev_hours(minutes)
{
    var hours = (minutes - (minutes % 60)) / 60;
    if (minutes % 60)
        return `${hours}H${ninutes%60}`;
    return `${hours}H`;
}

function relative_offset_string(gmtofs, localofs)
{
    gmtofs = 0 - gmtofs;

    if (gmtofs < localofs) {
        return "+" + abbrev_hours(localofs - gmtofs);
    } else if (localofs < gmtofs) {
        return "-" + abbrev_hours(gmtofs - localofs);
    } else {
        return "";
    }
}

function zeropad(num, len)
{
    return (Array(len).join('0') + num).slice(-len);
}

function draw_local_date(dt, dateWidget)
{
    const DAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const MONTH = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                   "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    dateWidget.textContent =
        `${DAY[dt.getDay()]}, ${MONTH[dt.getMonth()]} ` +
        `${dt.getDate()},` + `${dt.getFullYear()}`;
}

function draw_local_clock(dt, clockWidget)
{
    clockWidget.textContent =
        `${zeropad(dt.getHours(), 2)}:` +
        `${zeropad(dt.getMinutes(), 2)}:` +
        `${zeropad(dt.getSeconds(), 2)}`;
}

function reschedule(dt, millis)
{
    setTimeout(redraw_clock, millis);
}

function redraw_clock()
{
    var dt = new Date();
    var instant = dt.getTime();

    var millis = (instant % 1000);
    instant -= millis;
    if (500 < millis)
        instant += 1000;
    millis = 1000 - millis;
    dt.setTime(instant);

    for (const w of document.querySelectorAll("div.wc-local-date"))
        draw_local_date(dt, w);
    for (const w of document.querySelectorAll("div.wc-local-clock"))
        draw_local_clock(dt, w);
    for (const w of document.querySelectorAll("div.wc"))
        w.mydraw(instant);

    reschedule(dt, millis);
}

const SAMPLE = [
    {name: "東京", id: "Asia/Tokyo", gmtofs: "GMT+0900" },
    {name: "ロンドン", id: "Europe/London", gmtofs: "GMT+0000" }, // "GMT+0100"
    {name: "UTC", id: "UTC", gmtofs: "GMT" },
    {name: "ニューヨーク", id: "America/New_York", gmtofs: "GMT-0500" }, // GMT-0400
    {name: "ロサンゼルス", id: "America/Los_Angeles", gmtofs: "GMT-0800" }, // GMT-0700
];

function new_elem_class_in(elemName, className, parent)
{
    var elem = document.createElement(elemName);
    elem.setAttribute("class", className);
    parent.appendChild(elem);
    return elem;
}

function create_wc_widget(tzrow, localofs, now, parent)
{
    var wc = new_elem_class_in("div", "wc", parent);
    var wc_l = new_elem_class_in("div", "wc-l", wc);

    var wc_tz_name = new_elem_class_in("div", "wc-tz-name", wc_l);
    var wc_tz_ofs = new_elem_class_in("div", "wc-tz-ofs", wc_l);
    var wc_tz_id = new_elem_class_in("div", "wc-tz-id", wc_l);

    // Will be used to sort "wc"s later
    // Will be revamped when Temporal becomes available
    wc.myoffset = parse_offset(tzrow.gmtofs);

    wc_tz_name.textContent = tzrow.name;
    wc_tz_ofs.textContent = relative_offset_string(wc.myoffset, localofs);
    wc_tz_id.textContent = tzrow.id;

    var wc_r = new_elem_class_in("div", "wc-r", wc);
    var wc_time = new_elem_class_in("div", "wc-time", wc_r);

    wc.mydraw = ((me, timeWidget, tzIdWidget, tzoffset) => {
        return (instant) => {
            var dt = new Date();
            dt.setTime(instant + tzoffset * 60 * 1000);
            dt = dt.toISOString();
            dt = dt.substr(dt.indexOf('T') + 1, 5);
            timeWidget.textContent = `${dt}`;
        };
    })(wc, wc_time, wc_tz_id, wc.myoffset);

    return wc;
}

function initialize ()
{
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').
            then(
                function(registration) {
                    console.log('Service Worker Registered');
                },
                function(error) {
                    console.log('Service Worker Registration Failed');
                },
            );
    }

    var now = new Date();
    var local_offset = now.getTimezoneOffset();

    var wc_list = document.getElementById("wc-list");
    while (wc_list.firstChild)
        wc_list.removeChild(wc_list.firstChild);

    for (const e of SAMPLE)
        wc = create_wc_widget(e, local_offset, now, wc_list);

    redraw_clock();
}
