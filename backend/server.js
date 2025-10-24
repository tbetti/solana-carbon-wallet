import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Connection, PublicKey} from "@solana/web3.js";
import nacl from 'tweetnacl';
import bs58 from 'bs58';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const connection = new Connection(process.env.SOLANA_RPC_URL || "confirmed");

app.get("/", (req,res) => {
    res.send("Solana Backend is running");
});

// Get SOL balance for a wallet

app.get("/balance/:address", async(req, res) => {
    try{
        const pubkey = new PublicKey(req.params.address);
        const balance = await connection.getBalance(pubkey);
        res.json({balance: balance / 1e9});
    } catch (error) {
        res.status(400).json({error: "Invalid address"});
    }
})

// Verify wallet signature (basic auth check)
app.post ("/verify-signature", async(req, res) => {
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

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});