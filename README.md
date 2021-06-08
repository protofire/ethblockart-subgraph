# eth.blockArt

This subgraph provides handler for the main features of this project

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
