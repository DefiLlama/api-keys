import type { MetaFunction } from "@remix-run/node";
import { request, gql } from "graphql-request";
import { useEffect } from "react";
import { useAccount, useQuery } from "wagmi";
import { useHydrated } from "~/hooks/useHydrated";
import {
  llamaAddress,
  periodDuration,
  subgraphApi,
  subscriptionAmount,
  token,
} from "~/lib/constants";
import { useSignInWithEthereum } from "~/queries/useAuthentications";

export const meta: MetaFunction = () => {
  return [
    { title: "Developers - DefiLlama" },
    { name: "description", content: "Welcome!" },
  ];
};

interface ISub {
  expirationDate: string;
  id: string;
  initialPeriod: string;
  initialShares: string;
  receiver: string;
  startTimestamp: string;
  unsubscribed: boolean;
  amountPerCycle: string;
  realExpiration: string;
  accumulator: string;
}

interface IFormattedSub {
  id: string;
  receiver: string;
  startTimestamp: number;
  unsubscribed: boolean;
  initialShares: number;
  initialPeriod: number;
  expirationDate: number;
  periodDuration: number;
  fullPeriodStartingTime: number;
  totalAmountPaid: number;
  amountPerCycle: number;
  realExpiration: number;
  subDuration: string;
  accumulator: number;
}

async function getSubscriptions(address?: string) {
  try {
    if (!address) return null;

    const subs = gql`
		{
			subs(where: { owner: "${address.toLowerCase()}", receiver: "${llamaAddress.toLowerCase()}" } orderBy: expirationDate orderDirection: desc ) {
				id
				receiver
				startTimestamp
				unsubscribed
				initialShares
				initialPeriod
				expirationDate
                amountPerCycle
                realExpiration
				accumulator
			}
		}
	`;
    const data: { subs: Array<ISub> } = await request(subgraphApi, subs);

    return (data.subs ?? []).map((sub) => {
      const id = sub.id;
      const receiver = sub.receiver;
      const startTimestamp = +sub.startTimestamp;
      const unsubscribed = sub.unsubscribed;
      const initialShares = +sub.initialShares;
      const initialPeriod = +sub.initialPeriod;
      const expirationDate = +sub.expirationDate;
      const amountPerCycle = +sub.amountPerCycle;
      const realExpiration = +sub.realExpiration;
      const accumulator = +sub.accumulator;
      const fullPeriodStartingTime = initialPeriod + periodDuration;
      const partialPeriodTime = fullPeriodStartingTime - startTimestamp;
      const fullCycles = (expirationDate - initialPeriod) / periodDuration;
      const amountPaidFully = fullCycles * amountPerCycle;
      const partialCycles = partialPeriodTime / periodDuration;
      const amountPaidPartially = partialCycles * amountPerCycle;

      let subDuration = `${fullCycles} ${
        periodDuration === 24 * 60 * 60 ? "days" : "month"
      }`;

      if (partialCycles) {
        subDuration += `,`;

        const [hours, minutes] = (partialCycles * 24).toString().split(".");

        if (hours) {
          subDuration += ` ${hours} hours`;
        }

        if (minutes) {
          subDuration += ` ${(+minutes * 60).toString().slice(0, 2)} minutes`;
        }
      }
      return {
        id,
        receiver,
        startTimestamp,
        unsubscribed,
        initialShares,
        initialPeriod,
        expirationDate,
        periodDuration,
        fullPeriodStartingTime,
        totalAmountPaid: +(
          (amountPaidPartially + amountPaidFully) /
          10 ** token.decimals
        ).toFixed(2),
        amountPerCycle,
        realExpiration,
        subDuration,
        accumulator,
      } as IFormattedSub;
    });
  } catch (error: any) {
    throw new Error(error.message ?? "Failed to fetch subscriptions");
  }
}

export default function Index() {
  const { address, isConnected } = useAccount();

  const {
    data: subs,
    isLoading: fetchingSubs,
    error: errorFetchingSubs,
    refetch: refetchSubs,
  } = useQuery(["subs", address], () => getSubscriptions(address), {
    enabled: address ? true : false,
    cacheTime: 20_000,
    refetchInterval: 20_000,
  });

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

  return (
    <div className="flex flex-col my-8">
      {!hydrated || fetchingSubs ? (
        <div className="flex flex-col mx-auto max-w-[384px] w-full my-20">
          <p className="text-center">Fetching Subscriptions...</p>
        </div>
      ) : !isConnected ? (
        <div className="flex flex-col mx-auto max-w-[384px] w-full my-20">
          <p className="text-center">Connect Wallet to view your API Key</p>
        </div>
      ) : errorFetchingSubs ? (
        <div className="flex flex-col mx-auto max-w-[384px] w-full my-20">
          <p className="text-center text-red-500">
            {(errorFetchingSubs as any)?.message ??
              "Error fetching your subscription details"}
          </p>
        </div>
      ) : !subs || subs.length === 0 ? (
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
          <button
            className="border p-2 disabled:cursor-not-allowed text-white disabled:opacity-60"
            disabled={!signIn || signingIn}
            onClick={() => signIn?.({ address })}
          >
            {signingIn ? "Authenticating..." : "Sign in to view your API key"}
          </button>

          {errorSigningIn ? (
            <p className="text-center text-red-500">
              {(errorFetchingSubs as any)?.message ?? "Failed to authenticate"}
            </p>
          ) : null}

          {authToken ? (
            <p className="text-center text-green-500">
              {JSON.stringify({ authToken })}
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
