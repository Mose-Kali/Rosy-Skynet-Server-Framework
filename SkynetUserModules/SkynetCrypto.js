const SkynetLogger=require('../SkynetModules/SkynetLogger')
const SkynetProfileLoader=require('../SkynetModules/SkynetProfilesLoader')
const crypto = require("crypto");
const fs = require("fs");

var SkynetProfile=SkynetProfileLoader.LoadSystemProfile()

exports.Encode=function (Text) {
    const algorithm = 'aes-192-cbc';
    const password = SkynetProfile.SkynetCrypto.Key;
    const key = crypto.scryptSync(password, '1234', 24);
    const iv = Buffer.alloc(16, 0);

    const cipher = crypto.createCipheriv(algorithm, key, iv);

    let encrypted = cipher.update(Text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

exports.Decode=function (Text) {
    const algorithm = 'aes-192-cbc';
    const password = SkynetProfile.SkynetCrypto.Key;
    const key = crypto.scryptSync(password, '1234', 24);
    const iv = Buffer.alloc(16, 0); 

    const decipher = crypto.createDecipheriv(algorithm, key, iv);

    let decrypted = decipher.update(Text, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}