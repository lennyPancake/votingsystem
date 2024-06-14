import React, { useState, useEffect } from "react";
import Web3 from "web3";
import { VOTING_ABI, VOTING_ADDRESS } from "../config";
import style from "./Voting.module.css";
import { useNavigate, useParams } from "react-router-dom";
import { ListGroup, ListGroupItem, Placeholder, Button } from "react-bootstrap";
import VotingResults from "../components/VotingResults";
import { useMetaMask } from "../hooks/useMetaMask";
import withAuth from "../components/withAuth";
import { votingStore } from "../store/VotingStore";

const Voting = () => {
  const { id } = useParams();
  const [votingSession, setVotingSession] = useState(null);
  const [selectedOption, setSelectedOption] = useState("");
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [winners, setWinners] = useState([]);
  const [timeleft, setTimeLeft] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const { wallet, hasProvider, isSigning, isConnecting, connectMetaMask } =
    useMetaMask();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVotingSession = async () => {
      try {
        const web3 = new Web3(window.ethereum);
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const contractInstance = new web3.eth.Contract(
          VOTING_ABI,
          VOTING_ADDRESS
        );
        const sessionId = id; // Get the voting session ID from the URL params
        const votingData = await contractInstance.methods
          .getVotingSession(sessionId)
          .call();
        const {
          0: name,
          1: description,
          2: options,
          3: endDate,
          4: isActive,
          5: creator,
          6: resultRevealed,
        } = votingData;

        const sessionData = {
          id: sessionId,
          name,
          description,
          endDate: Number(endDate),
          isActive,
          creator,
          options,
          resultRevealed,
        };

        setVotingSession(sessionData);
        if (sessionData.creator.toLowerCase() === wallet.accounts[0]) {
          setIsOwner(true);
        }
        const userHasVoted = await contractInstance.methods
          .hasUserVoted(sessionId, accounts[0])
          .call();
        if (Date.now() >= sessionData.endDate * 1000) {
          setTimeLeft(true);
          const voteCounts = await contractInstance.methods
            .getVotes(sessionId)
            .call();

          const maxVotes = Number(
            voteCounts[1].reduce(
              (max, vote) => (Number(vote) > max ? Number(vote) : max),
              Number(voteCounts[1][0])
            )
          );
          if (maxVotes !== 0) {
            const winningOptions = voteCounts[1]
              .map((vote, index) =>
                Number(vote) === maxVotes ? voteCounts[0][index] : null
              )
              .filter((option) => option !== null);
            setWinners(winningOptions);
          } else {
            setWinners(["Нет голосов"]);
          }
        }

        setHasVoted(userHasVoted);
        setLoading(false);
      } catch (error) {
        console.error("Ошибка при получении сессии голосования", error);
        setLoading(false);
      }
    };

    fetchVotingSession();
  }, [id]);

  const vote = async () => {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const web3 = new Web3(window.ethereum);
      const contractInstance = new web3.eth.Contract(
        VOTING_ABI,
        VOTING_ADDRESS
      );

      await contractInstance.methods
        .vote(id, selectedOption)
        .send({ from: accounts[0] });
      console.log("Голос успешно подан!");
      setHasVoted(true);

      // Обновление результатов голосования
      votingStore.loadResults(id);
    } catch (error) {
      console.error("Ошибка при голосовании", error);
    }
  };

  const endVoting = async () => {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const web3 = new Web3(window.ethereum);
      const contractInstance = new web3.eth.Contract(
        VOTING_ABI,
        VOTING_ADDRESS
      );

      await contractInstance.methods.endVoting(id).send({ from: accounts[0] });
      console.log("Сессия голосования успешно отключена!");
      navigate("/voting");
    } catch (error) {
      console.error("Ошибка при отключении сессии голосования", error);
    }
  };

  const revealResults = async () => {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const web3 = new Web3(window.ethereum);
      const contractInstance = new web3.eth.Contract(
        VOTING_ABI,
        VOTING_ADDRESS
      );

      await contractInstance.methods
        .revealResults(id)
        .send({ from: accounts[0] });
      navigate("/voting");
    } catch (error) {
      console.error("Ошибка при открытии результатов.", error);
    }
  };

  if (loading) {
    return (
      <div className={style.main}>
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

  if (!votingSession) {
    return <div>Сессия голосования не найдена</div>;
  }

  return (
    <div className={style.main}>
      <div className={style.content}>
        <h2>Голосование: {votingSession.name}</h2>
        {isOwner && (
          <div style={{ display: "flex", float: "right" }}>
            {!votingSession.resultRevealed && (
              <Button variant="outline-success" onClick={revealResults}>
                Отобразить результаты
              </Button>
            )}
            {votingSession.isActive && (
              <Button variant="outline-danger" onClick={endVoting}>
                Закончить голосование
              </Button>
            )}
          </div>
        )}
        <div key={votingSession.id} className={style.session}>
          <h3>{votingSession.name}</h3>
          <p>
            <b>Описание:</b> {votingSession.description}
          </p>
          <p>
            <b>Дата завершения:</b>{" "}
            {new Date(votingSession.endDate * 1000).toLocaleString()}
          </p>
          {!timeleft && votingSession.isActive && !hasVoted && (
            <div>
              <label>Выберите вариант:</label>
              <div className={style.list}>
                <ListGroup size="lg" data-bs-theme="dark">
                  {votingSession.options.map((option, index) => (
                    <ListGroupItem
                      key={index}
                      action
                      variant="secondary"
                      active={selectedOption === option}
                      onClick={() => setSelectedOption(option)}
                    >
                      {option}
                    </ListGroupItem>
                  ))}
                </ListGroup>
              </div>

              <button onClick={vote} disabled={selectedOption === ""}>
                Голосовать
              </button>
            </div>
          )}

          {timeleft &&
            (winners[0] !== "Нет голосов" ? (
              <div>
                <h3>
                  Победитель{winners.length > 1 ? "и" : ""}:{" "}
                  {winners.join(", ")}
                </h3>

                <button
                  style={{
                    marginBottom: "10px",
                    marginLeft: "10px",
                    textDecoration: "underline",
                  }}
                  onClick={() => {
                    navigate("/voting");
                  }}
                >
                  Назад
                </button>
              </div>
            ) : (
              <div>
                <h3>Победитель не определился, недостаточно голосов.</h3>{" "}
                <button
                  style={{
                    marginBottom: "10px",
                    marginLeft: "10px",
                    textDecoration: "underline",
                  }}
                  onClick={() => {
                    navigate("/voting");
                  }}
                >
                  Назад
                </button>
              </div>
            ))}
          {!loading && votingSession.resultRevealed && (
            <VotingResults sessionId={id} />
          )}
          {hasVoted && (
            <div style={{ display: "flex", alignItems: "center" }}>
              <p style={{ margin: "0" }}>
                Вы уже проголосовали в этой сессии голосования.
              </p>
              <button
                style={{
                  marginBottom: "10px",
                  marginLeft: "10px",
                  textDecoration: "underline",
                }}
                onClick={() => {
                  navigate("/voting");
                }}
              >
                Назад
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default withAuth(Voting);
