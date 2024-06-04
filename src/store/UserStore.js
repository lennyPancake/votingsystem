import { makeAutoObservable } from "mobx";
class UserStore {
  users = [];
  mainUser = {
    name: "",
    email: "",
  };
  isLoading = false;

  constructor() {
    makeAutoObservable(this);
    this.isLoading = false;
  }
}

export default UserStore;
