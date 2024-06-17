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
    const url = this._firstUrl + `${id}`;
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
  firstUrl: 'http://152.89.218.81:7128/api/get_user_info/',
  secondUrl: 'http://152.89.218.81:7128/api/get_product_list/',
  thirdUrl: 'http://152.89.218.81:7128/api/book_product/',
});

window.api = api;