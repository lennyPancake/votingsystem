import { observer } from "mobx-react-lite";
import { ProgressBar, Placeholder } from "react-bootstrap";
import style from "../components/VotingResults.module.css";
import { votingStore } from "../store/VotingStore";
import { useEffect } from "react";
const VotingResults = observer(({ sessionId }) => {
  useEffect(() => {
    votingStore.loadResults(sessionId);
  }, [sessionId]);

  const { options, voteCounts, loading } = votingStore;

  if (loading) {
    return (
      <div className={style.main}>
        <h2>Результаты голосования</h2>
        <div className={style.content}>
          <Placeholder className={`${style.placeholder}`} xs={6} />
          <Placeholder className={`${style.placeholder} w-75`} />
          <Placeholder
            className={`${style.placeholder}`}
            style={{ width: "25%" }}
          />
          <Placeholder className={`${style.placeholder}`} xs={6} />
          <Placeholder className={`${style.placeholder}`} xs={6} />
        </div>
      </div>
    );
  }

  const totalVotes = voteCounts.reduce((total, count) => total + count, 0);

  return (
    <div className={style.main}>
      <h2>Результаты голосования</h2>
      <table className={style.table}>
        <thead>
          <tr>
            <th>Вариант</th>
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
                <td width="500px">
                  <ProgressBar
                    variant="success"
                    now={votePercentage}
                    label={`${votePercentage.toFixed(2)}%`}
                    className={style["progress-bar"]}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
});

export default VotingResults;
