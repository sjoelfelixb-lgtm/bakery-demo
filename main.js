/* main.js — small progressive enhancements. The page works fully without it. */
(function () {
  'use strict';
  var d = document;

  // menu button (keyboard friendly, Esc closes)
  var btn = d.querySelector('.nav-toggle'), list = d.getElementById('nav-list');
  if (btn && list) {
    var setOpen = function (open) { btn.setAttribute('aria-expanded', String(open)); list.classList.toggle('is-open', open); };
    btn.addEventListener('click', function () { setOpen(btn.getAttribute('aria-expanded') !== 'true'); });
    list.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && list.classList.contains('is-open')) { setOpen(false); btn.focus(); } });
  }

  // hide the announcement after its "until" date
  var an = d.querySelector('.announcement[data-until]');
  if (an && an.dataset.until) {
    var t = new Date(), today = t.getFullYear() + '-' + ('0' + (t.getMonth() + 1)).slice(-2) + '-' + ('0' + t.getDate()).slice(-2);
    if (today > an.dataset.until) an.hidden = true;
  }

  // "Open now" line from the hours data (full table always shows without JS)
  function fmt(hm) {
    var p = hm.split(':'), h = +p[0], m = p[1];
    if (hm === '23:59') return 'midnight';
    var ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12;
    return h + (m !== '00' ? ':' + m : '') + ' ' + ap;
  }
  d.querySelectorAll('.js-open-now[data-hours]').forEach(function (el) {
    var rows; try { rows = JSON.parse(el.dataset.hours); } catch (e) { return; }
    var now = new Date(), day = (now.getDay() + 6) % 7, hm = ('0' + now.getHours()).slice(-2) + ':' + ('0' + now.getMinutes()).slice(-2);
    var yday = (day + 6) % 7, msg = '', open = false;
    rows.forEach(function (r) {
      if (r.x) return;
      if (r.d.indexOf(day) !== -1) {
        if (r.c > r.o ? (hm >= r.o && hm < r.c) : hm >= r.o) { open = true; msg = 'Open now until ' + fmt(r.c); }
      }
      if (!open && r.d.indexOf(yday) !== -1 && r.c < r.o && hm < r.c) { open = true; msg = 'Open now until ' + fmt(r.c); }
    });
    if (!open) {
      var next = '';
      rows.forEach(function (r) { if (!r.x && r.d.indexOf(day) !== -1 && hm < r.o && !next) next = 'Closed now, opens today at ' + fmt(r.o); });
      msg = next || 'Closed now';
    }
    el.textContent = msg;
    el.classList.toggle('is-closed-now', !open);
    el.hidden = false;
  });

  // form: plain-language error messages next to each field, keep sticky bar out of the way
  d.querySelectorAll('form.contact-form').forEach(function (form) {
    form.setAttribute('novalidate', '');
    function msgFor(f) {
      var label = (form.querySelector('label[for="' + f.id + '"]') || {}).textContent || 'This field';
      label = label.replace(/\s*\(optional\)/i, '');
      if (f.validity.valueMissing) return 'Please fill in ' + label.toLowerCase() + '.';
      if (f.validity.typeMismatch && f.type === 'email') return 'Please enter an email like name@example.com.';
      return 'Please check ' + label.toLowerCase() + '.';
    }
    function check(f) {
      var err = d.getElementById(f.id + '-err');
      if (f.checkValidity()) { f.removeAttribute('aria-invalid'); if (err) err.remove(); f.removeAttribute('aria-describedby'); return true; }
      if (!err) { err = d.createElement('p'); err.className = 'field-error'; err.id = f.id + '-err'; f.insertAdjacentElement('afterend', err); }
      err.textContent = msgFor(f);
      f.setAttribute('aria-invalid', 'true'); f.setAttribute('aria-describedby', err.id);
      return false;
    }
    var fields = form.querySelectorAll('input:not([type=hidden]):not(.hp),select,textarea');
    fields.forEach(function (f) { f.addEventListener('blur', function () { if (f.getAttribute('aria-invalid')) check(f); }); });
    form.addEventListener('submit', function (e) {
      var first = null;
      fields.forEach(function (f) { if (!check(f) && !first) first = f; });
      if (first) { e.preventDefault(); first.focus(); }
    });
    form.addEventListener('focusin', function () { d.body.classList.add('form-focus'); });
    form.addEventListener('focusout', function () { d.body.classList.remove('form-focus'); });
  });
})();
