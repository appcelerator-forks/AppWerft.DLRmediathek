var AudioStreamer = require('controls/audiostreamer.adapter');

const RECENT = 0,
    MYFAVS = 1,
    MYPODS = 2,
    MYPLAYLIST = 3,
    PLAY = 4;

var Moment = require('vendor/moment');

var playIcon;

var lastOnlineState = Ti.Network.online;

var onAir = false;

function onCallbackFn(_payload) {
	switch(_payload.status) {
	case 'PLAYING':
		playIcon.setIcon(Ti.App.Android.R.drawable['ic_action_stop_' + currentStation]);
		_payload.message && АктйонБар.setSubtitle('Radio ist onAir');
		break;
	case 'STOPPED':
		playIcon.setIcon(Ti.App.Android.R.drawable['ic_action_play_' + currentStation]);
		АктйонБар.setSubtitle('Radio angehalten');
		break;
	case 'BUFFERING':
		playIcon.setIcon(Ti.App.Android.R.drawable.ic_action_loading);
		_payload.message && АктйонБар.setSubtitle('Lade Puffer …');
		break;
	}
}

function onPlayStopClickFn() {
	if (onAir == false) {
		AudioStreamer.play(stations[currentStation].icyurl[0], onCallbackFn);
		console.log('AAS onAir was false now setting  to true');
		onAir = true;
	} else {
		AudioStreamer.stop(onCallbackFn);
		console.log('AAS onAir was true now setting  to false');
		onAir = false;
	}
};

var Model = require('model/stations'),
    АктйонБар = require('com.alcoapps.actionbarextras'),
    stations = require('model/stations'),
    currentStation = Ti.App.Properties.getString('LAST_STATION', 'dlf');

if (currentStation == undefined || currentStation.length != 3)
	currentStation = 'dlf';

var searchView = Ti.UI.Android.createSearchView({
	hintText : "Suche"
});

var searchMenu;

searchView.addEventListener('submit', function(_e) {
	require('ui/search.window')({
		needle : _e.source.value,
		where : searchView.where
	}).open();
	searchMenu.collapseActionView();
});

module.exports = function(_event) {
	АктйонБар.setTitle(Model[currentStation].name);
	АктйонБар.setSubtitle('Mediathek');
	АктйонБар.setFont("Aller");
	АктйонБар.setBackgroundColor('#444444');
	АктйонБар.subtitleColor = "#ccc";
	АктйонБар.setStatusbarColor(Model[currentStation].color);
	searchView.where = _event.source.activeTab.ndx;
	var activity = _event.source.getActivity();
	if (activity) {
		activity.actionBar.logo = '/images/' + currentStation + '.png';
		activity.onPrepareOptionsMenu = function() {
			console.log('Info: AAS onPrepareOptionsMenu');
		};
		activity.onCreateOptionsMenu = function(_menuevent) {
			console.log('Info: AAS onCreateOptionsMenu');
			_menuevent.menu.clear();
			_menuevent.menu.add({
				title : 'Start live Radio',
				itemId : PLAY,
				visible : Ti.Network.online ? true : false,
				icon : Ti.App.Android.R.drawable['ic_action_play_' + currentStation],
				showAsAction : Ti.Android.SHOW_AS_ACTION_IF_ROOM,
			}).addEventListener("click", onPlayStopClickFn);
			playIcon = _menuevent.menu.findItem(PLAY);

			searchMenu = _menuevent.menu.add({
				title : L('MENU_SEARCH'),
				visible : false,
				actionView : searchView,
				icon : (Ti.Android.R.drawable.ic_menu_search ? Ti.Android.R.drawable.ic_menu_search : "my_search.png"),
				showAsAction : Ti.Android.SHOW_AS_ACTION_NEVER | Ti.Android.SHOW_AS_ACTION_COLLAPSE_ACTION_VIEW
			});
			setTimeout(function() {
				searchMenu.setVisible(true);
			}, 5000);
			// changing a searchview
			АктйонБар.setSearchView({
				searchView : searchView,
				backgroundColor : '#777',
				textColor : "white",
				hintColor : "silver",
				line : "/images/my_textfield_activated_holo_light.9.png",
				cancelIcon : "/images/cancel.png",
				searchIcon : "/images/search.png"
			});
			setTimeout(function() {
				_menuevent.menu.add({
					title : L('MENU_FAV'),
					itemId : MYFAVS,
					icon : Ti.App.Android.R.drawable.ic_action_fav,
					showAsAction : Ti.Android.SHOW_AS_ACTION_NEVER,
				}).addEventListener("click", function(_e) {
					require('ui/merkliste.window')().open();
				});
				_menuevent.menu.add({
					title : 'Meine Podcasts',
					itemId : MYPODS,
					icon : Ti.App.Android.R.drawable.ic_action_fav,
					showAsAction : Ti.Android.SHOW_AS_ACTION_NEVER,
				}).addEventListener("click", function(_e) {
					require('ui/mypodcasts.window')().open();
				});
				_menuevent.menu.add({
					title : 'Letztgehört …',
					itemId : RECENT,
					icon : Ti.App.Android.R.drawable.ic_action_fav,
					showAsAction : Ti.Android.SHOW_AS_ACTION_NEVER,
				}).addEventListener("click", function(_e) {
					require('ui/recents.window')().open();
				});
				_menuevent.menu.add({
					title : 'PDF Sendepläne',
					showAsAction : Ti.Android.SHOW_AS_ACTION_NEVER,
				}).addEventListener("click", function(_e) {
					require('ui/pdf.window')().open();
				});
			}, 7000);
			playIcon = _menuevent.menu.findItem(PLAY);
			activity.actionBar.displayHomeAsUp = false;

			/*
			 *
			 * Users has swiped the flipboard and want to switch station
			 *
			 * */
			Ti.App.addEventListener('app:station', function(_e) {
				if (!_e.station)
					return;
				currentStation = _e.station;
				Ti.App.Properties.setString('LAST_STATION', currentStation);
				console.log('Info: AAS onStationChanged   ≠≠≠≠≠≠≠≠≠≠≠');
				АктйонБар.setStatusbarColor(Model[currentStation].color);
				Ti.App.fireEvent('app:setRadiotext', {
					message : ''
				});
				playIcon.setIcon(Ti.App.Android.R.drawable['ic_action_play_' + currentStation]);
				activity.actionBar.logo = '/images/' + currentStation + '.png';
				АктйонБар.setTitle(Model[currentStation].name);
				return;
				// only if radio is active we switch to other station:
				if (Ti.App.AudioStreamer.getStatus() == PLAYING) {
					radioShouldPlay = false;
					Ti.App.AudioStreamer.stop();
					setTimeout(startAudioStreamer, 3000);
				}
			});
			Ti.App.addEventListener('app:stopAudioStreamer', function(_event) {
				audioStreamer.stop();
			});
		};
		//activity && activity.invalidateOptionsMenu();
		activity.onResume = function() {
			console.log('Info: AAS onResume');
			playIcon && playIcon.setVisible(Ti.Network.online);
			currentStation = Ti.App.Properties.getString('LAST_STATION', 'dlf');
			activity.actionBar.logo = '/images/' + currentStation + '.png';
			АктйонБар.setStatusbarColor(Model[currentStation].color);
		};
		activity.onPause = function() {
		};
	}
};

Ti.Network.addEventListener('change', function(event) {
	return;
	console.log('Info: AAS Network changed');
	var onlineState = Ti.Network.online;
	playIcon && playIcon.setVisible(onlineState);
	if (lastOnlineState != onlineState) {
		lastOnlineState = onlineState;
		console.log('Info: NetStatus=' + Ti.Network.online + ' && Ti.App.AudioStreamer.status=' + Ti.App.AudioStreamer.getStatus() + ' && shouldPlay=' + radioShouldPlay);
		if (Ti.Network.online && Ti.App.AudioStreamer.getStatus() == STOPPED && radioShouldPlay == true) {
			startAudioStreamer(stations[currentStation].stream, true);
		}
	}
});

Ti.Android.currentActivity.onRestart = function() {
	playIcon.setVisible(Ti.Network.online);
};

