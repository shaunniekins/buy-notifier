import { supabase } from "@/utils/supabase";

export const fetchConsumerRecord = async () => {
  try {
    let query = supabase
      .from("consumer_active_locations")
      .select("*")
      .not("latitude", "eq", null)
      .not("longitude", "eq", null);

    const response = await query;

    if (response.error) {
      throw response.error;
    }
    return response;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};
