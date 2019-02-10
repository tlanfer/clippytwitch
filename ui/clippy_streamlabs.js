var streamlabsConnection = null;

const streamLabsConnect = function (socketToken, settings) {

    //Connect to socket
    streamlabsConnection = io(`https://sockets.streamlabs.com?token=${socketToken}`, {transports: ['websocket']});

    //Perform Action on event
    streamlabsConnection.on('event', (eventData) => {
        if (!eventData.for && eventData.type === 'donation') {
            //code to handle donation events
            console.log(eventData.message);
        }
        if (eventData.for === 'twitch_account') {
            switch (eventData.type) {
                case 'follow':
                    var m = eventData.message[0];
                    clippyAgent.speak("Follower: " + m.from);
                    clippyAgent.play("Thinking");
                    console.log(eventData.message);
                    break;
                case 'subscription':
                    var m = eventData.message[0];
                    clippyAgent.speak("Subscriber: " + m.from);
                    clippyAgent.play("Print");
                    console.log(eventData.message);
                    break;
                default:
                    //default case
                    console.log(eventData.message);
            }
        }
    });
};
const streamLabsInit = function (settings) {

    if(settings.enabled) {


        var xhr = new XMLHttpRequest();
        xhr.responseType = 'json';
        xhr.addEventListener("load", function () {

            if ( xhr.status == 200) {
                streamLabsConnect(xhr.response["socket_token"], settings);
            }
        });
        xhr.open("GET", "https://streamlabs.com/api/v1.0/socket/token?access_token=" + settings.token);
        xhr.send(JSON.stringify(false));

    }
};


const streamlabsSettingsShowHide = function () {
    const checked = document.getElementById("streamlabsEnabled").checked;
    if (checked){
        document.getElementById("streamlabsSettings").classList.remove("hidden")
    } else {
        document.getElementById("streamlabsSettings").classList.add("hidden")
    }
};

const streamlabsSetupUI = function (settings) {
    document.getElementById("streamlabsEnabled").checked = settings.enabled;
    streamlabsSettingsShowHide();
};
