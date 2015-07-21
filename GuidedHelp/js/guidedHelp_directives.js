'use strict';

define(["angular", "guidedHelp_services"], function (angular) {
    angular.module('GuidedHelpApp.directives', [])
        .directive('showState', ['$location', 'ProgressBarService',
            function ($location, progressBarService) {
                return {
                    restrict: 'A',
                    scope: false,
                    compile: function () {
                        return {
                            pre: function ($scope) {
                                // If we are called with a state in the URL use it. 
                                // Otherwise use the state specified by data-ng-init
                                // TODO: Is this the best place to check this? If we do it in the startup of the controller
                                // TODO: then when the HTML ng-init="currentState = IntroductionState" is run, it will overwrite this.
                                if ($location.path().length === 0) {
                                    $location.path("/" + $scope.introState);
                                }
                            },
                            post: function ($scope, element, attrs) {
                                progressBarService.addState(element, attrs);

                                $scope.$watch(attrs.showState, function () {
                                    $scope.updateHideShow(element);
                                });
                            }
                        };
                    }
                };
            }
        ])
        .directive('helpviewerallcontrols', ['$http', '$compile',
            function ($http, $compile) {
                return {
                    restrict: 'C',
                    scope: false,
                    link: function (scope, element) {
                        // TODO: Is there a way to use templateUrl and append the following HTML rather than replace?
                        // Kudos: https://stackoverflow.com/questions/14632260/can-you-change-templateurl-on-the-fly
                        $http.get('../partials/staticStateInfo.html', { cache: true }).success(function (templateContent) {
                            var staticStateInfoHtml = $compile(templateContent)(scope);
                            staticStateInfoHtml.appendTo(element[0]);
                        }).error(function (data) {
                            console.log("staticStateInfo get failed data=" + data + " status=" + status);
                        });
                    }
                };
            }]
        )    ;
});