const { ApiPromise, WsProvider } = require("@polkadot/api")
const rpcFile = {
    "xassets": {
      "getAssetsByAccount": {
        "description": "Return all assets with AssetTypes for an account (exclude native token(PCX)). The returned map would not contains the assets which is not existed for this account but existed in valid assets list.",
        "params": [
          {
            "name": "who",
            "type": "AccountId"
          },
          {
            "name": "at",
            "type": "Hash",
            "isOptional": true
          }
        ],
        "type": "BTreeMap<AssetId, BTreeMap<AssetType, RpcBalance<Balance>>>"
      },
      "getAssets": {
        "description": "get all assets balance and infos",
        "params": [
          {
            "name": "at",
            "type": "Hash",
            "isOptional": true
          }
        ],
        "type": "BTreeMap<AssetId, RpcTotalAssetInfo>"
      }
    },
    "xspot": {
      "getTradingPairs": {
        "description": "Get the overall info of all trading pairs.",
        "params": [
          {
            "name": "at",
            "type": "Hash",
            "isOptional": true
          }
        ],
        "type": "Vec<FullPairInfo<RpcPrice<Price>, BlockNumber>>"
      },
      "getOrdersByAccount": {
        "description": "Get the orders of an account.",
        "params": [
          {
            "name": "who",
            "type": "AccountId"
          },
          {
            "name": "page_index",
            "type": "u32"
          },
          {
            "name": "page_size",
            "type": "u32"
          },
          {
            "name": "at",
            "type": "Hash",
            "isOptional": true
          }
        ],
        "type": "Page<Vec<RpcOrder<TradingPairId,AccountId,RpcBalance<Balance>,RpcPrice<Price>,BlockNumber>>>"
      },
      "getDepth": {
        "description": "Get the depth of a trading pair.",
        "params": [
          {
            "name": "pair_id",
            "type": "TradingPairId"
          },
          {
            "name": "depth_size",
            "type": "u32"
          },
          {
            "name": "at",
            "type": "Hash",
            "isOptional": true
          }
        ],
        "type": "Option<Depth<RpcPrice<Price>, RpcBalance<Balance>>>"
      }
    },
    "xgatewaybitcoin": {
      "verifyTxValid": {
        "description": "Verify transaction is valid",
        "params": [
          {
            "name": "raw_tx",
            "type": "Vec<u8>"
          },
          {
            "name": "withdrawal_id_list",
            "type": "Vec<u32>"
          },
          {
            "name": "full_amount",
            "type": "bool"
          },
          {
            "name": "at",
            "type": "Hash",
            "isOptional": true
          }
        ],
        "type": "bool"
      }
    },
    "xgatewaycommon": {
      "boundAddrs": {
        "description": "Get bound addrs for an accountid",
        "params": [
          {
            "name": "who",
            "type": "AccountId"
          },
          {
            "name": "at",
            "type": "Hash",
            "isOptional": true
          }
        ],
        "type": "BTreeMap<Chain, Vec<String>>"
      },
      "withdrawalLimit": {
        "description": "Get withdrawal limit(minimal_withdrawal&fee) for an AssetId",
        "params": [
          {
            "name": "asset_id",
            "type": "AssetId"
          },
          {
            "name": "at",
            "type": "Hash",
            "isOptional": true
          }
        ],
        "type": "WithdrawalLimit<RpcBalance<Balance>>"
      },
      "withdrawalListWithFeeInfo": {
        "description": "Get withdrawal list for an AssetId",
        "params": [
          {
            "name": "asset_id",
            "type": "AssetId"
          },
          {
            "name": "at",
            "type": "Hash",
            "isOptional": true
          }
        ],
        "type": "BTreeMap<WithdrawalRecordId,(RpcWithdrawalRecord<AccountId, Balance, BlockNumber>, WithdrawalLimit<RpcBalance<Balance>>)>"
      },
      "verifyWithdrawal": {
        "description": "Use the params to verify whether the withdrawal apply is valid. Notice those params is same as the params for call `XGatewayCommon::withdraw(...)`, including checking address is valid or something else. Front-end should use this rpc to check params first, than could create the extrinsic.",
        "params": [
          {
            "name": "asset_id",
            "type": "AssetId"
          },
          {
            "name": "value",
            "type": "u64"
          },
          {
            "name": "addr",
            "type": "String"
          },
          {
            "name": "memo",
            "type": "String"
          },
          {
            "name": "at",
            "type": "Hash",
            "isOptional": true
          }
        ],
        "type": "bool"
      },
      "trusteeMultisigs": {
        "description": "Return the trustee multisig address for all chain.",
        "params": [
          {
            "name": "at",
            "type": "Option<BlockHash>)"
          }
        ],
        "type": "BTreeMap<Chain, AccountId>"
      },
      "bitcoinTrusteeProperties": {
        "description": "Return bitcoin trustee registered property info for an account(e.g. registered hot/cold address)",
        "params": [
          {
            "name": "who",
            "type": "AccountId"
          },
          {
            "name": "at",
            "type": "Hash",
            "isOptional": true
          }
        ],
        "type": "BtcTrusteeIntentionProps"
      },
      "bitcoinTrusteeSessionInfo": {
        "description": "Return bitcoin trustee for current session(e.g. trustee hot/cold address and else)",
        "params": [
          {
            "name": "session_number",
            "type": "i32",
            "isOptional": false
          },
          {
            "name": "at",
            "type": "Hash",
            "isOptional": true
          }
        ],
        "type": "BtcTrusteeSessionInfo<AccountId, BlockNumber>"
      },
      "bitcoinGenerateTrusteeSessionInfo": {
        "description": "Try to generate bitcoin trustee info for a list of candidates. (this api is used to check the trustee info which would be generated by those candidates)",
        "params": [
          {
            "name": "candidates",
            "type": "Vec<AccountId>"
          },
          {
            "name": "at",
            "type": "Hash",
            "isOptional": true
          }
        ],
        "type": "BtcTrusteeSessionInfo<AccountId, BlockNumber>"
      }
    },
    "xgatewayrecords": {
      "withdrawalList": {
        "description": "Return current withdraw list(include Applying and Processing withdraw state)",
        "params": [
          {
            "name": "at",
            "type": "Hash",
            "isOptional": true
          }
        ],
        "type": "BTreeMap<WithdrawalRecordId, RpcWithdrawalRecord<AccountId, Balance, BlockNumber>>"
      },
      "withdrawalListByChain": {
        "description": "Return current withdraw list for a chain(include Applying and Processing withdraw state)",
        "params": [
          {
            "name": "chain",
            "type": "Chain"
          },
          {
            "name": "at",
            "type": "Hash",
            "isOptional": true
          }
        ],
        "type": "BTreeMap<WithdrawalRecordId, RpcWithdrawalRecord<AccountId, Balance, BlockNumber>>"
      },
      "pendingWithdrawalListByChain": {
        "description": "Return current pending withdraw list for a chain",
        "params": [
          {
            "name": "chain",
            "type": "Chain"
          },
          {
            "name": "at",
            "type": "Hash",
            "isOptional": true
          }
        ],
        "type": "BTreeMap<WithdrawalRecordId, RpcWithdrawalRecord<AccountId, Balance, BlockNumber>>"
      }
    },
    "xminingasset": {
      "getMiningAssets": {
        "description": "Get overall information about all mining assets.",
        "params": [
          {
            "name": "at",
            "type": "Hash",
            "isOptional": true
          }
        ],
        "type": "Vec<MiningAssetInfo<AccountId,RpcBalance<Balance>,RpcMiningWeight<MiningWeight>,BlockNumber>>"
      },
      "getDividendByAccount": {
        "description": "Get the asset mining dividends info given the asset miner AccountId.",
        "params": [
          {
            "name": "who",
            "type": "AccountId"
          },
          {
            "name": "at",
            "type": "Hash",
            "isOptional": true
          }
        ],
        "type": "BTreeMap<AssetId, RpcMiningDividendInfo>"
      },
      "getMinerLedgerByAccount": {
        "description": "Get the mining ledger details given the asset miner AccountId.",
        "params": [
          {
            "name": "who",
            "type": "AccountId"
          },
          {
            "name": "at",
            "type": "Hash",
            "isOptional": true
          }
        ],
        "type": "BTreeMap<AssetId, MinerLedger<RpcMiningWeight<MiningWeight>, BlockNumber>>"
      }
    },
    "xstaking": {
      "getValidators": {
        "description": "Get overall information about all potential validators",
        "params": [
          {
            "name": "at",
            "type": "Hash",
            "isOptional": true
          }
        ],
        "type": "Vec<ValidatorInfo<AccountId, RpcBalance<Balance>, RpcVoteWeight<VoteWeight>, BlockNumber>>"
      },
      "getValidatorByAccount": {
        "description": "Get overall information given the validator AccountId.",
        "params": [
          {
            "name": "who",
            "type": "AccountId"
          },
          {
            "name": "at",
            "type": "Hash",
            "isOptional": true
          }
        ],
        "type": "ValidatorInfo<AccountId, RpcBalance<Balance>, RpcVoteWeight<VoteWeight>, BlockNumber>"
      },
      "getDividendByAccount": {
        "description": "Get the staking dividends info given the staker AccountId.",
        "params": [
          {
            "name": "who",
            "type": "AccountId"
          },
          {
            "name": "at",
            "type": "Hash",
            "isOptional": true
          }
        ],
        "type": "BTreeMap<AccountId, RpcBalance<Balance>>"
      },
      "getNominationByAccount": {
        "description": "Get the nomination details given the staker AccountId.",
        "params": [
          {
            "name": "who",
            "type": "AccountId"
          },
          {
            "name": "at",
            "type": "Hash",
            "isOptional": true
          }
        ],
        "type": "BTreeMap<AccountId,NominatorLedger<RpcBalance<Balance>, RpcVoteWeight<VoteWeight>, BlockNumber>>"
      },
      "getNominatorByAccount": {
        "description": "Get individual nominator information given the nominator AccountId.",
        "params": [
          {
            "name": "who",
            "type": "AccountId"
          },
          {
            "name": "at",
            "type": "Hash",
            "isOptional": true
          }
        ],
        "type": "NominatorInfo<BlockNumber>"
      }
    },
    "xfee": {
      "queryDetails": {
        "description": "get the fee details of extrinsic",
        "params": [
          {
            "name": "encoded_xt",
            "type": "Bytes"
          },
          {
            "name": "at",
            "type": "Option<BlockHash>"
          }
        ],
        "type": "RpcFeeDetails"
      }
    }
  }
  
const typeFile =  {
    "AssetId": "u32",
    "TokenInfo": {
      "assetId": "AssetId",
      "assetInfo": "AssetInfo"
    },
    "AssetInfo": {
      "token": "String",
      "tokenName": "String",
      "chain": "Chain",
      "decimals": "Decimals",
      "desc": "String"
    },
    "Chain": {
      "_enum": [
        "ChainX",
        "Bitcoin",
        "Ethereum",
        "Polkadot",
        "Dogecoin",
        "Binance"
      ]
    },
    "String": "Text",
    "Decimals": "u8",
    "AssetRestrictions": {
      "bits": "u32"
    },
    "AssetType": {
      "_enum": [
        "Usable",
        "Locked",
        "Reserved",
        "ReservedWithdrawal",
        "ReservedDexSpot"
      ]
    },
    "Desc": "Vec<u8>",
    "Token": "Vec<u8>",
    "Amount": "i128",
    "AmountOf": "Amount",
    "CurrencyIdOf": "AssetId",
    "CurrencyId": "AssetId",
    "AssetRestriction": {
      "_enum": [
        "Move",
        "Transfer",
        "Deposit",
        "Withdraw",
        "DestroyWithdrawal",
        "DestroyFree"
      ]
    },
    "Handicap": {
      "highest_bid": "Price",
      "lowest_ask": "Price"
    },
    "NetworkType": {
      "_enum": [
        "Mainnet",
        "Testnet"
      ]
    },
    "Order": {
      "props": "OrderProperty",
      "status": "OrderStatus",
      "remaining": "Balance",
      "executed_indices": "Vec<TradingHistoryIndex>",
      "already_filled": "Balance",
      "last_update_at": "BlockNumber"
    },
    "OrderProperty": {
      "id": "OrderId",
      "side": "Side",
      "price": "Price",
      "amount": "Amount",
      "pair_id": "TradingPairId",
      "submitter": "AccountId",
      "order_type": "OrderType",
      "created_at": "BlockNumber"
    },
    "TotalAssetInfo": {
      "info": "AssetInfo",
      "balance": "BTreeMap<AssetType, Balance>",
      "is_online": "bool",
      "restrictions": "AssetRestrictions"
    },
    "NominatorLedger": {
      "nomination": "Balance",
      "last_vote_weight": "VoteWeight",
      "last_vote_weight_update": "BlockNumber",
      "unbonded_chunks": "Vec<Unbonded>"
    },
    "Unbonded": {
      "value": "Balance",
      "locked_until": "BlockNumber"
    },
    "WithdrawalRecordId": "u32",
    "WithdrawalState": {
      "_enum": [
        "Applying",
        "Processing",
        "NormalFinish",
        "RootFinish",
        "NormalCancel",
        "RootCancel"
      ]
    },
    "WithdrawalRecord": {
      "asset_id": "AssetId",
      "applicant": "AccountId",
      "balance": "Balance",
      "addr": "AddrStr",
      "ext": "Memo",
      "height": "BlockNumber"
    },
    "WithdrawalLimit": {
      "minimal_withdrawal": "Balance",
      "fee": "Balance"
    },
    "TrusteeInfoConfig": {
      "min_trustee_count": "u32",
      "max_trustee_count": "u32"
    },
    "GenericTrusteeIntentionProps": {
      "about": "Text",
      "hot_entity": "Vec<u8>",
      "cold_entity": "Vec<u8>"
    },
    "GenericTrusteeSessionInfo": {
      "trustee_list": "Vec<AccountId>",
      "threshold": "u16",
      "hot_address": "Vec<u8>",
      "cold_address": "Vec<u8>"
    },
    "ChainAddress": "Vec<u8>",
    "BtcTrusteeType": "Vec<u8>",
    "BtcTrusteeAddrInfo": {
      "addr": "BtcAddress",
      "redeemScript": "Vec<u8>"
    },
    "BtcTrusteeIntentionProps": {
      "about": "Text",
      "hot_entity": "BtcTrusteeType",
      "cold_entity": "BtcTrusteeType"
    },
    "BtcTrusteeSessionInfo": {
      "trusteeList": "Vec<(AccountId, u64)>",
      "threshold": "u16",
      "hotAddress": "BtcTrusteeAddrInfo",
      "coldAddress": "BtcTrusteeAddrInfo",
      "multiAccount": "Option<AccountId>",
      "startHeight": "Option<BlockNumber>",
      "endHeight": "Option<BlockNumber>"
    },
    "BtcNetwork": {
      "_enum": [
        "Mainnet",
        "Testnet"
      ]
    },
    "BtcAddress": "Text",
    "BtcHeader": "Vec<u8>",
    "BtcTransaction": "Vec<u8>",
    "BtcPartialMerkleTree": "Vec<u8>",
    "BtcRelayedTxInfo": {
      "block_hash": "H256",
      "merkle_proof": "BtcPartialMerkleTree"
    },
    "BtcHeaderIndex": {
      "hash": "H256",
      "height": "u32"
    },
    "BtcTxResult": {
      "_enum": [
        "Success",
        "Failure"
      ]
    },
    "BtcTxState": {
      "tx_type": "BtcTxType",
      "result": "BtcTxResult"
    },
    "BtcTxType": {
      "_enum": [
        "Withdrawal",
        "Deposit",
        "HotAndCold",
        "TrusteeTransition",
        "Irrelevance"
      ]
    },
    "BtcDepositCache": {
      "txid": "H256",
      "balance": "u64"
    },
    "BtcVoteResult": {
      "_enum": [
        "Unfinish",
        "Finish"
      ]
    },
    "BtcWithdrawalProposal": {
      "sig_state": "BtcVoteResult",
      "withdrawal_id_list": "Vec<u32>",
      "tx": "BtcTransaction",
      "trustee_list": "Vec<(AccountId, bool)>"
    },
    "BtcTxVerifier": {
      "_enum": [
        "Recover",
        "RuntimeInterface"
      ]
    },
    "RpcTotalAssetInfo": {
      "info": "AssetInfo",
      "balance": "BTreeMap<AssetType, RpcBalance>",
      "is_online": "bool",
      "restrictions": "AssetRestrictions"
    },
    "RpcOrder": {
      "id": "OrderId",
      "side": "Side",
      "price": "RpcPrice",
      "amount": "RpcBalance",
      "pair_id": "TradingPairId",
      "submitter": "AccountId",
      "order_type": "OrderType",
      "created_at": "BlockNumber",
      "status": "OrderStatus",
      "remaining": "RpcBalance",
      "executed_indices": "Vec<TradingHistoryIndex>",
      "already_filled": "RpcBalance",
      "reserved_balance": "RpcBalance",
      "last_update_at": "BlockNumber"
    },
    "RpcWithdrawalRecord": {
      "asset_id": "AssetId",
      "applicant": "AccountId",
      "balance": "RpcBalance",
      "addr": "String",
      "ext": "String",
      "height": "BlockNumber",
      "state": "WithdrawalState"
    },
    "RpcMiningDividendInfo": {
      "own": "RpcBalance",
      "other": "RpcBalance",
      "insufficient_stake": "RpcBalance"
    },
    "RpcInclusionFee": {
      "base_fee": "RpcBalance",
      "len_fee": "RpcBalance",
      "adjusted_weight_fee": "RpcBalance"
    },
    "RpcFeeDetails": {
      "inclusion_fee": "Option<RpcInclusionFee>",
      "tip": "RpcBalance",
      "extra_fee": "RpcBalance",
      "final_fee": "RpcBalance"
    },
    "ValidatorInfo": {
      "account": "AccountId",
      "registered_at": "BlockNumber",
      "is_chilled": "bool",
      "last_chilled": "Option<BlockNumber>",
      "total_nomination": "RpcBalance",
      "last_total_vote_weight": "RpcVoteWeight",
      "last_total_vote_weight_update": "BlockNumber",
      "is_validating": "bool",
      "self_bonded": "RpcBalance",
      "referral_id": "String",
      "reward_pot_account": "AccountId",
      "reward_pot_balance": "RpcBalance"
    },
    "FullPairInfo": {
      "base_currency": "AssetId",
      "highest_bid": "RpcPrice",
      "id": "TradingPairId",
      "latest_price": "RpcPrice",
      "latest_price_updated_at": "BlockNumber",
      "lowest_ask": "RpcPrice",
      "max_valid_bid": "RpcPrice",
      "min_valid_ask": "RpcPrice",
      "pip_decimals": "u32",
      "quote_currency": "AssetId",
      "tick_decimals": "u32",
      "tradable": "bool"
    },
    "MiningAssetInfo": {
      "asset_id": "AssetId",
      "mining_power": "FixedAssetPower",
      "reward_pot": "AccountId",
      "reward_pot_balance": "RpcBalance",
      "last_total_mining_weight": "RpcMiningWeight",
      "last_total_mining_weight_update": "BlockNumber"
    },
    "Depth": {
      "asks": "Vec<(RpcPrice, RpcBalance)>",
      "bids": "Vec<(RpcPrice, RpcBalance)>"
    },
    "Page": {
      "page_index": "u32",
      "page_size": "u32",
      "data": "Vec<RpcOrder>"
    },
    "Price": "u128",
    "Balance": "u128",
    "MiningWeight": "u128",
    "VoteWeight": "u128",
    "RpcPrice": "String",
    "RpcBalance": "String",
    "RpcMiningWeight": "String",
    "RpcVoteWeight": "String",
    "OrderInfo": "Order",
    "HandicapInfo": "Handicap",
    "FullIdentification": "ValidatorId",
    "WithdrawalRecordOf": "WithdrawalRecord",
    "ChainId": "u8",
    "BlockLength": "u32",
    "BlockWeights": {
      "baseBlock": "Weight",
      "maxBlock": "Weight",
      "perClass": "PerDispatchClass"
    },
    "PerDispatchClass": {
      "normal": "WeightPerClass",
      "operational": "WeightPerClass",
      "mandatory": "WeightPerClass"
    },
    "WeightPerClass": {
      "baseExtrinsic": "Weight",
      "maxExtrinsic": "Weight",
      "maxTotal": "Option<Weight>",
      "reserved": "Option<Weight>"
    },
    "Address": "MultiAddress",
    "LookupSource": "MultiAddress",
    "RequestId": "u128",
    "BlockNumberFor": "BlockNumber",
    "Vault": {
      "id": "AccountId",
      "toBeIssuedTokens": "Balance",
      "issuedTokens": "Balance",
      "toBeRedeemedTokens": "Balance",
      "wallet": "Text",
      "bannedUntil": "BlockNumber",
      "status": "VaultStatus"
    },
    "VaultStatus": {
      "_enum": [
        "Active",
        "Liquidated",
        "CommittedTheft"
      ]
    },
    "TradingPrice": {
      "price": "u128",
      "decimal": "u8"
    },
    "AddrStr": "Text",
    "Network": {
      "_enum": [
        "Mainnet",
        "Testnet"
      ]
    },
    "AddressHash": "H160",
    "IssueRequest": {
      "vault": "AccountId",
      "openTime": "BlockNumber",
      "requester": "AccountId",
      "btcAddress": "BtcAddress",
      "completed": "bool",
      "cancelled": "bool",
      "btcAmount": "Balance",
      "griefingCollateral": "Balance"
    },
    "RedeemRequestStatus": {
      "_enum": [
        "Processing",
        "Cancled",
        "Completed"
      ]
    },
    "RedeemRequest": {
      "vault": "AccountId",
      "openTime": "BlockNumber",
      "requester": "AccountId",
      "btcAddress": "BtcAddress",
      "amount": "Balance",
      "redeemFee": "Balance",
      "status": "RedeemRequestStatus",
      "reimburse": "bool"
    },
    "chainbridge::ChainId": "u8",
    "ResourceId": "[u8; 32]",
    "DepositNonce": "u64",
    "ProposalVotes": {
      "votes_for": "Vec<AccountId>",
      "votes_against": "Vec<AccountId>",
      "status": "enum"
    },
    "Erc721Token": {
      "id": "TokenId",
      "metadata": "Vec<u8>"
    },
    "TokenId": "U256",
    "BtcHeaderInfo": {
      "header": "BtcHeader",
      "height": "u32"
    },
    "BtcParams": {
      "maxBits": "u32",
      "blockMaxFuture": "u32",
      "targetTimespanSeconds": "u32",
      "targetSpacingSeconds": "u32",
      "retargetingFactor": "u32",
      "retargetingInterval": "u32",
      "minTimespan": "u32",
      "maxTimespan": "u32"
    },
    "Memo": "Text",
    "OrderExecutedInfo": {
      "tradingHistoryIdx": "TradingHistoryIndex",
      "pairId": "TradingPairId",
      "price": "Price",
      "maker": "AccountId",
      "taker": "AccountId",
      "makerOrderId": "OrderId",
      "takerOrderId": "OrderId",
      "turnover": "Balance",
      "executedAt": "BlockNumber"
    },
    "TradingPairProfile": {
      "id": "TradingPairId",
      "currencyPair": "CurrencyPair",
      "pipDecimals": "u32",
      "tickDecimals": "u32",
      "tradable": "bool"
    },
    "TradingPairId": "u32",
    "OrderType": {
      "_enum": [
        "Limit",
        "Market"
      ]
    },
    "Side": {
      "_enum": [
        "Buy",
        "Sell"
      ]
    },
    "LockedType": {
      "_enum": [
        "Bonded",
        "BondedWithdrawal"
      ]
    },
    "TradingPairInfo": {
      "latestPrice": "Price",
      "lastUpdated": "BlockNumber"
    },
    "MiningDividendInfo": {
      "own": "Balance",
      "other": "Balance",
      "insufficientStake": "Balance"
    },
    "AssetLedger": {
      "lastTotalMiningWeight": "MiningWeight",
      "lastTotalMiningWeightUpdate": "BlockNumber"
    },
    "MinerLedger": {
      "lastMiningWeight": "MiningWeight",
      "lastMiningWeightUpdate": "BlockNumber",
      "lastClaim": "Option<BlockNumber>"
    },
    "ClaimRestriction": {
      "stakingRequirement": "StakingRequirement",
      "frequencyLimit": "BlockNumber"
    },
    "NominatorInfo": {
      "lastRebond": "Option<BlockNumber>"
    },
    "BondRequirement": {
      "selfBonded": "Balance",
      "total": "Balance"
    },
    "ValidatorLedger": {
      "totalNomination": "Balance",
      "lastTotalVoteWeight": "VoteWeight",
      "lastTotalVoteWeightUpdate": "BlockNumber"
    },
    "ValidatorProfile": {
      "registeredAt": "BlockNumber",
      "isChilled": "bool",
      "lastChilled": "Option<BlockNumber>",
      "referralId": "ReferralId"
    },
    "GlobalDistribution": {
      "treasury": "u32",
      "mining": "u32"
    },
    "MiningDistribution": {
      "asset": "u32",
      "staking": "u32"
    },
    "InclusionFee": {
      "baseFee": "Balance",
      "lenFee": "Balance",
      "adjustedWeightFee": "Balance"
    },
    "FeeDetails": {
      "inclusionFee": "Option<InclusionFee<Balance>>",
      "extraFee": "Balance",
      "tip": "Balance",
      "finalFee": "Balance"
    },
    "UnbondedIndex": "u32",
    "OrderId": "u64",
    "TradingHistoryIndex": "u64",
    "PriceFluctuation": "u32",
    "FixedAssetPower": "u32",
    "StakingRequirement": "u32",
    "CurrencyPair": {
      "base": "AssetId",
      "quote": "AssetId"
    },
    "OrderStatus": {
      "_enum": [
        "Created",
        "PartialFill",
        "Filled",
        "PartialFillAndCanceled",
        "Canceled"
      ]
    },
    "ReferralId": "Text"
  }
    
class Api {
    api = null;
    provider = null;

    constructor() {
        const wsProvider = new WsProvider("wss://mainnet.chainx.org/ws");
        this.api = new ApiPromise({ rpc: rpcFile, types: typeFile, provider: wsProvider });
    }

    static getInstance() {
        if (!Api.instance) {
            Api.instance = new Api();
        }

        return Api.instance;
    }

    async ready() {
        await this.api.isReady;
    }

    async getTrusteeSessionInfo(session_number) {
        await this.ready()
        // @ts-ignore
        const bitcoinTrusteeSessionInfo = await this.api.rpc.xgatewaycommon.bitcoinTrusteeSessionInfo(session_number);
        return bitcoinTrusteeSessionInfo
    }

    async getChainProperties() {
         return {
             ss58Format: 44,
             bitcoinType: "mainnet",
             tokenDecimals:18,
             tokenSymbol:'PCX'
         };
     }

}

module.exports = Api
