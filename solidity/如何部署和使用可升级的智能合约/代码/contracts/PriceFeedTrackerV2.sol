// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract PriceFeedTrackerV2 is Initializable {
   address private admin;
   int public price; // NOTE: new storage slot

   // Emitted when the price is retrieved changes
   event PriceRetrievedFrom(address feed, int price);

   function initialize(address _admin) public initializer {
       admin = _admin;
   }

   function getAdmin() public view returns (address) {
       return admin;
   }

   // Fetches the price from the feed.
   // Note that the function is no longer a view function as it emits an event.
   function retrievePrice(address feed) public returns (int) {
       require(
           feed != address(0x0),
           "PriceFeedTrackerV2: Pricefeed address must not be zero address."
       );

       AggregatorV3Interface aggregator = AggregatorV3Interface(feed);
       (
           ,
           /*uint80 roundID*/
           int _price, /*uint startedAt*/ /*uint timeStamp*/ /*uint80 answeredInRound*/
           ,
           ,

       ) = aggregator.latestRoundData();

       price = _price;

       emit PriceRetrievedFrom(feed, _price);

       return price;
   }
}