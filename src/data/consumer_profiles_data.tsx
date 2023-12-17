import { supabase, supabaseAdmin } from "@/utils/supabase";
import { Consumer } from "@/types/interfaces";
import { useEffect, useState } from "react";

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

// export const fetchConsumerRecord = (localUsername) => {
//   const [sessions, setSessions] = useState([]);
//   const [user_id, setUser_id] = useState("");

//   useEffect(() => {
//     const checkMatch = async () => {
//       const { data: fetchUserNameData } = await fetchUserProfileData();
//       const userData = fetchUserNameData.find(
//         (item) => item.user_name === localUsername
//       );

//       if (userData) {
//         setUser_id(userData.user_id);
//       }
//     };
//     checkMatch();
//     const interval = setInterval(checkMatch, 4000);

//     return () => clearInterval(interval);
//   }, [localUsername]);

//   useEffect(() => {
//     async function fetchInitialData() {
//       if (user_id) {
//         // Ensure user_id exists before making the query
//         try {
//           const { data, error } = await supabase
//             .from("consumer_profiles")
//             .select()
//             .or(`user1.eq.${user_id}`, `user2.eq.${user_id}`);

//           if (error) {
//             console.error("Error fetching data:", error);
//           } else {
//             setSessions(data);
//           }
//         } catch (error) {
//           console.error("An error occurred:", error);
//         }
//       }
//     }

//     fetchInitialData();

//     const channel = supabase
//       .channel("realtime sessions")
//       .on(
//         "postgres_changes",
//         { event: "INSERT", schema: "PUBLIC", table: "chat_sessions" },
//         (payload) => {
//           setSessions((prevSessions) => [...prevSessions, payload.new]);
//         }
//       )
//       .subscribe();

//     return () => {
//       supabase.removeChannel(channel);
//     };
//   }, [user_id]);

//   return sessions;
// };
