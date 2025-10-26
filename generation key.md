# Key generation process

1. Define the bit length of the modulus n, or keyLength in bits.
2. Choose two large prime numbers p and q randomly and independently of each other such that gcd(p*q, (p-1)(q-1)) = 1 and n = p\*q has a key length of keyLength. For instance:
   1. Generate a random prime p with a bit length of keyLength/2 + 1.
   2. Generate a random prime q with a bit length of keyLength/2.
   3. Repeat until the bitlength of n=p·q is keyLength.

3. Calculate Carmichael’s function that can be computed with:
    `λ = ((p-1)*(q-1))/gcd(p-1,q-1)`
4. Select random g as generator where $g\in \mathbb{Z}_{n^{2}}^{*}$ with:
   $\gcd\left(\frac{g^{\lambda } mod\ n^{2} -1}{n} ,\ n\right) =1$
5. Find modular multiplicative inverse with:
   $\mu =\left( L\left( g^{\lambda } \ mod\ n^{2}\right)\right)^{-1} mod\ n$
   The function L is define as L(u) = (u-1)/n

After following those four steps above, we could get the public key for encryption (n, g) and the private key for decryption (λ, μ).