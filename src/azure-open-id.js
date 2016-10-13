module.exports = function (openIdConfigurationEndPoint) {
    var rp = require('request-promise');
    var jwkToPem = require('jwk-to-pem');
    var forge = require('node-forge');
    var fs = require('fs');
    var openIdConfigurationEndPoint = openIdConfigurationEndPoint;

    function getAzureJwkUrl() {
        return rp(openIdConfigurationEndPoint)
            .then(function (endPoints) {
                return JSON.parse(endPoints).jwks_uri;
            });
    };
    function getAzureAdJwkById(kid) {

        return getAzureJwkUrl().then(function (jwsUri) {
            return rp(jwsUri);
        })
            .then(function (publicKeys) {
                var publicKeysContainer = JSON.parse(publicKeys);
                var selectedKey = publicKeysContainer.keys.find(function (key) {
                    return key.kid == kid;
                });
                return selectedKey;
            });
    };

    function getPemFromJwk(jwk) {
        var jwkOptions = { private: false };
        return jwkToPem(jwk, jwkOptions);
    }
    function getPemFromJwkForge(jwk) {
        // base64-decode DER bytes
        var certDerBytes = forge.util.decode64(jwk.x5c[0]);

        // parse DER to an ASN.1 object
        var obj = forge.asn1.fromDer(certDerBytes);

        // convert ASN.1 object to forge certificate object
        var cert = forge.pki.certificateFromAsn1(obj);

        // get forge public key object
        var publicKey = cert.publicKey;

        // if you did want to convert it to PEM format for transport:
        var pem = forge.pki.publicKeyToPem(publicKey);

        return pem;
    }

    function printPem(pem, path) {
        fs.writeFile(path, pem, function (err) {
            if (err) throw err;
            console.log("The public key is saved at : " + path);
        });
    }
    return {
        getAzureJwkUrl: getAzureJwkUrl,
        getAzureAdJwkById: getAzureAdJwkById,
        getPemFromJwk: getPemFromJwk,
        getPemFromJwkForge: getPemFromJwkForge,
        printPem: printPem
    };
};