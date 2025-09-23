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
import { connectWebSocket, sendNotification } from '../utils/Websocket';
import { useBadge } from './context/BadgeContext';
import MapView, { Marker, MapPressEvent, PROVIDER_GOOGLE, UrlTile, Region } from 'react-native-maps';
import { Picker } from "@react-native-picker/picker";
import { Client } from '@stomp/stompjs';


interface ModalProps {
    visible: boolean;
    onClose: () => void;
}

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

export default function Home({ navigation, route }: { navigation: any, route: any }) {
    const badgeManager = useBadge();
    const [sourceLocations, setSourceLocations] = useState<string[]>([]);
    const [sourceLocationsArray, setSourceLocationsArray] = useState([]);
    const [destinationLocations, setDestinationLocations] = useState<string[]>([]);
    const [destinationLocationsArray, setDestinationLocationsArray] = useState([]);
    const [selectedSource, setSelectedSource] = useState<string>('');
    const [selectedDestination, setSelectedDestination] = useState<string>('');
    const [mapVisible, setMapVisible] = useState<boolean>(false);
    const [ModalVisible, setModalVisible] = useState<boolean>(false);
    const [MarginBottonMap, setMarginBottonMap] = useState(0);
    const [cars, setCars] = useState<any[]>([]);
    const [selectedCar, setSelectedCar] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [carTypes, setCarTypes] = useState<any[]>([]);
    const [selectedCarType, setSelectedCarType] = useState<string>('');
    const [isSelectingSource, setIsSelectingSource] = useState<boolean>(true);
    const [markerPosition, setMarkerPosition] = useState<{ latitude: number, longitude: number } | null>(null);

    const handleMapSelect = (event: MapPressEvent) => {
        // const {latitude, longitude} = event.nativeEvent.coordinate;
        // const newLocation = `Lat: ${latitude.toFixed(2)}, Lng: ${longitude.toFixed(2)}`;

        // if (isSelectingSource) {
        //     setSourceLocations([...sourceLocations, newLocation]);
        //     setSelectedSource(newLocation);
        // } else {
        //     setDestinationLocations([...destinationLocations, newLocation]);
        //     setSelectedDestination(newLocation);
        // }
        // setMapVisible(false);
        // setMarkerPosition({ latitude, longitude });

    };
    const handleMapCompleteChange = (event: Region) => {
        const { latitude, longitude } = event;
        const newLocation = `latitude: ${latitude.toFixed(2)}, longitude: ${longitude.toFixed(2)}`;

        // if (isSelectingSource) {
        //     setSourceLocations([...sourceLocations, newLocation]);
        //     // @ts-ignore
        //     setSourceLocationsArray([...sourceLocationsArray,
        //     // @ts-ignore
        //     { latitude: latitude.toFixed(5), longitude: longitude.toFixed(5) }
        //     ]);
        //     setSelectedSource(newLocation);
        //     console.log("location is:" + selectedSource);
        // } else {
        //     setDestinationLocations([...destinationLocations, newLocation]);
        //     // @ts-ignore
        //     setDestinationLocationsArray([...destinationLocationsArray,
        //     // @ts-ignore
        //     { latitude: latitude.toFixed(5), longitude: longitude.toFixed(5) }
        //     ]);
        //     setSelectedDestination(newLocation);
        // }

        // setMapVisible(false);
        setMarkerPosition({ latitude, longitude });

    };

    const setLocations = (latitude: number, longitude: number) => {
        const newLocation = `latitude: ${latitude.toFixed(2)}, longitude: ${longitude.toFixed(2)}`;

        if (isSelectingSource) {
            setSourceLocations([...sourceLocations, newLocation]);
            // @ts-ignore
            setSourceLocationsArray([...sourceLocationsArray,
            // @ts-ignore
            { latitude: latitude.toFixed(5), longitude: longitude.toFixed(5) }
            ]);
            setSelectedSource(newLocation);
            console.log("location is:" + selectedSource);
        } else {
            setDestinationLocations([...destinationLocations, newLocation]);
            // @ts-ignore
            setDestinationLocationsArray([...destinationLocationsArray,
            // @ts-ignore
            { latitude: latitude.toFixed(5), longitude: longitude.toFixed(5) }
            ]);
            setSelectedDestination(newLocation);
        }
        // setMapVisible(false);
        setMarkerPosition({ latitude, longitude });
    }
    // const handleMapCompleteChange = (event: Region) => {
    //     const { latitude, longitude } = event;
    //     const newLocation = `latitude: ${latitude.toFixed(2)}, longitude: ${longitude.toFixed(2)}`;

    //     if (isSelectingSource) {
    //         setSourceLocations([...sourceLocations, newLocation]);
    //         // @ts-ignore
    //         setSourceLocationsArray([...sourceLocationsArray,
    //         // @ts-ignore
    //         { latitude: latitude.toFixed(5), longitude: longitude.toFixed(5) }
    //         ]);
    //         setSelectedSource(newLocation);
    //         console.log("location is:" + selectedSource);
    //     } else {
    //         setDestinationLocations([...destinationLocations, newLocation]);
    //         // @ts-ignore
    //         setDestinationLocationsArray([...destinationLocationsArray,
    //         // @ts-ignore
    //         { latitude: latitude.toFixed(5), longitude: longitude.toFixed(5) }
    //         ]);
    //         setSelectedDestination(newLocation);
    //     }

    //     //setMapVisible(false);
    //     setMarkerPosition({ latitude, longitude });

    // };


    // const { badgeCount, incrementBadge, decrementBadge, badgeCount2, incrementBadge2, decrementBadge2 } = badgeContext;

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
    const [roles, setRoles] = useState<String[]>([]);
    const [enabled, setEnabled] = useState(false);
    const [messageCount, setMessageCount] = useState(0);
    const [notifCount, setNotifCount] = useState(0);
    const [isButtonLoading, setIsButtonLoading] = useState(false);
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
    const handleSubmit = () => {
        console.log('Source:', selectedSource);
        console.log('Destination:', selectedDestination);
        fetchDataLocations(token);
        // onClose();
    };

    const canselSubmit = () => {
        setModalVisible(false);
        clearLocationList();
    }
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


    const clearLocationList = () => {
        setDestinationLocations([]); // Resets the state to an empty array
        setDestinationLocationsArray([]);
        setSourceLocations([]); // Resets the state to an empty array
        setSourceLocationsArray([]);
    };
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

        } catch (error: any) {
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

    const disableUser = async () => {
        if (!token) {
            ToastAndroid.show('Token is missing.', ToastAndroid.SHORT); // تغییر console به Toast
            return;
        }

        try {
            console.log('token is: ' + token);
            const response = await axios.get('https://camionet.org/v1/stop', {
                headers: {
                    Accept: '*/*',
                    Authorization: `Bearer ${token}`,
                },
            });
            setEnabled(false)
        } catch (error: any) {
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
        fetchCars();
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
                    const { id, profilePicture, car, kind, from, destination, keywords, name } = user;
                    const fromCity = from.length > 0 ? from[0].city : 'نامشخص';
                    const fromProvince = from.length > 0 ? from[0].province : 'نامشخص';
                    const fromLocality = from.length > 0 ? from[0].locality : 'نامشخص';
                    const destinationCities = destination.length > 0 ? destination.map((dest) => dest.city).join(', ') : 'نامشخص';
                    const destProvicne = destination.length > 0 ? destination.map((dest) => dest.province).join(', ') : 'نامشخص';
                    const destLocality = destination.length > 0 ? destination.map((dest) => dest.locality).join(', ') : 'نامشخص';
                    const formattedKeywords = keywords ? keywords.join(', ') : 'ندارد';

                    return {
                        id,
                        name,
                        profilePicture: `https://camionet.org/v1/order/download/${profilePicture}`,
                        car,
                        kind,
                        fromCity,
                        fromProvince,
                        fromLocality,
                        destinationCities,
                        destProvicne,
                        destLocality,
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
        if (isFirstLoad) {
            setIsLoading(true); // شروع لودینگ
        }


        try {
            let response;
            const token = await AsyncStorage.getItem('token');
            console.log('Token isss:', token);
            if (fetchedToken) {
                console.log('Im runnint on token block')
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
                    const { id, profilePicture, car, kind, from, destination, keywords, name } = user;
                    const fromCity = from.length > 0 ? from[0].city : 'نامشخص';
                    const fromProvince = from.length > 0 ? from[0].province : 'نامشخص';
                    const fromLocality = from.length > 0 ? from[0].locality : 'نامشخص';
                    const destinationCities = destination.length > 0 ? destination.map((dest) => dest.city).join(', ') : 'نامشخص';
                    const destProvicne = destination.length > 0 ? destination.map((dest) => dest.province).join(', ') : 'نامشخص';
                    const destLocality = destination.length > 0 ? destination.map((dest) => dest.locality).join(', ') : 'نامشخص';
                    const formattedKeywords = keywords ? keywords.join(', ') : 'ندارد';

                    return {
                        id,
                        name,
                        profilePicture: `https://camionet.org/v1/order/download/${profilePicture}`,
                        car,
                        kind,
                        fromCity,
                        fromProvince,
                        fromLocality,
                        destinationCities,
                        destProvicne,
                        destLocality,
                        keywords: formattedKeywords,
                    };
                });

                setUserData((prevUserData) => [...prevUserData, ...formattedData]);
                setOffset((prevOffset) => prevOffset + 1);
                setHasMore(formattedData.length === 10); // فقط زمانی که ۱۰ داده دیگر دریافت شد، بارگذاری ادامه می‌یابد
                if (isFirstLoad) {
                    setIsFirstLoad(false)
                    setIsLoading(false)
                }

            } else {
                console.log('Calling non authenticated api for get list.')
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
                    const { id, profilePicture, car, kind, from, destination, keywords, name } = user;
                    const fromCity = from.length > 0 ? from[0].city : 'نامشخص';
                    const fromProvince = from.length > 0 ? from[0].province : 'نامشخص';
                    const fromLocality = from.length > 0 ? from[0].locality : 'نامشخص';
                    const destinationCities = destination.length > 0 ? destination.map((dest) => dest.city).join(', ') : 'نامشخص';
                    const destProvicne = destination.length > 0 ? destination.map((dest) => dest.province).join(', ') : 'نامشخص';
                    const destLocality = destination.length > 0 ? destination.map((dest) => dest.locality).join(', ') : 'نامشخص';
                    const formattedKeywords = keywords ? keywords.join(', ') : 'ندارد';

                    return {
                        id,
                        name,
                        profilePicture: `https://camionet.org/v1/order/download/${profilePicture}`,
                        car,
                        kind,
                        fromCity,
                        fromProvince,
                        fromLocality,
                        destinationCities,
                        destProvicne,
                        destLocality,
                        keywords: formattedKeywords,
                    };
                });

                setUserData((prevUserData) => [...prevUserData, ...formattedData]);
                setOffset((prevOffset) => prevOffset + 1);
                setHasMore(formattedData.length === 10); // فقط زمانی که ۱۰ داده دیگر دریافت شد، بارگذاری ادامه می‌یابد
                if (isFirstLoad) {
                    setIsFirstLoad(false)
                    setIsLoading(false)
                }
            }

        } catch (error: any) {
            console.error(error);
        } finally {
            setIsLoading(false); // پایان لودینگ
        }
    };
    const fetchDataLocations = async (fetchedToken: any) => {
        if (!fetchedToken) return;
        // const payload = {
        //     fromLocations: sourceLocations,
        //     toLocation: destinationLocations,
        //     // carType: selectedVehicle,
        // };
        setIsButtonLoading(true);
        console.log(sourceLocationsArray)
        console.log(destinationLocationsArray)
        console.log("car type: " + selectedCarType)
        try {
            const response = await axios.post('https://camionet.org/v1/start',
                //     {
                //     "fromLocations": [
                //         {
                //             "latitude": 0,
                //             "longitude": 0
                //         }
                //     ],
                //     "toLocation": [
                //         {
                //             "latitude": 0,
                //             "longitude": 0
                //         }
                //     ],
                //     "carType": "string"
                // }
                {
                    "fromLocations": sourceLocationsArray,
                    "toLocation": destinationLocationsArray,
                    "carType": selectedCarType
                }

                , {
                    headers: {
                        accept: '*/*',
                        Authorization: `Bearer ${fetchedToken}`,
                    },
                });
            console.log('Response:', response.data);
            setModalVisible(false);
            setIsButtonLoading(false);
            setEnabled(true);
            clearLocationList();

            // Alert.alert(
            //     'به‌روزرسانی جدید',
            //     'نسخه جدیدی از برنامه در دسترس است. آیا می‌خواهید به‌روزرسانی کنید؟',
            //     [
            //         { text: 'بعدا', style: 'cancel' }, // دکمه انصراف
            //         // {text: 'آپدیت', onPress: () => handleUpdate(data.url)}, // دکمه آپدیت
            //     ]
            // );
        } catch (error) {
            console.log(error);
            console.error('Error sending data:', error);
            ToastAndroid.show('Error checking for update', ToastAndroid.SHORT);
            setIsButtonLoading(false);
        }
        // try {
        //     const response = await axios.get('https://camionet.org/update/v1/get', {
        //         headers: {
        //             accept: '*/*',
        //             Authorization: `Bearer ${token1}`,
        //         },
        //     });
        //
        //     const data = response.data;
        //
        //     // بررسی وجود آپدیت
        //     if (data.id !== null && data.url !== null) {
        //         Alert.alert(
        //             'به‌روزرسانی جدید',
        //             'نسخه جدیدی از برنامه در دسترس است. آیا می‌خواهید به‌روزرسانی کنید؟',
        //             [
        //                 {text: 'بعدا', style: 'cancel'}, // دکمه انصراف
        //                 {text: 'آپدیت', onPress: () => handleUpdate(data.url)}, // دکمه آپدیت
        //             ]
        //         );
        //     } else {
        //         // ToastAndroid.show('هیچ به‌روزرسانی جدیدی موجود نیست.', ToastAndroid.SHORT); // تغییر console به Toast
        //         console.log("l")
        //     }
        //
        // } catch (error) {
        //     ToastAndroid.show('Error checking for update', ToastAndroid.SHORT); // تغییر console به Toast
        // }
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
    const _onMapReady = () => setMarginBottonMap(0);


    const go_profile = () => {
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
            navigation.navigate('UserProfile')
        }
    }

    useEffect(() => {
        // let stompClient: any = null; // Define stompClient in the effect scope
        let stompClient: Client | null = null;
        const initializeWebSocket = async () => {
            const token = await fetchToken(); // Fetch the token
            if (token) {
                console.log('Initializing WebSocket connection...')
                stompClient = connectWebSocket(token, (data) => {
                    console.log('Received data:', data);

                    if ('messageId' in data) {
                        // Handle MessageDto
                        badgeManager.increment();
                        setMessageCount(badgeManager.getCount());
                        sendNotification('New Message', `${data.fromUser}: ${data.content}`);
                    } else if ('from' in data) {
                        // Handle NotificationRelationDto
                        badgeManager.notifIncrement();
                        setNotifCount(badgeManager.getNotifCount());
                        sendNotification('Relation Update', `From: ${data.from} To: ${data.to}`);
                        // incrementBadge2
                    }
                });
                // if (stompClient) {
                //     stompClient.onConnect = () => { // اضافه کردن این بخش
                //         console.log('WebSocket is now connected.');

                //     };
                //     stompClient.onStompError = (error: any) => { // اضافه کردن این بخش
                //         console.error('WebSocket error:', error);

                //     };
                //     initializeWebSocket
                // } else {
                //     console.error('Failed to initialize webSocket')
                //     return null;
                // }
                // stompClient.activate();
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

    const go_chat = () => {
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
            navigation.navigate('ChatList')
        }
    }
    const go_notif = () => {
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
            if (enabled) {
                Alert.alert(
                    'اعلان',
                    'آیا میخواهید غیرفعال شوید؟',
                    [
                        {
                            text: 'بله', onPress: () => { disableUser() }
                        },
                        { text: 'خیر', style: 'cancel' }
                    ]
                );
            } else {
                setModalVisible(true);
            }
            // Alert.alert(
            //     'خطا',
            //     'موقتا نقشه کار نمیکنه',
            //     [
            //
            //         {text: 'متوجه شدم', style: 'cancel'}
            //     ]
            // );

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
            .catch((error: any) => {
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

            <View style={styles.cardIcons}>
                <View><Icon style={{ color: darkMode ? '#E0E0E0' : '#666' }} name="truck" /></View>
                <View style={{ marginVertical: 14 }} ><Icon2 style={{ color: darkMode ? '#E0E0E0' : '#666' }} name="profile" /></View>
                <View><Icon1 style={{ color: darkMode ? '#E0E0E0' : '#666' }} name="location-outline" /></View>
            </View>
            <View style={styles.cardContent}>
                <Text style={[styles.cardDetails, { color: darkMode ? '#E0E0E0' : '#404040'} ]}>
                    <Text style={{fontWeight: 'bold'}}>ماشین: </Text> {item.car}
                </Text>
                <Text style={[styles.cardDetails, { color: darkMode ? '#E0E0E0' : '#404040'} ]}
                    numberOfLines={1} ellipsizeMode="tail">
                    <Text style={{fontWeight: 'bold'}}>نوع: </Text> {item.kind}
                </Text>
                <Text style={[styles.cardDescription, { color: darkMode ? '#E0E0E0' : '#404040'} ]}
                    numberOfLines={1} ellipsizeMode="tail">
                    <Text style={{fontWeight: 'bold'}}>مسیر: </Text> از  {item.fromCity} تا {item.destinationCities}
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
                    <TouchableOpacity onPress={open_box} style={styles.iconButton}>
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
                    contentContainerStyle={[styles.content]}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={isLoading && <ActivityIndicator size="large" color="#0000ff" />}
                />
            )}
            {/* Modal برای نمایش انتخاب مبدا و مقصد */}

            {/* Modal برای نمایش نقشه */}

            <Modal
                isVisible={ModalVisible}
                onBackdropPress={() => {
                    setModalVisible(false);
                }} style={styles.modal}
                animationIn="slideInUp">
                <View style={{
                    borderRadius: 8,
                    justifyContent: mapVisible ? 'center' : 'flex-start',
                    backgroundColor: '#1e1e1e',
                    alignItems: 'center',
                }}>
                    {mapVisible ? (
                        <MapView
                            onPress={handleMapSelect}
                            initialRegion={{
                                latitude: 35.6892,
                                longitude: 51.389,
                                latitudeDelta: 0.1,
                                longitudeDelta: 0.1,
                            }}
                            provider={PROVIDER_GOOGLE}
                            onMapReady={_onMapReady}
                            zoom={12}
                            style={{
                                width: '100%',
                                //height:height-moderateScale(200),
                                height: '100%', marginBottom: MarginBottonMap,
                            }}
                            // style={ {
                            //     ...StyleSheet.absoluteFillObject,
                            // }}
                            onRegionChangeComplete={(w) => {
                                // console.log("onRegionChangeComplete", w)
                                handleMapCompleteChange(w);
                                // w.latitude, w.longitude

                            }}
                        >
                            {/* {markerPosition && (
                                <Marker coordinate={markerPosition} />
                            )}*/}
                        </MapView>
                    ) : (
                        <View>
                            <Text style={styles.title}>اضافه کردن مشخصات</Text>
                            {/* Source Selection */}
                            <View style={styles.boxTitles}>
                                <Text style={styles.label}>مبدأ</Text>
                                <Text></Text>
                                <Text style={styles.label}>مقصد</Text>
                            </View>
                            <View style={styles.dropdownContainer1}>

                            </View>

                            {/* Destination Selection */}
                            <View style={styles.dropdownContainer1}>
                                <View style={{ width: '50%' }}>
                                    <Picker
                                        style={{ color: '#f5f5f5' }}
                                        dropdownIconColor="white"
                                        selectedValue={selectedSource}
                                        onValueChange={(itemValue) => setSelectedSource(itemValue)}
                                    >
                                        {sourceLocations.map((location, index) => (
                                            <Picker.Item key={index} label={location} value={location} />
                                        ))}
                                    </Picker>
                                    <TouchableOpacity
                                        style={styles.mapButton}
                                        onPress={() => {
                                            setIsSelectingSource(true);
                                            setMapVisible(true);
                                        }}
                                    >
                                        <Text style={styles.mapButtonText}>انتخاب</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={{ width: '50%' }}>
                                    <Picker
                                        style={{ color: '#f5f5f5' }}
                                        dropdownIconColor="white"
                                        selectedValue={selectedDestination}
                                        onValueChange={(itemValue) => setSelectedDestination(itemValue)}>
                                        {destinationLocations.map((location, index) => (
                                            <Picker.Item key={index} label={location} value={location} />
                                        ))}
                                    </Picker>
                                    <TouchableOpacity
                                        style={styles.mapButton}
                                        onPress={() => {
                                            setIsSelectingSource(false);
                                            setMapVisible(true);
                                        }}
                                    >
                                        <Text style={styles.mapButtonText}>انتخاب</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            {roles.includes('ROLE_CUSTOMER') && (<View style={styles.veicleContainer}>
                                {/* Vehicle Selection */}
                                <View style={styles.dropdownContainer}>
                                    <Text style={styles.CarLabel}>ماشین درخواستی</Text>
                                    <View style={styles.pickerContainer}>
                                        <Picker style={styles.carPicker}
                                            dropdownIconColor="white"
                                            selectedValue={selectedCar}
                                            onValueChange={handleCarChange}
                                        >
                                            {cars.map((car) => (
                                                <Picker.Item key={car.id} label={car.name} value={car.id} />
                                            ))}
                                        </Picker>
                                    </View>
                                </View>

                                {/* Container Selection */}
                                <View style={styles.dropdownContainer}>
                                    <Text style={styles.CarLabel}></Text>
                                    <View style={styles.pickerContainer}>
                                        <Picker
                                            style={styles.carPicker}
                                            dropdownIconColor="white"
                                            selectedValue={selectedCarType}
                                            onValueChange={(itemValue) => setSelectedCarType(itemValue)}
                                        >
                                            {carTypes.map((carType) => (
                                                <Picker.Item key={carType.id} label={carType.name} value={carType.id} />
                                            ))}
                                        </Picker>
                                    </View>
                                </View>
                            </View>)}
                            {/* Buttons */}
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity disabled={isButtonLoading} style={[styles.submitButton,
                                { backgroundColor: isButtonLoading ? '#335433' : '#00cf00' }]}
                                    onPress={handleSubmit}>
                                    <Text style={[styles.submitText,
                                    { color: isButtonLoading ? '#626262' : '#fff' }]}>ثبت</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.cancelButton} onPress={canselSubmit}>
                                    <Text style={[styles.submitText,
                                    { color: '#fff' }]}>انصراف</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                    {mapVisible && <TouchableOpacity
                        style={{
                            width: 90, height: 90,

                            //backgroundColor: "#ee0028",
                            position: 'absolute',
                            zIndex: 99,

                            // backgroundColor:"#c706ee",
                            alignItems: 'center',
                        }}
                        onPress={() => {
                            setMapVisible(false);
                            const lat: number = markerPosition?.latitude;
                            const long: number = markerPosition?.longitude;
                            setLocations(lat, long);
                        }}
                    // onPress={() => {
                    //     this.nextScreen(item, type);
                    //
                    // }}
                    >
                        <Image source={require('../assets/location.png')}
                            style={{
                                width: 45,
                                height: 45,
                                // borderRadius: moderateScale(48)
                            }} />
                    </TouchableOpacity>
                    }
                </View>
            </Modal>

            <View style={styles.fixedMenu}>
                <TouchableOpacity style={styles.menuItem}>
                    <Icon name="home" style={styles.icon} />
                    <Text style={styles.menuText}>خانه</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={() =>{ go_chat()
                    badgeManager.reset();
                    setMessageCount(0);
                }}>
                    <Icon name="envelope" style={styles.icon}  />
                    {messageCount > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{messageCount > 9 ? '+9' : messageCount}</Text>
                        </View>
                    )}
                    <Text style={styles.menuText}>پیام</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {go_notif()
                    badgeManager.notifReset();
                    setNotifCount(0);
                }} style={styles.menuItem}>
                    <Icon name="bell" style={styles.icon} />
                    {notifCount > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{notifCount > 9 ? '+9' : notifCount}</Text>
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
    // submitButton: {
    //     padding: 15,
    //     backgroundColor: 'green',
    //     borderRadius: 5,
    //     alignItems: 'center',
    //     marginTop: 20,
    // },
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
        backgroundColor: '#323232',
        paddingVertical: 10,
        paddingHorizontal: 20,
        elevation: 5,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 8,
        paddingHorizontal: 10,
    },
    searchInput: {
        height: '90%',
        flex: 1,
        backgroundColor: '#f3f3f3',
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 8,
        color: '#000',
        textAlign: 'right',
        marginRight: 8,
        fontSize: 14,
        fontFamily: 'Vazir',
    },
    clearButton: {
        padding: 5,
        marginLeft: 5,
    },

    content: {
        padding: 8,
    },
    blogCard: {
        flexDirection: 'row',
        marginBottom: 15,
        backgroundColor: '#fff',
        borderRadius: 3,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        elevation: 5,
        alignItems: 'center',
    },
    darkCard: {
        backgroundColor: '#2c2c2c',
    },
    cardImage: {
        width: width * 0.24,
        height: width * 0.24,
        resizeMode: 'cover',
        margin: 4,
        marginLeft: 10,
        borderRadius: 3,
    },
    cardContent: {
        flexDirection: 'column',
        paddingLeft: 5,
        flex: 1,
        justifyContent: 'center',
        paddingRight: 20,
        alignItems: 'flex-start',
    },
    cardIcons: {
        flexDirection: 'column',
        paddingLeft: 5,
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    cardDetails: {
        fontSize: 15,
        paddingBottom: 3,
        width: '100%',
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
        backgroundColor: '#323232',
        paddingVertical: 10,
        position: 'absolute',
        bottom: 0,
        width: Dimensions.get('window').width,
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
    overlay: {
        flexDirection: 'column',
        borderRadius: 8,
        flex: 1,
        paddingTop: 10,
        alignItems: 'center',
        backgroundColor: '#1e1e1e',
    },
    modalContainer: {
        width: '90%',
        backgroundColor: '#fcba03',
        borderRadius: 10,
        padding: 5,
    },
    boxTitles: {
        paddingLeft: 20,
        paddingRight: 20,
        flexDirection: "row",
        justifyContent: 'space-around'
    },
    veicleContainer: {
        paddingTop: 20,
        flexDirection: 'row',
    },
    modal: {
        marginBottom: 90,
        marginTop: 90,
        margin: 40,
    },
    title: {
        paddingTop: 14,
        fontSize: 18,
        color: '#f5f5f5',
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    dropdownContainer: {
        width: '50%',
        paddingRight: 20,
        flexDirection: 'column',
        marginBottom: 15,
    },
    dropdownContainer1: {
        justifyContent: 'space-around',
        flexDirection: 'row',
        marginBottom: 15,
    },
    label: {
        fontSize: 16,
        color: '#f5f5f5',
        marginBottom: 5,
    },
    CarLabel: {
        paddingRight: 10,
        fontSize: 16,
        color: '#f5f5f5',
    },
    mapButton: {
        alignSelf: 'center',
        width: 80,
        justifyContent: 'center',
        backgroundColor: '#333333',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 10,
    },
    carPicker: {
        height: 50,
        color: '#c9c9c9',
        textShadowColor: '#f5f5f5',
    },
    pickerContainer: {
        marginTop: 15,
        marginLeft: 15,
        height: 40,
        borderColor: '#f5f5f5',
        borderWidth: 1,
        justifyContent: 'center',
        backgroundColor: '#333',
        borderRadius: 8,
    },
    mapButtonText: {
        color: '#f5f5f5',
        fontSize: 14,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 20,
    },
    submitButton: {
        backgroundColor: 'green',
        padding: 10,
        borderRadius: 5,
        width: 70,
        margin: 10,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#d40202',
        padding: 10,
        borderRadius: 5,
        margin: 10,
        width: 70,
        alignItems: 'center',
    },
    submitText: {
        fontSize: 16,
    },
    map: {
        flex: 1,
        width: '100%',
    },
});
