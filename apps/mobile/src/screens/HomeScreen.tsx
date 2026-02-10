import React, { useEffect } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useTranslation } from 'react-i18next'
import { COUNTRIES, type CountryCode } from '@book-ranking/shared'
import { useBookStore } from '../stores/bookStore'
import { BookCard } from '../components/BookCard'
import type { RootStackParamList } from '../navigation/RootNavigator'

type NavigationProp = NativeStackNavigationProp<RootStackParamList>

const COUNTRY_CODES: CountryCode[] = ['KR', 'JP', 'CN', 'US', 'UK']

export function HomeScreen() {
  const { t } = useTranslation()
  const navigation = useNavigation<NavigationProp>()
  const { rankings, isLoading, fetchRankings } = useBookStore()

  useEffect(() => {
    COUNTRY_CODES.forEach((code) => fetchRankings(code))
  }, [fetchRankings])

  const handleCountryPress = (countryCode: CountryCode) => {
    navigation.navigate('CountryRanking', { countryCode })
  }

  const handleBookPress = (bookId: number) => {
    navigation.navigate('BookDetail', { bookId })
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('home.title')}</Text>

      <FlatList
        data={COUNTRY_CODES}
        keyExtractor={(item) => item}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => COUNTRY_CODES.forEach((code) => fetchRankings(code))}
          />
        }
        renderItem={({ item: countryCode }) => {
          const country = COUNTRIES[countryCode]
          const countryRankings = rankings[countryCode] || []
          const topBooks = countryRankings.slice(0, 5)

          return (
            <View style={styles.section}>
              <TouchableOpacity
                style={styles.sectionHeader}
                onPress={() => handleCountryPress(countryCode)}
              >
                <Text style={styles.sectionTitle}>
                  {country.flag} {country.names.ko}
                </Text>
                <Text style={styles.moreText}>{t('home.viewAll')} →</Text>
              </TouchableOpacity>

              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={topBooks}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item: book }) => (
                  <BookCard
                    book={book}
                    onPress={() => handleBookPress(book.id)}
                  />
                )}
                contentContainerStyle={styles.horizontalList}
              />
            </View>
          )
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 16,
    color: '#1e293b',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#334155',
  },
  moreText: {
    fontSize: 14,
    color: '#2563eb',
  },
  horizontalList: {
    paddingHorizontal: 12,
  },
})
