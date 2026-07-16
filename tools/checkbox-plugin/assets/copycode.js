// 코드 블록(<pre>)에 호버 시 나타나는 "복사" 버튼을 붙인다.
require(['gitbook'], function (gitbook) {
  gitbook.events.bind('page.change', function () {
    var blocks = document.querySelectorAll('.page-inner pre');

    blocks.forEach(function (pre) {
      if (pre.querySelector('.copy-code-btn')) return; // 중복 방지
      pre.classList.add('has-copy-btn');

      var btn = document.createElement('button');
      btn.className = 'copy-code-btn';
      btn.type = 'button';
      btn.textContent = '복사';

      btn.addEventListener('click', function () {
        var code = pre.querySelector('code') || pre;
        var text = code.innerText;

        var done = function () {
          btn.textContent = '복사 완료!';
          btn.classList.add('copied');
          setTimeout(function () {
            btn.textContent = '복사';
            btn.classList.remove('copied');
          }, 1500);
        };

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done, fallback);
        } else {
          fallback();
        }

        function fallback() {
          var ta = document.createElement('textarea');
          ta.value = text;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          try { document.execCommand('copy'); done(); } catch (e) {}
          document.body.removeChild(ta);
        }
      });

      pre.appendChild(btn);
    });
  });
});
