import { Address } from '@graphprotocol/graph-ts'
import { decimal } from '@protofire/subgraph-toolkit'

import { Burn, ReMint, StyleFeeCollected, StyleRemoved } from '../../generated/BlockArtFactory/BlockArtFactory'
import { BlockArt } from '../../generated/BlockArtFactory/BlockArt'
import { Art, ArtBurn, ArtReMint, BlockPrice, Style, Token } from '../../generated/schema'

import { increaseBalance } from '../services/balances'
import { getOrCreateArtMetadata } from '../services/arts'

export function handleStyleRemoved(event: StyleRemoved): void {
  let style = Style.load(event.params.styleId.toString())

  if (style != null) {
    style.removedAt = event.block.timestamp
    style.removedAtBlock = event.block.number
    style.removedAtTransaction = event.transaction.hash

    style.save()
  }
}

export function handleStyleFeeCollected(event: StyleFeeCollected): void {
  // TODO
}

export function handleBurnArt(event: Burn): void {
  let art = Art.load(event.params.tokenId.toString())

  if (art != null) {
    // Mark art as burned
    art.burnedAt = event.block.timestamp
    art.burnedAtBlock = event.block.number
    art.burnedAtTransaction = event.transaction.hash
    art.save()

    // Update block floor price
    let price = BlockPrice.load(art.blockNumber.toString())

    if (price != null) {
      price.value = price.value.minus(art.value)
      price.save()
    }

    // Track burning fee
    let burnFee = decimal.fromBigInt(event.transaction.value)
    increaseBalance('treasury', burnFee)

    // Log burn event
    let burn = new ArtBurn(event.transaction.hash.toHexString() + event.logIndex.toString())
    burn.art = art.id
    burn.to = event.params.to.toHexString()
    burn.fee = burnFee
    burn.block = event.block.number
    burn.timestamp = event.block.timestamp
    burn.transaction = event.transaction.hash
    burn.save()
  }
}

export function handleReMintArt(event: ReMint): void {
  let art = Art.load(event.params.tokenId.toString())

  if (art != null) {
    let token = Token.load(art.token)
    let artsContract = BlockArt.bind(token.address as Address)

    // Handle new metadata
    let oldMetadata = art.metadata
    let newMetadata = getOrCreateArtMetadata(artsContract.tokenURI(event.params.tokenId))

    art.metadata = newMetadata.id

    // Mark art as burned
    art.burnedAt = event.block.timestamp
    art.burnedAtBlock = event.block.number
    art.burnedAtTransaction = event.transaction.hash

    art.save()

    // Track remint fee
    let remintFee = decimal.fromBigInt(event.transaction.value)
    increaseBalance('treasury', remintFee)

    // Log remint event
    let burn = new ArtReMint(event.transaction.hash.toHexString() + event.logIndex.toString())
    burn.art = art.id
    burn.oldMetadata = oldMetadata
    burn.newMetadata = newMetadata.id
    burn.fee = remintFee
    burn.block = event.block.number
    burn.timestamp = event.block.timestamp
    burn.transaction = event.transaction.hash
    burn.save()
  }
}
