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

## How to run the POC

* Run 

```
> cd infrastructure && docker-compose up
```

This will create the infrastructure (RabbitMq, Prometheus, Grafana, Postgresql)

* Start up the consumer

```
> cd chainhook-consumer && yarn start:dev
```

Make sure to install dependencies first of course

* Start up the subscriber

```
> cd chainhook-subscriber && yarn start:dev
```

Make sure that you installed the dependencies first, and that you've run the migrations 

```
> yarn migration:run
```

You can also drop the migrations: 

```
> yarn schema:drop
```

* Run the integration test and then have a look at `http://localhost:3003/api/v1/auctionhistory/0`

You should be getting the history of the auction entity you just inserted

```
[
   "Auction with the id \"0\" was created at 7/28/2023, 3:46:30 PM. The id was changed to \"10b289cf-1684-4544-b1e0-f2c3b4548b87\". The createdAt was changed to \"2023-07-28T12:46:30.742Z\". The updatedAt was changed to \"2023-07-28T09:46:30.706Z\". The hash was changed to \"5b13b317d797e65992c2064d058cc8ace0dbe490b3026b8a1a76073f02342aa1\". The auctionId was changed to \"0\". The endBlock was changed to \"1000\". The highestBid was changed to \"0\". The maker was changed to \"ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5\". The nftAsset was changed to \"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sip009-nft\". The highestBidder was changed to \"null\". The status was changed to \"OPEN\".",
   "Auction bid with the amount \"1200.00\" and bidder \"ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG\" was created at 7/28/2023, 3:46:30 PM. The id was changed to \"997d1955-349e-4a00-bfb8-6d722d0b590d\". The createdAt was changed to \"2023-07-28T12:46:30.935Z\". The updatedAt was changed to \"2023-07-28T09:46:30.883Z\". The hash was changed to \"2ea36fd6353a3b87da323c95fa71ae881c830f7ac6529600242817f9894f9603\". The amount was changed to \"1200.00\". The bidder was changed to \"ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG\".",
   "Auction with the id \"0\" was updated at 7/28/2023, 3:46:31 PM. The updatedAt was changed to \"2023-07-28T12:46:30.961Z\". The hash was changed to \"95f95053620e826235584568dfd452ea5af14a9fd5aec0cb6d26b697d27c2e4d\". The highestBid was changed to \"1200.00\". The highestBidder was changed to \"ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG\".",
   "Auction bid with the amount \"5000.00\" and bidder \"ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC\" was created at 7/28/2023, 3:46:31 PM. The id was changed to \"01ebce17-9dc9-4dbc-91e6-a4ad4d299711\". The createdAt was changed to \"2023-07-28T12:46:31.056Z\". The updatedAt was changed to \"2023-07-28T09:46:31.026Z\". The hash was changed to \"6a70cc66d818027a29dd5f5af4a12c225be09b6bb7d36dcb610e84194c938500\". The amount was changed to \"5000.00\". The bidder was changed to \"ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC\".",
   "Auction with the id \"0\" was updated at 7/28/2023, 3:46:31 PM. The updatedAt was changed to \"2023-07-28T12:46:31.076Z\". The hash was changed to \"2f25544ed3b1e3d32a593e8193be8526f87f0923ee748a535f605771f822b963\". The highestBid was changed to \"5000.00\". The highestBidder was changed to \"ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC\".",
   "Auction with the id \"0\" was updated at 7/28/2023, 3:46:31 PM. The updatedAt was changed to \"2023-07-28T12:46:31.225Z\". The hash was changed to \"1bc7cc24cc3bd580a457e26a8cb12a1738b906f1b9f1e43c99f18d6f76931006\". The status was changed to \"CANCELLED\"."
]
```