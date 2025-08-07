import { useMutation } from "@tanstack/react-query";
import z from "zod";
import { getExponentialBackoffDelay } from "~/client/utils/retry-utils";
import { sleep } from "~/client/utils/sleep";
import { TEST_ERROR_FOR_CHECK_AURA_QUERY, TEST_LAG_FOR_CHECK_AURA_QUERY } from "~/shared/constants";
import { CheckAuraReqsponse, CheckAuraReqsponseSchema } from "~/shared/models/check-aura";
import { clientEnv } from "~/shared/modules/env";

type CheckAuraMutationArgs = {
  roomId: string;
  username: string;
  token: string;
  isSkipCache?: boolean;
};

export function useCheckAuraMutation() {
  return useMutation<CheckAuraReqsponse, Error, CheckAuraMutationArgs>({
    mutationFn: (variables) => processJobMutationFn(variables),
    retryDelay: (attempt) => getExponentialBackoffDelay(attempt),
    retry: 3,
  });
}

async function processJobMutationFn(variables: CheckAuraMutationArgs): Promise<CheckAuraReqsponse> {
  const { roomId, username, token, isSkipCache = true } = variables;

  if (!token) {
    throw new Error("Token missing, cannot start job");
  }

  if (!roomId) {
    throw new Error("Room ID missing, cannot start job");
  }

  if (username.toLocaleLowerCase() === TEST_LAG_FOR_CHECK_AURA_QUERY) {
    console.debug("Simulating latency for testing purposes");
    await sleep(1000);
  }

  if (username.toLocaleLowerCase() === TEST_ERROR_FOR_CHECK_AURA_QUERY) {
    throw new Error("Simulated error for testing purposes");
  }

  const res = await fetch(
    `${clientEnv.NEXT_PUBLIC_JAM_PACKED_WEBAPI_URL}/api/check-aura?isSkipCache=${isSkipCache}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${variables.token}`,
      },
      body: JSON.stringify({ roomId, username }),
    },
  );

  if (!res.ok) {
    const errorMessage = "Oh no! Unable to check your aura, please refresh to try again";
    console.warn(errorMessage, res);

    throw new Error(errorMessage);
  }

  const data = await res.json();
  const validationRes = CheckAuraReqsponseSchema.safeParse(data);

  if (!validationRes.success) {
    const errorMessage = `Oh no! Unexpected response from the server: ${z.prettifyError(validationRes.error)}`;
    console.warn(errorMessage, validationRes.error);
    throw new Error(errorMessage);
  }

  return validationRes.data;
}
