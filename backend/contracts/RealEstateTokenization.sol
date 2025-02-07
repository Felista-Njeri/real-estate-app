// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RealEstateTokenization is ERC20, Ownable {

    //Struct to store property details    images: _images,
    struct Property{
        uint256 propertyId;
        string propertyName;
        string location;
        string images; 
        uint256 totalTokens;
        uint256 tokenPrice;
        uint256 totalDividends;
        address owner;
        bool isActive;
    }

  
    mapping(uint256 => Property) public properties;  //Mapping to store properties by their ID
    mapping(uint256 => mapping(address => uint256)) public investorBalances;  //Mapping to track investor token balances for each property
    mapping(uint256 => mapping(address => uint256)) public claimedDividends;  //Mapping to track claimed dividends for each investor

    //Counter to generate unique property IDs
    uint256 public nextPropertyId;

    
    event PropertyTokenized( uint256 propertyId, string propertyName, uint256 totalTokens, uint256 tokenPrice);  //Event to log Property tokenization
    event TokensPurchased( uint256 propertyId, address investor, uint256 amount);  //Event to log token purchases
    event DividendsDistributed(uint256 propertyId, uint256 totalDividends);  //Event to log dividend distributions
    event DividendsClaimed(uint256 propertyId, address investor, uint256 amount);  //Event to log dividend claims
    event PropertyDeactivated(uint256 propertyId); //Event to log property deactivation
    event FundsWithdrawn(uint256 propertyId, address owner, uint256 amount); //Event to log fund withdrawals

    //Constructor to initialize the ERC20 token with a name and a symbol
    constructor() ERC20("RealEstateToken", "RET") Ownable(msg.sender) {}

    //Function to tokenize a new property
    function tokenizeProperty( string memory _propertyName, string memory _location, string memory _images, uint256 _totalTokens, uint256 _tokenPrice) external onlyOwner {
        require(_totalTokens > 0, "Total tokens must be greater than 0");
        require(_tokenPrice > 0, "Token price must be greater than 0");

        //Generate a new property ID
        uint256 propertyId = nextPropertyId++;

        //Create a new Property Struct and store it in the mapping
        properties[propertyId] = Property({
            propertyId: propertyId,
            propertyName: _propertyName,
            location: _location,
            images: _images,
            totalTokens: _totalTokens,
            tokenPrice: _tokenPrice,
            totalDividends: 0, //Initialize total dividends to 0
            owner: msg.sender, // Setting the caller as the property owner
            isActive: true //Mark the property as active
        });

        _mint(address(this), _totalTokens);  //Mint the total tokens to the contract itself

        emit PropertyTokenized(propertyId, _propertyName, _totalTokens, _tokenPrice);
    }


    //Function for investors to purchase tokens
    function purchaseTokens( uint256 _propertyId, uint256 _amountOfTokens) external payable {
        Property storage property = properties[_propertyId];

        require(property.isActive, "Property is not active for investment");
        require(_amountOfTokens > 0, "Amount of tokens must be greater than 0");
        require(balanceOf(address(this)) >= _amountOfTokens, "Not enough tokens available");

        //Calculate the total cost of the tokens
        uint256 cost = _amountOfTokens * property.tokenPrice;

        //Validate that the investor sent enough ETH
        require(msg.value >= cost, "Insufficient funds to purchase tokens");

        //Transfer tokens from the contract to the investor
        _transfer(address(this), msg.sender, _amountOfTokens);

        //Update the investor's balance for the property
        investorBalances[_propertyId][msg.sender] += _amountOfTokens;

        emit TokensPurchased(_propertyId, msg.sender, _amountOfTokens);
    }

    //Function to distribute dividends (called by the property owner)
    function distributeDividends(uint256 _propertyId) external payable onlyOwner{
        Property storage property = properties[_propertyId];

        require(property.isActive, "Property is not active");
        require(msg.value > 0, "Dividends must be greater than 0");

        //Add the dividends to the property's total dividends
        property.totalDividends += msg.value;

        emit DividendsDistributed(_propertyId, msg.value);
    }

    //Function for investors to claim dividends
    function claimDividends(uint256 _propertyId) external {
        Property storage property = properties[_propertyId];

        require(property.isActive, "Property is not active");

        //Get the investor's token balance
        uint256 investorBalance = investorBalances[_propertyId][msg.sender];
        require(investorBalance > 0, "No tokens owned");

        //Calculate the investor's share of the dividends
        uint256 totalDividends = property.totalDividends;
        uint256 dividendShare = (investorBalance * totalDividends) / property.totalTokens;

        //Calculate the unclaimed dividends
        uint256 unclaimedDividends = dividendShare - claimedDividends[_propertyId][msg.sender];
        require(unclaimedDividends > 0, "No dividends to claim");

        //Update the claimed dividends for the investor
        claimedDividends[_propertyId][msg.sender] += unclaimedDividends;

        //Transfer the dividends to the investor
        payable(msg.sender).transfer(unclaimedDividends);

        emit DividendsClaimed(_propertyId, msg.sender, unclaimedDividends);
    }

    //Function to deactivate a property and stop further investments
    function deactivateProperty(uint256 _propertyId) external onlyOwner {
        Property storage property = properties[_propertyId];

        require(property.isActive, "Property is already deactivated");

        //Deactivate the property
        property.isActive = false;

        emit PropertyDeactivated(_propertyId);
    }

    //Function for the property owner to withdraw funds
    function withdrawFunds(uint256 _propertyId) external onlyOwner {
        Property storage property = properties[_propertyId];

        require(property.owner == msg.sender, "Only the property owner can withdraw funds");

        //Calculate the contract's balance for the property
        uint256 contractBalance = address(this).balance;

        require(contractBalance > 0, "No funds to withdraw");

        //Transfer the funds to the property owner
        payable(property.owner).transfer(contractBalance);

        emit FundsWithdrawn(_propertyId, property.owner, contractBalance);

    }

}