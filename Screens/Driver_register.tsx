import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image, Dimensions, Alert, ScrollView, ActivityIndicator, useColorScheme, BackHandler } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { launchImageLibrary } from 'react-native-image-picker';
import { Picker } from '@react-native-picker/picker';

export default function Driver_register({ navigation }) {
  const colorScheme = useColorScheme(); // شناسایی حالت دارک یا لایت سیستم
  const isDarkMode = colorScheme === 'dark'; // بررسی اینکه آیا دارک مود فعال است
  
  const [licenseImage, setLicenseImage] = useState<any>(null); 
  const [carImage, setCarImage] = useState<any>(null); 
  const [selectedCar, setSelectedCar] = useState<string>(''); 
  const [selectedCarType, setSelectedCarType] = useState<string>(''); 
  const [plaque, setPlaque] = useState<string>(''); 
  const [carTypes, setCarTypes] = useState<any[]>([]); 
  const [cars, setCars] = useState<any[]>([]); 
  const [token, setToken] = useState<string>(''); 
  const [loading, setLoading] = useState(true); 
  const [buttonDisabled, setButtonDisabled] = useState(false); 
  useEffect(() => {
    const backAction = () => {
      navigation.navigate('Register'); // TargetScreen نام صفحه مقصد
      return true; // بازگشت true برای غیرفعال کردن رفتار پیش‌فرض
    };
  
    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
  
    return () => backHandler.remove(); // حذف لیسنر زمانی که کامپوننت unmount می‌شود
  }, []);
  
  useEffect(() => {
    const fetchCars = async () => {
      try {
        const response = await axios.get('https://camionet.org/car/v1/car/FA');
        setCars(response.data.cars);
        if (response.data.cars.length > 0) {
          setSelectedCar(response.data.cars[0].id);
          fetchCarTypes(response.data.cars[0].id);
        }
      } catch (error) {
        console.error('Error fetching cars:', error);
      } finally {
        setLoading(false);
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

    fetchCars();
    fetchToken();
  }, []);

  const fetchCarTypes = async (carId: string) => {
    try {
      setLoading(true); 
      const response = await axios.get(`https://camionet.org/car-type/v1/car-type/${carId}`);
      setCarTypes(response.data.carTypeEntities);
      if (response.data.carTypeEntities.length > 0) {
        setSelectedCarType(response.data.carTypeEntities[0].id);
      }
    } catch (error) {
      console.error('Error fetching car types:', error);
    } finally {
      setLoading(false); 
    }
  };

  const handleCarChange = (carId: string) => {
    setSelectedCar(carId);
    fetchCarTypes(carId);
  };

  const pickImage = async (setImageFunction) => {
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
          setImageFunction(response.assets[0]);
        }
      }
    });
  };
  
  const storeData = async (value: string) => {
    try {
      await AsyncStorage.setItem('Check', value);
    } catch (e) {
      console.log("error");
    }
  };

  const handleSubmit = async () => {
    setButtonDisabled(true); 
    const formData = new FormData();
    formData.append('carType', selectedCarType);
    formData.append('plaque', plaque);

    if (carImage) {
      formData.append('carCard', {
        uri: carImage.uri,
        type: carImage.type,
        name: carImage.fileName,
      });
    }

    if (licenseImage) {
      formData.append('licenceDriver', {
        uri: licenseImage.uri,
        type: licenseImage.type,
        name: licenseImage.fileName,
      });
    }

    try {
      const response = await axios.post('https://camionet.org/v1/driver-info', formData, {
        headers: {
          accept: '*/*',
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        storeData('1');
        navigation.navigate('Check_register');
      } else {
        Alert.alert('Error', `${response.data.message}`);
      }
    } catch (error: any) {
      Alert.alert('Error', `${error.response?.data?.message || 'خطا در ارسال اطلاعات'}`);
      console.error('Error:', error);
    } finally {
      setButtonDisabled(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={[styles.container, isDarkMode && styles.darkContainer]}>
        <View style={[styles.registerContainer, isDarkMode && styles.darkRegisterContainer]}>
          <Text style={[styles.log, isDarkMode && { color: '#fff' }]}>تکمیل فرایند ثبت نام راننده</Text>

          {loading ? (
            <ActivityIndicator size="large" color="#007bff" /> 
          ) : (
            <>
              <View style={styles.inlineSelectContainer}>
                <View style={styles.selectWrapper}>
                  <Text style={[styles.label, isDarkMode && { color: '#fff' }]}>ماشین</Text>
                  <Picker
                    selectedValue={selectedCar}
                    style={[styles.select, isDarkMode && styles.darkSelect]}
                    onValueChange={handleCarChange}
                  >
                    {cars.map((car) => (
                      <Picker.Item key={car.id} label={car.name} value={car.id} />
                    ))}
                  </Picker>
                </View>
                <View style={styles.selectWrapper}>
                  <Text style={[styles.label, isDarkMode && { color: '#fff' }]}>نوع</Text>
                  <Picker
                    selectedValue={selectedCarType}
                    style={[styles.select, isDarkMode && styles.darkSelect]}
                    onValueChange={(itemValue) => setSelectedCarType(itemValue)}
                  >
                    {carTypes.map((carType) => (
                      <Picker.Item key={carType.id} label={carType.name} value={carType.id} />
                    ))}
                  </Picker>
                </View>
              </View>

              <Text style={[styles.label, isDarkMode && { color: '#fff' }]}>شماره پلاک</Text>
              <TextInput
                value={plaque}
                onChangeText={setPlaque}
                style={[styles.input, isDarkMode && styles.darkInput]}
                placeholder="xxxxxxxxxx"
                placeholderTextColor={isDarkMode ? '#aaa' : '#999'}
              />

              <View style={styles.inlineImageContainer}>
                <TouchableOpacity onPress={() => pickImage(setLicenseImage)} style={styles.uploadButtonInline}>
                  <Text style={styles.uploadButtonText}>عکس گواهینامه</Text>
                  {licenseImage && <Image source={{ uri: licenseImage.uri }} style={styles.uploadedImage} />}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => pickImage(setCarImage)} style={styles.uploadButtonInline}>
                  <Text style={styles.uploadButtonText}>عکس کارت ماشین</Text>
                  {carImage && <Image source={{ uri: carImage.uri }} style={styles.uploadedImage} />}
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={handleSubmit}
                style={[styles.registerButton, buttonDisabled && { backgroundColor: '#ccc' }]}
                disabled={buttonDisabled}
              >
                <Text style={styles.registerButtonText}>تکمیل ثبت نام</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
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
  darkContainer: {
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
  label: {
    textAlign: 'right',
    fontSize: 18,
    marginBottom: 5,
    fontWeight: 'bold',
    color: '#333',
  },
  input: {
    width: '100%',
    padding: 12,
    textAlign: 'left',
    fontSize: 17,
    backgroundColor: '#f1f1f1',
    fontWeight: 'bold',
    borderRadius: 5,
    marginBottom: 15,
  },
  darkInput: {
    backgroundColor: '#555',
    color: '#fff',
  },
  inlineSelectContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 15,
  },
  selectWrapper: {
    flex: 1,
    marginHorizontal: 5,
  },
  select: {
    height: 50,
    width: '100%',
    backgroundColor: '#f1f1f1',
    borderRadius: 5,
  },
  darkSelect: {
    backgroundColor: '#555',
    color: '#fff',
  },
  inlineImageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 15,
  },
  uploadButtonInline: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    width: '48%',
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  uploadedImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginTop: 10,
  },
  registerButton: {
    backgroundColor: '#15a100',
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
});
