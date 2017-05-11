import {Time} from '../time/Time';

/**
 * Video player (on Material) Class
 * @param {string|object} url - the video file url or an object with urls and default url {0: "test1.mp4", 1: "test2.mp4", default: "0"}
 * @param {boolean} [stereoscopic = false] - set true if video is Up&Down stereoscopic
 * @param {number} [fps = 25] - the desired playback frame rate
 * @param {string} [anonymous = false] - if true crossOrigin attrubute is set to 'anonymous' if false, set to 'use-credentials'
 */
export class MaterialPlayer {
    constructor(url, stereoscopic = false, fps = 25, anonymous = false) {
        const crossOrigin = anonymous ? 'anonymous' : 'use-credentials';

        if ((typeof url) === "string") {
            url = {
                0: url,
                default: "0"
            }
        }

        let bufferCounter = 0;
        let lastTime = 0;
        let speed = 1;
        this.framesToLoader = 30;
        this.isBuffering = false;
        let video = document.createElement('video');
        let source = document.createElement("source");
        let currDelta = 0;
        let frameDuration = 1000 / fps;
        let userPaused = true;

        let urlSplited = url[url.default].split('.');
        source.type = "video/" + urlSplited[urlSplited.length - 1];
        source.src = url[url.default];
        video.appendChild(source);
        video.width = 512;
        video.height = 256;
        video.autoplay = false;
        video.loop = true;
        video.preload = "auto";
        video.setAttribute('crossOrigin', crossOrigin);
        console.log(crossOrigin);
        video.setAttribute('playsinline', 'playsinline');
        video.setAttribute('webkit-playsinline', 'webkit-playsinline');
        video.load();
        let textureL = new THREE.Texture(video);
        textureL.minFilter = textureL.magFilter = THREE.LinearFilter;
        textureL.format = THREE.RGBFormat;
        textureL.generateMipmaps = false;
        /**
         * The currently playing video url source key
         * @type {string}
         */
        this.currentSource = url.default;

        let textureR = null;

        if (stereoscopic) {
            //textureL.wrapS = textureL.wrapT = THREE.RepeatWrapping;
            textureL.repeat.set(1, 0.5);
            textureL.offset.set(0, 0.5);

            textureR = new THREE.Texture(video);
            textureR.minFilter = textureR.magFilter = THREE.LinearFilter;
            textureR.format = THREE.RGBFormat;
            textureR.generateMipmaps = false;
            //textureR.wrapS = textureR.wrapT = THREE.RepeatWrapping;
            textureR.repeat.set(1, 0.5);
        }

        /**
         * A customizable function call on buffering start.
         */
        this.onBufferStart = function () {
            console.log("buffering");
        };
        /**
         * switch video files.
         * @param {*} key - the key of the video url to play
         */
        this.switchTo = function (key) {
            if (!url[key]) return;
            this.pause();
            let timePoint = video.currentTime;

            video.innerHTML = "";

            let source = document.createElement("source");
            const urlSplited = url[key].split('.');
            source.type = "video/" + urlSplited[urlSplited.length - 1];
            source.src = url[key];

            video.appendChild(source);
            video.load();
            video.currentTime = timePoint;
            this.currentSource = key;
        };
        /**
         * A customizable function call on buffering end.
         */
        this.onBufferEnd = function () {
            console.log("playing");
        };
        /**
         * Indicated if the video is playing.
         */
        this.isPlaying = function () {
            return !video.paused;
        };

        /**
         * returns the Left eye (the main - if non stereoscopic) texture object
         */
        this.getTexture = () => {
            return textureL;
        };
        /**
         * returns the Left eye (the main - if non stereoscopic) texture object
         */
        this.getTextureL = () => {
            return textureL;
        };

        /**
         * returns the Left eye (if stereoscopic) texture object
         */
        this.getTextureR = () => {
            return textureR;
        };
        /**
         * Indicated if the video is muted.
         */
        this.isMute = () => {
            return video.muted;
        };
        /**
         * mute/unmute video.
         * @param {boolean} [value = true]
         */
        this.mute = (value = true) => {
            video.muted = value;
        };
        /**
         * play
         * @param {DOMEvent}
         */
        this.play = (e) => {
            userPaused = false;
            video.play(e);
        };

        /**
         * pause
         */
        this.pause = () => {
            userPaused = true;
            video.pause();
        };

        /**
         * Play/Pause
         */
        this.playPause = () => {
            if (this.isPlaying()) {
                this.pause();
            } else {
                this.play();
            }
        };

        this.jumpTo = (percent) => {
            video.currentTime = video.duration * percent;
        };

        this.getTime = () => {
            return video.currentTime;
        };
        this.getLength = () => {
            return video.duration;
        };

        this.update = (delta) => {
/*            if (Time.speed  * speed !== video.playbackRate) {
                video.playbackRate = Time.speed * speed;
            }

            currDelta += delta;
            if (currDelta < frameDuration) {
                return;
            }
            currDelta -= frameDuration;*/


            if (bufferCounter == 0 && !this.isBuffering && this.isPlaying()) {
                this.isBuffering = true;
                this.onBufferStart();
            } else if (bufferCounter >= 3 && this.isBuffering) {
                this.isBuffering = false;
                this.onBufferEnd();
            }


            if (lastTime == video.currentTime) {
                bufferCounter -= bufferCounter > 0 ? 1 : 0;
                return;
            }

            bufferCounter += bufferCounter < this.framesToLoader ? 1 : 0;
            lastTime = video.currentTime;

            if (video.readyState !== video.HAVE_ENOUGH_DATA) {
                return;
            } else {
                if (this.isPlaying() || !userPaused && !this.isPlaying()) {
                    this.play();
                }
            }

            textureL.needsUpdate = true;
            if (stereoscopic) {
                textureR.needsUpdate = true;
            }
        };

        this.destroy = () => {
            video.pause();
            video = null;
        };

        Object.defineProperty(this, "speed", {
            get: function () {
                return speed;
            },
            set: function (value) {
                speed = value;
                video.playbackRate = Time.speed * speed;
            }
        });

        let _rodinVideoTrigger = function (e) {
            video.play();
            video.pause();
            window.removeEventListener("touchend", _rodinVideoTrigger);
            window.removeEventListener("click", _rodinVideoTrigger);
        };

        window.addEventListener("touchend", _rodinVideoTrigger);
        window.addEventListener("click", _rodinVideoTrigger);

    }
}