export interface IChatPayloadTypes {
  text: string;
  username: string;
}

export interface INewMessagePayload {
  text: string;
  chatId: string;
}
