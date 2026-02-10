import React from 'react'
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native'
import type { BookWithRank } from '@book-ranking/shared'

interface BookListItemProps {
  book: BookWithRank
  onPress: () => void
}

export function BookListItem({ book, onPress }: BookListItemProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.rankContainer}>
        <Text style={styles.rank}>{book.rank}</Text>
        {book.isNew ? (
          <Text style={styles.newBadge}>NEW</Text>
        ) : book.rankChange !== undefined && book.rankChange !== null ? (
          book.rankChange > 0 ? (
            <Text style={styles.rankUp}>▲{book.rankChange}</Text>
          ) : book.rankChange < 0 ? (
            <Text style={styles.rankDown}>▼{Math.abs(book.rankChange)}</Text>
          ) : (
            <Text style={styles.rankSame}>-</Text>
          )
        ) : null}
      </View>

      {book.coverImageUrl ? (
        <Image source={{ uri: book.coverImageUrl }} style={styles.cover} />
      ) : (
        <View style={[styles.cover, styles.placeholderCover]}>
          <Text style={styles.placeholderText}>📚</Text>
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {book.title}
        </Text>
        <Text style={styles.author} numberOfLines={1}>
          {book.author}
        </Text>
        {book.price && (
          <Text style={styles.price}>
            {book.currency} {book.price}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
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
  rankContainer: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rank: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  newBadge: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#dc2626',
    marginTop: 2,
  },
  rankUp: {
    fontSize: 10,
    color: '#16a34a',
    fontWeight: '600',
    marginTop: 2,
  },
  rankDown: {
    fontSize: 10,
    color: '#dc2626',
    fontWeight: '600',
    marginTop: 2,
  },
  rankSame: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 2,
  },
  cover: {
    width: 60,
    height: 90,
    borderRadius: 6,
    backgroundColor: '#e2e8f0',
  },
  placeholderCover: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 24,
  },
  info: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    lineHeight: 20,
  },
  author: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
  },
  price: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
    marginTop: 6,
  },
})
