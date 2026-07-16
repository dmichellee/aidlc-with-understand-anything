// todo 플러그인이 만든 체크박스를 클릭 가능하게 바꾸고,
// 체크 상태를 localStorage에 저장해 새로고침/재방문 후에도 유지한다.
require(['gitbook'], function (gitbook) {
  gitbook.events.bind('page.change', function () {
    var page = location.pathname;
    var boxes = document.querySelectorAll('input.task[type="checkbox"]');

    boxes.forEach(function (box, idx) {
      box.disabled = false;

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
  });
});
