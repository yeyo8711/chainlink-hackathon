// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./Employees.sol";

contract BenefitsToken is ERC20, ERC20Burnable, Ownable {
    Employees employeeContract;
    address employeeContractAddress;

    uint256 public immutable rank1Amount = 100_000;
    uint256 public immutable rank2Amount = 150_000;
    uint256 public immutable rank3Amount = 200_000;
    uint256 public immutable rank4Amount = 300_000;
    mapping(address => bool) public isAdmin;

    modifier onlyEmployeeContract() {
        require(msg.sender == employeeContractAddress);
        _;
    }

    constructor() ERC20("EmployeeToken", "EMP") {
        isAdmin[msg.sender] = true;
    }

    function updateEmployeeContract(address _address) public {
        require(isAdmin[msg.sender]);
        employeeContractAddress = _address;
        employeeContract = Employees(_address);
    }

    function mint(address to, uint256 _rank) external onlyEmployeeContract {
        if (_rank == 1) {
            _mint(to, rank1Amount);
        } else if (_rank == 2) {
            _mint(to, rank2Amount);
        } else if (_rank == 3) {
            _mint(to, rank3Amount);
        } else {
            _mint(to, rank4Amount);
        }
    }

    function replenish(address _address, uint256 _amount)
        public
        onlyEmployeeContract
    {
        _mint(_address, _amount);
    }

    function resignEmployeeTokens(uint256 amount) external {
        require(balanceOf(msg.sender) > 0, "No tokens to burn");
        amount = balanceOf(msg.sender);
        _burn(_msgSender(), amount);
    }

    function _transfer(
        address from,
        address to,
        uint256 amount
    ) internal override {
        require(from != address(0), "ERC20: transfer from the zero address");
        require(to != address(0), "ERC20: transfer to the zero address");
        require(to == address(this), "You cannot transfer tokens");

        super._transfer(from, to, amount);
    }

    ////////// BUY PERKS /////////
    function buyExtraBreak() public {
        require(balanceOf(msg.sender) > 0, "No tokens to left");
        _burn(_msgSender(), 10_000);
    }

    function buyLunch() public {
        require(balanceOf(msg.sender) > 0, "No tokens to left");
        _burn(_msgSender(), 10_000);
    }

    function buyHourOfMassage() public {
        require(balanceOf(msg.sender) > 0, "No tokens to left");
        _burn(_msgSender(), 10_000);
    }

    function buyPlayRoomTime() public {
        require(balanceOf(msg.sender) > 0, "No tokens to left");
        _burn(_msgSender(), 10_000);
    }

    function buyBreakfast() public {
        require(balanceOf(msg.sender) > 0, "No tokens to left");
        _burn(_msgSender(), 10_000);
    }

    function buyYogaSession() public {
        require(balanceOf(msg.sender) > 0, "No tokens to left");
        _burn(_msgSender(), 10_000);
    }

    function buyDayOff() public {
        require(balanceOf(msg.sender) > 0, "No tokens to left");
        _burn(_msgSender(), 100_000);
    }

    // Getters
    function getAmountToRank(uint256 _rank) public returns (uint256) {
        if (_rank == 1) {
            return rank1Amount;
        } else if (_rank == 2) {
            return rank2Amount;
        } else if (_rank == 3) {
            return rank3Amount;
        } else {
            return rank4Amount;
        }
    }
}
