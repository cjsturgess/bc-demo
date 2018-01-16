/**
 * Project Week Blockchain Demo
 */
const path = require('path'),
    os = require('os');

const express = require('express'),
    app = express();

const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync(path.join(os.tmpdir(), 'blockchain.json'));
const db = low(adapter);

const sha256 = require('crypto-js/sha256');

db.defaults({
    block: {
        from: 'Bob',
        to: 'Alice',
        amount: 25,
        verifications: 0
    }
}).write();

//Serve main HTML files.
app.use('/', express.static(path.join(__dirname, 'public')));
app.get('/hack', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'hack.html'));
});

//API request to get latest block information.
app.get('/block/get', function (req, res) {
    //Get information from JSON datastore.
    var block = db.get('block').value();

    //Send it as a response to the API call.
    res.json(block);
});

/**
 * API call to verify a block.
 * Checks if hash matches hash of the default block.
 * In an actual blockchain, this would be checked against other verifications,
 * but since this is a demo, we'll do it the manual way.
 */
app.get('/block/verify/:hash', function (req, res) {
    //Get hash from request.
    var hash = req.params.hash;

    //Get block information from JSON datastore.
    var block = db.get('block').value(),
        from = block.from,
        to = block.to,
        amount = block.amount,
        verifications = block.verifications;

    //Hash default block information to compare.
    var defaultHash = sha256(from + to + amount).toString();

    //If request hash matches block hash, count as a verification, otherwise fail.
    if (hash === defaultHash) {
        //Hashes matched! Count as verification.
        db.set('block.verifications', ++verifications).write();

        //Send success result.
        res.json({
            success: true,
            message: 'This block verified successfully.',
            verifications: verifications
        });
    } else {
        //Hashes didn't match, send failure result.
        res.json({
            success: false,
            message: 'This block did not pass verification.',
            verifications: verifications
        });
    }
});

/**
 * API call to reset verification totals.
 */
app.get('/reset/:pass', (req, res) => {
    var pass = req.params.pass;

    if (pass === '1111') {
        db.set('block.verifications', 0).write();
        res.json({
            success: true,
            messge: 'Successfully reset verification totals.'
        });
    } else {
        res.json({
            success: false,
            message: 'Provided passphrase was incorrect, no action taken.'
        });
    }
});

app.listen('5000', () => {
    console.log('Blockchain Demo now running!');
});