const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { Web3 } = require("web3");

const web3 = new Web3("http://127.0.0.1:7545");
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Static files
const imageDirectory = path.join(__dirname, "/static/images");
app.use("/static/images", express.static(imageDirectory));

// Route: Get list of images
app.get("/static/images", (req, res) => {
  fs.readdir(imageDirectory, (err, files) => {
    if (err) {
      return res.status(500).json({ error: "Failed to get list of images" });
    }
    res.json(files);
  });
});

// Route: Verify signature
app.post("/signature-verification", (req, res) => {
  const { message, signature, walletAddress } = req.body;
  try {
    const recoveredAddress = web3.eth.accounts.recover(message, signature);
    if (recoveredAddress.toLowerCase() === walletAddress.toLowerCase()) {
      res.json({ verified: true });
    } else {
      res
        .status(400)
        .json({ verified: false, error: "Signature verification failed" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
