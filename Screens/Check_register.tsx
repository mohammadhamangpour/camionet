import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Alert, ActivityIndicator, Dimensions, useColorScheme, BackHandler } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function Check_register({ navigation }) {
  const colorScheme = useColorScheme(); // تشخیص حالت دارک مود
  const isDarkMode = colorScheme === 'dark'; // بررسی فعال بودن دارک مود

  const [loading, setLoading] = useState(false); // مدیریت وضعیت لودینگ
  const [token, setToken] = useState<string>(''); // توکن JWT
  useEffect(() => {
    const backAction = () => {
      BackHandler.exitApp()
      return true; // بازگشت true برای غیرفعال کردن رفتار پیش‌فرض
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
  }, []);

  const storeData1 = async (value: string) => {
    try {
      await AsyncStorage.setItem('Check', value);
    } catch (e) {
      console.log("error");
    }
  };

  const storeData = async (value: string) => {
    try {
      await AsyncStorage.setItem('Token', value);
    } catch (e) {
      console.log("error");
    }
  };

  const handleCheck = async () => {
    setLoading(true); // شروع لودینگ
    try {
      const response = await axios.get('https://camionet.org/v1/accepted', {
        headers: {
          'accept': '*/*',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200 && response.data.accepted) {
        const customHeader = response.headers['authorization'];
        storeData(customHeader);
        storeData1('0');
        Alert.alert('Success', 'ثبت نام شما تایید شد.');
        navigation.navigate('Home');
      } else {
        Alert.alert('Error', 'ثبت نام شما تایید نشد.');
      }
    } catch (error) {
      Alert.alert('Error', 'خطا در ارسال درخواست.');
      console.error('Error:', error);
    } finally {
      setLoading(false); // پایان لودینگ
    }
  };

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <Image source={require('../assets/logo.png')} style={styles.logo} />
      <Text style={[styles.title, isDarkMode && { color: '#fff' }]}>در حال تایید ثبت نام</Text>
      <Text style={[styles.subtitle, isDarkMode && { color: '#ccc' }]}>تا دقایق دیگر ثبت نام شما تایید میشود</Text>
      <TouchableOpacity
        onPress={handleCheck}
        style={[styles.checkButton, loading && { backgroundColor: '#ccc' }]}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.checkButtonText}>بررسی</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: '5%', 
    backgroundColor: '#f9f9f9',
  },
  darkContainer: {
    backgroundColor: '#333',
  },
  logo: {
    width: '70%', 
    height: undefined,
    aspectRatio: 16 / 9,
    marginBottom: 30,
    resizeMode: 'contain',
  },
  title: {
    fontSize: width * 0.06, 
    color: '#007bff',
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: width * 0.045, 
    textAlign: 'center',
    color: '#333',
    marginBottom: 30,
  },
  checkButton: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    width: '80%', 
  },
  checkButtonText: {
    color: '#fff',
    fontSize: width * 0.05, 
    fontWeight: 'bold',
  },
});
