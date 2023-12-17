import { ReactNode } from "react";

export interface Peddler {
  id: string;
  name: string;
  email: string;
  password: string;
}

export interface Consumer {
  id: string;
  last_name: string;
  first_name: string;
  email: string;
  password: string;
}

export interface ParticipantLocation {
  id: string;
  latitude: string;
  longitude: string;
}
