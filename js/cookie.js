class Cookie {
  static urlsImagesNormales = [
    "./assets/images/Croissant@2x.png",
    "./assets/images/Cupcake@2x.png",
    "./assets/images/Danish@2x.png",
    "./assets/images/Donut@2x.png",
    "./assets/images/Macaroon@2x.png",
    "./assets/images/SugarCookie@2x.png",
  ];
  static urlsImagesSurlignees = [
    "./assets/images/Croissant-Highlighted@2x.png",
    "./assets/images/Cupcake-Highlighted@2x.png",
    "./assets/images/Danish-Highlighted@2x.png",
    "./assets/images/Donut-Highlighted@2x.png",
    "./assets/images/Macaroon-Highlighted@2x.png",
    "./assets/images/SugarCookie-Highlighted@2x.png",
  ];

  constructor(type, ligne, colonne) {
    this.type = type;
    this.ligne = ligne;
    this.colonne = colonne;

    this.htmlImage = document.createElement("img");
    this.htmlImage.src = Cookie.urlsImagesNormales[type];
    this.htmlImage.width = 80;
    this.htmlImage.height = 80;
    this.htmlImage.dataset.colonne = colonne;
    this.htmlImage.dataset.ligne = ligne;
    this.htmlImage.classList.add("cookies");
    this.isDisplayed = true;
    this.isMarked = false;
  }

  marquer(){
    this.isMarked = true;
    this.htmlImage.classList.add("cookies-marked");
  }

  annulerMarquer(){
    this.isMarked = false;
    this.htmlImage.classList.remove("cookies-marked");
  }

  supprimer(){
    this.isDisplayed = false;
    this.htmlImage.classList.add("cookies-deleted");
    this.type = '';
  }

  annulerSupprimer(){
    this.isDisplayed = true;
    this.htmlImage.classList.remove("cookies-deleted");
  }

  selectionnee() {
     // on change l'image et la classe CSS
    this.htmlImage.classList.add("cookies-selected");
    this.htmlImage.src = Cookie.urlsImagesSurlignees[this.type];
  }

  deselectionnee() {
    // on change l'image et la classe CSS
    this.htmlImage.classList.remove("cookies-selected");
    this.htmlImage.src = Cookie.urlsImagesNormales[this.type];
  }

  static swapCookies(c1, c2) {
     // On échange leurs images et types
     // et on remet les désélectionne
    let typeBuffer = c1.type;
    let imgBuffer = c1.htmlImage.src;
    c1.htmlImage.src = c2.htmlImage.src;
    c2.htmlImage.src = imgBuffer;
    c1.type = c2.type;
    c2.type = typeBuffer;
    c1.deselectionnee();
    c2.deselectionnee();
  }

  /** renvoie la distance entre deux cookies */
  static distance(cookie1, cookie2) {
    let l1 = cookie1.ligne;
    let c1 = cookie1.colonne;
    let l2 = cookie2.ligne;
    let c2 = cookie2.colonne;

    const distance = Math.sqrt((c2 - c1) * (c2 - c1) + (l2 - l1) * (l2 - l1));
    return distance;
  }
}
