import { createContext } from "react";

type UserContextType = {
  userName: string;
  userId: string;
  setUserName: React.Dispatch<React.SetStateAction<string>>;
  setUserId: (id: string) => void;
};

export const UserContext = createContext<UserContextType>({
  userName: "",
  userId: "",
  setUserName: () => {},
  setUserId: () => {},
});
