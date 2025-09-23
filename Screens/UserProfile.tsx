import React, { useState, useEffect, useCallback, useContext } from 'react';
import { View, Text, Image, ActivityIndicator, StyleSheet, SafeAreaView, ScrollView, Linking, TouchableOpacity, useColorScheme, BackHandler, ToastAndroid, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useBadge } from './context/BadgeContext'
import axios from 'axios';
import { connectWebSocket, sendNotification } from '../utils/Websocket';
export default function UserProfile({ navigation }) {

  const badgeManager = useBadge();

  const [userData, setUserData] = useState(null);
  const [messageCount, setMessageCount] = useState(0);
  const [notifCount, setNotifCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isContact, setIsContact] = useState(false);
  const [contactInfo, setContactInfo] = useState(null);
  const [token, setToken] = useState<string | null>(null);
  const colorScheme = useColorScheme(); // تشخیص حالت دارک مود یا عادی
  useEffect(() => {
    const backAction = () => {
      BackHandler.exitApp();
      return true; // بازگشت true برای غیرفعال کردن رفتار پیش‌فرض
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove(); // حذف لیسنر زمانی که کامپوننت unmount می‌شود
  }, []);
  // تابع لاگ‌اوت
  const logOut = async () => {
    try {
      setToken(null);
      await AsyncStorage.removeItem('Token');
      navigation.navigate('Login')

    } catch (e) {
      console.log("Error removing token");
    }
  };

  // دریافت توکن
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('Token');
        if (storedToken) {
          setToken(storedToken);
          console.log('Token fetched:', storedToken);
        } else {
          console.error('Token is missing from storage.');
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching token:', error);
        setLoading(false);
      }
    };
    fetchToken();
  }, []) // آرایه وابستگی خالی یعنی این تابع فقط هنگام فوکوس صفحه اجرا می‌شود

  useEffect(() => {


    const fetchContactInfo = async () => {
      try {
        const response = await axios.get('https://camionet.org/v1/contact-us', {
          headers: {
            accept: '*/*',

          },
        });

        setContactInfo(response.data);
      } catch (error) {
        console.error('Error fetching contact information:', error);
      } finally {
        // setLoading(false);
      }
    };

    fetchContactInfo();
  }, []);

  const openLink = (url: string) => {
    Linking.openURL(url).catch(err => console.error('Error opening link:', err));
  };

  // دریافت اطلاعات کاربر
  useEffect(() => {
    const fetchUserData = async () => {
      if (!token) {
        console.error('Token is missing.');
        setLoading(false);
        return;
      }

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
          console.error('HTTP Error:', response.status, errorData);
          return;
        }

        const data = await response.json();
        const customHeader = response.headers.get('authorization');

        if (customHeader) {
          console.log('Custom Header:', customHeader);
          await AsyncStorage.setItem('Token', customHeader);
        }

        setUserData(data);

      } catch (error) {
        ToastAndroid.show(`Error fetching user data: ${error.message}`, ToastAndroid.SHORT);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchUserData();
    }
  }, [token]) // این بخش به `token` وابسته است، پس هر تغییری در `token` باعث اجرای این تابع می‌شود
  useEffect(() => {
    let stompClient: any = null; // Define stompClient in the effect scope

    const initializeWebSocket = async () => {
      const token = await AsyncStorage.getItem('Token'); // Fetch the token
      if (token) {
        console.log('errror')
        stompClient = connectWebSocket(token, (data) => {
          console.log('Received data:', data);

          if ('messageId' in data) {
            // Handle MessageDto
            badgeManager.increment();
            setMessageCount(badgeManager.getCount());
            sendNotification('پیام جدید', `${data.fromUser}: ${data.content}`);
          } else if ('from' in data) {
            // Handle NotificationRelationDto
            badgeManager.notifIncrement();
            setNotifCount(badgeManager.getNotifCount());
            sendNotification('اعلان جدید', `From: ${data.from} To: ${data.to}`);
          }
        });
      }

    };
    setMessageCount(badgeManager.getCount());
    initializeWebSocket(); // Call the async function

    return () => {
      if (stompClient) {
        stompClient.deactivate(); // Close WebSocket connection
        console.log('WebSocket connection closed.');
      }
    };
  }, [])

  // نمایش حالت لودینگ
  if (loading) {
    return <ActivityIndicator size="large" color="#4CAF50" style={{ marginTop: 50 }} />;
  }

  // زمانی که اطلاعات کاربر موجود نیست
  if (!userData) {
    return <Text>کاربر پیدا نشد.</Text>;
  }

  const {
    name = 'ندارد',
    profilePicture,
    driverInfo = null,
    customerInfo = null,
    roles = [],  // مقدار پیش‌فرض آرایه خالی
    from = [],  // مقدار پیش‌فرض آرایه خالی
    to = [],  // مقدار پیش‌فرض آرایه خالی
    phoneNumber = 'ندارد',
    keywords = 'ندارد',  // بررسی `keywords` برای جلوگیری از `null`
    balance = 'ندارد',
    enabled = 'ندارد'
  } = userData;


  // تعیین استایل‌ها براساس حالت دارک یا عادی
  const isDarkMode = colorScheme === 'dark';

  return (
    <SafeAreaView style={[styles.container, isDarkMode ? styles.darkContainer : styles.lightContainer]}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* هدر پروفایل */}
        <View style={[styles.profileHeader, isDarkMode ? styles.darkProfileHeader : styles.lightProfileHeader]}>
          <Image
            source={{ uri: `https://camionet.org/v1/order/download/${profilePicture}` }}
            style={styles.profileImage}
          />
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, isDarkMode ? styles.darkText : styles.lightText]}>{name}</Text>
            <Text style={[styles.profileDetail, isDarkMode ? styles.darkText : styles.lightText]}>شماره تلفن: {phoneNumber}</Text>
            <Text style={[styles.profileStatus, isDarkMode ? styles.darkText : styles.lightText]}>{enabled ? 'فعال' : 'غیرفعال'}</Text>
          </View>
        </View>

        {/* جزئیات حساب */}
        <View style={[styles.detailsContainer, isDarkMode ? styles.darkDetailsContainer : styles.lightDetailsContainer]}>
          {/* <Text style={[styles.sectionTitle, isDarkMode ? styles.darkText : styles.lightText]}>اطلاعات حساب</Text> */}
          {/* <View style={styles.detailBox}> */}
          {/* <Text style={[styles.detailLabel, isDarkMode ? styles.darkText : styles.lightText]}>موجودی:</Text> */}
          {/* <Text style={[styles.detailValue, isDarkMode ? styles.darkText : styles.lightText]}>{balance}</Text> */}
          {/* </View> */}

          {/* نمایش اطلاعات مربوط به راننده یا مشتری */}
          {roles.includes('ROLE_CUSTOMER') && customerInfo ? (
            <View style={styles.detailBox}>
              <Text style={[styles.sectionTitle, isDarkMode ? styles.darkText : styles.lightText]}>اطلاعات مشتری</Text>
              <Text style={[styles.detailLabel, isDarkMode ? styles.darkText : styles.lightText]}>ماشین: {customerInfo?.car || 'ندارد'}</Text>
              <Text style={[styles.detailLabel, isDarkMode ? styles.darkText : styles.lightText]}>گروه: {customerInfo?.guild || 'ندارد'}</Text>
            </View>
          ) : roles.includes('ROLE_DRIVER') && driverInfo ? (
            <View style={styles.detailBox}>
              <Text style={[styles.sectionTitle, isDarkMode ? styles.darkText : styles.lightText]}>اطلاعات راننده</Text>
              <Text style={[styles.detailLabel, isDarkMode ? styles.darkText : styles.lightText]}>نوع ماشین: {driverInfo?.carType || 'ندارد'}</Text>
              <Text style={[styles.detailLabel, isDarkMode ? styles.darkText : styles.lightText]}>پلاک: {driverInfo?.plaque || 'ندارد'}</Text>
            </View>
          ) : (
            null
          )}
          {(
            <Modal style={{}} animationType="slide" transparent={true} visible={isContact}>
              <TouchableOpacity style={{ backgroundColor: 'rgba(0,0,0,0.5)', flex: 1 }} onPress={() => setIsContact(false)} />
              <View style={[styles.contactContainer, isDarkMode && styles.darkContactContainer]}>
                <Icon name="close" size={30} color="#FF3B30" style={{ position: 'absolute', top: 10, right: 12 }} onPress={() => setIsContact(false)} />
                <Text style={[styles.slogan, isDarkMode && { color: '#fff' }]}>{contactInfo.slogan}</Text>

                {/* تلگرام */}
                <TouchableOpacity style={styles.contactItem} onPress={() => openLink(`https://t.me/${contactInfo.telegram}`)}>
                  <Icon name="telegram" size={30} color="#0088cc" />
                  <Text style={[styles.contactText, isDarkMode && { color: '#fff' }]}>{contactInfo.telegram}</Text>
                </TouchableOpacity>

                {/* واتساپ */}
                <TouchableOpacity style={styles.contactItem} onPress={() => openLink(`https://wa.me/${contactInfo.whatsapp}`)}>
                  <Icon name="whatsapp" size={30} color="#25D366" />
                  <Text style={[styles.contactText, isDarkMode && { color: '#fff' }]}>{contactInfo.whatsapp}</Text>
                </TouchableOpacity>

                {/* اینستاگرام */}
                <TouchableOpacity style={styles.contactItem} onPress={() => openLink(`https://instagram.com/${contactInfo.instagram}`)}>
                  <Icon name="instagram" size={30} color="#C13584" />
                  <Text style={[styles.contactText, isDarkMode && { color: '#fff' }]}>{contactInfo.instagram}</Text>
                </TouchableOpacity>

                {/* تلفن */}
                <TouchableOpacity style={styles.contactItem} onPress={() => openLink(`tel:${contactInfo.telephone}`)}>
                  <Icon name="phone" size={30} color="#7d7d7d"  />
                  <Text style={[styles.contactText, isDarkMode && { color: '#fff' }]}>{contactInfo.telephone}</Text>
                </TouchableOpacity>
              </View>
            </Modal>
          )}
          {/* اطلاعات مبدأ و مقصد */}
          <View style={styles.locationContainer}>
            <Text style={[styles.sectionTitle, isDarkMode ? styles.darkText : styles.lightText]}>مبدأ و مقصد</Text>

            {/* بررسی اینکه آیا from آرایه است و حداقل یک عنصر دارد */}
            <Text style={[styles.detailLabel, isDarkMode ? styles.darkText : styles.lightText]}>
              مبدأ: {Array.isArray(from) && from.length > 0 && from[0].city ? from[0].city : 'ندارد'}
            </Text>

            {/* بررسی اینکه آیا to آرایه است و حداقل یک عنصر دارد */}
            <Text style={[styles.detailLabel, isDarkMode ? styles.darkText : styles.lightText]}>
              مقصد: {Array.isArray(to) && to.length > 0 && to[0].city ? to[0].city : 'ندارد'}
            </Text>
          </View>


          {/* کلمات کلیدی */}
          <View style={styles.keywordsContainer}>
            <Text style={[styles.sectionTitle, isDarkMode ? styles.darkText : styles.lightText]}>کلمات کلیدی</Text>
            <Text style={[styles.detailLabel, isDarkMode ? styles.darkText : styles.lightText]}>{keywords !== null ? keywords : 'ندارد'}</Text>
          </View>
        </View>

        {/* دکمه لاگ‌اوت */}
        <TouchableOpacity style={styles.logoutButton} onPress={logOut}>
          <Text style={styles.logoutButtonText}>خروج از حساب</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.contactUs} onPress={() => setIsContact(true)}>
          <View style={{ flexDirection: 'row' }}>
            <Icon name="phone" size={30} color="#00e5ff" />
          </View>
          <Text style={styles.contactUs}>ارتباط با ما...</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* منوی پایین صفحه */}
      <View style={styles.fixedMenu}>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Home')}>
          <Icon name="home" style={styles.icon} />
          <Text style={styles.menuText}>خانه</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => {
          navigation.navigate('ChatList')
          badgeManager.reset();
          setMessageCount(0);
        }}>
          <Icon name="envelope" style={styles.icon} />
          {messageCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{messageCount > 9 ? '+9' : messageCount}</Text>
            </View>
          )}
          <Text style={styles.menuText}>پیام</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => {
          navigation.navigate('RelationRequests')
          badgeManager.notifReset();
          setNotifCount(0);
        }}>
          <Icon name="bell" style={styles.icon} />
          {notifCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{notifCount > 9 ? '+9' : notifCount}</Text>
            </View>
          )}
          <Text style={styles.menuText}>اعلان‌ها</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('UserProfile')}>
          <Icon name="user" style={styles.icon} />
          <Text style={styles.menuText}>پروفایل</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 100,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginBottom: 10,
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginRight: 20,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  contactContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 20,
  },
  darkContactContainer: {
    backgroundColor: '#262626',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
  },
  contactText: {
    marginLeft: 10,
    fontSize: 18,
  },
  slogan: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  profileDetail: {
    fontSize: 16,
  },
  profileStatus: {
    fontSize: 14,
  },
  detailsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 20,
  },
  contactUs: {
    flexDirection: 'row',
    color: '#00e5ff',
    fontSize: 18,
    paddingTop: 20,
    paddingRight: 10,
    marginRight: 10,
    alignSelf: 'flex-end',
    alignItems: 'flex-end'
  },
  detailBox: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 16,
    marginBottom: 5,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 20,
    marginTop: 30,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  fixedMenu: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#333',
    paddingVertical: 10,
    position: 'absolute',
    bottom: 0,
    width: '100%',
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
    fontFamily: 'Vazir',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -10,
    backgroundColor: '#1eab02',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  // Dark Mode Styles
  darkContainer: {
    backgroundColor: '#1e1e1e',
  },
  lightContainer: {
    backgroundColor: '#f5f5f5',
  },
  darkText: {
    color: '#fff',
  },
  lightText: {
    color: '#333',
  },
  darkProfileHeader: {
    backgroundColor: '#333',
  },
  lightProfileHeader: {
    backgroundColor: '#fff',
  },
  darkDetailsContainer: {
    backgroundColor: '#2c2c2c',
  },
  lightDetailsContainer: {
    backgroundColor: '#f9f9f9',
  },
});
