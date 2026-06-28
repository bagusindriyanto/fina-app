export type Conversation = {
  role: 'model' | 'user';
  parts: { text: string; thought?: boolean }[];
};
