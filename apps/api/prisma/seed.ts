import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Seed countries
  const countries = [
    {
      code: 'KR',
      nameKo: '한국',
      nameEn: 'South Korea',
      nameZh: '韩国',
      nameJa: '韓国',
      bookstoreName: 'YES24',
      bookstoreUrl: 'https://www.yes24.com',
      flag: '🇰🇷',
    },
    {
      code: 'JP',
      nameKo: '일본',
      nameEn: 'Japan',
      nameZh: '日本',
      nameJa: '日本',
      bookstoreName: 'Amazon Japan',
      bookstoreUrl: 'https://www.amazon.co.jp',
      flag: '🇯🇵',
    },
    {
      code: 'CN',
      nameKo: '중국',
      nameEn: 'China',
      nameZh: '中国',
      nameJa: '中国',
      bookstoreName: '当当网',
      bookstoreUrl: 'https://www.dangdang.com',
      flag: '🇨🇳',
    },
    {
      code: 'US',
      nameKo: '미국',
      nameEn: 'United States',
      nameZh: '美国',
      nameJa: 'アメリカ',
      bookstoreName: 'Amazon US',
      bookstoreUrl: 'https://www.amazon.com',
      flag: '🇺🇸',
    },
    {
      code: 'UK',
      nameKo: '영국',
      nameEn: 'United Kingdom',
      nameZh: '英国',
      nameJa: 'イギリス',
      bookstoreName: 'Amazon UK',
      bookstoreUrl: 'https://www.amazon.co.uk',
      flag: '🇬🇧',
    },
  ]

  for (const country of countries) {
    await prisma.country.upsert({
      where: { code: country.code },
      update: country,
      create: country,
    })
  }

  console.log('Seed completed: 5 countries added')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
