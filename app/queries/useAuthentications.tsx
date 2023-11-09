import { useMutation, useQueryClient } from "@tanstack/react-query";
import { optimism } from "viem/chains";
import { signMessage } from "wagmi/actions";
import { SERVER_API } from "~/lib/constants";
import { getSIWEMessage } from "~/lib/siwe";

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
      statement: `Sign in with Ethereum to sealed.art`,
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

    console.log({ verifyRes });

    if (!verifyRes["auth_token"]) {
      throw new Error("Failed to generate auth token");
    }

    return verifyRes["auth_token"];
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

export async function handleServerResponse(res: Response, url: string) {
  const data = await res.json();

  if (res.status !== 200 || data.error) {
    console.log(
      `[ERROR] Failed to fetch ${url} : ${
        data.message ?? data.error ?? res.statusText ?? "-"
      }`
    );
    throw new Error(
      data.message ?? data.error ?? res.statusText ?? `Failed to fetch ${url}`
    );
  }
  return data;
}

export async function fetchX(url: string, init?: RequestInit | undefined) {
  const data = fetch(url as RequestInfo | URL, init).then((res) =>
    handleServerResponse(res, url)
  );

  return data;
}