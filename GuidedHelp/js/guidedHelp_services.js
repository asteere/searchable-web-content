'use strict';

define(["angular"], function (angular) {
    angular.module('GuidedHelpApp.services', [])
        .service('ProgressBarService', ['$rootScope', '$location',
            function ($rootScope, $location) {
                var itemDone = 'itemDone';
                var itemNotDone = 'itemNotDone';

                // Rather than hard code the list of states. Programatically 
                // create an array of states so that the progress bar can determine 
                // progress based on the state's position in the array. 
                // Rather than iterate through all the states to find their ids, create a separate structure
                var states = [];

                var getProgressBarClassNoScrolling = function (index) {
                    var currentLocation = $location.path().replace("/", "");

                    var currentStateIndex = 0;
                    for (; currentStateIndex < states.length; currentStateIndex++) {
                        if (states[currentStateIndex] == currentLocation || currentLocation.length == 0) {
                            break;
                        };
                    }

                    if (index <= currentStateIndex) {
                        return itemDone;
                    }
                    return itemNotDone;
                }

                // Each states should show its own progress for itself, ignoring the currentLocation
                // Bug: This method doesn't work.
                // TODO: DO we want to have a progress bar when scrolling articles?
                var getProgressBarClassScrolling = function (indexOfStateBeingProcessed) {
                    var currentStateIndex = 0;
                    if (indexOfStateBeingProcessed <= currentStateIndex) {
                        return itemDone;
                    }
                    return itemNotDone;
                }

                return {
                    getProgressBarClass: function (indexOfStateBeingProcessed) {
                        //                    if ($rootScope.isScrolling()) {
                        //                        return getProgressBarClassScrolling(indexOfStateBeingProcessed);
                        //                    } else {
                        return getProgressBarClassNoScrolling(indexOfStateBeingProcessed);
                        //                    }
                    },

                    addState: function (element, attrs) {
                        states.push(attrs.id);
                    },

                    getStates: function () {
                        return states;
                    }
                };

            }
        ]);
});