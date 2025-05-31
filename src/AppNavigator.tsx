import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from "./screens/Home"
import 'react-native-reanimated';
import SignUp from './screens/SignUp';
import StepsChallenge from './screens/StepsChallenge';

export type RootStackParamList = {
  Home: undefined;
  SignUp: undefined;
  StepsChallenge: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => (
  <NavigationContainer>
    <Stack.Navigator initialRouteName="SignUp" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Home" component={Home} />  
          <Stack.Screen name="SignUp" component={SignUp} />  
          <Stack.Screen name="StepsChallenge" component={StepsChallenge} />  
     </Stack.Navigator>
  </NavigationContainer>
);

export default AppNavigator;
