interface ReturnPreviousBid {
    action: Action;
    'auction-id': Action;
    bid: Action;
    'end-block': Action;
    'highest-bid': Action;
    'highest-bidder': Highestbidder;
    maker: Action;
    'nft-asset-contract': Action;
    'previous-bidder': Action;
    'reserve-price': Action;
    'start-bid': Action;
    'start-block': Action;
    'token-id': Action;
}

interface Highestbidder {
    type: string;
    value: Action;
}

interface Action {
    type: string;
    value: string;
}