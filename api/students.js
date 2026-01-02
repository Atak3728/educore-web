import { Clerk } from '@clerk/clerk-sdk-node'
import prisma from '../lib/prisma.js'

export default async function handler(req, res) {
    const clerk = Clerk({ secretKey: process.env.CLERK_SECRET_KEY })
    let userId; // Declare userId outside the try block for broader scope

    try {
        const authHeader = req.headers.authorization
        if (!authHeader) {
            return res.status(401).json({ error: 'No Authorization header' })
        }
        const token = authHeader.split(' ')[1]
        const { sub } = await clerk.verifyToken(token)
        userId = sub

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }
    } catch (error) {
        console.error('Authentication Error:', error)
        return res.status(401).json({ error: 'Authentication failed' })
    }

    try {
        if (req.method === 'GET') {
            const students = await prisma.student.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                include: { enrollments: true }
            })
            return res.status(200).json(students)
        }

        if (req.method === 'POST') {
            const { name, email, phone } = req.body
            if (!name) return res.status(400).json({ error: 'Name is required' })

            const newStudent = await prisma.student.create({
                data: {
                    userId,
                    name,
                    email,
                    phone,
                    status: 'Active'
                }
            })
            return res.status(201).json(newStudent)
        }

        return res.status(405).json({ error: 'Method not allowed' })

    } catch (error) {
        console.error('API Error:', error)
        return res.status(500).json({ error: 'Internal Server Error' })
    }
}
