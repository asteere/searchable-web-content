'use strict';

define(["angular", "qrcode"], function (angular) {
    angular.module('QrCode.directives', [])
        .directive('createQrCode', ['$location',
            function ($location) {
                return {
                    restrict: 'A',
                    scope: true,
                    link: function (scope, element, attrs) {
                        // Creates the QR code and adds it to the element
                        var absUrl = $location.absUrl().replace('localhost', 'asteere.Peak8ddc.local'); //.replace('asteere', '10.254.54.202');
                        try {
                            new QRCode(attrs.id, {
                                text: absUrl,
                                width: 200,
                                height: 200,
                                colorDark: "#000000",
                                colorLight: "#ffffff",
                                correctLevel: QRCode.CorrectLevel.H
                            });
                        } catch (err) {
                            console.log(err);
                        }
                    }
                };
            }
        ])
    ;
});