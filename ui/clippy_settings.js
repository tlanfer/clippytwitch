const backend = "https://8m2t1eqw8c.execute-api.eu-central-1.amazonaws.com/thing/storage";

const saveSettings = function (key, settings) {

    console.log("save settings for unique key "+key);

    var xhr = new XMLHttpRequest();
    xhr.addEventListener("load", function () {

        if ( xhr.status != 200) {
            window.alert("failed to store settings!");
            console.log(xhr.response);
        }
    });
    xhr.open("POST", backend + "?uniqueKey="+key);
    xhr.send(JSON.stringify(settings));

};

const loadSettings = function (key, callback) {

    console.log("load settings for unique key "+key);

    var xhr = new XMLHttpRequest();
    xhr.responseType = "json";
    xhr.addEventListener("load", function () {

        if ( xhr.status == 200) {
            configFromServer = xhr.response;
            callback(configFromServer);
        }
    });
    xhr.open("GET", backend + "?uniqueKey="+key);
    xhr.send(JSON.stringify(false));
};

const applySettings = function (settings) {
    if (settings.twitch.enabled) {

        twitchSetupUi(settings.twitch);
        twitchConnect(settings.twitch.username,
                        settings.twitch.token,
                        settings.twitch.channels,
                        settings.twitch.reactions
        );
    }

    clippySetup(settings.clippy);

    // streamlabsSetupUI(settings.streamlabs);
    // streamLabsInit(settings.streamlabs);
};