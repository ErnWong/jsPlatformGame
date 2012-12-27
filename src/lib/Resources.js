lib.require( "lib.Events" ).onload( function( window, undefined ) {
    "use strict"

// TODO: finish this and maybe have a createResourceType( loadEventId, properties );

    var ResourceFromType, Resource, AudioResource, ImageResource, VideoResource, JSONResource, XMLResource, HTMLResource, BinaryResource, TextResource, SpritesheetResource,
        ObjCreate = Object.create,
        ObjToString = Object.prototype.toString; // TODO: add createEvent = lib.createEvent;

    lib.Resources = {};

    lib.Resources.ResourceEvent = lib.createEventType( "ResourceEvent", {
        // TODO: add properties here
    } );

    lib.Resources.Resource = Resource = lib.Events.EventTarget.extend( {    // events: load, /*ready,*/ possibly loadingStart
        src: "",
        type: "text/plain",
        loaded: false,
        //ready: false,
        load: function() { },
        loading: false,
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
            if ( this.audio && !this.loading  ) {
                return this.audio.clone( true );                //TODO: clone OR new Audio ?
            }
        },
        load: function() {
            if ( this.loading || this.loaded ) return;
            var self = this,
                beforeLoadEvent = lib.createEvent( "ResourceEvent" );
            beforeLoadEvent.initEvent( "beforeLoad", this, {
                // TODO: add properties here
            } );
            if ( this.dispatchEvent( beforeLoadEvent ) ) {
                return;
            }
            this.audio.addEventListener( "canplaythrough", function() {
                self.loaded = true; // yes, it's "loaded"
                self.loading = false;
                var loadEvent = lib.createEvent( "ResourceEvent" );
                loadEvent.initEvent( "load", self, {
                    // TODO: add properties here
                });
                self.dispatchEvent( loadEvent );
            } );
            this.audio.src = this.src; //may need to append child for a certain browser, according to http://phoboslab.org/log/2011/03/multiple-channels-for-html5-audio
            this.loading = true;
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
            if ( this.loading || this.loaded ) return;
            var self = this,
                beforeLoadEvent = lib.createEvent( "ResourceEvent" );
            beforeLoadEvent.initEvent( "beforeLoad", this, {
                // TODO: add properties here
            } );
            if ( this.dispatchEvent( beforeLoadEvent ) ) {
                return;
            }
            this.img = new Image();
            this.img.src = this.src;
            this.img.addEventListener( "load", function() {
                self.loaded = true...
            });
            this.loading = true;
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
        _loadedCount: 0,
        _totalCount: 0,
        allLoaded: false,
        add: function( src, id, type ) {
            var resource = new ( ResourceFromType[ type ] || OtherResource );
            
            //at the end: return resource
        },
        remove: function( q ) {

        },
        load: function( q ) {
            var resources = this.get( q );
            if ( ObjToString.call( resources ) === "[object Array]" ) {
                for ( var i = 0, len = resources.length; i < len; i++ ) {
                    if ( !resources[i].loaded ) {
                        resources[i].load();
                    }
                }
            } else if ( typeof resources.load === "function" && !resources.loaded ) {
                resources.load();
            }
        },
        loadAll: function() {
            if ( this.allLoaded ) {
                return;
            }
            var i = 0, resources = this._resource, len = resources.length, resource;
            for ( ; i < len; i++ ) {
                resources = resources[i];
                if ( !resource.loaded ) {
                    resource.load();
                }
            }
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

