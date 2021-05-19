// SPDX-License-Identifier: MIYA
pragma solidity >=0.8.0;

// Import the library 'Roles'
import "./Roles.sol";

contract RetailerRole {
    event RetailerAdded(address indexed account);
    event RetailerRemoved(address indexed account);

    using Roles for Roles.Role;
    Roles.Role private retailers;

    constructor() {
        _addRetailer(msg.sender);
    }

    modifier onlyRetailer() {
        require(
            isRetailer(msg.sender),
            "Must be retailer to call this functionality!"
        );
        _;
    }

    function isRetailer(address account) public view returns (bool) {
        return retailers.has(account);
    }

    // Define a function 'addRetailer' that adds this role
    function addRetailer(address account) public onlyRetailer {
        _addRetailer(account);
    }

    function renounceRetailer(address account) public {
        _removeRetailer(account);
    }

    function _addRetailer(address account) internal {
        retailers.add(account);
        emit RetailerAdded(account);
    }

    function _removeRetailer(address account) internal {
        retailers.remove(account);
        emit RetailerRemoved(msg.sender);
    }
}
