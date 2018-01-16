/**
 * blockchain.js : main blockchain functions for this demo.
 */
$(() => {

    //Elements that will be manipulated.
    var load = $('.load'),
        wait = $('.wait'),
        success = $('.success'),
        fail = $('.fail'),
        verifySection = $('.verify-section'),
        verifyButton = $('.verify'),
        hackButton = $('.hack'),
        result = $('.result'),
        block = $('.block'),
        from = $('.from'),
        to = $('.to'),
        amount = $('.amount');

    //Get latest block information from server.
    $.get('/block/get').done((d) => {
        //Hide loading indicator.
        load.hide();

        //Show block information.
        from.text(d.from);
        to.text(d.to);
        amount.text(d.amount);
        block.fadeIn();

        //Show verify section.
        verifySection.fadeIn();
    });

    //Verify block.
    verifyButton.click((e) => {
        e.preventDefault();

        //Get block information from page.
        var f = from.text(),
            t = to.text(),
            a = amount.text();

        //Hash the block information.
        var hash = sha256(f + t + a);

        //Hide everything but waiting indicator.
        block.fadeOut();
        verifySection.fadeOut(() => {
            wait.fadeIn('fast');
            sendHash(hash);
        });
    });

    //Hack block.
    hackButton.click((e) => {
        e.preventDefault();

        //Randomize the amount.
        amount.text(Math.floor(Math.random() * 100));

        //Wait two seconds then finish verifying.
        setTimeout(() => {
            //Get block information from page.
            var f = from.text(),
                t = to.text(),
                a = amount.text();

            //Hash the block information.
            var hash = sha256(f + t + a);

            //Hide everything but waiting indicator.
            block.fadeOut();
            verifySection.fadeOut(() => {
                wait.fadeIn('fast');
                sendHash(hash);
            });
        }, 2000);

    });


    function sendHash(hash) {
        //Send hash for verification.
        $.get('/block/verify/' + hash).done((d) => {
            if (!d.success) {
                //Failed verification, show failure message.
                result.text(hash);
                result.fadeIn();

                fail.text(d.message + ' (' + d.verifications + ' Successful Verifications)');
                wait.fadeOut(() => {
                    fail.fadeIn();
                });
            } else {
                //Passed verification, show success message.
                result.text(hash);
                result.fadeIn();

                success.text(d.message + ' (' + d.verifications + ' Successful Verifications)');
                wait.fadeOut(() => {
                    success.fadeIn();
                });
            }
        });
    }

});