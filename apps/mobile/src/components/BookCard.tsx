import React from 'react'
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native'
import type { BookWithRank } from '@book-ranking/shared'

interface BookCardProps {
  book: BookWithRank
  onPress: () => void
}

export function BookCard({ book, onPress }: BookCardProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.rankBadge}>
        <Text style={styles.rankText}>{book.rank}</Text>
      </View>

      {book.coverImageUrl ? (
        <Image source={{ uri: book.coverImageUrl }} style={styles.cover} />
      ) : (
        <View style={[styles.cover, styles.placeholderCover]}>
          <Text style={styles.placeholderText}>📚</Text>
        </View>
      )}

      <Text style={styles.title} numberOfLines={2}>
        {book.title}
      </Text>
      <Text style={styles.author} numberOfLines={1}>
        {book.author}
      </Text>

      {book.rankChange !== undefined && book.rankChange !== null && (
        <View style={styles.rankChangeContainer}>
          {book.isNew ? (
            <Text style={styles.newBadge}>NEW</Text>
          ) : book.rankChange > 0 ? (
            <Text style={styles.rankUp}>▲{book.rankChange}</Text>
          ) : book.rankChange < 0 ? (
            <Text style={styles.rankDown}>▼{Math.abs(book.rankChange)}</Text>
          ) : (
            <Text style={styles.rankSame}>-</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    width: 120,
    marginHorizontal: 4,
  },
  rankBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
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
  cover: {
    width: 120,
    height: 160,
    borderRadius: 8,
    backgroundColor: '#e2e8f0',
  },
  placeholderCover: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 32,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 8,
    lineHeight: 18,
  },
  author: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  rankChangeContainer: {
    marginTop: 4,
  },
  newBadge: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#dc2626',
  },
  rankUp: {
    fontSize: 11,
    color: '#16a34a',
    fontWeight: '600',
  },
  rankDown: {
    fontSize: 11,
    color: '#dc2626',
    fontWeight: '600',
  },
  rankSame: {
    fontSize: 11,
    color: '#94a3b8',
  },
})
