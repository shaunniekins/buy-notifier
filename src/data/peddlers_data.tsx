import { supabase } from "@/utils/supabase";
import { updatePeddlerLocationRecord } from "./peddler_active_locations_data";

export const checkPeddlerActivity = async () => {
  try {
    const { data: peddlers, error } = await supabase
      .from("peddlers")
      .select("*");

    if (error) {
      throw error;
    }

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    for (const peddler of peddlers) {
      if (new Date(peddler.last_heartbeat) < fiveMinutesAgo) {
        // The peddler is not active anymore, update their location to null
        await updatePeddlerLocationRecord(peddler.id, null, null);
      }
    }
  } catch (error) {
    console.error("Error checking peddler activity:", error);
  }
};

export const updatePeddlerRecord = async (id: string, last_heartbeat: Date) => {
  try {
    const { data, error } = await supabase
      .from("peddlers")
      .update({ last_heartbeat })
      .eq("id", id);

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error updating into table:", error);
    return null;
  }
};
