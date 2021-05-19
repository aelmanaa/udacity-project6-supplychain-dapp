// SPDX-License-Identifier: MIYA
pragma solidity >=0.8.0;

// Import the library 'Roles'
import "./Roles.sol";

contract DistributorRole {
    event DistributorAdded(address indexed account);
    event DistributorRemoved(address indexed account);

    using Roles for Roles.Role;
    Roles.Role private distributors;

    constructor() {
        _addDistributor(msg.sender);
    }

    modifier onlyDistributor() {
        require(
            isDistributor(msg.sender),
            "Must be distributor to call this functionality!"
        );
        _;
    }

    function isDistributor(address account) public view returns (bool) {
        return distributors.has(account);
    }

    // A person cannot add itself as distributor
    function addDistributor(address account) public onlyDistributor {
        _addDistributor(account);
    }

    function renounceDistributor(address account) public {
        _removeDistributor(account);
    }

    function _addDistributor(address account) internal {
        distributors.add(account);
        emit DistributorAdded(account);
    }

    function _removeDistributor(address account) internal {
        distributors.remove(account);
        emit DistributorRemoved(msg.sender);
    }
}
