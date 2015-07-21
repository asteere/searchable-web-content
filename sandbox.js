require.config({
    paths: {
        "jquery": "lib/ThirdParty/jquery-1.11.1",
        "angular": "lib/ThirdParty/angular",
        "ui-bootstrap-tpls": "lib/ThirdParty/ui-bootstrap-tpls",

        "qrcode": "lib/QrCode/js/qrcode",
        "qrCode_directives": "lib/QrCode/js/qrCode_directives",

        "diagram_services": "lib/Diagrams/js/diagram_services",
        "diagram_directives": "lib/Diagrams/js/diagram_directives",

        "executeCommand_services": "lib/ExecuteCommand/js/executeCommand_services",
        "modalDialog_services": "lib/ModalDialog/js/modalDialog_services",
        "morePopup_services": "lib/MorePopup/js/morePopup_services",

        "guidedHelp_app": "GuidedHelp/js/guidedHelp_app",
        "guidedHelp_controllers": "GuidedHelp/js/guidedHelp_controllers",
        "guidedHelp_directives": "GuidedHelp/js/guidedHelp_directives",
        "guidedHelp_services": "GuidedHelp/js/guidedHelp_services",

        "stuff": "stuff"
    }
});

require(['stuff'], function (stuff) {
    console.log("inside stuff stuff=" + stuff);
    stuff.imageLoad();
});

require(['jquery'], function (foo) {
    console.log("inside jquery function arguments" + arguments[0]);

    var adiv = $('#straightDiv');
    console.log("adiv=" + adiv);
});

(function loadCss(url) {
    var link = document.createElement("link");
    link.type = "text/css";
    link.rel = "stylesheet";
    link.href = url;
    document.getElementsByTagName("head")[0].appendChild(link);
})("/GuidedHelp/css/guidedHelp.css");


