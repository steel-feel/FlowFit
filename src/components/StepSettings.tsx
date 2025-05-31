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

const DAILY_STEPS_TIME_KEY = 'daily_steps_time';
const REMINDER_TIME_KEY = 'reminder_time';

const SetWalkingStepsTime: React.FC = () => {
  const [dailyStepsTime, setDailyStepsTime] = useState<Date | null>(null);
  const [reminderTime, setReminderTime] = useState<Date | null>(null);
  const [tempDailyStepsTime, setTempDailyStepsTime] = useState<Date>(new Date());
  const [tempReminderTime, setTempReminderTime] = useState<Date>(new Date());
  const [activePicker, setActivePicker] = useState<'dailySteps' | 'reminder' | null>(null);

  useEffect(() => {
    const loadTimes = async () => {
      try {
        const dailyStepsStored = await AsyncStorage.getItem(DAILY_STEPS_TIME_KEY);
        const reminderStored = await AsyncStorage.getItem(REMINDER_TIME_KEY);
        if (dailyStepsStored) {
          const date = new Date(dailyStepsStored);
          setDailyStepsTime(date);
          setTempDailyStepsTime(date);
        }
        if (reminderStored) {
          const date = new Date(reminderStored);
          setReminderTime(date);
          setTempReminderTime(date);
        }
      } catch (e) {
        console.error('Failed to load times:', e);
      }
    };
    loadTimes();
  }, []);

  const scheduleNotification = async (date: Date, id: string, title: string, body: string) => {
    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: date.getTime(),
      repeatFrequency: RepeatFrequency.DAILY,
    };

    await notifee.createTriggerNotification(
      {
        id,
        title,
        body,
        android: {
          channelId: 'default', // Ensure this channel exists or create it
        },
      },
      trigger,
    );
  };

  const saveDailyStepsTime = async () => {
    try {
      setDailyStepsTime(tempDailyStepsTime);
      await AsyncStorage.setItem(DAILY_STEPS_TIME_KEY, tempDailyStepsTime.toISOString());

      const now = new Date();
      // To ensure the notification schedules for the upcoming set time if it's already passed today
      const notificationDate = new Date(tempDailyStepsTime);
      if (notificationDate.getTime() < now.getTime()) {
        notificationDate.setDate(notificationDate.getDate() + 1); // Schedule for next day
      }

      await scheduleNotification(
        notificationDate,
        'daily-steps-goal',
        '🚶 Daily Steps Goal',
        'Time to review your daily steps goal!',
      );

      Alert.alert('Success', 'Daily steps goal time has been updated.');
    } catch (e) {
      console.error('Failed to save daily steps time:', e);
    }
    setActivePicker(null);
  };

  const saveReminderTime = async () => {
    try {
      setReminderTime(tempReminderTime);
      await AsyncStorage.setItem(REMINDER_TIME_KEY, tempReminderTime.toISOString());

      const now = new Date();
      // To ensure the notification schedules for the upcoming set time if it's already passed today
      const notificationDate = new Date(tempReminderTime);
      if (notificationDate.getTime() < now.getTime()) {
        notificationDate.setDate(notificationDate.getDate() + 1); // Schedule for next day
      }

      await scheduleNotification(
        notificationDate,
        'steps-reminder',
        '👟 Get Walking!',
        'Don\'t forget to hit your steps goal!',
      );

      Alert.alert('Success', 'Walking reminder time has been updated.');
    } catch (e) {
      console.error('Failed to save reminder time:', e);
    }
    setActivePicker(null);
  };

  const timeString = (date: Date) =>
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.cardsWrapper}>
        {/* Daily Steps Goal Time Card */}
        <View style={styles.card}>
          <Text style={styles.title}>🎯 Daily Steps Goal Time</Text>
          {dailyStepsTime ? (
            <Text style={styles.timeText}>Your set time: {timeString(dailyStepsTime)}</Text>
          ) : (
            <Text style={styles.timeText}>No goal time set yet</Text>
          )}
          <TouchableOpacity style={styles.setButton} onPress={() => setActivePicker('dailySteps')}>
            <Text style={styles.setButtonText}>
              {dailyStepsTime ? 'Edit Goal Time' : 'Set Goal Time'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Walking Reminder Time Card */}
        <View style={styles.card}>
          <Text style={styles.title}>🔔 Walking Reminder</Text>
          {reminderTime ? (
            <Text style={styles.timeText}>Reminder set for: {timeString(reminderTime)}</Text>
          ) : (
            <Text style={styles.timeText}>No reminder time set</Text>
          )}
          <TouchableOpacity style={styles.setButton} onPress={() => setActivePicker('reminder')}>
            <Text style={styles.setButtonText}>
              {reminderTime ? 'Edit Reminder' : 'Set Reminder'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Floating Modal Picker */}
      <Modal
        visible={!!activePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setActivePicker(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.pickerOverlay}>
            <DateTimePicker
              value={activePicker === 'dailySteps' ? tempDailyStepsTime : tempReminderTime}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(e, d) => {
                if (d) {
                  activePicker === 'dailySteps' ? setTempDailyStepsTime(d) : setTempReminderTime(d);
                }
              }}
              themeVariant="light"
            />
            <TouchableOpacity
              style={styles.saveButton}
              onPress={activePicker === 'dailySteps' ? saveDailyStepsTime : saveReminderTime}
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
  },
  cardsWrapper: {
    alignItems: 'center',
    gap: 20,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    width: '90%',
    borderRadius: 12,
    elevation: 3,
    shadowColor: Colors.prussianBlue, // Using the new color
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
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
  },
  setButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerOverlay: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    width: '80%',
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

export default SetWalkingStepsTime;