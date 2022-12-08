/*
 * popup.js
 *
 * Copyright 2022 nebelkatz
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

async function save_options() {
    document.getElementById("refresh").disabled = false;
    const config = {
        enabled: document.getElementById('mainSwitch').checked,
        replaceMode: document.getElementById('replaceMode').value,
        mark: document.getElementById('mark').checked,
        notifications: document.getElementById('notifications').checked
    };

    chrome.storage.local.set(config, function () {
        const successToast = document.getElementById('liveToast')
        const toast = new bootstrap.Toast(successToast)
        toast.show()
    });
}

mainSwitch.addEventListener("change", async () => {
    save_options();
});

mark.addEventListener("change", async () => {
    save_options();
});

notifications.addEventListener("change", async () => {
    save_options();
});

replaceMode.addEventListener("change", async () => {
    save_options();
});

refresh.addEventListener("click", async () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.reload(tabs[0].id);
    });
});

function restore_options() {
    document.getElementById("refresh").disabled = true;
    chrome.storage.local.get({
        enabled: true,
        replaceMode: 'male',
        mark: true,
        notifications: true
    }, function (items) {
        document.getElementById('mainSwitch').checked = items.enabled;
        document.getElementById('mark').checked = items.mark;
        document.getElementById('replaceMode').value = items.replaceMode;
        document.getElementById('notifications').checked = items.notifications;
    });
}

document.addEventListener('DOMContentLoaded', restore_options);