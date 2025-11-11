/**
 * Paillier cryptosystem basic implementation (browser-safe)
 * - Không dùng Node 'crypto', chỉ dùng Web Crypto API
 */

 /* -------------------------
    Utilities for BigInt math
    ------------------------- */

function modMul(a: bigint, b: bigint, m: bigint): bigint {
    return (a * b) % m
}

function modPow(base: bigint, exp: bigint, mod: bigint): bigint {
    if (mod === 1n) return 0n
    let result = 1n
    let b = base % mod
    let e = exp
    while (e > 0n) {
        if (e & 1n) result = (result * b) % mod
        e >>= 1n
        b = (b * b) % mod
    }
    return result
}

function egcd(a: bigint, b: bigint): [bigint, bigint, bigint] {
    if (b === 0n) return [a, 1n, 0n]
    const [g, x1, y1] = egcd(b, a % b)
    return [g, y1, x1 - (a / b) * y1]
}

function modInv(a: bigint, m: bigint): bigint {
    const [g, x] = (() => {
        const t = egcd(a < 0n ? ((a % m) + m) % m : a, m)
        return [t[0], t[1]]
    })()
    if (g !== 1n) throw new Error('modInv: inverse does not exist')
    return ((x % m) + m) % m
}

function gcd(a: bigint, b: bigint): bigint {
    while (b !== 0n) {
        const t = a % b
        a = b
        b = t
    }
    return a < 0n ? -a : a
}

function lcm(a: bigint, b: bigint): bigint {
    return (a / gcd(a, b)) * b
}

/* -------------------------
   Random BigInt / Primes
   ------------------------- */

function getRandomBytes(byteLength: number): Uint8Array {
    const buf = new Uint8Array(byteLength)
    crypto.getRandomValues(buf)
    return buf
}

/** produce a random BigInt of specified bitLength */
function randomBigInt(bitLength: number): bigint {
    const byteLength = Math.ceil(bitLength / 8)
    const buf = getRandomBytes(byteLength)
    const firstByte = buf[0]
    const topBits = bitLength % 8
    if (topBits === 0) buf[0] = firstByte | 0x80
    else buf[0] = firstByte | (1 << (topBits - 1))
    return BigInt('0x' + Array.from(buf).map(b => b.toString(16).padStart(2, "0")).join(""))
}

/** Miller-Rabin probable prime test */
function isProbablePrime(n: bigint, k = 8): boolean {
    if (n === 2n || n === 3n) return true
    if (n < 2n || n % 2n === 0n) return false

    let s = 0n
    let d = n - 1n
    while ((d & 1n) === 0n) {
        d >>= 1n
        s += 1n
    }

    for (let i = 0; i < k; i++) {
        const a = 2n + (randomBigInt(n.toString(2).length) % (n - 4n))
        let x = modPow(a, d, n)
        if (x === 1n || x === n - 1n) continue
        let cont = false
        for (let r = 1n; r < s; r++) {
            x = (x * x) % n
            if (x === n - 1n) {
                cont = true
                break
            }
        }
        if (cont) continue
        return false
    }
    return true
}

function generatePrime(bitLength: number): bigint {
    while (true) {
        let p = randomBigInt(bitLength)
        p |= 1n
        if (isProbablePrime(p)) return p
    }
}

/* -------------------------
   Paillier primitives
   ------------------------- */

function L(u: bigint, n: bigint): bigint {
    return (u - 1n) / n
}

export async function generateKeypair(keyBits = 512) {
    const pBits = Math.floor(keyBits / 2) + 1
    const qBits = Math.floor(keyBits / 2)
    let p: bigint, q: bigint, n: bigint
    while (true) {
        p = generatePrime(pBits)
        q = generatePrime(qBits)
        if (p === q) continue
        n = p * q
        if (n.toString(2).length === keyBits) break
    }

    const n2 = n * n
    const lambda = lcm(p - 1n, q - 1n)

    let g: bigint
    let mu: bigint
    for (;;) {
        g = randomBigInt(n2.toString(2).length) % n2
        if (g <= 1n) continue
        const gl = modPow(g, lambda, n2)
        const lVal = L(gl, n)
        if (gcd(lVal, n) === 1n) {
            mu = modInv(lVal % n, n)
            break
        }
    }

    return {
        publicKey: { n, g, n2 },
        privateKey: { lambda, mu }
    }
}

export function encrypt(publicKey: { n: string; g: string; n2: string }, m: bigint) {
    
    const { n, g, n2 } = deserializePublicKey(publicKey)

    if (m < 0n || m >= n) throw new Error('message out of range')

    let r: bigint
    do {
        r = randomBigInt(n.toString(2).length) % n
        if (r === 0n) r = 1n
    } while (gcd(r, n) !== 1n)

    const gm = modPow(g, m, n2)
    const rn = modPow(r, n, n2)
    return (gm * rn) % n2
}

export function decrypt(publicKey: { n: bigint; n2: bigint }, privateKey: { lambda: bigint; mu: bigint }, c: bigint) {
    const { n, n2 } = publicKey
    const { lambda, mu } = privateKey
    const u = modPow(c, lambda, n2)
    const lOfU = L(u, n)
    return (lOfU * mu) % n
}

export function homomorphicAdd(publicKey: { n: bigint; n2: bigint }, c1: bigint, c2: bigint) {
    return (c1 * c2) % publicKey.n2
}

export function homomorphicScalarMul(publicKey: { n: bigint; n2: bigint }, c: bigint, k: bigint) {
    return modPow(c, k, publicKey.n2)
}

export function serializePublicKey(pk: { n: bigint; g: bigint; n2: bigint }) {
    return {
        n: pk.n.toString(16),
        g: pk.g.toString(16),
        n2: pk.n2.toString(16)
    }
}

export function deserializePublicKey(data: { n: string; g: string; n2: string }) {
    return {
        n: BigInt('0x' + data.n),
        g: BigInt('0x' + data.g),
        n2: BigInt('0x' + data.n2)
    }
}

export function serializePrivateKey(sk: { lambda: bigint; mu: bigint }) {
    return {
        lambda: sk.lambda.toString(16),
        mu: sk.mu.toString(16)
    }
}

export function deserializePrivateKey(data: { lambda: string; mu: string }) {
    return {
        lambda: BigInt('0x' + data.lambda),
        mu: BigInt('0x' + data.mu)
    }
}
