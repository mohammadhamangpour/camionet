import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet, SafeAreaView, useColorScheme, Dimensions, Alert, ToastAndroid } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function RelationRequests({ navigation }) {
  const [relations, setRelations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [profiles, setProfiles] = useState({}); // برای ذخیره اطلاعات پروفایل کاربران
  const colorScheme = useColorScheme(); // برای بررسی حالت دارک مود یا لایت مود
  const isDarkMode = colorScheme === 'dark'; // آیا حالت دارک فعال است؟
  const windowWidth = Dimensions.get('window').width; // دریافت عرض صفحه برای ریسپانسیو

  // ارسال درخواست
  const handleRequestPress = async (userId: string) => {
    try {
      const response = await axios.post(
        'https://camionet.org/relation/v1/send-relation',
        {
          toUserId: userId, // فرستادن id کاربر به عنوان پارامتر
          type: 'ACCEPT',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // ارسال توکن
            'Content-Type': 'application/json',
            accept: '*/*',
          },
        }
      );

      if (response.status === 200) {
        Alert.alert('موفقیت', 'درخواست شما با موفقیت ثبت شد.');
      }
    } catch (error) {
      ToastAndroid.show(`Error sending request:: ${error.message}`, ToastAndroid.SHORT);
    
      Alert.alert('خطا', 'مشکلی در ارسال درخواست به وجود آمد.');
    }
  };

  // دریافت توکن
 
  
  // دریافت توکن
  useEffect(() => {
      const fetchToken = async () => {
        const storedToken = await AsyncStorage.getItem('Token');
        if (storedToken) {
          setToken(storedToken);
        }
      };
      fetchToken();
    }, []) // آرایه وابستگی خالی برای یکبار اجرا هنگام بازگشت به صفحه
 
  
  // دریافت لیست درخواست‌ها
 useEffect(() => {
      if (!token) return;
  
      const fetchRelations = async () => {
        try {
          const response = await axios.get('https://camionet.org/relation/v1/get-all', {
            headers: {
              accept: '*/*',
              Authorization: `Bearer ${token}`,
            },
          });
  
          setRelations(response.data.relations);
        } catch (error) {
          ToastAndroid.show(`Error fetching relations: ${error.message}`, ToastAndroid.SHORT);
          
        } finally {
          setLoading(false);
        }
      };
  
      if (token) {
        fetchRelations();
      }
    }, [token]) // وابستگی به `token`

  
  // دریافت اطلاعات پروفایل برای هر `whom`
 useEffect(() => {
      const fetchProfileData = async (userId: any) => {
        try {
          const response = await axios.get(`https://camionet.org/v1/get-user/${userId}`, {
            headers: {
              accept: '*/*',
              Authorization: `Bearer ${token}`,
            },
          });
          return response.data;
        } catch (error) {
          ToastAndroid.show(`Error fetching profile data: ${error.message}`, ToastAndroid.SHORT);
         
          return null;
        }
      };
  
      const loadProfiles = async () => {
        let profilesData = {};
        for (const relation of relations) {
          const userId = relation.whom;
          if (!profiles[userId]) {
            const profile = await fetchProfileData(userId);
            if (profile) {
              profilesData[userId] = profile;
            }
          }
        }
        setProfiles((prev) => ({ ...prev, ...profilesData }));
      };
  
      if (relations.length > 0) {
        loadProfiles();
      }
    }, [relations, token]) // وابستگی به `relations` و `token`

  

  if (loading) {
    return <ActivityIndicator size="large" color="#4CAF50" />;
  }

  // استایل‌ها بر اساس حالت دارک مود تنظیم می‌شوند
  const styles = StyleSheet.create({
    container: {
      padding: 20,
      paddingBottom: 100,
      backgroundColor: isDarkMode ? '#1e1e1e' : '#f5f5f5', // پس‌زمینه بر اساس حالت دارک مود
    },
    relationCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDarkMode ? '#333' : '#fff', // پس‌زمینه کارت بر اساس حالت دارک مود
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
    relationInfo: {
      flex: 1,
    },
    relationText: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 10,
      color: isDarkMode ? '#fff' : '#000', // تغییر رنگ متن بر اساس حالت دارک مود
    },
    acceptButton: {
      backgroundColor: '#4CAF50',
      padding: 10,
      borderRadius: 5,
      alignItems: 'center',
    },
    acceptButtonText: {
      color: '#fff',
      fontSize: 16,
    },
    chatButton: {
      backgroundColor: '#007bff',
      padding: 10,
      borderRadius: 5,
      alignItems: 'center',
    },
    chatButtonText: {
      color: '#fff',
      fontSize: 16,
    },
    fixedMenu: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      backgroundColor: isDarkMode ? '#000' : '#333',
      paddingVertical: 10,
      position: 'absolute',
      bottom: 0,
      width: windowWidth, // عرض منو بر اساس اندازه دستگاه
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
    <SafeAreaView style={{ flex: 1 , backgroundColor: isDarkMode ? '#1e1e1e' : '#f5f5f5'}}>
      <ScrollView contentContainerStyle={styles.container}>
        {relations.map((relation) => {
          const profile = profiles[relation.whom];
          return (
            <View key={relation.id} style={styles.relationCard}>
              {profile && (
                <>
                  <Image source={{ uri: `https://camionet.org/v1/order/download/${profile.profilePicture}` }} style={styles.profileImage} />
                  <View style={styles.relationInfo}>
                    {relation.relationType === 'REQUEST' ? (
                      <Text style={styles.relationText}>
                        شما یک درخواست از {profile.name} دارید
                      </Text>
                    ) : (
                      <Text style={styles.relationText}>
                        {profile.name} درخواست شما را پذیرفت
                      </Text>
                    )}
                    {relation.relationType === 'REQUEST' ? (
                      <TouchableOpacity style={styles.acceptButton} onPress={() => handleRequestPress(relation.id)}>
                        <Text style={styles.acceptButtonText}>پذیرفتن</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity style={styles.chatButton} onPress={() => navigation.navigate('ChatScreen', { userId: relation.who })}>
                        <Text style={styles.chatButtonText}>گفتگو</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </>
              )}
            </View>
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
