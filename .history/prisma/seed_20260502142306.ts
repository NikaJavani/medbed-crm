import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // ── Clean existing data ────────────────────────────────
  await prisma.partUsed.deleteMany()
  await prisma.serviceReport.deleteMany()
  await prisma.ticketAssignment.deleteMany()
  await prisma.ticketComment.deleteMany()
  await prisma.ticketAttachment.deleteMany()
  await prisma.ticketStatusHistory.deleteMany()
  await prisma.ticket.deleteMany()
  await prisma.asset.deleteMany()
  await prisma.assetModel.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.user.deleteMany()
  await prisma.organization.deleteMany()

  console.log('✓ Cleared existing data')

  // ── Organization ───────────────────────────────────────
  const vendor = await prisma.organization.create({
    data: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Piyatech',
      type: 'vendor',
      city: 'Kuala Lumpur',
      country: 'Malaysia',
      contractTier: 'enterprise',
      isActive: true,
    },
  })

  console.log('✓ Organization created')

  // ── Users ──────────────────────────────────────────────
  const password = await bcrypt.hash('GoPiyaTech9*', 12)

  await prisma.user.create({
    data: {
      organizationId: vendor.id,
      email: 'nikajavanii@gmail.com',
      passwordHash: password,
      firstName: 'Nika',
      lastName: 'Javani',
      role: 'vendor_admin',
      isActive: true,
    },
  })

  await prisma.user.create({
    data: {
      organizationId: vendor.id,
      email: 'kavehjavani@gmail.com',
      passwordHash: password,
      firstName: 'Kaveh',
      lastName: 'Javani',
      role: 'manager',
      isActive: true,
    },
  })

  console.log('✓ Users created')
  console.log('')
  console.log('✅ Database seeded successfully!')
  console.log('')
  console.log('── Login credentials ──────────────────────────────')
  console.log('Nika Javani  : nikajavanii@gmail.com')
  console.log('Kaveh Javani : kavehjavani@gmail.com')
  console.log('Password : GoPiyaTech9*')
  console.log('───────────────────────────────────────────────────')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })