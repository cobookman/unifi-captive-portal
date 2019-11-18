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
      this.passwordEl.value = atob(btoa('some password'));
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

  onSubmit() {
    const pswd = this.passwordEl.value;
    if (pswd.length === 0) {
      this.errEl.textContent = "Error: Please enter a wifi password";
      this.errEl.classList.remove('hide');
      this.shake();
    }

    // todo(bookman): finish logic
  }

  shake() {
    this.contentEl.classList.remove('shake');
    setTimeout(() => {
      this.contentEl.classList.add('shake');
    }, 1);
  }
}
