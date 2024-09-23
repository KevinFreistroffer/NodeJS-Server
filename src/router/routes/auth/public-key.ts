// import express from "express";
// import fs from "fs";
// import path from "path";
// import {
//   IResponse,
//   responses,
// } from "../../../defs/responses/generic_responses";

// const router = express.Router();

// const { generateKeyPairSync } = require("crypto");

// // Generate RSA key pair
// const { publicKey, privateKey } = generateKeyPairSync("rsa", {
//   modulusLength: 2048, // Key size
//   publicKeyEncoding: {
//     type: "spki", // Recommended format
//     format: "pem",
//   },
//   privateKeyEncoding: {
//     type: "pkcs8", // Recommended format
//     format: "pem",
//   },
// });

// // Save keys to files
// fs.writeFileSync("public.pem", publicKey);
// fs.writeFileSync("private.pem", privateKey);

// console.log("Public Key:", publicKey);
// console.log("Private Key:", privateKey);

// router.get("/", (req: express.Request, res: express.Response) => {
//   try {
//     const publicKeyPath = path.join(__dirname, "../../../../public.pem");
//     const publicKey = fs.readFileSync(publicKeyPath, "utf8");

//     res.json(responses.success({ publicKey }));
//   } catch (error) {
//     console.error("Error reading public key:", error);
//     res.status(500).json(responses.internal_server_error());
//   }
// });

// export = router;
