export interface StartAuction {
    action: Action;
    'auction-id': Action;
    'end-block': Action;
    'highest-bid': Action;
    'highest-bidder': Highestbidder;
    maker: Action;
    'nft-asset-contract': Action;
    'reserve-price': Action;
    'start-bid': Action;
    'start-block': Action;
    'token-id': Action;
    type: Action;
  }
  
  export interface Highestbidder {
    type: string;
    value?: any;
  }
  
  export interface Action {
    type: string;
    value: string;
  }