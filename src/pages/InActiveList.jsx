import React, { useState, useEffect } from "react";
import Web3 from "web3";
import { VOTING_ABI, VOTING_ADDRESS } from "../config";
import style from "./List.module.css";
import withAuth from "../components/withAuth";
import { useNavigate } from "react-router";

const InActiveList = () => {
  const [votingSessions, setVotingSessions] = useState([]);
  const navigate = useNavigate();
  const active = false;
  useEffect(() => {
    console.log("list");
    const fetchData = async () => {
      const web3 = new Web3(window.ethereum);
      const contract = new web3.eth.Contract(VOTING_ABI, VOTING_ADDRESS);
      const votingData = await contract.methods.getVotingSessions().call();

      const {
        0: ids,
        1: names,
        2: descriptions,
        3: endDates,
        4: statuses,
        5: creators,
      } = votingData;

      const sessions = ids.map((id, index) => ({
        id,
        name: names[index],
        description: descriptions[index],
        endDate: Number(endDates[index]),
        isActive: statuses[index],
        creator: creators[index],
      }));

      setVotingSessions(sessions);
    };
    console.log("сказча");
    fetchData();
    console.log(active);
  }, []);

  return (
    <div className={style.main}>
      <h2>Список голосований</h2>
      {votingSessions.length === 0 ? (
        <p>Нет доступных голосований.</p>
      ) : (
        <ul className={style.list}>
          {votingSessions.some((session) => session.isActive === active) ? (
            votingSessions
              .filter((session) => session.isActive === active)
              .map((session) => (
                <li key={session.id} className={style.listItem}>
                  <h3>{session.name}</h3>
                  <p>Описание: {session.description}</p>
                  <p>Создатель: {session.creator}</p>
                  <p>
                    Дата завершения:{" "}
                    {new Date(session.endDate * 1000).toLocaleString()}
                  </p>
                  <p>Активен: {session.isActive ? "Да" : "Нет"}</p>
                  <button
                    onClick={() => {
                      navigate(`/voting/${session.id}`);
                    }}
                  >
                    Подробнее
                  </button>
                </li>
              ))
          ) : (
            <p>Нет неактивных голосований.</p>
          )}
        </ul>
      )}
    </div>
  );
};

export default withAuth(InActiveList);
