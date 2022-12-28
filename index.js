let channelId = "testChannel";
//let token = null;             //tokenを画面から入力できるように改修
//let uid = 123456;             //uidを画面から入力できるように改修

let config = { mode: "rtc", codec: "vp8" };
let client = AgoraRTC.createClient(config);

client.on("connection-state-change", (curState, revstate, reason) => {
    if (reason == undefined) {
    reason = "None";
}

document.getElementById("state").innerHTML =
    "Local connection state changes from " +
    revstate +
    " to " +
    curState +
    " Reason: " +
    reason;
});
client.on("user-joined", (remoteUser) => {
    document.getElementById("remotestate").innerHTML =
    "User: " + remoteUser.uid + " joined local channel";
});

client.on("user-left", (remoteUser) => {
    document.getElementById("remotestate").innerHTML =
    "User: " + remoteUser.uid + " left local channel";
});

client.on("user-published", (remoteUser) => {
    client
    .subscribe(remoteUser, "video")
    .then((remoteVideoTrack) => {
        remoteVideoTrack.play("remote-video");
    })
    .catch((e) => {
        console.log("Failed to play video!", e);
    });

    client
    .subscribe(remoteUser, "audio")
    .then((remoteAudioTrack) => {
        remoteAudioTrack.play();
    })
    .catch((e) => {
        console.log("Failed to play audio!", e);
    });
});

let videoDict = {};
let selectedVideoDeviceId = "";
let audioDict = {};
let selectedAudioDeviceId = "";
let cameraVideoTrack = null;
let microphoneAudioTrack = null;

AgoraRTC.getCameras()
    .then((deviceInfoArray) => {
        for (let deviceInfo of deviceInfoArray) {
            let option = document.createElement("option");
            document.getElementById("cameraList").appendChild(option);
            option.innerHTML = deviceInfo.label;
            videoDict[deviceInfo.label] = deviceInfo.deviceId;
        }
    })
    .catch((e) => {
    console.log("Failed to get cameras!", e);
});

AgoraRTC.getMicrophones()
    .then((deviceInfoArray) => {
        for (let deviceInfo of deviceInfoArray) {
            let option = document.createElement("option");
            document.getElementById("microphoneList").appendChild(option);
            option.innerHTML = deviceInfo.label;
            audioDict[deviceInfo.label] = deviceInfo.deviceId;
        }
    })
    .catch((e) => {
    console.log("Failed to get microphones!", e);
});

AgoraRTC.createCameraVideoTrack()
    .then((track) => {
        cameraVideoTrack = track;
        cameraVideoTrack.play("play-area");
    })
    .catch((e) => {
        console.log("Failed to play video!", e);
});

AgoraRTC.createMicrophoneAudioTrack()
    .then((track) => {
        microphoneAudioTrack = track;
        microphoneAudioTrack.play();
    })
    .catch((e) => {
        console.log("Failed to play audio!", e);
});

document.getElementById("join").onclick = async function join() {
    let appId = document.getElementById("appid").value;
    let token = document.getElementById("token").value;
    let uid = document.getElementById("uid").value;

    await client
    .join(appId, channelId, token, uid)
    .then((uid) => {
        console.log(uid + " joined channel!");
    })
    .catch((e) => {
        console.log("Failed to join channel!", e);
        document.getElementById("state").innerHTML =
        "User: " + uid + " failed to join current channel" + e;
    });

    await client
    .publish(cameraVideoTrack)
    .then(() => {
        console.log("Video track successfully published");
    })
    .catch((e) => {
        console.log("Failed to publish video track", e);
    });

    await client
    .publish(microphoneAudioTrack)
    .then(() => {
        console.log("Audio track successfully published");
    })
    .catch((e) => {
        console.log("Failed to publish audio track", e);
    });
};

document.getElementById("leave").onclick = function leave() {
    client.leave().catch((e) => {
        console.log("Failed to leave channel!", e);
    });
};

function getVideoDeviceId() {
    let cameraList = document.getElementById("cameraList");
    let deviceLabel = cameraList.options[cameraList.selectedIndex].text;
    selectedVideoDeviceId = videoDict[deviceLabel];
    document.getElementById("videoDeviceId").innerHTML = selectedVideoDeviceId;

    cameraVideoTrack
    .setDevice(selectedVideoDeviceId)
    .then(() => {
        console.log("Device set to ", selectedVideoDeviceId);
    })
    .catch((e) => {
        console.log("Failed to set device ", e);
    });
}

function getAudioDeviceId() {
    let microphoneList = document.getElementById("microphoneList");
    let deviceLabel = microphoneList.options[microphoneList.selectedIndex].text;
    selectedAudioDeviceId = audioDict[deviceLabel];
    document.getElementById("audioDeviceId").innerHTML = selectedAudioDeviceId;

    microphoneAudioTrack
    .setDevice(selectedAudioDeviceId)
    .then(() => {
        console.log("Device set to ", selectedAudioDeviceId);
    })
    .catch((e) => {
        console.log("Failed to set device ", e);
    });
}