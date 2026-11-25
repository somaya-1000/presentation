/* ============================================================
   الذكاء الاصطناعي — من فكرة إلى عالم يصنع المستقبل
   ملف السكربت: التنقل + الاختبار التفاعلي + الرسوم المتحركة
   ============================================================ */
(function () {
  'use strict';

  /* ---------------------------------------------------------
     1) نظام التنقل بين الشرائح
     --------------------------------------------------------- */
  var slides = Array.prototype.slice.call(document.querySelectorAll('.slide'));
  var currentEl = document.getElementById('current');
  var totalEl = document.getElementById('total');
  var progressBar = document.getElementById('progressBar');
  var prevBtn = document.getElementById('prevBtn');
  var nextBtn = document.getElementById('nextBtn');
  var deck = document.getElementById('deck');

  if (!slides.length) return;

  var total = slides.length;
  var index = 0;

  function clamp(n) { return Math.max(0, Math.min(total - 1, n)); }

  function render() {
    for (var i = 0; i < total; i++) {
      var active = i === index;
      slides[i].classList.toggle('is-active', active);
      slides[i].setAttribute('aria-hidden', active ? 'false' : 'true');
      if ('inert' in slides[i]) slides[i].inert = !active;
      if (active) slides[i].scrollTop = 0;
    }
    var inner = slides[index].querySelector('.slide-inner');
    if (inner) inner.scrollTop = 0;

    currentEl.textContent = String(index + 1).padStart(2, '0');
    totalEl.textContent = String(total).padStart(2, '0');
    progressBar.style.width = ((index + 1) * 100 / total) + '%';
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === total - 1;

    try { history.replaceState(null, '', '#' + (index + 1)); } catch (e) { /* file:// */ }
  }

  function goTo(n) {
    n = clamp(n);
    if (n === index) return;
    index = n;
    render();
  }
  function next() { goTo(index + 1); }
  function prev() { goTo(index - 1); }

  var hashNum = parseInt((location.hash || '').replace('#', ''), 10);
  if (!isNaN(hashNum)) index = clamp(hashNum - 1);
  render();

  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);

  function isInteractive(el) {
    return !!(el && el.closest && el.closest('button,a,input,textarea,select,[contenteditable="true"]'));
  }

  document.addEventListener('keydown', function (e) {
    if (e.defaultPrevented || e.ctrlKey || e.altKey || e.metaKey) return;
    var target = e.target;
    var key = e.key;

    /* المسافة أو Enter على زر: ينفّذ الزر ولا ينتقل للشريحة */
    if ((key === ' ' || key === 'Spacebar' || key === 'Enter') && isInteractive(target)) return;

    switch (key) {
      /* في RTL: الأمام نحو اليسار */
      case 'ArrowLeft':
      case 'ArrowDown':
      case 'PageDown':
      case ' ':
      case 'Spacebar':
        e.preventDefault();
        next();
        break;
      case 'ArrowRight':
      case 'ArrowUp':
      case 'PageUp':
        e.preventDefault();
        prev();
        break;
      case 'Home':
        e.preventDefault();
        goTo(0);
        break;
      case 'End':
        e.preventDefault();
        goTo(total - 1);
        break;
      default:
        break;
    }
  });

  /* السحب باللمس — مع تجاهل المناطق التفاعلية كي لا يتعارض مع الاختبار */
  var touchX = null, touchY = null, touchOnUI = false;
  deck.addEventListener('touchstart', function (e) {
    if (e.touches.length !== 1) { touchX = null; return; }
    if (isInteractive(e.target)) { touchX = null; touchOnUI = true; return; }
    touchOnUI = false;
    touchX = e.touches[0].clientX;
    touchY = e.touches[0].clientY;
  }, { passive: true });

  deck.addEventListener('touchend', function (e) {
    if (touchX === null || touchOnUI || !e.changedTouches.length) return;
    var dx = e.changedTouches[0].clientX - touchX;
    var dy = e.changedTouches[0].clientY - touchY;
    touchX = null;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.4) {
      if (dx > 0) next(); else prev();
    }
  }, { passive: true });

  deck.addEventListener('touchcancel', function () { touchX = null; }, { passive: true });

  window.addEventListener('hashchange', function () {
    var n = parseInt((location.hash || '').replace('#', ''), 10);
    if (!isNaN(n) && n - 1 !== index) goTo(n - 1);
  });

  /* ---------------------------------------------------------
     2) وضع ملء الشاشة
     --------------------------------------------------------- */
  var fsBtn = document.getElementById('fullscreenBtn');
  if (fsBtn) {
    fsBtn.addEventListener('click', function () {
      var el = document.documentElement;
      try {
        if (!document.fullscreenElement && !document.webkitFullscreenElement) {
          var req = el.requestFullscreen || el.webkitRequestFullscreen;
          if (req) req.call(el);
        } else {
          var exit = document.exitFullscreen || document.webkitExitFullscreen;
          if (exit) exit.call(document);
        }
      } catch (e) { /* المتصفح يمنع ملء الشاشة */ }
    });

    function syncFsLabel() {
      var on = !!(document.fullscreenElement || document.webkitFullscreenElement);
      fsBtn.setAttribute('aria-label', on ? 'إلغاء وضع ملء الشاشة' : 'تفعيل وضع ملء الشاشة');
      fsBtn.setAttribute('title', on ? 'إلغاء ملء الشاشة' : 'ملء الشاشة');
    }
    document.addEventListener('fullscreenchange', syncFsLabel);
    document.addEventListener('webkitfullscreenchange', syncFsLabel);
  }

  /* ---------------------------------------------------------
     3) بطاقات المحاور التفاعلية — الشريحة 2
     --------------------------------------------------------- */
  var axisTexts = {
    data: 'البيانات هي الوقود: كل صورة أو نص أو رقم يمثّل مثالاً يتعلم منه النظام.',
    pattern: 'الأنماط هي القاعدة: يكتشف النظام العلاقات المتكررة بين الأشياء بدلاً من حفظ كل حالة وحدها.',
    solve: 'الهدف هو المساعدة: يقدّم النظام احتمالات واقتراحات يدعم بها الإنسان اتخاذ القرار.'
  };
  var axisDetail = document.getElementById('axisDetail');
  var axisCards = Array.prototype.slice.call(document.querySelectorAll('.axis-card'));
  axisCards.forEach(function (card) {
    card.addEventListener('click', function () {
      axisCards.forEach(function (c) {
        var selected = c === card;
        c.classList.toggle('is-selected', selected);
        c.setAttribute('aria-pressed', selected ? 'true' : 'false');
      });
      if (axisDetail) axisDetail.textContent = axisTexts[card.dataset.axis] || '';
    });
  });

  /* ---------------------------------------------------------
     4) الاختبار التفاعلي — الشريحة 9
     --------------------------------------------------------- */
  var quizRoot = document.getElementById('quiz');
  var questions = [
    {
      q: 'أي من التالي يُعد تطبيقاً للذكاء الاصطناعي؟',
      options: ['آلة حاسبة عادية', 'نظام يتعرف على الوجوه', 'مصباح كهربائي تقليدي'],
      answer: 1,
      why: 'نظام التعرف على الوجوه يتعلم أنماط ملامح الوجوه من أمثلة كثيرة، بينما الآلة الحاسبة والمصباح ينفّذان تعليمات ثابتة.'
    },
    {
      q: 'ما الذي تحتاجه أنظمة تعلم الآلة حتى تتعلم؟',
      options: ['البيانات', 'الألوان', 'الصوت فقط'],
      answer: 0,
      why: 'البيانات هي المادة الأساسية التي يستخلص منها النظام الأنماط ويبني نموذجه؛ قد تكون نصوصاً أو صوراً أو أرقاماً.'
    },
    {
      q: 'هل يمكن أن ينتج الذكاء الاصطناعي معلومات غير صحيحة؟',
      options: ['نعم', 'لا'],
      answer: 0,
      why: 'نعم؛ قد ينتج النظام معلومات خاطئة أو مضللة، لذلك يجب التحقق من المصادر ومراجعة النتائج بعين بشرية.'
    }
  ];
  var letters = ['أ', 'ب', 'ج'];
  var qi = 0, score = 0, answered = false;

  function renderQuiz() {
    if (!quizRoot) return;
    answered = false;
    var item = questions[qi];
    var dots = questions.map(function (_, i) {
      return '<i class="' + (i < qi ? 'done' : i === qi ? 'active' : '') + '"></i>';
    }).join('');

    var options = item.options.map(function (opt, i) {
      return '<button class="quiz-option" type="button" data-opt="' + i + '">' +
        '<span class="quiz-letter">' + letters[i] + '</span>' +
        '<span>' + opt + '</span>' +
        '<span class="opt-icon" aria-hidden="true"></span></button>';
    }).join('');

    quizRoot.innerHTML =
      '<div class="quiz-card">' +
        '<div class="quiz-top"><span class="quiz-count">السؤال ' + (qi + 1) + ' من ' + questions.length + '</span>' +
        '<span class="quiz-dots" aria-hidden="true">' + dots + '</span></div>' +
        '<p class="quiz-question">' + item.q + '</p>' +
        '<div class="quiz-options" role="group" aria-label="الإجابات">' + options + '</div>' +
        '<div class="quiz-feedback" id="quizFeedback" role="status"></div>' +
        '<div class="quiz-actions" id="quizActions"></div>' +
      '</div>';
  }

  function answerQuestion(choice) {
    if (answered || !quizRoot) return;
    answered = true;
    var item = questions[qi];
    var correct = choice === item.answer;
    if (correct) score++;

    var btns = Array.prototype.slice.call(quizRoot.querySelectorAll('.quiz-option'));
    btns.forEach(function (btn, i) {
      btn.disabled = true;
      if (i === item.answer) {
        btn.classList.add('is-correct');
        btn.querySelector('.opt-icon').textContent = '✓';
      } else if (i === choice) {
        btn.classList.add('is-wrong');
        btn.querySelector('.opt-icon').textContent = '✕';
      }
    });

    var feedback = quizRoot.querySelector('#quizFeedback');
    feedback.innerHTML = '<strong>' + (correct ? 'إجابة صحيحة! ✦' : 'ليست الإجابة الصحيحة.') + '</strong> ' + item.why;
    feedback.classList.add('show');

    var actions = quizRoot.querySelector('#quizActions');
    actions.innerHTML = '<button class="quiz-next" type="button" id="quizNext">' +
      (qi === questions.length - 1 ? 'عرض النتيجة ←' : 'السؤال التالي ←') + '</button>';
    actions.querySelector('#quizNext').addEventListener('click', function () {
      if (qi < questions.length - 1) { qi++; renderQuiz(); }
      else showResult();
    });
  }

  function showResult() {
    if (!quizRoot) return;
    var emoji = score === 3 ? '🏆' : score >= 2 ? '🎉' : '💡';
    var title = score === 3 ? 'إجابات موفّقة!' : score >= 2 ? 'عمل جيد!' : 'فرصة للتعلّم!';
    var note = score === 3
      ? 'لديك فهم واضح لكيفية عمل الذكاء الاصطناعي وحدوده. تذكّر أن الاستخدام الواعي لا يقل أهمية عن الفهم.'
      : 'راجع التفسيرات ثم حاول مرة أخرى؛ الهدف من التجربة التعلّم لا مجرد الحصول على درجة.';

    quizRoot.innerHTML =
      '<div class="quiz-card quiz-result">' +
        '<div class="result-emoji" aria-hidden="true">' + emoji + '</div>' +
        '<h3 class="result-title">' + title + '</h3>' +
        '<p class="result-score">نتيجتك <b>' + score + ' / ' + questions.length + '</b></p>' +
        '<p class="result-note">' + note + '</p>' +
        '<div class="quiz-actions" style="justify-content:center">' +
          '<button class="quiz-next" type="button" id="quizRetry"><svg class="icon"><use href="#i-refresh"></use></svg> إعادة المحاولة</button>' +
        '</div>' +
      '</div>';
    quizRoot.querySelector('#quizRetry').addEventListener('click', function () {
      qi = 0; score = 0; renderQuiz();
    });
  }

  if (quizRoot) {
    renderQuiz();
    quizRoot.addEventListener('click', function (e) {
      var btn = e.target.closest('.quiz-option');
      if (btn) answerQuestion(parseInt(btn.dataset.opt, 10));
    });
  }

  /* ---------------------------------------------------------
     5) شبكة نقاط خلفية متحركة
     --------------------------------------------------------- */
  var canvas = document.getElementById('bgCanvas');
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (canvas && !reduceMotion) {
    var ctx = canvas.getContext('2d');
    var w = 0, h = 0, dpr = 1, nodes = [], raf = null;

    function resizeCanvas() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.max(18, Math.min(52, Math.floor((w * h) / 26000)));
      nodes = [];
      for (var i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - .5) * .18,
          vy: (Math.random() - .5) * .18,
          r: Math.random() * 1.6 + .8
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      var maxDist = Math.min(170, Math.max(110, w / 9));
      for (var i = 0; i < nodes.length; i++) {
        var a = nodes[i];
        a.x += a.vx; a.y += a.vy;
        if (a.x < -10) a.x = w + 10;
        if (a.x > w + 10) a.x = -10;
        if (a.y < -10) a.y = h + 10;
        if (a.y > h + 10) a.y = -10;

        for (var j = i + 1; j < nodes.length; j++) {
          var b = nodes[j];
          var dx = a.x - b.x, dy = a.y - b.y;
          var d2 = dx * dx + dy * dy;
          if (d2 < maxDist * maxDist) {
            var alpha = (1 - Math.sqrt(d2) / maxDist) * .16;
            ctx.strokeStyle = 'rgba(110,180,255,' + alpha.toFixed(3) + ')';
            ctx.lineWidth = .8;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
        ctx.fillStyle = 'rgba(120,215,255,.42)';
        ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2); ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    }

    resizeCanvas();
    draw();
    window.addEventListener('resize', resizeCanvas);
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { if (raf) cancelAnimationFrame(raf); raf = null; }
      else if (!raf) draw();
    });
  }
})();
