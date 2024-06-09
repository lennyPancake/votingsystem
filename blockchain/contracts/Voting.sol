// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

contract Voting {
    struct VotingSession {
        uint id;
        string name;
        string description;
        string[] options;
        uint endDate;
        bool resultsRevealed;
        address creator;
    }

    VotingSession[] public votingSessions;
    mapping(uint => mapping(string => uint)) public votes;
    mapping(uint => mapping(address => bool)) public hasVoted;
    address public owner;

    event VotingCreated(uint id, string name, string description, uint endDate);
    event Voted(uint sessionId, address voter, string option);
    event VotingEnded(uint id);
    event ResultsRevealed(uint id);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action");
        _;
    }

    modifier onlyCreator(uint _id) {
        require(msg.sender == votingSessions[_id - 1].creator, "Only the creator of the voting session can perform this action");
        _;
    }

    modifier activeVoting(uint _id) {
        require(block.timestamp < votingSessions[_id - 1].endDate, "Voting time has expired");
        _;
    }

    modifier votingEnded(uint _id) {
        require(block.timestamp >= votingSessions[_id - 1].endDate, "Voting is still active");
        _;
    }

    constructor()  {
        owner = msg.sender;
    }

    function createVoting(
        string memory _name,
        string memory _description,
        string[] memory _options,
        bool revealed,
        uint _endDate
    ) public {
        require(_endDate > block.timestamp, "The end date must be in the future");

        VotingSession memory newVoting = VotingSession({
            id: votingSessions.length + 1,
            name: _name,
            description: _description,
            options: _options,
            endDate: _endDate,
            resultsRevealed: revealed,
            creator: msg.sender
        });

        votingSessions.push(newVoting);
        emit VotingCreated(newVoting.id, _name, _description, _endDate);
    }

    function getVotingSession(uint _id) public view returns (
        string memory,
        string memory,
        string[] memory,
        uint,
        bool,
        address,
        bool
    ) {
        require(_id > 0 && _id <= votingSessions.length, "Invalid voting ID");
        VotingSession storage session = votingSessions[_id - 1];
        return (
            session.name,
            session.description,
            session.options,
            session.endDate,
            block.timestamp < session.endDate,
            session.creator,
            session.resultsRevealed
        );
    }

    function getVotingSessions() public view returns (
        uint[] memory,
        string[] memory,
        string[] memory,
        uint[] memory,
        bool[] memory,
        address[] memory
    ) {
        uint length = votingSessions.length;

        uint[] memory ids = new uint[](length);
        string[] memory names = new string[](length);
        string[] memory descriptions = new string[](length);
        uint[] memory endDates = new uint[](length);
        bool[] memory activeStatuses = new bool[](length);
        address[] memory creators = new address[](length);

        for (uint i = 0; i < length; i++) {
            VotingSession storage session = votingSessions[i];
            ids[i] = session.id;
            names[i] = session.name;
            descriptions[i] = session.description;
            endDates[i] = session.endDate;
            activeStatuses[i] = block.timestamp < session.endDate;
            creators[i] = session.creator;
        }

        return (ids, names, descriptions, endDates, activeStatuses, creators);
    }

    function getVotingSessionOptions(uint _id) public view returns (string[] memory) {
        require(_id > 0 && _id <= votingSessions.length, "Invalid voting ID");
        VotingSession storage session = votingSessions[_id - 1];
        return session.options;
    }

    function vote(uint _id, string memory _option) public activeVoting(_id) {
        VotingSession storage session = votingSessions[_id - 1];
        require(!hasVoted[_id][msg.sender], "You have already voted");

        bool optionExists = false;
        for (uint i = 0; i < session.options.length; i++) {
            if (keccak256(abi.encodePacked(session.options[i])) == keccak256(abi.encodePacked(_option))) {
                optionExists = true;
                break;
            }
        }
        require(optionExists, "Voting option does not exist");

        votes[_id][_option]++;
        hasVoted[_id][msg.sender] = true;
        emit Voted(_id, msg.sender, _option);
    }

    function getVotes(uint _id) public view returns (string[] memory, uint[] memory) {
        require(_id > 0 && _id <= votingSessions.length, "Invalid voting ID");
        VotingSession storage session = votingSessions[_id - 1];

        uint optionsLength = session.options.length;
        uint[] memory voteCounts = new uint[](optionsLength);

        for (uint i = 0; i < optionsLength; i++) {
            voteCounts[i] = votes[_id][session.options[i]];
        }

        return (session.options, voteCounts);
    }

    function revealResults(uint _id) public onlyCreator(_id) votingEnded(_id) {
        VotingSession storage session = votingSessions[_id - 1];
        require(!session.resultsRevealed, "Results have already been revealed");

        session.resultsRevealed = true;
        emit ResultsRevealed(_id);
    }

    function hasUserVoted(uint _id, address _user) public view returns (bool) {
        return hasVoted[_id][_user];
    }

   function endVoting(uint _id) public onlyCreator(_id) {
    votingSessions[_id - 1].endDate = block.timestamp;
    emit VotingEnded(_id);
}
}
