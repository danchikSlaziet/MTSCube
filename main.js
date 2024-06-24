class Api {
  constructor({firstUrl, secondUrl, thirdUrl}) {
    this._firstUrl = firstUrl;
    this._secondUrl = secondUrl;
    this._thirdUrl = thirdUrl;
  }

  _getFetch(url, options) {
    return fetch(url, options)
      .then(res => {
        if (res.ok) {
          return res.json();
        }
        return Promise.reject(`Ошибка ${res.status}`)
      });
  }

  getUserInfo(id) {
    const url = this._firstUrl + `${id}/`;
    const options = {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
      redirect: 'follow',
      referrerPolicy: 'no-referrer',
    }
    return this._getFetch(url, options);
  }

  getProducts() {
    const url = this._secondUrl;
    const options = {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
      redirect: 'follow',
      referrerPolicy: 'no-referrer',
    }
    return this._getFetch(url, options);
  }

  postProduct(data) {
    const url = this._thirdUrl;
    const options = {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
      redirect: 'follow',
      referrerPolicy: 'no-referrer',
      body: JSON.stringify(data),
    }
    return this._getFetch(url, options);
  }
}

const api = new Api({
  firstUrl: 'https://mts.brandservicebot.ru/api/get_user_info/',
  secondUrl: 'https://mts.brandservicebot.ru/api/get_product_list/',
  thirdUrl: 'https://mts.brandservicebot.ru/api/book_product/',
});

let productId;

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
const cardsContainer = main.querySelector(".cards__content");
const snackbar = document.querySelector('.snackbar');
const snackbarReject = snackbar.querySelector(".snackbar__button_reject");
const snackbarSend = snackbar.querySelector(".snackbar__button_confirm");
const snackbarClose = snackbar.querySelector(".snackbar__close-img");
const finalPage = document.querySelector(".final-page");
const finalPageBackButton = finalPage.querySelector(".final-page__back-btn");
const finalPageExitButton = finalPage.querySelector(".final-page__button_back");
const loader = document.querySelector(".loader");
const loadingPage = document.querySelector(".loading-page");
const summCount = document.querySelector(".summ__text");

function getClass(bool) {
  if (bool) {
    return 'card__button';
  }
  else {
    return 'card__button card__button_disable';
  }
}

let userChatId;
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    // loadingPage.classList.add('loading-page_disable');
    // main.classList.remove('main_disable');
  }, 2500)
  let app = window.Telegram.WebApp;
  let query = app.initData;
  let user_data_str = parseQuery(query).user;
  let user_data = JSON.parse(user_data_str);
  app.expand();
  app.ready();
  userChatId = user_data["id"];
  api.getUserInfo(userChatId)
    .then((userInfo) => {
      console.log(userInfo);
      summCount.textContent = userInfo.user_info.point;
      api.getProducts()
        .then((data) => {
          console.log(data);
          cardsContainer.innerHTML = '';
          data.forEach((card) => {
            const cardPath = card.path == null ? './assets/images/card-img.png' : `${card.path}`;
            cardsContainer.innerHTML += `
              <div class="cards__card card">
                <img src=${cardPath} class="card__img" alt="">
                <p class="card__text">
                  ${card.name}
                </p>
                <div class="card__price-block">
                  <p class="card__price-count">
                    ${card.cost}
                  </p>
                  <img class="card__price-img" src="./assets/images/card-count-img.svg" alt="">
                </div>
                <button data-price-id=${card.cost} data-product-id=${card.id} type="button" class="card__button">
                  Получить
                </button>
              </div>
            `;
            document.querySelectorAll('.card__button').forEach((button) => {
              if (button.dataset.productId == card.id && (userInfo.user_info.point < card.cost || card.count == 0)) {
                button.classList.add("card__button_disable");
              }
            })
          });
          const cardButtons = document.querySelectorAll('.card__button');
            cardButtons.forEach((cardButton) => {
              cardButton.addEventListener("click", () => {
                snackbar.classList.add("snackbar_active");
                snackbar.querySelector('.snackbar__warning').textContent = `Будет списано ${cardButton.dataset.priceId} баллов`;
                productId = cardButton.dataset.productId;
              })
            });
        })
        .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
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
  api.postProduct({
    "user_id_tg": userChatId,
    "product_id": productId
  })
    .then((data) => {
      console.log(data);
      if (data.status === 'Product reserved successfully') {
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
        api.getUserInfo(userChatId)
          .then((userInfo) => {
            console.log(userInfo);
            summCount.textContent = userInfo.user_info.point;
            api.getProducts()
              .then((data) => {
                console.log(data);
                cardsContainer.innerHTML = '';
                data.forEach((card) => {
                  cardsContainer.innerHTML += `
                    <div class="cards__card card">
                      <img src="./assets/images/card-img.png" class="card__img" alt="">
                      <p class="card__text">
                        ${card.name}
                      </p>
                      <div class="card__price-block">
                        <p class="card__price-count">
                          ${card.cost}
                        </p>
                        <img class="card__price-img" src="./assets/images/card-count-img.svg" alt="">
                      </div>
                      <button data-price-id=${card.cost} data-product-id=${card.id} type="button" class=${getClass(userInfo.user_info.point < card.cost)}>
                        Получить
                      </button>
                    </div>
                  `;
                  document.querySelectorAll('.card__button').forEach((button) => {
                    if (button.dataset.productId == card.id && (userInfo.user_info.point < card.cost || card.count == 0)) {
                      button.classList.add("card__button_disable");
                    }
                  })
                });
                const cardButtons = document.querySelectorAll('.card__button');
                  cardButtons.forEach((cardButton) => {
                    cardButton.addEventListener("click", () => {
                      snackbar.classList.add("snackbar_active");
                      productId = cardButton.dataset.productId;
                      snackbar.querySelector('.snackbar__warning').textContent = `Будет списано ${cardButton.dataset.priceId} баллов`;
                    })
                  });
              })
              .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
      }
      else if (data.status === 'Not enough points') {
        snackbarSend.textContent = 'Не хватает баллов';
        loader.classList.remove('loader_active');
        setTimeout(() => {
          snackbarSend.style.opacity = 1;
          snackbarSend.style.pointerEvents = 'all';
          snackbarSend.disabled = false;
          snackbarSend.textContent = 'Подтвердить';
        }, 2500);
      }
      else if (data.status === 'Product out of stock') {
        snackbarSend.textContent = 'Этот товар раскуплен';
        loader.classList.remove('loader_active');
        setTimeout(() => {
          snackbarSend.style.opacity = 1;
          snackbarSend.style.pointerEvents = 'all';
          snackbarSend.disabled = false;
          snackbarSend.textContent = 'Подтвердить';
        }, 2500);
      }
      else {
        snackbarSend.textContent = 'Что-то пошло не так :(';
        loader.classList.remove('loader_active');
        setTimeout(() => {
          snackbarSend.style.opacity = 1;
          snackbarSend.style.pointerEvents = 'all';
          snackbarSend.disabled = false;
          snackbarSend.textContent = 'Подтвердить';
        }, 2500);
      }
    })
    .catch(err => console.log(err));
});
finalPageBackButton.addEventListener("click", () => {
  finalPage.classList.remove("final-page_active");
  main.classList.remove('main_disable');
});
finalPageExitButton.addEventListener("click", () => {
  finalPage.classList.remove("final-page_active");
  main.classList.remove('main_disable');
});