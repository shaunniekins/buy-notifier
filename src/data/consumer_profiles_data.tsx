import { supabase, supabaseAdmin } from "@/utils/supabase";
import { Consumer } from "@/types/interfaces";

export const insertConsumerRecord = async (data: Consumer) => {
  try {
    const response = await supabase.from("consumer_profiles").insert(data);

    if (response.error) {
      throw response.error;
    }
    return response;
  } catch (error) {
    console.error("Error inserting into table:", error);
    return null;
  }
};

export const fetchConsumerRecords = async (ids: string[]) => {
  try {
    const { data, error } = await supabase
      .from("consumer_profiles")
      .select()
      .in("id", ids);

    if (error) {
      throw error;
    }
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};
