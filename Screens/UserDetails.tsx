import React, { useEffect, useState } from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import { View, Text, Image, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Alert, useColorScheme, BackHandler, I18nManager, ImageBackground } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios'; // افزودن axios برای ارسال درخواست

const { width, height } = Dimensions.get('window');



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

interface FormattedUserData {
  id: string;
  name: string;
  profilePicture: string;
  car: string;
  kind: string;
  fromCity: string;
  fromProvince: string;
  fromLocality: string;
  destinationCities: string;
  destProvicne: string;
  destLocality: string;
  keywords: string;
}

interface UserDetailsProps {
  route: {
    params: {
      user: FormattedUserData;
    };
  };
  navigation: any;
}

const UserDetails: React.FC<UserDetailsProps> = ({ route, navigation }) => {
  const { user } = route.params;
  const [token, setToken] = useState<string>(''); // توکن JWT
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  
  useEffect(() => {
    const backAction = () => {
      navigation.navigate('Home'); // هدایت به صفحه Home
      return true; 
    };

    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);

    return () => backHandler.remove(); // حذف لیسنر زمانی که کامپوننت unmount می‌شود
  }, []);

  useEffect(() => {
      const fetchToken = async () => {
        try {
          const storedToken = await AsyncStorage.getItem('Token');
          if (storedToken) {
            setToken(storedToken);
          }
        } catch (error) {
          console.error('Error fetching token:', error);
        }
      };
  
      fetchToken();
  
    }, []) // آرایه وابستگی خالی یعنی فقط یک بار در زمان فوکوس اجرا می‌شود
  

  const handleRequestPress = async () => {
    if (!token) {
        Alert.alert(
            'خطا',
            'شما هنوز وارد سیستم نشده‌اید. لطفاً وارد شوید.',
            [
              {
                text: 'کنسل',
                onPress: () => console.log('ok'),
                style: 'cancel',
              },
              {
                text: 'ورود به سیستم',
                onPress: () => navigation.navigate('Login'),
              },
            ]
          );
      return;
    }

    try {
      const response = await axios.post(
        'https://camionet.org/relation/v1/send-relation',
        {
          toUserId: user.id, // فرستادن id کاربر به عنوان پارامتر
          type: 'REQUEST',
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
      console.error('Error sending request:', error);
      Alert.alert('خطا', 'مشکلی در ارسال درخواست به وجود آمد.');
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, isDarkMode && styles.darkContainer]}>
      {/* <Image source={{ uri: user.profilePicture }} style={styles.profileImage} /> */}
      <ImageBackground source={{uri: user.profilePicture}} style={styles.profileImage}>
          <Text  style={styles.userName}>{user.name}</Text>
      </ImageBackground>
      <View style={styles.infoContainer}>
        <Text style={[styles.carText, isDarkMode && styles.darkText]}>ماشین: {user.car}</Text>
        
        <View style={[styles.tableContainer, isDarkMode && styles.darkTable]}>
          <View style={styles.column}>
            <Text style={[styles.header, isDarkMode && styles.darkHeader]}>مبدا</Text>
            <Text style={[styles.cell, isDarkMode && styles.darkText]}>{user.fromCity}, {user.fromLocality}</Text>
          </View>

          <View style={styles.column}>
            <Text style={[styles.header, isDarkMode && styles.darkHeader]}>مقصد</Text>
            <Text style={[styles.cell, isDarkMode && styles.darkText]}>{user.destinationCities}, {user.destLocality.length }</Text>
          </View>
        </View>

        <Text style={[styles.keywordsText, isDarkMode && styles.darkText]}>
          کلمات کلیدی: 
          <Text style={styles.keywords}> {user.keywords}</Text>
        </Text>

        <TouchableOpacity style={[styles.requestButton, isDarkMode && styles.darkButton]} onPress={handleRequestPress}>
          <Text style={styles.requestButtonText}>درخواست</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
  },
  darkContainer: {
    backgroundColor: '#333',
  },
  profileImage: {
    width: width * 0.9,
    height: height * 0.4,
    borderRadius: 15,
    marginBottom: 20,
    resizeMode: 'cover',
  },
  infoContainer: {
    width: '100%',
    alignItems: 'center',
  },
  userName: {
    color: 'white',
    fontWeight: 'bold',
    borderBottomLeftRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 10,
    fontSize: 18,
    alignSelf: 'flex-start'
  },
  carText: {
    fontSize: 28, // افزایش سایز فونت
    fontWeight: 'bold',
    fontFamily: 'Vazir',
    color: '#007bff',
    marginBottom: 20,
    letterSpacing: 0.5, // کمی فاصله بین حروف
  },
  darkText: {
    color: '#fff',
    fontFamily: 'Vazir',
  },
  tableContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 20,
    backgroundColor: '#fff',
  },
  darkTable: {
    backgroundColor: '#444',
    borderColor: '#555',
  },
  column: {
    width: '45%',
  },
  header: {
    fontSize: 20, // افزایش سایز فونت
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'Vazir',
    color: '#007bff',
  },
  darkHeader: {
    color: '#1e90ff',
  },
  cell: {
    fontSize: 18, // افزایش سایز فونت
    color: '#333',
    textAlign: 'center',
    fontFamily: 'Vazir',
    lineHeight: 24, // تنظیم فاصله بین خطوط برای زیباتر شدن
  },
  keywordsText: {
    fontSize: 20, // افزایش سایز فونت
    color: '#333',
    textAlign: 'left', // چپ‌چین کردن متن
    width: '100%',
    marginTop: 20,
    fontWeight: 'bold',
    fontFamily: 'Vazir',
  },
  keywords: {
    fontSize: 18, // افزایش سایز فونت
    textAlign: 'left', // چپ‌چین کردن کلمات کلیدی
    fontFamily: 'Vazir',
  },
  requestButton: {
    backgroundColor: '#007bff',
    paddingVertical: 18, // افزایش سایز دکمه
    borderRadius: 10, // کمی گردتر کردن دکمه
    alignItems: 'center',
    marginTop: 50,
    width: '80%',
  },
  darkButton: {
    backgroundColor: '#1e90ff',
  },
  requestButtonText: {
    color: '#fff',
    fontSize: 22, // افزایش سایز فونت دکمه
    fontWeight: 'bold',
    fontFamily: 'Vazir',
  },
});

export default UserDetails;





