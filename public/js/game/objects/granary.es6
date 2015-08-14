GAME.Granary = ( function ( window ) {
  "use strict";

  return class Granary {

    constructor( player, angle ) {

      this.player = player;

      // Angle
      this.angle = angle;
      console.log( this.angle );

      // Position
      this.position = new THREE.Vector3( 0, 0, 0 );

      // Emplacements
      this.emplacements = [];

      // Initialiser
      this._initObject();
    }

    /**
     * Création de l'effet de lumière
     */
    _initObject() {
    	this.material = new THREE.SpriteMaterial( {
        map: new THREE.ImageUtils.loadTexture( 'images/granary-emplacement.png' ),
        useScreenCoordinates: false,
        color: new THREE.Color( "white" ),
        transparent: true,
        blending: THREE.AdditiveBlending
    	} );

    	this.object = new THREE.Sprite( this.material );
      this.object.position.copy( this.position );
      this.position = this.object.position;

      var angle, line = 0;

      for ( let e = 0 ; e < 25 ; e++ ) {

        if ( e < 10 ) {
          angle = e / 10 * ( Math.PI / 3 * 2 ) + this.angle;
          line = 0;
        }
        else {
          angle = ( e - 10 ) / 15 * ( Math.PI / 3 * 2 ) + this.angle;
          line = 1;
        }

        let emplacement = new THREE.Sprite( this.material );
        emplacement.scale.set( 0.1, 0.1, 0.1 );

        emplacement.position.set(
          Math.cos( angle ) * ( 2 + line / 3 * 2 ),
          0,
          Math.sin( angle ) * ( 2 + line / 3 * 2 )
        );

        this.object.add( emplacement );
      }
    }


  }
} ) ( window );
