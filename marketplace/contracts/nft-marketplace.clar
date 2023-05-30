(use-trait nft-trait .sip009-nft-trait.nft-trait)
(use-trait ft-trait .sip010-ft-trait.sip010-ft-trait)

;; Constants and Errors
(define-constant err-expiry-in-past (err u1000))
(define-constant err-price-zero (err u1001))
(define-constant err-unknown-listing (err u2000))
(define-constant err-unauthorised (err u2001))
(define-constant err-listing-expired (err u2002))
(define-constant err-nft-asset-mismatch (err u2003))
(define-constant err-payment-asset-mismatch (err u2004))
(define-constant err-maker-taker-equal (err u2005))
(define-constant err-unintended-taker (err u2006))
(define-constant err-asset-contract-not-whitelisted (err u2007))
(define-constant err-payment-contract-not-whitelisted (err u2008))
(define-constant err-auction-ended (err u3000))
(define-constant err-bid-too-low (err u3001))
(define-constant err-bid-withdrawal (err u3002))
(define-constant err-reserve-not-met (err u3003))
(define-constant err-auction-not-ended (err u3004))
(define-constant err-block-info (err u4000))
(define-constant default-error-value (err u4001))
(define-constant err-no-bids (err u4002))
(define-constant failed-to-transfer (err u4003))
(define-constant failed-to-transfer-nft (err u4004))

(define-constant err-contract-paused (err u9000))

;; Data Maps and Variables
(define-map auctions
  uint
  {
    maker: principal,
    token-id: uint,
    nft-asset-contract: principal,
    start-block: uint,
    end-block: uint,
    reserve-price: uint,
    start-bid: uint,
    highest-bid: uint,
    highest-bidder: (optional principal)
  }
)

(define-map bids
  { auction-id: uint, bidder: principal }
  uint
)

(define-map completed-auctions
  uint
  {
    maker: principal,
    token-id: uint,
    nft-asset-contract: principal,
    start-block: uint,
    end-block: uint,
    reserve-price: uint,
    start-bid: uint,
    highest-bid: uint,
    highest-bidder: (optional principal)
  }
)

(define-map cancelled-auctions
  uint
  {
    maker: principal,
    token-id: uint,
    nft-asset-contract: principal,
    start-block: uint,
    end-block: uint,
    reserve-price: uint,
    start-bid: uint,
    highest-bid: uint,
    highest-bidder: (optional principal)
  }
)

(define-map withdrawn-bids
  { auction-id: uint, bidder: principal }
  uint
)

(define-data-var auction-nonce uint u0)

(define-data-var contract-owner principal tx-sender)

(define-data-var contract-paused bool false)

;; Read-Only Functions
(define-read-only (get-completed-auction (auction-id uint))
  (map-get? completed-auctions auction-id)
)

(define-read-only (get-withdrawn-bid (auction-id uint) (bidder principal))
  (map-get? withdrawn-bids { auction-id: auction-id, bidder: bidder })
)

;; Whitelist Functions
(define-map whitelisted-asset-contracts principal bool)

(define-read-only (is-whitelisted (asset-contract principal))
  (default-to false (map-get? whitelisted-asset-contracts asset-contract))
)

(define-public (set-whitelisted (asset-contract principal) (whitelisted bool))
  (begin
    (asserts! (is-eq (var-get contract-owner) tx-sender) err-unauthorised)
    (ok (map-set whitelisted-asset-contracts asset-contract whitelisted))
  )
)

(define-public (pause-contract)
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) err-unauthorised)
    (var-set contract-paused true)
    (ok true)
  )
)

(define-public (resume-contract)
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) err-unauthorised)
    (var-set contract-paused false)
    (ok true)
  )
)

;; Private Functions
(define-private (transfer-nft (token-contract <nft-trait>) (token-id uint) (sender principal) (recipient principal))
  (contract-call? token-contract transfer token-id sender recipient)
)

;; Public Functions

(define-public (set-owner (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) err-unauthorised)
    (var-set contract-owner new-owner)
    (ok true)
  )
)

(define-public (start-auction (nft-asset-contract <nft-trait>) (nft-asset { token-id: uint, start-block: uint, end-block: uint, start-bid: uint, reserve-price: uint }))
  (let ((auction-id (var-get auction-nonce)))
    (asserts! (or (not (var-get contract-paused)) (is-eq tx-sender (var-get contract-owner))) err-contract-paused)
    (asserts! (is-whitelisted (contract-of nft-asset-contract)) err-asset-contract-not-whitelisted)
    (asserts! (> (get end-block nft-asset) (get start-block nft-asset)) err-expiry-in-past)
    (asserts! (> (get start-bid nft-asset) u0) err-price-zero)

    (unwrap! (transfer-nft nft-asset-contract (get token-id nft-asset) tx-sender (as-contract tx-sender)) failed-to-transfer-nft)

    ;; (try! (transfer-nft nft-asset-contract (get token-id nft-asset) tx-sender (as-contract tx-sender)))
    (map-set auctions auction-id (merge { maker: tx-sender, nft-asset-contract: (contract-of nft-asset-contract), highest-bid: u0, highest-bidder: none } nft-asset))
    (var-set auction-nonce (+ auction-id u1))
    (ok auction-id)
  )
)

(define-read-only (get-auction (auction-id uint))
  (map-get? auctions auction-id)
)

(define-public (place-bid (auction-id uint) (bid uint))
  (let (
    (auction (unwrap! (map-get? auctions auction-id) err-unknown-listing))
    (previous-bid (default-to u0 (map-get? bids { auction-id: auction-id, bidder: tx-sender })))
  )
    (asserts! (not (var-get contract-paused)) err-contract-paused)
    ;; Check that the auction is still ongoing
    (asserts! (and (>= block-height (get start-block auction)) (<= block-height (get end-block auction))) err-auction-ended)
    ;; Check that the bid is higher than the current highest bid
    (asserts! (> bid (get highest-bid auction)) err-bid-too-low)
    ;; Transfer the bid difference from the bidder to the contract
    (unwrap! (stx-transfer? (- bid previous-bid) tx-sender (as-contract tx-sender)) failed-to-transfer)

    ;; Return the previous highest bid
    (match (get highest-bidder auction)
        some-bidder 
        (begin
            (try! (as-contract (stx-transfer? (get highest-bid auction) tx-sender some-bidder)))
            (map-set auctions auction-id (merge auction { highest-bid: bid, highest-bidder: (some tx-sender) }))
            (map-set bids { auction-id: auction-id, bidder: tx-sender } bid)

            ;; Move the bid to the withdrawn-bids map
            (map-set withdrawn-bids { auction-id: auction-id, bidder: some-bidder } (get highest-bid auction))
            ;; Delete the bidder's bid
            (map-delete bids { auction-id: auction-id, bidder: some-bidder })

            (ok true)
        )
        (begin
            (map-set auctions auction-id (merge auction { highest-bid: bid, highest-bidder: (some tx-sender) }))
            (map-set bids { auction-id: auction-id, bidder: tx-sender } bid)
            (ok true)
        )
    )
  )
)

(define-public (end-auction (auction-id uint) (nft-asset-contract <nft-trait>))
  (let (
    (auction (unwrap! (map-get? auctions auction-id) err-unknown-listing))
  )
    (asserts! (or (not (var-get contract-paused)) (is-eq tx-sender (var-get contract-owner))) err-contract-paused)
    ;; Check that the auction has ended
    (asserts! (> block-height (get end-block auction)) err-auction-not-ended)
     ;; Check that the reserve price has been met
    (asserts! (>= (get highest-bid auction) (get reserve-price auction)) err-reserve-not-met)
    ;; Transfer the NFT to the highest bidder
    (try! (as-contract (transfer-nft nft-asset-contract (get token-id auction) tx-sender (unwrap! (get highest-bidder auction) err-no-bids))))
    ;; Transfer the highest bid to the maker
    (try! (as-contract (stx-transfer? (get highest-bid auction) tx-sender (get maker auction))))
    ;; Move the auction to the completed-auctions map
    (map-set completed-auctions auction-id auction)
    ;; Delete the auction
    (map-delete auctions auction-id)
    (ok { auction-id: auction-id, highest-bidder: (unwrap! (get highest-bidder auction) err-no-bids), highest-bid: (get highest-bid auction) })
  )
)

(define-public (cancel-auction (auction-id uint) (nft-asset-contract <nft-trait>))
  (let (
    (auction (unwrap! (map-get? auctions auction-id) err-unknown-listing))
  )
    (asserts! (or (not (var-get contract-paused)) (is-eq tx-sender (var-get contract-owner))) err-contract-paused)

    ;; Check that the auction has not ended and the sender is the maker
    (asserts! (and (<= block-height (get end-block auction)) (or (is-eq tx-sender (get maker auction)) (is-eq tx-sender (var-get contract-owner)))) err-unauthorised)
    
    ;; Transfer the NFT back to the maker
    (try! (as-contract (transfer-nft nft-asset-contract (get token-id auction) tx-sender (get maker auction))))

    (match (get highest-bidder auction)
            highest-bidder 
            (begin

                (try! (as-contract (stx-transfer? (get highest-bid auction) tx-sender highest-bidder)))
                
                (map-set cancelled-auctions auction-id auction)
                ;; Delete the auction
                (map-delete auctions auction-id)
                (ok true)
            )
            (begin

                (map-set cancelled-auctions auction-id auction)
                ;; Delete the auction
                (map-delete auctions auction-id)
                (ok true)
            )
        )
  )
)