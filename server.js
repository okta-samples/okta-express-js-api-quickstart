const cors = require('cors');
const express = require('express');
const OktaJwtVerifier = require('@okta/jwt-verifier');

const app = express();
const port = 3000;
const oktaJwtVerifier = new OktaJwtVerifier({
    issuer: 'https://{yourOktaDomain}/oauth2/default'
});
const audience = 'api://default';

const authenticationRequired = async (req, res, next) => {
    const authHeader = req.headers.authorization || '';
    const match = authHeader.match(/Bearer (.+)/);
    if (!match) {
        return res.status(401).send();
    }

    try {
        const accessToken = match[1];
        if (!accessToken) {
            return res.status(401, 'Not authorized').send();
        }
        req.jwt = await oktaJwtVerifier.verifyAccessToken(accessToken, audience);
        next();
    } catch (err) {
        return res.status(401).send(err.message);
    }
};

app
.use(cors())
.listen(port, () => console.log('API Magic happening on port ' + port));

// app.all('*', authenticationRequired); // Require authentication for all routes

app.get('/api/hello', (req, res) => {
    res.send('Hello world!');
});

app.get('/api/whoami', authenticationRequired, (req, res) => {
    res.json(req.jwt?.claims);
});



