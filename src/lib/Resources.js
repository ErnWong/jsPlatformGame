lib.require( "lib.Events" ).onload( function( window, undefined ) {
    "use strict"

    var ResourceFromType, Resource, AudioResource, ImageResource, VideoResource, JSONResource, XMLResource, HTMLResource, BinaryResource, TextResource, SpritesheetResource,
        ObjCreate = Object.create,
        ObjToString = Object.prototype.toString; //TODO: add createEvent = lib.createEvent;

    lib.Resources = {};

    lib.Resources.ResourceEvent = lib.createEventType( "ResourceEvent", {
        //TODO: add properties here
    } );

    lib.Resources.Resource = Resource = lib.Events.EventTarget.extend( {    // events: load, /*ready,*/ possibly loadingStart
        src: "",
        type: "text/plain",
        loaded: false,
        //ready: false,
        load: function() { },
        init: function( src ) {
            this.src = src;
        }
    }, "Resource" );

    lib.Resources.AudioResource = AudioResource = Resource.extend( {
        audio: new Audio(),
        /*addToManager: function( audioManager ) {
            audioManager.
        },*/
        getAudio: function() {
            if ( !this.
            return this.audio.clone( true );                //TODO: clone OR new Audio ?
        },
        load: function() {
            var self = this;
            this.audio.addEventListener( "canplaythrough", function() {
                self.loaded = true; // yes, it's "loaded"
                var loadEvent = lib.createEvent( "ResourceEvent" );
                loadEvent.initEvent( "load", self, {
                    // TODO: add properties here
                });
                self.dispatchEvent( loadEvent );
            } );
            this.audio.src = this.src; //may need to append child for a certain browser, according to http://phoboslab.org/log/2011/03/multiple-channels-for-html5-audio
        },
        init: function( src ) {
            this.src = src;
        }
    }, "AudioResource" );

    lib.Resources.ImageResource = ImageResource = Resource.extend( {
        img: new Image(),
        getCanvas: function() {
            
        },
        getImage: function() {
            var img = new Image();                          //TODO: clone or new Image?
            img.src = this.src;
            return img;
        },
        load: function() {

        }
    }, "ImageResource" );

    lib.Resources.ResourceFromType = ResourceFromType = Object.create( null );

    //TODO: add more if there is/are any:

    [ "image", "image/jpeg", "image/gif", "image/png", "image/svg+xm", "image/bmp", "image/x-bmp", "image/vnd.microsoft.icon" ].forEach( function( type ) {
        ResourceFromType[ type ] = ImageResource;
    } );

    [ "audio", "audio/webm", "audio/ogg", "audio/wave", "audio/wav", "audio/x-wav", "audio/x-pn-wav", "audio/mpeg", "audio/mp4" ].forEach( function( type ) {
        ResourceFromType[ type ] = AudioResource;
    } );

    [ "video/webm", "video/ogg", "video/mp4" ].forEach( function( type ) {
        RersourceFromType[ type ] = VideoResource;
    } );


//NOTE: currently a "static class". When changing back to a normal function (a class), then you'll need to change Audio.js (and find a work around for that)
    lib.Resources.ResourceManager = new ( lib.Events.EventTarget.extend( {
        _resources: [],
        _resourcesById: ObjCreate( null ),
        _resourcesBySrc: ObjCreate( null ),
        add: function( src, id, type ) {
            //at the end: return resource
        },
        remove: function( q ) {

        },
        load: function( q ) {

        },
        loadAll: function() {

        },
        get: function( q, nonGreedy ) {
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
                if ( nonGreedy === true ) {
                    for ( ; i < len; i++ ) {
                        resource = resources[i];            // TODO: test to see if caching is worth it
                        if ( q.test( resource.id ) || q.test( resource.src ) || q.test( resource.type ) ) {
                            return resource;
                        }
                    }
                } else {
                    var ret = [];
                    for ( ; i < len; i++ ) {
                        resource = resources[i];            // TODO: test to see if caching is worth it
                        if ( q.test( resource.id ) || q.test( resource.src ) ) {
                            ret.push( resource );
                        }
                    }
                    return ret; //now returns an array only. OLD: used to return an array only if ret.length > 1... return ret.length > 1? ret : ret[0] // (even when length is 0, so it returns undefined)
                }
            }
        }
    }, "Resource Manager" ) );

} );

