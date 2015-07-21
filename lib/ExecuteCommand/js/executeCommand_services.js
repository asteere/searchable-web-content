
define(["angular"], function (angular) {
    "use strict";

    angular.module('ExecuteCommand.services', [])
        .service('ExecuteCommandService', [
            function() {
                var instance = {};

                // TODO: Refactor this as NwMap.PathManager needs this
                instance.getBaseUrl = function() {
                    // $location doesn't give us what we need anywhere near as easily
                    // Kudos: http://tosbourn.com/a-fix-for-window-location-origin-in-internet-explorer/
                    if (!window.location.origin) {
                        window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
                    }
                    return window.location.origin + '/';
                };

                instance.executeCommand = function(urlPathToExe) {
                    try {
                        // TODO: Find a more elegant way to create the path to the URL
                        var exeUrl = instance.getBaseUrl() + urlPathToExe;
                        window.open(exeUrl, '_blank');
                    } catch (err) {
                        console.log("ExecuteCommandService " + err);
                    }
                };
                return instance;
            }
        ]);
});