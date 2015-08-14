(function(window) {
  "use strict";
  
  // Couleur des nœuds par défaut
  var defaultColor = "#4ff0c9";
  var defaultAltColor = "white";
  
  /**
   * Noeud
   * @param <Object> parameters {
   *                   <String> text
   *                   <Vector3> position
   *                   <Number> [ weight = 1 ]          Poids du nœud, influant sur sa taille
   *                   <String> [ href = null ]         URL d'une page à ouvrir lors du second clic sur le nœud
   *                   <String> [ color = "#4ff0c9" ]   Couleur normale
   *                   <String> [ altColor = "white" ]  Couleur alternative
   *                 }
   */
  var Node3D = window.Node3D = function ( parameters )
  {
    // Position initiale du nœud
    this.position = parameters.position;
    
    // Poids du nœud
    this.weight = parameters.weight || 1;
    
    // Couleur du nœud
    this.color = parameters.color || defaultColor;
    this.altColor = parameters.altColor || defaultAltColor;
    
    // Page à ouvrir lors du second clic
    this.href = parameters.href || null;
    
    // Témoins du focus / survol
    this._hovered = false;
    this._focused = false;

    // Texte
    this.text = parameters.text;
    this._textCanvas = null;
    this._textCtx = null;
    this._textTex = null;
    this._textMaterial = null;
    
    this._textNormalColor = this.color;
    this._textHoveredColor = this.altColor;
    this._textFocusedColor = this.altColor;
    
    this._textScaleNormal = new THREE.Vector3( this.weight, this.weight / 2, 1 );
    this._textScaleTransitionT = 0;
    
    this._initText();

    // Effet de lumière autour du nœud
    this._glowMaterial = null;
    this._glowSprite = null;
    this._glowScaleNormal = new THREE.Vector3( 8, 8, 1.0 );
    
    this._initGlow();
  }
  
  /**
   * Ajouter les sprites à une scène
   * @param <THREE.Scene> scene
   */
  Node3D.prototype.addTo = function ( scene ) {
    scene.add( this._textSprite );
    scene.add( this._glowSprite );
  } 

  /**
   * Création de l'effet de lumière
   */
  Node3D.prototype._initGlow = function () {
	this._glowMaterial = new THREE.SpriteMaterial( { 
      map: new THREE.ImageUtils.loadTexture( 'glow.png' ), 
      useScreenCoordinates: false,
      color: this.color,
      transparent: true,
      blending: THREE.AdditiveBlending,
      opacity: 0.2,
//      fog: true
	} );
    
	this._glowSprite = new THREE.Sprite( this._glowMaterial );
	this._glowSprite.scale.set( this._glowScaleNormal );
    this._glowSprite.position.copy( this.position );
  }

  /**
   * Création du canvas où afficher le texte.
   */
  Node3D.prototype._initText = function () {
    
    this._textCanvas = document.createElement( 'canvas' );
    this._textCanvas.width = 1024;
    this._textCanvas.height = this._textCanvas.width / 2;
    this._textCtx = this._textCanvas.getContext( '2d' );
    
    this._redrawText();
    
    this._textMaterial = new THREE.SpriteMaterial( {
      map: this._textTex,
      transparent: true,
      fog: true
    } );

    this._textSprite = new THREE.Sprite( this._textMaterial );
    this._textSprite.parentNode = this;
    this._textSprite.scale.copy( this._textScaleNormal );
    this._textSprite.position.copy( this.position );
  }

  /**
   * Affichage du texte dans le canvas.
   */
  Node3D.prototype._redrawText = function () {
    
    this._textCtx.fillStyle = this._textCurrentColor;
    this._textCtx.textBaseline = 'middle';
    this._textCtx.textAlign = 'center';

    // Recherche d'une taille de texte optimale
    var twidth,
        fontSize = this._textCanvas.height;

    do {
      fontSize -= 10;
      this._textCtx.font = "Bold " + fontSize + "px Helvetica";
      twidth = this._textCtx.measureText( this.text ).width
    }
    while ( twidth >= this._textCanvas.width );

    this._textCtx.fillText( this.text, this._textCanvas.width / 2, this._textCanvas.height / 2 );

    this._textTex = new THREE.Texture( this._textCanvas );
    this._textTex.needsUpdate = true;

    if ( this._textMaterial )
      this._textMaterial.map = this._textTex;
  }

  /**
   * Mise à jour du nœud avant affichage.
   */
  Node3D.prototype.update = function ()
  {
    // Animation du changement de taille lors du focus
    var scale = new THREE.Vector3( 1, 1, 1 ),
        glowScale = scale.clone();
    
    if ( this._focused && this._textScaleTransitionT < 1 ) {
      this._textScaleTransitionT += ( 1 - this._textScaleTransitionT ) / 3;
    }
    else if ( ! this._focused && this._textScaleTransitionT > 0 ) {
      this._textScaleTransitionT -= this._textScaleTransitionT / 3;
    }
      
    scale.x = scale.y = 1 + this._textScaleTransitionT * 0.3;
    glowScale.x = glowScale.y = 1 + this._textScaleTransitionT * 0.8;
    
    this._textSprite.scale.multiplyVectors( this._textScaleNormal, scale );
    
    this._glowSprite.scale.multiplyVectors( this._glowScaleNormal, glowScale );
    this._glowMaterial.opacity = 0.3 + this._textScaleTransitionT * 0.2;
  }

  /**
   * La souris survole le nœud
   */
  Node3D.prototype.onMouseEnter = function () {
    this._hovered = true;
    this._redrawText( this._textHoveredColor );
  }

  /**
   * La souris ne survole plus le nœud
   */
  Node3D.prototype.onMouseLeave = function () {
    this._hovered = false;
    
    // Si le nœud n'avais pas le focus
    if ( ! this._focused ) {
      
      // Retour à la couleur normale
      this._redrawText( this._textNormalColor );
    }
  }

  /**
   * Faire gagner ou perdre le focus au noeud
   */
  Node3D.prototype.setFocus = function ( focused ) {
    // Vérifier que le focus a bien changé
    if ( focused !== this._focused ) {
      
      // Si la souris a arrêté de survoler le nœud
      // Et que celui-ci n'a pas le focus
      if ( ! focused && ! this._hovered ) {
        
        // Retour à la couleur normale
        this._redrawText( this._textNormalColor );
      }
    }

    this._focused = focused;
  }

  
  /**
   * Clic sur un nœud ayant déjà le focus
   */
  Node3D.prototype.onSecondClick = function () {
    if ( this.href )
      window.open( this.href );
  }

})(window);
