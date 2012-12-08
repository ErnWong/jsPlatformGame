//TODO: allow stopping of sound

lib.require( "lib.Events", "lib.Resources" ).onload( function(window, undefined) {
    "use strict";

    var Channel, Sound, AudioManager,
        noPass = [ "toString", "valueOf", "constructor", "isPrototypeOf", "propertyIsEnumerable", "toLocaleString" ],
        ObjCreate = Object.create;

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
        channels: [],
        autoResize: false,
        play: function( volume ) {
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
            this.audio = src != null? new Audio( src ) : new Audio();
            this.src = src != null? "" + src : "";
            this.channels = [];
            this.autoResize = !!autoResize;
            var i = 0, len = typeof noOfChannels === "number"? noOfChannels >= 0? noOfChannels : 0 : 3;
            for ( ; i < len; i++ ) {
                this.channels[i] = new Channel( this.audio );
            }
        }
    } );

    AudioManager = lib.Audio.AudioManager = lib.Events.EventTarget.extend( {
        _sounds: [],
        _soundFromId: ObjCreate(null),
        _soundFromSrc: ObjCreate(null),
        addSound: function( src, noOfChannels, id, autoResize ) {
            var sound = new Sound( src, noOfChannels, autoResize );
            var addSoundEvt = lib.createEvent( "AudioEvent" );
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

