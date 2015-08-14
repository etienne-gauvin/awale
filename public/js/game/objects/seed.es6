GAME.Seed = ( function ( window ) {
  "use strict";

  var seedCounter = 0;

  return class Seed {

    constructor( hole ) {

      this.id = seedCounter++;

      this.hole = hole;

      // Position désirée
      this.position = hole.position.clone();
      this.desiredPosition = this.position.clone();

      // Représentaton graphique
      this.material = null;
      this.object = null;

      this._initObject();

      // Ajouter la graine au trou
      this.hole.seeds.add( this );
    }

    /**
     * Aller à une position
     */
    animateTo( newPosition ) {
      new TWEEN.Tween( this.position )
        .to( newPosition, 200 )
        .easing( TWEEN.Easing.Quintic.Out )
        .start();
    }

    /**
     * Changer de trou.
     */
    animateToNewHole() {
      var duration = this.position.distanceTo( this.desiredPosition ) / 2 * 200;

      new TWEEN.Tween( this.position )
        .to( this.desiredPosition, duration )
        .easing( TWEEN.Easing.Quintic.Out )
        .start();
    }

    /**
     * Création de l'effet de lumière
     */
    _initObject() {
    	this.material = new THREE.SpriteMaterial( {
        map: new THREE.ImageUtils.loadTexture( 'images/seed.png' ),
        useScreenCoordinates: false,
        color: 0xffffff,
        transparent: true,
        blending: THREE.AdditiveBlending
    	} );

    	this.object = new THREE.Sprite( this.material )
      this.object.position.copy( this.position );
      this.position = this.object.position;
      this.object.scale.set( 0.5, 0.5, 1 );
    }
  }
} ) ( window );
