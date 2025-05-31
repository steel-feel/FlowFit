import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  SafeAreaView,
  Alert,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import notifee, { TimestampTrigger, TriggerType, RepeatFrequency } from '@notifee/react-native';

// New color palette
const Colors = {
  skyBlue: '#8ecae6ff',
  blueGreen: '#219ebcff',
  prussianBlue: '#023047ff',
  selectiveYellow: '#ffb703ff',
  utOrange: '#fb8500ff',
};

const REMINDER_TIME_KEY = 'reminder_time'; // Key for storing reminder time in AsyncStorage

const SetWalkingReminder: React.FC = () => {
  // State to hold the selected reminder time
  const [reminderTime, setReminderTime] = useState<Date | null>(null);
  // Temporary state for the DateTimePicker, allows user to pick without immediate saving
  const [tempReminderTime, setTempReminderTime] = useState<Date>(new Date());
  // State to control the visibility of the DateTimePicker modal
  const [showPicker, setShowPicker] = useState<boolean>(false);

  // Effect to load the saved reminder time when the component mounts
  useEffect(() => {
    const loadReminderTime = async () => {
      try {
        const reminderStored = await AsyncStorage.getItem(REMINDER_TIME_KEY);
        if (reminderStored) {
          const date = new Date(reminderStored);
          setReminderTime(date); // Set the display time
          setTempReminderTime(date); // Set the picker's initial value
        }
      } catch (e) {
        console.error('Failed to load reminder time:', e);
      }
    };
    loadReminderTime();
  }, []); // Empty dependency array ensures this runs only once on mount

  /**
   * Schedules a local notification using Notifee.
   * @param date The date and time for the notification to trigger.
   * @param id A unique ID for the notification.
   * @param title The title of the notification.
   * @param body The body text of the notification.
   */
  const scheduleNotification = async (date: Date, id: string, title: string, body: string) => {
    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: date.getTime(), // Notification will trigger at this specific timestamp
      repeatFrequency: RepeatFrequency.DAILY, // Notification will repeat daily
    };

    await notifee.createTriggerNotification(
      {
        id, // Unique ID for this notification
        title,
        body,
        android: {
          channelId: 'default', // Android requires a channel ID for notifications
          // You might want to add smallIcon, color, etc. for better Android experience
        },
      },
      trigger, // The trigger configuration
    );
  };

  /**
   * Saves the selected reminder time to AsyncStorage and schedules the notification.
   */
  const saveReminderTime = async () => {
    try {
      setReminderTime(tempReminderTime); // Update the displayed reminder time
      await AsyncStorage.setItem(REMINDER_TIME_KEY, tempReminderTime.toISOString()); // Store as ISO string

      const now = new Date();
      // Create a notification date. If the chosen time is already past today,
      // schedule it for the same time tomorrow to ensure it triggers.
      const notificationDate = new Date(tempReminderTime);
      if (notificationDate.getTime() < now.getTime()) {
        notificationDate.setDate(notificationDate.getDate() + 1); // Schedule for next day
      }

      await scheduleNotification(
        notificationDate,
        'steps-reminder', // Unique ID for the walking reminder notification
        '👟 Get Walking!',
        'Don\'t forget to hit your steps goal!',
      );

      Alert.alert('Success', 'Walking reminder time has been updated.');
    } catch (e) {
      console.error('Failed to save reminder time:', e);
      Alert.alert('Error', 'Failed to save reminder time. Please try again.');
    } finally {
      setShowPicker(false); // Close the picker modal
    }
  };

  /**
   * Formats a Date object into a readable time string (e.g., "09:00 AM").
   * @param date The Date object to format.
   * @returns A formatted time string.
   */
  const timeString = (date: Date) =>
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.cardsWrapper}>
        {/* Walking Reminder Time Card */}
        <View style={styles.card}>
          <Text style={styles.title}>🔔 Walking Reminder</Text>
          {reminderTime ? (
            <Text style={styles.timeText}>Reminder set for: {timeString(reminderTime)}</Text>
          ) : (
            <Text style={styles.timeText}>No reminder time set</Text>
          )}
          <TouchableOpacity style={styles.setButton} onPress={() => setShowPicker(true)}>
            <Text style={styles.setButtonText}>
              {reminderTime ? 'Edit Reminder' : 'Set Reminder'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Floating Modal Picker */}
      <Modal
        visible={showPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPicker(false)} // Allows closing by pressing outside on Android
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.pickerOverlay}>
            <DateTimePicker
              value={tempReminderTime} // Value controlled by temporary state
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'} // 'spinner' for iOS, 'default' for Android
              onChange={(event, selectedDate) => {
                if (selectedDate) {
                  setTempReminderTime(selectedDate); // Update temporary state
                  // On Android, the picker closes automatically after selection in 'default' mode
                  // For iOS 'spinner', it stays open until explicitly closed or saved
                  if (Platform.OS === 'android' && event.type === 'set') {
                    // Auto-save on Android 'set' event if not using a separate save button
                    // For this setup, we still rely on the 'Save' button for consistency.
                  }
                } else if (Platform.OS === 'android' && event.type === 'dismissed') {
                  setShowPicker(false); // Dismiss modal if Android picker is dismissed
                }
              }}
              themeVariant="light" // Ensures a light theme for the picker
            />
            <TouchableOpacity
              style={styles.saveButton}
              onPress={saveReminderTime} // Call save function on button press
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.skyBlue, // Using the new color
    padding: 16,
    justifyContent: 'center', // Center content vertically
    alignItems: 'center', // Center content horizontally
  },
  cardsWrapper: {
    alignItems: 'center',
    gap: 20, // Spacing between cards (though now only one card)
    width: '100%', // Ensure wrapper takes full width for centering
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    width: '90%', // Card width
    maxWidth: 400, // Max width for larger screens
    borderRadius: 12,
    elevation: 3, // Android shadow
    shadowColor: Colors.prussianBlue, // iOS shadow color
    shadowOpacity: 0.1, // iOS shadow opacity
    shadowRadius: 6, // iOS shadow blur radius
    shadowOffset: { width: 0, height: 2 }, // iOS shadow offset
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: Colors.prussianBlue, // Using the new color
    textAlign: 'center',
  },
  timeText: {
    fontSize: 15,
    marginBottom: 16,
    color: Colors.blueGreen, // Using the new color
    textAlign: 'center',
  },
  setButton: {
    backgroundColor: Colors.utOrange, // Using the new color
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10, // Add some margin above the button
  },
  setButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)', // Semi-transparent background for the modal
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerOverlay: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    width: '80%', // Picker overlay width
    maxWidth: 350, // Max width for larger screens
  },
  saveButton: {
    marginTop: 10,
    backgroundColor: Colors.selectiveYellow, // Using the new color
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveButtonText: {
    color: Colors.prussianBlue, // Adjusted for better contrast
    fontWeight: '600',
    fontSize: 14,
  },
});

export default SetWalkingReminder;
