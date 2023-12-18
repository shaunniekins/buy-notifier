import { Peddler } from "@/types/interfaces";
import { supabase, supabaseAdmin } from "@/utils/supabase";

export const createPeddlerUser = async (
  email: string,
  password: string,
  profile: any
) => {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    throw error;
  }

  const user = data?.user;

  if (user) {
    const { data: profileData, error: insertError } = await supabase
      .from("peddler_profiles")
      .insert({
        id: user.id,
        ...profile,
      });

    if (insertError) {
      throw insertError;
    }

    return { profileData, userID: user.id };
  }
};

export const insertPeddlerRecord = async (data: Peddler) => {
  try {
    const response = await supabase.from("peddler_profiles").insert(data);

    if (response.error) {
      throw response.error;
    }
    return response;
  } catch (error) {
    console.error("Error inserting into table:", error);
    return null;
  }
};

export const fetchPeddlerRecords = async (ids: string[]) => {
  try {
    const { data, error } = await supabase
      .from("peddler_profiles")
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
