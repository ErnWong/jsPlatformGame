lib.require( "lib.Events" ).onload( function( window, undefined ) {
    "use strict"

    var ResourceFromType, Resource, AudioResource, ImageResource, BinaryResource, TextResource, SpritesheetResource,
        ObjCreate = Object.create,
        ObjToString = Object.prototype.toString;

    lib.Resources = {};

    lib.Resources.ResourceEvent = lib.createEventType

    lib.Resources.Resource = Resource = lib.Events.EventTarget.extend( {
        src: "",
        loaded: false,
        load: function() {

        },
        init: function( src ) {
            this.src = src;
        }
    }, "Resource" );

    lib.Resources.AudioResource = AudioResource = Resource.extend( {
        audio: new Audio(),
        addToManager: function( audioManager ) {

        },
        getAudio: function() {
            return this.audio.clone( true );                //TODO: clone OR new Audio ?
        },
        load: function() {
            
        },
        init: function
    }, "AudioResource" );

    lib.Resources.ImageResource = ImageResource = Resource.extend( {
        img: new Image(),
        getCanvas: function() {
            
        },
        getImage: function() {
            var img = new Image();
            img.src = this.src;
            return img;                                     //TODO: clone or new Image?
        },
        load: function() {

        }
    }, "ImageResource" );

    lib.Resources.ResourceManager = lib.Events.EventTarget.extend( {
        _resources: [],
        _resourcesById: ObjCreate( null ),
        _resourcesBySrc: ObjCreate( null ),
        add: function( stuff like src, id, type or such) {

        },
        remove: function( q ) {

        },
        load: function( q ) {

        },
        loadAll: function() {

        },
        get: function( q, greedy ) {
            var resources = this._resources;                // TODO: test to see if caching is worth it
            if ( typeof q === "string" ) {
                if ( q === "*" ) {
                    return this._resources.slice( 0 );
                } else {
                    var resourcesById = this._resourcesById,
                        resourcesBySrc = this._resourcesBySrc;
                    if ( resourcesById[q] != null ) {
                        return this.resourcesById[q];
                    }
                    if ( this.resourcesBySrc[q] != null ) {
                        return this.resourcesBySrc[q];
                    }
                }
            } else if ( ObjToString.call( q ) === "[object RegExp]" ) {
                var i = 0, len = resources.length, resource;
                if ( greedy === true ) {
                    var ret = [];
                    for ( ; i < len; i++ ) {
                        resource = resources[i];            // TODO: test to see if caching is worth it
                        if ( q.test( resource.id ) || q.test( resource.src ) ) {
                            ret.push( resource );
                        }
                    }
                    return ret.length > 1? ret : ret[0]; // yes, even when length === 0, to acheive undefined
                } else {
                    for ( ; i < len; i++ ) {
                        resource = resources[i];            // TODO: test to see if caching is worth it
                        if ( q.test( resource.id ) || q.test( resource.src ) ) {
                            return resource;
                        }
                    }
                }
            }
        }
    }, "Resource Manager" );

} );

