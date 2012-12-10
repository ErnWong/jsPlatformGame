//TODO: allow stopping of sound
//TODO: allow loading, loaded and such events
//TODO: createEvent = lib.createEvent

lib.require( "lib.Events", "lib.Resources" ).onload( function(window, undefined) {
    "use strict";

    var Channel, Sound, AudioManager,
        noPass = [ "toString", "valueOf", "constructor", "isPrototypeOf", "propertyIsEnumerable", "toLocaleString" ],
        ObjCreate = Object.create,
        AudioResource = lib.Resources.AudioResource,
        ResourceManager = lib.Resources.ResourceManager;

    lib.Audio = {};

    lib.Audio.AudioEvent = lib.createEventType( "AudioEvent", {

        sound: null,
        //src: undefined,
        //noOfChannels: undefined,
        soundId: null,
        //autoResize: undefined,
        //time: undefined,
        channel: null,
        newChannelAdded: false,
        //audio: null,

        initEvent: function( type, target, properties ) {
            for ( var id in properties ) {
                if ( noPass.indexOf( id ) === -1 ) {
                    this[id] = properties[id];
                }
            }
            this._super( type, target );
        }

    } );

    Channel = lib.Audio.Channel = lib.Events.EventTarget.extend( {
        audio : new Audio(),
        playing: false,
        play: function( volume ) {
            var audio = this.audio,
                vol = typeof volume === "number"? volume : 1,
                playEvent = lib.createEvent( "AudioEvent" ),
                restarted = false,
                restartEvent;
            if ( this.playing === true ) {
                restartEvent = lib.createEvent( "AudioEvent" );
                restartEvent.initEvent( "beforeRestart", this, {
                    channel: this,
                    cancelable: true
                } );
                if ( this.dispatchEvent( restartEvent ) === true ) {
                    return;
                }
                audio.pause();
                audio.currentTime = 0;
                restarted = true;
            }
            this.playing = true;
            audio.volume = vol > 1? 1 : vol < 0? 0 : vol;
            playEvent.initEvent( "beforePlay", this, {
                channel: this,
                cancelable: true
            } );
            if ( this.dispatchEvent( playEvent ) ) {
                return;
            }
            audio.play();
            restartEvent = lib.createEvent( "AudioEvent" );
            restartEvent.initEvent( "restart", this, {
                channel: this,
                cancelable: false
            } );
            playEvent = lib.createEvent( "AudioEvent" );
            playEvent.initEvent( "play", this, {
                channel: this,
                cancelable: false
            } );
            this.dispatchEvent( restartEvent );
            this.dispatchEvent( playEvent );
        },
        init: function( audio ) {
            this.audio = audio.cloneNode( true );
            var self = this;
            this.audio.addEventListener( "ended", function() {
                self.playing = false;
                var endedEvent = lib.createEvent( "AudioEvent" );
                endedEvent.initEvent( "ended", self, {
                    channel: self,
                    cancelable: false
                } );
                self.dispatchEvent( endedEvent );
            } );
        }
    }, "Channel" );

    Sound = lib.Audio.Sound = lib.Events.EventTarget.extend( {
        src: "",
        audio: new Audio(),
        ready: false,
        channels: [],
        autoResize: false,
        play: function( volume ) {
            if ( !this.ready ) {
                return; //TODO: test this
            }
            var i = 0,
                channels = this.channels,
                len = channels.length,
                playEvent = lib.createEvent( "AudioEvent" ),
                newChannelAdded = false;
            for ( ; i < len; i++ ) {
                if ( !channels[i].playing ) {
                    break;
                }
            }
            if ( i >= len ) {
                if ( this.autoResize ) {
                    channels[len] = new Channel( this.audio );
                    newChannelAdded = true;
                    i = len;
                } else {
                    i = 0;
                }
            }
            playEvent.initEvent( "beforePlay", this, {
                sound: this,
                channel: channels[i],
                newChannelAdded: newChannelAdded,
                cancelable: true
            } );
            if ( this.dispatchEvent( playEvent ) === true ) {
                if ( newChannelAdded ) {
                    channels.splice( len, 1 );
                }
                return;
            }
            channels[i].play( volume );
            this.dispatchEvent( playEvent );
            playEvent = lib.createEvent( "AudioEvent" );
            playEvent.initEvent( "play", this, {
                sound: this,
                channel: channels[i],
                newChannelAdded: newChannelAdded,
                cancelable: false
            } );
        },
        init: function( src, noOfChannels, autoResize ) {
            /*if ( src instanceof AudioResource ) { // this and the following is  B A D (should use ResourceManager to load):
                this.audio = src.getAudio();
            } else if ( typeof src === "string" ) {
                var resource = ResourceManager.get( src );
                this.audio = resource? resource.getAudio() : new Audio( src );
            } else {
                this.audio = new Audio();
            }*/
            // better:
            /*if ( src instanceof AudioResource ) {
                if ( src.ready ) {
                    this.audio = src.getAudio();
                    this.loaded = true;
                } else {
                    this.audio = new Audio();
                    var self = this;
                    src.addEventListener( "ready", function() {
                        self.audio = src.getAudio();
                        self.loaded = true;
                    } );
                }
            } else if ( typeof src === "string" ) {
                var resource = ResourceManager.get( src ) || ResourceManager.add( src, src, "audio" );
                if ( resource.ready ) {
                    
                }
            }*///na, discontinued it because it repeated code. Here's a slightly better version, I hope:

            //TODO: test, test, test!
            this.ready = false;
            this.channels = [];

            var resource = src instanceof AudioResource?
                            src :
                            typeof src === "string?"?
                                ResourceManager.get( src ) || ResourceManager.add( src, src, "audio" ) :
                                null,
                self = this,
                setupAudio = function setupAudio() {
                    var i = 0,
                        len = typeof noOfChannels === "number"? noOfChannels >= 0? noOfChannels : 0 : 3,
                        audio = self.audio, loadEvent;
                    audio = resource.getAudio();
                    for ( ; i < len; i++ ) {
                        self.channels[i] = new Channel( audio );
                    }
                    self.src = audio.src;
                    self.loaded = true;
                    readyEvent = lib.createEvent( "AudioEvent" );
                    readyEvent.initEvent( "ready", self, {
                        sound: self,
                        cancelable: false
                    } );
                    self.dispatchEvent( readyEvent );
                }
            if ( resource ) {
                if ( resource.ready ) {
                    /*var i = 0,
                        len = typeof noOfChannels === "number"? noOfChannels >= 0? noOfChannels : 0 : 3,
                        audio = this.audio;
                    this.audio = src.getAudio();
                    for ( ; i < len; i++ ) {
                        this.channels[i] = new Channel( this.audio );
                    }
                    this.src = audio.src;
                    this.loaded = true;*/
                    setupAudio();
                } else {
                    this.audio = new Audio();
                    var self = this;
                    resource.addEventListener( "load", setupAudio );
                    /*resource.addEventListener( "ready", function() {
                        var i = 0,
                            len = typeof noOfChannels === "number"? noOfChannels >= 0? noOfChannels : 0 : 3,
                            audio = self.audio;
                        audio = resource.getAudio();
                        for ( ; i < len; i++ ) {
                            self.channels[i] = new Channel( audio );
                        }
                        self.src = audio.src;
                        self.loaded = true;
                    } );*/
                }
            } else {
                this.audio = new Audio();
            }

            this.autoResize = !!autoResize;
        }
    } );

    AudioManager = lib.Audio.AudioManager = lib.Events.EventTarget.extend( {
        _sounds: [],
        _soundFromId: ObjCreate(null),
        _soundFromSrc: ObjCreate(null),
        _loadedCount: 0,
        _count: 0,
        ready: false,
        addSound: function( src, noOfChannels, id, autoResize ) {
            var sound = new Sound( src, noOfChannels, autoResize ),
                addSoundEvt = lib.createEvent( "AudioEvent" );
            addSoundEvt.initEvent( "beforeAdd", this, {
                sound: sound,
                soundId: id!= null? id : undefined,
                cancelable: true
            } );
            if ( this.dispatchEvent( addSoundEvt ) === true ) {
                return;
            }
            this._sounds.push( sound );
            this._soundFromSrc[src] = sound;
            if ( id != null ) {
                this._soundFromId[id] = sound;
            }
            if ( !sound.ready ) {
                this._cound++;
                var self = this,
                    unreadyEvent = lib.createEvent( "AudioEvent" );
                unreadyEvent.initEvent( "unready", this, {
                    sound: sound,
                    soundId: id != null? id : undefined,
                    cancelable: false
                };
                this.dispatchEvent( unreadyEvent );
                sound.addEventListener( "ready", function() {
                    self._loadedCount++;
                    if ( self._loadedCount >= _self.count ) {
                        self.ready = true;
                        var readyEvent = lib.createEvent( "AudioEvent" );
                        readyEvent.initEvent( "ready", self, {
                            sound: sound,
                            soundId: id != null? id : undefined,
                            cancelable: false
                        } );
                        self.dispatchEvent( readyEvent );
                    }
                } );
            }
            addSoundEvt = lib.createEvent( "AudioEvent" );
            addSoundEvt.initEvent( "add", this, {
                sound: sound,
                soundId: id!= null? id : undefined,
                cancelable: true
            } );
            this.dispatchEvent( addSoundEvt );
        },
        removeSound: function( id ) {
            var sound = this.getSound( id ),
                sndId = this._sounds.indexOf( sound ),
                soundFromSrc = this._soundFromSrc,
                soundFromId = this._soundFromId,
                i;

            var removeSoundEvt = lib.createEvent( "AudioEvent" );
            removeSoundEvt.initEvent( "beforeRemove", this, {
                sound: sound,
                cancelable: true
            } );
            if ( this.dispatchEvent( removeSoundEvt ) === true ) {
                return;
            }

            if ( sndId > -1 ) {
                this._sounds.splice( sndId, -1 );
            }
            if ( soundFromSrc[id] != null && sound === soundFromSrc[id] ) {
                delete soundFromSrc[id];
            } else if ( sound.src !== "" && sound === soundFromSrc[sound.src] ) {
                delete soundFromSrc[sound.src];
            } else {
                for ( i in soundFromSrc ) {
                    if ( sound === soundFromSrc[i] ) {
                        delete soundFromSrc[i];
                        break;
                    }
                }
            }
            if ( soundFromId[id] != null && sound === soundFromId[id] ) {
                delete soundFromId[id];
            } else {
                for ( i in soundFromId ) {
                    if ( sound === soundFromId[i] ) {
                        delete soundFromId[i];
                        break;
                    }
                }
            }
            removeSoundEvt = lib.createEvent( "AudioEvent" );
            removeSoundEvt.initEvent( "remove", this, {
                sound: sound,
                cancelable: false
            } );
            this.dispatchEvent( removeSoundEvt );
        },
        getSound: function( id ) {
            if ( this._soundFromSrc[id] != null ) {
                return this._soundFromSrc[id];
            }
            if ( this._soundFromId[id] != null ) {
                return this._soundFromId[id];
            }
        },
        playSound: function( id, volume ) {
            var playEvent = lib.createEvent( "AudioEvent" ),
                sound = this.getSound( id );
            playEvent.initEvent( "beforePlay", this, {
                sound: sound,
                cancelable: true
            } );
            if ( this.dispatchEvent( playEvent ) === true ) {
                return;
            }
            this.getSound( id ).play( volume );
            playEvent = lib.createEvent( "AudioEvent" );
            playEvent.initEvent( "play", this, {
                sound: sound,
                cancelable: false
            } );
            this.dispatchEvent( playEvent );
        }
    } );
    lib.loaded( "lib.Audio" );
} );

