'use strict';

define(["angular"], function (angular) {
    angular.module('Diagram.services', [])
        .service('DiagramService', [
            '$rootScope',
            function ($rootScope) {
                console.log("Defining DiagramService");

                var instance = {};

                // There are lots of duplicate images used, ask for them only once
                var images = [];

                // Don't start drawing canvas until all the images are loaded
                var imagesToLoad = 0;
                var loadedImages = 0;

                var dataUrls = [];
                var imagesHashAttrName = "imageshash";

                var allCanvasDrawn = true;

                var updateAllCanvasDrawnFlag = function () {
                    if (allCanvasDrawn === true) {
                        return;
                    }

                    // Depending on the number and complexity of the diagrams the digest may have finished. As such, we want to 
                    // tell angularjs to start again as we are changing one of the items it is watching. Other times, the drawing
                    // is done before the digest finishes.
                    // TODO: Is the above comment correct or is there a better way?
                    if (!$rootScope.$$phase && !$rootScope.$root.$$phase) {
                        $rootScope.$apply(function () {
                            allCanvasDrawn = true;
                            console.log("updateAllCanvasDrawnFlag allCanvasDrawn=" + allCanvasDrawn + " " + instance.getDate());
                            //console.profileEnd("myProfile");
                        });
                    }
                };

                var enabled = false;
                instance.isEnabled = function (value) {
                    if (arguments.length > 0) {
                        enabled = value;
                        if (enabled) {
                            console.log("DiagramService enabled");
                        }
                    }
                    return enabled;
                };

                // TODO: useful for debugging
                instance.getDate = function () {
                    var date = new Date();
                    date = ("" + date).replace(/ GMT.*/, "." + date.getUTCMilliseconds());
                    return date;
                }

                // TODO: Check out overlay solution: http://jsfiddle.net/0sm284qz/3/

                // From: https://stackoverflow.com/questions/25297200/scaling-an-html5-canvas-and-div-overlay
                instance.drawImageWhenEverythingsReady = function (caller, activeState) {
                    loadedImages++;

                    if (loadedImages < imagesToLoad) {
                        return;
                    }

                    console.log(caller + "->drawImageWhenEverythingsReady=" + allCanvasDrawn + " did window ready event enable the service =" + instance.isEnabled() + " " + instance.getDate());
                    if (!instance.isEnabled()) {
                        return;
                    }

                    allCanvasDrawn = false;

                    instance.drawADiagram(activeState);

                    updateAllCanvasDrawnFlag();
                };

                instance.redrawAllStateImages = function (caller, allStates) {
                    // TODO: Is this check needed
                    var allImagesLoaded = loadedImages < imagesToLoad;
                    if (allImagesLoaded || !instance.isEnabled()) {
                        console.log(caller + "->redrawAllStateImage called. allImagesLoaded=" + allImagesLoaded + " service.isEnabled=" + instance.isEnabled());
                        return;
                    }

                    allStates.each(function () {
                        // TODO: Do we want to only draw the diagram for the state that is currently active.
                        instance.drawADiagram($(this));
                        return true;
                    });
                };

                instance.drawADiagram = function (activeState) {
                    try {
                        if (!instance.isEnabled() && activeState.hasClass("ng-hide")) {
                            return;
                        }

                        var aDiagramWrap = activeState.find(".DiagramWrap");
                        var imageDivs = aDiagramWrap.find("div[background-image],div[overlay-image]");
                        if (imageDivs.length == 0) {
                            return;
                        }

                        var imageHash = aDiagramWrap.attr(imagesHashAttrName);

                        if (imageHash === undefined) {
                            imageHash = createImageHashAttribute(aDiagramWrap);
                        }

                        if (dataUrls[imageHash] === undefined) {
                            createDiagramImage(aDiagramWrap, imageHash);
                        }

                        drawStoredDiagramImage(aDiagramWrap, imageHash);
                    } catch (err) {
                        console.log(err);
                        throw err;
                    }
                };

                // Create a hash of all the images in the diagram using src+x+y
                // Save the imageHash onto the diagramWrap as an attribute. 
                // This allows reuse of the stored image in different states
                var createImageHashAttribute = function (aDiagram) {
                    var diagramHash = "";
                    aDiagram.find("div").each(function () {
                        var divImage = $(this);

                        var x = 0;
                        var y = 0;

                        if (divImage.attr("overlay-image") !== undefined) {
                            x = divImage.attr("x");
                            y = divImage.attr("y");
                        }
                        diagramHash += ':' + divImage.attr('src') + "_x" + x + "_y" + y;
                    });

                    aDiagram.attr(imagesHashAttrName, diagramHash);

                    return diagramHash;
                };

                var createDiagramImage = function (diagramWrap, imageHash) {
                    var maxWidth = 0;
                    var maxHeight = 0;

                    diagramWrap.find("div").each(function () {
                        var divImage = $(this);
                        var imageHolder = images[divImage.attr("src")];
                        maxWidth = Math.max(maxWidth, imageHolder.img.width);
                        maxHeight = Math.max(maxHeight, imageHolder.img.height);
                    });

                    var hiddenCanvas = $(document.createElement('canvas'));
                    hiddenCanvas.addClass("primarydiagram");
                    hiddenCanvas[0].width = maxWidth;
                    hiddenCanvas[0].height = maxHeight;

                    var hiddenContext = hiddenCanvas[0].getContext("2d");

                    diagramWrap.find("div").each(function () {
                        var divImage = $(this);

                        var x = 0;
                        var y = 0;

                        if (divImage.attr("overlay-image") !== undefined) {
                            x = divImage.attr("x");
                            y = divImage.attr("y");
                        }

                        // write each image onto the hidden canvas
                        var imageHolder = images[divImage.attr("src")];
                        hiddenContext.drawImage(imageHolder.img, x, y);
                        console.log("draw hidden image src=" + imageHolder.img.src
                            + " width=" + imageHolder.img.width + " height=" + imageHolder.img.height
                            + " hiddenCanvas.width()=" + hiddenCanvas.width() + " hiddenCanvas.height()=" + hiddenCanvas.height()
                            + " hiddenCanvas[0].width=" + hiddenCanvas[0].width + " hiddenCanvas[0].height=" + hiddenCanvas[0].height);
                    });

                    var imageBlob = {
                        canvas: hiddenCanvas[0],
                        width: maxWidth,
                        height: maxHeight,
                        imageHash: imageHash
                    };

                    dataUrls[imageHash] = imageBlob;

                }

                var drawStoredDiagramImage = function (aDiagramWrap, imageHash) {
                    var imageBlob = dataUrls[imageHash];
                    var currentCanvas = aDiagramWrap.find("canvas");

                    drawImageOnContext("current", currentCanvas, imageBlob, aDiagramWrap);
                };

                var drawImageOnContext = function (canvasType, theCanvas, theImageBlob, theDiagramWrap) {
                    var theContext = theCanvas[0].getContext("2d");

                    // Clear the rectangle as the size can change when window is first loaded or on window resize
                    theContext.clearRect(0, 0, theCanvas.width(), theCanvas.height());

                    var sWidth = theImageBlob.width;
                    var sHeight = theImageBlob.height;

                    // Firefox doesn't like fractions for width and height
                    var dWidth = Math.floor(theImageBlob.width);
                    var dHeight = Math.floor(theImageBlob.height);

                    var windowWidth = $(window).width();
                    var windowHeight = $(window).height();
                    var approxDiagramWidth = Math.floor(windowWidth / 2 * .8);
                    var approxDiagramHeight = Math.floor(windowHeight * .85);
                    dWidth = Math.min(dWidth, approxDiagramWidth);
                    dHeight = Math.min(dHeight, approxDiagramHeight);

                    // If the canvas is the default size we want to reset it to the correct size, otherwise we want to resize the image canvas
                    if (theCanvas[0].width == 300 && theCanvas[0].height == 150) {
                        // Setting the $(element).width(newSize) sets the css width. To get the sizing to work you need to set the canvas.width property
                        // https://stackoverflow.com/questions/10433046/creating-a-canvas-element-and-setting-its-width-and-height-attributes-using-jque
                        theCanvas[0].width = dWidth;
                        theCanvas[0].height = dHeight;
                    } else {
                        dWidth = Math.floor(theDiagramWrap.width());
                        dHeight = Math.floor(theDiagramWrap.height());
                    }

                    var hRatio = dWidth / sWidth;
                    var vRatio = dHeight / sHeight;
                    var ratio = Math.min(hRatio, vRatio);

                    var dWidthScaled = Math.floor(sWidth * ratio);
                    var dHeightScaled = Math.floor(sHeight * ratio);

                    console.log(canvasType
                        + " image src=" + theImageBlob.imageHash
                        + " ratio=" + ratio + " hRatio=" + hRatio + " vRatio=" + vRatio
                        + " sWidth=" + sWidth + " sHeight=" + sHeight
                        + " dWidth=" + dWidth + " dHeight=" + dHeight
                        + " diagramWrapWidth=" + theDiagramWrap.width() + " diagramWrapHeight=" + theDiagramWrap.height()
                        + " approxDiagramWidth=" + approxDiagramWidth + " approxDiagramHeight=" + approxDiagramHeight
                        + " dWidthScaled=" + dWidthScaled + " dHeightScaled=" + dHeightScaled);

                    if (ratio >= 1) {
                        //console.log(canvasType + " No scale the image is <= than the destination canvas");
                        theContext.drawImage(theImageBlob.canvas, 0, 0);
                    } else {
                        //console.log(canvasType + " Scale the image because it won't fit");
                        theContext.drawImage(theImageBlob.canvas, 0, 0, sWidth, sHeight, 0, 0, dWidthScaled, dHeightScaled);
                    }
                }

                instance.loadImage = function (element, imageSrc, onLoadFunc) {
                    // console.log("loadImage called " + instance.getDate());
                    // Don't ask the browser to load the same image. Could let the browser cache handle this.
                    if (images[imageSrc] !== undefined) {
                        return;
                    }

                    var imageHolder = {};

                    var img = new Image();
                    img.addEventListener("load", function () {
                        onLoadFunc();
                    }, false);
                    img.src = imageSrc;

                    imageHolder.img = img;

                    // TODO: Once the design settles down, find a better place to store this? 
                    $(element).prop("imageHolder", imageHolder);

                    images[imageSrc] = imageHolder;
                    imagesToLoad++;
                };

                instance.areAllCanvasDrawn = function () {
                    return allCanvasDrawn;
                };

                return instance;
            }
        ]);
});