const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
var { Web3 } = require("web3");
var web3 = new Web3("http://127.0.0.1:7545");
const app = express();
app.use(cors());
app.use(express.json());

app.post("/users", (req, res) => {
  const { walletId, userName } = req.body;
  let data;
  try {
    data = JSON.parse(
      fs.readFileSync(path.resolve(__dirname, "db.json"), "UTF-8")
    );
    const { users = [] } = data;
    const userExists = users.some((user) => user.walletId === walletId);
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }
  } catch (error) {
    console.error("Error reading file:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }

  // Добавление нового пользователя
  data.users.push({ walletId, userName });

  // Запись данных в файл
  try {
    fs.writeFileSync(
      path.resolve(__dirname, "db.json"),
      JSON.stringify(data),
      "utf-8"
    );
  } catch (error) {
    console.error("Error writing file:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }

  // Подтверждение очередности создания
  res.status(200).send({ walletId, userName });
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
