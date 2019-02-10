var twitchClient = null;
const twitchConnect = function( username, token, channels, reactions) {

    if(twitchClient != null){
        twitchClient.disconnect();
    }

    twitchClient = new tmi.client({
        identity: {
            username: username,
            password: token
        },
        channels: channels
    });

    onMessageHandler = function(target, context, msg, self) {
        if (self) { return; } // Ignore messages from the bot

        // console.log( context);

        for (let i = 0; i < reactions.length; i++) {
            let reaction = reactions[i];
            if (msg.indexOf(reaction.keyword)>-1){
                var actualMessage = "";
                if(reaction.message != null && reaction.message != ""){
                    var actualMessage = reaction.message;
                    actualMessage = actualMessage.replace("##user##", context.username);
                }

                clippySay(actualMessage, reaction.animation);

                return;
            }
        }
    };

    twitchClient.on('message', onMessageHandler);
    twitchClient.on('connected', function(addr, port) {
        console.log(`* Connected to ${addr}:${port}`);
    });

    twitchClient.connect();

};

function createTwitchReactionRow(keyword, message, animation) {
    const animations = clippyAgent.animations();
    let tr = document.createElement("tr");
    tr.classList.add("twitchReactionRow");
    let tdTesting = document.createElement("td");
    let tdKeyword = document.createElement("td");
    let tdMessage = document.createElement("td");
    let tdAnimation = document.createElement("td");

    tr.append(tdTesting, tdKeyword, tdMessage, tdAnimation);

    const keywordInput = document.createElement("input");
    keywordInput.type = "text";
    keywordInput.value = keyword;

    tdKeyword.append( keywordInput);

    const messageInput = document.createElement("input");
    messageInput.type = "text";
    messageInput.value = message;

    tdMessage.append(messageInput);

    let animationSelect = document.createElement("select");

    for (let i = 0; i < animations.length; i++) {
        const option = document.createElement("option");
        option.innerText = animations[i];
        option.value = animations[i];
        if( animation == animations[i]) {
            option.selected = "true";
        }
        animationSelect.append(option);
    }

    tdAnimation.append(animationSelect);

    const testbutton = document.createElement("button");
    testbutton.innerText = "TEST";
    testbutton.addEventListener("click", function () {
        clippyAgent.speak(messageInput.value);
        clippyAgent.play(animationSelect.value);
    });

    tdTesting.append(testbutton);

    return tr;
}

const twitchSettingsShowHide = function () {
    const checked = document.getElementById("twitchEnabled").checked;
    if (checked){
        document.getElementById("twitchSettings").classList.remove("hidden")
    } else {
        document.getElementById("twitchSettings").classList.add("hidden")
    }
};

const twitchSetupUi = function(settings){

    document.getElementById("twitchEnabled").checked = settings.enabled;
    twitchSettingsShowHide();
    document.getElementById("twitchUsername").value = settings.username;
    document.getElementById("twitchToken").value = settings.token;
    document.getElementById("twitchChannels").value = settings.channels.join(", ");

    settings.reactions = settings.reactions || [];
    let reactionsRows = document.getElementById("twitchreactions");
    reactionsRows.innerHTML = "";
    for (let i = 0; i < settings.reactions.length; i++) {
        const row = createTwitchReactionRow(
            settings.reactions[i].keyword,
            settings.reactions[i].message,
            settings.reactions[i].animation
        );
        const btnRemove = document.createElement("button");
        const cllRemove = document.createElement("td");
        cllRemove.append(btnRemove);
        row.append(cllRemove);
        btnRemove.innerText = "DEL";
        btnRemove.addEventListener("click", function () {
            reactionsRows.removeChild(row);
        });

        reactionsRows.append(row);
    }
};

const twitchGetConfigFromUi = function () {
    var settings = {
        enabled: false,
        username: "",
        token: "",
        reactions: [],
        channels: [],
    };

    settings.enabled = document.getElementById("twitchEnabled").checked;
    settings.username = document.getElementById("twitchUsername").value;
    settings.token = document.getElementById("twitchToken").value;

    var channelsString = document.getElementById("twitchChannels").value;
    settings.channels = channelsString.split(", ").map(s=>{ return s.trim()});

    const rows = document.getElementsByClassName("twitchReactionRow");
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const cells = row.querySelectorAll("td")
        const keyword = cells[1].querySelector("input").value;
        const message = cells[2].querySelector("input").value;
        const animation = cells[3].querySelector("select").value;

        settings.reactions.push({
            keyword: keyword,
            message: message,
            animation: animation
        });
    }

    console.log(settings);
    return settings;
};

const addTwitchReactionRow = function () {
    let reactionsRows = document.getElementById("twitchreactions");

    const row = createTwitchReactionRow("tlanfer", "tlanfer is amazing", "GetAttention");

    const btnRemove = document.createElement("button");
    const cllRemove = document.createElement("td");
    cllRemove.append(btnRemove);
    row.append(cllRemove);
    btnRemove.innerText = "DEL";
    btnRemove.addEventListener("click", function () {
        reactionsRows.removeChild(row);
    });

    reactionsRows.append(row);
};