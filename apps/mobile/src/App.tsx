import { registerRootComponent } from 'expo'
import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Linking,
  ScrollView,
} from 'react-native'

const API_URL = 'https://thank-lafayette-reputation-priest.trycloudflare.com/api/v1'

interface Book {
  id: number
  rank: number
  title: string
  author: string
  coverImageUrl?: string
  price?: string
  currency?: string
  detailUrl?: string
}

interface RankingData {
  countryCode: string
  books: Book[]
}

const COUNTRIES = [
  { code: 'KR', name: '한국', flag: '🇰🇷' },
  { code: 'JP', name: '일본', flag: '🇯🇵' },
  { code: 'CN', name: '중국', flag: '🇨🇳' },
  { code: 'US', name: '미국', flag: '🇺🇸' },
  { code: 'UK', name: '영국', flag: '🇬🇧' },
]

export default function App() {
  const [selectedCountry, setSelectedCountry] = useState('KR')
  const [rankings, setRankings] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchRankings(selectedCountry)
  }, [selectedCountry])

  const fetchRankings = async (countryCode: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_URL}/rankings?country=${countryCode}`)
      const data = await response.json()
      if (data.success && data.data?.books) {
        setRankings(data.data.books)
      } else {
        setRankings([])
      }
    } catch (err) {
      setError('Failed to load rankings. Is the API server running?')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleBookPress = (book: Book) => {
    if (book.detailUrl) {
      Linking.openURL(book.detailUrl)
    }
  }

  const renderBookItem = ({ item }: { item: Book }) => (
    <TouchableOpacity style={styles.bookItem} onPress={() => handleBookPress(item)}>
      <View style={styles.rankBadge}>
        <Text style={styles.rankText}>{item.rank}</Text>
      </View>
      {item.coverImageUrl ? (
        <Image source={{ uri: item.coverImageUrl }} style={styles.coverImage} />
      ) : (
        <View style={[styles.coverImage, styles.placeholderImage]}>
          <Text style={styles.placeholderText}>📚</Text>
        </View>
      )}
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.bookAuthor} numberOfLines={1}>
          {item.author}
        </Text>
        {item.price && (
          <Text style={styles.bookPrice}>
            {item.currency} {Number(item.price).toLocaleString()}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  )

  const selectedCountryInfo = COUNTRIES.find((c) => c.code === selectedCountry)

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📚 세계 베스트셀러</Text>
        <Text style={styles.subtitle}>World Bestsellers</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabContainer}>
        {COUNTRIES.map((country) => (
          <TouchableOpacity
            key={country.code}
            style={[styles.tab, selectedCountry === country.code && styles.tabActive]}
            onPress={() => setSelectedCountry(country.code)}
          >
            <Text style={styles.tabFlag}>{country.flag}</Text>
            <Text style={[styles.tabText, selectedCountry === country.code && styles.tabTextActive]}>
              {country.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>
          {selectedCountryInfo?.flag} {selectedCountryInfo?.name} TOP 20
        </Text>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => fetchRankings(selectedCountry)}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : rankings.length === 0 ? (
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>No data available</Text>
          </View>
        ) : (
          <FlatList
            data={rankings}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderBookItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    backgroundColor: '#2563eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#bfdbfe',
    marginTop: 4,
  },
  tabContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
  },
  tabActive: {
    backgroundColor: '#2563eb',
  },
  tabFlag: {
    fontSize: 18,
    marginRight: 6,
  },
  tabText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
  },
  errorText: {
    fontSize: 14,
    color: '#dc2626',
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#94a3b8',
  },
  retryButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  listContainer: {
    paddingBottom: 20,
  },
  bookItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  rankBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#2563eb',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  rankText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  coverImage: {
    width: 70,
    height: 100,
    borderRadius: 6,
    backgroundColor: '#e2e8f0',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 28,
  },
  bookInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  bookTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    lineHeight: 20,
  },
  bookAuthor: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
  },
  bookPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
    marginTop: 6,
  },
})

registerRootComponent(App)
