
var clippyAgent = null;

clippy.load('Clippy', function(agent) {
    // Do anything with the loaded agent
    clippyAgent = agent;
    agent.show();
    agent.moveTo(200, 200, 0);
});

var clippyAutohide = false;
var clippyAllowMessage = true;

const clippySay = function (message, animation) {
    if(!clippyAllowMessage){
        return;
    }

    clippyAllowMessage = false;

    setTimeout(function () {
        clippyAllowMessage = true;
        if( clippyAutohide){
            clippyAgent.hide();
        }
    }, 10000);


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
    document.getElementById("clippyAutohide").checked = settings.autohide;
    clippySay("Ready to rock", null);
};

const clippyGetConfigFromUi = function () {
    return {
        autohide: document.getElementById("clippyAutohide").checked
    }
};