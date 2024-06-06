const Voting = artifacts.require("Voting");

contract("Voting", (accounts) => {
  it("should create a voting session", async () => {
    const votingInstance = await Voting.deployed();
    const name = "Test Voting";
    const description = "This is a test voting session";
    const options = ["Option 1", "Option 2"];
    const endDate = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now

    await votingInstance.createVoting(name, description, options, endDate, {
      from: accounts[0],
    });

    const votingSession = await votingInstance.votingSessions(0);

    assert.equal(votingSession.name, name, "Voting name does not match");
    assert.equal(
      votingSession.description,
      description,
      "Voting description does not match"
    );
    assert.equal(
      votingSession.options.length,
      options.length,
      "Voting options length does not match"
    );
    assert.equal(
      votingSession.endDate.toNumber(),
      endDate,
      "Voting end date does not match"
    );
  });
});
