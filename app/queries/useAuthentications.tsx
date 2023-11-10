import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { optimism } from "viem/chains";
import { useAccount, useNetwork } from "wagmi";
import { signMessage } from "wagmi/actions";
import { SERVER_API } from "~/lib/constants";
import { fetchX } from "~/lib/fetch";
import { getSIWEMessage } from "~/lib/siwe";

async function checkTokenValidity({ address }: { address?: string | null }) {
  try {
    if (!address) return false;

    const auth_token =
      window.localStorage.getItem(`auth_token_${address}`) ?? null;

    if (auth_token) return true;

    return false;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function getAuthToken({ address }: { address?: string | null }) {
  try {
    if (!address) {
      return null;
    }

    const isTokenInLocalStorageValid = await checkTokenValidity({
      address,
    });

    if (!isTokenInLocalStorageValid) {
      return null;
    }

    return window.localStorage.getItem(`auth_token_${address}`) ?? null;
  } catch (error: any) {
    throw new Error(error?.message);
  }
}

export function useGetAuthToken() {
  const { address } = useAccount();
  const { chain } = useNetwork();

  return useQuery(
    ["auth-token", address],
    () =>
      getAuthToken({
        address:
          chain && !chain.unsupported && chain.id === optimism.id
            ? address
            : null,
      }),
    { retry: false }
  );
}

export async function signAndGetAuthToken({
  address,
}: {
  address?: string | null;
}) {
  try {
    if (!address) {
      throw new Error("Invalid arguments");
    }

    const siweMessage = getSIWEMessage({
      domain: window.location.host,
      address,
      statement: `Sign in to ${window.location.host} to get API Key`,
      uri: window.location.origin,
      version: "1",
      chainId: optimism.id,
      nonce: `${Math.floor(Math.random() * 64)}`,
    });

    const data = await signMessage({ message: siweMessage as string });

    if (!data) {
      throw new Error("Failed to generate signature");
    }

    const verifyRes = await fetchX(`${SERVER_API}/sign-in`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: siweMessage, signature: data }),
    });

    if (!verifyRes.key) {
      throw new Error("Failed to generate auth token");
    }

    return verifyRes.key;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export function useSignInWithEthereum() {
  const queryClient = useQueryClient();

  return useMutation(signAndGetAuthToken, {
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
}
