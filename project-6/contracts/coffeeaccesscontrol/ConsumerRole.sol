// SPDX-License-Identifier: MIYA
pragma solidity >=0.8.0;

// Import the library 'Roles'
import "./Roles.sol";

contract ConsumerRole {
    event ConsumerAdded(address indexed account);
    event ConsumerRemoved(address indexed account);

    using Roles for Roles.Role;
    Roles.Role private consumers;

    constructor() {
        _addConsumer(msg.sender);
    }

    modifier onlyConsumer() {
        require(
            isConsumer(msg.sender),
            "Must be consumer to call this functionality!"
        );
        _;
    }

    function isConsumer(address account) public view returns (bool) {
        return consumers.has(account);
    }

    // A person cannot add itself as consumer
    function addConsumer(address account) public onlyConsumer {
        _addConsumer(account);
    }

    function renounceConsumer(address account) public {
        _removeConsumer(account);
    }

    function _addConsumer(address account) internal {
        consumers.add(account);
        emit ConsumerAdded(account);
    }

    function _removeConsumer(address account) internal {
        consumers.remove(account);
        emit ConsumerRemoved(msg.sender);
    }
}
