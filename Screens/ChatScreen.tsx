import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, SafeAreaView, useColorScheme, Keyboard, BackHandler, ToastAndroid } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ChatScreen({ route, navigation }) {
  const { userId } = route.params; 
  const [messages, setMessages] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState(""); 
  const [currentUserId, setCurrentUserId] = useState(null); 
  const scrollViewRef = useRef<ScrollView>(null); 
  const colorScheme = useColorScheme(); 
  const [isAtBottom, setIsAtBottom] = useState(true); 
  useEffect(() => {
    const backAction = () => {
      navigation.navigate('ChatList'); // هدایت به صفحه Home
      return true; 
    };

    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);

    return () => backHandler.remove(); // حذف لیسنر زمانی که کامپوننت unmount می‌شود
  }, []);

  
  // دریافت توکن
 useEffect(() => {
      const fetchToken = async () => {
        const storedToken = await AsyncStorage.getItem('Token');
        if (storedToken) {
          setToken(storedToken);
        }
      };
      fetchToken();
    }, []) // آرایه وابستگی خالی تا هر بار که به صفحه باز می‌گردید، توکن گرفته شود
 
  
  // دریافت پروفایل کاربر فعلی
 useEffect(() => {
      const fetchUserProfile = async () => {
        if (!token) return;
  
        try {
          const response = await fetch('https://camionet.org/v1/get-profile', {
            method: 'GET',
            headers: {
              Accept: '*/*',
              Authorization: `Bearer ${token}`,
            },
          });
  
          if (!response.ok) {
            const errorData = await response.json();
            //ToastAndroid.show(`HTTP Error: ${response.status} ${errorData}`, ToastAndroid.SHORT);
         
            return;
          }
  
          const data = await response.json();
          setCurrentUserId(data.id); 
  
        } catch (error) {
            ToastAndroid.show(`Error fetching profile user: ${error.message}`, ToastAndroid.SHORT); 
        }
      };
  
      if (token) {
        fetchUserProfile();
      }
    }, [token]) // وابستگی به token

  
  // دریافت پروفایل و پیام‌ها
  useEffect(() => {
      if (!token) return;
  
      const fetchProfileData = async () => {
        try {
          const response = await axios.get(`https://camionet.org/v1/get-user/${userId}`, {
            headers: {
              accept: '*/*',
              Authorization: `Bearer ${token}`,
            },
          });
          setProfile(response.data);
        } catch (error) {
            ToastAndroid.show(`Error fetching profile: ${error.message}`, ToastAndroid.SHORT);
        
        }
      };
  
      const fetchMessages = async () => {
        try {
          const response = await axios.get(`https://camionet.org/message/get-new-messages/${userId}?offset=0&limit=30`, {
            headers: {
              accept: '*/*',
              Authorization: `Bearer ${token}`,
            },
          });
          setMessages(response.data.reverse()); 
        } catch (error) {
            ToastAndroid.show(`Error fetching messages: ${error.message}`, ToastAndroid.SHORT);
         
        } finally {
          setLoading(false);
          setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }
      };
  
      if (token && userId) {
        fetchProfileData();
        fetchMessages();
      }
    }, [token, userId]) // وابستگی به token و userId
 
  

  const sendMessage = async () => {
    if (newMessage.trim() === "") return; 

    try {
      const response = await axios.post(
        'https://camionet.org/message',
        {
          toUserId: userId,
          messageText: newMessage,
        },
        {
          headers: {
            accept: '*/*',
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const newSentMessage = {
        fromUser: currentUserId, 
        content: newMessage,
        messageId: response.data.messageId,
        date: Date.now(),
      };
      setMessages((prevMessages) => [...prevMessages, newSentMessage]);
      setNewMessage(""); 

      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true }); 
      }, 100);

    } catch (error) {
        ToastAndroid.show(`Error: ${error.message}`, ToastAndroid.SHORT);
     
    }
  };

  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); 
  };

  const handleScroll = ({ nativeEvent }) => {
    const isBottom = nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y >= nativeEvent.contentSize.height - 20;
    setIsAtBottom(isBottom);
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#4CAF50" />;
  }

  const isDarkMode = colorScheme === 'dark'; 

  return (
    <SafeAreaView style={[styles.container, isDarkMode ? styles.darkContainer : styles.lightContainer]}>
      {profile && (
        <View style={[isDarkMode ? styles.profileHeader_dark : styles.profileHeader]}>
          <Image
            source={{ uri: `https://camionet.org/v1/order/download/${profile.profilePicture}` }}
            style={styles.profileImage}
          />
          <Text style={[isDarkMode ? styles.userName_dark : styles.userName]}>{profile.name}</Text>
        </View>
      )}

      <ScrollView
        ref={scrollViewRef} 
        contentContainerStyle={styles.messagesContainer}
        onScroll={handleScroll} 
        onContentSizeChange={() => isAtBottom && scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((message, index) => (
          <View
            key={message.messageId || index}
            style={[
              styles.messageContainer,
              message.fromUser === currentUserId ? styles.sentMessageContainer : styles.receivedMessageContainer,
            ]}
          >
            <View
              style={[
                styles.messageBubble,
                message.fromUser === currentUserId ? styles.sentMessage : styles.receivedMessage,
              ]}
            >
              <Text style={styles.messageText}>{message.content}</Text>
              <Text style={styles.messageTime}>{formatDateTime(message.date)}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.inputContainer}>
        <TextInput
          style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]}
          placeholder="پیام خود را وارد کنید..."
          placeholderTextColor={isDarkMode ? '#ccc' : '#666'}
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>ارسال</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  lightContainer: {
    backgroundColor: '#f5f5f5',
  },
  darkContainer: {
    backgroundColor: '#1c1c1e',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  profileHeader_dark:{
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#1c1c1e',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userName_dark: {
    fontSize: 18,
    fontWeight: 'bold',
    color:'#fff'
  },
  messagesContainer: {
    padding: 10,
    flexGrow: 1,
  },
  messageContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginVertical: 5,
  },
  sentMessageContainer: {
    justifyContent: 'flex-end',
  },
  receivedMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '70%',
    borderRadius: 20,
    padding: 10,
  },
  sentMessage: {
    backgroundColor: '#4CAF50',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 0,
  },
  receivedMessage: {
    backgroundColor: '#e1e1e1',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 0,
  },
  messageText: {
    fontSize: 16,
    color: '#000',
  },
  messageTime: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 15,
  },
  lightInput: {
    backgroundColor: '#f9f9f9',
  },
  darkInput: {
    backgroundColor: '#333',
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 20,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
