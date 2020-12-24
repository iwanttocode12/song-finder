// curl {url} -> gives you html source on terminal
// {return .. (can remove cause one line)}
var find = '';
var choice = '';
var timeOut = '';
var allSongs = '';
var songlist = '';
var totalSongs = '';
var fav = [];
var shuffle = false;
var repeat = false;
var play = true;
var id = 0;

function buildSongItem(song) { 
	var template = $('#songs-template').clone();
	var newSong = template.prop('content');

	$(newSong).find('img').attr('src', song.artworkUrl100);
	$(newSong).find('.artistName').text(song.artistName);
	$(newSong).find('.songName').text(song.trackName);
	$(newSong).find('source').attr('src', song.previewUrl);

	$('#songs').append(newSong);
}

function setCurrent(cur, i) {
	var details = $('.details');
	$(details).find('.artistName').text($(cur).find('.artistName').text());
	$(details).find('.songName').text($(cur).find('.songName').text());
	$(details).find('#current').text(`${$(cur).find('.artistName').text()} - ${$(cur).find('.songName').text()}`);
	$(details).find('img').attr('src', $(cur).find('img').attr('src'));

	if(fav[i]){
		$('#fav').removeClass('fas');
		$('#fav').removeClass('far');
		$('#fav').removeClass('icon-click');
		$('#fav').addClass('fas');
		$('#fav').addClass('icon-click');
	}
	else{
		$('#fav').removeClass('fas');
		$('#fav').removeClass('far');
		$('#fav').removeClass('icon-click');
		$('#fav').addClass('far');
	}
}

function setVolume(song) {
	var vol = $('#volume').val();
	song.volume = vol;
}

function searchTerm() {
	$('#songs').empty();
	url = `https://cors-anywhere.herokuapp.com/https://itunes.apple.com/search?limit=18&media=music&term=${find}`;
	fetch(url).then(res => res.json())
	.then(data => {
		$('header').removeClass("main-screen");	
		var songs = data.results;
		if (songs.length == 0){
			$('#searchRes').text(find);
			$('#error').show();
			$('#playing-div').hide();
			$('#playlist-head').hide();
		}
		else {
			$('#playing-div').show();
			$('#playlist-head').show();
			$('#error').hide();
			songs.map(result => { 
				buildSongItem(result); 
			});
			allSongs = $('#songs .song-item');
			songlist = $('audio');
			totalSongs =songlist.length;

			if (allSongs != ''){
				$(allSongs).map(item => {
					setVolume(songlist[item]);
					fav.push(false);
					$(allSongs[item]).on('click', () => {
						selectSong(item);
					});

					$(allSongs[item]).find('audio').on('timeupdate', () => {
						var player = $(allSongs[item]).find('audio');
						if(player.prop("currentTime") > 0){
							$('#progress').val(player.prop("currentTime")/player.prop("duration"));
							var curTime = moment.duration(player.prop("currentTime"), 'seconds');
							$('#cur').text(curTime.format('mm:ss', { trim: false }));
						}
					});
				});
			}

			$(allSongs[0]).addClass("selected");
			setCurrent(allSongs[0], 0);
			var curTime = moment.duration($(allSongs[0]).find('audio').prop("currentTime"), 'seconds');
			$('#cur').text(curTime.format('mm:ss', { trim: false }));
			timeOut = setTimeout(() => {
				$('audio')[0].play();
				var tolTime = moment.duration($(allSongs[0]).find('audio').prop("duration"), 'seconds');
				$('#dur').text(tolTime.format('mm:ss', { trim: false }));
			}, 300);
		}

	})
	.catch(error => {
		$('#error h1').text('404 (NOT FOUND)');
		$('header').removeClass("main-screen");
		$('#error').show();
		$('#playing-div').hide();
		$('#playlist-head').hide();
	});

}

function selectSong(id) {
	clearTimeout(timeOut);
	songlist[(choice)%totalSongs].load();
	$(allSongs[(choice)%totalSongs]).removeClass("selected");
	setCurrent(allSongs[id], id);
	if (!play){
		$('#play').removeClass("fa-pause-circle");
		$('#play').addClass("fa-play-circle");
		play = true;
	}
	repeat = false;
	$('#repeat').removeClass("icon-click");
	$(allSongs[id]).addClass("selected");
	var curTime = moment.duration(songlist[id].currentTime, 'seconds');
	$('#cur').text(curTime.format('mm:ss', { trim: false }));
	songlist[id].play();
	var tolTime = moment.duration(songlist[id].duration, 'seconds');
	$('#dur').text(tolTime.format('mm:ss', { trim: false }));
	choice = id;
}

$(document).ready( () => {
	$('#searchBtn').hide();
	$('#playlist-head').hide();
	$('#playing-div').hide();
	$('#error').hide();

	$('#searchMusicInput').on('input', e => {
		var input = e.target.value;
	 	if (input || input !== '') {
	 		$('#searchBtn').show();
	 		find = input;
	 	} else {
	 		$('#searchBtn').hide();
	 		find = null;
	 	}
	 });

	$('#searchMusicInput').on('keyup', (e) => {
		if (e.keyCode === 13 && find) {
			if (allSongs != ''){
				repeat = false;
				$('#repeat').removeClass("icon-click");
				shuffle = false;
				$('#shuffle').removeClass("icon-click");
				if (!play){
					play = true;
					$('#play').removeClass("fa-pause-circle");
					$('#play').addClass("fa-play-circle");
				}
				clearTimeout(timeOut);
				songlist[(choice)%totalSongs].load();
				$(allSongs[(choice)%totalSongs]).removeClass("selected");
				allSongs = '';
				songlist = '';
				choice = '';
				fav = [];
			}
			searchTerm();
		}
	});


	$('#searchBtn').on('click', () => {
		if (allSongs != ''){
			repeat = false;
			$('#repeat').removeClass("icon-click");
			shuffle = false;
			$('#shuffle').removeClass("icon-click");
			if (!play){
				play = true;
				$('#play').removeClass("fa-pause-circle");
				$('#play').addClass("fa-play-circle");
			}
			clearTimeout(timeOut);
			songlist[(choice)%totalSongs].load();
			$(allSongs[(choice)%totalSongs]).removeClass("selected");
			allSongs = '';
			songlist = '';
			choice = '';
			fav = [];
		}
		searchTerm();
	});

	$('#line').on('click', () => {
		$('#songs').removeClass("bubble");
		$('#songs').removeClass("line");
		$('#songs').addClass("line");
		$('#bubble').removeClass("icon-click");
		$('#line').addClass("icon-click");
	});

	$('#bubble').on('click', () => {
		$('#songs').removeClass("bubble");
		$('#songs').removeClass("line");
		$('#songs').addClass("bubble");
		$('#line').removeClass("icon-click");
		$('#bubble').addClass("icon-click");
	});

	$('#back').on('click', () => {
		clearTimeout(timeOut);
		songlist[(choice)%totalSongs].load();
		$(allSongs[(choice)%totalSongs]).removeClass("selected");
		if (choice == 0) {
			choice = totalSongs;
		}
		setCurrent(allSongs[(choice-1)%totalSongs], (choice-1)%totalSongs);
		if (!play){
			$('#play').removeClass("fa-pause-circle");
			$('#play').addClass("fa-play-circle");
			play = true;
		}
		repeat = false;
		$('#repeat').removeClass("icon-click");
		$(allSongs[(choice-1)%totalSongs]).addClass("selected");
		var curTime = moment.duration(songlist[(choice-1)%totalSongs].currentTime, 'seconds');
		$('#cur').text(curTime.format('mm:ss', { trim: false }));
		songlist[(choice-1)%totalSongs].play();
		var tolTime = moment.duration(songlist[(choice-1)%totalSongs].duration, 'seconds');
		$('#dur').text(tolTime.format('mm:ss', { trim: false }));
		choice --;
	});

	$('#forward').on('click', () => {
		clearTimeout(timeOut);
		songlist[(choice)%totalSongs].load();
		$(allSongs[(choice)%totalSongs]).removeClass("selected");
		setCurrent(allSongs[(choice+1)%totalSongs], (choice+1)%totalSongs);
		if (!play){
			$('#play').removeClass("fa-pause-circle");
			$('#play').addClass("fa-play-circle");
			play = true;
		}
		repeat = false;
		$('#repeat').removeClass("icon-click");
		$(allSongs[(choice+1)%totalSongs]).addClass("selected");
		var curTime = moment.duration(songlist[(choice+1)%totalSongs].currentTime, 'seconds');
		$('#cur').text(curTime.format('mm:ss', { trim: false }));
		songlist[(choice+1)%totalSongs].play();
		var tolTime = moment.duration(songlist[(choice+1)%totalSongs].duration, 'seconds');
		$('#dur').text(tolTime.format('mm:ss', { trim: false }));
		choice ++;
	});

	$('#repeat').on('click', () => {
		if(!repeat){
			repeat = true;
			$('#repeat').addClass("icon-click");
		}
		else {
			repeat = false;
			$('#repeat').removeClass("icon-click");
		}
	});

	$('#shuffle').on('click', () => {
		if(!shuffle){
			shuffle = true;
			$('#shuffle').addClass("icon-click");
		}
		else {
			shuffle = false;
			$('#shuffle').removeClass("icon-click");
		}
	});

	$('#fav').on('click', () => {
		if(!fav[(choice)%totalSongs]){
			fav[(choice)%totalSongs] = true;
			$('#fav').removeClass('fas');
			$('#fav').removeClass('far');
			$('#fav').removeClass('icon-click');
			$('#fav').addClass('fas');
			$('#fav').addClass('icon-click');
		}
		else {
			fav[(choice)%totalSongs] = false;
			$('#fav').removeClass('fas');
			$('#fav').removeClass('far');
			$('#fav').removeClass('icon-click');
			$('#fav').addClass('far');
		}
	});

	$('#volume').on('input', (e) => {
		const val = e.target.value;
		for(var i=0; i<totalSongs; i++) {
			songlist[i].volume = val;
		}
	});


	$('#progress').on('click', (e) => {
		const val = e.target.value * songlist[(choice)%totalSongs].duration;
		songlist[(choice)%totalSongs].currentTime = val;
	});


	$('#play').on('click', () => {
		clearTimeout(timeOut);
		if (play){
			songlist[(choice)%totalSongs].pause();
			$('#play').removeClass("fa-play-circle");
			$('#play').addClass("fa-pause-circle");
			play = false;
		}
		else {
			songlist[(choice)%totalSongs].play();
			$('#play').removeClass("fa-pause-circle");
			$('#play').addClass("fa-play-circle");
			play = true;
		}
	});

	document.addEventListener('ended', () => {
		if(!repeat) {
			$(allSongs[(choice)%totalSongs]).removeClass("selected");
			if(!shuffle){
				choice = choice+1;
			}
			else {
				choice = Math.floor(Math.random() * totalSongs);
			}		
			setCurrent(allSongs[(choice)%totalSongs], (choice)%totalSongs);
			$(allSongs[(choice)%totalSongs]).addClass("selected");
			var curTime = moment.duration(songlist[(choice)%totalSongs].currentTime, 'seconds');
			$('#cur').text(curTime.format('mm:ss', { trim: false }));
			timeOut = setTimeout(() => {
				songlist[(choice)%totalSongs].play();
				var tolTime = moment.duration(songlist[(choice)%totalSongs].duration, 'seconds');
				$('#dur').text(tolTime.format('mm:ss', { trim: false }));
			}, 300);
		}
		else {
			var curTime = moment.duration(songlist[(choice)%totalSongs].currentTime, 'seconds');
			$('#cur').text(curTime.format('mm:ss', { trim: false }));
			timeOut = setTimeout(() => {
				songlist[(choice)%totalSongs].play();
				var tolTime = moment.duration(songlist[(choice)%totalSongs].duration, 'seconds');
				$('#dur').text(tolTime.format('mm:ss', { trim: false }));
			}, 300);
		}
	}, true);

})


