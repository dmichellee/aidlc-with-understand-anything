// 체크박스를 클릭 가능하게 바꾸고,
// 체크 상태를 localStorage에 저장해 새로고침/재방문 후에도 유지한다.
(function () {
  function enableCheckboxes() {
    var page = location.pathname;
    // todo 플러그인은 input[type="checkbox"] 또는 input.task를 생성
    var boxes = document.querySelectorAll(
      '.book-body input[type="checkbox"]'
    );

    boxes.forEach(function (box, idx) {
      // 이미 처리된 건 스킵
      if (box.dataset.liveEnabled) return;
      box.dataset.liveEnabled = 'true';
      box.disabled = false;
      box.style.cursor = 'pointer';

      var key = 'kg-aidlc-check:' + page + ':' + idx;
      if (localStorage.getItem(key) === '1') {
        box.checked = true;
      }

      box.addEventListener('change', function () {
        if (box.checked) {
          localStorage.setItem(key, '1');
        } else {
          localStorage.removeItem(key);
        }
      });
    });
  }

  // HonKit gitbook events (if available)
  if (typeof require !== 'undefined') {
    try {
      require(['gitbook'], function (gitbook) {
        gitbook.events.bind('page.change', enableCheckboxes);
      });
    } catch (e) {
      // fallback
      document.addEventListener('DOMContentLoaded', enableCheckboxes);
      window.addEventListener('load', enableCheckboxes);
    }
  } else {
    document.addEventListener('DOMContentLoaded', enableCheckboxes);
    window.addEventListener('load', enableCheckboxes);
  }

  // MutationObserver fallback — 페이지 내용이 동적으로 바뀔 때 대응
  var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (m) {
      if (m.addedNodes.length) enableCheckboxes();
    });
  });

  document.addEventListener('DOMContentLoaded', function () {
    var body = document.querySelector('.book-body');
    if (body) {
      observer.observe(body, { childList: true, subtree: true });
    }
  });
})();
