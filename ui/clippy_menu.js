
window.addEventListener("keypress", function (k) {
    const configMenu = document.getElementById("configMenu");
    if( k.key == "k" && configMenu.classList.contains("hidden")){
        configMenu.classList.remove("hidden");
    }
});


const saveAndClose = function () {

    let uniqueKey = getUniqueKey();
    let settings = {
        uniqueKey: uniqueKey,
        clippy: clippyGetConfigFromUi(),
        twitch: twitchGetConfigFromUi(),
        streamlabs: {},
    };
    saveSettings( uniqueKey, settings);

    applySettings(settings);

    var configMenu = document.getElementById("configMenu");
    configMenu.classList.add("hidden");
};


const generateUniqueKey = function () {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < 40; i++) {
        text += possible[Math.floor(Math.random() * possible.length)]
    }
    setUniqueKey(text)
};

const setUniqueKey = function(text){
    let el = document.getElementById("uniqueLink");
    el.setAttribute("data-unique-key", text);
    el.setAttribute("value", "http://clippytwitch.tlanfer.de/#"+text);

    document.cookie = "key="+text+"; expires=Thu, 18 Dec 2023 12:00:00 UTC; path=/;";
};

const getUniqueKey = function () {
    let el = document.getElementById("uniqueLink");
    return el.getAttribute("data-unique-key");
};

const getCookie = function (name) {
    var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (match) return match[2];
};

const initApp = function(){
    if(clippyAgent == null){
        setTimeout( initApp, 100);
        return;
    }

    let hash = window.location.hash;
    let cookieValue = getCookie("key");
    if( hash.length > 1){
        console.log("Loaded hash: "+hash.substr(1));
        setUniqueKey(hash.substr(1));
    } else if( cookieValue != null){
        console.log("Loaded cookie: "+cookieValue);
        setUniqueKey(cookieValue);
    } else {
        generateUniqueKey();
    }

    if( hash.length < 1){
        configMenu.classList.remove("hidden");
    }

    let uniqueKey = getUniqueKey();
    if(uniqueKey != null) {
        loadSettings(uniqueKey, function (settings) {
            console.log(settings);
            applySettings(settings);
        });
    }

};

document.addEventListener("load", initApp);
