/*
 * content.js
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

const GenderMode = {
    none: "none",
    male: "male",
    female: "female",
    pair: "pair",
    // führt zu falschen Ersetzungen, weil der Wort-/Satzkontext fehlt
    random: "random"
}

// Häufig angetroffene, falsche Anwendung
// vgl. Weglassprobe, https://www.scribbr.de/category/richtig-gendern
const falseMaleForms = {
    "Kund": ["Kunde"],
    "Expert": ["Experte"],
    "Kolleg": ["Kollege"]
}

// Spezialformen welche durch RegExp unzureichend abgedeckt werden
const pronouns = {
    "ein": true,
    "diese": false,
    "jene": false
}

var replaces = 0;
var mark = true;
var mode = GenderMode.male;
var notifications = true;

// Sonderzeichen
let re = new RegExp("\\b([a-zäöüA-ZÄÖÜ]+)(\\:|\\*|\\_|\\/)(innen|in|in)([a-zäöüA-ZÄÖÜ]+)?\\b", "id");

// Artikel-/Endungen
let re2 = new RegExp("\\b([a-zäöüA-ZÄÖÜ]+)(\\:|\\*|\\_|\\/)(e|r)\\b", "id");

// Binnen-I: ArbetgeberIn
let re3 = new RegExp("\\b([a-zäöüA-ZÄÖÜ]+)(Innen|In|In)([a-zäöüA-ZÄÖÜ]+)?\\b", "d");

// Binnen-E/R: einE BeamteR
let re4 = new RegExp("\\b([a-zäöüA-ZÄÖÜ]+)(eR|E)\\b", "d");

// Klammern ()
let re5 = new RegExp("\\b([a-zäöüA-ZÄÖÜ]+)(\\()(innen|in|in)\\)", "id");

// der/die, des/der usw. - Kombination
let re6 = new RegExp("\\b((de[rnms]{1})\\/(die|der))\\b", "id");

// Deppen-Leerschlag: Trans* Personen
let re7 = new RegExp("(\\*\\s+)([A-ZÄÖÜ][a-zäöüA-ZÄÖÜ]+)\\b", "d");


/**
 *
 * @param string part1      Substring vor dem Sonderzeichen
 * @param string part2      Substring nach dem Sonderzeichen
 * @param string trailing   Rest bei zusammengesetzten Wörtern
 * @returns
 */
function getMaleForm(part1, part2, trailing) {
    if (pronouns.hasOwnProperty(part1)) {
        return pronouns[part1.toLowerCase()] ? part1 : part1 + "r";
    }

    let maleForm = part1;
    if (part2 == 'er') {
        return part1 + part2;
    }

    if (falseMaleForms.hasOwnProperty(part1)) {
        maleForm = part1 + "e";
    }

    // plural
    if (part2 !== "in" && part1.substring(part1.length - 2).toLowerCase() !== 'er') {
        if (part2 !== "r") {
            maleForm = part1 + "en";
        }
        else {
            maleForm = part1 + part2;
        }

    }

    return maleForm + trailing;
}


/**
 *
 * @param string part1      Substring vor dem Sonderzeichen
 * @param string part2      Substring nach dem Sonderzeichen
 * @param string trailing   Rest bei zusammengesetzten Wörtern
 * @returns
 */
function getFemaleForm(part1, part2, trailing) {
    if (pronouns.hasOwnProperty(part1)) {
        return pronouns[part1.toLowerCase()] ? part1 + "e" : part1;
    }

    if (part2 == 'er') {
        return part1 + 'e';
    }

    // des Managers --> der Managerin
    part1 = (part1.charAt(part1.length-1) == 's') ? part1.substring(0, part1.length-1): part1;

    // den Laboranten -> den Laborantinnen
    part1 = (part1.substr(part1.length-2, 2) == 'en') ? part1.substring(0, part1.length-2): part1;

    let femaleForm = part1;
    if (part2 !== 'r') {
        femaleForm += part2;
    };
    return femaleForm + trailing;
}


/**
 *
 * @param GenderMode mode   Gewünschter Stil der Ersetzung
 * @param string part1      Substring vor dem Sonderzeichen
 * @param string part3      Substring nach dem Sonderzeichen
 * @param string orig       Originalform im Text
 * @param sttring trailing  Rest bei zusammengesetzten Wörtern
 * @returns
 */
function getDesiredGender(mode, part1, part3, orig, trailing) {
    let newForm = orig;

    switch (mode) {
        case GenderMode.female:
            newForm = getFemaleForm(part1, part3, trailing);
            break;
        case GenderMode.pair:
            newForm = getMaleForm(part1, part3, trailing) + "/-" + part3;
            break;
        case GenderMode.random:
            newForm = Math.random() > 0.5 ? getFemaleForm(part1, part3, trailing) : getMaleForm(part1, part3, trailing);
            break;
        case GenderMode.male:
        default:
            newForm = getMaleForm(part1, part3, trailing);
            break;
    }
    return newForm;
}


/**
 *
 * @param Node currentNode      aktueller DOM-Knoten
 * @param RegExp re             RegExp
 * @param Array matches         matches bei Anwendung der RegExp
 * @param string replacement    String, welche an Stelle des Matches gesetzt
 *
 */
function replaceNode(currentNode, re, matches, replacement) {
    if (mark) {
        newTextNode = currentNode.splitText(matches['indices'][0][1]);
        currentNode.data = currentNode.data.substring(0, matches['indices'][0][0]);

        var span = document.createElement("span");
        span.className = "un-gender-replaced";
        span.textContent = replacement;
        currentNode.parentNode.insertBefore(span, newTextNode);
    }
    else {
        currentNode.data = currentNode.data.replace(re, replacement);
    }
}


/**
 *  Durchläuft alle Text-Knoten im aktuellen Dokument und prüft, ob Gender-
 *  Stile ersetzt werden sollen.
 */
function walk() {
    replaces = 0;
    const treeWalker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT
    );

    let currentNode = treeWalker.currentNode;

    while (currentNode) {
        // *, :, _ / in|innnen
        if ((matches = re.exec(currentNode.data)) !== null) {
            const replacement = getDesiredGender(mode, matches[1], matches[3], matches[0], (matches[4] ? matches[4] : ""));
            replaceNode(currentNode, re, matches, replacement)
            replaces++;
        }

        // *, :, _ e|r
        if ((matches = re2.exec(currentNode.data)) !== null) {
            const replacement = getDesiredGender(mode, matches[1], matches[3], matches[0], "");
            replaceNode(currentNode, re2, matches, replacement);
            replaces++;
        }

        // Klammer
        if ((matches = re5.exec(currentNode.data)) !== null) {
            const replacement = getDesiredGender(mode, matches[1], matches[3], matches[0], "");
            replaceNode(currentNode, re5, matches, replacement);
            replaces++;
        }

        // Binnen-I
        if ((matches = re3.exec(currentNode.data)) !== null) {
            const replacement = getDesiredGender(mode, matches[1], matches[2].toLowerCase(), matches[0], (matches[3] ? matches[3] : ""));
            replaceNode(currentNode, re3, matches, replacement);
            replaces++;
        }

        // Binnen-E/R
        if ((matches = re4.exec(currentNode.data)) !== null) {
            const replacement = getDesiredGender(mode, matches[1], matches[2].toLowerCase(), matches[0], "");
            replaceNode(currentNode, re4, matches, replacement);
            replaces++;
        }

        // Artikel
        if ((matches = re6.exec(currentNode.data)) !== null && (mode == GenderMode.male || mode == GenderMode.female)) {
            let replacement = matches[2];
            replacement = (mode == GenderMode.female ? (replacement == 'der' ? 'die' : 'der') : replacement);
            replaceNode(currentNode, re6, matches, replacement);
            replaces++;
        }

        // Deppen-*
        if ((matches = re7.exec(currentNode.data)) !== null) {
            replaceNode(currentNode, re7, matches, matches[2].toLowerCase());
            replaces++;
        }

        currentNode = treeWalker.nextNode();
    }
    if (notifications) {
        chrome.runtime.sendMessage({replaces: replaces});
    }
}


/**
 * Liest die Einstellungen aus der storage und startet den Durchlauf
 */
function replace() {
    chrome.storage.local.get({
        enabled: true,
        replaceMode: 'male',
        mark: true,
        notifications: true
    }, function (items) {
        if (items.enabled) {
            mode = items.replaceMode;
            mark = items.mark;
            notifications = items.notifications;
            walk();
        }
    });
}


/**
 *  Prüft die Sprache der Seite und startet nur bei deutscher Sprache
 */
const html = document.getElementsByTagName("html");
if (html[0]) {
    const lang = html[0].getAttribute("lang");
    if (lang.includes('de')) {
        replace();
    }
    else {
        console.log("Un-Gender wird nur bei deutschsprachigen Seiten aktiv.");
    }
}