import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Dimensions,
  FlatList,
  I18nManager,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  BackHandler,
  useColorScheme,
  Linking,
  ToastAndroid,
} from 'react-native';
import Icon1 from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/FontAwesome';
import Icon2 from 'react-native-vector-icons/AntDesign';
import FastImage from 'react-native-fast-image';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Modal from 'react-native-modal';
import MapView, { Marker } from 'react-native-maps';
import { connectWebSocket, sendNotification } from '../utils/Websocket';
import { BadgeContext } from '../BadgeContext';

I18nManager.forceRTL(true);

const { width } = Dimensions.get('window');

interface FromLocation {
  province: string;
  city: string;
  locality: string;
  lon: number;
  lat: number;
}

interface DestinationLocation {
  province: string;
  city: string;
  locality: string;
  lon: number;
  lat: number;
}

interface UserDto {
  id: string;
  name: string;
  profilePicture: string;
  car: string;
  kind: string;
  roles: string[];
  from: FromLocation[];
  destination: DestinationLocation[];
  keywords: string[] | null;
}

interface FormattedUserData {
  id: string;
  profilePicture: string;
  car: string;
  kind: string;
  fromCity: string;
  destinationCities: string;
  keywords: string;
}

export default function Home({ navigation, route }: { navigation: any, route: any }) {
   const badgeContext = useContext(BadgeContext);
 

 
   const { badgeCount, incrementBadge, decrementBadge,badgeCount2, incrementBadge2, decrementBadge2 } = badgeContext;

  //const [darkMode, setDarkMode] = useState(false);
  const [userData, setUserData] = useState<FormattedUserData[]>([]);
  const [offset, setOffset] = useState(1);
  const [isLoading, setIsLoading] = useState(false); // لودینگ برای بارگذاری صفحات
  const [isFirstLoad, setIsFirstLoad] = useState(true); // لودینگ فقط برای بارگذاری اول
  const [hasMore, setHasMore] = useState(true); // کنترل اینکه آیا داده بیشتری وجود دارد یا خیر
  const [token, setToken] = useState<string | null>(null); // توکن JWT
  const [searchQuery, setSearchQuery] = useState('');
  const systemTheme = useColorScheme(); // دریافت تنظیمات سیستم
  const darkMode = systemTheme === 'dark'; // اگر سیستم در حالت دارک بود، darkMode true می‌شود
  const [roles, setRoles] = useState([]);
  const [enabled, setEnabled] = useState(false);
  const {
    latitude = null,
    longitude = null,
    address = null,
    latitude2 = null,
    longitude2 = null,
    address2 = null
  } = route.params || {};
  const handleLoadMore = () => {
    if (isLoading || !hasMore) {
        return;
    }
    fetchData(token);
};
 useEffect(() => {
      const fetchDataOnFocus = async () => {
        const fetchedToken = await fetchToken();
        if (fetchedToken) {
          await checkForUpdate(fetchedToken);
          await fetchProfile(fetchedToken);  // ارسال توکن به تابع
          await fetchData(fetchedToken);     // ارسال توکن به تابع
        } //else {
          //console.error('Token is missing after fetchToken.');
          // در صورت نیاز، کاربر را به صفحه لاگین هدایت کنید
        //}
      };
  
      fetchDataOnFocus();
    }, []) // آرایه وابستگی خالی
   
    useEffect(() => {
      let stompClient:any = null; // Define stompClient in the effect scope
  
      const initializeWebSocket = async () => {
        const token = await fetchToken(); // Fetch the token
      if(token){
        console.log('errror')
        stompClient = connectWebSocket(token, (data) => {
          console.log('Received data:', data);
  
          if ('messageId' in data) {
            // Handle MessageDto
            sendNotification('New Message', `${data.fromUser}: ${data.content}`);
            incrementBadge
          } else if ('from' in data) {
            // Handle NotificationRelationDto
            sendNotification('Relation Update', `From: ${data.from} To: ${data.to}`);
            incrementBadge2
          }
        });
        stompClient.onConnect = () => { // اضافه کردن این بخش
          console.log('WebSocket is now connected.');
          
      };
      stompClient.onStompError = (error:any) => { // اضافه کردن این بخش
        console.error('WebSocket error:', error);
       
      };
      stompClient.activate();
      }
   
      };
  
      initializeWebSocket(); // Call the async function
  
      return () => {
        if (stompClient) {
          stompClient.deactivate(); // Close WebSocket connection
          console.log('WebSocket connection closed.');
        }
      };
    }, [])
  const checkForUpdate = async (token1: string) => {
    if (!token1) return;

    try {
      const response = await axios.get('https://camionet.org/update/v1/get', {
        headers: {
          accept: '*/*',
          Authorization: `Bearer ${token1}`,
        },
      });

      const data = response.data;

      // بررسی وجود آپدیت
      if (data.id !== null && data.url !== null) {
        Alert.alert(
          'به‌روزرسانی جدید',
          'نسخه جدیدی از برنامه در دسترس است. آیا می‌خواهید به‌روزرسانی کنید؟',
          [
            { text: 'بعدا', style: 'cancel' }, // دکمه انصراف
            { text: 'آپدیت', onPress: () => handleUpdate(data.url) }, // دکمه آپدیت
          ]
        );
      } else {
       // ToastAndroid.show('هیچ به‌روزرسانی جدیدی موجود نیست.', ToastAndroid.SHORT); // تغییر console به Toast
       console.log("l")
      }

    } catch (error) {
      ToastAndroid.show('Error checking for update', ToastAndroid.SHORT); // تغییر console به Toast
    }
  };

  const handleUpdate = (url: string) => {
    // اینجا کاربر را به لینک آپدیت هدایت می‌کنیم
    ///console.log('هدایت به لینک آپدیت:', url);
    // در صورت نیاز از Linking برای باز کردن لینک استفاده کنید
    Linking.openURL(url);
  };

  
  const fetchProfile = async (fetchedToken: any) => {
    console.log(fetchedToken);
    if (!fetchedToken) {
      ToastAndroid.show('Token is missing.', ToastAndroid.SHORT); // تغییر console به Toast
      return;
    }
  
    try {
      const response = await axios.get('https://camionet.org/v1/get-profile', {
        headers: {
          Accept: '*/*',
          Authorization: `Bearer ${fetchedToken}`,
        },
      });
  
      // داده‌های دریافت شده
      const data = response.data;
      const customHeader = response.headers['authorization'];
  
      if (customHeader) {
        console.log('Custom Header:', customHeader);
        storeData(customHeader);
      }
  
      // ذخیره roles و enabled از داده‌های پروفایل
      setRoles(data.roles);
      setEnabled(data.enabled);
  
    } catch (error:any) {
      // جزئیات دقیق‌تر از خطا برای عیب‌یابی
      if (error.response) {
        // درخواست ارسال شد اما پاسخ وضعیت غیر از 2xx داشت
        ToastAndroid.show(`Error: ${error.response.data}`, ToastAndroid.SHORT); // تغییر console به Toast
      } else if (error.request) {
        // درخواست ارسال شد اما پاسخی دریافت نشد
        ToastAndroid.show('No response received', ToastAndroid.SHORT); // تغییر console به Toast
      } else {
        // مشکلی در تنظیمات درخواست وجود داشت
        ToastAndroid.show(`Error: ${error.message}`, ToastAndroid.SHORT); // تغییر console به Toast
      }
  
      // حذف توکن در صورت نیاز
      removeData();
    }
};

  
  // فراخوانی API در زمان باز شدن صفحه

  const removeData = async () => {
    try {
      setToken('')
      await AsyncStorage.removeItem('Token');
      console.log('Token removed successfully');
    } catch (e) {
      console.log('Error removing token:', e);
    }
  };
  const storeData = async (value: string) => {
    try {
      await AsyncStorage.setItem('Token', value);
    } catch (e) {
      console.log("error");
    }
  };
  // تابع مدیریت دکمه بک
  useEffect(() => {
    const backAction = () => {
      BackHandler.exitApp();
      return true; // بازگشت true برای غیرفعال کردن رفتار پیش‌فرض
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove(); // حذف لیسنر زمانی که کامپوننت unmount می‌شود
  }, []);

  const searchApi = async (searchQuery: string) => {
    try {
      setIsFirstLoad(true); // نمایش لودینگ برای بارگذاری اول

      if (!token) {
        Alert.alert(
          'خطا',
          'شما هنوز وارد سیستم نشده‌اید. لطفاً وارد شوید.',
          [
            {
              text: 'کنسل',
              onPress: () => setSearchQuery(''),
              style: 'cancel',
            },
            {
              text: 'ورود به سیستم',
              onPress: () => navigation.navigate('Login'),
            },
          ]
        );
        setIsFirstLoad(false);
        return;
      }

      const response = await axios.get(`https://camionet.org/v1/search/${encodeURIComponent(searchQuery)}`, {
        headers: {
          accept: '*/*',
          Authorization: `Bearer ${token}`,
        },
      });
      const customHeader = response.headers['authorization'];
      console.log(customHeader);
      storeData(customHeader);
  
      const formattedData = response.data.homeUserDtos
        ? response.data.homeUserDtos.map((user: UserDto) => {
            const { id, profilePicture, car, kind, from, destination, keywords } = user;
            const fromCity = from.length > 0 ? from[0].city : 'نامشخص';
            const destinationCities = destination.length > 0 ? destination.map((dest) => dest.city).join(', ') : 'نامشخص';
            const formattedKeywords = keywords ? keywords.join(', ') : 'ندارد';

            return {
              id,
              profilePicture: `https://camionet.org/v1/order/download/${profilePicture}`,
              car,
              kind,
              fromCity,
              destinationCities,
              keywords: formattedKeywords,
            };
          })
        : [];

      setUserData(formattedData);
      setOffset(1); // بازنشانی آفست
      setHasMore(formattedData.length === 10); // اگر کمتر از 10 مورد باشد، داده بیشتری وجود ندارد
    } catch (error) {
      console.error('Error during search:', error);
    } finally {
      setIsFirstLoad(false); // پایان لودینگ برای بارگذاری اول
    }
  };

  const fetchData = async (fetchedToken: any) => {
    if (!hasMore) return; // اگر در حال لودینگ هست یا داده بیشتری وجود ندارد، عملیات متوقف شود.
    if(isFirstLoad){
      setIsLoading(true); // شروع لودینگ
    }
 

    try {
      let response;
      if (fetchedToken) {
        response = await axios.get('https://camionet.org/v1/home/authenticated', {
          params: {
            offset,
            limit: 10,
          },
          headers: {
            accept: '*/*',
            Authorization: `Bearer ${fetchedToken}`,
          },
        });
        const customHeader = response.headers['authorization'];
        console.log(customHeader);
        storeData(customHeader);
        const formattedData = response.data.map((user: UserDto) => {
          const { id, profilePicture, car, kind, from, destination, keywords } = user;
          const fromCity = from.length > 0 ? from[0].city : 'نامشخص';
          const destinationCities = destination.length > 0 ? destination.map((dest) => dest.city).join(', ') : 'نامشخص';
          const formattedKeywords = keywords ? keywords.join(', ') : 'ندارد';
  
          return {
            id,
            profilePicture: `https://camionet.org/v1/order/download/${profilePicture}`,
            car,
            kind,
            fromCity,
            destinationCities,
            keywords: formattedKeywords,
          };
        });
  
        setUserData((prevUserData) => [...prevUserData, ...formattedData]);
        setOffset((prevOffset) => prevOffset + 1);
        setHasMore(formattedData.length === 10); // فقط زمانی که ۱۰ داده دیگر دریافت شد، بارگذاری ادامه می‌یابد
        if(isFirstLoad){
          setIsFirstLoad(false)
          setIsLoading(false)
        }
      
      } else {
        response = await axios.get('https://camionet.org/v1/home/non-authenticated', {
          params: {
            offset,
            limit: 10,
          },
          headers: {
            accept: '*/*',
          },
        });
        const formattedData = response.data.homeUserDtos.map((user: UserDto) => {
          const { id, profilePicture, car, kind, from, destination, keywords } = user;
          const fromCity = from.length > 0 ? from[0].city : 'نامشخص';
          const destinationCities = destination.length > 0 ? destination.map((dest) => dest.city).join(', ') : 'نامشخص';
          const formattedKeywords = keywords ? keywords.join(', ') : 'ندارد';
  
          return {
            id,
            profilePicture: `https://camionet.org/v1/order/download/${profilePicture}`,
            car,
            kind,
            fromCity,
            destinationCities,
            keywords: formattedKeywords,
          };
        });
  
        setUserData((prevUserData) => [...prevUserData, ...formattedData]);
        setOffset((prevOffset) => prevOffset + 1);
        setHasMore(formattedData.length === 10); // فقط زمانی که ۱۰ داده دیگر دریافت شد، بارگذاری ادامه می‌یابد
        if(isFirstLoad){
          setIsFirstLoad(false)
          setIsLoading(false)
        }
      }

    
    } catch (error:any) {
      console.error(error);
    } finally {
      setIsLoading(false); // پایان لودینگ
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim() !== '') {
        searchApi(searchQuery);
      } else {
        fetchData(token);
      }
    }, 1000);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // بارگذاری توکن از AsyncStorage
  const fetchToken = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('Token');
      if (storedToken) {
        setToken(storedToken);
        console.log('Token fetched:', storedToken);
        return storedToken; // بازگرداندن توکن
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error fetching token:', error);
      return null;
    }
  };
  


 

  const [isModalVisible, setIsModalVisible] = useState(false); // نمایش یا عدم نمایش باکس


  // توابع مربوط به نقشه و باکس
  const toggleModal = () => {
    setTimeout(() => setIsModalVisible(!isModalVisible), 100);
  };


const go_profile=() => {
  if (!token)  { 
    Alert.alert(
      'هشدار', 
      'لطفاً وارد حساب کاربری خود شوید', 
      [
        { text: 'ورود به سیستم', onPress: () => navigation.navigate('Login') }, 
        { text: 'متوجه شدم', style: 'cancel' }
      ]
    );
    }else{
      navigation.navigate('UserProfile')
    }
}

const go_chat=() => {
  if (!token)  { 
    Alert.alert(
      'هشدار', 
      'لطفاً وارد حساب کاربری خود شوید', 
      [
        { text: 'ورود به سیستم', onPress: () => navigation.navigate('Login') }, 
        { text: 'متوجه شدم', style: 'cancel' }
      ]
    );
    }else{
      navigation.navigate('ChatList')
    }
}
const go_notif=() => {
  if (!token)  { 
    Alert.alert(
      'هشدار', 
      'لطفاً وارد حساب کاربری خود شوید', 
      [
        { text: 'ورود به سیستم', onPress: () => navigation.navigate('Login') }, 
        { text: 'متوجه شدم', style: 'cancel' }
      ]
    );
    }else{
      navigation.navigate('RelationRequests')
    }
}
  const open_box = () => {
    if (!token) {
      Alert.alert(
        'هشدار', 
        'لطفاً وارد حساب کاربری خود شوید', 
        [
          { text: 'ورود به سیستم', onPress: () => navigation.navigate('Login') }, 
          { text: 'متوجه شدم', style: 'cancel' }
        ]
      );
    } else {
      Alert.alert(
        'خطا', 
        'موقتا نقشه کار نمیکنه', 
        [
         
          { text: 'متوجه شدم', style: 'cancel' }
        ]
      );
      console.log('kk')
    }
  };
  
  const handlePress = (item: FormattedUserData) => {
    navigation.navigate('UserDetails', { user: item });
  };
  const selectOrigin = () => {
    toggleModal(); 
    navigation.navigate('MapScreen');
  };

  // تابع برای هدایت به صفحه MapScreen برای مقصد
  const selectDestination = () => {
    if (latitude !== null && longitude !== null && address !== null) {
      toggleModal();
      navigation.navigate('MapScreen', {
        latitude: latitude2,
        longitude: longitude2,
        address: address2,
      });
    } else {
      Alert.alert('خطا', 'ابتدا مبدا را انتخاب کنید.');
    }
  };


const submitLocations = () => {
  if (!latitude || !longitude || !latitude2 || !longitude2) {
    Alert.alert('خطا', 'لطفاً مبدا و مقصد را انتخاب کنید.');
    return; // جلوگیری از ارسال درخواست
  }

  // نمونه داده‌ای که باید ارسال شود
  const data = {
    fromLocations: [
      {
        latitude: latitude, 
        longitude: longitude,
      },
    ],
    toLocation: [
      {
        latitude: latitude2, 
        longitude: longitude2,
      },
    ],
    carType: 'string', // مقدار ثابت یا مقداری که از ورودی گرفته شده
  };

  // ارسال درخواست POST به سرور
  fetch('https://camionet.org/v1/start', {
    method: 'POST',
    headers: {
      Accept: '*/*',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      // بررسی وضعیت پاسخ سرور
      if (!response.ok) {
        throw new Error('خطا در ارسال درخواست'); // در صورت پاسخ غیر موفق
      }
      return response.json(); // دریافت پاسخ و تبدیل به JSON
    })
    .then((json) => {
      console.log('Response from server:', json); // مدیریت پاسخ سرور
      // نمایش پیغام موفقیت
      Alert.alert('پیغام', 'با موفقیت انجام شد', [
        {
          text: 'باشه',
          onPress: () => {
            // هدایت به صفحه Home و رندر مجدد آن
            navigation.navigate('Home', { refresh: true });
          },
        },
      ]);
    })
    .catch((error:any) => {
      // مدیریت خطا و نمایش alert به کاربر
      console.error('Error during fetch:', error);
      Alert.alert('خطا', 'ارسال درخواست با مشکل مواجه شد. لطفاً دوباره تلاش کنید.');
    });
};

  // تابعی برای کوتاه کردن آدرس به دو کلمه اول
  const formatAddress = (addr: string) => {
    if (!addr) return '';
    const words = addr.split(' ');
    return words.length > 2 ? `${words[0]} ${words[1]}...` : addr;
  };
  const renderItem = ({ item }: { item: FormattedUserData }) => (
    <TouchableOpacity style={[styles.blogCard, darkMode && styles.darkCard]} onPress={() => handlePress(item)}>
      <View style={styles.cardContent}>
        <Text style={styles.cardDetails} style={{ color: darkMode ? '#E0E0E0' : '#666' }}>
          <Icon name="car" /> ماشین: {item.car}
        </Text>
        <Text style={styles.cardDetails} style={{ color: darkMode ? '#E0E0E0' : '#666' }}>
          <Icon2 name="profile" /> نوع: {item.kind}
        </Text>
        <Text style={styles.cardDescription} style={{ color: darkMode ? '#B0B0B0' : '#999' }}>
          <Icon1 name="location-outline" /> مسیر: {item.fromCity}, {item.destinationCities}
        </Text>
      </View>
      <FastImage
  source={{ uri: item.profilePicture, priority: FastImage.priority.high }}
  style={styles.cardImage}
/>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, darkMode && styles.darkMode]}>
    
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="جستجو..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={(text) => setSearchQuery(text)}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => {
                setSearchQuery('');
                setOffset(1);
                setUserData([]);
                setHasMore(true);
                fetchData(token);
              }}
            >
              <Icon name="times" size={24} color="#999" />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={open_box}  style={styles.iconButton}>
            <Icon name="power-off" size={24} color={enabled ? '#0f0' : '#f00'} />
          </TouchableOpacity>
        </View>
      </View>

      {isFirstLoad ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : userData.length === 0 ? (
        <View style={styles.emptyContainer}>
         <Text style={[styles.emptyText, { color: darkMode ? '#FFF' : '#333' }]}>نتیجه‌ای یافت نشد</Text>
         </View>
      
      ) : (
        <FlatList
          data={userData}
          renderItem={renderItem}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          contentContainerStyle={[styles.content, { paddingBottom: 20 }]}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={isLoading && <ActivityIndicator size="large" color="#0000ff" />}
        />
      )}
     {/* Modal برای نمایش انتخاب مبدا و مقصد */}
     <Modal isVisible={isModalVisible || false} onBackdropPress={toggleModal}>
  <View style={styles.modalContent}>
    <Text>انتخاب مبدا و مقصد</Text>
    <View style={styles.row}>
      {/* نمایش مبدا یا دکمه انتخاب مبدا */}
      {latitude !== null && longitude !== null && address !== null ? (
        <Text style={styles.locationText}>{formatAddress(address)}</Text>
      ) : (
        <TouchableOpacity onPress={selectOrigin} style={styles.button}>
          <Text>انتخاب مبدا</Text>
        </TouchableOpacity>
      )}

      {/* نمایش مقصد یا دکمه انتخاب مقصد */}
      {latitude2 !== null && longitude2 !== null && address2 !== null ? (
        <Text style={styles.locationText}>{formatAddress(address2)}</Text>
      ) : (
        <TouchableOpacity
          onPress={selectDestination}
          style={styles.button}
          disabled={latitude === null || longitude === null || address === null} // اگر مبدا خالی باشد، دکمه غیرفعال شود
        >
          <Text
            style={{
              color: latitude === null || longitude === null ? 'gray' : 'black', // تغییر رنگ دکمه در صورت غیرفعال بودن
            }}
          >
            انتخاب مقصد
          </Text>
        </TouchableOpacity>
      )}
    </View>

    {/* دکمه ثبت برای ارسال درخواست API */}
    <TouchableOpacity onPress={submitLocations} style={styles.submitButton}>
      <Text>ثبت</Text>
    </TouchableOpacity>
  </View>
</Modal>
      {/* Modal برای نمایش نقشه */}
 
      <View style={styles.fixedMenu}>
        <TouchableOpacity style={styles.menuItem}>
          <Icon name="home" style={styles.icon} />
         
          <Text style={styles.menuText}>خانه</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Icon name="envelope" style={styles.icon} onPress={() => go_chat()} />
         {badgeCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badgeCount}</Text>
          </View>
        )} 
          <Text style={styles.menuText}>پیام</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => go_notif()} style={styles.menuItem}>
          <Icon name="bell" style={styles.icon} />
           {badgeCount2 > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badgeCount2}</Text>
          </View>
        )} 
          <Text style={styles.menuText}>اعلان</Text>
        </TouchableOpacity>
        <TouchableOpacity 
  style={styles.menuItem} 
  onPress={() => go_profile()}
>
  <Icon name="user" style={styles.icon} />
  <Text style={styles.menuText}>پروفایل</Text>
</TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  button: {
    padding: 10,
    backgroundColor: '#007bff',
    borderRadius: 5,
  },
  locationText: {
    padding: 10,
    fontSize: 14,
    fontWeight: 'bold',
  },
  submitButton: {
    padding: 15,
    backgroundColor: 'green',
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  confirmButton: {
    position: 'absolute',
    bottom: 20,
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  darkMode: {
    backgroundColor: '#1e1e1e',
    color: '#fff',
  },

  iconButton: {
    marginLeft: 10,
    padding: 5,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyText: {
    fontSize: 18,
   
    fontFamily: 'Vazir',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5', // اینجا به صورت داینامیک برای darkMode تنظیم می‌شود
  },
  header: {
    backgroundColor: '#333',
    paddingVertical: 10,
    paddingHorizontal: 20,
    elevation: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#444',
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: '#000',
    textAlign: 'right',
    marginRight: 10,
    fontSize: 16,
    fontFamily: 'Vazir',
  },
  clearButton: {
    padding: 5,
    marginLeft: 5,
  },
 
  content: {
    padding: 20,
  },
  blogCard: {
    flexDirection: 'row',
    marginBottom: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    elevation: 5,
    alignItems: 'center',
  },
  darkCard: {
    backgroundColor: '#444',
  },
  cardImage: {
    width: width * 0.25,
    height: width * 0.25,
    resizeMode: 'cover',
    marginLeft: 10,
    borderRadius: 8,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 20,
    alignItems: 'flex-start',
  },
  cardDetails: {
    fontSize: 16,
    
    marginBottom: 5,
    fontFamily: 'Vazir',
  },
  cardDescription: {
    fontSize: 14,
   
    textAlign: 'left',
    fontFamily: 'Vazir',
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
    backgroundColor: '#00A693',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
