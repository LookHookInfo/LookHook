// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IBalance {
    function balanceOf(address account) external view returns (uint256);
}

interface IReward {
    function canClaim(address user) external view returns (bool);
    function claimed(address user) external view returns (bool);
    function rewardAmount() external view returns (uint256);
}

interface ISeaReward is IReward {
    function isShark(address user) external view returns (bool);
    function isVoter(address user) external view returns (bool);
    function isX(address user) external view returns (bool);
}

contract RewardBlocksAggregator {
    struct BlockStatus {
        bool canClaim;
        bool alreadyClaimed;
        uint256 rewardAmount;
        uint256 poolBalance;
    }

    struct UserStatus {
        BlockStatus heli;
        bool heliHasGm;
        bool heliHasBadge;
        bool heliHasEarly;
        BlockStatus lambo;
        bool lamboHasGm;
        bool lamboHasGem;
        bool lamboHasGram;
        bool lamboHasWhale;
        BlockStatus welcome;
        BlockStatus sea;
        bool seaIsShark;
        bool seaIsVoter;
        bool seaIsX;
        uint256 totalClaimable;
    }

    IBalance public constant HASH = IBalance(0xA9B631ABcc4fd0bc766d7C0C8fCbf866e2bB0445);
    IReward public constant HELI = IReward(0x3EB421C3fC1BFcd50fE539a5f92D01bB74Aa27E2);
    IReward public constant LAMBO = IReward(0x33De46CCB070936F64fb8Bb0Fc6C4495A29a4602);
    IReward public constant WELCOME = IReward(0xA2116B995A314c0F5Bcb67c32B62d5e2F17a5424);
    ISeaReward public constant SEA = ISeaReward(0x07EbD4C678281b87594cF40f3ec6e9Af300f46B7);
    IBalance public constant NFT_GM = IBalance(0x3B01Ad4F0aa8663174A7cE44ed9C7223791Fa16f);
    IBalance public constant NFT_BADGE = IBalance(0x6249E34dB9858676950c05fF66eCf96Aee4b7ba5);
    IBalance public constant NFT_EARLY = IBalance(0xe6DC0fe06C141329050A1B2F3e9c4A7f944450B0);
    IBalance public constant NFT_GEM = IBalance(0xa0021fc511Ad7348Ba7b1a9Ad564E29f2A54E928);
    IBalance public constant NFT_GRAM = IBalance(0x4De659ef1617eF215f36A1953B3Cd7a4A10a5159);
    IBalance public constant NFT_WHALE = IBalance(0x7aa5fc50D0E4A400545E34055134C89F2b310080);

    function _status(IReward reward, address user, bool eligible)
        internal
        view
        returns (BlockStatus memory)
    {
        bool claimed = reward.claimed(user);
        return BlockStatus({
            canClaim: eligible && !claimed,
            alreadyClaimed: claimed,
            rewardAmount: reward.rewardAmount(),
            poolBalance: HASH.balanceOf(address(reward))
        });
    }

    function _computeStatus(address user) internal view returns (UserStatus memory status) {
        bool gm = NFT_GM.balanceOf(user) > 0;

        bool heliBadge = NFT_BADGE.balanceOf(user) > 0;
        bool heliEarly = NFT_EARLY.balanceOf(user) > 0;
        status.heliHasGm = gm;
        status.heliHasBadge = heliBadge;
        status.heliHasEarly = heliEarly;
        status.heli = _status(HELI, user, gm && heliBadge && heliEarly);

        bool lamboGem = NFT_GEM.balanceOf(user) > 0;
        bool lamboGram = NFT_GRAM.balanceOf(user) > 0;
        bool lamboWhale = NFT_WHALE.balanceOf(user) > 0;
        status.lamboHasGm = gm;
        status.lamboHasGem = lamboGem;
        status.lamboHasGram = lamboGram;
        status.lamboHasWhale = lamboWhale;
        status.lambo = _status(LAMBO, user, gm && lamboGem && lamboGram && lamboWhale);

        status.welcome = _status(WELCOME, user, WELCOME.canClaim(user));

        status.seaIsShark = SEA.isShark(user);
        status.seaIsVoter = SEA.isVoter(user);
        status.seaIsX = SEA.isX(user);
        status.sea = _status(SEA, user, SEA.canClaim(user));

        uint256 total = 0;
        if (status.heli.canClaim) total += status.heli.rewardAmount;
        if (status.lambo.canClaim) total += status.lambo.rewardAmount;
        if (status.welcome.canClaim) total += status.welcome.rewardAmount;
        if (status.sea.canClaim) total += status.sea.rewardAmount;
        status.totalClaimable = total;
    }

    function getUserStatus(address user) external view returns (UserStatus memory) {
        return _computeStatus(user);
    }

    function hasAnyClaimable(address user) external view returns (bool) {
        UserStatus memory status = _computeStatus(user);
        return status.heli.canClaim || status.lambo.canClaim || status.welcome.canClaim || status.sea.canClaim;
    }

    function getTotalClaimableReward(address user) external view returns (uint256) {
        return _computeStatus(user).totalClaimable;
    }

    function getPools()
        external
        view
        returns (uint256 heliPool, uint256 lamboPool, uint256 welcomePool, uint256 seaPool)
    {
        heliPool = HASH.balanceOf(address(HELI));
        lamboPool = HASH.balanceOf(address(LAMBO));
        welcomePool = HASH.balanceOf(address(WELCOME));
        seaPool = HASH.balanceOf(address(SEA));
    }
}