import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../lib/auth'

const prisma = new PrismaClient()

async function main() {
  try {
    // Update admin password
    const hashedPassword = await hashPassword('admin123')
    
    const admin = await prisma.admin.update({
      where: { username: 'admin' },
      data: {
        password: hashedPassword,
      },
    })
    
    console.log('Database setup completed!')
    console.log('\nAdmin password updated:')
    console.log({
      username: admin.username,
      email: admin.email,
      role: admin.role,
    })
    console.log('\nYou can now log in with:')
    console.log('Username: admin')
    console.log('Password: admin123')
    
  } catch (error) {
    console.error('Error setting up database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main() 