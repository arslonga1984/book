import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  StyleSheet,
  ActivityIndicator,
} from 'react-native'
import { useRoute, RouteProp } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import { useBookStore } from '../stores/bookStore'
import { useSettingsStore } from '../stores/settingsStore'
import type { RootStackParamList } from '../navigation/RootNavigator'
import type { BookDetail } from '@book-ranking/shared'

type RouteProps = RouteProp<RootStackParamList, 'BookDetail'>

export function BookDetailScreen() {
  const { t } = useTranslation()
  const route = useRoute<RouteProps>()
  const { bookId } = route.params
  const { language } = useSettingsStore()
  const { fetchBookDetail } = useBookStore()

  const [book, setBook] = useState<BookDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showTranslation, setShowTranslation] = useState(true)

  useEffect(() => {
    async function loadBook() {
      setIsLoading(true)
      const data = await fetchBookDetail(bookId, language)
      setBook(data)
      setIsLoading(false)
    }
    loadBook()
  }, [bookId, language, fetchBookDetail])

  const handlePurchase = () => {
    if (book?.purchaseLinks?.[0]?.storeUrl) {
      Linking.openURL(book.purchaseLinks[0].storeUrl)
    }
  }

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    )
  }

  if (!book) {
    return (
      <View style={styles.loading}>
        <Text>{t('book.notFound')}</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      {/* Cover Image */}
      <View style={styles.coverContainer}>
        {book.coverImageUrl ? (
          <Image source={{ uri: book.coverImageUrl }} style={styles.cover} />
        ) : (
          <View style={[styles.cover, styles.placeholderCover]}>
            <Text style={styles.placeholderText}>📚</Text>
          </View>
        )}
      </View>

      {/* Book Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{book.title}</Text>
        <Text style={styles.author}>{book.author}</Text>

        {book.publisher && (
          <Text style={styles.publisher}>
            {t('book.publisher')}: {book.publisher}
          </Text>
        )}

        {book.price && (
          <Text style={styles.price}>
            {book.currency} {book.price}
          </Text>
        )}

        {/* Purchase Button */}
        <TouchableOpacity style={styles.purchaseButton} onPress={handlePurchase}>
          <Text style={styles.purchaseButtonText}>{t('book.purchase')}</Text>
        </TouchableOpacity>

        {/* Description */}
        {book.description && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('book.description')}</Text>
              <TouchableOpacity onPress={() => setShowTranslation(!showTranslation)}>
                <Text style={styles.toggleText}>
                  {showTranslation ? t('book.showOriginal') : t('book.showTranslation')}
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.description}>{book.description}</Text>
          </View>
        )}

        {/* Author Info */}
        {book.authorInfo && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('book.authorInfo')}</Text>
            <View style={styles.authorCard}>
              {book.authorInfo.imageUrl && (
                <Image
                  source={{ uri: book.authorInfo.imageUrl }}
                  style={styles.authorImage}
                />
              )}
              <View style={styles.authorDetails}>
                <Text style={styles.authorName}>{book.authorInfo.name}</Text>
                {book.authorInfo.bio && (
                  <Text style={styles.authorBio} numberOfLines={4}>
                    {book.authorInfo.bio}
                  </Text>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Rank History */}
        {book.rankHistory && book.rankHistory.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('book.rankHistory')}</Text>
            <View style={styles.rankHistory}>
              {book.rankHistory.slice(0, 5).map((item, index) => (
                <View key={index} style={styles.rankItem}>
                  <Text style={styles.rankDate}>{item.date}</Text>
                  <Text style={styles.rankValue}>#{item.rank}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverContainer: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f1f5f9',
  },
  cover: {
    width: 180,
    height: 270,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  placeholderCover: {
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 48,
  },
  infoContainer: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  author: {
    fontSize: 16,
    color: '#475569',
    marginBottom: 8,
  },
  publisher: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  price: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2563eb',
    marginTop: 12,
  },
  purchaseButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  purchaseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 12,
  },
  toggleText: {
    fontSize: 14,
    color: '#2563eb',
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: '#475569',
  },
  authorCard: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
  },
  authorImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  authorDetails: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  authorBio: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  rankHistory: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  rankItem: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  rankDate: {
    fontSize: 12,
    color: '#64748b',
  },
  rankValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
})
