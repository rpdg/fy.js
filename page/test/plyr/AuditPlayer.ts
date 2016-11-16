class AuditPlayer {


	private _onVideoReady: Function;

	private _player: plyrPlayer;


	constructor(videoId: string, svgPath: string) {

		this._player = plyr.setup(`#${videoId}`, {
			//debug: true,
			iconUrl: svgPath,
			displayDuration: true,
			controls: ['play-large', 'play', 'progress', "current-time", "duration", "mute", "volume", "fullscreen"],//'fast-forward',
			tooltips: {
				controls: false,
				seek: false
			}
		})[0];

		//
		let canPlayListener = () => {
			//remove the listener at first time it was called
			//because of the player bug will trigger the event twice
			this._player.off('canplay', canPlayListener);

			this._onVideoReady();
		};

		//add event listener
		this._player.on('canplay', canPlayListener);

		//show error message on console
		//this._player.on('error', evt => console.error(evt));
	}

	set onVideoReady(fn: Function) {
		this._onVideoReady = fn;
	}

	set source(mp4Path: string) {

		this._player.source({
			type: 'video',
			sources: [{
				src: mp4Path,
				type: 'video/mp4'
			}]
		});

	}

	pause() {
		this._player.pause();
	}

	jumpTo(s: number) {
		this._player.seek(s);

		if (this._player.isPaused())
			this._player.play();
	}

	get currentTime(): number {
		return this._player.getCurrentTime();
	}

	get duration(): number {
		return this._player.getDuration();
	}
}


export default AuditPlayer ;