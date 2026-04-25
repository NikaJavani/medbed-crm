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

  // ── Organizations ──────────────────────────────────────
  const vendor = await prisma.organization.create({
    data: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'MedBed Technologies',
      type: 'vendor',
      address: '123 Tech Park, Cyberjaya',
      city: 'Cyberjaya',
      country: 'Malaysia',
      contractTier: 'enterprise',
      isActive: true,
    },
  })

  const hospital1 = await prisma.organization.create({
    data: {
      id: '00000000-0000-0000-0000-000000000002',
      name: 'Hospital Kuala Lumpur',
      type: 'hospital',
      address: 'Jalan Pahang, 50586 Kuala Lumpur',
      city: 'Kuala Lumpur',
      country: 'Malaysia',
      contractTier: 'premium',
      isActive: true,
    },
  })

  const hospital2 = await prisma.organization.create({
    data: {
      name: 'Penang General Hospital',
      type: 'hospital',
      address: 'Jalan Residensi, 10990 Georgetown',
      city: 'Penang',
      country: 'Malaysia',
      contractTier: 'basic',
      isActive: true,
    },
  })

  const hospital3 = await prisma.organization.create({
    data: {
      name: 'Johor Bahru Specialist Centre',
      type: 'hospital',
      address: 'Jalan Abdul Samad, 80100 Johor Bahru',
      city: 'Johor Bahru',
      country: 'Malaysia',
      contractTier: 'enterprise',
      isActive: true,
    },
  })

  console.log('✓ Organizations created')

  // ── Users ──────────────────────────────────────────────
  const password = await bcrypt.hash('password123', 12)

  const vendorAdmin = await prisma.user.create({
    data: {
      organizationId: vendor.id,
      email: 'admin@medbed.com',
      passwordHash: password,
      firstName: 'Ahmad',
      lastName: 'Razali',
      role: 'vendor_admin',
      phone: '+60123456789',
    },
  })

  const manager = await prisma.user.create({
    data: {
      organizationId: vendor.id,
      email: 'manager@medbed.com',
      passwordHash: password,
      firstName: 'Priya',
      lastName: 'Krishnan',
      role: 'manager',
      phone: '+60123456790',
    },
  })

  const tech1 = await prisma.user.create({
    data: {
      organizationId: vendor.id,
      email: 'tech1@medbed.com',
      passwordHash: password,
      firstName: 'Hafiz',
      lastName: 'Ibrahim',
      role: 'technician',
      phone: '+60123456791',
    },
  })

  const tech2 = await prisma.user.create({
    data: {
      organizationId: vendor.id,
      email: 'tech2@medbed.com',
      passwordHash: password,
      firstName: 'Wei',
      lastName: 'Liang',
      role: 'technician',
      phone: '+60123456792',
    },
  })

  const hospitalAdmin1 = await prisma.user.create({
    data: {
      organizationId: hospital1.id,
      email: 'admin@hkl.com',
      passwordHash: password,
      firstName: 'Nurul',
      lastName: 'Ain',
      role: 'hospital_admin',
      phone: '+60123456793',
    },
  })

  const hospitalStaff1 = await prisma.user.create({
    data: {
      organizationId: hospital1.id,
      email: 'sarah@hkl.com',
      passwordHash: password,
      firstName: 'Sarah',
      lastName: 'Tan',
      role: 'hospital_staff',
      phone: '+60123456794',
    },
  })

  const hospitalStaff2 = await prisma.user.create({
    data: {
      organizationId: hospital2.id,
      email: 'staff@penang.com',
      passwordHash: password,
      firstName: 'Ravi',
      lastName: 'Kumar',
      role: 'hospital_staff',
      phone: '+60123456795',
    },
  })

  const hospitalStaff3 = await prisma.user.create({
    data: {
      organizationId: hospital3.id,
      email: 'staff@jbsc.com',
      passwordHash: password,
      firstName: 'Lily',
      lastName: 'Wong',
      role: 'hospital_staff',
      phone: '+60123456796',
    },
  })

  console.log('✓ Users created')

  // ── Asset Models ───────────────────────────────────────
  const modelX200 = await prisma.assetModel.create({
    data: {
      name: 'MedBed Pro X200',
      manufacturer: 'MedBed Technologies',
      category: 'ICU Bed',
      specifications: {
        max_weight_kg: 200,
        motors: 4,
        connectivity: 'Bluetooth 5.0',
        warranty_years: 3,
      },
    },
  })

  const modelR100 = await prisma.assetModel.create({
    data: {
      name: 'MedBed Recovery R100',
      manufacturer: 'MedBed Technologies',
      category: 'Recovery Bed',
      specifications: {
        max_weight_kg: 180,
        motors: 2,
        connectivity: 'WiFi',
        warranty_years: 2,
      },
    },
  })

  const modelS50 = await prisma.assetModel.create({
    data: {
      name: 'MedBed Smart S50',
      manufacturer: 'MedBed Technologies',
      category: 'General Ward Bed',
      specifications: {
        max_weight_kg: 150,
        motors: 2,
        connectivity: 'None',
        warranty_years: 2,
      },
    },
  })

  console.log('✓ Asset models created')

  // ── Assets ─────────────────────────────────────────────
  const asset1 = await prisma.asset.create({
    data: {
      organizationId: hospital1.id,
      assetModelId: modelX200.id,
      serialNumber: 'MB-X200-001',
      internalTag: 'HKL-ICU-01',
      ward: 'ICU',
      floor: '3',
      installationDate: new Date('2024-01-15'),
      warrantyExpiry: new Date('2027-01-15'),
      status: 'operational',
    },
  })

  const asset2 = await prisma.asset.create({
    data: {
      organizationId: hospital1.id,
      assetModelId: modelX200.id,
      serialNumber: 'MB-X200-002',
      internalTag: 'HKL-ICU-02',
      ward: 'ICU',
      floor: '3',
      installationDate: new Date('2024-01-15'),
      warrantyExpiry: new Date('2027-01-15'),
      status: 'under_maintenance',
    },
  })

  const asset3 = await prisma.asset.create({
    data: {
      organizationId: hospital1.id,
      assetModelId: modelR100.id,
      serialNumber: 'MB-R100-001',
      internalTag: 'HKL-REC-01',
      ward: 'Recovery',
      floor: '2',
      installationDate: new Date('2024-03-10'),
      warrantyExpiry: new Date('2026-03-10'),
      status: 'operational',
    },
  })

  const asset4 = await prisma.asset.create({
    data: {
      organizationId: hospital2.id,
      assetModelId: modelS50.id,
      serialNumber: 'MB-S50-001',
      internalTag: 'PGH-GW-01',
      ward: 'General Ward A',
      floor: '1',
      installationDate: new Date('2023-11-20'),
      warrantyExpiry: new Date('2025-11-20'),
      status: 'operational',
    },
  })

  const asset5 = await prisma.asset.create({
    data: {
      organizationId: hospital3.id,
      assetModelId: modelX200.id,
      serialNumber: 'MB-X200-003',
      internalTag: 'JBSC-ICU-01',
      ward: 'ICU',
      floor: '4',
      installationDate: new Date('2024-06-01'),
      warrantyExpiry: new Date('2027-06-01'),
      status: 'operational',
    },
  })

  console.log('✓ Assets created')

  // ── Tickets ────────────────────────────────────────────
  const now = new Date()

  // Ticket 1 — Resolved ticket with full history
  const ticket1 = await prisma.ticket.create({
    data: {
      ticketNumber: 'TKT-2026-00001',
      organizationId: hospital1.id,
      assetId: asset2.id,
      reportedById: hospitalStaff1.id,
      title: 'Elevation motor not responding',
      description: 'The head elevation motor on ICU bed 002 stopped responding during patient transfer. Bed is stuck in flat position.',
      priority: 'critical',
      category: 'mechanical',
      status: 'resolved',
      slaDeadline: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      resolvedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
    },
  })

  await prisma.ticketStatusHistory.createMany({
    data: [
      { ticketId: ticket1.id, changedById: hospitalStaff1.id, oldStatus: 'open', newStatus: 'open', note: 'Ticket created', changedAt: new Date(now.getTime() - 6 * 60 * 60 * 1000) },
      { ticketId: ticket1.id, changedById: manager.id, oldStatus: 'open', newStatus: 'acknowledged', note: 'Assigned to Hafiz', changedAt: new Date(now.getTime() - 5 * 60 * 60 * 1000) },
      { ticketId: ticket1.id, changedById: tech1.id, oldStatus: 'acknowledged', newStatus: 'in_progress', note: 'On site, diagnosing motor issue', changedAt: new Date(now.getTime() - 3 * 60 * 60 * 1000) },
      { ticketId: ticket1.id, changedById: tech1.id, oldStatus: 'in_progress', newStatus: 'resolved', note: 'Service report submitted', changedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000) },
    ],
  })

  await prisma.ticketAssignment.create({
    data: {
      ticketId: ticket1.id,
      technicianId: tech1.id,
      assignedById: manager.id,
      isActive: true,
    },
  })

  await prisma.ticketComment.createMany({
    data: [
      { ticketId: ticket1.id, authorId: hospitalStaff1.id, body: 'The bed has been moved out of the ICU temporarily. Patient transferred to bed 003.', isInternal: false },
      { ticketId: ticket1.id, authorId: tech1.id, body: 'Motor controller board failure confirmed. Need to replace PCB unit.', isInternal: true },
      { ticketId: ticket1.id, authorId: tech1.id, body: 'Replacement part installed and tested. Bed is operational.', isInternal: false },
    ],
  })

  await prisma.serviceReport.create({
    data: {
      ticketId: ticket1.id,
      technicianId: tech1.id,
      diagnosis: 'Motor controller PCB failure due to power surge',
      workPerformed: 'Replaced motor controller PCB unit and tested all motor functions',
      rootCause: 'hardware_failure',
      visitStart: new Date(now.getTime() - 3 * 60 * 60 * 1000),
      visitEnd: new Date(now.getTime() - 1 * 60 * 60 * 1000),
      laborMinutes: 120,
      requiresFollowup: false,
      partsUsed: {
        create: [
          { partName: 'Motor Controller PCB', partNumber: 'PCB-MC-X200', quantity: 1, unitCost: 450.00, currency: 'MYR' },
          { partName: 'Thermal Paste', partNumber: 'TP-GEN-001', quantity: 1, unitCost: 12.50, currency: 'MYR' },
        ],
      },
    },
  })

  // Ticket 2 — In progress
  const ticket2 = await prisma.ticket.create({
    data: {
      ticketNumber: 'TKT-2026-00002',
      organizationId: hospital1.id,
      assetId: asset1.id,
      reportedById: hospitalAdmin1.id,
      title: 'Bluetooth connectivity dropping',
      description: 'Bed monitoring system loses Bluetooth connection to the nurses station every 10-15 minutes.',
      priority: 'medium',
      category: 'software',
      status: 'in_progress',
      slaDeadline: new Date(now.getTime() + 4 * 60 * 60 * 1000),
    },
  })

  await prisma.ticketStatusHistory.createMany({
    data: [
      { ticketId: ticket2.id, changedById: hospitalAdmin1.id, oldStatus: 'open', newStatus: 'open', note: 'Ticket created', changedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000) },
      { ticketId: ticket2.id, changedById: manager.id, oldStatus: 'open', newStatus: 'acknowledged', note: 'Assigned to Wei Liang', changedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000) },
      { ticketId: ticket2.id, changedById: tech2.id, oldStatus: 'acknowledged', newStatus: 'in_progress', note: 'Remotely diagnosing firmware issue', changedAt: new Date(now.getTime() - 30 * 60 * 1000) },
    ],
  })

  await prisma.ticketAssignment.create({
    data: {
      ticketId: ticket2.id,
      technicianId: tech2.id,
      assignedById: manager.id,
      isActive: true,
    },
  })

  // Ticket 3 — Open, not yet assigned
  const ticket3 = await prisma.ticket.create({
    data: {
      ticketNumber: 'TKT-2026-00003',
      organizationId: hospital2.id,
      assetId: asset4.id,
      reportedById: hospitalStaff2.id,
      title: 'Side rail locking mechanism broken',
      description: 'Left side rail on bed GW-01 does not lock properly. Safety concern for patients.',
      priority: 'high',
      category: 'mechanical',
      status: 'open',
      slaDeadline: new Date(now.getTime() + 20 * 60 * 60 * 1000),
    },
  })

  await prisma.ticketStatusHistory.create({
    data: {
      ticketId: ticket3.id,
      changedById: hospitalStaff2.id,
      oldStatus: 'open',
      newStatus: 'open',
      note: 'Ticket created',
    },
  })

  // Ticket 4 — Pending parts
  const ticket4 = await prisma.ticket.create({
    data: {
      ticketNumber: 'TKT-2026-00004',
      organizationId: hospital3.id,
      assetId: asset5.id,
      reportedById: hospitalStaff3.id,
      title: 'Weight sensor calibration error',
      description: 'Patient weight readings are inconsistent. Sensor shows error code E-04.',
      priority: 'high',
      category: 'electrical',
      status: 'pending_parts',
      slaDeadline: new Date(now.getTime() + 2 * 60 * 60 * 1000),
    },
  })

  await prisma.ticketStatusHistory.createMany({
    data: [
      { ticketId: ticket4.id, changedById: hospitalStaff3.id, oldStatus: 'open', newStatus: 'open', note: 'Ticket created' },
      { ticketId: ticket4.id, changedById: manager.id, oldStatus: 'open', newStatus: 'acknowledged', note: 'Assigned to Hafiz' },
      { ticketId: ticket4.id, changedById: tech1.id, oldStatus: 'acknowledged', newStatus: 'in_progress', note: 'On site' },
      { ticketId: ticket4.id, changedById: tech1.id, oldStatus: 'in_progress', newStatus: 'pending_parts', note: 'Weight sensor module needs replacement. Part ordered.' },
    ],
  })

  await prisma.ticketAssignment.create({
    data: {
      ticketId: ticket4.id,
      technicianId: tech1.id,
      assignedById: manager.id,
      isActive: true,
    },
  })

  // Ticket 5 — Preventive maintenance
  const ticket5 = await prisma.ticket.create({
    data: {
      ticketNumber: 'TKT-2026-00005',
      organizationId: hospital1.id,
      assetId: asset3.id,
      reportedById: vendorAdmin.id,
      title: 'Scheduled preventive maintenance — Q2 2026',
      description: 'Quarterly preventive maintenance check for Recovery bed R100-001. Includes lubrication, motor test, and sensor calibration.',
      priority: 'low',
      category: 'preventive_maintenance',
      status: 'acknowledged',
      slaDeadline: new Date(now.getTime() + 48 * 60 * 60 * 1000),
    },
  })

  await prisma.ticketStatusHistory.createMany({
    data: [
      { ticketId: ticket5.id, changedById: vendorAdmin.id, oldStatus: 'open', newStatus: 'open', note: 'Auto-generated scheduled maintenance ticket' },
      { ticketId: ticket5.id, changedById: manager.id, oldStatus: 'open', newStatus: 'acknowledged', note: 'Scheduled for next week' },
    ],
  })

  console.log('✓ Tickets created')
  console.log('')
  console.log('✅ Database seeded successfully!')
  console.log('')
  console.log('── Login credentials (all passwords: password123) ──')
  console.log('Vendor Admin  : admin@medbed.com')
  console.log('Manager       : manager@medbed.com')
  console.log('Technician 1  : tech1@medbed.com')
  console.log('Technician 2  : tech2@medbed.com')
  console.log('Hospital Admin: admin@hkl.com')
  console.log('Hospital Staff: sarah@hkl.com')
  console.log('──────────────────────────────────────────────────')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })