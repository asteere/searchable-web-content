// The requirejs website was like *Nix man pages. Useful once you solved your problem. 
// Here are a couple of linksk that I found helpful
//
// angular and requirejs:
// https://marcoslin.github.io/angularAMD/#/home
//
// shims: 
// http://stackoverflow.com/questions/15471088/requirejs-why-and-when-to-use-shim-config
// http://requirejs.org/docs/api.html#config-shim
//
// ui-bootstrap-tpls: 
// http://stackoverflow.com/questions/23068816/loading-angular-ui-bootstrap-with-require-js-fails-unless-i-rename-ui-bootstrap

var appName = "GuidedHelpApp";

require.config({
    paths: {
        "jquery": "/lib/ThirdParty/jquery-1.11.1",
        "angular": "/lib/ThirdParty/angular",
        "uiBootstrapTpls": "/lib/ThirdParty/ui-bootstrap-tpls",

        "qrcode": "/lib/QrCode/js/qrcode",
        "qrCode_directives": "/lib/QrCode/js/qrCode_directives",

        "diagram_services": "/lib/Diagrams/js/diagram_services",
        "diagram_directives": "/lib/Diagrams/js/diagram_directives",

        "executeCommand_services": "/lib/ExecuteCommand/js/executeCommand_services",

        "modalDialog_services": "/lib/ModalDialog/js/modalDialog_services",

        "morePopup_services": "/lib/MorePopup/js/morePopup_services",

        "guidedHelp_app": "/GuidedHelp/js/guidedHelp_app",
        "guidedHelp_controllers": "/GuidedHelp/js/guidedHelp_controllers",
        "guidedHelp_directives": "/GuidedHelp/js/guidedHelp_directives",
        "guidedHelp_services": "/GuidedHelp/js/guidedHelp_services",
    },
    shim: {
        angular: {
            deps: ["jquery"],
            exports: "angular"
        },
        uiBootstrapTpls: {
            deps: ["angular"],
            exports: "$modal"
        },
        qrcode: {
            deps: ["jquery"],
            exports: "QRCode"
        }

    }
});

// TODO: Do we make this common code?
(function loadCss(url) {
    var link = document.createElement("link");
    link.type = "text/css";
    link.rel = "stylesheet";
    link.href = url;
    document.getElementsByTagName("head")[0].appendChild(link);
})("/GuidedHelp/css/guidedHelp.css");

(function manuallyLoadAngular() {
    require([
        "angular",
        "qrcode",
        'qrCode_directives',
        'executeCommand_services',
        'modalDialog_services',
        'morePopup_services',
        'diagram_services',
        'diagram_directives',
        'guidedHelp_services',
        'guidedHelp_controllers',
        'guidedHelp_directives'
    ],
        function (angular) {
            'use strict';

            try {
                // Kudos: http://engineering.radius.com/post/71425827156/requirejs-with-angularjs-an-example
                if (document.readyState === 'interactive' || document.readyState === 'complete') {
                    angular.bootstrap(document.documentElement, [appName]);
                } else {
                    document.onreadystatechange = function () {
                        if (document.readyState === 'interactive') {
                            angular.bootstrap(document.documentElement, [appName]);
                        }
                    };
                }
            } catch (err) {
                console.log("Error calling angular.bootstrap " + err);
            }
        }
    );
})();

define(['jquery',
        'angular',
        'uiBootstrapTpls',
        'diagram_services',
        'diagram_directives',
        'qrcode',
        'qrCode_directives',
        'executeCommand_services',
        'modalDialog_services',
        'morePopup_services',
        'guidedHelp_services',
        'guidedHelp_controllers',
        'guidedHelp_directives'
    ],
    function (jquery, angular) {
        'use strict';

        // Declare app level module which depends on filters, factories and services that
        // will be defined in the future need to be added here. Angular requires setting up the contract
        // before the factory methods are created. Otherwise there is no binding point for angular and
        // injection will fail with a "Unknown provider" error.
        var appModule = angular.module(appName, [
                'ui.bootstrap',
                'ui.bootstrap.tpls',
                'Diagram.services',
                'Diagram.directives',
                'QrCode.directives',
                'ExecuteCommand.services',
                'ModalDialog.services',
                'MorePopup.services',
                'GuidedHelpApp.services',
                'GuidedHelpApp.controllers',
                'GuidedHelpApp.directives'
        ]);

        return appModule;
    });
