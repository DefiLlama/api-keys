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
