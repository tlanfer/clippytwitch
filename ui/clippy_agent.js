
var clippyAgent = null;

clippy.load('Clippy', function(agent) {
    // Do anything with the loaded agent
    clippyAgent = agent;
    agent.show();
    agent.moveTo(200, 200, 0);
});

var clippyAutohide = false;
var clippyAllowMessage = true;
var clippySound = true;

const clippySay = function (message, animation) {
    if(!clippyAllowMessage){
        return;
    }

    clippyAllowMessage = false;
    //clippyAgent.setSoundEnabled(clippySound);

    setTimeout(function () {
        clippyAllowMessage = true;
        if( clippyAutohide){
            clippyAgent.hide();
        }
    }, 2000);


    clippyAgent.show();

    if(message != null && message != "") {
        clippyAgent.speak(message);
    }

    if( animation != null && animation != "" && animation != "none") {
        clippyAgent.play(animation);
    }
};

const clippySetup = function(settings){
    clippyAutohide = settings.autohide || false;
    clippySound = settings.sound;

    document.getElementById("clippyAutohide").checked = settings.autohide;
    document.getElementById("clippySound").checked = clippySound;

    clippySay("Ready to rock", null);
};

const clippyGetConfigFromUi = function () {
    return {
        autohide: document.getElementById("clippyAutohide").checked,
        sound:  document.getElementById("clippySound").checked
    }
};