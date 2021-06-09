# eth.blockArt
	made with love by protofire.io team for thegraph.com under the MIT license

"Blockchain art you create, deterministically generated from the Ethereum blockchain and your inputs."

> https://ethblock.art/

This subgraph provides an interface for the main features of this project such as the Art, Styles and Accounts. Provinding info about standart transactions, minting, burn. Also metadata for art, styles, art attributes, etc.

This subgraph rely's on following contracts:
- BlockStyle: 0x73c8460f8043a4521c889a3cc23d1c81214a1d25 
- BlockArt: 0xb80fbf6cdb49c33dc6ae4ca11af8ac47b0b4c0f3
- bLockArtFactory: 0xa6d71f644e0c3e1673bd99f32e84f21827322ae3
## Art 

	event: Transfer(indexed address,indexed address,indexed uint256)
	contract: BlockArt

The **art entity** provides useful information about the art piece itself, linking to the also useful **ArtMetadata** which contains even more data.

Relates to an owner's Account, a creator's Account, & Style, Token and ArtMetadata entities.

the ArtMetadata entity relates to the ArtAttribute and ArtSetting entities. 

## ArtEvent
	contract: BlockArtFactory
    - event: Burn(indexed address,indexeduint256)
    - event: ReMint(indexed addressindexed uint256)
    - event: StyleFeeCollected(indexedaddress,uint256,uint256)
    - event: StyleRemoved(indexed uint256)

The ArtEvent interface provides a way to support the transactions trough the following entities:

	ArtBurn, ArtTransfer, ArtMint ArtReMint.


## Styles

	event: Transfer(indexed address,indexed address,indexed uint256)
	contract: BlockStyle

The **Style entity** provides information related to the styles it's creation an remotion.

Relates to an owner's Account, a creator's Account, & a Token  entity.

## Other entities

Additionally, this subgraph provide following entities as additional sources of data:
Balance, Counter, Block Price & Token

## Example queries

```graphql
# Get first 50 accounts an it's related arts
{
  accounts (first: 50){
	arts {
		token {
			name
			symbol
			supply
		}
		description
	}

  }
}
```


```graphql
# Get Styles info
{
	styles(first:10){
		feeBalance
		creatorName
		token {
				name
				symbol
				supply
		}
		creator {
			address
		}
	}
}
```


```graphql
# Get all burned arts
{
   artBurn{
    art{
		creator{
			address
		}
		createdAt
		name
	}
   fee
   block
  }
}
```

```graphql
# working with artEvents
{
   artEvents{
	   art{
		   name
	   }
	   timestamp
	   block
	   ...on ArtMint{
		   fee
	   }
	   ...on ArtReMint{
		   newMetadata{
			   description
		   }
	   }
	   ...on ArtTransfer{
		   from{
			   address
		   }
		   to{
			   address
		   }
	   }
	   ...on ArtBurn{
		   fee
	   }
   }
}
```
