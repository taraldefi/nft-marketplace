(impl-trait .marketplace-trait.marketplace-trait)

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
(define-constant marketplace-storage-error (err u9001))


;; Version string
(define-constant VERSION "0.0.5.beta")

(define-data-var contract-owner principal tx-sender)

(define-data-var contract-paused bool false)

;; Returns version of the safe contract
;; @returns string-ascii
(define-read-only (get-version) 
    VERSION
)

(define-public (set-whitelisted (asset-contract principal) (whitelisted bool))
  (begin
    (unwrap! (contract-call? .marketplace-storage set-whitelisted asset-contract whitelisted) marketplace-storage-error)
    (ok true)
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

(define-read-only (get-info)
    (ok {
        version: (get-version)
    })
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

(define-public (list-fixed-price (nft-asset-contract <nft-trait>) (nft-asset { token-id: uint, price: uint }))
  (let (
    (listing-id (contract-call? .marketplace-storage get-fixed-price-listing-nonce))
  )
    (asserts! (or (not (var-get contract-paused)) (is-eq tx-sender (var-get contract-owner))) err-contract-paused)
    (asserts! (contract-call? .marketplace-storage is-whitelisted (contract-of nft-asset-contract)) err-asset-contract-not-whitelisted)
    (asserts! (> (get price nft-asset) u0) err-price-zero)

    ;; Transfer the NFT to the contract
    (unwrap! (transfer-nft nft-asset-contract (get token-id nft-asset) tx-sender (as-contract tx-sender)) failed-to-transfer-nft)
    (unwrap! (contract-call? .marketplace-storage add-fixed-price-listing listing-id { 
      maker: tx-sender, 
      nft-asset-contract: (contract-of nft-asset-contract), 
      token-id: (get token-id nft-asset), 
      price: (get price nft-asset) } ) marketplace-storage-error)

    (unwrap! (contract-call? .marketplace-storage increment-fixed-price-nonce) marketplace-storage-error)

    (ok listing-id)
  )
)

(define-public (purchase-fixed-price-listing (listing-id uint) (recipient principal) (nft-asset-contract <nft-trait>))
  (let (
    (listing (unwrap! (contract-call? .marketplace-storage get-fixed-price-listing listing-id) err-unknown-listing))
  )
    (asserts! (or (not (var-get contract-paused)) (is-eq tx-sender (var-get contract-owner))) err-contract-paused)
    ;; Transfer the stx from the buyer to the maker
    (try! (stx-transfer? (get price listing) tx-sender (get maker listing)))
    ;; Transfer the NFT to the buyer
    (try! (as-contract (transfer-nft nft-asset-contract (get token-id listing) tx-sender recipient)))

    (unwrap! (contract-call? .marketplace-storage add-completed-fixed-price-listing listing-id listing) marketplace-storage-error)
    ;; Delete the listing
    (unwrap! (contract-call? .marketplace-storage remove-fixed-price-listing listing-id) marketplace-storage-error)
    (ok true)
  )
)

(define-public (cancel-fixed-price-listing (listing-id uint) (nft-asset-contract <nft-trait>))
  (let (
    (listing (unwrap! (contract-call? .marketplace-storage get-fixed-price-listing listing-id) err-unknown-listing))
  )
    (asserts! (or (is-eq tx-sender (get maker listing)) (is-eq  tx-sender (var-get contract-owner))) err-unauthorised)
    (asserts! (or (not (var-get contract-paused)) (is-eq tx-sender (var-get contract-owner))) err-contract-paused)
    ;; Transfer the NFT back to the maker
    (try! (as-contract (transfer-nft nft-asset-contract (get token-id listing) tx-sender (get maker listing))))
    (unwrap! (contract-call? .marketplace-storage add-cancelled-fixed-price-listing listing-id listing) marketplace-storage-error)
    ;; Delete the listing
    (unwrap! (contract-call? .marketplace-storage remove-fixed-price-listing listing-id) marketplace-storage-error)
    (ok true)
  )
)

(define-public (start-auction (nft-asset-contract <nft-trait>) (nft-asset { token-id: uint, start-block: uint, end-block: uint, start-bid: uint, reserve-price: uint }))
  (let (
    (auction-id (contract-call? .marketplace-storage get-auction-nonce))
  )
    (asserts! (or (not (var-get contract-paused)) (is-eq tx-sender (var-get contract-owner))) err-contract-paused)
    (asserts! (contract-call? .marketplace-storage is-whitelisted (contract-of nft-asset-contract)) err-asset-contract-not-whitelisted)

    (asserts! (> (get end-block nft-asset) (get start-block nft-asset)) err-expiry-in-past)
    (asserts! (> (get start-bid nft-asset) u0) err-price-zero)

    (unwrap! (transfer-nft nft-asset-contract (get token-id nft-asset) tx-sender (as-contract tx-sender)) failed-to-transfer-nft)

    (unwrap! (contract-call? .marketplace-storage add-auction auction-id (merge { 
      maker: tx-sender, 
      nft-asset-contract: (contract-of nft-asset-contract), 
      highest-bid: u0, 
      highest-bidder: none 
      } nft-asset)) marketplace-storage-error)    
    
    (unwrap! (contract-call? .marketplace-storage increment-auction-nonce) marketplace-storage-error)

    (ok auction-id)
  )
)

(define-public (place-bid (auction-id uint) (bid uint))
  (let (
    (auction (unwrap! (contract-call? .marketplace-storage get-auction auction-id) err-unknown-listing))
    (previous-bid (contract-call? .marketplace-storage get-previous-bid auction-id tx-sender ))
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

            (unwrap! (contract-call? .marketplace-storage add-auction auction-id (merge auction {
               highest-bid: bid, 
               highest-bidder: (some tx-sender) })) marketplace-storage-error)

            (unwrap! (contract-call? .marketplace-storage add-bid { auction-id: auction-id, bidder: tx-sender } bid) marketplace-storage-error)

            ;; Move the bid to the withdrawn-bids map
            (unwrap! (contract-call? .marketplace-storage add-withdrawn-bid { auction-id: auction-id, bidder: some-bidder } (get highest-bid auction)) marketplace-storage-error)

            ;; Delete the bidder's bid
            (unwrap! (contract-call? .marketplace-storage delete-bid { auction-id: auction-id, bidder: some-bidder }) marketplace-storage-error)

            (ok true)
        )
        (begin

            (unwrap! (contract-call? .marketplace-storage add-auction auction-id (merge auction {
               highest-bid: bid, 
               highest-bidder: (some tx-sender) })) marketplace-storage-error)

            (unwrap! (contract-call? .marketplace-storage add-bid { auction-id: auction-id, bidder: tx-sender } bid) marketplace-storage-error)
            (ok true)
        )
    )
  )
)

(define-public (end-auction (auction-id uint) (nft-asset-contract <nft-trait>))
  (let (
    (auction (unwrap! (contract-call? .marketplace-storage get-auction auction-id) err-unknown-listing))
  )
    (asserts! (or (not (var-get contract-paused)) (is-eq tx-sender (var-get contract-owner))) err-contract-paused)
    ;; Check that the auction has ended
    (asserts! (> block-height (get end-block auction)) err-auction-not-ended)
     ;; Check if the reserve price has been met
    (if (>= (get highest-bid auction) (get reserve-price auction))
        (begin
          ;; Transfer the NFT to the highest bidder
          (try! (as-contract (transfer-nft nft-asset-contract (get token-id auction) tx-sender (unwrap! (get highest-bidder auction) err-no-bids))))
          ;; Transfer the highest bid to the maker
          (try! (as-contract (stx-transfer? (get highest-bid auction) tx-sender (get maker auction))))
          ;; Move the auction to the completed-auctions map
          (unwrap! (contract-call? .marketplace-storage add-completed-auction auction-id auction) marketplace-storage-error)
          ;; Delete the auction
          (unwrap! (contract-call? .marketplace-storage delete-auction auction-id) marketplace-storage-error)

          (ok { auction-id: auction-id, reserve-price-met: true })
        )
        (begin
          ;; Reserve price not met, return bid to the highest bidder
          (try! (as-contract (stx-transfer? (get highest-bid auction) tx-sender (unwrap! (get highest-bidder auction) err-no-bids))))
          ;; Return the NFT to the maker
          (try! (as-contract (transfer-nft nft-asset-contract (get token-id auction) tx-sender (get maker auction))))
          ;; Move the auction to the cancelled-auctions map
          (unwrap! (contract-call? .marketplace-storage add-cancelled-auction auction-id auction) marketplace-storage-error)
          ;; Delete the auction
          (unwrap! (contract-call? .marketplace-storage delete-auction auction-id) marketplace-storage-error)
          (ok { auction-id: auction-id, reserve-price-met: false })
        )
    )
  )
)

(define-public (cancel-auction (auction-id uint) (nft-asset-contract <nft-trait>))
  (let (
    (auction (unwrap! (contract-call? .marketplace-storage get-auction auction-id) err-unknown-listing))
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
                
                (unwrap! (contract-call? .marketplace-storage add-cancelled-auction auction-id auction) marketplace-storage-error)
                ;; Delete the auction
                (unwrap! (contract-call? .marketplace-storage delete-auction auction-id) marketplace-storage-error)
                (ok true)
            )
            (begin

                (unwrap! (contract-call? .marketplace-storage add-cancelled-auction auction-id auction) marketplace-storage-error)
                ;; Delete the auction
                (unwrap! (contract-call? .marketplace-storage delete-auction auction-id) marketplace-storage-error)
                (ok true)
            )
        )
  )
)