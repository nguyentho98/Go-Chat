import CryptoJS from 'crypto-js';

export const getKey = (...args) => {
    return args.map(arg => arg).join('.');
};

// encrypt
export const getEncryptPassword = (password, key) => {
    return CryptoJS.AES.encrypt(password, key).toString();
};

// decrypt
export const getDecryptPassword = (password, key) => {
    const bytes = CryptoJS.AES.decrypt(password, key);
    return bytes.toString(CryptoJS.enc.Utf8);
};
