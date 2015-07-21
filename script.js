

angular.module('docsSimpleDirective', [])
    .controller('Controller', [
        '$scope', function ($scope) {
            $scope.customer = {
                name: 'Naomi',
                address: '1600 Amphitheatre'
            };
            $scope.imagesToLoad = [];
            $scope.loadedImages = 0;

            $scope.findCanvasContext = function (scope, element) {

                if (scope.context != null) {
                    return;
                }

                var parent = null;
                if (angular.isArray(element)) {
                    parent = element[0].parent();
                } else {
                    parent = element.parent();
                }

                scope.context = parent[0].getContext("2d");
                if (!angular.isDefined(scope.context) || scope.context === null) {
                    var msg = "HTML error contentImage must be inside a canvas element with a primarydiagram directive";
                    console.log(msg);
                    throw msg;
                }
            };

            $scope.drawImage = function () {
                $scope.loadedImages++;

                if ($scope.loadedImages < $scope.imagesToLoad.length) {
                    return true;
                }

                $scope.imagesToLoad.forEach(function (imageHolder) {
                    $scope.context.drawImage(imageHolder.img, imageHolder.x, imageHolder.y);
                });

                $scope.imagesToLoad = [];
                $scope.loadedImages = 0;

                return true;
            }

            $scope.loadImage = function (scope, element, attrs) {
                $scope.findCanvasContext(scope, element);

                var imgHolder = {};
                var img = new Image();
                imgHolder.img = img;

                imgHolder.x = 0;
                if (angular.isDefined(attrs.x)) {
                    imgHolder.x = attrs.x;
                }

                imgHolder.y = 0;
                if (angular.isDefined(attrs.y)) {
                    imgHolder.y = attrs.y;
                }

                img.addEventListener("load", function () {
                    return $scope.drawImage();
                }, false);
                img.src = attrs.src;

                $scope.imagesToLoad.push(imgHolder);

            };
        }
    ])
    .directive('myCustomer', function () {
        return {
            template: 'Name: {{customer.name}} Address: {{customer.address}}'
        };
    })
    .directive('backgroundImage', function ($rootScope) {
        return {
            restrict: 'E',
            scope: false,
            link: function (scope, element, attrs) {
                scope.loadImage(scope, element, attrs);
            }
        };
    })
    .directive('overlayImage', function () {
        return {
            restrict: 'E',
            scope: false,
            link: function (scope, element, attrs) {
                scope.loadImage(scope, element, attrs);
            }
        };
    });

