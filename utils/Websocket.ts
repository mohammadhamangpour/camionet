import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import PushNotification from 'react-native-push-notification';

// Type definitions
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

const connectWebSocket = (
  token: string,
  onMessage: (data: MessageDto | NotificationRelationDto) => void
) => {
  try {

    console.log('Connecting to WebSocket...');
    let socket;
    try {
      socket = new SockJS('https://camionet.org/ws'); // try catch here
    } catch (sockJsError) {
      console.error("Error creating SockJS:", sockJsError);
      return null; // مهم: برای جلوگیری از ادامه اجرای کد، return کنید
    }

    const stompClient = new Client({
      webSocketFactory: () => socket,
      connectHeaders: { Authorization: `Bearer ${token}` },
    });

    // ***تنظیم توابع onConnect و onStompError *قبل* از activate***
    stompClient.onConnect = () => {
      console.log('Connected to websocket.'); // پیام موفقیت
      // مشترک شدن در یک مقصد (destination) برای دریافت پیام‌ها
      stompClient.subscribe('/user/queue/message', (message) => {
        const data = JSON.parse(message.body);
        if (isMessageDto(data) || isNotificationRelationDto(data)) {
          onMessage(data);
          console.log('reciving correct format message.')
        } else {
          console.warn('فرمت پیام نامعتبر دریافت شد:', data);
        }
      });
    };

    stompClient.onStompError = (error) => {
      console.error('خطا در WebSocket:', error); // پیام خطا
      // نمایش خطا به کاربر (اختیاری)
      // alert('مشکل در اتصال به سرور.');
    };

    stompClient.activate(); // فعال‌سازی اتصال
    return stompClient;
  } catch (error) {
    console.log(error)
    return null;
  }
};

/**
 * Type guard for MessageDto
 */
const isMessageDto = (data: any): data is MessageDto => {
  return (
    typeof data.messageId === 'string' &&
    typeof data.fromUser === 'string' &&
    typeof data.toUser === 'string' &&
    // typeof data.room === 'string' &&
    typeof data.content === 'string' &&
    typeof data.date === 'number' &&
    ['SENT', 'RECEIVED', 'SEEN'].includes(data.messageStatus) &&
    ['SENT', 'RECEIVED'].includes(data.type)
  );
};

/**
 * Type guard for NotificationRelationDto
 */
const isNotificationRelationDto = (data: any): data is NotificationRelationDto => {
  return (
    typeof data.from === 'string' &&
    typeof data.to === 'string' &&
    ['SENT', 'RECEIVED'].includes(data.type)
  );
};

/**
 * Send a notification to the device.
 */
const sendNotification = (title: string, message: string) => {
  const UUID: string = Date.now().toString();
  PushNotification.createChannel(
    {
      UUID,
      title, // Visible name
      message,
      importance: 4,
      vibrate: true,
    });
    
  PushNotification.localNotification({
    title,
    message,
  });
};

export { connectWebSocket, sendNotification };
