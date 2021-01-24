/* Classe principale du jeu, c'est une grille de cookies. Le jeu se joue comme
Candy Crush Saga etc... c'est un match-3 game... */
class Grille {
    tabCookies = [];
    tabImgCliquees = [];

  constructor(l, c) {
    this.nbLignes = l;
    this.nbColonnes = c;
    this.remplirTableauDeCookies(6);
    this.setTime()
  }


  /**
   * parcours la liste des divs de la grille et affiche les images des cookies
   * correspondant à chaque case. Au passage, à chaque image on va ajouter des
   * écouteurs de click et de drag'n'drop pour pouvoir interagir avec elles
   * et implémenter la logique du jeu.
   */
  
  showCookies() {
    let caseDivs = document.querySelectorAll("#grille div");

    caseDivs.forEach((div, index) => {
      let ligne = Math.floor(index/this.nbLignes);
      let colonne = index%this.nbColonnes;
      let img = this.tabCookies[ligne][colonne].htmlImage;

      img.onclick = (evt) => {
        let imgCliquee = evt.target;
        let imgLigne = imgCliquee.dataset.ligne;
        let imgColonne = imgCliquee.dataset.colonne;
        let cookieCliquee = this.tabCookies[imgLigne][imgColonne];
        cookieCliquee.selectionnee();

       if(this.tabImgCliquees.length == 0){
         this.tabImgCliquees.push(this.tabCookies[imgLigne][imgColonne]); 
       
        } else if(this.tabImgCliquees.length === 1) {
         this.tabImgCliquees.push(this.tabCookies[imgLigne][imgColonne]);
         
         if(Cookie.distance(this.tabImgCliquees[0],this.tabImgCliquees[1]) === 1){
         Cookie.swapCookies(this.tabImgCliquees[0],this.tabImgCliquees[1]);
         this.tabImgCliquees[1].deselectionnee();
         this.tabImgCliquees[0].deselectionnee();
        } else {
          console.log("Vos deux cookies doivent être à une case de distance pour être échangés");
          this.tabImgCliquees[1].deselectionnee();
          this.tabImgCliquees[0].deselectionnee();
        }
        this.tabImgCliquees = [];
        } 
      }
     //DRAG&DROP
      img.ondragstart = (evt) => {
        let imgDrag = evt.target;
        let imgLigne = imgDrag.dataset.ligne;
        let imgColonne = imgDrag.dataset.colonne;
        let cookieDrag = this.tabCookies[imgLigne][imgColonne];

        this.tabImgCliquees = [];
        this.tabImgCliquees.push(cookieDrag);
        cookieDrag.selectionnee();
      }

      img.ondragover = (evt) => {
        return false;
      };

      img.ondragenter = (evt) => {
        let img = evt.target;
        img.classList.add("grilleDragOver");
      }

      img.ondragleave = (evt) => {
        let img = evt.target;
        img.classList.remove("grilleDragOver");
      }

      img.ondrop = async (evt) => {
        let isMarked = false;
        let imgDrop = evt.target;
        let imgLigne = imgDrop.dataset.ligne;
        let imgColonne = imgDrop.dataset.colonne;
        let cookieDrop = this.tabCookies[imgLigne][imgColonne];

        this.tabImgCliquees.push(cookieDrop);
        cookieDrop.selectionnee();

        if(Cookie.distance(this.tabImgCliquees[0],this.tabImgCliquees[1]) === 1){
            Cookie.swapCookies(this.tabImgCliquees[0],this.tabImgCliquees[1]);  
        }
        else {
          console.log("Vos deux cookies doivent être à une case de distance pour être échangés");
          this.tabImgCliquees[1].deselectionnee();
          this.tabImgCliquees[0].deselectionnee();
          }

          //si on a des cookies marqués, ismarked est true, sinon il est false
        imgDrop.classList.remove("grilleDragOver");
        this.tabImgCliquees = [];

        do{
          isMarked = this.marqueCookies();
          await new Promise((resolve)=> setTimeout(() => {this.supprimerCookiesMarques(); resolve()},2000));
          this.handleChute();
          
          this.remplissageGrille(6);
          //isMarked est true, si aucune des deux fonctions ne trouve de match
        } while(isMarked);
      }
    //on affiche l'image dans le div pour la faire apparaitre à l'écran.
    div.appendChild(img);
    });
  }
  
  handleChute(){  // on fait une boucle pour que la fonction qui gère la chute puisse tout faire chuter jusqu'au moment où tout a été fait
    let isChute = false;
    do {
        isChute = this.chuteCookie();
      } while(!isChute);
  }
  
  marqueCookies(){   // on marque tous les cookies qui doivent être supprimés
      return !(this.detecterMatchLignes() && this.detecterMatchColonnes());
  }


  /**
   * Initialisation du niveau de départ. Le paramètre est le nombre de cookies différents
   * dans la grille. 4 types (4 couleurs) = facile de trouver des possibilités de faire
   * des groupes de 3. 5 = niveau moyen, 6 = niveau difficile
   *
   * Améliorations : 1) s'assurer que dans la grille générée il n'y a pas déjà de groupes
   * de trois. 2) S'assurer qu'il y a au moins 1 possibilité de faire un groupe de 3 sinon
   * on a perdu d'entrée. 3) réfléchir à des stratégies pour générer des niveaux plus ou moins
   * difficiles.
   *
   * On verra plus tard pour les améliorations...
   */

  remplirTableauDeCookies(nbDeCookiesDifferents) { // on remplit le tabeau de cookies et on vérifie qu'il n'y ai pas de match dès le début
    this.tabCookies = create2DArray(9);
    let isVerified = false;
    for(let l=0;l<this.nbLignes;l++){
      for(let c=0; c < this.nbColonnes;c++){
        let type = Math.floor(Math.random()*nbDeCookiesDifferents);
        this.tabCookies[l][c] = new Cookie(type,l,c);
        }
    }
    // verifier renvoie false quand il n'y a rien à modifier
    do { 
      isVerified = this.verifierColonne(nbDeCookiesDifferents) && this.verifierLigne(nbDeCookiesDifferents);
    } while (!isVerified);
  }


  // On détecte les cookies correspondants, si on a trois cookies similaires, on part du premier cookie, et on cherche les N cookies similaires après celui-ci.
  detecterMatchLignes(){
    let match = 0;
    for(let ligne=0;ligne<this.nbLignes;ligne++){
      for(let colonne=0;colonne<this.nbColonnes-2;colonne++){ // on parcoure le tableau
        if(this.tabCookies[ligne][colonne].type === this.tabCookies[ligne][colonne+1].type && this.tabCookies[ligne][colonne].type === this.tabCookies[ligne][colonne+2].type && this.tabCookies[ligne][colonne].isDisplayed === true){
          // si la condition des 3 cookies similaires est validé, on cherche le nombre de cookie qui ont le même type, en partant de la colonne du premier cookie
          let matchColonne = colonne;
          match ++;
          while(matchColonne < this.nbColonnes && this.tabCookies[ligne][colonne].type === this.tabCookies[ligne][matchColonne].type){
            this.tabCookies[ligne][matchColonne].marquer();
            matchColonne++;
          }
          colonne = matchColonne; // on reprend la recherche du dernier cookie faisant partie du groupe "match"
        }
      }
    }
    return match === 0;
  }

  setTime(){  // on incrément une variable dans la div "time" pour afficher un décompte en seconde
    let time = document.getElementById("time");
    setInterval(() => {
      time.innerHTML = parseInt(time.innerHTML) + 1;
    }, 1000);
  }

  detecterMatchColonnes(){
    let match = 0;
    for(let colonne=0;colonne<this.nbColonnes;colonne++){
      for(let ligne=0;ligne<this.nbLignes-2;ligne++){ // on parcoure le tableau
        if(this.tabCookies[ligne][colonne].type === this.tabCookies[ligne+1][colonne].type && this.tabCookies[ligne][colonne].type === this.tabCookies[ligne+2][colonne].type && this.tabCookies[ligne][colonne].isDisplayed === true){
          // si la condition des 3 cookies similaires est validé, on cherche le nombre de cookie qui ont le même type, en partant de la ligne du premier cookie
          match ++;
          let matchLigne = ligne;
          while(matchLigne < this.nbLignes && this.tabCookies[ligne][colonne].type === this.tabCookies[matchLigne][colonne].type){
            this.tabCookies[matchLigne][colonne].marquer();
            matchLigne++;
          }
          ligne = matchLigne-1; // on reprend la recherche du dernier cookie faisant partie du groupe "match"
        }
      }
    }
    return match === 0;
  }

  updateScore(){  // on gagne un point pour chaque cookie supprimé
    let score = document.getElementById("score");
    score.innerHTML = parseInt(score.innerHTML) + 1; 
  }

  supprimerCookiesMarques(){   // on supprime tous les cookies qui ont été marqué au préalable => isMarked = true
    for(let ligne=0;ligne<this.nbLignes;ligne++){
      for(let colonne=0;colonne<this.nbColonnes;colonne++){ 
        let cookie = this.tabCookies[ligne][colonne];
        if(cookie.isMarked === true){
          cookie.supprimer();
          this.updateScore();
        }
      }
    }
  }

  verifierLigne(nbDeCookiesDifferents){  // on vérifie toutes les lignes pour voir si il n'y a pas de groupes de 3 cookies similaires côte à côte
    let nbModif = 0;
    for(let ligne=0;ligne<this.nbLignes;ligne++){
      for(let colonne=0;colonne<this.nbColonnes-2;colonne++){
        if(this.tabCookies[ligne][colonne].type === this.tabCookies[ligne][colonne+1].type && this.tabCookies[ligne][colonne].type === this.tabCookies[ligne][colonne+2].type){
           nbModif++;
           while(this.tabCookies[ligne][colonne+1].type === this.tabCookies[ligne][colonne].type){
           let cookie = this.tabCookies[ligne][colonne+1];
           cookie.type = Math.floor(Math.random()*nbDeCookiesDifferents);
           cookie.htmlImage.src = Cookie.urlsImagesNormales[cookie.type];
          }
        }
      }
    }
    return nbModif === 0;
  }

  verifierColonne(nbDeCookiesDifferents){ // on vérifie toutes les colonnes pour voir si il n'y a pas de groupes de 3 cookies similaires côte à côte
    let nbModif = 0;
    for(let colonne=0;colonne<this.nbColonnes;colonne++){
      for(let ligne=0;ligne<this.nbLignes-2;ligne++){ 
        if(this.tabCookies[ligne][colonne].type === this.tabCookies[ligne+1][colonne].type && this.tabCookies[ligne][colonne].type === this.tabCookies[ligne+2][colonne].type){
          nbModif++;
           while(this.tabCookies[ligne+1][colonne].type === this.tabCookies[ligne][colonne].type){
           let cookie = this.tabCookies[ligne+1][colonne];
           cookie.type = Math.floor(Math.random()*nbDeCookiesDifferents);
           cookie.htmlImage.src = Cookie.urlsImagesNormales[cookie.type];
          }
        }
      }
    }
    return nbModif === 0;
    
  }

  chuteCookie(){   // on fait la chute : on décale tous les cookies d'une ligne vers le bas,si on trouve une case vide
    let chute = 0;  
     for(let ligne=0;ligne<this.nbLignes-1;ligne++){
      for(let colonne=0;colonne<this.nbColonnes;colonne++){
        if(this.tabCookies[ligne+1][colonne].isDisplayed === false && this.tabCookies[ligne][colonne].isDisplayed === true){
         chute ++; 
         this.tabCookies[ligne+1][colonne].htmlImage.src = this.tabCookies[ligne][colonne].htmlImage.src;
         this.tabCookies[ligne+1][colonne].type = this.tabCookies[ligne][colonne].type;
         this.tabCookies[ligne+1][colonne].annulerMarquer();
         this.tabCookies[ligne+1][colonne].annulerSupprimer();
         this.tabCookies[ligne][colonne].annulerMarquer();
         this.tabCookies[ligne][colonne].supprimer();
        }
      }
    }
    return chute === 0;
  } 

  genererTypeCookieUnique(tabCookiesVoisins){ // on génère un type unique pour éviter les doublons, on utilise cette méthode dans la fonction remplissage grille
    const isFromTheStart = Math.floor(Math.random() - 0.5);
    let type;
    if(isFromTheStart){
      type = 0;
    } else {
      type = 5;
    }
    while(tabCookiesVoisins.some((cookieVoisin) => cookieVoisin.type === type)){
      if (isFromTheStart){
        type ++;
      } else {
        type --;
      }
    }
    return type;
  }

  remplissageGrille(nbDeCookiesDifferents){  // On remplit la grille après la chute, et on vérifie qu'il n'y ait pas de doublons
    for(let ligne=0;ligne<this.nbLignes;ligne++){
      for(let colonne=0;colonne<this.nbColonnes;colonne++){
        if(this.tabCookies[ligne][colonne].isDisplayed === false){
          const cookie = this.tabCookies[ligne][colonne];
          if(ligne === 0){
            const cookieBas = this.tabCookies[ligne+1][colonne];
            if(colonne === 0){
              const cookieDroit = this.tabCookies[ligne][colonne+1];
              cookie.type = this.genererTypeCookieUnique([cookieBas,cookieDroit]);
            } else if(colonne === this.nbColonnes - 1){
              const cookieGauche = this.tabCookies[ligne][colonne-1]; 
              cookie.type = this.genererTypeCookieUnique([cookieBas,cookieGauche]);
            } else {
              const cookieDroit = this.tabCookies[ligne][colonne+1];
              const cookieGauche = this.tabCookies[ligne][colonne-1];
              cookie.type = this.genererTypeCookieUnique([cookieBas,cookieGauche,cookieDroit]);
            } 
          } else if(ligne === this.nbLignes - 1){
            const cookieHaut = this.tabCookies[ligne-1][colonne]; 
            if(colonne === 0){
              const cookieDroit = this.tabCookies[ligne][colonne+1];
              cookie.type = this.genererTypeCookieUnique([cookieHaut,cookieDroit]);
            } else if(colonne === this.nbColonnes - 1){
              const cookieGauche = this.tabCookies[ligne][colonne-1]; 
              cookie.type = this.genererTypeCookieUnique([cookieHaut,cookieGauche]);
            } else {
              const cookieDroit = this.tabCookies[ligne][colonne+1];
              const cookieGauche = this.tabCookies[ligne][colonne-1];
              cookie.type = this.genererTypeCookieUnique([cookieHaut,cookieGauche,cookieDroit]);
            }
          } else if(colonne === 0){
            const cookieDroit = this.tabCookies[ligne][colonne+1];
            const cookieHaut = this.tabCookies[ligne-1][colonne]; 
            if(ligne === this.nbLignes - 1){
              cookie.type = this.genererTypeCookieUnique([cookieHaut,cookieDroit]);
            } else {
              const cookieBas = this.tabCookies[ligne+1][colonne];
              cookie.type = this.genererTypeCookieUnique([cookieHaut,cookieBas,cookieDroit]);
            }
          } else if(colonne === this.nbColonnes - 1){
            const cookieGauche = this.tabCookies[ligne][colonne-1];
            const cookieHaut = this.tabCookies[ligne-1][colonne]; 
            if(ligne === this.nbLignes - 1){
              cookie.type = this.genererTypeCookieUnique([cookieHaut,cookieGauche]);
            } else {
              const cookieBas = this.tabCookies[ligne+1][colonne];
              cookie.type = this.genererTypeCookieUnique([cookieHaut,cookieBas,cookieGauche]);
            }
          } else {
            const cookieGauche = this.tabCookies[ligne][colonne-1];
            const cookieHaut = this.tabCookies[ligne-1][colonne]; 
            const cookieBas = this.tabCookies[ligne+1][colonne];
            const cookieDroit = this.tabCookies[ligne][colonne+1];
            cookie.type = this.genererTypeCookieUnique([cookieHaut,cookieBas,cookieGauche,cookieDroit]);
          } 
           cookie.annulerSupprimer();
           cookie.annulerMarquer();
           cookie.htmlImage.src = Cookie.urlsImagesNormales[cookie.type];
        }
      }
    }
  }
}
