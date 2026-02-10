import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useTranslation } from 'react-i18next'
import { Text } from 'react-native'

import { HomeScreen } from '../screens/HomeScreen'
import { CountryRankingScreen } from '../screens/CountryRankingScreen'
import { BookDetailScreen } from '../screens/BookDetailScreen'
import { SettingsScreen } from '../screens/SettingsScreen'

export type RootStackParamList = {
  MainTabs: undefined
  BookDetail: { bookId: number }
  CountryRanking: { countryCode: string }
}

export type MainTabParamList = {
  Home: undefined
  Settings: undefined
}

const Stack = createNativeStackNavigator<RootStackParamList>()
const Tab = createBottomTabNavigator<MainTabParamList>()

function MainTabs() {
  const { t } = useTranslation()

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2563eb',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: t('tabs.home'),
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📚</Text>,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: t('tabs.settings'),
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>⚙️</Text>,
        }}
      />
    </Tab.Navigator>
  )
}

export function RootNavigator() {
  const { t } = useTranslation()

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CountryRanking"
        component={CountryRankingScreen}
        options={{ title: t('screens.countryRanking') }}
      />
      <Stack.Screen
        name="BookDetail"
        component={BookDetailScreen}
        options={{ title: t('screens.bookDetail') }}
      />
    </Stack.Navigator>
  )
}
