(function() {
    var window = Titanium.UI.createWindow({
        backgroundColor : '#fff',
        fullscreen : true,
        exitOnClose : true,
        orientationModes : [Ti.UI.PORTRAIT, Ti.UI.UPSIDE_PORTRAIT]
    });
    var Model = require('model/stations');
    var pages = [];
    for (var station in Model) {
        pages.push(require('station.page')({
            name : station,
            color : Model[station].color,
            podcasts : Model[station].podcasts,
            live : Model[station].live,
            stream : Model[station].stream,
            
        }));
    };
    var FlipModule = require('de.manumaticx.androidflip');
    window.FlipViewCollection = FlipModule.createFlipView({
        orientation : FlipModule.ORIENTATION_HORIZONTAL,
        overFlipMode : FlipModule.OVERFLIPMODE_GLOW,
        views : pages,
        currentPage : 0,
        height : Ti.UI.FILL
    });
    window.addEventListener('focus', function() {
        window.FlipViewCollection.peakNext(true);
    });
    window.add(window.FlipViewCollection);
    window.addEventListener('open', require('ui/main.menu'));
    
    setTimeout(function() {
        window.FlipViewCollection.flipToView(1);
    }, 2000);

    window.open();
})();
