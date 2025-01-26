import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet, SafeAreaView, useColorScheme, Dimensions, BackHandler, ToastAndroid } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import { BadgeContext } from '../BadgeContext';

export default function ChatList({ navigation }) {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [profiles, setProfiles] = useState({});
  const [lastMessages, setLastMessages] = useState({});

  const colorScheme = useColorScheme(); // تشخیص حالت دارک یا لایت
  const isDarkMode = colorScheme === 'dark'; // آیا حالت دارک فعال است؟

  const windowWidth = Dimensions.get('window').width; // دریافت عرض صفحه
  useEffect(() => {
        const fetchToken = async () => {
            const storedToken = await AsyncStorage.getItem('Token');
            if (storedToken) {
              setToken(storedToken);
            }
          };
         fetchToken();
  
     
    }, []) // وابستگی به token
  
  
    useEffect(() => {
      const fetchChats = async () => {
        try {
          const response = await axios.get('https://camionet.org/chat/all', {
            headers: {
              accept: '*/*',
              Authorization: `Bearer ${token}`,
            },
          });
          console.log(response.data);
          setChats(response.data);
        } catch (error) {
            ToastAndroid.show(`Error fetching chat list: ${error.message}`, ToastAndroid.SHORT);
        
        } finally {
          setLoading(false);
        }
      };
  if(token){
    fetchChats();
  }
      
    }, [token]) // وابستگی به token
  
  
  // استفاده از useEffect برای دریافت اطلاعات پروفایل و آخرین پیام‌ها
  useEffect(() => {
      const fetchProfileData = async (userId) => {
        try {
          const response = await axios.get(`https://camionet.org/v1/get-user/${userId}`, {
            headers: {
              accept: '*/*',
              Authorization: `Bearer ${token}`,
            },
          });
          console.log(response.data);
          return response.data;
        } catch (error) {
            ToastAndroid.show(`Error fetching profile data: ${error.message}`, ToastAndroid.SHORT);
       
          return null;
        }
      };
  
      const fetchLastMessages = async (chats) => {
        let messagesData = {};
        for (const chat of chats) {
          try {
            const response = await axios.get(`https://camionet.org/message/get-new-messages/${chat.userId}`, {
              params: {
                offset: 0,
                limit: 30,
              },
              headers: {
                accept: '*/*',
                Authorization: `Bearer ${token}`,
              },
            });
  
            if (response.data.length > 0) {
              messagesData[chat.userId] = response.data[0];
            } else {
              messagesData[chat.userId] = { content: 'بدون پیام' };
            }
  
          } catch (error) {
            ToastAndroid.show(`Error fetching last message for user ${chat.userId}: ${error.message}`, ToastAndroid.SHORT);
           
            messagesData[chat.userId] = { content: 'خطا در دریافت پیام' };
          }
        }
        setLastMessages(messagesData);
      };
  
      const loadChatData = async () => {
        let profilesData = {};
        for (const chat of chats) {
          const userId = chat.userId;
          if (!profiles[userId]) {
            const profile = await fetchProfileData(userId);
            if (profile) {
              profilesData[userId] = profile;
            }
          }
        }
  
        setProfiles((prev) => ({ ...prev, ...profilesData }));
        await fetchLastMessages(chats);
      };
  
      if (chats.length > 0) {
        loadChatData();
      }
    }, [chats, token]) // وابستگی به token و chats
 
  useEffect(() => {
    const backAction = () => {
      BackHandler.exitApp();
      return true; // بازگشت true برای غیرفعال کردن رفتار پیش‌فرض
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove(); // حذف لیسنر زمانی که کامپوننت unmount می‌شود
  }, []);

  // دریافت توکن
 // useEffect(() => {
  //  const fetchToken = async () => {
   //     const storedToken = await AsyncStorage.getItem('Token');
   //     if (storedToken) {
   //       setToken(storedToken);
   //     }
   //   };
   // fetchToken();
 // }, []);

  // دریافت لیست چت‌ها
 // useEffect(() => {
 //   if (!token) return;

  //  const fetchChats = async () => {
  //    try {
   //     const response = await axios.get('https://camionet.org/chat/all', {
   //       headers: {
    //        accept: '*/*',
    //        Authorization: `Bearer ${token}`,
     //     },
     //   });
     //   console.log(response.data);
     //   setChats(response.data);
     // } catch (error) {
     //   console.error('Error fetching chat list:', error);
     // } finally {
    //    setLoading(false);
   //   }
   // };

  //  fetchChats();
 // }, [token]);

  // دریافت اطلاعات پروفایل و آخرین پیام‌ها
 // useEffect(() => {
  ///  const fetchProfileData = async (userId) => {
  //    try {
  //      const response = await axios.get(`https://camionet.org/v1/get-user/${userId}`, {
   //       headers: {
   //         accept: '*/*',
     //       Authorization: `Bearer ${token}`,
      //    },
      //  });
       // console.log(response.data)
      //  return response.data;

     // } catch (error) {
     //   console.error('Error fetching profile data:', error);
     //   return null;
     // }
   // };

  //  const fetchLastMessages = async (chats) => {
  //    let messagesData = {};
  //    for (const chat of chats) {
  //      try {
   //       const response = await axios.get(`https://camionet.org/message/get-new-messages/${chat.userId}`, {
   //         params: {
    //          offset: 0,
    //          limit: 30,
     //       },
     //       headers: {
     //         accept: '*/*',
     //         Authorization: `Bearer ${token}`,
     //       },
     //     });
//
     //     if (response.data.length > 0) {
     //       messagesData[chat.userId] = response.data[0];
     //     } else {
     //       messagesData[chat.userId] = { content: 'بدون پیام' }; 
     //     }

     //   } catch (error) {
      //    console.error(`Error fetching last message for user ${chat.userId}:`, error);
      //    messagesData[chat.userId] = { content: 'خطا در دریافت پیام' };
       // }
      //}
    //  setLastMessages(messagesData);
    //};

//     const loadChatData = async () => {
//       let profilesData = {};
//       for (const chat of chats) {
//         const userId = chat.userId;
//         if (!profiles[userId]) {
//           const profile = await fetchProfileData(userId);
//           if (profile) {
//             profilesData[userId] = profile;
//           }
//         }
//       }

//       setProfiles((prev) => ({ ...prev, ...profilesData }));
//       await fetchLastMessages(chats);
//     };

//     if (chats.length > 0) {
//       loadChatData();
//     }
//   }, [chats, token]);

  // نمایش حالت لودینگ
  if (loading) {
    return <ActivityIndicator size="large" color="#4CAF50" />;
  }

  // استایل‌ها بر اساس حالت دارک مود تنظیم می‌شوند
  const styles = StyleSheet.create({
    container: {
      padding: 20,
      paddingBottom: 100,
      backgroundColor: isDarkMode ? '#1e1e1e' : '#f5f5f5', // تغییر پس‌زمینه بر اساس حالت دارک یا لایت
    },
    chatCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDarkMode ? '#333' : '#fff',
      borderRadius: 10,
      padding: 15,
      marginBottom: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      elevation: 5,
    },
    profileImage: {
      width: 60,
      height: 60,
      borderRadius: 30,
      marginRight: 15,
    },
    chatInfo: {
      flex: 1,
    },
    userName: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 5,
      color: isDarkMode ? '#fff' : '#000', // تغییر رنگ متن بر اساس حالت دارک یا لایت
    },
    lastMessage: {
      fontSize: 14,
      color: isDarkMode ? '#ccc' : '#666',
    },
    fixedMenu: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      backgroundColor: isDarkMode ? '#000' : '#333',
      paddingVertical: 10,
      position: 'absolute',
      bottom: 0,
      width: windowWidth, // عرض منو به صورت خودکار بر اساس عرض دستگاه تنظیم می‌شود
    },
    menuItem: {
      alignItems: 'center',
    },
    icon: {
      color: '#fff',
      fontSize: 24,
      textAlign: 'center',
    },
    menuText: {
      color: '#fff',
      marginTop: 5,
      fontSize: 12,
    },
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDarkMode ? '#1e1e1e' : '#f5f5f5' }}>
      <ScrollView contentContainerStyle={styles.container}>
        {chats.map((chat) => {
          const profile = profiles[chat.userId];
          const lastMessage = lastMessages[chat.userId];
          return (
            <TouchableOpacity key={chat.userId} style={styles.chatCard} onPress={() => navigation.navigate('ChatScreen', { userId: chat.userId })}>
              {profile && (
                <>
                  <Image source={{ uri: `https://camionet.org/v1/order/download/${profile.profilePicture}` }} style={styles.profileImage} />
                  <View style={styles.chatInfo}>
                    <Text style={styles.userName}>{profile.name}</Text>
                    {lastMessage ? (
                      <Text style={styles.lastMessage}>{lastMessage.content}</Text>
                    ) : (
                      <Text style={styles.lastMessage}>بدون پیام</Text>
                    )}
                  </View>
                </>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* منوی پایین صفحه */}
      <View style={styles.fixedMenu}>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Home')}>
          <Icon name="home" style={styles.icon} />
          <Text style={styles.menuText}>خانه</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('ChatList')}>
          <Icon name="envelope" style={styles.icon} />
          <Text style={styles.menuText}>پیام</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('RelationRequests')}>
          <Icon name="bell" style={styles.icon} />
          <Text style={styles.menuText}>اعلان‌ها</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('UserProfile')}>
          <Icon name="user" style={styles.icon} />
          <Text style={styles.menuText}>پروفایل</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

