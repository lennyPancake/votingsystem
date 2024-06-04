import React, { useEffect, useState } from "react";
import { VOTING_ABI, VOTING_ADDRESS } from "../config";
import Web3 from "web3";
import { useParams } from "react-router-dom";
import ProgressBar from "react-bootstrap/ProgressBar";
import { Placeholder } from "react-bootstrap";
import style from "../components/VotingResults.module.css";

const VotingResults = ({ sessionId }) => {
  const [options, setOptions] = useState([]);
  const [voteCounts, setVoteCounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadResults = async () => {
      try {
        if (window.ethereum) {
          const web3 = new Web3(window.ethereum);

          // Запрос доступа к аккаунтам пользователя
          await window.ethereum.request({ method: "eth_requestAccounts" });

          const contract = new web3.eth.Contract(VOTING_ABI, VOTING_ADDRESS);

          // Логирование перед вызовом методов контракта
          console.log("ABI:", VOTING_ABI);
          console.log("Contract Address:", VOTING_ADDRESS);
          console.log("Voting Session ID:", sessionId);

          // Получение опций голосования
          const options = await contract.methods
            .getVotingSessionOptions(sessionId)
            .call();
          console.log("Options:", options);

          // Получение результатов голосования
          const votesData = await contract.methods.getVotes(sessionId).call();
          console.log("Votes Data:", votesData);

          setOptions(options); // Массив опций
          setVoteCounts(
            votesData[1].map((voteCount) => parseInt(voteCount, 10))
          ); // Массив количества голосов
          setLoading(false);
        } else {
          console.error("Провайдер Ethereum не найден");
        }
      } catch (error) {
        console.error("Ошибка загрузки результатов голосования:", error);
        setLoading(false);
      }
    };

    loadResults();
  }, [sessionId]);

  if (loading) {
    return (
      <div className={style.main}>
        <h2>Результаты голосования</h2>
        <div className={style.content}>
          <Placeholder xs={6} />
          <Placeholder className="w-75" />{" "}
          <Placeholder style={{ width: "25%" }} />
          <Placeholder xs={6} />
          <Placeholder xs={6} />
        </div>
      </div>
    );
  }

  const totalVotes = voteCounts.reduce((total, count) => total + count, 0);

  return (
    <div className={style.main}>
      <h2>Результаты голосования</h2>
      <table>
        <thead>
          <tr>
            <th>Опция</th>
            <th>Голоса</th>
            <th>Процент</th>
          </tr>
        </thead>
        <tbody>
          {options.map((option, index) => {
            const votePercentage =
              totalVotes > 0 ? (voteCounts[index] / totalVotes) * 100 : 0;
            return (
              <tr key={index}>
                <td>{option}</td>
                <td>{voteCounts[index]}</td>
                {votePercentage > 0 && (
                  <td width="500px">
                    <ProgressBar
                      variant="success"
                      now={votePercentage}
                      label={`${votePercentage.toFixed(2)}%`}
                    />
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default VotingResults;
