// отмена закрытия по свайпу (если скролла нет, то работает отлично, когда скролл есть - закрывается при проведении буквой Г, например слева направо и вниз)
const overflow = 100;
document.body.style.overflowY = 'hidden';
document.body.style.marginTop = `${overflow}px`;
document.body.style.height = window.innerHeight + overflow + "px";
document.body.style.paddingBottom = `${overflow}px`;
window.scrollTo(0, overflow);
// отмена закрытия по свайпу

function parseQuery(queryString) {
  let query = {};
  let pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
  for (let i = 0; i < pairs.length; i++) {
      let pair = pairs[i].split('=');
      query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
  }
  return query;
}

const main = document.querySelector('.main');
const snackbar = document.querySelector('.snackbar');
const snackbarReject = snackbar.querySelector(".snackbar__button_reject");
const snackbarSend = snackbar.querySelector(".snackbar__button_confirm");
const snackbarClose = snackbar.querySelector(".snackbar__close-img");
const cardButtons = document.querySelectorAll('.card__button');
const finalPage = document.querySelector(".final-page");
const finalPageBackButton = finalPage.querySelector(".final-page__back-btn");
const finalPageExitButton = finalPage.querySelector(".final-page__button_back");
const loader = document.querySelector(".loader");
const loadingPage = document.querySelector(".loading-page");

let userChatId;
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    loadingPage.classList.add('loading-page_disable');
    main.classList.remove('main_disable');
  }, 2500)
  let app = window.Telegram.WebApp;
  let query = app.initData;
  let user_data_str = parseQuery(query).user;
  let user_data = JSON.parse(user_data_str);
  app.expand();
  app.ready();
  userChatId = user_data["id"];
});

function vibro() {
  let detect = new MobileDetect(window.navigator.userAgent);
  if (detect.os() === 'iOS') {
    window.Telegram.WebApp.HapticFeedback.impactOccurred("light");
  }
  else {
    if ("vibrate" in navigator) {
      // Вибрируем устройство в течение 1000 миллисекунд (1 секунда)
      navigator.vibrate(10);
    } else {
      // Ваш браузер не поддерживает API вибрации
      console.log("Ваш браузер не поддерживает API вибрации.");
    }
  }
}


cardButtons.forEach((cardButton) => {
  cardButton.addEventListener("click", () => {
    snackbar.classList.add("snackbar_active");
  })
});
snackbarReject.addEventListener("click", () => {
  snackbar.classList.remove('snackbar_active');
});
snackbar.addEventListener("click", (evt) => {
  if (evt.currentTarget === evt.target) {
    snackbar.classList.remove('snackbar_active');
  }
});
snackbarClose.addEventListener('click', () => {
  snackbar.classList.remove('snackbar_active');
})
const audio = new Audio();
audio.preload = 'auto';
audio.src = './assets/audio/success-appstore.mp3';
snackbarSend.addEventListener("click", () => {
  vibro();
  loader.classList.add('loader_active');
  snackbarSend.style.opacity = 0.5;
  snackbarSend.style.pointerEvents = 'none';
  snackbarSend.disabled = true;
  setTimeout(() => {
    audio.play();
    snackbarSend.style.opacity = 1;
    snackbarSend.style.pointerEvents = 'all';
    snackbarSend.disabled = false;
    loader.classList.remove('loader_active');
    setTimeout(() => {
      snackbar.classList.remove('snackbar_active');
    }, 150);
    main.classList.add("main_disable");
    finalPage.classList.add("final-page_active");
  }, 2000)
});
finalPageBackButton.addEventListener("click", () => {
  finalPage.classList.remove("final-page_active");
  main.classList.remove('main_disable');
});
finalPageExitButton.addEventListener("click", () => {
  finalPage.classList.remove("final-page_active");
  main.classList.remove('main_disable');
});