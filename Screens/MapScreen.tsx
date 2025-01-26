import React, { useState, useEffect } from 'react';
import { View, PermissionsAndroid, Platform, StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps'; // تغییر در این خط
import Geolocation from 'react-native-geolocation-service';

interface LocationType {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

interface Props {
  onLocationSelect?: (location: { latitude: number; longitude: number }) => void;
}

const LocationMap: React.FC<Props> = ({ onLocationSelect }) => {
  const [location, setLocation] = useState<LocationType>({
    latitude: 35.6892,  // Tehran default coordinates
    longitude: 51.3890,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "دسترسی به موقعیت مکانی",
            message: "برای نمایش موقعیت شما روی نقشه به این دسترسی نیاز است",
            buttonNeutral: "بعداً",
            buttonNegative: "لغو",
            buttonPositive: "تایید"
          }
        );
        
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          getCurrentLocation();
        }
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation(prev => ({
          ...prev,
          latitude,
          longitude
        }));
      },
      (error) => {
        console.log(error.code, error.message);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const handleMapPress = (e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });
    if (onLocationSelect) {
      onLocationSelect({ latitude, longitude });
    }
  };

  const handleConfirmLocation = () => {
    if (selectedLocation && onLocationSelect) {
      onLocationSelect(selectedLocation);
    }
  };

  useEffect(() => {
    requestLocationPermission();
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider="osmdroid"  // تغییر در این خط
     
        onPress={handleMapPress}
        showsUserLocation={true}
      >
        {selectedLocation && (
          <Marker
            coordinate={selectedLocation}
            title="موقعیت انتخابی"
            description="این نقطه انتخاب شده است"
          />
        )}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  infoContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoText: {
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 10,
    fontFamily: 'Vazir',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Vazir',
  },
});

export default LocationMap;
