import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator, StyleSheet, SafeAreaView, Linking, ScrollView, useColorScheme, BackHandler } from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function ContactUs({ navigation }) {
  const [contactInfo, setContactInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  const colorScheme = useColorScheme(); // شناسایی حالت دارک مود
  const isDarkMode = colorScheme === 'dark'; // تشخیص اینکه آیا دارک مود فعال است
  useEffect(() => {
    const backAction = () => {
      navigation.navigate('Login'); // هدایت به صفحه Home
      return true; 
    };

    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);

    return () => backHandler.remove(); // حذف لیسنر زمانی که کامپوننت unmount می‌شود
  }, []);
  // دریافت توکن
  

  // دریافت اطلاعات تماس
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
        setLoading(false);
      }
    };

    fetchContactInfo();
  }, []);

  // باز کردن لینک‌های تلگرام، واتساپ و اینستاگرام
  const openLink = (url: string) => {
    Linking.openURL(url).catch(err => console.error('Error opening link:', err));
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#4CAF50" />;
  }

  if (!contactInfo) {
    return <Text>خطا در بارگیری اطلاعات تماس</Text>;
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={[styles.container, isDarkMode && styles.darkContainer]}>
        {/* لوگو */}
        <Image source={require('../assets/logo.png')} style={styles.logo} />

        <View style={[styles.contactContainer, isDarkMode && styles.darkContactContainer]}>
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
            <Icon name="phone" size={30} color="#000" />
            <Text style={[styles.contactText, isDarkMode && { color: '#fff' }]}>{contactInfo.telephone}</Text>
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
    paddingHorizontal: 20,
    backgroundColor: '#f9f9f9',
  },
  darkContainer: {
    backgroundColor: '#333',
  },
  logo: {
    width: '60%',
    height: undefined,
    aspectRatio: 16 / 9,
    marginBottom: 20,
    resizeMode: 'contain',
  },
  contactContainer: {
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
  },
  darkContactContainer: {
    backgroundColor: '#444',
  },
  slogan: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
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
});
