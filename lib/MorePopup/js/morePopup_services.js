'use strict';

define(["angular", "uiBootstrapTpls", "qrcode", "executeCommand_services", "modalDialog_services"],
    function (angular) {
        angular.module('MorePopup.services', [])
            .service('MorePopupService', ['$location', '$sce', 'ExecuteCommandService', 'ModalDialog',
                function ($location, $sce, executeCommandService, modalDialog) {

                    var enhancePopupHandler = function (popupHandler) {
                        popupHandler.popupQrCode = function () {
                            var msg = 'this article on another phone, tabler or PC</li></ul>';
                            var modalOptions = {
                                closeButtonText: 'OK',
                                headerText: "Scan with QRCode app",
                                headerText2: '',
                                bodyText: '',
                                location: $location.absUrl()
                            };

                            var customModalDefaults = {
                                templateUrl: '/lib/QrCode/partials/qrCodePopup.html'
                            };

                            var customButtons = [];
                            modalDialog.showModal(customModalDefaults, modalOptions, customButtons);
                        };

                        popupHandler.emailHelp = function () {
                            var title = $('head title')[0].text;
                            var introText = "Help Article " + title;
                            var helpUrl = $location.absUrl();
                            var body = encodeURI(introText + "\n\t" + helpUrl + "\n\n" + "Compliments of WebContent");
                            window.location.href = "mailto:?subject=Help Article: "
                                + title
                                + "&body=" + body;
                        };

                        popupHandler.chatWithAgent = function () {
                            alert("Open chat session with Provider's Agent");
                        }

                        popupHandler.goToWebContentHome = function () {
                            window.open('http://www.google.com', '_blank');
                        }

                        popupHandler.executeCommand = function (urlPathToExe) {
                            executeCommandService.executeCommand(urlPathToExe);
                        }
                    };

                    return {
                        openMorePopup: function (displayOptions, popupHandler) {
                            if (!angular.isDefined(popupHandler) || popupHandler == null) {
                                popupHandler = {};
                            }
                            enhancePopupHandler(popupHandler);

                            if (!angular.isDefined(displayOptions) || displayOptions == null) {
                                displayOptions = {
                                    scroll: false,
                                    goToStart: false,
                                    networkMap: false
                                };
                            }

                            var msg = 'Something';
                            var modalOptions = {
                                closeButtonText: 'OK',
                                headerText: "Settings",
                                headerText2: '',
                                bodyText: $sce.trustAsHtml(msg),
                                scroll: displayOptions.scroll,
                                goToStart: displayOptions.goToStart,
                                networkMap: displayOptions.networkMap
                            };

                            var customModalDefaults = {
                                // TODO: Move WebContent/js to lib/thirdparty/js
                                templateUrl: '/lib/MorePopup/partials/morePopup.html',
                                popupHandler: popupHandler,
                                displayOptions: displayOptions
                            };

                            var customButtons = [];
                            modalDialog.showModal(customModalDefaults, modalOptions, customButtons);
                        }
                    };

                }
            ]);
    });
