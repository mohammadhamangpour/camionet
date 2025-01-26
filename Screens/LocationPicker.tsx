// LocationPicker.tsx
import React, { useState } from 'react';
import { View, Modal, TouchableOpacity, Text, StyleSheet } from 'react-native';
import LocationMap from './MapScreen';  // مسیر درست import را مطمئن شوید

interface Location {
  latitude: number;
  longitude: number;
}

interface Props {
  onLocationSelect?: (location: Location) => void;
}

const LocationPicker: React.FC<Props> = ({ onLocationSelect: parentLocationSelect }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
    setModalVisible(false);
    if (parentLocationSelect) {
      parentLocationSelect(location);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.selectButton} 
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.buttonText}>
          {selectedLocation 
            ? `موقعیت انتخاب شده: ${selectedLocation.latitude.toFixed(4)}, ${selectedLocation.longitude.toFixed(4)}` 
            : 'انتخاب موقعیت روی نقشه'}
        </Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>بستن</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>انتخاب موقعیت</Text>
          </View>

          <LocationMap onLocationSelect={handleLocationSelect} />
        </View>
      </Modal>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    padding: 15,
  },
  selectButton: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'Vazir',
    color: '#333',
  },
  modalContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Vazir',
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontFamily: 'Vazir',
  },
});

export default LocationPicker;