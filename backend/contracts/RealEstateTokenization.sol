// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RealEstateTokenization is ERC20, Ownable {
    struct Property{
        uint256 propertyId;
        string propertyName;
        string metadataCID;
        uint256 totalTokens;
        uint256 tokensSold;
        uint256 tokenPrice;
        uint256 totalDividends;
        string dividendPayout;
        string expectedReturn;
        address owner;
        bool isActive;
    }

    mapping(uint256 => Property) public properties;  //Mapping to store properties by their ID
    mapping(uint256 => mapping(address => uint256)) public investorBalances;  //Mapping to track investor token balances for each property
    mapping(uint256 => mapping(address => uint256)) public claimedDividends;  //Mapping to track claimed dividends for each investor
    mapping(address => uint256[]) public ownerToProperties; //Mapping to track which owner owns which property

    //Counter to generate unique property IDs
    uint256 public nextPropertyId;
    
    event PropertyTokenized( uint256 propertyId, string propertyName, uint256 totalTokens, uint256 tokenPrice);
    event TokensPurchased( uint256 propertyId, string propertyName, uint256 tokenPrice, address investor, uint256 amount);
    event DividendsDistributed(uint256 propertyId, string propertyName, uint256 totalDividends);
    event DividendsClaimed(uint256 propertyId, string propertyName, address investor, uint256 amount);
    event PropertyDeactivated(uint256 propertyId);
    event FundsWithdrawn(uint256 propertyId, address owner, uint256 amount);
    event TokensSold(uint256 propertyId, string propertyName, address seller, uint256 amount, uint256 totalValue);

    //Constructor to initialize the ERC20 token
    constructor() ERC20("RealEstateToken", "RET") Ownable(msg.sender) {}

    //Function to tokenize a new property
    function tokenizeProperty( 
        string memory _metadataCID, 
        string memory _propertyName, 
        uint256 _totalTokens, 
        uint256 _tokenPrice, 
        string memory _dividendPayout,
        string memory _expectedReturn
        ) external {
        require(_totalTokens > 0, "Total tokens must be greater than 0");
        require(_tokenPrice > 0, "Token price must be greater than 0");

        //Generate a new property ID
        uint256 propertyId = nextPropertyId++;

        //Create a new Property Struct and store it in the mapping
        properties[propertyId] = Property({
            propertyId: propertyId,
            propertyName: _propertyName,
            metadataCID: _metadataCID,
            totalTokens: _totalTokens,
            tokensSold: 0,
            tokenPrice: _tokenPrice,
            dividendPayout: _dividendPayout,
            expectedReturn: _expectedReturn,
            totalDividends: 0,
            owner: msg.sender,
            isActive: true 
        });

        ownerToProperties[msg.sender].push(propertyId);

        _mint(address(this), _totalTokens);  //Mint the total tokens to the contract itself

        emit PropertyTokenized(propertyId, _propertyName, _totalTokens, _tokenPrice);
    }

    function getLatestPropertyId() external view returns (uint256) {
    require(nextPropertyId > 0, "No properties created yet.");
    return nextPropertyId - 1;
    }

    // Function to get all tokenized properties
    function getAllProperties() external view returns (Property[] memory) {
        uint256 totalProperties = nextPropertyId;
        Property[] memory allProperties = new Property[](totalProperties);

        for (uint256 i = 0; i < totalProperties; i++) {
            allProperties[i] = properties[i];
        }

        return allProperties;
    }

    // Function to get a single property by ID
    function getProperty(uint256 _propertyId) external view returns (Property memory) {
        return properties[_propertyId];
    }

    //Function to get all available tokens a property has
    function getAvailableTokens(uint256 _propertyId) external view returns (uint256) {
        Property storage property = properties[_propertyId];
        return property.totalTokens - property.tokensSold;
    }

    //Function for investors to purchase tokens
    function purchaseTokens( uint256 _propertyId, uint256 _amountOfTokens) external payable {
        Property storage property = properties[_propertyId];
        uint256 _tokenPrice = property.tokenPrice;
        string memory _propertyName = property.propertyName;

        require(property.isActive, "Property is not active for investment");
        require(_amountOfTokens > 0, "Amount of tokens must be greater than 0");
        require( _amountOfTokens <= (property.totalTokens - property.tokensSold), "Not enough tokens available");

        uint256 cost = _amountOfTokens * property.tokenPrice;
        require(msg.value >= cost, "Insufficient funds to purchase tokens");

        _transfer(address(this), msg.sender, _amountOfTokens);

        //Update the investor's balance for the property
        investorBalances[_propertyId][msg.sender] += _amountOfTokens;
        property.tokensSold += _amountOfTokens;

        emit TokensPurchased(_propertyId, _propertyName, _tokenPrice, msg.sender, _amountOfTokens);
    }

    //Function to get properties an investor holds
    function getInvestorHoldings(address investor) external view returns (Property[] memory) {
    uint256 totalProperties = nextPropertyId;
    uint256 count = 0;

    // Determine how many properties the investor has holdings in
    for (uint256 i = 0; i < totalProperties; i++) {
        if (investorBalances[i][investor] > 0) {
            count++;
        }
    }

    // Create an array with the correct size
    Property[] memory holdings = new Property[](count);
    uint256 index = 0;

    // Populate the array with properties the investor owns
    for (uint256 i = 0; i < totalProperties; i++) {
        if (investorBalances[i][investor] > 0) {
            holdings[index] = properties[i];
            index++;
        }
    }

    return holdings;
}
    //Function to get the amount of tokens owned by an investor for a specific property
    function getInvestorBalanceForEachProperty(uint256 _propertyId, address investor) external view returns (uint256) {
        return investorBalances[_propertyId][investor];
    }

    //Function to distribute dividends (called by the property owner)
    function distributeDividends(uint256 _propertyId) external payable onlyOwner{
        Property storage property = properties[_propertyId];
        string memory _propertyName = property.propertyName;

        require(property.isActive, "Property is not active");
        require(msg.value > 0, "Dividends must be greater than 0");

        //Add the dividends to the property's total dividends
        property.totalDividends += msg.value;

        emit DividendsDistributed(_propertyId, _propertyName, msg.value);
    }

    //Function for investors to claim dividends
    function claimDividends(uint256 _propertyId) external {
        Property storage property = properties[_propertyId];
        string memory _propertyName = property.propertyName;

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

        emit DividendsClaimed(_propertyId, _propertyName, msg.sender, unclaimedDividends);
    }

    function sellTokens(uint256 _propertyId, uint256 _amount) external {
        Property storage property = properties[_propertyId];
        string memory _propertyName = property.propertyName;

        require(property.isActive, "Property is not active for trading");
        require(_amount > 0, "Amount must be greater than 0");
        require(investorBalances[_propertyId][msg.sender] >= _amount, "Insufficient tokens to sell");

        // Calculate the total value of the tokens being sold
        uint256 totalValue = _amount * property.tokenPrice;

        // Validate that the contract has enough ETH to pay the investor
        require(address(this).balance >= totalValue, "Insufficient contract balance");

         // Transfer ETH to the investor
        payable(msg.sender).transfer(totalValue);

        // Burn the tokens (or return them to the contract)
        _burn(msg.sender, _amount);

         // Update the investor's balance
        investorBalances[_propertyId][msg.sender] -= _amount;

        // Update tokens sold
        property.tokensSold -= _amount;

         // Emit an event to log the token sale
        emit TokensSold(_propertyId, _propertyName, msg.sender, _amount, totalValue);
    }
    
    // Function to allow the contract to receive ETH
    receive() external payable {}

    //Function to deactivate a property and stop further investments
    function deactivateProperty(uint256 _propertyId) external onlyOwner {
        Property storage property = properties[_propertyId];

        require(property.isActive, "Property is already deactivated");

        property.isActive = false;

        emit PropertyDeactivated(_propertyId);
    }

    //Function for the property owner to withdraw funds
    function withdrawFunds(uint256 _propertyId) external onlyOwner {
        Property storage property = properties[_propertyId];

        require(property.owner == msg.sender, "Only the property owner can withdraw funds");

        uint256 contractBalance = address(this).balance;

        require(contractBalance > 0, "No funds to withdraw");

        payable(property.owner).transfer(contractBalance);

        emit FundsWithdrawn(_propertyId, property.owner, contractBalance);

    }

    //Function to get properties an owner has tokenized
    function getPropertiesByOwner(address _owner) external view returns (Property[] memory) {
    uint256[] memory propertyIds = ownerToProperties[_owner];
    Property[] memory ownerProperties = new Property[](propertyIds.length);

    for (uint256 i = 0; i < propertyIds.length; i++) {
        ownerProperties[i] = properties[propertyIds[i]];
    }

    return ownerProperties;
}


}

