# taral-marketplace

This Clarity contract implements a marketplace for non-fungible tokens (NFTs), using Stacks' native token (STX) as the method of payment. The contract offers functionality for auctioning, bidding, ending auctions, and canceling auctions.

Here are some of the key elements:

`Auction Data Structure`: The auctions, completed-auctions, cancelled-auctions maps keep track of the current, completed, and canceled auctions respectively. Each auction has details like the maker (seller), NFT asset contract, token-id, start and end blocks for the auction, reserve price, highest bid and bidder.

`Whitelisting`: The contract has a mechanism to whitelist NFT contracts. This feature restricts the NFTs that can be auctioned to only those from whitelisted contracts.

`Bidding`: Bidders can place a bid on an ongoing auction. The new bid must be higher than the current highest bid. When a new highest bid is placed, the previous bid is returned to the respective bidder.

`Ending Auctions`: Once an auction has ended, if the highest bid is greater than or equal to the reserve price, the NFT is transferred to the highest bidder, and the highest bid is transferred to the seller. The auction details are then moved to the completed-auctions map.

`Cancelling Auctions`: The seller or the contract owner can cancel an auction before it ends. The NFT is returned to the seller, and the highest bid (if any) is returned to the highest bidder. The auction details are then moved to the cancelled-auctions map.

`Contract Pause and Resume`: The contract owner has the ability to pause and resume the contract. When paused, most functions will not execute and return an error.

`Ownership Management`: The contract includes a provision to transfer ownership to a new owner.

The contract leverages traits (.sip009-nft-trait.nft-trait and .sip010-ft-trait.sip010-ft-trait), which are interfaces in the Clarity language that define certain functions a contract must have. This makes the contract more flexible as it can interact with any other contract that implements the required traits. In this case, it allows interaction with any NFT contract that implements the SIP009 NFT Trait.

In addition to that, the nft marketplace showcases some best practices such as `ownership management` and `separation of contract logic from data`

Separation of contract logic and data is extremely important in the case of versioning and upgreadability. In case we upgrade the marketplace contract, we do not need to do data migration.


## Tests

* Run normal tests with `clarinet test`

* Run chainhook tests with `clarinet test --chainhooks ./chainhooks/marketplace.chainhook.yaml ./tests_chainhook/integration_test.ts`