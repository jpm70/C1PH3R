document.addEventListener('DOMContentLoaded', () => {
    const encryptedInput = document.getElementById('encryptedInput');
    const cipherSelect = document.getElementById('cipherSelect');
    const vigenereKeyGroup = document.getElementById('vigenereKeyGroup');
    const vigenereKeyInput = document.getElementById('vigenereKey');
    const cesarKeyGroup = document.getElementById('cesarKeyGroup');
    const cesarKeyInput = document.getElementById('cesarKey');
    const scytaleKeyGroup = document.getElementById('scytaleKeyGroup');
    const scytaleKeyInput = document.getElementById('scytaleKey');
    const playfairKeyGroup = document.getElementById('playfairKeyGroup');
    const playfairKeyInput = document.getElementById('playfairKey');
    const decodeBtn = document.getElementById('decodeBtn');
    const decodedOutput = document.getElementById('decodedOutput');
    const loadingMessage = document.getElementById('loading');
    const errorMessage = document.getElementById('error-message');

    // Muestra/oculta los campos de clave según el cifrado
    cipherSelect.addEventListener('change', () => {
        vigenereKeyGroup.classList.add('hidden');
        cesarKeyGroup.classList.add('hidden');
        scytaleKeyGroup.classList.add('hidden');
        playfairKeyGroup.classList.add('hidden');
        if (cipherSelect.value === 'vigenere') {
            vigenereKeyGroup.classList.remove('hidden');
        } else if (cipherSelect.value === 'cesar') {
            cesarKeyGroup.classList.remove('hidden');
        } else if (cipherSelect.value === 'scytale') {
            scytaleKeyGroup.classList.remove('hidden');
        } else if (cipherSelect.value === 'playfair') {
            playfairKeyGroup.classList.remove('hidden');
        }
    });

    // --- Funciones de Decodificación ---
    function decodeBase64(str) {
        try {
            return atob(str);
        } catch (e) {
            return null;
        }
    }

    function decodeROT13(str) {
        return str.replace(/[a-zA-Z]/g, function(c) {
            return String.fromCharCode((c <= 'Z' ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26);
        });
    }

    function decodeCesar(str, shift) {
        let result = '';
        for (let i = 0; i < str.length; i++) {
            let charCode = str.charCodeAt(i);
            if (charCode >= 65 && charCode <= 90) { // Mayúsculas
                result += String.fromCharCode(((charCode - 65 - shift + 26) % 26) + 65);
            } else if (charCode >= 97 && charCode <= 122) { // Minúsculas
                result += String.fromCharCode(((charCode - 97 - shift + 26) % 26) + 97);
            } else {
                result += str.charAt(i);
            }
        }
        return result;
    }

    function decodeVigenere(str, key) {
        let result = '';
        let keyIndex = 0;
        key = key.toLowerCase();
        for (let i = 0; i < str.length; i++) {
            let charCode = str.charCodeAt(i);
            if (charCode >= 65 && charCode <= 90) { // Mayúsculas
                let keyShift = key.charCodeAt(keyIndex % key.length) - 97;
                result += String.fromCharCode(((charCode - 65 - keyShift + 26) % 26) + 65);
                keyIndex++;
            } else if (charCode >= 97 && charCode <= 122) { // Minúsculas
                let keyShift = key.charCodeAt(keyIndex % key.length) - 97;
                result += String.fromCharCode(((charCode - 97 - keyShift + 26) % 26) + 97);
                keyIndex++;
            } else {
                result += str.charAt(i);
            }
        }
        return result;
    }

    function decodeAtbash(str) {
        let result = '';
        for (let i = 0; i < str.length; i++) {
            let charCode = str.charCodeAt(i);
            if (charCode >= 65 && charCode <= 90) { // Mayúsculas
                result += String.fromCharCode(90 - (charCode - 65));
            } else if (charCode >= 97 && charCode <= 122) { // Minúsculas
                result += String.fromCharCode(122 - (charCode - 97));
            } else {
                result += str.charAt(i);
            }
        }
        return result;
    }

    function decodePolybius(str) {
        const polybiusTable = {
            '11': 'a', '12': 'b', '13': 'c', '14': 'd', '15': 'e',
            '21': 'f', '22': 'g', '23': 'h', '24': 'i', '25': 'j', // No tiene k
            '31': 'l', '32': 'm', '33': 'n', '34': 'o', '35': 'p',
            '41': 'q', '42': 'r', '43': 's', '44': 't', '45': 'u',
            '51': 'v', '52': 'w', '53': 'x', '54': 'y', '55': 'z'
        };
        let result = '';
        let cleanStr = str.replace(/[^0-9]/g, '');
        if (cleanStr.length % 2 !== 0) return 'Error: Longitud impar.';
        for (let i = 0; i < cleanStr.length; i += 2) {
            let pair = cleanStr.substring(i, i + 2);
            result += polybiusTable[pair] || '';
        }
        return result;
    }

    function decodeScytale(str, key) {
        if (!key || key <= 1) return 'Error: La clave debe ser mayor que 1.';
        const cleanStr = str.replace(/[^a-zA-Z]/g, '');
        const cols = key;
        const rows = Math.ceil(cleanStr.length / cols);
        const resultMatrix = Array(rows).fill(0).map(() => Array(cols).fill(''));
        let k = 0;
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                if (k < cleanStr.length) {
                    resultMatrix[j][i] = cleanStr[k++];
                }
            }
        }
        let result = '';
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                result += resultMatrix[i][j];
            }
        }
        return result;
    }

    function createPlayfairSquare(key) {
        const alphabet = 'abcdefghiklmnopqrstuvwxyz'; // I/J son la misma
        let keyProcessed = key.toLowerCase().replace(/j/g, 'i').replace(/[^a-z]/g, '');
        let square = '';
        for (let char of keyProcessed + alphabet) {
            if (!square.includes(char)) {
                square += char;
            }
        }
        const matrix = [];
        for (let i = 0; i < 5; i++) {
            matrix.push(square.substring(i * 5, i * 5 + 5).split(''));
        }
        return matrix;
    }

    function decodePlayfair(str, key) {
        const matrix = createPlayfairSquare(key);
        const cleanStr = str.toLowerCase().replace(/[^a-z]/g, '').replace(/j/g, 'i');
        let result = '';

        if (cleanStr.length % 2 !== 0) {
            return "Error: El texto cifrado debe tener una longitud par.";
        }

        for (let i = 0; i < cleanStr.length; i += 2) {
            let [c1, c2] = [cleanStr[i], cleanStr[i + 1]];
            let [row1, col1, row2, col2] = [-1, -1, -1, -1];

            for (let r = 0; r < 5; r++) {
                for (let c = 0; c < 5; c++) {
                    if (matrix[r][c] === c1) [row1, col1] = [r, c];
                    if (matrix[r][c] === c2) [row2, col2] = [r, c];
                }
            }
            
            if (row1 === row2) { // Misma fila
                result += matrix[row1][(col1 + 4) % 5] + matrix[row2][(col2 + 4) % 5];
            } else if (col1 === col2) { // Misma columna
                result += matrix[(row1 + 4) % 5][col1] + matrix[(row2 + 4) % 5][col2];
            } else { // Rectángulo
                result += matrix[row1][col2] + matrix[row2][col1];
            }
        }
        return result;
    }
    
    // --- Lógica principal del botón ---
    decodeBtn.addEventListener('click', () => {
        const encryptedText = encryptedInput.value.trim();
        const selectedCipher = cipherSelect.value;
        decodedOutput.value = '';
        errorMessage.classList.add('hidden');
        loadingMessage.classList.remove('hidden');

        if (!encryptedText) {
            errorMessage.textContent = 'Por favor, introduce el texto cifrado.';
            errorMessage.classList.remove('hidden');
            loadingMessage.classList.add('hidden');
            return;
        }

        setTimeout(() => {
            let result = '';
            switch (selectedCipher) {
                case 'auto':
                    result = `--- Detección Automática ---\n\n`;
                    const base64Decoded = decodeBase64(encryptedText);
                    result += `BASE64:\n${base64Decoded || 'No aplicable'}\n\n`;
                    result += `ROT13:\n${decodeROT13(encryptedText)}\n\n`;
                    result += `ATBASH:\n${decodeAtbash(encryptedText)}\n\n`;
                    result += 'CIFRADO CÉSAR (25 posibles resultados):\n';
                    for (let i = 1; i <= 25; i++) {
                        result += `  Desplazamiento ${i}: ${decodeCesar(encryptedText, i)}\n`;
                    }
                    result += '\n(Para Polibio, Scytale, Playfair y Vigenère, por favor, introduce la clave manualmente)';
                    break;
                case 'base64':
                    result = decodeBase64(encryptedText);
                    if (result === null) {
                        errorMessage.textContent = 'El texto no parece ser un Base64 válido.';
                        errorMessage.classList.remove('hidden');
                    }
                    break;
                case 'rot13':
                    result = decodeROT13(encryptedText);
                    break;
                case 'cesar':
                    const cesarShift = parseInt(cesarKeyInput.value);
                    if (isNaN(cesarShift) || cesarShift < 1 || cesarShift > 25) {
                        errorMessage.textContent = 'Introduce un desplazamiento válido (1-25).';
                        errorMessage.classList.remove('hidden');
                        loadingMessage.classList.add('hidden');
                        return;
                    }
                    result = decodeCesar(encryptedText, cesarShift);
                    break;
                case 'vigenere':
                    const vigenereKey = vigenereKeyInput.value.trim();
                    if (!vigenereKey) {
                        errorMessage.textContent = 'Por favor, introduce la clave para Vigenère.';
                        errorMessage.classList.remove('hidden');
                        loadingMessage.classList.add('hidden');
                        return;
                    }
                    result = decodeVigenere(encryptedText, vigenereKey);
                    break;
                case 'atbash':
                    result = decodeAtbash(encryptedText);
                    break;
                case 'polybius':
                    result = decodePolybius(encryptedText);
                    if (result.startsWith('Error')) {
                        errorMessage.textContent = result;
                        errorMessage.classList.remove('hidden');
                    }
                    break;
                case 'scytale':
                    const scytaleKey = parseInt(scytaleKeyInput.value);
                    if (isNaN(scytaleKey) || scytaleKey <= 1) {
                        errorMessage.textContent = 'La clave (ancho del bastón) debe ser un número mayor que 1.';
                        errorMessage.classList.remove('hidden');
                        loadingMessage.classList.add('hidden');
                        return;
                    }
                    result = decodeScytale(encryptedText, scytaleKey);
                    if (result.startsWith('Error')) {
                        errorMessage.textContent = result;
                        errorMessage.classList.remove('hidden');
                    }
                    break;
                case 'playfair':
                    const playfairKey = playfairKeyInput.value.trim();
                    if (!playfairKey) {
                        errorMessage.textContent = 'Por favor, introduce la clave para Playfair.';
                        errorMessage.classList.remove('hidden');
                        loadingMessage.classList.add('hidden');
                        return;
                    }
                    result = decodePlayfair(encryptedText, playfairKey);
                    if (result.startsWith('Error')) {
                        errorMessage.textContent = result;
                        errorMessage.classList.remove('hidden');
                    }
                    break;
            }
            
            decodedOutput.value = result;
            loadingMessage.classList.add('hidden');
        }, 500);
    });
});