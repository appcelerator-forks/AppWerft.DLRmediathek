var АктйонБар=require("com.alcoapps.actionbarextras"),Player=Ti.Media.createAudioPlayer({allowBackground:!0,volume:1}),currentItem=null;module.exports=function(e){var t="";АктйонБар.title="DeutschlandRadio",АктйонБар.subtitle="Mediathek",АктйонБар.titleFont="ScalaSansBold",АктйонБар.subtitleColor="#ccc";var o=e.source.getActivity();if(o){var a=e.source.FlipViewCollection;o.onCreateOptionsMenu=function(e){a.views[0];e.menu.clear(),e.menu.add({title:"Tagesplan",itemId:"0",icon:Ti.App.Android.R.drawable.ic_action_rss,showAsAction:Ti.Android.SHOW_AS_ACTION_IF_ROOM}).addEventListener("click",function(){require("ui/rss.window")(t)}),e.menu.add({title:"RadioStart",itemId:"1",icon:Ti.App.Android.R.drawable.ic_action_play,showAsAction:Ti.Android.SHOW_AS_ACTION_IF_ROOM}).addEventListener("click",function(){var e=a.getViews()[a.getCurrentPage()].itemId.name;console.log("Current="+currentItem+" nextItem="+e),Player.isPlaying()&&(Player.stop(),Player.release(),console.log("was playing"),currentItem==e)||(currentItem=a.getViews()[a.getCurrentPage()].itemId.name,require("controls/resolveplaylist")({playlist:a.getViews()[a.getCurrentPage()].itemId.stream,onload:function(e){Player.release(),Player.setUrl(e),Player.start()}}))});var i=e.menu.findItem("1");Player.addEventListener("change",function(e){switch(console.log("state: "+e.state),e.state){case 3:i.setIcon(Ti.App.Android.R.drawable.ic_action_stop);break;case 4:case 5:i.setIcon(Ti.App.Android.R.drawable.ic_action_play)}}),o.actionBar.displayHomeAsUp=!1,a.addEventListener("flipped",function(i){t=a.getViews()[i.index].itemId.name,o.actionBar.logo="/images/"+t+".png";var r=e.menu.findItem("0");r.setVisible("drw"==t?!1:!0)}),Ti.App.addEventListener("app:play",function(e){console.log(e.item);var t=Ti.UI.createAlertDialog({message:e.item.title,ok:"Beitrag anhören",title:e.item.sendung.text});t.show(),t.addEventListener("click",function(t){console.log(t),t.index<0||(Player.isPlaying()&&(Player.stop(),Player.release()),Player.setUrl(e.item.url),Player.start())})})},o.invalidateOptionsMenu(),require("vendor/versionsreminder")()}};