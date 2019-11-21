const REDIRECT_SUCCESS = 'https://imgflip.com/i/3h1wkg';

class CaptivePortal {
  constructor(params) {
    this.errEl = params.errEl;
    this.photoEl = params.photoEl;
    this.passwordEl = params.passwordEl;
    this.termsEl = params.termsEl;
    this.submitEl = params.submitEl;
    this.contentEl = params.contentEl;
    this.bind();
  }

  bind() {
    this.termsEl.addEventListener('load', () => {
      this.termsEl.contentDocument.addEventListener('scroll', this.onTermsScroll.bind(this));
    });

    this.photoEl.addEventListener('mousedown', this.onPhotoMouseDown.bind(this));
    this.photoEl.addEventListener('mouseup', this.onPhotoMouseUp.bind(this));
    this.photoEl.addEventListener('mousemove', this.onPhotoMouseMove.bind(this));
    this.photoEl.addEventListener('touchstart', this.onPhotoMouseDown.bind(this));
    this.photoEl.addEventListener('touchend', this.onPhotoMouseUp.bind(this));
    this.photoEl.addEventListener('touchmove', this.onPhotoMouseMove.bind(this));

    this.submitEl.onclick = this.onSubmit.bind(this);
  }

  onPhotoMouseDown() {
    this.coriePetting = Date.now();
  }

  onPhotoMouseMove() {
    if (this.coriePetting && Date.now() - this.coriePetting > 1500) {
      this.passwordEl.value = atob(btoa('YOUR PASSWORD HERE'));
    }
  }

  onPhotoMouseUp() {
    this.coriePetting = -1;
  }

  onTermsScroll() {
    const b = this.termsEl.contentDocument.body;
    const w = this.termsEl.contentWindow.window;
    if ((w.innerHeight + w.scrollY) >= b.offsetHeight) {
      this.submitEl.disabled = false;
    } else {
      this.submitEl.disabled = true;
    }
  }

  showError(msg) {
    this.errEl.textContent = `Error: ${msg}`;
    this.errEl.classList.remove('hide');
    this.shake();
  }

  onSubmit() {
    const pswd = this.passwordEl.value;
    if (pswd.length === 0) {
      this.showError('Please enter a wifi password');
      return;
    }

    // Grab Mac & AP from URL
    const urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.has('id')) {
      this.showError('You were not referred through captive portal. Please contact admin');
      return;
    }

    let xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/auth_guest');
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    xhr.onload = () => {
      if (xhr.status == 401) {
        this.showError('Invalid Password')
        return;
      }

      if (xhr.status == 503) {
        this.showError('Server side issues authenticating for wifi');
        return;
      }

      if (xhr.status != 200) {
        this.showError('Something went wrong :\'');
        return;
      }

      const resp = JSON.parse(xhr.responseText);
      if (resp.status == "registered") {
        window.location = REDIRECT_SUCCESS;
      }
    };

    xhr.onerror = () => {
      console.log(arguments);
      alert("BOO");
    };

    xhr.send(JSON.stringify({
      ap: urlParams.get('ap'),
      mac: urlParams.get('id'),
      password: pswd,
    }));

    // todo(bookman): finish logic
  }

  shake() {
    this.contentEl.classList.remove('shake');
    setTimeout(() => {
      this.contentEl.classList.add('shake');
    }, 1);
  }
}
