import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image, Platform, Dimensions, Alert, ScrollView, Modal, FlatList, ActivityIndicator, useColorScheme, BackHandler } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';


export default function Login({ navigation }) {
  const colorScheme = useColorScheme(); // شناسایی حالت دارک یا لایت سیستم
  const isDarkMode = colorScheme === 'dark'; // بررسی اینکه آیا دارک مود فعال است
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [countryCode, setCountryCode] = useState<string>('+98'); // Default to Iran
  const [countryId, setCountryId] = useState<string>('65af7ed252c7c02a9e075e02');
  const [modalVisible, setModalVisible] = useState<boolean>(false); // نمایش یا مخفی بودن پاپ‌آپ
  const [countryCodes, setCountryCodes] = useState<any[]>([]); // لیست کشورها از API
  const [loading, setLoading] = useState(false); // مدیریت وضعیت لودینگ

  useEffect(() => {
    const backAction = () => {
      BackHandler.exitApp()
      return true; // بازگشت true برای غیرفعال کردن رفتار پیش‌فرض
    };

    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);

    return () => backHandler.remove(); // حذف لیسنر زمانی که کامپوننت unmount می‌شود
  }, []);

  // فراخوانی API برای دریافت لیست کشورها
useEffect(() => {
      const fetchCountries = async () => {
        try {
          const response = await axios.get('https://camionet.org/country/get');
          const countries = response.data.map((country) => ({
            id: country.id,
            code: `+${country.phoneCode}`,
            name: country.countryName,
          }));
          setCountryCodes(countries);

          const defaultCountry = countries.find((country) => country.code === '+98');
          if (defaultCountry) {
            setCountryCode(defaultCountry.code);
            setCountryId(defaultCountry.id);
          }
        } catch (error) {
          console.error('Error fetching countries:', error);
        }
      };

      fetchCountries();
    }, [])
 

  const isFormValid = (): boolean => {
    return phoneNumber !== '' && password !== '';
  };

  const onPhoneNumberChanged = (phone: string) => {
    setPhoneNumber(() => phone);
  };

  const onPasswordChanged = (pass: string) => {
    setPassword(() => pass);
  };

  const storeData = async (value: string) => {
    try {
      await AsyncStorage.setItem('Token', value);
    } catch (e) {
      console.log("error");
    }
  };

  const handleLogin = async () => {
    setLoading(true); // شروع لودینگ
    if (!isFormValid()) {
      setLoading(false); // توقف لودینگ
      Alert.alert(
        'خطا', 
        'لطفا تمام موارد را پر کنید', 
        [{ text: 'متوجه شدم', style: 'cancel' }]
      );
      return;
    }
    
    try {
      const response = await axios.post('https://camionet.org/user/v1/login', {
        phoneNumber: phoneNumber, 
        password: password,
        countryId: countryId,
      }, {
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json',
        }
      });

      if (response.status === 200) {
        const customHeader = response.headers['authorization'];
        storeData(customHeader);
       // Alert.alert(
         // 'موفقیت', 
         // 'با موفقعیت انجام شد ', 
         // [{ text: 'تایید', onPress: () => console.log('تایید شد') }]
       // );
         navigation.navigate('Home');
      } else {
        Alert.alert('Error', `${response.data.message}`);
      }
    } catch (error: any) {
      Alert.alert('Error', `${error.response.data.message}`);
      console.error('Error:', error);
    } finally {
      setLoading(false); // پایان لودینگ
    }
  };

  const openModal = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const selectCountry = (selectedCountry) => {
    setCountryCode(selectedCountry.code);
    setCountryId(selectedCountry.id);
    closeModal(); 
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={[styles.container, isDarkMode && styles.darkMode]}>
        <View style={[styles.loginContainer, isDarkMode && styles.darkLoginContainer]}>
          <Image source={require('../assets/logo.png')} style={styles.logo} />
          <Text style={[styles.log, isDarkMode && { color: '#fff' }]}>ورود به سیستم</Text>
          <View style={styles.form}>
            <Text style={[styles.label, isDarkMode && { color: '#fff' }]}>شماره تلفن</Text>
            <View style={[styles.phoneContainer, isDarkMode && { borderColor: '#555', backgroundColor: '#333' }]}>
              <TextInput
                value={phoneNumber}
                onChangeText={onPhoneNumberChanged}
                style={[styles.input, isDarkMode && { color: '#fff', backgroundColor: '#555' }]}
                placeholder="xxxxxxxxx"
                placeholderTextColor={isDarkMode ? '#aaa' : '#999'}
                keyboardType="phone-pad"
                textAlign="left"
              />
              <TouchableOpacity style={[styles.countryButton, isDarkMode && { backgroundColor: '#444' }]} onPress={openModal}>
                <Text style={styles.countryCode}>{countryCode}</Text>
                <Icon name="chevron-down" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
            <Text style={[styles.label, isDarkMode && { color: '#fff' }]}>رمز عبور</Text>
            <TextInput
              value={password}
              onChangeText={onPasswordChanged}
              style={[styles.input, isDarkMode && { color: '#fff', backgroundColor: '#555' }]}
              placeholder="رمز عبور"
              placeholderTextColor={isDarkMode ? '#aaa' : '#999'}
              secureTextEntry
              textAlign="left"
            />
            <TouchableOpacity
              onPress={handleLogin}
              disabled={ loading}
              style={[styles.loginButton, loading && { backgroundColor: '#ccc' }]}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.loginButtonText}>ورود</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.additionalOptions}>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={[styles.additionalText, isDarkMode && { color: '#fff' }]}>ثبت نام</Text>
            </TouchableOpacity>
            <Text style={[styles.separator, isDarkMode && { color: '#bbb' }]}> | </Text>
            <TouchableOpacity onPress={() => navigation.navigate('ContactUs')}>
              <Text style={[styles.additionalText, isDarkMode && { color: '#fff' }]}>فراموشی رمز عبور</Text>
            </TouchableOpacity>
          </View>
        </View>
      

        <Modal visible={modalVisible} animationType="slide" transparent={true}>
          <View style={styles.modalContainer}>
            <View style={[styles.modalContent, isDarkMode && { backgroundColor: '#333' }]}>
              <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                <Icon name="close" size={24} color="#fff" />
              </TouchableOpacity>
              <FlatList
                data={countryCodes}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.countryItem} onPress={() => selectCountry(item)}>
                    <Text style={[styles.countryText, isDarkMode && { color: '#fff' }]}>{item.name} ({item.code})</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#f9f9f9',
  },
  darkMode: {
    backgroundColor: '#333',
  },
  loginContainer: {
    width: '100%',
    maxWidth: 400,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 20,
    alignItems: 'center',
  },
  darkLoginContainer: {
    backgroundColor: '#444',
  },
  logo: {
    width: '60%',
    height: undefined,
    aspectRatio: 16 / 9,
    marginBottom: 20,
    resizeMode: 'contain',
  },
  log: {
    fontSize: 28,
    color: '#007bff',
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  form: {
    width: '100%',
  },
  label: {
    textAlign: 'right',
    fontSize: 18,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f1f1f1',
  },
  countryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    height: '100%',
  },
  countryCode: {
    color: '#fff',
    fontSize: 17,
    marginRight: 5,
    fontWeight: 'bold',
  },
  input: {
    flex: 1,
    padding: 12,
    textAlign: 'left',
    fontSize: 17,
    backgroundColor: '#f1f1f1',
    fontWeight: 'bold',
  },
  loginButton: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 19,
    fontWeight: 'bold',
  },
  additionalOptions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  additionalText: {
    color: '#007bff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    color: '#555',
    fontSize: 20,
    marginHorizontal: 10,
    lineHeight: 30,
  },
  darkModeButton: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 40 : 60,
    right: 20,
    padding: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '80%',
    maxHeight: '60%',
    borderRadius: 10,
    padding: 20,
  },
  closeButton: {
    alignSelf: 'flex-end',
  },
  countryItem: {
    paddingVertical: 10,
  },
  countryText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

