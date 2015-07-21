'use strict';

define(["angular", "uiBootstrapTpls"], function(angular) {
    angular.module('ModalDialog.services', [])
        .service('ModalDialog', [
            '$modal', function($modal) {
                var modalDefaults = {
                    backdrop: true,
                    keyboard: true,
                    modalFade: true,
                    templateUrl: null
                };
                var modalOptions = {
                    closeButtonText: 'Close',
                    headerText: 'Proceed?',
                    headerText2: '12345',
                    bodyText: 'Perform this action?',
                    qrCode: ''
                };

                this.showModal = function(customModalDefaults, customModalOptions, customButtons, customCancelHandler) {
                    if (!customModalDefaults) customModalDefaults = {};
                    customModalDefaults.backdrop = 'static';

                    if (angular.isDefined(customCancelHandler) && customCancelHandler != null) {
                        this.cancelHandler = customCancelHandler;
                    }

                    return this.show(customModalDefaults, customModalOptions, customButtons);
                };

                this.show = function(customModalDefaults, customModalOptions, customButtons) {
                    //Create temp objects to work with since we're in a singleton service
                    var tempModalDefaults = {};
                    var tempModalOptions = {};

                    //Map angular-ui modal custom defaults to modal defaults defined in service
                    angular.extend(tempModalDefaults, modalDefaults, customModalDefaults);

                    //Map modal.html $scope custom properties to defaults defined in service
                    angular.extend(tempModalOptions, modalOptions, customModalOptions);

                    if (!tempModalDefaults.controller) {
                        tempModalDefaults.controller = function($scope, $modalInstance) {

                            // TODO: Add more arguments where needed. Didn't take time to see if I could use arguments[]
                            $scope.proxy = function(funcName, arg1, arg2) {
                                try {
                                    tempModalDefaults.popupHandler[funcName](arg1, arg2);
                                } catch (err) {
                                    console.log("ModalDialogService.proxy " + err);
                                }
                                $modalInstance.close();
                            }

                            $scope.modalOptions = tempModalOptions;
                            $scope.buttons = [];
                            $scope.navHandler = function(event) {
                                if (event.keyCode != 13) {
                                    event.preventDefault();
                                    event.stopPropagation();
                                }
                            };

                            var focusSet = false;
                            if (angular.isDefined(customButtons)) {
                                $scope.buttons = $scope.buttons.concat(customButtons);
                                angular.forEach(customButtons, function(customButton) {
                                    if (focusSet === false) {
                                        if (customButton.focus === true) {
                                            focusSet = true;
                                        }
                                    }
                                });
                            }
                            if (!angular.isDefined(customModalOptions.showCloseButton) || customModalOptions.showCloseButton != false) {
                                var closeButton = {
                                    text: customModalOptions.closeButtonText,
                                    action: function() {
                                        // Default we implicitly close the dialog, so do nothing here
                                    }
                                };
                                if (customModalOptions.closeButtonAction != undefined) {
                                    closeButton.action = customModalOptions.closeButtonAction;
                                };
                                if (focusSet === false) {
                                    closeButton.focus = true;
                                }
                                $scope.buttons.push(closeButton);
                            }

                            $scope.executeButton = function(button) {
                                button.action();
                                $modalInstance.close();
                            };
                        };
                    }
                    return $modal.open(tempModalDefaults).result;
                };

                this.buttons = [];
                this.keyLock = false;

                this.addButton = function(button) {
                    this.buttons.push(button);
                };

                this.keyHandler = function(element, event) {
                    if (this.keyLock === false) {
                        var navNext = 0;
                        if (event.keyCode === 37 ||
                            event.keyCode === 38) {
                            navNext = this.prevElement(element);
                        }
                        if (event.keyCode === 39 ||
                            event.keyCode === 40) {
                            navNext = this.nextElement(element);
                        }
                        //this.focusElement = this.buttons[navNext][0];
                        var button = this.buttons[navNext][0];
                        button.focus();
                    }
                };

                this.focusElement = {};

                this.cleanup = function() {
                    while (this.buttons.length > 0) {
                        this.buttons.pop();
                    }
                };

                this.nextElement = function(element) {
                    var retVal = 0;
                    var buttons = this.buttons;
                    angular.forEach(buttons, function(button, key) {
                        if (button == element) {
                            if (key + 1 < buttons.length) {
                                retVal = key + 1;
                            }
                        }
                    });
                    return retVal;
                };
                this.prevElement = function(element) {
                    var retVal = 0;
                    var buttons = this.buttons;
                    angular.forEach(buttons, function(button, key) {
                        if (button == element) {
                            if (key - 1 < 0) {
                                retVal = buttons.length - 1;
                            }
                        }
                    });
                    return retVal;
                };

            }
        ]);
});