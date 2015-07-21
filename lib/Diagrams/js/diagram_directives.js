'use strict';

define(["angular"], function(angular) {
    angular.module('Diagram.directives', [])
        .directive('diagramWrap', function() {
            return {
                restrict: 'A',
                scope: false,
                link: function(scope, element, attrs) {
                    $(element).addClass("DiagramWrap");
                    var imageDivs = $(element).find("div[background-image],div[overlay-image]");
                    if (imageDivs.length > 0) {
                        var currentCanvas = $(document.createElement('canvas'));
                        currentCanvas.addClass("primarydiagram");
                        element.append(currentCanvas);
                    }
                }
            };
        })
        .directive('backgroundImage', function() {
            return {
                restrict: 'A',
                scope: false,
                link: function(scope, element, attrs) {
                    scope.loadImage(element, attrs);
                }
            };
        })
        .directive('overlayImage', function() {
            return {
                restrict: 'A',
                scope: false,
                link: function(scope, element, attrs) {
                    scope.loadImage(element, attrs);
                }
            };
        });
});