import { makeAutoObservable, action } from "mobx";
import Web3 from "web3";
import { VOTING_ABI, VOTING_ADDRESS } from "../config";

class VotingStore {
  options = [];
  voteCounts = [];
  loading = true;

  constructor() {
    makeAutoObservable(this, {
      loadResults: action,
      setOptions: action,
      setVoteCounts: action,
      setLoading: action,
    });
  }

  setOptions(options) {
    this.options = options;
  }

  setVoteCounts(voteCounts) {
    this.voteCounts = voteCounts;
  }

  setLoading(loading) {
    this.loading = loading;
  }
  async loadResults(sessionId) {
    this.setLoading(true);
    try {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });

        const contract = new web3.eth.Contract(VOTING_ABI, VOTING_ADDRESS);
        const options = await contract.methods
          .getVotingSessionOptions(sessionId)
          .call();
        const votesData = await contract.methods.getVotes(sessionId).call();

        this.setOptions(options);
        this.setVoteCounts(
          votesData[1].map((voteCount) => parseInt(voteCount, 10))
        );
      } else {
        console.error("Провайдер Ethereum не найден");
      }
    } catch (error) {
      console.error("Ошибка загрузки результатов голосования:", error);
    } finally {
      this.setLoading(false);
    }
  }
}

export const votingStore = new VotingStore();
