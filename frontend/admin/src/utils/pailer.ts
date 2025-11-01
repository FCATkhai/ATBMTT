import { PublicKeyType } from "../types/election";

// -------------------- CÁC HÀM TIỆN ÍCH --------------------

export function serializePublicKey(pk: { n: bigint; g: bigint; n2: bigint }): PublicKeyType {
    // Nên dùng radix 16 (hex) cho các số lớn để tiết kiệm không gian và tránh lỗi BigInt
    return {
        n: pk.n.toString(16),
        g: pk.g.toString(16),
        n2: pk.n2.toString(16)
    }
}

export function deserializePublicKey(data: { n: string; g: string; n2: string }): { n: bigint; g: bigint; n2: bigint } {
    // Dùng radix 16 khi chuyển ngược lại từ chuỗi hex sang BigInt
    return {
        n: BigInt('0x' + data.n), 
        g: BigInt('0x' + data.g),
        n2: BigInt('0x' + data.n2)
    }
}

export const isPrime = (num: bigint): boolean => {
    // 1 và các số nhỏ hơn 1 không phải là số nguyên tố
    if (num <= 1n) return false;
    // 2 và 3 là số nguyên tố
    if (num <= 3n) return true;
    // Chia hết cho 2 hoặc 3
    if (num % 2n === 0n || num % 3n === 0n) return false;
    
    // Thuật toán kiểm tra số nguyên tố cho số nhỏ
    for (let i = 5n; i * i <= num; i = i + 6n) {
        if (num % i === 0n || num % (i + 2n) === 0n) return false;
    }
    return true;
};

// Hàm tạo số ngẫu nhiên dưới dạng BigInt trong phạm vi chữ số.
export const generateRandomBigInt = (numDigits: bigint): bigint => {
    const num = Number(numDigits); // Chuyển sang number để dùng Math.pow

    if (num < 1 || num > 16) { // Giới hạn số chữ số an toàn cho Math.pow
        console.warn(`Độ dài chữ số ${num} không an toàn cho Math.pow. Sử dụng 16.`);
        return generateRandomBigInt(16n);
    }

    // Tính min và max dưới dạng BigInt
    const min = BigInt(10) ** (BigInt(num) - 1n);
    const max = BigInt(10) ** BigInt(num) - 1n; 

    // Tạo số ngẫu nhiên (chỉ là mô phỏng, không phải CSPRNG)
    const range = Number(max - min); 
    const randomNumber = BigInt(Math.floor(Math.random() * range)) + min;
    
    return randomNumber;
};


export const generateRandomPrime = (numDigits: bigint): bigint => {
    if (numDigits < 1n || numDigits > 16n) {
        console.warn(`Độ dài chữ số ${numDigits} không hợp lệ. Sử dụng 5.`);
        numDigits = 5n; 
    }

    const MAX_ATTEMPTS = 5000; // Tăng số lần thử
    let attempts = 0;

    while (attempts < MAX_ATTEMPTS) {
        let randomNumber = generateRandomBigInt(numDigits);
        
        // Luôn làm cho số đó là số lẻ (trừ khi nó là 2)
        if (randomNumber % 2n === 0n && randomNumber !== 2n) {
            randomNumber++;
        }
        
        if (isPrime(randomNumber)) {
            return randomNumber;
        }
        attempts++;
    }

    throw new Error(`Không thể tìm thấy số nguyên tố ${numDigits} chữ số sau ${MAX_ATTEMPTS} lần thử.`);
};

export const gcd = (a: bigint, b: bigint): bigint => {
    while (b) {
        [a, b] = [b, a % b];
    }
    return a;
};


// -------------------- HÀM TẠO KHÓA PAILLIER --------------------

/**
 * Hàm L(u) = (u-1)/n
 */
const L = (u: bigint, n: bigint): bigint => {
    // BigInt tự xử lý phép chia nguyên
    return (u - 1n) / n;
};

// Hàm tìm Modular Multiplicative Inverse (mu = a^-1 mod m)
// Dùng Extended Euclidean Algorithm (cần thiết cho Paillier)
// KHÔNG CÓ HÀM NATIVE. Cần cài đặt thủ công. TẠM GIẢ ĐỊNH trả về 1n.
const modInverse = (a: bigint, m: bigint): bigint => {
    // Đây là nơi bạn sẽ cần Extended Euclidean Algorithm.
    // Vì không có hàm native, ta giả định luôn tìm được inverse cho demo.
    // Nếu bạn muốn triển khai thực tế, bạn phải dùng thư viện hoặc code hàm này.
    console.warn("Cảnh báo: Hàm modInverse đang được giả lập. Cần triển khai thuật toán Euclid mở rộng.");
    return 1n; 
};

// Hàm lũy thừa mô-đun (base^exp mod mod)
// Cần thiết để tính g^lambda mod n^2
const power = (base: bigint, exp: bigint, mod: bigint): bigint => {
    let res = 1n;
    base = base % mod;
    while (exp > 0n) {
        if (exp % 2n === 1n) {
            res = (res * base) % mod;
        }
        exp = exp / 2n;
        base = (base * base) % mod;
    }
    return res;
};


/**
 * Thực hiện logic tạo khóa Paillier (mô phỏng)
 * @param keyLength Số chữ số mong muốn cho n (ví dụ: 4n)
 */
export const generatePaillierKey = (keyLength: bigint): PublicKeyType => {
    
    if (keyLength < 4n || keyLength > 16n) {
         throw new Error("keyLength phải nằm trong khoảng 4n đến 16n cho mục đích demo này.");
    }

    // --- BƯỚC 1 & 2: Chọn p, q và tính n ---
    
    let p: bigint, q: bigint, n: bigint;
    const halfLen = keyLength / 2n;

    do {
        // 2.1. Tạo p (Độ dài chữ số: halfLen + 1)
        p = generateRandomPrime(halfLen + 1n);
        
        // 2.2. Tạo q (Độ dài chữ số: keyLength - (halfLen + 1))
        q = generateRandomPrime(keyLength - halfLen);
        
        n = p * q;
        
        // 2.3. Lặp cho đến khi độ dài chữ số của n khớp với keyLength
    } while (BigInt(n.toString().length) !== keyLength || p === q || gcd(n, (p - 1n) * (q - 1n)) !== 1n); 
    // Thêm điều kiện Paillier: gcd(n, (p-1)(q-1)) = 1

    const pMinus1 = p - 1n;
    const qMinus1 = q - 1n;
    const nSquared = n * n; // n^2
    
    // --- BƯỚC 3: Tính Lambda (Carmichael's function) ---
    
    // gcd(p-1, q-1)
    const gcdPQ = gcd(pMinus1, qMinus1);
    
    // lambda = LCM(p-1, q-1) = ((p-1)*(q-1))/gcd(p-1, q-1)
    const lambda = (pMinus1 * qMinus1) / gcdPQ;


    // --- BƯỚC 4: Chọn Generator g ---
    
    let g: bigint;
    let mu: bigint;
    
    do {
        // Chọn g = n + 1, lựa chọn phổ biến và an toàn
        g = n + 1n; 

        // Tính g^lambda mod n^2 (SỬ DỤNG HÀM POWER ĐÃ TRIỂN KHAI)
        const gLambdaModN2 = power(g, lambda, nSquared); 
        
        // L(g^lambda mod n^2)
        const LValue = L(gLambdaModN2, n);
        
        // gcd(L(g^lambda mod n^2), n)
        const checkGCD = gcd(LValue, n);
        
        if (checkGCD === 1n) {
            // --- BƯỚC 5: Tính Mu (Modular Multiplicative Inverse) ---
            // Mu = (L(g^lambda mod n^2))^(-1) mod n
            
            // SỬ DỤNG HÀM MOD INVERSE GIẢ LẬP
            mu = modInverse(LValue, n); 
            break;
        }
        
        // Nếu không tìm thấy, ta sẽ phải chọn g ngẫu nhiên khác (nhưng g=n+1 thường đủ)
    } while (true);


    // --- Trả về Public Key ---
    
    // Cần gọi serializePublicKey để chuyển BigInt sang chuỗi hex trước khi trả về
    return serializePublicKey({
        n: n,
        g: g,
        n2: nSquared 
    });
};