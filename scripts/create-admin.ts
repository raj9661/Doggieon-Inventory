import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../lib/auth'

const prisma = new PrismaClient()

async function main() {
  try {
    // Create a new admin user
    const hashedPassword = await hashPassword('admin123') // This will be the password
    
    const newAdmin = await prisma.admin.create({
      data: {
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
      },
    })
    
    console.log('New admin user created successfully:')
    console.log({
      username: newAdmin.username,
      email: newAdmin.email,
      role: newAdmin.role,
      // Note: Password is hashed in the database
    })
    console.log('\nYou can now log in with:')
    console.log('Username: admin')
    console.log('Password: admin123')
    
  } catch (error) {
    console.error('Error creating admin:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main() 