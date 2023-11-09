import type { MetaFunction } from "@remix-run/node";
import { useEffect } from "react";
import { useAccount } from "wagmi";
import { useHydrated } from "~/hooks/useHydrated";
import { llamaAddress, subscriptionAmount } from "~/lib/constants";
import { useSignInWithEthereum } from "~/queries/useAuthentications";
import { useGetCurrentKey } from "~/queries/useGetCurrentKey";
import { useGetSubs } from "~/queries/useGetSubs";

export const meta: MetaFunction = () => {
  return [
    { title: "Developers - DefiLlama" },
    { name: "description", content: "Welcome!" },
  ];
};

export default function Index() {
  const { address, isConnected } = useAccount();

  const {
    data: subs,
    isLoading: fetchingSubs,
    error: errorFetchingSubs,
    refetch: refetchSubs,
  } = useGetSubs({ address });

  const hydrated = useHydrated();

  useEffect(() => {
    window.addEventListener("message", (message) => {
      console.log({ message });
      if (message.data.subscribed === true) {
        refetchSubs();
      }
    });
  }, [refetchSubs]);

  const {
    data: authToken,
    mutate: signIn,
    isLoading: signingIn,
    isError: errorSigningIn,
  } = useSignInWithEthereum();

  const {
    data: currentApiKey,
    isLoading: fetchingCurrentApiKey,
    error: errorFetchingCurrentApiKey,
  } = useGetCurrentKey({ authToken });

  return (
    <div className="flex flex-col my-8">
      {!hydrated ? (
        <div className="flex flex-col mx-auto max-w-[384px] w-full my-20">
          <p className="text-center"></p>
        </div>
      ) : !isConnected ? (
        <div className="flex flex-col mx-auto max-w-[384px] w-full my-20">
          <p className="text-center">Connect Wallet to view your API Key</p>
        </div>
      ) : fetchingSubs ? (
        <div className="flex flex-col mx-auto max-w-[384px] w-full my-20">
          <p className="text-center">Fetching Subscriptions...</p>
        </div>
      ) : errorFetchingSubs ? (
        <div className="flex flex-col mx-auto max-w-[384px] w-full my-20">
          <p className="text-center text-red-500">
            {(errorFetchingSubs as any)?.message ??
              "Error fetching your subscription details"}
          </p>
        </div>
      ) : !subs ||
        subs.length === 0 ||
        new Date().getTime() >= +subs[0].expirationDate * 1000 ? (
        <div className="mx-auto flex flex-col gap-2">
          <h1 className="text-center text-2xl">Subscribe</h1>
          <iframe
            title="Llama Subscriptions"
            width="384"
            height="560"
            src={`https://llamasubs.vercel.app/subscribe?to=${llamaAddress}&amount=${subscriptionAmount}`}
            id="llama-sub-frame"
          />
        </div>
      ) : (
        <div className="flex flex-col gap-4 mx-auto max-w-[384px] w-full my-20">
          {authToken ? (
            <>
              {fetchingCurrentApiKey ? (
                <p className="text-center">Fetching current API key</p>
              ) : (
                <>
                  <p>
                    <span>Current API Key</span>
                    <span>{currentApiKey}</span>
                  </p>

                  <button
                    className="border p-2 disabled:cursor-not-allowed text-white disabled:opacity-60"
                    disabled
                  >
                    Generate a New Key
                  </button>
                </>
              )}
            </>
          ) : (
            <button
              className="border p-2 disabled:cursor-not-allowed text-white disabled:opacity-60"
              disabled={!signIn || signingIn}
              onClick={() => signIn?.({ address })}
            >
              {signingIn ? "Authenticating..." : "Sign in to view your API key"}
            </button>
          )}

          {errorSigningIn ? (
            <p className="text-center text-red-500">
              {(errorSigningIn as any)?.message ?? "Failed to authenticate"}
            </p>
          ) : null}

          {errorFetchingCurrentApiKey ? (
            <p className="text-center text-red-500">
              {(errorFetchingCurrentApiKey as any)?.message ??
                "Failed to fetch current key"}
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
