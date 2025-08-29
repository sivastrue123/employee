import axios from "axios";

export const createClinet = async (payload: any, userId: string) => {
  try {
    const response = await axios.post(
      `/api/client/createClient?userId=${userId}`,
      payload
    );
    return { data: response.data, status: response.status };
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        `API Error: ${error.response.status} ${
          error.response.data?.message || ""
        }`
      );
    } else if (error.request) {
      throw new Error("API Error: No response from server.");
    } else {
      throw new Error(`Unexpected Error: ${error.message}`);
    }
  }
};
