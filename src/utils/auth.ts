function ab2str(buffer) {
    const byteArray = new Uint8Array(buffer);
    let byteString = '';
    for (let i = 0; i < byteArray.byteLength; i += 1) {
        byteString += String.fromCodePoint(byteArray[i]);
    }
    return byteString;
}

function str2ab(byteString) {
    const byteArray = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i += 1) {
        byteArray[i] = byteString.codePointAt(i);
    }
    return byteArray;
}

export async function generateToken(password: string): Promise<string> {
    try {
        const hashBytes = 32;
        const saltBytes = 40;
        const iterations = 100;
        const digest = 'SHA-512';

        const pwBuf = str2ab(password);
        // First, create a PBKDF2 "key" containing the password
        const baseKey = await window.crypto.subtle.importKey('raw', pwBuf, 'PBKDF2', false, ['deriveBits', 'deriveKey']);

        // Generate random salt
        const salt = new Uint8Array(saltBytes);
        window.crypto.getRandomValues(salt);

        // Derive a key from the password and random salt
        const params = { iterations, salt, name: 'PBKDF2', hash: digest };
        const hash = await crypto.subtle.deriveBits(params, baseKey, hashBytes * 8);
        const hashUint8 = new Uint8Array(hash);

        // Create combined token
        const combined = new ArrayBuffer(salt.length + hashUint8.length + 8);
        const dataview = new DataView(combined);

        // Write data into combined buffer
        // Server is using Big Endian
        dataview.setUint32(0, salt.length, false);
        dataview.setUint32(4, params.iterations, false);
        for (let i = 0; i < salt.length; i += 1) {
            dataview.setUint8(i + 8, salt[i]);
        }
        for (let i = 0; i < hashUint8.length; i += 1) {
            dataview.setUint8(i + salt.length + 8, hashUint8[i]);
        }

        // Return as base64 string
        const combinedS = ab2str(combined);
        return btoa(combinedS);
    } catch (err) {
        console.error(`Key derivation failed: ${err.message}`); // eslint-disable-line no-console
    }
    return '';
}
