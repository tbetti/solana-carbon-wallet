const { Router } = require('express');
const { Connection, PublicKey } = require('@solana/web3.js');
const nacl = require('tweetnacl');
const bs58 = require('bs58');

const router = Router();
// need to fix below to use an actual url then check line 14
// const connection = new Connection(process.env.SOLANA_RPC_URL || "confirmed");

// Get SOL balance for a wallet
router.get("/balance/:address", async(req, res) => {
    try{
        const pubkey = new PublicKey(req.params.address);
        // const balance = await connection.getBalance(pubkey);
        res.json({balance: balance / 1e9});
    } catch (error) {
        res.status(400).json({error: "Invalid address"});
    }
})

// Verify wallet signature (basic auth check)
router.post ("/verify-signature", async(req, res) => {
    try {
        const {publicKey, signature, message} = req.body;

        const isValid = nacl.sign.detached.verify(
            new TextEncoder().encode(message),
            bs58.decode(signature),
            bs58.decode(publicKey)
        )
        if(isValid){
            res.json({successs: true, message: "Signature is valid"});
        } else {
            res.status(401).json({ success: false, message: "Invalid signature" });
        }
    } catch (error) {
        res.status(400).json({error: "Error verifying signature"});
    }
})

module.exports = router;
