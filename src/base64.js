module.exports = (function () {
    function base64UrlToBase64(base64Url) {
        var padded = base64Url.Length % 4 == 0
            ? base64Url : base64Url + "====".substring(base64Url.Length % 4);
        var base64 = padded.replace(/_/g, "/").replace(/-/g, "+");
        return base64;
    }

    return {
        base64UrlToBase64: base64UrlToBase64
    }

})();