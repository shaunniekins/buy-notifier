import { supabase } from "@/utils/supabase";

// Function to calculate distance between two points
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2 - lat1);
  var dLon = deg2rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

export const fetchPeddlerLocationRecord = async (
  radius: number,
  centerLat: number,
  centerLon: number
) => {
  try {
    let { data, error } = await supabase
      .from("peddler_active_locations")
      .select("*")
      .not("latitude", "eq", null)
      .not("longitude", "eq", null);

    if (error) {
      throw error;
    }

    // Filter the data based on the radius
    let filteredData = [];
    if (data) {
      filteredData = data.filter((item) => {
        const distance = calculateDistance(
          centerLat,
          centerLon,
          item.latitude,
          item.longitude
        );
        return distance <= radius;
      });
    }

    return filteredData;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};

export const updatePeddlerLocationRecord = async (
  id: string,
  latitude: number | null,
  longitude: number | null
) => {
  try {
    const { data, error } = await supabase
      .from("peddler_active_locations")
      .upsert({
        id: id,
        latitude: latitude,
        longitude: longitude,
      });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error updating into table:", error);
    return null;
  }
};
