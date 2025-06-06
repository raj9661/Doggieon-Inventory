import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  try {
    // Check for existing admin users
    const existingAdmins = await prisma.admin.findMany({
      where: { role: 'admin' }
    })
    
    console.log('Existing admin users:')
    console.log(existingAdmins)
    
    if (existingAdmins.length === 0) {
      console.log('No admin users found. Creating default admin...')
      
      // Create a new admin user
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash('admin123', salt)
      
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
      })
      console.log('\nYou can now log in with:')
      console.log('Username: admin')
      console.log('Password: admin123')
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main() 