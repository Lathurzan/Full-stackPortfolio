import { api, publicApi } from "./api";

export const fetchLinks = async () => {
  try {
  // profile endpoint contains links data now
  const res = await publicApi.get(`/profile`);
  return res.data;
  } catch (err: any) {
    // Build a JSON-friendly error details object because some Error
    // instances (like AxiosError) are not enumerable and may show up
    // as empty objects in some consoles.
    const details = {
      message: err?.message ?? String(err),
      code: err?.code ?? null,
      status: err?.response?.status ?? null,
      url: err?.config?.url ?? err?.request?.responseURL ?? null,
      responseData: err?.response?.data ?? null,
      stack: err?.stack ?? null,
    };

    try {
      console.error("fetchLinks error:", JSON.stringify(details, null, 2));
    } catch (e) {
      // Fallback if stringify fails
      console.error("fetchLinks error (raw):", details, err);
    }

    // Re-throw so callers can surface the error to the UI
    throw err;
  }
};

export const updateLinks = async (payload: any) => {
  try {
  // send updates to profile endpoint (includes links and customLinks)
  const res = await api.put(`/profile`, payload);
  return res.data;
  } catch (err: any) {
    console.error("updateLinks error:", err?.message || err);
    return { success: false, message: err?.message || "Network error", data: null };
  }
};
