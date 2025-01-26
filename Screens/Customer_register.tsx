import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Dimensions, useColorScheme, BackHandler } from 'react-native';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function Customer_register({ navigation }) {
  const colorScheme = useColorScheme(); // تشخیص حالت دارک مود
  const isDarkMode = colorScheme === 'dark'; // بررسی فعال بودن دارک مود
  
  const [categories, setCategories] = useState([]); // برای ذخیره صنف‌ها
  const [selectedCategory, setSelectedCategory] = useState(''); // برای ذخیره صنف انتخاب‌شده
  const [token, setToken] = useState<string>(''); // توکن JWT
  const [loading, setLoading] = useState(true); // برای مدیریت وضعیت لودینگ
  const [buttonDisabled, setButtonDisabled] = useState(false); // برای مدیریت وضعیت دکمه ثبت
  useEffect(() => {
    const backAction = () => {
      navigation.navigate('Register'); // TargetScreen نام صفحه مقصد
      return true; // بازگشت true برای غیرفعال کردن رفتار پیش‌فرض
    };
  
    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
  
    return () => backHandler.remove(); // حذف لیسنر زمانی که کامپوننت unmount می‌شود
  }, []);
  useEffect(() => {
    fetchCategories(); // فراخوانی API برای دریافت صنف‌ها
    fetchToken();
  }, []);

  const storeData = async (value: string) => {
    try {
      await AsyncStorage.setItem('Check', value);
    } catch (e) {
      console.log("error");
    }
  };

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

  const fetchCategories = async () => {
    try {
      const response = await axios.get('https://camionet.org/guilds/v1/'); 
      setCategories(response.data);
      if (response.data.length > 0) {
        setSelectedCategory(response.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false); // لودینگ پایان یافت
    }
  };

  const handleSubmit = async () => {
    setButtonDisabled(true); // دکمه ثبت غیرفعال شود
    try {
      const response = await axios.post(
        'https://camionet.org/v1/customer-info',
        { guild: selectedCategory },
        {
          headers: {
            accept: '*/*',
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        storeData('1');
        navigation.navigate('Check_register');
      } else {
        Alert.alert('Error', 'خطا در ثبت صنف.');
      }
    } catch (error) {
      console.log(selectedCategory);
      Alert.alert('Error', 'خطا در ارسال اطلاعات.');
      console.error('Error:', error);
    } finally {
      setButtonDisabled(false); // دکمه ثبت دوباره فعال شود
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={[styles.container, isDarkMode && styles.darkContainer]}>
        <View style={[styles.registerContainer, isDarkMode && styles.darkRegisterContainer]}>
          <Text style={[styles.title, isDarkMode && { color: '#fff' }]}>انتخاب صنف</Text>

          {loading ? (
            <ActivityIndicator size="large" color="#007bff" />
          ) : (
            <Picker
              selectedValue={selectedCategory}
              style={[styles.select, isDarkMode && styles.darkSelect]}
              onValueChange={(itemValue) => setSelectedCategory(itemValue)}
            >
              {categories.map((category) => (
                <Picker.Item key={category.id} label={category.name} value={category.id} />
              ))}
            </Picker>
          )}

          <TouchableOpacity
            onPress={handleSubmit}
            style={[styles.registerButton, buttonDisabled && { backgroundColor: '#ccc' }]}
            disabled={buttonDisabled}
          >
            <Text style={styles.registerButtonText}>ثبت</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
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
  registerContainer: {
    width: '90%',
    maxWidth: 500,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    marginBottom: 20,
    alignItems: 'center',
  },
  darkRegisterContainer: {
    backgroundColor: '#444',
  },
  title: {
    fontSize: width * 0.05,
    marginBottom: 15,
    fontWeight: 'bold',
    color: '#007bff',
  },
  select: {
    height: 50,
    width: '100%',
    backgroundColor: '#f1f1f1',
    borderRadius: 5,
    marginBottom: 20,
  },
  darkSelect: {
    backgroundColor: '#555',
    color: '#fff',
  },
  registerButton: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  registerButtonText: {
    color: '#fff',
    fontSize: width * 0.045,
    fontWeight: 'bold',
  },
});

