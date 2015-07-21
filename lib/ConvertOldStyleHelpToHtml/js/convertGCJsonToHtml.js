'use strict';

// TODO: Refactor this code so that is modular, possibly AMD, non-polluted global namespace, even angular. For now it works.
var gcJson;
var gcTitle;
var gcSubTitle;
var gcHtml = "";
var indent = "";
var isArticle = false;

function resetGlobals() {
    gcJson = null;
    gcTitle = null;
    gcSubTitle = null;
    gcHtml = "";
    indent = "";
    isArticle = false;
}

// Convert file when run from the command line
//
// Kudos: http://javascript.cs.lmu.edu/notes/commandlinejs/
// Install node.js
// Install jquery: npm install jquery
// $ node.js convertGCJsonToHtml.js GuidedHelp/Modem-Motorola-SBG6580-Hopper913/GuidedContentUnit.json
if (typeof process !== "undefined" && process.argv !== undefined) {
    console.log("process.argv=" + process.argv[2]);

    var jq = require('jquery');
    //var jsdom = require('jsdom');
    var fs = require('fs');

    if (process.argv.length !== 3) {
        console.error('Exactly one argument required');
        process.exit(1);
    }

    var input = process.argv[2];
    var output = input.replace(".json", ".html").replace(".xml", ".html");
    console.log(output);

    fs.readFile(input, 'utf-8', function (err, text) {
        if (err) throw err;

        var htmlText = parseFileContents(text);

        fs.writeFile(output, htmlText, function (err1) {
            if (err1) throw err1;
        });
    });
}

// Convert files entry point when a user browses to a web page
function handleFiles(files) {
    try {
        for (var i = 0, f; f = files[i]; i++) {

            var reader = new FileReader();

            reader.onload = (function () {
                return function (event) {
                    $('#convertedHelp').empty();

                    resetGlobals();

                    var fileContents = event.target.result;
                    var htmlResults = parseFileContents(fileContents);
                    console.log(htmlResults);

                    // Format the results for a new window
                    htmlResults = "<pre><xmp>" + htmlResults + "</xmp></pre>";
                    $('#convertedHelp').append(htmlResults);

                    // TODO: Remove once articles are parsed correctly

                    return;
                    var wnd = window.open("", "_blank");
                    htmlResults = "<!DOCTYPE html><html><head><title>" + gcTitle + "</title></head><body>" + htmlResults + "</body></html>";
                    wnd.document.write(htmlResults);
                };
            })(f);

            reader.readAsText(f);
        }
    } catch (err) {
        console.log(err);
    }
}

function parseFileContents(fileContents) {
    isArticle = true;

    if (fileContents.contains("DecisionTree")) {
        isArticle = false;
        var jsonObj = JSON.parse(fileContents);
        return convertGCJsonToHtml(jsonObj);
    }

    return convertArticleToHtml(fileContents);
}

function convertGCJsonToHtml(data) {
    gcJson = data;

    try {
        var introState = gcJson.DecisionTree.Settings.StartState.Link;

        gcTitle = gcJson.DecisionTree.Key;
        gcTitle = gcTitle.replace(/-/g, " ");

        addHeaderElement(gcTitle);
        startBodyElement(introState);
        createStates();

        wrapUp();

        return gcHtml;
    } catch (err) {
        console.log(err);
        return err;
    }
}

function addIndent() {
    indent += "    ";
}

function removeIndent() {
    indent = indent.replace("    ", "");
}

function addLine(line) {
    if (line === undefined) {
        line = '';
    }

    gcHtml += indent + line + "\n";
}

function addHeaderElement(title) {
    addLine("<!DOCTYPE html>");
    addLine('<html lang="en">');
    addLine('<head>');
    addIndent();
    addHeaders();

    addLine('<title>' + title + '</title>');

    removeIndent();
    addLine('</head>');
}

function startBodyElement(introState) {
    var isArticleClause = "";
    if (arguments.length > 1) {
        isArticleClause = "; isArticle=true";
    }

    // data-ng-init="introState='IntroductionState'; isArticle=true" ng-cloak>
    addLine('<body ng-controller="GuidedHelpController" data-ng-init="introState=\'' + introState + '\'' + isArticleClause + '" ng-cloak>');
    addIndent();
    addLine('<img id="spinner_img" src="../CommonResources/spinner.png" ng-hide="areDiagramsReady()"/>');
    addLine();
}

function addHeaders() {
    addLine('<script data-main="/GuidedHelp/js/guidedHelp_app.js" src="/lib/ThirdParty/require-2.1.15.js"></script>');

    // No need for cache control since we aren't storing anything sensitive
    // addLine('<meta content="NO-CACHE" http-equiv="CACHE-CONTROL" />');

    addLine();
}

function createStatesDiv() {
    addLine('<div id="States" ng-show="areDiagramsReady()">');
    addIndent();
}

function createStates() {
    createStatesDiv();

    var states = gcJson.DecisionTree.States.State;
    addExitState();

    $.each(states, function (index, state) {
        createAState(index, state);
    });

    addCloseDiv(); // States div
}

function createAState(index, aState) {
    addStateDiv(aState.Key);

    addQuestion(aState.Question);

    addCloseOfTextWrap();

    createDiagram(aState.DiagramReplace[1].ReplaceWith);

    addCloseDiv(); // TextAndDiagram

    createButtons(aState.Answers.Answer, index);

    addCloseDiv(); // Individual State
}

function addExitState() {
    var exitState = {
        "Key": "Exit",
        "DiagramReplace": [
            {
                "ReplaceWith": "Ignored"
            },
            {
                "ReplaceWith": "ExitDiagram"
            }
        ],
        "Question": "You are finished. Please close the window/tab.",
        "Answers": {
            "Answer": []
        }
    };
    gcJson.DecisionTree.States.State.push(exitState);

    var exitDiagram = {
        "Key": "ExitDiagram",
        "Location": "Primary",
        "Background": {
            "ImageReplace": {
                "ReplaceWith": "ExitImage"
            }
        },
        "Overlays": null
    };

    gcJson.Diagrams.Diagram.push(exitDiagram);

    var exitImage = {
        "Key": "ExitImage",
        "Source": "../CommonResources/smiley-face.png"
    };

    gcJson.Resources.Images.Image.push(exitImage);
}

function addStateDiv(stateName) {
    addLine('<div id="' + stateName + '" show-state="currentState" class="StateWrapper">');
    addIndent();
    addLine('<div class="TextAndDiagram">');
    addIndent();
    addLine('<div class="TextWrap">');
    addIndent();
}

function addQuestion(question) {
    question = question.replace(/br;/g, "<br />");
    addLine('<div class="Text">');
    addIndent();
    addLine(question);
    addCloseDiv();
}

function addCloseOfTextWrap() {
    addCloseDiv(); // TextWrap
}

function addEndOfTextAndDiagram() {
    addCloseDiv(); // TextAndDiagram
}

function addDiagramWrap() {
    addLine('<div diagram-wrap>');
    addIndent();
}

function createDiagram(diagramNameOrImageSrc, imageText) {
    addDiagramWrap();

    if (isArticle) {
        addBackgroundImage(diagramNameOrImageSrc);
        if (imageText) {
            addLine('<p>' + imageText + '</p>');
        }
    } else {
        var diagram = findDiagram(diagramNameOrImageSrc);

        addGCBackgroundImage(diagram);

        addOverlays(diagram);
    }

    addCloseDiv(); // DiagramWrap
}

function findDiagram(diagramName) {
    var diagram = null;
    $.each(gcJson.Diagrams.Diagram, function (index, value) {
        var continueLoop = true;
        if (value.Key == diagramName) {
            diagram = value;
            continueLoop = false;
        }
        return continueLoop;
    });

    return diagram;
}

function addBackgroundImage(src) {
    if (src != null) {
        addLine('<div background-image src="' + src + '"></div>');
    }
}

function addGCBackgroundImage(diagram) {
    var resourceKey = diagram.Background.ImageReplace.ReplaceWith;

    var src = findImage(resourceKey);

    addBackgroundImage(src);
}

function findImage(resourceKey) {
    var src = null;
    $.each(gcJson.Resources.Images.Image, function (index, value) {
        var continueLoop = true;
        if (value.Key == resourceKey) {
            src = value.Source.replace("Images", "../image");
            continueLoop = false;
        }
        return continueLoop;
    });

    return src;
}

function findPosition(positionKey) {
    var position = null;
    $.each(gcJson.Positions.Position, function (index, value) {
        var continueLoop = true;
        if (value.Key == positionKey) {
            position = {
                X: value.X,
                Y: value.Y
            }
            continueLoop = false;
        }
        return continueLoop;
    });

    return position;
}

function addOverlays(diagram) {
    if (typeof diagram.Overlays === 'undefined' || diagram.Overlays === null) {
        return;
    }

    var overlay = diagram.Overlays.Overlay;
    if (!$.isArray(overlay)) {
        overlay = [];
        overlay.push(diagram.Overlays.Overlay);
    }

    $.each(overlay, function (index, value) {
        var src = findImage(value.ImageReplace.ReplaceWith);
        var position = findPosition(value.PositionReplace.ReplaceWith);
        addLine('<div overlay-image src="' + src + '" x="' + position.X + '" y="' + position.Y + '"></div>');
    });
}

function addHelpViewerallControls() {
    addLine('<div class="helpviewerallcontrols">');
    addIndent();
}

function addButtonsCloseDivs() {
    addCloseDiv(); // Close HelpViewerallControls
    addCloseDiv(); // Close TextAndDiagram    
}

function addAnchorButton(method, value, text) {
    addLine('<a ng-click="' + method + '(\'' + value + '\')" class="ButtonStyle">' + text + '</a>');
}

function createButtons(answers, index) {
    addHelpViewerallControls();

    // Handle case where there is only on answer
    var answerArray = answers;
    if (!$.isArray(answers)) {
        answerArray = [];
        answerArray.push(answers);
    }

    $.each(answerArray, function (idx, answer) {
        var value = null;
        var method = null;
        switch (answer.Action) {
            case "GoToState":
                method = "goToState";
                value = answer.Link;
                break;
            case "Exit":
                method = "goToState";
                value = "Exit"; // Some Answer.Exit don't have a Command
                break;
            case "ExecuteCommand":
                method = "executeCommand";
                value = answer.Command;
                break;
            default:
                alert("Update createButtons to handle Action " + JSON.stringify(answer.Action));
                break;
        }

        addAnchorButton(method, value, answer.text);
    });

    if (index > 0) {
        addLine('<a ng-click="goToState(\'previousState\')" class="ButtonStyle FloatRight">Back</a>');
    }

    addCloseDiv(); // HelperViewerAllControls
}

function addCloseDiv() {
    removeIndent();
    addLine("</div>");
}

function wrapUp() {
    removeIndent();
    addLine('</body>');
    addLine('</html>');
}

