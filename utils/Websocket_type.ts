type MessageStatus = 'SENT' | 'RECEIVED' | 'SEEN';
type MessageType = 'SENT' | 'RECEIVED';

interface MessageDto {
  messageId: string;
  fromUser: string;
  toUser: string;
  room: string;
  content: string;
  date: number; // int64
  messageStatus: MessageStatus;
  type: MessageType;
}

type NotificationRelationType = 'SENT' | 'RECEIVED';

interface NotificationRelationDto {
  from: string;
  to: string;
  type: NotificationRelationType;
}
