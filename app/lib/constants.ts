import { parseUnits } from "viem";

export const contractAddress = "0x543e186ae5c7fea674c489f50215ee8036e87897";

export const token = {
  address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
  name: "DAI",
  decimals: 18,
};

export const subgraphApi =
  "https://api.thegraph.com/subgraphs/name/0xngmi/llamasubs-optimism";

export const periodDuration = 24 * 60 * 60;

export const DIVISOR = parseUnits("1", token.decimals);

export const llamaAddress = "0xeCD5f3309A0293126609104FBc034158C8AACD30";
export const subscriptionAmount = 2; // 10 DAI

export const SERVER_API =
  "https://7zlw4f9i3e.execute-api.eu-central-1.amazonaws.com/prod";
