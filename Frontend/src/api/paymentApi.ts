import apiClient from "./client";

export interface CheckoutResponse {
  status: string;
  url: string;
  sessionId: string;
}

export const paymentApi = {
  createCheckoutSession: async (
    packageName: "Gold" | "Premium",
    price: number,
  ): Promise<CheckoutResponse> => {
    const res = await apiClient.post<CheckoutResponse>(
      "/payment/process-payment",
      {
        name: packageName,
        price,
      },
    );
    return res.data;
  },
};

export default paymentApi;
