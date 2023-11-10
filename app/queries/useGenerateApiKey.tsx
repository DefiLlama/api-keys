import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SERVER_API } from "~/lib/constants";
import { fetchX } from "~/lib/fetch";

export async function generateNewApiKey({
  authToken,
}: {
  authToken?: string | null;
}) {
  try {
    if (!authToken) {
      throw new Error("Not Authorized");
    }

    const newApiKey = await fetchX(`${SERVER_API}/auth/generate`, {
      method: "POST",
      headers: {
        authorization: authToken,
      },
    });

    console.log({ newApiKey });

    if (!newApiKey) {
      throw new Error("Failed to generate new api key");
    }

    return newApiKey?.apiKey ?? null;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export function useGenerateNewApiKey() {
  const queryClient = useQueryClient();

  return useMutation(generateNewApiKey, {
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
}
