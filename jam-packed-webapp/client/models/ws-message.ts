import { WsMessageTypeType } from "~/client/enums/ws-message-type";

export type WsMessage = {
  roomId: string;
  jobId?: string;
  details?: string;
  userId?: string;
  type: WsMessageTypeType;
  users?: WsUser[];
};

export type WsUser = {
  userId: string;
  username?: string;
  avatar?: string;
};

export type WsJoinRequestDto = {
  action: string;
  roomId: string;
  roomName: string;
  pin: string;
};
