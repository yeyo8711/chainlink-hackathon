// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";

contract VotingDAO is Ownable {
    uint256 public votingCounter;

    struct Voting {
        bool isActive;
        uint256 month;
        address employeeOfTheMonth;
        mapping(address => bool) votingStatus;
        mapping(address => address) voteTarget;
        mapping(address => uint256) votesReceived;
        address[] eligibleCandidates;
    }

    mapping(uint => Voting) public votingRegistry;

    event VotingCreate(uint month);
    event VotingClosed(uint month);
    event VoteComputed(address votee, address receiver);
    event EmployeeOfTheMonth(address employee, uint month);

    function createNewVoting(
        uint _month,
        address _candidate1,
        address _candidate2,
        address _candidate3
    ) public onlyOwner {
        require(
            !votingRegistry[votingCounter].isActive,
            "A voting section is already live!"
        );
        require(
            _candidate1 != _candidate2 && _candidate2 != _candidate3,
            "Duplicate Candidates"
        );

        Voting storage voting = votingRegistry[votingCounter];

        voting.month = _month;
        voting.isActive = true;

        voting.eligibleCandidates.push(_candidate1);
        voting.eligibleCandidates.push(_candidate2);
        voting.eligibleCandidates.push(_candidate3);

        emit VotingCreate(_month);
    }

    function vote(uint256 _chosenEmployee, address _voter) public onlyOwner {
        require(
            votingRegistry[votingCounter].isActive,
            "No voting section active at the moment."
        );
        require(
            !votingRegistry[votingCounter].votingStatus[_voter],
            "You can only vote once."
        );
        address[] memory candidatesArray = votingRegistry[votingCounter]
            .eligibleCandidates;
        require(_chosenEmployee < 3);

        votingRegistry[votingCounter].votesReceived[
            candidatesArray[_chosenEmployee]
        ]++;
        votingRegistry[votingCounter].voteTarget[_voter] = candidatesArray[
            _chosenEmployee
        ];
        votingRegistry[votingCounter].votingStatus[_voter] = true;

        emit VoteComputed(_voter, candidatesArray[_chosenEmployee]);
    }

    function endVoting() public onlyOwner {
        require(
            votingRegistry[votingCounter].isActive,
            "No voting section active at the moment."
        );
        votingRegistry[votingCounter].isActive = false;
        getMostVotedEmployee();
        emit VotingClosed(votingCounter);
        votingCounter++;
    }

    function getMostVotedEmployee() internal returns (address) {
        address[] storage candidates = votingRegistry[votingCounter]
            .eligibleCandidates;
        address employeeOfTheMonth = candidates[0];
        for (uint i = 1; i < candidates.length; i++) {
            if (
                votingRegistry[votingCounter].votesReceived[candidates[i]] >
                votingRegistry[votingCounter].votesReceived[employeeOfTheMonth]
            ) {
                employeeOfTheMonth = votingRegistry[votingCounter]
                    .eligibleCandidates[i];
            }
        }

        votingRegistry[votingCounter].employeeOfTheMonth = employeeOfTheMonth;
        emit EmployeeOfTheMonth(employeeOfTheMonth, votingCounter);
        return votingRegistry[votingCounter].employeeOfTheMonth;
    }

    //------GETTER FUNCTIONS ---------//
    function getVotingCandidatesByMonth(uint256 _month)
        public
        view
        returns (address[] memory)
    {
        address[] memory candidates = votingRegistry[_month].eligibleCandidates;
        return candidates;
    }

    function hasVoted(uint256 _month, address _voter)
        public
        view
        returns (bool)
    {
        bool voted = votingRegistry[_month].votingStatus[_voter];
        return voted;
    }
}
