import React, { useEffect } from 'react'
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native'
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useTranslation } from 'react-i18next'
import { COUNTRIES, type CountryCode } from '@book-ranking/shared'
import { useBookStore } from '../stores/bookStore'
import { BookListItem } from '../components/BookListItem'
import type { RootStackParamList } from '../navigation/RootNavigator'

type RouteProps = RouteProp<RootStackParamList, 'CountryRanking'>
type NavigationProp = NativeStackNavigationProp<RootStackParamList>

export function CountryRankingScreen() {
  const { t } = useTranslation()
  const route = useRoute<RouteProps>()
  const navigation = useNavigation<NavigationProp>()
  const { countryCode } = route.params as { countryCode: CountryCode }

  const { rankings, isLoading, fetchRankings } = useBookStore()
  const country = COUNTRIES[countryCode]
  const books = rankings[countryCode] || []

  useEffect(() => {
    navigation.setOptions({
      title: `${country.flag} ${country.names.ko} ${t('ranking.top20')}`,
    })
    fetchRankings(countryCode)
  }, [countryCode, navigation, country, t, fetchRankings])

  const handleBookPress = (bookId: number) => {
    navigation.navigate('BookDetail', { bookId })
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.bookstoreName}>
          {t('ranking.source')}: {country.bookstore.name}
        </Text>
      </View>

      <FlatList
        data={books}
        keyExtractor={(item) => String(item.id)}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => fetchRankings(countryCode)}
          />
        }
        renderItem={({ item: book }) => (
          <BookListItem book={book} onPress={() => handleBookPress(book.id)} />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>{t('ranking.noData')}</Text>
          </View>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  bookstoreName: {
    fontSize: 14,
    color: '#64748b',
  },
  list: {
    padding: 16,
  },
  empty: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#94a3b8',
  },
})
