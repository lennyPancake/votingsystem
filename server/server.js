const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
var { Web3 } = require("web3");
var web3 = new Web3("http://127.0.0.1:7545");
const app = express();
app.use(cors());
app.use(express.json());
const imageDirectory = path.join(__dirname, "/static/images");
app.use("/static/images", express.static(imageDirectory));
app.get("/static/images", (req, res) => {
  fs.readdir(imageDirectory, (err, files) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "Не удалось получить список изображений" });
    }
    res.json(files);
  });
});
app.post("/signature-verification", (req, res) => {
  // Получение данных из тела запроса
  const { message, signature, walletAddress } = req.body;
  try {
    // Валидация подписи
    const recoveredAddress = web3.eth.accounts.recover(message, signature);

    // Сравнение адресов
    if (recoveredAddress.toLowerCase() === walletAddress.toLowerCase()) {
      // Если адреса совпадают, отправляем успешный ответ
      res.json({ verified: true });
    } else {
      // Если адреса не совпадают, отправляем ошибку
      res
        .status(400)
        .json({ verified: false, error: "Signature verification failed" });
    }
  } catch (error) {
    // Если произошла ошибка, отправляем её
    res.status(500).json({ error: error.message });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
