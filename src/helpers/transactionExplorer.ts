import { TEST_COINS } from "./helper";

export type Network =
  | "BTC"
  | "ETH"
  | "ERC20"
  | "TRC20"
  | "POLYGON"
  | "BSC"
  | "ICON"
  | "EUR";

type ExplorerContext = {
  network: Network;
  isTestnet: boolean;
};

/**
 * Derives blockchain network + environment from asset identifiers
 */
export const deriveExplorerContext = (
  assetId?: string,
  assetName?: string,
): ExplorerContext | null => {
  const id = assetId?.toUpperCase() ?? "";

  console.log("id", id);
  const name = assetName?.toUpperCase() ?? "";

  const isTestnet =
    id.includes("TEST") ||
    id.includes("TESTNET") ||
    id.includes("SEPOLIA") ||
    id.includes("GOERLI");

  // Fiat
  if (id.includes("EUR") || name.includes("EURO")) {
    return { network: "EUR", isTestnet: false };
  }

  // Bitcoin
  if (id.includes("BTC")) {
    return { network: "BTC", isTestnet };
  }

  // TRON / TRC20
  if (id.includes("TRC") || id.includes("TRON") || id.includes("TRX")) {
    return { network: "TRC20", isTestnet };
  }

  // Binance Smart Chain
  if (id.includes("BSC")) {
    return { network: "BSC", isTestnet };
  }

  // Polygon
  if (id.includes("POLYGON") || id.includes("MATIC") || id.includes("POS")) {
    return { network: "POLYGON", isTestnet };
  }

  // Ethereum / ERC20
  if (id.includes("ETH") || name.includes("ETHEREUM")) {
    if (id.includes("USDC") || id.includes("USDT")) {
      return { network: "ERC20", isTestnet };
    }
    return { network: "ETH", isTestnet };
  }

  // ICON
  if (id.includes("ICON")) {
    return { network: "ICON", isTestnet };
  }

  return null;
};

/**
 * Returns the correct transaction explorer URL
 */
export const getTransactionExplorerUrl = (
  txHash?: string,
  assetId?: string,
): string | null => {
  if (!txHash || !assetId) return null;

  const isTestnet = process.env.NEXT_PUBLIC_DEPLOYMENT_TYPE === "qa";

  const explorerMap: Record<string, { mainnet: string; testnet?: string }> = {
    // BTC
    [TEST_COINS.BTC]: {
      mainnet: `https://www.blockchain.com/btc/tx/${txHash}`,
      testnet: `https://blockstream.info/testnet/tx/${txHash}`,
    },

    [TEST_COINS.BTC_TEST]: {
      testnet: `https://blockstream.info/testnet/tx/${txHash}`,
      mainnet: `https://www.blockchain.com/btc/tx/${txHash}`,
    },

    // ETH / ERC20
    [TEST_COINS.ETH]: {
      mainnet: `https://etherscan.io/tx/${txHash}`,
      testnet: `https://sepolia.etherscan.io/tx/${txHash}`,
    },
    [TEST_COINS.ETH_TEST5]: {
      testnet: `https://sepolia.etherscan.io/tx/${txHash}`,
      mainnet: `https://etherscan.io/tx/${txHash}`,
    },
    [TEST_COINS.USDC_ERC20]: {
      mainnet: `https://etherscan.io/tx/${txHash}`,
      testnet: `https://sepolia.etherscan.io/tx/${txHash}`,
    },
    [TEST_COINS.USDT_ERC20]: {
      mainnet: `https://etherscan.io/tx/${txHash}`,
      testnet: `https://sepolia.etherscan.io/tx/${txHash}`,
    },
    [TEST_COINS.USDC]: {
      mainnet: `https://etherscan.io/tx/${txHash}`,
      testnet: `https://sepolia.etherscan.io/tx/${txHash}`,
    },
    [TEST_COINS.USDC_ETH_TEST5_AN74]: {
      testnet: `https://sepolia.etherscan.io/tx/${txHash}`,
      mainnet: `https://etherscan.io/tx/${txHash}`,
    },

    // Polygon
    [TEST_COINS.USDC_POLYGON]: {
      mainnet: `https://polygonscan.com/tx/${txHash}`,
      testnet: `https://polygonscan.com/tx/${txHash}`,
    },

    // BSC
    [TEST_COINS.USDT_BSC_TEST]: {
      testnet: `https://testnet.bscscan.com/tx/${txHash}`,
      mainnet: `https://bscscan.com/tx/${txHash}`,
    },

    // TRON
    [TEST_COINS.TRX_TEST]: {
      testnet: `https://nile.tronscan.org/#/transaction/${txHash}`,
      mainnet: `https://tronscan.org/#/transaction/${txHash}`,
    },
    [TEST_COINS.TRX_USDT_S2UZ]: {
      mainnet: `https://tronscan.org/#/transaction/${txHash}`,
      testnet: `https://nile.tronscan.org/#/transaction/${txHash}`,
    },

    [TEST_COINS.USDCPOS_B6BMTT9T_F8E4]: {
      testnet: `https://polygonscan.com/tx/${txHash}`,
      mainnet: `https://polygonscan.com/tx/${txHash}`,
    },
  };

  const explorer = explorerMap[assetId];

  if (!explorer) return null;

  return isTestnet && explorer.testnet ? explorer.testnet : explorer.mainnet;
};
