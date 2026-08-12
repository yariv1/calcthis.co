/* calcthis.co feedback widget — shared, self-contained, theme-inheriting.
   Renders a floating button + panel; submits to FormSubmit (getapps.support@gmail.com).
   No dependencies. Inherits host page theme via CSS variables. */
(function () {
  if (window.__fbWidget) return;
  window.__fbWidget = true;

  var EMAIL = 'getapps.support@gmail.com';
  var ENDPOINT = 'https://formsubmit.co/ajax/' + EMAIL;
  var SUBJECT = 'calcthis.co feedback';

  var css = ''
    + '#fbBtn{position:fixed;right:16px;bottom:16px;z-index:2147483000;width:52px;height:52px;border-radius:50%;'
    +   'border:1px solid var(--line,#E7DECF);background:var(--amber,#B5761F);color:#fff;cursor:pointer;'
    +   'display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(36,26,17,.25);'
    +   'transition:transform .15s ease,opacity .15s ease;padding:0;}'
    + '#fbBtn:hover{transform:scale(1.06);}'
    + '#fbBtn svg{width:24px;height:24px;display:block;}'
    + '#fbOv{position:fixed;inset:0;z-index:2147483001;background:rgba(36,26,17,.35);display:none;'
    +   'align-items:flex-end;justify-content:flex-end;padding:16px;}'
    + '#fbOv.open{display:flex;}'
    + '#fbPanel{width:320px;max-width:calc(100vw - 32px);background:var(--card,#FFFFFF);'
    +   'color:var(--ink,#241A11);border:1px solid var(--line,#E7DECF);border-radius:16px;'
    +   'box-shadow:0 12px 40px rgba(36,26,17,.25);padding:16px;font-family:inherit;'
    +   'max-height:calc(100vh - 32px);overflow:auto;}'
    + '#fbPanel h3{margin:0 28px 6px 0;font-size:15px;line-height:1.35;font-weight:700;}'
    + '#fbPanel p{margin:0 0 12px;font-size:12.5px;line-height:1.45;color:var(--muted,#8A7A66);}'
    + '#fbX{position:absolute;top:0;right:0;width:26px;height:26px;border:none;background:transparent;'
    +   'color:var(--muted,#8A7A66);font-size:20px;line-height:1;cursor:pointer;border-radius:8px;}'
    + '#fbX:hover{color:var(--ink,#241A11);}'
    + '#fbWrap{position:relative;}'
    + '#fbTa{width:100%;box-sizing:border-box;min-height:96px;resize:vertical;background:var(--paper,#FBF8F3);'
    +   'color:var(--ink,#241A11);border:1px solid var(--line,#E7DECF);border-radius:10px;padding:10px;'
    +   'font-family:inherit;font-size:13px;line-height:1.4;outline:none;}'
    + '#fbTa:focus{border-color:var(--amber,#B5761F);}'
    + '#fbSend{margin-top:10px;width:100%;padding:10px 14px;border:none;border-radius:10px;'
    +   'background:var(--amber,#B5761F);color:#fff;font-family:inherit;font-size:14px;font-weight:700;'
    +   'cursor:pointer;transition:opacity .15s ease;}'
    + '#fbSend:hover{opacity:.9;}'
    + '#fbSend:disabled{opacity:.5;cursor:default;}'
    + '#fbMsg{margin-top:10px;font-size:12.5px;line-height:1.45;color:var(--muted,#8A7A66);min-height:16px;}'
    + '#fbThanks{text-align:center;padding:14px 4px;}'
    + '#fbThanks .fbBig{font-size:16px;font-weight:700;margin-bottom:4px;}'
    + '#fbThanks .fbSub{font-size:12.5px;color:var(--muted,#8A7A66);}'
    + '@media(max-width:520px){#fbBtn{width:46px;height:46px;right:14px;bottom:14px;}#fbBtn svg{width:22px;height:22px;}}';

  var chat = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" '
    + 'stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 '
    + '8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 '
    + '4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>';

  function el(html) { var d = document.createElement('div'); d.innerHTML = html; return d.firstChild; }

  function mount() {
    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    var btn = el('<button id="fbBtn" aria-label="Send feedback" title="Send feedback">' + chat + '</button>');

    var ov = el(
      '<div id="fbOv" role="dialog" aria-modal="true" aria-label="Feedback">'
      + '<div id="fbPanel"><div id="fbWrap">'
      + '<button id="fbX" aria-label="Close">&times;</button>'
      + '<div id="fbForm">'
      + '<h3>Your feedback will be super helpful and well appreciated.</h3>'
      + '<p>The good, the bad and the ugly 🙂<br>Anything you’d like to share? '
      + 'Your experience, what you think we should improve.</p>'
      + '<textarea id="fbTa" placeholder="Type your thoughts here…"></textarea>'
      + '<button id="fbSend">Send →</button>'
      + '<div id="fbMsg"></div>'
      + '</div>'
      + '<div id="fbThanks" style="display:none;">'
      + '<div class="fbBig">Thanks 🙂</div>'
      + '<div class="fbSub">We really appreciate you taking the time.</div>'
      + '</div>'
      + '</div></div></div>'
    );

    document.body.appendChild(btn);
    document.body.appendChild(ov);

    var ta = ov.querySelector('#fbTa');
    var send = ov.querySelector('#fbSend');
    var msg = ov.querySelector('#fbMsg');
    var form = ov.querySelector('#fbForm');
    var thanks = ov.querySelector('#fbThanks');

    function open() { ov.classList.add('open'); setTimeout(function () { ta.focus(); }, 40); }
    function close() { ov.classList.remove('open'); }

    btn.addEventListener('click', open);
    ov.querySelector('#fbX').addEventListener('click', close);
    ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });

    send.addEventListener('click', function () {
      var text = (ta.value || '').trim();
      if (!text) { msg.textContent = 'Please add a note first.'; ta.focus(); return; }
      send.disabled = true; msg.textContent = 'Sending…';
      fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          message: text,
          _subject: SUBJECT,
          _template: 'table',
          page: location.href
        })
      }).then(function (r) { return r.json().catch(function () { return {}; }); })
        .then(function (d) {
          if (d && (d.success === 'true' || d.success === true)) {
            form.style.display = 'none'; thanks.style.display = 'block';
            setTimeout(close, 2200);
          } else {
            send.disabled = false;
            msg.textContent = 'Could not send — please try again.';
          }
        })
        .catch(function () { send.disabled = false; msg.textContent = 'Could not send — please try again.'; });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else { mount(); }
})();
