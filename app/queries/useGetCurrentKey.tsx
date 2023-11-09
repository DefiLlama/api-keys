import { useQuery } from "@tanstack/react-query";
import { SERVER_API } from "~/lib/constants";
import { fetchX } from "~/lib/fetch";

async function getCurrentKey(authToken?: string | null) {
  try {
    if (!authToken) return null;

    const currentToken = await fetchX(`${SERVER_API}/auth/api-key`, {
      method: "GET",
      headers: {
        authorization: authToken,
      },
    });

    console.log({ currentToken });

    return currentToken;
  } catch (error: any) {
    throw new Error(error.message ?? "Failed to fetch current api key");
  }
}

export const useGetCurrentKey = ({
  authToken,
}: {
  authToken?: string | null;
}) => {
  return useQuery(["currentKey", authToken], () => getCurrentKey(authToken), {
    enabled: authToken ? true : false,
  });
};
