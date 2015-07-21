define(['jquery'], function($) {
    var instance = {};

    instance.imageLoad = function() {
        try {
            var hiddenCanvas = $(document.createElement('canvas'));
            hiddenCanvas.addClass("primarydiagram");
            var hiddenContext = hiddenCanvas[0].getContext("2d");

            var img = $(document).find('img');
            img = img[0];

            var imgWidth = img.width;
            var imgHeight = img.height;

            hiddenCanvas[0].width = imgWidth;
            hiddenCanvas[0].height = imgHeight;

            hiddenContext.drawImage(img, 0, 0);

            console.log("draw hidden image width=" + img.width + " height=" + img.height + " hiddenCanvas.width=" + hiddenCanvas.width() + " hiddenCanvas.height=" + hiddenCanvas.height()
                + " hiddenCanvas[0].width=" + hiddenCanvas[0].width + " hiddenCanvas[0].height=" + hiddenCanvas[0].height);

            var hiddenDiv = $('body').find('#hiddenDiv');
            hiddenDiv.append(hiddenCanvas);

            var ratio = .5;

            var straightCanvas = $('body').find('#straightCanvas');
            straightCanvas[0].width = imgWidth;
            straightCanvas[0].height = imgHeight;

            var straightContext = straightCanvas[0].getContext("2d");
            straightContext.drawImage(hiddenCanvas[0], 0, 0, imgWidth, imgHeight, 0, 0, imgWidth * ratio, imgHeight * ratio);

            var testCanvas = $('body').find('#testCanvas');
            testCanvas[0].width = imgWidth;
            testCanvas[0].height = imgHeight;

            ratio = .0625;
            var testContext = testCanvas[0].getContext("2d");
            testContext.drawImage(hiddenCanvas[0], 0, 0, imgWidth, imgHeight, 0, 0, imgWidth * ratio, imgHeight * ratio);
        } catch (err) {
            console.log(err);
        }

    };

    return instance;
});