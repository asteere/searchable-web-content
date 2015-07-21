'use strict';

define(["angular", 'morePopup_services', 'guidedHelp_services', 'executeCommand_services', 'diagram_services'], function (angular) {
    angular.module('GuidedHelpApp.controllers', [])
        .controller('GuidedHelpController', [
            '$scope', '$location', 'MorePopupService', 'ProgressBarService', 'ExecuteCommandService', 'DiagramService',
            function ($scope, $location, morePopupService, progressBarService, executeCommandService, diagramService) {
                // Uncomment to turn on firebug profiler
                // console.profile("myProfile");

                console.log("guidedHelp_controllers created " + diagramService.getDate());

                $scope.currentState = $scope.introState;

                $scope.allStates = $('div[show-state]');

                // TODO: Is the angularjs way of doing things? Directive seems overkill. 
                $scope.isArticle = false;

                // TODO: Refactor this to a service or more angular manner
                $scope.scroll = "Scroll";
                $scope.guided = "Guided";
                $scope.isScrollingCss = $scope.guided;

                $scope.windowEventFired = false;

                $scope.getActiveState = function () {
                    var activeStateId = $location.path().replace(/\//, "");
                    var activeState = $('#States').find("#" + activeStateId);
                    return activeState;
                }

                angular.element(document).ready(function () {
                    $scope.windowEventFired = true;
                    diagramService.isEnabled(true);
                    diagramService.drawImageWhenEverythingsReady("Window.ready", $scope.getActiveState());
                    
                    // console.log("Window ready function called");

                    // Don't adjust the canvas on document ready as the images are most likely not loaded
                    $(window).resize(function () {
                        diagramService.redrawAllStateImages("Window.resize", $scope.allStates);
                    });
                });

                $scope.isScrolling = function () {
                    return $scope.isScrollingCss === $scope.scroll ? true : false;
                };

                $scope.toggleScrolling = function () {
                    $scope.isScrollingCss = $scope.isScrollingCss === $scope.guided ? $scope.scroll : $scope.guided;

                    $scope.toggleScrollingWorker();
                };

                $scope.goToStart = function () {
                    $scope.goToState($scope.introState);
                };

                $scope.getNetworkMap = function () {
                    $scope.executeCommand("NetworkMap/exes/networkMap_setup.exe");
                    $scope.executeCommand("NetworkMap/html/NetworkMap.html");
                };

                $scope.openMorePopup = function () {
                    var displayOptions = {
                        scroll: true,
                        goToStart: true,
                        networkMap: true
                    };
                    morePopupService.openMorePopup(displayOptions, $scope);
                };

                $scope.executeCommand = function (cmd) {
                    executeCommandService.executeCommand(cmd);
                };

                $scope.toggleScrollingWorker = function () {
                    $scope.updateAllElementsHideShow();

                    if ($scope.isScrolling()) {
                        var currentStateElement = $('#' + $scope.currentState.replace("/", ""));
                        $('html, body').animate({
                            scrollTop: currentStateElement.offset().top
                        }, 1000);
                    }
                };

                $scope.updateAllElementsHideShow = function () {
                    $scope.allStates.each(function () {
                        $scope.updateHideShow($(this));
                    });
                };

                $scope.updateHideShow = function (stateDiv) {
                    var theId = stateDiv.attr('id');
                    var isActiveState = $location.path() === ("/" + theId);

                    if ($scope.isScrolling()) {
                        stateDiv.removeClass("ng-hide");
                        stateDiv.addClass("stateWrapperBottomMargin");
                        stateDiv.toggleClass("activeStateBorder", isActiveState);
                        diagramService.drawADiagram(stateDiv);
                        return;
                    }

                    stateDiv.removeClass("stateWrapperBottomMargin");
                    stateDiv.removeClass("activeStateBorder");
                    stateDiv.toggleClass("ng-hide", !isActiveState);

                    if (isActiveState && $scope.windowEventFired) {
                        diagramService.drawADiagram(stateDiv);
                        $(stateDiv).find("a")[0].focus();
                    }

                };

                $scope.goToState = function (nextState) {
                    // TODO: pause the video when going to another state, could do this through a directive

                    if (nextState === 'previousState') {
                        window.history.back();
                    } else {
                        $location.path(nextState);
                    }

                    if ($scope.isScrolling()) {
                        // TODO: couldn't get $location.hash and anchorScroll to work with $location.path 
                        // TODO: and browser back/forward buttons. This works except when there is no more to scroll
                        // TODO: leaving part of the previous step at the top of the screen
                        // Kudos: http://www.abeautifulsite.net/smoothly-scroll-to-an-element-without-a-jquery-plugin-2/

                        var nextStateElement = $('#' + nextState);
                        $('html, body').animate({
                            scrollTop: nextStateElement.offset().top
                        }, 1000);
                    }
                };

                // The browser back and foward button and calls to $location.path(foo) cause this event to happen
                $scope.$on('$locationChangeSuccess', function () {
                    $scope.currentState = $location.path();

                    // $scope.updateAllElementsHideShow();
                });

                // TODO: Refactor this into the ProgressBar service
                $scope.showProgressBar = function () {
                    return $scope.isArticle && !$scope.isScrolling();
                };

                $scope.getStates = function () {
                    return progressBarService.getStates();
                };

                $scope.getProgressBarClass = function (index) {
                    return progressBarService.getProgressBarClass(index);
                };

                $scope.loadImage = function (element, attrs) {
                    diagramService.loadImage(element, attrs.src, function () {
                        diagramService.drawImageWhenEverythingsReady("loadImage.onLoad", $scope.getActiveState());
                    });
                };

                $scope.areDiagramsReady = function () {
                    return diagramService.areAllCanvasDrawn();
                };

            }
        ]);
});