/*
 * options.js
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

function save_options() {
    var onOff = document.getElementById('mainSwitch').checked;
    var mark = document.getElementById('mark').checked;
    var mode = document.getElementById('replaceMode').value;

    document.getElementsByName('replaceMode').forEach((radio) => {
        if (radio.checked == true) {
            mode = radio.value;;
        }
    });

    chrome.storage.local.set({
        enabled: onOff,
        replaceMode: mode,
        mark: mark
    }, function () {
        // Update status to let user know options were saved.
        var status = document.getElementById('status');
        status.textContent = 'Optionen gespeichert.';
        setTimeout(function () {
            status.textContent = '';
        }, 1000);
    });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
    chrome.storage.local.get({
        enabled: true,
        replaceMode: 2,
        mark: true
    }, function (items) {
        document.getElementById('mainSwitch').checked = items.enabled;
        document.getElementById('mark').checked = items.mark;
        document.getElementById('replaceMode').value = items.replaceMode;
    });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save_options').addEventListener('click', save_options);