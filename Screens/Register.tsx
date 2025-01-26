import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image, Dimensions, Alert, ScrollView, Modal, FlatList, ActivityIndicator, useColorScheme, BackHandler } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

import { launchImageLibrary } from 'react-native-image-picker';

export default function Register({ navigation, route }) {
  const colorScheme = useColorScheme(); // شناسایی حالت دارک یا لایت سیستم
  const isDarkMode = colorScheme === 'dark'; // بررسی اینکه آیا دارک مود فعال است
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>(''); 
  const [countryCode, setCountryCode] = useState<string>('+98'); 
  const [countryId, setCountryId] = useState<string>('65af7ed252c7c02a9e075e02');
  const [modalVisible, setModalVisible] = useState<boolean>(false); 
  const [countryCodes, setCountryCodes] = useState<any[]>([]); 
  const [selectedGender, setSelectedGender] = useState<string>('CUSTOMER'); 
  const [profileImage, setProfileImage] = useState<any>(null); 
  const [loading, setLoading] = useState(false);

  // بررسی اینکه آیا کاربر از صفحه اسپلش آمده است یا خیر


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


  useEffect(() => {
    const backAction = () => {
      navigation.navigate('Login'); // TargetScreen نام صفحه مقصد
      return true; // بازگشت true برای غیرفعال کردن رفتار پیش‌فرض
    };
  
    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
  
    return () => backHandler.remove(); // حذف لیسنر زمانی که کامپوننت unmount می‌شود
  }, []);
  
 

  const isFormValid = (): boolean => {
    return phoneNumber !== '' && password !== '' && name !== '' && profileImage !== null;
  };

  const onPhoneNumberChanged = (phone: string) => {
    setPhoneNumber(() => phone);
  };

  const onPasswordChanged = (pass: string) => {
    setPassword(() => pass);
  };

  const onNameChanged = (name: string) => {
    setName(() => name);
  };

  const storeData = async (value: string) => {
    try {
      await AsyncStorage.setItem('Token', value);
    } catch (e) {
      console.log("error");
    }
  };

  const handleRegister = async () => {
    setLoading(true);
     if (!isFormValid()) {
          setLoading(false); // توقف لودینگ
          Alert.alert(
            'خطا', 
            'لطفا تمام موارد را پر کنید', 
            [{ text: 'متوجه شدم', style: 'cancel' }]
          );
          return;
        }
    const formData = new FormData();

    formData.append('name', name);
    formData.append('phoneNumber', phoneNumber);
    formData.append('password', password);
    formData.append('countryId', countryId);
    formData.append('userType', selectedGender);
    formData.append('file', {
      uri: profileImage.uri,
      type: profileImage.type,
      name: profileImage.fileName,
    });

    try {
      const response = await axios.post('https://camionet.org/user/v1/registry', formData, {
        headers: {
          'accept': '*/*',
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
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
            if (selectedGender === 'DRIVER') {
              navigation.navigate('Driver_register');
            } else {
              navigation.navigate('Customer_register');
            }
          } else {
            Alert.alert('Error', `${response.data.message}`);
          }
        } catch (error: any) {
          Alert.alert('Error', `${error.response.data.message}`);
          console.error('Error:', error);
        }
      } else {
        Alert.alert('Error', `${response.data.message}`);
      }
    } catch (error: any) {
      Alert.alert('Error', `${error.response?.data?.message || 'Registration failed'}`);
      console.error('Error:', error);
    } finally {
      setLoading(false);
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

  const pickImage = async () => {
    const options = {
      mediaType: 'photo',
      quality: 1,
      maxWidth: 300,
      maxHeight: 300,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorMessage) {
        console.log('Image Picker Error: ', response.errorMessage);
      } else {
        if (response.assets && response.assets.length > 0) {
          setProfileImage(response.assets[0]);
        }
      }
    });
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={[styles.container, isDarkMode && styles.darkMode]}>
        <View style={[styles.registerContainer, isDarkMode && styles.darkRegisterContainer]}>
          <Text style={[styles.log, isDarkMode && { color: '#fff' }]}>ثبت نام</Text>

          <TouchableOpacity onPress={pickImage}>
            <View style={[styles.profileImageContainer, isDarkMode && { backgroundColor: '#555' }]}>
              {profileImage ? (
                <Image source={{ uri: profileImage.uri }} style={styles.profileImage} />
              ) : (
                <Icon name="person-circle-outline" size={100} color={isDarkMode ? '#bbb' : '#007bff'} />
              )}
            </View>
          </TouchableOpacity>

          <Text style={[styles.label, isDarkMode && { color: '#fff' }]}>منصب</Text>
          <View style={styles.radioContainer}>
            <TouchableOpacity
              style={styles.radioItem}
              onPress={() => setSelectedGender('CUSTOMER')}
            >
              <Icon
                name={selectedGender === 'CUSTOMER' ? 'radio-button-on' : 'radio-button-off'}
                size={24}
                color={selectedGender === 'CUSTOMER' ? '#007bff' : isDarkMode ? '#888' : '#ccc'}
              />
              <Text style={[styles.radioText, isDarkMode && { color: '#fff' }]}>مشتری</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.radioItem}
              onPress={() => setSelectedGender('DRIVER')}
            >
              <Icon
                name={selectedGender === 'DRIVER' ? 'radio-button-on' : 'radio-button-off'}
                size={24}
                color={selectedGender === 'DRIVER' ? '#007bff' : isDarkMode ? '#888' : '#ccc'}
              />
              <Text style={[styles.radioText, isDarkMode && { color: '#fff' }]}>راننده</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <Text style={[styles.label, isDarkMode && { color: '#fff' }]}>نام</Text>
            <TextInput
              value={name}
              onChangeText={onNameChanged}
              style={[styles.input, isDarkMode && { backgroundColor: '#555', color: '#fff' }]}
              placeholder="نام خود را وارد کنید"
              placeholderTextColor={isDarkMode ? '#aaa' : '#999'}
              textAlign="left"
            />

            <Text style={[styles.label, isDarkMode && { color: '#fff' }]}>شماره تلفن</Text>
            <View style={[styles.phoneContainer, isDarkMode && { borderColor: '#555', backgroundColor: '#333' }]}>
              <TextInput
                value={phoneNumber}
                onChangeText={onPhoneNumberChanged}
                style={[styles.input, isDarkMode && { backgroundColor: '#555', color: '#fff' }]}
                placeholder="xxxxxxxxx"
                placeholderTextColor={isDarkMode ? '#aaa' : '#999'}
                keyboardType="phone-pad"
                textAlign="left"
              />
              <TouchableOpacity style={styles.countryButton} onPress={openModal}>
                <Text style={styles.countryCode}>{countryCode}</Text>
                <Icon name="chevron-down" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            <Text style={[styles.label, isDarkMode && { color: '#fff' }]}>رمز عبور</Text>
            <TextInput
              value={password}
              onChangeText={onPasswordChanged}
              style={[styles.input, isDarkMode && { backgroundColor: '#555', color: '#fff' }]}
              placeholder="رمز عبور"
              placeholderTextColor={isDarkMode ? '#aaa' : '#999'}
              secureTextEntry
              textAlign="left"
            />

            <TouchableOpacity
              onPress={handleRegister}
              disabled={ loading}
              style={[styles.registerButton, loading && { backgroundColor: '#ccc' }]}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.registerButtonText}>ثبت نام</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <Modal visible={modalVisible} animationType="slide" transparent={true}>
          <View style={styles.modalContainer}>
            <View style={[styles.modalContent, isDarkMode && { backgroundColor: '#333' }]}>
              <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                <Icon name="close" size={24} color={isDarkMode ? '#fff' : '#000'} />
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

const { width } = Dimensions.get('window');

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
  registerContainer: {
    width: '100%',
    maxWidth: 400,
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
  log: {
    fontSize: 28,
    color: '#007bff',
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  form: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    textAlign: 'right',
    fontSize: 18,
    marginBottom: 5,
    fontWeight: 'bold',
    color: '#333',
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
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
    borderRadius: 5,
  },
  registerButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 19,
    fontWeight: 'bold',
  },
  profileImageContainer: {
    marginBottom: 20,
    alignItems: 'center',
    backgroundColor: '#eaeaea',
    padding: 10,
    borderRadius: 50,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  radioContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 15,
  },
  radioText: {
    fontSize: 18,
    marginLeft: 8,
    fontWeight: 'bold',
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
