// The public app screen has one local writer and no collaboration connection.
const others = [];
const update = () => {};
export const LiveblocksProvider = ({ children }) => children;
export const RoomProvider = ({ children }) => children;
export const useOthers = () => others;
export const useUpdateMyPresence = () => update;
