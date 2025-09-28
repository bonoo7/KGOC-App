import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Platform, Text } from 'react-native';

import DashboardScreen from '../screens/DashboardScreen';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreenNew from '../screens/SettingsScreenNew';
import RoleManagementScreen from '../screens/RoleManagementScreen';
import WellTestScreen from '../screens/WellTestScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Dashboard Stack Navigator (includes Well Test)
const DashboardStack = ({ user }) => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DashboardMain">
        {(props) => <DashboardScreen {...props} user={user} />}
      </Stack.Screen>
      <Stack.Screen name="WellTest">
        {(props) => <WellTestScreen {...props} user={user} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

// Settings Stack Navigator
const SettingsStack = ({ user, onLogout }) => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SettingsMain">
        {(props) => <SettingsScreenNew {...props} user={user} onLogout={onLogout} />}
      </Stack.Screen>
      <Stack.Screen name="RoleManagement">
        {(props) => <RoleManagementScreen {...props} user={user} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

const AppNavigator = ({ user, onLogout }) => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Dashboard"
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: '#666',
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopWidth: 1,
            borderTopColor: '#e0e0e0',
            paddingBottom: Platform.OS === 'ios' ? 20 : 5,
            height: Platform.OS === 'ios' ? 85 : 60,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
            marginTop: 5,
          },
        }}
      >
        <Tab.Screen
          name="Dashboard"
          options={{
            tabBarIcon: ({ color, size }) => (
              Platform.OS === 'web' ? 
                <span style={{ fontSize: size, color }}>📊</span> :
                <Text style={{ fontSize: size, color }}>📊</Text>
            ),
          }}
        >
          {(props) => <DashboardStack {...props} user={user} />}
        </Tab.Screen>

        <Tab.Screen
          name="Home"
          options={{
            tabBarIcon: ({ color, size }) => (
              Platform.OS === 'web' ? 
                <span style={{ fontSize: size, color }}>🏠</span> :
                <Text style={{ fontSize: size, color }}>🏠</Text>
            ),
          }}
        >
          {() => <HomeScreen user={user} onLogout={onLogout} />}
        </Tab.Screen>

        <Tab.Screen
          name="Profile"
          options={{
            tabBarIcon: ({ color, size }) => (
              Platform.OS === 'web' ? 
                <span style={{ fontSize: size, color }}>👤</span> :
                <Text style={{ fontSize: size, color }}>👤</Text>
            ),
          }}
        >
          {() => <ProfileScreen user={user} />}
        </Tab.Screen>

        <Tab.Screen
          name="Settings"
          options={{
            tabBarIcon: ({ color, size }) => (
              Platform.OS === 'web' ? 
                <span style={{ fontSize: size, color }}>⚙️</span> :
                <Text style={{ fontSize: size, color }}>⚙️</Text>
            ),
          }}
        >
          {() => <SettingsStack user={user} onLogout={onLogout} />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;