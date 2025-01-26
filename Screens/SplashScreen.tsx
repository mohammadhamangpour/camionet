import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Image, Dimensions, Alert, BackHandler } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
const { width } = Dimensions.get('window');

export default function SplashScreen({ navigation }) {
    const [token, setToken] = useState<string>(''); // توکن JWT
    useEffect(() => {
      const backAction = () => {
        BackHandler.exitApp()
        return true; // بازگشت true برای غیرفعال کردن رفتار پیش‌فرض
      };
  
      const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
  
      return () => backHandler.remove(); // حذف لیسنر زمانی که کامپوننت unmount می‌شود
    }, []);
  // تابع برای انجام عملیات خاص
  const fetchToken = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('Check');
      if (storedToken) {
        setToken(storedToken);
      }
    } catch (error) {
      console.error('Error fetching token:', error);
    }
  };

  useEffect(() => {
    // فراخوانی تابع هنگام بارگذاری صفحه
    fetchToken();

    // هدایت به صفحه اصلی بعد از 3 ثانیه
    const timer = setTimeout(() => {
        if (token === '1') {
          navigation.navigate('Check_register');
        } else {
          navigation.navigate('Home');
        }
      }, 3000);

    // پاکسازی تایمر برای جلوگیری از مشکلات
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image source={require('../assets/logo.png')} style={styles.logo} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  logo: {
    width: '70%', // تنظیم عرض لوگو به صورت درصدی
    height: undefined,
    aspectRatio: 16 / 9, // نسبت عرض به ارتفاع برای حفظ تناسب
    resizeMode: 'contain',
  },
});
