"use strict";

/* ============================================================
   Brew Haven — интерактив лендинга
   Без библиотек: бургер-меню, анимации при прокрутке (IO),
   слайдер отзывов, лайтбокс, форма с toast, кнопка «наверх».
   ============================================================ */

// ----- Бургер-меню -----
const burger = document.getElementById("burger");
const navLinks = document.getElementById("navLinks");

burger.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  burger.classList.toggle("active", isOpen);
  burger.setAttribute("aria-expanded", String(isOpen));
});

// Закрываем меню при клике по ссылке (на мобильных)
navLinks.querySelectorAll("a").forEach((link) =>
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    burger.classList.remove("active");
    burger.setAttribute("aria-expanded", "false");
  })
);

// ----- Тень шапки при прокрутке + кнопка «Наверх» -----
const navbar = document.getElementById("navbar");
const scrollTopBtn = document.getElementById("scrollTop");

window.addEventListener(
  "scroll",
  () => {
    navbar.classList.toggle("scrolled", window.scrollY > 10);
    scrollTopBtn.classList.toggle("show", window.scrollY > 400);
  },
  { passive: true }
);

scrollTopBtn.addEventListener("click", () =>
  window.scrollTo({ top: 0, behavior: "smooth" })
);

// ----- Анимации при прокрутке (Intersection Observer) -----
// Элементы с классом .reveal плавно появляются; data-delay задаёт каскадную задержку.
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target); // анимируем один раз
      }
    });
  },
  { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
);

document.querySelectorAll(".reveal").forEach((el) => {
  if (el.dataset.delay) el.style.transitionDelay = `${el.dataset.delay}s`;
  revealObserver.observe(el);
});

// ----- Подсветка активного пункта меню (scrollspy) -----
const sections = document.querySelectorAll("main section[id]");
const links = navLinks.querySelectorAll('a[href^="#"]');

const spyObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((link) =>
        link.classList.toggle(
          "active",
          link.getAttribute("href") === `#${entry.target.id}`
        )
      );
    });
  },
  // Секция считается активной, когда пересекает середину экрана
  { rootMargin: "-45% 0px -50% 0px" }
);
sections.forEach((s) => spyObserver.observe(s));

// ----- Слайдер отзывов -----
const slider = document.getElementById("slider");
const slidesEl = document.getElementById("slides");
const slides = Array.from(slidesEl.children);
const dotsWrap = document.getElementById("sliderDots");

let current = 0;
let autoTimer = null;

// Создаём точки-переключатели по числу слайдов
slides.forEach((_, i) => {
  const dot = document.createElement("button");
  dot.setAttribute("aria-label", `Отзыв ${i + 1}`);
  dot.addEventListener("click", () => {
    goTo(i);
    startAuto(); // после ручного действия запускаем отсчёт заново
  });
  dotsWrap.appendChild(dot);
});
const dots = Array.from(dotsWrap.children);

function goTo(index) {
  current = (index + slides.length) % slides.length;
  slidesEl.style.transform = `translateX(-${current * 100}%)`;
  dots.forEach((d, i) => d.classList.toggle("active", i === current));
}

function next() { goTo(current + 1); }
function prev() { goTo(current - 1); }

// Автопрокрутка каждые 5 секунд; на паузе при наведении курсора
function startAuto() {
  stopAuto();
  autoTimer = setInterval(next, 5000);
}
function stopAuto() {
  if (autoTimer) clearInterval(autoTimer);
  autoTimer = null;
}

document.getElementById("nextBtn").addEventListener("click", () => { next(); startAuto(); });
document.getElementById("prevBtn").addEventListener("click", () => { prev(); startAuto(); });
slider.addEventListener("mouseenter", stopAuto);
slider.addEventListener("mouseleave", startAuto);

goTo(0);
startAuto();

// ----- Лайтбокс для галереи -----
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxCaption = document.getElementById("lightboxCaption");

function openLightbox(src, caption) {
  lightboxImg.src = src;
  lightboxCaption.textContent = caption;
  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden"; // не скроллим фон
}

function closeLightbox() {
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

document.querySelectorAll(".gallery-item").forEach((item) => {
  const img = item.querySelector("img");
  const caption = item.querySelector("figcaption").textContent;
  const open = () => openLightbox(item.dataset.full || img.src, caption);

  item.addEventListener("click", open);
  item.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
  });
});

document.getElementById("lightboxClose").addEventListener("click", closeLightbox);
lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) closeLightbox(); // клик по затемнению
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && lightbox.classList.contains("open")) closeLightbox();
});

// ----- Форма: показываем toast вместо отправки -----
const form = document.getElementById("contactForm");
const toast = document.getElementById("toast");
let toastTimer = null;

form.addEventListener("submit", (e) => {
  e.preventDefault();
  form.reset();
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3000);
});

// ----- Фолбэк для картинок галереи -----
// Если picsum.photos недоступен, показываем градиент с иконкой вместо битого фото.
document.querySelectorAll(".gallery-item img").forEach((img) => {
  img.addEventListener("error", () => img.closest(".gallery-item").classList.add("noimg"));
});
