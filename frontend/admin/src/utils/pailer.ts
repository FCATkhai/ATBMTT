import { PublicKeyType } from "../types/election";

// -------------------- CÁC HÀM TIỆN ÍCH TOÁN HỌC --------------------

export function serializePublicKey(pk: { n: bigint; g: bigint; n2: bigint }): PublicKeyType {
    return {
        n: pk.n.toString(16),
        g: pk.g.toString(16),
        n2: pk.n2.toString(16)
    }
}

export function deserializePublicKey(data: PublicKeyType): { n: bigint; g: bigint; n2: bigint } {
    return {
        n: BigInt('0x' + data.n), 
        g: BigInt('0x' + data.g),
        n2: BigInt('0x' + data.n2)
    }
}

export const gcd = (a: bigint, b: bigint): bigint => {
    while (b > 0n) {
        let temp = b;
        b = a % b;
        a = temp;
    }
    return a;
};

const lcm = (a: bigint, b: bigint): bigint => {
    return (a === 0n || b === 0n) ? 0n : (a * b) / gcd(a, b);
};

/**
 * Thuật toán Euclid mở rộng (Extended Euclidean Algorithm)
 * Tìm x, y sao cho: ax + by = gcd(a, b)
 * Trả về [g, x, y]
 */
const egcd = (a: bigint, b: bigint): [bigint, bigint, bigint] => {
    if (a === 0n) {
        return [b, 0n, 1n];
    }
    const [g, y, x] = egcd(b % a, a);
    return [g, x - (b / a) * y, y];
};

/**
 * Tìm nghịch đảo Modular (Modular Multiplicative Inverse)
 * Tìm x sao cho: (a * x) % m = 1
 */
const modInverse = (a: bigint, m: bigint): bigint => {
    const [g, x] = egcd(a, m);
    if (g !== 1n) {
        throw new Error('Modular inverse does not exist (a and m are not coprime)');
    }
    // Đảm bảo kết quả là số dương
    return (x % m + m) % m;
};

export const power = (base: bigint, exp: bigint, mod: bigint): bigint => {
    let res = 1n;
    base = base % mod;
    while (exp > 0n) {
        if (exp % 2n === 1n) res = (res * base) % mod;
        base = (base * base) % mod;
        exp /= 2n;
    }
    return res;
};

// -------------------- SINH SỐ NGẪU NHIÊN & NGUYÊN TỐ --------------------

export const isPrime = (num: bigint): boolean => {
    if (num <= 1n) return false;
    if (num <= 3n) return true;
    if (num % 2n === 0n || num % 3n === 0n) return false;
    
    // Kiểm tra nhanh một vài số đầu (tối ưu hiệu năng)
    for (let i = 5n; i * i <= num; i += 6n) {
        if (num % i === 0n || num % (i + 2n) === 0n) return false;
    }
    return true; 
    // Lưu ý: Với số rất lớn (RSA chuẩn), cần dùng thuật toán Miller-Rabin. 
    // Code này ổn cho demo key nhỏ (< 16 digits).
};

export const generateRandomBigInt = (bits: bigint): bigint => {
    // Tạo số ngẫu nhiên trong khoảng nào đó dựa trên số chữ số
    // Đây là cách đơn giản hóa cho JS native BigInt
    const min = 10n ** (bits - 1n);
    const max = (10n ** bits) - 1n;
    const range = max - min;
    
    // Hacky random BigInt (Không an toàn mật mã chuẩn công nghiệp nhưng đủ cho demo)
    const randStr = Array(Number(bits)).fill(0).map(() => Math.floor(Math.random() * 10)).join('');
    let randBig = BigInt(randStr);
    
    if (randBig < min) randBig += min;
    if (randBig > max) randBig = max;
    
    return randBig;
};

/**
 * Giải mã Ciphertext c sử dụng PrivateKey
 * Công thức: m = L(c^lambda mod n^2) * mu mod n
 * * @param publicKey Chứa n, g, n2
 * @param privateKey Chứa lambda, mu
 * @param c Số đã mã hóa (Ciphertext)
 */
export function decrypt(
    publicKey: { n: bigint; g: bigint; n2: bigint }, 
    privateKey: { lambda: bigint; mu: bigint }, 
    c: bigint
): bigint {
    // Destructuring để lấy các tham số cần thiết
    const { n, n2 } = publicKey;
    const { lambda, mu } = privateKey;

    // 1. Tính u = c^lambda mod n^2
    const u = modPow(c, lambda, n2);

    // 2. Tính L(u) = (u - 1) / n
    // Hàm L phải được định nghĩa trong file này: const L = (u: bigint, n: bigint) => (u - 1n) / n;
    const lOfU = L(u, n);

    // 3. Tính m = (L(u) * mu) mod n
    let m = (lOfU * mu) % n;

    // 4. Xử lý trường hợp % ra số âm trong JS
    if (m < 0n) {
        m += n;
    }

    return m;
}

export const generateRandomPrime = (digits: bigint): bigint => {
    const MAX_ATTEMPTS = 10000;
    let attempts = 0;
    while (attempts < MAX_ATTEMPTS) {
        let num = generateRandomBigInt(digits);
        if (num % 2n === 0n) num += 1n; // Đảm bảo lẻ
        if (isPrime(num)) return num;
        attempts++;
    }
    throw new Error("Cannot generate prime");
};

// -------------------- LOGIC PAILLIER CORE --------------------

const L = (u: bigint, n: bigint): bigint => (u - 1n) / n;

const getRandomBigInt = (bits: number): bigint => {
    const byteLength = Math.ceil(bits / 8);
    const array = new Uint8Array(byteLength);
    window.crypto.getRandomValues(array);
    
    // Chuyển Uint8Array sang Hex string rồi sang BigInt
    let hex = "0x";
    for (let i = 0; i < array.length; i++) {
        hex += array[i].toString(16).padStart(2, "0");
    }
    return BigInt(hex);
};

// Sinh số nguyên tố n bit
export const generatePrime = (bits: number): bigint => {
    while (true) {
        // Tạo số lẻ ngẫu nhiên
        let num = getRandomBigInt(bits);
        if (num % 2n === 0n) num += 1n;
        
        // Đảm bảo đủ bit
        if (num.toString(2).length !== bits) continue;

        if (isPrime(num)) return num;
    }
};

function modPow(base: bigint, exp: bigint, mod: bigint): bigint {
    if (mod === 1n) return 0n
    let result = 1n
    let b = base % mod
    let e = exp
    while (e > 0) {
        if (e & 1n) result = (result * b) % mod
        e >>= 1n
        b = (b * b) % mod
    }
    return result
}

/** Modular inverse of a modulo m. Throws if inverse doesn't exist. */
function modInv(a: bigint, m: bigint): bigint {
    const [g, x] = (() => {
        const t = egcd(a < 0n ? ((a % m) + m) % m : a, m)
        return [t[0], t[1]]
    })()
    if (g !== 1n) throw new Error('modInv: inverse does not exist')
    // ensure positive
    return ((x % m) + m) % m
}


/**
 * Hàm tạo khóa Paillier chuẩn.
 * Nhận vào: number (số bit)
 */
export async function generateKeypair(keyBits = 1024) {
    const pBits = Math.floor(keyBits / 2) + 1;
    const qBits = Math.floor(keyBits / 2);

    // 1) generate p and q
    let p: bigint, q: bigint, n: bigint;
    while (true) {
        p = generatePrime(pBits);
        q = generatePrime(qBits);
        if (p === q) continue;
        n = p * q;
        if (n.toString(2).length === keyBits) break;
    }

    const n2 = n * n;

    // 2) lambda
    const lambda = lcm(p - 1n, q - 1n);

    // 3) choose g
    let g: bigint;
    let mu: bigint;
    for (;;) {
        g = getRandomBigInt(n2.toString(2).length) % n2;
        if (g <= 1n) continue;
        
        const gl = modPow(g, lambda, n2);
        const lVal = L(gl, n);
        
        if (gcd(lVal, n) === 1n) {
            mu = modInv(lVal % n, n);
            break;
        }
    }

    // 4) FORMAT OUTPUT CHO BACKEND (String Hex)
    // Sử dụng .toString(16) để chuyển BigInt thành chuỗi Hex
    // Backend sẽ lưu chuỗi này.
    const publicKey = { 
        n: n.toString(16), 
        g: g.toString(16), 
        n2: n2.toString(16) 
    };

    // Private Key lưu cả decimal và hex để tiện xử lý ở client
    const privateKey = { 
        lambda: lambda.toString(), 
        mu: mu.toString(),
        publicKey: { n: n.toString(), g: g.toString() }, // Lưu dạng Decimal string để tránh lỗi parse
        p: p.toString(),
        q: q.toString()
    };

    return { publicKey, privateKey };
}

// --- Wrapper Adapter ---
// Hàm này để tương thích với giao diện cũ đang gọi bằng BigInt
export const generatePaillierKey = async (keyBits: bigint) => {
    return await generateKeypair(Number(keyBits));
};

/**
 * Hàm Mã Hóa (Encryption)
 * c = g^m * r^n mod n^2
 * @param publicKey Khóa công khai (n, g, n2)
 * @param m Thông điệp (ở đây là phiếu bầu: 0 hoặc 1)
 */
export const encrypt = (publicKeyStr: PublicKeyType, m: bigint): bigint => {
    const pub = deserializePublicKey(publicKeyStr);
    
    // 1. Chọn số ngẫu nhiên r sao cho 0 < r < n và gcd(r, n) = 1
    let r: bigint;
    do {
        // Độ dài r tương đương n
        r = generateRandomBigInt(BigInt(pub.n.toString().length)); 
    } while (r >= pub.n || r <= 0n || gcd(r, pub.n) !== 1n);

    // 2. Tính c = (g^m mod n^2) * (r^n mod n^2) mod n^2
    
    // gm = g^m mod n^2
    const gm = power(pub.g, m, pub.n2);
    
    // rn = r^n mod n^2
    const rn = power(r, pub.n, pub.n2);
    
    // c = (gm * rn) mod n^2
    const c = (gm * rn) % pub.n2;

    return c;
};

/**
 * Hàm Cộng đồng cấu (Homomorphic Addition) - Dùng để test ở client nếu cần
 * D(E(m1) * E(m2) mod n^2) = m1 + m2
 */
export const homomorphicAdd = (publicKeyStr: PublicKeyType, c1: bigint, c2: bigint): bigint => {
    const pub = deserializePublicKey(publicKeyStr);
    return (c1 * c2) % pub.n2;
}