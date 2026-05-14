// Global state
let locations = [];
let editMode = false;
let dragSrcEl = null;

// Load locations from localStorage or use defaults
function loadLocations() {
    const storedLocations = localStorage.getItem('locations');
    if (storedLocations) {
        locations = JSON.parse(storedLocations);
    } else {
        locations = [
            {name: "東京", id: "Asia/Tokyo" },
            {name: "ロンドン", id: "Europe/London" },
            {name: "UTC", id: "UTC" },
            {name: "ニューヨーク", id: "America/New_York" },
            {name: "ロサンゼルス", id: "America/Los_Angeles" },
        ];
    }
}

// Save locations to localStorage
function saveLocations() {
    localStorage.setItem('locations', JSON.stringify(locations));
}

// Toggle the settings panel
function toggleSettings() {
    const panel = document.getElementById('settings-panel');
    panel.classList.toggle('hidden');
    const wcList = document.getElementById('wc-list');
    if (panel.classList.contains('hidden')) {
        wcList.classList.remove('edit-mode');
    } else {
        wcList.classList.add('edit-mode');
    }
}



// Add a new location
function addLocation(event) {
    event.preventDefault();
    const newName = document.getElementById('newName').value;
    const newId = document.getElementById('newId').value;
    try {
        new Intl.DateTimeFormat('en-US', { timeZone: newId });
    } catch (e) {
        alert(`'${newId}' is not a valid timezone.`);
        return;
    }
    locations.push({ name: newName, id: newId });
    saveLocations();
    draw_clocks();
    document.getElementById('newName').value = '';
    document.getElementById('newId').value = '';
    const suggestionsPanel = document.getElementById('tz-suggestions');
    suggestionsPanel.innerHTML = '';
    suggestionsPanel.style.display = 'none';
}

// Remove a location
function removeLocation(index) {
    locations.splice(index, 1);
    saveLocations();
    draw_clocks();
}

// Drag and drop functions
function handleDragStart(e) {
    this.style.opacity = '0.4';
    dragSrcEl = this;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDragEnter(e) {
    this.classList.add('over');
}

function handleDragLeave(e) {
    this.classList.remove('over');
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    if (dragSrcEl != this) {
        const srcIndex = parseInt(dragSrcEl.dataset.index);
        const destIndex = parseInt(this.dataset.index);
        const item = locations.splice(srcIndex, 1)[0];
        locations.splice(destIndex, 0, item);
        saveLocations();
    }
    return false;
}

function handleDragEnd(e) {
    this.style.opacity = '1';
    const items = document.querySelectorAll('#wc-list .wc');
    items.forEach(function (item) {
        item.classList.remove('over');
    });
    draw_clocks();
}

function relative_offset_string(targetTz)
{
    const targetZdt = Temporal.Now.zonedDateTimeISO(targetTz);
    const localZdt = Temporal.Now.zonedDateTimeISO();
    const diffSeconds = (targetZdt.offsetNanoseconds - localZdt.offsetNanoseconds) / 1e9;

    if (diffSeconds === 0) return "";

    const sign = diffSeconds > 0 ? "+" : "-";
    const absDiff = Math.abs(diffSeconds);
    const h = Math.floor(absDiff / 3600);
    const m = Math.floor((absDiff % 3600) / 60);

    return sign + (m === 0 ? `${h}H` : `${h}H${m}`);
}

function draw_local_date(zdt, dateWidget)
{
    dateWidget.textContent = zdt.toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

function draw_local_clock(zdt, clockWidget)
{
    clockWidget.textContent = zdt.toPlainTime().toString({ precision: 'second' });
}

function reschedule(millis)
{
    setTimeout(redraw_clock, millis);
}

function redraw_clock()
{
    const now = Temporal.Now.instant();
    let instant = now.epochMilliseconds;

    let millis = (instant % 1000);
    instant -= millis;
    if (500 < millis)
        instant += 1000;
    millis = 1000 - millis;

    const snappedInstant = Temporal.Instant.fromEpochMilliseconds(instant);
    const localZdt = snappedInstant.toZonedDateTimeISO(Temporal.Now.timeZoneId());

    for (const w of document.querySelectorAll("div.wc-local-date"))
        draw_local_date(localZdt, w);
    for (const w of document.querySelectorAll("div.wc-local-clock"))
        draw_local_clock(localZdt, w);
    for (const w of document.querySelectorAll("div.wc"))
        w.mydraw(snappedInstant);

    reschedule(millis);
}

function new_elem_class_in(elemName, className, parent)
{
    var elem = document.createElement(elemName);
    elem.setAttribute("class", className);
    parent.appendChild(elem);
    return elem;
}

function create_wc_widget(tzrow, index, parent)
{
    var wc = new_elem_class_in("div", "wc", parent);
    wc.setAttribute('draggable', true);
    wc.dataset.index = index;

    var wc_l = new_elem_class_in("div", "wc-l", wc);

    var wc_tz_name = new_elem_class_in("div", "wc-tz-name", wc_l);
    var wc_tz_ofs = new_elem_class_in("div", "wc-tz-ofs", wc_l);
    var wc_tz_id = new_elem_class_in("div", "wc-tz-id", wc_l);

    var removeBtn = new_elem_class_in("button", "remove-button", wc);
    removeBtn.textContent = 'X';
    removeBtn.onclick = () => removeLocation(index);

    try {
        wc_tz_name.textContent = tzrow.name;
        wc_tz_id.textContent = tzrow.id;

        var wc_r = new_elem_class_in("div", "wc-r", wc);
        var wc_time = new_elem_class_in("div", "wc-time", wc_r);

        wc.mydraw = (instant) => {
            const zdt = instant.toZonedDateTimeISO(tzrow.id);
            wc_time.textContent = zdt.toPlainTime().toString().slice(0, 5);
            wc_tz_ofs.textContent = relative_offset_string(tzrow.id);
        };
    } catch (e) {
        wc.classList.add("invalid");
        wc_tz_name.textContent = tzrow.name;
        wc_tz_id.textContent = `${tzrow.id} (invalid)`;
        wc.mydraw = () => {}; // empty mydraw
    }

    // Add drag and drop event listeners
    wc.addEventListener('dragstart', handleDragStart, false);
    wc.addEventListener('dragenter', handleDragEnter, false);
    wc.addEventListener('dragover', handleDragOver, false);
    wc.addEventListener('dragleave', handleDragLeave, false);
    wc.addEventListener('drop', handleDrop, false);
    wc.addEventListener('dragend', handleDragEnd, false);

    return wc;
}

function draw_clocks() {
    var wc_list = document.getElementById("wc-list");
    while (wc_list.firstChild)
        wc_list.removeChild(wc_list.firstChild);

    locations.forEach((e, i) => {
        create_wc_widget(e, i, wc_list);
    });
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

    loadLocations();
    draw_clocks();
    redraw_clock();

    const timezoneInput = document.getElementById('newId');
    const suggestionsPanel = document.getElementById('tz-suggestions');
    const timezones = Intl.supportedValuesOf('timeZone');

    timezoneInput.addEventListener('input', () => {
        const inputText = timezoneInput.value.toLowerCase();
        suggestionsPanel.innerHTML = '';
        if (inputText.length === 0) {
            suggestionsPanel.style.display = 'none';
            return;
        }

        const suggestions = timezones.filter(tz => tz.toLowerCase().includes(inputText));

        suggestions.slice(0, 10).forEach(tz => {
            const suggestionDiv = document.createElement('div');
            suggestionDiv.textContent = tz;
            suggestionDiv.classList.add('tz-suggestion');
            suggestionDiv.addEventListener('click', () => {
                timezoneInput.value = tz;
                suggestionsPanel.style.display = 'none';
            });
            suggestionsPanel.appendChild(suggestionDiv);
        });

        if (suggestions.length > 0) {
            suggestionsPanel.style.display = 'block';
        } else {
            suggestionsPanel.style.display = 'none';
        }
    });

    document.addEventListener('click', (e) => {
        if (e.target !== timezoneInput && e.target.parentNode !== suggestionsPanel) {
            suggestionsPanel.style.display = 'none';
        }
    });
}

window.addEventListener('load', initialize);
