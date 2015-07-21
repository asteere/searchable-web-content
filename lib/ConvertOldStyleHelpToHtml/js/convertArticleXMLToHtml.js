'use strict';

// TODO: Is it worth converting this utility to angularjs? Currently, no.

var $solution = null;
var $solutionChildren = null;
var $child = null;
var text = null;
var introState = "IntroductionState";

function parseParagraphs(xml) {

    var paragraphs = [];
    $(xml).children('paragraph').each(function () {
        paragraphs.push($(this).text());
    });
    return paragraphs;
}

// Lifted from Android parsing code with the warnings removed
function parseArticle(articleXmlString) {
    var article = {};
    var $article = $(articleXmlString);

    article['title'] = $($article.children('title')[0]).text();
    article['subtitle'] = $($article.children('subtitle')[0]).text();

    var $intro = $($article.children('intro')[0]);
    var $introChildren = $intro.children();
    article.intro = [];
    $.each($introChildren, function (count, child) {
        $child = $(child);

        if ($child.is('paragraph')) {
            var paragraph = {};
            paragraph['type'] = 'paragraph';
            paragraph['text'] = $child.text();
            article.intro.push(paragraph);
        }

        if ($child.is('bullet')) {
            var bullet = {}
            bullet['type'] = 'bullet';
            bullet['text'] = $child.text();
            article.intro.push(bullet);
        }
    });

    $solution = $($article.children('solution')[0]);

    $solutionChildren = $solution.children();
    article.solution = [];
    $.each($solutionChildren, function (count, child) {
        $child = $(child);

        if ($child.is('paragraph')) {
            var paragraph = {};
            paragraph['type'] = 'paragraph';
            paragraph['text'] = $child.text();
            article.solution.push(paragraph);
        }

        if ($child.is('link') || $child.is('articlelink') || $child.is('download')) {
            var link = {};
            link['type'] = 'link';
            link['uri'] = $child.attr('uri');
            text = $child.text();
            if (text.length == 0) {
                try {
                    if (null != $child.context.nextSibling) {
                        if (null != $child.context.nextSibling.data) {
                            text = $child.context.nextSibling.data;
                        }
                    }
                }
                catch (e) {
                    console.log(err);
                }
            }
            link['text'] = text;
            article.solution.push(link);
        }

        if ($child.is('externalimage')) {
            var externalimage = {};
            externalimage['type'] = 'externalimage';
            externalimage['uri'] = $child.attr('uri');
            text = $child.text();
            if (text.length == 0) {
                try {
                    if (null != $child.context.nextSibling) {
                        if (null != $child.context.nextSibling.data) {
                            text = $child.context.nextSibling.data;
                        }
                    }
                }
                catch (e) {
                    console.log(err);
                }
            }
            if (!text && text.length != 0) {
                externalimage['text'] = text;
            }
            article.solution.push(externalimage);
        }

        if ($child.is('externalvideo')) {
            var externalvideo = {};
            externalvideo['type'] = 'externalvideo';

            var olduri = $child.attr('uri');
            var uri;
            if (-1 != olduri.search("youtube")) {
                uri = olduri.replace("watch?v=", "embed/");
            }
            else if (-1 != olduri.search("//vimeo")) {
                uri = olduri.replace("vimeo.com", "player.vimeo.com/video");
            }
            else {
                uri = olduri;
            }
            externalvideo['uri'] = uri;
            text = $child.text();
            if (text.length == 0) {
                try {
                    if (null != $child.context.nextSibling) {
                        if (null != $child.context.nextSibling.data) {
                            text = $child.context.nextSibling.data;
                        }
                    }
                }
                catch (e) {
                    console.log(err);
                }
            }
            if (!(typeof text === 'undefined') && text.length != 0) {
                externalvideo['text'] = text;
            }
            article.solution.push(externalvideo);
        }

        if ($child.is('video')) {
            var video = {};
            video['type'] = 'video';
            video['uri'] = $child.attr('uri');
            text = $child.text();
            if (text.length == 0) {
                try {
                    if (null != $child.context.nextSibling) {
                        if (null != $child.context.nextSibling.data) {
                            text = $child.context.nextSibling.data;
                        }
                    }
                }
                catch (e) {
                    console.log(err);
                }
            }
            if (!(typeof text === 'undefined') && text.length != 0) {
                video['text'] = text;
            }
            article.solution.push(video);
        }

        if ($child.is('step')) {
            var step = [];
            step['type'] = 'step';
            var $stepchildren = $child.children();
            $.each($stepchildren, function (count1, child1) {
                var $subchild = $(child1);

                if ($subchild.is('paragraph')) {
                    paragraph = {}
                    paragraph['type'] = 'paragraph';
                    paragraph['text'] = $subchild.text();
                    step.push(paragraph);
                }

                if ($subchild.is('stepsubtext')) {
                    var subtext = {}
                    subtext['type'] = 'subtext';
                    subtext['text'] = $subchild.text();
                    step.push(subtext);
                }
            });
            article.solution.push(step);
        }

        if ($child.is('image') || $child.is('img')) {
            var image = {};
            image['type'] = 'image';
            image['uri'] = $child.attr('uri');
            text = $child.text();
            if (text.length == 0) {
                try {
                    if (null != $child.context.nextSibling) {
                        if (null != $child.context.nextSibling.data) {
                            text = $child.context.nextSibling.data;
                        }
                    }
                }
                catch (e) {
                    console.log(err);
                }
            }
            if (!(typeof text === 'undefined') && text.length != 0) {
                image['text'] = text;
            }
            article.solution.push(image);
        }

        if ($child.is('bullet')) {
            var bullet = {};
            bullet['type'] = 'bullet';
            bullet['text'] = $child.text();
            article.solution.push(bullet);
        }

        if ($child.is('warning')) {
            var warning = {};
            warning['type'] = 'warning';
            warning['text'] = $child.text();
            article.solution.push(warning);
        }

        if ($child.is('warningblock')) {

            var warningblock = [];
            warningblock['type'] = 'warningblock';
            var $warningblockchildren = $child.children();

            $.each($warningblockchildren, function (count1, child1) {
                var $subchild = $(child1);

                if ($subchild.is('paragraph')) {
                    paragraph = {}
                    paragraph['type'] = 'paragraph';
                    paragraph['text'] = $subchild.text();
                    warningblock.push(paragraph);
                }

                if ($subchild.is('bullet')) {
                    bullet = {}
                    bullet['type'] = 'bullet';
                    bullet['text'] = $subchild.text();
                    warningblock.push(bullet);
                }

                if ($subchild.is('bulletlink')) {
                    bulletlink = {}
                    bulletlink['type'] = 'bulletlink';
                    bulletlink['text'] = $subchild.text();
                    if ($subchild.length > 0) {
                        bulletlink['bulletlinkuri'] = $subchild.attr('uri');
                        text = $subchild.text();
                        if (text.length == 0) {
                            try {
                                if (null != $subchild.context.nextSibling) {
                                    if (null != $subchild.context.nextSibling.data) {
                                        text = $subchild.context.nextSibling.data;
                                    }
                                }
                            }
                            catch (err) {
                                console.log(err);
                            }
                        }
                        if (!(typeof text === 'undefined') && text.length != 0) {
                            bulletlink['bulletlinktext'] = text;
                        }
                    }
                    warningblock.push(bulletlink);
                }

                if ($subchild.is('articlelink')) {
                    var articlelink = {}
                    articlelink['type'] = 'articlelink';
                    articlelink['text'] = $subchild.text();
                    if ($subchild.length > 0) {
                        articlelink['articlelinkuri'] = $subchild.attr('uri');
                        text = $subchild.text();
                        if (text.length == 0) {
                            try {
                                if (null != $subchild.context.nextSibling) {
                                    if (null != $subchild.context.nextSibling.data) {
                                        text = $subchild.context.nextSibling.data;
                                    }
                                }
                            }
                            catch (err) {
                                console.log(err);
                            }
                        }
                        if (!(typeof text === 'undefined') && text.length != 0) {
                            articlelink['articlelinktext'] = text;
                        }
                    }
                    warningblock.push(articlelink);
                }

            });

            article.solution.push(warningblock);
        }

        if ($child.is('bulletlink')) {
            var bulletlink = {}
            bulletlink['type'] = 'bulletlink';
            bulletlink['uri'] = $child.attr('uri');
            text = $child.text();
            if (text.length == 0) {
                try {
                    if (null != $child.context.nextSibling) {
                        if (null != $child.context.nextSibling.data) {
                            text = $child.context.nextSibling.data;
                        }
                    }
                }
                catch (e) {
                    console.log(err);
                }
            }
            if (!(typeof text === 'undefined') && text.length != 0) {
                bulletlink['text'] = text;
            }
            article.solution.push(bulletlink);
        }
    });

    var $completion = $($article.children('completion')[0]);
    var $completionChildren = $completion.children();
    article.completion = [];
    $.each($completionChildren, function (count, child) {
        var $child = $(child);

        if ($child.is('paragraph')) {
            var paragraph = {}
            paragraph['type'] = 'paragraph';
            paragraph['text'] = $child.text();
            article.completion.push(paragraph);
        }

        if ($child.is('bullet')) {
            var bullet = {}
            bullet['type'] = 'bullet';
            bullet['text'] = $child.text();
            article.completion.push(bullet);
        }

        if ($child.is('bulletlink')) {
            var bulletlink = {}
            bulletlink['type'] = 'bulletlink';
            bulletlink['text'] = $child.text();
            if ($child.length > 0) {
                bulletlink['bulletlinkuri'] = $child.attr('uri');
                text = $child.text();
                if (text.length == 0) {
                    try {
                        if (null != $child.context.nextSibling) {
                            if (null != $child.context.nextSibling.data) {
                                text = $child.context.nextSibling.data;
                            }
                        }
                    }
                    catch (e) {
                        console.log(err);
                    }
                }
                if (!(typeof text === 'undefined') && text.length != 0) {
                    bulletlink['bulletlinktext'] = text;
                }
            }
            article.completion.push(bulletlink);
        }
    });

    var $seeAlso = $($article.children('seealso')[0]);
    var $seeAlsoChildren = $seeAlso.children();
    article.seeAlso = [];
    $.each($seeAlsoChildren, function (count, child) {
        $child = $(child);

        if ($child.is('paragraph')) {
            var paragraph = {}
            paragraph['type'] = 'paragraph';
            paragraph['text'] = $child.text();
            article.seeAlso.push(paragraph);
        }

        if ($child.is('articlelink')) {
            var articlelink = {}
            articlelink['type'] = 'articlelink';
            articlelink['uri'] = $child.attr("uri");
            articlelink['text'] = $child.text();
            article.seeAlso.push(articlelink);
        }
    });

    return article;
}

function insertParagraphs($node, array) {
    var textToInsert = '';
    $.each(array, function (count, text) {
        textToInsert += '<p>' + text + '</p>';
    });
    $node.append(textToInsert);
};

function convertArticleToHtml(articleXmlString) {
    try {
        var article = parseArticle($(articleXmlString));
        if (!article) throw new Error("No article intermediate object created");

        // TODO: Hack: figure out a better way to set the gcTitle
        gcTitle = article.title;
        gcSubTitle = article.subtitle;
        addHeaderElement(article.title);

        startBodyElement(introState, true /* this is an article */);

        createArticleStates(article);

        wrapUp();

        return gcHtml;
    } catch (err) {
        console.log(err);
        return err;
    }
}

function convertIntroAndAddAsState(article, index) {
    if (article.intro) {
        var imageSrc = null;
        var questionHtml = "";

        $.each(article.intro, function (count, part) {
            if (questionHtml !== "") {
                questionHtml += "\n";
            }
            var responseBlob = processPart(part, index, article);
            questionHtml += responseBlob.questionHtml;

            var imageUri = article.solution[0].uri;
            if (imageUri !== undefined) {
                imageSrc = imageUri;
            }

        });

        createArticleState(article, index, introState, questionHtml, imageSrc);
    }
}

function processPart(part, index, article) {
    var $vidtext = null;
    var $vid = null;

    var responseBlob = {
        questionHtml: "",
        skipNextStep: false
    };


    if (!part || !part.type) {
        alert("index=" + index + " bad part " + part);
        return responseBlob;
    }

    switch (part.type) {
        case "paragraph":
            responseBlob.questionHtml = part.text;
            break;

        case "bullet":
            responseBlob.questionHtml += '<ul><li>' + part.text + '</li></ul>';
            break;

        case "link":
            responseBlob.questionHtml += "<li><a href='" + part.uri + "'>" + part.text + "</a></li>";
            break;

        case "step":
            $.each(part, function (count1, subpart) {
                if (responseBlob.questionHtml !== "") {
                    responseBlob.questionHtml += "\n";
                }
                var blob = processPart(subpart, index, article);
                responseBlob.questionHtml += blob.questionHtml;

            });
            break;

            // subtext can only be part of a Step but for code simplicity handle it here
        case "subtext":
            responseBlob.questionHtml += "<br />" + part.text;
            break;

        case "externalvideo":
            responseBlob.questionHtml += $('<div></div>');
            $vidtext = $('<p></p>').addClass('imagetext');
            $vid = $('<iframe></iframe>').attr({ src: part.uri, controls: "true", webkitallowfullscreen: "true", mozallowfullscreen: "true", allowfullscreen: "true" }).addClass('video');
            $vid.append("Your browser does not support HTML5 video.");
            if (part.text) {
                $vidtext.append(part.text);
            }
            break;

        case "video":
            responseBlob.questionHtml += $('<div></div>');
            $vidtext = $('<p></p>').addClass('imagetext');
            $vid = $('<video></video>').attr({ src: part.uri, controls: "true" }).addClass('video');
            //var $vidsource = $('<source></source>').attr({src: "part.uri", type:"video/mp4"});
            $vid.append("Your browser does not support HTML5 video.");
            $vidtext.append($vid);
            if (part.text) {
                $vidtext.append(part.text);
            }
            break;

        case "warning":
            var $warning = $('<div></div>').addClass('warningblock');
            var $warningblockText = $('<div></div>').addClass('text').html('<p>' + part.text + '</p>');
            var $symbol = $('<div></div>').addClass('symbol').text('!');
            break;

        case "warningblock":
            responseBlob.questionHtml += '<div class="warningblock">';
            responseBlob.questionHtml += '<div class="symbol">' + '!' + '</div>';

            $.each(part, function (count1, subpart) {
                responseBlob.questionHtml += processPart(subpart, index, article).questionHtml;
            });
            responseBlob.questionHtml += $('</div>');
            break;

        case "bulletlink":
            responseBlob.questionHtml += $('<div class="bulletlink">');
            responseBlob.questionHtml += $('<ul><li><a href="' + part.bulletlinkuri + '>' + part.bulletlinktext + '</a></li></ul>');
            responseBlob.questionHtml += $('</div>');
            break;

        case "articlelink":
            responseBlob.questionHtml += $('<div class="link">');
            responseBlob.questionHtml += $('<li><a href="' + part.articlelinkuri + '>' + part.articlelinktext + '</a></li>');
            responseBlob.questionHtml += $('</div>');
            break;

            // TODO: process the elements of a warning block
        case "bulletlinkTODO":
            responseBlob.questionHtml += $('<div class="bullet">');
            responseBlob.questionHtml += $('<li><a href="' + part.uri + '>' + part.text + '</a></li>');
            responseBlob.questionHtml += $('</div>');
            break;

        default:
            // TODO: While still in R&D make this an alert. Change to console.log when iff goes to QA.
            alert("index=" + index + " Unhandled: " + JSON.stringify(part));
    }

    // If next element in solution is an image add it to 
    // TODO: Should video be handled the same way?
    var nextStep = article.solution[index + 1];
    if (nextStep && (nextStep.type == "image" || nextStep.type == "externalimage")) {
        responseBlob.imageSrc = nextStep.uri;
        if (nextStep.text) {
            responseBlob.imageText = nextStep.text.replace("\n", "");
        }
        responseBlob.skipNextStep = true;
    }

    return responseBlob;
}

function createArticleState(article, index, stateId, questionHtml, imageSrc, imageText) {
    addStateDiv(stateId);

    addQuestion(questionHtml);

    addCloseOfTextWrap();

    // TODO: Enhance to allow images and video to be pulled from different websites
    // One attempt is in shelfset from 12/30 6:40pm by Andy
    // When running locally and pulling images from www.socsuite.com getting error
    // toDataUrl SecurityError: The operation is insecure.
    // Something to do with the same-origin policy
    // https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy
    if (imageSrc != null) {
        imageSrc = ".." + imageSrc;
    }
    createDiagram(imageSrc, imageText);

    addCloseDiv(); // TextAndDiagram

    createArticleButtons(index, article);

    addCloseDiv(); // Individual State
}

function createArticleButtons(index, article) {
    addHelpViewerallControls();

    
    if (index != 0) {
        // Look for the previous step, if it isn't there use the Intro.Paragraph.text
        var previousState = null;
        var i;
        for (i = index - 1; i > 0; i--) {
            var previousStateElement = article.solution[i];
            if ($.isArray(previousStateElement)) {
                previousStateElement = previousStateElement[0];
            }
            if (previousStateElement && previousStateElement.type == "paragraph") {
                previousState = createStateName(previousStateElement.text);
                break;
            }
        }
        if (i <= 0) {
            previousState = introState;
        }
        addAnchorButton("goToState", previousState, 'Previous');
    }
    // Look for the next step element if it isn't there then use the Completion.paragraph.text
    var numSolutionSteps = article.solution.length;
    if (index < (numSolutionSteps - 1)) {
        var nextState = null;
        var j;
        for (j = index + 1; j < numSolutionSteps; j++) {
            var nextStateElement = article.solution[j];
            if ($.isArray(nextStateElement)) {
                nextStateElement = nextStateElement[0];
            }
            if (nextStateElement && nextStateElement.type == "paragraph") {
                nextState = createStateName(nextStateElement.text);
                break;
            }
            // If we are on the last step, find Completion tag
            if (j == numSolutionSteps - 1) {
                if (article.completion) {
                    var responseBlob;
                    var questionHtml = "";
                    $.each(article.completion, function (count, part) {
                        responseBlob = processPart(part, index, article);
                        questionHtml += responseBlob.questionHtml;
                    });
                    nextState = createStateName(questionHtml);
                }
            }
        }
        addAnchorButton("goToState", nextState, 'Next');
    }

    addCloseDiv(); // HelperViewerAllControls
}

function createStateName(seed) {
    var numKeywords = 5;
    var cleanSeed = seed.replace("\"", "").replace(",", "").replace(".", "");
    var seedArray = cleanSeed.split(" ", numKeywords);
    var stateName = "";
    $.each(seedArray, function (index, value) {
        stateName += value.replace("\"", "");
    });

    return stateName;
}

function createArticleStates(article) {
    createStatesDiv();

    var questionHtml = "";
    var stateId;
    var imageSrc;
    var responseBlob;
    var index = 0;

    convertIntroAndAddAsState(article, index);

    for (++index; index < article.solution.length; index++) {
        var part = article.solution[index];
        if ($.isArray(part)) {
            part = part[0];
        }

        responseBlob = processPart(part, index, article);
        questionHtml += responseBlob.questionHtml;
        stateId = createStateName(responseBlob.questionHtml);
        createArticleState(article, index, stateId, responseBlob.questionHtml, responseBlob.imageSrc, responseBlob.imageText);

        // If the item following a step is an image of some type skip it
        if (responseBlob.skipNextStep) {
            index++;
        }
    };

    imageSrc = null;
    questionHtml = "";

    if (article.completion) {
        $.each(article.completion, function (count, part) {
            responseBlob = processPart(part, index, article);
            questionHtml += responseBlob.questionHtml;
        });
        stateId = createStateName(questionHtml);
        createArticleState(article, index, stateId, questionHtml, imageSrc);
        index++;
    }

    questionHtml = "";
    imageSrc = null;
    if (article.seeAlso && article.seeAlso.length) {
        $.each(article.seeAlso, function (count, part) {
            responseBlob = processPart(part, index, article);
            questionHtml += responseBlob.questionHtml;
        });
        stateId = createStateName(questionHtml);
        createArticleState(article, index, stateId, questionHtml, imageSrc);
        index++;
    }

    addCloseDiv(); // States div
}
